// Devoirs : des compétences de parcours (ou un mini-contrôle sur ces compétences) assignées par le professeur
// à toute sa classe ou à certains élèves, avec une date limite.
// Logique pure (dates, avancement) ; les accès sont dans src/lib/teacher.functions.ts.
import { getSkill, skillStatus, type Skill } from './skills';

/** « skills » : faire les parcours jusqu'à les acquérir ; « review » : un mini-contrôle sur ces compétences. */
export type AssignmentKind = 'skills' | 'review';
export type Assignment = { id: string; title: string; skill_ids: string[]; due_date: string; created_at?: string; class_name?: string; kind?: AssignmentKind; member_ids?: string[] | null };
/** Un mini-contrôle porte sur 4 compétences au plus à la fois (limite du serveur) : les suivantes viennent ensuite. */
export const REVIEW_BATCH = 4;
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

/** Une compétence a-t-elle été passée en mini-contrôle depuis la création du devoir ? (réussi ou non : l'enseignant voit le résultat) */
export function reviewedSince(attempts: SkillAttempt[], skillId: string, since?: string): boolean {
  const from = since ? Date.parse(since) : 0;
  return attempts.some(a => a.skill === skillId && a.review === true && Date.parse(a.date) >= from);
}

export function assignmentProgress(attempts: SkillAttempt[], a: Pick<Assignment, 'skill_ids' | 'kind' | 'created_at'>) {
  const skills = knownSkills(a.skill_ids);
  const done = a.kind === 'review'
    ? skills.filter(s => reviewedSince(attempts, s.id, a.created_at)).length
    : skills.filter(s => skillStatus(attempts, s.id) === 'mastered').length;
  const started = a.kind === 'review' ? done > 0 : skills.some(s => skillStatus(attempts, s.id) !== 'todo');
  return { done, total: skills.length, complete: skills.length > 0 && done === skills.length, started };
}

/** Ce que l'élève ouvre en touchant le devoir : un parcours, ou le prochain mini-contrôle (4 compétences au plus). */
export function assignmentTarget(attempts: SkillAttempt[], a: Pick<Assignment, 'skill_ids' | 'kind' | 'created_at'>): { kind: 'skill'; skill: Skill } | { kind: 'review'; skills: Skill[] } | null {
  if (a.kind === 'review') {
    const left = knownSkills(a.skill_ids).filter(s => !reviewedSince(attempts, s.id, a.created_at)).slice(0, REVIEW_BATCH);
    return left.length ? { kind: 'review', skills: left } : null;
  }
  const skill = assignmentNext(attempts, a);
  return skill ? { kind: 'skill', skill } : null;
}

/** Le devoir concerne-t-il cet élève (toute la classe, ou il fait partie des élèves choisis) ? */
export const assignedTo = (a: Pick<Assignment, 'member_ids'>, memberId: string) => !a.member_ids || a.member_ids.includes(memberId);

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
