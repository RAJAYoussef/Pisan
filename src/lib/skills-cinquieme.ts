// Parcours de 5e (FR, CI, SN) et Grade 7 (CCSS) : multiples et nombres premiers, angles et parallélisme,
// aires et volumes (triangle, parallélogramme, disque, prisme, cylindre), premières probabilités.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type P, type Rng, type Scene, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const fr = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');
/** Choix mélangés : la bonne réponse est toujours la première de `list`. */
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}
const isPrime = (n: number) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every(d => n % d !== 0);
const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);
const gcdPair = (a: number, b: number): number => (b ? gcdPair(b, a % b) : a);
/** Fraction irréductible écrite « a/b ». */
const frac = (a: number, b: number) => { const g = gcdPair(a, b); return `${a / g}/${b / g}`; };

// ═════════════ MULTIPLES, DIVISEURS, NOMBRES PREMIERS ═════════════

function primeMultiples(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 6, 13), m = k * int(rng, 7, 15), notM = m + int(rng, 1, k - 1);
  const [n, yes] = rng() < 0.5 ? [m, true] : [notM, false];
  const d = int(rng, 6, 9), limit = int(rng, 40, 90);
  return {
    title: t('Multiples et diviseurs', 'Multiples and factors', 'المضاعفات والقواسم', 'Múltiplos y divisores'),
    summary: `${m} = ${k} × ${m / k} : ${m} est un multiple de ${k}, ${k} est un diviseur de ${m}`,
    steps: [
      { type: 'choice', options: OUI_NON, answer: yes ? 0 : 1, prompt: t(`${n} est-il un multiple de ${k} ?`, `Is ${n} a multiple of ${k}?`, `هل ${n} مضاعف لـ ${k}؟`, `¿${n} es múltiplo de ${k}?`), hint: t(`Divise ${n} par ${k} : le reste est-il nul ?`, `Divide ${n} by ${k}: is the remainder zero?`, `اقسم ${n} على ${k}: هل الباقي منعدم؟`, `Divide ${n} entre ${k}: ¿el resto es cero?`) },
      { type: 'number', answer: Math.floor(limit / d), tolerance: 0, prompt: t(`Combien y a-t-il de multiples de ${d} entre 1 et ${limit} ?`, `How many multiples of ${d} are there from 1 to ${limit}?`, `كم عدد مضاعفات ${d} بين 1 و ${limit}؟`, `¿Cuántos múltiplos de ${d} hay entre 1 y ${limit}?`), hint: t(`${d} × 1, ${d} × 2, … jusqu’au dernier qui ne dépasse pas ${limit} : c’est le quotient de ${limit} par ${d}.`, `${d} × 1, ${d} × 2, … up to the last one not above ${limit}: the quotient of ${limit} by ${d}.`, `إنه خارج قسمة ${limit} على ${d}.`, `Es el cociente de ${limit} entre ${d}.`) },
      { type: 'number', answer: m / k, tolerance: 0, prompt: t(`${k} est un diviseur de ${m}. Par quel nombre faut-il multiplier ${k} pour obtenir ${m} ?`, `${k} is a factor of ${m}. What do you multiply ${k} by to get ${m}?`, `${k} قاسم لـ ${m}. في أي عدد نضرب ${k} لنحصل على ${m}؟`, `${k} es divisor de ${m}. ¿Por qué número se multiplica ${k} para obtener ${m}?`), hint: t(`C’est ${m} ÷ ${k}.`, `It is ${m} ÷ ${k}.`, `إنه ${m} ÷ ${k}.`, `Es ${m} ÷ ${k}.`) },
    ],
  };
}

function primeDivisors(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]);
  const divs = divisors(n);
  const good = divs[int(rng, 1, divs.length - 2)]!;
  const bad: number[] = [];
  while (bad.length < 3) { const v = int(rng, 2, n - 1); if (n % v !== 0 && !bad.includes(v)) bad.push(v); }
  const pickDiv = choices(rng, [good, ...bad].map(v => same(String(v))));
  return {
    title: t('Trouver tous les diviseurs', 'Finding every factor', 'إيجاد جميع القواسم', 'Hallar todos los divisores'),
    summary: `diviseurs de ${n} : ${divs.join(', ')} (par paires : ${divs.slice(0, Math.ceil(divs.length / 2)).map(d => `${d} × ${n / d}`).join(', ')})`,
    steps: [
      { type: 'choice', ...pickDiv, prompt: t(`Lequel de ces nombres est un diviseur de ${n} ?`, `Which of these numbers is a factor of ${n}?`, `أي هذه الأعداد قاسم لـ ${n}؟`, `¿Cuál de estos números es divisor de ${n}?`), hint: t(`Un diviseur de ${n} « tombe juste » : ${n} ÷ diviseur donne un entier.`, `A factor divides ${n} exactly.`, `القاسم يقسم ${n} قسمة تامة.`, `Un divisor divide ${n} exactamente.`) },
      { type: 'number', answer: divs.length, tolerance: 0, prompt: t(`Combien ${n} a-t-il de diviseurs (1 et ${n} compris) ?`, `How many factors does ${n} have (including 1 and ${n})?`, `كم قاسمًا للعدد ${n} (بما فيها 1 و ${n})؟`, `¿Cuántos divisores tiene ${n} (incluidos 1 y ${n})?`), hint: t(`Cherche-les par paires : 1 × ${n}, 2 × ${n / 2 === Math.floor(n / 2) ? n / 2 : '…'}, 3 × … jusqu’à ce que les paires se croisent.`, `Find them in pairs: 1 × ${n}, 2 × …, 3 × … until the pairs meet.`, `ابحث عنها أزواجًا: 1 × ${n}، 2 × …`, `Búscalos por parejas: 1 × ${n}, 2 × …`) },
    ],
  };
}

function primeRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const primes = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const traps = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93];
  const p = pick(rng, primes);
  const others = shuffle(rng, traps).slice(0, 3);
  const which = choices(rng, [p, ...others].map(v => same(String(v))));
  const q = pick(rng, [51, 57, 87, 91, 39, 69]), f = divisors(q)[1]!;
  return {
    title: t('Reconnaître un nombre premier', 'Recognising prime numbers', 'التعرف على عدد أولي', 'Reconocer un número primo'),
    summary: `${p} est premier (deux diviseurs : 1 et ${p}) · ${q} = ${f} × ${q / f} ne l’est pas`,
    steps: [
      { type: 'choice', ...which, prompt: t('Lequel de ces nombres est premier ?', 'Which of these numbers is prime?', 'أي هذه الأعداد أولي؟', '¿Cuál de estos números es primo?'), hint: t('Un nombre premier a exactement deux diviseurs : 1 et lui-même. Teste 3, 7… sur les autres.', 'A prime has exactly two factors: 1 and itself. Test 3, 7… on the others.', 'العدد الأولي له قاسمان فقط: 1 ونفسه.', 'Un primo tiene exactamente dos divisores: 1 y él mismo.') },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`${q} est-il un nombre premier ?`, `Is ${q} a prime number?`, `هل ${q} عدد أولي؟`, `¿${q} es un número primo?`), hint: t(`Essaie de diviser ${q} par 3, puis par 7.`, `Try dividing ${q} by 3, then by 7.`, `جرّب قسمة ${q} على 3 ثم على 7.`, `Prueba a dividir ${q} entre 3 y luego entre 7.`) },
      { type: 'number', answer: f, tolerance: 0, prompt: t(`Donne le plus petit diviseur de ${q} autre que 1.`, `Give the smallest factor of ${q} other than 1.`, `أعط أصغر قاسم لـ ${q} غير 1.`, `Da el menor divisor de ${q} distinto de 1.`), hint: t('Essaie 2, puis 3, puis 5, puis 7…', 'Try 2, then 3, then 5, then 7…', 'جرّب 2 ثم 3 ثم 5 ثم 7…', 'Prueba 2, 3, 5, 7…') },
    ],
  };
}

function primeFactor(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 1, 3), b = int(rng, 0, 2), e = pick(rng, [5, 7]);
  const n = 2 ** a * 3 ** b * e;
  const factors = [...Array(a).fill(2), ...Array(b).fill(3), e] as number[];
  const missing = factors[factors.length - 1]!;
  const shown = factors.slice(0, -1);
  const fA = 2 * int(rng, 2, 5), fB = fA * pick(rng, [3, 5]);
  return {
    title: t('Décomposer en facteurs premiers', 'Prime factorisation', 'التفكيك إلى جداء عوامل أولية', 'Descomponer en factores primos'),
    summary: `${n} = ${factors.join(' × ')}`,
    steps: [
      { type: 'number', answer: missing, tolerance: 0, prompt: t(`Complète la décomposition en facteurs premiers : ${n} = ${shown.join(' × ')} × …`, `Complete the prime factorisation: ${n} = ${shown.join(' × ')} × …`, `أتمم التفكيك: ${n} = ${shown.join(' × ')} × …`, `Completa: ${n} = ${shown.join(' × ')} × …`), hint: t(`Calcule ${shown.join(' × ')} = ${shown.reduce((x, y) => x * y, 1)}, puis divise ${n} par ce nombre.`, `Work out ${shown.join(' × ')} = ${shown.reduce((x, y) => x * y, 1)}, then divide ${n} by it.`, `احسب ${shown.reduce((x, y) => x * y, 1)} ثم اقسم ${n} عليه.`, `Calcula ${shown.reduce((x, y) => x * y, 1)} y divide ${n} entre él.`) },
      { type: 'number', answer: fA / 2, tolerance: 0, prompt: t(`Simplifie la fraction ${fA}/${fB} : on divise le numérateur et le dénominateur par 2. Quel est le nouveau numérateur ?`, `Simplify ${fA}/${fB}: divide top and bottom by 2. What is the new numerator?`, `بسّط الكسر ${fA}/${fB} بالقسمة على 2. ما البسط الجديد؟`, `Simplifica ${fA}/${fB} dividiendo entre 2. ¿Nuevo numerador?`), hint: t(`${fA} ÷ 2.`, `${fA} ÷ 2.`, `${fA} ÷ 2.`, `${fA} ÷ 2.`) },
      { type: 'choice', ...choices(rng, [same(frac(fA, fB)), same(`${fA / 2}/${fB / 2}`), same(`${fA - 1}/${fB - 1}`)]), prompt: t(`Quelle est la forme irréductible de ${fA}/${fB} ?`, `What is ${fA}/${fB} in lowest terms?`, `ما الكتابة غير القابلة للاختزال لـ ${fA}/${fB}؟`, `¿Cuál es la fracción irreducible de ${fA}/${fB}?`), hint: t('Décompose le numérateur et le dénominateur, puis barre les facteurs communs.', 'Factorise top and bottom, then cancel common factors.', 'فكّك البسط والمقام ثم اختزل العوامل المشتركة.', 'Descompón numerador y denominador y tacha los factores comunes.') },
    ],
  };
}

// ═════════════ ANGLES ═════════════

/** Triangle avec ses angles écrits près des sommets (le troisième remplacé par « ? »). */
function triangleScene(A: number, B: number, hide: 'C' | null): Scene {
  const a = (A * Math.PI) / 180, b = (B * Math.PI) / 180, base = 6;
  const h = (base * Math.tan(a) * Math.tan(b)) / (Math.tan(a) + Math.tan(b));
  const C = { x: h / Math.tan(a), y: h };
  const pts: Record<string, P> = { A: { x: 0, y: 0 }, B: { x: base, y: 0 }, C };
  const C_ = 180 - A - B;
  return {
    points: pts,
    segments: [{ id: 'ab', a: 'A', b: 'B' }, { id: 'bc', a: 'B', b: 'C' }, { id: 'ca', a: 'C', b: 'A' }],
    angleMarks: [['B', 'A', 'C'], ['C', 'B', 'A'], ['A', 'C', 'B']],
    labels: [{ at: { x: 1.1, y: 0.35 }, text: `${A}°` }, { at: { x: base - 1.1, y: 0.35 }, text: `${B}°` }, { at: { x: C.x, y: C.y - 0.9 }, text: hide ? '?' : `${C_}°` }],
  };
}

