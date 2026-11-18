// Parcours de 3e (FR, CI, SN), 3e année collège (MA) et Grade 9 (CCSS) : racines carrées, identités
// remarquables, inéquations et équation produit, systèmes de deux équations, solides de l'espace.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Rng, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const rel = (v: number) => (v < 0 ? `−${-v}` : String(v));
const par = (v: number) => (v < 0 ? `(${rel(v)})` : rel(v));
const plus = (b: number) => (b < 0 ? ` − ${-b}` : ` + ${b}`);
const fr = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',');
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}

// ═════════════ RACINES CARRÉES ═════════════

function rootPerfect(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 4, 15);
  const [a, b] = pick(rng, [[3, 4], [6, 8], [5, 12], [8, 15], [9, 12]] as [number, number][]);
  return {
    title: t('Racine carrée d’un carré parfait', 'Square roots of perfect squares', 'الجذر المربع لمربع كامل', 'Raíz cuadrada de un cuadrado perfecto'),
    summary: `√${n * n} = ${n} car ${n}² = ${n * n} · √(${a * a} + ${b * b}) = ${Math.hypot(a, b)} ≠ √${a * a} + √${b * b} = ${a + b}`,
    steps: [
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Calcule √${n * n}.`, `Work out √${n * n}.`, `احسب √${n * n}.`, `Calcula √${n * n}.`), hint: t(`Quel nombre positif, multiplié par lui-même, donne ${n * n} ?`, `Which positive number times itself gives ${n * n}?`, `ما العدد الموجب الذي مربعه ${n * n}؟`, `¿Qué número positivo al cuadrado da ${n * n}?`) },
      { type: 'number', answer: Math.hypot(a, b), tolerance: 0, prompt: t(`Calcule √(${a * a} + ${b * b}).`, `Work out √(${a * a} + ${b * b}).`, `احسب √(${a * a} + ${b * b}).`, `Calcula √(${a * a} + ${b * b}).`), hint: t(`D’abord la somme sous la racine : ${a * a} + ${b * b} = ${a * a + b * b}.`, `First the sum under the root: ${a * a + b * b}.`, `أولًا المجموع تحت الجذر: ${a * a + b * b}.`, `Primero la suma bajo la raíz: ${a * a + b * b}.`) },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`A-t-on √(${a * a} + ${b * b}) = √${a * a} + √${b * b} ?`, `Is √(${a * a} + ${b * b}) = √${a * a} + √${b * b}?`, `هل √(${a * a} + ${b * b}) = √${a * a} + √${b * b}؟`, `¿Es √(${a * a} + ${b * b}) = √${a * a} + √${b * b}?`), hint: t(`Compare : ${Math.hypot(a, b)} d’un côté, ${a} + ${b} = ${a + b} de l’autre.`, `Compare ${Math.hypot(a, b)} with ${a + b}.`, `قارن ${Math.hypot(a, b)} و ${a + b}.`, `Compara ${Math.hypot(a, b)} con ${a + b}.`) },
    ],
  };
}

function rootSimplify(seed: number): Activity {
  const rng = seeded(seed);
  const [k, m] = pick(rng, [[2, 3], [2, 5], [3, 2], [5, 2], [2, 7], [3, 3], [4, 2], [3, 5]] as [number, number][]);
  const [a, b] = pick(rng, [[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [6, 24]] as [number, number][]);
  return {
    title: t('Simplifier une racine carrée', 'Simplifying square roots', 'تبسيط جذر مربع', 'Simplificar una raíz cuadrada'),
    summary: `√${k * k * m} = √(${k * k} × ${m}) = ${k}√${m} · √${a} × √${b} = √${a * b} = ${Math.sqrt(a * b)}`,
    steps: [
      { type: 'number', answer: k, tolerance: 0, prompt: t(`√${k * k * m} = …√${m}. Quel nombre manque ?`, `√${k * k * m} = …√${m}. What is missing?`, `√${k * k * m} = …√${m}. ما العدد الناقص؟`, `√${k * k * m} = …√${m}. ¿Qué falta?`), hint: t(`Fais apparaître un carré parfait : ${k * k * m} = ${k * k} × ${m}, et √${k * k} = ${k}.`, `Find a perfect square: ${k * k * m} = ${k * k} × ${m}, and √${k * k} = ${k}.`, `${k * k * m} = ${k * k} × ${m}.`, `${k * k * m} = ${k * k} × ${m}.`) },
      { type: 'number', answer: Math.sqrt(a * b), tolerance: 0, prompt: t(`Calcule √${a} × √${b}.`, `Work out √${a} × √${b}.`, `احسب √${a} × √${b}.`, `Calcula √${a} × √${b}.`), hint: t(`√a × √b = √(a × b) : ici √${a * b}.`, `√a × √b = √(a × b): here √${a * b}.`, `√a × √b = √(a × b).`, `√a × √b = √(a × b).`) },
    ],
  };
}

function rootEquation(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 2, 12), k = int(rng, 1, 30);
  const count = choices(rng, [same('2'), same('1'), same('0')]);
  return {
    title: t('L’équation x² = a', 'The equation x² = a', 'المعادلة x² = a', 'La ecuación x² = a'),
    summary: `x² = ${n * n} : x = ${n} ou x = −${n} · x² = −${k} : aucune solution`,
    steps: [
      { type: 'choice', ...count, prompt: t(`Combien de solutions a l’équation x² = ${n * n} ?`, `How many solutions does x² = ${n * n} have?`, `كم حلًا للمعادلة x² = ${n * n}؟`, `¿Cuántas soluciones tiene x² = ${n * n}?`), hint: t(`${n}² = ${n * n}… et (−${n})² aussi !`, `${n}² = ${n * n}… and so is (−${n})²!`, `${n}² = ${n * n} وكذلك (−${n})².`, `${n}² = ${n * n}… ¡y también (−${n})²!`) },
      { type: 'number', answer: -n, tolerance: 0, prompt: t(`Donne la solution négative de x² = ${n * n}.`, `Give the negative solution of x² = ${n * n}.`, `أعط الحل السالب للمعادلة x² = ${n * n}.`, `Da la solución negativa de x² = ${n * n}.`), hint: t(`C’est −√${n * n}.`, `It is −√${n * n}.`, `إنه −√${n * n}.`, `Es −√${n * n}.`) },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 0, prompt: t(`Et combien de solutions pour x² = −${k} ?`, `And how many solutions for x² = −${k}?`, `وكم حلًا للمعادلة x² = −${k}؟`, `¿Y cuántas para x² = −${k}?`), hint: t('Un carré n’est jamais négatif.', 'A square is never negative.', 'المربع لا يكون سالبًا أبدًا.', 'Un cuadrado nunca es negativo.') },
    ],
  };
}

function rootApprox(seed: number): Activity {
  const rng = seeded(seed);
  let a: number, b: number;
  do { a = int(rng, 2, 9); b = int(rng, 2, 9); } while (Number.isInteger(Math.hypot(a, b)));
  let n: number;
  do { n = int(rng, 20, 95); } while (Number.isInteger(Math.sqrt(n)));
  const lo = Math.floor(Math.sqrt(n));
  const between = choices(rng, [same(`${lo} et ${lo + 1}`), same(`${lo + 1} et ${lo + 2}`), same(`${Math.floor(n / 2)} et ${Math.floor(n / 2) + 1}`)]);
  return {
    title: t('Valeurs approchées', 'Approximate values', 'القيم المقربة', 'Valores aproximados'),
    summary: `√${n} est entre ${lo} et ${lo + 1} · hypoténuse √(${a}² + ${b}²) ≈ ${fr(Math.hypot(a, b))}`,
    steps: [
      { type: 'choice', ...between, prompt: t(`Entre quels entiers consécutifs se trouve √${n} ?`, `Between which consecutive whole numbers is √${n}?`, `بين أي عددين صحيحين متتاليين يوجد √${n}؟`, `¿Entre qué enteros consecutivos está √${n}?`), hint: t(`Cherche les carrés parfaits autour de ${n} : ${lo}² = ${lo * lo}, ${lo + 1}² = ${(lo + 1) ** 2}.`, `Find the squares around ${n}: ${lo}² = ${lo * lo}, ${lo + 1}² = ${(lo + 1) ** 2}.`, `${lo}² = ${lo * lo} و ${lo + 1}² = ${(lo + 1) ** 2}.`, `${lo}² = ${lo * lo}, ${lo + 1}² = ${(lo + 1) ** 2}.`) },
      { type: 'number', answer: Math.round(Math.hypot(a, b) * 10) / 10, tolerance: 0.05, unit: 'cm', prompt: t(`Un triangle rectangle a des côtés de l’angle droit de ${a} cm et ${b} cm. Donne la longueur de l’hypoténuse, arrondie au dixième.`, `A right triangle has legs of ${a} cm and ${b} cm. Give the hypotenuse to 1 decimal place.`, `مثلث قائم ضلعا زاويته القائمة ${a} cm و ${b} cm. أعط طول الوتر مقربًا إلى العشر.`, `Un triángulo rectángulo tiene catetos de ${a} y ${b} cm. Da la hipotenusa a la décima.`), hint: t(`Pythagore : √(${a}² + ${b}²) = √${a * a + b * b}, puis la calculatrice.`, `Pythagoras: √(${a}² + ${b}²) = √${a * a + b * b}, then a calculator.`, `فيثاغورس: √${a * a + b * b}.`, `Pitágoras: √${a * a + b * b}.`) },
    ],
  };
}

// ═════════════ IDENTITÉS REMARQUABLES ═════════════

function idSquareSum(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9);
  const trap = choices(rng, [same(`x² + ${2 * a}x + ${a * a}`), same(`x² + ${a * a}`), same(`x² + ${a}x + ${a * a}`)]);
  return {
    title: t('(a + b)²', '(a + b)²', '(a + b)²', '(a + b)²'),
    summary: `(x + ${a})² = x² + 2 × x × ${a} + ${a}² = x² + ${2 * a}x + ${a * a}`,
    steps: [
      { type: 'choice', ...trap, prompt: t(`Développe (x + ${a})².`, `Expand (x + ${a})².`, `انشر (x + ${a})².`, `Desarrolla (x + ${a})².`), hint: t('(a + b)² = a² + 2ab + b² : n’oublie pas le double produit.', '(a + b)² = a² + 2ab + b²: do not forget the middle term.', '(a + b)² = a² + 2ab + b².', '(a + b)² = a² + 2ab + b².') },
      { type: 'number', answer: (100 + a) ** 2, tolerance: 0, prompt: t(`Calcule mentalement ${100 + a}² en écrivant (100 + ${a})².`, `Work out ${100 + a}² mentally as (100 + ${a})².`, `احسب ذهنيًا ${100 + a}² باعتبار (100 + ${a})².`, `Calcula mentalmente ${100 + a}² como (100 + ${a})².`), hint: t(`10 000 + 2 × 100 × ${a} + ${a * a}.`, `10,000 + 2 × 100 × ${a} + ${a * a}.`, `10000 + 2 × 100 × ${a} + ${a * a}.`, `10 000 + 2 × 100 × ${a} + ${a * a}.`) },
    ],
  };
}

function idSquareDiff(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), k = int(rng, 2, 4);
  return {
    title: t('(a − b)²', '(a − b)²', '(a − b)²', '(a − b)²'),
    summary: `(x − ${a})² = x² − ${2 * a}x + ${a * a} · (${k}x − ${a})² = ${k * k}x² − ${2 * k * a}x + ${a * a}`,
    steps: [
      { type: 'number', answer: 2 * a, tolerance: 0, prompt: t(`(x − ${a})² = x² − …x + ${a * a}. Quel nombre manque ?`, `(x − ${a})² = x² − …x + ${a * a}. What is missing?`, `(x − ${a})² = x² − …x + ${a * a}. ما العدد الناقص؟`, `(x − ${a})² = x² − …x + ${a * a}. ¿Qué falta?`), hint: t(`Le double produit : 2 × x × ${a}.`, `The middle term: 2 × x × ${a}.`, `الجداء المضاعف: 2 × x × ${a}.`, `El doble producto: 2 × x × ${a}.`) },
      { type: 'number', answer: k * k, tolerance: 0, prompt: t(`(${k}x − ${a})² = …x² − ${2 * k * a}x + ${a * a}. Quel nombre manque ?`, `(${k}x − ${a})² = …x² − ${2 * k * a}x + ${a * a}. What is missing?`, `(${k}x − ${a})² = …x² − ${2 * k * a}x + ${a * a}. ما العدد الناقص؟`, `(${k}x − ${a})² = …x² − ${2 * k * a}x + ${a * a}. ¿Qué falta?`), hint: t(`(${k}x)² = ${k}x × ${k}x : le ${k} est aussi au carré.`, `(${k}x)² = ${k}x × ${k}x: the ${k} is squared too.`, `(${k}x)² = ${k}x × ${k}x.`, `(${k}x)² = ${k}x × ${k}x.`) },
    ],
  };
}

function idProduct(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 12), d = int(rng, 1, 4), c = pick(rng, [20, 30, 40, 50, 60]);
  return {
    title: t('(a + b)(a − b)', '(a + b)(a − b)', '(a + b)(a − b)', '(a + b)(a − b)'),
    summary: `(x + ${a})(x − ${a}) = x² − ${a * a} · ${c + d} × ${c - d} = ${c}² − ${d}² = ${c * c - d * d}`,
    steps: [
      { type: 'number', answer: a * a, tolerance: 0, prompt: t(`(x + ${a})(x − ${a}) = x² − … Quel nombre manque ?`, `(x + ${a})(x − ${a}) = x² − … What is missing?`, `(x + ${a})(x − ${a}) = x² − … ما العدد الناقص؟`, `(x + ${a})(x − ${a}) = x² − … ¿Qué falta?`), hint: t(`(a + b)(a − b) = a² − b² : ici b = ${a}.`, `(a + b)(a − b) = a² − b²: here b = ${a}.`, `(a + b)(a − b) = a² − b².`, `(a + b)(a − b) = a² − b².`) },
      { type: 'number', answer: c * c - d * d, tolerance: 0, prompt: t(`Calcule mentalement ${c + d} × ${c - d}.`, `Work out ${c + d} × ${c - d} mentally.`, `احسب ذهنيًا ${c + d} × ${c - d}.`, `Calcula mentalmente ${c + d} × ${c - d}.`), hint: t(`C’est (${c} + ${d})(${c} − ${d}) = ${c}² − ${d}².`, `It is (${c} + ${d})(${c} − ${d}) = ${c}² − ${d}².`, `(${c} + ${d})(${c} − ${d}) = ${c}² − ${d}².`, `(${c} + ${d})(${c} − ${d}) = ${c}² − ${d}².`) },
    ],
  };
}

function idFactor(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 11), b = int(rng, 2, 9), k = int(rng, 2, 5), m = int(rng, 1, 6);
  return {
    title: t('Factoriser avec les identités', 'Factorising with identities', 'التعميل بالمتطابقات', 'Factorizar con identidades'),
    summary: `x² − ${a * a} = (x − ${a})(x + ${a}) · x² + ${2 * b}x + ${b * b} = (x + ${b})²`,
    steps: [
      { type: 'number', answer: a, tolerance: 0, prompt: t(`Factorise : x² − ${a * a} = (x − …)(x + …)`, `Factorise: x² − ${a * a} = (x − …)(x + …)`, `عمّل: x² − ${a * a} = (x − …)(x + …)`, `Factoriza: x² − ${a * a} = (x − …)(x + …)`), hint: t(`a² − b² = (a − b)(a + b), avec b² = ${a * a}.`, `a² − b² = (a − b)(a + b), with b² = ${a * a}.`, `a² − b² = (a − b)(a + b).`, `a² − b² = (a − b)(a + b).`) },
      { type: 'number', answer: b, tolerance: 0, prompt: t(`Factorise : x² + ${2 * b}x + ${b * b} = (x + …)²`, `Factorise: x² + ${2 * b}x + ${b * b} = (x + …)²`, `عمّل: x² + ${2 * b}x + ${b * b} = (x + …)²`, `Factoriza: x² + ${2 * b}x + ${b * b} = (x + …)²`), hint: t(`${b * b} = …² et ${2 * b}x = 2 × x × …`, `${b * b} = …² and ${2 * b}x = 2 × x × …`, `${b * b} = …².`, `${b * b} = …².`) },
      { type: 'number', answer: m, tolerance: 0, prompt: t(`Factorise : (x + ${m})² − ${k}(x + ${m}) = (x + ${m})(x + … − ${k}). Quel nombre manque ?`, `Factorise: (x + ${m})² − ${k}(x + ${m}) = (x + ${m})(x + … − ${k}). What is missing?`, `عمّل: (x + ${m})² − ${k}(x + ${m}) = (x + ${m})(x + … − ${k}).`, `Factoriza: (x + ${m})² − ${k}(x + ${m}) = (x + ${m})(x + … − ${k}).`), hint: t(`Le facteur commun est (x + ${m}) : il en reste un dans le premier terme.`, `The common factor is (x + ${m}): one copy remains from the first term.`, `العامل المشترك هو (x + ${m}).`, `El factor común es (x + ${m}).`) },
    ],
  };
}

// ═════════════ INÉQUATIONS, ÉQUATION PRODUIT ═════════════

const SENS = [same('x <'), same('x >'), same('x ≤'), same('x ≥')];

function ineqSolve(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 6), x = int(rng, -4, 8), b = int(rng, -9, 9), c = a * x + b, v = pick(rng, [x - 2, x - 1, x + 1, x + 2]);
  return {
    title: t('Résoudre une inéquation', 'Solving an inequality', 'حل متراجحة', 'Resolver una inecuación'),
    summary: `${a}x${plus(b)} < ${rel(c)} ⇒ ${a}x < ${rel(c - b)} ⇒ x < ${rel(x)}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`${a}x${plus(b)} < ${rel(c)} équivaut à x < … Quel nombre ?`, `${a}x${plus(b)} < ${rel(c)} means x < … Which number?`, `${a}x${plus(b)} < ${rel(c)} تكافئ x < … ما العدد؟`, `${a}x${plus(b)} < ${rel(c)} equivale a x < … ¿Qué número?`), hint: t(`Comme pour une équation : ${b > 0 ? `on enlève ${b}` : `on ajoute ${-b}`}, puis on divise par ${a} (positif : le sens ne change pas).`, `As with an equation, then divide by ${a} (positive: the sign stays).`, `كما في المعادلة ثم نقسم على ${a} (موجب: لا يتغير الاتجاه).`, `Como en una ecuación; ${a} es positivo: el sentido no cambia.`) },
      { type: 'choice', options: OUI_NON, answer: a * v + b < c ? 0 : 1, prompt: t(`${rel(v)} est-il solution de ${a}x${plus(b)} < ${rel(c)} ?`, `Is ${rel(v)} a solution of ${a}x${plus(b)} < ${rel(c)}?`, `هل ${rel(v)} حل للمتراجحة ${a}x${plus(b)} < ${rel(c)}؟`, `¿${rel(v)} es solución de ${a}x${plus(b)} < ${rel(c)}?`), hint: t(`Remplace : ${a} × ${par(v)}${plus(b)} = ${rel(a * v + b)}. Est-ce plus petit que ${rel(c)} ?`, `Substitute: ${a} × ${par(v)}${plus(b)} = ${rel(a * v + b)}. Is it less than ${rel(c)}?`, `${rel(a * v + b)} أصغر من ${rel(c)}؟`, `${rel(a * v + b)} ¿menor que ${rel(c)}?`) },
    ],
  };
}

