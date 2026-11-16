import { useEffect, useState } from 'react';
import { checkFreeAnswer } from '@/lib/answer-check';
import type { Question } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { Button } from '@/components/ui/button';

const MODE_KEY = 'pisan-answer-mode';
export type AnswerMode = 'free' | 'choices';
export function loadAnswerMode(): AnswerMode {
  try { return localStorage.getItem(MODE_KEY) === 'choices' ? 'choices' : 'free'; } catch { return 'free'; }
}
export function saveAnswerMode(mode: AnswerMode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* navigation privée : le choix vaut pour cette visite */ }
}

const KEYS = ['x', '²', '√', '/', '(', ')', '−', 'π'];

/**
 * Réponse tapée par l'élève. Renvoie au parent l'index de la bonne option si la réponse est
 * équivalente, −1 si elle est fausse, null si le champ est vide : la correction reste la même que pour le QCM.
 */
export function FreeAnswer({ question, lang, onSelect, onText }: { question: Question; lang: Lang; onSelect: (i: number | null) => void; onText?: ((text: string) => void) | undefined }) {
  const [text, setText] = useState('');
  useEffect(() => { setText(''); }, [question]);
  const update = (value: string) => {
    setText(value);
    onText?.(value);
    onSelect(value.trim() ? (checkFreeAnswer(question, value) ? question.answer : -1) : null);
  };
  const label = say(lang, 'Ta réponse', 'Your answer', 'جوابك', 'Tu respuesta');
  return <div>
    <label htmlFor="free-answer" className="field-label">{label}</label>
    <input id="free-answer" dir="ltr" className="form-input text-center font-display text-2xl" value={text} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={60}
      placeholder={say(lang, 'ex. : 0,5 ou 1/2 ou 3x + 1', 'e.g. 0.5 or 1/2 or 3x + 1', 'مثال: 0,5 أو 1/2 أو 3x + 1', 'ej.: 0,5 o 1/2 o 3x + 1')}
      onChange={e => update(e.target.value)} />
    <div className="mt-3 flex flex-wrap justify-center gap-2" dir="ltr" aria-label={say(lang, 'Clavier mathématique', 'Math keypad', 'لوحة مفاتيح رياضية', 'Teclado matemático')}>
      {KEYS.map(k => <Button key={k} type="button" size="sm" variant="soft" className="h-10 min-w-10 font-display text-lg" onClick={() => update(text + k)}>{k}</Button>)}
      <Button type="button" size="sm" variant="ghost" className="h-10" onClick={() => update(text.slice(0, -1))} aria-label={say(lang, 'Effacer', 'Delete', 'حذف', 'Borrar')}>⌫</Button>
    </div>
    <p className="mt-2 text-center text-xs text-muted-foreground">{say(lang, 'Virgule ou point, fraction ou décimal : les deux sont acceptés.', 'Comma or point, fraction or decimal: both are accepted.', 'الفاصلة أو النقطة، الكسر أو العدد العشري: كلاهما مقبول.', 'Coma o punto, fracción o decimal: ambos valen.')}</p>
  </div>;
}