function angSum(seed: number): Activity {
  const rng = seeded(seed);
  let A: number, B: number;
  do { A = 5 * int(rng, 6, 16); B = 5 * int(rng, 6, 16); } while (A + B > 140 || A + B < 70);
  const x = 5 * int(rng, 6, 14), y = 5 * int(rng, 4, 12);
  return {
    title: t('La somme des angles d’un triangle', 'Angles in a triangle', 'مجموع زوايا مثلث', 'La suma de los ángulos de un triángulo'),
    summary: `${A}° + ${B}° + ${180 - A - B}° = 180°`,
    steps: [
      { type: 'number', scene: triangleScene(A, B, 'C'), answer: 180 - A - B, tolerance: 0, unit: '°', prompt: t('Quelle est la mesure de l’angle marqué « ? » ?', 'What is the angle marked “?”', 'ما قياس الزاوية المشار إليها بـ « ? »؟', '¿Cuánto mide el ángulo marcado «?»?'), hint: t(`Dans un triangle, les trois angles font 180° en tout : 180 − ${A} − ${B}.`, `The three angles of a triangle add up to 180°: 180 − ${A} − ${B}.`, `مجموع زوايا المثلث 180°: 180 − ${A} − ${B}.`, `Los tres ángulos suman 180°: 180 − ${A} − ${B}.`) },
      { type: 'number', answer: 90 - x, tolerance: 0, unit: '°', prompt: t(`Un triangle rectangle a un angle aigu de ${x}°. Combien mesure l’autre angle aigu ?`, `A right triangle has an acute angle of ${x}°. What is the other acute angle?`, `مثلث قائم إحدى زاويتيه الحادتين ${x}°. كم تقيس الأخرى؟`, `Un triángulo rectángulo tiene un ángulo agudo de ${x}°. ¿Cuánto mide el otro?`), hint: t('L’angle droit prend déjà 90° : les deux angles aigus se partagent les 90° restants.', 'The right angle takes 90°: the two acute angles share the other 90°.', 'الزاوية القائمة تأخذ 90°: والحادتان تتقاسمان 90° الباقية.', 'El recto ocupa 90°: los agudos se reparten los otros 90°.') },
      { type: 'number', answer: 180 - 2 * y, tolerance: 0, unit: '°', prompt: t(`Un triangle isocèle a deux angles à la base de ${y}° chacun. Combien mesure l’angle au sommet principal ?`, `An isosceles triangle has two base angles of ${y}° each. What is the third angle?`, `مثلث متساوي الساقين زاويتا قاعدته ${y}° لكل منهما. كم تقيس زاوية الرأس؟`, `Un triángulo isósceles tiene dos ángulos de la base de ${y}° cada uno. ¿Cuánto mide el tercero?`), hint: t(`180 − ${y} − ${y}.`, `180 − ${y} − ${y}.`, `180 − ${y} − ${y}.`, `180 − ${y} − ${y}.`) },
    ],
  };
}

/** Deux parallèles (y = 0 et y = 3) coupées par une sécante. */
function parallelScene(marks: [string, string, string][], label: { at: P; text: string }[]): Scene {
  return {
    points: { L1: { x: -1, y: 0 }, R1: { x: 7, y: 0 }, L2: { x: -1, y: 3 }, R2: { x: 7, y: 3 }, S0: { x: 1, y: -1.2 }, S1: { x: 5, y: 4.2 }, P: { x: 1.9, y: 0 }, Q: { x: 4.1, y: 3 } },
    hidden: ['L1', 'R1', 'L2', 'R2', 'S0', 'S1'],
    segments: [{ id: 'd1', a: 'L1', b: 'R1' }, { id: 'd2', a: 'L2', b: 'R2' }, { id: 'sec', a: 'S0', b: 'S1', style: 'bold' }],
    angleMarks: marks,
    labels: [{ at: { x: 6.6, y: 0.4 }, text: '(d)' }, { at: { x: 6.6, y: 3.4 }, text: '(d′)' }, ...label],
  };
}
const PAIRS: { name: L; marks: [string, string, string][] }[] = [
  { name: t('alternes-internes', 'alternate interior', 'متبادلتان داخليًا', 'alternos internos'), marks: [['R1', 'P', 'S1'], ['L2', 'Q', 'S0']] },
  { name: t('correspondants', 'corresponding', 'متناظرتان', 'correspondientes'), marks: [['R1', 'P', 'S1'], ['R2', 'Q', 'S1']] },
  { name: t('opposés par le sommet', 'vertically opposite', 'متقابلتان بالرأس', 'opuestos por el vértice'), marks: [['R1', 'P', 'S1'], ['L1', 'P', 'S0']] },
];

function angParallel(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 0, 2), pair = PAIRS[k]!;
  const a = 5 * int(rng, 8, 15);
  const which = PAIRS[int(rng, 0, 1)]!;
  return {
    title: t('Angles et droites parallèles', 'Angles and parallel lines', 'الزوايا والمستقيمات المتوازية', 'Ángulos y rectas paralelas'),
    summary: `(d) // (d′) : angles alternes-internes égaux, angles correspondants égaux`,
    steps: [
      { type: 'choice', scene: parallelScene(pair.marks, []), options: PAIRS.map(p => p.name), answer: k, prompt: t('Comment appelle-t-on les deux angles marqués ?', 'What are the two marked angles called?', 'ماذا نسمي الزاويتين المرمزتين؟', '¿Cómo se llaman los dos ángulos marcados?'), hint: t('Alternes-internes : de part et d’autre de la sécante, entre les deux droites. Correspondants : du même côté, à la même place sur chaque droite.', 'Alternate interior: either side of the transversal, between the lines. Corresponding: same side, same position at each line.', 'متبادلتان داخليًا: على جانبي القاطع بين المستقيمين. متناظرتان: في نفس الجهة ونفس الموضع.', 'Alternos internos: a ambos lados de la secante, entre las rectas. Correspondientes: mismo lado y posición.') },
      { type: 'number', scene: parallelScene(which.marks, [{ at: { x: 2.9, y: 0.45 }, text: `${a}°` }]), answer: a, tolerance: 0, unit: '°', prompt: t(`Les droites (d) et (d′) sont parallèles. L’angle marqué en bas mesure ${a}°. Combien mesure l’angle marqué en haut ?`, `Lines (d) and (d′) are parallel. The lower marked angle is ${a}°. What is the upper one?`, `المستقيمان (d) و (d′) متوازيان. الزاوية السفلى ${a}°. كم تقيس العليا؟`, `Las rectas (d) y (d′) son paralelas. El ángulo de abajo mide ${a}°. ¿Cuánto mide el de arriba?`), hint: t(`Ces angles sont ${which.name.fr}, et les droites sont parallèles : ils ont la même mesure.`, `These angles are ${which.name.en} and the lines are parallel: they are equal.`, `هاتان الزاويتان ${which.name.ar} والمستقيمان متوازيان: لهما نفس القياس.`, `Son ${which.name.es} y las rectas son paralelas: miden lo mismo.`) },
    ],
  };
}