function ineqFlip(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 6), x = int(rng, -5, 6), b = a * x;
  const strict = rng() < 0.5;
  const sign = strict ? '>' : '≥';
  const answer = strict ? 0 : 2;
  return {
    title: t('Diviser par un négatif', 'Dividing by a negative', 'القسمة على عدد سالب', 'Dividir entre un negativo'),
    summary: `−${a}x ${sign} ${rel(-b)} ⇒ x ${strict ? '<' : '≤'} ${rel(x)} : on divise par −${a}, le sens change`,
    steps: [
      { type: 'choice', options: SENS, answer, prompt: t(`On résout −${a}x ${sign} ${rel(-b)}. On divise par −${a} : on obtient …`, `Solve −${a}x ${sign} ${rel(-b)}. Dividing by −${a} gives…`, `نحل −${a}x ${sign} ${rel(-b)}. نقسم على −${a} فنحصل على…`, `Resolvemos −${a}x ${sign} ${rel(-b)}. Al dividir entre −${a} se obtiene…`), hint: t('Multiplier ou diviser par un nombre négatif change le sens de l’inégalité.', 'Multiplying or dividing by a negative flips the inequality.', 'الضرب أو القسمة على عدد سالب يغير اتجاه المتراجحة.', 'Multiplicar o dividir entre un negativo invierte el sentido.') },
      { type: 'number', answer: x, tolerance: 0, prompt: t('Et la borne ?', 'And the boundary?', 'وما الحد؟', '¿Y el extremo?'), hint: t(`${rel(-b)} ÷ (−${a}).`, `${rel(-b)} ÷ (−${a}).`, `${rel(-b)} ÷ (−${a}).`, `${rel(-b)} ÷ (−${a}).`) },
    ],
  };
}

