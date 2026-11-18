// Ludification des parcours : points, combos, étoiles. Tout se déduit des tentatives déjà enregistrées
// (aucune donnée nouvelle à stocker), sauf le combo qui ne vit que le temps d'un parcours.
// Pur, couvert par src/test/skill-intros.test.tsx et src/test/rewards-screen.test.tsx.
import type { Attempt } from './pisan';

export const POINTS_FIRST_TRY = 10;
export const POINTS_AFTER_HINT = 5;
export const COMBO_FROM = 3;
export const COMBO_BONUS = 5;

/** Points d'une étape réussie : réussie du premier coup ou après un indice ; bonus dès 3 réussites d'affilée. */
export function stepPoints(firstTry: boolean, streak: number): { points: number; combo: number } {
  const combo = firstTry ? streak : 0;
  return { points: (firstTry ? POINTS_FIRST_TRY : POINTS_AFTER_HINT) + (combo >= COMBO_FROM ? COMBO_BONUS : 0), combo };
}

/** Étoiles d'un parcours terminé : 3 sans erreur, 2 avec une erreur, 1 sinon. */
export function starsFor(correct: number, total: number): 1 | 2 | 3 {
  if (correct >= total) return 3;
  return total - correct <= 1 ? 2 : 1;
}

const skillAttempts = (attempts: Attempt[], skillId: string) => attempts.filter(a => a.skill === skillId && !a.review);

/** Meilleures étoiles obtenues sur une compétence (0 si jamais terminée). */
export function bestStars(attempts: Attempt[], skillId: string): 0 | 1 | 2 | 3 {
  return skillAttempts(attempts, skillId).reduce<0 | 1 | 2 | 3>((best, a) => Math.max(best, starsFor(a.correct, a.total)) as 0 | 1 | 2 | 3, 0);
}

/** Total de points de l'élève : chaque étape réussie du premier coup dans un parcours vaut POINTS_FIRST_TRY. */
export function totalPoints(attempts: Attempt[]): number {
  return attempts.filter(a => a.skill).reduce((sum, a) => sum + a.correct * POINTS_FIRST_TRY, 0);
}

/** Étoiles cumulées sur une liste de compétences (sur 3 × leur nombre). */
export function starsOf(attempts: Attempt[], skillIds: string[]): number {
  return skillIds.reduce((sum, id) => sum + bestStars(attempts, id), 0);
}

// ───────────── Niveaux, médailles, jours d'activité ─────────────

/** Points pour passer du niveau n au niveau n + 1 : 100, puis 150, 200… (de plus en plus long). */
export const levelCost = (level: number) => 50 + 50 * level;
/** Niveau atteint avec un total de points, et l'avancée vers le suivant. */
export function levelOf(points: number): { level: number; into: number; need: number } {
  let level = 1, left = Math.max(0, points);
  while (left >= levelCost(level)) { left -= levelCost(level); level++; }
  return { level, into: left, need: levelCost(level) };
}

export type Medal = 'none' | 'bronze' | 'silver' | 'gold';
export const MEDALS: Medal[] = ['bronze', 'silver', 'gold'];
/** Médaille d'un chapitre : bronze dès une compétence acquise, argent à la moitié, or quand tout est acquis. */
export function medalFor(mastered: number, total: number): Medal {
  if (!total || mastered <= 0) return 'none';
  if (mastered >= total) return 'gold';
  return mastered * 2 >= total ? 'silver' : 'bronze';
}
/** Combien de compétences acquises manquent pour la médaille suivante (null si l'or est déjà là). */
export function toNextMedal(mastered: number, total: number): { medal: Medal; missing: number } | null {
  if (mastered >= total) return null;
  if (mastered === 0) return { medal: 'bronze', missing: 1 };
  const half = Math.ceil(total / 2);
  return mastered < half ? { medal: 'silver', missing: half - mastered } : { medal: 'gold', missing: total - mastered };
}

/** Les 7 derniers jours (le plus ancien d'abord) : l'élève a-t-il travaillé ce jour-là ? Jours au format AAAA-MM-JJ. */
export function lastDays(attempts: Attempt[], today: string, dayOf: (iso: string) => string, count = 7): { day: string; active: boolean }[] {
  const active = new Set(attempts.map(a => dayOf(a.date)));
  const base = Date.parse(`${today}T12:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(base - (count - 1 - i) * 86400000).toISOString().slice(0, 10);
    return { day, active: active.has(day) };
  });
}
