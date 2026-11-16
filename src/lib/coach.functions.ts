import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { Profile } from './pisan';
import { coachSystemPrompt, trimHistory, westernDigits, COACH_DAILY_LIMIT, COACH_MAX_CHARS } from './coach';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export type CoachResult = { ok: true; reply: string; remaining: number } | { ok: false; reason: 'quota' | 'busy' | 'credits' | 'error' };

// Les conversations ne sont jamais enregistrées : seul le compteur quotidien est conservé.
export const askCoach = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    token: credential,
    context: z.object({ activity: z.enum(['diagnostic', 'exam', 'workshop', 'consolidation']), statement: z.string().max(2000), notion: z.string().max(200), step: z.string().max(200).optional(), dys: z.boolean() }),
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(COACH_MAX_CHARS * 2) })).min(1).max(40),
  }))
  .handler(async ({ data }): Promise<CoachResult> => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const session = await supabaseAdmin.from('learning_sessions').select('profile').eq('token_hash', hash).maybeSingle();
    if (session.error || !session.data) return { ok: false, reason: 'error' };
    const { data: remaining, error } = await supabaseAdmin.rpc('consume_pisan_coach', { p_hash: hash, p_limit: COACH_DAILY_LIMIT });
    if (error) return { ok: false, reason: 'error' };
    if ((remaining ?? -1) < 0) return { ok: false, reason: 'quota' };
    const profile = session.data.profile as unknown as Profile;
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false, reason: 'error' };
    const history = trimHistory(data.messages);
    const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra', stream: true, store: false,
        reasoning: { effort: 'low' },
        instructions: coachSystemPrompt(profile, data.context),
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
    const reply = westernDigits(text.trim());
    if (!reply) return { ok: false, reason: 'error' };
    return { ok: true, reply, remaining: remaining as number };
  });