function ineqProduct(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 1, 9), b = int(rng, 1, 9), k = int(rng, 2, 5), m = k * int(rng, 1, 4);
  return {
    title: t('L’équation produit', 'Zero-product equations', 'معادلة الجداء', 'Ecuación producto'),
    summary: `(x − ${a})(x + ${b}) = 0 ⇔ x = ${a} ou x = −${b} : un produit est nul si l’un des facteurs est nul`,
    steps: [
      { type: 'number', answer: a, tolerance: 0, prompt: t(`(x − ${a})(x + ${b}) = 0. Donne la solution positive.`, `(x − ${a})(x + ${b}) = 0. Give the positive solution.`, `(x − ${a})(x + ${b}) = 0. أعط الحل الموجب.`, `(x − ${a})(x + ${b}) = 0. Da la solución positiva.`), hint: t(`Un produit est nul si l’un des facteurs est nul : x − ${a} = 0 ou x + ${b} = 0.`, `A product is zero if one factor is zero: x − ${a} = 0 or x + ${b} = 0.`, `الجداء منعدم إذا انعدم أحد عوامله.`, `Un producto es cero si un factor es cero.`) },
      { type: 'number', answer: -b, tolerance: 0, prompt: t('Et la solution négative ?', 'And the negative solution?', 'والحل السالب؟', '¿Y la solución negativa?'), hint: t(`x + ${b} = 0.`, `x + ${b} = 0.`, `x + ${b} = 0.`, `x + ${b} = 0.`) },
      { type: 'number', answer: m / k, tolerance: 0, prompt: t(`x(${k}x − ${m}) = 0 a deux solutions : 0 et … ?`, `x(${k}x − ${m}) = 0 has two solutions: 0 and …?`, `x(${k}x − ${m}) = 0 لها حلان: 0 و …؟`, `x(${k}x − ${m}) = 0 tiene dos soluciones: 0 y …?`), hint: t(`${k}x − ${m} = 0 ⇒ x = ${m} ÷ ${k}.`, `${k}x − ${m} = 0 ⇒ x = ${m} ÷ ${k}.`, `x = ${m} ÷ ${k}.`, `x = ${m} ÷ ${k}.`) },
    ],
  };
}

