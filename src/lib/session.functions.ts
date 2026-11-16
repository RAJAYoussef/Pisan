import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { LearningSession } from './pisan';
import { isNotionId, type NotionId } from './curriculum';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
const PARTNER_CODE_FORMAT = /^[A-Za-z0-9-]{4,40}$/;
const profileSchema = z.object({ nickname: z.string().trim().min(1).max(40), country: z.string().max(10), grade: z.number().int().min(0).max(6), lang: z.enum(['fr', 'en', 'ar', 'es']), track: z.string().regex(/^[a-z0-9-]{1,20}$/).optional() });
async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export const openSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, profile: profileSchema.optional(), code: z.string().max(100).optional() }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const existing = await supabaseAdmin.from('learning_sessions').select('profile, progress, partner, usage_count, usage_date, dys_default, dys_updated_at').eq('token_hash', hash).maybeSingle();
    if (existing.error) throw new Error('La sauvegarde est indisponible. Réessayez plus tard.');
    if (!data.profile) return existing.data as LearningSession | null;
    let partner = existing.data?.partner ?? false;
    const code = data.code?.trim();
    // Only letters, digits and hyphens: this also rules out every pattern wildcard
    // (% and _ in SQL, * in the database API), so ilike can only match one exact code.
    if (!partner && code && PARTNER_CODE_FORMAT.test(code)) {
      const match = await supabaseAdmin.from('partner_codes').select('code').eq('active', true).ilike('code', code).maybeSingle();
      if (match.error) throw new Error('Impossible de vérifier votre accès partenaire.');
      partner = !!match.data;
    }
    const saved = await supabaseAdmin.from('learning_sessions').upsert({ token_hash: hash, profile: data.profile, partner: !!partner }).select('profile, progress, partner, usage_count, usage_date, dys_default, dys_updated_at').single();
    if (saved.error) throw new Error('Impossible de sauvegarder votre profil.');
    return saved.data as LearningSession;
  });

export const consumeExercise = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: allowed, error } = await supabaseAdmin.rpc('consume_pisan_exercise', { p_hash: hash });
    if (error) throw new Error('Impossible de vérifier votre accès.');
    return !!allowed;
  });

const notion = z.custom<NotionId>((value) => typeof value === 'string' && isNotionId(value), { message: 'Unknown notion' });
export const saveAttempt = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, attempt: z.object({ kind: z.enum(['diagnostic', 'workshop', 'exam', 'consolidation']), notion, correct: z.number().int().min(0).max(20), total: z.number().int().min(1).max(20), date: z.string().max(50), minutes: z.number().min(0).max(120) }) }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const current = await supabaseAdmin.from('learning_sessions').select('progress').eq('token_hash', hash).single();
    if (current.error) throw new Error('Session introuvable.');
    if (data.attempt.correct > data.attempt.total) throw new Error('Résultat invalide.');
    const { progress } = current.data as unknown as LearningSession;
    const unlocked = data.attempt.kind === 'consolidation' && data.attempt.correct === data.attempt.total ? Array.from(new Set([...progress.unlocked, data.attempt.notion])) : progress.unlocked;
    const next = { attempts: [...progress.attempts, data.attempt].slice(-500), unlocked };
    const saved = await supabaseAdmin.from('learning_sessions').update({ progress: next, last_active_at: new Date().toISOString() }).eq('token_hash', hash);
    if (saved.error) throw new Error('Le résultat n’a pas pu être sauvegardé.');
    return next;
  });