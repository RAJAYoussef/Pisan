// Parcours de 4e (FR, CI, SN), 2e année collège (MA) et Grade 8 (CCSS) : produits et quotients de relatifs,
// puissances de 10 et notation scientifique, calcul littéral (double distributivité), équations du premier degré.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Rng, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
/** Relatif écrit avec le vrai signe moins, et entre parenthèses s'il est négatif. */
const rel = (v: number) => (v < 0 ? `−${-v}` : String(v));
const par = (v: number) => (v < 0 ? `(${rel(v)})` : rel(v));
/** Exposant (éventuellement négatif) en chiffres supérieurs : 10⁻³. */
const sup = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
/** Décimal à la française, sans erreur d'arrondi binaire. */
const dec = (v: number) => String(Number(v.toPrecision(12))).replace('.', ',');
/** Terme « a x » d'une expression : 1x → x, −1x → −x. */
const term = (a: number, x = 'x') => (a === 1 ? x : a === -1 ? `−${x}` : `${rel(a)}${x}`);
/** « + b » ou « − b ». */
const plus = (b: number) => (b < 0 ? ` − ${-b}` : ` + ${b}`);
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}
const SIGN = [same('+'), same('−')];

// ═════════════ PRODUITS ET QUOTIENTS DE RELATIFS ═════════════

function signsRule(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 3, 5);
  const factors = Array.from({ length: n }, () => int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1));
  const negatives = factors.filter(v => v < 0).length;
  const a = int(rng, 2, 9), b = int(rng, 2, 9);
  return {
    title: t('La règle des signes', 'The sign rule', 'قاعدة الإشارات', 'La regla de los signos'),
    summary: `un nombre pair de facteurs négatifs → produit positif ; impair → négatif · ${par(-a)} × ${b} = ${rel(-a * b)}`,
    steps: [
      { type: 'number', answer: -a * b, tolerance: 0, prompt: t(`Calcule ${par(-a)} × ${b}.`, `Work out ${par(-a)} × ${b}.`, `احسب ${par(-a)} × ${b}.`, `Calcula ${par(-a)} × ${b}.`), hint: t(`Un négatif fois un positif donne un négatif : ${a} × ${b} = ${a * b}, avec le signe −.`, `Negative times positive is negative: ${a} × ${b} = ${a * b}, with a − sign.`, `سالب ضرب موجب يعطي سالبًا.`, `Negativo por positivo da negativo.`) },
      { type: 'number', answer: a * b, tolerance: 0, prompt: t(`Calcule ${par(-a)} × ${par(-b)}.`, `Work out ${par(-a)} × ${par(-b)}.`, `احسب ${par(-a)} × ${par(-b)}.`, `Calcula ${par(-a)} × ${par(-b)}.`), hint: t('Deux négatifs : le produit est positif.', 'Two negatives make a positive product.', 'سالبان: الجداء موجب.', 'Dos negativos: el producto es positivo.') },
      { type: 'choice', options: SIGN, answer: negatives % 2 === 0 ? 0 : 1, prompt: t(`Sans calculer, quel est le signe de ${factors.map(par).join(' × ')} ?`, `Without working it out, what is the sign of ${factors.map(par).join(' × ')}?`, `دون حساب، ما إشارة ${factors.map(par).join(' × ')}؟`, `Sin calcular, ¿qué signo tiene ${factors.map(par).join(' × ')}?`), hint: t(`Compte les facteurs négatifs : il y en a ${negatives}. Pair → +, impair → −.`, `Count the negative factors: there are ${negatives}. Even → +, odd → −.`, `عدد العوامل السالبة: ${negatives}. زوجي ← +، فردي ← −.`, `Hay ${negatives} factores negativos. Par → +, impar → −.`) },
    ],
  };
}

function signsQuotient(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 2, 9), c = int(rng, 2, 9), d = int(rng, 2, 6);
  const frac = choices(rng, [same(String(d)), same(`−${d}`), same(`1/${d}`)]);
  return {
    title: t('Diviser des relatifs', 'Dividing signed numbers', 'قسمة الأعداد النسبية', 'Dividir números relativos'),
    summary: `${par(-a * b)} ÷ ${b} = ${rel(-a)} · ${par(-c * b)} ÷ ${par(-b)} = ${c} : mêmes règles de signes que pour le produit`,
    steps: [
      { type: 'number', answer: -a, tolerance: 0, prompt: t(`Calcule ${par(-a * b)} ÷ ${b}.`, `Work out ${par(-a * b)} ÷ ${b}.`, `احسب ${par(-a * b)} ÷ ${b}.`, `Calcula ${par(-a * b)} ÷ ${b}.`), hint: t(`${a * b} ÷ ${b} = ${a}, et les signes sont différents : résultat négatif.`, `${a * b} ÷ ${b} = ${a}, and the signs differ: negative result.`, `الإشارتان مختلفتان: النتيجة سالبة.`, `Signos distintos: resultado negativo.`) },
      { type: 'number', answer: c, tolerance: 0, prompt: t(`Calcule ${par(-c * b)} ÷ ${par(-b)}.`, `Work out ${par(-c * b)} ÷ ${par(-b)}.`, `احسب ${par(-c * b)} ÷ ${par(-b)}.`, `Calcula ${par(-c * b)} ÷ ${par(-b)}.`), hint: t('Même signe : le quotient est positif.', 'Same sign: the quotient is positive.', 'نفس الإشارة: الخارج موجب.', 'Mismo signo: cociente positivo.') },
      { type: 'choice', ...frac, prompt: t(`Simplifie : ${rel(-2 * d)} / ${rel(-2)}`, `Simplify: ${rel(-2 * d)} / ${rel(-2)}`, `بسّط: ${rel(-2 * d)} / ${rel(-2)}`, `Simplifica: ${rel(-2 * d)} / ${rel(-2)}`), hint: t('Un trait de fraction est une division : négatif ÷ négatif = positif.', 'A fraction bar is a division: negative ÷ negative = positive.', 'خط الكسر قسمة: سالب ÷ سالب = موجب.', 'La raya de fracción es una división: negativo ÷ negativo = positivo.') },
    ],
  };
}

