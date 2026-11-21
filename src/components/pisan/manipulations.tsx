// « Je manipule » : le temps concret du modèle de Singapour, avant la carte de cours et les exercices.
// Rien n'est noté ici : l'élève explore, et le bouton « J'ai compris » s'active quand il a fait la découverte.
import { useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import type { L } from '@/lib/curriculum';
import { say } from '@/lib/pisan';
import { arrangements, CUBE, eulerStep, riemannExact, riemannF, riemannSum, bisectG, bisectStep, limitF, limitXs, binomialP, refSlope, secantFn, secantSlope, anglesWithCos, applyBalance, balanceOps, balanceSolved, clean, diceWays, rootCount, digitsByRank, fiveNumbers, inInterval, isPrime, PLACE_RANKS, rectanglePairs, refValue, angleKind, closes, median, runMachine, signRegions, simulate, tileAreas, type BalanceOp, type Manip, type RefFn, type Side } from '@/lib/skill-intros';

type Done = (found: string) => void;

export function Manipulation({ manip, lang, onDone }: { manip: Manip; lang: Lang; onDone: Done }) {
  if (manip.kind === 'rectangles') return <Rectangles n={manip.n} lang={lang} onDone={onDone} />;
  if (manip.kind === 'factor-tree') return <FactorTree n={manip.n} lang={lang} onDone={onDone} />;
  if (manip.kind === 'balance') return <Balance left={manip.left} right={manip.right} lang={lang} onDone={onDone} />;
  if (manip.kind === 'hops') return <Hops {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'zero-pairs') return <ZeroPairs a={manip.a} b={manip.b} lang={lang} onDone={onDone} />;
  if (manip.kind === 'share') return <Share n={manip.n} by={manip.by} lang={lang} onDone={onDone} />;
  if (manip.kind === 'place-value') return <PlaceValue start={manip.start} target={manip.target} lang={lang} onDone={onDone} />;
  if (manip.kind === 'repeat') return <Repeat base={manip.base} exponent={manip.exponent} lang={lang} onDone={onDone} />;
  if (manip.kind === 'pattern') return <Pattern factors={manip.factors} divide={manip.divide ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'square') return <SquareTiles area={manip.area} lang={lang} onDone={onDone} />;
  if (manip.kind === 'machine') return <Machine {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'tiles') return <Tiles rows={manip.rows} cols={manip.cols} lang={lang} onDone={onDone} />;
  if (manip.kind === 'square-build') return <SquareBuild b={manip.b} c={manip.c} lang={lang} onDone={onDone} />;
  if (manip.kind === 'collect') return <Collect terms={manip.terms} lang={lang} onDone={onDone} />;
  if (manip.kind === 'test-values') return <TestValues {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'guess') return <Guess {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'sequence') return <Sequence {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'angle-builder') return <AngleBuilder target={manip.target} pair={manip.pair ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'triangle-angles') return <TriangleAngles lang={lang} onDone={onDone} />;
  if (manip.kind === 'resize-rect') return <ResizeRect w={manip.w} h={manip.h} lang={lang} onDone={onDone} />;
  if (manip.kind === 'area-transform') return <AreaTransform shape={manip.shape} b={manip.b} h={manip.h} lang={lang} onDone={onDone} />;
  if (manip.kind === 'unroll') return <Unroll d={manip.d} lang={lang} onDone={onDone} />;
  if (manip.kind === 'cubes') return <Cubes l={manip.l} w={manip.w} h={manip.h} lang={lang} onDone={onDone} />;
  if (manip.kind === 'sticks') return <Sticks a={manip.a} b={manip.b} lang={lang} onDone={onDone} />;
  if (manip.kind === 'thales-slide') return <ThalesSlide ab={manip.ab} ac={manip.ac} bc={manip.bc} free={manip.free ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'enlarge') return <Enlarge w={manip.w} h={manip.h} solid={manip.solid ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'trig-ratio') return <TrigRatio angle={manip.angle} mode={manip.mode} lang={lang} onDone={onDone} />;
  if (manip.kind === 'pour') return <Pour times={manip.times} lang={lang} onDone={onDone} />;
  if (manip.kind === 'frac-color') return <FracColor n={manip.n} d={manip.d} lang={lang} onDone={onDone} />;
  if (manip.kind === 'frac-merge') return <FracMerge n={manip.n} d={manip.d} k={manip.k} lang={lang} onDone={onDone} />;
  if (manip.kind === 'frac-of') return <FracOf n={manip.n} d={manip.d} total={manip.total} unit={manip.unit} lang={lang} onDone={onDone} />;
  if (manip.kind === 'frac-area') return <FracArea a={manip.a} b={manip.b} c={manip.c} d={manip.d} lang={lang} onDone={onDone} />;
  if (manip.kind === 'ratio-graph') return <RatioGraph unit={manip.unit} label={manip.label} lang={lang} onDone={onDone} />;
  if (manip.kind === 'percent-bar') return <PercentBar total={manip.total} pct={manip.pct} lang={lang} onDone={onDone} />;
  if (manip.kind === 'line-up') return <LineUp values={manip.values} lang={lang} onDone={onDone} />;
  if (manip.kind === 'tally') return <Tally categories={manip.categories} answers={manip.answers} lang={lang} onDone={onDone} />;
  if (manip.kind === 'sim') return <Sim outcomes={manip.outcomes} event={manip.event} seed={manip.seed} lang={lang} onDone={onDone} />;
  if (manip.kind === 'interval') return <IntervalWalk {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'curve-explore') return <CurveExplore fns={manip.fns} target={manip.target} lang={lang} onDone={onDone} />;
  if (manip.kind === 'sign-explore') return <SignExplore factors={manip.factors} quotient={manip.quotient ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'line-build') return <LineBuild m={manip.m} p={manip.p} parallel={manip.parallel ?? false} lang={lang} onDone={onDone} />;
  if (manip.kind === 'quartiles') return <Quartiles values={manip.values} lang={lang} onDone={onDone} />;
  if (manip.kind === 'dice-grid') return <DiceGrid sum={manip.sum} lang={lang} onDone={onDone} />;
  if (manip.kind === 'venn') return <Venn {...manip} lang={lang} onDone={onDone} />;
  if (manip.kind === 'unit-circle') return <UnitCircle target={manip.target} step={manip.step} quadrants={manip.quadrants ?? false} cosLevel={manip.cosLevel} lang={lang} onDone={onDone} />;
  if (manip.kind === 'parabola') return <Parabola b={manip.b} c={manip.c} lang={lang} onDone={onDone} />;
  if (manip.kind === 'log-ruler') return <LogRuler base={manip.base} steps={manip.steps} lang={lang} onDone={onDone} />;
  if (manip.kind === 'riemann') return <Riemann fn={manip.fn} b={manip.b} lang={lang} onDone={onDone} />;
  if (manip.kind === 'cube-coords') return <CubeCoords targets={manip.targets} lang={lang} onDone={onDone} />;
  if (manip.kind === 'arrange') return <Arrange letters={manip.letters} length={manip.length} lang={lang} onDone={onDone} />;
  if (manip.kind === 'handshake') return <Handshake n={manip.n} lang={lang} onDone={onDone} />;
  if (manip.kind === 'complex-plane') return <ComplexPlane mode={manip.mode} a={manip.a} b={manip.b} lang={lang} onDone={onDone} />;
  if (manip.kind === 'euler') return <Euler a={manip.a} y0={manip.y0} h={manip.h} steps={manip.steps} lang={lang} onDone={onDone} />;
  if (manip.kind === 'limit-table') return <LimitTable a={manip.a} b={manip.b} c={manip.c} toward={manip.toward} lang={lang} onDone={onDone} />;
  if (manip.kind === 'bisection') return <Bisection steps={manip.steps} lang={lang} onDone={onDone} />;
  if (manip.kind === 'secant') return <Secant a={manip.a} lang={lang} onDone={onDone} />;
  if (manip.kind === 'tree') return <Tree pa={manip.pa} pba={manip.pba} pbna={manip.pbna} lang={lang} onDone={onDone} />;
  if (manip.kind === 'galton') return <Galton n={manip.n} p={manip.p} lang={lang} onDone={onDone} />;
  if (manip.kind === 'dot-rotate') return <DotRotate u={manip.u} v={manip.v} lang={lang} onDone={onDone} />;
  return <Bars parts={manip.parts} extra={manip.extra} total={manip.total} unit={manip.unit} rectangle={manip.rectangle ?? false} lang={lang} onDone={onDone} />;
}

/** Nombre écrit à la française, avec le vrai signe moins. */
const num = (v: number) => (v < 0 ? '−' : '') + String(clean(Math.abs(v))).replace('.', ',');

// ───────────── Jetons en rectangles ─────────────

function Rectangles({ n, lang, onDone }: { n: number; lang: Lang; onDone: Done }) {
  const pairs = rectanglePairs(n);
  const [rows, setRows] = useState(1);
  const [found, setFound] = useState<string[]>([`1 × ${n}`]);
  const [tried, setTried] = useState<number[]>([1]);
  const [finished, setFinished] = useState(false);
  const cols = Math.floor(n / rows), rest = n - rows * cols;
  const full = rest === 0;
  // Fini quand tous les rectangles sont trouvés et que chaque nombre de lignes utile (jusqu'à √n) a été essayé :
  // pour un nombre premier, c'est l'échec des essais qui fait la découverte.
  const useful = Array.from({ length: Math.floor(Math.sqrt(n)) }, (_, i) => i + 1);
  function go(next: number) {
    const r = Math.min(n, Math.max(1, next));
    setRows(r);
    let all = found;
    if (n % r === 0) {
      const a = Math.min(r, n / r), b = Math.max(r, n / r), key = `${a} × ${b}`;
      if (!found.includes(key)) { all = [...found, key]; setFound(all); }
    }
    const seen = tried.includes(r) ? tried : [...tried, r];
    setTried(seen);
    const covered = useful.every(k => seen.includes(k) || seen.includes(n / k));
    if (!finished && all.length === pairs.length && covered) { setFinished(true); onDone(isPrime(n) ? 'prime' : 'all'); }
  }
  const divisors = pairs.flatMap(([a, b]) => (a === b ? [a] : [a, b])).sort((x, y) => x - y);
  return <div className="manip">
    <div className="manip-controls" role="group" aria-label={say(lang, 'Nombre de lignes', 'Number of rows', 'عدد الصفوف', 'Número de filas')}>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Une ligne de moins', 'One row fewer', 'صف أقل', 'Una fila menos')} disabled={rows <= 1} onClick={() => go(rows - 1)}><Minus /></Button>
      <span className="manip-count" aria-live="polite">{say(lang, `${rows} ligne${rows > 1 ? 's' : ''}`, `${rows} row${rows > 1 ? 's' : ''}`, `${rows} صف`, `${rows} fila${rows > 1 ? 's' : ''}`)}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Une ligne de plus', 'One row more', 'صف إضافي', 'Una fila más')} disabled={rows >= n} onClick={() => go(rows + 1)}><Plus /></Button>
    </div>
    <div className="token-field" aria-hidden>
      {Array.from({ length: rows }, (_, r) => <div key={r} className="token-row">{Array.from({ length: cols }, (_, c) => <span key={c} className={`token ${full ? 'token-ok' : ''}`} />)}</div>)}
      {rest > 0 && <div className="token-row">{Array.from({ length: rest }, (_, c) => <span key={c} className="token token-left" />)}</div>}
    </div>
    <p className={`manip-feedback ${full ? 'manip-good' : 'manip-bad'}`} role="status">{full
      ? say(lang, `Rectangle ${rows} × ${cols} = ${n} ✓`, `Rectangle ${rows} × ${cols} = ${n} ✓`, `مستطيل ${rows} × ${cols} = ${n} ✓`, `Rectángulo ${rows} × ${cols} = ${n} ✓`)
      : say(lang, `Il reste ${rest} jeton${rest > 1 ? 's' : ''} : pas de rectangle avec ${rows} lignes.`, `${rest} counter${rest > 1 ? 's' : ''} left over: no rectangle with ${rows} rows.`, `يتبقى ${rest}: لا مستطيل بـ ${rows} صفوف.`, `Sobran ${rest}: no hay rectángulo con ${rows} filas.`)}</p>
    <div className="manip-found"><span className="text-xs font-bold text-muted-foreground">{say(lang, 'Rectangles trouvés', 'Rectangles found', 'المستطيلات', 'Rectángulos')} {found.length}/{pairs.length}</span>{found.map(f => <span key={f} className="pill">{f}</span>)}</div>
    {finished && <p className="manip-discovery" role="status">{isPrime(n)
      ? say(lang, `Une seule façon : une ligne de ${n}. ${n} n’a que deux diviseurs, 1 et ${n} : c’est un nombre premier.`, `Only one way: a single line of ${n}. ${n} has only two factors, 1 and ${n}: it is a prime number.`, `طريقة واحدة فقط: ${n} عدد أولي.`, `Una sola forma: ${n} es primo.`)
      : say(lang, `Tous trouvés ! Les diviseurs de ${n} sont ${divisors.join(', ')}.`, `All found! The factors of ${n} are ${divisors.join(', ')}.`, `وجدتها كلها! قواسم ${n}: ${divisors.join('، ')}.`, `¡Todos! Divisores de ${n}: ${divisors.join(', ')}.`)}</p>}
  </div>;
}

// ───────────── Arbre de facteurs ─────────────

type Node = { v: number; kids?: [Node, Node] };
const split = (node: Node, path: number[], p: number): Node => {
  if (!path.length) return { v: node.v, kids: [{ v: p }, { v: node.v / p }] };
  const [head, ...rest] = path;
  const kids = [...node.kids!] as [Node, Node];
  kids[head!] = split(kids[head!]!, rest, p);
  return { ...node, kids };
};
const leaves = (node: Node): number[] => (node.kids ? [...leaves(node.kids[0]), ...leaves(node.kids[1])] : [node.v]);

function FactorTree({ n, lang, onDone }: { n: number; lang: Lang; onDone: Done }) {
  const [tree, setTree] = useState<Node>({ v: n });
  const [active, setActive] = useState<number[] | null>(null);
  const finished = leaves(tree).every(isPrime);
  function choose(p: number) {
    if (!active) return;
    const next = split(tree, active, p);
    setTree(next); setActive(null);
    if (leaves(next).every(isPrime)) onDone('tree');
  }
  const activeValue = active ? active.reduce<Node>((node, i) => node.kids![i]!, tree).v : null;
  const render = (node: Node, path: number[]): ReactNode => <div className="tree-node">
    {node.kids || isPrime(node.v)
      ? <span className={`tree-value ${isPrime(node.v) ? 'tree-prime' : ''}`}>{node.v}</span>
      : <button type="button" className={`tree-value tree-open ${active?.join() === path.join() ? 'tree-active' : ''}`} onClick={() => setActive(path)} aria-label={say(lang, `Casser ${node.v}`, `Break ${node.v}`, `فكّك ${node.v}`, `Romper ${node.v}`)}>{node.v}</button>}
    {node.kids && <div className="tree-kids">{render(node.kids[0], [...path, 0])}{render(node.kids[1], [...path, 1])}</div>}
  </div>;
  return <div className="manip">
    <div className="tree">{render(tree, [])}</div>
    {activeValue !== null && <div className="manip-controls" role="group" aria-label={say(lang, 'Diviser par', 'Divide by', 'القسمة على', 'Dividir entre')}>
      <span className="text-sm font-semibold">{activeValue} = </span>
      {[2, 3, 5, 7].filter(p => activeValue % p === 0 && activeValue !== p).map(p => <Button key={p} variant="soft" onClick={() => choose(p)}>{p} × {activeValue / p}</Button>)}
    </div>}
    {!finished && activeValue === null && <p className="manip-feedback">{say(lang, 'Touche un nombre qui n’est pas premier pour le casser.', 'Tap a number that is not prime to break it.', 'المس عددًا غير أولي لتفكيكه.', 'Toca un número no primo para romperlo.')}</p>}
    {finished && <p className="manip-discovery" role="status">{n} = {leaves(tree).sort((a, b) => a - b).join(' × ')} {say(lang, ': il ne reste que des nombres premiers.', ': only primes are left.', ': لم يبق إلا أعداد أولية.', ': solo quedan primos.')}</p>}
  </div>;
}

// ───────────── Balance ─────────────

const sideText = (s: Side) => [s.x ? `${s.x === 1 ? '' : s.x}x` : '', s.u ? String(s.u) : ''].filter(Boolean).join(' + ') || '0';

function Pan({ side, lang, label }: { side: Side; lang: Lang; label: string }) {
  return <div className="pan" aria-label={`${label} : ${sideText(side)}`}>
    <div className="pan-items">
      {Array.from({ length: side.x }, (_, i) => <span key={`x${i}`} className="pan-box">x</span>)}
      {Array.from({ length: side.u }, (_, i) => <span key={`u${i}`} className="pan-unit" />)}
      {!side.x && !side.u && <span className="text-xs text-muted-foreground">{say(lang, 'vide', 'empty', 'فارغ', 'vacío')}</span>}
    </div>
    <div className="pan-plate" />
  </div>;
}

function Balance({ left: l0, right: r0, lang, onDone }: { left: Side; right: Side; lang: Lang; onDone: Done }) {
  const [[left, right], setSides] = useState<[Side, Side]>([l0, r0]);
  const [log, setLog] = useState<string[]>([]);
  const [tilt, setTilt] = useState(false);
  const solved = balanceSolved(left, right);
  const ops = solved === null ? balanceOps(left, right) : [];
  const label = (op: BalanceOp) => op.kind === 'unit' ? say(lang, 'Retirer 1 bille de chaque côté', 'Take 1 marble off each side', 'أزل كرة من كل جهة', 'Quita 1 canica de cada lado')
    : op.kind === 'box' ? say(lang, 'Retirer 1 boîte x de chaque côté', 'Take 1 box x off each side', 'أزل علبة x من كل جهة', 'Quita 1 caja x de cada lado')
    : say(lang, `Partager chaque plateau en ${op.by}`, `Share each pan into ${op.by}`, `اقسم كل كفة على ${op.by}`, `Reparte cada plato entre ${op.by}`);
  function apply(op: BalanceOp) {
    const [l, r] = applyBalance(op, left, right);
    setSides([l, r]);
    setLog(h => [...h, `${sideText(l)} = ${sideText(r)}`]);
    const x = balanceSolved(l, r);
    if (x !== null) onDone(String(x));
  }
  function cheat() { setTilt(true); window.setTimeout(() => setTilt(false), 1400); }
  return <div className="manip">
    <div className={`balance ${tilt ? 'balance-tilt' : ''}`}>
      <div className="balance-pans"><Pan side={left} lang={lang} label={say(lang, 'Plateau gauche', 'Left pan', 'الكفة اليسرى', 'Plato izquierdo')} /><Pan side={right} lang={lang} label={say(lang, 'Plateau droit', 'Right pan', 'الكفة اليمنى', 'Plato derecho')} /></div>
      <div className="balance-beam" />
      <div className="balance-foot" />
    </div>
    <p className="manip-equation" aria-live="polite">{sideText(left)} = {sideText(right)}</p>
    {tilt && <p className="manip-feedback manip-bad" role="alert">{say(lang, 'Déséquilibre ! On doit toujours faire la même chose des deux côtés.', 'Unbalanced! Always do the same thing to both sides.', 'اختل التوازن! يجب إجراء نفس العملية على الجهتين.', '¡Desequilibrio! Haz lo mismo en los dos lados.')}</p>}
    {solved === null ? <div className="manip-actions">
      {ops.map(op => <Button key={op.kind} variant="soft" className="h-auto min-h-10 whitespace-normal" onClick={() => apply(op)}>{label(op)}</Button>)}
      {left.u > 0 && <Button variant="ghost" className="h-auto min-h-10 whitespace-normal text-muted-foreground" onClick={cheat}>{say(lang, 'Retirer 1 bille à gauche seulement', 'Take 1 marble off the left only', 'أزل كرة من اليسار فقط', 'Quita 1 canica solo a la izquierda')}</Button>}
    </div> : <p className="manip-discovery" role="status">{say(lang, `Une boîte x pèse ${solved} billes : x = ${solved}.`, `One box x weighs ${solved} marbles: x = ${solved}.`, `علبة x تزن ${solved} كرات: x = ${solved}.`, `Una caja x pesa ${solved} canicas: x = ${solved}.`)}</p>}
    {log.length > 0 && <ol className="manip-log">{log.map((line, i) => <li key={i}>{line}</li>)}</ol>}
    {log.length > 0 && solved === null && <Button variant="ghost" size="sm" onClick={() => { setSides([l0, r0]); setLog([]); }}><RotateCcw />{say(lang, 'Recommencer', 'Start again', 'إعادة', 'Reiniciar')}</Button>}
  </div>;
}

// ───────────── Modèle en barres (méthode de Singapour) ─────────────

function Bars({ parts, extra, total, unit, rectangle, lang, onDone }: { parts: number; extra: number; total: number; unit: string; rectangle: boolean; lang: Lang; onDone: Done }) {
  const [stage, setStage] = useState<0 | 1 | 2>(extra ? 0 : 1);
  const rest = total - extra, each = clean(rest / parts);
  return <div className="manip">
    <div className="bar-model" aria-label={say(lang, 'Modèle en barres', 'Bar model', 'نموذج شريطي', 'Modelo de barras')}>
      <div className="bar-line">
        {Array.from({ length: parts }, (_, i) => <span key={i} className="bar-part">{stage === 2 ? `${num(each)} ${unit}` : 'x'}</span>)}
        {extra > 0 && <span className={`bar-extra ${stage >= 1 ? 'bar-gone' : ''}`} style={{ flexGrow: Math.max(0.6, (extra / total) * parts * 1.6) }}>{extra} {unit}</span>}
      </div>
      <div className="bar-brace"><span>{stage >= 1 ? `${num(rest)} ${unit}` : `${num(total)} ${unit}`}</span></div>
    </div>
    <p className="manip-equation">{stage === 0 ? `${Array(parts).fill('x').join(' + ')} + ${extra} = ${total}` : stage === 1 ? `${parts}x = ${num(rest)}` : `x = ${num(each)}`}</p>
    {stage === 0 && <Button variant="soft" className="h-auto min-h-10 whitespace-normal" onClick={() => setStage(1)}>{say(lang, `Enlever le morceau connu (${extra} ${unit})`, `Remove the known piece (${extra} ${unit})`, `أزل الجزء المعلوم (${extra} ${unit})`, `Quita la parte conocida (${extra} ${unit})`)}</Button>}
    {stage === 1 && <Button variant="soft" className="h-auto min-h-10 whitespace-normal" onClick={() => { setStage(2); onDone(String(each)); }}>{say(lang, `Partager ${num(rest)} ${unit} en ${parts} barres égales`, `Share ${num(rest)} ${unit} into ${parts} equal bars`, `اقسم ${num(rest)} على ${parts} أشرطة متساوية`, `Reparte ${rest} entre ${parts} barras iguales`)}</Button>}
    {stage === 2 && <p className="manip-discovery" role="status">{rectangle ? say(lang, `La largeur mesure ${each} ${unit}, la longueur ${each + extra} ${unit}. Vérification : 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `The width is ${each} ${unit}, the length ${each + extra} ${unit}. Check: 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `العرض ${each} والطول ${each + extra}.`, `El ancho mide ${each} ${unit} y el largo ${each + extra} ${unit}.`) : say(lang, `Une barre vaut ${num(each)}${unit ? ' ' + unit : ''} : x = ${num(each)}. Vérification : ${parts} × ${num(each)}${extra ? ` + ${extra}` : ''} = ${num(total)} ✓`, `One bar is ${each}${unit ? ' ' + unit : ''}: x = ${each}. Check: ${parts} × ${each} + ${extra} = ${total} ✓`, `الشريط يساوي ${each}: x = ${each}.`, `Una barra vale ${each}: x = ${each}.`)}</p>}
  </div>;
}

// ───────────── Sauts sur la droite graduée ─────────────

function Hops({ min, max, step, start, target, lang, onDone }: { min: number; max: number; step: number; start: number; target: number; lang: Lang; onDone: Done }) {
  const [at, setAt] = useState(start);
  const [arrived, setArrived] = useState(false);
  const ticks = Math.round((max - min) / step);
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  const labelEvery = ticks > 12 ? Math.round(ticks / 4) : ticks > 6 ? 2 : 1;
  function hop(dir: 1 | -1) {
    const next = clean(at + dir * step);
    if (next < min - 1e-9 || next > max + 1e-9) return;
    setAt(next);
    if (!arrived && Math.abs(next - target) < 1e-9) { setArrived(true); onDone(num(next)); }
  }
  const moved = Math.round((at - start) / step);
  return <div className="manip">
    <div className="hops-line" aria-hidden>
      <div className="hops-axis" />
      {Array.from({ length: ticks + 1 }, (_, i) => { const v = clean(min + i * step); return <span key={i} className={`hops-tick ${i % labelEvery === 0 ? 'hops-tick-big' : ''}`} style={{ left: pos(v) }}>{i % labelEvery === 0 && <span className="hops-label">{num(v)}</span>}</span>; })}
      <span className="hops-target" style={{ left: pos(target) }} />
      <span className="hops-marker" style={{ left: pos(at) }}>{num(at)}</span>
    </div>
    <div className="manip-controls">
      <Button variant="soft" onClick={() => hop(-1)} aria-label={say(lang, `Reculer de ${num(step)}`, `Back ${num(step)}`, `تراجع ${num(step)}`, `Retroceder ${num(step)}`)}><Minus />{num(step)}</Button>
      <span className="manip-count" aria-live="polite">{num(at)}</span>
      <Button variant="soft" onClick={() => hop(1)} aria-label={say(lang, `Avancer de ${num(step)}`, `Forward ${num(step)}`, `تقدّم ${num(step)}`, `Avanzar ${num(step)}`)}><Plus />{num(step)}</Button>
    </div>
    <p className="manip-feedback">{say(lang, `Cible : ${num(target)} · ${Math.abs(moved)} saut${Math.abs(moved) > 1 ? 's' : ''} ${moved >= 0 ? 'vers la droite' : 'vers la gauche'}`, `Target: ${num(target)} · ${Math.abs(moved)} hop${Math.abs(moved) > 1 ? 's' : ''} ${moved >= 0 ? 'right' : 'left'}`, `الهدف: ${num(target)}`, `Meta: ${num(target)}`)}</p>
    {arrived && <p className="manip-discovery" role="status">{target > start
      ? say(lang, `Arrivé ! En allant vers la droite, les nombres grandissent : ${num(start)} < ${num(target)}.`, `There! Going right, numbers grow: ${num(start)} < ${num(target)}.`, `وصلت! نحو اليمين تكبر الأعداد: ${num(start)} < ${num(target)}.`, `¡Llegaste! Hacia la derecha crecen: ${num(start)} < ${num(target)}.`)
      : say(lang, `Arrivé ! En allant vers la gauche, les nombres diminuent : ${num(target)} < ${num(start)}.`, `There! Going left, numbers shrink: ${num(target)} < ${num(start)}.`, `وصلت! نحو اليسار تصغر الأعداد: ${num(target)} < ${num(start)}.`, `¡Llegaste! Hacia la izquierda decrecen: ${num(target)} < ${num(start)}.`)}</p>}
  </div>;
}

// ───────────── Jetons + et − (paires nulles) ─────────────

function ZeroPairs({ a, b, lang, onDone }: { a: number; b: number; lang: Lang; onDone: Done }) {
  const [plus, setPlus] = useState(Math.max(a, 0) + Math.max(b, 0));
  const [minus, setMinus] = useState(Math.max(-a, 0) + Math.max(-b, 0));
  const [removed, setRemoved] = useState(0);
  const finished = plus === 0 || minus === 0;
  function pair() {
    if (finished) return;
    setPlus(plus - 1); setMinus(minus - 1); setRemoved(removed + 1);
    if (plus - 1 === 0 || minus - 1 === 0) onDone(num(a + b));
  }
  return <div className="manip">
    <p className="manip-equation">{num(a)} + ({num(b)})</p>
    <div className="chip-field" aria-label={say(lang, `${plus} jetons plus, ${minus} jetons moins`, `${plus} plus counters, ${minus} minus counters`, `${plus} موجبة و ${minus} سالبة`, `${plus} fichas +, ${minus} fichas −`)}>
      <div className="chip-row">{Array.from({ length: plus }, (_, i) => <span key={i} className="chip chip-plus">+</span>)}</div>
      <div className="chip-row">{Array.from({ length: minus }, (_, i) => <span key={i} className="chip chip-minus">−</span>)}</div>
    </div>
    {!finished ? <Button variant="soft" onClick={pair}>{say(lang, 'Associer un + et un − (ils font 0)', 'Pair a + with a − (they make 0)', 'اجمع + و − (يعطيان 0)', 'Junta un + y un − (dan 0)')}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `${removed} paire${removed > 1 ? 's' : ''} nulle${removed > 1 ? 's' : ''} enlevée${removed > 1 ? 's' : ''}. Il reste ${num(a + b)} : ${num(a)} + (${num(b)}) = ${num(a + b)}.`, `${removed} zero pair${removed > 1 ? 's' : ''} removed. ${num(a + b)} is left: ${num(a)} + (${num(b)}) = ${num(a + b)}.`, `بقي ${num(a + b)}.`, `Queda ${num(a + b)}.`)}</p>}
  </div>;
}

