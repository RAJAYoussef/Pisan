// Ludification des parcours : points, combos, étoiles. Tout se déduit des tentatives déjà enregistrées
// (aucune donnée nouvelle à stocker), sauf le combo qui ne vit que le temps d'un parcours.
// Pur, couvert par src/test/rewards.test.ts.
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
