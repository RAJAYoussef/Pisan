import type { Lang } from './i18n';
import type { NotionId } from './curriculum';

export type Profile = { nickname: string; country: string; grade: number; lang: Lang };
export type Attempt = { kind: 'diagnostic' | 'workshop' | 'exam' | 'consolidation'; notion: NotionId; correct: number; total: number; date: string; minutes: number };
export type Progress = { attempts: Attempt[]; unlocked: NotionId[] };
export type LearningSession = { profile: Profile; progress: Progress; partner: boolean; usage_count: number; usage_date: string };
export const emptyProgress: Progress = { attempts: [], unlocked: [] };
export const gradeOn20 = (correct: number, total: number) => total > 0 ? Math.round(correct / total * 20) : 0;
export const mastery = (progress: Progress, notion: NotionId) => {
  const attempts = progress.attempts.filter(a => a.notion === notion);
  const total = attempts.reduce((s, a) => s + a.total, 0);
  return total ? Math.round(attempts.reduce((s, a) => s + a.correct, 0) / total * 100) : 0;
};
export const say = (lang: Lang, fr: string, en: string, ar: string, es: string) => ({ fr, en, ar, es })[lang];