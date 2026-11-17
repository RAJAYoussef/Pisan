// Fonctions serveur de correction : le navigateur envoie ses réponses, le serveur corrige et enregistre.
// Voir src/lib/grading.ts (contrôle, diagnostic, consolidation) et src/lib/skill-session.ts (parcours).
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { isNotionId, type NotionId } from './curriculum';
import { consolidationOk, gradeExam, profileProgramme, replayDiagnostic } from './grading';
import { advance, newTicket, readTicket, signTicket, ticketAttempts, ticketSteps, type StepAnswer } from './skill-session';
import { getSkill } from './skills';
import { hashToken, recordAttempt } from './session.functions';
import type { LearningSession } from './pisan';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
const notion = z.custom<NotionId>(v => typeof v === 'string' && isNotionId(v), { message: 'Unknown notion' });
const choices = (max: number) => z.array(z.number().int().min(0).max(10)).min(1).max(max);
const skillId = z.string().max(40).refine(id => getSkill(id) !== null, 'Unknown skill');

function secret(): string {
  const s = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!s) throw new Error('Correction indisponible.');
  return s;
}
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
  .inputValidator(z.object({ token: credential, kind: z.enum(['skill', 'review']), skills: z.array(skillId).min(1).max(4) }).strict())
  .handler(async ({ data }) => {
    if (data.kind === 'skill' && data.skills.length !== 1) throw new Error('Une seule compétence.');
    const { hash } = await loadSession(data.token);
    const ticket = newTicket(hash, data.kind, data.skills);
    return { seeds: ticket.seeds, ticket: await signTicket(ticket, secret()) };
  });

const answer: z.ZodType<StepAnswer> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), choice: z.number().int().min(0).max(20) }).strict(),
  z.object({ type: z.literal('tap'), id: z.string().max(20) }).strict(),
  z.object({ type: z.literal('chips'), tokens: z.array(z.string().max(200)).max(40) }).strict(),
  z.object({ type: z.literal('number'), text: z.string().max(40) }).strict(),
  z.object({ type: z.literal('sentence'), blanks: z.array(z.number().int().min(0).max(10)).max(10) }).strict(),
  z.object({ type: z.literal('grid'), x: z.number().int().min(-50).max(50), y: z.number().int().min(-50).max(50) }).strict(),
  z.object({ type: z.literal('widget'), state: z.record(z.string().max(20), z.union([z.number(), z.boolean(), z.string().max(4), z.array(z.number()).max(20)])) }).strict(),
]) as z.ZodType<StepAnswer>;

/** Une vérification : le serveur corrige l'étape et renvoie le jeton de la suite. Aucun accès à la base. */
export const checkSkillStep = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, ticket: z.string().max(4000), answer }).strict())
  .handler(async ({ data }) => {
    const key = secret();
    const t = await readTicket(data.ticket, key, await hashToken(data.token));
    const steps = t && ticketSteps(t);
    const next = t && steps && advance(t, steps, data.answer);
    if (!next) throw new Error('Activité expirée : recommence-la.');
    return { ok: next.ok, ticket: await signTicket(next.ticket, key) };
  });

/** Fin : le résultat est calculé à partir du jeton (étapes réussies, erreurs retenues), enregistré une seule fois. */
export const finishSkillSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ token: credential, ticket: z.string().max(4000) }).strict())
  .handler(async ({ data }) => {
    const { hash, admin, session } = await loadSession(data.token);
    const t = await readTicket(data.ticket, secret(), hash);
    const steps = t && ticketSteps(t);
    const attempts = t && steps && ticketAttempts(t, steps);
    if (!attempts) throw new Error('Activité inachevée ou expirée.');
    if (session.progress.attempts.some(a => a.ref === attempts[0]!.ref)) return { progress: session.progress, streak: null, attempts };
    let saved: Awaited<ReturnType<typeof recordAttempt>> | null = null;
    for (const attempt of attempts) saved = await recordAttempt(admin, hash, attempt, session.profile.timezone);
    return { progress: saved!.progress, streak: saved!.streak, attempts };
  });
