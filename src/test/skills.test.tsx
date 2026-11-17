import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { localEngine } from '@/lib/skill-session';
import type { Attempt } from '@/lib/pisan';
import { VEC_RE, anglesOf, chipsOk, dueReviews, getSkill, numberOk, reviewStep, SKILLS, skillsFor, skillState, skillStatus, sentenceOk, type Activity, type Blank, type Step } from '@/lib/skills';
import { chapterSkillKinds, FIGURE_KINDS } from '@/lib/figures';
import { programmeFor } from '@/lib/programmes';
import { ReviewActivity, Rich, SkillActivity } from '@/components/pisan/skills';
import { spoken, vec } from '@/lib/skills';
import { ClassSkills, classSkillKinds } from '@/components/pisan/teacher-skills';
import { blockingSkills } from '@/lib/classroom';
import type { L } from '@/lib/curriculum';

const LANGS = ['fr', 'en', 'ar', 'es'] as const;
/** Le moteur du serveur, exécuté sur place avec une clé de test ; le tirage vaut toujours 5. */
const testEngine = (onRecord?: (a: Attempt[]) => void) => localEngine({ secret: 'test-secret', hash: 'a'.repeat(64), rand: () => 5 / 100000, ...(onRecord ? { onRecord } : {}) });
const ready = () => waitFor(() => expect(screen.queryByText('PiSan…')).toBeNull());
/** Nom accessible d'un texte : les vecteurs ⟦AB⟧ se lisent « vecteur AB ». */
const named = (text: string) => text.replace(VEC_RE, 'vecteur $1');
const filled = (l: L) => LANGS.every(k => l[k].trim().length > 0);
/** La réponse qu'un élève taperait : arrondie comme demandé par l'énoncé. */
const typed = (step: Extract<Step, { type: 'number' }>) => {
  const digits = step.tolerance >= 0.05 ? 1 : step.tolerance >= 0.005 ? 2 : step.tolerance >= 0.0005 ? 3 : 6;
  return String(Math.round(step.answer * 10 ** digits) / 10 ** digits).replace('.', ',');
};
const chipsSolution = (step: Extract<Step, { type: 'chips' }>) => step.ordered ? step.groups[0]! : step.groups.flatMap((g, i) => [...(i ? ['='] : []), ...g.flatMap((tok, j) => j ? ['+', tok] : [tok])]);

