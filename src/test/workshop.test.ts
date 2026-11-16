import { describe, expect, it } from 'vitest';
import { checkCalculation, checkConcrete, concreteSpec, demonstrationsForLevel, generateAdaptedExercise } from '@/lib/exercises';

describe('CPA workshop', () => {
  it('6ème offers equal sharing and visual fractions', () => {
    const demos = demonstrationsForLevel(0);
    expect(demos.map(ex => ex.template)).toEqual(['sharing', 'fraction']);
    expect(demos[0]?.answer).toBe(3);
    expect(demos[1]?.answer).toBe(9);
  });
  it('3ème offers equations, complex ratios and applied percentages', () => {
    const demos = demonstrationsForLevel(3);
    expect(demos.map(ex => ex.template)).toEqual(['difference', 'ratio', 'percent']);
    expect(demos.map(ex => ex.answer)).toEqual([35, 100, 96]);
  });
  it('high school retains CPA equations, ratios and percentages', () => {
    expect(demonstrationsForLevel(4).map(ex => ex.template)).toEqual(['difference', 'ratio', 'percent']);
    expect(demonstrationsForLevel(4).map(ex => ex.answer)).toEqual([42, 210, 162]);
  });
  it('concrete quantities must be distributed correctly before modelling', () => {
    const ex = demonstrationsForLevel(0)[0];
    if (!ex) throw new Error('Missing sharing demo');
    expect(checkConcrete(ex, [3, 3])).toBe(true);
    expect(checkConcrete(ex, [2, 4])).toBe(false);
    expect(checkConcrete(ex, [0, 0])).toBe(false);
  });
  it('calculation requires both one part and the final fraction answer', () => {
    const ex = demonstrationsForLevel(0)[1];
    if (!ex) throw new Error('Missing fraction demo');
    expect(checkCalculation(ex, ex.equationAnswer, '3', '9')).toBe(true);
    expect(checkCalculation(ex, ex.equationAnswer, '9', '9')).toBe(false);
    expect(checkCalculation(ex, ex.equationAnswer, '3', '3')).toBe(false);
    expect(checkCalculation(ex, ex.equationAnswer, '', '9')).toBe(false);
  });
  it('every grade has distinct quantities and concrete objects conserve the total', () => {
    const ids = new Set<string>();
    for (let level = 0; level <= 6; level++) {
      const demos = demonstrationsForLevel(level);
      for (const ex of demos) {
        const spec = concreteSpec(ex);
        expect(spec.groups.reduce((s, g) => s + g.target, 0) * spec.value).toBe(spec.total);
        expect(spec.groups.every(g => Number.isInteger(g.target) && g.target > 0)).toBe(true);
        ids.add(ex.story.fr);
      }
    }
    expect(ids.size).toBe(20);
  });
  it('generated exercises use the same level-appropriate families', async () => {
    for (const level of [0, 3, 4, 6]) {
      const ex = await generateAdaptedExercise({ level, countryId: 'fr', lang: 'fr' });
      expect(demonstrationsForLevel(level).map(d => d.template)).toContain(ex.template);
      expect(checkConcrete(ex, concreteSpec(ex).groups.map(g => g.target))).toBe(true);
    }
  });
});
import { concreteMistake as cm, concreteSpec as cs, demonstrationsForLevel as dl } from '@/lib/exercises';
describe('concrete feedback', () => {
  it('detects misplaced excess when totals are right', () => {
    const ex = dl(3)[0]!;
    const { groups } = cs(ex);
    expect(groups.some(g => g.extra)).toBe(true);
    const counts = groups.map(g => g.target);
    const e = groups.findIndex(g => g.extra); const p = groups.findIndex(g => g.barIndex === groups[e]!.barIndex && !g.extra);
    counts[p]! += counts[e]!; counts[e] = 0;
    expect(cm(ex, counts)).toBe('extra');
    expect(cm(ex, groups.map(g => g.target))).toBeNull();
  });
});
