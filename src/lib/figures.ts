// Activités « figures à manipuler » de l'atelier : Pythagore et Thalès.
// Même démarche que les problèmes en barres : manipuler (concret), observer (imagé), calculer (abstrait).
// Fonctions pures et déterministes. Couvert par src/test/figures.test.ts.
import { parse } from './answer-check';
import { seeded } from './exercises';
import type { L, NotionId } from './curriculum';
import type { Programme } from './programmes';

/** Chapitres qui ont un parcours de compétences (src/lib/skills.ts). Les quatre premiers ont aussi des figures à manipuler. */
export type FigureKind = 'pythagoras' | 'thales' | 'trigo' | 'inscribed' | 'vectors' | 'affine' | 'stats' | 'seq' | 'deriv' | 'proba' | 'fractions' | 'decimals' | 'proportion' | 'lines' | 'symmetry' | 'measures';
export const FIGURE_KINDS: FigureKind[] = ['pythagoras', 'thales', 'trigo', 'inscribed', 'vectors', 'affine', 'stats', 'seq', 'deriv', 'proba', 'fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'];
export const FIGURE_NOTIONS: Record<FigureKind, NotionId[]> = { pythagoras: ['pythagoras-thales'], thales: ['pythagoras-thales'], trigo: ['trigonometry'], inscribed: ['geometry'], vectors: ['vectors'], affine: ['functions'], stats: ['statistics'], seq: ['sequences'], deriv: ['derivatives'], proba: ['probability-laws'], fractions: ['fractions'], decimals: ['decimals'], proportion: ['proportion'], lines: ['geometry'], symmetry: ['symmetry'], measures: ['areas'] };
/** Mots de l'intitulé officiel du chapitre qui correspond à chaque parcours (plusieurs chapitres partagent une notion). */
export const FIGURE_CHAPTER_WORDS: Record<FigureKind, string[]> = { pythagoras: ['Pythagore', 'Triangle rectangle'], thales: ['Thalès'], trigo: ['Trigonométrie', 'trigonométriques', 'Triangle rectangle'], inscribed: ['inscrits'], vectors: ['Vecteur', 'vecteur'], affine: ['affines', 'Fonctions linéaires'], stats: ['Statistiques'], seq: ['Suites'], deriv: ['érivation'], proba: ['robabilit', 'Loi binomiale', 'Lois'], fractions: ['Fraction', 'fraction'], decimals: ['décimaux', 'Nombres entiers'], proportion: ['Proportionnalité', 'Ratios'], lines: ['Droites'], symmetry: ['ymétri'], measures: ['érimètre', 'ires', 'Cercle', 'Pavés'] };
/** Parcours dont la notion est partagée avec d'autres chapitres : on exige l'intitulé officiel. */
const NEEDS_TITLE: FigureKind[] = ['inscribed', 'vectors', 'affine', 'stats', 'seq', 'deriv', 'proba', 'fractions', 'decimals', 'proportion', 'lines', 'symmetry', 'measures'];
/** Taille du quadrillage (en carreaux) : les points se placent sur des nœuds entiers de 0 à GRID. */
export const GRID = 12;

/** Triangle rectangle en A : A(0 ; 0), B(ab ; 0) sur l'axe horizontal, C(0 ; ac) sur l'axe vertical. */
export type PythagorasProblem = { kind: 'pythagoras'; ab: number; ac: number; bc: number };
/** Triangle ABC, rectangle en B pour un dessin net : A(0 ; 0), B(ab ; 0), C(ab ; bc). M sur [AB], N sur [AC], (MN) ∥ (BC). */
export type ThalesProblem = { kind: 'thales'; ab: number; bc: number; am: number; mn: number; ratio: [number, number] };
/** Triangle rectangle en B : A(0 ; 0), B(ab ; 0), C(ab ; bc). L'élève règle la hauteur BC. */
export type TrigoProblem = { kind: 'trigo'; ab: number; bc: number; ac: number; angle: number };
/** Cercle de centre O, A et B fixes : l'angle au centre AOB, et l'angle inscrit AMB quand M parcourt le grand arc. */
export type InscribedProblem = { kind: 'inscribed'; central: number; askCentral: number; askInscribed: number };
export type FigureProblem = PythagorasProblem | ThalesProblem | TrigoProblem | InscribedProblem;

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

// Triangles rectangles à côtés entiers qui tiennent dans le quadrillage (AB adjacent, BC opposé à Â).
const TRIGO: [number, number, number][] = [[8, 6, 10], [6, 8, 10], [12, 5, 13], [5, 12, 13], [12, 9, 15], [9, 12, 15], [4, 3, 5], [3, 4, 5]];
/** Angle Â en degrés, arrondi au degré. */
export const angleDeg = (opp: number, adj: number) => Math.round((Math.atan2(opp, adj) * 180) / Math.PI);

