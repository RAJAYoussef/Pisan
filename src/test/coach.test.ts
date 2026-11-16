import { describe, expect, it } from 'vitest';
import { coachSystemPrompt, trimHistory, westernDigits, resolveCoachTarget, safeReply, leaksAnswer, COACH_DAILY_LIMIT, COACH_GLOBAL_DAILY_LIMIT, COACH_FALLBACK_HINT } from '@/lib/coach';
import { getNotion } from '@/lib/curriculum';
import { demonstrationsForLevel, exerciseById, generateAdaptedExercise } from '@/lib/exercises';

const ctx = { activity: 'workshop' as const, statement: '2x + 3 = 11', notion: 'Équations', dys: false };
describe('coach Pi', () => {
  it('limite à 20 messages par jour', () => expect(COACH_DAILY_LIMIT).toBe(20));
  it('limite globale de 2 000 messages par jour', () => expect(COACH_GLOBAL_DAILY_LIMIT).toBe(2000));
  it('interdit de donner la réponse finale', () => expect(coachSystemPrompt({ country: 'fr', grade: 0, lang: 'fr' }, ctx)).toMatch(/JAMAIS la réponse finale/));
  it('impose les chiffres 0-9 en arabe', () => {
    expect(coachSystemPrompt({ country: 'ma', grade: 0, lang: 'ar' }, ctx)).toMatch(/0-9/);
    expect(westernDigits('x = ٤٢')).toBe('x = 42');
  });
  it('une idée par message en mode DYS', () => expect(coachSystemPrompt({ country: 'fr', grade: 0, lang: 'fr' }, { ...ctx, dys: true })).toMatch(/une seule idée/));
  it('garde au plus 12 messages', () => expect(trimHistory(Array.from({ length: 30 }, () => ({ role: 'user' as const, content: 'a' }))).length).toBe(12));
});

describe('sécurité des réponses de Pi', () => {
  it('retrouve l’énoncé et la bonne option depuis la notion et l’index', () => {
    const q = getNotion('integers').questions[0]!;
    const target = resolveCoachTarget({ kind: 'question', notion: 'integers', index: 0 }, 'fr')!;
    expect(target.statement).toContain(q.expr);
    expect(target.answers).toContain(q.options[q.answer]);
  });
  it('refuse une notion ou un index inconnus', () => {
    expect(resolveCoachTarget({ kind: 'question', notion: 'hack', index: 0 }, 'fr')).toBeNull();
    expect(resolveCoachTarget({ kind: 'question', notion: 'integers', index: 49 }, 'fr')).toBeNull();
  });
  it('reconstruit les exercices de l’atelier côté serveur', async () => {
    const demo = demonstrationsForLevel(3)[0]!;
    expect(exerciseById(demo.id)?.answer).toBe(demo.answer);
    const gen = await generateAdaptedExercise({ level: 4, countryId: 'fr', lang: 'fr' }, 4242);
    expect(exerciseById(gen.id)?.answer).toBe(gen.answer);
  });
  it('remplace une réponse qui contient la bonne option mot pour mot', () => {
    expect(safeReply('La réponse est x = 4.', ['x = 4'], 'fr')).toBe(COACH_FALLBACK_HINT.fr);
    expect(safeReply('Bravo, c’est 35 €', ['35'], 'fr')).toBe('Essaie de refaire la première étape.');
    expect(leaksAnswer('Regarde la ligne 135', ['35'])).toBe(false);
    expect(safeReply('Que vaut une part ?', ['35'], 'fr')).toBe('Que vaut une part ?');
  });
});
