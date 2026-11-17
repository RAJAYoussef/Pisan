// Parcours de compétences : déroule les étapes d'une activité (src/lib/skills.ts) et dessine les figures.
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, Check, CheckCircle2, Delete, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSCRIBED_SPAN, type FigureKind, type InscribedProblem, type ThalesProblem } from '@/lib/figures';
import { localizeMath, type L } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import { chipsOk, fmt, numberOk, sentenceOk, skillNotion, skillsFor, skillStatus, type Blank, type SkillStatus, type P, type Scene, type Skill, type Step } from '@/lib/skills';
import { InscribedFigure, ThalesFigure, inscribedRange } from './figures';
import { Speaker, Tutor } from './shared';

type Props = { lang: Lang; skill: Skill; onSave: (a: Attempt) => Promise<void>; onBack: () => void };

/** Une compétence : les étapes s'enchaînent ; une étape ratée au premier essai ne compte pas comme réussie. */
export function SkillActivity({ lang, skill, onSave, onBack }: Props) {
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
        ? <div className="text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><p className="my-4 text-xl font-bold">{done.correct === done.total ? say(lang, 'Compétence acquise !', 'Skill mastered!', 'تم اكتساب الكفاية!', '¡Competencia adquirida!') : say(lang, `${done.correct} étapes sur ${done.total} du premier coup. Recommence pour l’acquérir.`, `${done.correct} of ${done.total} steps at the first try. Go again to master it.`, `${done.correct} من ${done.total} مراحل من المحاولة الأولى. أعد للاكتساب.`, `${done.correct} de ${done.total} pasos al primer intento. Repite para adquirirla.`)}</p><p className="mb-5 text-sm text-muted-foreground" dir="ltr">{localizeMath(activity.summary, lang)}</p><Button onClick={restart}><RefreshCw />{say(lang, 'Nouvel énoncé', 'New exercise', 'تمرين جديد', 'Nuevo enunciado')}</Button></div>
        : <>
          <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug">{show(step.prompt)}</p><Speaker text={show(step.prompt)} lang={lang} /></div>
          <StepView key={`${seed}-${index}`} lang={lang} step={step} solved={solved} onAnswer={answer} />
          {solved && <Button className="mt-5 w-full" disabled={busy} onClick={() => void next()}>{index + 1 < total ? say(lang, 'Étape suivante', 'Next step', 'المرحلة التالية', 'Paso siguiente') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {hint && !solved && <div className="mt-4"><Tutor>{hint}</Tutor></div>}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
        </>}
    </div>
  </section>;
}

const checkLabel = (lang: Lang) => say(lang, 'Vérifier', 'Check', 'تحقق', 'Comprobar');
const Solved = ({ lang }: { lang: Lang }) => <p role="status" className="mt-4 flex items-center justify-center gap-2 font-bold text-primary-deep"><Check className="h-5 w-5" />{say(lang, 'C’est juste !', 'That’s right!', 'صحيح!', '¡Correcto!')}</p>;

function StepView({ lang, step, solved, onAnswer }: { lang: Lang; step: Step; solved: boolean; onAnswer: (ok: boolean) => void }) {
  const show = (l: L) => localizeMath(l[lang], lang);
  const [picked, setPicked] = useState<number | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [text, setText] = useState('');
  const [blanks, setBlanks] = useState<number[]>([]);
  const [widgetOk, setWidgetOk] = useState(false);

  switch (step.type) {
    case 'choice':
      return <>
        {step.scene && <GeoScene lang={lang} scene={step.scene} />}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{step.options.map((o, i) => <Button key={i} variant={picked === i ? (i === step.answer ? 'default' : 'destructive') : 'soft'} className="h-auto min-h-11 whitespace-normal" disabled={solved} aria-pressed={picked === i} onClick={() => { setPicked(i); onAnswer(i === step.answer); }}>{show(o)}</Button>)}</div>
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
        {step.scene && <GeoScene lang={lang} scene={step.scene} />}
        <div className="chip-line" dir="ltr" aria-live="polite" aria-label={say(lang, 'Ton égalité', 'Your equality', 'متساويتك', 'Tu igualdad')}>{seq.length ? seq.map((i, k) => <span key={k} className="chip chip-placed">{step.tokens[i]}</span>) : <span className="text-sm text-muted-foreground">{say(lang, 'Touche les étiquettes dans l’ordre.', 'Tap the labels in order.', 'المس البطاقات بالترتيب.', 'Toca las etiquetas en orden.')}</span>}</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2" dir="ltr">{step.tokens.map((tok, i) => <button key={i} type="button" className="chip" disabled={solved || used.has(i)} onClick={() => setSeq([...seq, i])}>{tok}</button>)}</div>
        {!solved && <div className="mt-4 flex gap-2"><Button variant="ghost" disabled={!seq.length} onClick={() => setSeq(seq.slice(0, -1))}><Delete />{say(lang, 'Effacer', 'Undo', 'مسح', 'Borrar')}</Button><Button className="flex-1" disabled={!seq.length} onClick={() => onAnswer(chipsOk(seq.map(i => step.tokens[i]!), step.groups))}>{checkLabel(lang)}<ArrowRight /></Button></div>}
        {solved && <Solved lang={lang} />}
      </>;
    }
    case 'number': {
      const check = () => { if (text.trim()) onAnswer(numberOk(text, step.answer, step.tolerance)); };
      return <>
        {step.scene && <GeoScene lang={lang} scene={step.scene} />}
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
        {step.scene && <GeoScene lang={lang} scene={step.scene} />}
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
    case 'widget':
      return <>
        {step.widget.kind === 'squares' && <SquaresWidget lang={lang} ab={step.widget.ab} ac={step.widget.ac} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'thales' && <ThalesWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetOk} />}
        {step.widget.kind === 'inscribed' && <InscribedWidget lang={lang} problem={step.widget.problem} locked={solved} onState={setWidgetOk} />}
        {!solved && <Button className="mt-4 w-full" onClick={() => onAnswer(widgetOk)}>{checkLabel(lang)}<ArrowRight /></Button>}
        {solved && <Solved lang={lang} />}
      </>;
  }
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
export function GeoScene({ lang, scene, tapped, answer, locked, onTap }: { lang: Lang; scene: Scene; tapped?: string | null; answer?: string; locked?: boolean; onTap?: (id: string) => void }) {
  const [square, setSquare] = useState<string | null>(null);
  const names = Object.keys(scene.points);
  const pts = Object.values(scene.points);
  const r = scene.circle?.r ?? 0;
  const xs = pts.map(p => p.x).concat(scene.circle ? [-r, r] : []), ys = pts.map(p => p.y).concat(scene.circle ? [-r, r] : []);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = 260 / Math.max(maxX - minX, maxY - minY, 1), pad = 40;
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
  return <div>
    <svg viewBox={`0 0 ${width} ${height}`} className="figure-svg skill-scene" direction="ltr" role="group" aria-label={say(lang, 'Figure', 'Figure', 'الشكل', 'Figura')}>
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
          {tap && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="skill-hit" />}
          {seg.text && <text x={m.x} y={m.y + 5} textAnchor="middle" className="skill-length">{localizeMath(seg.text, lang)}</text>}
        </g>;
      })}
      {scene.rightAngles?.map(([a, vtx, b], i) => { const o = P_(vtx), u = unit(o, P_(a)), w = unit(o, P_(b)), k = 12; return <polyline key={`r${i}`} points={`${o.x + u.x * k},${o.y + u.y * k} ${o.x + (u.x + w.x) * k},${o.y + (u.y + w.y) * k} ${o.x + w.x * k},${o.y + w.y * k}`} className="figure-right-angle" />; })}
      {scene.angleMarks?.map(([a, vtx, b], i) => {
        const o = P_(vtx), u = unit(o, P_(a)), w = unit(o, P_(b)), k = 22;
        const sweep = u.x * w.y - u.y * w.x > 0 ? 1 : 0;
        return <path key={`m${i}`} d={`M ${o.x + u.x * k} ${o.y + u.y * k} A ${k} ${k} 0 0 ${sweep} ${o.x + w.x * k} ${o.y + w.y * k}`} className="figure-angle-arc" />;
      })}
      {equerre}
      {names.filter(n => !scene.hidden?.includes(n)).map(n => { const q = P_(n); const l = n === scene.circle?.c ? { x: q.x + 8, y: q.y - 8 } : away(q, 16); return <g key={n}><circle cx={q.x} cy={q.y} r={3} className="figure-point" /><text x={l.x - 5} y={l.y + 5} className="figure-label">{n}</text></g>; })}
      {scene.equerre && scene.polygon && !locked && scene.polygon.map(n => { const q = P_(n); return <circle key={`e${n}`} cx={q.x} cy={q.y} r={18} role="button" tabIndex={0} aria-pressed={square === n} aria-label={say(lang, `Poser l’équerre en ${n}`, `Put the set square at ${n}`, `ضع الكوس في ${n}`, `Poner la escuadra en ${n}`)} className={`skill-vertex${square === n ? ' skill-vertex-on' : ''}`} onClick={() => setSquare(square === n ? null : n)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSquare(square === n ? null : n); } }} />; })}
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
};
const STATUS: Record<SkillStatus, (lang: Lang) => string> = {
  mastered: lang => say(lang, 'Acquis', 'Mastered', 'مكتسبة', 'Adquirida'),
  started: lang => say(lang, 'Commencé', 'Started', 'بدأت', 'Empezada'),
  todo: lang => say(lang, 'À faire', 'To do', 'للإنجاز', 'Por hacer'),
};

