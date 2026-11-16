import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { checkFreeAnswer, freeAnswer, parse } from '@/lib/answer-check';
import { getNotion, NOTIONS, type NotionId, type Question } from '@/lib/curriculum';
import { QuestionChoices } from '@/components/pisan/diagnostic';

const Q = (id: NotionId, i: number): Question => getNotion(id).questions[i]!;
const ok = (id: NotionId, i: number, input: string) => checkFreeAnswer(Q(id, i), input);

describe('Lecture des réponses', () => {
  it('reads numbers, fractions, decimals with comma or point', () => {
    expect(parse('0,5')!.fn(0)).toBe(0.5);
    expect(parse('0.5')!.fn(0)).toBe(0.5);
    expect(parse('1/2')!.fn(0)).toBe(0.5);
    expect(parse('−3')!.fn(0)).toBe(-3);
  });
  it('reads x, powers, roots, π and implicit products', () => {
    expect(parse('3x²')!.fn(2)).toBe(12);
    expect(parse('3x^2')!.fn(2)).toBe(12);
    expect(parse('2(x+1)')!.fn(3)).toBe(8);
    expect(parse('5√2')!.fn(0)).toBeCloseTo(5 * Math.SQRT2);
    expect(parse('90π')!.fn(0)).toBeCloseTo(90 * Math.PI);
    expect(parse('-x²')!.fn(3)).toBe(-9);
  });
  it('refuses what it cannot read', () => {
    for (const s of ['(2 ; 3)', 'x > 4', '3 + 2i', 'AB/AC', 'ln(10)', 'x = ±7', '']) expect(parse(s), s).toBeNull();
  });
});

describe('Correction des réponses libres', () => {
  it('accepts equivalent forms of the right answer', () => {
    expect(ok('fractions', 0, '3/4')).toBe(true);
    expect(ok('fractions', 0, '0,75')).toBe(true);
    expect(ok('fractions', 0, '0.75')).toBe(true);
    expect(ok('decimals', 0, '6.15')).toBe(true);
    expect(ok('equations', 0, '4')).toBe(true);
    expect(ok('equations', 0, 'x = 4')).toBe(true);
    expect(ok('derivatives', 0, '3x^2')).toBe(true);
    expect(ok('derivatives', 1, '10x - 2')).toBe(true);
    expect(ok('derivatives', 1, 'f′(x) = −2 + 10x')).toBe(true);
    expect(ok('areas', 2, '20')).toBe(true);
    expect(ok('areas', 2, '20 cm²')).toBe(true);
    expect(ok('statistics', 3, '40')).toBe(true);
    expect(ok('statistics', 3, '40 %')).toBe(true);
    expect(ok('solids', 0, '90π')).toBe(true);
    expect(ok('logarithm', 1, 'e^2')).toBe(true);
  });
  it('rejects wrong answers', () => {
    expect(ok('fractions', 0, '2/6')).toBe(false);
    expect(ok('equations', 0, '9')).toBe(false);
    expect(ok('derivatives', 0, 'x²')).toBe(false);
    expect(ok('integers', 0, '3')).toBe(false);
  });
  it('rejects copying the calculation instead of answering', () => {
    expect(ok('integers', 0, '−7 + 4')).toBe(false);
    expect(ok('square-roots', 0, '√49')).toBe(false);
    expect(ok('decimals', 0, '3,7 + 2,45')).toBe(false);
  });
  it('keeps multiple-choice when several answers are right or the form matters', () => {
    expect(freeAnswer(Q('arithmetic', 0))).toBeNull(); // lequel est premier
    expect(freeAnswer(Q('inequalities', 3))).toBeNull(); // une valeur solution parmi d'autres
    expect(freeAnswer(Q('integrals', 0))).toBeNull(); // une primitive (à une constante près)
    expect(freeAnswer(Q('algebra', 0))).toBeNull(); // développer : la forme compte
    expect(freeAnswer(Q('square-roots', 1))).toBeNull(); // simplifier √50
  });
  it('accepts the listed right answer for every free-answer question', () => {
    let count = 0;
    for (const n of NOTIONS) n.questions.forEach((q, i) => {
      if (!freeAnswer(q)) return;
      count++;
      expect(checkFreeAnswer(q, q.options[q.answer]!), `${n.id} #${i}`).toBe(true);
      q.options.forEach((o, k) => { if (k !== q.answer) expect(checkFreeAnswer(q, o), `${n.id} #${i} leurre ${o}`).toBe(false); });
    });
    expect(count).toBeGreaterThan(100);
  });
});

describe('Écran de réponse libre', () => {
  it('lets the student type, and switch back to the choices', () => {
    let selected: number | null = null;
    render(<QuestionChoices question={Q('fractions', 0)} lang="fr" selected={null} onSelect={i => { selected = i; }} />);
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: '0,75' } });
    expect(selected).toBe(Q('fractions', 0).answer);
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: '0,7' } });
    expect(selected).toBe(-1);
    fireEvent.click(screen.getByRole('button', { name: 'Voir les choix' }));
    expect(selected).toBeNull();
    expect(screen.getByRole('button', { name: '3/4' })).toBeTruthy();
  });
});