function ineqSquareDiff(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 10);
  return {
    title: t('Factoriser pour résoudre', 'Factorise to solve', 'التعميل من أجل الحل', 'Factorizar para resolver'),
    summary: `x² − ${a * a} = 0 ⇔ (x − ${a})(x + ${a}) = 0 ⇔ x = ${a} ou x = −${a}`,
    steps: [
      { type: 'number', answer: a, tolerance: 0, prompt: t(`Résous x² − ${a * a} = 0 : donne la solution positive.`, `Solve x² − ${a * a} = 0: give the positive solution.`, `حل x² − ${a * a} = 0: أعط الحل الموجب.`, `Resuelve x² − ${a * a} = 0: da la solución positiva.`), hint: t(`Factorise : x² − ${a * a} = (x − ${a})(x + ${a}), puis équation produit.`, `Factorise: (x − ${a})(x + ${a}) = 0.`, `عمّل ثم طبّق معادلة الجداء.`, `Factoriza y usa la ecuación producto.`) },
      { type: 'choice', options: [same('2'), same('1'), same('0')], answer: 0, prompt: t(`Combien de solutions a (x + ${a})(x − ${a}) = 0 ?`, `How many solutions does (x + ${a})(x − ${a}) = 0 have?`, `كم حلًا للمعادلة (x + ${a})(x − ${a}) = 0؟`, `¿Cuántas soluciones tiene (x + ${a})(x − ${a}) = 0?`), hint: t(`${a} et −${a}.`, `${a} and −${a}.`, `${a} و −${a}.`, `${a} y −${a}.`) },
    ],
  };
}

