// Parcours de 6e (suite) : opérations et division euclidienne (FR), puissances, expressions et équations
// (MA 1AC, CCSS 6.EE), triangles et quadrilatères (SN, CI). Fonctions pures et déterministes :
// couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Grid, type P, type Rng, type Scene, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const SIGNS = [same('<'), same('='), same('>')];
/** Exposant écrit en chiffres supérieurs : 2⁵. */
const sup = (n: number) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
const fr = (v: number) => String(v).replace('.', ',');
/** Choix mélangés : la bonne réponse est toujours la première de `list`. */
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}

// ═════════════ OPÉRATIONS ET DIVISION EUCLIDIENNE ═════════════

function arithEuclid(seed: number): Activity {
  const rng = seeded(seed);
  const b = int(rng, 3, 12), q = int(rng, 6, 30), r = int(rng, 1, b - 1), a = b * q + r;
  const eq = choices(rng, [same(`${a} = ${b} × ${q} + ${r}`), same(`${a} = ${b} × ${q - 1} + ${r + b}`), same(`${a} = ${q} × ${r} + ${b}`)]);
  return {
    title: t('La division euclidienne', 'Division with remainder', 'القسمة الإقليدية', 'La división entera'),
    summary: `${a} = ${b} × ${q} + ${r} avec ${r} < ${b}`,
    steps: [
      { type: 'number', answer: q, tolerance: 0, prompt: t(`Quel est le quotient de la division euclidienne de ${a} par ${b} ?`, `What is the quotient when ${a} is divided by ${b}?`, `ما خارج القسمة الإقليدية لـ ${a} على ${b}؟`, `¿Cuál es el cociente de la división entera de ${a} entre ${b}?`), hint: t(`Cherche le plus grand nombre de fois que ${b} « rentre » dans ${a} : ${b} × ${q} = ${b * q}, ${b} × ${q + 1} = ${b * (q + 1)}.`, `Find how many times ${b} fits into ${a}: ${b} × ${q} = ${b * q}, ${b} × ${q + 1} = ${b * (q + 1)}.`, `ابحث عن أكبر عدد مرات يدخل فيها ${b} في ${a}.`, `Busca cuántas veces cabe ${b} en ${a}.`) },
      { type: 'number', answer: r, tolerance: 0, prompt: t(`Et le reste ?`, `And the remainder?`, `وما الباقي؟`, `¿Y el resto?`), hint: t(`Le reste, c’est ce qui manque : ${a} − ${b} × ${q}.`, `The remainder is what is left: ${a} − ${b} × ${q}.`, `الباقي هو ما تبقى: ${a} − ${b} × ${q}.`, `El resto es lo que queda: ${a} − ${b} × ${q}.`) },
      { type: 'choice', ...eq, prompt: t(`Quelle égalité traduit la division euclidienne de ${a} par ${b} ?`, `Which equality shows the division of ${a} by ${b} with remainder?`, `أي متساوية تعبر عن القسمة الإقليدية لـ ${a} على ${b}؟`, `¿Qué igualdad expresa la división entera de ${a} entre ${b}?`), hint: t('Les trois égalités sont peut-être justes… mais dans une division euclidienne, le reste doit être plus petit que le diviseur.', 'All three may be true… but the remainder must be smaller than the divisor.', 'قد تكون المتساويات صحيحة… لكن الباقي يجب أن يكون أصغر من القاسم.', 'Las tres pueden ser ciertas… pero el resto debe ser menor que el divisor.') },
    ],
  };
}

function arithDivisibility(seed: number): Activity {
  const rng = seeded(seed);
  const digitSum = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);
  let nine: number;
  do { nine = 9 * int(rng, 12, 110); } while (nine % 2 === 0 && rng() < 0.5);
  const others: number[] = [];
  while (others.length < 3) { const v = int(rng, 100, 999); if (digitSum(v) % 9 !== 0 && !others.includes(v)) others.push(v); }
  const pick9 = choices(rng, [nine, ...others].map(v => same(String(v))));
  const n3 = int(rng, 100, 999), yes3 = n3 % 3 === 0;
  const left = int(rng, 1, 9), right = int(rng, 0, 9);
  const missing = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find(d => (left + d + right) % 3 === 0)!;
  return {
    title: t('Multiples et critères de divisibilité', 'Multiples and divisibility rules', 'المضاعفات وقواعد قابلية القسمة', 'Múltiplos y criterios de divisibilidad'),
    summary: `divisible par 3 (ou 9) ⇔ somme des chiffres divisible par 3 (ou 9) · par 2 : chiffre des unités pair · par 5 : 0 ou 5`,
    steps: [
      { type: 'choice', ...pick9, prompt: t('Lequel de ces nombres est divisible par 9 ?', 'Which of these numbers is divisible by 9?', 'أي هذه الأعداد يقبل القسمة على 9؟', '¿Cuál de estos números es divisible por 9?'), hint: t('Additionne les chiffres de chaque nombre : la somme doit être dans la table de 9.', 'Add up the digits of each number: the sum must be in the 9 times table.', 'اجمع أرقام كل عدد: يجب أن يكون المجموع من مضاعفات 9.', 'Suma las cifras: la suma debe estar en la tabla del 9.') },
      { type: 'choice', options: OUI_NON, answer: yes3 ? 0 : 1, prompt: t(`${n3} est-il divisible par 3 ?`, `Is ${n3} divisible by 3?`, `هل ${n3} يقبل القسمة على 3؟`, `¿${n3} es divisible por 3?`), hint: t(`Somme des chiffres : ${String(n3).split('').join(' + ')} = ${digitSum(n3)}. Est-elle dans la table de 3 ?`, `Sum of digits: ${String(n3).split('').join(' + ')} = ${digitSum(n3)}. Is it in the 3 times table?`, `مجموع الأرقام: ${digitSum(n3)}. هل هو من مضاعفات 3؟`, `Suma de cifras: ${digitSum(n3)}. ¿Está en la tabla del 3?`) },
      { type: 'number', answer: missing, tolerance: 0, prompt: t(`Quel est le plus petit chiffre à écrire à la place de ■ pour que ${left}■${right} soit divisible par 3 ?`, `What is the smallest digit to put in ■ so that ${left}■${right} is divisible by 3?`, `ما أصغر رقم نضعه مكان ■ ليقبل ${left}■${right} القسمة على 3؟`, `¿Qué cifra mínima hay que poner en ■ para que ${left}■${right} sea divisible por 3?`), hint: t(`${left} + ■ + ${right} doit être dans la table de 3. Essaie 0, puis 1, puis 2…`, `${left} + ■ + ${right} must be in the 3 times table. Try 0, then 1, then 2…`, `يجب أن يكون ${left} + ■ + ${right} من مضاعفات 3. جرّب 0 ثم 1 ثم 2…`, `${left} + ■ + ${right} debe estar en la tabla del 3. Prueba 0, 1, 2…`) },
    ],
  };
}