function signsMixed(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 2, 6), c = int(rng, 2, 5), e = int(rng, 2, 9), f = int(rng, 2, 9);
  return {
    title: t('Calculs avec des relatifs', 'Mixed calculations', 'حسابات بالأعداد النسبية', 'Cálculos con relativos'),
    summary: `${par(-a)} + ${b} × ${par(-c)} = ${rel(-a - b * c)} : la multiplication d’abord`,
    steps: [
      { type: 'number', answer: -a - b * c, tolerance: 0, prompt: t(`Calcule ${rel(-a)} + ${b} × ${par(-c)}.`, `Work out ${rel(-a)} + ${b} × ${par(-c)}.`, `احسب ${rel(-a)} + ${b} × ${par(-c)}.`, `Calcula ${rel(-a)} + ${b} × ${par(-c)}.`), hint: t(`Priorité à la multiplication : ${b} × ${par(-c)} = ${rel(-b * c)}, puis ${rel(-a)} + ${par(-b * c)}.`, `Multiply first: ${b} × ${par(-c)} = ${rel(-b * c)}, then add.`, `الضرب أولًا: ${rel(-b * c)} ثم الجمع.`, `Primero multiplica: ${rel(-b * c)}, luego suma.`) },
      { type: 'number', answer: (-e) * (f - e), tolerance: 0, prompt: t(`Calcule ${par(-e)} × (${f} − ${e}).`, `Work out ${par(-e)} × (${f} − ${e}).`, `احسب ${par(-e)} × (${f} − ${e}).`, `Calcula ${par(-e)} × (${f} − ${e}).`), hint: t(`La parenthèse d’abord : ${f} − ${e} = ${rel(f - e)}.`, `Brackets first: ${f} − ${e} = ${rel(f - e)}.`, `الأقواس أولًا: ${rel(f - e)}.`, `Primero el paréntesis: ${rel(f - e)}.`) },
      { type: 'number', answer: c * c, tolerance: 0, prompt: t(`Calcule ${par(-c)}².`, `Work out ${par(-c)}².`, `احسب ${par(-c)}².`, `Calcula ${par(-c)}².`), hint: t(`${par(-c)}² = ${par(-c)} × ${par(-c)} : deux négatifs, le résultat est positif.`, `${par(-c)}² = ${par(-c)} × ${par(-c)}: two negatives, positive result.`, `سالبان: النتيجة موجبة.`, `Dos negativos: resultado positivo.`) },
    ],
  };
}

function signsSquareTrap(seed: number): Activity {
  const rng = seeded(seed);
  const c = int(rng, 2, 9), x = int(rng, 2, 6), k = int(rng, 2, 5);
  const opts = choices(rng, [same(`−${c * c}`), same(String(c * c)), same(`−${2 * c}`)]);
  return {
    title: t('Le piège de −3²', 'The −3² trap', 'فخ −3²', 'La trampa de −3²'),
    summary: `(−${c})² = ${c * c} mais −${c}² = −${c * c} · pour x = −${x} : ${k}x² = ${k * x * x}`,
    steps: [
      { type: 'choice', ...opts, prompt: t(`Combien vaut −${c}² (sans parenthèses) ?`, `What is −${c}² (no brackets)?`, `كم يساوي −${c}² (دون أقواس)؟`, `¿Cuánto vale −${c}² (sin paréntesis)?`), hint: t(`Le carré ne porte que sur ${c} : −${c}² = −(${c} × ${c}).`, `Only ${c} is squared: −${c}² = −(${c} × ${c}).`, `المربع يخص ${c} فقط.`, `Solo ${c} va al cuadrado.`) },
      { type: 'number', answer: k * x * x, tolerance: 0, prompt: t(`Calcule ${k}x² pour x = −${x}.`, `Work out ${k}x² when x = −${x}.`, `احسب ${k}x² من أجل x = −${x}.`, `Calcula ${k}x² para x = −${x}.`), hint: t(`Remplace x par (−${x}) avec ses parenthèses : ${k} × (−${x})².`, `Replace x with (−${x}), brackets included: ${k} × (−${x})².`, `عوّض x بـ (−${x}) مع الأقواس.`, `Sustituye x por (−${x}) con paréntesis.`) },
      { type: 'number', answer: -k * x, tolerance: 0, prompt: t(`Combien vaut ${k}x pour x = −${x} ?`, `What is ${k}x when x = −${x}?`, `كم يساوي ${k}x من أجل x = −${x}؟`, `¿Cuánto vale ${k}x para x = −${x}?`), hint: t(`${k} × (−${x}).`, `${k} × (−${x}).`, `${k} × (−${x}).`, `${k} × (−${x}).`) },
    ],
  };
}

// ═════════════ PUISSANCES DE 10, NOTATION SCIENTIFIQUE ═════════════

