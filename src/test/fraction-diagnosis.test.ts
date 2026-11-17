import { describe, expect, it } from 'vitest';
import { analyzeFractionResponse, normalizeFraction, parseFractionAnswer } from '@/lib/fraction-diagnosis';

describe('Fraction diagnosis', () => {
  it('parses and reduces fraction, integer and decimal answers safely', () => {
    expect(parseFractionAnswer('6/8')).toEqual({ n: 3, d: 4 });
    expect(parseFractionAnswer('-1,25')).toEqual({ n: -5, d: 4 });
    expect(parseFractionAnswer('2')).toEqual({ n: 2, d: 1 });
    expect(parseFractionAnswer('1/0')).toBeNull();
    expect(parseFractionAnswer('1/2+1/4')).toBeNull();
    expect(() => normalizeFraction({ n: 1, d: 0 })).toThrow();
  });

  it('detects the classic addition of denominators with explicit evidence', () => {
    const result = analyzeFractionResponse({
      kind: 'add', left: { n: 1, d: 2 }, right: { n: 1, d: 3 },
    }, '2/5');
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe('fraction-add-denominators');
    expect(result.confidence).toBe('medium');
    expect(result.confirmed).toBe(false);
    expect(result.remediation).toBe('visualise-parts');
  });

  it('does not diagnose a misconception from an arbitrary wrong comparison', () => {
    const result = analyzeFractionResponse({
      kind: 'compare', left: { n: 2, d: 3 }, right: { n: 3, d: 5 }, relation: '>',
    }, '<');
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe('unknown');
    expect(result.confirmed).toBe(false);
  });

  it('does not crash when diagnosing a wrong subtraction with equal denominators', () => {
    const result = analyzeFractionResponse({
      kind: 'subtract', left: { n: 3, d: 4 }, right: { n: 1, d: 4 },
    }, '2/8');
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe('fraction-add-denominators');
  });

  it('accepts equivalent forms and handles subtraction and multiplication', () => {
    expect(analyzeFractionResponse({
      kind: 'add', left: { n: 1, d: 2 }, right: { n: 1, d: 4 },
    }, '6/8').correct).toBe(true);
    expect(analyzeFractionResponse({
      kind: 'subtract', left: { n: 3, d: 4 }, right: { n: 1, d: 4 },
    }, '1/2').correct).toBe(true);
    expect(analyzeFractionResponse({
      kind: 'multiply', left: { n: 2, d: 3 }, right: { n: 3, d: 4 },
    }, '1/2').correct).toBe(true);
  });

  it('detects multiplying by the divisor instead of its reciprocal', () => {
    const result = analyzeFractionResponse({
      kind: 'divide', left: { n: 2, d: 3 }, right: { n: 3, d: 4 },
    }, '1/2');
    expect(result.correct).toBe(false);
    expect(result.misconception).toBe('fraction-divide-by-multiplying');
    expect(result.confirmed).toBe(false);
  });

  it('never confirms a misconception from one attempt', () => {
    const result = analyzeFractionResponse({
      kind: 'simplify', value: { n: 6, d: 8 }, expected: { n: 3, d: 4 },
    }, '3/8');
    expect(result.misconception).toBe('fraction-simplify-one-term');
    expect(result.confirmed).toBe(false);
  });
});