describe('Parcours de compétences : contenu', () => {
  it('covers the sixteen chapters with the agreed skills', () => {
    expect(FIGURE_KINDS.map(k => skillsFor(k).length)).toEqual([5, 5, 4, 3, 5, 4, 4, 4, 4, 4, 11, 5, 4, 4, 4, 4]);
    expect(new Set(SKILLS.map(s => s.id)).size).toBe(SKILLS.length);
    for (const s of SKILLS) { expect(s.id).toMatch(/^[a-z]+(-[a-z]+){1,2}$/); expect(filled(s.title) && filled(s.desc)).toBe(true); }
  });

  it('every generated activity is translated, drawable and solvable with its own answers', () => {
    for (const skill of SKILLS) for (let seed = 0; seed < 60; seed++) {
      const a = skill.build(seed);
      expect(a.steps.length).toBeGreaterThan(1);
      expect(a.steps.length).toBeLessThanOrEqual(20);
      expect(filled(a.title)).toBe(true);
      for (const step of a.steps) {
        expect(filled(step.prompt) && filled(step.hint), `${skill.id} #${seed}`).toBe(true);
        const scene = 'scene' in step ? step.scene : undefined;
        if (scene) {
          for (const p of Object.values(scene.points)) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
          for (const seg of scene.segments) expect(scene.points[seg.a] && scene.points[seg.b], `${skill.id} ${seg.id}`).toBeTruthy();
        }
        switch (step.type) {
          case 'choice': expect(step.options[step.answer]).toBeTruthy(); step.options.forEach(o => expect(filled(o)).toBe(true)); break;
          case 'tap': expect([...step.scene.segments.filter(s => s.tappable).map(s => s.id), ...(step.scene.arcs ?? []).filter(x => x.tappable).map(x => x.id)]).toContain(step.answer); break;
          case 'chips': expect(chipsOk(chipsSolution(step), step.groups, step.ordered), `${skill.id} #${seed}`).toBe(true); if (step.ordered) expect(chipsOk([...step.tokens], step.groups, true) && step.tokens.join() !== step.groups[0]!.join()).toBe(false); for (const tok of chipsSolution(step)) expect(step.tokens).toContain(tok); break;
          case 'number': expect(numberOk(typed(step), step.answer, step.tolerance), `${skill.id} #${seed} ${typed(step)}`).toBe(true); break;
          case 'sentence': {
            const blanks = step.parts.filter((p): p is Blank => 'options' in p);
            expect(sentenceOk(step.parts, blanks.map(b => b.answer[0]!))).toBe(true);
            expect(sentenceOk(step.parts, blanks.map(b => (b.answer[0]! + 1) % b.options.length))).toBe(false);
            break;
          }
          case 'grid': {
            const g = step.scene.grid;
            for (const p of [step.start, step.answer]) expect(p.x >= g.minX && p.x <= g.maxX && p.y >= g.minY && p.y <= g.maxY, `${skill.id} #${seed}`).toBe(true);
            expect(step.answer.x !== step.start.x || step.answer.y !== step.start.y).toBe(true);
            break;
          }
          case 'widget':
            if (step.widget.kind === 'line') {
              const { a, b, A, B } = step.widget;
              expect(Number.isInteger(a * 2) && Math.abs(a) <= 3 && Number.isInteger(b) && Math.abs(b) <= 5).toBe(true);
              expect(A.y).toBe(a * A.x + b); expect(B.y).toBe(a * B.x + b); expect(A.x).not.toBe(B.x);
            }
            if (step.widget.kind === 'level') expect(step.widget.values.reduce((t, v) => t + v, 0) % step.widget.values.length).toBe(0);
            break;
        }
      }
    }
  });

  it('is deterministic for a given seed', () => {
    for (const s of SKILLS) expect(JSON.stringify(s.build(42))).toBe(JSON.stringify(s.build(42)));
  });
});

describe('Fractions', () => {
  it('registers eleven deterministic, translated fraction skills with valid prerequisites', () => {
    const fractionSkills = skillsFor('fractions');
    expect(fractionSkills.map(s => s.id)).toEqual([
      'frac-meaning', 'frac-equivalent', 'frac-simplify', 'frac-visual-compare', 'frac-equivalence-visual', 'frac-add-visual', 'frac-numberline', 'frac-compare',
      'frac-add-subtract', 'frac-multiply-divide', 'frac-problem',
    ]);
    expect(new Set(fractionSkills.map(s => s.id)).size).toBe(11);
    for (const skill of fractionSkills) {
      expect(filled(skill.title) && filled(skill.desc)).toBe(true);
      expect(JSON.stringify(skill.build(42))).toBe(JSON.stringify(skill.build(42)));
      expect(skill.build(42).steps.length).toBeGreaterThan(1);
    }
  });

  it('keeps the fraction misconception catalogue and prerequisite references coherent', async () => {
    const { FRACTION_SKILL_META } = await import('@/lib/skills-fractions');
    const ids = new Set(Object.keys(FRACTION_SKILL_META));
    expect(ids.size).toBe(11);
    for (const meta of Object.values(FRACTION_SKILL_META)) {
      for (const prerequisite of meta.prerequisites) expect(ids.has(prerequisite)).toBe(true);
      expect(meta.microSkills.length).toBeGreaterThan(0);
      expect(meta.misconceptions.length).toBeGreaterThan(0);
    }
  });
});

