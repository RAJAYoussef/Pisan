// Connexion des enseignants : adresse e-mail + mot de passe (comptes créés par l'administrateur), et
// « mot de passe oublié » par e-mail. Utilisé sur l'accueil (onglet Enseignant) et sur /auth.
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

/** Drapeau posé au retour du lien « mot de passe oublié » : l'espace enseignant demande alors un nouveau mot de passe. */
export const RESET_FLAG = 'pisan-password-reset';

export function TeacherLogin({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) { setError(say(lang, 'Adresse e-mail ou mot de passe incorrect.', 'Wrong e-mail address or password.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'Correo o contraseña incorrectos.')); return; }
    await navigate({ to: '/teacher' });
  }
  async function forgot(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?type=recovery` });
    // Même message que le compte existe ou non : on ne révèle pas qui a un compte.
    setBusy(false); setSent(true);
  }
  return <div className="teacher-login">
    <h2 className="text-2xl">{say(lang, 'Espace enseignant', 'Teacher space', 'فضاء الأستاذ', 'Espacio docente')}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{mode === 'login'
      ? say(lang, 'Connecte-toi avec l’adresse e-mail et le mot de passe reçus.', 'Sign in with the e-mail address and password you were given.', 'سجّل الدخول بالبريد الإلكتروني وكلمة المرور اللذين توصلت بهما.', 'Inicia sesión con el correo y la contraseña recibidos.')
      : say(lang, 'Indique ton adresse e-mail : tu recevras un lien pour choisir un nouveau mot de passe.', 'Enter your e-mail address: you will receive a link to choose a new password.', 'أدخل بريدك الإلكتروني لتتوصل برابط لاختيار كلمة مرور جديدة.', 'Indica tu correo: recibirás un enlace para elegir una nueva contraseña.')}</p>
    <form onSubmit={mode === 'login' ? login : forgot} className="mt-5 space-y-4">
      <label className="field-label" htmlFor="teacher-email">{say(lang, 'Adresse e-mail', 'E-mail address', 'البريد الإلكتروني', 'Correo electrónico')}</label>
      <input id="teacher-email" type="email" required autoComplete="username" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
      {mode === 'login' && <>
        <label className="field-label" htmlFor="teacher-password">{say(lang, 'Mot de passe', 'Password', 'كلمة المرور', 'Contraseña')}</label>
        <div className="relative"><input id="teacher-password" type={show ? 'text' : 'password'} required autoComplete="current-password" className="form-input pe-12" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-muted-foreground" onClick={() => setShow(!show)} aria-label={show ? say(lang, 'Masquer le mot de passe', 'Hide password', 'إخفاء كلمة المرور', 'Ocultar contraseña') : say(lang, 'Afficher le mot de passe', 'Show password', 'إظهار كلمة المرور', 'Mostrar contraseña')}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
      </>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {sent && <p role="status" className="text-sm text-primary-deep">{say(lang, 'Si un compte existe pour cette adresse, un e-mail vient d’être envoyé (pense à regarder les spams).', 'If an account exists for this address, an e-mail has been sent (check your spam folder).', 'إذا كان هناك حساب بهذا العنوان، فقد أُرسل بريد إلكتروني (تحقق من الرسائل غير المرغوب فيها).', 'Si existe una cuenta, se ha enviado un correo (revisa el spam).')}</p>}
      <Button type="submit" disabled={busy} className="w-full">{mode === 'login' ? <><LogIn />{say(lang, 'Se connecter', 'Sign in', 'تسجيل الدخول', 'Entrar')}</> : say(lang, 'Recevoir le lien', 'Send the link', 'توصل بالرابط', 'Recibir el enlace')}</Button>
    </form>
    <Button variant="link" className="mt-2 px-0" onClick={() => { setMode(mode === 'login' ? 'forgot' : 'login'); setError(''); setSent(false); }}>{mode === 'login' ? say(lang, 'Mot de passe oublié ?', 'Forgot your password?', 'نسيت كلمة المرور؟', '¿Olvidaste la contraseña?') : say(lang, 'Retour à la connexion', 'Back to sign in', 'العودة إلى تسجيل الدخول', 'Volver')}</Button>
    <p className="mt-4 text-xs text-muted-foreground">{say(lang, 'Pas encore de compte ? Les comptes enseignants sont créés par PiSan pour ton établissement.', 'No account yet? Teacher accounts are created by PiSan for your school.', 'لا تملك حسابًا؟ تُنشأ حسابات الأساتذة من طرف PiSan لمؤسستك.', '¿Sin cuenta? PiSan crea las cuentas docentes para tu centro.')}</p>
  </div>;
}
