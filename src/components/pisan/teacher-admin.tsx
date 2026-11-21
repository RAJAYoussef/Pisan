// Espace enseignant : changement du mot de passe provisoire, et gestion des comptes (administrateur seulement).
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Copy, KeyRound, Plus, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { createTeacherAccount, listTeachers, passwordChanged, resetTeacherPassword, setTeacherActive } from '@/lib/admin.functions';
import { PASSWORD_MIN, passwordOk } from '@/lib/teacher-accounts';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

/** Première connexion (mot de passe provisoire) ou retour du lien « mot de passe oublié » : choisir son mot de passe. */
export function ChangePassword({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const doneFn = useServerFn(passwordChanged);
  const [a, setA] = useState(''), [b, setB] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!passwordOk(a)) { setError(say(lang, `Au moins ${PASSWORD_MIN} caractères, avec des lettres et des chiffres.`, `At least ${PASSWORD_MIN} characters, with letters and digits.`, `${PASSWORD_MIN} أحرف على الأقل، بحروف وأرقام.`, `Al menos ${PASSWORD_MIN} caracteres, con letras y cifras.`)); return; }
    if (a !== b) { setError(say(lang, 'Les deux mots de passe ne sont pas identiques.', 'The two passwords do not match.', 'كلمتا المرور غير متطابقتين.', 'Las contraseñas no coinciden.')); return; }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: a });
    if (err) { setBusy(false); setError(say(lang, 'Ce mot de passe n’a pas pu être enregistré. Essaie-en un autre.', 'This password could not be saved. Try another one.', 'تعذر حفظ كلمة المرور. جرّب أخرى.', 'No se pudo guardar. Prueba otra.')); return; }
    try { await doneFn(); } catch { /* le drapeau sera retiré à la prochaine fois */ }
    setBusy(false); onDone();
  }
  return <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
    <h2 className="text-2xl">{say(lang, 'Choisis ton mot de passe', 'Choose your password', 'اختر كلمة المرور', 'Elige tu contraseña')}</h2>
    <p className="text-sm text-muted-foreground">{say(lang, `Il remplace le mot de passe provisoire. Au moins ${PASSWORD_MIN} caractères, avec des lettres et des chiffres.`, `It replaces the temporary password. At least ${PASSWORD_MIN} characters, letters and digits.`, `تعوض كلمة المرور المؤقتة. ${PASSWORD_MIN} أحرف على الأقل.`, `Sustituye la contraseña provisional. Al menos ${PASSWORD_MIN} caracteres.`)}</p>
    <label className="field-label" htmlFor="new-password">{say(lang, 'Nouveau mot de passe', 'New password', 'كلمة المرور الجديدة', 'Nueva contraseña')}</label>
    <input id="new-password" type="password" autoComplete="new-password" required className="form-input" value={a} onChange={e => setA(e.target.value)} />
    <label className="field-label" htmlFor="new-password-2">{say(lang, 'Confirme-le', 'Confirm it', 'أكّدها', 'Confírmala')}</label>
    <input id="new-password-2" type="password" autoComplete="new-password" required className="form-input" value={b} onChange={e => setB(e.target.value)} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy} className="w-full">{say(lang, 'Enregistrer', 'Save', 'حفظ', 'Guardar')}</Button>
  </form>;
}