describe('Pythagore', () => {
  it('the set-square triangles: “yes” means a right angle at that corner, “no” means no angle is nearly right', () => {
    for (let seed = 0; seed < 100; seed++) {
      const steps = getSkill('pyth-recognise')!.build(seed).steps.filter((s): s is Extract<Step, { type: 'choice' }> => s.type === 'choice');
      expect(steps.map(s => s.answer === 3)).toContain(true);
      for (const s of steps) {
        const names = s.scene!.polygon!;
        const angles = anglesOf(s.scene!.points, names);
        if (s.answer === 3) expect(angles.every(a => Math.abs(a - 90) >= 8)).toBe(true);
        else expect(Math.abs(angles[s.answer]! - 90)).toBeLessThan(1e-6);
      }
    }
  });
  it('the converse: the first triangle is right-angled, the trap triangle only looks like it', () => {
    for (let seed = 0; seed < 100; seed++) {
      const nums = getSkill('pyth-converse')!.build(seed).steps.filter((s): s is Extract<Step, { type: 'number' }> => s.type === 'number').map(s => s.answer);
      expect(nums[0]).toBeCloseTo(nums[1]!, 6); // plus grand côté² = somme des deux autres
      expect(Math.abs(nums[2]! - nums[3]!)).toBeGreaterThan(0.1); // presque égal : l'équerre ne suffit pas
    }
  });
  it('the converse sentence demands the right theorem, the right verdict and the right corner', () => {
    const sentence = getSkill('pyth-converse')!.build(3).steps.find(s => s.type === 'sentence')!;
    if (sentence.type !== 'sentence') throw new Error();
    expect(sentenceOk(sentence.parts, [0, 0, 0])).toBe(true);
    expect(sentenceOk(sentence.parts, [1, 0, 0])).toBe(false); // le théorème direct ne prouve pas qu'il est rectangle
    expect(sentenceOk(sentence.parts, [0, 0, 1])).toBe(false);
  });
});

describe('Vérifications', () => {
  it('an equality is checked whatever the order of members and terms', () => {
    const groups = [['BC²'], ['AB²', 'AC²']];
    expect(chipsOk(['BC²', '=', 'AB²', '+', 'AC²'], groups)).toBe(true);
    expect(chipsOk(['AC²', '+', 'AB²', '=', 'BC²'], groups)).toBe(true);
    expect(chipsOk(['AB²', '=', 'BC²', '+', 'AC²'], groups)).toBe(false);
    expect(chipsOk(['BC²', '=', 'AB²', 'AC²'], groups)).toBe(false);
    expect(chipsOk(['BC²', '=', 'AB²', '+', 'AC²', '='], groups)).toBe(false);
  });
  it('numbers accept a comma, a point or a fraction, within the tolerance', () => {
    expect(numberOk('5,8', 5.83, 0.06)).toBe(true);
    expect(numberOk('5.8', 5.83, 0.06)).toBe(true);
    expect(numberOk('5,9', 5.83, 0.06)).toBe(false);
    expect(numberOk('3/4', 0.75, 0.006)).toBe(true);
    expect(numberOk('37°', 36.87, 1)).toBe(true);
    expect(numberOk('x', 1, 1)).toBe(false);
  });
  it('a skill is mastered once all its steps were right at the first try', () => {
    const at = (skill: string | undefined, correct: number, total: number, date = '2026-11-01T10:00:00Z', review?: boolean) => ({ skill, correct, total, date, review });
    expect(skillStatus([], 'pyth-compute')).toBe('todo');
    expect(skillStatus([at('pyth-compute', 4, 6)], 'pyth-compute')).toBe('started');
    expect(skillStatus([at('pyth-compute', 4, 6), at('pyth-compute', 6, 6)], 'pyth-compute')).toBe('mastered');
    expect(skillStatus([at(undefined, 1, 1)], 'pyth-compute')).toBe('todo');
  });
});

