import { beforeEach, describe, expect, it, vi } from 'vitest';

// Fonctions serveur « pour de vrai » : le validateur zod est appliqué, la base est simulée.
const db = vi.hoisted(() => ({ row: null as unknown as { profile: Record<string, unknown>; progress: { attempts: Record<string, unknown>[]; unlocked: string[] } }, recorded: [] as Record<string, unknown>[] }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let validator: { parse: (v: unknown) => unknown } | null = null;
    const b = { middleware: () => b, inputValidator: (v: { parse: (x: unknown) => unknown }) => { validator = v; return b; }, handler: (fn: (i: { data: unknown }) => unknown) => async (input: { data: unknown }) => fn({ data: validator ? validator.parse(input.data) : input.data }) };
    return b;
  },
}));
vi.mock('@/integrations/supabase/client.server', () => {
  const chain: Record<string, unknown> = {};
  Object.assign(chain, { select: () => chain, eq: () => chain, single: async () => ({ data: db.row, error: null }), maybeSingle: async () => ({ data: db.row, error: null }) });
  return { supabaseAdmin: { from: () => chain, rpc: async (name: string, a: { p_attempt: Record<string, unknown> }) => {
    if (name !== 'append_pisan_attempt') return { data: null, error: null };
    db.recorded.push(a.p_attempt);
    db.row.progress = { ...db.row.progress, attempts: [...db.row.progress.attempts, a.p_attempt] };
    return { data: { progress: db.row.progress, streak: { count: 1, last_day: '2026-11-17', freezes: 0, used_freeze: false, restarted: false } }, error: null };
  } } };
});

import { consolidationOk, gradeExam, profileProgramme, replayDiagnostic } from '@/lib/grading';
import { advance, gradeStep, newTicket, readTicket, signTicket, ticketAttempts, ticketSteps, type StepAnswer } from '@/lib/skill-session';
import { getSkill, SKILLS, type Step } from '@/lib/skills';
import { getNotion } from '@/lib/curriculum';
import { diagnosticPath, nextIndex, pickQuestion, startIndex, type DiagAnswer } from '@/lib/diagnostic';
import * as fns from '@/lib/grading.functions';
import { saveAttempt } from '@/lib/session.functions';

const TOKEN = 'c'.repeat(64);
const call = <T,>(fn: unknown, data: unknown) => (fn as (i: { data: unknown }) => Promise<T>)({ data });
beforeEach(() => {
  process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-key';
  db.recorded = [];
  db.row = { profile: { nickname: 'A', country: 'ma', grade: 2, lang: 'fr' }, progress: { attempts: [], unlocked: [] } };
});

/** La réponse juste d'une étape, telle que l'appli l'enverrait. */
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
/** Une réponse fausse du même type. */
function wrongAnswer(step: Step): StepAnswer {
  const r = rightAnswer(step);
  switch (r.type) {
    case 'choice': return { ...r, choice: r.choice + 1 };
    case 'tap': return { ...r, id: `${r.id}x` };
    case 'chips': return { ...r, tokens: [...r.tokens].reverse().concat('=') };
    case 'number': return { ...r, text: '123456' };
    case 'sentence': return { ...r, blanks: r.blanks.map(b => b + 1) };
    case 'grid': return { ...r, x: r.x + 1 };
    case 'widget': return { type: 'widget', state: {} };
  }
}

describe('Le serveur corrige chaque étape de chaque parcours', () => {
  it('accepts the right answer and refuses a wrong one, for every skill and many draws', () => {
    for (const skill of SKILLS) for (let seed = 0; seed < 25; seed++) for (const step of skill.build(seed).steps) {
      expect(gradeStep(step, rightAnswer(step)), `${skill.id} #${seed} ${step.type}`).toBe(true);
      expect(gradeStep(step, wrongAnswer(step)), `${skill.id} #${seed} ${step.type} (faux)`).toBe(false);
    }
  });
  it('refuses an answer of another type, and chips that are not on offer', () => {
    const step = getSkill('pyth-compute')!.build(1).steps[1]!;
    expect(gradeStep(step, { type: 'number', text: '1' })).toBe(false);
    if (step.type !== 'chips') throw new Error();
    expect(gradeStep(step, { type: 'chips', tokens: ['X²', '=', 'Y²'] })).toBe(false);
  });
});

