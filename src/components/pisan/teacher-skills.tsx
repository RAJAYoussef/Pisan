// Vue professeur : élèves × compétences des parcours, chapitre par chapitre.
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Check, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, assignmentProgress, daysLeft, knownSkills, todayIso, validDueDate } from '@/lib/assignments';
import { classAssignments, createAssignment, deleteAssignment } from '@/lib/teacher.functions';
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

// ───────────── Devoirs ─────────────

const fmtDay = (day: string, lang: Lang) => new Date(`${day}T12:00:00Z`).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Créer un devoir (un chapitre, des compétences, une date) et suivre qui l'a terminé. */
export function ClassAssignments({ lang, classId, kinds, students }: { lang: Lang; classId: string; kinds: FigureKind[]; students: ClassStudent[] }) {
  const qc = useQueryClient();
  const listFn = useServerFn(classAssignments), createFn = useServerFn(createAssignment), deleteFn = useServerFn(deleteAssignment);
  const list = useQuery({ queryKey: ['class-assignments', classId], queryFn: () => listFn({ data: { classId } }), enabled: Boolean(classId) });
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<FigureKind | ''>(kinds[0] ?? '');
  const [picked, setPicked] = useState<string[]>(() => (kinds[0] ? skillsFor(kinds[0]).map(s => s.id) : []));
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(() => addDays(todayIso(), 7));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const [openId, setOpenId] = useState('');
  if (!kinds.length) return null;
  const chooseKind = (k: FigureKind) => { setKind(k); setPicked(skillsFor(k).map(s => s.id)); };
  const toggle = (id: string) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const refresh = () => qc.invalidateQueries({ queryKey: ['class-assignments', classId] });
  async function create() {
    if (!kind || !picked.length || !validDueDate(due)) { setError(say(lang, 'Choisis au moins une compétence et une date à venir.', 'Pick at least one skill and a future date.', 'اختر كفاية واحدة على الأقل وتاريخًا قادمًا.', 'Elige al menos una competencia y una fecha futura.')); return; }
    setBusy(true); setError('');
    try { await createFn({ data: { classId, title: (title.trim() || CHAPTER_NAMES[kind][lang]).slice(0, 80), skillIds: picked, dueDate: due } }); await refresh(); setCreating(false); setTitle(''); }
    catch { setError(say(lang, 'Le devoir n’a pas pu être créé.', 'The assignment could not be created.', 'تعذر إنشاء الواجب.', 'No se pudo crear la tarea.')); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError('');
    try { await deleteFn({ data: { classId, id } }); await refresh(); setConfirmId(''); }
    catch { setError(say(lang, 'Suppression impossible.', 'Could not delete.', 'تعذر الحذف.', 'No se pudo eliminar.')); }
    finally { setBusy(false); }
  }
  return <section className="mt-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl">{say(lang, 'Devoirs', 'Assignments', 'الواجبات', 'Tareas')}</h3>{!creating && <Button variant="soft" onClick={() => setCreating(true)}><Plus />{say(lang, 'Nouveau devoir', 'New assignment', 'واجب جديد', 'Nueva tarea')}</Button>}</div>
    {creating && <div className="assign-form">
      <label className="field-label" htmlFor="assign-kind">{say(lang, 'Chapitre', 'Chapter', 'الفصل', 'Capítulo')}</label>
      <select id="assign-kind" className="form-select" value={kind} onChange={e => chooseKind(e.target.value as FigureKind)}>{kinds.map(k => <option key={k} value={k}>{CHAPTER_NAMES[k][lang]}</option>)}</select>
      {kind && <fieldset className="mt-3"><legend className="field-label">{say(lang, 'Compétences', 'Skills', 'الكفايات', 'Competencias')}</legend><div className="grid gap-1 sm:grid-cols-2">{skillsFor(kind).map(s => <label key={s.id} className="assign-check"><input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />{s.title[lang]}</label>)}</div></fieldset>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="assign-title">{say(lang, 'Titre (facultatif)', 'Title (optional)', 'العنوان (اختياري)', 'Título (opcional)')}</label><input id="assign-title" className="form-input" maxLength={80} value={title} placeholder={kind ? CHAPTER_NAMES[kind][lang] : ''} onChange={e => setTitle(e.target.value)} /></div>
        <div><label className="field-label" htmlFor="assign-due">{say(lang, 'Pour le', 'Due', 'قبل', 'Para el')}</label><input id="assign-due" type="date" className="form-input" min={todayIso()} value={due} onChange={e => setDue(e.target.value)} /></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void create()}>{say(lang, 'Assigner à la classe', 'Assign to the class', 'إسناد إلى القسم', 'Asignar a la clase')}</Button><Button variant="ghost" onClick={() => setCreating(false)}>{say(lang, 'Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></div>
    </div>}
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    {list.data && !list.data.length && !creating && <p className="mt-3 text-sm text-muted-foreground">{say(lang, 'Aucun devoir pour l’instant.', 'No assignments yet.', 'لا توجد واجبات حاليًا.', 'Sin tareas por ahora.')}</p>}
    <ul className="mt-3 grid gap-2">{(list.data ?? []).map(a => {
      const rows = students.map(st => ({ st, p: assignmentProgress(st.progress.attempts, a) }));
      const finished = rows.filter(r => r.p.complete).length;
      const left = daysLeft(a.due_date);
      return <li key={a.id} className="assign-item">
        <button type="button" className="assign-head" aria-expanded={openId === a.id} onClick={() => setOpenId(openId === a.id ? '' : a.id)}>
          <span className="min-w-0 flex-1 text-start"><span className="block font-bold">{a.title}</span><span className={`block text-xs ${left < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{say(lang, 'Pour le', 'Due', 'قبل', 'Para el')} {fmtDay(a.due_date, lang)} · {knownSkills(a.skill_ids).length} {say(lang, 'compétences', 'skills', 'كفايات', 'competencias')}</span></span>
          <span className="pill shrink-0">{finished}/{students.length} {say(lang, 'terminé', 'done', 'أنهوا', 'hecho')}</span>
        </button>
        {openId === a.id && <div className="assign-body">
          <ul className="grid gap-1 text-sm">{rows.map(({ st, p }) => <li key={st.id} className="flex items-center justify-between gap-3"><span>{st.profile.nickname}</span><span className={p.complete ? 'font-bold text-primary-deep' : p.started ? 'text-sun-foreground' : 'text-muted-foreground'}>{p.complete ? say(lang, '✓ Terminé', '✓ Done', '✓ أنهى', '✓ Hecho') : p.started ? `${p.done}/${p.total}` : say(lang, 'Pas commencé', 'Not started', 'لم يبدأ', 'Sin empezar')}</span></li>)}</ul>
          <div className="mt-3">{confirmId === a.id
            ? <span className="flex flex-wrap items-center gap-2 text-sm">{say(lang, 'Supprimer ce devoir ?', 'Delete this assignment?', 'حذف هذا الواجب؟', '¿Eliminar esta tarea?')}<Button size="sm" variant="destructive" disabled={busy} onClick={() => void remove(a.id)}>{say(lang, 'Supprimer', 'Delete', 'حذف', 'Eliminar')}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmId('')}>{say(lang, 'Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></span>
            : <Button size="sm" variant="ghost" onClick={() => setConfirmId(a.id)}>{say(lang, 'Supprimer', 'Delete', 'حذف', 'Eliminar')}</Button>}</div>
        </div>}
      </li>;
    })}</ul>
  </section>;
}
