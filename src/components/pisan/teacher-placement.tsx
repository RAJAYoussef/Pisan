// Tests de positionnement de la classe (vue enseignant) : lancer le test de début (A) ou de fin (B), l'ouvrir ou le
// fermer, et comparer les résultats élève par élève et chapitre par chapitre, avec le temps passé sur PiSan.
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Download, FileText, Lock, Play, Trash2, Unlock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { classTests, createClassTest, deleteClassTest, setClassTestOpen } from '@/lib/placement.functions';
import { classChapterAverages, placementCsv, placementRows } from '@/lib/placement';
import type { ClassStudent } from '@/lib/classroom';
import type { FigureKind } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { CHAPTER_NAMES } from './chapter-names';

const gainText = (g: number | null) => (g === null ? '—' : g > 0 ? `+${g}` : String(g));

export function PlacementPanel({ lang, classId, className, students }: { lang: Lang; classId: string; className: string; students: ClassStudent[] }) {
  const t = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(classTests), createFn = useServerFn(createClassTest), openFn = useServerFn(setClassTestOpen), deleteFn = useServerFn(deleteClassTest);
  const data = useQuery({ queryKey: ['class-tests', classId], queryFn: () => listFn({ data: { classId } }) });
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['class-tests', classId] });
  async function act(f: () => Promise<unknown>, fail: string) { setBusy(true); setError(''); try { await f(); await refresh(); } catch { setError(fail); } setBusy(false); }
  const tests = data.data?.tests ?? [], results = data.data?.results ?? [];
  const testA = tests.find(x => x.form === 'A'), testB = tests.find(x => x.form === 'B');
  const rows = placementRows(students, results, testA, testB);
  const avgA = testA ? classChapterAverages(results.filter(r => r.test_id === testA.id)) : new Map<FigureKind, number>();
  const avgB = testB ? classChapterAverages(results.filter(r => r.test_id === testB.id)) : new Map<FigureKind, number>();
  const chapters = [...new Set([...avgA.keys(), ...avgB.keys()])];
  const mean = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x !== null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
  const both = rows.filter(r => r.a !== null && r.b !== null);
  function exportCsv() {
    const csv = placementCsv(rows, chapters.map(k => ({ label: CHAPTER_NAMES[k][lang], a: avgA.get(k) ?? null, b: avgB.get(k) ?? null })), { pupil: t('Élève', 'Pupil', 'التلميذ', 'Alumno'), a: t('Début (%)', 'Start (%)', 'البداية (%)', 'Inicio (%)'), b: t('Fin (%)', 'End (%)', 'النهاية (%)', 'Final (%)'), gain: t('Progression (points)', 'Progress (points)', 'التقدم', 'Progreso'), minutes: t('Minutes sur PiSan', 'Minutes on PiSan', 'دقائق على PiSan', 'Minutos en PiSan'), activities: t('Activités', 'Activities', 'الأنشطة', 'Actividades'), chapter: t('Chapitre (moyenne de la classe)', 'Chapter (class average)', 'الفصل (معدل القسم)', 'Capítulo (media)') });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `PiSan-positionnement-${className}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  const testBox = (form: 'A' | 'B') => {
    const test = form === 'A' ? testA : testB;
    const label = form === 'A' ? t('Test de début (A)', 'Start-of-year test (A)', 'اختبار البداية (A)', 'Prueba inicial (A)') : t('Test de fin (B)', 'End-of-year test (B)', 'اختبار النهاية (B)', 'Prueba final (B)');
    if (!test) return <div className="placement-box"><p className="font-bold">{label}</p><p className="text-sm text-muted-foreground">{form === 'A' ? t('Toutes les compétences du programme de la classe, deux questions par chapitre.', 'Every chapter of the class curriculum, two questions each.', 'كل فصول البرنامج، سؤالان لكل فصل.', 'Todos los capítulos, dos preguntas cada uno.') : t('Les mêmes compétences que le test A, avec d’autres nombres.', 'The same skills as test A, with other numbers.', 'نفس كفايات الاختبار A بأعداد أخرى.', 'Las mismas competencias que A, con otros números.')}</p>
      <Button className="mt-2" disabled={busy} onClick={() => void act(() => createFn({ data: { classId, form } }), t('Le test n’a pas pu être lancé.', 'The test could not be started.', 'تعذر إطلاق الاختبار.', 'No se pudo lanzar.'))}><Play />{t('Lancer', 'Start', 'إطلاق', 'Lanzar')}</Button></div>;
    const done = results.filter(r => r.test_id === test.id).length;
    return <div className="placement-box"><p className="font-bold">{label} · {test.count} {t('questions', 'questions', 'سؤالًا', 'preguntas')}</p>
      <p className="text-sm">{test.is_open ? t('Ouvert : les élèves le voient sur leur accueil.', 'Open: pupils see it on their home page.', 'مفتوح: يراه التلاميذ.', 'Abierta: la ven en su inicio.') : t('Fermé.', 'Closed.', 'مغلق.', 'Cerrada.')} {done}/{students.length} {t('rendu(s)', 'submitted', 'سلّموا', 'entregada(s)')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="soft" disabled={busy} onClick={() => void act(() => openFn({ data: { classId, testId: test.id, open: !test.is_open } }), t('Mise à jour impossible.', 'Could not update.', 'تعذر التحديث.', 'No se pudo actualizar.'))}>{test.is_open ? <><Lock />{t('Fermer', 'Close', 'إغلاق', 'Cerrar')}</> : <><Unlock />{t('Rouvrir', 'Reopen', 'إعادة الفتح', 'Reabrir')}</>}</Button>
        {done === 0 && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act(() => deleteFn({ data: { classId, testId: test.id } }), t('Suppression impossible.', 'Could not delete.', 'تعذر الحذف.', 'No se pudo eliminar.'))}><Trash2 />{t('Supprimer', 'Delete', 'حذف', 'Eliminar')}</Button>}
      </div></div>;
  };
  return <section className="mt-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl">{t('Tests de positionnement', 'Placement tests', 'اختبارات تحديد المستوى', 'Pruebas de nivel')}</h3>
      {results.length > 0 && <div className="flex flex-wrap gap-2"><Button variant="soft" onClick={() => void navigate({ to: '/bilan', search: { classe: classId } })}><FileText />{t('Bilan imprimable', 'Printable report', 'تقرير للطباعة', 'Informe imprimible')}</Button><Button variant="soft" onClick={exportCsv}><Download />{t('Exporter (Excel)', 'Export (Excel)', 'تصدير', 'Exportar')}</Button></div>}</div>
    <p className="mt-1 text-sm text-muted-foreground">{t('À faire passer en classe, sans aide. Les élèves ne voient pas leur score ; vous voyez tout ici.', 'To be taken in class, without help. Pupils do not see their score; you see everything here.', 'يُجرى في القسم بدون مساعدة.', 'En clase, sin ayuda.')}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{testBox('A')}{testBox('B')}</div>
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    {results.length > 0 && <>
      <div className="mt-6 max-w-full overflow-x-auto"><table className="teacher-grid">
        <thead><tr><th>{t('Élève', 'Pupil', 'التلميذ', 'Alumno')}</th><th>{t('Début', 'Start', 'البداية', 'Inicio')}</th><th>{t('Fin', 'End', 'النهاية', 'Final')}</th><th>{t('Progression', 'Progress', 'التقدم', 'Progreso')}</th><th>{t('Temps sur PiSan', 'Time on PiSan', 'الوقت', 'Tiempo')}</th><th>{t('Activités', 'Activities', 'الأنشطة', 'Actividades')}</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.memberId}><th>{r.nickname}</th><td>{r.a === null ? '—' : `${r.a} %`}</td><td>{r.b === null ? '—' : `${r.b} %`}</td><td className={r.gain !== null && r.gain > 0 ? 'font-bold text-primary-deep' : ''}>{gainText(r.gain)}</td><td>{Math.floor(r.minutes / 60)} h {String(r.minutes % 60).padStart(2, '0')}</td><td>{r.activities}</td></tr>)}</tbody>
        <tfoot><tr><th>{t('Classe', 'Class', 'القسم', 'Clase')}</th><td>{mean(rows.map(r => r.a)) ?? '—'}{mean(rows.map(r => r.a)) !== null ? ' %' : ''}</td><td>{mean(rows.map(r => r.b)) ?? '—'}{mean(rows.map(r => r.b)) !== null ? ' %' : ''}</td><td>{gainText(mean(both.map(r => r.gain)))}</td><td /><td /></tr></tfoot>
      </table></div>
      {both.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{t(`Progression moyenne calculée sur les ${both.length} élève(s) qui ont passé les deux tests.`, `Average progress over the ${both.length} pupil(s) who took both tests.`, 'المعدل على التلاميذ الذين اجتازوا الاختبارين.', 'Media sobre quienes hicieron ambas.')}</p>}
      <h4 className="mt-6 font-bold">{t('Par chapitre (moyenne de la classe)', 'By chapter (class average)', 'حسب الفصل', 'Por capítulo')}</h4>
      <div className="mt-2 max-w-full overflow-x-auto"><table className="teacher-grid">
        <thead><tr><th>{t('Chapitre', 'Chapter', 'الفصل', 'Capítulo')}</th><th>{t('Début', 'Start', 'البداية', 'Inicio')}</th><th>{t('Fin', 'End', 'النهاية', 'Final')}</th><th>{t('Écart', 'Change', 'الفرق', 'Cambio')}</th></tr></thead>
        <tbody>{chapters.map(k => { const a = avgA.get(k) ?? null, b = avgB.get(k) ?? null; return <tr key={k}><th>{CHAPTER_NAMES[k][lang]}</th><td>{a === null ? '—' : `${a} %`}</td><td>{b === null ? '—' : `${b} %`}</td><td>{gainText(a !== null && b !== null ? b - a : null)}</td></tr>; })}</tbody>
      </table></div>
    </>}
  </section>;
}
