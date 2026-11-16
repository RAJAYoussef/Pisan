import { describe, expect, it } from 'vitest';
import { isTimeZone, localDay, nextStreak, visibleStreak } from '@/lib/plan';
import { challengeNotions, checkChallenge, dailyChallenge } from '@/lib/challenge';

describe('Flamme', () => {
  it('a consecutive day extends the streak', () => {
    expect(nextStreak({ count: 3, lastDay: '2026-11-15', freezes: 0 }, '2026-11-16')).toMatchObject({ count: 4, restarted: false, usedFreeze: false });
  });
  it('the same day does not count twice', () => {
    expect(nextStreak({ count: 3, lastDay: '2026-11-16' }, '2026-11-16').count).toBe(3);
  });
  it('one missed day uses a freeze and continues', () => {
    expect(nextStreak({ count: 5, lastDay: '2026-11-14', freezes: 1 }, '2026-11-16')).toMatchObject({ count: 6, freezes: 0, usedFreeze: true, restarted: false });
  });
  it('one missed day without freeze restarts at 1', () => {
    expect(nextStreak({ count: 5, lastDay: '2026-11-14', freezes: 0 }, '2026-11-16')).toMatchObject({ count: 1, restarted: true });
  });
  it('two missed days restart at 1 even with freezes', () => {
    expect(nextStreak({ count: 9, lastDay: '2026-11-13', freezes: 2 }, '2026-11-16')).toMatchObject({ count: 1, freezes: 2, restarted: true, usedFreeze: false });
  });
  it('every 7 days earns a freeze, at most 2', () => {
    expect(nextStreak({ count: 6, lastDay: '2026-11-15', freezes: 0 }, '2026-11-16').freezes).toBe(1);
    expect(nextStreak({ count: 13, lastDay: '2026-11-15', freezes: 2 }, '2026-11-16').freezes).toBe(2);
  });
  it('shows 0 once the streak is broken, without changing it', () => {
    expect(visibleStreak({ count: 4, lastDay: '2026-11-13', freezes: 1 }, '2026-11-16')).toBe(0);
    expect(visibleStreak({ count: 4, lastDay: '2026-11-14', freezes: 1 }, '2026-11-16')).toBe(4);
  });
});

describe('Local day', () => {
  const at = new Date('2026-11-16T22:30:00Z');
  it('Casablanca and Paris (UTC+1 in November) switch day at local midnight, not server midnight', () => {
    expect(localDay(at, 'Africa/Casablanca')).toBe('2026-11-16');
    expect(localDay(at, 'Europe/Paris')).toBe('2026-11-16');
    expect(localDay(at, 'UTC')).toBe('2026-11-16');
    expect(localDay(new Date('2026-11-16T23:30:00Z'), 'Europe/Paris')).toBe('2026-11-17');
    expect(localDay(new Date('2026-11-16T23:30:00Z'), 'Africa/Casablanca')).toBe('2026-11-17');
    expect(localDay(new Date('2026-11-16T23:30:00Z'), 'UTC')).toBe('2026-11-16');
  });
  it('La Réunion (UTC+4) is already tomorrow', () => {
    expect(localDay(new Date('2026-11-16T20:30:00Z'), 'Indian/Reunion')).toBe('2026-11-17');
  });
  it('changing time zone changes the counted day', () => {
    const t = new Date('2026-11-16T21:00:00Z');
    const casa = localDay(t, 'Africa/Casablanca'), reunion = localDay(t, 'Indian/Reunion');
    expect(casa).not.toBe(reunion);
    expect(nextStreak({ count: 2, lastDay: casa }, reunion).count).toBe(3);
  });
  it('rejects unknown time zones', () => {
    expect(isTimeZone('Europe/Paris')).toBe(true);
    expect(isTimeZone('Mars/Olympus')).toBe(false);
    expect(isTimeZone('../../etc')).toBe(false);
  });
});

describe('Défi du jour', () => {
  it('two students of the same programme get the same challenge', () => {
    const a = dailyChallenge('2026-11-16', challengeNotions('ma', 3));
    const b = dailyChallenge('2026-11-16', challengeNotions('ma', 3));
    expect(a).not.toBeNull();
    expect(b).toEqual(a);
  });
  it('the challenge comes from the programme notions', () => {
    const notions = challengeNotions('fr', 2);
    expect(notions.map(n => n.id)).toContain(dailyChallenge('2026-11-20', notions)!.notion);
  });
  it('is checked against the right option', () => {
    const c = dailyChallenge('2026-11-16', challengeNotions('ma', 3))!;
    expect(checkChallenge(c.question, { choice: c.question.answer })).toBe(true);
    expect(checkChallenge(c.question, { choice: (c.question.answer + 1) % c.question.options.length })).toBe(false);
  });
});
