import type { FractionHypothesis } from './fraction-reasoning';
import type { L } from './curriculum';

export type FractionTransferOption = { value: string; label: L };
export type FractionTransferTask = {
  hypothesisCode: FractionHypothesis['code'];
  prompt: L;
  options: FractionTransferOption[];
  correctValue: string;
  errorValues: string[];
  feedback: { success: L; error: L; other: L };
};
export type FractionTransferResult = 'transfer-success' | 'error-reproduced' | 'other-error';

/** Génère une situation nouvelle, distincte des questions de confirmation du diagnostic. */
export function buildFractionTransferTask(
  hypothesisCode: FractionHypothesis['code'],
  seed: number,
): FractionTransferTask {
  const variant = Math.abs(Math.trunc(seed)) % 3;
  if (hypothesisCode === 'fraction-scale-one-term') {
    const items = [
      { n: 2, d: 5, k: 3 },
      { n: 3, d: 7, k: 2 },
      { n: 4, d: 9, k: 2 },
    ] as const;
    const { n, d, k } = items[variant]!;
    const correct = `${n * k}/${d * k}`;
    const oneTop = `${n * k}/${d}`;
    const oneBottom = `${n}/${d * k}`;
    return {
      hypothesisCode,
      prompt: {
        fr: `Une recette utilise ${n}/${d} de litre de lait. On partage chaque unité en ${k} fois plus de petites parts. Quelle écriture représente toujours la même quantité ?`,
        en: `A recipe uses ${n}/${d} litre of milk. Each unit is split into ${k} times as many smaller parts. Which fraction represents the same amount?`,
        ar: `تستعمل وصفة ${n}/${d} لترًا من الحليب. قُسّم كل جزء إلى ${k} أضعاف من الأجزاء الأصغر. أي كسر يمثل الكمية نفسها؟`,
        es: `Una receta utiliza ${n}/${d} litro de leche. Cada unidad se divide en ${k} veces más partes pequeñas. ¿Qué fracción representa la misma cantidad?`,
      },
      options: [
        { value: correct, label: { fr: correct, en: correct, ar: correct, es: correct } },
        { value: oneTop, label: { fr: oneTop, en: oneTop, ar: oneTop, es: oneTop } },
        { value: oneBottom, label: { fr: oneBottom, en: oneBottom, ar: oneBottom, es: oneBottom } },
      ],
      correctValue: correct,
      errorValues: [oneTop, oneBottom],
      feedback: {
        success: { fr: 'Tu as conservé la quantité en transformant les deux termes de la fraction.', en: 'You preserved the quantity by transforming both parts of the fraction.', ar: 'حافظت على الكمية بتغيير بسط الكسر ومقامه معًا.', es: 'Has conservado la cantidad transformando los dos términos de la fracción.' },
        error: { fr: 'Tu as encore transformé un seul terme. Pour conserver la valeur, le numérateur et le dénominateur doivent être multipliés par le même facteur.', en: 'You changed only one term again. To preserve the value, numerator and denominator must be multiplied by the same factor.', ar: 'غيّرت حدًا واحدًا فقط مرة أخرى. للحفاظ على القيمة، يجب ضرب البسط والمقام في العامل نفسه.', es: 'Has vuelto a transformar un solo término. Para conservar el valor, numerador y denominador deben multiplicarse por el mismo factor.' },
        other: { fr: 'Cette réponse ne correspond pas à l’erreur ciblée. Reprenons la représentation avant de conclure.', en: 'This answer does not match the targeted misconception. Let us revisit the representation before drawing a conclusion.', ar: 'هذه الإجابة لا تطابق الخطأ المستهدف. لنراجع التمثيل قبل الاستنتاج.', es: 'Esta respuesta no coincide con el error previsto. Revisemos la representación antes de concluir.' },
      },
    };
  }

  const items = [
    { a: 2, b: 3, d: 8 },
    { a: 1, b: 4, d: 7 },
    { a: 3, b: 2, d: 9 },
  ] as const;
  const { a, b, d } = items[variant]!;
  const correct = `${a + b}/${d}`;
  const onlyA = `${a}/${d}`;
  const onlyB = `${b}/${d}`;
  return {
    hypothesisCode,
    prompt: {
      fr: `Tu as parcouru ${a}/${d} d’un trajet le matin, puis ${b}/${d} l’après-midi. Quelle fraction du trajet as-tu parcourue au total ?`,
      en: `You travelled ${a}/${d} of a route in the morning, then ${b}/${d} in the afternoon. What fraction of the route did you travel altogether?`,
      ar: `قطعت ${a}/${d} من الطريق صباحًا، ثم ${b}/${d} بعد الظهر. ما الكسر الذي يمثل المسافة المقطوعة كلها؟`,
      es: `Recorriste ${a}/${d} de una ruta por la mañana y ${b}/${d} por la tarde. ¿Qué fracción recorriste en total?`,
    },
    options: [
      { value: correct, label: { fr: correct, en: correct, ar: correct, es: correct } },
      { value: onlyA, label: { fr: onlyA, en: onlyA, ar: onlyA, es: onlyA } },
      { value: onlyB, label: { fr: onlyB, en: onlyB, ar: onlyB, es: onlyB } },
    ],
    correctValue: correct,
    errorValues: [onlyA, onlyB],
    feedback: {
      success: { fr: 'Tu as bien pris en compte les deux portions du trajet.', en: 'You correctly included both parts of the journey.', ar: 'أخذت الجزأين من الطريق في الحسبان بشكل صحيح.', es: 'Has tenido en cuenta correctamente los dos tramos del recorrido.' },
      error: { fr: 'Tu n’as retenu qu’une seule des deux portions. Pour additionner, il faut réunir les parts des deux étapes.', en: 'You included only one of the two parts. Addition means combining the parts from both stages.', ar: 'احتسبت جزءًا واحدًا فقط. في الجمع، يجب ضم أجزاء المرحلتين.', es: 'Solo has tenido en cuenta uno de los dos tramos. Para sumar, hay que reunir las partes de ambas etapas.' },
      other: { fr: 'Cette réponse ne reproduit pas exactement l’erreur ciblée. Il faut examiner une autre piste.', en: 'This answer does not reproduce the targeted misconception exactly. Another explanation should be explored.', ar: 'هذه الإجابة لا تكرر الخطأ المستهدف بدقة. ينبغي استكشاف تفسير آخر.', es: 'Esta respuesta no reproduce exactamente el error previsto. Conviene explorar otra explicación.' },
    },
  };
}

export function evaluateFractionTransfer(
  task: FractionTransferTask,
  answer: string,
): FractionTransferResult {
  if (answer === task.correctValue) return 'transfer-success';
  if (task.errorValues.includes(answer)) return 'error-reproduced';
  return 'other-error';
}
