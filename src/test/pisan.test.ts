import { describe, expect, it } from 'vitest';
import { canStartExercise, exercisesLeft, incrementDaily, PRICES } from '@/lib/plan';
import { DIAGNOSTIC_LENGTH, analyze, diagnosticPath, nextIndex } from '@/lib/diagnostic';
import { gradeOn20 } from '@/lib/pisan';

describe('PiSan rules', () => {
  it('server-confirmed partner access unlocks unlimited exercises', () => { expect(exercisesLeft('partner', { date: '2026-11-14', count: 50 }, '2026-11-14')).toBe(null); });
  it('discovery permits only 3 exercises each day', () => { const usage = { date: '2026-11-14', count: 2 }; expect(canStartExercise('discovery', usage, '2026-11-14')).toBe(true); expect(canStartExercise('discovery', incrementDaily(usage, '2026-11-14'), '2026-11-14')).toBe(false); expect(exercisesLeft('discovery', { date: '2026-11-14', count: 3 }, '2026-11-15')).toBe(3); });
  it('monthly access is 12 EUR', () => { expect(PRICES.monthly.amount).toBe(12); expect(PRICES.monthly.currency).toBe('EUR'); });
  it('yearly access is 89 EUR', () => { expect(PRICES.yearly.amount).toBe(89); expect(PRICES.yearly.currency).toBe('EUR'); });
  it('diagnostic contains 6 questions', () => expect(DIAGNOSTIC_LENGTH).toBe(6));
  it('an equation error identifies algebra as the prerequisite', () => expect(analyze([{ notion: 'equations', qIndex: 0, correct: false }], 3).lacuna).toBe('algebra'));
  it('adaptive questions become harder after success', () => expect(nextIndex(diagnosticPath(3), 1, true)).toBe(2));
  it('mock exams are graded out of 20', () => { expect(gradeOn20(3, 5)).toBe(12); expect(gradeOn20(5, 5)).toBe(20); expect(gradeOn20(0, 5)).toBe(0); });
});