function sciNegative(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 2, 6), m = int(rng, 2, 5);
  const val = choices(rng, [same(dec(10 ** -m)), same(`−${10 ** m}`), same(dec(10 ** -(m + 1)))]);
  return {
    title: t('Les puissances de 10 négatives', 'Negative powers of 10', 'قوى العدد 10 السالبة', 'Potencias de 10 negativas'),
    summary: `10${sup(-n)} = 1/10${sup(n)} = ${dec(10 ** -n)} (${n} chiffres après la virgule)`,
    steps: [
      { type: 'choice', ...val, prompt: t(`Combien vaut 10${sup(-m)} ?`, `What is 10${sup(-m)}?`, `كم يساوي 10${sup(-m)}؟`, `¿Cuánto vale 10${sup(-m)}?`), hint: t(`10${sup(-m)} = 1 ÷ 10${sup(m)} : ce n’est pas un nombre négatif, c’est un nombre très petit.`, `10${sup(-m)} = 1 ÷ 10${sup(m)}: not negative, just very small.`, `10${sup(-m)} = 1 ÷ 10${sup(m)}: ليس سالبًا بل صغيرًا جدًا.`, `10${sup(-m)} = 1 ÷ 10${sup(m)}: no es negativo, es muy pequeño.`) },
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Combien de chiffres y a-t-il après la virgule dans l’écriture décimale de 10${sup(-n)} ?`, `How many digits after the decimal point in 10${sup(-n)}?`, `كم رقمًا بعد الفاصلة في الكتابة العشرية لـ 10${sup(-n)}؟`, `¿Cuántas cifras tras la coma tiene 10${sup(-n)}?`), hint: t(`10⁻¹ = 0,1 ; 10⁻² = 0,01 ; le 1 est au rang ${n} après la virgule.`, `10⁻¹ = 0.1, 10⁻² = 0.01: the 1 is in place ${n} after the point.`, `10⁻¹ = 0,1 ؛ 10⁻² = 0,01.`, `10⁻¹ = 0,1; 10⁻² = 0,01.`) },
      { type: 'number', answer: -n, tolerance: 0, prompt: t(`${dec(10 ** -n)} = 10ⁿ. Que vaut n ?`, `${dec(10 ** -n)} = 10ⁿ. What is n?`, `${dec(10 ** -n)} = 10ⁿ. ما قيمة n؟`, `${dec(10 ** -n)} = 10ⁿ. ¿Cuánto vale n?`), hint: t('Compte les rangs après la virgule jusqu’au 1, et mets le signe −.', 'Count the places after the point up to the 1, with a − sign.', 'عد المراتب بعد الفاصلة حتى 1 وضع الإشارة −.', 'Cuenta los lugares hasta el 1 y pon el signo −.') },
    ],
  };
}

function sciRules(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 7), b = int(rng, -5, 6) || 3, c = int(rng, 3, 9), d = int(rng, -4, 2) || -2, e = int(rng, 2, 4), f = int(rng, 2, 3);
  return {
    title: t('Calculer avec les puissances de 10', 'Rules for powers of 10', 'الحساب بقوى العدد 10', 'Reglas de las potencias de 10'),
    summary: `10${sup(a)} × 10${sup(b)} = 10${sup(a + b)} · 10${sup(c)} ÷ 10${sup(d)} = 10${sup(c - d)} · (10${sup(e)})${sup(f)} = 10${sup(e * f)}`,
    steps: [
      { type: 'number', answer: a + b, tolerance: 0, prompt: t(`10${sup(a)} × 10${sup(b)} = 10ⁿ. Que vaut n ?`, `10${sup(a)} × 10${sup(b)} = 10ⁿ. What is n?`, `10${sup(a)} × 10${sup(b)} = 10ⁿ. ما قيمة n؟`, `10${sup(a)} × 10${sup(b)} = 10ⁿ. ¿n?`), hint: t('On multiplie : on additionne les exposants.', 'Multiplying: add the exponents.', 'عند الضرب نجمع الأسس.', 'Al multiplicar se suman los exponentes.') },
      { type: 'number', answer: c - d, tolerance: 0, prompt: t(`10${sup(c)} ÷ 10${sup(d)} = 10ⁿ. Que vaut n ?`, `10${sup(c)} ÷ 10${sup(d)} = 10ⁿ. What is n?`, `10${sup(c)} ÷ 10${sup(d)} = 10ⁿ. ما قيمة n؟`, `10${sup(c)} ÷ 10${sup(d)} = 10ⁿ. ¿n?`), hint: t(`On divise : on soustrait les exposants, ${c} − ${par(d)}.`, `Dividing: subtract the exponents, ${c} − ${par(d)}.`, `عند القسمة نطرح الأسس.`, `Al dividir se restan los exponentes.`) },
      { type: 'number', answer: e * f, tolerance: 0, prompt: t(`(10${sup(e)})${sup(f)} = 10ⁿ. Que vaut n ?`, `(10${sup(e)})${sup(f)} = 10ⁿ. What is n?`, `(10${sup(e)})${sup(f)} = 10ⁿ. ما قيمة n؟`, `(10${sup(e)})${sup(f)} = 10ⁿ. ¿n?`), hint: t('Une puissance de puissance : on multiplie les exposants.', 'A power of a power: multiply the exponents.', 'قوة لقوة: نضرب الأسس.', 'Potencia de potencia: se multiplican.') },
    ],
  };
}

function sciNotation(seed: number): Activity {
  const rng = seeded(seed);
  const digits = int(rng, 12, 98), n = int(rng, 3, 7);
  const big = digits * 10 ** (n - 1);
  const mant = digits / 10;
  const k = int(rng, 2, 4), sd = int(rng, 11, 99), small = sd / 10 ** (k + 1);
  const mantissa = choices(rng, [same(dec(mant)), same(String(digits)), same(dec(mant / 10))]);
  return {
    title: t('La notation scientifique', 'Scientific notation', 'الكتابة العلمية', 'Notación científica'),
    summary: `${big.toLocaleString('fr-FR')} = ${dec(mant)} × 10${sup(n)} · ${dec(small)} = ${dec(sd / 10)} × 10${sup(-k)} (un seul chiffre non nul avant la virgule)`,
    steps: [
      { type: 'choice', ...mantissa, prompt: t(`On écrit ${big.toLocaleString('fr-FR')} sous la forme a × 10ⁿ, avec 1 ≤ a < 10. Que vaut a ?`, `Write ${big.toLocaleString('en-US')} as a × 10ⁿ with 1 ≤ a < 10. What is a?`, `نكتب ${big} على شكل a × 10ⁿ حيث 1 ≤ a < 10. ما قيمة a؟`, `Se escribe ${big.toLocaleString('es-ES')} como a × 10ⁿ, con 1 ≤ a < 10. ¿a?`), hint: t('a doit avoir un seul chiffre (non nul) avant la virgule.', 'a must have exactly one non-zero digit before the point.', 'يجب أن يكون لـ a رقم واحد غير منعدم قبل الفاصلة.', 'a debe tener una sola cifra no nula antes de la coma.') },
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Et l’exposant n ?`, `And the exponent n?`, `وما الأس n؟`, `¿Y el exponente n?`), hint: t(`De ${dec(mant)} à ${big.toLocaleString('fr-FR')}, de combien de rangs la virgule se déplace-t-elle ?`, `How many places does the point move from ${dec(mant)} to ${big}?`, `بكم مرتبة تنتقل الفاصلة؟`, `¿Cuántos lugares se mueve la coma?`) },
      { type: 'number', answer: -k, tolerance: 0, prompt: t(`${dec(small)} = ${dec(sd / 10)} × 10ⁿ. Que vaut n ?`, `${dec(small)} = ${dec(sd / 10)} × 10ⁿ. What is n?`, `${dec(small)} = ${dec(sd / 10)} × 10ⁿ. ما قيمة n؟`, `${dec(small)} = ${dec(sd / 10)} × 10ⁿ. ¿n?`), hint: t('Le nombre est plus petit que 1 : l’exposant est négatif.', 'The number is less than 1: the exponent is negative.', 'العدد أصغر من 1: الأس سالب.', 'El número es menor que 1: exponente negativo.') },
    ],
  };
}

