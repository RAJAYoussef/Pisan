import { describe, expect, it, vi, beforeEach } from 'vitest';
import { acceptDay, resolveTimeZone, localDay } from '@/lib/plan';

type Row = { profile: Record<string, unknown>; progress: { attempts: unknown[]; unlocked: string[] }; challenge_day: string | null; streak_last_day: string | null; timezone_changed_at: string | null };
const db = vi.hoisted(() => ({ row: null as unknown as Row, quotaCalls: 0, lock: Promise.resolve() as Promise<unknown> }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock('@/integrations/supabase/client.server', async () => {
  const plan = await import('@/lib/plan');
  const chain: Record<string, unknown> = {};
  Object.assign(chain, { select: () => chain, eq: () => chain, ilike: () => chain, maybeSingle: async () => ({ data: db.row, error: null }), single: async () => ({ data: db.row, error: null }),
    upsert: (u: Record<string, unknown>) => { Object.assign(db.row, u); return chain; } });
  // Each rpc mirrors its SQL function; append_pisan_attempt runs under a row lock (serialized), reading the row only once it holds the lock.
  const locked = <T,>(fn: () => Promise<T>) => { const run = db.lock.then(fn); db.lock = run.catch(() => {}); return run; };
  return { supabaseAdmin: { from: () => chain, rpc: (name: string, a: { p_day: string; p_attempt?: unknown }) => locked(async () => {
    await new Promise(r => setTimeout(r, 5));
    if (name === 'claim_pisan_challenge') { if (!plan.acceptDay(db.row.challenge_day, a.p_day, new Date())) return { data: false, error: null }; db.row.challenge_day = a.p_day; return { data: true, error: null }; }
    if (name === 'append_pisan_attempt') {
      const attempts = [...db.row.progress.attempts, a.p_attempt].slice(-500); db.row.progress = { ...db.row.progress, attempts };
      if (plan.acceptDay(db.row.streak_last_day, a.p_day, new Date())) db.row.streak_last_day = a.p_day;
      return { data: { progress: db.row.progress, streak: { count: 1, last_day: db.row.streak_last_day, freezes: 0, used_freeze: false, restarted: false } }, error: null };
    }
    if (name === 'consume_pisan_exercise') db.quotaCalls++;
    return { data: null, error: null };
  }) } };
});
import { answerChallenge, openSession, saveAttempt } from '@/lib/session.functions';
const answer = answerChallenge as unknown as (i: { data: Record<string, unknown> }) => Promise<{ status: string; streak?: { count: number } }>;
const open = openSession as unknown as (i: { data: Record<string, unknown> }) => Promise<unknown>;
const save = saveAttempt as unknown as (i: { data: Record<string, unknown> }) => Promise<{ progress: { attempts: unknown[] } }>;
const token = 'a'.repeat(64);
const base = { nickname: 'A', country: 'ma', grade: 3, lang: 'fr' };

beforeEach(() => { db.quotaCalls = 0; db.row = { profile: { ...base, timezone: 'Pacific/Kiritimati' }, progress: { attempts: [], unlocked: [] }, challenge_day: null, streak_last_day: null, timezone_changed_at: null }; });

describe('Défi du jour côté serveur', () => {
  it('cannot be replayed the same day, counts for the streak, and does not use the exercise quota', async () => {
    expect((await answer({ data: { token, choice: 0 } })).status).toBe('done');
    expect((await answer({ data: { token, choice: 1 } })).status).toBe('already');
    expect(db.quotaCalls).toBe(0);
  });

  it('alternating two time zones does not allow replaying the challenge', async () => {
    // UTC+14 then UTC-11: the second zone is a calendar day behind, so its "today" is not after the claimed day.
    expect((await answer({ data: { token, choice: 0 } })).status).toBe('done');
    await open({ data: { token, profile: { ...base, timezone: 'Pacific/Pago_Pago' } } });
    expect(db.row.profile.timezone).toBe('Pacific/Pago_Pago');
    expect((await answer({ data: { token, choice: 1 } })).status).toBe('already');
    await open({ data: { token, profile: { ...base, timezone: 'Pacific/Kiritimati' } } });
    expect(db.row.profile.timezone).toBe('Pacific/Pago_Pago'); // second change within 7 days refused
    expect((await answer({ data: { token, choice: 1 } })).status).toBe('already');
  });

  it('two simultaneous saves keep both attempts', async () => {
    const attempt = (n: number) => ({ kind: 'workshop', notion: 'fractions', correct: n, total: 5, date: 'x', minutes: 1 });
    await Promise.all([save({ data: { token, attempt: attempt(1) } }), save({ data: { token, attempt: attempt(2) } })]);
    expect(db.row.progress.attempts).toHaveLength(2);
  });
});

describe('Règles de jour et de fuseau', () => {
  const now = new Date('2026-11-16T20:00:00Z');
  it('refuses a day equal to or before the last one, or more than one day ahead of UTC', () => {
    expect(acceptDay('2026-11-16', '2026-11-16', now)).toBe(false);
    expect(acceptDay('2026-11-16', '2026-11-15', now)).toBe(false);
    expect(acceptDay('2026-11-15', '2026-11-18', now)).toBe(false);
    expect(acceptDay('2026-11-16', '2026-11-17', now)).toBe(true);
  });
  it('accepts at most one time zone change per 7 days', () => {
    expect(resolveTimeZone('Europe/Paris', 'Asia/Tokyo', '2026-11-12T00:00:00Z', now).timezone).toBe('Europe/Paris');
    expect(resolveTimeZone('Europe/Paris', 'Asia/Tokyo', '2026-11-08T00:00:00Z', now).timezone).toBe('Asia/Tokyo');
    expect(localDay(now, 'Pacific/Kiritimati')).toBe('2026-11-17');
  });
});