describe('Mini-contrôles', () => {
  const day = (d: number) => new Date(Date.UTC(2026, 10, d, 10)).toISOString();
  const now = (d: number) => Date.UTC(2026, 10, d, 12);
  const full = (d: number, ok = true) => ({ skill: 'pyth-compute', correct: ok ? 6 : 4, total: 6, date: day(d) });
  const quick = (d: number, ok: boolean) => ({ skill: 'pyth-compute', correct: ok ? 1 : 0, total: 1, date: day(d), review: true });
  it('a mastered skill comes back 3 days later, then 6, 12… after each success', () => {
    expect(skillState([full(1)], 'pyth-compute', now(3)).due).toBe(false);
    expect(skillState([full(1)], 'pyth-compute', now(4)).due).toBe(true);
    expect(skillState([full(1), quick(4, true)], 'pyth-compute', now(9)).due).toBe(false);
    expect(skillState([full(1), quick(4, true)], 'pyth-compute', now(10)).due).toBe(true);
    expect(skillState([full(1), quick(4, true), quick(10, true)], 'pyth-compute', now(21)).due).toBe(false);
    expect(skillState([full(1), quick(4, true), quick(10, true)], 'pyth-compute', now(22)).due).toBe(true);
  });
  it('a failed quick check makes the skill « à revoir » until a full pathway is perfect again', () => {
    expect(skillStatus([full(1), quick(4, false)], 'pyth-compute')).toBe('review');
    expect(skillState([full(1), quick(4, false)], 'pyth-compute', now(30)).due).toBe(false);
    expect(skillStatus([full(1), quick(4, false), full(5, false)], 'pyth-compute')).toBe('review');
    expect(skillStatus([full(1), quick(4, false), full(5)], 'pyth-compute')).toBe('mastered');
    expect(skillStatus([quick(4, true)], 'pyth-compute')).toBe('started');
  });
  it('lists the oldest mastered skills first, at most four', () => {
    const attempts = ['vec-sum', 'stats-mean', 'pyth-compute', 'trigo-angle', 'affine-image'].map((skill, i) => ({ skill, correct: 3, total: 3, date: day(1 + i) }));
    expect(dueReviews(attempts, now(20)).map(s => s.id)).toEqual(['vec-sum', 'stats-mean', 'pyth-compute', 'trigo-angle']);
    expect(dueReviews(attempts, now(2))).toEqual([]);
  });
  it('every review step stands on its own and can be answered', () => {
    for (const skill of SKILLS) for (let seed = 0; seed < 20; seed++) {
      const step = reviewStep(skill, seed);
      expect(step.type, skill.id).not.toBe('widget');
      expect(step.prompt.fr.length, skill.id).toBeGreaterThan(8);
    }
  });
});

describe('Chapitres du programme', () => {
  it('Maroc 3AC : Pythagore, Thalès, trigonométrie et angles inscrits chacun dans son chapitre', () => {
    const kinds = programmeFor('ma', 2)!.chapters.flatMap(chapterSkillKinds);
    expect(new Set(kinds)).toEqual(new Set(['thales', 'trigo', 'inscribed', 'vectors', 'affine', 'stats']));
  });
  it('Côte d’Ivoire 3e : le chapitre « Triangle rectangle » donne Pythagore et la trigonométrie', () => {
    const chapter = programmeFor('ci', 3)!.chapters.find(c => c.title.fr.includes('Triangle rectangle'))!;
    expect(chapterSkillKinds(chapter)).toEqual(['pythagoras', 'trigo']);
  });
});

// ───────────── À l'écran : chaque compétence se termine en suivant ses propres réponses ─────────────

