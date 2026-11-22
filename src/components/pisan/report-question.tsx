// Bouton discret « Signaler une erreur » sous une question : motif + message facultatif, envoyé au serveur.
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { reportQuestion } from '@/lib/reports.functions';
import { REPORT_MESSAGE_MAX, type ReportContext, type ReportReason } from '@/lib/reports';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

export const reasonLabel = (lang: Lang, r: ReportReason | string) => ({
  'wrong-answer': say(lang, 'Ma réponse juste est refusée (ou l’inverse)', 'My correct answer is refused (or the reverse)', 'إجابتي الصحيحة مرفوضة (أو العكس)', 'Mi respuesta correcta es rechazada (o al revés)'),
  unclear: say(lang, 'L’énoncé n’est pas clair', 'The question is unclear', 'السؤال غير واضح', 'El enunciado no está claro'),
  display: say(lang, 'Problème d’affichage (figure, texte)', 'Display problem (figure, text)', 'مشكلة في العرض', 'Problema de visualización'),
  other: say(lang, 'Autre chose', 'Something else', 'شيء آخر', 'Otra cosa'),
} as Record<string, string>)[r] ?? r;

export function ReportQuestion({ lang, skill, seed, step, context }: { lang: Lang; skill: string; seed: number; step: number; context: ReportContext }) {
  const send = useServerFn(reportQuestion);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error' | 'limit'>('idle');
  const close = (o: boolean) => { setOpen(o); if (!o) { setReason(null); setMessage(''); if (state !== 'sent') setState('idle'); } };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setState('busy');
    try {
      const r = await send({ data: { skill, seed, step, context, lang, reason, message } });
      setState(r.ok ? 'sent' : r.reason === 'limit' ? 'limit' : 'error');
      if (r.ok) setOpen(false);
    } catch { setState('error'); }
  }
  if (state === 'sent') return <p role="status" className="report-sent">{say(lang, 'Merci ! Ton signalement a été transmis.', 'Thanks! Your report was sent.', 'شكرًا! تم إرسال بلاغك.', '¡Gracias! Tu aviso fue enviado.')}</p>;
  return <>
    <button type="button" className="report-link" onClick={() => setOpen(true)}><Flag className="h-3.5 w-3.5" aria-hidden />{say(lang, 'Signaler une erreur', 'Report a mistake', 'الإبلاغ عن خطأ', 'Señalar un error')}</button>
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogTitle>{say(lang, 'Signaler une erreur', 'Report a mistake', 'الإبلاغ عن خطأ', 'Señalar un error')}</DialogTitle>
        <DialogDescription>{say(lang, 'Ton signalement est anonyme : il nous aide à corriger la question.', 'Your report is anonymous: it helps us fix the question.', 'بلاغك مجهول الهوية ويساعدنا على تصحيح السؤال.', 'Tu aviso es anónimo: nos ayuda a corregir la pregunta.')}</DialogDescription>
        <form onSubmit={e => void submit(e)} className="grid gap-3">
          <fieldset className="grid gap-2">
            <legend className="field-label">{say(lang, 'Quel est le problème ?', 'What is wrong?', 'ما المشكلة؟', '¿Cuál es el problema?')}</legend>
            {(['wrong-answer', 'unclear', 'display', 'other'] as const).map(r => <label key={r} className="report-option">
              <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />{reasonLabel(lang, r)}
            </label>)}
          </fieldset>
          <div>
            <label className="field-label" htmlFor="report-message">{say(lang, 'Précise si tu veux (sans ton nom)', 'Add details if you like (no name)', 'أضف تفاصيل إن أردت (بدون اسمك)', 'Añade detalles si quieres (sin tu nombre)')}</label>
            <textarea id="report-message" className="form-input h-24 py-2" maxLength={REPORT_MESSAGE_MAX} value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          {state === 'error' && <p role="alert" className="text-sm text-destructive">{say(lang, 'Envoi impossible. Réessaie plus tard.', 'Could not send. Try again later.', 'تعذر الإرسال. حاول لاحقًا.', 'No se pudo enviar. Inténtalo más tarde.')}</p>}
          {state === 'limit' && <p role="alert" className="text-sm text-destructive">{say(lang, 'Trop de signalements pour le moment. Réessaie dans une heure.', 'Too many reports for now. Try again in an hour.', 'بلاغات كثيرة حاليًا. حاول بعد ساعة.', 'Demasiados avisos. Inténtalo en una hora.')}</p>}
          <Button type="submit" disabled={!reason || state === 'busy'}>{say(lang, 'Envoyer', 'Send', 'إرسال', 'Enviar')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
