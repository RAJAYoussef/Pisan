import { describe, expect, it, vi } from 'vitest';
import { cleanup as cleanupAll, fireEvent, render, screen } from '@testing-library/react';
import { applyBalance, balanceOps, balanceSolved, digitsByRank, INTROS, isPrime, rectanglePairs, zeroPairs, type Side } from '@/lib/skill-intros';
import type { FigureKind } from '@/lib/figures';
import { bestStars, starsFor, stepPoints, totalPoints } from '@/lib/rewards';
import { getSkill, skillsFor, SKILLS } from '@/lib/skills';
const await_skills = { SKILLS };
import { SkillActivity } from '@/components/pisan/skills';
import { localEngine } from '@/lib/skill-session';
import type { Attempt } from '@/lib/pisan';

/** Résout la balance par la voie la plus courte : boîtes, puis billes, puis partage. */
function solve(left: Side, right: Side): number | null {
  for (let guard = 0; guard < 40; guard++) {
    const x = balanceSolved(left, right);
    if (x !== null) return x;
    const ops = balanceOps(left, right);
    const op = ops.find(o => o.kind === 'box') ?? ops.find(o => o.kind === 'share') ?? ops.find(o => o.kind === 'unit');
    if (!op) return null;
    [left, right] = applyBalance(op, left, right);
  }
  return null;
}

describe('Introductions (modèle de Singapour)', () => {
  const DONE: FigureKind[] = ['primes', 'linear', 'relatives', 'signs', 'decimals', 'arith', 'powers', 'sci', 'roots', 'expressions', 'literal', 'identities', 'equations', 'inequalities', 'systems', 'affine', 'seq', 'deriv', 'lines', 'polygons', 'angles', 'symmetry', 'measures', 'surfaces', 'solids', 'pythagoras', 'thales', 'trigo', 'inscribed', 'vectors', 'fractions', 'proportion', 'stats', 'data', 'chance', 'proba', 'intervals', 'reference', 'signtable', 'lineeq', 'quartiles', 'events', 'unitcircle', 'quadratic', 'expo', 'scalar', 'trigfn', 'limits'];
  const LYCEE: FigureKind[] = [];
  /** Une compétence « manipule » si son introduction a une manipulation ou si l'entraînement en contient une (widget, quadrillage). */
  const manipulates = (id: string) => Boolean(INTROS[id]?.manip) || getSkill(id)!.build(1).steps.some(st => st.type === 'widget' || st.type === 'grid' || st.type === 'tap');
  it('every skill of the finished chapters has a lesson card in four languages (and a goal with its manipulation)', () => {
    for (const id of DONE.flatMap(k => skillsFor(k)).map(s => s.id)) {
      const intro = INTROS[id];
      expect(intro, id).toBeTruthy();
      expect(Boolean(intro!.goal), `${id} : consigne et manipulation vont ensemble`).toBe(Boolean(intro!.manip));
      for (const l of [...(intro!.goal ? [intro!.goal] : []), ...intro!.lesson.points, intro!.lesson.example.title, ...intro!.lesson.example.lines]) for (const lang of ['fr', 'en', 'ar', 'es'] as const) expect(l[lang].length, `${id} ${lang}`).toBeGreaterThan(0);
    }
    // dans les chapitres finis, au moins la moitié des compétences commencent par manipuler
    for (const k of DONE.filter(k => !LYCEE.includes(k))) expect(skillsFor(k).filter(s => manipulates(s.id)).length * 2, k).toBeGreaterThanOrEqual(skillsFor(k).length);
  });
  it('every skill of PiSan now has its lesson card', () => {
    const { SKILLS } = await_skills;
    expect(SKILLS.filter(sk => !INTROS[sk.id]).map(sk => sk.id)).toEqual([]);
    expect(Object.keys(INTROS).filter(id => !getSkill(id))).toEqual([]);
  });
  it('every manipulation can reach its goal', () => {
    for (const [id, intro] of Object.entries(INTROS)) {
      const m = intro.manip;
      if (!m) continue;
      if (m.kind === 'hops') { expect(m.target, id).toBeGreaterThanOrEqual(m.min); expect(m.target, id).toBeLessThanOrEqual(m.max); expect(Math.abs(Math.round((m.target - m.start) / m.step) * m.step - (m.target - m.start)), id).toBeLessThan(1e-9); }
      if (m.kind === 'place-value' && m.start !== 0) { const k = Math.log10(m.target / m.start); expect(Math.abs(k - Math.round(k)), id).toBeLessThan(1e-9); }
      if (m.kind === 'place-value' && m.start === 0) expect(digitsByRank(m.target).every(d => d <= 9), id).toBe(true);
      if (m.kind === 'square') expect(m.area, id).toBeLessThanOrEqual(144);
    }
    expect(zeroPairs(4, -6)).toEqual({ pairs: 4, result: -2 });
  });
  it('the counters show the divisors, and a prime only makes one line', () => {
    expect(rectanglePairs(12)).toEqual([[1, 12], [2, 6], [3, 4]]);
    expect(rectanglePairs(13)).toEqual([[1, 13]]);
    expect(isPrime(13)).toBe(true);
    expect(isPrime(91)).toBe(false);
  });
  it('every balance can be solved keeping both sides equal, and gives the right x', () => {
    for (const intro of Object.values(INTROS)) {
      if (intro.manip?.kind !== 'balance') continue;
      const { left, right } = intro.manip;
      const x = solve(left, right)!;
      expect(left.x * x + left.u).toBe(right.x * x + right.u);
    }
    expect(balanceOps({ x: 3, u: 2 }, { x: 0, u: 11 }).map(o => o.kind)).toEqual(['unit']); // on ne partage pas 11 en 3
  });
});