// ───────────── Paquets (division euclidienne) ─────────────

function Share({ n, by, lang, onDone }: { n: number; by: number; lang: Lang; onDone: Done }) {
  const [packs, setPacks] = useState(0);
  const left = n - packs * by;
  const finished = left < by;
  function pack() {
    if (finished) return;
    setPacks(packs + 1);
    if (left - by < by) onDone(`${packs + 1}`);
  }
  return <div className="manip">
    <div className="pack-field">
      {Array.from({ length: packs }, (_, i) => <span key={i} className="pack">{Array.from({ length: by }, (_, j) => <span key={j} className="token token-ok token-small" />)}</span>)}
    </div>
    <div className="token-row token-wrap" aria-label={say(lang, `${left} jetons restants`, `${left} counters left`, `${left} متبقية`, `${left} fichas`)}>{Array.from({ length: left }, (_, i) => <span key={i} className={`token token-small ${finished ? 'token-left' : ''}`} />)}</div>
    <p className="manip-feedback">{say(lang, `${packs} paquet${packs > 1 ? 's' : ''} de ${by} · ${left} jeton${left > 1 ? 's' : ''} hors paquet`, `${packs} pack${packs > 1 ? 's' : ''} of ${by} · ${left} left over`, `${packs} رزم من ${by} · ${left} متبقية`, `${packs} paquetes de ${by} · ${left} sueltas`)}</p>
    {!finished ? <Button variant="soft" onClick={pack}>{say(lang, `Faire un paquet de ${by}`, `Make a pack of ${by}`, `كوّن رزمة من ${by}`, `Hacer un paquete de ${by}`)}</Button>
      : <p className="manip-discovery" role="status">{n} = {by} × {packs} + {left} {say(lang, `: quotient ${packs}, reste ${left} (plus petit que ${by}).`, `: quotient ${packs}, remainder ${left} (less than ${by}).`, `: الخارج ${packs} والباقي ${left}.`, `: cociente ${packs}, resto ${left}.`)}</p>}
  </div>;
}

// ───────────── Tableau de numération ─────────────

const RANK_NAMES: Record<string, [string, string]> = { '1000': ['m', 'th'], '100': ['c', 'h'], '10': ['d', 't'], '1': ['u', 'u'], '0.1': ['1/10', '1/10'], '0.01': ['1/100', '1/100'], '0.001': ['1/1000', '1/1000'] };

function PlaceValue({ start, target, lang, onDone }: { start: number; target: number; lang: Lang; onDone: Done }) {
  const [value, setValue] = useState(start);
  const [moves, setMoves] = useState<string[]>([]);
  const [arrived, setArrived] = useState(false);
  const build = start === 0; // construire le nombre rang par rang, sinon le faire glisser avec × 10 et ÷ 10
  const digits = digitsByRank(value);
  const lead = digits.findIndex(d => d !== 0), last = digits.length - 1 - [...digits].reverse().findIndex(d => d !== 0);
  function set(next: number, move: string) {
    const v = clean(next);
    if (v < 0 || v >= 10000 || (v > 0 && v < 0.001)) return;
    setValue(v); setMoves(m => [...m, move]);
    if (!arrived && Math.abs(v - target) < 1e-9) { setArrived(true); onDone(num(v)); }
  }
  return <div className="manip">
    <table className="pv-table"><thead><tr>{PLACE_RANKS.map(r => <th key={r} className={r === 1 ? 'pv-units' : ''}>{RANK_NAMES[String(r)]![lang === 'en' ? 1 : 0]}</th>)}</tr></thead>
      <tbody><tr>{digits.map((d, i) => <td key={i} className={`${PLACE_RANKS[i] === 1 ? 'pv-units' : ''} ${(i >= Math.min(lead, 3) && i <= Math.max(last, 3)) ? 'pv-on' : ''}`}>
        {build ? <span className="pv-build"><button type="button" aria-label={say(lang, `Ajouter 1 au rang ${RANK_NAMES[String(PLACE_RANKS[i])]![0]}`, `Add 1 to the ${RANK_NAMES[String(PLACE_RANKS[i])]![1]} place`, 'إضافة 1', 'Sumar 1')} onClick={() => set(value + PLACE_RANKS[i]!, `+${num(PLACE_RANKS[i]!)}`)} disabled={d === 9}>+</button><span>{d}</span><button type="button" aria-label={say(lang, `Retirer 1 au rang ${RANK_NAMES[String(PLACE_RANKS[i])]![0]}`, `Remove 1 from the ${RANK_NAMES[String(PLACE_RANKS[i])]![1]} place`, 'إزالة 1', 'Quitar 1')} onClick={() => set(value - PLACE_RANKS[i]!, `−${num(PLACE_RANKS[i]!)}`)} disabled={d === 0}>−</button></span>
          : (i >= Math.min(lead, 3) && i <= Math.max(last, 3)) ? d : ''}
      </td>)}</tr></tbody></table>
    <p className="manip-equation" aria-live="polite">{num(value)}</p>
    {!build && !arrived && <div className="manip-controls">
      <Button variant="soft" onClick={() => set(value * 10, '× 10')}>× 10</Button>
      <Button variant="soft" onClick={() => set(value / 10, '÷ 10')}>÷ 10</Button>
    </div>}
    {!build && moves.length > 0 && <p className="manip-feedback">{num(start)} {moves.join(' ')} = {num(value)}</p>}
    {build && !arrived && <p className="manip-feedback">{say(lang, `Cible : ${num(target)}`, `Target: ${num(target)}`, `الهدف: ${num(target)}`, `Meta: ${num(target)}`)}</p>}
    {arrived && <p className="manip-discovery" role="status">{build
      ? say(lang, `Bravo : ${num(target)}. Le 0 garde la place du rang vide.`, `Well done: ${num(target)}. The 0 holds the empty place.`, `أحسنت: ${num(target)}. الصفر يحفظ المرتبة الفارغة.`, `¡Bien!: ${num(target)}. El 0 guarda el lugar vacío.`)
      : say(lang, `${moves.length} glissement${moves.length > 1 ? 's' : ''} : ${num(start)} ${target > start ? '×' : '÷'} ${10 ** moves.length} = ${num(target)}. Les chiffres changent de rang, la virgule ne bouge pas.`, `${moves.length} move${moves.length > 1 ? 's' : ''}: ${num(start)} ${target > start ? '×' : '÷'} ${10 ** moves.length} = ${num(target)}. Digits change place.`, `${moves.length} إزاحات: ${num(start)} ${target > start ? '×' : '÷'} ${10 ** moves.length} = ${num(target)}.`, `${moves.length} desplazamientos.`)}</p>}
  </div>;
}

// ───────────── Puissances : multiplier encore et encore ─────────────

function Repeat({ base, exponent, lang, onDone }: { base: number; exponent: number; lang: Lang; onDone: Done }) {
  const [n, setN] = useState(1);
  const value = base ** n;
  function more() { if (n >= exponent) return; setN(n + 1); if (n + 1 === exponent) onDone(String(base ** exponent)); }
  return <div className="manip">
    <div className="repeat-stack" aria-hidden>{Array.from({ length: n }, (_, i) => <span key={i} className="repeat-bar" style={{ width: `${Math.min(100, (base ** (i + 1) / base ** exponent) * 100)}%` }}>{base ** (i + 1)}</span>)}</div>
    <p className="manip-equation" aria-live="polite">{Array(n).fill(base).join(' × ')} = {base}{'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]} = {value}</p>
    {n < exponent ? <Button variant="soft" onClick={more}>× {base}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `${exponent} facteurs ${base} : on écrit ${base}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[exponent]}. L’exposant compte les facteurs.`, `${exponent} factors of ${base}: written ${base}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[exponent]}. The exponent counts the factors.`, `${exponent} عوامل ${base}: الأس يعد العوامل.`, `${exponent} factores ${base}: el exponente los cuenta.`)}</p>}
  </div>;
}

// ───────────── Suite logique : la règle des signes ─────────────

const SEQUENCE = [3, 2, 1, 0, -1, -2, -3];
const par = (v: number) => (v < 0 ? `(${num(v)})` : num(v));
/** Multiplication : a × k = a·k. Division : (k·a) ÷ a = k. Dans les deux cas, k descend de 3 à −3. */
function Pattern({ factors, divide, lang, onDone }: { factors: number[]; divide: boolean; lang: Lang; onDone: Done }) {
  const [which, setWhich] = useState(0);
  const [shown, setShown] = useState(4);
  const [wrong, setWrong] = useState(false);
  const a = factors[which]!;
  const finished = which === factors.length - 1 && shown === SEQUENCE.length;
  function pick(v: number) {
    const m = SEQUENCE[shown]!;
    if (v !== result(m)) { setWrong(true); return; }
    setWrong(false);
    if (shown + 1 < SEQUENCE.length) { setShown(shown + 1); return; }
    if (which + 1 < factors.length) { setWhich(which + 1); setShown(4); return; }
    setShown(SEQUENCE.length); onDone('rule');
  }
  const m = SEQUENCE[shown];
  const result = (k: number) => (divide ? k : a * k);
  const left = (k: number) => (divide ? `${par(k * a)} ÷ ${par(a)}` : `${par(a)} × ${par(k)}`);
  const options = m === undefined ? [] : [result(m), -result(m)].sort((x, y) => x - y);
  return <div className="manip">
    <table className="pattern-table"><tbody>{SEQUENCE.slice(0, shown).map(k => <tr key={k}><td>{left(k)}</td><td>=</td><td className={k < 0 ? 'pattern-new' : ''}>{num(result(k))}</td></tr>)}
      {m !== undefined && <tr className="pattern-ask"><td>{left(m)}</td><td>=</td><td>?</td></tr>}</tbody></table>
    {m !== undefined && <div className="manip-controls">{options.map(v => <Button key={v} variant="soft" onClick={() => pick(v)}>{num(v)}</Button>)}</div>}
    {wrong && <p className="manip-feedback manip-bad" role="alert">{say(lang, `Regarde la colonne de droite : à chaque ligne, elle change de ${num(divide ? -1 : -a)}.`, `Look at the right column: each row it changes by ${num(divide ? -1 : -a)}.`, `انظر العمود الأيمن: يتغير بـ ${num(divide ? -1 : -a)} في كل سطر.`, `Mira la columna derecha: cambia ${num(divide ? -1 : -a)} en cada fila.`)}</p>}
    {finished && <p className="manip-discovery" role="status">{divide ? say(lang, 'Signes différents → quotient négatif. Mêmes signes → quotient positif : la même règle que pour ×.', 'Different signs → negative quotient. Same signs → positive: the same rule as ×.', 'إشارتان مختلفتان ← سالب. متشابهتان ← موجب.', 'Signos distintos → negativo. Iguales → positivo.') : say(lang, 'Positif × négatif → négatif. Négatif × négatif → positif !', 'Positive × negative → negative. Negative × negative → positive!', 'موجب × سالب ← سالب. سالب × سالب ← موجب!', 'Positivo × negativo → negativo. ¡Negativo × negativo → positivo!')}</p>}
  </div>;
}

// ───────────── Carré de jetons (racines carrées) ─────────────

function SquareTiles({ area, lang, onDone }: { area: number; lang: Lang; onDone: Done }) {
  const root = Math.sqrt(area), lo = Math.floor(root), hi = Math.ceil(root);
  const [side, setSide] = useState(Math.max(1, lo - 3));
  const [seen, setSeen] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  function go(next: number) {
    const s = Math.max(1, Math.min(12, next));
    setSide(s);
    const all = seen.includes(s) ? seen : [...seen, s];
    setSeen(all);
    const done = Number.isInteger(root) ? s === root : all.includes(lo) && all.includes(hi);
    if (done && !finished) { setFinished(true); onDone(String(root)); }
  }
  const sq = side * side;
  return <div className="manip">
    <div className="manip-controls">
      <Button variant="soft" size="icon" aria-label={say(lang, 'Côté plus petit', 'Smaller side', 'ضلع أصغر', 'Lado menor')} onClick={() => go(side - 1)}><Minus /></Button>
      <span className="manip-count">{say(lang, `côté ${side}`, `side ${side}`, `الضلع ${side}`, `lado ${side}`)}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Côté plus grand', 'Larger side', 'ضلع أكبر', 'Lado mayor')} onClick={() => go(side + 1)}><Plus /></Button>
    </div>
    <div className="square-grid" style={{ gridTemplateColumns: `repeat(${side}, 1fr)`, width: `${Math.min(100, side * 9)}%` }} aria-hidden>{Array.from({ length: sq }, (_, i) => <span key={i} className={`square-cell ${sq === area ? 'square-ok' : sq > area ? 'square-over' : ''}`} />)}</div>
    <p className={`manip-feedback ${sq === area ? 'manip-good' : ''}`}>{side} × {side} = {sq} {sq === area ? '= ' + area + ' ✓' : sq < area ? `< ${area}` : `> ${area}`}</p>
    {finished && <p className="manip-discovery" role="status">{Number.isInteger(root)
      ? say(lang, `Un carré de côté ${root} : √${area} = ${root}.`, `A square of side ${root}: √${area} = ${root}.`, `مربع ضلعه ${root}: √${area} = ${root}.`, `Un cuadrado de lado ${root}: √${area} = ${root}.`)
      : say(lang, `${lo}² = ${lo * lo} < ${area} < ${hi * hi} = ${hi}² : impossible de faire un carré exact. √${area} est entre ${lo} et ${hi}.`, `${lo}² = ${lo * lo} < ${area} < ${hi * hi} = ${hi}²: no exact square. √${area} is between ${lo} and ${hi}.`, `√${area} بين ${lo} و ${hi}.`, `√${area} está entre ${lo} y ${hi}.`)}</p>}
  </div>;
}

// ───────────── Machine à calculer (expressions, image et antécédent) ─────────────

function Machine({ ops, target, min, max, lang, onDone }: { ops: { op: '×' | '+' | '−'; k: number }[]; target: number; min: number; max: number; lang: Lang; onDone: Done }) {
  const [x, setX] = useState(Math.round((min + max) / 2));
  const [found, setFound] = useState<number | null>(null);
  const out = runMachine(ops, x);
  function go(v: number) {
    const next = Math.max(min, Math.min(max, v));
    setX(next);
    if (found === null && runMachine(ops, next) === target) { setFound(next); onDone(String(next)); }
  }
  let acc = x;
  return <div className="manip">
    <div className="machine" aria-live="polite">
      <span className="machine-in">{num(x)}</span>
      {ops.map((o, i) => { acc = runMachine([o], acc); return <span key={i} className="machine-step"><span className="machine-op">{o.op} {o.k}</span><span className="machine-val">{num(acc)}</span></span>; })}
    </div>
    <div className="manip-controls">
      <Button variant="soft" size="icon" aria-label={say(lang, 'Entrée plus petite', 'Smaller input', 'مدخل أصغر', 'Entrada menor')} onClick={() => go(x - 1)}><Minus /></Button>
      <span className="manip-count">{say(lang, `entrée ${num(x)}`, `input ${num(x)}`, `المدخل ${num(x)}`, `entrada ${num(x)}`)}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Entrée plus grande', 'Larger input', 'مدخل أكبر', 'Entrada mayor')} onClick={() => go(x + 1)}><Plus /></Button>
    </div>
    <p className={`manip-feedback ${out === target ? 'manip-good' : ''}`}>{say(lang, `Sortie : ${num(out)} · cible ${num(target)}`, `Output: ${num(out)} · target ${num(target)}`, `المخرج: ${num(out)} · الهدف ${num(target)}`, `Salida: ${num(out)} · meta ${num(target)}`)}</p>
    {found !== null && <p className="manip-discovery" role="status">{say(lang, `Avec ${num(found)}, la machine donne ${num(target)}. Pour retrouver l’entrée sans tâtonner, on défait les étapes à l’envers : c’est résoudre une équation.`, `With ${num(found)} the machine gives ${num(target)}. To find the input without guessing, undo the steps backwards: that is solving an equation.`, `مع ${num(found)} تعطي الآلة ${num(target)}. للرجوع نعكس الخطوات: إنه حل معادلة.`, `Con ${num(found)} sale ${num(target)}. Deshacer los pasos es resolver una ecuación.`)}</p>}
  </div>;
}

// ───────────── Tuiles algébriques (aire d'un rectangle) ─────────────

