// Parcours de compétences : déroule les étapes d'une activité (src/lib/skills.ts) et dessine les figures.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, Delete, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSCRIBED_SPAN, type FigureKind, type InscribedProblem, type ThalesProblem } from '@/lib/figures';
import { localizeMath, type L } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import { clipLine, fx } from '@/lib/skills-numbers';
import { curvePoints } from '@/lib/skills-lycee';
import { chipsOk, fmt, numberOk, reviewStep, spoken,  sentenceOk, skillNotion, skillsFor, skillStatus, type Blank, type SkillStatus, type Table, type P, type Scene, type Skill, type Step } from '@/lib/skills';
import { InscribedFigure, ThalesFigure, inscribedRange } from './figures';
import { Speaker, Tutor } from './shared';
import { Celebration, DiscoverPanel, LessonCard, PhaseStepper, PointsBadge, type Phase } from './skill-intro';
import { introFor } from '@/lib/skill-intros';
import { starsFor, stepPoints } from '@/lib/rewards';
import { minusSign, Rich } from './math-text';
import { FractionBars } from './fraction-bars';
import { FractionAdditionLab, FractionEquivalenceLab, FractionNumberLineLab, type FractionInteractionEvent } from './fraction-labs';
import { readFractionSequence, verifyFractionHypothesis, type FractionReasoningEvent, type FractionSequenceAnalysis, type FractionWidgetSpec } from '@/lib/fraction-reasoning';
import { buildFractionTransferTask, evaluateFractionTransfer } from '@/lib/fraction-transfer';
import type { FractionJournalEventType } from '@/lib/fraction-journal';
import type { SkillEngine, StepAnswer } from '@/lib/skill-session';

type WidgetState = Extract<StepAnswer, { type: 'widget' }>['state'];

export type FractionInteractionContext = FractionReasoningEvent;
type Props = { lang: Lang; skill: Skill; engine: SkillEngine; onBack: () => void; /** Tentatives de l'élève : la première fois, le parcours commence par manipuler. */ attempts?: Attempt[] | undefined; onFractionInteraction?: (event: FractionInteractionContext) => void; onFractionAnalysis?: (analysis: FractionSequenceAnalysis) => void; onAdaptiveSkill?: (skillId: string | null) => void; onJournalEvent?: (event: { activityId: string; type: FractionJournalEventType; payload: Record<string, unknown>; clientOccurredAt?: string }) => void };