async function solveOnScreen(activity: Activity) {
  for (const [i, step] of activity.steps.entries()) {
    switch (step.type) {
      case 'choice': fireEvent.click(screen.getByRole('button', { name: named(step.options[step.answer]!.fr) })); break;
      case 'tap': {
        const arc = step.scene.arcs?.find(a => a.id === step.answer);
        fireEvent.keyDown(screen.getByRole('button', { name: arc ? `Arc ${arc.text}` : `[${step.answer}]` }), { key: 'Enter' });
        break;
      }
      case 'chips':
        for (const tok of chipsSolution(step)) fireEvent.click(screen.getAllByRole('button', { name: named(tok) }).find(b => !(b as HTMLButtonElement).disabled)!);
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
      case 'number':
        fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: typed(step) } });
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
      case 'sentence':
        step.parts.filter((p): p is Blank => 'options' in p).forEach((b, k) => fireEvent.change(screen.getByLabelText(`Trou ${k + 1}`), { target: { value: String(b.answer[0]) } }));
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
      case 'grid': {
        const h = screen.getByRole('slider', { name: step.label });
        const dx = step.answer.x - step.start.x, dy = step.answer.y - step.start.y;
        for (let k = 0; k < Math.abs(dx); k++) fireEvent.keyDown(h, { key: dx > 0 ? 'ArrowRight' : 'ArrowLeft' });
        for (let k = 0; k < Math.abs(dy); k++) fireEvent.keyDown(h, { key: dy > 0 ? 'ArrowUp' : 'ArrowDown' });
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
      }
      case 'widget':
        if (step.widget.kind === 'line') { fireEvent.change(screen.getByLabelText(/^a = /), { target: { value: String(step.widget.a) } }); fireEvent.change(screen.getByLabelText(/^b = /), { target: { value: String(step.widget.b) } }); }
        if (step.widget.kind === 'fraction-bars') {
          const { left, right } = step.widget;
          for (const [name, f] of [['Fraction A', left], ['Fraction B', right]] as const) { const bar = screen.getByRole('group', { name }); for (let k = 0; k < f.n; k++) fireEvent.click(within(bar).getAllByRole('button')[k]!); }
          const sign = Math.sign(left.n * right.d - right.n * left.d);
          fireEvent.click(screen.getByRole('button', { name: sign > 0 ? '>' : sign < 0 ? '<' : '=' }));
        }
        if (step.widget.kind === 'fraction-equivalence' || step.widget.kind === 'fraction-addition') {
          const w = step.widget;
          const count = w.kind === 'fraction-equivalence' ? w.source.n * w.factor : w.left.n + w.right.n;
          const parts = within(screen.getByRole('group', { name: 'Parts coloriées' })).getAllByRole('button');
          for (let k = 0; k < count; k++) fireEvent.click(parts[k]!);
        }
        if (step.widget.kind === 'fraction-numberline') fireEvent.change(screen.getByLabelText('Position choisie'), { target: { value: String(Math.round(step.widget.target.n / step.widget.target.d / 0.005) * 0.005) } });
        if (step.widget.kind === 'tangent') fireEvent.change(screen.getByLabelText(/^x = /), { target: { value: String(step.widget.target) } });
        if (step.widget.kind === 'level') {
          const v = step.widget.values, mean = v.reduce((t, x) => t + x, 0) / v.length;
          v.forEach((x, k) => { for (let n = 0; n < x - mean; n++) fireEvent.click(screen.getByRole('button', { name: `Prendre un cube de la colonne ${k + 1}` })); });
          v.forEach((x, k) => { for (let n = 0; n < mean - x; n++) fireEvent.click(screen.getByRole('button', { name: `Poser un cube sur la colonne ${k + 1}` })); });
        }
        if (step.widget.kind === 'squares') { fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '90' } }); fireEvent.click(screen.getByRole('button', { name: 'Verser les carreaux' })); }
        if (step.widget.kind === 'thales') { const m = screen.getByRole('slider', { name: 'M' }); for (let v = 1; v < step.widget.problem.am; v++) fireEvent.keyDown(m, { key: 'ArrowRight' }); }
        if (step.widget.kind === 'inscribed') { const m = screen.getByRole('slider', { name: 'M' }); for (let k = 0; k < 14; k++) fireEvent.keyDown(m, { key: 'ArrowRight' }); }
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
    }
    expect(await screen.findByText('C’est juste !'), `étape ${i + 1}`).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: i + 1 < activity.steps.length ? /Étape suivante/ : /Terminer/ }));
  }
}

