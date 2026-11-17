import { useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Flame, LayoutDashboard, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chaptersForLevel, getNotion, type Notion, type NotionId } from '@/lib/curriculum';
import { MASTERED, nextChapter, notionToPractise, studyChapters } from '@/lib/next-step';
import { sourceStatusLabel, type Programme } from '@/lib/programmes';
import { DICTS, type Lang } from '@/lib/i18n';
import { gradeOn20, mastery, say, type Progress } from '@/lib/pisan';
import { Meter } from './shared';
import { SheetButton } from './learning-aids';
import { StreakBadge, type StreakView } from './streak';
import { chapterSkillKinds } from '@/lib/figures';
import { CHAPTER_NAMES, SkillList } from './skills';

export function Journey({ lang, level, progress, onPractice, onTracking, programme }: { lang: Lang; level: number; progress: Progress; onPractice: (notion: NotionId) => void; onTracking?: (() => void) | undefined; programme?: Programme | null | undefined }) {
  const d = DICTS[lang];
  const chapters = studyChapters(programme, chaptersForLevel(level), progress);
  const current = nextChapter(chapters);
  const [openIndex, setOpenIndex] = useState<number | null>(current?.index ?? null);
  const attempts = progress.attempts;
  const badges = [
    { icon: Star, name: d.journey.badgeList['first_step']?.[0], achieved: attempts.length > 0 },
    { icon: Award, name: d.journey.badgeList['detective']?.[0], achieved: attempts.some(a => a.kind === 'diagnostic') },
    { icon: CheckCircle2, name: say(lang, 'Fondamentaux solides', 'Strong foundations', 'أساسيات متينة', 'Fundamentos sólidos'), achieved: progress.unlocked.length > 0 },
  ];
  const done = chapters.filter(c => c.mastery >= MASTERED).length;
  return <section className="mx-auto max-w-3xl">
    <div className="section-heading"><h1>{say(lang, 'Mon parcours', 'My path', 'مساري', 'Mi recorrido')}</h1><p>{say(lang, `${done} chapitre${done > 1 ? 's' : ''} maîtrisé${done > 1 ? 's' : ''} sur ${chapters.length}. Pas de classement : juste toi et tes progrès.`, `${done} of ${chapters.length} chapters mastered. No rankings: just you and your progress.`, `أتقنت ${done} من ${chapters.length} فصول. بلا ترتيب: أنت وتقدمك فقط.`, `${done} de ${chapters.length} capítulos dominados. Sin clasificaciones: solo tú y tu progreso.`)}</p>
      {programme && <p className="mt-2 text-xs text-muted-foreground">{programme.track ? `${programme.track.label[lang]} · ` : ''}{programme.source.label} · {sourceStatusLabel(programme.source.status, lang)}</p>}
    </div>
    <div className="mb-6 flex flex-wrap gap-2">{badges.map((b, i) => <span key={i} className={`pill ${b.achieved ? 'bg-sun-soft text-sun-foreground' : 'text-muted-foreground'}`}><b.icon className="h-3.5 w-3.5" aria-hidden />{b.name}{!b.achieved && <span className="sr-only"> · {d.journey.locked}</span>}</span>)}</div>
    <ol className="space-y-2">{chapters.map(c => {
      const isOpen = openIndex === c.index;
      const isCurrent = current?.index === c.index;
      return <li key={c.index} className={`chapter-row ${isCurrent ? 'chapter-row-current' : ''}`}>
        <button type="button" className="chapter-row-head" aria-expanded={isOpen} onClick={() => setOpenIndex(isOpen ? null : c.index)}>
          <span className="chapter-number">{String(c.index + 1).padStart(2, '0')}</span>
          <span className="flex-1 text-start font-semibold leading-snug">{c.title[lang]}{isCurrent && <span className="ms-2 align-middle text-xs font-bold text-primary-deep">· {c.started ? say(lang, 'en cours', 'in progress', 'قيد الإنجاز', 'en curso') : say(lang, 'à commencer', 'up next', 'التالي', 'el siguiente')}</span>}</span>
          {c.mastery >= MASTERED ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-label={say(lang, 'Maîtrisé', 'Mastered', 'متقن', 'Dominado')} /> : <span className="shrink-0 text-sm font-bold text-muted-foreground">{c.started ? `${c.mastery} %` : '—'}</span>}
        </button>
        {isOpen && <div className="chapter-row-body">
          <div className="mb-2 flex justify-between text-xs"><span>{d.journey.mastery}</span><span className="font-bold">{c.started ? `${c.mastery} %` : say(lang, 'Pas encore commencé', 'Not started yet', 'لم يبدأ بعد', 'Sin empezar')}</span></div>
          <Meter value={c.mastery} />
          {chapterSkillKinds(c).map(k => <div key={k} className="mt-4"><p className="mb-1 text-xs font-bold text-muted-foreground">{say(lang, `Compétences · ${CHAPTER_NAMES[k].fr} (à l’atelier)`, `Skills · ${CHAPTER_NAMES[k].en} (in the workshop)`, `الكفايات · ${CHAPTER_NAMES[k].ar} (في الورشة)`, `Competencias · ${CHAPTER_NAMES[k].es} (en el taller)`)}</p><SkillList lang={lang} kind={k} attempts={attempts} /></div>)}
          <div className="mt-4 flex flex-wrap gap-2">{c.notions.map(id => <SheetButton key={id} notion={id} lang={lang} variant="ghost" />)}</div>
          <Button className="mt-4" onClick={() => onPractice(notionToPractise(c, progress))}>{say(lang, 'S’entraîner sur ce chapitre', 'Practise this chapter', 'تدرّب على هذا الفصل', 'Practicar este capítulo')}<ArrowRight /></Button>
        </div>}
      </li>;
    })}</ol>
    {onTracking && <div className="mt-8 text-center"><Button variant="link" onClick={onTracking}><LayoutDashboard />{say(lang, 'Montrer mes progrès à un adulte', 'Show my progress to an adult', 'أظهر تقدمي لشخص بالغ', 'Enseñar mi progreso a un adulto')}</Button></div>}
  </section>;
}