describe('Ludification', () => {
  it('points, combos and stars', () => {
    expect(stepPoints(true, 1)).toEqual({ points: 10, combo: 1 });
    expect(stepPoints(true, 3)).toEqual({ points: 15, combo: 3 });
    expect(stepPoints(false, 0)).toEqual({ points: 5, combo: 0 });
    expect([starsFor(4, 4), starsFor(3, 4), starsFor(2, 4)]).toEqual([3, 2, 1]);
    const a = (skill: string, correct: number, total: number, review = false): Attempt => ({ kind: 'workshop', notion: 'arithmetic', skill, correct, total, review, date: '2026-11-01T10:00:00Z', minutes: 3 });
    const attempts = [a('prime-multiples', 2, 3), a('prime-multiples', 3, 3), a('prime-divisors', 1, 2, true)];
    expect(bestStars(attempts, 'prime-multiples')).toBe(3);
    expect(bestStars(attempts, 'prime-divisors')).toBe(0); // un mini-contrôle ne donne pas d'étoiles
    expect(totalPoints(attempts)).toBe(60);
  });
});

describe('Un parcours commence par manipuler, la première fois seulement', () => {
  const engine = () => localEngine({ secret: 'test', hash: 'e'.repeat(64) });
  it('first time: manipulate, then the lesson, then practise', async () => {
    render(<SkillActivity lang="fr" skill={getSkill('lin-two-step')!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Je manipule/ }).getAttribute('aria-current')).toBe('step');
    expect(screen.getByText('3x + 2 = 11')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Retirer 1 bille à gauche seulement/ }));
    expect(screen.getByRole('alert').textContent).toMatch(/Déséquilibre/);
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole('button', { name: /Retirer 1 bille de chaque côté/ }));
    fireEvent.click(screen.getByRole('button', { name: /Partager chaque plateau en 3/ }));
    expect(screen.getByText(/x = 3\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /J’ai compris/ }));
    expect(screen.getByText('À retenir')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Je m’entraîne/ }).at(-1)!);
    expect(await screen.findByText(/pts/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Revoir le cours/ })).toBeTruthy();
  });
  it('a skill done before the manipulations arrived shows them once on this device', () => {
    localStorage.removeItem('pisan-intro-seen');
    const done: Attempt = { kind: 'workshop', notion: 'fractions', skill: 'frac-problem', correct: 2, total: 2, date: '2026-10-01T10:00:00Z', minutes: 3 };
    const first = render(<SkillActivity lang="fr" skill={getSkill('frac-problem')!} engine={engine()} attempts={[done]} onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Je manipule/ }).getAttribute('aria-current')).toBe('step');
    fireEvent.click(screen.getByRole('button', { name: /Passer au cours/ }));
    fireEvent.click(screen.getAllByRole('button', { name: /Je m’entraîne/ }).at(-1)!);
    first.unmount();
    render(<SkillActivity lang="fr" skill={getSkill('frac-problem')!} engine={engine()} attempts={[done]} onBack={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Passer au cours/ })).toBeNull();
  });
  it('once done and seen, it goes straight to practice (the lesson stays one tap away)', async () => {
    localStorage.setItem('pisan-intro-seen', JSON.stringify(['lin-two-step']));
    const done: Attempt = { kind: 'workshop', notion: 'equations', skill: 'lin-two-step', correct: 3, total: 3, date: '2026-11-01T10:00:00Z', minutes: 3 };
    render(<SkillActivity lang="fr" skill={getSkill('lin-two-step')!} engine={engine()} attempts={[done]} onBack={vi.fn()} />);
    expect(await screen.findByRole('button', { name: /Revoir le cours/ })).toBeTruthy();
    expect(screen.queryByText('3x + 2 = 11')).toBeNull();
  });
  it('the counters lead to the prime discovery', () => {
    render(<SkillActivity lang="fr" skill={getSkill('prime-recognise')!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
    expect(screen.queryByText(/13 n’a que deux diviseurs/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Une ligne de plus' }));
    expect(screen.getByText(/Il reste 1 jeton/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Une ligne de plus' }));
    expect(screen.getByText(/13 n’a que deux diviseurs/)).toBeTruthy();
  });
});

describe('Manipulations de la famille Nombres', () => {
  const engine = () => localEngine({ secret: 'test', hash: 'f'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  it('zero pairs: 4 + (−6) leaves −2', () => {
    open('rel-add-sub');
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /Associer un \+ et un −/ }));
    expect(screen.getByRole('status').textContent).toMatch(/4 \+ \(−6\) = −2/);
  });
  it('the sign pattern: the learner predicts (−3) × (−1) = 3', () => {
    open('signs-rule');
    for (const v of ['−3', '−6', '−9']) fireEvent.click(screen.getByRole('button', { name: v }));
    expect(screen.getByText('(−3) × (−1)', { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '−3' }));
    expect(screen.getByRole('alert').textContent).toMatch(/change de/);
    for (const v of ['3', '6', '9']) fireEvent.click(screen.getByRole('button', { name: v }));
    expect(screen.getByRole('status').textContent).toMatch(/Négatif × négatif → positif/);
  });
  it('packs: 23 counters in packs of 5 give 23 = 5 × 4 + 3', () => {
    open('arith-euclid');
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /Faire un paquet de 5/ }));
    expect(screen.getByRole('status').textContent).toMatch(/23 = 5 × 4 \+ 3/);
  });
  it('place-value table: 7,2 slides to 720 with × 10 twice', () => {
    open('dec-times-ten');
    fireEvent.click(screen.getByRole('button', { name: '× 10' }));
    fireEvent.click(screen.getByRole('button', { name: '× 10' }));
    expect(screen.getByRole('status').textContent).toMatch(/2 glissements : 7,2 × 100 = 720/);
  });
  it('a skill without a manipulation starts with the lesson', () => {
    open('arith-priorities');
    expect(screen.queryByRole('button', { name: /Je manipule/ })).toBeNull();
    expect(screen.getByText('À retenir')).toBeTruthy();
  });
});

