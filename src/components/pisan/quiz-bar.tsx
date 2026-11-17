// Mode concentration : pendant les questions, une barre fine remplace le titre de la page.
import { X } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

export function QuizBar({ lang, done, total, label, onQuit }: { lang: Lang; done: number; total: number; label: string; onQuit: () => void }) {
  return <div className="quiz-bar">
    <button type="button" className="quiz-quit" onClick={onQuit} aria-label={say(lang, 'Quitter', 'Quit', 'خروج', 'Salir')}><X className="h-5 w-5" /></button>
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs"><span className="truncate font-bold text-muted-foreground">{label}</span><span className="shrink-0 font-bold">{Math.min(done + 1, total)}/{total}</span></div>
      <div className="quiz-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={say(lang, 'Progression', 'Progress', 'التقدم', 'Progreso')}><span style={{ width: `${(done / total) * 100}%` }} /></div>
    </div>
  </div>;
}
