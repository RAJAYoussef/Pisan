import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { analyzeFractionResponse, type FractionDiagnosis, type FractionTask } from '@/lib/fraction-diagnosis';

type FractionBarsProps = {
  lang: Lang;
  left: { n: number; d: number };
  right: { n: number; d: number };
  locked?: boolean;
  onDiagnosis?: (diagnosis: FractionDiagnosis) => void;
  onComplete?: (correct: boolean) => void;
};

const labels = {
  fr: { left: 'Fraction A', right: 'Fraction B', fill: 'Parts coloriées', check: 'Vérifier', choose: 'Compare les deux bandes', relation: 'Aucune relation choisie', correct: 'Bonne comparaison', incorrect: 'Ce n’est pas encore correct', reset: 'Effacer les bandes' },
  en: { left: 'Fraction A', right: 'Fraction B', fill: 'Shaded parts', check: 'Check', choose: 'Compare the two bars', relation: 'No relation selected', correct: 'Correct comparison', incorrect: 'Not correct yet', reset: 'Clear the bars' },
  ar: { left: 'الكسر A', right: 'الكسر B', fill: 'الأجزاء الملونة', check: 'تحقق', choose: 'قارن الشريطين', relation: 'لم يتم اختيار علاقة', correct: 'مقارنة صحيحة', incorrect: 'ليست صحيحة بعد', reset: 'امسح الشريطين' },
  es: { left: 'Fracción A', right: 'Fracción B', fill: 'Partes coloreadas', check: 'Comprobar', choose: 'Compara las dos barras', relation: 'No se ha elegido relación', correct: 'Comparación correcta', incorrect: 'Todavía no es correcto', reset: 'Vaciar las barras' },
} as const;

/** Fraction bars students can partition and shade; comparison is checked and diagnosed deterministically. */
export function FractionBars({ lang, left, right, locked = false, onDiagnosis, onComplete }: FractionBarsProps) {
  const [leftShade, setLeftShade] = useState<number[]>([]);
  const [rightShade, setRightShade] = useState<number[]>([]);
  const [relation, setRelation] = useState<'<' | '>' | '=' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [diagnosis, setDiagnosis] = useState<FractionDiagnosis | null>(null);
  const copy = labels[lang];
  const expected = useMemo(() => Math.sign(left.n * right.d - right.n * left.d), [left.n, left.d, right.n, right.d]);
  const expectedRelation = expected > 0 ? '>' : expected < 0 ? '<' : '=';
  const toggle = (values: number[], set: (v: number[]) => void, index: number) => {
    if (locked || feedback === 'correct') return;
    set(values.includes(index) ? values.filter(x => x !== index) : [...values, index].sort((a, b) => a - b));
    setFeedback(null);
    setDiagnosis(null);
  };
  const bar = (name: string, fraction: { n: number; d: number }, selected: number[], set: (v: number[]) => void) => (
    <div className="space-y-2" dir="ltr">
      <div className="flex items-center justify-between text-sm font-semibold"><span>{name}</span><span>{fraction.n}/{fraction.d}</span></div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${fraction.d}, minmax(0, 1fr))` }} role="group" aria-label={name}>
        {Array.from({ length: fraction.d }, (_, i) => <button key={i} type="button" disabled={locked || feedback === 'correct'} aria-pressed={selected.includes(i)} aria-label={`Part ${i + 1} sur ${fraction.d}`} onClick={() => toggle(selected, set, i)} className={`h-11 rounded border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selected.includes(i) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted hover:bg-accent'}`} />)}
      </div>
      <p className="text-xs text-muted-foreground">{copy.fill}: {selected.length}/{fraction.d}</p>
    </div>
  );
  const verify = () => {
    const leftRepresented = leftShade.length === left.n;
    const rightRepresented = rightShade.length === right.n;
    const correct = leftRepresented && rightRepresented && relation === expectedRelation;
    const task: FractionTask = { kind: 'compare', left, right, relation: expectedRelation };
    const rawDiagnosis = analyzeFractionResponse(task, relation ?? '');
    const diagnosis: FractionDiagnosis = leftRepresented && rightRepresented
      ? rawDiagnosis
      : { ...rawDiagnosis, correct: false, confidence: 'low', evidence: 'La représentation ne montre pas encore le bon nombre de parts coloriées dans chaque bande.', remediation: 'visualise-parts' };
    setDiagnosis(diagnosis);
    onDiagnosis?.(diagnosis);
    setFeedback(correct ? 'correct' : 'incorrect');
    onComplete?.(correct);
  };
  return <section className="space-y-5" aria-label="Manipulation de bandes fractionnaires">
    {bar(copy.left, left, leftShade, setLeftShade)}
    {bar(copy.right, right, rightShade, setRightShade)}
    <div className="space-y-2">
      <p className="text-sm font-semibold">{copy.choose}</p>
      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {(['<', '=', '>'] as const).map(value => <Button key={value} type="button" variant={relation === value ? 'default' : 'outline'} disabled={locked || feedback === 'correct'} aria-pressed={relation === value} onClick={() => { setRelation(value); setFeedback(null); }}>{value}</Button>)}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">{relation ?? copy.relation}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={verify} disabled={locked || !relation}>{copy.check}</Button>
      <Button type="button" variant="outline" disabled={locked} onClick={() => { setLeftShade([]); setRightShade([]); setRelation(null); setFeedback(null); setDiagnosis(null); }}>{copy.reset}</Button>
    </div>
    {feedback && <div role="status" className={feedback === 'correct' ? 'space-y-1 font-semibold text-primary' : 'space-y-1 font-semibold text-destructive'}><p>{feedback === 'correct' ? copy.correct : copy.incorrect}</p>{feedback === 'incorrect' && diagnosis && <p className="text-sm font-normal text-foreground">{diagnosis.evidence} {diagnosis.remediation === 'compare-on-number-line' ? 'Essaie de situer les deux fractions sur une droite graduée.' : ''}</p>}</div>}
  </section>;
}
