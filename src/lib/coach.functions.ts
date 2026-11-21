import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { signingSecrets } from './signing-secrets';
import type { Profile } from './pisan';
import { coachSystemPrompt, trimHistory, westernDigits, resolveCoachTarget, safeReply, COACH_DAILY_LIMIT, COACH_GLOBAL_DAILY_LIMIT, COACH_MAX_CHARS, COACH_STEPS, type CoachRef } from './coach';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
/** Délai maximum d'une réponse du coach (ms). */
export const COACH_TIMEOUT_MS = 25000;
async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export type CoachResult = { ok: true; reply: string; sig: string; remaining: number } | { ok: false; reason: 'quota' | 'busy' | 'credits' | 'error' | 'locked' | 'resting' };

// Signe les réponses de Pi : seul le serveur peut produire un message « assistant » accepté dans l'historique.
async function sign(hash: string, ref: CoachRef, content: string, secret = signingSecrets()[0]!) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(`pisan-coach:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${hash}\n${JSON.stringify(ref)}\n${content}`));
  return Array.from(new Uint8Array(mac), b => b.toString(16).padStart(2, '0')).join('');
}
const same = (a: string, b: string) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

// Les conversations ne sont jamais enregistrées : seul le compteur quotidien est conservé.
export const askCoach = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    token: credential,
    context: z.object({
      activity: z.enum(['workshop', 'consolidation', 'review']),
      ref: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('question'), notion: z.string().max(40), index: z.number().int().min(0).max(50) }),
        z.object({ kind: z.literal('exercise'), id: z.string().regex(/^[a-z0-9-]{1,30}$/) }),
      ]),
      step: z.number().int().min(0).max(3).optional(),
      dys: z.boolean(),
    }),
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(COACH_MAX_CHARS * 2), sig: z.string().regex(/^[a-f0-9]{64}$/).optional() })).min(1).max(40),
  }))
  .handler(async ({ data }): Promise<CoachResult> => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const ref = data.context.ref as CoachRef;
    const last = data.messages[data.messages.length - 1];
    if (last?.role !== 'user') return { ok: false, reason: 'error' };
    for (const m of data.messages) {
      if (m.role !== 'assistant') continue;
      let valid = false;
      for (const key of signingSecrets()) if (m.sig && same(m.sig, await sign(hash, ref, m.content, key))) valid = true;
      if (!valid) return { ok: false, reason: 'error' };
    }
    const session = await supabaseAdmin.from('learning_sessions').select('profile').eq('token_hash', hash).maybeSingle();
    if (session.error || !session.data) return { ok: false, reason: 'error' };
    const profile = session.data.profile as unknown as Profile;
    const target = resolveCoachTarget(ref, profile.lang);
    if (!target) return { ok: false, reason: 'error' };
    const { data: remaining, error } = await supabaseAdmin.rpc('consume_pisan_coach_gated', { p_hash: hash, p_limit: COACH_DAILY_LIMIT, p_global: COACH_GLOBAL_DAILY_LIMIT });
    if (error || remaining === null) return { ok: false, reason: 'error' };
    if (remaining === -3) return { ok: false, reason: 'locked' };
    if (remaining === -2) return { ok: false, reason: 'resting' };
    if (remaining < 0) return { ok: false, reason: 'quota' };
    const key = process.env['LOVABLE_API_KEY'];
    // Le crédit du jour est rendu si la réponse n'arrive pas (panne, délai dépassé, réponse vide).
    const refund = async <T,>(result: T): Promise<T> => { await supabaseAdmin.rpc('refund_pisan_coach', { p_hash: hash }); return result; };
    if (!key) return refund({ ok: false, reason: 'error' } as const);
    const history = trimHistory(data.messages);
    // Délai maximum : une passerelle bloquée ne doit pas laisser l'élève attendre indéfiniment.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), COACH_TIMEOUT_MS);
    let text = ''; let refused = false;
    try {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
        method: 'POST', signal: abort.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'X-Lovable-AIG-SDK': 'fetch' },
        body: JSON.stringify({
          model: 'openai/gpt-6-astra', stream: true, store: false,
          reasoning: { effort: 'low' },
          instructions: coachSystemPrompt(profile, { activity: data.context.activity, statement: target.statement, notion: target.notion, step: data.context.step === undefined ? undefined : COACH_STEPS[data.context.step], dys: data.context.dys }),
          input: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok || !res.body) {
        console.error('coach gateway', res.status, await res.text().catch(() => ''));
        return refund({ ok: false, reason: res.status === 429 ? 'busy' : res.status === 402 ? 'credits' : 'error' } as const);
      }
      // Consomme le flux côté serveur et ne renvoie que la réponse finale.
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let i;
        while ((i = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, i).trim(); buffer = buffer.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const ev = JSON.parse(payload) as { type?: string; delta?: string };
            if (ev.type === 'response.output_text.delta' && ev.delta) text += ev.delta;
            if (ev.type === 'response.refusal.delta') refused = true;
            if (ev.type === 'response.failed' || ev.type === 'error') return refund({ ok: false, reason: 'error' } as const);
          } catch { /* fragment incomplet */ }
        }
      }
    } catch {
      // délai dépassé ou flux coupé
      return refund({ ok: false, reason: 'busy' } as const);
    } finally { clearTimeout(timer); }
    if (refused && !text.trim()) return refund({ ok: false, reason: 'error' } as const);
    const raw = westernDigits(text.trim());
    if (!raw) return refund({ ok: false, reason: 'error' } as const);
    const reply = safeReply(raw, target.answers, profile.lang);
    return { ok: true, reply, sig: await sign(hash, ref, reply), remaining };
  });
