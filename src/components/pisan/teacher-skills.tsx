// Vue professeur : élèves × compétences des parcours, chapitre par chapitre.
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Check, Pencil, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, assignedTo, assignmentProgress, daysLeft, knownSkills, todayIso, validDueDate, type AssignmentKind } from '@/lib/assignments';
import { classAssignments, createAssignment, deleteAssignment, updateAssignment } from '@/lib/teacher.functions';
import { blockingSkills, type ClassStudent } from '@/lib/classroom';
import { figuresFor, type FigureKind } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { programmeFor, programmeNotions } from '@/lib/programmes';
import { getLevel } from '@/lib/curriculum';
import { skillsFor, skillStatus, type SkillStatus } from '@/lib/skills';
import { CHAPTER_NAMES } from './chapter-names';

/** Les chapitres à parcours du programme de la classe. */
export function classSkillKinds(country: string, grade: number, track?: string | null): FigureKind[] {
  const programme = programmeFor(country, grade, track ?? undefined);
  return programme ? figuresFor(programme, programmeNotions(programme).map(n => n.id), getLevel(country, grade)) : [];
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

type Draft = { id: string | null; kind: AssignmentKind; skillIds: string[]; title: string; due: string; everyone: boolean; memberIds: string[] };
const emptyDraft = (): Draft => ({ id: null, kind: 'skills', skillIds: [], title: '', due: addDays(todayIso(), 7), everyone: true, memberIds: [] });
type Row = { id: string; title: string; skill_ids: string[]; due_date: string; created_at: string; kind: AssignmentKind; member_ids: string[] | null };

/** Créer ou modifier un devoir (parcours ou mini-contrôle, un ou plusieurs chapitres, toute la classe ou certains élèves) et suivre qui l'a terminé. */
export function ClassAssignments({ lang, classId, kinds, students }: { lang: Lang; classId: string; kinds: FigureKind[]; students: ClassStudent[] }) {
  const qc = useQueryClient();
  const listFn = useServerFn(classAssignments), createFn = useServerFn(createAssignment), updateFn = useServerFn(updateAssignment), deleteFn = useServerFn(deleteAssignment);
  const list = useQuery({ queryKey: ['class-assignments', classId], queryFn: () => listFn({ data: { classId } }), enabled: Boolean(classId) });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const [openId, setOpenId] = useState('');
  if (!kinds.length) return null;
  const refresh = () => qc.invalidateQueries({ queryKey: ['class-assignments', classId] });
  const t = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  const edit = (r: Row) => setDraft({ id: r.id, kind: r.kind, skillIds: r.skill_ids, title: r.title, due: r.due_date, everyone: !r.member_ids, memberIds: r.member_ids ?? [] });
  async function save() {
    if (!draft) return;
    if (!draft.skillIds.length || !validDueDate(draft.due)) { setError(t('Choisis au moins une compétence et une date à venir.', 'Pick at least one skill and a future date.', 'اختر كفاية واحدة على الأقل وتاريخًا قادمًا.', 'Elige al menos una competencia y una fecha futura.')); return; }
    if (!draft.everyone && !draft.memberIds.length) { setError(t('Choisis au moins un élève.', 'Pick at least one pupil.', 'اختر تلميذًا واحدًا على الأقل.', 'Elige al menos un alumno.')); return; }
    const firstKind = knownSkills(draft.skillIds)[0]?.chapter;
    const title = (draft.title.trim() || (firstKind ? CHAPTER_NAMES[firstKind][lang] : t('Devoir', 'Assignment', 'واجب', 'Tarea'))).slice(0, 80);
    const data = { classId, title, skillIds: draft.skillIds, dueDate: draft.due, kind: draft.kind, memberIds: draft.everyone ? null : draft.memberIds };
    setBusy(true); setError('');
    try { if (draft.id) await updateFn({ data: { ...data, id: draft.id } }); else await createFn({ data }); await refresh(); setDraft(null); }
    catch { setError(t('Le devoir n’a pas pu être enregistré.', 'The assignment could not be saved.', 'تعذر حفظ الواجب.', 'No se pudo guardar la tarea.')); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError('');
    try { await deleteFn({ data: { classId, id } }); await refresh(); setConfirmId(''); }
    catch { setError(t('Suppression impossible.', 'Could not delete.', 'تعذر الحذف.', 'No se pudo eliminar.')); }
    finally { setBusy(false); }
  }
  return <section className="mt-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl">{t('Devoirs', 'Assignments', 'الواجبات', 'Tareas')}</h3>{!draft && <Button variant="soft" onClick={() => { setDraft(emptyDraft()); setError(''); }}><Plus />{t('Nouveau devoir', 'New assignment', 'واجب جديد', 'Nueva tarea')}</Button>}</div>
    {draft && <AssignmentForm lang={lang} kinds={kinds} students={students} draft={draft} setDraft={setDraft} busy={busy} onSave={() => void save()} onCancel={() => { setDraft(null); setError(''); }} />}
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    {list.data && !list.data.length && !draft && <p className="mt-3 text-sm text-muted-foreground">{t('Aucun devoir pour l’instant.', 'No assignments yet.', 'لا توجد واجبات حاليًا.', 'Sin tareas por ahora.')}</p>}
    <ul className="mt-3 grid gap-2">{(list.data ?? []).map(a => {
      const targeted = students.filter(st => assignedTo(a, st.id));
      const rows = targeted.map(st => ({ st, p: assignmentProgress(st.progress.attempts, a) }));
      const finished = rows.filter(r => r.p.complete).length;
      const left = daysLeft(a.due_date);
      return <li key={a.id} className="assign-item">
        <button type="button" className="assign-head" aria-expanded={openId === a.id} onClick={() => setOpenId(openId === a.id ? '' : a.id)}>
          <span className="min-w-0 flex-1 text-start"><span className="block font-bold">{a.title}</span>
            <span className={`block text-xs ${left < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{a.kind === 'review' ? t('Mini-contrôle', 'Quick check', 'مراقبة قصيرة', 'Mini control') : t('Parcours', 'Pathways', 'مسارات', 'Itinerarios')} · {a.skill_ids.length} {t('compétence(s)', 'skill(s)', 'كفاية', 'competencia(s)')} · {a.member_ids ? `${a.member_ids.length} ${t('élève(s)', 'pupil(s)', 'تلميذ', 'alumno(s)')}` : t('toute la classe', 'whole class', 'كل القسم', 'toda la clase')} · {t('pour le', 'due', 'قبل', 'para el')} {fmtDay(a.due_date, lang)}</span></span>
          <span className="pill shrink-0">{finished}/{targeted.length} {t('terminé', 'done', 'أنهوا', 'hecho')}</span>
        </button>
        {openId === a.id && <div className="assign-body">
          <p className="mb-2 text-xs text-muted-foreground">{knownSkills(a.skill_ids).map(sk => `${CHAPTER_NAMES[sk.chapter][lang]} · ${sk.title[lang]}`).join(' — ')}</p>
          <ul className="grid gap-1 text-sm">{rows.map(({ st, p }) => <li key={st.id} className="flex items-center justify-between gap-3"><span>{st.profile.nickname}</span><span className={p.complete ? 'font-bold text-primary-deep' : p.started ? 'text-sun-foreground' : 'text-muted-foreground'}>{p.complete ? `✓ ${t('Terminé', 'Done', 'أنهى', 'Hecho')}` : `${p.done}/${p.total}`}</span></li>)}</ul>
          {a.member_ids && a.member_ids.some(id => !students.some(s => s.id === id)) && <p className="mt-2 text-xs text-muted-foreground">{t('Certains élèves choisis ont quitté la classe.', 'Some chosen pupils left the class.', 'غادر بعض التلاميذ القسم.', 'Algunos alumnos dejaron la clase.')}</p>}
          <div className="mt-3 flex flex-wrap gap-2">{confirmId === a.id
            ? <span className="flex flex-wrap items-center gap-2 text-sm">{t('Supprimer ce devoir ?', 'Delete this assignment?', 'حذف هذا الواجب؟', '¿Eliminar esta tarea?')}<Button size="sm" variant="destructive" disabled={busy} onClick={() => void remove(a.id)}>{t('Supprimer', 'Delete', 'حذف', 'Eliminar')}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmId('')}>{t('Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></span>
            : <><Button size="sm" variant="soft" onClick={() => { edit(a); setOpenId(''); }}><Pencil />{t('Modifier', 'Edit', 'تعديل', 'Editar')}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmId(a.id)}>{t('Supprimer', 'Delete', 'حذف', 'Eliminar')}</Button></>}</div>
        </div>}
      </li>;
    })}</ul>
  </section>;
}

function AssignmentForm({ lang, kinds, students, draft, setDraft, busy, onSave, onCancel }: { lang: Lang; kinds: FigureKind[]; students: ClassStudent[]; draft: Draft; setDraft: (d: Draft) => void; busy: boolean; onSave: () => void; onCancel: () => void }) {
  const t = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  const has = (id: string) => draft.skillIds.includes(id);
  const toggleSkill = (id: string) => setDraft({ ...draft, skillIds: has(id) ? draft.skillIds.filter(x => x !== id) : [...draft.skillIds, id] });
  const toggleChapter = (k: FigureKind) => {
    const ids = skillsFor(k).map(s => s.id), all = ids.every(has);
    setDraft({ ...draft, skillIds: all ? draft.skillIds.filter(x => !ids.includes(x)) : [...draft.skillIds, ...ids.filter(x => !has(x))] });
  };
  const toggleMember = (id: string) => setDraft({ ...draft, memberIds: draft.memberIds.includes(id) ? draft.memberIds.filter(x => x !== id) : [...draft.memberIds, id] });
  return <div className="assign-form">
    <fieldset><legend className="field-label">{t('Type de devoir', 'Assignment type', 'نوع الواجب', 'Tipo de tarea')}</legend>
      <div className="role-tabs mt-2">{(['skills', 'review'] as const).map(k => <button key={k} type="button" role="radio" aria-checked={draft.kind === k} aria-selected={draft.kind === k} className="role-tab" onClick={() => setDraft({ ...draft, kind: k })}>{k === 'skills' ? t('Parcours à faire', 'Pathways to do', 'مسارات', 'Itinerarios') : t('Mini-contrôle', 'Quick check', 'مراقبة قصيرة', 'Mini control')}</button>)}</div>
      <p className="text-xs text-muted-foreground">{draft.kind === 'skills' ? t('Terminé quand chaque compétence est acquise.', 'Done when every skill is mastered.', 'يُنجز عند اكتساب كل كفاية.', 'Hecho cuando todas están adquiridas.') : t('Une question par compétence, par séries de 4 ; terminé quand tout est passé (vous voyez les résultats).', 'One question per skill, in sets of 4; done when all are taken (you see the results).', 'سؤال لكل كفاية.', 'Una pregunta por competencia.')}</p>
    </fieldset>
    <fieldset className="mt-4"><legend className="field-label">{t('Compétences', 'Skills', 'الكفايات', 'Competencias')} · {draft.skillIds.length} {t('choisie(s)', 'chosen', 'مختارة', 'elegida(s)')}</legend>
      <div className="mt-2 grid gap-2">{kinds.map(k => {
        const skills = skillsFor(k), n = skills.filter(s => has(s.id)).length;
        return <details key={k} className="assign-chapter" open={n > 0}>
          <summary className="flex cursor-pointer items-center gap-2 py-1"><input type="checkbox" checked={n === skills.length} ref={el => { if (el) el.indeterminate = n > 0 && n < skills.length; }} onChange={() => toggleChapter(k)} onClick={e => e.stopPropagation()} aria-label={CHAPTER_NAMES[k][lang]} /><span className="font-bold">{CHAPTER_NAMES[k][lang]}</span>{n > 0 && <span className="pill">{n}/{skills.length}</span>}</summary>
          <div className="grid gap-1 ps-6 sm:grid-cols-2">{skills.map(s => <label key={s.id} className="assign-skill"><input type="checkbox" checked={has(s.id)} onChange={() => toggleSkill(s.id)} /> {s.title[lang]}</label>)}</div>
        </details>;
      })}</div>
    </fieldset>
    <fieldset className="mt-4"><legend className="field-label">{t('Pour qui ?', 'For whom?', 'لمن؟', '¿Para quién?')}</legend>
      <div className="mt-1 flex flex-wrap gap-4"><label className="assign-skill"><input type="radio" checked={draft.everyone} onChange={() => setDraft({ ...draft, everyone: true })} /> {t('Toute la classe', 'Whole class', 'كل القسم', 'Toda la clase')}</label><label className="assign-skill"><input type="radio" checked={!draft.everyone} onChange={() => setDraft({ ...draft, everyone: false })} /> {t('Certains élèves', 'Some pupils', 'بعض التلاميذ', 'Algunos alumnos')}</label></div>
      {!draft.everyone && <div className="mt-2 grid gap-1 sm:grid-cols-3">{students.map(st => <label key={st.id} className="assign-skill"><input type="checkbox" checked={draft.memberIds.includes(st.id)} onChange={() => toggleMember(st.id)} /> {st.profile.nickname}</label>)}{!students.length && <p className="text-sm text-muted-foreground">{t('Aucun élève dans la classe pour l’instant.', 'No pupils yet.', 'لا يوجد تلاميذ.', 'Sin alumnos.')}</p>}</div>}
    </fieldset>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div><label className="field-label" htmlFor="assign-title">{t('Titre (facultatif)', 'Title (optional)', 'العنوان (اختياري)', 'Título (opcional)')}</label><input id="assign-title" className="form-input" maxLength={80} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
      <div><label className="field-label" htmlFor="assign-due">{t('Pour le', 'Due', 'قبل', 'Para el')}</label><input id="assign-due" type="date" className="form-input" min={todayIso()} value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })} /></div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy} onClick={onSave}>{draft.id ? t('Enregistrer les modifications', 'Save changes', 'حفظ التعديلات', 'Guardar cambios') : draft.everyone ? t('Assigner à la classe', 'Assign to the class', 'إسناد إلى القسم', 'Asignar a la clase') : t('Assigner aux élèves choisis', 'Assign to chosen pupils', 'إسناد للتلاميذ المختارين', 'Asignar a los elegidos')}</Button><Button variant="ghost" onClick={onCancel}>{t('Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></div>
  </div>;
}