function Tiles({ rows, cols, lang, onDone }: { rows: { x: number; u: number }; cols: { x: number; u: number }; lang: Lang; onDone: Done }) {
  // Les morceaux : (ligne x ou unités) × (colonne x ou unités).
  const pieces = [
    ...(rows.x ? [{ id: 'xx', r: 'x', c: 'x', area: 'x²', show: Boolean(cols.x) }, { id: 'xu', r: 'x', c: 'u', area: `${cols.u}x`, show: cols.u > 0 }] : []),
    ...(rows.u ? [{ id: 'ux', r: 'u', c: 'x', area: `${rows.u}x`, show: Boolean(cols.x) }, { id: 'uu', r: 'u', c: 'u', area: String(rows.u * cols.u), show: cols.u > 0 }] : []),
  ].filter(p => p.show);
  const [seen, setSeen] = useState<string[]>([]);
  const all = seen.length === pieces.length;
  const areas = tileAreas(rows, cols);
  const side = (s: { x: number; u: number }) => [s.x ? 'x' : '', s.u ? String(s.u) : ''].filter(Boolean).join(' + ');
  const total = [areas.x2 ? 'x²' : '', areas.x ? `${areas.x}x` : '', areas.u ? String(areas.u) : ''].filter(Boolean).join(' + ');
  function reveal(id: string) { if (seen.includes(id)) return; const next = [...seen, id]; setSeen(next); if (next.length === pieces.length) onDone(total); }
  const colSizes = [cols.x ? 'minmax(0, 3fr)' : '', cols.u ? `minmax(0, ${Math.max(1, cols.u * 0.55)}fr)` : ''].filter(Boolean).join(' ');
  const rowSizes = [rows.x ? '96px' : '', rows.u ? `${Math.max(34, rows.u * 18)}px` : ''].filter(Boolean).join(' ');
  return <div className="manip">
    <div className="tiles-wrap">
      <span className="tiles-top">{side(cols)}</span>
      <span className="tiles-left">{side(rows)}</span>
      <div className="tiles-grid" style={{ gridTemplateColumns: colSizes, gridTemplateRows: rowSizes }}>
        {pieces.map(p => <button key={p.id} type="button" className={`tile tile-${p.r}${p.c} ${seen.includes(p.id) ? 'tile-seen' : ''}`} onClick={() => reveal(p.id)} aria-label={say(lang, `Morceau ${p.r === 'x' ? 'x' : rows.u} par ${p.c === 'x' ? 'x' : cols.u}`, `Piece ${p.r === 'x' ? 'x' : rows.u} by ${p.c === 'x' ? 'x' : cols.u}`, 'قطعة', 'Pieza')}>{seen.includes(p.id) ? p.area : '?'}</button>)}
      </div>
    </div>
    <p className="manip-equation" aria-live="polite">{rows.x ? `(${side(rows)})` : side(rows)}({side(cols)}) = {pieces.map(p => (seen.includes(p.id) ? p.area : '…')).join(' + ')}</p>
    {all && <p className="manip-discovery" role="status">{say(lang, `L’aire totale : ${total}. Chaque morceau de la largeur multiplie chaque morceau de la longueur.`, `Total area: ${total}. Each part of the width multiplies each part of the length.`, `المساحة الكلية: ${total}.`, `Área total: ${total}.`)}</p>}
  </div>;
}

/** Ranger x² + bx + c en un carré (x + k)² : il faut 2k = b et k² = c. */
function SquareBuild({ b, c, lang, onDone }: { b: number; c: number; lang: Lang; onDone: Done }) {
  const [k, setK] = useState(1);
  const [found, setFound] = useState(false);
  const fits = 2 * k === b && k * k === c;
  function go(v: number) { const next = Math.max(1, Math.min(9, v)); setK(next); if (!found && 2 * next === b && next * next === c) { setFound(true); onDone(String(next)); } }
  return <div className="manip">
    <p className="manip-feedback">{say(lang, `Morceaux : un x², ${b} bandes x, ${c} petits carrés.`, `Pieces: one x², ${b} x-strips, ${c} unit squares.`, `القطع: x² و ${b} أشرطة x و ${c} مربعات صغيرة.`, `Piezas: un x², ${b} tiras x, ${c} cuadraditos.`)}</p>
    <div className="tiles-wrap"><div className="tiles-grid" style={{ gridTemplateColumns: `minmax(0, 3fr) minmax(0, ${Math.max(1, k * 0.55)}fr)`, gridTemplateRows: `96px ${Math.max(34, k * 18)}px` }}>
      <span className="tile tile-xx tile-seen">x²</span><span className={`tile tile-xu tile-seen ${2 * k > b ? 'tile-bad' : ''}`}>{k}x</span>
      <span className={`tile tile-ux tile-seen ${2 * k > b ? 'tile-bad' : ''}`}>{k}x</span><span className={`tile tile-uu tile-seen ${k * k !== c ? 'tile-bad' : ''}`}>{k * k}</span>
    </div></div>
    <div className="manip-controls">
      <Button variant="soft" size="icon" aria-label="k − 1" onClick={() => go(k - 1)}><Minus /></Button>
      <span className="manip-count">(x + {k})²</span>
      <Button variant="soft" size="icon" aria-label="k + 1" onClick={() => go(k + 1)}><Plus /></Button>
    </div>
    <p className={`manip-feedback ${fits ? 'manip-good' : 'manip-bad'}`}>{say(lang, `Il faut ${2 * k} bandes x (on en a ${b}) et ${k * k} petits carrés (on en a ${c}).`, `You need ${2 * k} x-strips (you have ${b}) and ${k * k} unit squares (you have ${c}).`, `نحتاج ${2 * k} أشرطة و ${k * k} مربعات.`, `Hacen falta ${2 * k} tiras y ${k * k} cuadraditos.`)}</p>
    {found && <p className="manip-discovery" role="status">x² + {b}x + {c} = (x + {k})² {say(lang, ': tout rentre, sans morceau en trop.', ': everything fits, nothing left over.', ': كل القطع تدخل.', ': todo encaja.')}</p>}
  </div>;
}

// ───────────── Regrouper les termes semblables ─────────────

function Collect({ terms, lang, onDone }: { terms: { c: number; x: boolean }[]; lang: Lang; onDone: Done }) {
  const [sorted, setSorted] = useState(false);
  const write = (list: { c: number; x: boolean }[]) => list.map((t, i) => `${i ? (t.c < 0 ? ' − ' : ' + ') : t.c < 0 ? '−' : ''}${Math.abs(t.c)}${t.x ? 'x' : ''}`).join('');
  const xs = terms.filter(t => t.x), us = terms.filter(t => !t.x);
  const sx = xs.reduce((a, t) => a + t.c, 0), su = us.reduce((a, t) => a + t.c, 0);
  const shown = sorted ? [...xs, ...us] : terms;
  return <div className="manip">
    <div className="collect-row">{shown.map((t, i) => <span key={i} className={`collect-tile ${t.x ? 'collect-x' : 'collect-u'} ${t.c < 0 ? 'collect-neg' : ''}`}>{t.c < 0 ? '−' : '+'}{Math.abs(t.c)}{t.x ? 'x' : ''}</span>)}</div>
    <p className="manip-equation">{write(terms)}</p>
    {!sorted ? <Button variant="soft" onClick={() => { setSorted(true); onDone(`${sx}x + ${su}`); }}>{say(lang, 'Ranger : les x ensemble, les nombres ensemble', 'Sort: x with x, numbers with numbers', 'رتّب: x مع x والأعداد مع الأعداد', 'Ordenar: x con x, números con números')}</Button>
      : <p className="manip-discovery" role="status">{write(xs)} = {num(sx)}x {say(lang, 'et', 'and', 'و', 'y')} {write(us)} = {num(su)} → {num(sx)}x{su < 0 ? ` − ${-su}` : ` + ${su}`}</p>}
  </div>;
}

// ───────────── Tester des valeurs (inéquations) ─────────────

function TestValues({ a, b, c, sign, min, max, lang, onDone }: { a: number; b: number; c: number; sign: '<' | '>'; min: number; max: number; lang: Lang; onDone: Done }) {
  const [x, setX] = useState(0);
  const [tested, setTested] = useState<number[]>([0]);
  const [finished, setFinished] = useState(false);
  const holds = (v: number) => (sign === '<' ? a * v + b < c : a * v + b > c);
  const expr = `${a === 1 ? '' : a === -1 ? '−' : num(a)}x${b ? (b < 0 ? ` − ${-b}` : ` + ${b}`) : ''}`;
  function test(v: number) {
    const next = Math.max(min, Math.min(max, v)); setX(next);
    const all = tested.includes(next) ? tested : [...tested, next];
    setTested(all);
    if (!finished && all.length >= 6 && all.some(holds) && all.some(t => !holds(t))) { setFinished(true); onDone('set'); }
  }
  const boundary = (c - b) / a;
  const ticks = max - min;
  const pos = (v: number) => `${((v - min) / ticks) * 100}%`;
  const answer = (a > 0) === (sign === '<') ? `x < ${num(boundary)}` : `x > ${num(boundary)}`;
  return <div className="manip">
    <div className="hops-line" aria-hidden>
      <div className="hops-axis" />
      {Array.from({ length: ticks + 1 }, (_, i) => <span key={i} className="hops-tick hops-tick-big" style={{ left: pos(min + i) }}><span className="hops-label">{num(min + i)}</span></span>)}
      {tested.map(v => <span key={v} className={`test-dot ${holds(v) ? 'test-yes' : 'test-no'}`} style={{ left: pos(v) }} />)}
      <span className="hops-marker" style={{ left: pos(x) }}>x = {num(x)}</span>
    </div>
    <div className="manip-controls">
      <Button variant="soft" size="icon" aria-label={say(lang, 'x plus petit', 'Smaller x', 'x أصغر', 'x menor')} onClick={() => test(x - 1)}><Minus /></Button>
      <span className="manip-count">{expr} = {num(a * x + b)}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'x plus grand', 'Larger x', 'x أكبر', 'x mayor')} onClick={() => test(x + 1)}><Plus /></Button>
    </div>
    <p className={`manip-feedback ${holds(x) ? 'manip-good' : 'manip-bad'}`}>{num(a * x + b)} {sign} {num(c)} ? {holds(x) ? say(lang, 'oui, x est solution', 'yes, x is a solution', 'نعم', 'sí') : say(lang, 'non', 'no', 'لا', 'no')}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, `Les solutions sont tous les nombres ${answer.startsWith('x <') ? 'à gauche' : 'à droite'} de ${num(boundary)} : ${answer}.${a < 0 ? ' Attention : le coefficient est négatif, le sens s’inverse !' : ''}`, `The solutions are all numbers ${answer.startsWith('x <') ? 'left' : 'right'} of ${num(boundary)}: ${answer}.${a < 0 ? ' Careful: negative coefficient, the sign flips!' : ''}`, `الحلول: ${answer}.`, `Soluciones: ${answer}.`)}</p>}
  </div>;
}

// ───────────── Tableau d'essais (systèmes) ─────────────

function Guess({ a, b, c, e, d, min, max, lang, onDone }: { a: number; b: number; c: number; e: number; d: number; min: number; max: number; lang: Lang; onDone: Done }) {
  const [rows, setRows] = useState<number[]>([]);
  const [x, setX] = useState(min);
  const [found, setFound] = useState(false);
  const yOf = (v: number) => a * v + b, second = (v: number) => c * v + e * yOf(v);
  const lhs = `${c === 1 ? '' : num(c)}x ${e < 0 ? '−' : '+'} ${Math.abs(e) === 1 ? '' : Math.abs(e)}y`;
  function tryX(v: number) {
    const next = Math.max(min, Math.min(max, v)); setX(next);
    setRows(r => (r.includes(next) ? r : [...r, next].sort((p, q) => p - q)));
    if (!found && second(next) === d) { setFound(true); onDone(`${next};${yOf(next)}`); }
  }
  return <div className="manip">
    <div className="manip-controls">
      <Button variant="soft" size="icon" aria-label={say(lang, 'x plus petit', 'Smaller x', 'x أصغر', 'x menor')} onClick={() => tryX(x - 1)}><Minus /></Button>
      <span className="manip-count">x = {num(x)}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'x plus grand', 'Larger x', 'x أكبر', 'x mayor')} onClick={() => tryX(x + 1)}><Plus /></Button>
    </div>
    {rows.length > 0 && <table className="guess-table"><thead><tr><th>x</th><th>y</th><th>{lhs}</th><th /></tr></thead>
      <tbody>{rows.map(v => <tr key={v} className={second(v) === d ? 'guess-ok' : ''}><td>{num(v)}</td><td>{num(yOf(v))}</td><td>{num(second(v))}</td><td>{second(v) === d ? '✓' : `≠ ${num(d)}`}</td></tr>)}</tbody></table>}
    {found && <p className="manip-discovery" role="status">{say(lang, `Le couple (${num(x)} ; ${num(yOf(x))}) vérifie les deux équations. Le calcul (substitution, combinaison) évite de tâtonner.`, `The pair (${num(x)}, ${num(yOf(x))}) satisfies both equations. Algebra (substitution, elimination) avoids the guessing.`, `الزوج (${num(x)} ; ${num(yOf(x))}) يحقق المعادلتين.`, `El par (${num(x)} ; ${num(yOf(x))}) cumple ambas.`)}</p>}
  </div>;
}

// ───────────── Construire une suite ─────────────

function Sequence({ u0, a, b, n, lang, onDone }: { u0: number; a: number; b: number; n: number; lang: Lang; onDone: Done }) {
  const [terms, setTerms] = useState<number[]>([u0]);
  const last = terms[terms.length - 1]!;
  const top = Math.max(...Array.from({ length: n + 1 }, (_, i) => Array.from({ length: i }).reduce<number>(u => a * u + b, u0)));
  const rule = b === 0 ? `× ${num(a)}` : a === 1 ? `+ ${num(b)}` : `× ${num(a)} + ${num(b)}`;
  function next() { if (terms.length > n) return; const all = [...terms, clean(a * last + b)]; setTerms(all); if (all.length > n) onDone(String(all[all.length - 1])); }
  const fixed = a !== 1 ? b / (1 - a) : null;
  return <div className="manip">
    <div className="seq-bars" aria-hidden>{terms.map((v, i) => <span key={i} className="seq-bar" style={{ height: `${Math.max(6, (v / top) * 100)}%` }}><span>{num(Math.round(v * 100) / 100)}</span></span>)}</div>
    <p className="manip-equation">u{'₀₁₂₃₄₅₆₇₈₉'[terms.length - 1]} = {num(Math.round(last * 1000) / 1000)}</p>
    {terms.length <= n ? <Button variant="soft" onClick={next}>{say(lang, `Terme suivant (${rule})`, `Next term (${rule})`, `الحد الموالي (${rule})`, `Término siguiente (${rule})`)}</Button>
      : <p className="manip-discovery" role="status">{b === 0
        ? say(lang, `On multiplie toujours par ${num(a)} : suite géométrique, elle grimpe de plus en plus vite.`, `Always × ${num(a)}: a geometric sequence, climbing faster and faster.`, `نضرب دائمًا في ${num(a)}: متتالية هندسية.`, `Siempre × ${num(a)}: sucesión geométrica.`)
        : say(lang, `Les termes se rapprochent de ${num(fixed!)} : c’est le point fixe, ℓ = ${num(a)}ℓ + ${num(b)}.`, `The terms approach ${num(fixed!)}: the fixed point, ℓ = ${num(a)}ℓ + ${num(b)}.`, `تقترب الحدود من ${num(fixed!)}.`, `Los términos se acercan a ${num(fixed!)}.`)}</p>}
  </div>;
}

// ───────────── Géométrie ─────────────

const KIND_NAMES: Record<ReturnType<typeof angleKind>, (lang: Lang) => string> = {
  nul: lang => say(lang, 'nul', 'zero', 'منعدمة', 'nulo'), aigu: lang => say(lang, 'aigu', 'acute', 'حادة', 'agudo'), droit: lang => say(lang, 'droit', 'right', 'قائمة', 'recto'),
  obtus: lang => say(lang, 'obtus', 'obtuse', 'منفرجة', 'obtuso'), plat: lang => say(lang, 'plat', 'straight', 'مستقيمة', 'llano'),
};
const rad = (d: number) => (d * Math.PI) / 180;
const Stepper = ({ label, onMinus, onPlus, minus, plus }: { label: string; onMinus: () => void; onPlus: () => void; lang: Lang; minus: string; plus: string }) => <div className="manip-controls">
  <Button variant="soft" size="icon" aria-label={minus} onClick={onMinus}><Minus /></Button>
  <span className="manip-count" aria-live="polite">{label}</span>
  <Button variant="soft" size="icon" aria-label={plus} onClick={onPlus}><Plus /></Button>
</div>;

function AngleBuilder({ target, pair, lang, onDone }: { target: number; pair: boolean; lang: Lang; onDone: Done }) {
  const [deg, setDeg] = useState(pair ? 30 : 0);
  const [seen, setSeen] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  function go(v: number) {
    const d = Math.max(0, Math.min(180, v)); setDeg(d);
    const kinds = seen.includes(angleKind(d)) ? seen : [...seen, angleKind(d)];
    setSeen(kinds);
    if (!finished && d === target && (pair || target !== 180 || ['aigu', 'droit', 'obtus'].every(k => kinds.includes(k)))) { setFinished(true); onDone(String(d)); }
  }
  const R = 80, cx = 100, cy = 100, x = cx + R * Math.cos(rad(deg)), y = cy - R * Math.sin(rad(deg));
  const large = deg > 180 ? 1 : 0, ax = cx + 26 * Math.cos(rad(deg)), ay = cy - 26 * Math.sin(rad(deg));
  return <div className="manip">
    <svg viewBox="0 0 200 116" className="manip-svg" aria-hidden>
      {!pair && Array.from({ length: 19 }, (_, i) => { const a = rad(i * 10), r1 = i % 9 === 0 ? 70 : 76; return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy - r1 * Math.sin(a)} x2={cx + 84 * Math.cos(a)} y2={cy - 84 * Math.sin(a)} className="svg-tick" />; })}
      <line x1={pair ? cx - R : cx} y1={cy} x2={cx + R} y2={cy} className="svg-ray" />
      <line x1={cx} y1={cy} x2={x} y2={y} className="svg-ray svg-ray-move" />
      {deg > 0 && <path d={`M ${cx + 26} ${cy} A 26 26 0 ${large} 0 ${ax} ${ay}`} className="svg-arc" />}
      {pair && <path d={`M ${ax} ${ay} A 26 26 0 0 0 ${cx - 26} ${cy}`} className="svg-arc svg-arc-2" />}
      <circle cx={cx} cy={cy} r={3} className="svg-dot" />
    </svg>
    <Stepper lang={lang} label={pair ? `${deg}° + ${180 - deg}° = 180°` : `${deg}° · ${KIND_NAMES[angleKind(deg)](lang)}`} onMinus={() => go(deg - 15)} onPlus={() => go(deg + 15)} minus={say(lang, 'Fermer de 15°', 'Close by 15°', 'أغلق 15°', 'Cerrar 15°')} plus={say(lang, 'Ouvrir de 15°', 'Open by 15°', 'افتح 15°', 'Abrir 15°')} />
    <div className="manip-controls"><Button variant="ghost" size="sm" onClick={() => go(deg - 5)}>−5°</Button><Button variant="ghost" size="sm" onClick={() => go(deg + 5)}>+5°</Button></div>
    {!finished && <p className="manip-feedback">{say(lang, `Cible : ${target}°`, `Target: ${target}°`, `الهدف: ${target}°`, `Meta: ${target}°`)}</p>}
    {finished && <p className="manip-discovery" role="status">{pair
      ? say(lang, `Quand l’un grandit, l’autre rapetisse : ${target}° + ${180 - target}° = 180°. Ils sont supplémentaires.`, `As one grows, the other shrinks: ${target}° + ${180 - target}° = 180°. They are supplementary.`, `${target}° + ${180 - target}° = 180°: متكاملتان.`, `${target}° + ${180 - target}° = 180°: suplementarios.`)
      : target === 180 ? say(lang, 'Aigu, puis droit à 90°, puis obtus, puis plat à 180° : une demi-droite prolonge l’autre.', 'Acute, then right at 90°, then obtuse, then straight at 180°.', 'حادة ثم قائمة ثم منفرجة ثم مستقيمة.', 'Agudo, recto, obtuso y llano.')
      : say(lang, `${target}° : un angle ${KIND_NAMES[angleKind(target)](lang)}.`, `${target}°: an ${KIND_NAMES[angleKind(target)](lang)} angle.`, `${target}°: زاوية ${KIND_NAMES[angleKind(target)](lang)}.`, `${target}°: ángulo ${KIND_NAMES[angleKind(target)](lang)}.`)}</p>}
  </div>;
}

function TriangleAngles({ lang, onDone }: { lang: Lang; onDone: Done }) {
  const [apex, setApex] = useState(2);
  const [shapes, setShapes] = useState<number[]>([2]);
  const A = { x: 20, y: 110 }, B = { x: 180, y: 110 }, C = { x: 20 + apex * 20, y: 30 };
  const ang = (P: { x: number; y: number }, Q: { x: number; y: number }, R: { x: number; y: number }) => { const a = Math.atan2(Q.y - P.y, Q.x - P.x), b = Math.atan2(R.y - P.y, R.x - P.x); let d = Math.abs(a - b) * 180 / Math.PI; if (d > 180) d = 360 - d; return d; };
  const a = Math.round(ang(A, B, C)), b = Math.round(ang(B, A, C)), c = 180 - a - b;
  function go(v: number) { const n = Math.max(0, Math.min(8, v)); setApex(n); const all = shapes.includes(n) ? shapes : [...shapes, n]; setShapes(all); if (all.length === 4) onDone('180'); }
  return <div className="manip">
    <svg viewBox="0 0 200 130" className="manip-svg" aria-hidden>
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="svg-shape" />
      <text x={A.x + 14} y={A.y - 6} className="svg-label">{a}°</text><text x={B.x - 32} y={B.y - 6} className="svg-label">{b}°</text><text x={C.x - 10} y={C.y + 22} className="svg-label">{c}°</text>
    </svg>
    <Stepper lang={lang} label={`${a}° + ${b}° + ${c}° = ${a + b + c}°`} onMinus={() => go(apex - 1)} onPlus={() => go(apex + 1)} minus={say(lang, 'Sommet vers la gauche', 'Vertex left', 'الرأس يسارًا', 'Vértice a la izquierda')} plus={say(lang, 'Sommet vers la droite', 'Vertex right', 'الرأس يمينًا', 'Vértice a la derecha')} />
    {shapes.length >= 4 && <p className="manip-discovery" role="status">{say(lang, `${shapes.length} triangles différents… et toujours 180° : c’est vrai pour tous les triangles.`, `${shapes.length} different triangles… always 180°: true for every triangle.`, `دائمًا 180°.`, `Siempre 180°.`)}</p>}
  </div>;
}