describe('Manipulations de la famille Calcul littéral et fonctions', () => {
  const engine = () => localEngine({ secret: 'test', hash: '9'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  it('algebra tiles: (x + 3)(x + 2) = x² + 2x + 3x + 6', () => {
    open('lit-double');
    for (const b of screen.getAllByRole('button', { name: /^Morceau/ })) fireEvent.click(b);
    expect(screen.getByRole('status').textContent).toMatch(/x² \+ 5x \+ 6/);
  });
  it('the square of pieces: x² + 6x + 9 = (x + 3)²', () => {
    open('id-factor');
    fireEvent.click(screen.getByRole('button', { name: 'k + 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'k + 1' }));
    expect(screen.getByRole('status').textContent).toMatch(/\(x \+ 3\)²/);
  });
  it('the machine finds the pre-image of 13 for 3x − 5', () => {
    open('affine-image');
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: 'Entrée plus grande' })); // 3 → 7 : passe par 6
    expect(screen.getByRole('status').textContent).toMatch(/Avec 6, la machine donne 13/);
  });
  it('testing values shows the solution set, and the flip with a negative coefficient', () => {
    open('ineq-flip');
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: 'x plus petit' }));
    expect(screen.getByRole('status').textContent).toMatch(/x < −2.*le sens s’inverse/);
  });
  it('the trial table finds the solution of the system', () => {
    open('sys-combination');
    for (let i = 0; i < 7; i++) fireEvent.click(screen.getByRole('button', { name: 'x plus grand' }));
    expect(screen.getByRole('status').textContent).toMatch(/\(7 ; 3\)/);
  });
});

