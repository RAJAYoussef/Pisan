import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { anglesOf, chipsOk, getSkill, numberOk, SKILLS, skillsFor, skillStatus, sentenceOk, type Activity, type Blank, type Step } from '@/lib/skills';
import { chapterSkillKinds, FIGURE_KINDS } from '@/lib/figures';
import { programmeFor } from '@/lib/programmes';
import { SkillActivity } from '@/components/pisan/skills';
import type { L } from '@/lib/curriculum';

const LANGS = ['fr', 'en', 'ar', 'es'] as const;
const filled = (l: L) => LANGS.every(k => l[k].trim().length > 0);
/** La réponse qu'un élève taperait : arrondie comme demandé par l'énoncé. */
const typed = (step: Extract<Step, { type: 'number' }>) => {
  const digits = step.tolerance >= 0.05 ? 1 : step.tolerance > 1e-5 ? 2 : 6;
  return String(Math.round(step.answer * 10 ** digits) / 10 ** digits).replace('.', ',');
};
const chipsSolution = (step: Extract<Step, { type: 'chips' }>) => step.groups.flatMap((g, i) => [...(i ? ['='] : []), ...g.flatMap((tok, j) => j ? ['+', tok] : [tok])]);

describe('Parcours de compétences : contenu', () => {
  it('covers the four chapters with the agreed skills', () => {
    expect(FIGURE_KINDS.map(k => skillsFor(k).length)).toEqual([5, 5, 4, 3]);
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
          case 'chips': expect(chipsOk(chipsSolution(step), step.groups), `${skill.id} #${seed}`).toBe(true); for (const tok of chipsSolution(step)) expect(step.tokens).toContain(tok); break;
          case 'number': expect(numberOk(typed(step), step.answer, step.tolerance), `${skill.id} #${seed} ${typed(step)}`).toBe(true); break;
          case 'sentence': {
            const blanks = step.parts.filter((p): p is Blank => 'options' in p);
            expect(sentenceOk(step.parts, blanks.map(b => b.answer[0]!))).toBe(true);
            expect(sentenceOk(step.parts, blanks.map(b => (b.answer[0]! + 1) % b.options.length))).toBe(false);
            break;
          }
          case 'widget': break;
        }
      }
    }
  });

  it('is deterministic for a given seed', () => {
    for (const s of SKILLS) expect(JSON.stringify(s.build(42))).toBe(JSON.stringify(s.build(42)));
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
    expect(skillStatus([], 'pyth-compute')).toBe('todo');
    expect(skillStatus([{ skill: 'pyth-compute', correct: 4, total: 6 }], 'pyth-compute')).toBe('started');
    expect(skillStatus([{ skill: 'pyth-compute', correct: 4, total: 6 }, { skill: 'pyth-compute', correct: 6, total: 6 }], 'pyth-compute')).toBe('mastered');
    expect(skillStatus([{ correct: 1, total: 1 }], 'pyth-compute')).toBe('todo');
  });
});

describe('Chapitres du programme', () => {
  it('Maroc 3AC : Pythagore, Thalès, trigonométrie et angles inscrits chacun dans son chapitre', () => {
    const kinds = programmeFor('ma', 2)!.chapters.flatMap(chapterSkillKinds);
    expect(new Set(kinds)).toEqual(new Set(['thales', 'trigo', 'inscribed']));
  });
  it('Côte d’Ivoire 3e : le chapitre « Triangle rectangle » donne Pythagore et la trigonométrie', () => {
    const chapter = programmeFor('ci', 3)!.chapters.find(c => c.title.fr.includes('Triangle rectangle'))!;
    expect(chapterSkillKinds(chapter)).toEqual(['pythagoras', 'trigo']);
  });
});

// ───────────── À l'écran : chaque compétence se termine en suivant ses propres réponses ─────────────

function solveOnScreen(activity: Activity) {
  activity.steps.forEach((step, i) => {
    switch (step.type) {
      case 'choice': fireEvent.click(screen.getByRole('button', { name: step.options[step.answer]!.fr })); break;
      case 'tap': {
        const arc = step.scene.arcs?.find(a => a.id === step.answer);
        fireEvent.keyDown(screen.getByRole('button', { name: arc ? `Arc ${arc.text}` : `[${step.answer}]` }), { key: 'Enter' });
        break;
      }
      case 'chips':
        for (const tok of chipsSolution(step)) fireEvent.click(screen.getAllByRole('button', { name: tok }).find(b => !(b as HTMLButtonElement).disabled)!);
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
      case 'widget':
        if (step.widget.kind === 'squares') { fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '90' } }); fireEvent.click(screen.getByRole('button', { name: 'Verser les carreaux' })); }
        if (step.widget.kind === 'thales') { const m = screen.getByRole('slider', { name: 'M' }); for (let v = 1; v < step.widget.problem.am; v++) fireEvent.keyDown(m, { key: 'ArrowRight' }); }
        if (step.widget.kind === 'inscribed') { const m = screen.getByRole('slider', { name: 'M' }); for (let k = 0; k < 14; k++) fireEvent.keyDown(m, { key: 'ArrowRight' }); }
        fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
        break;
    }
    expect(screen.queryByText('C’est juste !'), `étape ${i + 1}`).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: i + 1 < activity.steps.length ? /Étape suivante/ : /Terminer/ }));
  });
}

describe('Parcours à l’écran', () => {
  for (const skill of SKILLS) it(`${skill.id} can be completed and saves the skill`, async () => {
    vi.spyOn(Date, 'now').mockReturnValue(5);
    const onSave = vi.fn(async () => {});
    render(<SkillActivity lang="fr" skill={skill} onSave={onSave} onBack={() => {}} />);
    const activity = skill.build(5);
    solveOnScreen(activity);
    expect(await screen.findByText('Compétence acquise !')).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ kind: 'workshop', skill: skill.id, correct: activity.steps.length, total: activity.steps.length }));
    vi.restoreAllMocks();
  });

  it('a wrong first try gives the hint, and the step no longer counts as mastered', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(5);
    const onSave = vi.fn(async () => {});
    const skill = getSkill('pyth-discover')!;
    render(<SkillActivity lang="fr" skill={skill} onSave={onSave} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Verser les carreaux' }));
    expect(screen.getByRole('status').textContent).toMatch(/déborde/); // 60° : trop de carreaux
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(screen.getByText(/l’angle est trop petit/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '120' } });
    expect(screen.getByRole('status').textContent).toMatch(/Il manque/);
    fireEvent.change(screen.getByLabelText(/Angle en A/), { target: { value: '90' } });
    expect(screen.getByRole('status').textContent).toMatch(/rempli exactement/);
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.click(screen.getByRole('button', { name: /Étape suivante/ }));
    solveOnScreen({ ...skill.build(5), steps: skill.build(5).steps.slice(1) });
    expect(await screen.findByText(/2 étapes sur 3 du premier coup/)).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ correct: 2, total: 3 }));
    vi.restoreAllMocks();
  });

  it('the set square can be put on a corner with the keyboard', () => {
    vi.spyOn(Date, 'now').mockReturnValue(5);
    const { container } = render(<SkillActivity lang="fr" skill={getSkill('pyth-recognise')!} onSave={async () => {}} onBack={() => {}} />);
    const corner = screen.getAllByRole('button', { name: /Poser l’équerre en/ })[0]!;
    fireEvent.keyDown(corner, { key: 'Enter' });
    expect(corner.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.skill-equerre')).toBeTruthy();
    expect(within(container).getAllByRole('button', { name: /Oui, en|Non/ }).length).toBe(4);
    vi.restoreAllMocks();
  });
});