export function trigoProblem(seed: number): TrigoProblem {
  const [ab, bc, ac] = TRIGO[Math.floor(seeded(seed)() * TRIGO.length)]!;
  return { kind: 'trigo', ab, bc, ac, angle: angleDeg(bc, ab) };
}

export function inscribedProblem(seed: number): InscribedProblem {
  const rng = seeded(seed);
  const pick = (list: number[]) => list[Math.floor(rng() * list.length)]!;
  const central = pick([80, 100, 120, 140]);
  const askCentral = pick([60, 90, 110, 130, 150].filter(v => v !== central));
  return { kind: 'inscribed', central, askCentral, askInscribed: pick([25, 35, 40, 55, 65]) };
}

export function figureProblem(kind: FigureProblem['kind'], seed: number): FigureProblem {
  switch (kind) {
    case 'pythagoras': return pythagorasProblem(seed);
    case 'thales': return thalesProblem(seed);
    case 'trigo': return trigoProblem(seed);
    case 'inscribed': return inscribedProblem(seed);
  }
}

/** Angle inscrit AMB (en degrés) pour un angle au centre AOB, M sur le grand arc. */
export const inscribedAngle = (central: number) => central / 2;
/** Étendue minimale (en degrés) que M doit parcourir sur le cercle pour « observer » que AMB ne change pas. */
export const INSCRIBED_SPAN = 60;

/** Étape 1 réussie : les points sont à la bonne place. */
export function placementOk(p: FigureProblem, x: number, y = 0): boolean {
  switch (p.kind) {
    case 'pythagoras': return x === p.ab && y === p.ac;
    case 'thales': return x === p.am;
    case 'trigo': return y === p.bc;
    case 'inscribed': return x >= INSCRIBED_SPAN; // x = étendue parcourue par M, en degrés
  }
}

/** Ce que l'élève doit trouver à chaque étape de calcul. */
export function expectedValues(p: FigureProblem): [number, number] {
  switch (p.kind) {
    case 'pythagoras': return [p.bc * p.bc, p.bc];
    case 'thales': return [p.ratio[0] / p.ratio[1], p.mn];
    case 'trigo': return [p.ab / p.ac, p.angle];
    case 'inscribed': return [inscribedAngle(p.askCentral), p.askInscribed * 2];
  }
}

/** Réponse de l'étape 1 ou 2. Un angle de trigonométrie se donne au degré près (on accepte l'arrondi voisin). */
export function answerOk(p: FigureProblem, step: 1 | 2, input: string): boolean {
  const expected = expectedValues(p)[step - 1]!;
  if (p.kind === 'trigo' && step === 2) {
    const parsed = parse(input.replace(/°/g, ''));
    if (!parsed || parsed.usesX) return false;
    return Math.abs(parsed.fn(0) - expected) <= 1;
  }
  return valueOk(input.replace(/°/g, ''), expected);
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

/** Le chapitre officiel qui correspond à une figure (null si la figure n'est pas au programme de l'année). */
export function figureChapter(programme: Programme | null | undefined, kind: FigureKind): L | null {
  const words = FIGURE_CHAPTER_WORDS[kind];
  return programme?.chapters.find(c => c.notions.some(n => FIGURE_NOTIONS[kind].includes(n)) && words.some(w => c.title.fr.includes(w)))?.title ?? null;
}

/**
 * Les figures à proposer dans l'atelier. Pythagore, Thalès et la trigonométrie suivent la notion (Pythagore
 * apparaît alors en « rappel » s'il était au programme d'une année précédente). Les angles inscrits partagent
 * la notion « géométrie » avec d'autres chapitres : on exige l'intitulé officiel. Sans programme : selon le niveau.
 */
export function figuresFor(programme: Programme | null | undefined, notions: NotionId[] | undefined, level: number): FigureKind[] {
  return FIGURE_KINDS.filter(k => {
    if (!notions) return k === 'fractions' ? true : ['decimals', 'proportion', 'lines', 'symmetry', 'measures'].includes(k) ? level <= 1 : k === 'seq' || k === 'deriv' || k === 'proba' ? level >= 5 : k === 'inscribed' || k === 'vectors' || k === 'affine' ? level === 3 : k === 'stats' ? level >= 1 && level <= 3 : level >= 2 && level <= 4;
    if (NEEDS_TITLE.includes(k)) return figureChapter(programme, k) !== null;
    return FIGURE_NOTIONS[k].some(n => notions.includes(n));
  });
}

/** Les parcours de compétences qui correspondent à un chapitre (titre officiel + notions). */
export function chapterSkillKinds(chapter: { title: L; notions: NotionId[] }): FigureKind[] {
  return FIGURE_KINDS.filter(k => chapter.notions.some(n => FIGURE_NOTIONS[k].includes(n)) && FIGURE_CHAPTER_WORDS[k].some(w => chapter.title.fr.includes(w)) && !chapter.title.fr.includes('espace'));
}
