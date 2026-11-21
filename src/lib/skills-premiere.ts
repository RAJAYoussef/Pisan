// Parcours de 1ère (FR spécialité, CI, SN), 1ère Bac (MA) et Grade 11 (CCSS) : second degré,
// fonction exponentielle, produit scalaire, trigonométrie. Les suites, la dérivation et les
// probabilités de 1ère sont dans skills-lycee.ts.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Rng, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const rel = (v: number) => (v < 0 ? `−${String(-v).replace('.', ',')}` : String(v).replace('.', ','));
const term = (c: number, x: string, first = false) => {
  if (c === 0) return '';
  const abs = Math.abs(c), body = `${abs === 1 && x ? '' : String(abs).replace('.', ',')}${x}`;
  return first ? `${c < 0 ? '−' : ''}${body}` : ` ${c < 0 ? '−' : '+'} ${body}`;
};
/** ax² + bx + c écrit proprement : 2x² − x + 3. */
export const trinomial = (a: number, b: number, c: number) => (term(a, 'x²', true) + term(b, 'x') + term(c, '')).trim() || '0';
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}

// ═════════════ SECOND DEGRÉ ═════════════

function quadCanonical(seed: number): Activity {
  const rng = seeded(seed);
  const alpha = pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]), beta = pick(rng, [-5, -4, -1, 0, 2, 3, 6]);
  const b = -2 * alpha, c = alpha * alpha + beta;
  const sols = beta < 0 ? 2 : beta === 0 ? 1 : 0;
  return {
    title: t('Forme canonique', 'Vertex form', 'الشكل النموذجي', 'Forma canónica'),
    summary: `${trinomial(1, b, c)} = (x ${alpha < 0 ? '+' : '−'} ${Math.abs(alpha)})² ${beta < 0 ? '−' : '+'} ${Math.abs(beta)} : sommet (${rel(alpha)} ; ${rel(beta)})`,
    steps: [
      { type: 'number', answer: alpha, tolerance: 0, prompt: t(`f(x) = ${trinomial(1, b, c)}. On l’écrit (x − α)² + β. Que vaut α ?`, `f(x) = ${trinomial(1, b, c)}. Write it as (x − α)² + β. What is α?`, `f(x) = ${trinomial(1, b, c)}. ما قيمة α؟`, `f(x) = ${trinomial(1, b, c)}. ¿Cuánto vale α?`), hint: t(`α = −b ÷ 2a = ${rel(-b)} ÷ 2.`, `α = −b ÷ 2a = ${rel(-b)} ÷ 2.`, `α = −b ÷ 2a.`, `α = −b ÷ 2a.`) },
      { type: 'number', answer: beta, tolerance: 0, prompt: t('Et β (la valeur de f en α) ?', 'And β (the value of f at α)?', 'و β (قيمة f عند α)؟', '¿Y β (el valor de f en α)?'), hint: t(`β = f(${rel(alpha)}) = (${rel(alpha)})² ${b < 0 ? '−' : '+'} ${Math.abs(b)} × (${rel(alpha)}) + ${c}.`, `β = f(${rel(alpha)}).`, `β = f(${rel(alpha)}).`, `β = f(${rel(alpha)}).`) },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: sols, prompt: t('Combien de solutions a l’équation f(x) = 0 ?', 'How many solutions does f(x) = 0 have?', 'كم حلًا للمعادلة f(x) = 0؟', '¿Cuántas soluciones tiene f(x) = 0?'), hint: t(`(x − α)² = ${rel(-beta)} : un carré est toujours ≥ 0.`, `(x − α)² = ${rel(-beta)}: a square is never negative.`, `المربع دائمًا موجب.`, `Un cuadrado nunca es negativo.`) },
    ],
  };
}