function arithPriorities(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 2, 9), c = int(rng, 2, 9);
  const d = int(rng, 2, 6), e = int(rng, 2, 5), f = e * int(rng, 2, 6), g = int(rng, 20, 40);
  const first = choices(rng, [t('la multiplication', 'the multiplication', 'الضرب', 'la multiplicación'), t('l’addition', 'the addition', 'الجمع', 'la suma'), t('de gauche à droite', 'left to right', 'من اليسار إلى اليمين', 'de izquierda a derecha')]);
  return {
    title: t('Les priorités opératoires', 'Order of operations', 'أولويات العمليات', 'Prioridad de las operaciones'),
    summary: `${a} + ${b} × ${c} = ${a + b * c} · ${d} × (${b} + ${c}) = ${d * (b + c)} · ${g} − ${f} ÷ ${e} = ${g - f / e}`,
    steps: [
      { type: 'choice', ...first, prompt: t(`Dans ${a} + ${b} × ${c}, que calcule-t-on en premier ?`, `In ${a} + ${b} × ${c}, what do you work out first?`, `في ${a} + ${b} × ${c}، ماذا نحسب أولًا؟`, `En ${a} + ${b} × ${c}, ¿qué se calcula primero?`), hint: t('La multiplication et la division passent avant l’addition et la soustraction.', 'Multiplication and division come before addition and subtraction.', 'الضرب والقسمة قبل الجمع والطرح.', 'La multiplicación y la división van antes que la suma y la resta.') },
      { type: 'number', answer: a + b * c, tolerance: 0, prompt: t(`Calcule ${a} + ${b} × ${c}.`, `Work out ${a} + ${b} × ${c}.`, `احسب ${a} + ${b} × ${c}.`, `Calcula ${a} + ${b} × ${c}.`), hint: t(`D’abord ${b} × ${c} = ${b * c}, puis on ajoute ${a}.`, `First ${b} × ${c} = ${b * c}, then add ${a}.`, `أولًا ${b} × ${c} = ${b * c} ثم نضيف ${a}.`, `Primero ${b} × ${c} = ${b * c}, luego suma ${a}.`) },
      { type: 'number', answer: d * (b + c), tolerance: 0, prompt: t(`Calcule ${d} × (${b} + ${c}).`, `Work out ${d} × (${b} + ${c}).`, `احسب ${d} × (${b} + ${c}).`, `Calcula ${d} × (${b} + ${c}).`), hint: t('Les parenthèses passent en premier.', 'Brackets come first.', 'الأقواس أولًا.', 'Los paréntesis van primero.') },
      { type: 'number', answer: g - f / e, tolerance: 0, prompt: t(`Calcule ${g} − ${f} ÷ ${e}.`, `Work out ${g} − ${f} ÷ ${e}.`, `احسب ${g} − ${f} ÷ ${e}.`, `Calcula ${g} − ${f} ÷ ${e}.`), hint: t(`La division d’abord : ${f} ÷ ${e} = ${f / e}.`, `Division first: ${f} ÷ ${e} = ${f / e}.`, `القسمة أولًا: ${f} ÷ ${e} = ${f / e}.`, `Primero la división: ${f} ÷ ${e} = ${f / e}.`) },
    ],
  };
}

function arithProblems(seed: number): Activity {
  const rng = seeded(seed);
  const seats = pick(rng, [40, 45, 50, 55]);
  let pupils: number;
  do { pupils = int(rng, 120, 330); } while (pupils % seats === 0);
  const buses = Math.ceil(pupils / seats);
  const eggs = int(rng, 40, 99), boxes = Math.floor(eggs / 6);
  const x = int(rng, 3, 9) * 10 - 1, y = int(rng, 2, 9) * 10 + 1;
  const round = (x + 1) * (y - 1);
  const estimate = choices(rng, [same(String(round)), same(String(round / 10)), same(String(round * 10))]);
  return {
    title: t('Problèmes : quotient et reste', 'Problems: quotient and remainder', 'مسائل: الخارج والباقي', 'Problemas: cociente y resto'),
    summary: `${pupils} élèves, cars de ${seats} : ${buses} cars · ${eggs} œufs : ${boxes} boîtes de 6`,
    steps: [
      { type: 'number', answer: boxes, tolerance: 0, prompt: t(`On range ${eggs} œufs dans des boîtes de 6. Combien de boîtes pleines obtient-on ?`, `${eggs} eggs go into boxes of 6. How many full boxes?`, `نرتب ${eggs} بيضة في علب من 6. كم علبة ممتلئة نحصل عليها؟`, `Se guardan ${eggs} huevos en cajas de 6. ¿Cuántas cajas llenas hay?`), hint: t(`C’est le quotient de ${eggs} par 6.`, `It is the quotient of ${eggs} by 6.`, `إنه خارج قسمة ${eggs} على 6.`, `Es el cociente de ${eggs} entre 6.`) },
      { type: 'number', answer: buses, tolerance: 0, prompt: t(`${pupils} élèves partent en sortie dans des cars de ${seats} places. Combien de cars faut-il ?`, `${pupils} pupils go on a trip in ${seats}-seat coaches. How many coaches are needed?`, `${pupils} تلميذًا في رحلة بحافلات من ${seats} مقعدًا. كم حافلة نحتاج؟`, `${pupils} alumnos van de excursión en autocares de ${seats} plazas. ¿Cuántos autocares hacen falta?`), hint: t(`${pupils} = ${seats} × ${buses - 1} + ${pupils - seats * (buses - 1)} : les ${pupils - seats * (buses - 1)} élèves qui restent ont besoin d’un car de plus !`, `${pupils} = ${seats} × ${buses - 1} + ${pupils - seats * (buses - 1)}: the pupils left over need one more coach!`, `التلاميذ المتبقون يحتاجون حافلة إضافية!`, `¡Los alumnos que sobran necesitan un autocar más!`) },
      { type: 'choice', ...estimate, prompt: t(`Sans poser l’opération, quel est l’ordre de grandeur de ${x} × ${y} ?`, `Without working it out, roughly how much is ${x} × ${y}?`, `دون إنجاز العملية، ما رتبة مقدار ${x} × ${y}؟`, `Sin hacer la operación, ¿cuál es el orden de magnitud de ${x} × ${y}?`), hint: t(`Arrondis : ${x} ≈ ${x + 1} et ${y} ≈ ${y - 1}.`, `Round: ${x} ≈ ${x + 1} and ${y} ≈ ${y - 1}.`, `قرّب: ${x} ≈ ${x + 1} و ${y} ≈ ${y - 1}.`, `Redondea: ${x} ≈ ${x + 1} y ${y} ≈ ${y - 1}.`) },
    ],
  };
}

// ═════════════ PUISSANCES ═════════════

function powNotation(seed: number): Activity {
  const rng = seeded(seed);
  const b = int(rng, 2, 6), n = int(rng, 3, 6), s = int(rng, 3, 9), c = int(rng, 2, 4);
  const square = choices(rng, [same(String(s * s)), same(String(2 * s)), same(String(s + 2)), same(`${s}${s}`)]);
  return {
    title: t('Écrire une puissance', 'Writing powers', 'كتابة قوة', 'Escribir una potencia'),
    summary: `${Array(n).fill(b).join(' × ')} = ${b}${sup(n)} · ${s}² = ${s * s} (et pas ${2 * s})`,
    steps: [
      { type: 'number', answer: n, tolerance: 0, prompt: t(`${Array(n).fill(b).join(' × ')} s’écrit ${b}ⁿ. Que vaut l’exposant n ?`, `${Array(n).fill(b).join(' × ')} is written ${b}ⁿ. What is the exponent n?`, `${Array(n).fill(b).join(' × ')} يُكتب ${b}ⁿ. ما قيمة الأس n؟`, `${Array(n).fill(b).join(' × ')} se escribe ${b}ⁿ. ¿Cuánto vale el exponente n?`), hint: t(`L’exposant compte combien de fois on multiplie ${b} par lui-même.`, `The exponent counts how many times ${b} is multiplied by itself.`, `الأس يعد كم مرة نضرب ${b} في نفسه.`, `El exponente cuenta cuántas veces se multiplica ${b} por sí mismo.`) },
      { type: 'choice', ...square, prompt: t(`Combien vaut ${s}² ?`, `What is ${s}²?`, `كم يساوي ${s}²؟`, `¿Cuánto vale ${s}²?`), hint: t(`${s}² = ${s} × ${s}, et non ${s} × 2.`, `${s}² = ${s} × ${s}, not ${s} × 2.`, `${s}² = ${s} × ${s} وليس ${s} × 2.`, `${s}² = ${s} × ${s}, no ${s} × 2.`) },
      { type: 'number', answer: c ** 3, tolerance: 0, prompt: t(`Calcule ${c}³.`, `Work out ${c}³.`, `احسب ${c}³.`, `Calcula ${c}³.`), hint: t(`${c}³ = ${c} × ${c} × ${c}.`, `${c}³ = ${c} × ${c} × ${c}.`, `${c}³ = ${c} × ${c} × ${c}.`, `${c}³ = ${c} × ${c} × ${c}.`) },
    ],
  };
}

