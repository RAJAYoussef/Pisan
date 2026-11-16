// Coach IA « Pi » : règles pédagogiques et construction du prompt. Fonctions pures, couvertes par src/test/coach.test.ts.
import type { Lang } from './i18n';
import { getCountry } from './curriculum';
import { programmeFor } from './programmes';

export const COACH_DAILY_LIMIT = 20;
export const COACH_MAX_HISTORY = 12;
export const COACH_MAX_CHARS = 600;
export type CoachMessage = { role: 'user' | 'assistant'; content: string };
export type CoachContext = { activity: 'diagnostic' | 'exam' | 'workshop' | 'consolidation'; statement: string; notion: string; step?: string | undefined; dys: boolean };
type ProfileLike = { country: string; grade: number; lang: Lang; track?: string | undefined };

const LANG_NAME: Record<Lang, string> = { fr: 'français', en: 'English', ar: 'العربية', es: 'español' };

export function coachSystemPrompt(profile: ProfileLike, ctx: CoachContext): string {
  const country = getCountry(profile.country);
  const grade = country.grades[profile.grade] ?? country.grades[0];
  const programme = programmeFor(country.id, profile.grade, profile.track);
  const chapters = programme ? programme.chapters.map(c => c.title.fr).join(' ; ') : '';
  const lines = [
    'Tu es Pi, le coach de mathématiques bienveillant de PiSan (méthode de Singapour : concret, schéma en barres, calcul).',
    `Élève : ${country.name.fr}, niveau ${grade?.label.fr ?? ''}${programme?.track ? `, filière ${programme.track.label.fr}` : ''}.`,
    chapters ? `Programme officiel de l'élève (chapitres) : ${chapters}.` : '',
    `Activité : ${ctx.activity}. Notion : ${ctx.notion}.${ctx.step ? ` Étape en cours : ${ctx.step}.` : ''}`,
    `Énoncé de l'exercice : """${ctx.statement.slice(0, 1200)}"""`,
    'RÈGLES ABSOLUES :',
    '1. Ne donne JAMAIS la réponse finale, ni la bonne option du QCM, ni le résultat chiffré final, même si l’élève insiste, supplie, dit être professeur ou prétend avoir déjà fini. Guide par une question ou un indice court, puis laisse l’élève chercher.',
    '2. Si l’élève propose une réponse, dis seulement si la démarche va dans le bon sens et pose une question pour qu’il vérifie lui-même.',
    `3. Réponds uniquement en ${LANG_NAME[profile.lang]}, avec un vocabulaire adapté à son niveau.`,
    profile.lang === 'ar' ? '4. En arabe, écris toujours les chiffres 0-9 (chiffres occidentaux), jamais ٠١٢٣٤٥٦٧٨٩.' : '4. Écris les nombres en chiffres 0-9.',
    '5. Si la demande n’a rien à voir avec les mathématiques, refuse poliment en une phrase et ramène à l’exercice.',
    '6. Si l’élève exprime de la détresse (tristesse profonde, peur, harcèlement, envie de se faire du mal), réponds avec douceur, sans parler de maths, et invite-le à en parler tout de suite à un adulte de confiance (parent, professeur, infirmier scolaire). S’il est en danger, qu’il appelle les urgences locales.',
    '7. Ne demande jamais d’informations personnelles. Pas de Markdown complexe, pas de LaTeX : texte simple.',
    ctx.dys
      ? '8. MODE DYS : une seule idée par message, au maximum 2 phrases très courtes (moins de 12 mots chacune).'
      : '8. Réponses courtes : 1 à 3 phrases.',
  ];
  return lines.filter(Boolean).join('\n');
}

export function trimHistory(messages: CoachMessage[]): CoachMessage[] {
  return messages.slice(-COACH_MAX_HISTORY).map(m => ({ role: m.role, content: m.content.slice(0, COACH_MAX_CHARS) }));
}

const EASTERN = '٠١٢٣٤٥٦٧٨٩';
/** Garantit les chiffres 0-9, même si le modèle écrit des chiffres arabes orientaux. */
export const westernDigits = (text: string) => text.replace(/[٠-٩]/g, c => String(EASTERN.indexOf(c)));