function ResizeRect({ w: w0, h: h0, lang, onDone }: { w: number; h: number; lang: Lang; onDone: Done }) {
  const [w, setW] = useState(w0), [h, setH] = useState(h0);
  const [seen, setSeen] = useState<string[]>([`${w0}x${h0}`]);
  const [finished, setFinished] = useState(false);
  function set(nw: number, nh: number) { const W = Math.max(1, Math.min(8, nw)), H = Math.max(1, Math.min(6, nh)); setW(W); setH(H); const all = seen.includes(`${W}x${H}`) ? seen : [...seen, `${W}x${H}`]; setSeen(all); if (!finished && all.length >= 4) { setFinished(true); onDone('rect'); } }
  return <div className="manip">
    <div className="square-grid rect-grid" style={{ gridTemplateColumns: `repeat(${w}, 22px)` }} aria-hidden>{Array.from({ length: w * h }, (_, i) => <span key={i} className="square-cell square-ok" />)}</div>
    <div className="manip-controls">
      <span className="text-sm font-bold">{say(lang, 'Longueur', 'Length', 'الطول', 'Largo')}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Longueur − 1', 'Length − 1', 'الطول − 1', 'Largo − 1')} onClick={() => set(w - 1, h)}><Minus /></Button><span className="manip-count">{w}</span><Button variant="soft" size="icon" aria-label={say(lang, 'Longueur + 1', 'Length + 1', 'الطول + 1', 'Largo + 1')} onClick={() => set(w + 1, h)}><Plus /></Button>
    </div>
    <div className="manip-controls">
      <span className="text-sm font-bold">{say(lang, 'Largeur', 'Width', 'العرض', 'Ancho')}</span>
      <Button variant="soft" size="icon" aria-label={say(lang, 'Largeur − 1', 'Width − 1', 'العرض − 1', 'Ancho − 1')} onClick={() => set(w, h - 1)}><Minus /></Button><span className="manip-count">{h}</span><Button variant="soft" size="icon" aria-label={say(lang, 'Largeur + 1', 'Width + 1', 'العرض + 1', 'Ancho + 1')} onClick={() => set(w, h + 1)}><Plus /></Button>
    </div>
    <p className="manip-equation">{say(lang, 'Périmètre', 'Perimeter', 'المحيط', 'Perímetro')} 2 × ({w} + {h}) = {2 * (w + h)} · {say(lang, 'Aire', 'Area', 'المساحة', 'Área')} {w} × {h} = {w * h}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, 'Le périmètre compte les bords, l’aire compte les carreaux : deux rectangles de même périmètre peuvent avoir des aires différentes.', 'Perimeter counts edges, area counts squares: two rectangles with the same perimeter can have different areas.', 'المحيط يعد الحواف والمساحة تعد المربعات.', 'El perímetro cuenta bordes; el área, cuadros.')}</p>}
  </div>;
}

function AreaTransform({ shape, b, h, lang, onDone }: { shape: 'parallelogram' | 'triangle'; b: number; h: number; lang: Lang; onDone: Done }) {
  const [moved, setMoved] = useState(false);
  const u = 22, s = 2, W = (b + s) * u + 20, H = h * u + 20;
  const base = (x: number) => 10 + x * u, top = 10, bot = 10 + h * u;
  return <div className="manip">
    <svg viewBox={`0 0 ${W} ${H}`} className="manip-svg" aria-hidden>
      {Array.from({ length: b + s + 1 }, (_, i) => <line key={`v${i}`} x1={base(i)} y1={top} x2={base(i)} y2={bot} className="svg-grid" />)}
      {Array.from({ length: h + 1 }, (_, i) => <line key={`h${i}`} x1={base(0)} y1={top + i * u} x2={base(b + s)} y2={top + i * u} className="svg-grid" />)}
      {shape === 'parallelogram' ? <>
        <polygon points={`${base(s)},${top} ${base(b)},${top} ${base(b)},${bot} ${base(s)},${bot}`} className="svg-shape" />
        <polygon points={moved ? `${base(b)},${top} ${base(b + s)},${top} ${base(b)},${bot}` : `${base(0)},${bot} ${base(s)},${top} ${base(s)},${bot}`} className="svg-shape svg-piece" />
        <polygon points={`${base(b)},${top} ${base(b + s)},${top} ${base(b)},${bot}`} className="svg-ghost" />
      </> : <>
        <polygon points={`${base(0)},${bot} ${base(b)},${bot} ${base(s)},${top}`} className="svg-shape" />
        {moved && <polygon points={`${base(s)},${top} ${base(b + s)},${top} ${base(b)},${bot}`} className="svg-shape svg-piece" />}
      </>}
      <line x1={base(s)} y1={top} x2={base(s)} y2={bot} className="svg-height" />
    </svg>
    {!moved ? <Button variant="soft" onClick={() => { setMoved(true); onDone('moved'); }}>{shape === 'parallelogram' ? say(lang, 'Découper le triangle et le recoller à droite', 'Cut the triangle and stick it on the right', 'قص المثلث وألصقه يمينًا', 'Recortar y pegar a la derecha') : say(lang, 'Ajouter une copie retournée', 'Add a flipped copy', 'أضف نسخة مقلوبة', 'Añadir una copia girada')}</Button>
      : <p className="manip-discovery" role="status">{shape === 'parallelogram'
        ? say(lang, `C’est devenu un rectangle ${b} × ${h} : l’aire du parallélogramme est base × hauteur = ${b * h}.`, `It became a ${b} × ${h} rectangle: area = base × height = ${b * h}.`, `أصبح مستطيلًا: المساحة ${b * h}.`, `Es un rectángulo: área ${b * h}.`)
        : say(lang, `Deux triangles font un parallélogramme d’aire ${b} × ${h} = ${b * h} : un triangle, c’est la moitié, ${b * h / 2}.`, `Two triangles make a parallelogram of area ${b * h}: one triangle is half, ${b * h / 2}.`, `مثلثان يكوّنان متوازي أضلاع: المثلث نصفه ${b * h / 2}.`, `Un triángulo es la mitad: ${b * h / 2}.`)}</p>}
  </div>;
}

function Unroll({ d, lang, onDone }: { d: number; lang: Lang; onDone: Done }) {
  const [rolled, setRolled] = useState(false);
  const u = 16, r = (d * u) / 2, len = Math.PI * d * u, W = Math.max(len + 2 * r + 30, 200);
  return <div className="manip">
    <svg viewBox={`0 0 ${W} ${2 * r + 46}`} className="manip-svg" aria-hidden>
      <circle cx={r + 6} cy={r + 6} r={r} className="svg-shape" style={{ transform: rolled ? `translateX(${len}px) rotate(360deg)` : 'none', transformOrigin: `${r + 6}px ${r + 6}px`, transition: 'transform 1.4s ease-in-out' }} />
      <line x1={6} y1={2 * r + 6} x2={6 + (rolled ? len : 0)} y2={2 * r + 6} className="svg-unrolled" style={{ transition: 'all 1.4s ease-in-out' }} />
      {rolled && Array.from({ length: 4 }, (_, i) => <g key={i}><rect x={6 + i * d * u} y={2 * r + 14} width={Math.min(d * u, len - i * d * u) - 2} height={10} rx={3} className={i < 3 ? 'svg-diam' : 'svg-diam svg-diam-part'} /></g>)}
    </svg>
    {!rolled ? <Button variant="soft" onClick={() => { setRolled(true); onDone('pi'); }}>{say(lang, 'Faire rouler le cercle d’un tour', 'Roll the circle one turn', 'دحرج الدائرة دورة', 'Rodar una vuelta')}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `Un tour = 3 diamètres et un petit bout : π × ${d} ≈ ${num(Math.round(Math.PI * d * 100) / 100)}. Ce nombre « un peu plus que 3 » s’appelle π ≈ 3,14.`, `One turn = 3 diameters and a bit: π × ${d} ≈ ${(Math.PI * d).toFixed(2)}. That “a bit more than 3” is π ≈ 3.14.`, `دورة = 3 أقطار وقليل: π ≈ 3,14.`, `Una vuelta = 3 diámetros y algo: π ≈ 3,14.`)}</p>}
  </div>;
}

function Cubes({ l, w, h, lang, onDone }: { l: number; w: number; h: number; lang: Lang; onDone: Done }) {
  const [floors, setFloors] = useState(1);
  function more() { if (floors >= h) return; setFloors(floors + 1); if (floors + 1 === h) onDone(String(l * w * h)); }
  const c = 18, dx = 9, dy = 7;
  const W = l * c + w * dx + 10, H = h * c + w * dy + 10;
  const cubes: { x: number; y: number; z: number }[] = [];
  for (let z = 0; z < floors; z++) for (let y = w - 1; y >= 0; y--) for (let x = 0; x < l; x++) cubes.push({ x, y, z });
  return <div className="manip">
    <svg viewBox={`0 0 ${W} ${H}`} className="manip-svg manip-cubes" aria-hidden>
      {cubes.map(({ x, y, z }, i) => { const px = 4 + x * c + y * dx, py = H - 4 - (z + 1) * c - y * dy; return <g key={i}>
        <polygon points={`${px},${py} ${px + c},${py} ${px + c + dx},${py - dy} ${px + dx},${py - dy}`} className="cube-top" />
        <polygon points={`${px + c},${py} ${px + c + dx},${py - dy} ${px + c + dx},${py - dy + c} ${px + c},${py + c}`} className="cube-side" />
        <rect x={px} y={py} width={c} height={c} className="cube-front" />
      </g>; })}
    </svg>
    <p className="manip-equation">{l} × {w} = {l * w} {say(lang, 'par étage', 'per layer', 'في كل طابق', 'por piso')} · {floors} {say(lang, `étage${floors > 1 ? 's' : ''}`, `layer${floors > 1 ? 's' : ''}`, 'طوابق', 'pisos')} → {l * w * floors}</p>
    {floors < h ? <Button variant="soft" onClick={more}>{say(lang, 'Ajouter un étage', 'Add a layer', 'أضف طابقًا', 'Añadir un piso')}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `Volume = ${l} × ${w} × ${h} = ${l * w * h} cubes : aire de la base × hauteur.`, `Volume = ${l} × ${w} × ${h} = ${l * w * h} cubes: base area × height.`, `الحجم = ${l * w * h}.`, `Volumen = ${l * w * h}.`)}</p>}
  </div>;
}

function Sticks({ a, b, lang, onDone }: { a: number; b: number; lang: Lang; onDone: Done }) {
  const [c, setC] = useState(a + b + 1);
  const [seen, setSeen] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const ok = closes(a, b, c), u = 14;
  function go(v: number) { const n = Math.max(1, Math.min(a + b + 2, v)); setC(n); const all = [...seen, closes(a, b, n)]; setSeen(all); if (!finished && all.includes(true) && all.includes(false) && all.length >= 3) { setFinished(true); onDone('ineq'); } }
  // Triangle de côtés c (base), a et b quand il existe ; sinon les deux bâtons couchés qui ne se rejoignent pas.
  const xA = 10, xB = 10 + c * u;
  const px = ok ? (c * c + a * a - b * b) / (2 * c) : 0, py = ok ? Math.sqrt(Math.max(0, a * a - px * px)) : 0;
  return <div className="manip">
    <svg viewBox={`0 0 ${Math.max(xB, 10 + (a + b) * u) + 20} ${Math.max(py * u, 20) + 30}`} className="manip-svg" aria-hidden>
      <line x1={xA} y1={py * u + 15} x2={xB} y2={py * u + 15} className="stick stick-c" />
      {ok ? <><line x1={xA} y1={py * u + 15} x2={xA + px * u} y2={15} className="stick stick-a" /><line x1={xB} y1={py * u + 15} x2={xA + px * u} y2={15} className="stick stick-b" /></>
        : <><line x1={xA} y1={py * u + 15} x2={xA + a * u * 0.96} y2={py * u + 5} className="stick stick-a" /><line x1={xB} y1={py * u + 15} x2={xB - b * u * 0.96} y2={py * u + 5} className="stick stick-b" /></>}
    </svg>
    <Stepper lang={lang} label={`${a} · ${b} · ${c}`} onMinus={() => go(c - 1)} onPlus={() => go(c + 1)} minus={say(lang, 'Troisième bâton plus court', 'Shorter third stick', 'العود الثالث أقصر', 'Tercer palo más corto')} plus={say(lang, 'Troisième bâton plus long', 'Longer third stick', 'العود الثالث أطول', 'Tercer palo más largo')} />
    <p className={`manip-feedback ${ok ? 'manip-good' : 'manip-bad'}`}>{ok ? say(lang, `${c} < ${a} + ${b} : le triangle se ferme.`, `${c} < ${a} + ${b}: the triangle closes.`, 'يُغلق المثلث.', 'Se cierra.') : say(lang, `Les bâtons ${a} et ${b} ne se rejoignent pas.`, `Sticks ${a} and ${b} don’t meet.`, 'لا يلتقيان.', 'No se juntan.')}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, `Ça marche seulement si le plus grand bâton est plus court que les deux autres réunis (ici, le troisième entre ${a - b + 1} et ${a + b - 1}).`, `It only works if the longest stick is shorter than the other two together (here the third between ${a - b + 1} and ${a + b - 1}).`, 'أطول عود أقصر من مجموع الآخرين.', 'El mayor debe ser menor que la suma.')}</p>}
  </div>;
}

function ThalesSlide({ ab, ac, bc, free, lang, onDone }: { ab: number; ac: number; bc: number; free: boolean; lang: Lang; onDone: Done }) {
  const [m, setM] = useState(2), [n, setN] = useState(free ? 1 : 2); // positions en quarts : AM = m/4 × AB
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const am = (ab * m) / 4, an = (ac * (free ? n : m)) / 4;
  const parallel = am / ab === an / ac;
  const A = { x: 100, y: 12 }, B = { x: 20, y: 132 }, C = { x: 185, y: 132 };
  const at = (P: { x: number; y: number }, k: number) => ({ x: A.x + (P.x - A.x) * k, y: A.y + (P.y - A.y) * k });
  const M = at(B, m / 4), N = at(C, (free ? n : m) / 4);
  function step(setter: (v: number) => void, v: number) { setter(Math.max(1, Math.min(3, v))); const k = moves + 1; setMoves(k); if (!finished && k >= 2) { setFinished(true); onDone('ratios'); } }
  const r = (v: number) => num(Math.round(v * 100) / 100);
  return <div className="manip">
    <svg viewBox="0 0 200 145" className="manip-svg" aria-hidden>
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="svg-shape" />
      <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} className={`svg-ray ${parallel ? 'svg-ray-move' : 'svg-ray-bad'}`} />
      {[['A', A], ['B', B], ['C', C], ['M', M], ['N', N]].map(([l, P]) => <text key={l as string} x={(P as { x: number }).x + 4} y={(P as { y: number }).y - 4} className="svg-label">{l as string}</text>)}
    </svg>
    <Stepper lang={lang} label={`AM = ${r(am)}`} onMinus={() => step(setM, m - 1)} onPlus={() => step(setM, m + 1)} minus={say(lang, 'M vers A', 'M towards A', 'M نحو A', 'M hacia A')} plus={say(lang, 'M vers B', 'M towards B', 'M نحو B', 'M hacia B')} />
    {free && <Stepper lang={lang} label={`AN = ${r(an)}`} onMinus={() => step(setN, n - 1)} onPlus={() => step(setN, n + 1)} minus={say(lang, 'N vers A', 'N towards A', 'N نحو A', 'N hacia A')} plus={say(lang, 'N vers C', 'N towards C', 'N نحو C', 'N hacia C')} />}
    <p className="manip-equation">AM/AB = {r(am / ab)} · AN/AC = {r(an / ac)}{free ? '' : ` · MN/BC = ${r(am / ab)}`}</p>
    <p className={`manip-feedback ${parallel ? 'manip-good' : 'manip-bad'}`}>{parallel ? say(lang, '(MN) ∥ (BC)', '(MN) ∥ (BC)', '(MN) ∥ (BC)', '(MN) ∥ (BC)') : say(lang, '(MN) n’est pas parallèle à (BC)', '(MN) is not parallel to (BC)', '(MN) غير موازٍ لـ (BC)', '(MN) no es paralela a (BC)')}</p>
    {finished && <p className="manip-discovery" role="status">{free
      ? say(lang, 'Les rapports sont égaux exactement quand (MN) est parallèle à (BC) : c’est la réciproque de Thalès.', 'The ratios are equal exactly when (MN) is parallel to (BC): the converse.', 'تتساوى النسب بالضبط عند التوازي.', 'Las razones son iguales justo cuando son paralelas.')
      : say(lang, 'Quand (MN) ∥ (BC), les trois rapports restent égaux, où que soit M.', 'When (MN) ∥ (BC), the three ratios stay equal wherever M is.', 'تبقى النسب الثلاث متساوية.', 'Las tres razones siguen iguales.')}</p>}
  </div>;
}

function Enlarge({ w, h, solid, lang, onDone }: { w: number; h: number; solid: boolean; lang: Lang; onDone: Done }) {
  const ks = [0.5, 1, 1.5, 2, 3];
  const [i, setI] = useState(1);
  const [seen, setSeen] = useState<number[]>([1]);
  const k = ks[i]!;
  function go(v: number) { const j = Math.max(0, Math.min(ks.length - 1, v)); setI(j); const all = seen.includes(j) ? seen : [...seen, j]; setSeen(all); if (all.length === 3) onDone(String(ks[j])); }
  const u = 18;
  return <div className="manip">
    <svg viewBox={`0 0 ${w * 3 * u + 20} ${h * 3 * u + 20}`} className="manip-svg" aria-hidden>
      <rect x={10} y={10 + h * 3 * u - h * u} width={w * u} height={h * u} className="svg-ghost" />
      <rect x={10} y={10 + h * 3 * u - h * k * u} width={w * k * u} height={h * k * u} className="svg-shape" style={{ transition: 'all .4s' }} />
    </svg>
    <Stepper lang={lang} label={`k = ${num(k)}`} onMinus={() => go(i - 1)} onPlus={() => go(i + 1)} minus={say(lang, 'Rapport plus petit', 'Smaller factor', 'نسبة أصغر', 'Razón menor')} plus={say(lang, 'Rapport plus grand', 'Larger factor', 'نسبة أكبر', 'Razón mayor')} />
    <p className="manip-equation">{say(lang, 'côté', 'side', 'ضلع', 'lado')} {w} → {num(w * k)} · {say(lang, 'aire', 'area', 'مساحة', 'área')} {w * h} → {num(w * h * k * k)}{solid ? ` · volume ${w * h * w} → ${num(w * h * w * k ** 3)}` : ''}</p>
    {seen.length >= 3 && <p className="manip-discovery" role="status">{say(lang, `Les longueurs sont multipliées par k, les aires par k² (k × k)${solid ? ', les volumes par k³' : ''}.`, `Lengths × k, areas × k²${solid ? ', volumes × k³' : ''}.`, `الأطوال × k والمساحات × k²${solid ? ' والأحجام × k³' : ''}.`, `Longitudes × k, áreas × k²${solid ? ', volúmenes × k³' : ''}.`)}</p>}
  </div>;
}

function TrigRatio({ angle: a0, mode, lang, onDone }: { angle: number; mode: 'size' | 'angle'; lang: Lang; onDone: Done }) {
  const [size, setSize] = useState(2), [angle, setAngle] = useState(a0);
  const [moves, setMoves] = useState(0);
  const hyp = size * 2, adj = hyp * Math.cos(rad(angle)), opp = hyp * Math.sin(rad(angle));
  function bump(f: () => void) { f(); const k = moves + 1; setMoves(k); if (k === 3) onDone('trig'); }
  const u = 28, S = { x: 10, y: 120 }, R = { x: 10 + adj * u, y: 120 }, T = { x: 10 + adj * u, y: 120 - opp * u };
  const r2 = (v: number) => num(Math.round(v * 100) / 100);
  return <div className="manip">
    <svg viewBox="0 0 200 130" className="manip-svg" aria-hidden>
      <polygon points={`${S.x},${S.y} ${R.x},${R.y} ${T.x},${T.y}`} className="svg-shape" style={{ transition: 'all .4s' }} />
      <text x={S.x + 18} y={S.y - 4} className="svg-label">{angle}°</text>
    </svg>
    {mode === 'size'
      ? <Stepper lang={lang} label={say(lang, `hypoténuse ${r2(hyp)}`, `hypotenuse ${r2(hyp)}`, `الوتر ${r2(hyp)}`, `hipotenusa ${r2(hyp)}`)} onMinus={() => bump(() => setSize(Math.max(1, size - 0.5)))} onPlus={() => bump(() => setSize(Math.min(3.5, size + 0.5)))} minus={say(lang, 'Triangle plus petit', 'Smaller triangle', 'مثلث أصغر', 'Triángulo menor')} plus={say(lang, 'Triangle plus grand', 'Larger triangle', 'مثلث أكبر', 'Triángulo mayor')} />
      : <Stepper lang={lang} label={`${angle}°`} onMinus={() => bump(() => setAngle(Math.max(10, angle - 10)))} onPlus={() => bump(() => setAngle(Math.min(80, angle + 10)))} minus={say(lang, 'Angle plus petit', 'Smaller angle', 'زاوية أصغر', 'Ángulo menor')} plus={say(lang, 'Angle plus grand', 'Larger angle', 'زاوية أكبر', 'Ángulo mayor')} />}
    <p className="manip-equation">{say(lang, 'adj', 'adj', 'مجاور', 'ady')}/{say(lang, 'hyp', 'hyp', 'وتر', 'hip')} = {r2(adj / hyp)} · {say(lang, 'opp', 'opp', 'مقابل', 'op')}/{say(lang, 'hyp', 'hyp', 'وتر', 'hip')} = {r2(opp / hyp)}</p>
    {moves >= 3 && <p className="manip-discovery" role="status">{mode === 'size'
      ? say(lang, `La taille change, les rapports non : ils ne dépendent que de l’angle. cos ${angle}° ≈ ${r2(Math.cos(rad(angle)))}.`, `Size changes, the ratios don’t: they depend only on the angle. cos ${angle}° ≈ ${r2(Math.cos(rad(angle)))}.`, 'النسب لا تتعلق إلا بالزاوية.', 'Las razones solo dependen del ángulo.')
      : say(lang, 'Quand l’angle grandit, le cosinus diminue et le sinus augmente. La calculatrice fait le chemin inverse avec cos⁻¹.', 'As the angle grows, cosine falls and sine rises. The calculator goes back with cos⁻¹.', 'كلما كبرت الزاوية نقص cos وزاد sin.', 'Al crecer el ángulo, el coseno baja.')}</p>}
  </div>;
}

function Pour({ times, lang, onDone }: { times: number; lang: Lang; onDone: Done }) {
  const [poured, setPoured] = useState(0);
  function pour() { if (poured >= times) return; setPoured(poured + 1); if (poured + 1 === times) onDone(String(times)); }
  return <div className="manip">
    <svg viewBox="0 0 200 120" className="manip-svg" aria-hidden>
      <polygon points="20,110 70,110 45,20" className={`svg-shape ${poured < times ? '' : 'svg-ghost'}`} />
      <rect x={110} y={20} width={70} height={90} className="svg-ghost" />
      <rect x={110} y={110 - (90 * poured) / times} width={70} height={(90 * poured) / times} className="pour-fill" style={{ transition: 'all .5s' }} />
      {Array.from({ length: times - 1 }, (_, i) => <line key={i} x1={110} x2={180} y1={110 - (90 * (i + 1)) / times} y2={110 - (90 * (i + 1)) / times} className="svg-grid" />)}
    </svg>
    <p className="manip-feedback">{say(lang, `${poured} pyramide${poured > 1 ? 's' : ''} versée${poured > 1 ? 's' : ''}`, `${poured} pyramid${poured > 1 ? 's' : ''} poured`, `${poured} أهرام`, `${poured} pirámides`)}</p>
    {poured < times ? <Button variant="soft" onClick={pour}>{say(lang, 'Verser une pyramide', 'Pour a pyramid', 'صبّ هرمًا', 'Verter una pirámide')}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `Il faut ${times} pyramides pour remplir le prisme : une pyramide, c’est le tiers. V = aire de la base × hauteur ÷ 3.`, `It takes ${times} pyramids to fill the prism: a pyramid is a third. V = base area × height ÷ 3.`, `الهرم ثلث الموشور.`, `La pirámide es un tercio.`)}</p>}
  </div>;
}

// ───────────── Fractions, proportionnalité, statistiques, probabilités ─────────────