function sciDecimal(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 11, 99) / 10, n = int(rng, 2, 5), b = int(rng, 11, 99) / 10, m = int(rng, 1, 3);
  const pairs = shuffle(rng, [[a, n], [b, -m]] as [number, number][]);
  const cmp = choices(rng, [same(`${dec(a)} × 10${sup(n)}`), same(`${dec(b)} × 10${sup(-m)}`)]);
  return {
    title: t('De la notation scientifique au nombre', 'From scientific notation to a number', 'من الكتابة العلمية إلى العدد', 'De la notación científica al número'),
    summary: pairs.map(([x, e]) => `${dec(x)} × 10${sup(e)} = ${dec(x * 10 ** e)}`).join(' · '),
    steps: [
      ...pairs.map(([x, e]) => ({ type: 'number' as const, answer: Number((x * 10 ** e).toPrecision(12)), tolerance: 1e-9, prompt: t(`Écris en écriture décimale : ${dec(x)} × 10${sup(e)}.`, `Write as a decimal: ${dec(x)} × 10${sup(e)}.`, `اكتب كتابة عشرية: ${dec(x)} × 10${sup(e)}.`, `Escribe en forma decimal: ${dec(x)} × 10${sup(e)}.`), hint: t(e > 0 ? `× 10${sup(e)} : la virgule avance de ${e} rangs vers la droite.` : `× 10${sup(e)} : la virgule recule de ${-e} rang(s) vers la gauche.`, e > 0 ? `× 10${sup(e)}: move the point ${e} places right.` : `× 10${sup(e)}: move the point ${-e} place(s) left.`, e > 0 ? `الفاصلة تتقدم ${e} مراتب نحو اليمين.` : `الفاصلة ترجع ${-e} مراتب نحو اليسار.`, e > 0 ? `La coma avanza ${e} lugares.` : `La coma retrocede ${-e} lugares.`) })),
      { type: 'choice', ...cmp, prompt: t('Lequel de ces deux nombres est le plus grand ?', 'Which of these two numbers is larger?', 'أي العددين أكبر؟', '¿Cuál de los dos es mayor?'), hint: t('Compare d’abord les exposants : c’est l’ordre de grandeur.', 'Compare the exponents first: they give the size.', 'قارن الأسس أولًا.', 'Compara primero los exponentes.') },
    ],
  };
}

// ═════════════ CALCUL LITTÉRAL ═════════════

function litReduce(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 1, 9), c = int(rng, 1, 5), d = int(rng, 1, 9);
  const k = int(rng, 2, 6);
  const sq = choices(rng, [same(`${k}x²`), same(`${k + 1}x`), same(`${k}x`)]);
  return {
    title: t('Réduire une expression', 'Simplifying an expression', 'اختزال تعبير', 'Reducir una expresión'),
    summary: `${a}x + ${b} − ${c}x + ${d} = ${term(a - c)} + ${b + d} · x × ${k}x = ${k}x²`,
    steps: [
      { type: 'number', answer: a - c, tolerance: 0, prompt: t(`Réduis ${a}x + ${b} − ${c}x + ${d} = …x + … Combien de x ?`, `Simplify ${a}x + ${b} − ${c}x + ${d} = …x + … How many x?`, `اختزل ${a}x + ${b} − ${c}x + ${d}. كم x؟`, `Reduce ${a}x + ${b} − ${c}x + ${d}. ¿Cuántas x?`), hint: t(`Regroupe les termes en x : ${a}x − ${c}x.`, `Group the x terms: ${a}x − ${c}x.`, `اجمع حدود x: ${a}x − ${c}x.`, `Agrupa las x: ${a}x − ${c}x.`) },
      { type: 'number', answer: b + d, tolerance: 0, prompt: t('Et le nombre seul ?', 'And the constant?', 'والعدد الثابت؟', '¿Y el término independiente?'), hint: t(`${b} + ${d}.`, `${b} + ${d}.`, `${b} + ${d}.`, `${b} + ${d}.`) },
      { type: 'choice', ...sq, prompt: t(`Réduis x × ${k}x.`, `Simplify x × ${k}x.`, `اختزل x × ${k}x.`, `Reduce x × ${k}x.`), hint: t('x × x = x² : on multiplie, on n’additionne pas.', 'x × x = x²: multiplying, not adding.', 'x × x = x².', 'x × x = x².') },
    ],
  };
}

