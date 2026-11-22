// Fonctions serveur de correction : le navigateur envoie ses réponses, le serveur corrige et enregistre.
// Voir src/lib/grading.ts (contrôle, diagnostic, consolidation) et src/lib/skill-session.ts (parcours).
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { isNotionId, type NotionId } from './curriculum';
import { consolidationOk, gradeExam, profileProgramme, replayDiagnostic } from './grading';
import { signingSecrets } from './signing-secrets';
import { advance, newTicket, startSeries, readTicket, signTicket, ticketAttempts, ticketSteps, type StepAnswer } from './skill-session';
import { getSkill } from './skills';
import { hashToken, recordAttempt } from './session.functions';
import type { LearningSession } from './pisan';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
const notion = z.custom<NotionId>(v => typeof v === 'string' && isNotionId(v), { message: 'Unknown notion' });
const choices = (max: number) => z.array(z.number().int().min(0).max(10)).min(1).max(max);
const skillId = z.string().max(40).refine(id => getSkill(id) !== null, 'Unknown skill');

/** On signe avec le premier secret, on accepte les jetons signés par n'importe lequel (src/lib/signing-secrets.ts). */
const secrets = () => signingSecrets();
const secret = () => secrets()[0]!;
async function loadSession(token: string) {
  const hash = await hashToken(token);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const row = await supabaseAdmin.from('learning_sessions').select('profile, progress').eq('token_hash', hash).single();
  if (row.error || !row.data) throw new Error('Session introuvable.');
  const session = row.data as unknown as Pick<LearningSession, 'profile' | 'progress'>;
  return { hash, admin: supabaseAdmin, session };
}

/** Contrôle blanc : le serveur corrige les choix avec les questions du chapitre. */
export const submitExam = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, notion, choices: choices(20) }).strict())
  .handler(async ({ data }) => {
    const graded = gradeExam(data.notion, data.choices);
    if (!graded) throw new Error('Réponses incomplètes.');
    const { hash, admin, session } = await loadSession(data.token);
    const saved = await recordAttempt(admin, hash, { kind: 'exam', notion: data.notion, ...graded, date: new Date().toISOString(), minutes: 5 }, session.profile.timezone);
    return { ...saved, ...graded };
  });

/** Diagnostic : le serveur rejoue le parcours adaptatif à partir des choix et en déduit la notion à travailler. */
export const submitDiagnostic = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, choices: choices(6) }).strict())
  .handler(async ({ data }) => {
    const { hash, admin, session } = await loadSession(data.token);
    const { level, notions } = profileProgramme(session.profile);
    const replay = replayDiagnostic(level, notions, data.choices);
    if (!replay) throw new Error('Réponses incomplètes.');
    const saved = await recordAttempt(admin, hash, { kind: 'diagnostic', notion: replay.target, correct: replay.correct, total: data.choices.length, date: new Date().toISOString(), minutes: 4 }, session.profile.timezone);
    return { ...saved, correct: replay.correct };
  });

/** Consolidation : la notion n'est débloquée que si le serveur trouve toutes les réponses justes. */
export const submitConsolidation = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, notion, choices: choices(3) }).strict())
  .handler(async ({ data }) => {
    const ok = consolidationOk(data.notion, data.choices);
    if (!ok) throw new Error('Réponses incorrectes.');
    const { hash, admin, session } = await loadSession(data.token);
    return recordAttempt(admin, hash, { kind: 'consolidation', notion: data.notion, correct: ok.total, total: ok.total, date: new Date().toISOString(), minutes: 2 }, session.profile.timezone);
  });

