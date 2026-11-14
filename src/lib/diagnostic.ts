import { NOTIONS, lacunaFor, type Notion, type NotionId, type Question } from "./curriculum";

export const DIAGNOSTIC_LENGTH = 6;

export type DiagAnswer = { notion: NotionId; qIndex: number; correct: boolean };

/** Notions the adaptive test can visit: up to one step above the student's level. */
export function diagnosticPath(level: number): Notion[] {
  return NOTIONS.filter((n) => n.minLevel <= Math.min(6, level + 1));
}

export function startIndex(path: Notion[], level: number): number {
  let idx = 0;
  path.forEach((n, i) => {
    if (n.minLevel <= level) idx = i;
  });
  return Math.max(0, idx - 1);
}

/** Adaptive step: correct → harder notion, wrong → easier notion. */
export function nextIndex(path: Notion[], idx: number, correct: boolean): number {
  return correct ? Math.min(path.length - 1, idx + 1) : Math.max(0, idx - 1);
}

/** Finds an unused question, starting at `idx` and spreading outwards. */
export function pickQuestion(
  path: Notion[],
  idx: number,
  asked: DiagAnswer[],
): { idx: number; notion: Notion; qIndex: number; question: Question } | null {
  const order = [idx];
  for (let d = 1; d < path.length; d++) {
    if (idx - d >= 0) order.push(idx - d);
    if (idx + d < path.length) order.push(idx + d);
  }
  for (const i of order) {
    const n = path[i];
    const q = n.questions.findIndex(
      (_, qi) => !asked.some((a) => a.notion === n.id && a.qIndex === qi),
    );
    if (q >= 0) return { idx: i, notion: n, qIndex: q, question: n.questions[q] };
  }
  return null;
}

export type DiagAnalysis = {
  score: number;
  failed: NotionId[];
  /** The notion at the student's level that went wrong, if any. */
  target: NotionId | null;
  /** The underlying prerequisite to repair. */
  lacuna: NotionId | null;
};

export function analyze(answers: DiagAnswer[], level: number): DiagAnalysis {
  const failed = Array.from(new Set(answers.filter((a) => !a.correct).map((a) => a.notion)));
  const score = answers.filter((a) => a.correct).length;
  if (failed.length === 0) return { score, failed, target: null, lacuna: null };
  const byLevel = failed
    .map((id) => NOTIONS.find((n) => n.id === id)!)
    .sort((a, b) => b.minLevel - a.minLevel);
  const atLevel = byLevel.find((n) => n.minLevel <= level) ?? byLevel[0];
  return { score, failed, target: atLevel.id, lacuna: lacunaFor(atLevel.id) };
}
