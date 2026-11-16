// Défi du jour : une question par jour, la même pour tous les élèves d'un même programme.
// Pur et déterministe (date + notions du programme). Couvert par src/test/streak-challenge.test.ts.
import { chaptersForLevel, getLevel, type Notion, type NotionId, type Question } from './curriculum';
import { programmeFor, programmeNotions } from './programmes';
import { checkFreeAnswer, freeAnswer } from './answer-check';

export const CHALLENGE_STARS = 5;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function challengeNotions(country: string, grade: number, track?: string): Notion[] {
  const programme = programmeFor(country, grade, track);
  const list = programme ? programmeNotions(programme) : chaptersForLevel(getLevel(country, grade));
  return list.filter(n => n.questions.length > 0);
}

export type Challenge = { notion: NotionId; index: number; question: Question };

export function dailyChallenge(day: string, notions: Notion[]): Challenge | null {
  if (!notions.length) return null;
  const h = hash(`${day}|${notions.map(n => n.id).join(',')}`);
  const notion = notions[h % notions.length]!;
  const index = Math.floor(h / notions.length) % notion.questions.length;
  return { notion: notion.id, index, question: notion.questions[index]! };
}

/** Correction côté serveur : index de QCM ou réponse tapée. */
export function checkChallenge(question: Question, answer: { choice?: number | undefined; text?: string | undefined }): boolean {
  if (typeof answer.text === 'string' && answer.text.trim()) return freeAnswer(question) !== null && checkFreeAnswer(question, answer.text);
  return answer.choice === question.answer;
}
