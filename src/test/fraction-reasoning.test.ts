import { describe, expect, it } from 'vitest';
import {
  readFractionSequence,
  verifyFractionHypothesis,
  type FractionReasoningEvent,
} from '@/lib/fraction-reasoning';

const equivalenceEvent = (
  sequence: number,
  action: FractionReasoningEvent['action'],
  state: FractionReasoningEvent['state'],
): FractionReasoningEvent => ({
  widgetKind: 'fraction-equivalence',
  sequence,
  occurredAtClient: '2026-11-17T10:00:00.000Z',
  action,
  state,
  skillId: 'frac-equivalence-visual',
  activitySeed: 1234,
  stepIndex: 0,
  widget: { kind: 'fraction-equivalence', source: { n: 1, d: 2 }, factor: 2 },
});

describe('Fraction reasoning sequence reader', () => {
  it('separates observed facts from a low-confidence one-term scaling hypothesis', () => {
    const analysis = readFractionSequence([
      equivalenceEvent(1, 'part-toggled', { selectedParts: [0] }),
      equivalenceEvent(2, 'verified', { selectedParts: [0], correct: false }),
    ]);

    expect(analysis.observations.map(item => item.code)).toContain('verification-failed');
    expect(analysis.hypotheses).toHaveLength(1);
    expect(analysis.hypotheses[0]).toMatchObject({
      code: 'fraction-scale-one-term',
      level: 'hypothesis',
      confidence: 'low',
    });
    expect(analysis.diagnostic).toBeNull();
  });

  it('confirms a hypothesis only when both checks reproduce the targeted error', () => {
    const analysis = readFractionSequence([
      equivalenceEvent(1, 'verified', { selectedParts: [0], correct: false }),
    ]);
    const hypothesis = analysis.hypotheses[0]!;
    const pending = verifyFractionHypothesis(hypothesis, { 'scale-both-terms': 'bottom' });
    expect(pending.status).toBe('inconclusive');

    const confirmed = verifyFractionHypothesis(hypothesis, {
      'scale-both-terms': 'bottom',
      'scale-transfer': 'b',
    });
    expect(confirmed).toMatchObject({ level: 'diagnostic', status: 'confirmed', hypothesisCode: 'fraction-scale-one-term' });
  });

  it('rejects an unsupported hypothesis when a complementary check contradicts it', () => {
    const analysis = readFractionSequence([
      equivalenceEvent(1, 'verified', { selectedParts: [0], correct: false }),
    ]);
    const diagnostic = verifyFractionHypothesis(analysis.hypotheses[0]!, {
      'scale-both-terms': 'top',
      'scale-transfer': 'a',
    });
    expect(diagnostic.status).toBe('not-confirmed');
  });

  it('records self-correction only when a new manipulation occurs after failure', () => {
    const analysis = readFractionSequence([
      equivalenceEvent(1, 'verified', { selectedParts: [0], correct: false }),
      equivalenceEvent(2, 'part-toggled', { selectedParts: [0, 1] }),
      equivalenceEvent(3, 'verified', { selectedParts: [0, 1], correct: true }),
    ]);
    expect(analysis.observations.map(item => item.code)).toContain('self-correction');
    expect(analysis.observations.map(item => item.code)).toContain('verification-succeeded');
  });

  it('does not infer self-correction from repeated validation alone', () => {
    const analysis = readFractionSequence([
      equivalenceEvent(1, 'verified', { selectedParts: [0], correct: false }),
      equivalenceEvent(2, 'verified', { selectedParts: [0], correct: true }),
    ]);
    expect(analysis.observations.map(item => item.code)).not.toContain('self-correction');
  });
});
