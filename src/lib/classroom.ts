import { mastery, type Profile, type Progress } from './pisan';
import { NOTIONS, type NotionId } from './curriculum';
import type { DysPrefs } from './dys';
export type ClassStudent = { id: string; profile: Profile; progress: Progress; last_active_at: string; dys_default: DysPrefs | null };
export const normalizeClassCode = (code: string) => code.trim().replace(/-/g, '').toUpperCase();
export const displayClassCode = (code: string) => `${code.slice(0, 2)}-${code.slice(2)}`;
export const masteryBand = (value: number) => value < 40 ? 'low' : value < 80 ? 'medium' : 'high';
export const isInactive = (last: string, now: number) => now - Date.parse(last) >= 3 * 86400000;
export const blockingNotions = (students: ClassStudent[]) => NOTIONS.map(n => ({ notion: n, count: students.filter(s => s.progress.attempts.some(a => a.notion === n.id) && mastery(s.progress, n.id) < 40).length })).filter(n => n.count >= 2);
const cell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" : '') + value.replace(/"/g, '""')}"`;
export function classCsv(students: ClassStudent[], notions: { id: NotionId; label: string }[], labels: { nickname: string; lastActive: string }) {
 return '\uFEFF' + [[labels.nickname, labels.lastActive, ...notions.map(n => n.label)], ...students.map(s => [s.profile.nickname, s.last_active_at, ...notions.map(n => String(mastery(s.progress, n.id)))])].map(row => row.map(cell).join(',')).join('\r\n');
}
