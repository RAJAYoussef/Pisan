import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { MessageCircleQuestion, Send, X } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { askCoach } from '@/lib/coach.functions';
import type { CoachContext, CoachRef } from '@/lib/coach';
import { isDysActive } from '@/lib/dys';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import avatar from '@/assets/pisan-avatar.webp';
import { useDys } from './dys';

const TokenContext = createContext({ token: '', eligible: false });
export const CoachTokenProvider = ({ token, eligible, children }: { token: string; eligible: boolean; children: ReactNode }) => <TokenContext.Provider value={{ token, eligible }}>{children}</TokenContext.Provider>;

type Msg = { role: 'user' | 'assistant'; content: string; sig?: string };
type Props = { lang: Lang; activity: CoachContext['activity']; coachRef: CoachRef; step?: number; label?: string };

/** Bouton « Demander à Pi » et conversation privée, gardée en mémoire seulement pour l'exercice en cours. */
export function AskPi(props: Props) {
  // Nouvelle question = nouvelle conversation, rien n'est conservé.
  return <AskPiPanel key={`${JSON.stringify(props.coachRef)}|${props.step ?? ''}`} {...props} />;
}

function AskPiPanel({ lang, activity, coachRef, step, label }: Props) {
  const { token, eligible } = useContext(TokenContext);
  const ask = useServerFn(askCoach);
  const { prefs } = useDys();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (open && !busy) inputRef.current?.focus(); }, [open, busy]);
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  if (!token) return null;
  const t = {
    button: say(lang, 'Demander à Pi', 'Ask Pi', 'اسأل باي', 'Preguntar a Pi'),
    intro: say(lang, 'Je t’aide avec des indices, sans te donner la réponse. Qu’est-ce qui te bloque ?', 'I’ll help with hints, without giving you the answer. What’s blocking you?', 'سأساعدك بتلميحات دون أن أعطيك الجواب. ما الذي يصعب عليك؟', 'Te ayudo con pistas, sin darte la respuesta. ¿Qué te bloquea?'),
    placeholder: say(lang, 'Écris ta question…', 'Type your question…', 'اكتب سؤالك…', 'Escribe tu pregunta…'),
    send: say(lang, 'Envoyer', 'Send', 'إرسال', 'Enviar'),
    close: say(lang, 'Fermer', 'Close', 'إغلاق', 'Cerrar'),
    thinking: say(lang, 'Pi réfléchit…', 'Pi is thinking…', 'باي يفكر…', 'Pi está pensando…'),
    privacy: say(lang, 'Conversation privée : ni ton professeur ni tes parents ne la voient, et elle s’efface quand tu changes d’exercice.', 'Private chat: neither your teacher nor your parents can see it, and it disappears when you change exercise.', 'محادثة خاصة: لا يراها معلمك ولا والداك، وتُمحى عند تغيير التمرين.', 'Conversación privada: ni tu profesor ni tus padres la ven, y se borra al cambiar de ejercicio.'),
    left: (n: number) => say(lang, `${n} message(s) restant(s) aujourd’hui`, `${n} message(s) left today`, `${n} رسالة متبقية اليوم`, `${n} mensaje(s) restante(s) hoy`),
    quota: say(lang, 'Tu as utilisé tes 20 messages à Pi aujourd’hui. Reviens demain !', 'You’ve used your 20 messages to Pi today. Come back tomorrow!', 'استعملت رسائلك العشرين لباي اليوم. عد غدًا!', 'Has usado tus 20 mensajes a Pi hoy. ¡Vuelve mañana!'),
    busy: say(lang, 'Pi est très demandé. Réessaie dans un instant.', 'Pi is very busy. Try again in a moment.', 'باي مشغول جدًا. حاول بعد لحظة.', 'Pi está muy ocupado. Reintenta en un momento.'),
    credits: say(lang, 'Pi est indisponible pour le moment.', 'Pi is unavailable for now.', 'باي غير متاح حاليًا.', 'Pi no está disponible por ahora.'),
    locked: say(lang, 'Pi est disponible avec le code de ton établissement.', 'Pi is available with your school’s code.', 'باي متاح برمز مؤسستك.', 'Pi está disponible con el código de tu centro.'),
    resting: say(lang, 'Pi se repose, reviens demain.', 'Pi is resting, come back tomorrow.', 'باي يستريح، عد غدًا.', 'Pi está descansando, vuelve mañana.'),
    err: say(lang, 'Pi n’a pas pu répondre. Réessaie.', 'Pi couldn’t answer. Try again.', 'لم يتمكن باي من الرد. حاول مجددًا.', 'Pi no pudo responder. Reintenta.'),
  };
  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { fr: 'fr-FR', en: 'en-US', ar: 'ar-MA', es: 'es-ES' }[lang];
    u.rate = .88 * prefs.speechRate;
    window.speechSynthesis.speak(u);
  }
  async function send() {
    const content = input.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next); setInput(''); setBusy(true); setError('');
    try {
      const result = await ask({ data: { token, context: { activity, ref: coachRef, step, dys: isDysActive(prefs) }, messages: next } });
      if (result.ok) {
        setMessages(m => [...m, { role: 'assistant', content: result.reply, sig: result.sig }]); setRemaining(result.remaining);
        if (prefs.autoRead) speak(result.reply);
      } else {
        setError(t[result.reason === 'error' ? 'err' : result.reason]);
        if (result.reason === 'quota' || result.reason === 'resting' || result.reason === 'locked') setRemaining(0);
        setMessages(messages); setInput(content);
      }
    } catch { setError(t.err); setMessages(messages); setInput(content); }
    setBusy(false);
  }
  if (!eligible) return <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><MessageCircleQuestion className="h-4 w-4" />{t.locked}</p>;
  if (!open) return <Button variant="soft" className="mt-4" onClick={() => setOpen(true)}><MessageCircleQuestion />{label ?? t.button}</Button>;
  return <div className="mt-5 rounded-lg border border-border bg-card p-4" role="region" aria-label={t.button}>
    <div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><img src={avatar} alt="π" className="h-9 w-9 object-contain" /><p className="font-bold text-primary-deep">Pi</p></div><Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label={t.close}><X /></Button></div>
    <p className="mb-3 text-xs text-muted-foreground">{t.privacy} <a href="/coach" target="_blank" rel="noopener" className="underline underline-offset-2">{say(lang, 'Comme toute IA, Pi peut se tromper : en savoir plus', 'Like any AI, Pi can make mistakes: learn more', 'مثل أي ذكاء اصطناعي، قد يخطئ Pi: اعرف المزيد', 'Como toda IA, Pi puede equivocarse: más información')}</a></p>
    <div className="space-y-3" aria-live="polite">
      <p className="text-sm leading-relaxed">{t.intro}</p>
      {messages.map((m, i) => m.role === 'user'
        ? <p key={i} className="ms-auto max-w-[85%] w-fit rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{m.content}</p>
        : <p key={i} className="max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>)}
      {busy && <p className="animate-pulse text-sm text-muted-foreground">{t.thinking}</p>}
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <form className="mt-4 flex items-end gap-2" onSubmit={e => { e.preventDefault(); void send(); }}>
      <textarea ref={inputRef} rows={2} maxLength={600} value={input} disabled={busy || remaining === 0} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={t.placeholder} aria-label={t.placeholder} className="min-h-12 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <Button type="submit" size="icon" disabled={busy || !input.trim() || remaining === 0} aria-label={t.send}><Send /></Button>
    </form>
    {remaining !== null && <p className="mt-2 text-xs text-muted-foreground">{t.left(remaining)}</p>}
  </div>;
}
