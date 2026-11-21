// Tests de positionnement : l'enseignant lance la version A (début) ou B (fin) pour sa classe ; les élèves de la
// classe le passent sans aide ; le serveur corrige à partir des réponses brutes et enregistre une seule fois.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { answer } from './grading.functions';
import { buildItems, classKinds, gradePlacement, parallelItems, type PlacementDetail, type PlacementItem } from './placement';
import type { StepAnswer } from './skill-session';

const credential = z.string().regex(/^[a-f0-9]{64}$/);
const asItems = (v: unknown): PlacementItem[] => (Array.isArray(v) ? v : []).filter((x): x is PlacementItem => typeof x?.skill === 'string' && Number.isInteger(x?.seed));
async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }

// ───────────── Enseignant ─────────────

export type ClassTest = { id: string; form: 'A' | 'B'; is_open: boolean; created_at: string; closed_at: string | null; count: number };
export type ClassTestResult = { test_id: string; member_id: string; correct: number; total: number; details: PlacementDetail[]; submitted_at: string };

/** Les tests de la classe et leurs résultats (la propriété est vérifiée par le client de l'appelant avant toute lecture privilégiée). */
export const classTests = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ classId: z.string().uuid() }).strict()).handler(async ({ data, context }) => {
  const tests = await context.supabase.from('class_tests').select('id, form, is_open, created_at, closed_at, items').eq('class_id', data.classId).order('form');
  if (tests.error) throw new Error('Unavailable');
  if (!tests.data.length) return { tests: [] as ClassTest[], results: [] as ClassTestResult[] };
  const rows = await (await admin()).from('class_test_results').select('test_id, member_id, correct, total, details, submitted_at').in('test_id', tests.data.map(t => t.id));
  if (rows.error) throw new Error('Unavailable');
  return {
    tests: tests.data.map(t => ({ id: t.id, form: t.form === 'B' ? 'B' as const : 'A' as const, is_open: t.is_open, created_at: t.created_at, closed_at: t.closed_at, count: asItems(t.items).length })),
    results: rows.data.map(r => ({ ...r, details: (Array.isArray(r.details) ? r.details : []) as unknown as PlacementDetail[] })),
  };
});

/** Lancer la version A ou B. B reprend exactement les compétences de A (si A existe), avec d'autres nombres. */
export const createClassTest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ classId: z.string().uuid(), form: z.enum(['A', 'B']) }).strict()).handler(async ({ data, context }) => {
  const owned = await context.supabase.from('classes').select('id, country, grade, track').eq('id', data.classId).eq('teacher_id', context.userId).single();
  if (owned.error || !owned.data) throw new Error('Forbidden');
  const other = await context.supabase.from('class_tests').select('items').eq('class_id', data.classId).eq('form', data.form === 'A' ? 'B' : 'A').maybeSingle();
  const twin = other.data ? asItems(other.data.items) : [];
  const items = twin.length ? parallelItems(twin) : buildItems(classKinds(owned.data.country, owned.data.grade, owned.data.track));
  if (!items.length) throw new Error('No chapter');
  const created = await context.supabase.from('class_tests').insert({ class_id: data.classId, form: data.form, items: items as never }).select('id').single();
  if (created.error) throw new Error(created.error.code === '23505' ? 'Exists' : 'Unavailable');
  return created.data;
});

/** Ouvrir ou fermer un test (fermé : les élèves ne peuvent plus le passer). */
export const setClassTestOpen = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ classId: z.string().uuid(), testId: z.string().uuid(), open: z.boolean() }).strict()).handler(async ({ data, context }) => {
  const updated = await context.supabase.from('class_tests').update({ is_open: data.open, closed_at: data.open ? null : new Date().toISOString() }).eq('id', data.testId).eq('class_id', data.classId).select('id').single();
  if (updated.error || !updated.data) throw new Error('Forbidden');
  return { ok: true };
});