describe('Jeton signé', () => {
  const HASH = 'd'.repeat(64);
  it('is refused if altered, used by another learner, or expired', async () => {
    const t = newTicket(HASH, 'skill', ['vec-sum']);
    const signed = await signTicket(t, 'k');
    expect(await readTicket(signed, 'k', HASH)).toEqual(t);
    const [body, mac] = signed.split('.');
    const forged = btoa(JSON.stringify({ ...t, missed: [], step: 99 })).replace(/=+$/, '');
    expect(await readTicket(`${forged}.${mac}`, 'k', HASH)).toBeNull();
    expect(await readTicket(`${body}.${mac!.slice(0, -2)}AA`, 'k', HASH)).toBeNull();
    expect(await readTicket(signed, 'other-key', HASH)).toBeNull();
    expect(await readTicket(signed, 'k', 'e'.repeat(64))).toBeNull();
    expect(await readTicket(signed, 'k', HASH, t.exp + 1)).toBeNull();
  });
  it('keeps every first-try error: a step answered wrong then right still counts as missed', () => {
    let t = newTicket(HASH, 'skill', ['pyth-discover']);
    const steps = ticketSteps(t)!;
    expect(ticketAttempts(t, steps)).toBeNull(); // rien à enregistrer avant la fin
    t = advance(t, steps, wrongAnswer(steps[0]!))!.ticket;
    t = advance(t, steps, wrongAnswer(steps[0]!))!.ticket;
    expect(t).toMatchObject({ step: 0, missed: [0] });
    for (const step of steps) t = advance(t, steps, rightAnswer(step))!.ticket;
    expect(advance(t, steps, rightAnswer(steps[0]!))).toBeNull(); // plus rien à vérifier
    expect(ticketAttempts(t, steps)).toEqual([expect.objectContaining({ skill: 'pyth-discover', correct: 2, total: 3, ref: t.ref })]);
  });
  it('a quick check records each skill on its own, from the server draw', () => {
    let t = newTicket(HASH, 'review', ['stats-median', 'vec-sum']);
    const steps = ticketSteps(t)!;
    t = advance(t, steps, wrongAnswer(steps[0]!))!.ticket;
    for (const step of steps) t = advance(t, steps, rightAnswer(step))!.ticket;
    expect(ticketAttempts(t, steps)!.map(a => [a.skill, a.review, a.correct])).toEqual([['stats-median', true, 0], ['vec-sum', true, 1]]);
  });
});

describe('Contrôle, diagnostic, consolidation', () => {
  it('the mock test is graded from the choices only', () => {
    const qs = getNotion('algebra').questions;
    expect(gradeExam('algebra', qs.map(q => q.answer))).toEqual({ correct: qs.length, total: qs.length });
    expect(gradeExam('algebra', qs.map(q => q.answer + 1))).toEqual({ correct: 0, total: qs.length });
    expect(gradeExam('algebra', [0])).toBeNull();
  });
  it('the diagnostic is replayed exactly as the app asked it', () => {
    const { level, notions } = profileProgramme({ country: 'ma', grade: 2 });
    const path = diagnosticPath(level, notions);
    for (const pattern of [[1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1]]) {
      // Simulation de l'écran : il choisit la bonne réponse quand le motif vaut 1.
      let idx = startIndex(path, level); const asked: DiagAnswer[] = []; const choices: number[] = [];
      for (const good of pattern) {
        const q = pickQuestion(path, idx, asked)!;
        const choice = good ? q.question.answer : (q.question.answer + 1) % q.question.options.length;
        choices.push(choice); asked.push({ notion: q.notion.id, qIndex: q.qIndex, correct: Boolean(good) }); idx = nextIndex(path, q.idx, Boolean(good));
      }
      const replay = replayDiagnostic(level, notions, choices)!;
      expect(replay.answers).toEqual(asked);
      expect(replay.correct).toBe(pattern.filter(Boolean).length);
    }
  });
  it('consolidation unlocks only when every answer is right', () => {
    const qs = getNotion('fractions').questions.slice(0, 3);
    expect(consolidationOk('fractions', qs.map(q => q.answer))).toEqual({ total: qs.length });
    expect(consolidationOk('fractions', qs.map((q, i) => (i ? q.answer : q.answer + 1)))).toBeNull();
  });
});

