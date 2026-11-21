// Test de positionnement côté élève : une question à la fois, sans indice, sans coach et sans correction affichée.
// Les questions viennent du serveur (compétence + tirage) ; seules les réponses brutes repartent, corrigées là-bas.
import { useMemo, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ClipboardList, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startClassTest, submitClassTest } from '@/lib/placement.functions';
import { placementSteps, type PlacementItem } from '@/lib/placement';
import type { StepAnswer } from '@/lib/skill-session';
import type { Lang } from '@/lib/i18n';
import { localizeMath } from '@/lib/curriculum';
import { say } from '@/lib/pisan';
import { StepView } from './skills';
import { Rich } from './math-text';
import { CHAPTER_NAMES } from './chapter-names';

export type StudentTest = { id: string; form: string; count: number; class_name: string };

/** La carte de l'accueil : un test à passer en classe. */
export function PlacementCard({ lang, test, onOpen }: { lang: Lang; test: StudentTest; onOpen: () => void }) {
  return <section className="placement-card"><ClipboardList className="h-8 w-8 shrink-0" aria-hidden />
    <div className="min-w-0 flex-1"><p className="eyebrow">{test.class_name}</p><h2 className="text-lg font-bold">{say(lang, 'Test de positionnement', 'Placement test', 'اختبار تحديد المستوى', 'Prueba de nivel')}</h2>
      <p className="text-sm text-muted-foreground">{say(lang, `${test.count} questions, à faire en classe quand ton professeur le demande.`, `${test.count} questions, to do in class when your teacher asks.`, `${test.count} سؤالًا، في القسم عندما يطلب الأستاذ.`, `${test.count} preguntas, en clase cuando lo pida tu profesor.`)}</p></div>
    <Button onClick={onOpen}>{say(lang, 'Commencer', 'Start', 'ابدأ', 'Empezar')}</Button></section>;
}

