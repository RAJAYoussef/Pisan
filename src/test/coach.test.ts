import { describe, expect, it } from 'vitest';
import { coachSystemPrompt, trimHistory, westernDigits, COACH_DAILY_LIMIT } from '@/lib/coach';

const ctx = { activity: 'exam' as const, statement: '2x + 3 = 11', notion: 'Équations', dys: false };
describe('coach Pi', () => {
  it('limite à 20 messages par jour', () => expect(COACH_DAILY_LIMIT).toBe(20));
  it('interdit de donner la réponse finale', () => expect(coachSystemPrompt({ country: 'fr', grade: 0, lang: 'fr' }, ctx)).toMatch(/JAMAIS la réponse finale/));
  it('impose les chiffres 0-9 en arabe', () => {
    expect(coachSystemPrompt({ country: 'ma', grade: 0, lang: 'ar' }, ctx)).toMatch(/0-9/);
    expect(westernDigits('x = ٤٢')).toBe('x = 42');
  });
  it('une idée par message en mode DYS', () => expect(coachSystemPrompt({ country: 'fr', grade: 0, lang: 'fr' }, { ...ctx, dys: true })).toMatch(/une seule idée/));
  it('garde au plus 12 messages', () => expect(trimHistory(Array.from({ length: 30 }, () => ({ role: 'user' as const, content: 'a' }))).length).toBe(12));
});
