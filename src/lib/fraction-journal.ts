import { z } from 'zod';

export const FRACTION_JOURNAL_EVENT_TYPES = [
  'manipulation', 'answer', 'verification', 'self_correction',
  'hypothesis', 'diagnostic', 'transfer', 'remediation',
] as const;

export type FractionJournalEventType = typeof FRACTION_JOURNAL_EVENT_TYPES[number];
export type FractionJournalEvidenceStatus = 'unverified_client_input' | 'server_verified';

/**
 * Canonical event contract. Client timestamps and payloads describe what the
 * browser reports; they are never authoritative evidence of mastery.
 */
export type FractionJournalEvent = {
  eventId: string;
  activityId: string;
  skillId: string;
  type: FractionJournalEventType;
  payload: Record<string, unknown>;
  clientOccurredAt?: string;
};

export type FractionJournalEntry = FractionJournalEvent & {
  evidenceStatus: FractionJournalEvidenceStatus;
  recordedAt: string;
};

export function createFractionJournalEvent(
  input: Omit<FractionJournalEvent, 'eventId'>,
): FractionJournalEvent {
  return { ...input, eventId: crypto.randomUUID() };
}

export function classifyFractionJournalEvent(type: FractionJournalEventType): FractionJournalEvidenceStatus {
  // No event currently qualifies as server-verified. That requires a
  // server-issued exercise instance and deterministic server-side correction.
  void type;
  return 'unverified_client_input';
}