function powTen(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 3, 7), k = int(rng, 2, 4), m = int(rng, 11, 99) / 10;
  const big = 10 ** n;
  const which = choices(rng, [same(`10${sup(n)}`), same(`${n}${sup(10)}`), same(`10 × ${n}`)]);
  return {
    title: t('Les puissances de 10', 'Powers of 10', 'قوى العدد 10', 'Las potencias de 10'),
    summary: `10${sup(n)} = 1 suivi de ${n} zéros · ${fr(m)} × 10${sup(k)} = ${fr(Math.round(m * 10 ** k))}`,
    steps: [
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Combien de zéros faut-il écrire après le 1 pour obtenir 10${sup(n)} ?`, `How many zeros follow the 1 in 10${sup(n)}?`, `كم صفرًا نكتب بعد 1 للحصول على 10${sup(n)}؟`, `¿Cuántos ceros siguen al 1 en 10${sup(n)}?`), hint: t('10² = 100, 10³ = 1 000 : l’exposant donne le nombre de zéros.', '10² = 100, 10³ = 1,000: the exponent gives the number of zeros.', '10² = 100 و 10³ = 1000: الأس يعطي عدد الأصفار.', '10² = 100, 10³ = 1 000: el exponente da el número de ceros.') },
      { type: 'choice', ...which, prompt: t(`Quelle écriture est égale à ${big.toLocaleString('fr-FR')} ?`, `Which is equal to ${big.toLocaleString('en-US')}?`, `أي كتابة تساوي ${big}؟`, `¿Qué escritura es igual a ${big.toLocaleString('es-ES')}?`), hint: t('Compte les zéros : c’est l’exposant de 10.', 'Count the zeros: that is the exponent of 10.', 'عد الأصفار: إنه أس 10.', 'Cuenta los ceros: es el exponente de 10.') },
      { type: 'number', answer: Math.round(m * 10 ** k), tolerance: 0, prompt: t(`Calcule ${fr(m)} × 10${sup(k)}.`, `Work out ${fr(m)} × 10${sup(k)}.`, `احسب ${fr(m)} × 10${sup(k)}.`, `Calcula ${fr(m)} × 10${sup(k)}.`), hint: t(`Multiplier par 10${sup(k)}, c’est multiplier par ${(10 ** k).toLocaleString('fr-FR')} : chaque chiffre gagne ${k} rangs.`, `Multiplying by 10${sup(k)} moves each digit ${k} places to the left.`, `الضرب في 10${sup(k)} يزيح كل رقم ${k} مراتب.`, `Multiplicar por 10${sup(k)} mueve cada cifra ${k} lugares.`) },
    ],
  };
}

function powPriorities(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 2, 5), c = int(rng, 2, 4), e = int(rng, 2, 6);
  return {
    title: t('Puissances et priorités', 'Powers and order of operations', 'القوى والأولويات', 'Potencias y prioridades'),
    summary: `${a} + ${b}² = ${a + b * b} · (${a} + ${b})² = ${(a + b) ** 2} · ${e} × ${c}² = ${e * c * c}`,
    steps: [
      { type: 'number', answer: a + b * b, tolerance: 0, prompt: t(`Calcule ${a} + ${b}².`, `Work out ${a} + ${b}².`, `احسب ${a} + ${b}².`, `Calcula ${a} + ${b}².`), hint: t(`La puissance passe avant l’addition : ${b}² = ${b * b}.`, `Powers come before addition: ${b}² = ${b * b}.`, `القوة قبل الجمع: ${b}² = ${b * b}.`, `La potencia va antes que la suma: ${b}² = ${b * b}.`) },
      { type: 'number', answer: (a + b) ** 2, tolerance: 0, prompt: t(`Calcule (${a} + ${b})².`, `Work out (${a} + ${b})².`, `احسب (${a} + ${b})².`, `Calcula (${a} + ${b})².`), hint: t(`Les parenthèses d’abord : ${a} + ${b} = ${a + b}, puis au carré.`, `Brackets first: ${a} + ${b} = ${a + b}, then square it.`, `الأقواس أولًا: ${a + b} ثم نربّع.`, `Primero el paréntesis: ${a + b}, luego al cuadrado.`) },
      { type: 'number', answer: e * c * c, tolerance: 0, prompt: t(`Calcule ${e} × ${c}².`, `Work out ${e} × ${c}².`, `احسب ${e} × ${c}².`, `Calcula ${e} × ${c}².`), hint: t(`Le carré ne porte que sur ${c} : ${c}² = ${c * c}, puis × ${e}.`, `Only ${c} is squared: ${c}² = ${c * c}, then × ${e}.`, `المربع يخص ${c} فقط.`, `Solo ${c} va al cuadrado.`) },
    ],
  };
}

function powCompare(seed: number): Activity {
  const rng = seeded(seed);
  const pairs: [number, number, number, number][] = shuffle(rng, [[2, 5, 5, 2], [3, 4, 4, 3], [2, 4, 4, 2], [2, 6, 6, 2], [3, 2, 2, 3]]);
  const [p, q] = [pairs[0]!, pairs[1]!];
  const cmp = ([a, n, b, m]: [number, number, number, number]) => { const x = a ** n, y = b ** m; return x < y ? 0 : x === y ? 1 : 2; };
  const root = int(rng, 4, 12);
  return {
    title: t('Comparer des puissances', 'Comparing powers', 'مقارنة القوى', 'Comparar potencias'),
    summary: `${p[0]}${sup(p[1])} = ${p[0] ** p[1]} et ${p[2]}${sup(p[3])} = ${p[2] ** p[3]} · ${root}² = ${root * root}`,
    steps: [
      ...[p, q].map(pair => ({ type: 'choice' as const, options: SIGNS, answer: cmp(pair), prompt: t(`Compare : ${pair[0]}${sup(pair[1])} … ${pair[2]}${sup(pair[3])}`, `Compare: ${pair[0]}${sup(pair[1])} … ${pair[2]}${sup(pair[3])}`, `قارن: ${pair[0]}${sup(pair[1])} … ${pair[2]}${sup(pair[3])}`, `Compara: ${pair[0]}${sup(pair[1])} … ${pair[2]}${sup(pair[3])}`), hint: t('Calcule chaque puissance avant de comparer : échanger la base et l’exposant change souvent le résultat.', 'Work out each power first: swapping base and exponent often changes the result.', 'احسب كل قوة قبل المقارنة.', 'Calcula cada potencia antes de comparar.') })),
      { type: 'number', answer: root, tolerance: 0, prompt: t(`Quel nombre entier a pour carré ${root * root} ?`, `Which whole number squared gives ${root * root}?`, `ما العدد الصحيح الذي مربعه ${root * root}؟`, `¿Qué número entero al cuadrado da ${root * root}?`), hint: t('Cherche dans les tables : quel nombre multiplié par lui-même ?', 'Use your times tables: which number times itself?', 'ابحث في جداول الضرب.', 'Busca en las tablas.') },
    ],
  };
}

// ═════════════ EXPRESSIONS LITTÉRALES ═════════════

function exprEvaluate(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), b = int(rng, 1, 9), x = int(rng, 2, 8), k = int(rng, 2, 5), m = int(rng, 1, 6), y = int(rng, 2, 6);
  return {
    title: t('Calculer une expression', 'Evaluating an expression', 'حساب تعبير', 'Calcular una expresión'),
    summary: `${a}x + ${b} pour x = ${x} : ${a} × ${x} + ${b} = ${a * x + b}`,
    steps: [
      { type: 'number', answer: a * x + b, tolerance: 0, prompt: t(`Calcule ${a}x + ${b} pour x = ${x}.`, `Work out ${a}x + ${b} when x = ${x}.`, `احسب ${a}x + ${b} من أجل x = ${x}.`, `Calcula ${a}x + ${b} para x = ${x}.`), hint: t(`${a}x veut dire ${a} × x : remplace x par ${x}.`, `${a}x means ${a} × x: replace x with ${x}.`, `${a}x تعني ${a} × x: عوّض x بـ ${x}.`, `${a}x significa ${a} × x: sustituye x por ${x}.`) },
      { type: 'number', answer: k * (y + m), tolerance: 0, prompt: t(`Calcule ${k}(y + ${m}) pour y = ${y}.`, `Work out ${k}(y + ${m}) when y = ${y}.`, `احسب ${k}(y + ${m}) من أجل y = ${y}.`, `Calcula ${k}(y + ${m}) para y = ${y}.`), hint: t(`Remplace y, puis parenthèses d’abord : ${k} × (${y} + ${m}).`, `Replace y, brackets first: ${k} × (${y} + ${m}).`, `عوّض y ثم الأقواس أولًا.`, `Sustituye y; primero el paréntesis.`) },
      { type: 'number', answer: x * x + b, tolerance: 0, prompt: t(`Calcule x² + ${b} pour x = ${x}.`, `Work out x² + ${b} when x = ${x}.`, `احسب x² + ${b} من أجل x = ${x}.`, `Calcula x² + ${b} para x = ${x}.`), hint: t(`x² = x × x = ${x} × ${x}.`, `x² = x × x = ${x} × ${x}.`, `x² = ${x} × ${x}.`, `x² = ${x} × ${x}.`) },
    ],
  };
}

function exprConventions(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 2, 9), a = int(rng, 3, 9);
  const times = choices(rng, [same(`${n}a`), same(`a${n}`), same(`${n} + a`)]);
  const square = choices(rng, [same('a²'), same('2a'), same('a + a')]);
  return {
    title: t('Les conventions d’écriture', 'Algebra conventions', 'قواعد الكتابة', 'Convenciones de escritura'),
    summary: `${n} × a = ${n}a · a × a = a² · pour a = ${a} : 2a = ${2 * a} mais a² = ${a * a}`,
    steps: [
      { type: 'choice', ...times, prompt: t(`Comment écrit-on plus simplement ${n} × a ?`, `How do you write ${n} × a more simply?`, `كيف نكتب ${n} × a ببساطة؟`, `¿Cómo se escribe más simple ${n} × a?`), hint: t('On peut supprimer le signe × devant une lettre ; le nombre s’écrit en premier.', 'You can drop × before a letter; the number comes first.', 'يمكن حذف × أمام حرف؛ ويُكتب العدد أولًا.', 'Se puede quitar × delante de una letra; el número va primero.') },
      { type: 'choice', ...square, prompt: t('Et a × a ?', 'And a × a?', 'و a × a؟', '¿Y a × a?'), hint: t('Une lettre multipliée par elle-même : c’est un carré.', 'A letter times itself is a square.', 'حرف مضروب في نفسه: إنه مربع.', 'Una letra multiplicada por sí misma es un cuadrado.') },
      { type: 'number', answer: 2 * a, tolerance: 0, prompt: t(`Pour a = ${a}, combien vaut 2a ?`, `If a = ${a}, what is 2a?`, `من أجل a = ${a}، كم يساوي 2a؟`, `Si a = ${a}, ¿cuánto vale 2a?`), hint: t(`2a = 2 × a (ne pas confondre avec a² = a × a).`, `2a = 2 × a (not a² = a × a).`, `2a = 2 × a (لا تخلط مع a²).`, `2a = 2 × a (no a² = a × a).`) },
    ],
  };
}

function exprReduce(seed: number): Activity {
  const rng = seeded(seed);
  const p = int(rng, 2, 9), q = int(rng, 2, 9), r = int(rng, 6, 12), s = int(rng, 2, r - 1), u = int(rng, 2, 5), w = int(rng, 2, 7);
  return {
    title: t('Réduire une expression', 'Collecting like terms', 'اختزال تعبير', 'Reducir una expresión'),
    summary: `${p}x + ${q}x = ${p + q}x · ${r}a − ${s}a = ${r - s}a · ${u}x + ${w} ne se réduit pas`,
    steps: [
      { type: 'number', answer: p + q, tolerance: 0, prompt: t(`${p}x + ${q}x = …x. Quel nombre manque ?`, `${p}x + ${q}x = …x. What is the missing number?`, `${p}x + ${q}x = …x. ما العدد الناقص؟`, `${p}x + ${q}x = …x. ¿Qué número falta?`), hint: t(`${p} fois x plus ${q} fois x, cela fait combien de fois x ?`, `${p} lots of x plus ${q} lots of x make how many x?`, `${p} مرات x زائد ${q} مرات x، كم مرة x؟`, `${p} veces x más ${q} veces x, ¿cuántas veces x?`) },
      { type: 'number', answer: r - s, tolerance: 0, prompt: t(`${r}a − ${s}a = …a. Quel nombre manque ?`, `${r}a − ${s}a = …a. What is the missing number?`, `${r}a − ${s}a = …a. ما العدد الناقص؟`, `${r}a − ${s}a = …a. ¿Qué número falta?`), hint: t('Même lettre : on soustrait les nombres devant.', 'Same letter: subtract the numbers in front.', 'نفس الحرف: نطرح المعاملات.', 'Misma letra: resta los números.') },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`A-t-on ${u}x + ${w} = ${u + w}x ?`, `Is ${u}x + ${w} = ${u + w}x?`, `هل ${u}x + ${w} = ${u + w}x؟`, `¿Es ${u}x + ${w} = ${u + w}x?`), hint: t(`Essaie avec x = 10 : ${u}x + ${w} = ${10 * u + w}, mais ${u + w}x = ${10 * (u + w)}. On n’additionne pas des x et des nombres seuls.`, `Try x = 10: ${u}x + ${w} = ${10 * u + w}, but ${u + w}x = ${10 * (u + w)}.`, `جرّب x = 10: ${10 * u + w} مقابل ${10 * (u + w)}.`, `Prueba x = 10: ${10 * u + w} frente a ${10 * (u + w)}.`) },
    ],
  };
}

function exprDistribute(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 2, 9), m = int(rng, 2, 9), n = int(rng, 3, 9), j = int(rng, 2, 8), f = int(rng, 2, 7), g = int(rng, 2, 9);
  return {
    title: t('Développer et factoriser', 'Expanding and factorising', 'النشر والتعميل', 'Desarrollar y factorizar'),
    summary: `${k}(x + ${m}) = ${k}x + ${k * m} · ${n} × 10${j} = ${n} × 100 + ${n} × ${j} · ${f}x + ${f * g} = ${f}(x + ${g})`,
    steps: [
      { type: 'number', answer: k * m, tolerance: 0, prompt: t(`Développe : ${k}(x + ${m}) = ${k}x + … Quel nombre manque ?`, `Expand: ${k}(x + ${m}) = ${k}x + … What is missing?`, `انشر: ${k}(x + ${m}) = ${k}x + … ما العدد الناقص؟`, `Desarrolla: ${k}(x + ${m}) = ${k}x + … ¿Qué falta?`), hint: t(`${k} multiplie chaque terme de la parenthèse : ${k} × x et ${k} × ${m}.`, `${k} multiplies each term: ${k} × x and ${k} × ${m}.`, `${k} يضرب كل حد: ${k} × x و ${k} × ${m}.`, `${k} multiplica cada término: ${k} × x y ${k} × ${m}.`) },
      { type: 'number', answer: n * (100 + j), tolerance: 0, prompt: t(`Calcule mentalement ${n} × 10${j} en pensant ${n} × (100 + ${j}).`, `Work out ${n} × 10${j} mentally as ${n} × (100 + ${j}).`, `احسب ذهنيًا ${n} × 10${j} باعتبار ${n} × (100 + ${j}).`, `Calcula mentalmente ${n} × 10${j} como ${n} × (100 + ${j}).`), hint: t(`${n} × 100 = ${n * 100} et ${n} × ${j} = ${n * j}.`, `${n} × 100 = ${n * 100} and ${n} × ${j} = ${n * j}.`, `${n} × 100 = ${n * 100} و ${n} × ${j} = ${n * j}.`, `${n} × 100 = ${n * 100} y ${n} × ${j} = ${n * j}.`) },
      { type: 'number', answer: g, tolerance: 0, prompt: t(`Factorise : ${f}x + ${f * g} = ${f}(x + …). Quel nombre manque ?`, `Factorise: ${f}x + ${f * g} = ${f}(x + …). What is missing?`, `عمّل: ${f}x + ${f * g} = ${f}(x + …). ما العدد الناقص؟`, `Factoriza: ${f}x + ${f * g} = ${f}(x + …). ¿Qué falta?`), hint: t(`Quel nombre multiplié par ${f} donne ${f * g} ?`, `Which number times ${f} gives ${f * g}?`, `ما العدد الذي إذا ضُرب في ${f} أعطى ${f * g}؟`, `¿Qué número por ${f} da ${f * g}?`) },
    ],
  };
}

// ═════════════ ÉQUATIONS ═════════════

function eqTest(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 6), x = int(rng, 2, 9), b = int(rng, 1, 9), c = a * x + b;
  const wrong = x + pick(rng, [-1, 1, 2]);
  const sol = choices(rng, [same(String(x)), same(String(x + 1)), same(String(x - 1))]);
  return {
    title: t('Tester une égalité', 'Testing a solution', 'اختبار متساوية', 'Comprobar una igualdad'),
    summary: `${a} × ${x} + ${b} = ${c} : x = ${x} est solution de ${a}x + ${b} = ${c}`,
    steps: [
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t(`L’égalité ${a}x + ${b} = ${c} est-elle vraie pour x = ${wrong} ?`, `Is ${a}x + ${b} = ${c} true when x = ${wrong}?`, `هل المتساوية ${a}x + ${b} = ${c} صحيحة من أجل x = ${wrong}؟`, `¿Es cierta ${a}x + ${b} = ${c} para x = ${wrong}?`), hint: t(`Calcule ${a} × ${wrong} + ${b} et compare à ${c}.`, `Work out ${a} × ${wrong} + ${b} and compare with ${c}.`, `احسب ${a} × ${wrong} + ${b} وقارن بـ ${c}.`, `Calcula ${a} × ${wrong} + ${b} y compara con ${c}.`) },
      { type: 'choice', ...sol, prompt: t(`Laquelle de ces valeurs de x est solution de ${a}x + ${b} = ${c} ?`, `Which value of x solves ${a}x + ${b} = ${c}?`, `أي قيمة لـ x حل لـ ${a}x + ${b} = ${c}؟`, `¿Qué valor de x es solución de ${a}x + ${b} = ${c}?`), hint: t('Remplace x par chaque valeur : une seule donne l’égalité.', 'Try each value: only one makes it true.', 'عوّض x بكل قيمة: واحدة فقط تحقق المتساوية.', 'Prueba cada valor: solo uno la cumple.') },
    ],
  };
}

function eqAdd(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 3, 30), b = a + int(rng, 5, 40), c = int(rng, 3, 20), d = int(rng, 3, 30), e = int(rng, 11, 60), f = e + int(rng, 12, 80);
  return {
    title: t('Équations x + a = b', 'Equations x + a = b', 'معادلات x + a = b', 'Ecuaciones x + a = b'),
    summary: `x + ${a} = ${b} ⇒ x = ${b} − ${a} = ${b - a} · x − ${c} = ${d} ⇒ x = ${d + c}`,
    steps: [
      { type: 'number', answer: b - a, tolerance: 0, prompt: t(`Résous : x + ${a} = ${b}.`, `Solve: x + ${a} = ${b}.`, `حل: x + ${a} = ${b}.`, `Resuelve: x + ${a} = ${b}.`), hint: t(`Quel nombre faut-il ajouter à ${a} pour obtenir ${b} ? C’est ${b} − ${a}.`, `What do you add to ${a} to get ${b}? It is ${b} − ${a}.`, `ما العدد الذي نضيفه إلى ${a} لنحصل على ${b}؟`, `¿Qué hay que sumar a ${a} para obtener ${b}?`) },
      { type: 'number', answer: d + c, tolerance: 0, prompt: t(`Résous : x − ${c} = ${d}.`, `Solve: x − ${c} = ${d}.`, `حل: x − ${c} = ${d}.`, `Resuelve: x − ${c} = ${d}.`), hint: t(`On enlève ${c} à x et il reste ${d} : x = ${d} + ${c}.`, `Taking ${c} from x leaves ${d}: x = ${d} + ${c}.`, `x = ${d} + ${c}.`, `x = ${d} + ${c}.`) },
      { type: 'number', answer: f - e, tolerance: 0, prompt: t(`Résous : ${e} + x = ${f}.`, `Solve: ${e} + x = ${f}.`, `حل: ${e} + x = ${f}.`, `Resuelve: ${e} + x = ${f}.`), hint: t(`L’ordre de l’addition ne change rien : x = ${f} − ${e}.`, `Order does not matter in addition: x = ${f} − ${e}.`, `ترتيب الجمع لا يغير شيئًا: x = ${f} − ${e}.`, `El orden no importa: x = ${f} − ${e}.`) },
    ],
  };
}

function eqMult(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 9), x = int(rng, 2, 12), c = int(rng, 2, 6), y = int(rng, 2, 9);
  return {
    title: t('Équations a × x = b', 'Equations a × x = b', 'معادلات a × x = b', 'Ecuaciones a × x = b'),
    summary: `${a}x = ${a * x} ⇒ x = ${a * x} ÷ ${a} = ${x} · x ÷ ${c} = ${y} ⇒ x = ${c * y}`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous : ${a}x = ${a * x}.`, `Solve: ${a}x = ${a * x}.`, `حل: ${a}x = ${a * x}.`, `Resuelve: ${a}x = ${a * x}.`), hint: t(`${a} fois quel nombre donne ${a * x} ? C’est ${a * x} ÷ ${a}.`, `${a} times what gives ${a * x}? It is ${a * x} ÷ ${a}.`, `${a} مضروب في أي عدد يعطي ${a * x}؟`, `¿${a} por qué número da ${a * x}?`) },
      { type: 'number', answer: c * y, tolerance: 0, prompt: t(`Résous : x ÷ ${c} = ${y}.`, `Solve: x ÷ ${c} = ${y}.`, `حل: x ÷ ${c} = ${y}.`, `Resuelve: x ÷ ${c} = ${y}.`), hint: t(`Un nombre partagé en ${c} donne ${y} : x = ${y} × ${c}.`, `A number shared into ${c} gives ${y}: x = ${y} × ${c}.`, `x = ${y} × ${c}.`, `x = ${y} × ${c}.`) },
    ],
  };
}