function angSupplementary(seed: number): Activity {
  const rng = seeded(seed);
  const a = 5 * int(rng, 7, 30), b = 5 * int(rng, 3, 15), c = 5 * int(rng, 7, 30);
  return {
    title: t('Angles complémentaires et supplémentaires', 'Complementary and supplementary angles', 'الزوايا المتتامة والمتكاملة', 'Ángulos complementarios y suplementarios'),
    summary: `supplémentaires : somme 180° (${a}° et ${180 - a}°) · complémentaires : somme 90° (${b}° et ${90 - b}°)`,
    steps: [
      { type: 'number', answer: 180 - a, tolerance: 0, unit: '°', prompt: t(`Deux angles sont supplémentaires. L’un mesure ${a}°. Combien mesure l’autre ?`, `Two angles are supplementary. One is ${a}°. What is the other?`, `زاويتان متكاملتان إحداهما ${a}°. كم تقيس الأخرى؟`, `Dos ángulos son suplementarios. Uno mide ${a}°. ¿Y el otro?`), hint: t('Supplémentaires : leur somme fait 180° (un angle plat).', 'Supplementary: they add up to 180° (a straight angle).', 'متكاملتان: مجموعهما 180°.', 'Suplementarios: suman 180°.') },
      { type: 'number', answer: 90 - b, tolerance: 0, unit: '°', prompt: t(`Deux angles sont complémentaires. L’un mesure ${b}°. Combien mesure l’autre ?`, `Two angles are complementary. One is ${b}°. What is the other?`, `زاويتان متتامتان إحداهما ${b}°. كم تقيس الأخرى؟`, `Dos ángulos son complementarios. Uno mide ${b}°. ¿Y el otro?`), hint: t('Complémentaires : leur somme fait 90° (un angle droit).', 'Complementary: they add up to 90° (a right angle).', 'متتامتان: مجموعهما 90°.', 'Complementarios: suman 90°.') },
      { type: 'number', scene: parallelScene([['R1', 'P', 'S1'], ['L1', 'P', 'S0']], [{ at: { x: 2.9, y: 0.45 }, text: `${c}°` }]), answer: c, tolerance: 0, unit: '°', prompt: t(`Deux droites se coupent. Un angle mesure ${c}°. Combien mesure l’angle opposé par le sommet (l’autre angle marqué) ?`, `Two lines cross. One angle is ${c}°. What is the vertically opposite angle (the other marked one)?`, `مستقيمان متقاطعان. زاوية تقيس ${c}°. كم تقيس الزاوية المقابلة لها بالرأس؟`, `Dos rectas se cortan. Un ángulo mide ${c}°. ¿Cuánto mide el opuesto por el vértice?`), hint: t('Deux angles opposés par le sommet ont la même mesure.', 'Vertically opposite angles are equal.', 'الزاويتان المتقابلتان بالرأس لهما نفس القياس.', 'Los ángulos opuestos por el vértice son iguales.') },
    ],
  };
}

// ═════════════ AIRES ET VOLUMES ═════════════

function areaTriangle(seed: number): Activity {
  const rng = seeded(seed);
  const b = 2 * int(rng, 2, 5), h = int(rng, 2, 5), off = int(rng, 1, b - 1);
  const scene: Scene = {
    points: { A: { x: 0, y: 0 }, B: { x: b, y: 0 }, C: { x: off, y: h }, H: { x: off, y: 0 } },
    segments: [{ id: 'ab', a: 'A', b: 'B', text: `${b} cm` }, { id: 'bc', a: 'B', b: 'C' }, { id: 'ca', a: 'C', b: 'A' }, { id: 'ch', a: 'C', b: 'H', style: 'dashed', text: `${h} cm` }],
    rightAngles: [['C', 'H', 'B']],
  };
  const formula = choices(rng, [same('(base × hauteur) ÷ 2'), same('base × hauteur'), same('(base + hauteur) × 2')]);
  return {
    title: t('Aire d’un triangle', 'Area of a triangle', 'مساحة مثلث', 'Área de un triángulo'),
    summary: `aire = (${b} × ${h}) ÷ 2 = ${(b * h) / 2} cm²`,
    steps: [
      { type: 'choice', scene, ...formula, prompt: t('Quelle formule donne l’aire d’un triangle ?', 'Which formula gives the area of a triangle?', 'ما الصيغة التي تعطي مساحة مثلث؟', '¿Qué fórmula da el área de un triángulo?'), hint: t('Un triangle, c’est la moitié d’un rectangle de même base et de même hauteur.', 'A triangle is half a rectangle with the same base and height.', 'المثلث نصف مستطيل له نفس القاعدة والارتفاع.', 'Un triángulo es la mitad de un rectángulo de igual base y altura.') },
      { type: 'number', scene, answer: (b * h) / 2, tolerance: 0, unit: 'cm²', prompt: t('Calcule l’aire de ce triangle.', 'Work out the area of this triangle.', 'احسب مساحة هذا المثلث.', 'Calcula el área de este triángulo.'), hint: t(`La hauteur (en pointillés) est perpendiculaire à la base : (${b} × ${h}) ÷ 2.`, `The height (dashed) is perpendicular to the base: (${b} × ${h}) ÷ 2.`, `الارتفاع عمودي على القاعدة: (${b} × ${h}) ÷ 2.`, `La altura es perpendicular a la base: (${b} × ${h}) ÷ 2.`) },
    ],
  };
}

