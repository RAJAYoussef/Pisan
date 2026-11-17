import { useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chaptersForLevel, getNotion, localizeMath, type Notion, type NotionId } from '@/lib/curriculum';
import { DICTS, type Lang } from '@/lib/i18n';
import { gradeOn20, say, type Attempt } from '@/lib/pisan';
import { QuestionChoices } from './diagnostic';
import { AskPi } from './coach';
import { SheetButton, Why } from './learning-aids';
import { Meter, Tutor } from './shared';
import { MathText } from './math-text';
import { QuizBar } from './quiz-bar';

export function Exam({ lang, level, onSave, onStart, notions, initialNotion }: { lang: Lang; level: number; onSave: (a: Attempt) => Promise<void>; onStart: () => Promise<boolean>; notions?: Notion[] | undefined; initialNotion?: NotionId | undefined }) {
  const chapters = notions ?? chaptersForLevel(level);
  // Par défaut : la notion du chapitre en cours (« Ton prochain petit pas »), sinon le premier chapitre.
  const [chapter, setChapter] = useState<NotionId>(initialNotion && chapters.some(c => c.id === initialNotion) ? initialNotion : chapters[0]?.id ?? 'integers');
  const [active, setActive] = useState(false);
  const [picking, setPicking] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const d = DICTS[lang];
  const notion = getNotion(chapter);
  // A short subject uses each distinct authored question once, never padded with duplicates.
  const questions = notion.questions;
  const currentQuestion = questions[answers.length];
  const finished = answers.length === questions.length;
  const correct = answers.filter((a, i) => a === questions[i]?.answer).length;
  async function start() { setBusy(true); try { if (await onStart()) { setActive(true); setAnswers([]); setSelected(null); setError(''); } } catch { setError(say(lang, 'Accès indisponible. Réessaie.', 'Access unavailable. Try again.', 'الوصول غير متاح.', 'Acceso no disponible.')); } setBusy(false); }
  async function next() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    if (nextAnswers.length === questions.length) {
      setBusy(true);
      try { await onSave({ kind: 'exam', notion: chapter, correct: nextAnswers.filter((a, i) => a === questions[i]?.answer).length, total: questions.length, date: new Date().toISOString(), minutes: 5 }); }
      catch { setError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة.', 'Resultado no guardado.')); setBusy(false); return; }
      setBusy(false);
    }
    setAnswers(nextAnswers); setSelected(null);
  }
  const quiz = active && !finished;
  return <section className="mx-auto max-w-3xl">{quiz && <QuizBar lang={lang} done={answers.length} total={questions.length} label={`${say(lang, 'Contrôle blanc', 'Practice test', 'اختبار تجريبي', 'Examen de práctica')} · ${notion.name[lang]}`} onQuit={() => setActive(false)} />}<div className={quiz ? 'hidden' : 'section-heading'}><span className="eyebrow">{say(lang, 'À toi de jouer', 'Your turn', 'دورك الآن', 'Tu turno')}</span><h1>{say(lang, 'Contrôle blanc', 'Practice test', 'اختبار تجريبي', 'Examen de práctica')}</h1><p>{say(lang, 'Un petit sujet, une note sur 20, un prochain pas clair.', 'A short paper, a grade out of 20, a clear next step.', 'موضوع قصير، علامة على 20، وخطوة تالية واضحة.', 'Un tema corto, una nota sobre 20 y un siguiente paso claro.')}</p></div><div className="activity-panel">{!active ? <>
      <div className="flex items-start gap-4"><span className="exam-icon"><ClipboardCheck className="h-6 w-6" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-primary-deep">{chapter === initialNotion ? say(lang, 'Conseillé pour toi', 'Recommended for you', 'مقترح لك', 'Recomendado para ti') : say(lang, 'Chapitre choisi', 'Chosen chapter', 'الفصل المختار', 'Capítulo elegido')}</p><h2 className="mt-1 text-2xl leading-snug">{notion.name[lang]}</h2></div></div>
      <div className="my-5 flex flex-wrap gap-2"><span className="pill">{questions.length} {say(lang, 'questions', 'questions', 'أسئلة', 'preguntas')}</span><span className="pill">≈ 5 min</span><span className="pill">{say(lang, 'Note sur 20', 'Graded /20', 'علامة على 20', 'Nota sobre 20')}</span></div>
      <Button size="lg" className="w-full" disabled={busy} onClick={start}>{say(lang, 'Commencer le contrôle blanc', 'Start mock test', 'ابدأ الاختبار التجريبي', 'Empezar examen de práctica')}<ArrowRight /></Button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><SheetButton notion={chapter} lang={lang} variant="ghost" />{chapters.length > 1 && <Button variant="link" aria-expanded={picking} onClick={() => setPicking(!picking)}>{say(lang, 'Changer de chapitre', 'Change chapter', 'تغيير الفصل', 'Cambiar de capítulo')}</Button>}</div>
      {picking && <div role="radiogroup" aria-label={d.journey.chapters} className="mt-3 grid gap-2">{chapters.map(n => <button key={n.id} type="button" role="radio" aria-checked={n.id === chapter} className="exam-choice" onClick={() => { setChapter(n.id); setPicking(false); }}><span aria-hidden>{n.emoji}</span><span className="min-w-0 flex-1 text-start font-semibold">{n.name[lang]}</span>{n.id === initialNotion && <span className="ws-tag">{say(lang, 'Conseillé', 'Recommended', 'مقترح', 'Recomendado')}</span>}</button>)}</div>}
    </>
    : finished ? <><div className="mb-6 flex items-center gap-5"><CheckCircle2 className="h-12 w-12 text-primary" /><div><p className="text-muted-foreground">{notion.name[lang]}</p><h2 className="text-4xl">{gradeOn20(correct, questions.length)} <span className="text-xl text-muted-foreground">/ 20</span></h2></div></div><Tutor>{say(lang, 'Cette note est un point de départ, pas une étiquette. Voici tes points acquis et ceux à revoir.', 'This grade is a starting point, not a label. Here is what you know and what to review.', 'هذه العلامة نقطة بداية وليست حكمًا. إليك ما أتقنته وما يحتاج مراجعة.', 'Esta nota es un punto de partida, no una etiqueta. Aquí están tus logros y puntos a revisar.')}</Tutor><div className="mt-6 divide-y divide-border">{questions.map((q, i) => <div key={i} className="flex items-center justify-between gap-3 py-4"><div><p dir="ltr" className="font-bold"><MathText lang={lang} text={q.expr} /></p><p className="mt-1 text-sm text-muted-foreground" dir="ltr">{(answers[i] ?? -1) >= 0 ? <MathText lang={lang} text={q.options[answers[i] ?? 0] ?? ''} /> : '✗'} {answers[i] !== q.answer && <>→ <MathText lang={lang} text={q.options[q.answer] ?? ''} /></>}</p><Why notion={chapter} index={i} lang={lang} /><AskPi lang={lang} activity="review" coachRef={{ kind: 'question', notion: chapter, index: i }} label={say(lang, 'Revoir cette question avec Pi', 'Review this question with Pi', 'راجع هذا السؤال مع باي', 'Repasar esta pregunta con Pi')} /></div><span className={`pill ${answers[i] === q.answer ? 'bg-primary-soft text-primary-deep' : 'bg-accent-soft text-accent-deep'}`}>{answers[i] === q.answer ? say(lang, 'Acquis', 'Achieved', 'مُتقَن', 'Adquirido') : say(lang, 'À revoir', 'Review', 'للمراجعة', 'Repasar')}</span></div>)}</div><Button className="mt-6" variant="soft" onClick={() => setActive(false)}>{say(lang, 'Choisir un autre chapitre', 'Choose another chapter', 'اختر فصلًا آخر', 'Elegir otro capítulo')}</Button></>
    : <><div>{currentQuestion && <QuestionChoices question={currentQuestion} lang={lang} selected={selected} onSelect={setSelected} />}</div><Button onClick={next} disabled={selected === null || busy} className="mt-7 w-full">{answers.length === questions.length - 1 ? say(lang, 'Terminer et voir mon bilan', 'Finish and see my results', 'إنهاء وعرض النتيجة', 'Terminar y ver resultados') : d.diag.next}<ArrowRight /></Button></>}{error && <p role="alert" className="mt-3 text-destructive">{error}</p>}</div></section>;
}