// ═════════════ SYSTÈMES ═════════════

function sysCheck(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, -3, 6), y = int(rng, -3, 6), a = int(rng, 2, 4), b = int(rng, 2, 4), c = int(rng, 2, 3);
  const e1 = a * x + b * y, e2 = c * x - y;
  const wrongY = y + 1;
  return {
    title: t('Vérifier une solution', 'Checking a solution', 'التحقق من حل', 'Comprobar una solución'),
    summary: `(${rel(x)} ; ${rel(y)}) vérifie ${a}x + ${b}y = ${rel(e1)} et ${c}x − y = ${rel(e2)}`,
    steps: [
      { type: 'choice', options: OUI_NON, answer: 0, prompt: t(`Le couple (${rel(x)} ; ${rel(y)}) est-il solution du système { ${a}x + ${b}y = ${rel(e1)} ; ${c}x − y = ${rel(e2)} } ?`, `Is (${rel(x)}, ${rel(y)}) a solution of { ${a}x + ${b}y = ${rel(e1)} ; ${c}x − y = ${rel(e2)} }?`, `هل الزوج (${rel(x)} ; ${rel(y)}) حل للنظمة؟`, `¿Es (${rel(x)} ; ${rel(y)}) solución del sistema?`), hint: t('Il doit vérifier les deux équations à la fois.', 'It must satisfy both equations.', 'يجب أن يحقق المعادلتين معًا.', 'Debe cumplir las dos ecuaciones.') },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`Et le couple (${rel(x)} ; ${rel(wrongY)}) ?`, `And (${rel(x)}, ${rel(wrongY)})?`, `والزوج (${rel(x)} ; ${rel(wrongY)})؟`, `¿Y (${rel(x)} ; ${rel(wrongY)})?`), hint: t(`${a} × ${par(x)} + ${b} × ${par(wrongY)} = ${rel(a * x + b * wrongY)} ≠ ${rel(e1)}.`, `${rel(a * x + b * wrongY)} ≠ ${rel(e1)}.`, `${rel(a * x + b * wrongY)} ≠ ${rel(e1)}.`, `${rel(a * x + b * wrongY)} ≠ ${rel(e1)}.`) },
    ],
  };
}

function sysSubstitution(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, -3, 7), a = int(rng, 2, 4), b = int(rng, -5, 5) || 3, y = a * x + b, c = int(rng, 2, 3), d = c * x + y;
  return {
    title: t('Par substitution', 'By substitution', 'بالتعويض', 'Por sustitución'),
    summary: `y = ${a}x${plus(b)} dans ${c}x + y = ${rel(d)} : ${c + a}x${plus(b)} = ${rel(d)} ⇒ x = ${rel(x)}, y = ${rel(y)}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous { y = ${a}x${plus(b)} ; ${c}x + y = ${rel(d)} }. Que vaut x ?`, `Solve { y = ${a}x${plus(b)} ; ${c}x + y = ${rel(d)} }. What is x?`, `حل النظمة { y = ${a}x${plus(b)} ; ${c}x + y = ${rel(d)} }. ما قيمة x؟`, `Resuelve { y = ${a}x${plus(b)} ; ${c}x + y = ${rel(d)} }. ¿x?`), hint: t(`Remplace y dans la seconde équation : ${c}x + ${a}x${plus(b)} = ${rel(d)}.`, `Substitute y into the second equation: ${c}x + ${a}x${plus(b)} = ${rel(d)}.`, `عوّض y في المعادلة الثانية.`, `Sustituye y en la segunda ecuación.`) },
      { type: 'number', answer: y, tolerance: 0, prompt: t('Et y ?', 'And y?', 'و y؟', '¿Y y?'), hint: t(`y = ${a} × ${par(x)}${plus(b)}.`, `y = ${a} × ${par(x)}${plus(b)}.`, `y = ${a} × ${par(x)}${plus(b)}.`, `y = ${a} × ${par(x)}${plus(b)}.`) },
    ],
  };
}

function sysCombination(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, 2, 12), y = int(rng, -4, 9), s = x + y, d = x - y;
  return {
    title: t('Par combinaison', 'By elimination', 'بالتأليفة الخطية', 'Por reducción'),
    summary: `{ x + y = ${rel(s)} ; x − y = ${rel(d)} } : en ajoutant, 2x = ${rel(s + d)} ⇒ x = ${x}, y = ${rel(y)}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous { x + y = ${rel(s)} ; x − y = ${rel(d)} }. Que vaut x ?`, `Solve { x + y = ${rel(s)} ; x − y = ${rel(d)} }. What is x?`, `حل { x + y = ${rel(s)} ; x − y = ${rel(d)} }. ما قيمة x؟`, `Resuelve { x + y = ${rel(s)} ; x − y = ${rel(d)} }. ¿x?`), hint: t(`Additionne les deux équations : les y s’éliminent, 2x = ${rel(s + d)}.`, `Add the two equations: y cancels, 2x = ${rel(s + d)}.`, `اجمع المعادلتين: 2x = ${rel(s + d)}.`, `Suma las dos ecuaciones: 2x = ${rel(s + d)}.`) },
      { type: 'number', answer: y, tolerance: 0, prompt: t('Et y ?', 'And y?', 'و y؟', '¿Y y?'), hint: t(`y = ${rel(s)} − x.`, `y = ${rel(s)} − x.`, `y = ${rel(s)} − x.`, `y = ${rel(s)} − x.`) },
    ],
  };
}