function eqProblem(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 5), b = int(rng, 2, 9), x = int(rng, 3, 12), c = a * x + b;
  const model = choices(rng, [same(`${a}x + ${b} = ${c}`), same(`${a}(x + ${b}) = ${c}`), same(`x + ${a} + ${b} = ${c}`)]);
  const price = int(rng, 2, 6), n = int(rng, 3, 8), fee = int(rng, 2, 9);
  return {
    title: t('Mettre un problème en équation', 'Writing an equation from a problem', 'وضع مسألة في معادلة', 'Plantear una ecuación'),
    summary: `« je multiplie par ${a} et j’ajoute ${b} » : ${a}x + ${b} = ${c}, x = ${x}`,
    steps: [
      { type: 'choice', ...model, prompt: t(`Je pense à un nombre x. Je le multiplie par ${a}, puis j’ajoute ${b}. J’obtiens ${c}. Quelle équation traduit ce problème ?`, `I think of a number x. I multiply it by ${a}, then add ${b}. I get ${c}. Which equation fits?`, `أفكر في عدد x. أضربه في ${a} ثم أضيف ${b}. أحصل على ${c}. أي معادلة تترجم المسألة؟`, `Pienso un número x. Lo multiplico por ${a} y sumo ${b}. Obtengo ${c}. ¿Qué ecuación lo traduce?`), hint: t('Suis l’ordre du texte : d’abord la multiplication, ensuite l’addition.', 'Follow the order: multiply first, then add.', 'اتبع ترتيب النص: الضرب أولًا ثم الجمع.', 'Sigue el orden: primero multiplica, luego suma.') },
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Quel est le nombre de départ ?`, `What was the starting number?`, `ما العدد الأصلي؟`, `¿Cuál era el número de partida?`), hint: t(`Remonte le calcul : ${c} − ${b} = ${c - b}, puis ${c - b} ÷ ${a}.`, `Work backwards: ${c} − ${b} = ${c - b}, then ${c - b} ÷ ${a}.`, `ارجع بالحساب: ${c} − ${b} = ${c - b} ثم ÷ ${a}.`, `Hacia atrás: ${c} − ${b} = ${c - b}, luego ÷ ${a}.`) },
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Des cahiers coûtent ${price} € l’un, plus ${fee} € de livraison. On a payé ${price * n + fee} € en tout. Combien de cahiers a-t-on achetés ?`, `Notebooks cost $${price} each, plus $${fee} delivery. The total was $${price * n + fee}. How many notebooks?`, `ثمن الدفتر ${price} والتوصيل ${fee}. دفعنا ${price * n + fee} في المجموع. كم دفترًا اشترينا؟`, `Cada cuaderno cuesta ${price} €, más ${fee} € de envío. Se pagaron ${price * n + fee} €. ¿Cuántos cuadernos?`), hint: t(`${price}x + ${fee} = ${price * n + fee} : enlève d’abord la livraison.`, `${price}x + ${fee} = ${price * n + fee}: remove the delivery first.`, `${price}x + ${fee} = ${price * n + fee}: اطرح التوصيل أولًا.`, `${price}x + ${fee} = ${price * n + fee}: quita primero el envío.`) },
    ],
  };
}

