// « Signaler une erreur » : ce qu'un élève ou un enseignant envoie, et comment l'administrateur retrouve la question.
import { z } from 'zod';
import { getSkill } from './skills';
import type { Step } from './skill-kit';

export const REPORT_CONTEXTS = ['pathway', 'review', 'placement', 'other'] as const;
export const REPORT_REASONS = ['wrong-answer', 'unclear', 'display', 'other'] as const;
export type ReportContext = (typeof REPORT_CONTEXTS)[number];
export type ReportReason = (typeof REPORT_REASONS)[number];
export const REPORT_MESSAGE_MAX = 500;

export const reportInput = z.object({
  skill: z.string().regex(/^[a-z]+(-[a-z]+){1,3}$/),
  seed: z.number().int().min(0).max(1_000_000),
  step: z.number().int().min(0).max(30),
  context: z.enum(REPORT_CONTEXTS),
  lang: z.enum(['fr', 'en', 'ar', 'es']),
  reason: z.enum(REPORT_REASONS),
  message: z.string().trim().max(REPORT_MESSAGE_MAX).default(''),
}).strict();
export type ReportInput = z.input<typeof reportInput>;

/** Indice (positif) de l'étape reprise dans les mini-contrôles et le test de positionnement. */
export function reviewIndex(skillId: string, seed: number): number {
  const skill = getSkill(skillId);
  if (!skill) return 0;
  const n = skill.build(seed).steps.length;
  return skill.review < 0 ? n + skill.review : skill.review;
}

/** L'étape signalée, reconstruite à partir de la notion et de la graine (null si elle n'existe pas). */
export function reportedStep(skillId: string, seed: number, step: number): Step | null {
  const skill = getSkill(skillId);
  if (!skill) return null;
  return skill.build(seed).steps[step] ?? null;
}

type Lang = 'fr' | 'en' | 'ar' | 'es';
/** La réponse attendue, en clair, pour que l'administrateur juge le signalement. */
export function expectedAnswer(step: Step, lang: Lang): string {
  switch (step.type) {
    case 'choice': return step.options[step.answer]?.[lang] ?? '?';
    case 'number': return `${step.answer}${step.unit ? ` ${step.unit}` : ''}${step.tolerance ? ` (± ${step.tolerance})` : ''}`;
    case 'tap': return step.answer;
    case 'chips': return step.groups.map(g => g.join(' ')).join(' | ');
    case 'grid': return `${step.label} (${step.answer.x} ; ${step.answer.y})`;
    case 'sentence': return step.parts.flatMap(p => ('answer' in p && Array.isArray(p.answer) ? [p.answer.map(i => p.options[i]?.[lang] ?? '?').join(' / ')] : [])).join(' · ');
    case 'widget': return step.widget.kind;
  }
}
