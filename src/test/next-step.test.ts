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