function areaParallelogram(seed: number): Activity {
  const rng = seeded(seed);
  const b = int(rng, 3, 7), h = int(rng, 2, 4), s = int(rng, 1, 2);
  const scene: Scene = {
    points: { A: { x: 0, y: 0 }, B: { x: b, y: 0 }, C: { x: b + s, y: h }, D: { x: s, y: h }, H: { x: s, y: 0 } },
    segments: [{ id: 'ab', a: 'A', b: 'B', text: `${b} cm` }, { id: 'bc', a: 'B', b: 'C' }, { id: 'cd', a: 'C', b: 'D' }, { id: 'da', a: 'D', b: 'A' }, { id: 'dh', a: 'D', b: 'H', style: 'dashed', text: `${h} cm` }],
    rightAngles: [['D', 'H', 'B']],
  };
  const L = int(rng, 4, 9), W = int(rng, 2, 6);
  return {
    title: t('Aire d’un parallélogramme', 'Area of a parallelogram', 'مساحة متوازي أضلاع', 'Área de un paralelogramo'),
    summary: `aire = base × hauteur = ${b} × ${h} = ${b * h} cm²`,
    steps: [
      { type: 'number', scene, answer: b * h, tolerance: 0, unit: 'cm²', prompt: t('Calcule l’aire de ce parallélogramme.', 'Work out the area of this parallelogram.', 'احسب مساحة متوازي الأضلاع هذا.', 'Calcula el área de este paralelogramo.'), hint: t(`On découpe le triangle de gauche et on le recolle à droite : on obtient un rectangle ${b} × ${h}.`, `Cut off the left triangle and move it to the right: you get a ${b} × ${h} rectangle.`, `نقص المثلث الأيسر ونلصقه يمينًا فنحصل على مستطيل ${b} × ${h}.`, `Recorta el triángulo izquierdo y pégalo a la derecha: un rectángulo ${b} × ${h}.`) },
      { type: 'number', answer: (L * W) / 2, tolerance: 0, unit: 'cm²', prompt: t(`Un triangle rectangle a deux côtés de l’angle droit de ${L} cm et ${W} cm. Quelle est son aire ?`, `A right triangle has legs of ${L} cm and ${W} cm. What is its area?`, `مثلث قائم ضلعا زاويته القائمة ${L} cm و ${W} cm. ما مساحته؟`, `Un triángulo rectángulo tiene catetos de ${L} cm y ${W} cm. ¿Su área?`), hint: t(`Un côté de l’angle droit sert de hauteur pour l’autre : (${L} × ${W}) ÷ 2.`, `One leg is the height for the other: (${L} × ${W}) ÷ 2.`, `(${L} × ${W}) ÷ 2.`, `(${L} × ${W}) ÷ 2.`) },
    ],
  };
}

function areaDisk(seed: number): Activity {
  const rng = seeded(seed);
  const r = int(rng, 2, 9), d = 2 * int(rng, 2, 8);
  const scene: Scene = { points: { O: { x: 0, y: 0 }, M: { x: r, y: 0 } }, segments: [{ id: 'om', a: 'O', b: 'M', text: `${r} cm` }], circle: { c: 'O', r } };
  return {
    title: t('Périmètre et aire du disque', 'Circumference and area of a circle', 'محيط ومساحة القرص', 'Perímetro y área del círculo'),
    summary: `r = ${r} cm : périmètre 2 × π × ${r} ≈ ${fr(2 * 3.14 * r)} cm · aire π × ${r}² ≈ ${fr(3.14 * r * r)} cm²`,
    steps: [
      { type: 'number', scene, answer: Math.round(2 * Math.PI * r * 10) / 10, tolerance: 0.2, unit: 'cm', prompt: t(`Calcule le périmètre de ce cercle, arrondi au dixième (π ≈ 3,14).`, `Work out the circumference, to 1 decimal place (π ≈ 3.14).`, `احسب محيط هذه الدائرة مقربًا إلى العشر (π ≈ 3,14).`, `Calcula el perímetro, redondeado a la décima (π ≈ 3,14).`), hint: t(`Périmètre = 2 × π × rayon = 2 × 3,14 × ${r}.`, `Circumference = 2 × π × radius = 2 × 3.14 × ${r}.`, `المحيط = 2 × π × الشعاع.`, `Perímetro = 2 × π × radio.`) },
      { type: 'number', scene, answer: Math.round(Math.PI * r * r * 10) / 10, tolerance: Math.max(0.3, r * r * 0.002), unit: 'cm²', prompt: t('Calcule l’aire du disque, arrondie au dixième.', 'Work out the area of the disc, to 1 decimal place.', 'احسب مساحة القرص مقربة إلى العشر.', 'Calcula el área del círculo, redondeada a la décima.'), hint: t(`Aire = π × rayon × rayon = 3,14 × ${r} × ${r}.`, `Area = π × radius × radius = 3.14 × ${r} × ${r}.`, `المساحة = π × الشعاع × الشعاع.`, `Área = π × radio × radio.`) },
      { type: 'number', answer: d / 2, tolerance: 0, unit: 'cm', prompt: t(`Un cercle a un diamètre de ${d} cm. Quel est son rayon ?`, `A circle has a diameter of ${d} cm. What is its radius?`, `دائرة قطرها ${d} cm. ما شعاعها؟`, `Un círculo tiene ${d} cm de diámetro. ¿Su radio?`), hint: t('Le rayon est la moitié du diamètre.', 'The radius is half the diameter.', 'الشعاع نصف القطر.', 'El radio es la mitad del diámetro.') },
    ],
  };
}