function litDouble(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 1, 7), b = int(rng, -6, 6) || 2;
  return {
    title: t('La double distributivité', 'Expanding double brackets', 'التوزيعية المزدوجة', 'La doble distributiva'),
    summary: `(x + ${a})(x${plus(b)}) = x² + ${a}x${plus(b).replace(String(Math.abs(b)), `${Math.abs(b)}x`)}${plus(a * b)} = x²${plus(a + b)}x${plus(a * b)}`,
    steps: [
      { type: 'number', answer: a + b, tolerance: 0, prompt: t(`Développe (x + ${a})(x${plus(b)}) = x² + …x + … Quel est le coefficient de x ?`, `Expand (x + ${a})(x${plus(b)}) = x² + …x + … What is the x coefficient?`, `انشر (x + ${a})(x${plus(b)}). ما معامل x؟`, `Desarrolla (x + ${a})(x${plus(b)}). ¿Coeficiente de x?`), hint: t(`Chaque terme de la première parenthèse multiplie chaque terme de la seconde : x × ${par(b)} + ${a} × x = ${rel(a + b)}x.`, `Each term multiplies each term: x × ${par(b)} + ${a} × x.`, `كل حد يضرب كل حد.`, `Cada término por cada término.`) },
      { type: 'number', answer: a * b, tolerance: 0, prompt: t('Et le nombre seul ?', 'And the constant?', 'والعدد الثابت؟', '¿Y el término independiente?'), hint: t(`${a} × ${par(b)}.`, `${a} × ${par(b)}.`, `${a} × ${par(b)}.`, `${a} × ${par(b)}.`) },
    ],
  };
}

function litMinus(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 1, 9), c = int(rng, 2, 9), k = int(rng, 2, 5), m = int(rng, 1, 6);
  const neg = choices(rng, [same(`−${a}x + ${b}`), same(`−${a}x − ${b}`), same(`${a}x − ${b}`)]);
  return {
    title: t('Supprimer des parenthèses', 'Removing brackets', 'حذف الأقواس', 'Quitar paréntesis'),
    summary: `−(${a}x − ${b}) = −${a}x + ${b} · ${c} − ${k}(x − ${m}) = ${c + k * m} − ${k}x`,
    steps: [
      { type: 'choice', ...neg, prompt: t(`Supprime les parenthèses : −(${a}x − ${b})`, `Remove the brackets: −(${a}x − ${b})`, `احذف الأقواس: −(${a}x − ${b})`, `Quita los paréntesis: −(${a}x − ${b})`), hint: t('Un signe − devant une parenthèse change le signe de chaque terme.', 'A − sign before brackets changes the sign of every term.', 'الإشارة − أمام القوس تغير إشارة كل حد.', 'Un − delante cambia el signo de cada término.') },
      { type: 'number', answer: c + k * m, tolerance: 0, prompt: t(`${c} − ${k}(x − ${m}) = … − ${k}x. Quel nombre manque ?`, `${c} − ${k}(x − ${m}) = … − ${k}x. What is missing?`, `${c} − ${k}(x − ${m}) = … − ${k}x. ما العدد الناقص؟`, `${c} − ${k}(x − ${m}) = … − ${k}x. ¿Qué falta?`), hint: t(`−${k} × (−${m}) = +${k * m}, puis ${c} + ${k * m}.`, `−${k} × (−${m}) = +${k * m}, then ${c} + ${k * m}.`, `−${k} × (−${m}) = +${k * m}.`, `−${k} × (−${m}) = +${k * m}.`) },
    ],
  };
}

function litFactor(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 2, 9), m = int(rng, 2, 9), p = int(rng, 2, 9);
  return {
    title: t('Factoriser', 'Factorising', 'التعميل', 'Factorizar'),
    summary: `${k}x + ${k * m} = ${k}(x + ${m}) · x² + ${p}x = x(x + ${p})`,
    steps: [
      { type: 'number', answer: m, tolerance: 0, prompt: t(`Factorise : ${k}x + ${k * m} = ${k}(x + …)`, `Factorise: ${k}x + ${k * m} = ${k}(x + …)`, `عمّل: ${k}x + ${k * m} = ${k}(x + …)`, `Factoriza: ${k}x + ${k * m} = ${k}(x + …)`), hint: t(`${k} est le facteur commun : ${k * m} = ${k} × …`, `${k} is the common factor: ${k * m} = ${k} × …`, `${k} عامل مشترك.`, `${k} es el factor común.`) },
      { type: 'number', answer: p, tolerance: 0, prompt: t(`Factorise : x² + ${p}x = x(x + …)`, `Factorise: x² + ${p}x = x(x + …)`, `عمّل: x² + ${p}x = x(x + …)`, `Factoriza: x² + ${p}x = x(x + …)`), hint: t('x est dans les deux termes : x² = x × x et ' + `${p}x = x × ${p}.`, `x is in both terms: x² = x × x and ${p}x = x × ${p}.`, `x موجود في الحدين.`, `x está en los dos términos.`) },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`A-t-on (x + ${m})² = x² + ${m * m} ?`, `Is (x + ${m})² = x² + ${m * m}?`, `هل (x + ${m})² = x² + ${m * m}؟`, `¿Es (x + ${m})² = x² + ${m * m}?`), hint: t(`Teste avec x = 1 : (1 + ${m})² = ${(1 + m) ** 2}, mais 1 + ${m * m} = ${1 + m * m}.`, `Try x = 1: (1 + ${m})² = ${(1 + m) ** 2}, but 1 + ${m * m} = ${1 + m * m}.`, `جرّب x = 1: ${(1 + m) ** 2} مقابل ${1 + m * m}.`, `Prueba x = 1: ${(1 + m) ** 2} frente a ${1 + m * m}.`) },
    ],
  };
}