function FracBar({ d, shaded, onTap, label }: { d: number; shaded: (i: number) => boolean; onTap?: (i: number) => void; label?: (i: number) => string }) {
  return <div className="frac-bar" style={{ gridTemplateColumns: `repeat(${d}, 1fr)` }}>
    {Array.from({ length: d }, (_, i) => onTap
      ? <button key={i} type="button" className={`frac-part ${shaded(i) ? 'frac-on' : ''}`} onClick={() => onTap(i)} aria-pressed={shaded(i)} aria-label={`${i + 1}/${d}`}>{label?.(i)}</button>
      : <span key={i} className={`frac-part ${shaded(i) ? 'frac-on' : ''}`}>{label?.(i)}</span>)}
  </div>;
}

function FracColor({ n, d, lang, onDone }: { n: number; d: number; lang: Lang; onDone: Done }) {
  const [on, setOn] = useState<boolean[]>(Array(d).fill(false));
  const [seen, setSeen] = useState<number[]>([]);
  const count = on.filter(Boolean).length;
  function tap(i: number) { const next = on.map((v, j) => (j === i ? !v : v)); setOn(next); const c = next.filter(Boolean).length; const all = seen.includes(c) ? seen : [...seen, c]; setSeen(all); if (all.includes(1) && all.includes(n)) onDone(`${n}/${d}`); }
  return <div className="manip">
    <FracBar d={d} shaded={i => on[i]!} onTap={tap} />
    <p className="manip-equation" aria-live="polite">{count}/{d}</p>
    <p className="manip-feedback">{say(lang, `${count} part${count > 1 ? 's' : ''} coloriée${count > 1 ? 's' : ''} sur ${d} parts égales`, `${count} of ${d} equal parts shaded`, `${count} من ${d} أجزاء ملونة`, `${count} de ${d} partes`)}</p>
    {seen.includes(1) && seen.includes(n) && <p className="manip-discovery" role="status">{say(lang, `Le dénominateur ${d} ne change pas (les parts du tout) ; le numérateur compte les parts coloriées : 1/${d}, puis ${n}/${d}.`, `The denominator ${d} stays (the parts of the whole); the numerator counts shaded parts: 1/${d}, then ${n}/${d}.`, `المقام ${d} ثابت والبسط يعد الأجزاء الملونة.`, `El denominador ${d} no cambia; el numerador cuenta.`)}</p>}
  </div>;
}

function FracMerge({ n, d, k, lang, onDone }: { n: number; d: number; k: number; lang: Lang; onDone: Done }) {
  const [merged, setMerged] = useState(false);
  return <div className="manip">
    <FracBar d={d} shaded={i => i < n} />
    <FracBar d={merged ? d / k : d} shaded={i => i < (merged ? n / k : n)} />
    <p className="manip-equation">{n}/{d}{merged ? ` = ${n / k}/${d / k}` : ''}</p>
    {!merged ? <Button variant="soft" onClick={() => { setMerged(true); onDone(`${n / k}/${d / k}`); }}>{say(lang, `Regrouper les parts par ${k}`, `Group the parts in ${k}s`, `اجمع الأجزاء ${k} ${k}`, `Agrupar de ${k} en ${k}`)}</Button>
      : <p className="manip-discovery" role="status">{say(lang, `Même quantité coloriée : ${n}/${d} = ${n / k}/${d / k}. On a divisé le numérateur et le dénominateur par ${k}.`, `Same shaded amount: ${n}/${d} = ${n / k}/${d / k}. Top and bottom divided by ${k}.`, `نفس الكمية: ${n}/${d} = ${n / k}/${d / k}.`, `Misma cantidad: ${n}/${d} = ${n / k}/${d / k}.`)}</p>}
  </div>;
}

function FracOf({ n, d, total, unit, lang, onDone }: { n: number; d: number; total: number; unit: string; lang: Lang; onDone: Done }) {
  const [stage, setStage] = useState(0);
  const part = total / d;
  return <div className="manip">
    <div className="bar-model"><FracBar d={stage ? d : 1} shaded={i => stage === 2 && i < n} label={i => (stage ? `${num(part)}` : i === 0 ? `${total} ${unit}` : '')} /><div className="bar-brace"><span>{total} {unit}</span></div></div>
    <p className="manip-equation">{stage === 0 ? `${n}/${d} × ${total}` : stage === 1 ? `${total} ÷ ${d} = ${num(part)}` : `${num(part)} × ${n} = ${num(part * n)} ${unit}`}</p>
    {stage === 0 && <Button variant="soft" onClick={() => setStage(1)}>{say(lang, `Partager en ${d} parts égales`, `Split into ${d} equal parts`, `اقسم إلى ${d} أجزاء`, `Dividir en ${d} partes`)}</Button>}
    {stage === 1 && <Button variant="soft" onClick={() => { setStage(2); onDone(String(part * n)); }}>{say(lang, `Prendre ${n} parts`, `Take ${n} parts`, `خذ ${n} أجزاء`, `Tomar ${n} partes`)}</Button>}
    {stage === 2 && <p className="manip-discovery" role="status">{say(lang, `${n}/${d} de ${total} ${unit} = ${num(part * n)} ${unit} : on divise par ${d}, puis on multiplie par ${n}.`, `${n}/${d} of ${total} ${unit} = ${num(part * n)} ${unit}: divide by ${d}, then multiply by ${n}.`, `${num(part * n)} ${unit}.`, `${num(part * n)} ${unit}.`)}</p>}
  </div>;
}

function FracArea({ a, b, c, d, lang, onDone }: { a: number; b: number; c: number; d: number; lang: Lang; onDone: Done }) {
  const [cols, setCols] = useState(false), [rows, setRows] = useState(false);
  const both = cols && rows;
  function go(which: 'c' | 'r') { if (which === 'c') setCols(true); else setRows(true); if ((which === 'c' ? rows : cols)) onDone(`${a * c}/${b * d}`); }
  return <div className="manip">
    <div className="area-grid" style={{ gridTemplateColumns: `repeat(${b}, 1fr)`, gridTemplateRows: `repeat(${d}, 1fr)` }} aria-hidden>
      {Array.from({ length: b * d }, (_, i) => { const x = i % b, y = Math.floor(i / b), inC = cols && x < a, inR = rows && y < c; return <span key={i} className={`area-cell ${inC ? 'area-col' : ''} ${inR ? 'area-row' : ''} ${inC && inR ? 'area-both' : ''}`} />; })}
    </div>
    <div className="manip-controls">
      <Button variant="soft" disabled={cols} onClick={() => go('c')}>{say(lang, `Colorier ${a}/${b}`, `Shade ${a}/${b}`, `لوّن ${a}/${b}`, `Colorear ${a}/${b}`)}</Button>
      <Button variant="soft" disabled={rows} onClick={() => go('r')}>{say(lang, `Colorier ${c}/${d}`, `Shade ${c}/${d}`, `لوّن ${c}/${d}`, `Colorear ${c}/${d}`)}</Button>
    </div>
    {both && <p className="manip-discovery" role="status">{say(lang, `La partie colorée deux fois : ${a * c} cases sur ${b * d}. ${a}/${b} × ${c}/${d} = ${a * c}/${b * d} : on multiplie les numérateurs et les dénominateurs.`, `Double-shaded: ${a * c} of ${b * d} cells. ${a}/${b} × ${c}/${d} = ${a * c}/${b * d}.`, `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}.`, `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}.`)}</p>}
  </div>;
}

function RatioGraph({ unit, label, lang, onDone }: { unit: number; label: string; lang: Lang; onDone: Done }) {
  const [qs, setQs] = useState<number[]>([]);
  const [q, setQ] = useState(0);
  function go(v: number) { const n = Math.max(0, Math.min(8, v)); setQ(n); const all = qs.includes(n) ? qs : [...qs, n]; setQs(all); if (all.length === 4) onDone('prop'); }
  const W = 200, H = 130, sx = W / 9, sy = H / (unit * 9);
  return <div className="manip">
    <svg viewBox={`0 0 ${W + 10} ${H + 10}`} className="manip-svg" aria-hidden>
      <line x1={5} y1={H} x2={W} y2={H} className="svg-ray" /><line x1={5} y1={H} x2={5} y2={0} className="svg-ray" />
      {qs.length >= 4 && <line x1={5} y1={H} x2={5 + 8.5 * sx} y2={H - 8.5 * unit * sy} className="svg-height" />}
      {qs.map(v => <circle key={v} cx={5 + v * sx} cy={H - v * unit * sy} r={4} className="svg-point" />)}
    </svg>
    <Stepper lang={lang} label={`${q} → ${num(q * unit)} ${label}`} onMinus={() => go(q - 1)} onPlus={() => go(q + 1)} minus={say(lang, 'Un de moins', 'One fewer', 'واحد أقل', 'Uno menos')} plus={say(lang, 'Un de plus', 'One more', 'واحد أكثر', 'Uno más')} />
    {qs.length >= 4 && <p className="manip-discovery" role="status">{say(lang, `Chaque prix = nombre × ${num(unit)} : les points sont alignés avec l’origine. C’est la proportionnalité.`, `Each price = number × ${num(unit)}: the points line up with the origin. That is proportionality.`, `النقط مستقيمية مع الأصل: التناسبية.`, `Los puntos se alinean con el origen.`)}</p>}
  </div>;
}

function PercentBar({ total, pct, lang, onDone }: { total: number; pct: number; lang: Lang; onDone: Done }) {
  const [on, setOn] = useState(0);
  const target = pct / 10;
  function tap(i: number) { const next = i + 1 === on ? i : i + 1; setOn(next); if (next === target) onDone(String((total * pct) / 100)); }
  return <div className="manip">
    <FracBar d={10} shaded={i => i < on} onTap={tap} label={() => '10 %'} />
    <p className="manip-equation">{on * 10} % {say(lang, 'de', 'of', 'من', 'de')} {total} = {num((total * on) / 10)}</p>
    {on === target && <p className="manip-discovery" role="status">{say(lang, `Une part de 10 % = ${num(total / 10)} (un dixième). ${pct} % de ${total} = ${num((total * pct) / 100)}, donc le prix soldé = ${num(total - (total * pct) / 100)}.`, `One 10% part = ${num(total / 10)}. ${pct}% of ${total} = ${num((total * pct) / 100)}, so the sale price = ${num(total - (total * pct) / 100)}.`, `${pct} % من ${total} = ${num((total * pct) / 100)}.`, `${pct} % de ${total} = ${num((total * pct) / 100)}.`)}</p>}
  </div>;
}

function LineUp({ values, lang, onDone }: { values: number[]; lang: Lang; onDone: Done }) {
  const [sorted, setSorted] = useState(false);
  const [removed, setRemoved] = useState(0);
  const list = sorted ? [...values].sort((a, b) => a - b) : values;
  const canRemove = sorted && list.length - 2 * removed > 2;
  const finished = sorted && !canRemove;
  function remove() { const r = removed + 1; setRemoved(r); if (values.length - 2 * r <= 2) onDone(String(median(values))); }
  return <div className="manip">
    <div className="lineup">{list.map((v, i) => <span key={i} className={`lineup-card ${sorted && (i < removed || i >= list.length - removed) ? 'lineup-out' : ''}`}>{num(v)}</span>)}</div>
    {!sorted ? <Button variant="soft" onClick={() => setSorted(true)}>{say(lang, 'Ranger du plus petit au plus grand', 'Sort from smallest to largest', 'رتّب تصاعديًا', 'Ordenar de menor a mayor')}</Button>
      : canRemove ? <Button variant="soft" onClick={remove}>{say(lang, 'Retirer la plus petite et la plus grande', 'Remove the smallest and the largest', 'أزل الأصغر والأكبر', 'Quitar el menor y el mayor')}</Button> : null}
    {finished && <p className="manip-discovery" role="status">{say(lang, `Il reste le milieu : la médiane vaut ${num(median(values))}. Autant de valeurs en dessous qu’au-dessus.`, `The middle is left: the median is ${num(median(values))}. As many values below as above.`, `الوسيط ${num(median(values))}.`, `La mediana es ${num(median(values))}.`)}</p>}
  </div>;
}

function Tally({ categories, answers, lang, onDone }: { categories: L[]; answers: number[]; lang: Lang; onDone: Done }) {
  const [i, setI] = useState(0);
  const [counts, setCounts] = useState<number[]>(categories.map(() => 0));
  const [wrong, setWrong] = useState(false);
  const top = Math.max(...categories.map((_, k) => answers.filter(a => a === k).length));
  function tap(k: number) {
    if (i >= answers.length) return;
    if (k !== answers[i]) { setWrong(true); return; }
    setWrong(false); const next = counts.map((c, j) => (j === k ? c + 1 : c)); setCounts(next); setI(i + 1);
    if (i + 1 === answers.length) onDone('tally');
  }
  const best = counts.indexOf(Math.max(...counts));
  return <div className="manip">
    {i < answers.length && <p className="manip-equation" aria-live="polite">{say(lang, `Élève ${i + 1} : « ${categories[answers[i]!]![lang]} »`, `Pupil ${i + 1}: “${categories[answers[i]!]![lang]}”`, `التلميذ ${i + 1}: « ${categories[answers[i]!]![lang]} »`, `Alumno ${i + 1}: «${categories[answers[i]!]![lang]}»`)}</p>}
    <div className="tally-bars">{categories.map((c, k) => <button key={k} type="button" className="tally-col" onClick={() => tap(k)} aria-label={`${c[lang]} : ${counts[k]}`}>
      <span className="tally-count">{counts[k]}</span><span className="tally-bar" style={{ height: `${(counts[k]! / top) * 100}%` }} /><span className="tally-label">{c[lang]}</span>
    </button>)}</div>
    {wrong && <p className="manip-feedback manip-bad" role="alert">{say(lang, 'Regarde bien la réponse de l’élève.', 'Look carefully at the pupil’s answer.', 'انظر جيدًا إلى جواب التلميذ.', 'Mira bien la respuesta.')}</p>}
    {i === answers.length && <p className="manip-discovery" role="status">{say(lang, `${answers.length} réponses dépouillées. La plus haute barre : ${categories[best]![lang]} (${counts[best]}). La hauteur d’une barre = l’effectif.`, `${answers.length} answers tallied. Tallest bar: ${categories[best]![lang]} (${counts[best]}). Bar height = count.`, `أعلى عمود: ${categories[best]![lang]}.`, `Barra más alta: ${categories[best]![lang]}.`)}</p>}
  </div>;
}

function Sim({ outcomes, event, seed, lang, onDone }: { outcomes: { label: L; weight: number }[]; event: number[]; seed: number; lang: Lang; onDone: Done }) {
  const [results, setResults] = useState<number[]>([]);
  const total = outcomes.reduce((a, o) => a + o.weight, 0);
  const p = event.reduce((a, k) => a + outcomes[k]!.weight, 0) / total;
  function roll(n: number) { const next = [...results, ...simulate(outcomes.map(o => o.weight), n, seed + results.length)]; setResults(next); if (next.length >= 1000) onDone('freq'); }
  const hits = results.filter(r => event.includes(r)).length;
  const freq = results.length ? hits / results.length : 0;
  const counts = outcomes.map((_, k) => results.filter(r => r === k).length);
  const top = Math.max(1, ...counts);
  return <div className="manip">
    <div className="tally-bars">{outcomes.map((o, k) => <div key={k} className={`tally-col ${event.includes(k) ? 'tally-event' : ''}`}><span className="tally-count">{counts[k]}</span><span className="tally-bar" style={{ height: `${(counts[k]! / top) * 100}%` }} /><span className="tally-label">{o.label[lang]}</span></div>)}</div>
    <div className="manip-controls">{[1, 10, 100, 1000].map(n => <Button key={n} variant="soft" size="sm" onClick={() => roll(n)}>+{n}</Button>)}</div>
    <p className="manip-equation">{say(lang, `${results.length} essais · fréquence ${num(Math.round(freq * 1000) / 1000)} · probabilité ${num(Math.round(p * 1000) / 1000)}`, `${results.length} trials · frequency ${(Math.round(freq * 1000) / 1000)} · probability ${(Math.round(p * 1000) / 1000)}`, `${results.length} تجربة · التردد ${num(Math.round(freq * 1000) / 1000)}`, `${results.length} intentos · frecuencia ${num(Math.round(freq * 1000) / 1000)}`)}</p>
    {results.length >= 1000 && <p className="manip-discovery" role="status">{say(lang, `Avec ${results.length} essais, la fréquence (${num(Math.round(freq * 100) / 100)}) est très proche de la probabilité (${num(Math.round(p * 100) / 100)}). Avec peu d’essais, elle variait beaucoup plus.`, `With ${results.length} trials, the frequency (${(Math.round(freq * 100) / 100)}) is very close to the probability (${(Math.round(p * 100) / 100)}).`, `التردد قريب جدًا من الاحتمال.`, `La frecuencia se acerca a la probabilidad.`)}</p>}
  </div>;
}

// ───────────── 2nde : intervalles, fonctions, signes, droites, quartiles, événements, cercle ─────────────

const yes = (lang: Lang, v: boolean) => (v ? say(lang, 'oui', 'yes', 'نعم', 'sí') : say(lang, 'non', 'no', 'لا', 'no'));

function IntervalWalk({ a, b, closedA, closedB, other, center, lang, onDone }: { a: number; b: number; closedA: boolean; closedB: boolean; other?: { a: number; b: number } | undefined; center?: number | undefined; lang: Lang; onDone: Done }) {
  const lo = Math.min(a, other?.a ?? a) - 3, hi = Math.max(b, other?.b ?? b) + 3;
  const [x, setX] = useState(lo + 1);
  const [seen, setSeen] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const inA = inInterval(x, a, b, closedA, closedB), inB = other ? inInterval(x, other.a, other.b, true, true) : false;
  const W = 300, px = (v: number) => 10 + ((v - lo) / (hi - lo)) * (W - 20);
  function go(v: number) {
    const nx = Math.max(lo, Math.min(hi, v)); setX(nx);
    const tag = other ? (inInterval(nx, a, b, closedA, closedB) ? 'A' : '') + (inInterval(nx, other.a, other.b, true, true) ? 'B' : '') : nx === a ? 'a' : nx === b ? 'b' : inInterval(nx, a, b, true, true) ? 'in' : 'out';
    const all = seen.includes(tag) ? seen : [...seen, tag];
    setSeen(all);
    const goal = other ? ['A', 'B', 'AB'] : ['a', 'b', 'in'];
    if (!finished && goal.every(g => all.includes(g))) { setFinished(true); onDone('interval'); }
  }
  const bracket = (v: number, closed: boolean, left: boolean) => <text x={px(v) - 5} y={36} className="svg-label interval-bracket">{(closed ? left : !left) ? '[' : ']'}</text>;
  return <div className="manip">
    <svg viewBox={`0 0 ${W} 60`} className="manip-svg" aria-hidden>
      <line x1={10} y1={30} x2={W - 10} y2={30} className="svg-tick" />
      {Array.from({ length: hi - lo + 1 }, (_, i) => <g key={i}><line x1={px(lo + i)} x2={px(lo + i)} y1={26} y2={34} className="svg-tick" /><text x={px(lo + i) - 4} y={52} className="svg-small">{num(lo + i)}</text></g>)}
      <line x1={px(a)} x2={px(b)} y1={30} y2={30} className="interval-a" />
      {other && <line x1={px(other.a)} x2={px(other.b)} y1={22} y2={22} className="interval-b" />}
      {bracket(a, closedA, true)}{bracket(b, closedB, false)}
      <circle cx={px(x)} cy={30} r={6} className={inA ? 'interval-in' : 'interval-out'} style={{ transition: 'cx .25s' }} />
    </svg>
    <Stepper lang={lang} label={`x = ${num(x)}`} onMinus={() => go(x - 0.5)} onPlus={() => go(x + 0.5)} minus={say(lang, 'Reculer x', 'Move x left', 'حرّك x يسارًا', 'Mover x a la izquierda')} plus={say(lang, 'Avancer x', 'Move x right', 'حرّك x يمينًا', 'Mover x a la derecha')} />
    <p className="manip-equation" aria-live="polite">{other
      ? `A : ${yes(lang, inA)} · B : ${yes(lang, inB)} · A ∩ B : ${yes(lang, inA && inB)} · A ∪ B : ${yes(lang, inA || inB)}`
      : center !== undefined ? `|${num(x)} − ${num(center)}| = ${num(Math.abs(x - center))} · ${say(lang, 'dans l’intervalle', 'in the interval', 'في المجال', 'en el intervalo')} : ${yes(lang, inA)}`
      : `${num(x)} ∈ ${closedA ? '[' : ']'}${num(a)} ; ${num(b)}${closedB ? ']' : '['} ? ${yes(lang, inA)}`}</p>
    {finished && <p className="manip-discovery" role="status">{other
      ? say(lang, 'A ∩ B : les deux à la fois (là où les traits se superposent). A ∪ B : l’un ou l’autre (tout ce qui est coloré).', 'A ∩ B: both at once (where the bars overlap). A ∪ B: either one (everything coloured).', 'A ∩ B: الاثنان معًا. A ∪ B: أحدهما.', 'A ∩ B: ambos. A ∪ B: uno u otro.')
      : center !== undefined ? say(lang, `Les nombres à distance au plus ${num((b - a) / 2)} de ${num(center)} forment l’intervalle [${num(a)} ; ${num(b)}].`, `Numbers within ${num((b - a) / 2)} of ${num(center)} make [${num(a)}, ${num(b)}].`, `المجال [${num(a)} ; ${num(b)}].`, `El intervalo [${num(a)} ; ${num(b)}].`)
      : say(lang, `${num(a)} ${closedA ? 'est' : 'n’est pas'} dedans, ${num(b)} ${closedB ? 'est' : 'n’est pas'} dedans : le crochet tourné vers le nombre l’inclut.`, `${num(a)} is ${closedA ? '' : 'not '}in, ${num(b)} is ${closedB ? '' : 'not '}in: a bracket facing the number includes it.`, 'القوس المتجه نحو العدد يشمله.', 'El corchete hacia el número lo incluye.')}</p>}
  </div>;
}

const FN_NAMES: Record<RefFn, string> = { square: 'x²', inverse: '1/x', sqrt: '√x', cube: 'x³', parabola: '(x − 1)² − 2', exp: 'eˣ', cubic: 'x³/3 − x', ln: 'ln x' };
/** Repère carré de −4 à 4 (et −4 à 6 en ordonnée) : coordonnées → pixels. */
const plotX = (v: number) => 100 + v * 20, plotY = (v: number) => 130 - v * 20;
function PlotFrame({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 200 220" className="manip-svg plot-svg" aria-hidden>
    {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={plotX(i - 4)} x2={plotX(i - 4)} y1={10} y2={210} className="svg-grid" />)}
    {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1={20} x2={180} y1={plotY(i - 4)} y2={plotY(i - 4)} className="svg-grid" />)}
    <line x1={20} x2={180} y1={plotY(0)} y2={plotY(0)} className="svg-tick" /><line x1={plotX(0)} x2={plotX(0)} y1={10} y2={210} className="svg-tick" />
    {children}
  </svg>;
}
function curvePath(fn: RefFn): string {
  const parts: string[] = [];
  let pen = false;
  for (let x = -4; x <= 4.001; x += 0.05) {
    const y = refValue(fn, Math.round(x * 100) / 100);
    if (y === null || y > 6.5 || y < -4.5 || (fn === 'inverse' && Math.abs(x) < 0.12)) { pen = false; continue; }
    parts.push(`${pen ? 'L' : 'M'} ${plotX(x).toFixed(1)} ${plotY(y).toFixed(1)}`); pen = true;
  }
  return parts.join(' ');
}