function volumePrism(seed: number): Activity {
  const rng = seeded(seed);
  const b = 2 * int(rng, 2, 4), h = int(rng, 2, 5), L = int(rng, 4, 10), r = int(rng, 1, 4), H = int(rng, 3, 10);
  const scene: Scene = {
    points: { A: { x: 0, y: 0 }, B: { x: b, y: 0 }, C: { x: b / 2, y: h }, A2: { x: 2.4, y: 1.4 }, B2: { x: b + 2.4, y: 1.4 }, C2: { x: b / 2 + 2.4, y: h + 1.4 } },
    hidden: ['A2', 'B2', 'C2'],
    segments: [{ id: 'ab', a: 'A', b: 'B', text: `${b} cm` }, { id: 'bc', a: 'B', b: 'C' }, { id: 'ca', a: 'C', b: 'A' }, { id: 'a2', a: 'A', b: 'A2', style: 'dashed' }, { id: 'b2', a: 'B', b: 'B2', text: `${L} cm` }, { id: 'c2', a: 'C', b: 'C2' }, { id: 'a2b2', a: 'A2', b: 'B2', style: 'dashed' }, { id: 'b2c2', a: 'B2', b: 'C2' }, { id: 'c2a2', a: 'C2', b: 'A2', style: 'dashed' }],
    caption: t(`Base : triangle de base ${b} cm et de hauteur ${h} cm.`, `Base: triangle with base ${b} cm and height ${h} cm.`, `القاعدة: مثلث قاعدته ${b} cm وارتفاعه ${h} cm.`, `Base: triángulo de base ${b} cm y altura ${h} cm.`),
  };
  return {
    title: t('Volume d’un prisme et d’un cylindre', 'Volume of a prism and a cylinder', 'حجم موشور وأسطوانة', 'Volumen de un prisma y un cilindro'),
    summary: `prisme : aire de la base × hauteur = ${(b * h) / 2} × ${L} = ${(b * h * L) / 2} cm³`,
    steps: [
      { type: 'number', scene, answer: (b * h) / 2, tolerance: 0, unit: 'cm²', prompt: t('Quelle est l’aire de la base (le triangle) ?', 'What is the area of the base (the triangle)?', 'ما مساحة القاعدة (المثلث)؟', '¿Cuál es el área de la base (el triángulo)?'), hint: t(`(${b} × ${h}) ÷ 2.`, `(${b} × ${h}) ÷ 2.`, `(${b} × ${h}) ÷ 2.`, `(${b} × ${h}) ÷ 2.`) },
      { type: 'number', scene, answer: (b * h * L) / 2, tolerance: 0, unit: 'cm³', prompt: t(`Le prisme a une hauteur de ${L} cm. Quel est son volume ?`, `The prism is ${L} cm long. What is its volume?`, `ارتفاع الموشور ${L} cm. ما حجمه؟`, `El prisma mide ${L} cm de alto. ¿Su volumen?`), hint: t(`Volume = aire de la base × hauteur = ${(b * h) / 2} × ${L}.`, `Volume = base area × height = ${(b * h) / 2} × ${L}.`, `الحجم = مساحة القاعدة × الارتفاع.`, `Volumen = área de la base × altura.`) },
      { type: 'number', answer: Math.round(Math.PI * r * r * H * 10) / 10, tolerance: Math.max(0.5, r * r * H * 0.003), unit: 'cm³', prompt: t(`Un cylindre a un rayon de ${r} cm et une hauteur de ${H} cm. Quel est son volume, arrondi au dixième ?`, `A cylinder has radius ${r} cm and height ${H} cm. What is its volume, to 1 decimal place?`, `أسطوانة شعاعها ${r} cm وارتفاعها ${H} cm. ما حجمها مقربًا إلى العشر؟`, `Un cilindro tiene radio ${r} cm y altura ${H} cm. ¿Su volumen, a la décima?`), hint: t(`La base est un disque : π × ${r} × ${r}, puis × ${H}.`, `The base is a disc: π × ${r} × ${r}, then × ${H}.`, `القاعدة قرص: π × ${r} × ${r} ثم × ${H}.`, `La base es un círculo: π × ${r} × ${r}, luego × ${H}.`) },
    ],
  };
}

// ═════════════ PROBABILITÉS ═════════════

function chanceVocab(seed: number): Activity {
  const rng = seeded(seed);
  const SCALE = [t('impossible', 'impossible', 'مستحيل', 'imposible'), t('peu probable', 'unlikely', 'قليل الاحتمال', 'poco probable'), t('une chance sur deux', 'even chance', 'فرصة من اثنتين', 'una de cada dos'), t('très probable', 'likely', 'محتمل جدًا', 'muy probable'), t('certain', 'certain', 'أكيد', 'seguro')];
  const events: { e: L; k: number }[] = [
    { e: t('obtenir 7 avec un dé à six faces', 'rolling a 7 on a six-sided die', 'الحصول على 7 بنرد ذي ستة أوجه', 'sacar 7 con un dado de seis caras'), k: 0 },
    { e: t('obtenir 6 avec un dé à six faces', 'rolling a 6 on a six-sided die', 'الحصول على 6 بنرد', 'sacar 6 con un dado'), k: 1 },
    { e: t('obtenir « pile » en lançant une pièce', 'getting heads when tossing a coin', 'الحصول على « ظهر » برمي قطعة نقدية', 'sacar cara al lanzar una moneda'), k: 2 },
    { e: t('obtenir un nombre inférieur à 6 avec un dé', 'rolling less than 6 on a die', 'الحصول على عدد أصغر من 6 بنرد', 'sacar menos de 6 con un dado'), k: 3 },
    { e: t('obtenir un nombre entre 1 et 6 avec un dé', 'rolling a number from 1 to 6 on a die', 'الحصول على عدد بين 1 و 6 بنرد', 'sacar un número del 1 al 6 con un dado'), k: 4 },
  ];
  const [e1, e2] = shuffle(rng, events);
  return {
    title: t('Le vocabulaire des probabilités', 'Words for chance', 'مفردات الاحتمالات', 'El vocabulario de la probabilidad'),
    summary: 'impossible (0) · peu probable · une chance sur deux (1/2) · très probable · certain (1)',
    steps: [e1!, e2!].map(ev => ({ type: 'choice' as const, options: SCALE, answer: ev.k, prompt: t(`L’événement « ${ev.e.fr} » est…`, `The event “${ev.e.en}” is…`, `الحدث « ${ev.e.ar} » …`, `El suceso «${ev.e.es}» es…`), hint: t('Compte les issues favorables sur les issues possibles : 0 = impossible, toutes = certain.', 'Count favourable outcomes out of all outcomes: none = impossible, all = certain.', 'عد الإمكانيات الملائمة من بين الممكنة.', 'Cuenta los casos favorables entre los posibles.') })),
  };
}

