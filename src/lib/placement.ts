// Tests de positionnement d'une classe : une version A (début d'année) et une version B (fin d'année) avec les
// MÊMES compétences et des questions équivalentes (même générateur, autres nombres), corrigées par le serveur.
// Pur : utilisé par src/lib/placement.functions.ts, les écrans, et src/test/placement.test.ts.
import { figuresFor, type FigureKind } from './figures';
import { getLevel } from './curriculum';
import { programmeFor, programmeNotions } from './programmes';
import { getSkill, reviewStep, skillsFor, type Skill, type Step } from './skills';
import { gradeStep, type StepAnswer } from './skill-session';

export type PlacementForm = 'A' | 'B';
export type PlacementItem = { skill: string; seed: number };
export type PlacementDetail = { skill: string; chapter: FigureKind; ok: boolean };
/** Deux questions par chapitre, 80 au plus (limite de la base). */
export const PER_CHAPTER = 2;
export const MAX_ITEMS = 80;

/** Les chapitres à parcours du programme de la classe (pays, niveau, filière). */
export function classKinds(country: string, grade: number, track?: string | null): FigureKind[] {
  const programme = programmeFor(country, grade, track ?? undefined);
  return programme ? figuresFor(programme, programmeNotions(programme).map(n => n.id), getLevel(country, grade)) : [];
}

/** Les compétences testées d'un chapitre : la première (la base) et une plus avancée. */
export function chapterProbe(kind: FigureKind): Skill[] {
  const skills = skillsFor(kind);
  if (skills.length <= PER_CHAPTER) return skills;
  return [skills[0]!, skills[Math.min(2, skills.length - 1)]!];
}

const randomSeed = () => 1 + Math.floor(Math.random() * 99999);

/** Version A : les compétences de chaque chapitre, avec des tirages fixés une fois pour toute la classe. */
export function buildItems(kinds: FigureKind[], seed: () => number = randomSeed): PlacementItem[] {
  return kinds.flatMap(chapterProbe).slice(0, MAX_ITEMS).map(s => ({ skill: s.id, seed: seed() }));
}
/** Version B : les mêmes compétences que A, dans le même ordre, avec d'autres nombres. */
export function parallelItems(a: PlacementItem[], seed: () => number = randomSeed): PlacementItem[] {
  return a.map(item => { let s = seed(); while (s === item.seed) s = seed(); return { skill: item.skill, seed: s }; });
}

/** Les questions (une étape représentative par compétence), sans les compétences inconnues. */
export function placementSteps(items: PlacementItem[]): { index: number; item: PlacementItem; skill: Skill; step: Step }[] {
  return items.flatMap((item, index) => { const skill = getSkill(item.skill); return skill ? [{ index, item, skill, step: reviewStep(skill, item.seed) }] : []; });
}

/** Correction : une réponse absente (« je ne sais pas ») compte faux. answers[i] répond à items[i]. */
export function gradePlacement(items: PlacementItem[], answers: (StepAnswer | null)[]): { correct: number; total: number; details: PlacementDetail[] } {
  const details = placementSteps(items).map(({ index, skill, step }) => ({ skill: skill.id, chapter: skill.chapter, ok: answers[index] ? gradeStep(step, answers[index]!) : false }));
  return { correct: details.filter(d => d.ok).length, total: details.length, details };
}

/** Réussite (en %) par chapitre. */
export function byChapter(details: PlacementDetail[]): Map<FigureKind, { ok: number; total: number }> {
  const m = new Map<FigureKind, { ok: number; total: number }>();
  for (const d of details) { const c = m.get(d.chapter) ?? { ok: 0, total: 0 }; c.total++; if (d.ok) c.ok++; m.set(d.chapter, c); }
  return m;
}
export const pct = (ok: number, total: number) => (total ? Math.round((ok / total) * 100) : 0);

/** Pour la classe : la moyenne par chapitre au test A et au test B (seuls les élèves qui ont passé ce test comptent). */
export function classChapterAverages(results: { details: PlacementDetail[] }[]): Map<FigureKind, number> {
  const sum = new Map<FigureKind, { ok: number; total: number }>();
  for (const r of results) for (const [k, v] of byChapter(r.details)) { const c = sum.get(k) ?? { ok: 0, total: 0 }; c.ok += v.ok; c.total += v.total; sum.set(k, c); }
  return new Map([...sum].map(([k, v]) => [k, pct(v.ok, v.total)]));
}

/** Temps passé (minutes) et activités faites sur PiSan depuis une date : pour croiser l'usage et la progression. */
export function usageSince(attempts: { date: string; minutes: number }[], since: string | undefined): { minutes: number; activities: number } {
  const from = since ? Date.parse(since) : 0;
  const list = attempts.filter(a => Date.parse(a.date) >= from);
  return { minutes: Math.round(list.reduce((s, a) => s + (a.minutes || 0), 0)), activities: list.length };
}

/** Une ligne par élève : score au début (A) et à la fin (B), en %, et l'écart en points. */
export type PlacementRow = { memberId: string; nickname: string; a: number | null; b: number | null; gain: number | null; minutes: number; activities: number };
export function placementRows(students: { id: string; profile: { nickname: string }; progress: { attempts: { date: string; minutes: number }[] } }[], results: { member_id: string; correct: number; total: number; test_id: string }[], testA?: { id: string; created_at: string }, testB?: { id: string }): PlacementRow[] {
  return students.map(st => {
    const ra = testA && results.find(r => r.test_id === testA.id && r.member_id === st.id);
    const rb = testB && results.find(r => r.test_id === testB.id && r.member_id === st.id);
    const a = ra ? pct(ra.correct, ra.total) : null, b = rb ? pct(rb.correct, rb.total) : null;
    const use = usageSince(st.progress.attempts, testA?.created_at);
    return { memberId: st.id, nickname: st.profile.nickname, a, b, gain: a !== null && b !== null ? b - a : null, ...use };
  });
}

/** Nombres tels quels ; textes entre guillemets, et neutralisés s'ils ressemblent à une formule (pseudo « =… »). */
const csvCell = (v: string | number | null) => (v === null ? '' : typeof v === 'number' ? String(v) : `"${(/^[=+\-@\t\r]/.test(v) ? "'" : '') + v.replace(/"/g, '""')}"`);
/** Export CSV (Excel) : une ligne par élève, puis la moyenne de la classe par chapitre. */
export function placementCsv(rows: PlacementRow[], chapters: { label: string; a: number | null; b: number | null }[], labels: { pupil: string; a: string; b: string; gain: string; minutes: string; activities: string; chapter: string }) {
  const lines: (string | number | null)[][] = [[labels.pupil, labels.a, labels.b, labels.gain, labels.minutes, labels.activities], ...rows.map(r => [r.nickname, r.a, r.b, r.gain, r.minutes, r.activities]), [], [labels.chapter, labels.a, labels.b, labels.gain], ...chapters.map(c => [c.label, c.a, c.b, c.a !== null && c.b !== null ? c.b - c.a : null])];
  return '\uFEFF' + lines.map(l => l.map(csvCell).join(',')).join('\r\n');
}
