// Figures manipulables réutilisées par les parcours de compétences (src/components/pisan/skills.tsx) :
// Thalès (M glisse, (MN) reste parallèle à (BC)) et angles inscrits (M tourne sur le cercle).
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { GRID, INSCRIBED_SPAN, inscribedAngle, pointN, type InscribedProblem, type ThalesProblem } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

type Pt = { x: number; y: number };
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
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

export function ThalesFigure({ lang, problem, m, onM, locked, revealMn }: { lang: Lang; problem: ThalesProblem; m: number; onM: (v: number) => void; locked: boolean; revealMn: boolean }) {
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

const R = 4.5; // rayon du cercle, en carreaux
/** Points A et B placés symétriquement en bas du cercle pour que l'angle au centre AOB vaille `central`. */
function circlePoints(central: number) {
  const half = (central / 2) * (Math.PI / 180);
  const at = (deg: number) => ({ x: R * Math.cos((deg * Math.PI) / 180), y: R * Math.sin((deg * Math.PI) / 180) });
  return { A: { x: -R * Math.sin(half), y: -R * Math.cos(half) }, B: { x: R * Math.sin(half), y: -R * Math.cos(half) }, at };
}
/** M reste sur le grand arc (hors de l'arc AB) : angles permis, en degrés depuis l'axe horizontal. */
// B est à −90° + AOB/2 et A à 270° − AOB/2 : le grand arc va de B à A en tournant dans le sens direct.
export function inscribedRange(central: number): [number, number] {
  return [Math.round(-90 + central / 2 + 8), Math.round(270 - central / 2 - 8)];
}

export function InscribedFigure({ lang, problem, theta, onTheta, locked }: { lang: Lang; problem: InscribedProblem; theta: number; onTheta: (deg: number) => void; locked: boolean }) {
  const view = { minX: -R - 1.5, minY: -R - 1.5, maxX: R + 1.5, maxY: R + 1.5 };
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);
  const toSvg = (p: Pt): Pt => ({ x: (p.x - view.minX) * U, y: (view.maxY - p.y) * U });
  const { A, B, at } = circlePoints(problem.central);
  const [lo, hi] = inscribedRange(problem.central);
  const M = at(theta);
  const O = { x: 0, y: 0 };
  const move = (e: PointerEvent) => {
    if (!drag || locked || !ref.current) return;
    const ctm = ref.current.getScreenCTM(); if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const x = pt.x / U + view.minX, y = view.maxY - pt.y / U;
    let deg = (Math.atan2(y, x) * 180) / Math.PI;
    if (deg < lo) deg += 360; // atan2 renvoie (−180° ; 180°] : on ramène l'angle dans l'intervalle du grand arc
    onTheta(clamp(Math.round(deg / 5) * 5, lo, hi));
  };
  const onKey = (e: KeyboardEvent) => {
    if (locked) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { onTheta(clamp(theta + 5, lo, hi)); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { onTheta(clamp(theta - 5, lo, hi)); e.preventDefault(); }
  };
  const p = (q: Pt) => toSvg(q);
  return <div>
    <svg ref={ref} viewBox={`0 0 ${(view.maxX - view.minX) * U} ${(view.maxY - view.minY) * U}`} className="figure-svg" direction="ltr" role="img" aria-label={say(lang, `Cercle de centre O, angle au centre AOB = ${problem.central}°, angle inscrit AMB = ${inscribedAngle(problem.central)}°`, `Circle with centre O, central angle AOB = ${problem.central}°, inscribed angle AMB = ${inscribedAngle(problem.central)}°`, `دائرة مركزها O، الزاوية المركزية AOB = ${problem.central}°، الزاوية المحيطية AMB = ${inscribedAngle(problem.central)}°`, `Circunferencia de centro O, ángulo central AOB = ${problem.central}°, ángulo inscrito AMB = ${inscribedAngle(problem.central)}°`)}
      onPointerMove={move} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}>
      <circle cx={p(O).x} cy={p(O).y} r={R * U} className="figure-circle" />
      <polygon points={[A, O, B].map(q => `${p(q).x},${p(q).y}`).join(' ')} className="figure-square figure-square-1" />
      <polyline points={[A, M, B].map(q => `${p(q).x},${p(q).y}`).join(' ')} className="figure-inscribed" />
      <circle cx={p(O).x} cy={p(O).y} r={U * 0.15} className="figure-point" />
      {[['A', A, 0, 26], ['B', B, 0, 26], ['O', O, 10, -10], ['M', M, 12, -12]].map(([name, q, dx, dy]) => <text key={name as string} x={p(q as Pt).x + (dx as number) - 6} y={p(q as Pt).y + (dy as number)} className="figure-label">{name as string}</text>)}
      <g role="slider" tabIndex={locked ? -1 : 0} aria-label="M" aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={theta} onKeyDown={onKey} className={locked ? '' : 'figure-handle'} onPointerDown={e => { if (!locked) { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(true); } }}>
        {!locked && <circle cx={p(M).x} cy={p(M).y} r={U * 0.75} className="figure-handle-halo" />}
        <circle cx={p(M).x} cy={p(M).y} r={U * 0.28} className="figure-point" />
      </g>
    </svg>
    <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm" dir="ltr">
      <span className="pill">AOB = {problem.central}°</span><span className="pill figure-pill-opposite">AMB = {inscribedAngle(problem.central)}°</span>
    </div>
    {!locked && <p className="mt-2 text-center text-xs text-muted-foreground">{say(lang, `Fais tourner M sur le cercle (au moins ${INSCRIBED_SPAN}°) et regarde AMB.`, `Move M round the circle (at least ${INSCRIBED_SPAN}°) and watch AMB.`, `حرّك M على الدائرة (${INSCRIBED_SPAN}° على الأقل) ولاحظ AMB.`, `Mueve M por la circunferencia (al menos ${INSCRIBED_SPAN}°) y mira AMB.`)}</p>}
  </div>;
}