// ═════════════ TRIANGLES ET QUADRILATÈRES ═════════════

type Shape = { name: L; pts: P[]; sides?: string[]; right?: boolean };
const QUADS: Shape[] = [
  { name: t('un carré', 'a square', 'مربع', 'un cuadrado'), pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], sides: ['4 cm', '4 cm', '4 cm', '4 cm'], right: true },
  { name: t('un rectangle', 'a rectangle', 'مستطيل', 'un rectángulo'), pts: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3.5 }, { x: 0, y: 3.5 }], sides: ['6 cm', '3,5 cm', '6 cm', '3,5 cm'], right: true },
  { name: t('un losange', 'a rhombus', 'معين', 'un rombo'), pts: [{ x: 3, y: 0 }, { x: 6, y: 2.2 }, { x: 3, y: 4.4 }, { x: 0, y: 2.2 }], sides: ['3,7 cm', '3,7 cm', '3,7 cm', '3,7 cm'] },
  { name: t('un parallélogramme', 'a parallelogram', 'متوازي أضلاع', 'un paralelogramo'), pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 6.5, y: 3 }, { x: 1.5, y: 3 }], sides: ['5 cm', '3,4 cm', '5 cm', '3,4 cm'] },
];
const TRIANGLES: Shape[] = [
  { name: t('équilatéral', 'equilateral', 'متساوي الأضلاع', 'equilátero'), pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 4.33 }], sides: ['5 cm', '5 cm', '5 cm'] },
  { name: t('isocèle', 'isosceles', 'متساوي الساقين', 'isósceles'), pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 5 }], sides: ['4 cm', '5,4 cm', '5,4 cm'] },
  { name: t('rectangle', 'right-angled', 'قائم الزاوية', 'rectángulo'), pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 3 }], sides: ['5 cm', '5,8 cm', '3 cm'], right: true },
  { name: t('quelconque', 'scalene', 'كيفي', 'escaleno'), pts: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 1.5, y: 3.5 }], sides: ['6 cm', '5,7 cm', '3,8 cm'] },
];
function shapeScene(s: Shape): Scene {
  const names = s.pts.map((_, i) => 'ABCD'[i]!);
  return {
    points: Object.fromEntries(s.pts.map((p, i) => [names[i]!, p])),
    segments: names.map((n, i) => ({ id: `s${i}`, a: n, b: names[(i + 1) % names.length]!, ...(s.sides ? { text: s.sides[i]! } : {}) })),
    ...(s.right ? { rightAngles: names.length === 4 ? names.map((n, i) => [names[(i + 3) % 4]!, n, names[(i + 1) % 4]!] as [string, string, string]) : [['B', 'A', 'C'] as [string, string, string]] } : {}),
  };
}

