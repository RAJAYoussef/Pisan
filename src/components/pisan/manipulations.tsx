// « Je manipule » : le temps concret du modèle de Singapour, avant la carte de cours et les exercices.
// Rien n'est noté ici : l'élève explore, et le bouton « J'ai compris » s'active quand il a fait la découverte.
import { useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { applyBalance, balanceOps, balanceSolved, clean, digitsByRank, isPrime, PLACE_RANKS, rectanglePairs, type BalanceOp, type Manip, type Side } from '@/lib/skill-intros';

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
  return <Bars parts={manip.parts} extra={manip.extra} total={manip.total} unit={manip.unit} lang={lang} onDone={onDone} />;
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

function Bars({ parts, extra, total, unit, lang, onDone }: { parts: number; extra: number; total: number; unit: string; lang: Lang; onDone: Done }) {
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
    {stage === 2 && <p className="manip-discovery" role="status">{say(lang, `La largeur mesure ${each} ${unit}, la longueur ${each + extra} ${unit}. Vérification : 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `The width is ${each} ${unit}, the length ${each + extra} ${unit}. Check: 2 × (${each} + ${each + extra}) = ${2 * total} ✓`, `العرض ${each} والطول ${each + extra}.`, `El ancho mide ${each} ${unit} y el largo ${each + extra} ${unit}.`)}</p>}
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
