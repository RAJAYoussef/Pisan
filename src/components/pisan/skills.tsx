// Parcours de compétences : déroule les étapes d'une activité (src/lib/skills.ts) et dessine les figures.
import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { ArrowRight, Check, CheckCircle2, Delete, RefreshCw, RotateCcw } from 'lucide-react';
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
import { minusSign, Rich } from './math-text';
import { FractionBars } from './fraction-bars';
import { FractionAdditionLab, FractionEquivalenceLab, FractionNumberLineLab, type FractionInteractionEvent } from './fraction-labs';
import type { FractionReasoningEvent, FractionWidgetSpec } from '@/lib/fraction-reasoning';

export type FractionInteractionContext = FractionReasoningEvent;
type Props = { lang: Lang; skill: Skill; onSave: (a: Attempt) => Promise<void>; onBack: () => void; onFractionInteraction?: (event: FractionInteractionContext) => void };

/** Une compétence : les étapes s'enchaînent ; une étape ratée au premier essai ne compte pas comme réussie. */
export function SkillActivity({ lang, skill, onSave, onBack, onFractionInteraction }: Props) {
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const activity = useMemo(() => skill.build(seed), [skill, seed]);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { correct: number; total: number }>(null);
  const [saveError, setSaveError] = useState('');
  const step = activity.steps[index]!;
  const total = activity.steps.length;
  const show = (l: L) => localizeMath(l[lang], lang);

  function answer(ok: boolean) {
    if (ok) { setSolved(true); setHint(''); return; }
    setMissed(m => m.includes(index) ? m : [...m, index]);
    setHint(show(step.hint));
  }
  async function next() {
    if (index + 1 < total) { setIndex(index + 1); setSolved(false); setHint(''); return; }
    const result = { correct: total - missed.length, total };
    setBusy(true); setSaveError('');
    try { await onSave({ kind: 'workshop', notion: skillNotion(skill), skill: skill.id, ...result, date: new Date().toISOString(), minutes: Math.min(20, total * 2) }); setDone(result); }
    catch { setSaveError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); }
    finally { setBusy(false); }
  }
  const restart = () => { setSeed(s => (s * 7919 + 13) % 100000); setIndex(0); setMissed([]); setSolved(false); setHint(''); setDone(null); };

  return <section className="mx-auto max-w-4xl">
    <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Parcours de compétences', 'Skill pathway', 'مسار الكفايات', 'Itinerario de competencias')}</span><h1>{show(activity.title)}</h1></div>
    <div className="skill-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done ? total : index} aria-label={say(lang, 'Étapes', 'Steps', 'المراحل', 'Pasos')}>
      {activity.steps.map((_, i) => <span key={i} className={done || i < index ? (missed.includes(i) ? 'skill-dot skill-dot-missed' : 'skill-dot skill-dot-done') : i === index ? 'skill-dot skill-dot-active' : 'skill-dot'} />)}
    </div>
    <div className="activity-panel">
      {done
        ? <div className="text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><p className="my-4 text-xl font-bold">{done.correct === done.total ? say(lang, 'Compétence acquise !', 'Skill mastered!', 'تم اكتساب الكفاية!', '¡Competencia adquirida!') : say(lang, `${done.correct} étapes sur ${done.total} du premier coup. Recommence pour l’acquérir.`, `${done.correct} of ${done.total} steps at the first try. Go again to master it.`, `${done.correct} من ${done.total} مراحل من المحاولة الأولى. أعد للاكتساب.`, `${done.correct} de ${done.total} pasos al primer intento. Repite para adquirirla.`)}</p><p className="mb-5 text-sm text-muted-foreground" dir="ltr"><Rich lang={lang} text={localizeMath(activity.summary, lang)} /></p><Button onClick={restart}><RefreshCw />{say(lang, 'Nouvel énoncé', 'New exercise', 'تمرين جديد', 'Nuevo enunciado')}</Button></div>
        : <>
          <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug"><Rich lang={lang} text={show(step.prompt)} /></p><Speaker text={spoken(show(step.prompt), lang)} lang={lang} /></div>
          <StepView key={`${seed}-${index}`} lang={lang} step={step} solved={solved} onAnswer={answer} onFractionInteraction={(event, widget) => onFractionInteraction?.({ ...event, skillId: skill.id, activitySeed: seed, stepIndex: index, widget })} />
          {solved && <Button className="mt-5 w-full" disabled={busy} onClick={() => void next()}>{index + 1 < total ? say(lang, 'Étape suivante', 'Next step', 'المرحلة التالية', 'Paso siguiente') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {hint && !solved && <div className="mt-4"><Tutor><Rich lang={lang} text={hint} /></Tutor></div>}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
        </>}
    </div>
  </section>;
}

/** Mini-contrôle : une étape par compétence acquise à revérifier ; chaque compétence est enregistrée à part. */
export function ReviewActivity({ lang, skills, onSave, onBack }: { lang: Lang; skills: Skill[]; onSave: (a: Attempt) => Promise<void>; onBack: () => void }) {
  const [seed] = useState(() => Date.now() % 100000);
  const steps = useMemo(() => skills.map((s, i) => reviewStep(s, seed + i * 7)), [skills, seed]);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState('');
  const show = (l: L) => localizeMath(l[lang], lang);
  const step = steps[index]!;
  const skill = skills[index]!;
  function answer(ok: boolean) {
    if (ok) { setSolved(true); return; }
    setMissed(m => m.includes(index) ? m : [...m, index]);
    setHint(show(step.hint));
  }
  async function next() {
    if (index + 1 < steps.length) { setIndex(index + 1); setSolved(false); setHint(''); return; }
    setBusy(true); setSaveError('');
    try {
      for (const [i, s] of skills.entries()) await onSave({ kind: 'workshop', notion: skillNotion(s), skill: s.id, review: true, correct: missed.includes(i) ? 0 : 1, total: 1, date: new Date().toISOString(), minutes: 2 });
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
          <StepView key={`${seed}-${index}`} lang={lang} step={step} solved={solved} onAnswer={answer} />
          {solved && <Button className="mt-5 w-full" disabled={busy} onClick={() => void next()}>{index + 1 < steps.length ? say(lang, 'Question suivante', 'Next question', 'السؤال التالي', 'Siguiente pregunta') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {hint && !solved && <div className="mt-4"><Tutor><Rich lang={lang} text={hint} /></Tutor></div>}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
        </>}
    </div>
  </section>;
}

export { Rich } from './math-text';

const checkLabel = (lang: Lang) => say(lang, 'Vérifier', 'Check', 'تحقق', 'Comprobar');
const Solved = ({ lang }: { lang: Lang }) => <p role="status" className="mt-4 flex items-center justify-center gap-2 font-bold text-primary-deep"><Check className="h-5 w-5" />{say(lang, 'C’est juste !', 'That’s right!', 'صحيح!', '¡Correcto!')}</p>;

function StepView({ lang, step, solved, onAnswer, onFractionInteraction }: { lang: Lang; step: Step; solved: boolean; onAnswer: (ok: boolean) => void; onFractionInteraction?: (event: FractionInteractionEvent, widget: FractionWidgetSpec) => void }) {
  const show = (l: L) => localizeMath(l[lang], lang);
  const [picked, setPicked] = useState<number | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [text, setText] = useState('');
  const [blanks, setBlanks] = useState<number[]>([]);
  const [widgetOk, setWidgetOk] = useState(false);
  const [cursor, setCursor] = useState<P | null>(step.type === 'grid' ? step.start : null);

  switch (step.type) {
    case 'choice':
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{step.options.map((o, i) => <Button key={i} variant={picked === i ? (i === step.answer ? 'default' : 'destructive') : 'soft'} className="h-auto min-h-11 whitespace-normal" disabled={solved} aria-pressed={picked === i} onClick={() => { setPicked(i); onAnswer(i === step.answer); }}><Rich lang={lang} text={show(o)} /></Button>)}</div>
        {solved && <Solved lang={lang} />}
      </>;
    case 'tap':
      return <>
        <GeoScene lang={lang} scene={step.scene} tapped={tapped} answer={step.answer} locked={solved} onTap={id => { setTapped(id); onAnswer(id === step.answer); }} />
        {solved && <Solved lang={lang} />}
      </>;
    case 'chips': {
      const used = new Set(seq);
      return <>
        <Shown lang={lang} scene={step.scene} table={step.table} />
        <div className="chip-line" dir="ltr" aria-live="polite" aria-label={say(lang, 'Ton égalité', 'Your equality', 'متساويتك', 'Tu igualdad')}>{seq.length ? seq.map((i, k) => <span key={k} className="chip chip-placed"><Rich lang={lang} text={step.tokens[i]!} /></span>) : <span className="text-sm text-muted-foreground">{say(lang, 'Touche les étiquettes dans l’ordre.', 'Tap the labels in order.', 'المس البطاقات بالترتيب.', 'Toca las etiquetas en orden.')}</span>}</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2" dir="ltr">{step.tokens.map((tok, i) => <button key={i} type="button" className="chip" disabled={solved || used.has(i)} onClick={() => setSeq([...seq, i])}><Rich lang={lang} text={tok} /></button>)}</div>
        {!solved && <div className="mt-4 flex gap-2"><Button variant="ghost" disabled={!seq.length} onClick={() => setSeq(seq.slice(0, -1))}><Delete />{say(lang, 'Effacer', 'Undo', 'مسح', 'Borrar')}</Button><Button className="flex-1" disabled={!seq.length} onClick={() => onAnswer(chipsOk(seq.map(i => step.tokens[i]!), step.groups, step.ordered))}>{checkLabel(lang)}<ArrowRight /></Button></div>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'number': {
      const check = () => { if (text.trim()) onAnswer(numberOk(text, step.answer, step.tolerance)); };
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
        {!solved && <Button className="mt-4 w-full" disabled={blanks.filter(v => v !== undefined).length < count} onClick={() => onAnswer(sentenceOk(step.parts, blanks))}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'grid': {
      const at = cursor ?? step.start;
      return <>
        <GeoScene lang={lang} scene={step.scene} locked={solved} cursor={{ label: step.label, at, onMove: setCursor }} />
        <p className="mt-1 text-center text-xs text-muted-foreground" dir="ltr">{step.label} ({minusSign(fmt(at.x))} ; {minusSign(fmt(at.y))}) · {say(lang, 'touche le quadrillage ou utilise les flèches', 'tap the grid or use the arrow keys', 'المس الشبكة أو استعمل الأسهم', 'toca la cuadrícula o usa las flechas')}</p>
        {!solved && <Button className="mt-4 w-full" onClick={() => onAnswer(at.x === step.answer.x && at.y === step.answer.y)}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'widget':
      return <>
        {step.widget.kind === 'fraction-bars' && <FractionBars lang={lang} left={step.widget.left} right={step.widget.right} locked={solved} onComplete={onAnswer} />}
        {step.widget.kind === 'fraction-equivalence' && <FractionEquivalenceLab lang={lang} source={step.widget.source} factor={step.widget.factor} locked={solved} onComplete={onAnswer} onInteraction={event => onFractionInteraction?.(event, step.widget)} />}
        {step.widget.kind === 'fraction-addition' && <FractionAdditionLab lang={lang} left={step.widget.left} right={step.widget.right} locked={solved} onComplete={onAnswer} onInteraction={event => onFractionInteraction?.(event, step.widget)} />}
        {step.widget.kind === 'fraction-numberline' && <FractionNumberLineLab lang={lang} target={step.widget.target} locked={solved} onComplete={onAnswer} onInteraction={onFractionInteraction} />}
        {step.widget.kind === 'line' && <LineWidget lang={lang} target={step.widget} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'tangent' && <TangentWidget lang={lang} target={step.widget} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'level' && <LevelWidget lang={lang} values={step.widget.values} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'squares' && <SquaresWidget lang={lang} ab={step.widget.ab} ac={step.widget.ac} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'thales' && <ThalesWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'inscribed' && <InscribedWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetOk} />}
        {!solved && !['fraction-bars', 'fraction-equivalence', 'fraction-addition', 'fraction-numberline'].includes(step.widget.kind) && <Button className="mt-4 w-full" onClick={() => onAnswer(widgetOk)}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
  }
}

function Shown({ lang, scene, table }: { lang: Lang; scene?: Scene | undefined; table?: Table | undefined }) {
  return <>
    {table && <div className="data-table-wrap" dir="ltr"><table className="data-table"><tbody>{table.head.map((h, i) => <tr key={i}><th scope="row">{h[lang]}</th>{(table.rows[i] ?? []).map((c, j) => <td key={j}><Rich lang={lang} text={localizeMath(c, lang)} /></td>)}</tr>)}</tbody></table></div>}
    {scene && <GeoScene lang={lang} scene={scene} />}
  </>;
}

/** Régler a et b : la droite y = ax + b doit passer par A et B. */
export function LineWidget({ lang, target, locked, onState }: { lang: Lang; target: { a: number; b: number; A: P; B: P }; locked: boolean; onState: (ok: boolean) => void }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const grid = { minX: -5, maxX: 5, minY: -5, maxY: 5, axes: true };
  const [P1, P2] = clipLine(a, b, grid);
  const scene: Scene = { grid, points: { A: target.A, B: target.B, P: P1, Q: P2 }, hidden: ['P', 'Q'], segments: [{ id: 'd', a: 'P', b: 'Q', style: 'bold' }] };
  const update = (na: number, nb: number) => { setA(na); setB(nb); onState(na === target.a && nb === target.b); };
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
export function TangentWidget({ lang, target, locked, onState }: { lang: Lang; target: { a: number; b: number; c: number; target: number }; locked: boolean; onState: (ok: boolean) => void }) {
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
    <input id="tangent-x" type="range" min={grid.minX + 1} max={grid.maxX - 1} step={0.5} value={x0} disabled={locked} className="w-full accent-[var(--primary)]" onChange={e => { const x = Number(e.target.value); setX0(x); onState(x === target.target); }} />
    <p className="mt-2 text-center font-display text-lg" dir="ltr">{say(lang, 'pente de la tangente', 'tangent slope', 'ميل المماس', 'pendiente de la tangente')} : {fmt(slope)}</p>
  </div>;
}

/** Colonnes de cubes à égaliser : la hauteur commune est la moyenne. */
export function LevelWidget({ lang, values, locked, onState }: { lang: Lang; values: number[]; locked: boolean; onState: (ok: boolean) => void }) {
  const [cols, setCols] = useState(values);
  const [hand, setHand] = useState(0);
  const max = Math.max(...values) + 1;
  const move = (i: number, d: 1 | -1) => {
    const next = cols.map((c, k) => k === i ? c + d : c);
    const h = hand - d;
    setCols(next); setHand(h); onState(h === 0 && next.every(c => c === next[0]));
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

function ThalesWidget({ lang, problem, locked, onState }: { lang: Lang; problem: ThalesProblem; locked: boolean; onState: (ok: boolean) => void }) {
  const [m, setM] = useState(1);
  return <ThalesFigure lang={lang} problem={problem} m={m} locked={locked} revealMn={locked} onM={v => { setM(v); onState(v === problem.am); }} />;
}

function InscribedWidget({ lang, problem, locked, onState }: { lang: Lang; problem: InscribedProblem; locked: boolean; onState: (ok: boolean) => void }) {
  const [theta, setTheta] = useState(90);
  const [seen, setSeen] = useState<[number, number]>([90, 90]);
  const [lo, hi] = inscribedRange(problem.central);
  return <InscribedFigure lang={lang} problem={problem} theta={theta} locked={locked} onTheta={deg => {
    const d = Math.max(lo, Math.min(hi, deg));
    const next: [number, number] = [Math.min(seen[0], d), Math.max(seen[1], d)];
    setTheta(d); setSeen(next); onState(next[1] - next[0] >= INSCRIBED_SPAN);
  }} />;
}

/**
 * Les trois carrés de Pythagore, avec un angle en A réglable. On « verse » les carreaux des deux petits carrés
 * dans le grand : il déborde si l'angle est aigu, il reste de la place s'il est obtus, il est plein à 90° exactement.
 */
export function SquaresWidget({ lang, ab, ac, locked, onState }: { lang: Lang; ab: number; ac: number; locked: boolean; onState: (ok: boolean) => void }) {
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
  const update = (a: number, p: boolean) => { setAngle(a); setPoured(p); onState(p && a === 90); };
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
  const xs = pts.map(p => p.x).concat(scene.circle ? [-r, r] : [], g ? [g.minX, g.maxX] : []), ys = pts.map(p => p.y).concat(scene.circle ? [-r, r] : [], g ? [g.minY, g.maxY] : []);
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
      {scene.curves?.map((c, i) => <polyline key={`c${i}`} points={c.map(p => { const q = v(p); return `${q.x},${q.y}`; }).join(' ')} className="skill-curve" />)}
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