/** Une compétence : les étapes s'enchaînent ; une étape ratée au premier essai ne compte pas comme réussie. */
export function SkillActivity({ lang, skill, engine, onBack, attempts, onFractionInteraction, onFractionAnalysis, onAdaptiveSkill, onJournalEvent }: Props) {
  // Le serveur tire l'énoncé et signe un jeton ; chaque vérification lui passe la réponse brute.
  const [seed, setSeed] = useState<number | null>(null);
  const [ticket, setTicket] = useState('');
  const [round, setRound] = useState(0);
  const [startError, setStartError] = useState(false);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    let off = false;
    setSeed(null); setStartError(false);
    engine.start('skill', [skill.id]).then(r => { if (!off) { setSeed(r.seeds[0]!); setTicket(r.ticket); } }).catch(() => { if (!off) setStartError(true); });
    return () => { off = true; };
  }, [engine, skill.id, round]);
  const activity = useMemo(() => (seed === null ? null : skill.build(seed)), [skill, seed]);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { correct: number; total: number }>(null);
  const [saveError, setSaveError] = useState('');
  const fractionEvents = useRef<FractionReasoningEvent[]>([]);
  const [fractionAnalysis, setFractionAnalysis] = useState<FractionSequenceAnalysis | null>(null);
  const [verificationAnswers, setVerificationAnswers] = useState<Record<string, string>>({});
  const [transferAnswers, setTransferAnswers] = useState<Record<string, string>>({});
  const journaledHypotheses = useRef<string[]>([]);
  const journaledCorrections = useRef<string[]>([]);
  // Modèle de Singapour : manipuler puis retenir avant de s'entraîner (la première fois) ; ludification du parcours.
  const intro = introFor(skill.id);
  const [phase, setPhase] = useState<Phase>(intro && attempts && !attempts.some(a => a.skill === skill.id) ? (intro.manip ? 'discover' : 'lesson') : 'practice');
  const [lessonOpen, setLessonOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const back = <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>;
  const heading = <div className="section-heading"><span className="eyebrow">{say(lang, 'Parcours de compétences', 'Skill pathway', 'مسار الكفايات', 'Itinerario de competencias')}</span><h1>{skill.title[lang]}</h1></div>;
  if (intro && phase !== 'practice') return <section className="mx-auto max-w-4xl">
    {back}{heading}
    <PhaseStepper lang={lang} phase={phase} onPhase={setPhase} manipulate={Boolean(intro.manip)} />
    {phase === 'discover'
      ? <DiscoverPanel lang={lang} intro={intro} onNext={() => setPhase('lesson')} />
      : <div className="activity-panel"><LessonCard lang={lang} lesson={intro.lesson} /><Button className="mt-5 w-full" onClick={() => setPhase('practice')}>{say(lang, 'Je m’entraîne', 'Let’s practise', 'أتمرّن', 'A practicar')}<ArrowRight /></Button></div>}
  </section>;
  if (activity === null || seed === null) return <Loading lang={lang} failed={startError} onBack={onBack} onRetry={() => setRound(r => r + 1)} />;
  function recordFractionInteraction(event: FractionInteractionContext) {
    const sameSequence = fractionEvents.current.filter(item =>
      item.skillId === event.skillId && item.activitySeed === event.activitySeed &&
      item.stepIndex === event.stepIndex && item.widgetKind === event.widgetKind,
    );
    fractionEvents.current = [...sameSequence, event];
    onFractionInteraction?.(event);
    onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: event.action === 'verified' ? 'verification' : 'manipulation', payload: { ...event }, clientOccurredAt: event.occurredAtClient });
    const analysis = readFractionSequence(fractionEvents.current);
    setFractionAnalysis(analysis);
    setVerificationAnswers({});
    setTransferAnswers({});
    onFractionAnalysis?.(analysis);
    for (const hypothesis of analysis.hypotheses) {
      const key = `${event.skillId}:${event.activitySeed}:${event.stepIndex}:${hypothesis.code}`;
      if (!journaledHypotheses.current.includes(key)) {
        journaledHypotheses.current.push(key);
        onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: 'hypothesis', payload: { hypothesisCode: hypothesis.code, explanation: hypothesis.explanation, evidenceSequences: hypothesis.evidenceSequences, confidence: hypothesis.confidence }, clientOccurredAt: event.occurredAtClient });
      }
    }
    if (analysis.observations.some(item => item.code === 'self-correction')) {
      const key = `${event.skillId}:${event.activitySeed}:${event.stepIndex}:self-correction`;
      if (!journaledCorrections.current.includes(key)) {
        journaledCorrections.current.push(key);
        onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: 'self_correction', payload: { observations: analysis.observations.filter(item => item.code === 'self-correction') }, clientOccurredAt: event.occurredAtClient });
      }
    }
  }
  const step = activity.steps[index]!;
  const total = activity.steps.length;
  const show = (l: L) => localizeMath(l[lang], lang);
  const pendingVerification = Boolean(fractionAnalysis?.hypotheses.some(h => verifyFractionHypothesis(h, verificationAnswers).status === 'inconclusive'));

  async function answer(reply: StepAnswer) {
    if (checking) return;
    setChecking(true); setSaveError('');
    try {
      const r = await engine.check(ticket, reply);
      setTicket(r.ticket);
      if (r.ok) {
        const firstTry = !missed.includes(index);
        const run = firstTry ? streak + 1 : 0;
        const gain = stepPoints(firstTry, run);
        setPoints(p => p + gain.points); setStreak(run); setBestCombo(b => Math.max(b, run));
        setSolved(true); setHint(''); return;
      }
      setStreak(0);
      setMissed(m => m.includes(index) ? m : [...m, index]);
      setHint(show(step.hint));
    } catch { setSaveError(checkFailed(lang)); }
    finally { setChecking(false); }
  }
  async function next() {
    if (index + 1 < total) { fractionEvents.current = []; setFractionAnalysis(null); setVerificationAnswers({}); setTransferAnswers({}); setIndex(index + 1); setSolved(false); setHint(''); return; }
    setBusy(true); setSaveError('');
    try { const r = await engine.finish(ticket); const a = r.attempts[0]!; setDone({ correct: a.correct, total: a.total }); }
    catch { setSaveError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); }
    finally { setBusy(false); }
  }
  const restart = () => { fractionEvents.current = []; setFractionAnalysis(null); setVerificationAnswers({}); setTransferAnswers({}); setRound(r => r + 1); setIndex(0); setMissed([]); setSolved(false); setHint(''); setDone(null); setPoints(0); setStreak(0); setBestCombo(0); };

  return <section className="mx-auto max-w-4xl">
    {back}
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Parcours de compétences', 'Skill pathway', 'مسار الكفايات', 'Itinerario de competencias')}</span><h1>{show(activity.title)}</h1></div>
    {intro && <PhaseStepper lang={lang} phase="practice" onPhase={setPhase} manipulate={Boolean(intro.manip)} />}
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <PointsBadge lang={lang} points={points} combo={streak} />
      {intro && !done && <Button variant="ghost" size="sm" aria-expanded={lessonOpen} onClick={() => setLessonOpen(o => !o)}><BookOpen />{lessonOpen ? say(lang, 'Masquer le cours', 'Hide the lesson', 'إخفاء الدرس', 'Ocultar la lección') : say(lang, 'Revoir le cours', 'See the lesson', 'مراجعة الدرس', 'Ver la lección')}</Button>}
    </div>
    {intro && lessonOpen && !done && <div className="mb-4"><LessonCard lang={lang} lesson={intro.lesson} compact /></div>}
    <div className="skill-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done ? total : index} aria-label={say(lang, 'Étapes', 'Steps', 'المراحل', 'Pasos')}>
      {activity.steps.map((_, i) => <span key={i} className={done || i < index ? (missed.includes(i) ? 'skill-dot skill-dot-missed' : 'skill-dot skill-dot-done') : i === index ? 'skill-dot skill-dot-active' : 'skill-dot'} />)}
    </div>
    <div className="activity-panel">
      {done
        ? <Celebration lang={lang} stars={starsFor(done.correct, done.total)} points={points} bestCombo={bestCombo} message={done.correct === done.total ? say(lang, 'Compétence acquise !', 'Skill mastered!', 'تم اكتساب الكفاية!', '¡Competencia adquirida!') : say(lang, `${done.correct} étapes sur ${done.total} du premier coup. Recommence pour l’acquérir.`, `${done.correct} of ${done.total} steps at the first try. Go again to master it.`, `${done.correct} من ${done.total} مراحل من المحاولة الأولى. أعد للاكتساب.`, `${done.correct} de ${done.total} pasos al primer intento. Repite para adquirirla.`)}><p className="mb-5 text-sm text-muted-foreground" dir="ltr"><Rich lang={lang} text={localizeMath(activity.summary, lang)} /></p><Button onClick={restart}><RefreshCw />{say(lang, 'Nouvel énoncé', 'New exercise', 'تمرين جديد', 'Nuevo enunciado')}</Button></Celebration>
        : <>
          <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug"><Rich lang={lang} text={show(step.prompt)} /></p><Speaker text={spoken(show(step.prompt), lang)} lang={lang} /></div>
          <StepView key={`${seed}-${index}`} lang={lang} step={step} solved={solved} onAnswer={answer} onFractionInteraction={(event, widget) => recordFractionInteraction({ ...event, skillId: skill.id, activitySeed: seed, stepIndex: index, widget })} />
          {fractionAnalysis?.hypotheses.map(hypothesis => {
            const diagnostic = verifyFractionHypothesis(hypothesis, verificationAnswers);
            const complete = diagnostic.status !== 'inconclusive';
            return <section key={hypothesis.code} className="mt-5 rounded-xl border p-4" aria-label={say(lang, 'Vérification pédagogique', 'Learning check', 'تحقق تعليمي', 'Comprobación pedagógica')}>
              <p className="text-sm font-bold text-primary-deep">{say(lang, 'Une petite vérification pour mieux t’aider', 'A quick check to help you better', 'تحقق قصير لمساعدتك', 'Una pequeña comprobación para ayudarte')}</p>
              <p className="mt-2 text-sm">{hypothesis.explanation}</p>
              {hypothesis.checks.map(check => <fieldset key={check.id} className="mt-4">
                <legend className="mb-2 text-sm font-semibold">{check.prompt}</legend>
                <div className="grid gap-2">{check.options.map(option => <Button key={option.value} type="button" variant={verificationAnswers[check.id] === option.value ? 'default' : 'soft'} className="h-auto min-h-10 whitespace-normal justify-start text-start" aria-pressed={verificationAnswers[check.id] === option.value} onClick={() => { const nextAnswers = { ...verificationAnswers, [check.id]: option.value }; setVerificationAnswers(nextAnswers); const result = verifyFractionHypothesis(hypothesis, nextAnswers); if (result.status !== 'inconclusive') onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: 'diagnostic', payload: { hypothesisCode: result.hypothesisCode, status: result.status, checkResults: result.checkResults, responses: nextAnswers, explanation: result.explanation } }); }}>{option.label}</Button>)}</div>
              </fieldset>)}
              {complete && <div className="mt-4 rounded-lg bg-muted p-3" role="status">
                <p className="font-semibold">{diagnostic.status === 'confirmed' ? say(lang, 'Une difficulté précise semble se confirmer.', 'A specific difficulty appears to be confirmed.', 'يبدو أن صعوبة محددة قد تأكدت.', 'Parece confirmarse una dificultad concreta.') : say(lang, 'Cette difficulté n’est pas confirmée.', 'This difficulty is not confirmed.', 'لم تتأكد هذه الصعوبة.', 'Esta dificultad no está confirmada.')}</p>
                <p className="mt-1 text-sm">{diagnostic.explanation}</p>
                {diagnostic.status === 'confirmed' && (() => {
                  const task = buildFractionTransferTask(hypothesis.code, seed + index);
                  const selected = transferAnswers[hypothesis.code] ?? '';
                  const result = selected ? evaluateFractionTransfer(task, selected) : null;
                  const transferText = result === 'transfer-success' ? task.feedback.success : result === 'error-reproduced' ? task.feedback.error : result === 'other-error' ? task.feedback.other : null;
                  return <div className="mt-4 border-t pt-4">
                    <p className="font-semibold">{say(lang, 'Épreuve de transfert', 'Transfer challenge', 'مهمة نقل التعلم', 'Prueba de transferencia')}</p>
                    <p className="mt-2 text-sm">{show(task.prompt)}</p>
                    <div className="mt-3 grid gap-2">{task.options.map(option => <Button key={option.value} type="button" variant={selected === option.value ? 'default' : 'soft'} className="h-auto min-h-10 justify-start whitespace-normal text-start" aria-pressed={selected === option.value} onClick={() => { setTransferAnswers(previous => ({ ...previous, [hypothesis.code]: option.value })); const outcome = evaluateFractionTransfer(task, option.value); onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: 'transfer', payload: { hypothesisCode: hypothesis.code, answer: option.value, outcome, seed: seed + index, prompt: task.prompt, options: task.options, correctValue: task.correctValue } }); }}>{show(option.label)}</Button>)}</div>
                    {transferText && <div className="mt-3 rounded-lg bg-muted p-3" role="status">
                      <p className="text-sm">{show(transferText)}</p>
                      {result === 'error-reproduced' && <Button className="mt-3" onClick={() => { const targetSkill = hypothesis.code === 'fraction-scale-one-term' ? 'frac-equivalence-visual' : 'frac-add-visual'; onJournalEvent?.({ activityId: `fraction:${skill.id}:${seed}`, type: 'remediation', payload: { hypothesisCode: hypothesis.code, targetSkill } }); onAdaptiveSkill?.(targetSkill); onBack(); }}>{say(lang, 'Travailler cette difficulté', 'Practise this difficulty', 'تدرب على هذه الصعوبة', 'Practicar esta dificultad')}<ArrowRight /></Button>}
                      {result === 'transfer-success' && <p className="mt-2 text-xs text-muted-foreground">{say(lang, 'Tu peux maintenant poursuivre l’activité avec l’étape suivante.', 'You can now continue with the next step.', 'يمكنك الآن متابعة النشاط إلى المرحلة التالية.', 'Ahora puedes continuar con el siguiente paso.')}</p>}
                    </div>}
                  </div>;
                })()}
              </div>}
            </section>;
          })}
          {solved && <Button className="mt-5 w-full" disabled={busy || pendingVerification} onClick={() => void next()}>{index + 1 < total ? say(lang, 'Étape suivante', 'Next step', 'المرحلة التالية', 'Paso siguiente') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {hint && !solved && <div className="mt-4"><Tutor><Rich lang={lang} text={hint} /></Tutor></div>}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
        </>}
    </div>
  </section>;
}

