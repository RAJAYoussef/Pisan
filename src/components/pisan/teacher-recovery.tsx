// Élève qui a perdu son code de reprise : l'enseignant lui en donne un nouveau (les progrès sont gardés) et
// peut imprimer une petite fiche à lui remettre.
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { KeyRound, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { reissueRecoveryCode } from '@/lib/teacher.functions';
import { formatRecovery } from '@/lib/recovery';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

/** Fiche imprimable : construite avec des nœuds texte (le pseudo de l'élève n'est jamais interprété comme du HTML). */
export function printRecoveryCard(lang: Lang, nickname: string, className: string, code: string) {
  const w = window.open('', '_blank', 'width=640,height=480');
  if (!w) return false;
  const doc = w.document;
  doc.title = 'PiSan';
  const style = doc.createElement('style');
  style.textContent = 'body{font-family:system-ui,sans-serif;padding:32px;color:#1d2433}.card{border:2px dashed #888;border-radius:16px;padding:24px;max-width:520px}h1{margin:0 0 4px;font-size:22px}.code{font:700 20px/1.5 ui-monospace,monospace;letter-spacing:.04em;margin:16px 0;word-break:break-all}p{margin:6px 0}';
  doc.head.appendChild(style);
  const card = doc.createElement('div'); card.className = 'card';
  const add = (tag: string, text: string, cls?: string) => { const el = doc.createElement(tag); el.textContent = text; if (cls) el.className = cls; card.appendChild(el); };
  add('h1', `PiSan · ${nickname}`);
  add('p', className);
  add('p', say(lang, 'Ton nouveau code de reprise :', 'Your new recovery code:', 'رمز الاسترجاع الجديد:', 'Tu nuevo código de recuperación:'));
  add('div', code, 'code');
  add('p', say(lang, 'Sur l’accueil de PiSan, choisis « J’ai déjà un profil » et recopie ce code. Garde cette fiche.', 'On the PiSan home page, choose “I already have a profile” and type this code. Keep this card.', 'في الصفحة الرئيسية اختر « لدي ملف » وأدخل هذا الرمز. احتفظ بهذه الورقة.', 'En PiSan elige «Ya tengo un perfil» y escribe este código. Guarda esta ficha.'));
  doc.body.appendChild(card);
  w.focus(); w.print();
  return true;
}

export function RecoveryButton({ lang, classId, className, memberId, nickname, onIssued }: { lang: Lang; classId: string; className: string; memberId: string; nickname: string; onIssued?: () => void }) {
  const issueFn = useServerFn(reissueRecoveryCode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  async function issue() {
    setBusy(true); setError('');
    try { const r = await issueFn({ data: { classId, memberId } }); setCode(formatRecovery(r.token)); onIssued?.(); }
    catch { setError(say(lang, 'Impossible de créer un nouveau code.', 'Could not create a new code.', 'تعذر إنشاء رمز جديد.', 'No se pudo crear un código.')); }
    setBusy(false);
  }
  return <>
    <Button variant="soft" onClick={() => { setOpen(true); setCode(''); setError(''); }}><KeyRound />{say(lang, 'Nouveau code de reprise', 'New recovery code', 'رمز استرجاع جديد', 'Nuevo código de recuperación')}</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogTitle>{say(lang, 'Nouveau code de reprise', 'New recovery code', 'رمز استرجاع جديد', 'Nuevo código de recuperación')} · {nickname}</DialogTitle>
      {!code ? <>
        <DialogDescription>{say(lang, 'Pour un élève qui a perdu son profil (navigateur vidé, autre appareil). Ses progrès sont gardés ; l’ancien code ne fonctionnera plus, y compris sur l’appareil qu’il utilise encore éventuellement.', 'For a pupil who lost their profile (cleared browser, new device). Progress is kept; the old code stops working, including on any device still in use.', 'لتلميذ فقد ملفه. تُحفظ نتائجه ويتوقف الرمز القديم.', 'Para un alumno que perdió su perfil. Se conserva el progreso; el código antiguo deja de funcionar.')}</DialogDescription>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button disabled={busy} onClick={() => void issue()}>{say(lang, 'Créer le nouveau code', 'Create the new code', 'إنشاء الرمز الجديد', 'Crear el código')}</Button>
      </> : <>
        <DialogDescription>{say(lang, 'À remettre à l’élève : sur l’accueil, « J’ai déjà un profil », puis ce code. Il ne sera plus affiché ensuite.', 'Give it to the pupil: on the home page, “I already have a profile”, then this code. It will not be shown again.', 'سلّمه للتلميذ. لن يُعرض مرة أخرى.', 'Entrégalo al alumno. No se volverá a mostrar.')}</DialogDescription>
        <p className="recovery-code" data-testid="recovery-code">{code}</p>
        <Button variant="soft" onClick={() => printRecoveryCard(lang, nickname, className, code)}><Printer />{say(lang, 'Imprimer la fiche', 'Print the card', 'طباعة الورقة', 'Imprimir la ficha')}</Button>
      </>}
    </DialogContent></Dialog>
  </>;
}
