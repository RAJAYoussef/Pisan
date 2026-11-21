import { describe, expect, it, vi } from 'vitest';

// Fonctions serveur « pour de vrai » (validateur zod appliqué), base simulée en mémoire.
const db = vi.hoisted(() => ({ members: [] as { id: string; class_id: string; token_hash: string; classes: { name: string } }[], tests: [] as { id: string; class_id: string; form: string; items: unknown; is_open: boolean }[], results: [] as Record<string, unknown>[] }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let validator: { parse: (v: unknown) => unknown } | null = null;
    const b = { middleware: () => b, inputValidator: (v: { parse: (x: unknown) => unknown }) => { validator = v; return b; }, handler: (fn: (i: { data: unknown }) => unknown) => async (input: { data: unknown }) => fn({ data: validator ? validator.parse(input.data) : input.data }) };
    return b;
  },
}));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@/integrations/supabase/client.server', () => {
  const table = (name: string) => {
    let rows: Record<string, unknown>[] = name === 'class_members' ? db.members : name === 'class_tests' ? db.tests : db.results;
    const q = {
      select: () => q,
      eq: (k: string, v: unknown) => { rows = rows.filter(r => r[k] === v); return q; },
      in: (k: string, v: unknown[]) => { rows = rows.filter(r => v.includes(r[k])); return q; },
      insert: async (row: Record<string, unknown>) => { if (db.results.some(r => r['test_id'] === row['test_id'] && r['member_id'] === row['member_id'])) return { error: { code: '23505' } }; db.results.push(row); return { error: null }; },
      then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: null }),
    };
    return q;
  };
  return { supabaseAdmin: { from: table } };
});

import { buildItems, classKinds, gradePlacement, parallelItems, placementCsv, placementRows, placementSteps, usageSince } from '@/lib/placement';
import * as fns from '@/lib/placement.functions';
import { sessionHash } from '@/lib/classroom.server';
import type { Step } from '@/lib/skills';
import type { StepAnswer } from '@/lib/skill-session';

function rightAnswer(step: Step): StepAnswer {
  switch (step.type) {
    case 'choice': return { type: 'choice', choice: step.answer };
    case 'tap': return { type: 'tap', id: step.answer };
    case 'chips': return { type: 'chips', tokens: step.ordered ? step.groups[0]! : step.groups.flatMap((g, i) => [...(i ? ['='] : []), ...g.flatMap((t, j) => (j ? ['+', t] : [t]))]) };
    case 'number': return { type: 'number', text: String(step.answer).replace('.', ',') };
    case 'sentence': return { type: 'sentence', blanks: step.parts.filter((p): p is { options: never[]; answer: number[] } => 'options' in p).map(b => b.answer[0]!) };
    case 'grid': return { type: 'grid', x: step.answer.x, y: step.answer.y };
    case 'widget': {
      const w = step.widget;
      switch (w.kind) {
        case 'squares': return { type: 'widget', state: { angle: 90, poured: true } };
        case 'thales': return { type: 'widget', state: { m: w.problem.am } };
        case 'inscribed': return { type: 'widget', state: { span: 70 } };
        case 'line': return { type: 'widget', state: { a: w.a, b: w.b } };
        case 'tangent': return { type: 'widget', state: { x: w.target } };
        case 'level': { const m = w.values.reduce((t, x) => t + x, 0) / w.values.length; return { type: 'widget', state: { values: w.values.map(() => m), hand: 0 } }; }
        case 'fraction-bars': { const s = Math.sign(w.left.n * w.right.d - w.right.n * w.left.d); return { type: 'widget', state: { left: w.left.n, right: w.right.n, relation: s > 0 ? '>' : s < 0 ? '<' : '=' } }; }
        case 'fraction-equivalence': return { type: 'widget', state: { shaded: w.source.n * w.factor } };
        case 'fraction-addition': return { type: 'widget', state: { shaded: w.left.n + w.right.n } };
        case 'fraction-numberline': return { type: 'widget', state: { position: w.target.n / w.target.d } };
      }
    }
  }
}

const call = <T,>(fn: unknown, data: unknown) => (fn as (i: { data: unknown }) => Promise<T>)({ data });

