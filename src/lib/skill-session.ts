// Parcours et mini-contrôles corrigés par le serveur.
// Le serveur choisit le tirage et signe un jeton (HMAC) ; chaque « Vérifier » lui envoie la réponse, il corrige
// l'étape avec le même générateur que l'appli et renvoie un nouveau jeton (étape suivante, erreurs retenues).
// Le résultat n'est enregistré qu'à la fin, avec le dernier jeton : on ne peut ni inventer un score ni effacer une erreur.
// Pur (Web Crypto) : utilisé par src/lib/grading.functions.ts et par les tests.
import { INSCRIBED_SPAN } from './figures';
import { chipsOk, getSkill, numberOk, reviewStep, sentenceOk, skillNotion, skillsFor, type Skill, type Step } from './skills';
import type { Attempt } from './pisan';

export type StepAnswer =
  | { type: 'choice'; choice: number }
  | { type: 'tap'; id: string }
  | { type: 'chips'; tokens: string[] }
  | { type: 'number'; text: string }
  | { type: 'sentence'; blanks: number[] }
  | { type: 'grid'; x: number; y: number }
  | { type: 'widget'; state: Record<string, number | boolean | string | number[]> };

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/** Corrige une étape à partir de la réponse brute (jamais d'un « juste / faux » envoyé par le navigateur). */
export function gradeStep(step: Step, answer: StepAnswer): boolean {
  switch (step.type) {
    case 'choice': return answer.type === 'choice' && answer.choice === step.answer;
    case 'tap': return answer.type === 'tap' && answer.id === step.answer;
    case 'chips': return answer.type === 'chips' && answer.tokens.length <= 40 && answer.tokens.every(t => step.tokens.includes(t)) && chipsOk(answer.tokens, step.groups, step.ordered);
    case 'number': return answer.type === 'number' && answer.text.length <= 40 && numberOk(answer.text, step.answer, step.tolerance);
    case 'sentence': return answer.type === 'sentence' && sentenceOk(step.parts, answer.blanks);
    case 'grid': return answer.type === 'grid' && answer.x === step.answer.x && answer.y === step.answer.y;
    case 'widget': {
      if (answer.type !== 'widget') return false;
      const s = answer.state, w = step.widget;
      switch (w.kind) {
        case 'squares': return num(s['angle']) === 90 && s['poured'] === true;
        case 'thales': return num(s['m']) === w.problem.am;
        case 'inscribed': return num(s['span']) >= INSCRIBED_SPAN && num(s['span']) <= 360;
        case 'line': return num(s['a']) === w.a && num(s['b']) === w.b;
        case 'tangent': return num(s['x']) === w.target;
        case 'level': {
          const v = s['values'];
          if (!Array.isArray(v) || v.length !== w.values.length || num(s['hand']) !== 0) return false;
          const sum = w.values.reduce((t, x) => t + x, 0);
          return v.every(x => x === sum / w.values.length);
        }
        case 'fraction-bars': {
          const sign = Math.sign(w.left.n * w.right.d - w.right.n * w.left.d);
          return num(s['left']) === w.left.n && num(s['right']) === w.right.n && s['relation'] === (sign > 0 ? '>' : sign < 0 ? '<' : '=');
        }
        case 'fraction-equivalence': return num(s['shaded']) === w.source.n * w.factor;
        case 'fraction-addition': return num(s['shaded']) === w.left.n + w.right.n;
        case 'fraction-numberline': return Math.abs(num(s['position']) - w.target.n / w.target.d) <= 0.006;
      }
    }
  }
}

// ───────────── Jeton signé ─────────────

export type Ticket = {
  v: 1;
  /** Début du hash de la session : le jeton ne sert qu'à cet élève. */
  h: string;
  kind: 'skill' | 'review' | 'series';
  /** Série d'entraînement : niveau 2 (en autonomie) ou 3 (défi mélangé), et la compétence travaillée. */
  series?: { level: SeriesLevel; skill: string };
  skills: string[];
  seeds: number[];
  step: number;
  missed: number[];
  /** Identifiant unique : un même parcours ne s'enregistre qu'une fois. */
  ref: string;
  exp: number;
};
export const TICKET_HOURS = 6;