describe('Manipulations de la famille Géométrie', () => {
  const engine = () => localEngine({ secret: 'test', hash: '8'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  it('the angle sum stays 180° however the triangle is reshaped', () => {
    open('ang-sum');
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Sommet vers la droite' }));
    expect(screen.getByText(/= 180°$/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/toujours 180°/);
  });
  it('the sticks close only when the longest is shorter than the two others', () => {
    open('poly-inequality');
    expect(screen.getByText(/ne se rejoignent pas/)).toBeTruthy();
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Troisième bâton plus court' }));
    expect(screen.getByText(/le triangle se ferme/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toMatch(/entre 4 et 8/);
  });
  it('three pyramids fill the prism', () => {
    open('solid-pyramid');
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'Verser une pyramide' }));
    expect(screen.getByRole('status').textContent).toMatch(/le tiers/);
  });
  it('the converse of Thales: equal ratios exactly when parallel', () => {
    open('thales-converse');
    expect(screen.getByText(/n’est pas parallèle/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'N vers C' }));
    expect(screen.getByText('(MN) ∥ (BC)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'M vers B' }));
    expect(screen.getByRole('status').textContent).toMatch(/réciproque/);
  });
  it('the cut parallelogram becomes a rectangle', () => {
    open('area-parallelogram');
    fireEvent.click(screen.getByRole('button', { name: /Découper le triangle/ }));
    expect(screen.getByRole('status').textContent).toMatch(/rectangle 6 × 3.*18/);
  });
});

describe('Manipulations de la famille Données, hasard, proportionnalité', () => {
  const engine = () => localEngine({ secret: 'test', hash: '7'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  it('3/4 of 24 L with the Singapore bar', () => {
    open('frac-problem');
    fireEvent.click(screen.getByRole('button', { name: /Partager en 4/ }));
    fireEvent.click(screen.getByRole('button', { name: /Prendre 3 parts/ }));
    expect(screen.getByRole('status').textContent).toMatch(/= 18 L/);
  });
  it('the area model gives 3/5 × 2/3 = 6/15', () => {
    open('frac-multiply-divide');
    fireEvent.click(screen.getByRole('button', { name: 'Colorier 3/5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Colorier 2/3' }));
    expect(screen.getByRole('status').textContent).toMatch(/= 6\/15/);
  });
  it('the median: sort, then remove the extremes', () => {
    open('stats-median');
    fireEvent.click(screen.getByRole('button', { name: /Ranger/ }));
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: /Retirer la plus petite/ }));
    expect(screen.getByRole('status').textContent).toMatch(/médiane vaut 11/);
  });
  it('the frequency gets close to the probability over many rolls', () => {
    open('chance-frequency');
    fireEvent.click(screen.getByRole('button', { name: '+1000' }));
    const text = screen.getByRole('status').textContent!;
    const f = Number(text.match(/fréquence \((0,\d+)\)/)![1]!.replace(',', '.'));
    expect(Math.abs(f - 1 / 6)).toBeLessThan(0.04);
  });
  it('the 4th proportional starts by sharing the bar', () => {
    open('prop-fourth');
    fireEvent.click(screen.getByRole('button', { name: /Partager 4,5 € en 3/ }));
    expect(screen.getByRole('status').textContent).toMatch(/x = 1,5/);
  });
});


describe('Manipulations de 2nde', () => {
  const engine = () => localEngine({ secret: 'test', hash: '8'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  const press = (name: string | RegExp, times = 1) => { for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name })); };
  const found = () => screen.getByRole('status').textContent!;
  it('walking x along [−2 ; 3[ shows which end is included', () => {
    open('int-notation');
    press('Avancer x', 14);
    expect(found()).toMatch(/−2 est dedans, 3 n’est pas dedans/);
  });
  it('intersection and union: only in A, only in B, in both', () => {
    open('int-union');
    press('Avancer x', 15);
    expect(found()).toMatch(/A ∩ B : les deux à la fois/);
  });
  it('the square function: 4 has two pre-images, −2 and 2', () => {
    open('fn-image');
    press('Reculer x'); press('Avancer x', 9);
    expect(found()).toMatch(/2 antécédents : −2 et 2/);
  });
  it('the sign of (x + 1)(x − 3) only changes at its roots', () => {
    open('sign-product');
    press('Avancer x', 16);
    expect(found()).toMatch(/ne change qu’en −1 et 3/);
  });
  it('reading a line: p first, then m', () => {
    open('line-read');
    press('Augmenter p', 2); press('Diminuer m', 2);
    expect(found()).toMatch(/p = 2 : la droite coupe l’axe vertical en 2/);
  });
  it('quartiles: sort, cut into four, draw the box', () => {
    open('q-quartiles');
    press(/Ranger/); press(/Couper en quatre/); press(/Dessiner la boîte/);
    expect(found()).toMatch(/Q3 − Q1 = 5/);
  });
  it('two dice: five ways to make 8 out of 36', () => {
    open('ev-universe');
    for (const [a, b] of [[2, 6], [3, 5], [4, 4], [5, 3], [6, 2]]) press(`${a} + ${b}`);
    expect(found()).toMatch(/P\(somme = 8\) = 5\/36/);
  });
  it('the Venn diagram removes what is counted twice', () => {
    open('ev-union');
    press(/Compter A/); press(/Ajouter B/); press(/Retirer A ∩ B/);
    expect(found()).toMatch(/A ∪ B compte 17 éléments sur 30/);
  });
  it('the unit circle: 60° gives (1/2 ; √3/2), and a full turn shows the signs', () => {
    open('uc-values');
    press('Tourner (sens direct)', 4);
    expect(found()).toMatch(/\(0,5 ; 0,866\)/);
    cleanupAll();
    open('uc-signs');
    press('Tourner (sens direct)', 12);
    expect(found()).toMatch(/cos est l’abscisse de M/);
  });
});

describe('Manipulations de 1ère', () => {
  const engine = () => localEngine({ secret: 'test', hash: '9'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  const press = (name: string | RegExp, times = 1) => { for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name })); };
  const found = () => screen.getByRole('status').textContent!;
  it('moving the parabola up shows Δ > 0, Δ = 0, then Δ < 0', () => {
    open('quad-discriminant');
    press('Monter la parabole', 5);
    expect(found()).toMatch(/Δ = 0 : elle le touche en un seul point/);
  });
  it('turning v: the dot product is positive, zero, then negative', () => {
    open('dot-norm');
    press('Ouvrir l’angle', 6);
    expect(found()).toMatch(/Angle droit : u · v = 0/);
  });
  it('cos x = 1/2 has two solutions on the circle, ±π/3', () => {
    open('trig-equation');
    press('Tourner (sens direct)', 10);
    expect(found()).toMatch(/π\/3 et 5π\/3/);
    expect(found()).toMatch(/x = ±π\/3/);
  });
  it('the slope of eˣ equals its value', () => {
    open('exp-derivative');
    press('Avancer x', 8);
    expect(found()).toMatch(/\(eˣ\)′ = eˣ/);
  });
});