describe('Test de positionnement : contenu', () => {
  it('two questions per chapter of the class programme, and B mirrors A with other numbers', () => {
    const kinds = classKinds('fr', 3);
    const a = buildItems(kinds);
    expect(a.length).toBeGreaterThanOrEqual(kinds.length);
    expect(a.length).toBeLessThanOrEqual(kinds.length * 2);
    const b = parallelItems(a);
    expect(b.map(x => x.skill)).toEqual(a.map(x => x.skill));
    expect(b.every((x, i) => x.seed !== a[i]!.seed)).toBe(true);
    // la filière change les chapitres : sciences maths du Maroc (2ème Bac) inclut l'arithmétique dans ℤ
    expect(classKinds('ma', 5, 'sm')).toContain('congru');
    expect(classKinds('ma', 5, 'pc-svt')).not.toContain('congru');
  });
  it('grades raw answers: right answers count, “I don’t know” counts wrong', () => {
    const items = buildItems(classKinds('fr', 3));
    const steps = placementSteps(items);
    const right = steps.map(s => rightAnswer(s.step));
    expect(gradePlacement(items, right)).toMatchObject({ correct: steps.length, total: steps.length });
    const half = right.map((r, i) => (i % 2 ? null : r));
    expect(gradePlacement(items, half).correct).toBe(Math.ceil(steps.length / 2));
  });
});

describe('Test de positionnement : rendu par l’élève', () => {
  it('only a member of the class can take an open test, once', async () => {
    const token = 'c'.repeat(64);
    const items = buildItems(classKinds('fr', 2));
    db.members = [{ id: 'm1', class_id: 'c1', token_hash: await sessionHash(token), classes: { name: '4e A' } }];
    db.tests = [{ id: '11111111-1111-4111-8111-111111111111', class_id: 'c1', form: 'A', items, is_open: true }, { id: '22222222-2222-4222-8222-222222222222', class_id: 'other', form: 'A', items, is_open: true }];
    db.results = [];
    expect(await call<unknown[]>(fns.studentTests, { token })).toEqual([{ id: '11111111-1111-4111-8111-111111111111', form: 'A', count: items.length, class_name: '4e A' }]);
    // le test d'une autre classe est inaccessible
    await expect(call(fns.startClassTest, { token, testId: '22222222-2222-4222-8222-222222222222' })).rejects.toThrow();
    const started = await call<{ items: unknown[] }>(fns.startClassTest, { token, testId: '11111111-1111-4111-8111-111111111111' });
    expect(started.items).toEqual(items);
    const answers = placementSteps(items).map(s => rightAnswer(s.step));
    await expect(call(fns.submitClassTest, { token, testId: '11111111-1111-4111-8111-111111111111', answers: answers.slice(1) })).rejects.toThrow(); // incomplet
    await call(fns.submitClassTest, { token, testId: '11111111-1111-4111-8111-111111111111', answers });
    expect(db.results).toEqual([expect.objectContaining({ test_id: '11111111-1111-4111-8111-111111111111', member_id: 'm1', correct: answers.length, total: answers.length })]);
    // déjà rendu : le test disparaît et ne peut pas être rendu une deuxième fois
    expect(await call<unknown[]>(fns.studentTests, { token })).toEqual([]);
    await expect(call(fns.submitClassTest, { token, testId: '11111111-1111-4111-8111-111111111111', answers })).rejects.toThrow();
    // un test fermé n'est plus proposé
    db.results = []; db.tests[0]!.is_open = false;
    expect(await call<unknown[]>(fns.studentTests, { token })).toEqual([]);
  });
});

describe('Test de positionnement : bilan', () => {
  it('compares start and end, counts time on PiSan since test A, and exports safely', () => {
    const students = [
      { id: 'm1', profile: { nickname: '=HACK()' }, progress: { attempts: [{ date: '2026-12-01T10:00:00Z', minutes: 30 }, { date: '2026-11-01T10:00:00Z', minutes: 99 }] } },
      { id: 'm2', profile: { nickname: 'Sami' }, progress: { attempts: [] } },
    ];
    const results = [{ test_id: 'A', member_id: 'm1', correct: 10, total: 20 }, { test_id: 'B', member_id: 'm1', correct: 15, total: 20 }, { test_id: 'A', member_id: 'm2', correct: 18, total: 20 }];
    const rows = placementRows(students, results, { id: 'A', created_at: '2026-11-25T00:00:00Z' }, { id: 'B' });
    expect(rows).toEqual([
      { memberId: 'm1', nickname: '=HACK()', a: 50, b: 75, gain: 25, minutes: 30, activities: 1 },
      { memberId: 'm2', nickname: 'Sami', a: 90, b: null, gain: null, minutes: 0, activities: 0 },
    ]);
    expect(usageSince([{ date: '2026-12-01T10:00:00Z', minutes: 12.4 }], undefined)).toEqual({ minutes: 12, activities: 1 });
    const csv = placementCsv(rows, [{ label: 'Relatifs', a: 60, b: 55 }], { pupil: 'Élève', a: 'Début', b: 'Fin', gain: 'Progression', minutes: 'Minutes', activities: 'Activités', chapter: 'Chapitre' });
    expect(csv).toContain(`"'=HACK()",50,75,25,30,1`);
    expect(csv).toContain('"Relatifs",60,55,-5');
  });
});
