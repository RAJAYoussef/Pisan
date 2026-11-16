import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { getNotion, localizeMath, type NotionId } from '@/lib/curriculum';
import { answerChallenge, todayChallenge } from '@/lib/session.functions';
import { CHALLENGE_STARS, challengeItem } from '@/lib/challenge';
import type { Lang } from '@/lib/i18n';
import { say, type Progress, type StreakResult } from '@/lib/pisan';
import { QuestionChoices } from './diagnostic';
import { Why } from './learning-aids';

type Today = { day: string; notion: NotionId; index: number; done: boolean; correct: boolean | null };

/** Défi du jour : même question pour tout le programme, une tentative par jour, corrigée côté serveur. */
export function DailyChallenge({ lang, token, onSaved }: { lang: Lang; token: string; onSaved: (r: { progress: Progress; streak: StreakResult; correct: boolean; day: string }) => void }) {
  const load = useServerFn(todayChallenge);
  const submit = useServerFn(answerChallenge);
  const [today, setToday] = useState<Today | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  useEffect(() => { let off = false; load({ data: { token } }).then(t => { if (!off) setToday(t); }).catch(() => {}); return () => { off = true; }; }, [token, load]);
  if (!today) return null;
  const notion = getNotion(today.notion);
  const item = challengeItem(today.notion, today.index);
  const question = item?.question;
  if (!question) return null;
  async function send() {
    setBusy(true); setError('');
    try {
      const typed = text.trim();
      const r = await submit({ data: { token, ...(typed ? { text: typed } : { choice: selected ?? undefined }) } });
      if (r.status === 'already') { setToday(t => t && { ...t, done: true }); return; }
      setAnswer(r.answer); setToday(t => t && { ...t, done: true, correct: r.correct }); setOpen(false);
      onSaved({ progress: r.progress, streak: r.streak, correct: r.correct, day: r.day });
    } catch { setError(say(lang, 'Le défi n’a pas pu être envoyé. Réessaie.', 'The challenge could not be sent. Try again.', 'تعذر إرسال التحدي. حاول مجددًا.', 'No se pudo enviar el reto. Inténtalo de nuevo.')); } finally { setBusy(false); }
  }
  return <div className="exercise-card mb-8" data-testid="daily-challenge">
    <div className="flex flex-wrap items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-soft"><Target className="h-5 w-5 text-sun-deep" aria-hidden /></span><div className="flex-1"><p className="eyebrow">{say(lang, 'Défi du jour', 'Daily challenge', 'تحدي اليوم', 'Reto del día')}</p><h2 className="text-lg">{notion.emoji} {notion.name[lang]}</h2></div>
      {!today.done && !open && <Button onClick={() => setOpen(true)}>{say(lang, 'Relever le défi', 'Take the challenge', 'خُض التحدي', 'Aceptar el reto')}<ArrowRight /></Button>}</div>
    {today.done && <div className="mt-4" role="status"><p className="flex items-center gap-2 font-semibold">{today.correct ? <><CheckCircle2 className="h-5 w-5 text-primary" />{say(lang, `Bravo ! +${CHALLENGE_STARS} étoiles.`, `Well done! +${CHALLENGE_STARS} stars.`, `أحسنت! +${CHALLENGE_STARS} نجوم.`, `¡Bravo! +${CHALLENGE_STARS} estrellas.`)}</> : <><Sparkles className="h-5 w-5 text-sun-deep" />{say(lang, 'Merci d’avoir essayé ! Un nouveau défi t’attend demain.', 'Thanks for trying! A new challenge awaits tomorrow.', 'شكرًا على المحاولة! تحدٍّ جديد ينتظرك غدًا.', '¡Gracias por intentarlo! Mañana te espera un nuevo reto.')}</>}</p>
      {answer && !today.correct && <p className="mt-2 text-sm">{say(lang, 'Bonne réponse', 'Correct answer', 'الجواب الصحيح', 'Respuesta correcta')} : <span dir="ltr" className="font-display text-lg">{localizeMath(answer, lang)}</span></p>}
      <Why notion={today.notion} index={today.index} steps={item?.steps} lang={lang} /></div>}
    {open && !today.done && <div className="mt-5"><QuestionChoices question={question} lang={lang} selected={selected} onSelect={i => { setSelected(i); setConfirming(false); }} onText={v => { setText(v); setConfirming(false); }} /><Button className="mt-5 w-full" disabled={busy || (selected === null && !text.trim())} onClick={() => confirming ? send() : setConfirming(true)}>{confirming ? say(lang, 'Oui, j’envoie ma réponse', 'Yes, send my answer', 'نعم، أرسل جوابي', 'Sí, enviar mi respuesta') : say(lang, 'Valider ma réponse', 'Check my answer', 'تحقق من جوابي', 'Comprobar mi respuesta')}<ArrowRight /></Button>{confirming && <div role="status" className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm"><span>{say(lang, 'Tu es sûr·e ? Tu n’as qu’un essai aujourd’hui.', 'Are you sure? You only get one try today.', 'هل أنت متأكد؟ لديك محاولة واحدة اليوم.', '¿Seguro? Solo tienes un intento hoy.')}</span><Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>{say(lang, 'Je modifie', 'Let me change it', 'سأعدّل', 'Lo cambio')}</Button></div>}{!confirming && <p className="mt-2 text-center text-xs text-muted-foreground">{say(lang, 'Une seule tentative par jour.', 'One attempt per day.', 'محاولة واحدة في اليوم.', 'Un solo intento al día.')}</p>}</div>}
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
  </div>;
}
