// Devoirs : des compétences de parcours assignées par le professeur à sa classe, avec une date limite.
// Logique pure (dates, avancement) ; les accès sont dans src/lib/teacher.functions.ts.
import { getSkill, skillStatus, type Skill } from './skills';

export type Assignment = { id: string; title: string; skill_ids: string[]; due_date: string; created_at?: string; class_name?: string };
type SkillAttempt = Parameters<typeof skillStatus>[0][number];

const DAY = 86400000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
export const todayIso = (now = Date.now()) => iso(now);
export const addDays = (day: string, n: number) => iso(Date.parse(`${day}T00:00:00Z`) + n * DAY);

/** Une vraie date AAAA-MM-JJ, d'hier (fuseaux) à un an. */
export function validDueDate(day: string, now = Date.now()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const t = Date.parse(`${day}T00:00:00Z`);
  if (Number.isNaN(t) || iso(t) !== day) return false;
  const today = Date.parse(`${todayIso(now)}T00:00:00Z`);
  return t >= today - DAY && t <= today + 366 * DAY;
}

/** Compétences connues, sans doublon, dans l'ordre donné. */
export const knownSkills = (ids: string[]): Skill[] => [...new Set(ids)].map(getSkill).filter((s): s is Skill => s !== null);

export function assignmentProgress(attempts: SkillAttempt[], a: Pick<Assignment, 'skill_ids'>) {
  const skills = knownSkills(a.skill_ids);
  const done = skills.filter(s => skillStatus(attempts, s.id) === 'mastered').length;
  const started = skills.some(s => skillStatus(attempts, s.id) !== 'todo');
  return { done, total: skills.length, complete: skills.length > 0 && done === skills.length, started };
}

/** Jours restants (négatif : en retard). */
export const daysLeft = (due: string, now = Date.now()) => Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${todayIso(now)}T00:00:00Z`)) / DAY);

/** Les devoirs à afficher à l'élève : pas plus de 7 jours de retard, le plus urgent d'abord ; les terminés ensuite. */
export function visibleAssignments<T extends Assignment>(list: T[], attempts: SkillAttempt[], now = Date.now()): T[] {
  return list.filter(a => daysLeft(a.due_date, now) >= -7 && knownSkills(a.skill_ids).length > 0)
    .sort((x, y) => Number(assignmentProgress(attempts, x).complete) - Number(assignmentProgress(attempts, y).complete) || x.due_date.localeCompare(y.due_date));
}

/** La compétence à travailler dans un devoir : à revoir d'abord, sinon la première non acquise. */
export function assignmentNext(attempts: SkillAttempt[], a: Pick<Assignment, 'skill_ids'>): Skill | null {
  const skills = knownSkills(a.skill_ids);
  return skills.find(s => skillStatus(attempts, s.id) === 'review') ?? skills.find(s => skillStatus(attempts, s.id) !== 'mastered') ?? null;
}
