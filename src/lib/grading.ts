// Correction faite par le serveur : l'élève envoie ses réponses, jamais son score.
// Fonctions pures, partagées par les fonctions serveur (src/lib/grading.functions.ts) et les tests.
import { getLevel, getNotion, type Notion, type NotionId } from './curriculum';
import { analyze, diagnosticPath, DIAGNOSTIC_LENGTH, nextIndex, pickQuestion, startIndex, type DiagAnswer } from './diagnostic';
import { programmeFor, programmeNotions } from './programmes';
import type { Profile } from './pisan';

/** Contrôle blanc : un choix par question du chapitre, dans l'ordre. */
export function gradeExam(notion: NotionId, choices: number[]): { correct: number; total: number } | null {
  const questions = getNotion(notion).questions;
  if (choices.length !== questions.length) return null;
  return { correct: choices.filter((c, i) => c === questions[i]!.answer).length, total: questions.length };
}

/** Le programme de l'élève, tel que l'appli le calcule à partir de son profil. */
export function profileProgramme(profile: Pick<Profile, 'country' | 'grade'> & { track?: string | undefined }): { level: number; notions: Notion[] | undefined } {
  const programme = programmeFor(profile.country, profile.grade, profile.track);
  return { level: getLevel(profile.country, profile.grade), notions: programme ? programmeNotions(programme) : undefined };
}

/**
 * Diagnostic adaptatif rejoué : à partir des seuls choix de l'élève, on retrouve chaque question posée
 * (la suite est déterministe), on corrige, et on en déduit la notion à travailler.
 */
export function replayDiagnostic(level: number, notions: Notion[] | undefined, choices: number[]): { answers: DiagAnswer[]; correct: number; target: NotionId } | null {
  if (choices.length !== DIAGNOSTIC_LENGTH) return null;
  const path = diagnosticPath(level, notions);
  let idx = startIndex(path, level);
  const answers: DiagAnswer[] = [];
  for (const choice of choices) {
    const q = pickQuestion(path, idx, answers);
    if (!q) return null;
    const correct = choice === q.question.answer;
    answers.push({ notion: q.notion.id, qIndex: q.qIndex, correct });
    idx = nextIndex(path, q.idx, correct);
  }
  return { answers, correct: answers.filter(a => a.correct).length, target: analyze(answers, level).target ?? answers[answers.length - 1]!.notion };
}

/** Consolidation : les trois premières questions de la notion, toutes justes (l'élève réessaie jusqu'à trouver). */
export function consolidationOk(notion: NotionId, choices: number[]): { total: number } | null {
  const questions = getNotion(notion).questions.slice(0, 3);
  if (!questions.length || choices.length !== questions.length) return null;
  return choices.every((c, i) => c === questions[i]!.answer) ? { total: questions.length } : null;
}

/** Ce que les écrans de contrôle, de diagnostic et de consolidation appellent : le serveur corrige et enregistre. */
export type Grader = {
  exam: (notion: NotionId, choices: number[]) => Promise<void>;
  diagnostic: (choices: number[]) => Promise<void>;
  consolidation: (notion: NotionId, choices: number[]) => Promise<void>;
};