describe('Parcours à l’écran', () => {
  for (const skill of SKILLS) it(`${skill.id} can be completed and saves the skill`, async () => {
    const recorded: Attempt[] = [];
    render(<SkillActivity lang="fr" skill={skill} engine={testEngine(a => recorded.push(...a))} onBack={() => {}} />);
    await ready();
    const activity = skill.build(5);
    await solveOnScreen(activity);
    expect(await screen.findByText('Compétence acquise !')).toBeTruthy();
    expect(recorded).toEqual([expect.objectContaining({ kind: 'workshop', skill: skill.id, correct: activity.steps.length, total: activity.steps.length })]);
  });

  it('a wrong first try gives the hint, and the step no longer counts as mastered', async () => {
    const recorded: Attempt[] = [];
    const skill = getSkill('pyth-discover')!;
    render(<SkillActivity lang="fr" skill={skill} engine={testEngine(a => recorded.push(...a))} onBack={() => {}} />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Verser les carreaux' }));
    expect(screen.getByRole('status').textContent).toMatch(/déborde/); // 60° : trop de carreaux
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(await screen.findByText(/l’angle est trop petit/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '120' } });
    expect(screen.getByRole('status').textContent).toMatch(/Il manque/);
    fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '90' } });
    expect(screen.getByRole('status').textContent).toMatch(/rempli exactement/);
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Étape suivante/ }));
    await solveOnScreen({ ...skill.build(5), steps: skill.build(5).steps.slice(1) });
    expect(await screen.findByText(/2 étapes sur 3 du premier coup/)).toBeTruthy();
    expect(recorded).toEqual([expect.objectContaining({ correct: 2, total: 3 })]);
  });

  it('the set square can be put on a corner with the keyboard', async () => {
    const { container } = render(<SkillActivity lang="fr" skill={getSkill('pyth-recognise')!} engine={testEngine()} onBack={() => {}} />);
    await ready();
    const corner = screen.getAllByRole('button', { name: /Poser l’équerre en/ })[0]!;
    fireEvent.keyDown(corner, { key: 'Enter' });
    expect(corner.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.skill-equerre')).toBeTruthy();
    expect(within(container).getAllByRole('button', { name: /Oui, en|Non/ }).length).toBe(4);
  });
});

describe('Mini-contrôle à l’écran', () => {
  it('asks one step per skill and records each skill separately', async () => {
    const recorded: Attempt[] = [];
    const skills = [getSkill('stats-median')!, getSkill('vec-sum')!];
    render(<ReviewActivity lang="fr" skills={skills} engine={testEngine(a => recorded.push(...a))} onBack={() => {}} />);
    await ready();
    // 1re question ratée d'abord : l'indice s'affiche
    const first = reviewStep(skills[0]!, 5);
    if (first.type !== 'number') throw new Error(first.type);
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(await screen.findByText(first.hint.fr)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: typed(first) } });
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Question suivante/ }));
    const second = reviewStep(skills[1]!, 5);
    if (second.type !== 'grid') throw new Error(second.type);
    const h = screen.getByRole('slider', { name: 'D' });
    const dx = second.answer.x - second.start.x, dy = second.answer.y - second.start.y;
    for (let k = 0; k < Math.abs(dx); k++) fireEvent.keyDown(h, { key: dx > 0 ? 'ArrowRight' : 'ArrowLeft' });
    for (let k = 0; k < Math.abs(dy); k++) fireEvent.keyDown(h, { key: dy > 0 ? 'ArrowUp' : 'ArrowDown' });
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Terminer/ }));
    expect(await screen.findByText('Quelques compétences sont à revoir.')).toBeTruthy();
    expect(recorded).toEqual([
      expect.objectContaining({ skill: 'stats-median', review: true, correct: 0, total: 1, notion: 'statistics' }),
      expect.objectContaining({ skill: 'vec-sum', review: true, correct: 1, total: 1, notion: 'vectors' }),
    ]);
  });
});