describe('Manipulations du lycée : dérivation et probabilités', () => {
  const engine = () => localEngine({ secret: 'test', hash: 'a'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  const press = (name: string | RegExp, times = 1) => { for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name })); };
  const found = () => screen.getByRole('status').textContent!;
  it('the secant slope tends to the derivative', () => {
    open('deriv-slope');
    press('Rapprocher M de A', 4);
    expect(found()).toMatch(/tend vers 1 : c’est le nombre dérivé f′\(3\)/);
  });
  it('the tree: four paths, total probability P(B) = 0,29', () => {
    open('proba-tree');
    for (const path of ['A → B', 'A → B̄', 'Ā → B', 'Ā → B̄']) press(path);
    expect(found()).toMatch(/P\(B\) = 0,15 \+ 0,14 = 0,29/);
  });
  it('the Galton board approaches B(4 ; 0,5) and its mean approaches 2', () => {
    open('proba-binomial');
    press('+100 billes', 3);
    expect(found()).toMatch(/B\(4 ; 0,5\)/);
    const mean = Number(screen.getByText(/300 billes · moyenne/).textContent!.match(/moyenne ([\d,]+)/)![1]!.replace(',', '.'));
    expect(Math.abs(mean - 2)).toBeLessThan(0.25);
  });
});

describe('Manipulations des limites', () => {
  const engine = () => localEngine({ secret: 'test', hash: 'b'.repeat(64) });
  const open = (id: string) => render(<SkillActivity lang="fr" skill={getSkill(id)!} engine={engine()} attempts={[]} onBack={vi.fn()} />);
  const found = () => screen.getByRole('status').textContent!;
  it('x × 10: f(x) approaches 2, a horizontal asymptote', () => {
    open('lim-infinity');
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: 'x × 10' }));
    expect(found()).toMatch(/lim f = 2 en \+∞/);
  });
  it('bisection traps the root of x³ + x − 1 in [0,6563 ; 0,6875]', () => {
    open('lim-ivt');
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: 'Couper en deux' }));
    expect(found()).toMatch(/\[0,65625 ; 0,6875\]/);
  });
});
