import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICTS, type Lang } from '@/lib/i18n';
import { getNotion, localizeMath, type Notion, type NotionId, type Question } from '@/lib/curriculum';
import { analyze, diagnosticPath, DIAGNOSTIC_LENGTH, nextIndex, pickQuestion, startIndex, type DiagAnswer } from '@/lib/diagnostic';
import { say, type Attempt } from '@/lib/pisan';
import { Speaker, Tutor, Meter } from './shared';
import { useDys } from './dys';
import { SheetButton, Why } from './learning-aids';
import { AskPi } from './coach';
import { FreeAnswer, loadAnswerMode, saveAnswerMode, type AnswerMode } from './free-answer';
import { freeAnswer } from '@/lib/answer-check';
import type { Grader } from '@/lib/grading';
import { MathText, mathSpoken } from './math-text';
import { QuizBar } from './quiz-bar';

type Props = { lang: Lang; level: number; notions?: Notion[] | undefined; grade: Grader; onWorkshop: () => void };
export function QuestionChoices({ question, lang, selected, onSelect, coach, onText }: { question: Question; lang: Lang; selected: number | null; onSelect: (i: number | null) => void; onText?: ((text: string) => void) | undefined; coach?: { notion: NotionId; index: number } }) {
  const d = DICTS[lang];
  const [mode, setMode] = useState<AnswerMode>(loadAnswerMode);
  const canType = freeAnswer(question) !== null;
  const typing = canType && mode === 'free';
  const switchMode = (next: AnswerMode) => { setMode(next); saveAnswerMode(next); onSelect(null); onText?.(''); };
  const prompt = typeof question.prompt === 'string' ? d.prompts[question.prompt] : question.prompt[lang];
  return <><div className="flex items-center justify-between gap-4"><p className="text-lg font-semibold leading-snug text-foreground"><MathText lang={lang} text={prompt} /></p><Speaker text={mathSpoken(`${prompt} ${question.expr}`, lang)} lang={lang} /></div><p dir="ltr" className="my-8 text-center font-display text-3xl font-medium"><MathText lang={lang} text={question.expr} /></p>{typing ? <FreeAnswer question={question} lang={lang} onSelect={onSelect} onText={onText} /> : <div className="grid grid-cols-2 gap-3">{question.options.map((option, i) => <Button key={i} variant={selected === i ? 'default' : 'soft'} className="h-16 whitespace-normal text-lg" onClick={() => onSelect(i)} aria-pressed={selected === i}><span dir="ltr"><MathText lang={lang} text={option} /></span></Button>)}</div>}{canType && <div className="mt-3 text-center"><Button type="button" variant="link" size="sm" onClick={() => switchMode(typing ? 'choices' : 'free')}>{typing ? say(lang, 'Voir les choix', 'Show the choices', 'عرض الاختيارات', 'Ver las opciones') : say(lang, 'Taper ma réponse', 'Type my answer', 'كتابة جوابي', 'Escribir mi respuesta')}</Button></div>}{coach && <AskPi lang={lang} activity="consolidation" coachRef={{ kind: 'question', notion: coach.notion, index: coach.index }} />}</>;
}
export function Diagnostic({ lang, level, notions, grade, onWorkshop }: Props) {
  const d = DICTS[lang];
  const path = diagnosticPath(level, notions);
  const [active, setActive] = useState(false);
  const [answers, setAnswers] = useState<DiagAnswer[]>([]);
  // Les choix bruts : le serveur rejoue le diagnostic avec eux et calcule lui-même le résultat.
  const [choices, setChoices] = useState<number[]>([]);
  const [idx, setIdx] = useState(startIndex(path, level));
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [remedial, setRemedial] = useState<Notion | null>(null);
  const [error, setError] = useState('');
  const question = pickQuestion(path, idx, answers);
  const finished = answers.length >= DIAGNOSTIC_LENGTH;
  const analysis = analyze(answers, level);
  const reset = () => { setAnswers([]); setChoices([]); setIdx(startIndex(path, level)); setSelected(null); setFeedback(null); setActive(true); setRemedial(null); };
  async function next() {
    if (!question || selected === null) return;
    const correct = selected === question.question.answer;
    if (feedback === null) { setFeedback(correct); return; }
    const nextAnswers = [...answers, { notion: question.notion.id, qIndex: question.qIndex, correct }];
    if (nextAnswers.length === DIAGNOSTIC_LENGTH) {
      setSaving(true); setError('');
      try { await grade.diagnostic([...choices, selected]); }
      catch { setError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); setSaving(false); return; }
      setSaving(false);
    }
    setAnswers(nextAnswers); setChoices(c => [...c, selected]); setIdx(nextIndex(path, question.idx, correct)); setSelected(null); setFeedback(null);
  }
  if (remedial) return <Consolidation lang={lang} notion={remedial} grade={grade} onDone={() => { setRemedial(null); onWorkshop(); }} />;
  const quiz = active && !finished && question;
  return <section className="mx-auto max-w-3xl">{quiz ? <QuizBar lang={lang} done={answers.length} total={DIAGNOSTIC_LENGTH} label={`${d.nav.diagnostic} · ${question.notion.name[lang]}`} onQuit={() => setActive(false)} /> : <div className="section-heading"><span className="eyebrow">{d.nav.diagnostic}</span><h1>{say(lang, 'Diagnostic & fondamentaux', 'Diagnostic & foundations', 'التشخيص والأساسيات', 'Diagnóstico y fundamentos')}</h1><p>{d.diag.intro}</p></div>}
    {!active ? <div className="activity-panel"><div className="mb-7 flex flex-wrap gap-3"><span className="pill">6 {say(lang, 'questions', 'questions', 'أسئلة', 'preguntas')}</span><span className="pill">≈ 4 {d.common.minutes}</span><span className="pill">{say(lang, 'Sans note', 'No grade', 'بدون علامة', 'Sin nota')}</span></div><Tutor>{say(lang, 'On découvre ce que tu sais déjà. Chaque réponse nous aide à choisir ton prochain petit pas.', 'Let’s discover what you already know. Every answer helps us choose your next step.', 'لنكتشف ما تعرفه بالفعل. كل إجابة تساعدنا على اختيار خطوتك التالية.', 'Descubramos lo que ya sabes. Cada respuesta nos ayuda a elegir tu próximo paso.')}</Tutor><Button size="lg" onClick={reset} className="mt-7">{d.diag.start}<ArrowRight /></Button></div>
    : finished ? <div className="activity-panel"><CheckCircle2 className="mb-4 h-12 w-12 text-primary" /><h2 className="text-2xl">{d.diag.resultTitle}</h2><p className="my-4 text-xl">{analysis.score} / 6</p><Tutor>{analysis.lacuna ? say(lang, `Tu as hésité sur ${getNotion(analysis.target ?? analysis.lacuna).name[lang]}. Ensemble, consolidons ${getNotion(analysis.lacuna).name[lang]}.`, `Let’s strengthen ${getNotion(analysis.lacuna).name[lang]} together.`, `لنُعزّز ${getNotion(analysis.lacuna).name[lang]} معًا.`, `Reforcemos ${getNotion(analysis.lacuna).name[lang]} juntos.`) : d.diag.allGood}</Tutor><div className="mt-6 flex flex-wrap gap-3">{analysis.lacuna && <Button onClick={() => setRemedial(getNotion(analysis.lacuna ?? 'integers'))}>{say(lang, 'Consolidation des fondamentaux · 2 min', 'Strengthen your foundations · 2 min', 'تعزيز الأساسيات · دقيقتان', 'Consolidación de fundamentos · 2 min')}</Button>}<Button variant="soft" onClick={onWorkshop}>{d.diag.goWorkshop}</Button><Button variant="ghost" onClick={reset}><RotateCcw />{d.diag.retake}</Button></div></div>
    : question && <div className="activity-panel"><div><QuestionChoices question={question.question} lang={lang} selected={selected} onSelect={i => { if (feedback === null) setSelected(i); }} /></div>{feedback !== null && <div className="mt-5"><Tutor>{feedback ? d.diag.right : d.diag.wrong}{!feedback && <p className="mt-2" dir="ltr"><MathText lang={lang} text={question.question.expr} /> → <MathText lang={lang} text={question.question.options[question.question.answer] ?? ''} /></p>}</Tutor><Why notion={question.notion.id} index={question.qIndex} lang={lang} /></div>}<Button className="mt-7 w-full" disabled={selected === null || saving} onClick={next}>{feedback === null ? d.ws.check : d.diag.next}<ArrowRight /></Button>{error && <p role="alert" className="mt-3 text-destructive">{error}</p>}</div>}
  </section>;
}