function sysProblem(seed: number): Activity {
  const rng = seeded(seed);
  const pa = pick(rng, [8, 10, 12]), pc = pick(rng, [4, 5, 6]), A = int(rng, 5, 30), C = int(rng, 5, 40);
  const n = A + C, total = pa * A + pc * C;
  return {
    title: t('Problème à deux inconnues', 'A two-unknown problem', 'مسألة بمجهولين', 'Problema con dos incógnitas'),
    summary: `{ a + e = ${n} ; ${pa}a + ${pc}e = ${total} } ⇒ ${A} adultes, ${C} enfants`,
    steps: [
      { type: 'number', answer: A, tolerance: 0, prompt: t(`Au musée, un billet adulte coûte ${pa} € et un billet enfant ${pc} €. ${n} personnes ont payé ${total} € en tout. Combien d’adultes ?`, `At a museum an adult ticket costs $${pa} and a child ticket $${pc}. ${n} people paid $${total} in total. How many adults?`, `في المتحف، تذكرة البالغ ${pa} وتذكرة الطفل ${pc}. دفع ${n} شخصًا ${total} في المجموع. كم بالغًا؟`, `En el museo, la entrada de adulto cuesta ${pa} € y la de niño ${pc} €. ${n} personas pagaron ${total} €. ¿Cuántos adultos?`), hint: t(`{ a + e = ${n} ; ${pa}a + ${pc}e = ${total} }. Remplace e par ${n} − a.`, `{ a + c = ${n} ; ${pa}a + ${pc}c = ${total} }. Replace c with ${n} − a.`, `عوّض e بـ ${n} − a.`, `Sustituye e por ${n} − a.`) },
      { type: 'number', answer: C, tolerance: 0, prompt: t('Et combien d’enfants ?', 'And how many children?', 'وكم طفلًا؟', '¿Y cuántos niños?'), hint: t(`${n} − ${A}.`, `${n} − ${A}.`, `${n} − ${A}.`, `${n} − ${A}.`) },
    ],
  };
}

// ═════════════ SOLIDES ═════════════

function solidPyramid(seed: number): Activity {
  const rng = seeded(seed);
  const c = int(rng, 2, 9), h = 3 * int(rng, 1, 5), r = int(rng, 1, 5), H = int(rng, 2, 9);
  return {
    title: t('Pyramide et cône', 'Pyramid and cone', 'الهرم والمخروط', 'Pirámide y cono'),
    summary: `pyramide : ${c}² × ${h} ÷ 3 = ${(c * c * h) / 3} cm³ · cône : π × ${r}² × ${H} ÷ 3 ≈ ${fr((Math.PI * r * r * H) / 3)} cm³`,
    steps: [
      { type: 'number', answer: (c * c * h) / 3, tolerance: 0, unit: 'cm³', prompt: t(`Une pyramide a une base carrée de côté ${c} cm et une hauteur de ${h} cm. Quel est son volume ?`, `A pyramid has a square base of side ${c} cm and a height of ${h} cm. What is its volume?`, `هرم قاعدته مربع ضلعه ${c} cm وارتفاعه ${h} cm. ما حجمه؟`, `Una pirámide de base cuadrada de ${c} cm y altura ${h} cm. ¿Su volumen?`), hint: t(`V = aire de la base × hauteur ÷ 3 = ${c * c} × ${h} ÷ 3.`, `V = base area × height ÷ 3.`, `الحجم = مساحة القاعدة × الارتفاع ÷ 3.`, `V = área de la base × altura ÷ 3.`) },
      { type: 'number', answer: Math.round(((Math.PI * r * r * H) / 3) * 10) / 10, tolerance: Math.max(0.2, r * r * H * 0.002), unit: 'cm³', prompt: t(`Un cône a un rayon de ${r} cm et une hauteur de ${H} cm. Volume, arrondi au dixième ?`, `A cone has radius ${r} cm and height ${H} cm. Volume to 1 decimal place?`, `مخروط شعاعه ${r} cm وارتفاعه ${H} cm. حجمه مقربًا إلى العشر؟`, `Un cono de radio ${r} cm y altura ${H} cm. ¿Volumen a la décima?`), hint: t(`V = π × ${r}² × ${H} ÷ 3.`, `V = π × ${r}² × ${H} ÷ 3.`, `V = π × ${r}² × ${H} ÷ 3.`, `V = π × ${r}² × ${H} ÷ 3.`) },
    ],
  };
}

function solidSphere(seed: number): Activity {
  const rng = seeded(seed);
  const r = int(rng, 1, 6);
  return {
    title: t('La boule et la sphère', 'Spheres', 'الكرة والفلكة', 'La esfera'),
    summary: `r = ${r} : aire 4πr² ≈ ${fr(4 * Math.PI * r * r)} cm² · volume 4/3 πr³ ≈ ${fr((4 / 3) * Math.PI * r ** 3)} cm³`,
    steps: [
      { type: 'number', answer: Math.round(4 * Math.PI * r * r * 10) / 10, tolerance: Math.max(0.2, r * r * 0.02), unit: 'cm²', prompt: t(`Calcule l’aire d’une sphère de rayon ${r} cm, arrondie au dixième.`, `Work out the surface area of a sphere of radius ${r} cm, to 1 decimal place.`, `احسب مساحة فلكة شعاعها ${r} cm مقربة إلى العشر.`, `Calcula el área de una esfera de radio ${r} cm, a la décima.`), hint: t(`A = 4 × π × ${r}².`, `A = 4 × π × ${r}².`, `A = 4 × π × ${r}².`, `A = 4 × π × ${r}².`) },
      { type: 'number', answer: Math.round((4 / 3) * Math.PI * r ** 3 * 10) / 10, tolerance: Math.max(0.2, r ** 3 * 0.01), unit: 'cm³', prompt: t('Et le volume de la boule, arrondi au dixième ?', 'And the volume of the ball, to 1 decimal place?', 'وحجم الكرة مقربًا إلى العشر؟', '¿Y el volumen de la bola, a la décima?'), hint: t(`V = 4/3 × π × ${r}³.`, `V = 4/3 × π × ${r}³.`, `V = 4/3 × π × ${r}³.`, `V = 4/3 × π × ${r}³.`) },
    ],
  };
}