function CurveExplore({ fns, target, lang, onDone }: { fns: RefFn[]; target?: number | undefined; lang: Lang; onDone: Done }) {
  const [k, setK] = useState(0), [x, setX] = useState(fns[0] === 'sqrt' ? 0 : fns[0] === 'ln' ? 0.5 : -2);
  const [seenFns, setSeenFns] = useState<RefFn[]>([fns[0]!]);
  const [found, setFound] = useState<number[]>([]);
  const [walk, setWalk] = useState(0);
  const [finished, setFinished] = useState(false);
  const fn = fns[k]!, y = refValue(fn, x);
  const goal = target !== undefined ? [-1, 1].map(s => s * Math.sqrt(target)) : [];
  function finish() { if (!finished) { setFinished(true); onDone(fn); } }
  function move(v: number) {
    const nx = Math.max(-4, Math.min(4, Math.round(v * 2) / 2)); setX(nx);
    const w = walk + 1; setWalk(w);
    if (target !== undefined && refValue(fn, nx) === target && !found.includes(nx)) { const f = [...found, nx]; setFound(f); if (f.length === goal.length) finish(); }
    if (target === undefined && fns.length === 1 && w >= 8) finish();
  }
  function pick(i: number) { setK(i); const f = fns[i]!; if (f === 'sqrt' && x < 0) setX(0); if (f === 'inverse' && x === 0) setX(1); const all = seenFns.includes(f) ? seenFns : [...seenFns, f]; setSeenFns(all); if (all.length === fns.length && fns.length > 1) finish(); }
  return <div className="manip">
    {fns.length > 1 && <div className="manip-controls">{fns.map((f, i) => <Button key={f} variant={i === k ? 'default' : 'soft'} size="sm" onClick={() => pick(i)}>f(x) = {FN_NAMES[f]}</Button>)}</div>}
    <PlotFrame>
      {target !== undefined && <line x1={20} x2={180} y1={plotY(target)} y2={plotY(target)} className="svg-height" />}
      <path d={curvePath(fn)} className="svg-curve" />
      {found.map(v => <circle key={v} cx={plotX(v)} cy={plotY(target!)} r={5} className="interval-in" />)}
      {y !== null && refSlope(fn, x) !== null && y < 6 && <line x1={plotX(x - 1)} x2={plotX(x + 1)} y1={plotY(y - refSlope(fn, x)!)} y2={plotY(y + refSlope(fn, x)!)} className="svg-height" />}
      {y !== null && <><line x1={plotX(x)} x2={plotX(x)} y1={plotY(0)} y2={plotY(y)} className="svg-ghost" /><circle cx={plotX(x)} cy={plotY(y)} r={5} className="svg-dot-move" /></>}
    </PlotFrame>
    <Stepper lang={lang} label={y === null ? `x = ${num(x)} : ${say(lang, 'pas d’image', 'no image', 'لا صورة', 'sin imagen')}` : `f(${num(x)}) = ${num(Math.round(y * 100) / 100)}${refSlope(fn, x) !== null ? ` · ${say(lang, 'pente', 'slope', 'الميل', 'pendiente')} ${num(Math.round(refSlope(fn, x)! * 100) / 100)}` : ''}`} onMinus={() => move(x - 0.5)} onPlus={() => move(x + 0.5)} minus={say(lang, 'Reculer x', 'Move x left', 'حرّك x يسارًا', 'Mover x a la izquierda')} plus={say(lang, 'Avancer x', 'Move x right', 'حرّك x يمينًا', 'Mover x a la derecha')} />
    {target !== undefined && !finished && <p className="manip-feedback">{say(lang, `Trouve tous les x tels que f(x) = ${num(target)} (${found.length}/${goal.length}).`, `Find every x with f(x) = ${num(target)} (${found.length}/${goal.length}).`, `جد كل x بحيث f(x) = ${num(target)}.`, `Halla todos los x con f(x) = ${num(target)}.`)}</p>}
    {finished && <p className="manip-discovery" role="status">{target !== undefined
      ? say(lang, `${num(target)} a ${goal.length} antécédents : ${goal.map(num).join(' et ')}. Chaque x a une seule image, mais un nombre peut avoir plusieurs antécédents.`, `${num(target)} has ${goal.length} pre-images: ${goal.map(num).join(' and ')}. Each x has one image, but a number can have several pre-images.`, `لـ ${num(target)} سابقتان.`, `${num(target)} tiene ${goal.length} antecedentes.`)
      : fns.length > 1 ? say(lang, 'Carré : une parabole, décroissante puis croissante. Inverse : une hyperbole, décroissante sur chaque morceau. Racine : croissante, à partir de 0. Cube : toujours croissante.', 'Square: a parabola, down then up. Reciprocal: a hyperbola, decreasing on each branch. Root: increasing, from 0. Cube: always increasing.', 'المربع: شلجم. المقلوب: هذلول. الجذر والمكعب: تزايديتان.', 'Cuadrado: parábola. Inversa: hipérbola. Raíz y cubo: crecientes.')
      : fn === 'ln' ? say(lang, 'ln n’existe que pour x > 0, vaut 0 en x = 1 et croît de plus en plus lentement : en chaque point, la pente de la tangente vaut 1/x. (ln x)′ = 1/x.', 'ln only exists for x > 0, is 0 at x = 1 and grows more and more slowly: at each point the tangent slope is 1/x. (ln x)′ = 1/x.', '(ln x)′ = 1/x.', '(ln x)′ = 1/x.')
      : fn === 'cubic' ? say(lang, 'Quand la pente (f′) est positive, la courbe monte ; négative, elle descend. En x = −1 et x = 1, la tangente est horizontale (f′ = 0) : un maximum local puis un minimum local.', 'When the slope (f′) is positive the curve rises; negative, it falls. At x = −1 and x = 1 the tangent is horizontal (f′ = 0): a local max then a local min.', 'f′ > 0: تصعد؛ f′ < 0: تنزل؛ f′ = 0 عند −1 و 1.', 'f′ > 0: sube; f′ < 0: baja; f′ = 0 en −1 y 1.')
      : fn === 'exp' ? say(lang, 'eˣ est toujours positive et croissante, e⁰ = 1, et en chaque point la pente de la tangente vaut f(x) : (eˣ)′ = eˣ.', 'eˣ is always positive and increasing, e⁰ = 1, and at every point the slope of the tangent equals f(x): (eˣ)′ = eˣ.', 'eˣ موجبة وتزايدية و(eˣ)′ = eˣ.', 'eˣ es positiva y creciente, y (eˣ)′ = eˣ.')
      : say(lang, 'En avançant, la courbe descend puis remonte : f décroît jusqu’au point le plus bas (le minimum), puis croît. Le tableau de variations résume ce chemin.', 'Moving right, the curve goes down then up: f decreases to its lowest point (the minimum), then increases.', 'المنحنى ينزل ثم يصعد: القيمة الدنيا.', 'La curva baja y luego sube: el mínimo.')}</p>}
  </div>;
}

const sgn = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '0');
const affineText = (f: { a: number; b: number }) => `${f.a === 1 ? '' : f.a === -1 ? '−' : num(f.a)}x${f.b ? (f.b > 0 ? ` + ${num(f.b)}` : ` − ${num(-f.b)}`) : ''}`;
function SignExplore({ factors, quotient, lang, onDone }: { factors: { a: number; b: number }[]; quotient: boolean; lang: Lang; onDone: Done }) {
  const regions = signRegions(factors);
  const lo = Math.floor(regions[0]!) - 1, hi = Math.ceil(regions[regions.length - 1]!) + 1;
  const [x, setX] = useState(lo);
  const [seen, setSeen] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const roots = [...new Set(factors.map(f => -f.b / f.a))].sort((p, q) => p - q);
  const regionOf = (v: number) => roots.filter(r => v > r).length + roots.filter(r => v === r).length * 0.5;
  function go(v: number) {
    const nx = Math.max(lo, Math.min(hi, v)); setX(nx);
    const r = regionOf(nx);
    const all = seen.includes(r) ? seen : [...seen, r];
    setSeen(all);
    if (!finished && regions.every((_, i) => all.includes(i))) { setFinished(true); onDone('signs'); }
  }
  const values = factors.map(f => f.a * x + f.b);
  const forbidden = quotient && factors.length > 1 && values[1] === 0;
  const total = forbidden ? null : quotient && factors.length > 1 ? values[0]! / values[1]! : values.reduce((p, v) => p * v, 1);
  const name = quotient && factors.length > 1 ? `(${affineText(factors[0]!)}) / (${affineText(factors[1]!)})` : factors.map(f => (factors.length > 1 ? `(${affineText(f)})` : affineText(f))).join('');
  return <div className="manip">
    <table className="guess-table sign-table"><tbody>
      {factors.map((f, i) => <tr key={i}><th>{affineText(f)}</th><td>{sgn(values[i]!)}</td></tr>)}
      {factors.length > 1 && <tr className="sign-total"><th>{name}</th><td>{total === null ? '‖' : sgn(total)}</td></tr>}
    </tbody></table>
    <Stepper lang={lang} label={`x = ${num(x)}`} onMinus={() => go(x - 0.5)} onPlus={() => go(x + 0.5)} minus={say(lang, 'Reculer x', 'Move x left', 'حرّك x يسارًا', 'Mover x a la izquierda')} plus={say(lang, 'Avancer x', 'Move x right', 'حرّك x يمينًا', 'Mover x a la derecha')} />
    <p className="manip-feedback">{say(lang, `Zones explorées : ${seen.filter(r => Number.isInteger(r)).length}/${regions.length}`, `Zones explored: ${seen.filter(r => Number.isInteger(r)).length}/${regions.length}`, `المناطق: ${seen.filter(r => Number.isInteger(r)).length}/${regions.length}`, `Zonas: ${seen.filter(r => Number.isInteger(r)).length}/${regions.length}`)}</p>
    {finished && <p className="manip-discovery" role="status">{factors.length === 1
      ? say(lang, `ax + b change de signe en x = ${num(roots[0]!)} : à droite il a le signe de a (${factors[0]!.a > 0 ? '+' : '−'}), à gauche le signe contraire.`, `ax + b changes sign at x = ${num(roots[0]!)}: to the right it has the sign of a, to the left the opposite.`, `يغير إشارته في ${num(roots[0]!)}.`, `Cambia de signo en ${num(roots[0]!)}.`)
      : say(lang, `Le signe ne change qu’en ${roots.map(num).join(' et ')}. Dans chaque zone, on multiplie les signes des facteurs (règle des signes)${quotient ? ', et le quotient n’existe pas là où le dénominateur s’annule (‖)' : ''}.`, `The sign only changes at ${roots.map(num).join(' and ')}. In each zone, multiply the signs of the factors${quotient ? '; the quotient does not exist where the denominator is 0 (‖)' : ''}.`, `الإشارة تتغير فقط عند الجذور.`, `El signo solo cambia en las raíces.`)}</p>}
  </div>;
}

function LineBuild({ m: tm, p: tp, parallel, lang, onDone }: { m: number; p: number; parallel: boolean; lang: Lang; onDone: Done }) {
  const [m, setM] = useState(0), [p, setP] = useState(0);
  const [finished, setFinished] = useState(false);
  function set(nm: number, np: number) {
    const cm = Math.max(-3, Math.min(3, nm)), cp = Math.max(-4, Math.min(5, np)); setM(cm); setP(cp);
    if (!finished && (parallel ? cm === tm && cp !== tp : cm === tm && cp === tp)) { setFinished(true); onDone('line'); }
  }
  const seg = (mm: number, pp: number) => ({ x1: plotX(-4), y1: plotY(mm * -4 + pp), x2: plotX(4), y2: plotY(mm * 4 + pp) });
  return <div className="manip">
    <PlotFrame>
      <clipPath id="plot-clip"><rect x={20} y={10} width={160} height={200} /></clipPath>
      <g clipPath="url(#plot-clip)">
        <line {...seg(tm, tp)} className="svg-ghost" />
        {!parallel && <><circle cx={plotX(0)} cy={plotY(tp)} r={4} className="svg-dot" /><circle cx={plotX(2)} cy={plotY(2 * tm + tp)} r={4} className="svg-dot" /></>}
        <line {...seg(m, p)} className="svg-ray svg-ray-move" />
        <circle cx={plotX(0)} cy={plotY(p)} r={4} className="svg-dot-move" />
        <path d={`M ${plotX(0)} ${plotY(p)} H ${plotX(1)} V ${plotY(m + p)}`} className="svg-height" fill="none" />
      </g>
    </PlotFrame>
    <p className="manip-equation">y = {num(m)}x {p < 0 ? '−' : '+'} {num(Math.abs(p))}</p>
    <Stepper lang={lang} label={`m = ${num(m)}`} onMinus={() => set(m - 0.5, p)} onPlus={() => set(m + 0.5, p)} minus={say(lang, 'Diminuer m', 'Decrease m', 'نقّص m', 'Disminuir m')} plus={say(lang, 'Augmenter m', 'Increase m', 'زد m', 'Aumentar m')} />
    <Stepper lang={lang} label={`p = ${num(p)}`} onMinus={() => set(m, p - 1)} onPlus={() => set(m, p + 1)} minus={say(lang, 'Diminuer p', 'Decrease p', 'نقّص p', 'Disminuir p')} plus={say(lang, 'Augmenter p', 'Increase p', 'زد p', 'Aumentar p')} />
    {!finished && <p className="manip-feedback">{parallel ? say(lang, 'Trace une droite parallèle à la droite en pointillés (mais pas la même).', 'Draw a line parallel to the dashed one (but not the same).', 'ارسم مستقيمًا موازيًا.', 'Traza una paralela.') : say(lang, 'Superpose ta droite à la droite en pointillés.', 'Lay your line on the dashed one.', 'طابق مستقيمك مع المنقط.', 'Superpón tu recta a la punteada.')}</p>}
    {finished && <p className="manip-discovery" role="status">{parallel
      ? say(lang, `Même coefficient directeur m = ${num(tm)}, ordonnées à l’origine différentes : les droites sont parallèles.`, `Same gradient m = ${num(tm)}, different intercepts: the lines are parallel.`, 'نفس المعامل الموجه: متوازيان.', 'Misma pendiente: paralelas.')
      : say(lang, `p = ${num(tp)} : la droite coupe l’axe vertical en ${num(tp)}. m = ${num(tm)} : quand x avance de 1, y ${tm >= 0 ? 'monte' : 'descend'} de ${num(Math.abs(tm))} (l’escalier orange).`, `p = ${num(tp)}: the line crosses the vertical axis at ${num(tp)}. m = ${num(tm)}: when x goes up by 1, y changes by ${num(tm)} (the orange step).`, `p نقطة التقاطع مع المحور، m الصعود لكل 1.`, `p: corte con el eje; m: subida por cada 1.`)}</p>}
  </div>;
}

function Quartiles({ values, lang, onDone }: { values: number[]; lang: Lang; onDone: Done }) {
  const [stage, setStage] = useState(0);
  const sorted = [...values].sort((a, b) => a - b), f = fiveNumbers(values), n = values.length;
  const list = stage ? sorted : values;
  const r1 = Math.ceil(n / 4) - 1, r3 = Math.ceil((3 * n) / 4) - 1;
  function next() { const s = stage + 1; setStage(s); if (s === 3) onDone(`${f.q1}-${f.q3}`); }
  const lo = f.min - 1, hi = f.max + 1, X = (v: number) => 10 + ((v - lo) / (hi - lo)) * 280;
  return <div className="manip">
    <div className="lineup">{list.map((v, i) => <span key={i} className={`lineup-card ${stage >= 2 && (i === r1 || i === r3) ? 'lineup-mark' : ''}`}>{num(v)}</span>)}</div>
    {stage >= 2 && <p className="manip-equation">Q1 = {num(f.q1)} · Me = {num(f.me)} · Q3 = {num(f.q3)}</p>}
    {stage >= 3 && <svg viewBox="0 0 300 50" className="manip-svg" aria-hidden>
      <line x1={X(f.min)} x2={X(f.q1)} y1={25} y2={25} className="svg-ray" /><line x1={X(f.q3)} x2={X(f.max)} y1={25} y2={25} className="svg-ray" />
      <rect x={X(f.q1)} y={10} width={X(f.q3) - X(f.q1)} height={30} className="svg-shape" /><line x1={X(f.me)} x2={X(f.me)} y1={10} y2={40} className="svg-ray svg-ray-move" />
      {[f.min, f.q1, f.me, f.q3, f.max].map((v, i) => <text key={i} x={X(v) - 5} y={50} className="svg-small">{num(v)}</text>)}
    </svg>}
    {stage < 3 && <Button variant="soft" onClick={next}>{[say(lang, 'Ranger la série', 'Sort the data', 'رتّب السلسلة', 'Ordenar'), say(lang, 'Couper en quatre', 'Cut into quarters', 'اقسم إلى أرباع', 'Cortar en cuartos'), say(lang, 'Dessiner la boîte', 'Draw the box', 'ارسم العلبة', 'Dibujar la caja')][stage]}</Button>}
    {stage === 1 && <p className="manip-feedback">{say(lang, `${n} valeurs : un quart, c’est ${num(n / 4)} valeurs.`, `${n} values: a quarter is ${num(n / 4)} values.`, `${n} قيمة: الربع ${num(n / 4)}.`, `${n} valores: un cuarto son ${num(n / 4)}.`)}</p>}
    {stage >= 3 && <p className="manip-discovery" role="status">{say(lang, `Au moins un quart des valeurs sont ≤ Q1 = ${num(f.q1)} (rang ${r1 + 1}), au moins trois quarts sont ≤ Q3 = ${num(f.q3)} (rang ${r3 + 1}). La boîte contient la moitié centrale de la série : Q3 − Q1 = ${num(f.q3 - f.q1)}.`, `At least a quarter of the values are ≤ Q1 = ${num(f.q1)} (rank ${r1 + 1}), at least three quarters ≤ Q3 = ${num(f.q3)} (rank ${r3 + 1}). The box holds the middle half: Q3 − Q1 = ${num(f.q3 - f.q1)}.`, `العلبة تحوي النصف المركزي: Q3 − Q1 = ${num(f.q3 - f.q1)}.`, `La caja contiene la mitad central: Q3 − Q1 = ${num(f.q3 - f.q1)}.`)}</p>}
  </div>;
}

function DiceGrid({ sum, lang, onDone }: { sum: number; lang: Lang; onDone: Done }) {
  const ways = diceWays(sum);
  const [on, setOn] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const done = on.length === ways.length;
  function tap(a: number, b: number) {
    if (done) return;
    const key = `${a}-${b}`;
    if (a + b !== sum) { setWrong(true); return; }
    setWrong(false);
    if (on.includes(key)) return;
    const next = [...on, key]; setOn(next); if (next.length === ways.length) onDone(String(ways.length));
  }
  return <div className="manip">
    <div className="dice-grid" role="grid">
      <span />{[1, 2, 3, 4, 5, 6].map(b => <span key={b} className="dice-head">{b}</span>)}
      {[1, 2, 3, 4, 5, 6].map(a => <div key={a} className="dice-row" role="row"><span className="dice-head">{a}</span>{[1, 2, 3, 4, 5, 6].map(b => <button key={b} type="button" className={`dice-cell ${on.includes(`${a}-${b}`) ? 'dice-on' : ''}`} onClick={() => tap(a, b)} aria-label={`${a} + ${b}`}>{on.includes(`${a}-${b}`) ? a + b : ''}</button>)}</div>)}
    </div>
    <p className="manip-feedback">{say(lang, `Touche les cases dont la somme vaut ${sum} (${on.length} trouvée${on.length > 1 ? 's' : ''}).`, `Tap the cells adding up to ${sum} (${on.length} found).`, `المس الخانات التي مجموعها ${sum}.`, `Toca las casillas que suman ${sum}.`)}</p>
    {wrong && <p className="manip-feedback manip-bad" role="alert">{say(lang, `Cette case ne fait pas ${sum}.`, `That cell is not ${sum}.`, `هذه الخانة لا تساوي ${sum}.`, `Esa casilla no suma ${sum}.`)}</p>}
    {done && <p className="manip-discovery" role="status">{say(lang, `${ways.length} cases sur 36, toutes aussi probables : P(somme = ${sum}) = ${ways.length}/36.`, `${ways.length} cells out of 36, all equally likely: P(sum = ${sum}) = ${ways.length}/36.`, `${ways.length} من 36: الاحتمال ${ways.length}/36.`, `${ways.length} de 36: P = ${ways.length}/36.`)}</p>}
  </div>;
}

function Venn({ a, b, both, total, labels, lang, onDone }: { a: number; b: number; both: number; total: number; labels: [L, L]; lang: Lang; onDone: Done }) {
  const [stage, setStage] = useState(0);
  const count = stage === 0 ? 0 : stage === 1 ? a : stage === 2 ? a + b : a + b - both;
  function next() { const s = stage + 1; setStage(s); if (s === 3) onDone(String(a + b - both)); }
  return <div className="manip">
    <svg viewBox="0 0 220 120" className="manip-svg" aria-hidden>
      <rect x={4} y={4} width={212} height={112} rx={10} className="svg-ghost" />
      <circle cx={85} cy={62} r={44} className={`venn-a ${stage >= 1 ? 'venn-on' : ''}`} />
      <circle cx={135} cy={62} r={44} className={`venn-b ${stage >= 2 ? 'venn-on' : ''}`} />
      <text x={56} y={66} className="svg-label">{a - both}</text><text x={104} y={66} className={`svg-label ${stage === 2 ? 'venn-twice' : ''}`}>{both}</text><text x={154} y={66} className="svg-label">{b - both}</text>
      <text x={40} y={22} className="svg-small">{labels[0][lang]}</text><text x={140} y={22} className="svg-small">{labels[1][lang]}</text>
      <text x={190} y={110} className="svg-small">{total}</text>
    </svg>
    <p className="manip-equation">{[`0`, `${a}`, `${a} + ${b} = ${a + b}`, `${a} + ${b} − ${both} = ${a + b - both}`][stage]}</p>
    {stage < 3 && <Button variant="soft" onClick={next}>{[say(lang, `Compter A (${a})`, `Count A (${a})`, `عدّ A`, `Contar A`), say(lang, `Ajouter B (${b})`, `Add B (${b})`, `أضف B`, `Sumar B`), say(lang, `Retirer A ∩ B (${both})`, `Remove A ∩ B (${both})`, `اطرح A ∩ B`, `Restar A ∩ B`)][stage]}</Button>}
    {stage === 2 && <p className="manip-feedback">{say(lang, `Les ${both} du milieu ont été comptés deux fois !`, `The ${both} in the middle were counted twice!`, `الوسط عُدّ مرتين!`, `¡El centro se contó dos veces!`)}</p>}
    {stage === 3 && <p className="manip-discovery" role="status">{say(lang, `A ∪ B compte ${count} éléments sur ${total}. En probabilités : P(A ∪ B) = P(A) + P(B) − P(A ∩ B).`, `A ∪ B has ${count} of ${total}. In probability: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).`, `P(A ∪ B) = P(A) + P(B) − P(A ∩ B).`, `P(A ∪ B) = P(A) + P(B) − P(A ∩ B).`)}</p>}
  </div>;
}