describe('Vue professeur', () => {
  const student = (id: string, attempts: { skill: string; correct: number; total: number; review?: boolean }[]) => ({ id, profile: { nickname: id, country: 'ma', grade: 2, lang: 'fr' as const }, last_active_at: '2026-11-01', dys_default: null, progress: { unlocked: [], attempts: attempts.map(a => ({ kind: 'workshop' as const, notion: 'vectors' as const, date: '2026-11-01T10:00:00Z', minutes: 5, ...a })) } });
  it('the class programme gives its pathways', () => {
    expect(classSkillKinds('ma', 2)).toEqual(['pythagoras', 'thales', 'trigo', 'inscribed', 'vectors', 'affine', 'stats']);
    expect(classSkillKinds('fr', 0)).toEqual(['fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures']);
  });
  it('flags a skill when at least two students are stuck on it', () => {
    const students = [student('a', [{ skill: 'vec-sum', correct: 2, total: 4 }]), student('b', [{ skill: 'vec-sum', correct: 4, total: 4 }, { skill: 'vec-sum', correct: 0, total: 1, review: true }]), student('c', [{ skill: 'vec-sum', correct: 4, total: 4 }])];
    expect(blockingSkills(students, ['vectors']).map(b => [b.skill.id, b.count])).toEqual([['vec-sum', 2]]);
  });
  it('shows a students × skills table with the status of each cell', () => {
    const students = [student('Nora', [{ skill: 'vec-sum', correct: 4, total: 4 }])];
    render(<ClassSkills lang="fr" students={students} kinds={['vectors']} />);
    const row = screen.getByRole('row', { name: /Nora/ });
    expect(within(row).getAllByText('Acquis').length).toBe(1);
    expect(within(row).getAllByText('Pas encore fait').length).toBe(4);
  });
});

describe('Écriture des vecteurs', () => {
  it('draws the arrow over the letters and reads « vecteur AB »', () => {
    const { container } = render(<p><Rich lang="fr" text={`${vec('AB')} + ${vec('BC')} = ${vec('AC')}`} /></p>);
    expect(container.querySelectorAll('.vec').length).toBe(3);
    expect(container.textContent).toBe('vecteur AB + vecteur BC = vecteur AC');
    expect(spoken(`${vec('AB')} = ${vec('CD')}`, 'en')).toBe('vector AB = vector CD');
  });
  it('no vector text is left with the old combining arrow', () => {
    for (const skill of SKILLS) expect(JSON.stringify(skill.build(1)).includes('\u20d7') || JSON.stringify(skill.build(1)).includes('⃗')).toBe(false);
  });
});

