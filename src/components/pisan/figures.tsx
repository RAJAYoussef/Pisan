import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { expectedValues, figureProblem, GRID, length, placementOk, pointN, valueOk, type FigureKind, type PythagorasProblem, type ThalesProblem } from '@/lib/figures';
import { localizeMath } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import { Speaker, Tutor } from './shared';

type Props = { lang: Lang; kind: FigureKind; onSave: (a: Attempt) => Promise<void>; onBack: () => void };
type Pt = { x: number; y: number };

const STEPS = (lang: Lang) => [say(lang, 'Manipuler', 'Move', 'أحرّك', 'Mover'), say(lang, 'Observer', 'Observe', 'ألاحظ', 'Observar'), say(lang, 'Calculer', 'Calculate', 'أحسب', 'Calcular')];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Activité « figure à manipuler » : déplacer les points, observer, puis calculer. */
export function FigureActivity({ lang, kind, onSave, onBack }: Props) {
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const problem = useMemo(() => figureProblem(kind, seed), [kind, seed]);
  const [step, setStep] = useState(0);
  const [b, setB] = useState(2);
  const [c, setC] = useState(2);
  const [m, setM] = useState(1);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [first, second] = expectedValues(problem);

  const restart = () => { setSeed(s => (s * 7919 + 13) % 100000); setStep(0); setB(2); setC(2); setM(1); setInput(''); setError(''); setDone(false); };
  const title = kind === 'pythagoras' ? say(lang, 'Le théorème de Pythagore', 'Pythagoras’ theorem', 'مبرهنة فيثاغورس', 'El teorema de Pitágoras') : say(lang, 'Le théorème de Thalès', 'The intercept theorem', 'مبرهنة طاليس', 'El teorema de Tales');
  const statement = instruction(problem, step, lang);

  async function check() {
    setError('');
    if (step === 0) {
      if (placementOk(problem, problem.kind === 'pythagoras' ? b : m, c)) { setStep(1); return; }
      setError(say(lang, 'Pas encore : compte les carreaux depuis A.', 'Not yet: count the squares from A.', 'ليس بعد: عُدّ المربعات انطلاقًا من A.', 'Todavía no: cuenta los cuadros desde A.'));
      return;
    }
    const expected = step === 1 ? first : second;
    if (!valueOk(input, expected)) { setError(hint(problem, step, lang)); return; }
    setInput('');
    if (step === 1) { setStep(2); return; }
    setBusy(true);
    try { await onSave({ kind: 'workshop', notion: 'pythagoras-thales', correct: 1, total: 1, date: new Date().toISOString(), minutes: 5 }); setDone(true); setStep(3); }
    catch { setError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto max-w-4xl">
    <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Figure à manipuler', 'Hands-on figure', 'شكل للتحريك', 'Figura para manipular')}</span><h1>{title}</h1></div>
    <ol className="cpa-steps">{STEPS(lang).map((label, i) => <li key={i} className={`cpa-step ${Math.min(step, 2) === i ? 'cpa-step-active' : ''}`} aria-current={Math.min(step, 2) === i ? 'step' : undefined}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">{i + 1}</span><span>{label}</span></li>)}</ol>
    <div className="activity-panel">
      <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug">{localizeMath(statement, lang)}</p><Speaker text={localizeMath(statement, lang)} lang={lang} /></div>
      {problem.kind === 'pythagoras'
        ? <PythagorasFigure lang={lang} problem={problem} b={b} c={c} onB={setB} onC={setC} locked={step > 0} showSquares={step > 0} revealHyp={done} />
        : <ThalesFigure lang={lang} problem={problem} m={m} onM={setM} locked={step > 0} revealMn={done} />}
      {done
        ? <div className="mt-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><p className="my-4 text-xl font-bold">{say(lang, 'Bravo, figure réussie !', 'Well done, figure solved!', 'أحسنت، أنجزت الشكل!', '¡Bravo, figura resuelta!')}</p><p className="mb-5 text-sm text-muted-foreground" dir="ltr">{localizeMath(summary(problem), lang)}</p><Button onClick={restart}><RefreshCw />{say(lang, 'Nouvelle figure', 'New figure', 'شكل جديد', 'Nueva figura')}</Button></div>
        : <>
          {step > 0 && <div className="mt-5"><label htmlFor="figure-answer" className="field-label">{say(lang, 'Ta réponse', 'Your answer', 'جوابك', 'Tu respuesta')}</label><input id="figure-answer" dir="ltr" className="form-input text-center font-display text-2xl" value={input} autoComplete="off" onChange={e => { setInput(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') void check(); }} /></div>}
          <Button className="mt-5 w-full" disabled={busy || (step > 0 && !input.trim())} onClick={() => void check()}>{say(lang, 'Vérifier', 'Check', 'تحقق', 'Comprobar')}<ArrowRight /></Button>
        </>}
      {error && <div className="mt-4"><Tutor>{error}</Tutor></div>}
    </div>
  </section>;
}

function instruction(p: PythagorasProblem | ThalesProblem, step: number, lang: Lang): string {
  if (p.kind === 'pythagoras') {
    if (step === 0) return say(lang, `Déplace B et C pour que AB = ${p.ab} et AC = ${p.ac}. Le triangle est rectangle en A.`, `Move B and C so that AB = ${p.ab} and AC = ${p.ac}. The right angle is at A.`, `حرّك B و C بحيث AB = ${p.ab} و AC = ${p.ac}. المثلث قائم الزاوية في A.`, `Mueve B y C para que AB = ${p.ab} y AC = ${p.ac}. El ángulo recto está en A.`);
    if (step === 1) return say(lang, `Regarde les carrés : ${p.ab * p.ab} + ${p.ac * p.ac}. Quelle est l’aire du grand carré, BC² ?`, `Look at the squares: ${p.ab * p.ab} + ${p.ac * p.ac}. What is the area of the big square, BC²?`, `لاحظ المربعات: ${p.ab * p.ab} + ${p.ac * p.ac}. ما مساحة المربع الكبير BC²؟`, `Mira los cuadrados: ${p.ab * p.ab} + ${p.ac * p.ac}. ¿Cuál es el área del cuadrado grande, BC²?`);
    return say(lang, `BC² = ${p.bc * p.bc}. Combien mesure BC ?`, `BC² = ${p.bc * p.bc}. How long is BC?`, `BC² = ${p.bc * p.bc}. كم يساوي BC؟`, `BC² = ${p.bc * p.bc}. ¿Cuánto mide BC?`);
  }
  if (step === 0) return say(lang, `AB = ${p.ab} et BC = ${p.bc}. Fais glisser M pour que AM = ${p.am}.`, `AB = ${p.ab} and BC = ${p.bc}. Slide M so that AM = ${p.am}.`, `AB = ${p.ab} و BC = ${p.bc}. حرّك M بحيث AM = ${p.am}.`, `AB = ${p.ab} y BC = ${p.bc}. Desliza M para que AM = ${p.am}.`);
  if (step === 1) return say(lang, 'Les rapports AM/AB et AN/AC sont égaux. Combien vaut MN/BC ?', 'The ratios AM/AB and AN/AC are equal. What is MN/BC?', 'النسبتان AM/AB و AN/AC متساويتان. كم تساوي MN/BC؟', 'Las razones AM/AB y AN/AC son iguales. ¿Cuánto vale MN/BC?');
  return say(lang, `MN/BC = ${p.ratio[0]}/${p.ratio[1]} et BC = ${p.bc}. Calcule MN.`, `MN/BC = ${p.ratio[0]}/${p.ratio[1]} and BC = ${p.bc}. Work out MN.`, `MN/BC = ${p.ratio[0]}/${p.ratio[1]} و BC = ${p.bc}. احسب MN.`, `MN/BC = ${p.ratio[0]}/${p.ratio[1]} y BC = ${p.bc}. Calcula MN.`);
}

function hint(p: PythagorasProblem | ThalesProblem, step: number, lang: Lang): string {
  if (p.kind === 'pythagoras') return step === 1
    ? say(lang, `Le grand carré a la même aire que les deux petits ensemble : ${p.ab * p.ab} + ${p.ac * p.ac}.`, `The big square has the same area as the two small ones together: ${p.ab * p.ab} + ${p.ac * p.ac}.`, `للمربع الكبير نفس مساحة المربعين الصغيرين معًا: ${p.ab * p.ab} + ${p.ac * p.ac}.`, `El cuadrado grande tiene la misma área que los dos pequeños juntos: ${p.ab * p.ab} + ${p.ac * p.ac}.`)
    : say(lang, `Cherche le nombre qui, multiplié par lui-même, donne ${p.bc * p.bc}.`, `Find the number that, multiplied by itself, gives ${p.bc * p.bc}.`, `ابحث عن العدد الذي إذا ضُرب في نفسه أعطى ${p.bc * p.bc}.`, `Busca el número que, multiplicado por sí mismo, da ${p.bc * p.bc}.`);
  return step === 1
    ? say(lang, `MN/BC est égal aux deux autres rapports : AM/AB = ${p.am}/${p.ab}.`, `MN/BC equals the two other ratios: AM/AB = ${p.am}/${p.ab}.`, `MN/BC تساوي النسبتين الأخريين: AM/AB = ${p.am}/${p.ab}.`, `MN/BC es igual a las otras dos razones: AM/AB = ${p.am}/${p.ab}.`)
    : say(lang, `MN = BC × ${p.ratio[0]}/${p.ratio[1]}.`, `MN = BC × ${p.ratio[0]}/${p.ratio[1]}.`, `MN = BC × ${p.ratio[0]}/${p.ratio[1]}.`, `MN = BC × ${p.ratio[0]}/${p.ratio[1]}.`);
}

function summary(p: PythagorasProblem | ThalesProblem): string {
  return p.kind === 'pythagoras'
    ? `${p.ab}² + ${p.ac}² = ${p.ab * p.ab} + ${p.ac * p.ac} = ${p.bc * p.bc} = ${p.bc}²   →   BC = ${p.bc}`
    : `AM/AB = AN/AC = MN/BC = ${p.am}/${p.ab}   →   MN = ${p.bc} × ${p.ratio[0]}/${p.ratio[1]} = ${p.mn}`;
}

// ───────────── Dessin ─────────────

const U = 30; // taille d'un carreau dans le dessin (unités SVG)

/** Convertit un pointeur en coordonnées du quadrillage (repère mathématique, y vers le haut). */
function useGridPointer(view: { minX: number; maxY: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const toGrid = (e: PointerEvent): Pt | null => {
    const svg = ref.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: Math.round(pt.x / U + view.minX), y: Math.round(view.maxY - pt.y / U) };
  };
  return { ref, toGrid };
}

function Handle({ at, label, value, min, max, onChange, toSvg, locked }: { at: Pt; label: string; value: number; min: number; max: number; onChange: (v: number) => void; toSvg: (p: Pt) => Pt; locked: boolean }) {
  const p = toSvg(at);
  const onKey = (e: KeyboardEvent) => {
    if (locked) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { onChange(clamp(value + 1, min, max)); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { onChange(clamp(value - 1, min, max)); e.preventDefault(); }
  };
  return <g role="slider" tabIndex={locked ? -1 : 0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} onKeyDown={onKey} className={locked ? '' : 'figure-handle'}>
    {!locked && <circle cx={p.x} cy={p.y} r={U * 0.75} className="figure-handle-halo" />}
    <circle cx={p.x} cy={p.y} r={U * 0.28} className="figure-point" />
  </g>;
}

function Grid({ minX, minY, maxX, maxY }: { minX: number; minY: number; maxX: number; maxY: number }) {
  const lines = [];
  for (let x = Math.max(0, minX); x <= Math.min(GRID, maxX); x++) lines.push(<line key={`v${x}`} x1={(x - minX) * U} x2={(x - minX) * U} y1={(maxY - Math.min(GRID, maxY)) * U} y2={(maxY - Math.max(0, minY)) * U} className="figure-grid" />);
  for (let y = Math.max(0, minY); y <= Math.min(GRID, maxY); y++) lines.push(<line key={`h${y}`} y1={(maxY - y) * U} y2={(maxY - y) * U} x1={(Math.max(0, minX) - minX) * U} x2={(Math.min(GRID, maxX) - minX) * U} className="figure-grid" />);
  return <g aria-hidden>{lines}</g>;
}

function PythagorasFigure({ lang, problem, b, c, onB, onC, locked, showSquares, revealHyp }: { lang: Lang; problem: PythagorasProblem; b: number; c: number; onB: (v: number) => void; onC: (v: number) => void; locked: boolean; showSquares: boolean; revealHyp: boolean }) {
  // Pendant la manipulation, on zoome sur le quadrillage ; ensuite, on dézoome pour voir les trois carrés.
  const view = showSquares ? { minX: -c - 1, minY: -b - 1, maxX: b + c + 1, maxY: c + b + 1 } : { minX: -1, minY: -1, maxX: GRID + 1, maxY: GRID + 1 };
  const { ref, toGrid } = useGridPointer(view);
  const [drag, setDrag] = useState<'B' | 'C' | null>(null);
  const toSvg = (p: Pt): Pt => ({ x: (p.x - view.minX) * U, y: (view.maxY - p.y) * U });
  const poly = (pts: Pt[]) => pts.map(p => { const s = toSvg(p); return `${s.x},${s.y}`; }).join(' ');
  const A = { x: 0, y: 0 }, B = { x: b, y: 0 }, C = { x: 0, y: c };
  const move = (e: PointerEvent) => { if (!drag || locked) return; const g = toGrid(e); if (!g) return; if (drag === 'B') onB(clamp(g.x, 1, GRID)); else onC(clamp(g.y, 1, GRID)); };
  const mid = (p: Pt, q: Pt) => toSvg({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  return <div>
    <svg ref={ref} viewBox={`0 0 ${(view.maxX - view.minX) * U} ${(view.maxY - view.minY) * U}`} className={`figure-svg ${showSquares ? 'figure-zoomed' : ''}`} direction="ltr" role="img" aria-label={say(lang, `Triangle rectangle en A, AB = ${b}, AC = ${c}`, `Right triangle at A, AB = ${b}, AC = ${c}`, `مثلث قائم في A، AB = ${b} و AC = ${c}`, `Triángulo rectángulo en A, AB = ${b}, AC = ${c}`)}
      onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
      <Grid {...view} />
      {showSquares && <>
        <polygon points={poly([A, B, { x: b, y: -b }, { x: 0, y: -b }])} className="figure-square figure-square-1" />
        <polygon points={poly([A, C, { x: -c, y: c }, { x: -c, y: 0 }])} className="figure-square figure-square-2" />
        <polygon points={poly([B, C, { x: c, y: c + b }, { x: b + c, y: b }])} className="figure-square figure-square-3" />
        <text {...mid(A, { x: b, y: -b })} className="figure-area">{b * b}</text>
        <text {...mid(A, { x: -c, y: c })} className="figure-area">{c * c}</text>
        <text {...mid(B, { x: c, y: c + b })} className="figure-area">{revealHyp ? b * b + c * c : '?'}</text>
      </>}
      <polygon points={poly([A, B, C])} className="figure-triangle" />
      <polyline points={poly([{ x: 0.6, y: 0 }, { x: 0.6, y: 0.6 }, { x: 0, y: 0.6 }])} className="figure-right-angle" />
      <text x={toSvg(A).x - 14} y={toSvg(A).y + 22} className="figure-label">A</text>
      <text x={toSvg(B).x + 8} y={toSvg(B).y + 22} className="figure-label">B</text>
      <text x={toSvg(C).x - 22} y={toSvg(C).y - 6} className="figure-label">C</text>
      <g onPointerDown={e => { if (!locked) { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag('B'); } }}><Handle at={B} label="B" value={b} min={1} max={GRID} onChange={onB} toSvg={toSvg} locked={locked} /></g>
      <g onPointerDown={e => { if (!locked) { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag('C'); } }}><Handle at={C} label="C" value={c} min={1} max={GRID} onChange={onC} toSvg={toSvg} locked={locked} /></g>
    </svg>
    <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm" dir="ltr">
      <span className="pill">AB = {b}</span><span className="pill">AC = {c}</span><span className="pill">BC = {revealHyp ? length(b, c) : '?'}</span>
      {showSquares && <><span className="pill">AB² = {b * b}</span><span className="pill">AC² = {c * c}</span><span className="pill">BC² = {revealHyp ? b * b + c * c : '?'}</span></>}
    </div>
    {!locked && <p className="mt-2 text-center text-xs text-muted-foreground">{say(lang, 'Fais glisser les points ronds, ou utilise les flèches du clavier.', 'Drag the round points, or use the arrow keys.', 'اسحب النقط الدائرية أو استعمل أسهم لوحة المفاتيح.', 'Arrastra los puntos redondos o usa las flechas del teclado.')}</p>}
  </div>;
}

function ThalesFigure({ lang, problem, m, onM, locked, revealMn }: { lang: Lang; problem: ThalesProblem; m: number; onM: (v: number) => void; locked: boolean; revealMn: boolean }) {
  const view = { minX: -1, minY: -1, maxX: Math.max(problem.ab, problem.bc) + 1, maxY: problem.bc + 1 };
  const { ref, toGrid } = useGridPointer(view);
  const [drag, setDrag] = useState(false);
  const toSvg = (p: Pt): Pt => ({ x: (p.x - view.minX) * U, y: (view.maxY - p.y) * U });
  const A = { x: 0, y: 0 }, B = { x: problem.ab, y: 0 }, C = { x: problem.ab, y: problem.bc };
  const M = { x: m, y: 0 }, N = pointN(problem, m);
  const poly = (pts: Pt[]) => pts.map(p => { const s = toSvg(p); return `${s.x},${s.y}`; }).join(' ');
  const move = (e: PointerEvent) => { if (!drag || locked) return; const g = toGrid(e); if (g) onM(clamp(g.x, 1, problem.ab - 1)); };
  const k = `${m}/${problem.ab}`;
  return <div>
    <svg ref={ref} viewBox={`0 0 ${(view.maxX - view.minX) * U} ${(view.maxY - view.minY) * U}`} className="figure-svg" direction="ltr" role="img" aria-label={say(lang, `Triangle ABC, M sur [AB] avec AM = ${m}, (MN) parallèle à (BC)`, `Triangle ABC, M on [AB] with AM = ${m}, (MN) parallel to (BC)`, `مثلث ABC، M على [AB] حيث AM = ${m}، (MN) يوازي (BC)`, `Triángulo ABC, M en [AB] con AM = ${m}, (MN) paralela a (BC)`)}
      onPointerMove={move} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}>
      <Grid {...view} />
      <polygon points={poly([A, B, C])} className="figure-triangle" />
      <polygon points={poly([A, M, N])} className="figure-square figure-square-1" />
      <line x1={toSvg(M).x} y1={toSvg(M).y} x2={toSvg(N).x} y2={toSvg(N).y} className="figure-parallel" />
      <line x1={toSvg(B).x} y1={toSvg(B).y} x2={toSvg(C).x} y2={toSvg(C).y} className="figure-parallel figure-parallel-base" />
      <text x={toSvg(A).x - 16} y={toSvg(A).y + 20} className="figure-label">A</text>
      <text x={toSvg(B).x + 8} y={toSvg(B).y + 20} className="figure-label">B</text>
      <text x={toSvg(C).x + 8} y={toSvg(C).y} className="figure-label">C</text>
      <text x={toSvg(M).x - 6} y={toSvg(M).y + 26} className="figure-label">M</text>
      <text x={toSvg(N).x - 22} y={toSvg(N).y - 6} className="figure-label">N</text>
      <g onPointerDown={e => { if (!locked) { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(true); } }}><Handle at={M} label="M" value={m} min={1} max={problem.ab - 1} onChange={onM} toSvg={toSvg} locked={locked} /></g>
    </svg>
    <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm" dir="ltr">
      <span className="pill">AM = {m}</span><span className="pill">AM/AB = {k}</span><span className="pill">AN/AC = {k}</span><span className="pill">MN/BC = {revealMn ? k : '?'}</span><span className="pill">MN = {revealMn ? problem.mn : '?'}</span>
    </div>
    {!locked && <p className="mt-2 text-center text-xs text-muted-foreground">{say(lang, 'Fais glisser M : N suit pour que (MN) reste parallèle à (BC).', 'Slide M: N follows so that (MN) stays parallel to (BC).', 'حرّك M: تتبعه N ليبقى (MN) موازيًا لـ (BC).', 'Desliza M: N lo sigue para que (MN) siga paralela a (BC).')}</p>}
  </div>;
}
