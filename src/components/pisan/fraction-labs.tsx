import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';

type Fraction = { n: number; d: number };
type BaseProps = { lang: Lang; locked?: boolean; onComplete?: (correct: boolean) => void };
const copy = {
  fr: { shade: 'Parts coloriées', check: 'Vérifier', reset: 'Recommencer', good: 'Bravo ! La représentation est correcte.', retry: 'Observe les parts et réessaie.', source: 'Fraction de départ', target: 'Fraction à construire', result: 'Résultat', numberline: 'Déplace le point sur la droite graduée.', position: 'Position choisie', add: 'Additionne les parts de même taille.', equivalent: 'Les deux bandes doivent représenter la même quantité.', whole: '0', one: '1' },
  en: { shade: 'Shaded parts', check: 'Check', reset: 'Try again', good: 'Well done! The representation is correct.', retry: 'Look at the parts and try again.', source: 'Starting fraction', target: 'Build this fraction', result: 'Result', numberline: 'Move the point along the number line.', position: 'Selected position', add: 'Add parts of the same size.', equivalent: 'Both bars must represent the same amount.', whole: '0', one: '1' },
  ar: { shade: 'الأجزاء الملونة', check: 'تحقق', reset: 'أعد المحاولة', good: 'أحسنت! التمثيل صحيح.', retry: 'لاحظ الأجزاء وحاول مرة أخرى.', source: 'الكسر الأصلي', target: 'أنشئ هذا الكسر', result: 'الناتج', numberline: 'حرّك النقطة على المستقيم المدرج.', position: 'الموضع المختار', add: 'اجمع الأجزاء المتساوية.', equivalent: 'يجب أن يمثل الشريطان الكمية نفسها.', whole: '0', one: '1' },
  es: { shade: 'Partes coloreadas', check: 'Comprobar', reset: 'Reintentar', good: '¡Muy bien! La representación es correcta.', retry: 'Observa las partes e inténtalo de nuevo.', source: 'Fracción inicial', target: 'Construye esta fracción', result: 'Resultado', numberline: 'Mueve el punto por la recta numérica.', position: 'Posición elegida', add: 'Suma partes del mismo tamaño.', equivalent: 'Las dos barras deben representar la misma cantidad.', whole: '0', one: '1' },
} as const;
function Parts({ lang, d, selected, onToggle, locked }: { lang: Lang; d: number; selected: number[]; onToggle: (i: number) => void; locked: boolean }) {
  const c = copy[lang];
  return <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${d}, minmax(0, 1fr))` }} role="group" aria-label={c.shade}>
    {Array.from({ length: d }, (_, i) => <button key={i} type="button" disabled={locked} aria-pressed={selected.includes(i)} aria-label={`${c.shade} ${i + 1}/${d}`} onClick={() => onToggle(i)} className={`h-10 rounded border-2 ${selected.includes(i) ? 'border-primary bg-primary' : 'border-border bg-muted hover:bg-accent'}`} />)}
  </div>;
}
function useParts(d: number) {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (i: number) => setSelected(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i]);
  return { selected, toggle, reset: () => setSelected([]) };
}

/** Student constructs an equivalent fraction by shading the refined partition. */
export function FractionEquivalenceLab({ lang, source, factor, locked = false, onComplete }: BaseProps & { source: Fraction; factor: number }) {
  const c = copy[lang], target = { n: source.n * factor, d: source.d * factor }, parts = useParts(target.d);
  const [checked, setChecked] = useState<boolean | null>(null);
  const valid = Number.isSafeInteger(source.n) && Number.isSafeInteger(source.d) && source.d > 0 && source.n >= 0 && source.n <= source.d && Number.isSafeInteger(factor) && factor >= 2 && target.d <= 16;
  if (!valid) throw new Error('Invalid equivalence lab parameters');
  const verify = () => { const ok = parts.selected.length === target.n; setChecked(ok); onComplete?.(ok); };
  return <section className="space-y-3">
    <p className="text-sm font-semibold">{c.source}: {source.n}/{source.d} = ?/{target.d}</p>
    <p className="text-xs text-muted-foreground">{c.equivalent}</p>
    <p className="text-sm font-semibold">{c.target}: {target.n}/{target.d}</p>
    <Parts lang={lang} d={target.d} selected={parts.selected} onToggle={i => { parts.toggle(i); setChecked(null); }} locked={locked || checked === true} />
    <p className="text-xs text-muted-foreground">{c.shade}: {parts.selected.length}/{target.d}</p>
    <div className="flex gap-2"><Button type="button" onClick={verify} disabled={locked}>{c.check}</Button><Button type="button" variant="outline" disabled={locked} onClick={() => { parts.reset(); setChecked(null); }}>{c.reset}</Button></div>
    {checked !== null && <p role="status" className={checked ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>{checked ? c.good : c.retry}</p>}
  </section>;
}

/** Adds two fractions with a common denominator through a third manipulable bar. */
export function FractionAdditionLab({ lang, left, right, locked = false, onComplete }: BaseProps & { left: Fraction; right: Fraction }) {
  const c = copy[lang], total = left.n + right.n, parts = useParts(left.d);
  const [checked, setChecked] = useState<boolean | null>(null);
  const valid = left.d === right.d && left.d > 0 && left.d <= 16 && left.n >= 0 && right.n >= 0 && total <= left.d;
  if (!valid) throw new Error('Addition lab requires non-negative fractions with a common denominator and sum ≤ 1');
  const verify = () => { const ok = parts.selected.length === total; setChecked(ok); onComplete?.(ok); };
  return <section className="space-y-3">
    <p className="text-sm font-semibold">{left.n}/{left.d} + {right.n}/{right.d}</p>
    <p className="text-xs text-muted-foreground">{c.add}</p>
    <p className="text-sm font-semibold">{c.result}: ?/{left.d}</p>
    <Parts lang={lang} d={left.d} selected={parts.selected} onToggle={i => { parts.toggle(i); setChecked(null); }} locked={locked || checked === true} />
    <p className="text-xs text-muted-foreground">{c.shade}: {parts.selected.length}/{left.d}</p>
    <div className="flex gap-2"><Button type="button" onClick={verify} disabled={locked}>{c.check}</Button><Button type="button" variant="outline" disabled={locked} onClick={() => { parts.reset(); setChecked(null); }}>{c.reset}</Button></div>
    {checked !== null && <p role="status" className={checked ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>{checked ? c.good : c.retry}</p>}
  </section>;
}

/** Places a fraction on a continuous 0–1 number line using a controlled slider. */
export function FractionNumberLineLab({ lang, target, locked = false, onComplete }: BaseProps & { target: Fraction }) {
  const c = copy[lang], [position, setPosition] = useState(0), [checked, setChecked] = useState<boolean | null>(null);
  if (!Number.isSafeInteger(target.n) || !Number.isSafeInteger(target.d) || target.d <= 0 || target.n < 0 || target.n > target.d) throw new Error('Number line target must be between 0 and 1');
  const verify = () => { const ok = Math.abs(position - target.n / target.d) <= 0.006; setChecked(ok); onComplete?.(ok); };
  return <section className="space-y-3">
    <p className="text-sm font-semibold">{c.numberline} {target.n}/{target.d}</p>
    <div className="relative px-2 pt-5" dir="ltr">
      <div className="h-1 rounded bg-muted-foreground/50" />
      <div className="absolute left-2 right-2 top-0 flex justify-between text-xs"><span>{c.whole}</span><span>{c.one}</span></div>
      <div className="absolute top-[13px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary" style={{ left: `${position * 100}%` }} />
    </div>
    <input aria-label={c.position} type="range" min="0" max="1" step="0.005" value={position} disabled={locked || checked === true} onChange={e => { setPosition(Number(e.target.value)); setChecked(null); }} className="w-full accent-[var(--primary)]" />
    <p className="text-xs text-muted-foreground">{c.position}: {position.toFixed(3)}</p>
    <Button type="button" onClick={verify} disabled={locked}>{c.check}</Button>
    {checked !== null && <p role="status" className={checked ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>{checked ? c.good : c.retry}</p>}
  </section>;
}