function solidScale(seed: number): Activity {
  const rng = seeded(seed);
  const k = pick(rng, [2, 3, 0.5]), A = int(rng, 2, 9) * 4, V = int(rng, 2, 9) * 8;
  const kText = k === 0.5 ? '1/2' : String(k);
  const areaRatio = choices(rng, [same(k === 0.5 ? '1/4' : String(k * k)), same(kText), same(k === 0.5 ? '1/8' : String(k ** 3))]);
  return {
    title: t('Agrandissement et réduction', 'Enlargement and reduction', 'التكبير والتصغير', 'Ampliación y reducción'),
    summary: `rapport k = ${kText} : longueurs × k, aires × k², volumes × k³`,
    steps: [
      { type: 'choice', ...areaRatio, prompt: t(`On ${k > 1 ? 'agrandit' : 'réduit'} un solide de rapport ${kText}. Par combien les aires sont-elles multipliées ?`, `A solid is scaled by ${kText}. What are areas multiplied by?`, `نكبّر أو نصغّر مجسمًا بنسبة ${kText}. في كم تُضرب المساحات؟`, `Se escala un sólido de razón ${kText}. ¿Por cuánto se multiplican las áreas?`), hint: t('Les aires sont multipliées par k², les volumes par k³.', 'Areas are multiplied by k², volumes by k³.', 'المساحات تُضرب في k² والأحجام في k³.', 'Las áreas por k², los volúmenes por k³.') },
      { type: 'number', answer: A * k * k, tolerance: 1e-9, unit: 'cm²', prompt: t(`Une face mesure ${A} cm². Quelle est son aire après la transformation ?`, `A face measures ${A} cm². What is its area afterwards?`, `وجه مساحته ${A} cm². ما مساحته بعد التحويل؟`, `Una cara mide ${A} cm². ¿Su área después?`), hint: t(`${A} × ${k === 0.5 ? '1/4' : k * k}.`, `${A} × ${k === 0.5 ? '1/4' : k * k}.`, `${A} × ${k === 0.5 ? '1/4' : k * k}.`, `${A} × ${k === 0.5 ? '1/4' : k * k}.`) },
      { type: 'number', answer: V * k ** 3, tolerance: 1e-9, unit: 'cm³', prompt: t(`Le solide avait un volume de ${V} cm³. Et maintenant ?`, `The solid had a volume of ${V} cm³. What is it now?`, `كان حجم المجسم ${V} cm³. وكم أصبح؟`, `El sólido tenía ${V} cm³. ¿Y ahora?`), hint: t(`${V} × ${k === 0.5 ? '1/8' : k ** 3}.`, `${V} × ${k === 0.5 ? '1/8' : k ** 3}.`, `${V} × ${k === 0.5 ? '1/8' : k ** 3}.`, `${V} × ${k === 0.5 ? '1/8' : k ** 3}.`) },
    ],
  };
}