// ═════════════ ÉQUATIONS DU PREMIER DEGRÉ ═════════════

function linTwoStep(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), x = int(rng, -6, 9) || 4, b = int(rng, -9, 9) || 5, c = a * x + b;
  const y = int(rng, -8, -1), d = int(rng, 2, 6), e = int(rng, 1, 9);
  return {
    title: t('Résoudre ax + b = c', 'Solving ax + b = c', 'حل ax + b = c', 'Resolver ax + b = c'),
    summary: `${a}x${plus(b)} = ${rel(c)} ⇒ ${a}x = ${rel(c - b)} ⇒ x = ${rel(x)}`,
    steps: [
      { type: 'number', answer: c - b, tolerance: 0, prompt: t(`${a}x${plus(b)} = ${rel(c)}. Première étape : ${a}x = …`, `${a}x${plus(b)} = ${rel(c)}. First step: ${a}x = …`, `${a}x${plus(b)} = ${rel(c)}. الخطوة الأولى: ${a}x = …`, `${a}x${plus(b)} = ${rel(c)}. Primer paso: ${a}x = …`), hint: t(b > 0 ? `On enlève ${b} des deux côtés.` : `On ajoute ${-b} des deux côtés.`, b > 0 ? `Subtract ${b} from both sides.` : `Add ${-b} to both sides.`, b > 0 ? `نطرح ${b} من الطرفين.` : `نضيف ${-b} إلى الطرفين.`, b > 0 ? `Resta ${b} en ambos lados.` : `Suma ${-b} en ambos lados.`) },
      { type: 'number', answer: x, tolerance: 0, prompt: t('Puis x = …', 'Then x = …', 'ثم x = …', 'Luego x = …'), hint: t(`On divise les deux côtés par ${a}.`, `Divide both sides by ${a}.`, `نقسم الطرفين على ${a}.`, `Divide ambos lados entre ${a}.`) },
      { type: 'number', answer: y, tolerance: 0, prompt: t(`Résous : ${d}x + ${e} = ${rel(d * y + e)}.`, `Solve: ${d}x + ${e} = ${rel(d * y + e)}.`, `حل: ${d}x + ${e} = ${rel(d * y + e)}.`, `Resuelve: ${d}x + ${e} = ${rel(d * y + e)}.`), hint: t('Même méthode ; la solution peut être négative.', 'Same method; the solution can be negative.', 'نفس الطريقة؛ قد يكون الحل سالبًا.', 'Mismo método; la solución puede ser negativa.') },
    ],
  };
}

function linBothSides(seed: number): Activity {
  const rng = seeded(seed);
  const c = int(rng, 1, 5), a = c + int(rng, 1, 5), x = int(rng, -5, 9) || 3, b = int(rng, -9, 9), d = (a - c) * x + b;
  return {
    title: t('Des x des deux côtés', 'x on both sides', 'x في الطرفين', 'x en ambos lados'),
    summary: `${a}x${plus(b)} = ${term(c)}${plus(d)} ⇒ ${a - c}x = ${rel(d - b)} ⇒ x = ${rel(x)}`,
    steps: [
      { type: 'number', answer: a - c, tolerance: 0, prompt: t(`${a}x${plus(b)} = ${term(c)}${plus(d)}. On regroupe les x à gauche : …x${plus(b)} = ${rel(d)}. Combien de x ?`, `${a}x${plus(b)} = ${term(c)}${plus(d)}. Collect the x terms on the left: …x${plus(b)} = ${rel(d)}. How many x?`, `${a}x${plus(b)} = ${term(c)}${plus(d)}. نجمع x يسارًا. كم x؟`, `${a}x${plus(b)} = ${term(c)}${plus(d)}. Agrupa las x a la izquierda. ¿Cuántas x?`), hint: t(`On enlève ${term(c)} des deux côtés : ${a}x − ${term(c)}.`, `Subtract ${term(c)} from both sides.`, `نطرح ${term(c)} من الطرفين.`, `Resta ${term(c)} en ambos lados.`) },
      { type: 'number', answer: x, tolerance: 0, prompt: t('Termine : x = …', 'Finish: x = …', 'أتمم: x = …', 'Termina: x = …'), hint: t(`${a - c}x = ${rel(d)} − ${par(b)} = ${rel(d - b)}, puis on divise par ${a - c}.`, `${a - c}x = ${rel(d - b)}, then divide by ${a - c}.`, `${a - c}x = ${rel(d - b)} ثم نقسم على ${a - c}.`, `${a - c}x = ${rel(d - b)}, luego divide entre ${a - c}.`) },
      { type: 'choice', options: OUI_NON, answer: 0, prompt: t(`Vérifie : pour x = ${rel(x)}, ${a}x${plus(b)} et ${term(c)}${plus(d)} valent-ils la même chose ?`, `Check: when x = ${rel(x)}, are ${a}x${plus(b)} and ${term(c)}${plus(d)} equal?`, `تحقق: من أجل x = ${rel(x)}، هل للتعبيرين نفس القيمة؟`, `Comprueba: para x = ${rel(x)}, ¿valen lo mismo?`), hint: t(`${a} × ${par(x)}${plus(b)} = ${rel(a * x + b)} et ${c} × ${par(x)}${plus(d)} = ${rel(c * x + d)}.`, `${rel(a * x + b)} and ${rel(c * x + d)}.`, `${rel(a * x + b)} و ${rel(c * x + d)}.`, `${rel(a * x + b)} y ${rel(c * x + d)}.`) },
    ],
  };
}

