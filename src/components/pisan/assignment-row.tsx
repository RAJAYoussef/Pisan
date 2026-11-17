// Un devoir de la classe, en une ligne : titre, échéance, avancement (accueil et atelier).
import { ChevronRight, ClipboardCheck } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { say, type Progress } from '@/lib/pisan';
import { assignmentNext, assignmentProgress, daysLeft, type Assignment } from '@/lib/assignments';

export function AssignmentRow({ lang, assignment: a, attempts, onOpen }: { lang: Lang; assignment: Assignment; attempts: Progress['attempts']; onOpen: () => void }) {
  const p = assignmentProgress(attempts, a), left = daysLeft(a.due_date);
  const when = left < 0 ? say(lang, 'en retard', 'overdue', 'متأخر', 'atrasada') : left === 0 ? say(lang, 'pour aujourd’hui', 'due today', 'لليوم', 'para hoy') : left === 1 ? say(lang, 'pour demain', 'due tomorrow', 'للغد', 'para mañana') : say(lang, `dans ${left} jours`, `in ${left} days`, `خلال ${left} أيام`, `en ${left} días`);
  return <button type="button" className={`ws-row assign-row${p.complete ? ' assign-row-done' : ''}`} onClick={onOpen} disabled={p.complete && !assignmentNext(attempts, a)}>
    <span className="ws-row-icon module-teal"><ClipboardCheck /></span>
    <span className="min-w-0 flex-1 text-start"><span className="block text-xs font-bold text-primary-deep">{say(lang, 'Devoir', 'Assignment', 'واجب', 'Tarea')}{a.class_name ? ` · ${a.class_name}` : ''}</span><span className="block font-bold">{a.title}</span><span className={`block text-sm ${left < 0 && !p.complete ? 'text-destructive' : 'text-muted-foreground'}`}>{p.complete ? say(lang, '✓ Terminé', '✓ Done', '✓ منجز', '✓ Hecha') : `${p.done}/${p.total} · ${when}`}</span></span>
    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
  </button>;
}

