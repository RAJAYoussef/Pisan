// Analyse déterministe des réponses aux activités de fractions.
// Une erreur isolée reste une hypothèse : le module ne déclare jamais une conception acquise.
export type Fraction = { n: number; d: number };
export type FractionTask =
  | { kind: 'add' | 'subtract' | 'multiply' | 'divide'; left: Fraction; right: Fraction }
  | { kind: 'simplify'; value: Fraction; expected: Fraction }
  | { kind: 'equivalent'; value: Fraction; expected: Fraction }
  | { kind: 'compare'; left: Fraction; right: Fraction; relation: '<' | '>' | '=' }
  | { kind: 'fraction-of'; fraction: Fraction; whole: number; expected: number };

export type FractionMisconception =
  | 'fraction-add-denominators'
  | 'fraction-add-without-equivalence'
  | 'fraction-simplify-one-term'
  | 'fraction-scale-one-term'
  | 'fraction-larger-denominator-larger-value'
  | 'fraction-compare-numerators-only'
  | 'fraction-divide-by-multiplying'
  | 'fraction-wrong-whole'
  | 'unknown';

export type FractionDiagnosis = {
  correct: boolean;
  observed: string;
  expected: string;
  misconception: FractionMisconception;
  confidence: 'none' | 'low' | 'medium';
  confirmed: false;
  evidence: string;
  remediation: 'visualise-parts' | 'equivalent-fractions' | 'common-denominator' | 'simplify-both-terms' | 'compare-on-number-line' | 'invert-divisor' | 'identify-whole' | 'review-method';
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};
export function normalizeFraction(f: Fraction): Fraction {
  if (!Number.isSafeInteger(f.n) || !Number.isSafeInteger(f.d) || f.d === 0) throw new Error('Invalid fraction');
  const sign = f.d < 0 ? -1 : 1;
  const g = gcd(f.n, f.d);
  return { n: sign * f.n / g, d: Math.abs(f.d) / g };
}
export function parseFractionAnswer(raw: string): Fraction | null {
  const s = raw.trim().replace(/−/g, '-').replace(/,/g, '.').replace(/\s/g, '');
  if (!s || s.length > 40) return null;
  const m = /^([+-]?\d+)(?:\/([+-]?\d+))?$/.exec(s);
  if (m) {
    const n = Number(m[1]), d = m[2] === undefined ? 1 : Number(m[2]);
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) return null;
    return normalizeFraction({ n, d });
  }
  if (/^[+-]?(?:\d+\.\d+|\.\d+)$/.test(s)) {
    const sign = s.startsWith('-') ? -1 : 1;
    const unsigned = s.replace(/^[+-]/, '');
    const [whole, decimal] = unsigned.split('.');
    const d = 10 ** decimal!.length;
    const n = Number(whole || 0) * d + Number(decimal);
    return normalizeFraction({ n: sign * n, d });
  }
  return null;
}
const equal = (a: Fraction, b: Fraction) => {
  const x = normalizeFraction(a), y = normalizeFraction(b);
  return x.n === y.n && x.d === y.d;
};
const format = (f: Fraction) => {
  const x = normalizeFraction(f);
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`;
};
const product = (a: Fraction, b: Fraction): Fraction => ({ n: a.n * b.n, d: a.d * b.d });
const add = (a: Fraction, b: Fraction): Fraction => normalizeFraction({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const subtract = (a: Fraction, b: Fraction): Fraction => normalizeFraction({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
const divide = (a: Fraction, b: Fraction): Fraction => b.n === 0 ? { n: NaN, d: 1 } : normalizeFraction({ n: a.n * b.d, d: a.d * b.n });
const compare = (a: Fraction, b: Fraction) => Math.sign(a.n * b.d - b.n * a.d);

export function expectedFraction(task: FractionTask): Fraction | number | string {
  switch (task.kind) {
    case 'add': return add(task.left, task.right);
    case 'subtract': return subtract(task.left, task.right);
    case 'multiply': return normalizeFraction(product(task.left, task.right));
    case 'divide': return divide(task.left, task.right);
    case 'simplify':
    case 'equivalent': return normalizeFraction(task.expected);
    case 'compare': return compare(task.left, task.right) > 0 ? '>' : compare(task.left, task.right) < 0 ? '<' : '=';
    case 'fraction-of': return task.expected;
  }
}

export function analyzeFractionResponse(task: FractionTask, raw: string): FractionDiagnosis {
  const expected = expectedFraction(task);
  const parsed = parseFractionAnswer(raw);
  const expectedText = typeof expected === 'string' || typeof expected === 'number' ? String(expected) : format(expected);
  const observed = raw.trim();
  const correct = task.kind === 'compare'
    ? ['<', '>', '='].includes(observed) && observed === expected && expected === task.relation
    : task.kind === 'fraction-of'
      ? parsed !== null && Math.abs(parsed.n / parsed.d - task.expected) < 1e-9
      : parsed !== null && typeof expected !== 'string' && typeof expected !== 'number' && equal(parsed, expected);
  let misconception: FractionMisconception = 'unknown';
  let remediation: FractionDiagnosis['remediation'] = 'review-method';
  let evidence = 'La réponse est incorrecte, mais elle ne correspond pas à une erreur typique identifiable.';
  let confidence: FractionDiagnosis['confidence'] = correct ? 'none' : 'low';

  if (!correct && (task.kind === 'add' || task.kind === 'subtract')) {
    const { left: a, right: b } = task;
    const sameDenominator = a.d === b.d;
    const wrong = sameDenominator ? null : task.kind === 'add'
      ? normalizeFraction({ n: a.n + b.n, d: a.d + b.d })
      : normalizeFraction({ n: a.n - b.n, d: a.d - b.d });
    if (parsed && wrong && equal(parsed, wrong)) {
      misconception = 'fraction-add-denominators';
      remediation = 'visualise-parts';
      evidence = 'La réponse correspond à une opération séparée sur les numérateurs et les dénominateurs.';
      confidence = 'medium';
    } else if (parsed && sameDenominator && (parsed.n === a.n + (task.kind === 'add' ? b.n : -b.n)) && parsed.d !== a.d) {
      misconception = 'fraction-add-denominators';
      remediation = 'visualise-parts';
      evidence = 'Les numérateurs sont combinés, mais le dénominateur commun n’est pas conservé.';
      confidence = 'medium';
    } else if (!sameDenominator) {
      misconception = 'fraction-add-without-equivalence';
      remediation = 'common-denominator';
      evidence = 'La réponse ne correspond pas au résultat attendu ; vérifier si les fractions ont été rendues comparables avant l’opération.';
    }
  } else if (!correct && task.kind === 'simplify' && parsed) {
    const original = normalizeFraction(task.value);
    const expectedF = normalizeFraction(task.expected);
    if ((parsed.n === expectedF.n && parsed.d === original.d) || (parsed.d === expectedF.d && parsed.n === original.n)) {
      misconception = 'fraction-simplify-one-term';
      remediation = 'simplify-both-terms';
      evidence = 'Un seul terme semble avoir été modifié lors de la simplification.';
      confidence = 'medium';
    }
  } else if (!correct && task.kind === 'equivalent' && parsed) {
    const source = normalizeFraction(task.value);
    // Keep the unreduced target here: its numerator and denominator reveal which term the learner changed.
    const target = task.expected;
    if ((parsed.n === target.n && parsed.d === source.d) || (parsed.d === target.d && parsed.n === source.n)) {
      misconception = 'fraction-scale-one-term';
      remediation = 'equivalent-fractions';
      evidence = 'Un seul terme semble avoir été multiplié pour construire la fraction équivalente.';
      confidence = 'medium';
    }
  } else if (!correct && task.kind === 'compare') {
    misconception = 'unknown';
    remediation = 'compare-on-number-line';
    evidence = 'La relation choisie est incorrecte ; la stratégie de comparaison doit être explorée par une question complémentaire.';
  } else if (!correct && task.kind === 'divide') {
    const rawWrong = product(task.left, task.right);
    const wrong = Number.isSafeInteger(rawWrong.n) && Number.isSafeInteger(rawWrong.d) && rawWrong.d !== 0 ? normalizeFraction(rawWrong) : null;
    if (parsed && wrong && equal(parsed, wrong)) {
      misconception = 'fraction-divide-by-multiplying';
      remediation = 'invert-divisor';
      evidence = 'La réponse est compatible avec une multiplication par le diviseur au lieu de son inverse.';
      confidence = 'medium';
    }
  } else if (!correct && task.kind === 'fraction-of') {
    misconception = 'unknown';
    remediation = 'identify-whole';
    evidence = 'Le résultat est incorrect ; vérifier avec une représentation si le tout de référence a été identifié.';
  }

  return { correct, observed, expected: expectedText, misconception, confidence, confirmed: false, evidence, remediation };
}