function linBrackets(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 2, 5), m = int(rng, 1, 6), x = int(rng, -4, 8) || 2, r = k * (x - m);
  const p = int(rng, 2, 4), q = int(rng, 1, 5), y = int(rng, 1, 6), s = p * (y + q) - y;
  return {
    title: t('Équations avec parenthèses', 'Equations with brackets', 'معادلات بأقواس', 'Ecuaciones con paréntesis'),
    summary: `${k}(x − ${m}) = ${rel(r)} ⇒ ${k}x − ${k * m} = ${rel(r)} ⇒ x = ${rel(x)}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous : ${k}(x − ${m}) = ${rel(r)}.`, `Solve: ${k}(x − ${m}) = ${rel(r)}.`, `حل: ${k}(x − ${m}) = ${rel(r)}.`, `Resuelve: ${k}(x − ${m}) = ${rel(r)}.`), hint: t(`Divise d’abord par ${k} : x − ${m} = ${rel(r / k)}.`, `Divide by ${k} first: x − ${m} = ${rel(r / k)}.`, `اقسم أولًا على ${k}.`, `Divide primero entre ${k}.`) },
      { type: 'number', answer: y, tolerance: 0, prompt: t(`Résous : ${p}(x + ${q}) − x = ${s}.`, `Solve: ${p}(x + ${q}) − x = ${s}.`, `حل: ${p}(x + ${q}) − x = ${s}.`, `Resuelve: ${p}(x + ${q}) − x = ${s}.`), hint: t(`Développe : ${p}x + ${p * q} − x = ${s}, réduis, puis résous.`, `Expand: ${p}x + ${p * q} − x = ${s}, simplify, then solve.`, `انشر ثم اختزل ثم حل.`, `Desarrolla, reduce y resuelve.`) },
    ],
  };
}