const RAD: Record<number, string> = { 0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π', 210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2', 300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π' };
function UnitCircle({ target, step, quadrants, cosLevel, lang, onDone }: { target: number; step: number; quadrants: boolean; cosLevel?: number | undefined; lang: Lang; onDone: Done }) {
  const [deg, setDeg] = useState(0);
  const goal = cosLevel === undefined ? [] : anglesWithCos(cosLevel, step);
  const [hits, setHits] = useState<number[]>([]);
  const [seen, setSeen] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const c = Math.round(Math.cos(rad(deg)) * 1000) / 1000, s = Math.round(Math.sin(rad(deg)) * 1000) / 1000;
  function go(v: number) {
    const d = ((v % 360) + 360) % 360; setDeg(d);
    const q = d % 90 === 0 ? -1 : Math.floor(d / 90);
    const all = q < 0 || seen.includes(q) ? seen : [...seen, q];
    setSeen(all);
    if (cosLevel !== undefined) {
      const h = goal.includes(d) && !hits.includes(d) ? [...hits, d] : hits; setHits(h);
      if (!finished && h.length === goal.length) { setFinished(true); onDone(String(d)); }
      return;
    }
    if (!finished && (quadrants ? all.length === 4 : d === target)) { setFinished(true); onDone(String(d)); }
  }
  const R = 70, cx = 100, cy = 90, X = cx + R * c, Y = cy - R * s;
  return <div className="manip">
    <svg viewBox="0 0 200 180" className="manip-svg" aria-hidden>
      <line x1={15} x2={185} y1={cy} y2={cy} className="svg-tick" /><line x1={cx} x2={cx} y1={8} y2={172} className="svg-tick" />
      <circle cx={cx} cy={cy} r={R} className="svg-ghost" />
      {cosLevel !== undefined && <line x1={cx + R * cosLevel} x2={cx + R * cosLevel} y1={10} y2={170} className="svg-height" />}
      {hits.map(h => <circle key={h} cx={cx + R * Math.cos(rad(h))} cy={cy - R * Math.sin(rad(h))} r={5} className="interval-in" />)}
      <line x1={cx} y1={cy} x2={X} y2={Y} className="svg-ray" />
      <line x1={X} y1={Y} x2={X} y2={cy} className="uc-sin" /><line x1={cx} y1={cy} x2={X} y2={cy} className="uc-cos" />
      {deg > 0 && <path d={`M ${cx + 20} ${cy} A 20 20 0 ${deg > 180 ? 1 : 0} 0 ${cx + 20 * c} ${cy - 20 * s}`} className="svg-arc" />}
      <circle cx={X} cy={Y} r={5} className="svg-dot-move" /><text x={X + 6} y={Y - 6} className="svg-label">M</text>
    </svg>
    <Stepper lang={lang} label={`${deg}° = ${RAD[deg] ?? `${num(Math.round(rad(deg) * 100) / 100)} rad`}`} onMinus={() => go(deg - step)} onPlus={() => go(deg + step)} minus={say(lang, 'Tourner en arrière', 'Turn back', 'أدر للخلف', 'Girar atrás')} plus={say(lang, 'Tourner (sens direct)', 'Turn anticlockwise', 'أدر في الاتجاه المباشر', 'Girar en sentido directo')} />
    <p className="manip-equation"><span className="uc-cos-text">cos = {num(c)}</span> · <span className="uc-sin-text">sin = {num(s)}</span></p>
    <p className="manip-feedback">cos² + sin² = {num(Math.round((c * c + s * s) * 1000) / 1000)}{cosLevel !== undefined && !finished ? ` · ${say(lang, `Trouve les angles où cos = ${num(cosLevel)}`, `Find the angles where cos = ${num(cosLevel)}`, `جد الزوايا حيث cos = ${num(cosLevel)}`, `Halla los ángulos con cos = ${num(cosLevel)}`)} (${hits.length}/${goal.length})` : ''}{cosLevel === undefined && !quadrants && !finished ? ` · ${say(lang, 'Cible', 'Target', 'الهدف', 'Meta')} : ${target}°` : ''}{quadrants && !finished ? ` · ${say(lang, 'Quarts visités', 'Quarters visited', 'الأرباع', 'Cuadrantes')} : ${seen.length}/4` : ''}</p>
    {finished && <p className="manip-discovery" role="status">{cosLevel !== undefined
      ? say(lang, `La droite x = ${num(cosLevel)} coupe le cercle en deux points : ${goal.map(g => RAD[g] ?? `${g}°`).join(' et ')}, symétriques par rapport à l’axe horizontal. Sur ]−π ; π], cela s’écrit x = ±${RAD[goal[0]!] ?? `${goal[0]}°`}.`, `The line x = ${num(cosLevel)} cuts the circle twice: ${goal.map(g => RAD[g] ?? `${g}°`).join(' and ')}, mirror images in the horizontal axis. On (−π, π], x = ±${RAD[goal[0]!] ?? `${goal[0]}°`}.`, `نقطتان متماثلتان: x = ±${RAD[goal[0]!] ?? goal[0]}.`, `Dos puntos simétricos: x = ±${RAD[goal[0]!] ?? goal[0]}.`)
      : quadrants
      ? say(lang, 'cos est l’abscisse de M : positif à droite, négatif à gauche. sin est l’ordonnée : positif en haut, négatif en bas. Et toujours cos² + sin² = 1.', 'cos is the x-coordinate of M: positive on the right, negative on the left. sin is the y-coordinate: positive above, negative below. Always cos² + sin² = 1.', 'cos هو الأفصول وsin هو الأرتوب.', 'cos es la abscisa, sen la ordenada.')
      : say(lang, `${target}° = ${RAD[target]} rad : M a pour coordonnées (cos ; sin) = (${num(c)} ; ${num(s)}). Le rayon vaut 1, donc cos² + sin² = 1 (Pythagore).`, `${target}° = ${RAD[target]} rad: M is at (cos, sin) = (${num(c)}, ${num(s)}). The radius is 1, so cos² + sin² = 1 (Pythagoras).`, `M(cos ; sin) و cos² + sin² = 1.`, `M(cos ; sen) y cos² + sen² = 1.`)}</p>}
  </div>;
}

// ───────────── 1ère : parabole et discriminant, produit scalaire ─────────────

function Parabola({ b, c: c0, lang, onDone }: { b: number; c: number; lang: Lang; onDone: Done }) {
  const [c, setC] = useState(c0);
  const [seen, setSeen] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const d = b * b - 4 * c, n = rootCount(b, c);
  function go(v: number) {
    const nc = Math.max(-6, Math.min(8, v)); setC(nc);
    const k = rootCount(b, nc), all = seen.includes(k) ? seen : [...seen, k];
    setSeen(all);
    if (!finished && all.length === 3) { setFinished(true); onDone('delta'); }
  }
  const path = Array.from({ length: 81 }, (_, i) => { const x = -4 + i * 0.1, y = x * x + b * x + c; return y > 6.5 || y < -4.5 ? null : `${plotX(x).toFixed(1)} ${plotY(y).toFixed(1)}`; })
    .reduce<string>((acc, p, i, arr) => (p === null ? acc : `${acc} ${i === 0 || arr[i - 1] === null ? 'M' : 'L'} ${p}`), '');
  const roots = d < 0 ? [] : [...new Set([(-b - Math.sqrt(d)) / 2, (-b + Math.sqrt(d)) / 2])];
  return <div className="manip">
    <PlotFrame>
      <path d={path} className="svg-curve" />
      {roots.map(r => <circle key={r} cx={plotX(r)} cy={plotY(0)} r={5} className="interval-in" />)}
    </PlotFrame>
    <p className="manip-equation">y = {`x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x ${c < 0 ? '−' : '+'} ${Math.abs(c)}`.replace(' + 1x', ' + x').replace(' − 1x', ' − x')}</p>
    <Stepper lang={lang} label={`c = ${num(c)}`} onMinus={() => go(c - 1)} onPlus={() => go(c + 1)} minus={say(lang, 'Descendre la parabole', 'Move the parabola down', 'أنزل الشلجم', 'Bajar la parábola')} plus={say(lang, 'Monter la parabole', 'Move the parabola up', 'ارفع الشلجم', 'Subir la parábola')} />
    <p className="manip-feedback" aria-live="polite">Δ = {num(b * b)} − 4 × {num(c)} = {num(d)} · {say(lang, `${n} point${n > 1 ? 's' : ''} sur l’axe`, `${n} point${n === 1 ? '' : 's'} on the axis`, `${n} نقط على المحور`, `${n} puntos en el eje`)}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, 'Δ > 0 : la parabole coupe l’axe en deux points (deux solutions). Δ = 0 : elle le touche en un seul point. Δ < 0 : elle reste au-dessus, aucune solution.', 'Δ > 0: the parabola cuts the axis twice (two solutions). Δ = 0: it touches it once. Δ < 0: it stays above, no solution.', 'Δ > 0: حلان. Δ = 0: حل واحد. Δ < 0: لا حل.', 'Δ > 0: dos soluciones. Δ = 0: una. Δ < 0: ninguna.')}</p>}
  </div>;
}

function DotRotate({ u, v, lang, onDone }: { u: number; v: number; lang: Lang; onDone: Done }) {
  const [deg, setDeg] = useState(30);
  const [seen, setSeen] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const cos = Math.round(Math.cos(rad(deg)) * 1000) / 1000, dot = Math.round(u * v * cos * 100) / 100;
  function go(nd: number) {
    const d = Math.max(0, Math.min(180, nd)); setDeg(d);
    const k = d < 90 ? 'acute' : d === 90 ? 'right' : 'obtuse', all = seen.includes(k) ? seen : [...seen, k];
    setSeen(all);
    if (!finished && all.length === 3) { setFinished(true); onDone('dot'); }
  }
  const S = 18, O = { x: 100, y: 110 }, V = { x: O.x + v * S * Math.cos(rad(deg)), y: O.y - v * S * Math.sin(rad(deg)) };
  return <div className="manip">
    <svg viewBox="0 0 200 130" className="manip-svg" aria-hidden>
      <line x1={O.x} y1={O.y} x2={O.x + u * S} y2={O.y} className="svg-ray" /><text x={O.x + u * S - 6} y={O.y + 14} className="svg-label">u</text>
      <line x1={V.x} y1={V.y} x2={V.x} y2={O.y} className="svg-ghost" />
      <line x1={O.x} y1={O.y} x2={O.x + v * S * cos} y2={O.y} className="uc-cos" />
      <line x1={O.x} y1={O.y} x2={V.x} y2={V.y} className="svg-ray svg-ray-move" /><text x={V.x + 4} y={V.y - 4} className="svg-label">v</text>
      <path d={`M ${O.x + 18} ${O.y} A 18 18 0 0 0 ${O.x + 18 * Math.cos(rad(deg))} ${O.y - 18 * Math.sin(rad(deg))}`} className="svg-arc" />
    </svg>
    <Stepper lang={lang} label={`θ = ${deg}°`} onMinus={() => go(deg - 15)} onPlus={() => go(deg + 15)} minus={say(lang, 'Fermer l’angle', 'Close the angle', 'أغلق الزاوية', 'Cerrar el ángulo')} plus={say(lang, 'Ouvrir l’angle', 'Open the angle', 'افتح الزاوية', 'Abrir el ángulo')} />
    <p className="manip-equation">u · v = {u} × {v} × cos {deg}° = {num(dot)}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, 'Angle aigu : u · v > 0. Angle droit : u · v = 0 (orthogonaux). Angle obtus : u · v < 0. Le trait bleu est la projection de v sur u : u · v = ‖u‖ × (projection signée).', 'Acute: u · v > 0. Right angle: u · v = 0 (orthogonal). Obtuse: u · v < 0. The blue segment is v projected onto u.', 'حادة: موجب. قائمة: منعدم. منفرجة: سالب.', 'Agudo: positivo. Recto: nulo. Obtuso: negativo.')}</p>}
  </div>;
}

// ───────────── Lycée : sécante, arbre pondéré, planche de Galton ─────────────

const SECANT_H = [2, 1, 0.5, 0.1, 0.01];
function Secant({ a, lang, onDone }: { a: number; lang: Lang; onDone: Done }) {
  const [i, setI] = useState(0);
  const h = SECANT_H[i]!, m = secantSlope(a, h), fa = secantFn(a);
  const path = Array.from({ length: 81 }, (_, k) => { const x = -4 + k * 0.1, y = secantFn(x); return y > 6.5 ? null : `${plotX(x).toFixed(1)} ${plotY(y).toFixed(1)}`; })
    .reduce<string>((acc, p, k, arr) => (p === null ? acc : `${acc} ${k === 0 || arr[k - 1] === null ? 'M' : 'L'} ${p}`), '');
  const done = i === SECANT_H.length - 1;
  function closer() { if (done) return; const n = i + 1; setI(n); if (n === SECANT_H.length - 1) onDone(String(a - 2)); }
  return <div className="manip">
    <PlotFrame>
      <path d={path} className="svg-curve" />
      <clipPath id="sec-clip"><rect x={20} y={10} width={160} height={200} /></clipPath>
      <line clipPath="url(#sec-clip)" x1={plotX(a - 4)} x2={plotX(a + 4)} y1={plotY(fa - 4 * m)} y2={plotY(fa + 4 * m)} className="svg-ray svg-ray-move" />
      <circle cx={plotX(a)} cy={plotY(fa)} r={5} className="svg-dot" /><text x={plotX(a) - 14} y={plotY(fa) + 4} className="svg-label">A</text>
      <circle cx={plotX(a + h)} cy={plotY(secantFn(a + h))} r={5} className="svg-dot-move" /><text x={plotX(a + h) + 6} y={plotY(secantFn(a + h)) - 4} className="svg-label">M</text>
    </PlotFrame>
    <p className="manip-equation">h = {num(h)} · {say(lang, 'pente', 'slope', 'الميل', 'pendiente')} = {num(Math.round(m * 1000) / 1000)}</p>
    {!done && <Button variant="soft" onClick={closer}>{say(lang, 'Rapprocher M de A', 'Move M closer to A', 'قرّب M من A', 'Acercar M a A')}</Button>}
    {done && <p className="manip-discovery" role="status">{say(lang, `Quand M se rapproche de A, la sécante devient la tangente et sa pente tend vers ${num(a - 2)} : c’est le nombre dérivé f′(${num(a)}). Ici f′(x) = x − 2.`, `As M gets closer to A, the secant becomes the tangent and its slope tends to ${num(a - 2)}: the derivative f′(${num(a)}). Here f′(x) = x − 2.`, `الميل يقترب من ${num(a - 2)} = f′(${num(a)}).`, `La pendiente tiende a ${num(a - 2)} = f′(${num(a)}).`)}</p>}
  </div>;
}

function Tree({ pa, pba, pbna, lang, onDone }: { pa: number; pba: number; pbna: number; lang: Lang; onDone: Done }) {
  const r = (v: number) => Math.round(v * 10000) / 10000;
  const leaves = [
    { path: 'A → B', p: r(pa * pba), parts: [pa, pba] }, { path: 'A → B̄', p: r(pa * (1 - pba)), parts: [pa, r(1 - pba)] },
    { path: 'Ā → B', p: r((1 - pa) * pbna), parts: [r(1 - pa), pbna] }, { path: 'Ā → B̄', p: r((1 - pa) * (1 - pbna)), parts: [r(1 - pa), r(1 - pbna)] },
  ];
  const [on, setOn] = useState<number[]>([]);
  function tap(k: number) { if (on.includes(k)) return; const next = [...on, k]; setOn(next); if (next.length === 4) onDone(String(leaves[0]!.p + leaves[2]!.p)); }
  const pb = r(leaves[0]!.p + leaves[2]!.p);
  const Y = [20, 55, 95, 130];
  return <div className="manip">
    <svg viewBox="0 0 220 150" className="manip-svg" aria-hidden>
      <line x1={10} y1={75} x2={80} y2={37} className="svg-tick" /><line x1={10} y1={75} x2={80} y2={113} className="svg-tick" />
      <text x={30} y={46} className="svg-small">{num(pa)}</text><text x={30} y={112} className="svg-small">{num(r(1 - pa))}</text>
      <text x={84} y={41} className="svg-label">A</text><text x={84} y={117} className="svg-label">Ā</text>
      {Y.map((y, k) => <g key={k}><line x1={98} y1={k < 2 ? 37 : 113} x2={160} y2={y} className={on.includes(k) ? 'svg-ray svg-ray-move' : 'svg-tick'} />
        <text x={120} y={(y + (k < 2 ? 37 : 113)) / 2 - 2} className="svg-small">{num(leaves[k]!.parts[1]!)}</text>
        <text x={164} y={y + 4} className="svg-label">{k % 2 ? 'B̄' : 'B'}</text></g>)}
    </svg>
    <div className="manip-controls">{leaves.map((l, k) => <Button key={k} variant={on.includes(k) ? 'default' : 'soft'} size="sm" onClick={() => tap(k)}>{l.path}</Button>)}</div>
    <p className="manip-equation">{on.length ? on.map(k => `${num(leaves[k]!.parts[0]!)} × ${num(leaves[k]!.parts[1]!)} = ${num(leaves[k]!.p)}`).join(' · ') : say(lang, 'Touche un chemin', 'Tap a path', 'المس مسارًا', 'Toca un camino')}</p>
    {on.length === 4 && <p className="manip-discovery" role="status">{say(lang, `Les quatre chemins font 1 en tout. P(B) = ${num(leaves[0]!.p)} + ${num(leaves[2]!.p)} = ${num(pb)} (probabilités totales) : on additionne les chemins qui mènent à B.`, `The four paths add up to 1. P(B) = ${num(leaves[0]!.p)} + ${num(leaves[2]!.p)} = ${num(pb)} (total probability): add the paths that lead to B.`, `P(B) = ${num(pb)}.`, `P(B) = ${num(pb)}.`)}</p>}
  </div>;
}

function Galton({ n, p, lang, onDone }: { n: number; p: number; lang: Lang; onDone: Done }) {
  const [counts, setCounts] = useState<number[]>(Array.from({ length: n + 1 }, () => 0));
  const total = counts.reduce((a, b) => a + b, 0);
  const [finished, setFinished] = useState(false);
  function drop(k: number) {
    const rights = simulate([1 - p, p], k * n, total * n + 7);
    const next = [...counts];
    for (let b = 0; b < k; b++) next[rights.slice(b * n, b * n + n).filter(r => r === 1).length]! += 1;
    setCounts(next);
    if (!finished && total + k >= 200) { setFinished(true); onDone('galton'); }
  }
  const top = Math.max(1, ...counts.map(c => c / Math.max(1, total)), ...counts.map((_, k) => binomialP(n, p, k)));
  const mean = total ? counts.reduce((a, c, k) => a + c * k, 0) / total : 0;
  return <div className="manip">
    <div className="tally-bars">{counts.map((c, k) => <div key={k} className="tally-col"><span className="tally-count">{c}</span>
      <span className="tally-bar" style={{ height: `${((total ? c / total : 0) / top) * 100}%` }} />
      <span className="galton-theory" style={{ bottom: `calc(${(binomialP(n, p, k) / top) * 100}% * .8 + 1.6rem)` }} />
      <span className="tally-label">X = {k}</span></div>)}</div>
    <div className="manip-controls">{[1, 10, 100].map(k => <Button key={k} variant="soft" size="sm" onClick={() => drop(k)}>{say(lang, `+${k} bille${k > 1 ? 's' : ''}`, `+${k} ball${k > 1 ? 's' : ''}`, `+${k}`, `+${k}`)}</Button>)}</div>
    <p className="manip-equation">{say(lang, `${total} billes · moyenne ${num(Math.round(mean * 100) / 100)}`, `${total} balls · mean ${Math.round(mean * 100) / 100}`, `${total} كرة · المتوسط ${num(Math.round(mean * 100) / 100)}`, `${total} bolas · media ${num(Math.round(mean * 100) / 100)}`)}</p>
    {finished && <p className="manip-discovery" role="status">{say(lang, `Chaque bille fait ${n} rebonds indépendants, à droite avec la probabilité ${num(p)} : X (le nombre de rebonds à droite) suit la loi B(${n} ; ${num(p)}). L’histogramme épouse les traits (les probabilités théoriques) et la moyenne se rapproche de E(X) = n × p = ${num(n * p)}.`, `Each ball makes ${n} independent bounces, right with probability ${p}: X follows B(${n}, ${p}). The histogram matches the marks (theoretical probabilities) and the mean approaches E(X) = np = ${n * p}.`, `X ~ B(${n} ; ${num(p)}) و E(X) = ${num(n * p)}.`, `X ~ B(${n} ; ${num(p)}), E(X) = ${num(n * p)}.`)}</p>}
  </div>;
}

// ───────────── Limites : tableau de valeurs, dichotomie ─────────────

function LimitTable({ a, b, c, toward, lang, onDone }: { a: number; b: number; c: number; toward: 'infinity' | 'right'; lang: Lang; onDone: Done }) {
  const xs = limitXs(c, toward);
  const [n, setN] = useState(1);
  const fmt = (v: number) => (Math.abs(v) >= 1e4 ? num(Math.round(v)) : num(Math.round(v * 10000) / 10000));
  function more() { if (n >= xs.length) return; const k = n + 1; setN(k); if (k === xs.length) onDone(toward); }
  const f = `(${a === 1 ? '' : a === -1 ? '−' : num(a)}x ${b < 0 ? '−' : '+'} ${num(Math.abs(b))}) / (x ${c < 0 ? '+' : '−'} ${num(Math.abs(c))})`;
  return <div className="manip">
    <p className="manip-equation">f(x) = {f}</p>
    <table className="guess-table"><thead><tr><th>x</th><th>f(x)</th></tr></thead><tbody>
      {xs.slice(0, n).map(x => <tr key={x}><td>{fmt(x)}</td><td>{fmt(limitF(a, b, c, x))}</td></tr>)}
    </tbody></table>
    {n < xs.length && <Button variant="soft" onClick={more}>{toward === 'infinity' ? say(lang, 'x × 10', 'x × 10', 'x × 10', 'x × 10') : say(lang, `Rapprocher x de ${num(c)}`, `Move x closer to ${num(c)}`, `قرّب x من ${num(c)}`, `Acercar x a ${num(c)}`)}</Button>}
    {n === xs.length && <p className="manip-discovery" role="status">{toward === 'infinity'
      ? say(lang, `Plus x est grand, plus f(x) se rapproche de ${num(a)} : lim f = ${num(a)} en +∞. La droite y = ${num(a)} est une asymptote horizontale.`, `The bigger x, the closer f(x) gets to ${num(a)}: lim f = ${num(a)} at +∞. y = ${num(a)} is a horizontal asymptote.`, `lim f = ${num(a)}: مقارب أفقي y = ${num(a)}.`, `lim f = ${num(a)}: asíntota y = ${num(a)}.`)
      : say(lang, `Le dénominateur devient minuscule (et positif) : f(x) explose. lim f = ${a * c + b > 0 ? '+∞' : '−∞'} quand x → ${num(c)}⁺ ; la droite x = ${num(c)} est une asymptote verticale.`, `The denominator becomes tiny (and positive): f(x) blows up. lim f = ${a * c + b > 0 ? '+∞' : '−∞'} as x → ${num(c)}⁺; x = ${num(c)} is a vertical asymptote.`, `مقارب عمودي x = ${num(c)}.`, `Asíntota vertical x = ${num(c)}.`)}</p>}
  </div>;
}