function chanceDice(seed: number): Activity {
  const rng = seeded(seed);
  const evs: { e: L; fav: number }[] = [
    { e: t('obtenir un nombre pair', 'rolling an even number', 'الحصول على عدد زوجي', 'sacar un número par'), fav: 3 },
    { e: t('obtenir un multiple de 3', 'rolling a multiple of 3', 'الحصول على مضاعف لـ 3', 'sacar un múltiplo de 3'), fav: 2 },
    { e: t('obtenir 5', 'rolling a 5', 'الحصول على 5', 'sacar un 5'), fav: 1 },
    { e: t('obtenir plus de 2', 'rolling more than 2', 'الحصول على أكثر من 2', 'sacar más de 2'), fav: 4 },
  ];
  const ev = pick(rng, evs);
  const opts = [...new Set([frac(ev.fav, 6), `${ev.fav}/${6 - ev.fav}`, frac(1, ev.fav === 1 ? 2 : ev.fav), '1/6'])].slice(0, 3);
  const prob = choices(rng, opts.map(same));
  return {
    title: t('Probabilités avec un dé', 'Probability with a die', 'الاحتمالات بنرد', 'Probabilidad con un dado'),
    summary: `${ev.e.fr} : ${ev.fav} issue(s) favorable(s) sur 6 → p = ${frac(ev.fav, 6)}`,
    steps: [
      { type: 'number', answer: ev.fav, tolerance: 0, prompt: t(`On lance un dé équilibré à six faces. Combien d’issues réalisent l’événement « ${ev.e.fr} » ?`, `A fair six-sided die is rolled. How many outcomes give “${ev.e.en}”?`, `نرمي نردًا متوازنًا. كم إمكانية تحقق الحدث « ${ev.e.ar} »؟`, `Se lanza un dado equilibrado. ¿Cuántos resultados dan «${ev.e.es}»?`), hint: t('Écris les six issues 1, 2, 3, 4, 5, 6 et entoure celles qui conviennent.', 'List the outcomes 1 to 6 and circle the ones that fit.', 'اكتب الإمكانيات من 1 إلى 6 وحدد الملائمة.', 'Escribe 1 a 6 y marca los que sirven.') },
      { type: 'choice', ...prob, prompt: t('Quelle est la probabilité de cet événement ?', 'What is the probability of this event?', 'ما احتمال هذا الحدث؟', '¿Cuál es la probabilidad de este suceso?'), hint: t(`Probabilité = issues favorables ÷ issues possibles = ${ev.fav}/6.`, `Probability = favourable ÷ possible = ${ev.fav}/6.`, `الاحتمال = الملائمة ÷ الممكنة = ${ev.fav}/6.`, `Probabilidad = favorables ÷ posibles = ${ev.fav}/6.`) },
    ],
  };
}