/** Supprimer un test lancé par erreur : seulement tant qu'aucun élève ne l'a rendu. */
export const deleteClassTest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ classId: z.string().uuid(), testId: z.string().uuid() }).strict()).handler(async ({ data, context }) => {
  const owned = await context.supabase.from('class_tests').select('id').eq('id', data.testId).eq('class_id', data.classId).single();
  if (owned.error || !owned.data) throw new Error('Forbidden');
  const done = await (await admin()).from('class_test_results').select('id', { count: 'exact', head: true }).eq('test_id', data.testId);
  if (done.error) throw new Error('Unavailable');
  if ((done.count ?? 0) > 0) throw new Error('Has results');
  const removed = await context.supabase.from('class_tests').delete().eq('id', data.testId).eq('class_id', data.classId).select('id').single();
  if (removed.error || !removed.data) throw new Error('Forbidden');
  return { ok: true };
});

// ───────────── Élève ─────────────

/** L'élève, ses classes, et un test ouvert de l'une d'elles qu'il n'a pas encore rendu. */
async function openTestFor(token: string, testId?: string) {
  const { sessionHash } = await import('./classroom.server');
  const db = await admin();
  const members = await db.from('class_members').select('id, class_id, classes(name)').eq('token_hash', await sessionHash(token));
  if (members.error) throw new Error('Unavailable');
  if (!members.data.length) return { db, tests: [] as { id: string; form: string; items: unknown; class_id: string }[], members: members.data };
  let q = db.from('class_tests').select('id, form, items, class_id').eq('is_open', true).in('class_id', members.data.map(m => m.class_id));
  if (testId) q = q.eq('id', testId);
  const tests = await q;
  if (tests.error) throw new Error('Unavailable');
  const done = await db.from('class_test_results').select('test_id').in('member_id', members.data.map(m => m.id));
  if (done.error) throw new Error('Unavailable');
  const finished = new Set(done.data.map(d => d.test_id));
  return { db, tests: tests.data.filter(t => !finished.has(t.id)), members: members.data };
}

/** Les tests à passer (sans les questions). */
export const studentTests = createServerFn({ method: 'POST' }).inputValidator(z.object({ token: credential }).strict()).handler(async ({ data }) => {
  const { tests, members } = await openTestFor(data.token);
  return tests.map(t => ({ id: t.id, form: t.form, count: asItems(t.items).length, class_name: members.find(m => m.class_id === t.class_id)?.classes.name ?? '' }));
});

/** Les questions (compétence + tirage) : l'appli les construit avec le même générateur que le serveur. */
export const startClassTest = createServerFn({ method: 'POST' }).inputValidator(z.object({ token: credential, testId: z.string().uuid() }).strict()).handler(async ({ data }) => {
  const { tests } = await openTestFor(data.token, data.testId);
  const test = tests[0];
  if (!test) throw new Error('Unavailable');
  return { items: asItems(test.items), startedAt: new Date().toISOString() };
});

/** Rendre le test : correction à partir des réponses brutes, enregistrement une seule fois. Le score n'est pas renvoyé à l'élève. */
export const submitClassTest = createServerFn({ method: 'POST' }).inputValidator(z.object({ token: credential, testId: z.string().uuid(), answers: z.array(answer.nullable()).max(80), startedAt: z.string().datetime().optional() }).strict()).handler(async ({ data }) => {
  const { db, tests, members } = await openTestFor(data.token, data.testId);
  const test = tests[0];
  if (!test) throw new Error('Closed or already done');
  const items = asItems(test.items);
  if (data.answers.length !== items.length) throw new Error('Incomplete');
  const graded = gradePlacement(items, data.answers as (StepAnswer | null)[]);
  const member = members.find(m => m.class_id === test.class_id)!;
  const started = data.startedAt && Date.parse(data.startedAt) <= Date.now() ? data.startedAt : null;
  const saved = await db.from('class_test_results').insert({ test_id: test.id, member_id: member.id, correct: graded.correct, total: graded.total, details: graded.details as never, started_at: started });
  if (saved.error && saved.error.code !== '23505') throw new Error('Unavailable');
  return { ok: true };
});