/** Mini-contrôle : une étape par compétence acquise à revérifier ; chaque compétence est enregistrée à part. */
export function ReviewActivity({ lang, skills, engine, onBack }: { lang: Lang; skills: Skill[]; engine: SkillEngine; onBack: () => void }) {
  const [seeds, setSeeds] = useState<number[] | null>(null);
  const [ticket, setTicket] = useState('');
  const [round, setRound] = useState(0);
  const [startError, setStartError] = useState(false);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    let off = false;
    setStartError(false);
    engine.start('review', skills.map(s => s.id)).then(r => { if (!off) { setSeeds(r.seeds); setTicket(r.ticket); } }).catch(() => { if (!off) setStartError(true); });
    return () => { off = true; };
  }, [engine, skills, round]);
  const steps = useMemo(() => (seeds ? skills.map((s, i) => reviewStep(s, seeds[i]!)) : null), [skills, seeds]);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState('');
  const show = (l: L) => localizeMath(l[lang], lang);
  if (!steps || !seeds) return <Loading lang={lang} failed={startError} onBack={onBack} onRetry={() => setRound(r => r + 1)} />;
  const step = steps[index]!;
  const skill = skills[index]!;
  const count = steps.length;
  async function answer(reply: StepAnswer) {
    if (checking) return;
    setChecking(true); setSaveError('');
    try {
      const r = await engine.check(ticket, reply);
      setTicket(r.ticket);
      if (r.ok) { setSolved(true); return; }
      setMissed(m => m.includes(index) ? m : [...m, index]);
      setHint(show(step.hint));
    } catch { setSaveError(checkFailed(lang)); }
    finally { setChecking(false); }
  }
  async function next() {
    if (index + 1 < count) { setIndex(index + 1); setSolved(false); setHint(''); return; }
    setBusy(true); setSaveError('');
    try {
      await engine.finish(ticket);
      setDone(true);
    } catch { setSaveError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-4xl">
    <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Mini-contrôle', 'Quick check', 'مراقبة قصيرة', 'Mini control')}</span><h1>{say(lang, 'Est-ce que ça tient ?', 'Does it stick?', 'هل ما زلت تتذكر؟', '¿Lo recuerdas?')}</h1></div>
    <div className="skill-progress" aria-hidden>{steps.map((_, i) => <span key={i} className={done || i < index ? (missed.includes(i) ? 'skill-dot skill-dot-missed' : 'skill-dot skill-dot-done') : i === index ? 'skill-dot skill-dot-active' : 'skill-dot'} />)}</div>
    <div className="activity-panel">
      {done
        ? <div><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><p className="my-4 text-center text-xl font-bold">{missed.length === 0 ? say(lang, 'Tout est solide !', 'All solid!', 'كل شيء متين!', '¡Todo sólido!') : say(lang, 'Quelques compétences sont à revoir.', 'Some skills need reviewing.', 'بعض الكفايات تحتاج مراجعة.', 'Algunas competencias hay que repasarlas.')}</p>
          <ul className="skill-list">{skills.map((s, i) => <li key={s.id} className="skill-item"><span className={`skill-status skill-status-${missed.includes(i) ? 'review' : 'mastered'}`} aria-hidden>{missed.includes(i) ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-4 w-4" />}</span><span className="flex-1"><span className="block text-xs text-muted-foreground">{CHAPTER_NAMES[s.chapter][lang]}</span><span className="font-semibold">{s.title[lang]}</span></span><span className={`text-xs font-bold skill-status-text-${missed.includes(i) ? 'review' : 'mastered'}`}>{missed.includes(i) ? STATUS.review(lang) : STATUS.mastered(lang)}</span></li>)}</ul>
          {missed.length > 0 && <p className="mt-4 text-sm text-muted-foreground">{say(lang, 'Refais ces parcours à l’atelier pour les acquérir à nouveau.', 'Redo these pathways in the workshop to master them again.', 'أعد هذه المسارات في الورشة لاكتسابها من جديد.', 'Repite estos itinerarios en el taller para volver a adquirirlos.')}</p>}
          <Button className="mt-5 w-full" onClick={onBack}>{say(lang, 'Retour à l’atelier', 'Back to the workshop', 'العودة إلى الورشة', 'Volver al taller')}</Button></div>
        : <>
          <p className="mb-2 text-xs font-bold text-primary-deep">{CHAPTER_NAMES[skill.chapter][lang]} · {skill.title[lang]}</p>
          <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug"><Rich lang={lang} text={show(step.prompt)} /></p><Speaker text={spoken(show(step.prompt), lang)} lang={lang} /></div>
          <StepView key={`${seeds.join('-')}-${index}`} lang={lang} step={step} solved={solved} onAnswer={answer} />
          {solved && <Button className="mt-5 w-full" disabled={busy} onClick={() => void next()}>{index + 1 < steps.length ? say(lang, 'Question suivante', 'Next question', 'السؤال التالي', 'Siguiente pregunta') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {hint && !solved && <div className="mt-4"><Tutor><Rich lang={lang} text={hint} /></Tutor></div>}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
        </>}
    </div>
  </section>;
}

export { Rich } from './math-text';

const checkFailed = (lang: Lang) => say(lang, 'Vérification impossible (connexion ?). Réessaie.', 'Could not check (connection?). Try again.', 'تعذر التحقق (الاتصال؟). حاول مجددًا.', 'No se pudo comprobar (¿conexión?). Reintenta.');
/** En attendant l'énoncé tiré par le serveur. */
function Loading({ lang, failed, onBack, onRetry }: { lang: Lang; failed: boolean; onBack: () => void; onRetry: () => void }) {
  return <section className="mx-auto max-w-4xl">
    <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>
    {failed
      ? <div role="alert" className="activity-panel"><p>{say(lang, 'L’activité n’a pas pu démarrer. Vérifie ta connexion.', 'The activity could not start. Check your connection.', 'تعذر بدء النشاط. تحقق من اتصالك.', 'La actividad no pudo empezar. Revisa tu conexión.')}</p><Button className="mt-4" onClick={onRetry}><RefreshCw />{say(lang, 'Réessayer', 'Try again', 'إعادة المحاولة', 'Reintentar')}</Button></div>
      : <p className="animate-pulse text-muted-foreground">PiSan…</p>}
  </section>;
}

const checkLabel = (lang: Lang) => say(lang, 'Vérifier', 'Check', 'تحقق', 'Comprobar');
const Solved = ({ lang }: { lang: Lang }) => <p role="status" className="mt-4 flex items-center justify-center gap-2 font-bold text-primary-deep"><Check className="h-5 w-5" />{say(lang, 'C’est juste !', 'That’s right!', 'صحيح!', '¡Correcto!')}</p>;

function StepView({ lang, step, solved, onAnswer, onFractionInteraction }: { lang: Lang; step: Step; solved: boolean; onAnswer: (reply: StepAnswer) => void; onFractionInteraction?: (event: FractionInteractionEvent, widget: FractionWidgetSpec) => void }) {
  const show = (l: L) => localizeMath(l[lang], lang);
  const [picked, setPicked] = useState<number | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [text, setText] = useState('');
  const [blanks, setBlanks] = useState<number[]>([]);
  const [widgetState, setWidgetState] = useState<WidgetState>({});
  const [cursor, setCursor] = useState<P | null>(step.type === 'grid' ? step.start : null);

  switch (step.type) {
    case 'choice':
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{step.options.map((o, i) => <Button key={i} variant={picked === i ? (i === step.answer ? 'default' : 'destructive') : 'soft'} className="h-auto min-h-11 whitespace-normal" disabled={solved} aria-pressed={picked === i} onClick={() => { setPicked(i); onAnswer({ type: 'choice', choice: i }); }}><Rich lang={lang} text={show(o)} /></Button>)}</div>
        {solved && <Solved lang={lang} />}
      </>;
    case 'tap':
      return <>
        <GeoScene lang={lang} scene={step.scene} tapped={tapped} answer={step.answer} locked={solved} onTap={id => { setTapped(id); onAnswer({ type: 'tap', id }); }} />
        {solved && <Solved lang={lang} />}
      </>;
    case 'chips': {
      const used = new Set(seq);
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <div className="chip-line" dir="ltr" aria-live="polite" aria-label={say(lang, 'Ton égalité', 'Your equality', 'متساويتك', 'Tu igualdad')}>{seq.length ? seq.map((i, k) => <span key={k} className="chip chip-placed"><Rich lang={lang} text={step.tokens[i]!} /></span>) : <span className="text-sm text-muted-foreground">{say(lang, 'Touche les étiquettes dans l’ordre.', 'Tap the labels in order.', 'المس البطاقات بالترتيب.', 'Toca las etiquetas en orden.')}</span>}</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2" dir="ltr">{step.tokens.map((tok, i) => <button key={i} type="button" className="chip" disabled={solved || used.has(i)} onClick={() => setSeq([...seq, i])}><Rich lang={lang} text={tok} /></button>)}</div>
        {!solved && <div className="mt-4 flex gap-2"><Button variant="ghost" disabled={!seq.length} onClick={() => setSeq(seq.slice(0, -1))}><Delete />{say(lang, 'Effacer', 'Undo', 'مسح', 'Borrar')}</Button><Button className="flex-1" disabled={!seq.length} onClick={() => onAnswer({ type: 'chips', tokens: seq.map(i => step.tokens[i]!) })}>{checkLabel(lang)}<ArrowRight /></Button></div>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'number': {
      const check = () => { if (text.trim()) onAnswer({ type: 'number', text }); };
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <label htmlFor="skill-answer" className="field-label mt-4">{say(lang, 'Ta réponse', 'Your answer', 'جوابك', 'Tu respuesta')}</label>
        <input id="skill-answer" dir="ltr" inputMode="decimal" className="form-input text-center font-display text-2xl" value={text} autoComplete="off" disabled={solved} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') check(); }} />
        {!solved && <Button className="mt-4 w-full" disabled={!text.trim()} onClick={check}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'sentence': {
      let b = -1;
      const count = step.parts.filter(p => 'options' in p).length;
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <p className="sentence-line mt-4">{step.parts.map((part, k) => {
          if (!('options' in part)) return <span key={k}>{show(part)} </span>;
          const i = ++b;
          return <select key={k} aria-label={say(lang, `Trou ${i + 1}`, `Blank ${i + 1}`, `فراغ ${i + 1}`, `Hueco ${i + 1}`)} className="sentence-blank" disabled={solved} value={blanks[i] ?? ''} onChange={e => { const next = [...blanks]; next[i] = Number(e.target.value); setBlanks(next); }}>
            <option value="" disabled>…</option>
            {(part as Blank).options.map((o, j) => <option key={j} value={j}>{show(o)}</option>)}
          </select>;
        })}</p>
        {!solved && <Button className="mt-4 w-full" disabled={blanks.filter(v => v !== undefined).length < count} onClick={() => onAnswer({ type: 'sentence', blanks })}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'grid': {
      const at = cursor ?? step.start;
      return <>
        <GeoScene lang={lang} scene={step.scene} locked={solved} cursor={{ label: step.label, at, onMove: setCursor }} />
        <p className="mt-1 text-center text-xs text-muted-foreground" dir="ltr">{step.heightOnly ? `${say(lang, 'hauteur', 'height', 'الارتفاع', 'altura')} : ${minusSign(fmt(at.y))}` : <>{step.label} ({minusSign(fmt(at.x))} ; {minusSign(fmt(at.y))})</>} · {say(lang, 'touche le quadrillage ou utilise les flèches', 'tap the grid or use the arrow keys', 'المس الشبكة أو استعمل الأسهم', 'toca la cuadrícula o usa las flechas')}</p>
        {!solved && <Button className="mt-4 w-full" onClick={() => onAnswer({ type: 'grid', x: at.x, y: at.y })}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'widget': {
      // Constante : TypeScript garde le type précis de la manipulation dans les rappels.
      const w = step.widget;
      const fraction = w.kind === 'fraction-equivalence' || w.kind === 'fraction-addition' || w.kind === 'fraction-numberline' ? w : null;
      return <>
        {step.widget.kind === 'fraction-bars' && <FractionBars lang={lang} left={step.widget.left} right={step.widget.right} locked={solved} onComplete={(_ok, state) => onAnswer({ type: 'widget', state })} />}
        {fraction?.kind === 'fraction-equivalence' && <FractionEquivalenceLab lang={lang} source={fraction.source} factor={fraction.factor} locked={solved} onComplete={(_ok, state) => onAnswer({ type: 'widget', state })} onInteraction={event => onFractionInteraction?.(event, fraction)} />}
        {fraction?.kind === 'fraction-addition' && <FractionAdditionLab lang={lang} left={fraction.left} right={fraction.right} locked={solved} onComplete={(_ok, state) => onAnswer({ type: 'widget', state })} onInteraction={event => onFractionInteraction?.(event, fraction)} />}
        {fraction?.kind === 'fraction-numberline' && <FractionNumberLineLab lang={lang} target={fraction.target} locked={solved} onComplete={(_ok, state) => onAnswer({ type: 'widget', state })} onInteraction={event => onFractionInteraction?.(event, fraction)} />}
        {step.widget.kind === 'line' && <LineWidget lang={lang} target={step.widget} locked={solved} onState={setWidgetState} />}
        {step.widget.kind === 'tangent' && <TangentWidget lang={lang} target={step.widget} locked={solved} onState={setWidgetState} />}
        {step.widget.kind === 'level' && <LevelWidget lang={lang} values={step.widget.values} locked={solved} onState={setWidgetState} />}
        {step.widget.kind === 'squares' && <SquaresWidget lang={lang} ab={step.widget.ab} ac={step.widget.ac} locked={solved} onState={setWidgetState} />}
        {step.widget.kind === 'thales' && <ThalesWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetState} />}
        {step.widget.kind === 'inscribed' && <InscribedWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetState} />}
        {!solved && !['fraction-bars', 'fraction-equivalence', 'fraction-addition', 'fraction-numberline'].includes(step.widget.kind) && <Button className="mt-4 w-full" onClick={() => onAnswer({ type: 'widget', state: widgetState })}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
  }
}

function Shown({ lang, scene, table }: { lang: Lang; scene?: Scene | undefined; table?: Table | undefined }) {
  return <>
    {table && <div className="data-table-wrap" dir="ltr"><table className="data-table"><tbody>{table.head.map((h, i) => <tr key={i}><th scope="row">{h[lang]}</th>{(table.rows[i] ?? []).map((c, j) => <td key={j}><Rich lang={lang} text={localizeMath(c, lang)} /></td>)}</tr>)}</tbody></table></div>}
    {scene && <GeoScene lang={lang} scene={scene} />}
  </>;
}

/** Régler a et b : la droite y = ax + b doit passer par A et B. */
export function LineWidget({ lang, target, locked, onState }: { lang: Lang; target: { a: number; b: number; A: P; B: P }; locked: boolean; onState: (state: WidgetState) => void }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const grid = { minX: -5, maxX: 5, minY: -5, maxY: 5, axes: true };
  const [P1, P2] = clipLine(a, b, grid);
  const scene: Scene = { grid, points: { A: target.A, B: target.B, P: P1, Q: P2 }, hidden: ['P', 'Q'], segments: [{ id: 'd', a: 'P', b: 'Q', style: 'bold' }] };
  const update = (na: number, nb: number) => { setA(na); setB(nb); onState({ a: na, b: nb }); };
  const on = (p: P) => Math.abs(a * p.x + b - p.y) < 1e-9;
  return <div>
    <GeoScene lang={lang} scene={scene} />
    <p className="mt-2 text-center font-display text-xl" dir="ltr">y = {fx(a, b)}</p>
    <label htmlFor="line-a" className="field-label mt-2">a = {fmt(a)}</label>
    <input id="line-a" type="range" min={-3} max={3} step={0.5} value={a} disabled={locked} className="w-full accent-[var(--primary)]" onChange={e => update(Number(e.target.value), b)} />
    <label htmlFor="line-b" className="field-label mt-2">b = {fmt(b)}</label>
    <input id="line-b" type="range" min={-5} max={5} step={1} value={b} disabled={locked} className="w-full accent-[var(--primary)]" onChange={e => update(a, Number(e.target.value))} />
    <div className="mt-2 flex justify-center gap-2 text-sm" dir="ltr"><span className="pill">A {on(target.A) ? '✓' : '✗'}</span><span className="pill">B {on(target.B) ? '✓' : '✗'}</span></div>
  </div>;
}

/** Un point glisse sur la parabole ; la tangente suit, avec sa pente. Réussi quand elle est horizontale en x = target. */
export function TangentWidget({ lang, target, locked, onState }: { lang: Lang; target: { a: number; b: number; c: number; target: number }; locked: boolean; onState: (state: WidgetState) => void }) {
  const grid = { minX: -4, maxX: 5, minY: -3, maxY: 6, axes: true };
  const start = target.target + (target.target + 2 <= grid.maxX - 1 ? 2 : -2);
  const [x0, setX0] = useState(start);
  const f = (x: number) => target.a * x * x + target.b * x + target.c;
  const slope = 2 * target.a * x0 + target.b;
  const tan = (x: number) => f(x0) + slope * (x - x0);
  const scene: Scene = { grid, curves: [curvePoints(f, grid)], points: { M: { x: x0, y: f(x0) }, T1: { x: x0 - 1.8, y: tan(x0 - 1.8) }, T2: { x: x0 + 1.8, y: tan(x0 + 1.8) } }, hidden: ['T1', 'T2'], segments: [{ id: 't', a: 'T1', b: 'T2', style: 'bold' }] };
  return <div>
    <GeoScene lang={lang} scene={scene} />
    <label htmlFor="tangent-x" className="field-label mt-2">x = {fmt(x0)}</label>
    <input id="tangent-x" type="range" min={grid.minX + 1} max={grid.maxX - 1} step={0.5} value={x0} disabled={locked} className="w-full accent-[var(--primary)]" onChange={e => { const x = Number(e.target.value); setX0(x); onState({ x }); }} />
    <p className="mt-2 text-center font-display text-lg" dir="ltr">{say(lang, 'pente de la tangente', 'tangent slope', 'ميل المماس', 'pendiente de la tangente')} : {fmt(slope)}</p>
  </div>;
}

/** Colonnes de cubes à égaliser : la hauteur commune est la moyenne. */
export function LevelWidget({ lang, values, locked, onState }: { lang: Lang; values: number[]; locked: boolean; onState: (state: WidgetState) => void }) {
  const [cols, setCols] = useState(values);
  const [hand, setHand] = useState(0);
  const max = Math.max(...values) + 1;
  const move = (i: number, d: 1 | -1) => {
    const next = cols.map((c, k) => k === i ? c + d : c);
    const h = hand - d;
    setCols(next); setHand(h); onState({ values: next, hand: h });
  };
  const sum = values.reduce((t, v) => t + v, 0);
  return <div>
    <div className="level-board" dir="ltr">{cols.map((c, i) => <div key={i} className="level-col">
      <Button size="sm" variant="soft" aria-label={say(lang, `Poser un cube sur la colonne ${i + 1}`, `Put a cube on column ${i + 1}`, `ضع مكعبًا على العمود ${i + 1}`, `Poner un cubo en la columna ${i + 1}`)} disabled={locked || hand === 0 || c >= max + 3} onClick={() => move(i, 1)}>▲</Button>
      <div className="level-stack" style={{ height: `${(max + 2) * 22}px` }}>{Array.from({ length: c }, (_, k) => <span key={k} className="level-cube" />)}</div>
      <span className="text-sm font-bold">{c}</span>
      <Button size="sm" variant="soft" aria-label={say(lang, `Prendre un cube de la colonne ${i + 1}`, `Take a cube from column ${i + 1}`, `خذ مكعبًا من العمود ${i + 1}`, `Quitar un cubo de la columna ${i + 1}`)} disabled={locked || c === 0} onClick={() => move(i, -1)}>▼</Button>
    </div>)}</div>
    <p role="status" className="mt-3 text-center text-sm font-semibold">{hand > 0 ? say(lang, `Cubes en main : ${hand}`, `Cubes in hand: ${hand}`, `مكعبات في اليد: ${hand}`, `Cubos en la mano: ${hand}`) : cols.every(c => c === cols[0]) ? say(lang, `Toutes les colonnes ont ${cols[0]} cubes : ${sum} ÷ ${cols.length} = ${cols[0]}.`, `Every column has ${cols[0]} cubes: ${sum} ÷ ${cols.length} = ${cols[0]}.`, `كل الأعمدة فيها ${cols[0]} مكعبات: ${sum} ÷ ${cols.length} = ${cols[0]}.`, `Todas las columnas tienen ${cols[0]} cubos: ${sum} ÷ ${cols.length} = ${cols[0]}.`) : say(lang, `Total : ${sum} cubes.`, `Total: ${sum} cubes.`, `المجموع: ${sum} مكعبًا.`, `Total: ${sum} cubos.`)}</p>
  </div>;
}

// ───────────── Manipulations ─────────────

function ThalesWidget({ lang, problem, locked, onState }: { lang: Lang; problem: ThalesProblem; locked: boolean; onState: (state: WidgetState) => void }) {
  const [m, setM] = useState(1);
  return <ThalesFigure lang={lang} problem={problem} m={m} locked={locked} revealMn={locked} onM={v => { setM(v); onState({ m: v }); }} />;
}

function InscribedWidget({ lang, problem, locked, onState }: { lang: Lang; problem: InscribedProblem; locked: boolean; onState: (state: WidgetState) => void }) {
  const [theta, setTheta] = useState(90);
  const [seen, setSeen] = useState<[number, number]>([90, 90]);
  const [lo, hi] = inscribedRange(problem.central);
  return <InscribedFigure lang={lang} problem={problem} theta={theta} locked={locked} onTheta={deg => {
    const d = Math.max(lo, Math.min(hi, deg));
    const next: [number, number] = [Math.min(seen[0], d), Math.max(seen[1], d)];
    setTheta(d); setSeen(next); onState({ span: next[1] - next[0] });
  }} />;
}

/**
 * Les trois carrés de Pythagore, avec un angle en A réglable. On « verse » les carreaux des deux petits carrés
 * dans le grand : il déborde si l'angle est aigu, il reste de la place s'il est obtus, il est plein à 90° exactement.
 */
export function SquaresWidget({ lang, ab, ac, locked, onState }: { lang: Lang; ab: number; ac: number; locked: boolean; onState: (state: WidgetState) => void }) {
  const [angle, setAngle] = useState(60);
  const [poured, setPoured] = useState(false);
  const A = { x: 0, y: 0 }, B = { x: ab, y: 0 }, C = { x: ac * Math.cos((angle * Math.PI) / 180), y: ac * Math.sin((angle * Math.PI) / 180) };
  const sum = ab * ab + ac * ac;
  const bc2 = (B.x - C.x) ** 2 + (B.y - C.y) ** 2;
  const diff = Math.round((sum - bc2) * 10) / 10;
  const outward = (p: P, q: P, other: P) => {
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    let n = { x: -(q.y - p.y) / len, y: (q.x - p.x) / len };
    if ((other.x - p.x) * n.x + (other.y - p.y) * n.y > 0) n = { x: -n.x, y: -n.y };
    return { n, len };
  };
  const square = (p: P, q: P, other: P, depth = 1) => { const { n, len } = outward(p, q, other); return [p, q, { x: q.x + n.x * len * depth, y: q.y + n.y * len * depth }, { x: p.x + n.x * len * depth, y: p.y + n.y * len * depth }]; };
  const sqAB = square(A, B, C), sqAC = square(C, A, B), sqBC = square(B, C, A);
  const all = [...sqAB, ...sqAC, ...sqBC];
  const minX = Math.min(...all.map(p => p.x)), maxX = Math.max(...all.map(p => p.x)), minY = Math.min(...all.map(p => p.y)), maxY = Math.max(...all.map(p => p.y));
  const s = 300 / Math.max(maxX - minX, maxY - minY), pad = 24;
  const v = (p: P) => ({ x: (p.x - minX) * s + pad, y: (maxY - p.y) * s + pad });
  const pts = (list: P[]) => list.map(p => { const q = v(p); return `${q.x},${q.y}`; }).join(' ');
  const tiles = (p: P, q: P, other: P, count: number) => {
    const { n, len } = outward(p, q, other);
    const lines: ReactNode[] = [];
    for (let i = 1; i < count; i++) {
      const f = i / count;
      const a1 = { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f }, b1 = { x: p.x + n.x * len * f, y: p.y + n.y * len * f };
      const [x1, y1] = [v(a1), v({ x: a1.x + n.x * len, y: a1.y + n.y * len })], [x2, y2] = [v(b1), v({ x: b1.x + q.x - p.x, y: b1.y + q.y - p.y })];
      lines.push(<line key={`a${i}`} x1={x1.x} y1={x1.y} x2={y1.x} y2={y1.y} className="figure-grid" />, <line key={`b${i}`} x1={x2.x} y1={x2.y} x2={y2.x} y2={y2.y} className="figure-grid" />);
    }
    return lines;
  };
  const fill = square(B, C, A, Math.min(1, sum / bc2));
  const mid = (list: P[]) => v({ x: list.reduce((t, p) => t + p.x, 0) / 4, y: list.reduce((t, p) => t + p.y, 0) / 4 });
  const ok = poured && angle === 90;
  const update = (a: number, p: boolean) => { setAngle(a); setPoured(p); onState({ angle: a, poured: p }); };
  const status = !poured ? '' : Math.abs(diff) < 0.05
    ? say(lang, 'Le grand carré est rempli exactement !', 'The big square is filled exactly!', 'امتلأ المربع الكبير تمامًا!', '¡El cuadrado grande se llena exactamente!')
    : diff > 0 ? say(lang, `Ça déborde : ${fmt(diff)} carreaux de trop.`, `It overflows: ${fmt(diff)} tiles too many.`, `يفيض: ${fmt(diff)} مربعات زائدة.`, `Se desborda: sobran ${fmt(diff)} cuadraditos.`)
    : say(lang, `Il manque ${fmt(-diff)} carreaux.`, `${fmt(-diff)} tiles are missing.`, `ينقص ${fmt(-diff)} مربعات.`, `Faltan ${fmt(-diff)} cuadraditos.`);
  return <div>
    <svg viewBox={`0 0 ${(maxX - minX) * s + 2 * pad} ${(maxY - minY) * s + 2 * pad}`} className="figure-svg skill-scene" direction="ltr" role="img" aria-label={say(lang, `Triangle ABC, angle en A de ${angle}°, avec un carré sur chaque côté`, `Triangle ABC, angle at A of ${angle}°, with a square on each side`, `المثلث ABC، الزاوية في A تساوي ${angle}°، مع مربع على كل ضلع`, `Triángulo ABC, ángulo en A de ${angle}°, con un cuadrado en cada lado`)}>
      <polygon points={pts(sqAB)} className={`figure-square figure-square-1 ${poured ? 'skill-emptied' : ''}`} />
      <polygon points={pts(sqAC)} className={`figure-square figure-square-2 ${poured ? 'skill-emptied' : ''}`} />
      <polygon points={pts(sqBC)} className="figure-square figure-square-3" />
      {poured && <polygon points={pts(fill)} className={diff > 0.05 ? 'skill-fill skill-fill-over' : 'skill-fill'} />}
      {tiles(A, B, C, ab)}{tiles(C, A, B, ac)}
      <polygon points={pts([A, B, C])} className="figure-triangle" />
      {angle === 90 && <polyline points={pts([{ x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }])} className="figure-right-angle" />}
      <text {...mid(sqAB)} className="figure-area">{poured ? 0 : ab * ab}</text>
      <text {...mid(sqAC)} className="figure-area">{poured ? 0 : ac * ac}</text>
      <text {...mid(sqBC)} className="figure-area">{fmt(Math.round(bc2 * 10) / 10)}</text>
      {([['A', A], ['B', B], ['C', C]] as const).map(([name, p]) => { const q = v(p); const c = v({ x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 }); const d = Math.hypot(q.x - c.x, q.y - c.y) || 1; return <text key={name} x={q.x + ((q.x - c.x) / d) * 16 - 5} y={q.y + ((q.y - c.y) / d) * 16 + 5} className="figure-label">{name}</text>; })}
    </svg>
    <label htmlFor="squares-angle" className="field-label mt-3">{say(lang, `Angle en A : ${angle}°`, `Angle at A: ${angle}°`, `الزاوية في A: ${angle}°`, `Ángulo en A: ${angle}°`)}</label>
    <input id="squares-angle" type="range" min={30} max={150} step={5} value={angle} disabled={locked} className="w-full accent-[var(--primary)]" onChange={e => update(Number(e.target.value), poured)} />
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm" dir="ltr">
      <span className="pill">AB² + AC² = {sum}</span><span className="pill">BC² ≈ {fmt(Math.round(bc2 * 10) / 10)}</span>
      {!locked && <Button size="sm" variant="soft" onClick={() => update(angle, !poured)}>{poured ? say(lang, 'Reprendre les carreaux', 'Take the tiles back', 'استرجاع المربعات', 'Recuperar los cuadraditos') : say(lang, 'Verser les carreaux', 'Pour the tiles', 'اسكب المربعات', 'Verter los cuadraditos')}</Button>}
    </div>
    {status && <p role="status" className={`mt-3 text-center font-semibold ${ok ? 'text-primary-deep' : ''}`}>{status}</p>}
  </div>;
}

// ───────────── Figures ─────────────

/** Dessine une figure de src/lib/skills.ts ; côtés, arcs et sommets (équerre) peuvent se toucher. */
type Cursor = { label: string; at: P; onMove: (p: P) => void };

export function GeoScene({ lang, scene, tapped, answer, locked, onTap, cursor }: { lang: Lang; scene: Scene; tapped?: string | null; answer?: string; locked?: boolean; onTap?: (id: string) => void; cursor?: Cursor }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [square, setSquare] = useState<string | null>(null);
  const names = Object.keys(scene.points);
  const pts = Object.values(scene.points);
  const r = scene.circle?.r ?? 0;
  const g = scene.grid;
  const pr = scene.protractor ? scene.points[scene.protractor.c] : undefined;
  const PR = 3.2; // rayon du rapporteur, en unités de la figure
  const extra = [...(scene.rects ?? []).flatMap(b => [{ x: b.x, y: b.y }, { x: b.x + b.w, y: b.y + b.h }]), ...(scene.labels ?? []).map(l => l.at), ...(pr && scene.protractor ? Array.from({ length: 7 }, (_, i) => { const a = ((scene.protractor!.zero + i * 30) * Math.PI) / 180; return { x: pr.x + PR * Math.cos(a), y: pr.y + PR * Math.sin(a) }; }) : [])]; // le demi-disque seulement
  const xs = pts.map(p => p.x).concat(scene.circle ? [-r, r] : [], g ? [g.minX, g.maxX] : [], extra.map(p => p.x)), ys = pts.map(p => p.y).concat(scene.circle ? [-r, r] : [], g ? [g.minY, g.maxY] : [], extra.map(p => p.y));
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = (g ? 300 : 260) / Math.max(maxX - minX, maxY - minY, 1), pad = g ? 24 : 40;
  const v = (p: P) => ({ x: (p.x - minX) * s + pad, y: (maxY - p.y) * s + pad });
  const P_ = (n: string) => v(scene.points[n]!);
  const center = scene.circle ? v(scene.points[scene.circle.c]!) : (() => { const c = pts.reduce((t, p) => ({ x: t.x + p.x / pts.length, y: t.y + p.y / pts.length }), { x: 0, y: 0 }); return v(c); })();
  const away = (q: P, dist: number) => { const d = Math.hypot(q.x - center.x, q.y - center.y) || 1; return { x: q.x + ((q.x - center.x) / d) * dist, y: q.y + ((q.y - center.y) / d) * dist }; };
  const unit = (from: P, to: P) => { const d = Math.hypot(to.x - from.x, to.y - from.y) || 1; return { x: (to.x - from.x) / d, y: (to.y - from.y) / d }; };
  const key = (id: string) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap?.(id); } };
  const state = (id: string) => tapped === id ? (id === answer ? ' skill-ok' : ' skill-wrong') : '';
  const arcPath = (start: number, end: number, rr: number) => {
    const c = scene.points[scene.circle!.c]!;
    const at = (d: number) => v({ x: c.x + rr * Math.cos((d * Math.PI) / 180), y: c.y + rr * Math.sin((d * Math.PI) / 180) });
    const a = at(start), b = at(end);
    return `M ${a.x} ${a.y} A ${rr * s} ${rr * s} 0 ${end - start > 180 ? 1 : 0} 0 ${b.x} ${b.y}`;
  };
  // Équerre posée sur le sommet choisi, un bord le long du premier côté.
  const equerre = (() => {
    if (!scene.equerre || !scene.polygon || !square) return null;
    const i = scene.polygon.indexOf(square);
    const vtx = P_(square), a = P_(scene.polygon[(i + 1) % 3]!), b = P_(scene.polygon[(i + 2) % 3]!);
    const u = unit(vtx, a);
    let w = { x: -u.y, y: u.x };
    if ((b.x - vtx.x) * w.x + (b.y - vtx.y) * w.y < 0) w = { x: -w.x, y: -w.y };
    const L1 = 110, L2 = 80;
    return <g aria-hidden className="skill-equerre"><polygon points={`${vtx.x},${vtx.y} ${vtx.x + u.x * L1},${vtx.y + u.y * L1} ${vtx.x + w.x * L2},${vtx.y + w.y * L2}`} /><polyline points={`${vtx.x + u.x * 12},${vtx.y + u.y * 12} ${vtx.x + u.x * 12 + w.x * 12},${vtx.y + u.y * 12 + w.y * 12} ${vtx.x + w.x * 12},${vtx.y + w.y * 12}`} /></g>;
  })();
  const width = (maxX - minX) * s + 2 * pad, height = (maxY - minY) * s + 2 * pad;
  const gridLines = g && <g aria-hidden>
    {Array.from({ length: g.maxX - g.minX + 1 }, (_, i) => g.minX + i).map(x => { const a = v({ x, y: g.minY }), b = v({ x, y: g.maxY }); return <line key={`x${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={g.axes && x === 0 ? 'skill-axis' : 'figure-grid'} />; })}
    {Array.from({ length: g.maxY - g.minY + 1 }, (_, i) => g.minY + i).map(y => { const a = v({ x: g.minX, y }), b = v({ x: g.maxX, y }); return <line key={`y${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={g.axes && y === 0 ? 'skill-axis' : 'figure-grid'} />; })}
    {g.axes && <>
      {Array.from({ length: g.maxX - g.minX + 1 }, (_, i) => g.minX + i).filter(x => x !== 0).map(x => { const q = v({ x, y: 0 }); return <text key={`tx${x}`} x={q.x} y={q.y + 13} className="skill-tick">{minusSign(String(x))}</text>; })}
      {Array.from({ length: g.maxY - g.minY + 1 }, (_, i) => g.minY + i).filter(y => y !== 0).map(y => { const q = v({ x: 0, y }); return <text key={`ty${y}`} x={q.x - 9} y={q.y + 4} className="skill-tick">{minusSign(String(y))}</text>; })}
      {(() => { const q = v({ x: 0, y: 0 }); return <text x={q.x - 9} y={q.y + 13} className="skill-tick">0</text>; })()}
    </>}
  </g>;
  const clampGrid = (p: P): P => g ? { x: Math.max(g.minX, Math.min(g.maxX, p.x)), y: Math.max(g.minY, Math.min(g.maxY, p.y)) } : p;
  const pickNode = (e: ReactMouseEvent<SVGSVGElement>) => {
    if (!cursor || locked || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM(); if (!ctm) return;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    cursor.onMove(clampGrid({ x: Math.round((q.x - pad) / s + minX), y: Math.round(maxY - (q.y - pad) / s) }));
  };
  const cursorKey = (e: KeyboardEvent) => {
    if (!cursor || locked) return;
    const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    cursor.onMove(clampGrid({ x: cursor.at.x + d[0]!, y: cursor.at.y + d[1]! }));
  };
  return <div>
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className={`figure-svg skill-scene${cursor && !locked ? ' skill-pickable' : ''}`} direction="ltr" role="group" aria-label={say(lang, 'Figure', 'Figure', 'الشكل', 'Figura')} onClick={pickNode}>
      {gridLines}
      {scene.rects?.map((b, i) => { const a = v({ x: b.x, y: b.y + b.h }), c = v({ x: b.x + b.w, y: b.y }); return <rect key={`r${i}`} x={a.x} y={a.y} width={c.x - a.x} height={c.y - a.y} rx={2} className="skill-bar" />; })}
      {scene.curves?.map((c, i) => <polyline key={`c${i}`} points={c.map(p => { const q = v(p); return `${q.x},${q.y}`; }).join(' ')} className="skill-curve" />)}
      {pr && scene.protractor && (() => {
        // Demi-disque gradué tous les 10°, chiffres tous les 30°, posé sur le sommet de l'angle.
        const z = scene.protractor.zero, at = (deg: number, k: number) => v({ x: pr.x + k * Math.cos(((z + deg) * Math.PI) / 180), y: pr.y + k * Math.sin(((z + deg) * Math.PI) / 180) });
        const a = at(0, PR), b = at(180, PR);
        return <g aria-hidden className="skill-protractor">
          <path d={`M ${a.x} ${a.y} A ${PR * s} ${PR * s} 0 0 0 ${b.x} ${b.y} Z`} />
          {Array.from({ length: 37 }, (_, i) => i * 5).map(d => { const o = at(d, PR), q = at(d, PR - (d % 10 ? 0.18 : d % 30 ? 0.3 : 0.45)); return <line key={d} x1={o.x} y1={o.y} x2={q.x} y2={q.y} />; })}
          {Array.from({ length: 7 }, (_, i) => i * 30).map(d => { const q = at(d, PR - 0.75); return <text key={d} x={q.x} y={q.y + 4} textAnchor="middle" className="skill-protractor-num">{d}</text>; })}
        </g>;
      })()}
      {scene.labels?.map((l, i) => { const q = v(l.at); return <text key={`l${i}`} x={q.x} y={q.y + 5} textAnchor="middle" className="skill-length">{minusSign(localizeMath(l.text, lang))}</text>; })}
      {scene.circle && <circle cx={center.x} cy={center.y} r={r * s} className="figure-circle" />}
      {scene.arcs?.map(arc => <g key={arc.id} {...(arc.tappable && onTap && !locked ? { role: 'button', tabIndex: 0, 'aria-label': say(lang, `Arc ${arc.text}`, `Arc ${arc.text}`, `القوس ${arc.text}`, `Arco ${arc.text}`), onClick: () => onTap(arc.id), onKeyDown: key(arc.id), className: 'skill-tappable' } : {})}>
        <path d={arcPath(arc.start, arc.end, r)} className={`skill-arc${state(arc.id)}`} />
        {arc.tappable && <path d={arcPath(arc.start, arc.end, r)} className="skill-hit" />}
        {(() => { const m = (arc.start + arc.end) / 2, c = scene.points[scene.circle!.c]!; const q = v({ x: c.x + (r + 0.7) * Math.cos((m * Math.PI) / 180), y: c.y + (r + 0.7) * Math.sin((m * Math.PI) / 180) }); return <text x={q.x - 5} y={q.y + 5} className="figure-label skill-arc-label">{arc.text}</text>; })()}
      </g>)}
      {scene.segments.map(seg => {
        const a = P_(seg.a), b = P_(seg.b);
        const tap = seg.tappable && onTap && !locked;
        const m = away({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, 16);
        return <g key={seg.id} {...(tap ? { role: 'button', tabIndex: 0, 'aria-label': `[${seg.id}]`, onClick: () => onTap(seg.id), onKeyDown: key(seg.id), className: 'skill-tappable' } : {})}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`skill-seg skill-seg-${seg.style ?? 'normal'}${state(seg.id)}`} />
          {seg.style === 'vector' && (() => { const u = unit(a, b), k = 12; return <polygon points={`${b.x},${b.y} ${b.x - u.x * k - u.y * k * 0.5},${b.y - u.y * k + u.x * k * 0.5} ${b.x - u.x * k + u.y * k * 0.5},${b.y - u.y * k - u.x * k * 0.5}`} className="skill-arrowhead" />; })()}
          {tap && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="skill-hit" />}
          {seg.text && <text x={m.x} y={m.y + 5} textAnchor="middle" className="skill-length">{minusSign(localizeMath(seg.text, lang))}</text>}
        </g>;
      })}
      {scene.rightAngles?.map(([a, vtx, b], i) => { const o = P_(vtx), u = unit(o, P_(a)), w = unit(o, P_(b)), k = 12; return <polyline key={`r${i}`} points={`${o.x + u.x * k},${o.y + u.y * k} ${o.x + (u.x + w.x) * k},${o.y + (u.y + w.y) * k} ${o.x + w.x * k},${o.y + w.y * k}`} className="figure-right-angle" />; })}
      {scene.angleMarks?.map(([a, vtx, b], i) => {
        const o = P_(vtx), u = unit(o, P_(a)), w = unit(o, P_(b)), k = 22;
        const sweep = u.x * w.y - u.y * w.x > 0 ? 1 : 0;
        return <path key={`m${i}`} d={`M ${o.x + u.x * k} ${o.y + u.y * k} A ${k} ${k} 0 0 ${sweep} ${o.x + w.x * k} ${o.y + w.y * k}`} className="figure-angle-arc" />;
      })}
      {equerre}
      {names.filter(n => !scene.hidden?.includes(n)).map(n => { const q = P_(n); const l = n === scene.circle?.c ? { x: q.x + 8, y: q.y - 8 } : g ? { x: q.x + 11, y: q.y - 11 } : away(q, 16); return <g key={n}><circle cx={q.x} cy={q.y} r={g ? 4.5 : 3} className="figure-point" /><text x={l.x - 5} y={l.y + 5} className={g ? 'figure-label skill-label-small' : 'figure-label'}>{n}</text></g>; })}
      {scene.equerre && scene.polygon && !locked && scene.polygon.map(n => { const q = P_(n); return <circle key={`e${n}`} cx={q.x} cy={q.y} r={18} role="button" tabIndex={0} aria-pressed={square === n} aria-label={say(lang, `Poser l’équerre en ${n}`, `Put the set square at ${n}`, `ضع الكوس في ${n}`, `Poner la escuadra en ${n}`)} className={`skill-vertex${square === n ? ' skill-vertex-on' : ''}`} onClick={() => setSquare(square === n ? null : n)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSquare(square === n ? null : n); } }} />; })}
      {cursor && (() => { const q = v(cursor.at); return <g role="slider" tabIndex={locked ? -1 : 0} aria-label={cursor.label} aria-valuetext={`(${cursor.at.x} ; ${cursor.at.y})`} aria-valuenow={cursor.at.x} onKeyDown={cursorKey} className={locked ? '' : 'figure-handle'}>
        {!locked && <circle cx={q.x} cy={q.y} r={16} className="figure-handle-halo" />}
        <circle cx={q.x} cy={q.y} r={6} className="figure-point" />
        <text x={q.x + 9} y={q.y - 9} className="figure-label">{cursor.label}</text>
      </g>; })()}
    </svg>
    {scene.caption && <p className="mt-1 text-center text-xs text-muted-foreground">{scene.caption[lang]}</p>}
    {scene.equerre && <p className="mt-1 text-center text-xs text-muted-foreground">{say(lang, 'Touche un sommet pour y poser l’équerre.', 'Tap a corner to put the set square there.', 'المس رأسًا لوضع الكوس عليه.', 'Toca un vértice para poner la escuadra.')}</p>}
  </div>;
}

// ───────────── Listes de compétences (atelier et parcours) ─────────────

export const CHAPTER_NAMES: Record<FigureKind, L> = {
  pythagoras: { fr: 'Théorème de Pythagore', en: 'Pythagoras’ theorem', ar: 'مبرهنة فيثاغورس', es: 'Teorema de Pitágoras' },
  thales: { fr: 'Théorème de Thalès', en: 'Intercept theorem', ar: 'مبرهنة طاليس', es: 'Teorema de Tales' },
  trigo: { fr: 'Trigonométrie', en: 'Trigonometry', ar: 'حساب المثلثات', es: 'Trigonometría' },
  inscribed: { fr: 'Angles inscrits', en: 'Inscribed angles', ar: 'الزوايا المحيطية', es: 'Ángulos inscritos' },
  vectors: { fr: 'Vecteurs', en: 'Vectors', ar: 'المتجهات', es: 'Vectores' },
  affine: { fr: 'Fonctions affines', en: 'Affine functions', ar: 'الدوال التآلفية', es: 'Funciones afines' },
  stats: { fr: 'Statistiques', en: 'Statistics', ar: 'الإحصاء', es: 'Estadística' },
  seq: { fr: 'Suites', en: 'Sequences', ar: 'المتتاليات', es: 'Sucesiones' },
  deriv: { fr: 'Dérivation', en: 'Derivatives', ar: 'الاشتقاق', es: 'Derivadas' },
  proba: { fr: 'Probabilités', en: 'Probability', ar: 'الاحتمالات', es: 'Probabilidad' },
  fractions: { fr: 'Fractions', en: 'Fractions', ar: 'الكسور', es: 'Fracciones' },
  decimals: { fr: 'Nombres décimaux', en: 'Decimals', ar: 'الأعداد العشرية', es: 'Números decimales' },
  proportion: { fr: 'Proportionnalité', en: 'Proportionality', ar: 'التناسبية', es: 'Proporcionalidad' },
  lines: { fr: 'Droites et angles', en: 'Lines and angles', ar: 'المستقيمات والزوايا', es: 'Rectas y ángulos' },
  symmetry: { fr: 'Symétrie', en: 'Symmetry', ar: 'التماثل', es: 'Simetría' },
  measures: { fr: 'Périmètres, aires, volumes', en: 'Perimeter, area, volume', ar: 'المحيطات والمساحات والأحجام', es: 'Perímetros, áreas, volúmenes' },
  relatives: { fr: 'Nombres relatifs', en: 'Negative numbers', ar: 'الأعداد النسبية', es: 'Números enteros' },
  data: { fr: 'Tableaux et graphiques', en: 'Tables and charts', ar: 'الجداول والتمثيلات', es: 'Tablas y gráficos' },
  arith: { fr: 'Opérations et division', en: 'Operations and division', ar: 'العمليات والقسمة', es: 'Operaciones y división' },
  powers: { fr: 'Puissances', en: 'Powers', ar: 'القوى', es: 'Potencias' },
  expressions: { fr: 'Expressions littérales', en: 'Expressions', ar: 'التعابير الحرفية', es: 'Expresiones algebraicas' },
  equations: { fr: 'Équations', en: 'Equations', ar: 'المعادلات', es: 'Ecuaciones' },
  polygons: { fr: 'Triangles et quadrilatères', en: 'Triangles and quadrilaterals', ar: 'المثلثات والرباعيات', es: 'Triángulos y cuadriláteros' },
  primes: { fr: 'Multiples et nombres premiers', en: 'Factors and primes', ar: 'المضاعفات والأعداد الأولية', es: 'Múltiplos y primos' },
  angles: { fr: 'Angles et parallélisme', en: 'Angles and parallel lines', ar: 'الزوايا والتوازي', es: 'Ángulos y paralelismo' },
  surfaces: { fr: 'Aires et volumes', en: 'Area and volume', ar: 'المساحات والأحجام', es: 'Áreas y volúmenes' },
  chance: { fr: 'Probabilités', en: 'Probability', ar: 'الاحتمالات', es: 'Probabilidad' },
  signs: { fr: 'Produits et quotients de relatifs', en: 'Multiplying and dividing signed numbers', ar: 'ضرب وقسمة الأعداد النسبية', es: 'Producto y cociente de relativos' },
  sci: { fr: 'Puissances de 10', en: 'Powers of 10', ar: 'قوى العدد 10', es: 'Potencias de 10' },
  literal: { fr: 'Calcul littéral', en: 'Algebra', ar: 'الحساب الحرفي', es: 'Cálculo algebraico' },
  linear: { fr: 'Équations du premier degré', en: 'Linear equations', ar: 'معادلات الدرجة الأولى', es: 'Ecuaciones de primer grado' },
  roots: { fr: 'Racines carrées', en: 'Square roots', ar: 'الجذور المربعة', es: 'Raíces cuadradas' },
  identities: { fr: 'Identités remarquables', en: 'Special products', ar: 'المتطابقات الهامة', es: 'Identidades notables' },
  inequalities: { fr: 'Inéquations et équation produit', en: 'Inequalities and zero products', ar: 'المتراجحات ومعادلة الجداء', es: 'Inecuaciones y ecuación producto' },
  systems: { fr: 'Systèmes de deux équations', en: 'Simultaneous equations', ar: 'نظمة معادلتين', es: 'Sistemas de dos ecuaciones' },
  solids: { fr: 'Géométrie dans l’espace', en: 'Solids and space', ar: 'الهندسة الفضائية', es: 'Geometría del espacio' },
};
const STATUS: Record<SkillStatus, (lang: Lang) => string> = {
  mastered: lang => say(lang, 'Acquis', 'Mastered', 'مكتسبة', 'Adquirida'),
  started: lang => say(lang, 'Commencé', 'Started', 'بدأت', 'Empezada'),
  review: lang => say(lang, 'À revoir', 'To review', 'للمراجعة', 'Por repasar'),
  todo: lang => say(lang, 'À faire', 'To do', 'للإنجاز', 'Por hacer'),
};

/** Les compétences d'un chapitre avec leur état ; `onOpen` absent : simple liste à cocher (parcours). */
export function SkillList({ lang, kind, attempts, onOpen, disabled }: { lang: Lang; kind: FigureKind; attempts: Attempt[]; onOpen?: (skill: Skill) => void; disabled?: boolean }) {
  return <ol className="skill-list">{skillsFor(kind).map(skill => {
    const status = skillStatus(attempts, skill.id);
    return <li key={skill.id} className="skill-item">
      <span className={`skill-status skill-status-${status}`} aria-hidden>{status === 'mastered' ? <Check className="h-4 w-4" /> : status === 'started' ? <span className="h-2 w-2 rounded-full bg-current" /> : status === 'review' ? <RotateCcw className="h-3.5 w-3.5" /> : null}</span>
      <span className="min-w-0 flex-1"><span className="block font-semibold">{skill.title[lang]}</span>{onOpen && <span className="block text-xs text-muted-foreground">{skill.desc[lang]}</span>}<span className="sr-only"> · {STATUS[status](lang)}</span></span>
      {onOpen ? <Button size="sm" variant={status === 'mastered' ? 'ghost' : 'soft'} disabled={disabled} onClick={() => onOpen(skill)} aria-label={`${skill.title[lang]} · ${STATUS[status](lang)}`}>{status === 'mastered' ? say(lang, 'Revoir', 'Review', 'مراجعة', 'Repasar') : say(lang, 'Commencer', 'Start', 'ابدأ', 'Empezar')}<ArrowRight /></Button>
        : <span className={`text-xs font-bold skill-status-text-${status}`}>{STATUS[status](lang)}</span>}
    </li>;
  })}</ol>;
}

