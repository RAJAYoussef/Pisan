// Profil élève : code de reprise, déconnexion de l'appareil, et reprise d'un profil existant.
import { useEffect, useState } from 'react';
import { LegalLinks } from './legal';
import { useServerFn } from '@tanstack/react-start';
import { switchRecovery } from '@/lib/session.functions';
import { Copy, Eye, EyeOff, KeyRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { formatRecovery, formatShort, newShortCode, readShortCode, resolveRecovery, tokenFromShort } from '@/lib/recovery';

/** Dans les réglages : afficher et copier le code de reprise, puis se déconnecter (avec confirmation). */
export function AccountSection({ lang, token, onLogout, onKeyChange }: { lang: Lang; token: string; onLogout: () => void; onKeyChange?: (token: string, short: string) => void }) {
  const [shown, setShown] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState('');
  // Le code court n'est montré que s'il correspond bien à la clé de ce profil.
  const [short, setShort] = useState<string | null>(null);
  useEffect(() => { let off = false; const c = readShortCode(); if (c) void tokenFromShort(c).then(t => { if (!off) setShort(t === token ? c : null); }); else setShort(null); return () => { off = true; }; }, [token]);
  const switchFn = useServerFn(switchRecovery);
  const [busy, setBusy] = useState(false);
  async function shorten() {
    setBusy(true); setCopied('');
    try { const c = newShortCode(); const next = await tokenFromShort(c); await switchFn({ data: { token, newToken: next } }); onKeyChange?.(next, c); setShort(c); setShown(true); }
    catch { setCopied(say(lang, 'Impossible pour l’instant. Réessaie plus tard.', 'Not possible right now. Try again later.', 'غير ممكن الآن.', 'No es posible ahora.')); }
    setBusy(false);
  }
  const code = short ? formatShort(short) : formatRecovery(token);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(say(lang, 'Code copié.', 'Code copied.', 'تم نسخ الرمز.', 'Código copiado.')); }
    catch { setShown(true); setCopied(say(lang, 'Copie impossible : recopie le code à la main.', 'Could not copy: write the code down.', 'تعذر النسخ: اكتب الرمز يدويًا.', 'No se pudo copiar: anota el código.')); }
  }
  return <section className="account-box" aria-labelledby="account-title">
    <h3 id="account-title" className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-primary-deep" aria-hidden />{say(lang, 'Mon code de reprise', 'My recovery code', 'رمز الاسترجاع', 'Mi código de recuperación')}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{say(lang, 'Il te permet de retrouver ton profil et tes progrès sur un autre appareil. Ne le donne à personne.', 'It lets you get your profile and progress back on another device. Never share it.', 'يسمح لك باسترجاع ملفك وتقدمك على جهاز آخر. لا تعطه لأحد.', 'Te permite recuperar tu perfil en otro dispositivo. No lo compartas.')}</p>
    <p className="account-code" dir="ltr" aria-live="polite">{shown ? code : short ? '••••-••••-••••' : '••••••••-••••••••-••••••••-…'}</p>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="soft" onClick={() => setShown(!shown)} aria-pressed={shown}>{shown ? <EyeOff /> : <Eye />}{shown ? say(lang, 'Masquer', 'Hide', 'إخفاء', 'Ocultar') : say(lang, 'Afficher', 'Show', 'إظهار', 'Mostrar')}</Button>
      <Button size="sm" variant="soft" onClick={() => void copy()}><Copy />{say(lang, 'Copier', 'Copy', 'نسخ', 'Copiar')}</Button>
    </div>
    {copied && <p role="status" className="mt-2 text-sm text-primary-deep">{copied}</p>}
    {!short && onKeyChange && <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
      <p>{say(lang, 'Ton code est long à recopier. Tu peux le remplacer par un code court de 12 caractères (tes progrès sont gardés ; l’ancien code ne marchera plus, reconnecte tes autres appareils avec le nouveau).', 'Your code is long to copy. You can swap it for a short 12-character code (progress kept; the old code stops working, sign in again on your other devices with the new one).', 'يمكنك استبداله برمز قصير من 12 حرفًا.', 'Puedes cambiarlo por un código corto de 12 caracteres.')}</p>
      <Button size="sm" className="mt-2" disabled={busy} onClick={() => void shorten()}><KeyRound />{say(lang, 'Obtenir un code court', 'Get a short code', 'الحصول على رمز قصير', 'Obtener un código corto')}</Button>
    </div>}
    <div className="mt-4 border-t border-border pt-4">
      {!confirm
        ? <Button variant="ghost" onClick={() => setConfirm(true)}><LogOut />{say(lang, 'Se déconnecter de cet appareil', 'Log out of this device', 'تسجيل الخروج من هذا الجهاز', 'Cerrar sesión en este dispositivo')}</Button>
        : <div role="alertdialog" aria-labelledby="logout-title" className="account-confirm">
          <p id="logout-title" className="font-bold">{say(lang, 'Fermer ton profil sur cet appareil ?', 'Close your profile on this device?', 'إغلاق ملفك على هذا الجهاز؟', '¿Cerrar tu perfil en este dispositivo?')}</p>
          <p className="mt-1 text-sm">{say(lang, 'Tes progrès restent sauvegardés. Pour les retrouver, il te faudra ton code de reprise : note-le ou copie-le avant.', 'Your progress stays saved. To get it back you will need your recovery code: copy it first.', 'يبقى تقدمك محفوظًا. لاسترجاعه ستحتاج إلى رمز الاسترجاع: انسخه قبل ذلك.', 'Tu progreso queda guardado. Para recuperarlo necesitarás tu código: cópialo antes.')}</p>
          <div className="mt-3 flex flex-wrap gap-2"><Button variant="destructive" onClick={onLogout}><LogOut />{say(lang, 'Se déconnecter', 'Log out', 'خروج', 'Cerrar sesión')}</Button><Button variant="ghost" onClick={() => setConfirm(false)}>{say(lang, 'Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></div>
        </div>}
    </div>
    <div className="mt-4"><LegalLinks lang={lang} /></div>
  </section>;
}

/** Sur l'écran d'accueil d'un nouveau profil : « J'ai déjà un profil » + code de reprise. */
export function ResumeProfile({ lang, onResume }: { lang: Lang; onResume: (token: string, short: string | null) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    const found = await resolveRecovery(value);
    if (!found) { setError(say(lang, 'Le code contient 12 caractères (ou 64 pour les anciens codes). Vérifie-le.', 'The code has 12 characters (or 64 for older codes). Check it.', 'يتكون الرمز من 12 حرفًا (أو 64 للرموز القديمة).', 'El código tiene 12 caracteres (o 64 los antiguos).')); return; }
    setBusy(true); setError('');
    try { if (!(await onResume(found.token, found.short))) setError(say(lang, 'Aucun profil ne correspond à ce code.', 'No profile matches this code.', 'لا يوجد ملف يطابق هذا الرمز.', 'Ningún perfil corresponde a este código.')); }
    catch { setError(say(lang, 'Vérification impossible. Réessaie.', 'Could not check. Try again.', 'تعذر التحقق. حاول مجددًا.', 'No se pudo comprobar. Reintenta.')); }
    finally { setBusy(false); }
  }
  if (!open) return <div className="mt-4 text-center"><Button variant="link" onClick={() => setOpen(true)}><KeyRound />{say(lang, 'J’ai déjà un profil', 'I already have a profile', 'لدي ملف بالفعل', 'Ya tengo un perfil')}</Button></div>;
  return <div className="account-box mt-4">
    <label htmlFor="resume-code" className="field-label">{say(lang, 'Ton code de reprise', 'Your recovery code', 'رمز الاسترجاع', 'Tu código de recuperación')}</label>
    <input id="resume-code" dir="ltr" className="form-input font-mono" autoComplete="off" spellCheck={false} placeholder="XXXX-XXXX-XXXX" value={value} onChange={e => { setValue(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') void submit(); }} />
    <div className="mt-3 flex flex-wrap gap-2"><Button disabled={busy || !value.trim()} onClick={() => void submit()}>{say(lang, 'Reprendre mon profil', 'Resume my profile', 'استرجاع ملفي', 'Recuperar mi perfil')}</Button><Button variant="ghost" onClick={() => setOpen(false)}>{say(lang, 'Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></div>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
  </div>;
}