/** Début d'un parcours (une compétence) ou d'un mini-contrôle (plusieurs) : le serveur tire l'énoncé et signe un jeton. */
export const startSkillSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, kind: z.enum(['skill', 'review', 'series']), skills: z.array(skillId).min(1).max(4), level: z.union([z.literal(2), z.literal(3)]).optional() }).strict())
  .handler(async ({ data }) => {
    if (data.kind !== 'review' && data.skills.length !== 1) throw new Error('Une seule compétence.');
    const { hash } = await loadSession(data.token);
    // Série : le serveur tire lui-même les questions (et celles des autres compétences au niveau 3).
    const ticket = data.kind === 'series' ? startSeries(hash, data.skills[0]!, data.level ?? 2) : newTicket(hash, data.kind, data.skills);
    if (!ticket) throw new Error('Compétence inconnue.');
    return { seeds: ticket.seeds, skills: ticket.skills, ticket: await signTicket(ticket, secret()) };
  });

export const answer: z.ZodType<StepAnswer> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), choice: z.number().int().min(0).max(20) }).strict(),
  z.object({ type: z.literal('tap'), id: z.string().max(20) }).strict(),
  z.object({ type: z.literal('chips'), tokens: z.array(z.string().max(200)).max(40) }).strict(),
  z.object({ type: z.literal('number'), text: z.string().max(40) }).strict(),
  z.object({ type: z.literal('sentence'), blanks: z.array(z.number().int().min(0).max(10)).max(10) }).strict(),
  z.object({ type: z.literal('grid'), x: z.number().int().min(-50).max(50), y: z.number().int().min(-50).max(50) }).strict(),
  z.object({ type: z.literal('widget'), state: z.record(z.string().max(20), z.union([z.number(), z.boolean(), z.string().max(4), z.array(z.number()).max(20)])) }).strict(),
]) as z.ZodType<StepAnswer>;

/**
 * Une vérification : le serveur corrige l'étape et renvoie le jeton de la suite. L'état qui fait foi (étape atteinte,
 * erreurs) est gardé en base (public.skill_runs) : un ancien jeton rejoué est refusé, une erreur ne s'efface pas.
 */
export const checkSkillStep = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, ticket: z.string().max(4000), answer }).strict())
  .handler(async ({ data }) => {
    const hash = await hashToken(data.token);
    const t = await readTicket(data.ticket, secrets(), hash);
    const steps = t && ticketSteps(t);
    const next = t && steps && advance(t, steps, data.answer);
    if (!t || !steps || !next) throw new Error('Activité expirée : recommence-la.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const run = await supabaseAdmin.rpc('pisan_skill_check', { p_hash: hash, p_ref: t.ref, p_step: t.step, p_ok: next.ok, p_total: steps.length });
    const state = run.data as { stale: boolean; step?: number; missed?: number[] } | null;
    if (run.error || !state) throw new Error('Correction indisponible. Réessaie dans un instant.');
    if (state.stale) throw new Error('Activité expirée : recommence-la.');
    return { ok: next.ok, ticket: await signTicket({ ...next.ticket, step: state.step!, missed: state.missed! }, secret()) };
  });

/** Fin : le résultat est calculé à partir du jeton (étapes réussies, erreurs retenues), enregistré une seule fois. */
export const finishSkillSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, ticket: z.string().max(4000) }).strict())
  .handler(async ({ data }) => {
    const { hash, admin, session } = await loadSession(data.token);
    const signed = await readTicket(data.ticket, secrets(), hash);
    // Le résultat vient de l'état gardé en base, pas du jeton envoyé par le navigateur.
    const stored = signed && await admin.rpc('pisan_skill_result', { p_hash: hash, p_ref: signed.ref });
    const state = stored && !stored.error ? (stored.data as { step: number; missed: number[] } | null) : null;
    const t = signed && state ? { ...signed, step: state.step, missed: state.missed } : null;
    const steps = t && ticketSteps(t);
    const attempts = t && steps && ticketAttempts(t, steps);
    if (!attempts) throw new Error('Activité inachevée ou expirée.');
    if (session.progress.attempts.some(a => a.ref === attempts[0]!.ref)) return { progress: session.progress, streak: null, attempts };
    let saved: Awaited<ReturnType<typeof recordAttempt>> | null = null;
    for (const attempt of attempts) saved = await recordAttempt(admin, hash, attempt, session.profile.timezone);
    return { progress: saved!.progress, streak: saved!.streak, attempts };
  });