function chanceUrn(seed: number): Activity {
  const rng = seeded(seed);
  const r = int(rng, 2, 7), b = int(rng, 2, 7), y = int(rng, 1, 4), n = r + b + y;
  const right = frac(r, n);
  const opts = [...new Set([right, `${r}/${b + y}`, frac(b, n), `1/${n}`])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  return {
    title: t('Tirer une boule dans un sac', 'Drawing from a bag', 'سحب كرة من كيس', 'Sacar una bola de una bolsa'),
    summary: `${r} rouges, ${b} bleues, ${y} jaunes : p(rouge) = ${r}/${n} · p(pas rouge) = ${n - r}/${n}`,
    steps: [
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Un sac contient ${r} boules rouges, ${b} bleues et ${y} jaunes. On tire une boule au hasard. Combien y a-t-il d’issues possibles ?`, `A bag holds ${r} red, ${b} blue and ${y} yellow balls. One is drawn at random. How many possible outcomes?`, `كيس به ${r} كرات حمراء و ${b} زرقاء و ${y} صفراء. نسحب كرة عشوائيًا. كم عدد الإمكانيات؟`, `Una bolsa tiene ${r} rojas, ${b} azules y ${y} amarillas. ¿Cuántos resultados posibles?`), hint: t('Chaque boule est une issue : compte-les toutes.', 'Each ball is one outcome: count them all.', 'كل كرة إمكانية: عدها كلها.', 'Cada bola es un resultado: cuéntalas todas.') },
      { type: 'choice', ...choices(rng, opts.map(same)), prompt: t('Quelle est la probabilité de tirer une boule rouge ?', 'What is the probability of drawing a red ball?', 'ما احتمال سحب كرة حمراء؟', '¿Probabilidad de sacar una roja?'), hint: t(`${r} boules rouges sur ${n} boules en tout.`, `${r} red balls out of ${n} in all.`, `${r} حمراء من ${n}.`, `${r} rojas de ${n}.`) },
      { type: 'number', answer: n - r, tolerance: 0, prompt: t(`La probabilité de ne pas tirer de boule rouge s’écrit …/${n}. Quel est le numérateur ?`, `The probability of not drawing red is …/${n}. What is the numerator?`, `احتمال عدم سحب كرة حمراء يُكتب …/${n}. ما البسط؟`, `La probabilidad de no sacar roja es …/${n}. ¿Numerador?`), hint: t(`Les boules qui ne sont pas rouges : ${b} + ${y}.`, `The balls that are not red: ${b} + ${y}.`, `الكرات غير الحمراء: ${b} + ${y}.`, `Las que no son rojas: ${b} + ${y}.`) },
    ],
  };
}

function chanceFrequency(seed: number): Activity {
  const rng = seeded(seed);
  const N = pick(rng, [50, 100, 200]), k = Math.round(N * (0.12 + rng() * 0.1));
  const big = choices(rng, [t('elle se rapproche de 1/6', 'it gets closer to 1/6', 'يقترب من 1/6', 'se acerca a 1/6'), t('elle devient égale à 0', 'it becomes 0', 'يصبح 0', 'se vuelve 0'), t('elle ne change jamais', 'it never changes', 'لا يتغير أبدًا', 'nunca cambia')]);
  return {
    title: t('Fréquence et probabilité', 'Frequency and probability', 'التردد والاحتمال', 'Frecuencia y probabilidad'),
    summary: `${k} « 6 » sur ${N} lancers : fréquence ${k}/${N} ≈ ${fr(k / N)} · probabilité 1/6 ≈ 0,17`,
    steps: [
      { type: 'number', answer: Math.round((k / N) * 100) / 100, tolerance: 0.01, prompt: t(`Sur ${N} lancers d’un dé, on a obtenu ${k} fois « 6 ». Quelle est la fréquence de « 6 » (en écriture décimale, arrondie au centième) ?`, `In ${N} rolls of a die, “6” came up ${k} times. What is its frequency (as a decimal, to 2 places)?`, `في ${N} رمية لنرد ظهر « 6 » ${k} مرة. ما تردده (كتابة عشرية مقربة إلى الجزء من مائة)؟`, `En ${N} lanzamientos salió «6» ${k} veces. ¿Su frecuencia (decimal, a la centésima)?`), hint: t(`Fréquence = ${k} ÷ ${N}.`, `Frequency = ${k} ÷ ${N}.`, `التردد = ${k} ÷ ${N}.`, `Frecuencia = ${k} ÷ ${N}.`) },
      { type: 'choice', ...big, prompt: t('Si on lance le dé un très grand nombre de fois, que devient la fréquence de « 6 » ?', 'If the die is rolled a huge number of times, what happens to the frequency of “6”?', 'إذا رمينا النرد عددًا كبيرًا جدًا من المرات، ماذا يصبح تردد « 6 »؟', 'Si se lanza muchísimas veces, ¿qué pasa con la frecuencia de «6»?'), hint: t('Plus on répète l’expérience, plus la fréquence se rapproche de la probabilité.', 'The more you repeat, the closer the frequency gets to the probability.', 'كلما كررنا التجربة اقترب التردد من الاحتمال.', 'Cuanto más se repite, más se acerca a la probabilidad.') },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const CINQUIEME_SKILLS: Skill[] = [
  { id: 'prime-multiples', review: 2, chapter: 'primes', build: primeMultiples, title: s('Multiples et diviseurs', 'Multiples and factors', 'المضاعفات والقواسم', 'Múltiplos y divisores'), desc: s('Le vocabulaire et les tables.', 'Words and times tables.', 'المفردات والجداول.', 'Vocabulario y tablas.') },
  { id: 'prime-divisors', review: 1, chapter: 'primes', build: primeDivisors, title: s('Tous les diviseurs', 'Every factor', 'جميع القواسم', 'Todos los divisores'), desc: s('Les chercher par paires.', 'Find them in pairs.', 'البحث عنها أزواجًا.', 'Buscarlos por parejas.') },
  { id: 'prime-recognise', review: 2, chapter: 'primes', build: primeRecognise, title: s('Nombres premiers', 'Prime numbers', 'الأعداد الأولية', 'Números primos'), desc: s('Deux diviseurs exactement ; le piège de 91.', 'Exactly two factors; the 91 trap.', 'قاسمان فقط؛ فخ 91.', 'Exactamente dos divisores; la trampa del 91.') },
  { id: 'prime-factor', review: 0, chapter: 'primes', build: primeFactor, title: s('Décomposer, simplifier', 'Factorise, simplify', 'التفكيك والاختزال', 'Descomponer, simplificar'), desc: s('Facteurs premiers et fractions irréductibles.', 'Prime factors and lowest terms.', 'العوامل الأولية والكسور غير القابلة للاختزال.', 'Factores primos y fracciones irreducibles.') },
  { id: 'ang-sum', review: 0, chapter: 'angles', build: angSum, title: s('Somme des angles du triangle', 'Angles in a triangle', 'مجموع زوايا المثلث', 'Suma de ángulos del triángulo'), desc: s('180°, triangle rectangle, isocèle.', '180°, right and isosceles triangles.', '180°، المثلث القائم ومتساوي الساقين.', '180°, rectángulo, isósceles.') },
  { id: 'ang-supplementary', review: 0, chapter: 'angles', build: angSupplementary, title: s('Complémentaires, supplémentaires', 'Complementary, supplementary', 'المتتامة والمتكاملة', 'Complementarios, suplementarios'), desc: s('90°, 180° et opposés par le sommet.', '90°, 180° and vertical angles.', '90° و 180° والمتقابلة بالرأس.', '90°, 180° y opuestos por el vértice.') },
  { id: 'ang-parallel', review: 1, chapter: 'angles', build: angParallel, title: s('Angles et parallèles', 'Angles and parallel lines', 'الزوايا والمتوازيات', 'Ángulos y paralelas'), desc: s('Alternes-internes, correspondants.', 'Alternate interior, corresponding.', 'المتبادلة داخليًا والمتناظرة.', 'Alternos internos, correspondientes.') },
  { id: 'area-triangle', review: 1, chapter: 'surfaces', build: areaTriangle, title: s('Aire d’un triangle', 'Area of a triangle', 'مساحة مثلث', 'Área de un triángulo'), desc: s('(base × hauteur) ÷ 2.', '(base × height) ÷ 2.', '(القاعدة × الارتفاع) ÷ 2.', '(base × altura) ÷ 2.') },
  { id: 'area-parallelogram', review: 0, chapter: 'surfaces', build: areaParallelogram, title: s('Aire d’un parallélogramme', 'Area of a parallelogram', 'مساحة متوازي أضلاع', 'Área de un paralelogramo'), desc: s('Découper, recoller : base × hauteur.', 'Cut and move: base × height.', 'القص واللصق: القاعدة × الارتفاع.', 'Recortar y pegar: base × altura.') },
  { id: 'area-disk', review: 2, chapter: 'surfaces', build: areaDisk, title: s('Le disque', 'The circle', 'القرص', 'El círculo'), desc: s('Périmètre 2πr, aire πr².', 'Circumference 2πr, area πr².', 'المحيط 2πr والمساحة πr².', 'Perímetro 2πr, área πr².') },
  { id: 'volume-prism', review: 1, chapter: 'surfaces', build: volumePrism, title: s('Prisme et cylindre', 'Prism and cylinder', 'الموشور والأسطوانة', 'Prisma y cilindro'), desc: s('Aire de la base × hauteur.', 'Base area × height.', 'مساحة القاعدة × الارتفاع.', 'Área de la base × altura.') },
  { id: 'chance-vocab', review: 0, chapter: 'chance', build: chanceVocab, title: s('Impossible, certain, probable', 'Impossible, certain, likely', 'مستحيل، أكيد، محتمل', 'Imposible, seguro, probable'), desc: s('Placer un événement sur l’échelle.', 'Place an event on the scale.', 'وضع حدث على السلم.', 'Situar un suceso en la escala.') },
  { id: 'chance-dice', review: 1, chapter: 'chance', build: chanceDice, title: s('Avec un dé', 'With a die', 'بنرد', 'Con un dado'), desc: s('Issues favorables sur issues possibles.', 'Favourable over possible outcomes.', 'الملائمة على الممكنة.', 'Favorables entre posibles.') },
  { id: 'chance-urn', review: 1, chapter: 'chance', build: chanceUrn, title: s('Dans un sac', 'From a bag', 'من كيس', 'De una bolsa'), desc: s('Probabilité et événement contraire.', 'Probability and the opposite event.', 'الاحتمال والحدث المضاد.', 'Probabilidad y suceso contrario.') },
  { id: 'chance-frequency', review: 0, chapter: 'chance', build: chanceFrequency, title: s('Fréquence et probabilité', 'Frequency and probability', 'التردد والاحتمال', 'Frecuencia y probabilidad'), desc: s('Ce que disent les grands nombres.', 'What many trials tell you.', 'ما تقوله الأعداد الكبيرة.', 'Lo que dicen los grandes números.') },
];