function quadDiscriminant(seed: number): Activity {
  const rng = seeded(seed);
  if (rng() < 0.3) {
    const b = pick(rng, [-4, -2, 2, 4]), c = (b * b) / 4 + int(rng, 1, 5), d = b * b - 4 * c;
    return {
      title: t('Le discriminant', 'The discriminant', 'المميز', 'El discriminante'),
      summary: `Δ = ${b}² − 4 × ${c} = ${d} < 0 : aucune solution réelle`,
      steps: [
        { type: 'number', answer: d, tolerance: 0, prompt: t(`Calcule le discriminant de ${trinomial(1, b, c)}.`, `Work out the discriminant of ${trinomial(1, b, c)}.`, `احسب مميز ${trinomial(1, b, c)}.`, `Calcula el discriminante de ${trinomial(1, b, c)}.`), hint: t('Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.') },
        { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 0, prompt: t(`Combien de solutions a ${trinomial(1, b, c)} = 0 ?`, `How many solutions does ${trinomial(1, b, c)} = 0 have?`, `كم حلًا؟`, `¿Cuántas soluciones?`), hint: t('Δ < 0 : pas de solution réelle.', 'Δ < 0: no real solution.', 'Δ < 0: لا حل.', 'Δ < 0: sin solución.') },
      ],
    };
  }
  const a = pick(rng, [1, 1, 2, -1]), r1 = int(rng, -6, 3), r2 = r1 + int(rng, 1, 6);
  const b = -a * (r1 + r2), c = a * r1 * r2, d = b * b - 4 * a * c;
  return {
    title: t('Le discriminant', 'The discriminant', 'المميز', 'El discriminante'),
    summary: `Δ = ${d} > 0 : x₁ = ${rel(r1)}, x₂ = ${rel(r2)}`,
    steps: [
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Calcule le discriminant de ${trinomial(a, b, c)}.`, `Work out the discriminant of ${trinomial(a, b, c)}.`, `احسب مميز ${trinomial(a, b, c)}.`, `Calcula el discriminante de ${trinomial(a, b, c)}.`), hint: t(`Δ = b² − 4ac = (${rel(b)})² − 4 × ${rel(a)} × (${rel(c)}).`, `Δ = b² − 4ac = (${rel(b)})² − 4 × ${rel(a)} × (${rel(c)}).`, 'Δ = b² − 4ac.', 'Δ = b² − 4ac.') },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 2, prompt: t('Combien de solutions a l’équation = 0 ?', 'How many solutions does the equation = 0 have?', 'كم حلًا؟', '¿Cuántas soluciones?'), hint: t('Δ > 0 : deux solutions ; Δ = 0 : une ; Δ < 0 : aucune.', 'Δ > 0: two; Δ = 0: one; Δ < 0: none.', 'Δ > 0: حلان.', 'Δ > 0: dos.') },
      { type: 'number', answer: r1, tolerance: 0, prompt: t('Donne la plus petite solution.', 'Give the smaller solution.', 'أعط الحل الأصغر.', 'Da la solución menor.'), hint: t(`x = (−b ± √Δ) ÷ 2a, avec √${d} = ${Math.sqrt(d)}.`, `x = (−b ± √Δ) ÷ 2a, with √${d} = ${Math.sqrt(d)}.`, `√${d} = ${Math.sqrt(d)}.`, `√${d} = ${Math.sqrt(d)}.`) },
      { type: 'number', answer: r2, tolerance: 0, prompt: t('Et la plus grande ?', 'And the larger?', 'والأكبر؟', '¿Y la mayor?'), hint: t('L’autre signe devant √Δ.', 'The other sign in front of √Δ.', 'الإشارة الأخرى.', 'El otro signo.') },
    ],
  };
}

function quadFactor(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [2, 3, -2, -1]), r1 = int(rng, -5, 1), r2 = r1 + int(rng, 1, 5);
  const b = -a * (r1 + r2), c = a * r1 * r2;
  const f = (p: number, q: number, k: number) => same(`${k === 1 ? '' : k === -1 ? '−' : rel(k)}(x ${p < 0 ? '+' : '−'} ${Math.abs(p)})(x ${q < 0 ? '+' : '−'} ${Math.abs(q)})`.replace('(x − 0)', 'x').replace('(x + 0)', 'x'));
  const form = choices(rng, [f(r1, r2, a), f(-r1, -r2, a), f(r1, r2, 1)]);
  return {
    title: t('Factoriser un trinôme', 'Factorising a quadratic', 'تعميل ثلاثي الحدود', 'Factorizar un trinomio'),
    summary: `${trinomial(a, b, c)} = ${f(r1, r2, a).fr} · x₁ + x₂ = −b/a = ${rel(r1 + r2)}`,
    steps: [
      { type: 'choice', ...form, prompt: t(`${trinomial(a, b, c)} a pour racines ${rel(r1)} et ${rel(r2)}. Sa forme factorisée est…`, `${trinomial(a, b, c)} has roots ${rel(r1)} and ${rel(r2)}. Its factorised form is…`, `جذراه ${rel(r1)} و ${rel(r2)}. شكله المعمل…`, `Sus raíces son ${rel(r1)} y ${rel(r2)}. Su forma factorizada…`), hint: t('a(x − x₁)(x − x₂) : n’oublie pas le coefficient a devant, et (x − (−3)) = (x + 3).', 'a(x − x₁)(x − x₂): keep the leading coefficient a, and (x − (−3)) = (x + 3).', 'a(x − x₁)(x − x₂).', 'a(x − x₁)(x − x₂).') },
      { type: 'number', answer: r1 + r2, tolerance: 0, prompt: t('Vérifie avec la somme des racines : que vaut −b/a ?', 'Check with the sum of the roots: what is −b/a?', 'تحقق: كم يساوي −b/a؟', 'Comprueba: ¿cuánto vale −b/a?'), hint: t(`−(${rel(b)}) ÷ ${rel(a)} : c’est x₁ + x₂.`, `−(${rel(b)}) ÷ ${rel(a)}: it equals x₁ + x₂.`, `x₁ + x₂ = −b/a.`, `x₁ + x₂ = −b/a.`) },
    ],
  };
}

function quadSign(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [1, 2, -1, -2]), r1 = int(rng, -5, 1), r2 = r1 + int(rng, 2, 5);
  const b = -a * (r1 + r2), c = a * r1 * r2, mid = (r1 + r2) / 2;
  const pos = a > 0 ? `]−∞ ; ${rel(r1)}[ ∪ ]${rel(r2)} ; +∞[` : `]${rel(r1)} ; ${rel(r2)}[`;
  const neg = a > 0 ? `]${rel(r1)} ; ${rel(r2)}[` : `]−∞ ; ${rel(r1)}[ ∪ ]${rel(r2)} ; +∞[`;
  const sol = choices(rng, [same(pos), same(neg), same(`[${rel(r1)} ; ${rel(r2)}]`)]);
  return {
    title: t('Signe d’un trinôme', 'Sign of a quadratic', 'إشارة ثلاثي الحدود', 'Signo de un trinomio'),
    summary: `${trinomial(a, b, c)} : signe de a (${a > 0 ? '+' : '−'}) à l’extérieur des racines ${rel(r1)} et ${rel(r2)}`,
    steps: [
      { type: 'choice', options: [same('+'), same('−')], answer: a > 0 ? 1 : 0, prompt: t(`${trinomial(a, b, c)} a pour racines ${rel(r1)} et ${rel(r2)}. Quel est son signe en x = ${rel(mid)} ?`, `${trinomial(a, b, c)} has roots ${rel(r1)} and ${rel(r2)}. What is its sign at x = ${rel(mid)}?`, `ما إشارته عند x = ${rel(mid)}؟`, `¿Signo en x = ${rel(mid)}?`), hint: t('Entre les racines, le trinôme a le signe **contraire** de a.', 'Between the roots, the quadratic has the **opposite** sign to a.', 'بين الجذرين **عكس** إشارة a.', 'Entre las raíces, el signo **contrario** de a.') },
      { type: 'choice', ...sol, prompt: t(`Résous ${trinomial(a, b, c)} > 0.`, `Solve ${trinomial(a, b, c)} > 0.`, `حل ${trinomial(a, b, c)} > 0.`, `Resuelve ${trinomial(a, b, c)} > 0.`), hint: t(`Signe de a (${a > 0 ? '+' : '−'}) à l’extérieur des racines, contraire entre elles ; « > » : crochets ouverts.`, `Sign of a outside the roots, opposite between them; “>”: open brackets.`, 'إشارة a خارج الجذرين.', 'Signo de a fuera de las raíces.') },
    ],
  };
}

// ═════════════ FONCTION EXPONENTIELLE ═════════════

const sup = (n: number) => String(n).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);

function expRules(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 7), b = int(rng, 2, 6), c = int(rng, 2, 4), d = int(rng, 2, 5), e = a + int(rng, 1, 5);
  return {
    title: t('Propriétés de l’exponentielle', 'Exponential rules', 'خاصيات الدالة الأسية', 'Propiedades de la exponencial'),
    summary: `e${sup(a)} × e${sup(b)} = e${sup(a + b)} · (e${sup(c)})${sup(d)} = e${sup(c * d)} · e${sup(e)} ÷ e${sup(a)} = e${sup(e - a)}`,
    steps: [
      { type: 'number', answer: a + b, tolerance: 0, prompt: t(`e${sup(a)} × e${sup(b)} = eⁿ. Que vaut n ?`, `e${sup(a)} × e${sup(b)} = eⁿ. What is n?`, `e${sup(a)} × e${sup(b)} = eⁿ. ما n؟`, `e${sup(a)} × e${sup(b)} = eⁿ. ¿n?`), hint: t('eᵃ × eᵇ = eᵃ⁺ᵇ : on additionne les exposants.', 'eᵃ × eᵇ = eᵃ⁺ᵇ: add the exponents.', 'نجمع الأسس.', 'Se suman los exponentes.') },
      { type: 'number', answer: c * d, tolerance: 0, prompt: t(`(e${sup(c)})${sup(d)} = eⁿ. Que vaut n ?`, `(e${sup(c)})${sup(d)} = eⁿ. What is n?`, `(e${sup(c)})${sup(d)} = eⁿ. ما n؟`, `(e${sup(c)})${sup(d)} = eⁿ. ¿n?`), hint: t('(eᵃ)ᵏ = eᵏᵃ : on multiplie.', '(eᵃ)ᵏ = eᵏᵃ: multiply.', 'نضرب الأسين.', 'Se multiplican.') },
      { type: 'number', answer: e - a, tolerance: 0, prompt: t(`e${sup(e)} ÷ e${sup(a)} = eⁿ. Que vaut n ?`, `e${sup(e)} ÷ e${sup(a)} = eⁿ. What is n?`, `e${sup(e)} ÷ e${sup(a)} = eⁿ. ما n؟`, `e${sup(e)} ÷ e${sup(a)} = eⁿ. ¿n?`), hint: t('eᵃ ÷ eᵇ = eᵃ⁻ᵇ : on soustrait.', 'eᵃ ÷ eᵇ = eᵃ⁻ᵇ: subtract.', 'نطرح الأسين.', 'Se restan.') },
    ],
  };
}

function expEquation(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, -3, 5), p = int(rng, 2, 4), q = int(rng, -4, 4), r = p - 1, s = (p - r) * x + q;
  const k = int(rng, -3, 4);
  const ineq = choices(rng, [same(`x > ${rel(k)}`), same(`x < ${rel(k)}`), same(`x > e${sup(k)}`)]);
  const L1 = `${p}x${q ? (q < 0 ? ` − ${-q}` : ` + ${q}`) : ''}`, R1 = `${r === 1 ? '' : r}x${s ? (s < 0 ? ` − ${-s}` : ` + ${s}`) : ''}`;
  const m = int(rng, 1, 5);
  return {
    title: t('Équations avec l’exponentielle', 'Exponential equations', 'معادلات أسية', 'Ecuaciones exponenciales'),
    summary: `e^(${L1}) = e^(${R1}) ⇔ ${L1} = ${R1} ⇔ x = ${rel(x)}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous e^(${L1}) = e^(${R1}).`, `Solve e^(${L1}) = e^(${R1}).`, `حل e^(${L1}) = e^(${R1}).`, `Resuelve e^(${L1}) = e^(${R1}).`), hint: t('eᵃ = eᵇ ⇔ a = b : on égale les exposants, puis on résout l’équation du premier degré.', 'eᵃ = eᵇ ⇔ a = b: set the exponents equal and solve.', 'eᵃ = eᵇ ⇔ a = b.', 'eᵃ = eᵇ ⇔ a = b.') },
      { type: 'choice', ...ineq, prompt: t(`Résous eˣ > e${sup(k)}.`, `Solve eˣ > e${sup(k)}.`, `حل eˣ > e${sup(k)}.`, `Resuelve eˣ > e${sup(k)}.`), hint: t('exp est strictement croissante : elle conserve l’ordre.', 'exp is strictly increasing: it keeps the order.', 'الدالة الأسية تزايدية قطعًا.', 'exp es estrictamente creciente.') },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 0, prompt: t(`Combien de solutions a eˣ = −${m} ?`, `How many solutions does eˣ = −${m} have?`, `كم حلًا؟`, `¿Cuántas soluciones?`), hint: t('eˣ est toujours strictement positif.', 'eˣ is always strictly positive.', 'eˣ موجب قطعًا دائمًا.', 'eˣ siempre es positivo.') },
    ],
  };
}

function expDerivative(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [2, 3, -2, 4]), b = int(rng, -5, 5) || 1, k = pick(rng, [2, 3, -1, 5]);
  const der = choices(rng, [same(`${k === -1 ? '−' : k}e^(${k === -1 ? '−' : k}x)`), same(`e^(${k === -1 ? '−' : k}x)`), same(`${k === -1 ? '−' : k}x e^(${k === -1 ? '−' : k}x − 1)`)]);
  return {
    title: t('Dériver l’exponentielle', 'Differentiating exp', 'اشتقاق الدالة الأسية', 'Derivar la exponencial'),
    summary: `(eˣ)′ = eˣ ; (e^(kx))′ = k e^(kx) ; f(x) = ${a}eˣ ${b < 0 ? '−' : '+'} ${Math.abs(b)}x → f′(0) = ${a + b}`,
    steps: [
      { type: 'number', answer: a + b, tolerance: 0, prompt: t(`f(x) = ${a}eˣ ${b < 0 ? '−' : '+'} ${Math.abs(b)}x. Calcule f′(0).`, `f(x) = ${a}eˣ ${b < 0 ? '−' : '+'} ${Math.abs(b)}x. Work out f′(0).`, `احسب f′(0).`, `Calcula f′(0).`), hint: t(`f′(x) = ${a}eˣ ${b < 0 ? '−' : '+'} ${Math.abs(b)}, et e⁰ = 1.`, `f′(x) = ${a}eˣ ${b < 0 ? '−' : '+'} ${Math.abs(b)}, and e⁰ = 1.`, `e⁰ = 1.`, `e⁰ = 1.`) },
      { type: 'choice', ...der, prompt: t(`La dérivée de x ↦ e^(${k === -1 ? '−' : k}x) est…`, `The derivative of x ↦ e^(${k === -1 ? '−' : k}x) is…`, `مشتقة e^(${k === -1 ? '−' : k}x)…`, `La derivada de e^(${k === -1 ? '−' : k}x) es…`), hint: t('(e^(kx))′ = k e^(kx) : le facteur k « descend » devant.', '(e^(kx))′ = k e^(kx): the factor k comes down in front.', '(e^(kx))′ = k e^(kx).', '(e^(kx))′ = k e^(kx).') },
      { type: 'choice', options: [t('croissante', 'increasing', 'تزايدية', 'creciente'), t('décroissante', 'decreasing', 'تناقصية', 'decreciente')], answer: k > 0 ? 0 : 1, prompt: t(`Sur ℝ, x ↦ e^(${k === -1 ? '−' : k}x) est…`, `On ℝ, x ↦ e^(${k === -1 ? '−' : k}x) is…`, `على ℝ الدالة…`, `En ℝ la función es…`), hint: t('e^(kx) > 0 : le signe de la dérivée est celui de k.', 'e^(kx) > 0: the derivative has the sign of k.', 'إشارة المشتقة هي إشارة k.', 'El signo de la derivada es el de k.') },
    ],
  };
}

function expGrowth(seed: number): Activity {
  const rng = seeded(seed);
  const pct = pick(rng, [2, 4, 5, 10, 20]), u0 = pick(rng, [100, 200, 500, 1000]), up = rng() < 0.7;
  const q = up ? 1 + pct / 100 : 1 - pct / 100;
  const u2 = Math.round(u0 * q * q * 100) / 100;
  return {
    title: t('Croissance exponentielle', 'Exponential growth', 'النمو الأسي', 'Crecimiento exponencial'),
    summary: `${up ? '+' : '−'}${pct} % par an : × ${rel(q)} chaque année → u₂ = ${u0} × ${rel(q)}² = ${rel(u2)}`,
    steps: [
      { type: 'number', answer: q, tolerance: 1e-9, prompt: t(`Une population de ${u0} ${up ? 'augmente' : 'diminue'} de ${pct} % par an. Par quel nombre la multiplie-t-on chaque année ?`, `A population of ${u0} ${up ? 'grows' : 'falls'} by ${pct}% a year. What is it multiplied by each year?`, `ما المعامل الضربي؟`, `¿Por qué número se multiplica cada año?`), hint: t(`${up ? '+' : '−'} ${pct} % ⇔ × (1 ${up ? '+' : '−'} ${pct}/100).`, `${up ? '+' : '−'}${pct}% ⇔ × (1 ${up ? '+' : '−'} ${pct}/100).`, `× (1 ${up ? '+' : '−'} ${pct}/100).`, `× (1 ${up ? '+' : '−'} ${pct}/100).`) },
      { type: 'number', answer: u2, tolerance: 0.01, prompt: t('Combien après 2 ans ?', 'How many after 2 years?', 'كم بعد سنتين؟', '¿Cuántos tras 2 años?'), hint: t(`${u0} × ${rel(q)} × ${rel(q)}.`, `${u0} × ${rel(q)} × ${rel(q)}.`, `${u0} × ${rel(q)}².`, `${u0} × ${rel(q)}².`) },
      { type: 'choice', options: [t('géométrique', 'geometric', 'هندسية', 'geométrica'), t('arithmétique', 'arithmetic', 'حسابية', 'aritmética')], answer: 0, prompt: t('La suite des effectifs annuels est…', 'The sequence of yearly values is…', 'متتالية القيم السنوية…', 'La sucesión anual es…'), hint: t('On multiplie toujours par le même nombre.', 'You always multiply by the same number.', 'نضرب دائمًا في نفس العدد.', 'Siempre se multiplica por lo mismo.') },
    ],
  };
}

// ═════════════ PRODUIT SCALAIRE ═════════════

function dotCoords(seed: number): Activity {
  const rng = seeded(seed);
  const u = { x: int(rng, -4, 5) || 2, y: int(rng, -4, 5) || 3 };
  const orth = rng() < 0.5, k = pick(rng, [1, 2, -1]);
  const v = orth ? { x: -u.y * k, y: u.x * k } : { x: int(rng, -4, 5), y: int(rng, -4, 5) || 1 };
  const dot = u.x * v.x + u.y * v.y;
  return {
    title: t('Produit scalaire en coordonnées', 'Dot product from coordinates', 'الجداء السلمي بالإحداثيات', 'Producto escalar con coordenadas'),
    summary: `u·v = ${rel(u.x)} × ${rel(v.x)} + ${rel(u.y)} × ${rel(v.y)} = ${rel(dot)}`,
    steps: [
      { type: 'number', answer: dot, tolerance: 0, prompt: t(`u(${rel(u.x)} ; ${rel(u.y)}) et v(${rel(v.x)} ; ${rel(v.y)}). Calcule u · v.`, `u(${rel(u.x)}, ${rel(u.y)}) and v(${rel(v.x)}, ${rel(v.y)}). Work out u · v.`, `احسب u · v.`, `Calcula u · v.`), hint: t('u · v = xx′ + yy′.', 'u · v = xx′ + yy′.', 'u · v = xx′ + yy′.', 'u · v = xx′ + yy′.') },
      { type: 'choice', options: OUI_NON, answer: dot === 0 ? 0 : 1, prompt: t('u et v sont-ils orthogonaux ?', 'Are u and v orthogonal?', 'هل u و v متعامدتان؟', '¿Son ortogonales?'), hint: t('Orthogonaux ⇔ u · v = 0.', 'Orthogonal ⇔ u · v = 0.', 'متعامدتان ⇔ u · v = 0.', 'Ortogonales ⇔ u · v = 0.') },
    ],
  };
}

function dotNorm(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 6), b = int(rng, 2, 6) * 2;
  const [deg, cos] = pick(rng, [[60, 0.5], [120, -0.5], [90, 0], [0, 1], [180, -1]] as [number, number][]);
  const sign = choices(rng, [t(cos > 0 ? 'positif' : cos < 0 ? 'négatif' : 'nul', cos > 0 ? 'positive' : cos < 0 ? 'negative' : 'zero', cos > 0 ? 'موجب' : cos < 0 ? 'سالب' : 'منعدم', cos > 0 ? 'positivo' : cos < 0 ? 'negativo' : 'nulo'), ...[['positif', 'positive', 'موجب', 'positivo'], ['négatif', 'negative', 'سالب', 'negativo'], ['nul', 'zero', 'منعدم', 'nulo']].filter(([f]) => f !== (cos > 0 ? 'positif' : cos < 0 ? 'négatif' : 'nul')).map(([f, e, ar, es]) => t(f!, e!, ar!, es!))]);
  return {
    title: t('Produit scalaire et angle', 'Dot product and angle', 'الجداء السلمي والزاوية', 'Producto escalar y ángulo'),
    summary: `u · v = ‖u‖ × ‖v‖ × cos θ = ${a} × ${b} × cos ${deg}° = ${rel(a * b * cos)}`,
    steps: [
      { type: 'choice', ...sign, prompt: t(`L’angle entre u et v mesure ${deg}°. Le produit scalaire u · v est…`, `The angle between u and v is ${deg}°. The dot product u · v is…`, `الزاوية ${deg}°. الجداء السلمي…`, `El ángulo es ${deg}°. El producto escalar es…`), hint: t('Angle aigu : positif ; droit : nul ; obtus : négatif (signe de cos θ).', 'Acute: positive; right: zero; obtuse: negative (sign of cos θ).', 'إشارة cos θ.', 'Signo de cos θ.') },
      { type: 'number', answer: a * b * cos, tolerance: 1e-9, prompt: t(`‖u‖ = ${a}, ‖v‖ = ${b}. Calcule u · v.`, `‖u‖ = ${a}, ‖v‖ = ${b}. Work out u · v.`, `احسب u · v.`, `Calcula u · v.`), hint: t(`u · v = ‖u‖ × ‖v‖ × cos θ, et cos ${deg}° = ${rel(cos)}.`, `u · v = ‖u‖ × ‖v‖ × cos θ, and cos ${deg}° = ${cos}.`, `cos ${deg}° = ${rel(cos)}.`, `cos ${deg}° = ${rel(cos)}.`) },
    ],
  };
}

function dotOrthogonal(seed: number): Activity {
  const rng = seeded(seed);
  const m = int(rng, -4, 4) || 2, vx = pick(rng, [2, 3, 4, -2]), ux = pick(rng, [1, 2, 3, -3]);
  const vy = -(ux * vx) / m;
  if (!Number.isInteger(vy)) return dotOrthogonal(seed + 1000);
  return {
    title: t('Trouver une orthogonalité', 'Finding a perpendicular', 'إيجاد التعامد', 'Hallar la ortogonalidad'),
    summary: `u(${rel(ux)} ; m) · v(${rel(vx)} ; ${rel(vy)}) = 0 ⇔ m = ${rel(m)}`,
    steps: [
      { type: 'number', answer: m, tolerance: 0, prompt: t(`u(${rel(ux)} ; m) et v(${rel(vx)} ; ${rel(vy)}). Pour quelle valeur de m sont-ils orthogonaux ?`, `u(${rel(ux)}, m) and v(${rel(vx)}, ${rel(vy)}). For which m are they orthogonal?`, `متى تكونان متعامدتين؟`, `¿Para qué m son ortogonales?`), hint: t(`${rel(ux)} × ${rel(vx)} + m × (${rel(vy)}) = 0.`, `${rel(ux)} × ${rel(vx)} + m × (${rel(vy)}) = 0.`, `u · v = 0.`, `u · v = 0.`) },
      { type: 'choice', options: [t('rectangle en A', 'right-angled at A', 'قائم في A', 'rectángulo en A'), t('isocèle en A', 'isosceles at A', 'متساوي الساقين في A', 'isósceles en A'), t('équilatéral', 'equilateral', 'متساوي الأضلاع', 'equilátero')], answer: 0, prompt: t('Dans un triangle ABC, AB · AC = 0 signifie que le triangle est…', 'In triangle ABC, AB · AC = 0 means the triangle is…', 'AB · AC = 0 يعني أن المثلث…', 'AB · AC = 0 significa que el triángulo es…'), hint: t('Produit scalaire nul ⇔ vecteurs orthogonaux.', 'Zero dot product ⇔ perpendicular vectors.', 'جداء منعدم ⇔ تعامد.', 'Producto nulo ⇔ perpendiculares.') },
    ],
  };
}

const KASHI: [number, number, number, number][] = [[3, 8, 60, 7], [5, 8, 60, 7], [3, 5, 120, 7], [8, 15, 60, 13], [7, 15, 60, 13], [7, 8, 120, 13], [5, 21, 60, 19]];
function dotAlKashi(seed: number): Activity {
  const rng = seeded(seed);
  const [b, c, deg, a] = pick(rng, KASHI);
  const cos = deg === 60 ? 0.5 : -0.5;
  return {
    title: t('Formule d’Al-Kashi', 'The law of cosines', 'مبرهنة الكاشي', 'Teorema del coseno'),
    summary: `BC² = ${b}² + ${c}² − 2 × ${b} × ${c} × cos ${deg}° = ${a * a} → BC = ${a}`,
    steps: [
      { type: 'number', answer: a * a, tolerance: 0, prompt: t(`ABC : AB = ${b}, AC = ${c}, angle en A = ${deg}°. Calcule BC².`, `ABC: AB = ${b}, AC = ${c}, angle A = ${deg}°. Work out BC².`, `احسب BC².`, `Calcula BC².`), hint: t(`BC² = AB² + AC² − 2 × AB × AC × cos A, avec cos ${deg}° = ${rel(cos)}.`, `BC² = AB² + AC² − 2 × AB × AC × cos A, with cos ${deg}° = ${cos}.`, `BC² = AB² + AC² − 2 AB·AC cos A.`, `BC² = AB² + AC² − 2 AB·AC cos A.`) },
      { type: 'number', answer: a, tolerance: 0, prompt: t('Donc BC = ?', 'So BC = ?', 'إذن BC = ؟', 'Entonces BC = ?'), hint: t(`√${a * a}.`, `√${a * a}.`, `√${a * a}.`, `√${a * a}.`) },
    ],
  };
}

// ═════════════ TRIGONOMÉTRIE ═════════════

const COS: Record<number, string> = { 30: '√3/2', 45: '√2/2', 60: '1/2' };
const SIN: Record<number, string> = { 30: '1/2', 45: '√2/2', 60: '√3/2' };
const RADS: Record<number, string> = { 30: 'π/6', 45: 'π/4', 60: 'π/3' };
const OPP: Record<number, string> = { 30: '5π/6', 45: '3π/4', 60: '2π/3' };
const vals = (v: string) => [same(v), same(`−${v}`)];
const VALS = ['1/2', '√2/2', '√3/2'].flatMap(vals);

function trigAssociated(seed: number): Activity {
  const rng = seeded(seed);
  const d = pick(rng, [30, 45, 60]);
  const idx = (s: string) => VALS.findIndex(v => v.fr === s);
  return {
    title: t('Angles associés', 'Related angles', 'الزوايا المرتبطة', 'Ángulos asociados'),
    summary: `cos(π − x) = −cos x, sin(π − x) = sin x, cos(−x) = cos x, sin(−x) = −sin x`,
    steps: [
      { type: 'choice', options: VALS, answer: idx(`−${COS[d]}`), prompt: t(`cos(${OPP[d]}) = cos(π − ${RADS[d]}) = ?`, `cos(${OPP[d]}) = cos(π − ${RADS[d]}) = ?`, `cos(${OPP[d]}) = ؟`, `cos(${OPP[d]}) = ?`), hint: t(`M et son symétrique par rapport à l’axe vertical : l’abscisse change de signe. cos(${RADS[d]}) = ${COS[d]}.`, `Reflect M in the vertical axis: the x-coordinate changes sign. cos(${RADS[d]}) = ${COS[d]}.`, `cos(π − x) = −cos x.`, `cos(π − x) = −cos x.`) },
      { type: 'choice', options: VALS, answer: idx(SIN[d]!), prompt: t(`sin(${OPP[d]}) = ?`, `sin(${OPP[d]}) = ?`, `sin(${OPP[d]}) = ؟`, `sen(${OPP[d]}) = ?`), hint: t('Même ordonnée : sin(π − x) = sin x.', 'Same y-coordinate: sin(π − x) = sin x.', 'sin(π − x) = sin x.', 'sen(π − x) = sen x.') },
      { type: 'choice', options: VALS, answer: idx(`−${SIN[d]}`), prompt: t(`sin(−${RADS[d]}) = ?`, `sin(−${RADS[d]}) = ?`, `sin(−${RADS[d]}) = ؟`, `sen(−${RADS[d]}) = ?`), hint: t('Symétrique par rapport à l’axe horizontal : sin(−x) = −sin x.', 'Reflect in the horizontal axis: sin(−x) = −sin x.', 'sin(−x) = −sin x.', 'sen(−x) = −sen x.') },
    ],
  };
}

function trigEquation(seed: number): Activity {
  const rng = seeded(seed);
  const d = pick(rng, [30, 45, 60]), useCos = rng() < 0.5;
  const right = useCos ? `{−${RADS[d]} ; ${RADS[d]}}` : `{${RADS[d]} ; ${OPP[d]}}`;
  const wrong1 = useCos ? `{${RADS[d]} ; ${OPP[d]}}` : `{−${RADS[d]} ; ${RADS[d]}}`;
  const sol = choices(rng, [same(right), same(wrong1), same(`{${RADS[d]}}`)]);
  const v = useCos ? COS[d] : SIN[d];
  const interval = useCos ? ']−π ; π]' : '[0 ; π]';
  return {
    title: t('Équations trigonométriques', 'Trigonometric equations', 'معادلات مثلثية', 'Ecuaciones trigonométricas'),
    summary: `${useCos ? 'cos' : 'sin'} x = ${v} sur ${interval} : ${right}`,
    steps: [
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 2, prompt: t(`Combien de solutions a ${useCos ? 'cos' : 'sin'} x = ${v} sur ${interval} ?`, `How many solutions does ${useCos ? 'cos' : 'sin'} x = ${v} have on ${interval}?`, `كم حلًا على ${interval}؟`, `¿Cuántas soluciones en ${interval}?`), hint: t(`Trace la droite ${useCos ? 'verticale x' : 'horizontale y'} = ${v} : elle coupe le cercle en deux points.`, `Draw the ${useCos ? 'vertical line x' : 'horizontal line y'} = ${v}: it cuts the circle twice.`, `المستقيم يقطع الدائرة مرتين.`, `La recta corta el círculo dos veces.`) },
      { type: 'choice', ...sol, prompt: t('Les solutions sont…', 'The solutions are…', 'الحلول هي…', 'Las soluciones son…'), hint: t(useCos ? 'Les deux points ont la même abscisse : x et −x.' : 'Les deux points ont la même ordonnée : x et π − x.', useCos ? 'Same x-coordinate: x and −x.' : 'Same y-coordinate: x and π − x.', useCos ? 'x و −x.' : 'x و π − x.', useCos ? 'x y −x.' : 'x y π − x.') },
    ],
  };
}

function trigMeasure(seed: number): Activity {
  const rng = seeded(seed);
  const [n, d] = pick(rng, [[1, 6], [5, 6], [1, 4], [3, 4], [1, 3], [2, 3], [-1, 3], [-5, 6], [-3, 4]] as [number, number][]);
  const k = pick(rng, [1, 2, -1]), big = n + 2 * k * d;
  const f = (a: number) => `${a < 0 ? '−' : ''}${Math.abs(a) === 1 ? '' : Math.abs(a)}π/${d}`;
  const princ = choices(rng, [same(f(n)), same(f(-n)), same(f(n + (n > 0 ? -d : d)))]);
  return {
    title: t('Mesure principale', 'Principal measure', 'القياس الرئيسي', 'Medida principal'),
    summary: `${f(big)} = ${f(n)} + ${2 * k}π : mesure principale ${f(n)}`,
    steps: [
      { type: 'number', answer: Math.abs(k), tolerance: 0, prompt: t(`${f(big)} : combien de tours complets (2π) faut-il ${k > 0 ? 'enlever' : 'ajouter'} pour revenir dans ]−π ; π] ?`, `${f(big)}: how many full turns (2π) must you ${k > 0 ? 'remove' : 'add'} to land in (−π, π]?`, `كم دورة كاملة؟`, `¿Cuántas vueltas completas?`), hint: t(`2π = ${2 * d}π/${d}. Compare ${Math.abs(big)} à ${2 * d}.`, `2π = ${2 * d}π/${d}.`, `2π = ${2 * d}π/${d}.`, `2π = ${2 * d}π/${d}.`) },
      { type: 'choice', ...princ, prompt: t(`La mesure principale de ${f(big)} est…`, `The principal measure of ${f(big)} is…`, `القياس الرئيسي لـ ${f(big)}…`, `La medida principal de ${f(big)} es…`), hint: t(`${f(big)} − ${2 * k}π.`, `${f(big)} − ${2 * k}π.`, `${f(big)} − ${2 * k}π.`, `${f(big)} − ${2 * k}π.`) },
    ],
  };
}

function trigFunctions(seed: number): Activity {
  const rng = seeded(seed);
  const fn = rng() < 0.5 ? 'cos' : 'sin';
  const par = choices(rng, [t(fn === 'cos' ? 'paire' : 'impaire', fn === 'cos' ? 'even' : 'odd', fn === 'cos' ? 'زوجية' : 'فردية', fn === 'cos' ? 'par' : 'impar'), t(fn === 'cos' ? 'impaire' : 'paire', fn === 'cos' ? 'odd' : 'even', fn === 'cos' ? 'فردية' : 'زوجية', fn === 'cos' ? 'impar' : 'par'), t('ni l’un ni l’autre', 'neither', 'لا هذا ولا ذاك', 'ninguna')]);
  const per = choices(rng, [same('2π'), same('π'), same('π/2')]);
  return {
    title: t('Fonctions cosinus et sinus', 'Cosine and sine functions', 'دالتا الجيب وجيب التمام', 'Funciones coseno y seno'),
    summary: `cos et sin sont 2π-périodiques ; cos est paire (symétrie d’axe Oy), sin est impaire (symétrie de centre O)`,
    steps: [
      { type: 'choice', ...per, prompt: t(`Quelle est la période de ${fn} ?`, `What is the period of ${fn}?`, `ما دور ${fn}؟`, `¿Cuál es el período de ${fn}?`), hint: t('Un tour complet du cercle ramène au même point.', 'A full turn brings you back to the same point.', 'دورة كاملة تعيد إلى نفس النقطة.', 'Una vuelta completa vuelve al mismo punto.') },
      { type: 'choice', ...par, prompt: t(`La fonction ${fn} est…`, `The ${fn} function is…`, `الدالة ${fn}…`, `La función ${fn} es…`), hint: t(fn === 'cos' ? 'cos(−x) = cos x : paire.' : 'sin(−x) = −sin x : impaire.', fn === 'cos' ? 'cos(−x) = cos x: even.' : 'sin(−x) = −sin x: odd.', fn === 'cos' ? 'cos(−x) = cos x.' : 'sin(−x) = −sin x.', fn === 'cos' ? 'cos(−x) = cos x.' : 'sen(−x) = −sen x.') },
      { type: 'number', answer: fn === 'cos' ? 1 : 0, tolerance: 0, prompt: t(`Que vaut ${fn}(2026π) ?`, `What is ${fn}(2026π)?`, `كم يساوي ${fn}(2026π)؟`, `¿Cuánto vale ${fn}(2026π)?`), hint: t(`2026π = 1013 tours : on est revenu à 0, et ${fn}(0) = ${fn === 'cos' ? 1 : 0}.`, `2026π = 1013 turns: back at 0, and ${fn}(0) = ${fn === 'cos' ? 1 : 0}.`, `${fn}(0).`, `${fn}(0).`) },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const PREMIERE_SKILLS: Skill[] = [
  { id: 'quad-canonical', review: 0, chapter: 'quadratic', build: quadCanonical, title: s('Forme canonique', 'Vertex form', 'الشكل النموذجي', 'Forma canónica'), desc: s('Le sommet de la parabole.', 'The vertex of the parabola.', 'رأس الشلجم.', 'El vértice de la parábola.') },
  { id: 'quad-discriminant', review: 0, chapter: 'quadratic', build: quadDiscriminant, title: s('Discriminant et racines', 'Discriminant and roots', 'المميز والجذور', 'Discriminante y raíces'), desc: s('Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.') },
  { id: 'quad-factor', review: 0, chapter: 'quadratic', build: quadFactor, title: s('Factoriser un trinôme', 'Factorise a quadratic', 'تعميل ثلاثي الحدود', 'Factorizar un trinomio'), desc: s('a(x − x₁)(x − x₂).', 'a(x − x₁)(x − x₂).', 'a(x − x₁)(x − x₂).', 'a(x − x₁)(x − x₂).') },
  { id: 'quad-sign', review: 0, chapter: 'quadratic', build: quadSign, title: s('Signe d’un trinôme', 'Sign of a quadratic', 'إشارة ثلاثي الحدود', 'Signo de un trinomio'), desc: s('Signe de a à l’extérieur des racines.', 'Sign of a outside the roots.', 'إشارة a خارج الجذرين.', 'Signo de a fuera de las raíces.') },
  { id: 'exp-rules', review: 0, chapter: 'expo', build: expRules, title: s('Propriétés de eˣ', 'Rules for eˣ', 'خاصيات eˣ', 'Propiedades de eˣ'), desc: s('Comme les puissances.', 'Like powers.', 'مثل القوى.', 'Como las potencias.') },
  { id: 'exp-equation', review: 0, chapter: 'expo', build: expEquation, title: s('Équations et inéquations', 'Equations and inequalities', 'المعادلات والمتراجحات', 'Ecuaciones e inecuaciones'), desc: s('eᵃ = eᵇ ⇔ a = b.', 'eᵃ = eᵇ ⇔ a = b.', 'eᵃ = eᵇ ⇔ a = b.', 'eᵃ = eᵇ ⇔ a = b.') },
  { id: 'exp-derivative', review: 0, chapter: 'expo', build: expDerivative, title: s('Dériver eˣ', 'Differentiate eˣ', 'اشتقاق eˣ', 'Derivar eˣ'), desc: s('Sa propre dérivée.', 'Its own derivative.', 'مشتقة نفسها.', 'Su propia derivada.') },
  { id: 'exp-growth', review: 1, chapter: 'expo', build: expGrowth, title: s('Croissance exponentielle', 'Exponential growth', 'النمو الأسي', 'Crecimiento exponencial'), desc: s('Pourcentages répétés.', 'Repeated percentages.', 'نسب مئوية متكررة.', 'Porcentajes repetidos.') },
  { id: 'dot-coords', review: 0, chapter: 'scalar', build: dotCoords, title: s('En coordonnées', 'From coordinates', 'بالإحداثيات', 'Con coordenadas'), desc: s('xx′ + yy′.', 'xx′ + yy′.', 'xx′ + yy′.', 'xx′ + yy′.') },
  { id: 'dot-norm', review: 0, chapter: 'scalar', build: dotNorm, title: s('Avec l’angle', 'With the angle', 'بالزاوية', 'Con el ángulo'), desc: s('‖u‖ ‖v‖ cos θ.', '‖u‖ ‖v‖ cos θ.', '‖u‖ ‖v‖ cos θ.', '‖u‖ ‖v‖ cos θ.') },
  { id: 'dot-orthogonal', review: 0, chapter: 'scalar', build: dotOrthogonal, title: s('Orthogonalité', 'Orthogonality', 'التعامد', 'Ortogonalidad'), desc: s('Produit scalaire nul.', 'Zero dot product.', 'جداء سلمي منعدم.', 'Producto escalar nulo.') },
  { id: 'dot-alkashi', review: 0, chapter: 'scalar', build: dotAlKashi, title: s('Al-Kashi', 'Law of cosines', 'مبرهنة الكاشي', 'Teorema del coseno'), desc: s('Pythagore généralisé.', 'Pythagoras generalised.', 'فيثاغورس معممة.', 'Pitágoras generalizado.') },
  { id: 'trig-associated', review: 0, chapter: 'trigfn', build: trigAssociated, title: s('Angles associés', 'Related angles', 'الزوايا المرتبطة', 'Ángulos asociados'), desc: s('π − x, −x.', 'π − x, −x.', 'π − x و −x.', 'π − x, −x.') },
  { id: 'trig-equation', review: 0, chapter: 'trigfn', build: trigEquation, title: s('Équations', 'Equations', 'المعادلات', 'Ecuaciones'), desc: s('cos x = a, sin x = a.', 'cos x = a, sin x = a.', 'cos x = a و sin x = a.', 'cos x = a, sen x = a.') },
  { id: 'trig-measure', review: 0, chapter: 'trigfn', build: trigMeasure, title: s('Mesure principale', 'Principal measure', 'القياس الرئيسي', 'Medida principal'), desc: s('Enlever des tours.', 'Remove full turns.', 'حذف الدورات.', 'Quitar vueltas.') },
  { id: 'trig-functions', review: 1, chapter: 'trigfn', build: trigFunctions, title: s('Cosinus et sinus', 'Cosine and sine', 'الجيب وجيب التمام', 'Coseno y seno'), desc: s('Période, parité.', 'Period, parity.', 'الدور والزوجية.', 'Período, paridad.') },
];
