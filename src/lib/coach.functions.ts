import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { Profile } from './pisan';
import { coachSystemPrompt, trimHistory, westernDigits, resolveCoachTarget, safeReply, COACH_DAILY_LIMIT, COACH_GLOBAL_DAILY_LIMIT, COACH_MAX_CHARS, COACH_STEPS, type CoachRef } from './coach';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export type CoachResult = { ok: true; reply: string; sig: string; remaining: number } | { ok: false; reason: 'quota' | 'busy' | 'credits' | 'error' | 'locked' | 'resting' };

// Signe les réponses de Pi : seul le serveur peut produire un message « assistant » accepté dans l'historique.
async function sign(hash: string, ref: CoachRef, content: string) {
  const secret = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!secret) throw new Error('missing secret');
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
      if (m.role === 'assistant' && (!m.sig || !same(m.sig, await sign(hash, ref, m.content)))) return { ok: false, reason: 'error' };
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
    if (!key) return { ok: false, reason: 'error' };
    const history = trimHistory(data.messages);
    const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
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
      return { ok: false, reason: res.status === 429 ? 'busy' : res.status === 402 ? 'credits' : 'error' };
    }
    // Consomme le flux côté serveur et ne renvoie que la réponse finale.
    const reader = res.body.getReader(); const decoder = new TextDecoder();
    let buffer = ''; let text = ''; let refused = false;
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
          if (ev.type === 'response.failed' || ev.type === 'error') return { ok: false, reason: 'error' };
        } catch { /* fragment incomplet */ }
      }
    }
    if (refused && !text.trim()) return { ok: false, reason: 'error' };
    const raw = westernDigits(text.trim());
    if (!raw) return { ok: false, reason: 'error' };
    const reply = safeReply(raw, target.answers, profile.lang);
    return { ok: true, reply, sig: await sign(hash, ref, reply), remaining };
  });