describe('Terminale', () => {
  it('each Terminale programme offers sequences, derivatives and probability', async () => {
    const { figuresFor } = await import('@/lib/figures');
    const { programmesFor, programmeNotions } = await import('@/lib/programmes');
    for (const [country, grade] of [['fr', 6], ['ma', 5], ['ci', 6], ['sn', 6], ['us', 6]] as const) for (const p of programmesFor(country, grade)) {
      const kinds = figuresFor(p, programmeNotions(p).map(n => n.id), grade);
      for (const k of ['seq', 'deriv', 'proba'] as const) expect(kinds, `${country} ${p.track?.id ?? ''}`).toContain(k);
      expect(kinds.filter(k => ['pythagoras', 'thales', 'vectors', 'stats'].includes(k))).toEqual([]);
    }
  });
  it('functions are written cleanly (no « 1x », no « + 0 »)', async () => {
    const { quadText } = await import('@/lib/skills-lycee');
    expect(quadText(1, -2, 0)).toBe('x² − 2x');
    expect(quadText(0.5, 1, -3)).toBe('0,5x² + x − 3');
    expect(quadText(-1, 0, 4)).toBe('−x² + 4');
    for (const skill of SKILLS.filter(s => ['seq', 'deriv', 'proba'].includes(s.chapter))) for (let seed = 0; seed < 30; seed++) expect(JSON.stringify(skill.build(seed))).not.toMatch(/[^0-9,]1x|x \+ 0\b|− −|\+ −/);
  });
  it('the tangent widget is solved only where the tangent is horizontal', async () => {
    const skill = getSkill('deriv-slope')!;
    const step = skill.build(5).steps[0]!;
    if (step.type !== 'widget' || step.widget.kind !== 'tangent') throw new Error();
    render(<SkillActivity lang="fr" skill={skill} engine={testEngine()} onBack={() => {}} />);
    await ready();
    fireEvent.change(screen.getByLabelText(/^x = /), { target: { value: String(step.widget.target + 1) } });
    expect(screen.getByText(/pente de la tangente : [^0]/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(await screen.findByText(/Regarde le signe de la pente/)).toBeTruthy();
    expect(screen.queryByText('C’est juste !')).toBeNull();
    fireEvent.change(screen.getByLabelText(/^x = /), { target: { value: String(step.widget.target) } });
    expect(screen.getByText('pente de la tangente : 0')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(await screen.findByText('C’est juste !')).toBeTruthy();
  });
});

describe('Signe moins', () => {
  it('a hyphen before a number becomes a real minus sign, words are untouched', async () => {
    const { minusSign } = await import('@/components/pisan/math-text');
    expect(minusSign('f(-3) = -11 ; x = -2,5')).toBe('f(−3) = −11 ; x = −2,5');
    expect(minusSign('(-0,5)ⁿ')).toBe('(−0,5)ⁿ');
    expect(minusSign('Au-delà de 3-4 points')).toBe('Au-delà de 3-4 points');
  });
});

describe('6e', () => {
  it('every Grade 6 programme now has its common blocks', async () => {
    const { figuresFor } = await import('@/lib/figures');
    const { programmesFor, programmeNotions } = await import('@/lib/programmes');
    const expected: Record<string, string[]> = {
      fr: ['fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'],
      ma: ['fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'],
      ci: ['stats', 'fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'],
      sn: ['fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'],
      us: ['stats', 'fractions', 'decimals', 'proportion', 'measures'],
    };
    for (const [country, kinds] of Object.entries(expected)) {
      const p = programmesFor(country, 0)[0]!;
      expect(figuresFor(p, programmeNotions(p).map(n => n.id), 0), country).toEqual(kinds);
    }
  });
  it('the protractor reading is the drawn angle, and reflections land on the mirror node', () => {
    for (let seed = 0; seed < 40; seed++) {
      const measure = getSkill('angles-measure')!.build(seed).steps[0]!;
      if (measure.type !== 'number' || !measure.scene?.protractor) throw new Error('rapporteur');
      const { O, A, B } = measure.scene.points as Record<string, { x: number; y: number }>;
      const angle = Math.round(Math.abs(Math.atan2(B!.y - O!.y, B!.x - O!.x) - Math.atan2(A!.y - O!.y, A!.x - O!.x)) * 180 / Math.PI);
      expect(angle).toBe(measure.answer);
      const axial = getSkill('sym-axial')!.build(seed).steps[0]!;
      if (axial.type !== 'grid') throw new Error('grille');
      expect(axial.answer.x + axial.start.x).toBe(10); // axe vertical x = 5
      expect(axial.answer.y).toBe(axial.start.y);
    }
  });
  it('decimal traps are really traps: 2,5 > 2,45 and 2,5 = 2,50', () => {
    for (let seed = 0; seed < 30; seed++) {
      const order = getSkill('dec-compare')!.build(seed).steps.find(s => s.type === 'chips')!;
      if (order.type !== 'chips') throw new Error();
      const values = order.groups[0]!.map(v => Number(v.replace(',', '.')));
      expect([...values].sort((a, b) => a - b)).toEqual(values);
      expect(new Set(values).size).toBe(4);
    }
  });
});
