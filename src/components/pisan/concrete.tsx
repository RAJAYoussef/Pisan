import { Minus, Plus, RotateCcw, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { concreteSpec, type Exercise } from '@/lib/exercises';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

type Props = { exercise: Exercise; lang: Lang; counts: number[]; onChange: (counts: number[]) => void; readonly?: boolean };

export function ConcreteObjects({ exercise, lang, counts, onChange, readonly = false }: Props) {
  const spec = concreteSpec(exercise);
  const remaining = spec.tokenCount - counts.reduce((sum, n) => sum + n, 0);
  const change = (index: number, delta: number) => onChange(counts.map((n, i) => i === index ? n + delta : n));
  return <div className="concrete-workspace">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-bold">{say(lang, '1 jeton', '1 counter', 'قرص واحد', '1 ficha')} = {spec.value} {exercise.unit[lang]}</p>
      {!readonly && <Button variant="ghost" size="icon" title={say(lang, 'Tout remettre dans la réserve', 'Return everything to the reserve', 'إعادة الكل إلى المخزون', 'Devolver todo a la reserva')} aria-label={say(lang, 'Tout remettre dans la réserve', 'Return everything to the reserve', 'إعادة الكل إلى المخزون', 'Devolver todo a la reserva')} onClick={() => onChange(counts.map(() => 0))}><RotateCcw /></Button>}
    </div>
    {!readonly && <div className="concrete-reserve mb-5" role="status">
      <span className="font-bold">{say(lang, 'Réserve', 'Reserve', 'المخزون', 'Reserva')} · {remaining} / {spec.tokenCount}</span>
      <div className="mt-3 flex min-h-6 flex-wrap gap-1" aria-hidden="true">{Array.from({ length: remaining }, (_, i) => <Circle key={i} className="h-5 w-5 fill-sun text-sun-deep" />)}</div>
    </div>}
    {exercise.bars.map((bar, barIndex) => <div key={barIndex} className="mb-5 last:mb-0">
      <h3 className="mb-2 text-lg">{bar.name[lang]} <span className="text-sm text-muted-foreground">· {spec.groups.reduce((sum, g, i) => sum + (g.barIndex === barIndex ? (counts[i] ?? 0) * spec.value : 0), 0)} {exercise.unit[lang]}</span></h3>
      <div className="flex flex-wrap gap-2">{spec.groups.map((group, i) => group.barIndex !== barIndex ? null : <div className={`concrete-tray bar-color-${group.extra ? 4 : bar.color}`} key={i}>
        <div className="flex items-center justify-between gap-2 text-xs font-bold"><span>{group.extra ? say(lang, 'En plus', 'Extra', 'إضافة', 'Extra') : `${say(lang, 'Part', 'Part', 'جزء', 'Parte')} ${group.partIndex + 1}`}</span><span>{counts[i] ?? 0}</span></div>
        <div className="concrete-tokens">{Array.from({ length: counts[i] ?? 0 }, (_, j) => readonly ? <Circle key={j} className="h-6 w-6 fill-current" /> : <Button key={j} variant="ghost" size="icon" className="h-9 w-9" aria-label={`${say(lang, 'Retirer un jeton', 'Remove a counter', 'إزالة قرص', 'Quitar una ficha')} · ${bar.name[lang]} · ${group.partIndex + 1}`} onClick={() => change(i, -1)}><Circle className="fill-current" /></Button>)}</div>
        {!readonly && <div className="mt-2 flex justify-between gap-2"><Button variant="ghost" size="icon" disabled={!counts[i]} aria-label={`${say(lang, 'Retirer', 'Remove', 'إزالة', 'Quitar')} · ${bar.name[lang]} · ${group.partIndex + 1}`} onClick={() => change(i, -1)}><Minus /></Button><Button variant="outline" size="icon" disabled={remaining <= 0} aria-label={`${say(lang, 'Ajouter', 'Add', 'إضافة', 'Añadir')} · ${bar.name[lang]} · ${group.partIndex + 1}`} onClick={() => change(i, 1)}><Plus /></Button></div>}
      </div>)}</div>
    </div>)}
  </div>;
}