function Bisection({ steps, lang, onDone }: { steps: number; lang: Lang; onDone: Done }) {
  const [range, setRange] = useState<[number, number]>([0, 1]);
  const [k, setK] = useState(0);
  const [lo, hi] = range, m = (lo + hi) / 2;
  function cut() { if (k >= steps) return; setRange(bisectStep(lo, hi)); const n = k + 1; setK(n); if (n === steps) onDone(String(m)); }
  const W = 280, X = (v: number) => 10 + v * W;
  const sg = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '0');
  return <div className="manip">
    <p className="manip-equation">g(x) = x³ + x − 1</p>
    <svg viewBox="0 0 300 50" className="manip-svg" aria-hidden>
      <line x1={X(0)} x2={X(1)} y1={25} y2={25} className="svg-tick" />
      <line x1={X(lo)} x2={X(hi)} y1={25} y2={25} className="interval-a" />
      <text x={X(0) - 4} y={45} className="svg-small">0</text><text x={X(1) - 4} y={45} className="svg-small">1</text>
      <circle cx={X(m)} cy={25} r={4} className="svg-dot-move" />
    </svg>
    <p className="manip-feedback">[{num(lo)} ; {num(hi)}] · g({num(lo)}) {sg(bisectG(lo))} · g({num(m)}) {sg(bisectG(m))} · g({num(hi)}) {sg(bisectG(hi))}</p>
    {k < steps && <Button variant="soft" onClick={cut}>{say(lang, 'Couper en deux', 'Cut in half', 'اقسم إلى نصفين', 'Cortar por la mitad')}</Button>}
    {k === steps && <p className="manip-discovery" role="status">{say(lang, `On garde toujours la moitié où g change de signe : après ${steps} coupes, la solution est dans [${num(lo)} ; ${num(hi)}], un intervalle de longueur ${num(hi - lo)}. g étant continue et strictement croissante, la solution est unique.`, `Always keep the half where g changes sign: after ${steps} cuts the solution is in [${num(lo)}, ${num(hi)}], of length ${num(hi - lo)}. g is continuous and strictly increasing, so the solution is unique.`, `الحل في [${num(lo)} ; ${num(hi)}].`, `La solución está en [${num(lo)} ; ${num(hi)}].`)}</p>}
  </div>;
}

// ───────────── Terminale ─────────────

function LogRuler({ base, steps, lang, onDone }: { base: number; steps: number; lang: Lang; onDone: Done }) {
  const [k, setK] = useState(0);
  const x = base ** k, l = Math.log(x), lb = Math.round(Math.log(base) * 1000) / 1000;
  function next() { if (k >= steps) return; const n = k + 1; setK(n); if (n === steps) onDone(String(lb)); }
  return <div className="manip">
    <table className="guess-table"><thead><tr><th>x</th><th>ln x</th></tr></thead><tbody>
      {Array.from({ length: k + 1 }, (_, i) => <tr key={i}><td>{num(base ** i)}</td><td>{num(Math.round(Math.log(base ** i) * 1000) / 1000)}{i ? ` (+${num(lb)})` : ''}</td></tr>)}
    </tbody></table>
    <p className="manip-equation">ln {num(x)} = {num(Math.round(l * 1000) / 1000)}</p>
    {k < steps && <Button variant="soft" onClick={next}>{say(lang, `Multiplier x par ${base}`, `Multiply x by ${base}`, `اضرب x في ${base}`, `Multiplicar x por ${base}`)}</Button>}
    {k === steps && <p className="manip-discovery" role="status">{say(lang, `À chaque × ${base}, ln augmente de la même quantité, ln ${base} ≈ ${num(lb)} : le logarithme transforme les produits en sommes. ln(ab) = ln a + ln b, et ln(${base}${'⁰¹²³⁴⁵⁶'[steps]}) = ${steps} ln ${base}.`, `Each × ${base} adds the same amount, ln ${base} ≈ ${lb}: logarithms turn products into sums. ln(ab) = ln a + ln b.`, `ln(ab) = ln a + ln b.`, `ln(ab) = ln a + ln b.`)}</p>}
  </div>;
}

const RIEMANN_N = [2, 4, 8, 16, 32];
function Riemann({ fn, b, lang, onDone }: { fn: 'square' | 'line'; b: number; lang: Lang; onDone: Done }) {
  const [i, setI] = useState(0);
  const n = RIEMANN_N[i]!, sum = riemannSum(fn, b, n), exact = riemannExact(fn, b);
  const top = riemannF(fn, b), W = 260, H = 140, X = (x: number) => 20 + (x / b) * W, Y = (y: number) => 150 - (y / top) * H;
  const done = i === RIEMANN_N.length - 1;
  function more() { if (done) return; const k = i + 1; setI(k); if (k === RIEMANN_N.length - 1) onDone(String(exact)); }
  const curve = Array.from({ length: 41 }, (_, k) => `${k ? 'L' : 'M'} ${X((k * b) / 40).toFixed(1)} ${Y(riemannF(fn, (k * b) / 40)).toFixed(1)}`).join(' ');
  return <div className="manip">
    <svg viewBox="0 0 300 160" className="manip-svg" aria-hidden>
      {Array.from({ length: n }, (_, k) => { const x0 = (k * b) / n, h = riemannF(fn, x0); return <rect key={k} x={X(x0)} y={Y(h)} width={W / n} height={150 - Y(h)} className="svg-shape" />; })}
      <path d={curve} className="svg-curve" /><line x1={20} x2={285} y1={150} y2={150} className="svg-tick" />
      <text x={X(b) - 4} y={159} className="svg-small">{b}</text><text x={14} y={159} className="svg-small">0</text>
    </svg>
    <p className="manip-equation">{n} {say(lang, 'rectangles', 'rectangles', 'مستطيلات', 'rectángulos')} : {num(Math.round(sum * 1000) / 1000)}</p>
    {!done && <Button variant="soft" onClick={more}>{say(lang, 'Doubler le nombre de rectangles', 'Double the number of rectangles', 'ضاعف عدد المستطيلات', 'Duplicar los rectángulos')}</Button>}
    {done && <p className="manip-discovery" role="status">{say(lang, `Plus les rectangles sont fins, plus leur somme se rapproche de l’aire sous la courbe : ∫ de 0 à ${b} de ${fn === 'square' ? 'x²' : 'x'} dx = ${num(Math.round(exact * 1000) / 1000)}${fn === 'square' ? ` (= ${b}³ ÷ 3)` : ` (= ${b}² ÷ 2)`}. La primitive donne la valeur exacte : F(${b}) − F(0).`, `The thinner the rectangles, the closer their sum to the area under the curve: ∫ from 0 to ${b} = ${Math.round(exact * 1000) / 1000}. The antiderivative gives it exactly: F(${b}) − F(0).`, `التكامل = ${num(Math.round(exact * 1000) / 1000)}.`, `La integral = ${num(Math.round(exact * 1000) / 1000)}.`)}</p>}
  </div>;
}

/** Perspective cavalière : x vers la droite, y en fuite (oblique), z vers le haut. */
const proj = ([x, y, z]: [number, number, number]) => ({ px: 60 + x * 90 + y * 45, py: 150 - z * 90 - y * 35 });
const EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
function CubeCoords({ targets, lang, onDone }: { targets: [number, number, number][]; lang: Lang; onDone: Done }) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const target = targets[Math.min(i, targets.length - 1)]!;
  function tap(name: string) {
    if (i >= targets.length) return;
    const c = CUBE[name]!;
    if (c.every((v, k) => v === target[k])) { setWrong(null); const n = i + 1; setI(n); if (n === targets.length) onDone('cube'); }
    else setWrong(name);
  }
  return <div className="manip">
    <svg viewBox="0 0 230 170" className="manip-svg" aria-hidden>
      {EDGES.map(e => { const a = proj(CUBE[e[0]!]!), b = proj(CUBE[e[1]!]!); return <line key={e} x1={a.px} y1={a.py} x2={b.px} y2={b.py} className={['DA', 'CD', 'DH'].includes(e) ? 'svg-ghost' : 'svg-tick'} />; })}
      {Object.entries(CUBE).map(([n, c]) => { const p = proj(c); return <text key={n} x={p.px + 4} y={p.py - 4} className="svg-label">{n}</text>; })}
    </svg>
    <div className="manip-controls">{Object.keys(CUBE).map(n => <Button key={n} variant={wrong === n ? 'destructive' : 'soft'} size="sm" onClick={() => tap(n)} aria-label={`${say(lang, 'Sommet', 'Vertex', 'الرأس', 'Vértice')} ${n}`}>{n}</Button>)}</div>
    {i < targets.length && <p className="manip-feedback">{say(lang, `Repère (A ; AB, AD, AE). Touche le sommet de coordonnées (${target.join(' ; ')}).`, `Frame (A; AB, AD, AE). Tap the vertex at (${target.join(', ')}).`, `المس الرأس (${target.join(' ; ')}).`, `Toca el vértice (${target.join(' ; ')}).`)} ({i}/{targets.length})</p>}
    {wrong && <p className="manip-feedback manip-bad" role="alert">{say(lang, `${wrong} a pour coordonnées (${CUBE[wrong]!.join(' ; ')}).`, `${wrong} is at (${CUBE[wrong]!.join(', ')}).`, `${wrong} = (${CUBE[wrong]!.join(' ; ')}).`, `${wrong} = (${CUBE[wrong]!.join(' ; ')}).`)}</p>}
    {i === targets.length && <p className="manip-discovery" role="status">{say(lang, 'Pour lire (x ; y ; z), on avance de x selon AB, de y selon AD, puis on monte de z selon AE. Par exemple G(1 ; 1 ; 1) et le vecteur AG(1 ; 1 ; 1).', 'To read (x, y, z): go x along AB, y along AD, then up z along AE. For example G(1, 1, 1) and vector AG(1, 1, 1).', 'نتقدم x ثم y ثم نصعد z.', 'Avanza x, luego y, sube z.')}</p>}
  </div>;
}

function Arrange({ letters, length, lang, onDone }: { letters: string[]; length: number; lang: Lang; onDone: Done }) {
  const total = arrangements(letters.length, length);
  const [word, setWord] = useState('');
  const [found, setFound] = useState<string[]>([]);
  const [dup, setDup] = useState(false);
  function tap(l: string) {
    if (found.length === total || word.includes(l)) return;
    const w = word + l;
    if (w.length < length) { setWord(w); return; }
    setWord('');
    if (found.includes(w)) { setDup(true); return; }
    setDup(false); const all = [...found, w]; setFound(all); if (all.length === total) onDone(String(total));
  }
  return <div className="manip">
    <p className="manip-equation">{word.padEnd(length, '_').split('').join(' ')}</p>
    <div className="manip-controls">{letters.map(l => <Button key={l} variant="soft" onClick={() => tap(l)} disabled={word.includes(l)}>{l}</Button>)}</div>
    <div className="lineup">{found.map(w => <span key={w} className="lineup-card">{w}</span>)}</div>
    {dup && <p className="manip-feedback manip-bad" role="alert">{say(lang, 'Déjà trouvé !', 'Already found!', 'وُجد سابقًا!', '¡Ya encontrado!')}</p>}
    <p className="manip-feedback">{found.length}/{total}</p>
    {found.length === total && <p className="manip-discovery" role="status">{length === letters.length
      ? say(lang, `${total} mots : ${letters.length} choix pour la 1re lettre, puis ${letters.length - 1}, puis… : ${letters.length}! = ${total}.`, `${total} words: ${letters.length} choices for the 1st letter, then ${letters.length - 1}…: ${letters.length}! = ${total}.`, `${letters.length}! = ${total}.`, `${letters.length}! = ${total}.`)
      : say(lang, `${total} mots de ${length} lettres : ${Array.from({ length }, (_, i) => letters.length - i).join(' × ')} = ${total}. L’ordre compte (AB ≠ BA) : ce sont des arrangements.`, `${total} words of ${length} letters: ${Array.from({ length }, (_, i) => letters.length - i).join(' × ')} = ${total}. Order matters (AB ≠ BA).`, `الترتيب مهم: ${total}.`, `El orden importa: ${total}.`)}</p>}
  </div>;
}

function Handshake({ n, lang, onDone }: { n: number; lang: Lang; onDone: Done }) {
  const total = (n * (n - 1)) / 2;
  const [sel, setSel] = useState<number | null>(null);
  const [pairs, setPairs] = useState<string[]>([]);
  const P = Array.from({ length: n }, (_, k) => ({ x: 110 + 75 * Math.cos((2 * Math.PI * k) / n - Math.PI / 2), y: 90 + 75 * Math.sin((2 * Math.PI * k) / n - Math.PI / 2) }));
  function tap(k: number) {
    if (pairs.length === total) return;
    if (sel === null || sel === k) { setSel(sel === k ? null : k); return; }
    const key = [sel, k].sort((a, b) => a - b).join('-'); setSel(null);
    if (pairs.includes(key)) return;
    const all = [...pairs, key]; setPairs(all); if (all.length === total) onDone(String(total));
  }
  return <div className="manip">
    <svg viewBox="0 0 220 180" className="manip-svg">
      {pairs.map(pk => { const [a, b] = pk.split('-').map(Number); return <line key={pk} x1={P[a!]!.x} y1={P[a!]!.y} x2={P[b!]!.x} y2={P[b!]!.y} className="svg-ray svg-ray-move" />; })}
      {P.map((p, k) => <g key={k} role="button" aria-label={`${say(lang, 'Personne', 'Person', 'شخص', 'Persona')} ${k + 1}`} onClick={() => tap(k)} style={{ cursor: 'pointer' }}>
        <circle cx={p.x} cy={p.y} r={14} className={sel === k ? 'interval-in' : 'svg-shape'} /><text x={p.x - 4} y={p.y + 4} className="svg-label">{k + 1}</text></g>)}
    </svg>
    <p className="manip-feedback">{say(lang, `Touche deux personnes pour qu’elles se serrent la main : ${pairs.length}/${total}`, `Tap two people to make them shake hands: ${pairs.length}/${total}`, `المس شخصين: ${pairs.length}/${total}`, `Toca dos personas: ${pairs.length}/${total}`)}</p>
    {pairs.length === total && <p className="manip-discovery" role="status">{say(lang, `${total} poignées de main : chacun serre ${n - 1} mains, soit ${n} × ${n - 1}, mais chaque poignée est comptée deux fois → ${n} × ${n - 1} ÷ 2 = ${total} = (${n} parmi 2). L’ordre ne compte pas : c’est une combinaison.`, `${total} handshakes: each person shakes ${n - 1} hands, ${n} × ${n - 1}, but each is counted twice → ÷ 2 = ${total} = C(${n}, 2).`, `${n} × ${n - 1} ÷ 2 = ${total}.`, `${n} × ${n - 1} ÷ 2 = ${total}.`)}</p>}
  </div>;
}

function ComplexPlane({ mode, a: a0, b: b0, lang, onDone }: { mode: 'rotate' | 'place'; a: number; b: number; lang: Lang; onDone: Done }) {
  const [z, setZ] = useState<[number, number]>(mode === 'rotate' ? [a0, b0] : [0, 0]);
  const [turns, setTurns] = useState(0);
  const [finished, setFinished] = useState(false);
  const U = 16, O = 100, X = (v: number) => O + v * U, Y = (v: number) => O - v * U;
  const text = (re: number, im: number) => `${re || im === 0 ? num(re) : ''}${im ? `${re ? (im < 0 ? ' − ' : ' + ') : im < 0 ? '−' : ''}${Math.abs(im) === 1 ? '' : num(Math.abs(im))}i` : ''}`;
  function times() { const [re, im] = z; setZ([-im, re]); const k = turns + 1; setTurns(k); if (!finished && k === 4) { setFinished(true); onDone('i'); } }
  function place(re: number, im: number) { const nz: [number, number] = [Math.max(-5, Math.min(5, re)), Math.max(-5, Math.min(5, im))]; setZ(nz); if (!finished && nz[0] === a0 && nz[1] === b0) { setFinished(true); onDone(String(Math.hypot(a0, b0))); } }
  const mod = Math.round(Math.hypot(z[0], z[1]) * 100) / 100;
  return <div className="manip">
    <svg viewBox="0 0 200 200" className="manip-svg plot-svg" aria-hidden>
      {Array.from({ length: 11 }, (_, k) => <g key={k}><line x1={X(k - 5)} x2={X(k - 5)} y1={X(-5)} y2={X(5)} className="svg-grid" /><line y1={X(k - 5)} y2={X(k - 5)} x1={X(-5)} x2={X(5)} className="svg-grid" /></g>)}
      <line x1={X(-5)} x2={X(5)} y1={O} y2={O} className="svg-tick" /><line y1={X(-5)} y2={X(5)} x1={O} x2={O} className="svg-tick" />
      <text x={X(5) - 8} y={O - 4} className="svg-small">Re</text><text x={O + 4} y={X(-5) + 8} className="svg-small">Im</text>
      {mode === 'place' && <circle cx={X(a0)} cy={Y(b0)} r={6} className="svg-ghost" />}
      <line x1={O} y1={O} x2={X(z[0])} y2={Y(z[1])} className="svg-ray svg-ray-move" />
      <circle cx={X(z[0])} cy={Y(z[1])} r={5} className="svg-dot-move" style={{ transition: 'all .4s' }} />
    </svg>
    <p className="manip-equation">z = {text(z[0], z[1])} · |z| = {num(mod)}</p>
    {mode === 'rotate'
      ? !finished && <Button variant="soft" onClick={times}>{say(lang, 'Multiplier par i', 'Multiply by i', 'اضرب في i', 'Multiplicar por i')}</Button>
      : <><Stepper lang={lang} label={`Re = ${num(z[0])}`} onMinus={() => place(z[0] - 1, z[1])} onPlus={() => place(z[0] + 1, z[1])} minus={say(lang, 'Diminuer la partie réelle', 'Decrease the real part', 'نقّص الجزء الحقيقي', 'Disminuir la parte real')} plus={say(lang, 'Augmenter la partie réelle', 'Increase the real part', 'زد الجزء الحقيقي', 'Aumentar la parte real')} />
        <Stepper lang={lang} label={`Im = ${num(z[1])}`} onMinus={() => place(z[0], z[1] - 1)} onPlus={() => place(z[0], z[1] + 1)} minus={say(lang, 'Diminuer la partie imaginaire', 'Decrease the imaginary part', 'نقّص الجزء التخيلي', 'Disminuir la parte imaginaria')} plus={say(lang, 'Augmenter la partie imaginaire', 'Increase the imaginary part', 'زد الجزء التخيلي', 'Aumentar la parte imaginaria')} /></>}
    {mode === 'place' && !finished && <p className="manip-feedback">{say(lang, `Place le point d’affixe ${text(a0, b0)}.`, `Place the point ${text(a0, b0)}.`, `ضع النقطة ${text(a0, b0)}.`, `Coloca el punto ${text(a0, b0)}.`)}</p>}
    {finished && <p className="manip-discovery" role="status">{mode === 'rotate'
      ? say(lang, 'Multiplier par i fait tourner le point d’un quart de tour (90°) autour de O, sans changer son module. Quatre quarts de tour ramènent au départ : i⁴ = 1, et i² = −1 est le demi-tour.', 'Multiplying by i turns the point a quarter turn (90°) about O, keeping its modulus. Four quarter turns bring it back: i⁴ = 1, and i² = −1 is the half turn.', 'الضرب في i ربع دورة: i⁴ = 1 و i² = −1.', 'Multiplicar por i gira 90°: i⁴ = 1, i² = −1.')
      : say(lang, `a + ib est le point (a ; b). Son module est la distance à O : |${text(a0, b0)}| = √(${a0 * a0} + ${b0 * b0}) = ${num(Math.round(Math.hypot(a0, b0) * 100) / 100)} (Pythagore).`, `a + ib is the point (a, b). Its modulus is the distance to O: √(${a0 * a0} + ${b0 * b0}) = ${Math.round(Math.hypot(a0, b0) * 100) / 100}.`, `المعيار هو المسافة إلى O.`, `El módulo es la distancia a O.`)}</p>}
  </div>;
}

function Euler({ a, y0, h, steps, lang, onDone }: { a: number; y0: number; h: number; steps: number; lang: Lang; onDone: Done }) {
  const [pts, setPts] = useState<number[]>([y0]);
  const k = pts.length - 1, last = pts[k]!;
  const xMax = h * steps, ys = Array.from({ length: 41 }, (_, i) => y0 * Math.exp((a * i * xMax) / 40));
  const top = Math.max(...ys, ...pts) * 1.1, X = (x: number) => 20 + (x / xMax) * 260, Y = (y: number) => 150 - (y / top) * 140;
  function step() { if (k >= steps) return; const all = [...pts, eulerStep(a, last, h)]; setPts(all); if (all.length - 1 === steps) onDone('euler'); }
  const exact = y0 * Math.exp(a * xMax);
  return <div className="manip">
    <svg viewBox="0 0 300 160" className="manip-svg" aria-hidden>
      <line x1={20} x2={285} y1={150} y2={150} className="svg-tick" />
      <path d={ys.map((y, i) => `${i ? 'L' : 'M'} ${X((i * xMax) / 40).toFixed(1)} ${Y(y).toFixed(1)}`).join(' ')} className="svg-ghost" />
      <path d={pts.map((y, i) => `${i ? 'L' : 'M'} ${X(i * h).toFixed(1)} ${Y(y).toFixed(1)}`).join(' ')} className="svg-curve" />
      {pts.map((y, i) => <circle key={i} cx={X(i * h)} cy={Y(y)} r={3.5} className="svg-dot-move" />)}
    </svg>
    <p className="manip-equation">x = {num(Math.round(k * h * 100) / 100)} · y ≈ {num(Math.round(last * 1000) / 1000)} · {say(lang, 'pente', 'slope', 'الميل', 'pendiente')} = {num(a)} × y = {num(Math.round(a * last * 1000) / 1000)}</p>
    {k < steps && <Button variant="soft" onClick={step}>{say(lang, `Avancer de ${num(h)} sur la tangente`, `Step ${h} along the tangent`, `تقدم ${num(h)} على المماس`, `Avanzar ${num(h)} por la tangente`)}</Button>}
    {k === steps && <p className="manip-discovery" role="status">{say(lang, `À chaque pas, la pente est ${num(a)} × y : la courbe obtenue suit de près la vraie solution y = ${num(y0)}e^(${num(a)}x) (en pointillés), qui vaut ${num(Math.round(exact * 1000) / 1000)} en x = ${num(xMax)}. Avec des pas plus petits, on s’en rapproche encore.`, `At each step the slope is ${a} × y: the path follows the true solution y = ${y0}e^(${a}x) (dashed), which is ${Math.round(exact * 1000) / 1000} at x = ${xMax}. Smaller steps get even closer.`, `الحل الحقيقي y = ${num(y0)}e^(${num(a)}x).`, `La solución real y = ${num(y0)}e^(${num(a)}x).`)}</p>}
  </div>;
}