/** Réservé à l'administrateur : créer les comptes enseignants, réinitialiser un mot de passe, désactiver un compte. */
export function TeacherAccounts({ lang, selfId }: { lang: Lang; selfId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listTeachers), createFn = useServerFn(createTeacherAccount), resetFn = useServerFn(resetTeacherPassword), activeFn = useServerFn(setTeacherActive);
  const list = useQuery({ queryKey: ['teacher-accounts'], queryFn: () => listFn() });
  const [form, setForm] = useState({ email: '', display_name: '', school_name: '' });
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['teacher-accounts'] });
  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setIssued(null);
    try {
      const r = await createFn({ data: form });
      if (!r.ok) setError(r.reason === 'exists' ? say(lang, 'Un compte existe déjà pour cette adresse.', 'An account already exists for this address.', 'يوجد حساب بهذا العنوان.', 'Ya existe una cuenta.') : say(lang, 'Le compte n’a pas pu être créé.', 'The account could not be created.', 'تعذر إنشاء الحساب.', 'No se pudo crear la cuenta.'));
      else { setIssued({ email: form.email.trim().toLowerCase(), password: r.password }); setForm({ email: '', display_name: '', school_name: form.school_name }); setCreating(false); await refresh(); }
    } catch { setError(say(lang, 'Le compte n’a pas pu être créé.', 'The account could not be created.', 'تعذر إنشاء الحساب.', 'No se pudo crear la cuenta.')); }
    setBusy(false);
  }
  async function reset(id: string, email: string) {
    setBusy(true); setError(''); setIssued(null);
    try { const r = await resetFn({ data: { id } }); setIssued({ email, password: r.password }); await refresh(); } catch { setError(say(lang, 'Réinitialisation impossible.', 'Could not reset.', 'تعذرت إعادة التعيين.', 'No se pudo restablecer.')); }
    setBusy(false);
  }
  async function toggle(id: string, active: boolean) {
    setBusy(true); setError('');
    try { await activeFn({ data: { id, active } }); await refresh(); } catch { setError(say(lang, 'Mise à jour impossible.', 'Could not update.', 'تعذر التحديث.', 'No se pudo actualizar.')); }
    setBusy(false);
  }
  const copy = async () => { if (!issued) return; try { await navigator.clipboard.writeText(`${issued.email}\n${issued.password}`); setCopied(true); } catch { /* copie manuelle */ } };
  return <section className="admin-accounts">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="eyebrow">{say(lang, 'Administration', 'Administration', 'الإدارة', 'Administración')}</p><h2 className="mt-1 text-2xl">{say(lang, 'Comptes enseignants', 'Teacher accounts', 'حسابات الأساتذة', 'Cuentas docentes')}</h2></div>
      {!creating && <Button onClick={() => { setCreating(true); setIssued(null); }}><Plus />{say(lang, 'Nouveau compte', 'New account', 'حساب جديد', 'Nueva cuenta')}</Button>}
    </div>
    {issued && <div className="admin-issued" role="status">
      <p className="font-bold">{say(lang, 'À transmettre à l’enseignant (il choisira son propre mot de passe à la première connexion) :', 'Give this to the teacher (they will choose their own password when they first sign in):', 'سلّمها للأستاذ (سيختار كلمة مروره عند أول دخول):', 'Entrégalo al docente (elegirá su contraseña al entrar):')}</p>
      <p className="mt-2 font-mono">{issued.email}<br />{issued.password}</p>
      <Button size="sm" variant="soft" className="mt-2" onClick={() => void copy()}><Copy />{copied ? say(lang, 'Copié', 'Copied', 'نُسخ', 'Copiado') : say(lang, 'Copier', 'Copy', 'نسخ', 'Copiar')}</Button>
      <p className="mt-2 text-xs text-muted-foreground">{say(lang, 'Ce mot de passe provisoire ne sera plus affiché.', 'This temporary password will not be shown again.', 'لن تُعرض كلمة المرور المؤقتة مرة أخرى.', 'No se volverá a mostrar.')}</p>
    </div>}
    {creating && <form onSubmit={create} className="admin-form">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="field-label" htmlFor="acc-email">{say(lang, 'Adresse e-mail', 'E-mail address', 'البريد الإلكتروني', 'Correo')}</label><input id="acc-email" type="email" required className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="field-label" htmlFor="acc-name">{say(lang, 'Nom affiché', 'Display name', 'الاسم', 'Nombre')}</label><input id="acc-name" required maxLength={80} className="form-input" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} /></div>
        <div><label className="field-label" htmlFor="acc-school">{say(lang, 'Établissement', 'School', 'المؤسسة', 'Centro')}</label><input id="acc-school" required maxLength={120} className="form-input" value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex gap-2"><Button type="submit" disabled={busy}>{say(lang, 'Créer le compte', 'Create the account', 'إنشاء الحساب', 'Crear la cuenta')}</Button><Button type="button" variant="ghost" onClick={() => setCreating(false)}>{say(lang, 'Annuler', 'Cancel', 'إلغاء', 'Cancelar')}</Button></div>
    </form>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {list.isPending ? <p className="mt-4 text-sm text-muted-foreground">…</p> : <ul className="mt-4 grid gap-2">{(list.data ?? []).map(t => <li key={t.id} className={`admin-row ${t.active ? '' : 'admin-row-off'}`}>
      <span className="min-w-0 flex-1"><span className="block font-bold">{t.display_name || t.email}{t.admin && <span className="pill ms-2">{say(lang, 'admin', 'admin', 'مدير', 'admin')}</span>}</span>
        <span className="block text-xs text-muted-foreground">{t.email} · {t.school_name || '—'} · {!t.active ? say(lang, 'désactivé', 'disabled', 'معطّل', 'desactivada') : t.pending ? say(lang, 'mot de passe provisoire', 'temporary password', 'كلمة مرور مؤقتة', 'contraseña provisional') : t.last_sign_in_at ? `${say(lang, 'dernière connexion', 'last sign-in', 'آخر دخول', 'último acceso')} ${new Date(t.last_sign_in_at).toLocaleDateString(lang)}` : say(lang, 'jamais connecté', 'never signed in', 'لم يدخل بعد', 'nunca conectado')}</span></span>
      <span className="flex shrink-0 gap-1">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => void reset(t.id, t.email)} aria-label={`${say(lang, 'Nouveau mot de passe provisoire', 'New temporary password', 'كلمة مرور مؤقتة جديدة', 'Nueva contraseña provisional')} · ${t.email}`}><KeyRound /></Button>
        {t.id !== selfId && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void toggle(t.id, !t.active)} aria-label={`${t.active ? say(lang, 'Désactiver', 'Disable', 'تعطيل', 'Desactivar') : say(lang, 'Réactiver', 'Enable', 'تفعيل', 'Activar')} · ${t.email}`}>{t.active ? <UserX /> : <UserCheck />}</Button>}
      </span>
    </li>)}</ul>}
  </section>;
}