/** Les compétences d'un chapitre avec leur état ; `onOpen` absent : simple liste à cocher (parcours). */
export function SkillList({ lang, kind, attempts, onOpen, disabled }: { lang: Lang; kind: FigureKind; attempts: Attempt[]; onOpen?: (skill: Skill) => void; disabled?: boolean }) {
  return <ol className="skill-list">{skillsFor(kind).map(skill => {
    const status = skillStatus(attempts, skill.id);
    return <li key={skill.id} className="skill-item">
      <span className={`skill-status skill-status-${status}`} aria-hidden>{status === 'mastered' ? <Check className="h-4 w-4" /> : status === 'started' ? <span className="h-2 w-2 rounded-full bg-current" /> : null}</span>
      <span className="min-w-0 flex-1"><span className="block font-semibold">{skill.title[lang]}</span>{onOpen && <span className="block text-xs text-muted-foreground">{skill.desc[lang]}</span>}<span className="sr-only"> · {STATUS[status](lang)}</span></span>
      {onOpen ? <Button size="sm" variant={status === 'mastered' ? 'ghost' : 'soft'} disabled={disabled} onClick={() => onOpen(skill)} aria-label={`${skill.title[lang]} · ${STATUS[status](lang)}`}>{status === 'mastered' ? say(lang, 'Revoir', 'Review', 'مراجعة', 'Repasar') : say(lang, 'Commencer', 'Start', 'ابدأ', 'Empezar')}<ArrowRight /></Button>
        : <span className={`text-xs font-bold skill-status-text-${status}`}>{STATUS[status](lang)}</span>}
    </li>;
  })}</ol>;
}

export const masteredCount = (kind: FigureKind, attempts: Attempt[]) => skillsFor(kind).filter(s => skillStatus(attempts, s.id) === 'mastered').length;
