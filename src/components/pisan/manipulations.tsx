// « Je manipule » : le temps concret du modèle de Singapour, avant la carte de cours et les exercices.
// Rien n'est noté ici : l'élève explore, et le bouton « J'ai compris » s'active quand il a fait la découverte.
import { useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { applyBalance, balanceOps, balanceSolved, clean, digitsByRank, isPrime, PLACE_RANKS, rectanglePairs, angleKind, closes, runMachine, tileAreas, type BalanceOp, type Manip, type Side } from '@/lib/skill-intros';

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
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const rest = total - extra, each = rest / parts;
  return <div className="manip">
    <div className="bar-model" aria-label={say(lang, 'Modèle en barres', 'Bar model', 'نموذج شريطي', 'Modelo de barras')}>
      <div className="bar-line">
        {Array.from({ length: parts }, (_, i) => <span key={i} className="bar-part">{stage === 2 ? `${each} ${unit}` : 'x'}</span>)}
        <span className={`bar-extra ${stage >= 1 ? 'bar-gone' : ''}`} style={{ flexGrow: Math.max(0.6, (extra / total) * parts * 1.6) }}>{extra} {unit}</span>
      </div>
      <div className="bar-brace"><span>{stage >= 1 ? `${rest} ${unit}` : `${total} ${unit}`}</span></div>
    </div>
    <p className="manip-equation">{stage === 0 ? `${Array(parts).fill('x').join(' + ')} + ${extra} = ${total}` : stage === 1 ? `${parts}x = ${rest}` : `x = ${each}`}</p>
    {stage === 0 && <Button variant="soft" className="h-auto min-h-10 whitespace-normal" onClick={() => setStage(1)}>{say(lang, `Enlever le morceau connu (${extra} ${unit})`, `Remove the known piece (${extra} ${unit})`, `أزل الجزء المعلوم (${extra} ${unit})`, `Quita la parte conocida (${extra} ${unit})`)}</Button>}
    {stage === 1 && <Button variant="soft" className="h-auto min-h-10 whitespace-normal" onClick={() => { setStage(2); onDone(String(each)); }}>{say(lang, `Partager ${rest} ${unit} en ${parts} barres égales`, `Share ${rest} ${unit} into ${parts} equal bars`, `اقسم ${rest} على ${parts} أشرطة متساوية`, `Reparte ${rest} entre ${parts} barras iguales`)}</Button>}
    {stage === 2 && <p className="manip-discovery" role="status">{rectangle ? say(lang, `La largeur mesure ${each} ${unit}, la longueur ${each + extra} ${unit}. Vérification : 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `The width is ${each} ${unit}, the length ${each + extra} ${unit}. Check: 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `العرض ${each} والطول ${each + extra}.`, `El ancho mide ${each} ${unit} y el largo ${each + extra} ${unit}.`) : say(lang, `Une barre vaut ${each}${unit ? ' ' + unit : ''} : x = ${each}. Vérification : ${parts} × ${each} + ${extra} = ${total} ✓`, `One bar is ${each}${unit ? ' ' + unit : ''}: x = ${each}. Check: ${parts} × ${each} + ${extra} = ${total} ✓`, `الشريط يساوي ${each}: x = ${each}.`, `Una barra vale ${each}: x = ${each}.`)}</p>}
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