// ───────────── Séries d'entraînement (niveaux 2 et 3) ─────────────
// Niveau 1 = le parcours guidé. Niveau 2 : 5 questions de la compétence, nouveaux nombres, indice après une erreur.
// Niveau 3 : 6 questions mélangées avec des compétences vues avant dans le chapitre, indice après deux erreurs.
export type SeriesLevel = 2 | 3;
export const SERIES_LENGTH: Record<SeriesLevel, number> = { 2: 5, 3: 6 };
/** Les compétences des questions d'une série, dans l'ordre (tirées par le serveur). */
export function seriesSkills(skill: Skill, level: SeriesLevel, rand: () => number = Math.random): string[] {
  if (level === 2) return Array.from({ length: SERIES_LENGTH[2] }, () => skill.id);
  const chapter = skillsFor(skill.chapter);
  const before = chapter.slice(0, Math.max(0, chapter.findIndex(s => s.id === skill.id))).map(s => s.id);
  const others = Array.from({ length: 3 }, () => (before.length ? before[Math.floor(rand() * before.length)]! : skill.id));
  const list = [skill.id, skill.id, skill.id, ...others];
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [list[i], list[j]] = [list[j]!, list[i]!]; }
  return list;
}

const enc = new TextEncoder();
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(`pisan-skill-ticket:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
export async function signTicket(t: Ticket, secret: string): Promise<string> {
  const body = b64(enc.encode(JSON.stringify(t)));
  return `${body}.${b64(await hmac(secret, body))}`;
}
/** Le jeton s'il est authentique (signé par l'un des secrets acceptés), pour cette session, et pas expiré ; sinon null. */
export async function readTicket(token: string, secret: string | string[], hash: string, now = Date.now()): Promise<Ticket | null> {
  const [body, mac] = token.split('.');
  if (!body || !mac || token.length > 4000) return null;
  let valid = false;
  for (const key of Array.isArray(secret) ? secret : [secret]) {
    const expected = b64(await hmac(key, body));
    if (expected.length !== mac.length) continue;
    let diff = 0;
    for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
    if (!diff) valid = true;
  }
  if (!valid) return null;
  try {
    const t = JSON.parse(new TextDecoder().decode(unb64(body))) as Ticket;
    return t.v === 1 && t.h === hash.slice(0, 16) && t.exp > now ? t : null;
  } catch { return null; }
}

/** Les étapes d'un parcours (une activité) ou d'un mini-contrôle (une étape par compétence). */
export function ticketSteps(t: Pick<Ticket, 'kind' | 'skills' | 'seeds'>): Step[] | null {
  const skills = t.skills.map(getSkill);
  if (skills.some(s => !s) || !skills.length || skills.length !== t.seeds.length) return null;
  if (t.kind === 'series' && skills.length > 6) return null;
  return t.kind === 'skill' ? skills[0]!.build(t.seeds[0]!).steps : skills.map((s, i) => reviewStep(s!, t.seeds[i]!));
}

export function newTicket(hash: string, kind: Ticket['kind'], skills: string[], rand: () => number = Math.random, now = Date.now(), series?: Ticket['series']): Ticket {
  const seeds = skills.map(() => Math.floor(rand() * 100000));
  const ref = Array.from({ length: 4 }, () => Math.floor(rand() * 2 ** 32).toString(36)).join('');
  return { v: 1, h: hash.slice(0, 16), kind, skills, seeds, step: 0, missed: [], ref, exp: now + TICKET_HOURS * 3600000, ...(series ? { series } : {}) };
}

/** Corrige l'étape en cours : juste → étape suivante ; faux → l'erreur est retenue (une fois) et on reste. */
export function advance(t: Ticket, steps: Step[], answer: StepAnswer): { ok: boolean; ticket: Ticket } | null {
  const step = steps[t.step];
  if (!step) return null;
  const ok = gradeStep(step, answer);
  if (ok) return { ok, ticket: { ...t, step: t.step + 1 } };
  return { ok, ticket: { ...t, missed: t.missed.includes(t.step) ? t.missed : [...t.missed, t.step] } };
}

/** Les résultats à enregistrer, une fois toutes les étapes réussies. */
export function ticketAttempts(t: Ticket, steps: Step[], date = new Date().toISOString()): Attempt[] | null {
  if (t.step !== steps.length) return null;
  const skills = t.skills.map(id => getSkill(id)!);
  if (t.kind === 'series') {
    const skill = t.series && getSkill(t.series.skill);
    if (!skill) return null;
    // Une seule ligne : elle compte pour les points et la notion, jamais pour l'acquisition (voir skillState).
    return [{ kind: 'workshop', notion: skillNotion(skill), skill: skill.id, series: t.series!.level, correct: steps.length - t.missed.length, total: steps.length, date, minutes: Math.min(20, steps.length * 2), ref: t.ref }];
  }
  if (t.kind === 'skill') {
    const skill = skills[0]!;
    return [{ kind: 'workshop', notion: skillNotion(skill), skill: skill.id, correct: steps.length - t.missed.length, total: steps.length, date, minutes: Math.min(20, steps.length * 2), ref: t.ref }];
  }
  return skills.map((s, i) => ({ kind: 'workshop' as const, notion: skillNotion(s), skill: s.id, review: true, correct: t.missed.includes(i) ? 0 : 1, total: 1, date, minutes: 2, ref: `${t.ref}-${i}` }));
}

// ───────────── Moteur côté appli ─────────────

/** Ce dont les écrans de parcours ont besoin : démarrer, vérifier une étape, terminer. */
export type SkillEngine = {
  /** Pour une série, `skills` = [la compétence] et `level` ; la réponse donne les compétences tirées. */
  start: (kind: Ticket['kind'], skills: string[], level?: SeriesLevel) => Promise<{ seeds: number[]; ticket: string; skills?: string[] }>;
  check: (ticket: string, answer: StepAnswer) => Promise<{ ok: boolean; ticket: string }>;
  finish: (ticket: string) => Promise<{ attempts: Attempt[] }>;
};

/** Le même moteur que le serveur, exécuté sur place : pour les tests et les démonstrations, jamais pour enregistrer. */
export function localEngine({ secret, hash, rand = Math.random, onRecord }: { secret: string; hash: string; rand?: () => number; onRecord?: (a: Attempt[]) => void }): SkillEngine {
  return {
    start: async (kind, skills, level) => {
      const t = kind === 'series' ? startSeries(hash, skills[0]!, level ?? 2, rand) : newTicket(hash, kind, skills, rand);
      if (!t) throw new Error('Compétence inconnue');
      return { seeds: t.seeds, ticket: await signTicket(t, secret), skills: t.skills };
    },
    check: async (token, answer) => {
      const t = await readTicket(token, secret, hash);
      const steps = t && ticketSteps(t);
      const next = t && steps && advance(t, steps, answer);
      if (!next) throw new Error('Activité expirée');
      return { ok: next.ok, ticket: await signTicket(next.ticket, secret) };
    },
    finish: async token => {
      const t = await readTicket(token, secret, hash);
      const steps = t && ticketSteps(t);
      const attempts = t && steps && ticketAttempts(t, steps);
      if (!attempts) throw new Error('Activité inachevée');
      onRecord?.(attempts);
      return { attempts };
    },
  };
}

/** Le jeton d'une série (null si la compétence n'existe pas). */
export function startSeries(hash: string, skillId: string, level: SeriesLevel, rand: () => number = Math.random, now = Date.now()): Ticket | null {
  const skill = getSkill(skillId);
  return skill ? newTicket(hash, 'series', seriesSkills(skill, level, rand), rand, now, { level, skill: skill.id }) : null;
}
