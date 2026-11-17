// Socle des parcours de compétences : types d'étapes, figures (données pures) et vérifications.
// Les générateurs sont dans src/lib/skills.ts (géométrie) et src/lib/skills-numbers.ts (vecteurs, fonctions, statistiques).
import type { L } from './curriculum';
import { parse } from './answer-check';
import type { FigureKind, InscribedProblem, ThalesProblem } from './figures';

/** Vecteur dans un texte : ⟦AB⟧, affiché avec une flèche au-dessus (Rich, dans src/components/pisan/skills.tsx). */
export const vec = (name: string) => `⟦${name}⟧`;
export const VEC_RE = /⟦([^⟧]+)⟧/g;
export const VECTOR_WORD = { fr: 'vecteur', en: 'vector', ar: 'المتجهة', es: 'vector' } as const;
/** Le texte tel qu'il se lit à voix haute (« vecteur AB »). */
export const spoken = (text: string, lang: keyof typeof VECTOR_WORD) => text.replace(VEC_RE, `${VECTOR_WORD[lang]} $1`);
export const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
export type Rng = () => number;
export const pick = <T,>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;
/** Nombre écrit à la française (virgule), arrondi à 2 décimales au plus. */
export const fmt = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

// ───────────── Figures (données pures, dessinées par GeoScene dans src/components/pisan/skills.tsx) ─────────────

export type P = { x: number; y: number };
/** style « vector » : flèche de a vers b. */
export type Segment = { id: string; a: string; b: string; text?: string; tappable?: boolean; style?: 'bold' | 'dashed' | 'soft' | 'vector' };
/** Quadrillage (unités entières), avec axes gradués si `axes`. */
export type Grid = { minX: number; maxX: number; minY: number; maxY: number; axes?: boolean };
/** Tableau de données : une ligne d'en-têtes, puis des lignes de valeurs. */
export type Table = { head: L[]; rows: string[][] };
export type Scene = {
  points: Record<string, P>;
  segments: Segment[];
  /** Sommets du triangle sur lequel on peut poser l'équerre (toucher un sommet). */
  polygon?: string[];
  equerre?: boolean;
  rightAngles?: [string, string, string][];
  angleMarks?: [string, string, string][];
  circle?: { c: string; r: number };
  /** Arcs du cercle (en degrés, sens direct de start à end), éventuellement à toucher. */
  arcs?: { id: string; start: number; end: number; text: string; tappable?: boolean }[];
  hidden?: string[];
  caption?: L;
  grid?: Grid;
};

// ───────────── Étapes ─────────────

export type Blank = { options: L[]; answer: number[] };
type Shown = { scene?: Scene; table?: Table };
export type Step =
  | ({ type: 'choice'; prompt: L; options: L[]; answer: number; hint: L } & Shown)
  | { type: 'tap'; prompt: L; scene: Scene; answer: string; hint: L }
  /** `ordered` : la suite doit être exactement `groups[0]` (ranger des valeurs). */
  | ({ type: 'chips'; prompt: L; tokens: string[]; groups: string[][]; hint: L; ordered?: boolean } & Shown)
  | ({ type: 'number'; prompt: L; answer: number; tolerance: number; hint: L; unit?: string } & Shown)
  | ({ type: 'sentence'; prompt: L; parts: (L | Blank)[]; hint: L } & Shown)
  /** Placer le point `label` sur un nœud du quadrillage (au doigt ou aux flèches du clavier). */
  | { type: 'grid'; prompt: L; scene: Scene & { grid: Grid }; label: string; start: P; answer: P; hint: L }
  | { type: 'widget'; prompt: L; hint: L; widget: Widget };
export type Widget =
  | { kind: 'squares'; ab: number; ac: number }
  | { kind: 'thales'; problem: ThalesProblem }
  | { kind: 'inscribed'; problem: InscribedProblem }
  /** Régler a et b pour que la droite y = ax + b passe par A et B. */
  | { kind: 'line'; a: number; b: number; A: P; B: P }
  /** Égaliser des colonnes de cubes : la hauteur commune est la moyenne. */
  | { kind: 'level'; values: number[] };
export type Activity = { title: L; steps: Step[]; summary: string };
/** `review` : étape (indice, négatif depuis la fin) reprise dans les mini-contrôles ; elle doit se suffire à elle-même. */
export type Skill = { id: string; chapter: FigureKind; title: L; desc: L; build: (seed: number) => Activity; review: number };

// ───────────── Vérifications ─────────────

/** Nombre tapé : virgule ou point, fraction acceptée, à la tolérance près. */
export function numberOk(input: string, answer: number, tolerance: number): boolean {
  const p = parse(input.replace(/°/g, ''));
  if (!p || p.usesX) return false;
  const v = p.fn(0);
  return Number.isFinite(v) && Math.abs(v - answer) <= tolerance + 1e-9;
}

/**
 * Égalité assemblée avec des étiquettes. On compare des membres (séparés par « = ») sans tenir compte de
 * leur ordre, ni de l'ordre des termes d'une somme : « BC² = AB² + AC² » vaut « AC² + AB² = BC² ».
 */
export function chipsOk(sequence: string[], groups: string[][], ordered = false): boolean {
  if (ordered) return sequence.join('|') === (groups[0] ?? []).join('|');
  const members: string[][] = [[]];
  for (const token of sequence) {
    if (token === '=') members.push([]);
    else if (token !== '+') members[members.length - 1]!.push(token);
  }
  if (members.some(m => m.length === 0) || members.length !== groups.length) return false;
  const key = (m: string[]) => [...m].sort().join('|');
  const want = groups.map(key).sort();
  const got = members.map(key).sort();
  // un « + » doit séparer les termes d'un même membre : pas deux termes collés
  const plusOk = sequence.every((tok, i) => tok === '=' || tok === '+' || i === 0 || sequence[i - 1] === '=' || sequence[i - 1] === '+');
  return plusOk && want.every((w, i) => w === got[i]);
}

export function sentenceOk(parts: (L | Blank)[], chosen: number[]): boolean {
  const blanks = parts.filter((p): p is Blank => 'options' in p);
  return blanks.length === chosen.length && blanks.every((b, i) => b.answer.includes(chosen[i]!));
}

