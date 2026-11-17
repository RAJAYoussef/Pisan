// Vue professeur : élèves × compétences des parcours, chapitre par chapitre.
import { Check, RotateCcw } from 'lucide-react';
import { blockingSkills, type ClassStudent } from '@/lib/classroom';
import { figuresFor, type FigureKind } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { programmeFor, programmeNotions } from '@/lib/programmes';
import { skillsFor, skillStatus, type SkillStatus } from '@/lib/skills';
import { CHAPTER_NAMES } from './skills';

/** Les chapitres à parcours du programme de la classe. */
export function classSkillKinds(country: string, grade: number): FigureKind[] {
  const programme = programmeFor(country, grade);
  return programme ? figuresFor(programme, programmeNotions(programme).map(n => n.id), grade) : [];
}

const LABEL: Record<SkillStatus, (lang: Lang) => string> = {
  mastered: lang => say(lang, 'Acquis', 'Mastered', 'مكتسبة', 'Adquirida'),
  started: lang => say(lang, 'Commencé, pas encore acquis', 'Started, not yet mastered', 'بدأت ولم تُكتسب بعد', 'Empezada, aún no adquirida'),
  review: lang => say(lang, 'Mini-contrôle raté : à revoir', 'Failed quick check: to review', 'مراقبة قصيرة غير ناجحة: للمراجعة', 'Mini control fallido: por repasar'),
  todo: lang => say(lang, 'Pas encore fait', 'Not done yet', 'لم تُنجز بعد', 'Sin hacer'),
};

function Cell({ status, lang }: { status: SkillStatus; lang: Lang }) {
  return <td className={`skill-cell skill-cell-${status}`} title={LABEL[status](lang)}>
    {status === 'mastered' ? <Check className="mx-auto h-4 w-4" aria-hidden /> : status === 'review' ? <RotateCcw className="mx-auto h-4 w-4" aria-hidden /> : status === 'started' ? <span aria-hidden>●</span> : <span aria-hidden>—</span>}
    <span className="sr-only">{LABEL[status](lang)}</span>
  </td>;
}

export function ClassSkills({ lang, students, kinds }: { lang: Lang; students: ClassStudent[]; kinds: FigureKind[] }) {
  if (!kinds.length || !students.length) return null;
  const blocking = blockingSkills(students, kinds);
  return <section className="mt-10">
    <h3 className="text-xl">{say(lang, 'Parcours de compétences', 'Skill pathways', 'مسارات الكفايات', 'Itinerarios de competencias')}</h3>
    <p className="mt-2 text-sm"><strong>{say(lang, 'Ça bloque : ', 'Stuck on: ', 'صعوبات: ', 'Bloqueos: ')}</strong>{blocking.map(b => `${CHAPTER_NAMES[b.skill.chapter][lang]} · ${b.skill.title[lang]} (${b.count})`).join(' · ') || say(lang, 'rien pour l’instant', 'nothing so far', 'لا شيء حاليًا', 'nada por ahora')}</p>
    <div className="my-3 flex flex-wrap gap-3 text-xs">{(['mastered', 'started', 'review', 'todo'] as SkillStatus[]).map(s => <span key={s} className={`skill-cell skill-cell-${s} inline-flex items-center gap-1 rounded px-2 py-1`}>{s === 'mastered' ? '✓' : s === 'review' ? '↺' : s === 'started' ? '●' : '—'} {LABEL[s](lang)}</span>)}</div>
    {kinds.map(kind => {
      const skills = skillsFor(kind);
      const touched = students.some(st => skills.some(sk => skillStatus(st.progress.attempts, sk.id) !== 'todo'));
      return <details key={kind} className="teacher-skills" open={touched}>
        <summary className="cursor-pointer py-2 font-bold">{CHAPTER_NAMES[kind][lang]}</summary>
        <div className="max-w-full overflow-x-auto"><table className="teacher-grid">
          <thead><tr><th>{say(lang, 'Élève', 'Student', 'التلميذ', 'Alumno')}</th>{skills.map(sk => <th key={sk.id}>{sk.title[lang]}</th>)}</tr></thead>
          <tbody>{students.map(st => <tr key={st.id}><th>{st.profile.nickname}</th>{skills.map(sk => <Cell key={sk.id} lang={lang} status={skillStatus(st.progress.attempts, sk.id)} />)}</tr>)}</tbody>
          <tfoot><tr><th>{say(lang, 'Acquis', 'Mastered', 'مكتسبة', 'Adquirida')}</th>{skills.map(sk => <td key={sk.id} className="text-center text-xs font-bold">{students.filter(st => skillStatus(st.progress.attempts, sk.id) === 'mastered').length}/{students.length}</td>)}</tr></tfoot>
        </table></div>
      </details>;
    })}
  </section>;
}