describe('Fonctions serveur : plus de score déclaré par le navigateur', () => {
  it('a score can no longer be posted for a test, a diagnostic or a skill', async () => {
    const forged = (attempt: Record<string, unknown>) => call(saveAttempt, { token: TOKEN, attempt: { notion: 'algebra', date: '2026-11-17', minutes: 1, ...attempt } });
    await expect(forged({ kind: 'exam', correct: 20, total: 20 })).rejects.toThrow();
    await expect(forged({ kind: 'diagnostic', correct: 6, total: 6 })).rejects.toThrow();
    await expect(forged({ kind: 'workshop', correct: 20, total: 20 })).rejects.toThrow();
    await expect(forged({ kind: 'workshop', notion: 'vectors', correct: 4, total: 4, skill: 'vec-sum' })).rejects.toThrow();
    await expect(forged({ kind: 'workshop', correct: 1, total: 1 })).resolves.toBeTruthy(); // petite activité : 1 point au plus
    expect(db.recorded).toHaveLength(1);
  });
  it('the mock test is graded and recorded by the server', async () => {
    const qs = getNotion('algebra').questions;
    const r = await call<{ correct: number; total: number }>(fns.submitExam, { token: TOKEN, notion: 'algebra', choices: qs.map((q, i) => (i ? q.answer : q.answer + 1)) });
    expect(r).toMatchObject({ correct: qs.length - 1, total: qs.length });
    expect(db.recorded).toEqual([expect.objectContaining({ kind: 'exam', notion: 'algebra', correct: qs.length - 1, total: qs.length })]);
  });
  it('a whole skill goes through the server, is recorded once, and a forged ticket is refused', async () => {
    const start = await call<{ seeds: number[]; ticket: string }>(fns.startSkillSession, { token: TOKEN, kind: 'skill', skills: ['vec-sum'] });
    const steps = getSkill('vec-sum')!.build(start.seeds[0]!).steps;
    let ticket = start.ticket;
    const first = await call<{ ok: boolean; ticket: string }>(fns.checkSkillStep, { token: TOKEN, ticket, answer: wrongAnswer(steps[0]!) });
    expect(first.ok).toBe(false);
    ticket = first.ticket;
    await expect(call(fns.finishSkillSession, { token: TOKEN, ticket })).rejects.toThrow(); // pas fini
    for (const step of steps) ticket = (await call<{ ok: boolean; ticket: string }>(fns.checkSkillStep, { token: TOKEN, ticket, answer: rightAnswer(step) })).ticket;
    await call(fns.finishSkillSession, { token: TOKEN, ticket });
    await call(fns.finishSkillSession, { token: TOKEN, ticket }); // rejoué : pas de second enregistrement
    expect(db.recorded).toEqual([expect.objectContaining({ kind: 'workshop', skill: 'vec-sum', correct: steps.length - 1, total: steps.length })]);
    // Un autre élève ne peut pas utiliser ce jeton.
    await expect(call(fns.checkSkillStep, { token: 'f'.repeat(64), ticket, answer: rightAnswer(steps[0]!) })).rejects.toThrow();
  });
});
