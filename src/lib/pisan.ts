import type { Lang } from './i18n';
import type { NotionId } from './curriculum';

export type Profile = { nickname: string; country: string; grade: number; lang: Lang; track?: string | undefined; timezone?: string | undefined };
export type Attempt = { kind: 'diagnostic' | 'workshop' | 'exam' | 'consolidation' | 'challenge'; notion: NotionId; correct: number; total: number; date: string; minutes: number };
export type Progress = { attempts: Attempt[]; unlocked: NotionId[] };
export type LearningSession = { profile: Profile; progress: Progress; partner: boolean; usage_count: number; usage_date: string; dys_default?: import('./dys').DysPrefs | null; dys_updated_at?: string | null; streak_count?: number; streak_last_day?: string | null; freezes?: number; challenge_day?: string | null; challenge_correct?: boolean | null };
export type StreakResult = { count: number; last_day: string; freezes: number; used_freeze: boolean; restarted: boolean };
export const emptyProgress: Progress = { attempts: [], unlocked: [] };
export const gradeOn20 = (correct: number, total: number) => total > 0 ? Math.round(correct / total * 20) : 0;
export const mastery = (progress: Progress, notion: NotionId) => {
  const attempts = progress.attempts.filter(a => a.notion === notion);
  const total = attempts.reduce((s, a) => s + a.total, 0);
  return total ? Math.round(attempts.reduce((s, a) => s + a.correct, 0) / total * 100) : 0;
};
export const say = (lang: Lang, fr: string, en: string, ar: string, es: string) => ({ fr, en, ar, es })[lang];