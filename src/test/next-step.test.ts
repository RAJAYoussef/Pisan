import { describe, expect, it } from 'vitest';
import { MASTERED, nextChapter, notionToPractise, studyChapters } from '@/lib/next-step';
import { chaptersForLevel } from '@/lib/curriculum';
import { programmeFor } from '@/lib/programmes';
import { emptyProgress, type Attempt, type Progress } from '@/lib/pisan';

const at = (notion: Attempt['notion'], correct: number, total: number, kind: Attempt['kind'] = 'exam'): Attempt => ({ kind, notion, correct, total, date: '2026-11-16T10:00:00Z', minutes: 5 });
const progress = (...attempts: Attempt[]): Progress => ({ attempts, unlocked: [] });
const ma3 = programmeFor('ma', 2)!;

describe('Ton prochain petit pas', () => {
  it('uses the official chapters of the programme, in order', () => {
    const chapters = studyChapters(ma3, [], emptyProgress);
    expect(chapters.map(c => c.title.fr)).toEqual(ma3.chapters.map(c => c.title.fr));
    expect(chapters.every(c => !c.started && c.mastery === 0)).toBe(true);
  });
  it('falls back to one chapter per notion without a programme', () => {
    const fallback = chaptersForLevel(0);
    expect(studyChapters(null, fallback, emptyProgress).map(c => c.notions)).toEqual(fallback.map(n => [n.id]));
  });
  it('starts with the first chapter for a new student', () => {
    expect(nextChapter(studyChapters(ma3, [], emptyProgress))?.index).toBe(0);
  });
  it('resumes a chapter that is started but not mastered, before any new one', () => {
    const p = progress(at('algebra', 5, 5), at('square-roots', 2, 5));
    const next = nextChapter(studyChapters(ma3, [], p))!;
    expect(next.title.fr).toBe('Racines carrées');
    expect(next.started).toBe(true);
    expect(next.mastery).toBeLessThan(MASTERED);
  });
  it('moves to the first chapter not started once the started ones are mastered', () => {
    const p = progress(at('algebra', 5, 5), at('square-roots', 5, 5));
    expect(nextChapter(studyChapters(ma3, [], p))?.title.fr).toBe('Puissances');
  });
  it('goes back to the weakest chapter when everything has been started', () => {
    const notions = ma3.chapters.flatMap(c => c.notions);
    const p = progress(...notions.map(n => at(n, 5, 5)), at('trigonometry', 0, 5), at('trigonometry', 0, 5));
    expect(nextChapter(studyChapters(ma3, [], p))?.notions).toContain('trigonometry');
  });
  it('returns nothing when there are no chapters', () => expect(nextChapter([])).toBeNull());
  it('practises the weakest notion of a multi-notion chapter', () => {
    const chapter = studyChapters(ma3, [], emptyProgress).find(c => c.notions.length > 1)!;
    const [a, b] = chapter.notions as [Attempt['notion'], Attempt['notion']];
    expect(notionToPractise(chapter, progress(at(a, 5, 5), at(b, 1, 5)))).toBe(b);
    expect(notionToPractise(chapter, emptyProgress)).toBe(a);
  });
});

describe('Chapitres avec parcours de compétences', () => {
  it('a chapter is not « maîtrisé » while its skills are not mastered', async () => {
    const { studyChapters, MASTERED } = await import('@/lib/next-step');
    const { programmeFor } = await import('@/lib/programmes');
    const at = (skill: string, correct: number, total: number) => ({ kind: 'workshop' as const, notion: 'vectors' as const, skill, correct, total, date: '2026-11-01T10:00:00Z', minutes: 5 });
    const progress = { unlocked: [], attempts: [at('vec-characterise', 4, 4), at('vec-translation', 3, 3)] };
    const vectors = studyChapters(programmeFor('ma', 2), [], progress).find(c => c.title.fr === 'Vecteurs et translation')!;
    expect(vectors.mastery).toBe(40); // 2 compétences sur 5, même si toutes les réponses sont justes
    expect(vectors.mastery).toBeLessThan(MASTERED);
    const algebra = studyChapters(programmeFor('ma', 2), [], { unlocked: [], attempts: [{ ...at('x', 5, 5), notion: 'algebra' as const, kind: 'exam' as const, skill: undefined }] }).find(c => c.notions.includes('algebra'))!;
    expect(algebra.mastery).toBe(100); // sans parcours : la maîtrise reste celle des notions
  });
});