function polyQuads(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 0, 3), shape = QUADS[k]!;
  const props: { text: L; answer: number }[] = [
    { text: t('quatre côtés de même longueur et quatre angles droits', 'four equal sides and four right angles', 'أربعة أضلاع متقايسة وأربع زوايا قائمة', 'cuatro lados iguales y cuatro ángulos rectos'), answer: 0 },
    { text: t('quatre angles droits, mais des côtés pas tous égaux', 'four right angles, but sides not all equal', 'أربع زوايا قائمة وأضلاع غير متقايسة كلها', 'cuatro ángulos rectos, pero lados no todos iguales'), answer: 1 },
    { text: t('quatre côtés de même longueur, mais aucun angle droit', 'four equal sides, but no right angle', 'أربعة أضلاع متقايسة دون زاوية قائمة', 'cuatro lados iguales, pero ningún ángulo recto'), answer: 2 },
    { text: t('des côtés opposés parallèles et de même longueur, sans angle droit', 'opposite sides parallel and equal, no right angle', 'أضلاع متقابلة متوازية ومتقايسة، دون زاوية قائمة', 'lados opuestos paralelos e iguales, sin ángulo recto'), answer: 3 },
  ];
  const prop = props[(k + int(rng, 1, 3)) % 4]!;
  return {
    title: t('Reconnaître les quadrilatères', 'Recognising quadrilaterals', 'التعرف على الرباعيات', 'Reconocer cuadriláteros'),
    summary: 'carré : 4 côtés égaux + 4 angles droits · rectangle : 4 angles droits · losange : 4 côtés égaux · parallélogramme : côtés opposés parallèles',
    steps: [
      { type: 'choice', scene: shapeScene(shape), options: QUADS.map(q => q.name), answer: k, prompt: t('Quelle est la nature de ce quadrilatère ? (les longueurs et les angles droits sont codés)', 'What kind of quadrilateral is this? (lengths and right angles are marked)', 'ما طبيعة هذا الرباعي؟ (الأطوال والزوايا القائمة مرمزة)', '¿Qué cuadrilátero es? (longitudes y ángulos rectos marcados)'), hint: t('Regarde d’abord les angles droits, puis les longueurs des côtés.', 'Look at right angles first, then side lengths.', 'انظر أولًا إلى الزوايا القائمة ثم إلى أطوال الأضلاع.', 'Mira primero los ángulos rectos y luego los lados.') },
      { type: 'choice', options: QUADS.map(q => q.name), answer: prop.answer, prompt: t(`Un quadrilatère a ${prop.text.fr}. C’est…`, `A quadrilateral has ${prop.text.en}. It is…`, `رباعي له ${prop.text.ar}. إنه…`, `Un cuadrilátero tiene ${prop.text.es}. Es…`), hint: t('Le carré est à la fois un rectangle et un losange : cherche le nom le plus précis.', 'A square is both a rectangle and a rhombus: pick the most precise name.', 'المربع مستطيل ومعين في آن واحد: اختر الاسم الأدق.', 'El cuadrado es rectángulo y rombo a la vez: elige el nombre más preciso.') },
    ],
  };
}