function solidSection(seed: number): Activity {
  const rng = seeded(seed);
  const R = pick(rng, [5, 10, 13, 15, 17, 25]), d = { 5: 3, 10: 6, 13: 5, 15: 9, 17: 8, 25: 7 }[R]!;
  const r = Math.sqrt(R * R - d * d);
  const shape = choices(rng, [t('un cercle', 'a circle', 'دائرة', 'un círculo'), t('un carré', 'a square', 'مربع', 'un cuadrado'), t('une ellipse', 'an ellipse', 'إهليلج', 'una elipse')]);
  return {
    title: t('Section d’une sphère par un plan', 'Cross-section of a sphere', 'مقطع فلكة بمستوى', 'Sección de una esfera'),
    summary: `section d’une sphère : un cercle · R = ${R}, distance ${d} : r = √(${R}² − ${d}²) = ${r}`,
    steps: [
      { type: 'choice', ...shape, prompt: t('Quelle est la forme de la section d’une sphère par un plan ?', 'What shape is the cross-section of a sphere by a plane?', 'ما شكل مقطع فلكة بمستوى؟', '¿Qué forma tiene la sección de una esfera por un plano?'), hint: t('Coupe une orange : quelle forme vois-tu ?', 'Slice an orange: what shape do you see?', 'اقطع برتقالة: ما الشكل الذي تراه؟', 'Corta una naranja: ¿qué forma ves?') },
      { type: 'number', answer: r, tolerance: 0, unit: 'cm', prompt: t(`Une sphère de rayon ${R} cm est coupée par un plan à ${d} cm du centre. Quel est le rayon de la section ?`, `A sphere of radius ${R} cm is cut by a plane ${d} cm from the centre. What is the radius of the section?`, `فلكة شعاعها ${R} cm يقطعها مستوى على بعد ${d} cm من المركز. ما شعاع المقطع؟`, `Una esfera de radio ${R} cm se corta a ${d} cm del centro. ¿Radio de la sección?`), hint: t(`Pythagore dans le triangle centre – centre de la section – point du cercle : r² = ${R}² − ${d}².`, `Pythagoras: r² = ${R}² − ${d}².`, `فيثاغورس: r² = ${R}² − ${d}².`, `Pitágoras: r² = ${R}² − ${d}².`) },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const TROISIEME_SKILLS: Skill[] = [
  { id: 'root-perfect', review: 0, chapter: 'roots', build: rootPerfect, title: s('Racines de carrés parfaits', 'Perfect squares', 'جذور المربعات الكاملة', 'Cuadrados perfectos'), desc: s('Et le piège √(a + b).', 'And the √(a + b) trap.', 'وفخ √(a + b).', 'Y la trampa √(a + b).') },
  { id: 'root-simplify', review: 0, chapter: 'roots', build: rootSimplify, title: s('Simplifier', 'Simplify', 'التبسيط', 'Simplificar'), desc: s('√12 = 2√3, √a × √b.', '√12 = 2√3, √a × √b.', '√12 = 2√3.', '√12 = 2√3.') },
  { id: 'root-equation', review: 1, chapter: 'roots', build: rootEquation, title: s('L’équation x² = a', 'x² = a', 'المعادلة x² = a', 'La ecuación x² = a'), desc: s('Deux, une ou aucune solution.', 'Two, one or no solution.', 'حلان أو حل أو لا حل.', 'Dos, una o ninguna solución.') },
  { id: 'root-approx', review: 1, chapter: 'roots', build: rootApprox, title: s('Valeurs approchées', 'Approximations', 'القيم المقربة', 'Aproximaciones'), desc: s('Encadrer, arrondir une longueur.', 'Bound and round a length.', 'التأطير والتقريب.', 'Acotar y redondear.') },
  { id: 'id-square-sum', review: 1, chapter: 'identities', build: idSquareSum, title: s('(a + b)²', '(a + b)²', '(a + b)²', '(a + b)²'), desc: s('Le double produit oublié.', 'The forgotten middle term.', 'الجداء المضاعف المنسي.', 'El doble producto olvidado.') },
  { id: 'id-square-diff', review: 0, chapter: 'identities', build: idSquareDiff, title: s('(a − b)²', '(a − b)²', '(a − b)²', '(a − b)²'), desc: s('Signes et coefficient au carré.', 'Signs and squared coefficient.', 'الإشارات والمعامل المربع.', 'Signos y coeficiente al cuadrado.') },
  { id: 'id-product', review: 0, chapter: 'identities', build: idProduct, title: s('(a + b)(a − b)', '(a + b)(a − b)', '(a + b)(a − b)', '(a + b)(a − b)'), desc: s('a² − b² et calcul mental.', 'a² − b² and mental maths.', 'a² − b² والحساب الذهني.', 'a² − b² y cálculo mental.') },
  { id: 'id-factor', review: 0, chapter: 'identities', build: idFactor, title: s('Factoriser', 'Factorise', 'التعميل', 'Factorizar'), desc: s('Reconnaître une identité, un facteur commun.', 'Spot an identity or a common factor.', 'التعرف على متطابقة أو عامل مشترك.', 'Reconocer una identidad o un factor común.') },
  { id: 'ineq-solve', review: 0, chapter: 'inequalities', build: ineqSolve, title: s('Résoudre une inéquation', 'Solve an inequality', 'حل متراجحة', 'Resolver una inecuación'), desc: s('Comme une équation, ou presque.', 'Like an equation, almost.', 'كالمعادلة تقريبًا.', 'Como una ecuación, casi.') },
  { id: 'ineq-flip', review: 0, chapter: 'inequalities', build: ineqFlip, title: s('Diviser par un négatif', 'Divide by a negative', 'القسمة على سالب', 'Dividir entre negativo'), desc: s('Le sens change.', 'The sign flips.', 'الاتجاه يتغير.', 'El sentido cambia.') },
  { id: 'ineq-product', review: 0, chapter: 'inequalities', build: ineqProduct, title: s('Équation produit', 'Zero product', 'معادلة الجداء', 'Ecuación producto'), desc: s('Un facteur nul suffit.', 'One zero factor is enough.', 'يكفي أن ينعدم عامل.', 'Basta un factor nulo.') },
  { id: 'ineq-square-diff', review: 0, chapter: 'inequalities', build: ineqSquareDiff, title: s('Factoriser pour résoudre', 'Factorise to solve', 'التعميل للحل', 'Factorizar para resolver'), desc: s('x² − a² = 0.', 'x² − a² = 0.', 'x² − a² = 0.', 'x² − a² = 0.') },
  { id: 'sys-check', review: 0, chapter: 'systems', build: sysCheck, title: s('Vérifier un couple', 'Check a pair', 'التحقق من زوج', 'Comprobar un par'), desc: s('Les deux équations à la fois.', 'Both equations at once.', 'المعادلتان معًا.', 'Las dos ecuaciones.') },
  { id: 'sys-substitution', review: 0, chapter: 'systems', build: sysSubstitution, title: s('Substitution', 'Substitution', 'التعويض', 'Sustitución'), desc: s('Remplacer y.', 'Replace y.', 'تعويض y.', 'Sustituir y.') },
  { id: 'sys-combination', review: 0, chapter: 'systems', build: sysCombination, title: s('Combinaison', 'Elimination', 'التأليفة الخطية', 'Reducción'), desc: s('Ajouter les équations.', 'Add the equations.', 'جمع المعادلتين.', 'Sumar las ecuaciones.') },
  { id: 'sys-problem', review: 0, chapter: 'systems', build: sysProblem, title: s('Mettre en système', 'Write the system', 'وضع النظمة', 'Plantear el sistema'), desc: s('Billets, prix, quantités.', 'Tickets, prices, quantities.', 'التذاكر والأثمان.', 'Entradas, precios.') },
  { id: 'solid-pyramid', review: 0, chapter: 'solids', build: solidPyramid, title: s('Pyramide et cône', 'Pyramid and cone', 'الهرم والمخروط', 'Pirámide y cono'), desc: s('Un tiers de base × hauteur.', 'A third of base × height.', 'ثلث القاعدة × الارتفاع.', 'Un tercio de base × altura.') },
  { id: 'solid-sphere', review: 0, chapter: 'solids', build: solidSphere, title: s('La boule', 'The sphere', 'الكرة', 'La esfera'), desc: s('4πr² et 4/3 πr³.', '4πr² and 4/3 πr³.', '4πr² و 4/3 πr³.', '4πr² y 4/3 πr³.') },
  { id: 'solid-section', review: 1, chapter: 'solids', build: solidSection, title: s('Sections', 'Cross-sections', 'المقاطع', 'Secciones'), desc: s('Couper une sphère.', 'Slicing a sphere.', 'قطع فلكة.', 'Cortar una esfera.') },
  { id: 'solid-scale', review: 1, chapter: 'solids', build: solidScale, title: s('Agrandir, réduire', 'Enlarge, reduce', 'التكبير والتصغير', 'Ampliar, reducir'), desc: s('k, k², k³.', 'k, k², k³.', 'k و k² و k³.', 'k, k², k³.') },
];
