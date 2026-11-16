// Activités « figures à manipuler » de l'atelier : Pythagore et Thalès.
// Même démarche que les problèmes en barres : manipuler (concret), observer (imagé), calculer (abstrait).
// Fonctions pures et déterministes. Couvert par src/test/figures.test.ts.
import { parse } from './answer-check';
import { seeded } from './exercises';
import type { NotionId } from './curriculum';

export type FigureKind = 'pythagoras' | 'thales';
export const FIGURE_NOTIONS: Record<FigureKind, NotionId[]> = { pythagoras: ['pythagoras-thales'], thales: ['pythagoras-thales'] };
/** Taille du quadrillage (en carreaux) : les points se placent sur des nœuds entiers de 0 à GRID. */
export const GRID = 12;

/** Triangle rectangle en A : A(0 ; 0), B(ab ; 0) sur l'axe horizontal, C(0 ; ac) sur l'axe vertical. */
export type PythagorasProblem = { kind: 'pythagoras'; ab: number; ac: number; bc: number };
/** Triangle ABC, rectangle en B pour un dessin net : A(0 ; 0), B(ab ; 0), C(ab ; bc). M sur [AB], N sur [AC], (MN) ∥ (BC). */
export type ThalesProblem = { kind: 'thales'; ab: number; bc: number; am: number; mn: number; ratio: [number, number] };
export type FigureProblem = PythagorasProblem | ThalesProblem;

// Triplets pythagoriciens qui tiennent dans le quadrillage.
const TRIPLES: [number, number, number][] = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];

export function pythagorasProblem(seed: number): PythagorasProblem {
  const [ab, ac, bc] = TRIPLES[Math.floor(seeded(seed)() * TRIPLES.length)]!;
  return { kind: 'pythagoras', ab, ac, bc };
}

// Rapports simples, et longueurs choisies pour que AM et MN soient entiers.
const RATIOS: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]];
const SIDES = [6, 8, 9, 12];

export function thalesProblem(seed: number): ThalesProblem {
  const rng = seeded(seed);
  const options: ThalesProblem[] = [];
  for (const [p, q] of RATIOS) for (const ab of SIDES) for (const bc of SIDES) {
    if ((ab * p) % q === 0 && (bc * p) % q === 0) options.push({ kind: 'thales', ab, bc, am: (ab * p) / q, mn: (bc * p) / q, ratio: [p, q] });
  }
  return options[Math.floor(rng() * options.length)]!;
}

export function figureProblem(kind: FigureKind, seed: number): FigureProblem {
  return kind === 'pythagoras' ? pythagorasProblem(seed) : thalesProblem(seed);
}

/** Étape 1 réussie : les points sont à la bonne place. */
export function placementOk(p: FigureProblem, x: number, y = 0): boolean {
  return p.kind === 'pythagoras' ? x === p.ab && y === p.ac : x === p.am;
}

/** Ce que l'élève doit trouver à chaque étape de calcul. */
export function expectedValues(p: FigureProblem): [number, number] {
  return p.kind === 'pythagoras' ? [p.bc * p.bc, p.bc] : [p.ratio[0] / p.ratio[1], p.mn];
}

/** Réponse tapée : la valeur exacte (fraction ou décimal), ou un décimal arrondi au centième pour un rapport. */
export function valueOk(input: string, expected: number): boolean {
  const parsed = parse(input);
  if (!parsed || parsed.usesX) return false;
  const v = parsed.fn(0);
  if (!Number.isFinite(v)) return false;
  if (Math.abs(v - expected) <= 1e-9 * Math.max(1, Math.abs(expected))) return true;
  return /[.,]/.test(input) && !Number.isInteger(expected) && Math.abs(v - expected) < 0.01;
}

/** Longueur d'un segment, arrondie au dixième pour l'affichage. */
export const length = (dx: number, dy: number) => Math.round(Math.hypot(dx, dy) * 10) / 10;

/** Position de N sur [AC] quand M est à la distance am de A : (MN) reste parallèle à (BC). */
export function pointN(p: ThalesProblem, am: number): { x: number; y: number } {
  const k = am / p.ab;
  return { x: p.ab * k, y: p.bc * k };
}