export function PlacementActivity({ lang, token, test, onClose }: { lang: Lang; token: string; test: StudentTest; onClose: (submitted: boolean) => void }) {
  const startFn = useServerFn(startClassTest), submitFn = useServerFn(submitClassTest);
  const [items, setItems] = useState<PlacementItem[] | null>(null);
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined);
  const [answers, setAnswers] = useState<(StepAnswer | null)[]>([]);
  const [at, setAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const steps = useMemo(() => (items ? placementSteps(items) : []), [items]);
  const t = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  async function begin() {
    setBusy(true); setError('');
    try { const r = await startFn({ data: { token, testId: test.id } }); setItems(r.items); setStartedAt(r.startedAt); setAnswers(r.items.map(() => null)); setAt(0); }
    catch { setError(t('Ce test n’est plus ouvert. Demande à ton professeur.', 'This test is no longer open. Ask your teacher.', 'هذا الاختبار لم يعد مفتوحًا.', 'Esta prueba ya no está abierta.')); }
    setBusy(false);
  }
  async function send(final: (StepAnswer | null)[]) {
    setBusy(true); setError('');
    try { await submitFn({ data: { token, testId: test.id, answers: final, ...(startedAt ? { startedAt } : {}) } }); setDone(true); }
    catch { setError(t('Le test n’a pas pu être envoyé. Vérifie la connexion et réessaie.', 'The test could not be sent. Check the connection and try again.', 'تعذر إرسال الاختبار.', 'No se pudo enviar la prueba.')); }
    setBusy(false);
  }
  function reply(value: StepAnswer | null) {
    const current = steps[at]; if (!current) return;
    const next = answers.slice(); next[current.index] = value; setAnswers(next);
    if (at + 1 < steps.length) setAt(at + 1); else void send(next);
  }
  const shell = (body: React.ReactNode) => <div className="placement-screen" role="dialog" aria-modal="true" aria-label={t('Test de positionnement', 'Placement test', 'اختبار تحديد المستوى', 'Prueba de nivel')}><div className="mx-auto max-w-3xl px-4 py-8">{body}</div></div>;
  if (done) return shell(<div className="activity-panel text-center"><h1 className="text-2xl">{t('Merci, ton test est rendu !', 'Thank you, your test is in!', 'شكرًا، تم تسليم اختبارك!', '¡Gracias, prueba entregada!')}</h1><p className="mt-3 text-muted-foreground">{t('Ton professeur verra les résultats. Ils servent à t’aider, pas à te noter.', 'Your teacher will see the results. They are here to help you, not to grade you.', 'سيرى أستاذك النتائج. هي لمساعدتك لا لتنقيطك.', 'Tu profesor verá los resultados. Sirven para ayudarte.')}</p><Button className="mt-6" onClick={() => onClose(true)}>{t('Retour à l’accueil', 'Back home', 'العودة', 'Volver')}</Button></div>);
  if (!items) return shell(<div className="activity-panel">
    <p className="eyebrow">{test.class_name}</p><h1 className="mt-1 text-2xl">{t('Test de positionnement', 'Placement test', 'اختبار تحديد المستوى', 'Prueba de nivel')}</h1>
    <ul className="mt-4 grid gap-2 text-sm">
      <li>• {t(`${test.count} questions, une à la fois. Prévois 30 à 40 minutes.`, `${test.count} questions, one at a time. Allow 30 to 40 minutes.`, `${test.count} سؤالًا واحدًا تلو الآخر.`, `${test.count} preguntas, una a una.`)}</li>
      <li>• {t('Réponds seul, sans aide : pas d’indice, pas de coach, pas de correction pendant le test.', 'Answer on your own: no hints, no coach, no marking during the test.', 'أجب وحدك: بدون تلميحات أو مساعدة.', 'Responde solo: sin pistas ni ayuda.')}</li>
      <li>• {t('Si tu ne sais pas, clique sur « Je ne sais pas » : c’est mieux que répondre au hasard.', 'If you don’t know, click “I don’t know”: better than guessing.', 'إذا لم تعرف، اضغط « لا أعرف ».', 'Si no sabes, pulsa «No lo sé».')}</li>
      <li>• {t('Une réponse validée ne peut plus être changée.', 'Once confirmed, an answer cannot be changed.', 'لا يمكن تغيير الإجابة بعد تأكيدها.', 'Una respuesta validada no se puede cambiar.')}</li>
    </ul>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <div className="mt-6 flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void begin()}>{t('Commencer le test', 'Start the test', 'ابدأ الاختبار', 'Empezar la prueba')}</Button><Button variant="ghost" onClick={() => onClose(false)}>{t('Plus tard', 'Later', 'لاحقًا', 'Más tarde')}</Button></div>
  </div>);
  const current = steps[at];
  if (!current) return shell(<div className="activity-panel"><p role="alert">{error || t('Envoi…', 'Sending…', 'جارٍ الإرسال…', 'Enviando…')}</p>{error && <Button className="mt-4" disabled={busy} onClick={() => void send(answers)}><Send />{t('Réessayer l’envoi', 'Retry sending', 'أعد الإرسال', 'Reintentar')}</Button>}</div>);
  return shell(<>
    <div className="mb-3 flex items-center justify-between gap-3 text-sm"><span className="font-bold">{t('Question', 'Question', 'سؤال', 'Pregunta')} {at + 1} / {steps.length}</span><span className="text-muted-foreground">{CHAPTER_NAMES[current.skill.chapter][lang]}</span></div>
    <div className="placement-progress" aria-hidden><span style={{ width: `${(at / steps.length) * 100}%` }} /></div>
    <div className="activity-panel mt-4">
      <p className="mb-5 text-lg font-semibold leading-snug"><Rich lang={lang} text={localizeMath(current.step.prompt[lang], lang)} /></p>
      <StepView key={at} lang={lang} step={current.step} solved={false} onAnswer={value => reply(value)} />
      {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
      <Button variant="ghost" className="mt-4" disabled={busy} onClick={() => reply(null)}>{t('Je ne sais pas', 'I don’t know', 'لا أعرف', 'No lo sé')}</Button>
    </div>
  </>);
}
