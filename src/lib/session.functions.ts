import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { LearningSession } from './pisan';
import { isNotionId, type NotionId } from './curriculum';
import { isTimeZone, localDay } from './plan';
import { checkChallenge, challengeNotions, dailyChallenge } from './challenge';
import type { Attempt, StreakResult } from './pisan';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
const PARTNER_CODE_FORMAT = /^[A-Za-z0-9-]{4,40}$/;
const profileSchema = z.object({ nickname: z.string().trim().min(1).max(40), country: z.string().max(10), grade: z.number().int().min(0).max(6), lang: z.enum(['fr', 'en', 'ar', 'es']), track: z.string().regex(/^[a-z0-9-]{1,20}$/).optional(), timezone: z.string().max(64).refine(isTimeZone, 'Unknown time zone').optional() });
const FIELDS = 'profile, progress, partner, usage_count, usage_date, dys_default, dys_updated_at, streak_count, streak_last_day, freezes, challenge_day, challenge_correct';
async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export const openSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, profile: profileSchema.optional(), code: z.string().max(100).optional() }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const existing = await supabaseAdmin.from('learning_sessions').select(FIELDS).eq('token_hash', hash).maybeSingle();
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
    const saved = await supabaseAdmin.from('learning_sessions').upsert({ token_hash: hash, profile: data.profile, partner: !!partner }).select(FIELDS).single();
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
const zone = z.string().max(64).optional();

type Admin = (typeof import('@/integrations/supabase/client.server'))['supabaseAdmin'];
/** Ajoute la tentative puis met à jour la flamme sur le jour local de l'élève (calculé ici, côté serveur). */
async function recordAttempt(admin: Admin, hash: string, attempt: Attempt, timezone: string | undefined) {
  const current = await admin.from('learning_sessions').select('progress, profile').eq('token_hash', hash).single();
  if (current.error) throw new Error('Session introuvable.');
  const { progress, profile } = current.data as unknown as LearningSession;
  const tz = isTimeZone(timezone) ? timezone : profile.timezone;
  const unlocked = attempt.kind === 'consolidation' && attempt.correct === attempt.total ? Array.from(new Set([...progress.unlocked, attempt.notion])) : progress.unlocked;
  const next = { attempts: [...progress.attempts, attempt].slice(-500), unlocked };
  const update: Record<string, unknown> = { progress: next, last_active_at: new Date().toISOString() };
  if (tz && tz !== profile.timezone) update['profile'] = { ...profile, timezone: tz };
  const saved = await admin.from('learning_sessions').update(update as never).eq('token_hash', hash);
  if (saved.error) throw new Error('Le résultat n’a pas pu être sauvegardé.');
  const streak = await admin.rpc('record_pisan_streak', { p_hash: hash, p_day: localDay(new Date(), tz) });
  if (streak.error) throw new Error('La flamme n’a pas pu être mise à jour.');
  return { progress: next, streak: streak.data as unknown as StreakResult };
}

export const saveAttempt = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, timezone: zone, attempt: z.object({ kind: z.enum(['diagnostic', 'workshop', 'exam', 'consolidation']), notion, correct: z.number().int().min(0).max(20), total: z.number().int().min(1).max(20), date: z.string().max(50), minutes: z.number().min(0).max(120) }) }))
  .handler(async ({ data }) => {
    if (data.attempt.correct > data.attempt.total) throw new Error('Résultat invalide.');
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    return recordAttempt(supabaseAdmin, hash, data.attempt, data.timezone);
  });

/** Défi du jour : le serveur choisit la question et corrige ; une seule tentative par jour local. */
export const answerChallenge = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, timezone: zone, choice: z.number().int().min(0).max(10).optional(), text: z.string().max(60).optional() }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const current = await supabaseAdmin.from('learning_sessions').select('profile').eq('token_hash', hash).single();
    if (current.error) throw new Error('Session introuvable.');
    const profile = (current.data as unknown as LearningSession).profile;
    const tz = isTimeZone(data.timezone) ? data.timezone : profile.timezone;
    const day = localDay(new Date(), tz);
    const challenge = dailyChallenge(day, challengeNotions(profile.country, profile.grade, profile.track));
    if (!challenge) throw new Error('Pas de défi aujourd’hui.');
    const correct = checkChallenge(challenge.question, { choice: data.choice, text: data.text });
    const claimed = await supabaseAdmin.rpc('claim_pisan_challenge', { p_hash: hash, p_day: day, p_correct: correct });
    if (claimed.error) throw new Error('Le défi n’a pas pu être enregistré.');
    if (!claimed.data) return { status: 'already' as const };
    const saved = await recordAttempt(supabaseAdmin, hash, { kind: 'challenge', notion: challenge.notion, correct: correct ? 1 : 0, total: 1, date: new Date().toISOString(), minutes: 1 }, tz);
    return { status: 'done' as const, correct, answer: challenge.question.options[challenge.question.answer] ?? '', day, ...saved };
  });

/** Le défi du jour de l'élève (sans la bonne réponse), sur son jour local. */
export const todayChallenge = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, timezone: zone }))
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const current = await supabaseAdmin.from('learning_sessions').select('profile, challenge_day, challenge_correct').eq('token_hash', hash).single();
    if (current.error) throw new Error('Session introuvable.');
    const row = current.data as unknown as LearningSession;
    const tz = isTimeZone(data.timezone) ? data.timezone : row.profile.timezone;
    const day = localDay(new Date(), tz);
    const challenge = dailyChallenge(day, challengeNotions(row.profile.country, row.profile.grade, row.profile.track));
    if (!challenge) return null;
    return { day, notion: challenge.notion, index: challenge.index, done: row.challenge_day === day, correct: row.challenge_day === day ? row.challenge_correct ?? null : null };
  });