export function Consolidation({ lang, notion, grade, onDone }: { lang: Lang; notion: Notion; grade: Grader; onDone: () => void }) {
  const [seconds, setSeconds] = useState(120);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const d = DICTS[lang];
  const { prefs } = useDys();
  useEffect(() => { if (prefs.noTimer) return; const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000); return () => clearInterval(id); }, [prefs.noTimer]);
  const question = notion.questions[index];
  async function check() {
    if (!question || selected === null) return;
    if (selected !== question.answer) { setError(d.ws.almost); return; }
    if (index < Math.min(3, notion.questions.length) - 1) { setChosen(c => [...c, selected]); setIndex(index + 1); setSelected(null); setError(''); return; }
    setBusy(true);
    try { await grade.consolidation(notion.id, [...chosen, selected]); setDone(true); }
    catch { setError(say(lang, 'Sauvegarde indisponible. Réessaie.', 'Save unavailable. Try again.', 'الحفظ غير متاح. حاول مجددًا.', 'No se pudo guardar. Reintenta.')); }
    setBusy(false);
  }
  return <section className="mx-auto max-w-3xl"><div className="section-heading">{!prefs.noTimer && <span className="eyebrow">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>}<h1>{say(lang, 'Consolidation des fondamentaux', 'Strengthen your foundations', 'تعزيز الأساسيات', 'Consolidación de fundamentos')}</h1><p>{notion.name[lang]}</p></div><div className="activity-panel">{done ? <><CheckCircle2 className="h-12 w-12 text-primary" /><h2 className="my-5 text-2xl">{d.diag.remedialDone}</h2><Button onClick={onDone}>{d.diag.goWorkshop}<ArrowRight /></Button></> : <><Tutor>{notion.lesson[lang]}</Tutor><div className="mt-3"><SheetButton notion={notion.id} lang={lang} /></div><p className="my-5 rounded-lg bg-muted p-4 text-center text-lg" dir="ltr">{localizeMath(notion.example, lang)}</p>{!prefs.noTimer && seconds === 0 && <p className="mb-3 text-sm text-muted-foreground">{d.diag.timeUp}</p>}<p className="mb-4 text-sm">{index + 1} / {Math.min(3, notion.questions.length)}</p>{question && <QuestionChoices coach={{ notion: notion.id, index }} question={question} lang={lang} selected={selected} onSelect={i => { setSelected(i); setError(''); }} />}<Button onClick={check} disabled={selected === null || busy} className="mt-6 w-full">{d.ws.check}</Button>{error && <><p role="alert" className="mt-4 text-destructive">{error}</p>{question && <Why notion={notion.id} index={index} lang={lang} />}</>}</>}</div></section>;
}