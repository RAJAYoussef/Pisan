// « Je manipule » : le temps concret du modèle de Singapour, avant la carte de cours et les exercices.
// Rien n'est noté ici : l'élève explore, et le bouton « J'ai compris » s'active quand il a fait la découverte.
import { useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { applyBalance, balanceOps, balanceSolved, isPrime, rectanglePairs, type BalanceOp, type Manip, type Side } from '@/lib/skill-intros';

type Done = (found: string) => void;

export function Manipulation({ manip, lang, onDone }: { manip: Manip; lang: Lang; onDone: Done }) {
  if (manip.kind === 'rectangles') return <Rectangles n={manip.n} lang={lang} onDone={onDone} />;
  if (manip.kind === 'factor-tree') return <FactorTree n={manip.n} lang={lang} onDone={onDone} />;
  if (manip.kind === 'balance') return <Balance left={manip.left} right={manip.right} lang={lang} onDone={onDone} />;
  return <Bars parts={manip.parts} extra={manip.extra} total={manip.total} unit={manip.unit} lang={lang} onDone={onDone} />;
}

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