function linProblem(seed: number): Activity {
  const rng = seeded(seed);
  const w = int(rng, 3, 12), e = int(rng, 2, 8), P = 2 * (w + w + e);
  const age = int(rng, 8, 14), gap = int(rng, 22, 32), k = pick(rng, [2, 3]);
  const years = ((): number => { for (let y = 0; y < 60; y++) if (age + gap + y === k * (age + y)) return y; return -1; })();
  const model = choices(rng, [same(`2(x + x + ${e}) = ${P}`), same(`x + x + ${e} = ${P}`), same(`2x + ${e} = ${P}`)]);
  return {
    title: t('Mettre en équation', 'Setting up an equation', 'وضع معادلة', 'Plantear una ecuación'),
    summary: `largeur x, longueur x + ${e} : 2(2x + ${e}) = ${P} ⇒ x = ${w}`,
    steps: [
      { type: 'choice', ...model, prompt: t(`Un rectangle a une longueur qui dépasse sa largeur x de ${e} cm. Son périmètre vaut ${P} cm. Quelle équation traduit le problème ?`, `A rectangle is ${e} cm longer than its width x. Its perimeter is ${P} cm. Which equation fits?`, `مستطيل طوله يزيد عن عرضه x بـ ${e} cm ومحيطه ${P} cm. أي معادلة تترجم المسألة؟`, `Un rectángulo mide ${e} cm más de largo que de ancho x. Perímetro ${P} cm. ¿Qué ecuación?`), hint: t('Périmètre = 2 × (longueur + largeur).', 'Perimeter = 2 × (length + width).', 'المحيط = 2 × (الطول + العرض).', 'Perímetro = 2 × (largo + ancho).') },
      { type: 'number', answer: w, tolerance: 0, unit: 'cm', prompt: t('Quelle est la largeur ?', 'What is the width?', 'ما العرض؟', '¿Cuál es el ancho?'), hint: t(`2(2x + ${e}) = ${P} ⇒ 2x + ${e} = ${P / 2}.`, `2(2x + ${e}) = ${P} ⇒ 2x + ${e} = ${P / 2}.`, `2x + ${e} = ${P / 2}.`, `2x + ${e} = ${P / 2}.`) },
      ...(years > 0 ? [{ type: 'number' as const, answer: years, tolerance: 0, prompt: t(`Sami a ${age} ans et sa mère ${age + gap} ans. Dans combien d’années la mère aura-t-elle ${k === 2 ? 'le double' : 'le triple'} de l’âge de Sami ?`, `Sami is ${age} and his mother ${age + gap}. In how many years will she be ${k === 2 ? 'twice' : 'three times'} his age?`, `سامي عمره ${age} سنة وأمه ${age + gap}. بعد كم سنة يصبح عمرها ${k === 2 ? 'ضعف' : 'ثلاثة أضعاف'} عمره؟`, `Sami tiene ${age} años y su madre ${age + gap}. ¿Dentro de cuántos años ella tendrá ${k === 2 ? 'el doble' : 'el triple'} de su edad?`), hint: t(`Dans x ans : ${age + gap} + x = ${k}(${age} + x).`, `In x years: ${age + gap} + x = ${k}(${age} + x).`, `بعد x سنة: ${age + gap} + x = ${k}(${age} + x).`, `Dentro de x años: ${age + gap} + x = ${k}(${age} + x).`) }] : []),
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const QUATRIEME_SKILLS: Skill[] = [
  { id: 'signs-rule', review: 0, chapter: 'signs', build: signsRule, title: s('La règle des signes', 'The sign rule', 'قاعدة الإشارات', 'La regla de los signos'), desc: s('Multiplier des relatifs.', 'Multiplying signed numbers.', 'ضرب الأعداد النسبية.', 'Multiplicar relativos.') },
  { id: 'signs-quotient', review: 0, chapter: 'signs', build: signsQuotient, title: s('Diviser des relatifs', 'Dividing', 'القسمة', 'Dividir'), desc: s('Les mêmes règles qu’avec ×.', 'Same rules as ×.', 'نفس قواعد الضرب.', 'Las mismas reglas que ×.') },
  { id: 'signs-mixed', review: 0, chapter: 'signs', build: signsMixed, title: s('Enchaîner les calculs', 'Mixed calculations', 'تسلسل الحسابات', 'Encadenar cálculos'), desc: s('Priorités et signes.', 'Priorities and signs.', 'الأولويات والإشارات.', 'Prioridades y signos.') },
  { id: 'signs-square', review: 0, chapter: 'signs', build: signsSquareTrap, title: s('Le piège de −3²', 'The −3² trap', 'فخ −3²', 'La trampa de −3²'), desc: s('Carrés et valeurs négatives.', 'Squares and negative values.', 'المربعات والقيم السالبة.', 'Cuadrados y valores negativos.') },
  { id: 'sci-negative', review: 2, chapter: 'sci', build: sciNegative, title: s('10 puissance négative', 'Negative powers of 10', 'قوى 10 السالبة', 'Potencias negativas de 10'), desc: s('10⁻³ = 0,001.', '10⁻³ = 0.001.', '10⁻³ = 0,001.', '10⁻³ = 0,001.') },
  { id: 'sci-rules', review: 0, chapter: 'sci', build: sciRules, title: s('Les règles de calcul', 'Rules of exponents', 'قواعد الحساب', 'Reglas de cálculo'), desc: s('Produit, quotient, puissance.', 'Product, quotient, power.', 'الجداء والخارج والقوة.', 'Producto, cociente, potencia.') },
  { id: 'sci-notation', review: 1, chapter: 'sci', build: sciNotation, title: s('Notation scientifique', 'Scientific notation', 'الكتابة العلمية', 'Notación científica'), desc: s('a × 10ⁿ avec 1 ≤ a < 10.', 'a × 10ⁿ with 1 ≤ a < 10.', 'a × 10ⁿ حيث 1 ≤ a < 10.', 'a × 10ⁿ con 1 ≤ a < 10.') },
  { id: 'sci-decimal', review: 0, chapter: 'sci', build: sciDecimal, title: s('Revenir au nombre', 'Back to the number', 'العودة إلى العدد', 'Volver al número'), desc: s('Déplacer la virgule, comparer.', 'Move the point, compare.', 'إزاحة الفاصلة والمقارنة.', 'Mover la coma, comparar.') },
  { id: 'lit-reduce', review: 0, chapter: 'literal', build: litReduce, title: s('Réduire', 'Simplify', 'الاختزال', 'Reducir'), desc: s('Regrouper les termes semblables.', 'Collect like terms.', 'تجميع الحدود المتشابهة.', 'Agrupar términos semejantes.') },
  { id: 'lit-minus', review: 1, chapter: 'literal', build: litMinus, title: s('Le signe − devant une parenthèse', 'A minus before brackets', 'الإشارة − أمام القوس', 'Un − delante del paréntesis'), desc: s('Tout change de signe.', 'Every sign flips.', 'كل الإشارات تتغير.', 'Todo cambia de signo.') },
  { id: 'lit-double', review: 0, chapter: 'literal', build: litDouble, title: s('Double distributivité', 'Double brackets', 'التوزيعية المزدوجة', 'Doble distributiva'), desc: s('(x + a)(x + b).', '(x + a)(x + b).', '(x + a)(x + b).', '(x + a)(x + b).') },
  { id: 'lit-factor', review: 0, chapter: 'literal', build: litFactor, title: s('Factoriser', 'Factorise', 'التعميل', 'Factorizar'), desc: s('Le facteur commun ; (x + a)² ≠ x² + a².', 'Common factor; (x + a)² ≠ x² + a².', 'العامل المشترك.', 'Factor común; (x + a)² ≠ x² + a².') },
  { id: 'lin-two-step', review: 1, chapter: 'linear', build: linTwoStep, title: s('ax + b = c', 'ax + b = c', 'ax + b = c', 'ax + b = c'), desc: s('Deux étapes, solutions négatives.', 'Two steps, negative solutions.', 'خطوتان وحلول سالبة.', 'Dos pasos, soluciones negativas.') },
  { id: 'lin-both-sides', review: 1, chapter: 'linear', build: linBothSides, title: s('x des deux côtés', 'x on both sides', 'x في الطرفين', 'x en ambos lados'), desc: s('Regrouper, résoudre, vérifier.', 'Collect, solve, check.', 'التجميع والحل والتحقق.', 'Agrupar, resolver, comprobar.') },
  { id: 'lin-brackets', review: 0, chapter: 'linear', build: linBrackets, title: s('Avec des parenthèses', 'With brackets', 'بالأقواس', 'Con paréntesis'), desc: s('Développer avant de résoudre.', 'Expand before solving.', 'النشر قبل الحل.', 'Desarrollar antes de resolver.') },
  { id: 'lin-problem', review: 1, chapter: 'linear', build: linProblem, title: s('Mettre en équation', 'Set up the equation', 'وضع المعادلة', 'Plantear la ecuación'), desc: s('Périmètre, âges.', 'Perimeter, ages.', 'المحيط والأعمار.', 'Perímetro, edades.') },
];
