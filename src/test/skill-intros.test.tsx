import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { applyBalance, balanceOps, balanceSolved, digitsByRank, INTROS, isPrime, rectanglePairs, zeroPairs, type Side } from '@/lib/skill-intros';
import type { FigureKind } from '@/lib/figures';
import { bestStars, starsFor, stepPoints, totalPoints } from '@/lib/rewards';
import { getSkill, skillsFor } from '@/lib/skills';
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
  const DONE: FigureKind[] = ['primes', 'linear', 'relatives', 'signs', 'decimals', 'arith', 'powers', 'sci', 'roots'];
  it('every skill of the finished chapters has a lesson card in four languages (and a goal with its manipulation)', () => {
    for (const id of DONE.flatMap(k => skillsFor(k)).map(s => s.id)) {
      const intro = INTROS[id];
      expect(intro, id).toBeTruthy();
      expect(Boolean(intro!.goal), `${id} : consigne et manipulation vont ensemble`).toBe(Boolean(intro!.manip));
      for (const l of [...(intro!.goal ? [intro!.goal] : []), ...intro!.lesson.points, intro!.lesson.example.title, ...intro!.lesson.example.lines]) for (const lang of ['fr', 'en', 'ar', 'es'] as const) expect(l[lang].length, `${id} ${lang}`).toBeGreaterThan(0);
    }
    // dans les chapitres finis, au moins la moitié des compétences commencent par manipuler
    for (const k of DONE) expect(skillsFor(k).filter(s => INTROS[s.id]?.manip).length * 2, k).toBeGreaterThanOrEqual(skillsFor(k).length);
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
  it('once done, it goes straight to practice (the lesson stays one tap away)', async () => {
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