function polyTriangles(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 0, 3), shape = TRIANGLES[k]!;
  const e = int(rng, 3, 9), base = int(rng, 3, 9);
  return {
    title: t('Les triangles particuliers', 'Special triangles', 'المثلثات الخاصة', 'Triángulos especiales'),
    summary: 'équilatéral : 3 côtés égaux · isocèle : 2 côtés égaux · rectangle : un angle droit',
    steps: [
      { type: 'choice', scene: shapeScene(shape), options: TRIANGLES.map(s => s.name), answer: k, prompt: t('Ce triangle est…', 'This triangle is…', 'هذا المثلث…', 'Este triángulo es…'), hint: t('Compare les trois longueurs et cherche un angle droit codé.', 'Compare the three lengths and look for a marked right angle.', 'قارن الأطوال الثلاثة وابحث عن زاوية قائمة مرمزة.', 'Compara las tres longitudes y busca un ángulo recto.') },
      { type: 'number', answer: 3 * e, tolerance: 0, unit: 'cm', prompt: t(`Un triangle équilatéral a un côté de ${e} cm. Quel est son périmètre ?`, `An equilateral triangle has sides of ${e} cm. What is its perimeter?`, `مثلث متساوي الأضلاع طول ضلعه ${e} cm. ما محيطه؟`, `Un triángulo equilátero tiene lados de ${e} cm. ¿Cuál es su perímetro?`), hint: t('Ses trois côtés ont la même longueur.', 'All three sides are the same length.', 'أضلاعه الثلاثة متقايسة.', 'Sus tres lados miden lo mismo.') },
      { type: 'number', answer: 2 * e + base, tolerance: 0, unit: 'cm', prompt: t(`Un triangle isocèle a deux côtés de ${e} cm et une base de ${base} cm. Quel est son périmètre ?`, `An isosceles triangle has two sides of ${e} cm and a base of ${base} cm. Perimeter?`, `مثلث متساوي الساقين ساقاه ${e} cm وقاعدته ${base} cm. ما محيطه؟`, `Un triángulo isósceles tiene dos lados de ${e} cm y base ${base} cm. ¿Perímetro?`), hint: t(`${e} + ${e} + ${base}.`, `${e} + ${e} + ${base}.`, `${e} + ${e} + ${base}.`, `${e} + ${e} + ${base}.`) },
    ],
  };
}

function polyInequality(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 3, 7), b = int(rng, 3, 7);
  const ok = [a, b, a + b - int(rng, 1, Math.min(a, b) - 1)];
  const ko = [a, b, a + b + int(rng, 1, 4)];
  const [first, second] = rng() < 0.5 ? [ok, ko] : [ko, ok];
  const can = (s: number[]) => Math.max(...s) < s.reduce((x, y) => x + y, 0) - Math.max(...s);
  return {
    title: t('Peut-on construire ce triangle ?', 'Can this triangle be built?', 'هل يمكن إنشاء هذا المثلث؟', '¿Se puede construir este triángulo?'),
    summary: `le plus grand côté doit être plus petit que la somme des deux autres : ${a} + ${b} = ${a + b}`,
    steps: [
      ...[first!, second!].map(s => ({ type: 'choice' as const, options: OUI_NON, answer: can(s) ? 0 : 1, prompt: t(`Peut-on construire un triangle de côtés ${s.join(' cm, ')} cm ?`, `Can you build a triangle with sides ${s.join(' cm, ')} cm?`, `هل يمكن إنشاء مثلث أضلاعه ${s.join(' cm، ')} cm؟`, `¿Se puede construir un triángulo de lados ${s.join(' cm, ')} cm?`), hint: t(`Compare le plus grand côté à la somme des deux autres : ${a} + ${b} = ${a + b}.`, `Compare the longest side with the sum of the other two: ${a} + ${b} = ${a + b}.`, `قارن أطول ضلع بمجموع الضلعين الآخرين: ${a + b}.`, `Compara el lado mayor con la suma de los otros dos: ${a + b}.`) })),
      { type: 'number', answer: a + b - 1, tolerance: 0, unit: 'cm', prompt: t(`Deux côtés mesurent ${a} cm et ${b} cm. Quelle est la plus grande longueur entière possible du troisième côté ?`, `Two sides are ${a} cm and ${b} cm. What is the longest whole-number third side?`, `ضلعان طولاهما ${a} cm و ${b} cm. ما أكبر طول صحيح ممكن للضلع الثالث؟`, `Dos lados miden ${a} cm y ${b} cm. ¿Cuál es la mayor longitud entera del tercero?`), hint: t(`Il doit rester strictement plus petit que ${a} + ${b} = ${a + b}.`, `It must stay strictly less than ${a} + ${b} = ${a + b}.`, `يجب أن يبقى أصغر تمامًا من ${a + b}.`, `Debe ser estrictamente menor que ${a + b}.`) },
    ],
  };
}

