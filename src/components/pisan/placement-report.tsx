// Bilan imprimable d'une classe : résultats du test de début (A) et de fin (B), par élève et par chapitre, avec le
// temps passé sur PiSan. Conçu pour une feuille A4 (Imprimer → PDF) et pour être montré à d'autres établissements :
// les pseudos sont masqués par défaut.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { classDashboard, teacherOverview } from '@/lib/teacher.functions';
import { classTests } from '@/lib/placement.functions';
import { classChapterAverages, placementRows, placementSummary } from '@/lib/placement';
import { getCountry } from '@/lib/curriculum';
import { tracksFor } from '@/lib/programmes';
import { LANGS, dirOf, type Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import type { FigureKind } from '@/lib/figures';
import { BrandMark } from './brand';
import { CHAPTER_NAMES } from './chapter-names';

const signed = (g: number | null) => (g === null ? '—' : g > 0 ? `+${g}` : String(g));
const hours = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;

/** Barres début / fin par chapitre (SVG, lisible en noir et blanc grâce aux motifs). */
function ChapterBars({ lang, chapters }: { lang: Lang; chapters: { kind: FigureKind; a: number | null; b: number | null }[] }) {
  const row = 34, W = 640, label = 210, bar = W - label - 60;
  return <svg viewBox={`0 0 ${W} ${chapters.length * row + 24}`} className="report-chart" role="img" aria-label={say(lang, 'Réussite par chapitre, début et fin d’année', 'Success by chapter, start and end of year', 'النجاح حسب الفصل', 'Éxito por capítulo')}>
    <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" className="report-bar-a" /><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeWidth="2" /></pattern></defs>
    {[0, 25, 50, 75, 100].map(v => <g key={v}><line x1={label + (v / 100) * bar} x2={label + (v / 100) * bar} y1={0} y2={chapters.length * row} className="report-grid" /><text x={label + (v / 100) * bar} y={chapters.length * row + 16} textAnchor="middle" className="report-small">{v} %</text></g>)}
    {chapters.map((c, i) => <g key={c.kind} transform={`translate(0 ${i * row})`}>
      <text x={label - 8} y={row / 2 + 4} textAnchor="end" className="report-label">{CHAPTER_NAMES[c.kind][lang]}</text>
      {c.a !== null && <><rect x={label} y={5} width={(c.a / 100) * bar} height={11} fill="url(#hatch)" /><text x={label + (c.a / 100) * bar + 4} y={14} className="report-small">{c.a}</text></>}
      {c.b !== null && <><rect x={label} y={18} width={(c.b / 100) * bar} height={11} className="report-bar-b" /><text x={label + (c.b / 100) * bar + 4} y={27} className="report-small">{c.b}</text></>}
    </g>)}
  </svg>;
}

export function PlacementReport({ classId }: { classId: string }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [named, setNamed] = useState(false);
  const t = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  const overviewFn = useServerFn(teacherOverview), classFn = useServerFn(classDashboard), testsFn = useServerFn(classTests);
  const overview = useQuery({ queryKey: ['teacher-overview'], queryFn: () => overviewFn() });
  const details = useQuery({ queryKey: ['teacher-class', classId], queryFn: () => classFn({ data: { id: classId } }) });
  const tests = useQuery({ queryKey: ['class-tests', classId], queryFn: () => testsFn({ data: { classId } }) });
  if (details.isPending || tests.isPending || overview.isPending) return <main className="mx-auto max-w-3xl p-10"><p className="animate-pulse text-muted-foreground">PiSan…</p></main>;
  if (!details.data || !tests.data) return <main className="mx-auto max-w-3xl p-10"><p role="alert">{t('Bilan indisponible.', 'Report unavailable.', 'التقرير غير متاح.', 'Informe no disponible.')}</p></main>;
  const { classroom, students } = details.data;
  const testA = tests.data.tests.find(x => x.form === 'A'), testB = tests.data.tests.find(x => x.form === 'B');
  const results = tests.data.results;
  const rows = placementRows(students, results, testA, testB);
  const sum = placementSummary(rows);
  const avgA = testA ? classChapterAverages(results.filter(r => r.test_id === testA.id)) : new Map<FigureKind, number>();
  const avgB = testB ? classChapterAverages(results.filter(r => r.test_id === testB.id)) : new Map<FigureKind, number>();
  const chapters = [...new Set([...avgA.keys(), ...avgB.keys()])].map(kind => ({ kind, a: avgA.get(kind) ?? null, b: avgB.get(kind) ?? null }));
  const teacher = overview.data?.teacher;
  const country = getCountry(classroom.country);
  const track = classroom.track ? tracksFor(classroom.country, classroom.grade).find(x => x.id === classroom.track)?.label[lang] : '';
  const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang, { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
  const pupil = (i: number, nickname: string) => (named ? nickname : `${t('Élève', 'Pupil', 'التلميذ', 'Alumno')} ${i + 1}`);
  const card = (label: string, value: string, note?: string) => <div className="report-kpi"><p className="report-kpi-value">{value}</p><p className="report-kpi-label">{label}</p>{note && <p className="report-small-text">{note}</p>}</div>;
  return <div dir={dirOf(lang)} className="report-page">
    <div className="report-toolbar print:hidden">
      <Button variant="ghost" onClick={() => navigate({ to: '/teacher' })}><ArrowLeft className="rtl:rotate-180" />{t('Retour', 'Back', 'رجوع', 'Volver')}</Button>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={named} onChange={e => setNamed(e.target.checked)} />{t('Afficher les pseudos', 'Show nicknames', 'إظهار الأسماء المستعارة', 'Mostrar alias')}</label>
      <select aria-label="Language" className="language-select" value={lang} onChange={e => setLang(e.target.value as Lang)}>{LANGS.map(l => <option key={l.id} value={l.id}>{l.id.toUpperCase()}</option>)}</select>
      <Button onClick={() => window.print()}><Printer />{t('Imprimer / PDF', 'Print / PDF', 'طباعة / PDF', 'Imprimir / PDF')}</Button>
    </div>
    <article className="report-sheet">
      <header className="report-head"><BrandMark /><div className="text-end"><p className="report-small-text">{t('Bilan du', 'Report of', 'تقرير', 'Informe del')} {day(new Date().toISOString())}</p></div></header>
      <h1 className="report-title">{t('Bilan des tests de positionnement', 'Placement test report', 'تقرير اختبارات تحديد المستوى', 'Informe de las pruebas de nivel')}</h1>
      <p className="report-sub">{classroom.name} · {country.grades[classroom.grade]?.label[lang]}{track ? ` · ${track}` : ''} · {country.name[lang]}{teacher ? ` · ${teacher.school_name} · ${teacher.display_name}` : ''}</p>
      <p className="report-sub">{t('Test de début', 'Start test', 'اختبار البداية', 'Prueba inicial')} : {day(testA?.created_at)} · {t('Test de fin', 'End test', 'اختبار النهاية', 'Prueba final')} : {testB ? day(testB.created_at) : t('pas encore passé', 'not taken yet', 'لم يُجرَ بعد', 'aún no')}</p>

      <section className="report-kpis">
        {card(t('Moyenne au début', 'Start average', 'المعدل في البداية', 'Media inicial'), sum.avgA === null ? '—' : `${sum.avgA} %`, `${sum.tookA}/${sum.pupils} ${t('élèves', 'pupils', 'تلاميذ', 'alumnos')}`)}
        {card(t('Moyenne à la fin', 'End average', 'المعدل في النهاية', 'Media final'), sum.avgB === null ? '—' : `${sum.avgB} %`, `${sum.tookB}/${sum.pupils} ${t('élèves', 'pupils', 'تلاميذ', 'alumnos')}`)}
        {card(t('Progression moyenne', 'Average progress', 'متوسط التقدم', 'Progreso medio'), sum.avgGain === null ? '—' : `${signed(sum.avgGain)} pts`, sum.both ? `${t('sur', 'over', 'على', 'sobre')} ${sum.both} ${t('élèves (2 tests)', 'pupils (both tests)', 'تلاميذ', 'alumnos')}` : undefined)}
        {card(t('Élèves en progrès', 'Pupils who progressed', 'التلاميذ المتقدمون', 'Alumnos que progresan'), sum.both ? `${sum.progressed}/${sum.both}` : '—', sum.both ? `${Math.round((sum.progressed / sum.both) * 100)} %` : undefined)}
      </section>

      {chapters.length > 0 && <section className="report-section"><h2>{t('Réussite par chapitre (moyenne de la classe)', 'Success by chapter (class average)', 'النجاح حسب الفصل', 'Éxito por capítulo')}</h2>
        <p className="report-legend"><span className="report-swatch report-swatch-a" /> {t('Début', 'Start', 'البداية', 'Inicio')} <span className="report-swatch report-swatch-b" /> {t('Fin', 'End', 'النهاية', 'Final')}</p>
        <ChapterBars lang={lang} chapters={chapters} /></section>}

      {sum.both > 1 && <section className="report-section report-keep"><h2>{t('Utilisation de PiSan et progression', 'Use of PiSan and progress', 'استعمال PiSan والتقدم', 'Uso de PiSan y progreso')}</h2>
        <p>{t(`Temps total passé sur PiSan depuis le test de début : ${hours(sum.minutes)}, soit ${hours(Math.round(sum.minutes / Math.max(1, sum.pupils)))} par élève en moyenne.`, `Total time on PiSan since the start test: ${hours(sum.minutes)}, ${hours(Math.round(sum.minutes / Math.max(1, sum.pupils)))} per pupil on average.`, `الوقت الإجمالي على PiSan: ${hours(sum.minutes)}.`, `Tiempo total en PiSan: ${hours(sum.minutes)}.`)}</p>
        <table className="report-table"><thead><tr><th /><th>{t('Élèves', 'Pupils', 'التلاميذ', 'Alumnos')}</th><th>{t('Progression moyenne', 'Average progress', 'متوسط التقدم', 'Progreso medio')}</th></tr></thead><tbody>
          <tr><th>{t('Les plus réguliers (temps ≥ médiane)', 'Most regular (time ≥ median)', 'الأكثر انتظامًا', 'Los más constantes')}</th><td>{sum.regular.count}</td><td>{signed(sum.regular.gain)} pts</td></tr>
          <tr><th>{t('Les autres', 'The others', 'الآخرون', 'Los demás')}</th><td>{sum.occasional.count}</td><td>{signed(sum.occasional.gain)} pts</td></tr>
        </tbody></table></section>}

      <section className="report-section report-break"><h2>{t('Résultats par élève', 'Results by pupil', 'النتائج حسب التلميذ', 'Resultados por alumno')}</h2>
        <table className="report-table"><thead><tr><th>{t('Élève', 'Pupil', 'التلميذ', 'Alumno')}</th><th>{t('Début', 'Start', 'البداية', 'Inicio')}</th><th>{t('Fin', 'End', 'النهاية', 'Final')}</th><th>{t('Progression', 'Progress', 'التقدم', 'Progreso')}</th><th>{t('Temps sur PiSan', 'Time on PiSan', 'الوقت', 'Tiempo')}</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={r.memberId}><th>{pupil(i, r.nickname)}</th><td>{r.a === null ? '—' : `${r.a} %`}</td><td>{r.b === null ? '—' : `${r.b} %`}</td><td>{signed(r.gain)}</td><td>{hours(r.minutes)}</td></tr>)}</tbody></table></section>

      <footer className="report-foot report-keep"><h2>{t('Méthode', 'Method', 'المنهجية', 'Método')}</h2>
        <p>{t('Les tests A (début) et B (fin) portent sur les mêmes compétences du programme de la classe, deux questions par chapitre ; les questions de B sont équivalentes à celles de A, avec d’autres nombres. Ils sont passés en classe, sans aide ni indice, et corrigés automatiquement par le serveur. La progression est calculée uniquement sur les élèves qui ont passé les deux tests. Le temps sur PiSan est celui des activités faites depuis le test de début.', 'Tests A (start) and B (end) cover the same skills of the class curriculum, two questions per chapter; B’s questions are equivalent to A’s, with other numbers. They are taken in class, without help or hints, and marked automatically by the server. Progress is computed only for pupils who took both tests. Time on PiSan counts activities done since the start test.', 'يغطي الاختباران نفس الكفايات، ويُجريان في القسم بدون مساعدة ويُصححان آليًا.', 'Ambas pruebas cubren las mismas competencias, en clase, sin ayuda y corregidas automáticamente.')}</p></footer>
    </article>
  </div>;
}
