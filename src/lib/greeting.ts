// Salutation de l'accueil selon l'heure locale de l'élève : « Bonjour » de 5 h à 15 h 59, « Bonsoir » à partir de 16 h.
import type { Lang } from './i18n';

export const EVENING_HOUR = 16;
const WORDS: Record<Lang, [string, string]> = {
  fr: ['Bonjour', 'Bonsoir'],
  en: ['Hello', 'Good evening'],
  ar: ['مرحبًا', 'مساء الخير'],
  es: ['Buenos días', 'Buenas tardes'],
};
export function greeting(lang: Lang, hour = new Date().getHours()): string {
  const evening = hour >= EVENING_HOUR || hour < 5;
  return WORDS[lang][evening ? 1 : 0];
}
