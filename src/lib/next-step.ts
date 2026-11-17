// « Ton prochain petit pas » : le chapitre à reprendre et la notion à travailler.
// Pur, couvert par src/test/next-step.test.ts.
import type { L, Notion, NotionId } from './curriculum';
import { mastery, type Progress } from './pisan';
import type { Programme } from './programmes';
import { chapterSkillKinds } from './figures';
import { skillsFor, skillStatus } from './skills';

export type StudyChapter = { index: number; title: L; notions: NotionId[]; mastery: number; started: boolean };
export const MASTERED = 80;

/** Les chapitres de l'élève : ceux de son programme officiel, sinon une notion = un chapitre. */
export function studyChapters(programme: Programme | null | undefined, fallback: Notion[], progress: Progress): StudyChapter[] {
  const raw = programme ? programme.chapters.map(c => ({ title: c.title, notions: c.notions })) : fallback.map(n => ({ title: n.name, notions: [n.id] }));
  return raw.map((c, index) => {
    const byNotion = Math.round(c.notions.reduce((sum, id) => sum + mastery(progress, id), 0) / c.notions.length);
    return { index, title: c.title, notions: c.notions, mastery: Math.min(byNotion, skillCap(c, progress) ?? 100), started: progress.attempts.some(a => c.notions.includes(a.notion)) };
  });
}

/**
 * Un chapitre qui a un parcours de compétences n'est pas maîtrisé tant que ses compétences ne sont pas acquises :
 * dès qu'une compétence est tentée, la maîtrise est plafonnée à la part de compétences acquises (cohérent avec l'atelier).
 */
function skillCap(chapter: { title: L; notions: NotionId[] }, progress: Progress): number | null {
  const skills = chapterSkillKinds(chapter).flatMap(skillsFor);
  if (!skills.some(s => progress.attempts.some(a => a.skill === s.id))) return null;
  return Math.round((100 * skills.filter(s => skillStatus(progress.attempts, s.id) === 'mastered').length) / skills.length);
}

/** Le chapitre à reprendre : le premier commencé mais pas maîtrisé, sinon le premier pas encore commencé, sinon le plus fragile. */
export function nextChapter(chapters: StudyChapter[]): StudyChapter | null {
  if (!chapters.length) return null;
  return chapters.find(c => c.started && c.mastery < MASTERED)
    ?? chapters.find(c => !c.started)
    ?? [...chapters].sort((a, b) => a.mastery - b.mastery)[0]!;
}

/** Dans un chapitre, la notion à travailler : la moins maîtrisée (la première en cas d'égalité). */
export function notionToPractise(chapter: StudyChapter, progress: Progress): NotionId {
  return [...chapter.notions].sort((a, b) => mastery(progress, a) - mastery(progress, b))[0]!;
}