function polyParallelogram(seed: number): Activity {
  const rng = seeded(seed);
  const g: Grid = { minX: 0, maxX: 9, minY: 0, maxY: 7 };
  let A: P, B: P, C: P, D: P;
  do {
    A = { x: int(rng, 0, 3), y: int(rng, 0, 2) };
    B = { x: A.x + int(rng, 3, 5), y: A.y + int(rng, -1, 1) };
    C = { x: B.x + int(rng, -1, 2), y: B.y + int(rng, 3, 4) };
    D = { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
  } while ([A, B, C, D].some(p => p.x < 0 || p.x > g.maxX || p.y < 0 || p.y > g.maxY));
  // Le point part d'un coin libre du quadrillage, loin des sommets déjà placés.
  const corner = [{ x: 0, y: g.maxY }, { x: g.maxX, y: 0 }, { x: g.maxX, y: g.maxY }].find(p => [A, B, C, D].every(q => Math.hypot(q.x - p.x, q.y - p.y) > 1.5))!;
  const ab = int(rng, 4, 9), ac = 2 * int(rng, 3, 7);
  return {
    title: t('Le parallélogramme', 'The parallelogram', 'متوازي الأضلاع', 'El paralelogramo'),
    summary: `côtés opposés parallèles et de même longueur · diagonales de même milieu`,
    steps: [
      { type: 'grid', scene: { grid: g, points: { A, B, C }, segments: [{ id: 'ab', a: 'A', b: 'B', style: 'bold' }, { id: 'bc', a: 'B', b: 'C', style: 'bold' }] }, label: 'D', start: corner, answer: D, prompt: t('Place le point D pour que ABCD soit un parallélogramme.', 'Place D so that ABCD is a parallelogram.', 'ضع النقطة D ليكون ABCD متوازي أضلاع.', 'Coloca D para que ABCD sea un paralelogramo.'), hint: t('Pour aller de C à D, fais le même déplacement que pour aller de B à A.', 'To go from C to D, make the same move as from B to A.', 'للانتقال من C إلى D قم بنفس الإزاحة من B إلى A.', 'De C a D, haz el mismo desplazamiento que de B a A.') },
      { type: 'number', answer: ab, tolerance: 0, unit: 'cm', prompt: t(`Dans le parallélogramme EFGH, EF = ${ab} cm. Combien mesure GH ?`, `In parallelogram EFGH, EF = ${ab} cm. How long is GH?`, `في متوازي الأضلاع EFGH، EF = ${ab} cm. كم يقيس GH؟`, `En el paralelogramo EFGH, EF = ${ab} cm. ¿Cuánto mide GH?`), hint: t('Les côtés opposés d’un parallélogramme ont la même longueur.', 'Opposite sides of a parallelogram are equal.', 'الأضلاع المتقابلة في متوازي الأضلاع متقايسة.', 'Los lados opuestos de un paralelogramo son iguales.') },
      { type: 'number', answer: ac / 2, tolerance: 0, unit: 'cm', prompt: t(`Ses diagonales se coupent en O et EG = ${ac} cm. Combien mesure EO ?`, `Its diagonals meet at O and EG = ${ac} cm. How long is EO?`, `قطراه يتقاطعان في O و EG = ${ac} cm. كم يقيس EO؟`, `Sus diagonales se cortan en O y EG = ${ac} cm. ¿Cuánto mide EO?`), hint: t('Les diagonales d’un parallélogramme ont le même milieu.', 'The diagonals of a parallelogram bisect each other.', 'قطرا متوازي الأضلاع لهما نفس المنتصف.', 'Las diagonales de un paralelogramo tienen el mismo punto medio.') },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const CALCUL_FIGURE_SKILLS: Skill[] = [
  { id: 'arith-euclid', review: 0, chapter: 'arith', build: arithEuclid, title: s('La division euclidienne', 'Division with remainder', 'القسمة الإقليدية', 'La división entera'), desc: s('Quotient, reste, égalité.', 'Quotient, remainder, equality.', 'الخارج والباقي والمتساوية.', 'Cociente, resto, igualdad.') },
  { id: 'arith-divisibility', review: 2, chapter: 'arith', build: arithDivisibility, title: s('Critères de divisibilité', 'Divisibility rules', 'قواعد قابلية القسمة', 'Criterios de divisibilidad'), desc: s('Par 2, 3, 5 et 9.', 'By 2, 3, 5 and 9.', 'على 2 و3 و5 و9.', 'Por 2, 3, 5 y 9.') },
  { id: 'arith-priorities', review: 1, chapter: 'arith', build: arithPriorities, title: s('Priorités opératoires', 'Order of operations', 'أولويات العمليات', 'Prioridad de operaciones'), desc: s('Multiplication d’abord, parenthèses avant tout.', 'Multiply first, brackets before all.', 'الضرب أولًا والأقواس قبل كل شيء.', 'Primero multiplicar, paréntesis antes.') },
  { id: 'arith-problems', review: 1, chapter: 'arith', build: arithProblems, title: s('Problèmes de partage', 'Sharing problems', 'مسائل التقسيم', 'Problemas de reparto'), desc: s('Que faire du reste ? Ordre de grandeur.', 'What to do with the remainder? Estimating.', 'ماذا نفعل بالباقي؟ رتبة المقدار.', '¿Qué hacer con el resto? Estimar.') },
  { id: 'pow-notation', review: 2, chapter: 'powers', build: powNotation, title: s('Écrire une puissance', 'Writing powers', 'كتابة قوة', 'Escribir potencias'), desc: s('Exposant, carré, cube.', 'Exponent, square, cube.', 'الأس والمربع والمكعب.', 'Exponente, cuadrado, cubo.') },
  { id: 'pow-ten', review: 2, chapter: 'powers', build: powTen, title: s('Puissances de 10', 'Powers of 10', 'قوى العدد 10', 'Potencias de 10'), desc: s('Compter les zéros, multiplier par 10ⁿ.', 'Count zeros, multiply by 10ⁿ.', 'عد الأصفار والضرب في 10ⁿ.', 'Contar ceros, multiplicar por 10ⁿ.') },
  { id: 'pow-priorities', review: 0, chapter: 'powers', build: powPriorities, title: s('Puissances et priorités', 'Powers and priorities', 'القوى والأولويات', 'Potencias y prioridades'), desc: s('La puissance avant le reste.', 'Powers before the rest.', 'القوة قبل الباقي.', 'La potencia antes que lo demás.') },
  { id: 'pow-compare', review: 2, chapter: 'powers', build: powCompare, title: s('Comparer des puissances', 'Comparing powers', 'مقارنة القوى', 'Comparar potencias'), desc: s('2⁵ ou 5² ? Carrés parfaits.', '2⁵ or 5²? Perfect squares.', '2⁵ أم 5²؟ المربعات التامة.', '¿2⁵ o 5²? Cuadrados perfectos.') },
  { id: 'expr-evaluate', review: 0, chapter: 'expressions', build: exprEvaluate, title: s('Calculer une expression', 'Evaluate an expression', 'حساب تعبير', 'Calcular una expresión'), desc: s('Remplacer la lettre par un nombre.', 'Substitute a number for the letter.', 'تعويض الحرف بعدد.', 'Sustituir la letra por un número.') },
  { id: 'expr-conventions', review: 2, chapter: 'expressions', build: exprConventions, title: s('Conventions d’écriture', 'Conventions', 'قواعد الكتابة', 'Convenciones'), desc: s('3a, a², et le piège 2a.', '3a, a², and the 2a trap.', '3a و a² وفخ 2a.', '3a, a² y la trampa 2a.') },
  { id: 'expr-reduce', review: 0, chapter: 'expressions', build: exprReduce, title: s('Réduire', 'Collect like terms', 'الاختزال', 'Reducir'), desc: s('Additionner des termes semblables.', 'Add like terms.', 'جمع الحدود المتشابهة.', 'Sumar términos semejantes.') },
  { id: 'expr-distribute', review: 0, chapter: 'expressions', build: exprDistribute, title: s('Développer et factoriser', 'Expand and factorise', 'النشر والتعميل', 'Desarrollar y factorizar'), desc: s('La distributivité dans les deux sens.', 'Distributivity both ways.', 'التوزيعية في الاتجاهين.', 'La distributiva en ambos sentidos.') },
  { id: 'eq-test', review: 1, chapter: 'equations', build: eqTest, title: s('Tester une égalité', 'Test a solution', 'اختبار متساوية', 'Comprobar una igualdad'), desc: s('Remplacer x et vérifier.', 'Substitute x and check.', 'تعويض x والتحقق.', 'Sustituir x y comprobar.') },
  { id: 'eq-add', review: 0, chapter: 'equations', build: eqAdd, title: s('x + a = b', 'x + a = b', 'x + a = b', 'x + a = b'), desc: s('Le nombre qui manque.', 'The missing number.', 'العدد الناقص.', 'El número que falta.') },
  { id: 'eq-mult', review: 0, chapter: 'equations', build: eqMult, title: s('a × x = b', 'a × x = b', 'a × x = b', 'a × x = b'), desc: s('Diviser pour trouver x.', 'Divide to find x.', 'القسمة لإيجاد x.', 'Dividir para hallar x.') },
  { id: 'eq-problem', review: 1, chapter: 'equations', build: eqProblem, title: s('Mettre en équation', 'Write the equation', 'وضع معادلة', 'Plantear la ecuación'), desc: s('Du texte à l’équation, puis la solution.', 'From words to equation, then solve.', 'من النص إلى المعادلة ثم الحل.', 'Del texto a la ecuación y la solución.') },
  { id: 'poly-quads', review: 0, chapter: 'polygons', build: polyQuads, title: s('Les quadrilatères', 'Quadrilaterals', 'الرباعيات', 'Los cuadriláteros'), desc: s('Carré, rectangle, losange, parallélogramme.', 'Square, rectangle, rhombus, parallelogram.', 'مربع، مستطيل، معين، متوازي أضلاع.', 'Cuadrado, rectángulo, rombo, paralelogramo.') },
  { id: 'poly-triangles', review: 1, chapter: 'polygons', build: polyTriangles, title: s('Les triangles particuliers', 'Special triangles', 'المثلثات الخاصة', 'Triángulos especiales'), desc: s('Équilatéral, isocèle, rectangle.', 'Equilateral, isosceles, right-angled.', 'متساوي الأضلاع، متساوي الساقين، قائم.', 'Equilátero, isósceles, rectángulo.') },
  { id: 'poly-inequality', review: 2, chapter: 'polygons', build: polyInequality, title: s('Construire un triangle', 'Building a triangle', 'إنشاء مثلث', 'Construir un triángulo'), desc: s('L’inégalité triangulaire.', 'The triangle inequality.', 'المتفاوتة المثلثية.', 'La desigualdad triangular.') },
  { id: 'poly-parallelogram', review: 1, chapter: 'polygons', build: polyParallelogram, title: s('Le parallélogramme', 'The parallelogram', 'متوازي الأضلاع', 'El paralelogramo'), desc: s('Côtés opposés, diagonales, construction.', 'Opposite sides, diagonals, construction.', 'الأضلاع المتقابلة والقطران والإنشاء.', 'Lados opuestos, diagonales, construcción.') },
];
