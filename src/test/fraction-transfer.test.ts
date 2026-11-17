import { describe, expect, it } from 'vitest';
import { buildFractionTransferTask, evaluateFractionTransfer } from '@/lib/fraction-transfer';

describe('Fraction transfer challenge', () => {
  it('uses a new equivalent-fraction context and distinguishes a repeated one-term error', () => {
    for (const seed of [0, 1, 2]) {
      const task = buildFractionTransferTask('fraction-scale-one-term', seed);
      expect(task.options).toHaveLength(3);
      expect(task.options.some(option => option.value === task.correctValue)).toBe(true);
      expect(evaluateFractionTransfer(task, task.correctValue)).toBe('transfer-success');
      expect(evaluateFractionTransfer(task, task.errorValues[0]!)).toBe('error-reproduced');
      expect(evaluateFractionTransfer(task, '0/1')).toBe('other-error');
    }
  });

  it('uses a new addition context and detects when only one addend is counted', () => {
    for (const seed of [0, 1, 2]) {
      const task = buildFractionTransferTask('fraction-count-one-addend', seed);
      expect(task.options).toHaveLength(3);
      expect(task.options.some(option => option.value === task.correctValue)).toBe(true);
      expect(evaluateFractionTransfer(task, task.correctValue)).toBe('transfer-success');
      expect(evaluateFractionTransfer(task, task.errorValues[0]!)).toBe('error-reproduced');
      expect(evaluateFractionTransfer(task, '0/1')).toBe('other-error');
    }
  });

  it('is deterministic for a given hypothesis and seed', () => {
    expect(buildFractionTransferTask('fraction-scale-one-term', 42))
      .toEqual(buildFractionTransferTask('fraction-scale-one-term', 42));
  });
});
