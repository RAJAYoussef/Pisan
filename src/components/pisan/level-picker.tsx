// Niveaux d'un parcours : 1 guidé (le parcours), 2 en autonomie et 3 défi mélangé (séries, src/components/pisan/series.tsx).
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import type { SeriesLevel } from '@/lib/skill-session';

export const LEVEL_NAMES: Record<1 | SeriesLevel, [string, string, string, string]> = {
  1: ['Guidé', 'Guided', 'موجَّه', 'Guiado'],
  2: ['En autonomie', 'On my own', 'باستقلالية', 'Autónomo'],
  3: ['Défi mélangé', 'Mixed challenge', 'تحدٍّ مختلط', 'Reto mixto'],
};
const LEVEL_NOTES: Record<1 | SeriesLevel, [string, string, string, string]> = {
  1: ['Le parcours pas à pas, avec la leçon et les indices.', 'The step-by-step pathway, with lesson and hints.', 'المسار خطوة بخطوة مع الدرس والتلميحات.', 'El itinerario paso a paso, con lección y pistas.'],
  2: ['5 questions de cette notion, de nouveaux nombres ; un indice seulement après une erreur.', '5 questions on this skill with new numbers; a hint only after a mistake.', '5 أسئلة بأعداد جديدة؛ تلميح بعد الخطأ فقط.', '5 preguntas con números nuevos; pista solo tras un error.'],
  3: ['6 questions mélangées avec ce que tu as vu avant dans le chapitre ; un indice après deux erreurs.', '6 questions mixed with earlier skills of the chapter; a hint after two mistakes.', '6 أسئلة مختلطة مع ما سبق في الفصل؛ تلميح بعد خطأين.', '6 preguntas mezcladas con lo visto antes; pista tras dos errores.'],
};

/** Le parcours guidé a-t-il été terminé une fois ? (condition pour ouvrir les niveaux 2 et 3) */
export const seriesUnlocked = (attempts: Attempt[] | undefined, skillId: string) => Boolean(attempts?.some(a => a.skill === skillId && !a.review && !a.series));

/** Choix du niveau, en tête d'un parcours. */
export function LevelPicker({ lang, current, unlocked, onPick }: { lang: Lang; current: 1 | SeriesLevel; unlocked: boolean; onPick: (level: 1 | SeriesLevel) => void }) {
  return <div className="level-picker" role="group" aria-label={say(lang, 'Niveau', 'Level', 'المستوى', 'Nivel')}>
    {([1, 2, 3] as const).map(level => {
      const locked = level > 1 && !unlocked;
      return <button key={level} type="button" className="level-option" aria-pressed={current === level} disabled={locked} onClick={() => onPick(level)}
        title={locked ? say(lang, 'Termine d’abord le parcours guidé.', 'Finish the guided pathway first.', 'أنهِ المسار الموجَّه أولًا.', 'Termina antes el itinerario guiado.') : say(lang, ...LEVEL_NOTES[level])}>
        <span className="level-num">{level}</span><span>{say(lang, ...LEVEL_NAMES[level])}</span>
      </button>;
    })}
    {!unlocked && <p className="level-hint">{say(lang, 'Les niveaux 2 et 3 s’ouvrent quand tu as terminé le parcours guidé.', 'Levels 2 and 3 open once you finish the guided pathway.', 'يُفتح المستويان 2 و3 بعد إنهاء المسار الموجَّه.', 'Los niveles 2 y 3 se abren al terminar el itinerario guiado.')}</p>}
  </div>;
}