export function Dashboard({ lang, level, progress, nickname, chapters, streak, programme }: { lang: Lang; level: number; progress: Progress; nickname: string; chapters?: Notion[] | undefined; streak?: StreakView | undefined; programme?: Programme | null | undefined }) {
  // Mêmes chapitres et mêmes noms que « Mon parcours ».
  const rows = studyChapters(programme, chapters ?? chaptersForLevel(level), progress);
  const d = DICTS[lang];
  const attempts = progress.attempts;
  const exams = attempts.filter(a => a.kind === 'exam');
  const minutes = attempts.reduce((s, a) => s + a.minutes, 0);
  const average = exams.length ? Math.round(exams.reduce((s, a) => s + gradeOn20(a.correct, a.total), 0) / exams.length * 10) / 10 : null;
  const days = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - (6 - i)); const key = date.toISOString().slice(0, 10); return { label: date.toLocaleDateString({ fr: 'fr-FR', en: 'en-US', ar: 'ar-MA', es: 'es-ES' }[lang], { weekday: 'short' }), count: attempts.filter(a => a.date.slice(0, 10) === key).length }; });
  // Échelle d'au moins 3 activités : une seule activité ne remplit pas toute la colonne.
  const max = Math.max(3, ...days.map(d => d.count));
  return <section><div className="section-heading"><span className="eyebrow">{d.dash.subtitle}</span><h1>{say(lang, 'Les progrès de', 'Progress for', 'تقدم', 'El progreso de')} {nickname}</h1><p>{say(lang, 'Des repères pour encourager, pas pour comparer.', 'Insights to encourage, not to compare.', 'مؤشرات للتشجيع وليس للمقارنة.', 'Indicadores para animar, no para comparar.')}</p></div>{streak && <div className="mb-8"><StreakBadge lang={lang} streak={streak} /></div>}<div className="stats-row mb-10">{[{ icon: CheckCircle2, label: d.dash.exercises, value: attempts.length }, { icon: TrendingUp, label: say(lang, 'Moyenne des contrôles', 'Mock test average', 'متوسط الاختبارات', 'Media de exámenes'), value: average === null ? '— / 20' : `${average} / 20` }, { icon: Award, label: d.dash.prereqs, value: progress.unlocked.length }, { icon: Flame, label: d.dash.totalTime, value: `${minutes} min` }].map((s, i) => <div key={i} className="stat-item"><s.icon className="mb-3 h-5 w-5 text-primary-deep" /><p className="text-3xl font-bold">{s.value}</p><p className="mt-2 text-xs text-muted-foreground">{s.label}</p></div>)}</div><div className="grid gap-10 lg:grid-cols-2"><div><h2 className="mb-6 text-xl">{d.dash.mastery}</h2><div className="space-y-5">{rows.map(r => <div key={r.index}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{r.title[lang]}</span><span className={`shrink-0 whitespace-nowrap ${r.started ? 'font-bold' : 'text-xs text-muted-foreground'}`}>{r.started ? `${r.mastery} %` : say(lang, 'pas commencé', 'not started', 'لم يبدأ', 'sin empezar')}</span></div>{r.started && <Meter value={r.mastery} />}</div>)}</div></div><div><h2 className="mb-6 text-xl">{say(lang, 'Activité des 7 derniers jours', 'Activity over the last 7 days', 'نشاط الأيام السبعة الأخيرة', 'Actividad de los últimos 7 días')}</h2><div className="activity-chart">{days.map((day, i) => <div className="chart-column" key={i}><span className="text-xs font-bold">{day.count}</span><div className={`chart-bar meter-${Math.round(day.count / max * 10)}`} /><span className="mt-3 text-xs text-muted-foreground">{day.label}</span></div>)}</div>{!attempts.length && <p className="mt-4 text-sm text-muted-foreground">{d.dash.noData}</p>}</div></div><div className="mt-10 grid gap-10 lg:grid-cols-2"><div><h2 className="mb-5 text-xl">{say(lang, 'Mes contrôles blancs', 'My mock tests', 'اختباراتي التجريبية', 'Mis exámenes de práctica')}</h2>{!exams.length ? <p className="text-sm text-muted-foreground">{d.dash.none}</p> : <div className="divide-y divide-border">{exams.slice().reverse().map((exam, i) => <div className="flex justify-between gap-3 py-4" key={i}><div><p className="font-bold">{getNotion(exam.notion).name[lang]}</p><p className="text-xs text-muted-foreground">{new Date(exam.date).toLocaleDateString(lang)}</p></div><span className="text-xl font-bold text-primary-deep">{gradeOn20(exam.correct, exam.total)} / 20</span></div>)}</div>}</div><div><h2 className="mb-5 text-xl">{d.dash.prereqs}</h2>{progress.unlocked.length ? <div className="space-y-3">{progress.unlocked.map(id => <div className="flex gap-3 bg-primary-soft p-4" key={id}><CheckCircle2 className="h-5 w-5 text-primary-deep" />{getNotion(id).name[lang]}</div>)}</div> : <p className="text-sm text-muted-foreground">{d.dash.none}</p>}</div></div></section>;
}