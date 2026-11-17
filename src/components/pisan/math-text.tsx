// Écriture mathématique commune : décimales selon la langue et vecteurs avec leur flèche au-dessus.
import { localizeMath } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { spoken, VEC_RE, VECTOR_WORD } from '@/lib/skill-kit';

/** Texte avec vecteurs ⟦AB⟧ dessinés avec leur flèche ; lu « vecteur AB » par les lecteurs d'écran. */
export function Rich({ lang, text }: { lang: Lang; text: string }) {
  const parts = minusSign(text).split(VEC_RE);
  if (parts.length === 1) return <>{parts[0]}</>;
  return <>{parts.map((part, i) => i % 2 ? <span key={i} className="vec"><span className="sr-only">{VECTOR_WORD[lang]} </span>{part}</span> : part)}</>;
}

/** Le tiret devant un nombre devient un vrai signe moins (−2, et non -2). */
export const minusSign = (text: string) => text.replace(/(^|[\s(\[;=:,+×÷/])-(?=\d)/g, '$1−');

/** Les contenus écrits « AB→ » passent à la notation ⟦AB⟧ (flèche au-dessus). */
export const vectorize = (text: string) => text.replace(/\b([A-Z]{2})→/g, '⟦$1⟧');
/** Texte mathématique prêt à afficher : décimales de la langue et vecteurs. */
export function MathText({ lang, text }: { lang: Lang; text: string }) {
  return <Rich lang={lang} text={vectorize(localizeMath(text, lang))} />;
}
/** Le même texte pour la synthèse vocale. */
export const mathSpoken = (text: string, lang: Lang) => spoken(vectorize(localizeMath(text, lang)), lang);
