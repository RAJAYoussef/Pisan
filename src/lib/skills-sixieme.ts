// Parcours de 6e (1re année collège) : nombres décimaux, proportionnalité, droites et angles, symétrie,
// périmètres-aires-volumes. Blocs communs aux référentiels FR (cycle 3), MA (1AC), CI, SN et CCSS (Grade 6).
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import { fmt, pick, t, type Activity, type Grid, type P, type Rng, type Scene, type Skill, type Step, type Table } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
/** Décimal écrit à la française, jusqu'à 3 décimales. */
const d3 = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',');
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];

// ═════════════ NOMBRES DÉCIMAUX ═════════════

const PLACES = [
  { name: t('centaines', 'hundreds', 'المئات', 'centenas'), p: 100 },
  { name: t('dizaines', 'tens', 'العشرات', 'decenas'), p: 10 },
  { name: t('unités', 'units', 'الوحدات', 'unidades'), p: 1 },
  { name: t('dixièmes', 'tenths', 'الأعشار', 'décimas'), p: 0.1 },
  { name: t('centièmes', 'hundredths', 'الأجزاء من مائة', 'centésimas'), p: 0.01 },
];
/** Le chiffre d'un rang donné dans un nombre (rang = puissance de 10). */
const digitAt = (n: number, p: number) => Math.floor(Math.round(n * 100) / Math.round(p * 100)) % 10;

function decPlaceValue(seed: number): Activity {
  const rng = seeded(seed);
  let n: number;
  do { n = int(rng, 100, 999) + int(rng, 1, 99) / 100; } while (new Set(PLACES.map(pl => digitAt(n, pl.p))).size < 5);
  const k = int(rng, 0, 4), c = digitAt(n, PLACES[k]!.p);
  const x = int(rng, 1, 9) + int(rng, 10, 99) / 100;
  const units = int(rng, 2, 9), hund = int(rng, 1, 9);
  const digits = shuffle(rng, PLACES.map(pl => digitAt(n, pl.p)));
  const table: Table = { head: PLACES.map(pl => pl.name), rows: PLACES.map(pl => [String(digitAt(n, pl.p))]) };
  return {
    title: t('La valeur des chiffres', 'Place value', 'قيمة الأرقام', 'El valor de las cifras'),
    summary: `${d3(n)} : ${PLACES.map(pl => `${digitAt(n, pl.p)} ${pl.name.fr}`).join(', ')}`,
    steps: [
      { type: 'choice', options: digits.map(dg => same(String(dg))), answer: digits.indexOf(digitAt(n, 0.1)), prompt: t(`Dans ${d3(n)}, quel est le chiffre des dixièmes ?`, `In ${d3(n)}, which digit is in the tenths place?`, `في ${d3(n)}، ما رقم الأعشار؟`, `En ${d3(n)}, ¿cuál es la cifra de las décimas?`), hint: t('Le chiffre des dixièmes est le premier après la virgule.', 'The tenths digit is the first one after the decimal point.', 'رقم الأعشار هو أول رقم بعد الفاصلة.', 'La cifra de las décimas es la primera después de la coma.') },
      { type: 'choice', table, options: PLACES.map(pl => t(`${c} ${pl.name.fr}`, `${c} ${pl.name.en}`, `${c} ${pl.name.ar}`, `${c} ${pl.name.es}`)), answer: k, prompt: t(`Dans ${d3(n)}, que vaut le chiffre ${c} souligné au rang des ${PLACES[k]!.name.fr} ?`, `In ${d3(n)}, what is the digit ${c} in the ${PLACES[k]!.name.en} place worth?`, `في ${d3(n)}، ما قيمة الرقم ${c} في رتبة ${PLACES[k]!.name.ar}؟`, `En ${d3(n)}, ¿cuánto vale la cifra ${c} en las ${PLACES[k]!.name.es}?`), hint: t('Regarde dans quelle colonne du tableau se trouve le chiffre.', 'Look at which column of the table the digit is in.', 'انظر في أي عمود من الجدول يوجد الرقم.', 'Mira en qué columna de la tabla está la cifra.') },
      { type: 'number', answer: Math.round(x * 100), tolerance: 0, prompt: t(`Combien y a-t-il de centièmes en tout dans ${d3(x)} ?`, `How many hundredths are there altogether in ${d3(x)}?`, `كم جزءًا من مائة يوجد في المجموع في ${d3(x)}؟`, `¿Cuántas centésimas hay en total en ${d3(x)}?`), hint: t(`1 unité = 100 centièmes : ${Math.floor(x)} unités font ${Math.floor(x)} × 100 centièmes, puis ajoute les centièmes de la partie décimale.`, `1 unit = 100 hundredths: ${Math.floor(x)} units are ${Math.floor(x)} × 100 hundredths, then add the decimal part.`, `1 وحدة = 100 جزء من مائة: ${Math.floor(x)} وحدات = ${Math.floor(x)} × 100 ثم أضف الجزء العشري.`, `1 unidad = 100 centésimas: ${Math.floor(x)} × 100 y suma la parte decimal.`) },
      { type: 'number', answer: units + hund / 100, tolerance: 0, prompt: t(`Écris le nombre : ${units} unités et ${hund} centièmes.`, `Write the number: ${units} units and ${hund} hundredths.`, `اكتب العدد: ${units} وحدات و ${hund} أجزاء من مائة.`, `Escribe el número: ${units} unidades y ${hund} centésimas.`), hint: t(`Il n'y a pas de dixièmes : on écrit 0 au rang des dixièmes → ${units},0${hund}.`, `There are no tenths: write 0 in the tenths place.`, `لا توجد أعشار: نكتب 0 في رتبة الأعشار.`, `No hay décimas: se escribe 0 en las décimas.`) },
    ],
  };
}

function decCompare(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 8);
  const pairs = shuffle(rng, [[a + 0.7, a + 0.65], [a + 0.08, a + 0.1], [a + 0.5, a + 0.50]]).slice(0, 2);
  const signs = [same('<'), same('='), same('>')];
  const list = shuffle(rng, [a + 0.5, a + 0.05, a + 0.45, a + 0.405]);
  const sorted = [...list].sort((x, y) => x - y);
  const between = shuffle(rng, [{ v: a + 0.55, ok: true }, { v: a + 0.7, ok: false }, { v: a + 0.05, ok: false }]);
  return {
    title: t('Comparer et ranger', 'Comparing and ordering', 'المقارنة والترتيب', 'Comparar y ordenar'),
    summary: `${sorted.map(d3).join(' < ')}`,
    steps: [
      ...pairs.map(([x, y]) => ({ type: 'choice' as const, options: signs, answer: x! < y! ? 0 : x === y ? 1 : 2, prompt: t(`Compare : ${d3(x!)} … ${d3(y!)}`, `Compare: ${d3(x!)} … ${d3(y!)}`, `قارن: ${d3(x!)} … ${d3(y!)}`, `Compara: ${d3(x!)} … ${d3(y!)}`), hint: t('Compare chiffre par chiffre à partir de la gauche : unités, puis dixièmes, puis centièmes. Tu peux ajouter des zéros : 3,7 = 3,70.', 'Compare digit by digit from the left: units, tenths, hundredths. You can add zeros: 3.7 = 3.70.', 'قارن رقمًا برقم من اليسار: الوحدات ثم الأعشار ثم الأجزاء من مائة. يمكنك إضافة أصفار: 3,7 = 3,70.', 'Compara cifra a cifra desde la izquierda. Puedes añadir ceros: 3,7 = 3,70.') })),
      { type: 'chips', ordered: true, tokens: list.map(d3), groups: [sorted.map(d3)], prompt: t('Range ces nombres du plus petit au plus grand.', 'Put these numbers in order from smallest to largest.', 'رتّب هذه الأعداد من الأصغر إلى الأكبر.', 'Ordena estos números de menor a mayor.'), hint: t('Écris-les avec le même nombre de décimales (2,500 ; 2,050…) puis compare.', 'Write them with the same number of decimal places (2.500; 2.050…) then compare.', 'اكتبها بنفس عدد الأرقام بعد الفاصلة ثم قارن.', 'Escríbelos con las mismas cifras decimales y compara.') },
      { type: 'choice', options: between.map(b => same(d3(b.v))), answer: between.findIndex(b => b.ok), prompt: t(`Quel nombre est compris entre ${d3(a + 0.5)} et ${d3(a + 0.6)} ?`, `Which number is between ${d3(a + 0.5)} and ${d3(a + 0.6)}?`, `أي عدد محصور بين ${d3(a + 0.5)} و ${d3(a + 0.6)}؟`, `¿Qué número está entre ${d3(a + 0.5)} y ${d3(a + 0.6)}?`), hint: t(`${d3(a + 0.5)} = ${d3(a)},50 et ${d3(a + 0.6)} = ${d3(a)},60 : cherche un nombre entre les deux.`, `Think of them as hundredths: ${a}.50 and ${a}.60.`, `فكر في الأجزاء من مائة: ${a},50 و ${a},60.`, `Piensa en centésimas: ${a},50 y ${a},60.`) },
    ],
  };
}

/** Droite graduée de 0 à 10 unités de dessin : un grand trait à chaque bout, un petit trait par subdivision. */
function numberLine(from: string, to: string, extra: Record<string, P> = {}): Scene & { grid: Grid } {
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return {
    grid: { minX: 0, maxX: 10, minY: 0, maxY: 0 },
    points: { ...Object.fromEntries(ticks.flatMap(i => [[`t${i}a`, { x: i, y: i % 10 ? 0.25 : 0.45 }], [`t${i}b`, { x: i, y: i % 10 ? -0.25 : -0.45 }]])), L0: { x: -0.3, y: 0 }, L1: { x: 10.3, y: 0 }, ...extra },
    hidden: [...ticks.flatMap(i => [`t${i}a`, `t${i}b`]), 'L0', 'L1'],
    segments: [{ id: 'axe', a: 'L0', b: 'L1', style: 'bold' }, ...ticks.map(i => ({ id: `t${i}`, a: `t${i}a`, b: `t${i}b` }))],
    labels: [{ at: { x: 0, y: -1.1 }, text: from }, { at: { x: 10, y: -1.1 }, text: to }],
  };
}

function decNumberLine(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 1, 7), k = int(rng, 1, 9), m = pick(rng, [1, 2, 3, 4, 6, 7, 8, 9].filter(v => v !== k));
  const b = int(rng, 2, 8), j = int(rng, 1, 9);
  const read = numberLine(String(a), String(a + 1), { A: { x: k, y: 0 } });
  const place = numberLine(String(a), String(a + 1));
  const fine = numberLine(d3(b + 0.3), d3(b + 0.4), { C: { x: j, y: 0 } });
  return {
    title: t('Décimaux sur une droite graduée', 'Decimals on a number line', 'الأعداد العشرية على مستقيم مدرج', 'Decimales en la recta numérica'),
    summary: `A = ${d3(a + k / 10)} · B = ${d3(a + m / 10)} · C = ${d3(b + 0.3 + j / 100)}`,
    steps: [
      { type: 'number', scene: read, answer: a + k / 10, tolerance: 1e-9, prompt: t(`L’unité est partagée en 10 : chaque petit trait vaut un dixième. Quel nombre repère le point A ?`, `The unit is split into 10: each small mark is one tenth. Which number is at point A?`, `قُسّمت الوحدة إلى 10: كل تدريجة صغيرة تساوي عُشرًا. ما العدد الذي يمثله A؟`, `La unidad está dividida en 10: cada marca vale una décima. ¿Qué número marca A?`), hint: t(`Compte les petits traits depuis ${a} : ${k} dixièmes → ${a},${k}.`, `Count the marks from ${a}: ${k} tenths.`, `عُدّ التدريجات انطلاقًا من ${a}.`, `Cuenta las marcas desde ${a}.`) },
      { type: 'grid', scene: place, label: 'B', start: { x: 0, y: 0 }, answer: { x: m, y: 0 }, prompt: t(`Place le point B d’abscisse ${d3(a + m / 10)}.`, `Place point B at ${d3(a + m / 10)}.`, `ضع النقطة B ذات الأفصول ${d3(a + m / 10)}.`, `Coloca el punto B en ${d3(a + m / 10)}.`), hint: t(`${d3(a + m / 10)} = ${a} + ${m} dixièmes : avance de ${m} petits traits depuis ${a}.`, `${m} tenths after ${a}.`, `${m} أعشار بعد ${a}.`, `${m} décimas después de ${a}.`) },
      { type: 'number', scene: fine, answer: b + 0.3 + j / 100, tolerance: 1e-9, prompt: t(`Ici, on zoome entre ${d3(b + 0.3)} et ${d3(b + 0.4)} : chaque petit trait vaut un centième. Quel nombre repère C ?`, `Zoomed in between ${d3(b + 0.3)} and ${d3(b + 0.4)}: each mark is one hundredth. Which number is at C?`, `تكبير بين ${d3(b + 0.3)} و ${d3(b + 0.4)}: كل تدريجة تساوي جزءًا من مائة. ما العدد الذي يمثله C؟`, `Ampliamos entre ${d3(b + 0.3)} y ${d3(b + 0.4)}: cada marca vale una centésima. ¿Qué número marca C?`), hint: t(`${d3(b + 0.3)} + ${j} centièmes.`, `${d3(b + 0.3)} + ${j} hundredths.`, `${d3(b + 0.3)} + ${j} أجزاء من مائة.`, `${d3(b + 0.3)} + ${j} centésimas.`) },
    ],
  };
}

function decTimes10(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, 1, 99) + int(rng, 1, 99) / 100, y = int(rng, 100, 999) + int(rng, 1, 9) / 10;
  const p = pick(rng, [10, 100, 1000]);
  return {
    title: t('Multiplier et diviser par 10, 100, 1 000', 'Multiplying and dividing by 10, 100, 1,000', 'الضرب والقسمة على 10 و 100 و 1000', 'Multiplicar y dividir por 10, 100, 1000'),
    summary: `×10 : un rang vers la gauche · ÷10 : un rang vers la droite`,
    steps: [
      { type: 'number', answer: x * p, tolerance: 1e-6, prompt: t(`Calcule ${d3(x)} × ${p}.`, `Work out ${d3(x)} × ${p}.`, `احسب ${d3(x)} × ${p}.`, `Calcula ${d3(x)} × ${p}.`), hint: t(`Chaque chiffre prend une valeur ${p} fois plus grande : il se décale de ${String(p).length - 1} rang(s) vers la gauche.`, `Each digit becomes ${p} times bigger: it moves ${String(p).length - 1} place(s) left.`, `كل رقم يصبح أكبر بـ ${p} مرة.`, `Cada cifra vale ${p} veces más.`) },
      { type: 'choice', answer: 0, options: [t(`décaler chaque chiffre de 2 rangs vers la gauche`, 'move every digit 2 places to the left', 'إزاحة كل رقم رتبتين نحو اليسار', 'mover cada cifra 2 lugares a la izquierda'), t('ajouter deux zéros à la fin du nombre', 'add two zeros at the end of the number', 'إضافة صفرين في آخر العدد', 'añadir dos ceros al final del número'), t('déplacer la virgule de 2 rangs vers la gauche', 'move the decimal point 2 places left', 'إزاحة الفاصلة رتبتين نحو اليسار', 'mover la coma 2 lugares a la izquierda')], prompt: t('Multiplier un nombre décimal par 100, c’est…', 'Multiplying a decimal by 100 means…', 'ضرب عدد عشري في 100 يعني…', 'Multiplicar un decimal por 100 es…'), hint: t('Essaie avec 2,5 × 100 : « ajouter deux zéros » donnerait 2,500, qui vaut toujours 2,5 !', 'Try 2.5 × 100: “adding two zeros” gives 2.500, which is still 2.5!', 'جرّب 2,5 × 100: «إضافة صفرين» تعطي 2,500 وهو ما زال 2,5!', 'Prueba 2,5 × 100: «añadir dos ceros» da 2,500, que sigue siendo 2,5.') },
      { type: 'number', answer: y / p, tolerance: 1e-6, prompt: t(`Calcule ${d3(y)} ÷ ${p}.`, `Work out ${d3(y)} ÷ ${p}.`, `احسب ${d3(y)} ÷ ${p}.`, `Calcula ${d3(y)} ÷ ${p}.`), hint: t(`Chaque chiffre prend une valeur ${p} fois plus petite : décale de ${String(p).length - 1} rang(s) vers la droite.`, `Each digit becomes ${p} times smaller.`, `كل رقم يصبح أصغر بـ ${p} مرة.`, `Cada cifra vale ${p} veces menos.`) },
      { type: 'number', answer: (y / 100) * 1000, tolerance: 1e-6, prompt: t(`Un paquet pèse ${d3(y / 100)} kg. Combien pèsent 1 000 paquets (en kg) ?`, `A parcel weighs ${d3(y / 100)} kg. How much do 1,000 parcels weigh (kg)?`, `يزن طرد ${d3(y / 100)} kg. كم تزن 1000 طرد (kg)؟`, `Un paquete pesa ${d3(y / 100)} kg. ¿Cuánto pesan 1000 paquetes (kg)?`), hint: t(`${d3(y / 100)} × 1 000 : chaque chiffre avance de 3 rangs.`, `${d3(y / 100)} × 1,000: every digit moves 3 places.`, `${d3(y / 100)} × 1000: كل رقم يتقدم 3 رتب.`, `${d3(y / 100)} × 1000: cada cifra avanza 3 lugares.`) },
    ],
  };
}

function decDivision(seed: number): Activity {
  const rng = seeded(seed);
  const b = int(rng, 3, 12), q = int(rng, 12, 60), r = int(rng, 1, b - 1), a = b * q + r;
  const eggs = int(rng, 40, 99), box = pick(rng, [6, 12]);
  const options = shuffle(rng, [`${a} = ${b} × ${q} + ${r}`, `${a} = ${q} × ${r} + ${b}`, `${a} = ${b} × ${r} + ${q}`]);
  return {
    title: t('La division euclidienne', 'Division with remainder', 'القسمة الإقليدية', 'La división entera'),
    summary: `${a} = ${b} × ${q} + ${r} avec ${r} < ${b}`,
    steps: [
      { type: 'number', answer: q, tolerance: 0, prompt: t(`Division euclidienne de ${a} par ${b} : quel est le quotient ?`, `Divide ${a} by ${b} with a remainder: what is the quotient?`, `القسمة الإقليدية لـ ${a} على ${b}: ما الخارج؟`, `División entera de ${a} entre ${b}: ¿cuál es el cociente?`), hint: t(`Combien de fois ${b} dans ${a} ? ${b} × ${q} = ${b * q}.`, `How many times does ${b} go into ${a}?`, `كم مرة يوجد ${b} في ${a}؟`, `¿Cuántas veces cabe ${b} en ${a}?`) },
      { type: 'number', answer: r, tolerance: 0, prompt: t(`Et le reste ?`, `And the remainder?`, `وما الباقي؟`, `¿Y el resto?`), hint: t(`${a} − ${b} × ${q}. Le reste est toujours plus petit que ${b}.`, `${a} − ${b} × ${q}. The remainder is always less than ${b}.`, `${a} − ${b} × ${q}. الباقي دائمًا أصغر من ${b}.`, `${a} − ${b} × ${q}. El resto siempre es menor que ${b}.`) },
      { type: 'choice', options: options.map(same), answer: options.indexOf(`${a} = ${b} × ${q} + ${r}`), prompt: t('Quelle égalité traduit cette division ?', 'Which equality matches this division?', 'أي متساوية تترجم هذه القسمة؟', '¿Qué igualdad corresponde a esta división?'), hint: t('dividende = diviseur × quotient + reste', 'dividend = divisor × quotient + remainder', 'المقسوم = القاسم × الخارج + الباقي', 'dividendo = divisor × cociente + resto') },
      { type: 'number', answer: Math.floor(eggs / box), tolerance: 0, prompt: t(`On range ${eggs} œufs dans des boîtes de ${box}. Combien de boîtes sont pleines ?`, `${eggs} eggs go into boxes of ${box}. How many boxes are full?`, `نرتب ${eggs} بيضة في علب من ${box}. كم علبة ممتلئة؟`, `Se guardan ${eggs} huevos en cajas de ${box}. ¿Cuántas cajas están llenas?`), hint: t(`C’est le quotient de ${eggs} par ${box} ; le reste, ce sont les œufs qui restent.`, `It is the quotient of ${eggs} by ${box}.`, `إنه خارج قسمة ${eggs} على ${box}.`, `Es el cociente de ${eggs} entre ${box}.`) },
    ],
  };
}

// ═════════════ PROPORTIONNALITÉ ═════════════

const QTY = t('Quantité', 'Quantity', 'الكمية', 'Cantidad'), PRICE = t('Prix (€)', 'Price (€)', 'الثمن (€)', 'Precio (€)');

function propRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const xs = shuffle(rng, [2, 3, 4, 5, 6, 8, 10]).slice(0, 4).sort((a, b) => a - b);
  const k = pick(rng, [1.5, 2.5, 3, 4, 0.5]);
  const c = pick(rng, [2, 3, 5]);
  const yes: Table = { head: [QTY, PRICE], rows: [xs.map(String), xs.map(x => d3(x * k))] };
  const no: Table = { head: [QTY, PRICE], rows: [xs.map(String), xs.map(x => d3(x + c))] };
  const order = shuffle(rng, [true, false]);
  const isProp = t('Est-ce un tableau de proportionnalité ?', 'Is this a proportional table?', 'هل هذا جدول تناسبية؟', '¿Es una tabla de proporcionalidad?');
  const hint = t('C’est proportionnel si on passe de la 1re ligne à la 2de en multipliant toujours par le même nombre.', 'It is proportional if you always multiply by the same number to go from row 1 to row 2.', 'يكون تناسبيًا إذا انتقلنا من السطر الأول إلى الثاني بالضرب دائمًا في نفس العدد.', 'Es proporcional si siempre se multiplica por el mismo número.');
  return {
    title: t('Reconnaître la proportionnalité', 'Recognising proportionality', 'التعرف على التناسبية', 'Reconocer la proporcionalidad'),
    summary: `coefficient ${d3(k)} : y = ${d3(k)} × x`,
    steps: [
      ...order.map(p => ({ type: 'choice' as const, table: p ? yes : no, options: OUI_NON, answer: p ? 0 : 1, prompt: isProp, hint })),
      { type: 'number', table: yes, answer: k, tolerance: 1e-9, prompt: t('Ce tableau est proportionnel. Par quel nombre multiplie-t-on la quantité pour obtenir le prix ?', 'This table is proportional. What do you multiply the quantity by to get the price?', 'هذا الجدول تناسبي. في أي عدد نضرب الكمية لنحصل على الثمن؟', 'Esta tabla es proporcional. ¿Por qué número se multiplica la cantidad para obtener el precio?'), hint: t(`Divise un prix par sa quantité : ${d3(xs[0]! * k)} ÷ ${xs[0]}.`, `Divide a price by its quantity.`, `اقسم ثمنًا على كميته.`, `Divide un precio entre su cantidad.`) },
    ],
  };
}

function propFourth(seed: number): Activity {
  const rng = seeded(seed);
  const u = pick(rng, [0.5, 0.75, 1.2, 1.5, 2.5]), n1 = pick(rng, [3, 4, 5]), n2 = pick(rng, [7, 9, 12]);
  const people = pick(rng, [4, 6]), flour = pick(rng, [200, 300, 360]), people2 = people === 4 ? 6 : 9;
  return {
    title: t('Calculer une quatrième proportionnelle', 'Finding a missing value', 'حساب رابع متناسب', 'Calcular una cuarta proporcional'),
    summary: `passage à l’unité : 1 cahier = ${d3(u)} € → ${n2} cahiers = ${d3(n2 * u)} €`,
    steps: [
      { type: 'number', answer: u, tolerance: 1e-9, prompt: t(`${n1} cahiers coûtent ${d3(n1 * u)} €. Combien coûte un seul cahier ?`, `${n1} notebooks cost €${d3(n1 * u)}. How much is one notebook?`, `${n1} دفاتر ثمنها ${d3(n1 * u)} €. كم ثمن دفتر واحد؟`, `${n1} cuadernos cuestan ${d3(n1 * u)} €. ¿Cuánto cuesta uno?`), hint: t(`On divise par ${n1} : ${d3(n1 * u)} ÷ ${n1}.`, `Divide by ${n1}.`, `نقسم على ${n1}.`, `Se divide entre ${n1}.`) },
      { type: 'number', answer: n2 * u, tolerance: 1e-9, prompt: t(`Un cahier coûte ${d3(u)} €. Combien coûtent ${n2} cahiers ?`, `One notebook costs €${d3(u)}. How much are ${n2} notebooks?`, `ثمن دفتر واحد ${d3(u)} €. كم ثمن ${n2} دفاتر؟`, `Un cuaderno cuesta ${d3(u)} €. ¿Cuánto cuestan ${n2}?`), hint: t(`${n2} × ${d3(u)}`, `${n2} × ${d3(u)}`, `${n2} × ${d3(u)}`, `${n2} × ${d3(u)}`) },
      { type: 'number', answer: (flour * people2) / people, tolerance: 1e-9, prompt: t(`Pour ${people} personnes, il faut ${flour} g de farine. Combien en faut-il pour ${people2} personnes ?`, `For ${people} people you need ${flour} g of flour. How much for ${people2} people?`, `لـ ${people} أشخاص نحتاج ${flour} g من الدقيق. كم نحتاج لـ ${people2} أشخاص؟`, `Para ${people} personas hacen falta ${flour} g de harina. ¿Cuánta para ${people2}?`), hint: t(`${people2} personnes = ${people} + ${people2 - people} personnes : ${flour} + la part de ${people2 - people} personnes (ou passe par 1 personne).`, `${people2} = ${people} + ${people2 - people}: add the share of ${people2 - people} people.`, `${people2} = ${people} + ${people2 - people}.`, `${people2} = ${people} + ${people2 - people}.`) },
    ],
  };
}

function propPercent(seed: number): Activity {
  const rng = seeded(seed);
  const p = pick(rng, [10, 20, 25, 50, 75]), base = pick(rng, [40, 60, 80, 120, 200]);
  const price = pick(rng, [30, 50, 80, 120]), off = pick(rng, [10, 20, 25, 50]);
  return {
    title: t('Appliquer un pourcentage', 'Applying a percentage', 'تطبيق نسبة مئوية', 'Aplicar un porcentaje'),
    summary: `${p} % de ${base} = ${base} × ${p} ÷ 100 = ${d3((base * p) / 100)}`,
    steps: [
      { type: 'number', answer: (base * p) / 100, tolerance: 1e-9, prompt: t(`Calcule ${p} % de ${base}.`, `Work out ${p}% of ${base}.`, `احسب ${p} % من ${base}.`, `Calcula el ${p} % de ${base}.`), hint: t(`${p} % de ${base} = ${base} × ${p} ÷ 100.`, `${p}% of ${base} = ${base} × ${p} ÷ 100.`, `${p} % من ${base} = ${base} × ${p} ÷ 100.`, `${p} % de ${base} = ${base} × ${p} ÷ 100.`) },
      { type: 'number', answer: price - (price * off) / 100, tolerance: 1e-9, prompt: t(`Un jeu coûte ${price} €. Il est soldé à −${off} %. Combien le paie-t-on ?`, `A game costs €${price}. It is ${off}% off. What do you pay?`, `ثمن لعبة ${price} €. عليها تخفيض ${off} %. كم ندفع؟`, `Un juego cuesta ${price} €. Tiene un ${off} % de descuento. ¿Cuánto se paga?`), hint: t(`Réduction : ${off} % de ${price} = ${d3((price * off) / 100)} €. Puis on la retire du prix.`, `Discount: ${off}% of ${price}. Then subtract it.`, `التخفيض: ${off} % من ${price}، ثم نطرحه.`, `Descuento: ${off} % de ${price}; luego se resta.`) },
      { type: 'choice', answer: 0, options: [t('un quart', 'a quarter', 'الربع', 'un cuarto'), t('un tiers', 'a third', 'الثلث', 'un tercio'), t('25 fois plus', '25 times more', '25 مرة أكثر', '25 veces más')], prompt: t('Prendre 25 %, c’est prendre…', 'Taking 25% means taking…', 'أخذ 25 % يعني أخذ…', 'Tomar el 25 % es tomar…'), hint: t('25 % = 25/100 = 1/4.', '25% = 25/100 = 1/4.', '25 % = 25/100 = 1/4.', '25 % = 25/100 = 1/4.') },
    ],
  };
}

function propScale(seed: number): Activity {
  const rng = seeded(seed);
  const plan = pick(rng, [3, 4, 6]), sc = pick(rng, [100, 200, 500]), real = pick(rng, [10, 12, 20]);
  const mapCm = pick(rng, [2, 3, 4]);
  return {
    title: t('Échelles', 'Scales', 'السلالم', 'Escalas'),
    summary: `échelle 1/${sc} : 1 cm sur le plan = ${sc} cm en vrai`,
    steps: [
      { type: 'number', answer: (plan * sc) / 100, tolerance: 1e-9, prompt: t(`Sur un plan à l’échelle 1/${sc}, une pièce mesure ${plan} cm. Quelle est sa longueur réelle, en mètres ?`, `On a 1/${sc} scale plan, a room is ${plan} cm long. What is its real length in metres?`, `في تصميم بسلم 1/${sc}، طول غرفة ${plan} cm. ما طولها الحقيقي بالمتر؟`, `En un plano a escala 1/${sc}, una habitación mide ${plan} cm. ¿Cuál es su longitud real en metros?`), hint: t(`1 cm sur le plan = ${sc} cm en vrai : ${plan} × ${sc} = ${plan * sc} cm, puis convertis en m.`, `1 cm = ${sc} cm in reality, then convert to m.`, `1 cm = ${sc} cm في الواقع، ثم حوّل إلى m.`, `1 cm = ${sc} cm reales; luego pasa a m.`) },
      { type: 'number', answer: (real * 100) / sc, tolerance: 1e-9, prompt: t(`Même plan (1/${sc}). Un mur mesure ${real} m en vrai. Combien de centimètres sur le plan ?`, `Same plan (1/${sc}). A wall is ${real} m long. How many cm on the plan?`, `نفس التصميم (1/${sc}). طول حائط ${real} m. كم سنتيمترًا على التصميم؟`, `Mismo plano (1/${sc}). Una pared mide ${real} m. ¿Cuántos cm en el plano?`), hint: t(`${real} m = ${real * 100} cm, puis ÷ ${sc}.`, `${real} m = ${real * 100} cm, then ÷ ${sc}.`, `${real} m = ${real * 100} cm ثم ÷ ${sc}.`, `${real} m = ${real * 100} cm; luego ÷ ${sc}.`) },
      { type: 'number', answer: (mapCm * 25000) / 100000, tolerance: 1e-9, prompt: t(`Sur une carte au 1/25 000, deux villages sont à ${mapCm} cm. Quelle est la distance réelle en km ?`, `On a 1/25,000 map, two villages are ${mapCm} cm apart. Real distance in km?`, `في خريطة بسلم 1/25000، المسافة بين قريتين ${mapCm} cm. ما المسافة الحقيقية بالكيلومتر؟`, `En un mapa 1/25 000, dos pueblos están a ${mapCm} cm. ¿Distancia real en km?`), hint: t(`${mapCm} × 25 000 cm, puis 1 km = 100 000 cm.`, `${mapCm} × 25,000 cm, and 1 km = 100,000 cm.`, `${mapCm} × 25000 cm و 1 km = 100000 cm.`, `${mapCm} × 25 000 cm; 1 km = 100 000 cm.`) },
    ],
  };
}

// ═════════════ DROITES ET ANGLES ═════════════

function linesNotation(seed: number): Activity {
  const rng = seeded(seed);
  const A = { x: 2, y: 1 }, B = { x: 6, y: 2.5 };
  const dir = { x: B.x - A.x, y: B.y - A.y };
  const far = (k: number) => ({ x: A.x + dir.x * k, y: A.y + dir.y * k });
  const base = { A, B };
  const kinds = shuffle(rng, [
    { scene: { points: base, segments: [{ id: 'AB', a: 'A', b: 'B', style: 'bold' as const }] }, answer: 0 },
    { scene: { points: { ...base, P: far(-0.45), Q: far(1.6) }, hidden: ['P', 'Q'], segments: [{ id: 'PQ', a: 'P', b: 'Q', style: 'bold' as const }] }, answer: 1 },
    { scene: { points: { ...base, Q: far(1.6) }, hidden: ['Q'], segments: [{ id: 'AQ', a: 'A', b: 'Q', style: 'bold' as const }] }, answer: 2 },
  ]);
  const options = [same('[AB]'), same('(AB)'), same('[AB)')];
  const hint = t('[AB] : segment, il s’arrête en A et en B. (AB) : droite, illimitée des deux côtés. [AB) : demi-droite, elle part de A et passe par B.', '[AB]: segment, stops at A and B. (AB): line, endless both ways. [AB): ray, starts at A through B.', '[AB]: قطعة تتوقف عند A و B. (AB): مستقيم غير محدود. [AB): نصف مستقيم يبدأ من A ويمر من B.', '[AB]: segmento. (AB): recta ilimitada. [AB): semirrecta desde A por B.');
  return {
    title: t('Droites, segments, demi-droites', 'Lines, segments and rays', 'المستقيمات والقطع وأنصاف المستقيمات', 'Rectas, segmentos y semirrectas'),
    summary: '[AB] segment · (AB) droite · [AB) demi-droite',
    steps: [
      ...kinds.map(k => ({ type: 'choice' as const, scene: k.scene, options, answer: k.answer, prompt: t('Comment note-t-on la figure tracée en gras ?', 'How do you write the figure drawn in bold?', 'كيف نرمز للشكل المرسوم بالخط العريض؟', '¿Cómo se escribe la figura en negrita?'), hint })),
      { type: 'choice', answer: 0, options: [t('le segment [AB]', 'segment [AB]', 'القطعة [AB]', 'el segmento [AB]'), t('la droite (AB)', 'line (AB)', 'المستقيم (AB)', 'la recta (AB)'), t('la demi-droite [AB)', 'ray [AB)', 'نصف المستقيم [AB)', 'la semirrecta [AB)')], prompt: t('Lequel a une longueur que l’on peut mesurer ?', 'Which one has a length you can measure?', 'أيها له طول يمكن قياسه؟', '¿Cuál tiene una longitud que se puede medir?'), hint: t('Seul le segment a deux extrémités.', 'Only the segment has two ends.', 'وحدها القطعة لها طرفان.', 'Solo el segmento tiene dos extremos.') },
    ],
  };
}

function linesPerpParallel(seed: number): Activity {
  const rng = seeded(seed);
  const g: Grid = { minX: 0, maxX: 10, minY: 0, maxY: 8 };
  const line = (id: string, p: P, d: P, k = 3) => ({ pts: { [`${id}1`]: { x: p.x - d.x * k / 2, y: p.y - d.y * k / 2 }, [`${id}2`]: { x: p.x + d.x * k / 2, y: p.y + d.y * k / 2 } }, seg: { id, a: `${id}1`, b: `${id}2`, style: 'bold' as const } });
  const build = (d1: P, d2: P, p2: P): Scene => {
    const l1 = line('d', { x: 5, y: 4 }, d1), l2 = line('e', p2, d2);
    return { grid: g, points: { ...l1.pts, ...l2.pts }, hidden: Object.keys({ ...l1.pts, ...l2.pts }), segments: [l1.seg, l2.seg] };
  };
  const u = pick(rng, [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 1 }]);
  const cases = shuffle(rng, [
    { scene: build(u, { x: -u.y, y: u.x }, { x: 5, y: 4 }), answer: 0 },
    { scene: build(u, u, { x: 5, y: 1.5 }), answer: 1 },
    { scene: build(u, { x: 1, y: 3 }, { x: 5, y: 4 }), answer: 2 },
  ]);
  const options = [t('perpendiculaires', 'perpendicular', 'متعامدان', 'perpendiculares'), t('parallèles', 'parallel', 'متوازيان', 'paralelas'), t('sécantes, mais pas perpendiculaires', 'intersecting, not perpendicular', 'متقاطعان وغير متعامدين', 'secantes, no perpendiculares')];
  return {
    title: t('Perpendiculaires et parallèles', 'Perpendicular and parallel lines', 'المتعامدان والمتوازيان', 'Perpendiculares y paralelas'),
    summary: 'perpendiculaires : angle droit · parallèles : jamais de point commun',
    steps: [
      ...cases.map(c => ({ type: 'choice' as const, scene: c.scene, options, answer: c.answer, prompt: t('Les deux droites (d) et (e) sont…', 'The two lines (d) and (e) are…', 'المستقيمان (d) و (e)…', 'Las dos rectas (d) y (e) son…'), hint: t('Suis les carreaux : des droites parallèles ont la même pente ; des perpendiculaires forment un angle droit (vérifie à l’équerre).', 'Follow the squares: parallel lines have the same slope; perpendicular ones form a right angle.', 'تتبع المربعات: المتوازيان لهما نفس الميل؛ المتعامدان يكوّنان زاوية قائمة.', 'Sigue los cuadros: las paralelas tienen la misma pendiente; las perpendiculares forman un ángulo recto.') })),
      { type: 'choice', answer: 1, options, prompt: t('Deux droites perpendiculaires à une même troisième droite sont…', 'Two lines perpendicular to the same third line are…', 'مستقيمان عموديان على نفس المستقيم الثالث يكونان…', 'Dos rectas perpendiculares a una misma tercera son…'), hint: t('Dessine-les : deux traits verticaux sur une même ligne horizontale.', 'Draw them: two vertical lines on one horizontal line.', 'ارسمهما: خطان عموديان على نفس الخط الأفقي.', 'Dibújalas: dos verticales sobre una misma horizontal.') },
    ],
  };
}

const ray = (c: P, deg: number, k = 4.2): P => ({ x: c.x + k * Math.cos((deg * Math.PI) / 180), y: c.y + k * Math.sin((deg * Math.PI) / 180) });
function angleScene(value: number, zero: number, protractor: boolean): Scene {
  const O = { x: 0, y: 0 };
  return { points: { O, A: ray(O, zero), B: ray(O, zero + value) }, segments: [{ id: 'OA', a: 'O', b: 'A', style: 'bold' }, { id: 'OB', a: 'O', b: 'B', style: 'bold' }], angleMarks: [['A', 'O', 'B']], ...(protractor ? { protractor: { c: 'O', zero } } : {}) };
}
const kindOf = (v: number) => (v < 90 ? 0 : v === 90 ? 1 : v < 180 ? 2 : 3);
const ANGLE_KINDS = [t('aigu', 'acute', 'حادة', 'agudo'), t('droit', 'right', 'قائمة', 'recto'), t('obtus', 'obtuse', 'منفرجة', 'obtuso'), t('plat', 'straight', 'مستقيمة', 'llano')];

function anglesMeasure(seed: number): Activity {
  const rng = seeded(seed);
  const a1 = pick(rng, [35, 50, 65, 70]), a2 = pick(rng, [110, 125, 140, 155]);
  const z1 = pick(rng, [0, 10, 20]), z2 = pick(rng, [0, 15, 30]);
  const hint = t('Le centre du rapporteur est sur le sommet O et le 0 sur la demi-droite [OA). Lis la graduation où passe [OB), en comptant à partir de ce 0.', 'Put the centre on O and the 0 on ray [OA). Read where [OB) crosses, counting from that 0.', 'مركز المنقلة على الرأس O والصفر على [OA). اقرأ التدريجة التي يمر منها [OB) انطلاقًا من هذا الصفر.', 'Centro en O y el 0 sobre [OA). Lee dónde pasa [OB) contando desde ese 0.');
  return {
    title: t('Mesurer un angle', 'Measuring an angle', 'قياس زاوية', 'Medir un ángulo'),
    summary: `AOB = ${a1}° (aigu) · ${a2}° (obtus)`,
    steps: [
      { type: 'number', scene: angleScene(a1, z1, true), answer: a1, tolerance: 2, prompt: t('Lis la mesure de l’angle AOB avec le rapporteur (en degrés).', 'Read angle AOB with the protractor (in degrees).', 'اقرأ قياس الزاوية AOB بالمنقلة (بالدرجات).', 'Lee la medida del ángulo AOB con el transportador (en grados).'), hint },
      { type: 'choice', scene: angleScene(a1, z1, false), options: ANGLE_KINDS, answer: kindOf(a1), prompt: t(`Un angle de ${a1}° est…`, `An angle of ${a1}° is…`, `زاوية قياسها ${a1}° هي…`, `Un ángulo de ${a1}° es…`), hint: t('Aigu : moins de 90°. Droit : 90°. Obtus : entre 90° et 180°. Plat : 180°.', 'Acute: under 90°. Right: 90°. Obtuse: between 90° and 180°. Straight: 180°.', 'حادة: أقل من 90°. قائمة: 90°. منفرجة: بين 90° و 180°. مستقيمة: 180°.', 'Agudo: menos de 90°. Recto: 90°. Obtuso: entre 90° y 180°. Llano: 180°.') },
      { type: 'number', scene: angleScene(a2, z2, true), answer: a2, tolerance: 2, prompt: t('Et cet angle AOB ? Attention au sens de lecture.', 'And this angle AOB? Read in the right direction.', 'وهذه الزاوية AOB؟ انتبه لاتجاه القراءة.', '¿Y este ángulo AOB? Cuidado con el sentido.'), hint: t(`L’angle est plus grand qu’un angle droit : la mesure dépasse 90°.`, `The angle is wider than a right angle: more than 90°.`, `الزاوية أكبر من القائمة: القياس أكبر من 90°.`, `Es mayor que un recto: más de 90°.`) },
    ],
  };
}

function anglesKinds(seed: number): Activity {
  const rng = seeded(seed);
  const values = shuffle(rng, [pick(rng, [25, 40, 60]), 90, pick(rng, [115, 130, 150]), 180]);
  return {
    title: t('Aigu, droit, obtus, plat', 'Acute, right, obtuse, straight', 'حادة، قائمة، منفرجة، مستقيمة', 'Agudo, recto, obtuso, llano'),
    summary: 'aigu < 90° = droit < obtus < 180° = plat',
    steps: [
      ...values.map(v => ({ type: 'choice' as const, scene: { ...angleScene(v, pick(rng, [0, 20, 200]), false), ...(v === 90 ? { rightAngles: [['A', 'O', 'B']] as [string, string, string][], angleMarks: [] } : {}) }, options: ANGLE_KINDS, answer: kindOf(v), prompt: t('Cet angle est…', 'This angle is…', 'هذه الزاوية…', 'Este ángulo es…'), hint: t('Compare avec un angle droit (le coin d’une feuille).', 'Compare with a right angle (the corner of a sheet).', 'قارن بزاوية قائمة (ركن ورقة).', 'Compara con un ángulo recto (la esquina de una hoja).') })),
      { type: 'number', answer: 90, tolerance: 0, prompt: t('Combien mesure un angle droit, en degrés ?', 'How many degrees is a right angle?', 'كم قياس الزاوية القائمة بالدرجات؟', '¿Cuántos grados mide un ángulo recto?'), hint: t('C’est la moitié d’un angle plat (180°).', 'Half a straight angle (180°).', 'نصف الزاوية المستقيمة (180°).', 'La mitad de un ángulo llano (180°).') },
    ],
  };
}

// ═════════════ SYMÉTRIE ═════════════

function polygonScene(pts: P[], extra: Partial<Scene> = {}): Scene {
  const names = pts.map((_, i) => `p${i}`);
  return { points: Object.fromEntries(pts.map((p, i) => [names[i]!, p])), hidden: names, segments: names.map((n, i) => ({ id: `s${i}`, a: n, b: names[(i + 1) % names.length]!, style: 'bold' as const })), ...extra };
}
const SHAPES: { name: L4; pts: P[]; axes: number }[] = [
  { name: ['un rectangle', 'a rectangle', 'مستطيل', 'un rectángulo'], pts: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 3.5 }, { x: 0, y: 3.5 }], axes: 2 },
  { name: ['un carré', 'a square', 'مربع', 'un cuadrado'], pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], axes: 4 },
  { name: ['un triangle équilatéral', 'an equilateral triangle', 'مثلث متساوي الأضلاع', 'un triángulo equilátero'], pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 4.33 }], axes: 3 },
  { name: ['un losange', 'a rhombus', 'معين', 'un rombo'], pts: [{ x: 3, y: 0 }, { x: 6, y: 2.2 }, { x: 3, y: 4.4 }, { x: 0, y: 2.2 }], axes: 2 },
  { name: ['un triangle isocèle', 'an isosceles triangle', 'مثلث متساوي الساقين', 'un triángulo isósceles'], pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 5 }], axes: 1 },
  { name: ['un parallélogramme', 'a parallelogram', 'متوازي أضلاع', 'un paralelogramo'], pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 6.5, y: 3 }, { x: 1.5, y: 3 }], axes: 0 },
];
type L4 = [string, string, string, string];

function symAxes(seed: number): Activity {
  const rng = seeded(seed);
  const shapes = shuffle(rng, SHAPES).slice(0, 4);
  return {
    title: t('Axes de symétrie', 'Lines of symmetry', 'محاور التماثل', 'Ejes de simetría'),
    summary: shapes.map(s => `${s.name[0]} : ${s.axes}`).join(' · '),
    steps: [
      ...shapes.map(s => ({ type: 'number' as const, scene: polygonScene(s.pts), answer: s.axes, tolerance: 0, prompt: t(`Combien d’axes de symétrie a ${s.name[0]} ?`, `How many lines of symmetry does ${s.name[1]} have?`, `كم محور تماثل لـ${s.name[2]}؟`, `¿Cuántos ejes de simetría tiene ${s.name[3]}?`), hint: t('Un axe partage la figure en deux moitiés qui se superposent par pliage. Essaie les médianes et les diagonales.', 'An axis splits the shape into two halves that match when folded. Try midlines and diagonals.', 'المحور يقسم الشكل إلى نصفين يتطابقان بالطي. جرّب المتوسطات والأقطار.', 'Un eje divide la figura en dos mitades que coinciden al doblar.') })),
    ],
  };
}

function symAxial(seed: number): Activity {
  const rng = seeded(seed);
  const g: Grid = { minX: 0, maxX: 10, minY: 0, maxY: 8 };
  const axisV = { a1: { x: 5, y: 0 }, a2: { x: 5, y: 8 } }, axisH = { a1: { x: 0, y: 4 }, a2: { x: 10, y: 4 } }, axisD = { a1: { x: 0, y: 0 }, a2: { x: 8, y: 8 } };
  const scene = (axis: { a1: P; a2: P }, pts: Record<string, P>): Scene & { grid: Grid } => ({ grid: g, points: { a1: axis.a1, a2: axis.a2, ...pts }, hidden: ['a1', 'a2'], segments: [{ id: 'd', a: 'a1', b: 'a2', style: 'dashed' }] });
  const M = { x: int(rng, 1, 4), y: int(rng, 1, 7) }, N = { x: int(rng, 1, 9), y: int(rng, 1, 3) }, Pp = { x: int(rng, 4, 7), y: int(rng, 1, 3) };
  const hint = t('Le symétrique est à la même distance de l’axe, de l’autre côté, sur la perpendiculaire à l’axe. Compte les carreaux.', 'The image is the same distance from the axis, on the other side, along a perpendicular. Count squares.', 'الصورة على نفس البعد من المحور في الجهة الأخرى على العمودي. عُدّ المربعات.', 'La imagen está a la misma distancia del eje, al otro lado. Cuenta cuadros.');
  return {
    title: t('Symétrique d’un point (axe)', 'Reflecting a point', 'مماثل نقطة بالنسبة لمحور', 'Simétrico de un punto (eje)'),
    summary: "M' : même distance à l’axe, de l’autre côté · l’axe est la médiatrice de [MM']",
    steps: [
      { type: 'grid', scene: scene(axisV, { M }), label: "M'", start: { x: 5, y: M.y }, answer: { x: 10 - M.x, y: M.y }, prompt: t('Place M′, le symétrique de M par rapport à la droite en pointillés.', 'Place M′, the reflection of M in the dashed line.', 'ضع M′ مماثل M بالنسبة للمستقيم المنقط.', 'Coloca M′, simétrico de M respecto a la recta discontinua.'), hint },
      { type: 'grid', scene: scene(axisH, { N }), label: "N'", start: { x: N.x, y: 4 }, answer: { x: N.x, y: 8 - N.y }, prompt: t('Place N′, le symétrique de N par rapport à cet axe horizontal.', 'Place N′, the reflection of N in this horizontal axis.', 'ضع N′ مماثل N بالنسبة لهذا المحور الأفقي.', 'Coloca N′, simétrico de N respecto a este eje horizontal.'), hint },
      { type: 'grid', scene: scene(axisD, { P: Pp }), label: "P'", start: { x: 4, y: 4 }, answer: { x: Pp.y, y: Pp.x }, prompt: t('Plus difficile : place P′, le symétrique de P par rapport à la diagonale.', 'Harder: place P′, the reflection of P in the diagonal.', 'أصعب: ضع P′ مماثل P بالنسبة للقطر.', 'Más difícil: coloca P′, simétrico de P respecto a la diagonal.'), hint: t('Pour un axe en diagonale, on échange le nombre de carreaux « vers la droite » et « vers le haut ».', 'For a diagonal axis, swap the “across” and “up” counts.', 'بالنسبة لمحور قطري نبادل عدد المربعات أفقيًا وعموديًا.', 'Con un eje diagonal, se intercambian los cuadros horizontales y verticales.') },
      { type: 'choice', answer: 0, options: [t('la médiatrice du segment [MM′]', 'the perpendicular bisector of [MM′]', 'واسط القطعة [MM′]', 'la mediatriz de [MM′]'), t('parallèle à [MM′]', 'parallel to [MM′]', 'موازٍ لـ [MM′]', 'paralela a [MM′]'), t('passe toujours par M', 'always goes through M', 'يمر دائمًا من M', 'pasa siempre por M')], prompt: t('Si M′ est le symétrique de M par rapport à la droite (d), alors (d) est…', 'If M′ is the reflection of M in line (d), then (d) is…', 'إذا كانت M′ مماثلة M بالنسبة لـ (d) فإن (d)…', 'Si M′ es el simétrico de M respecto a (d), entonces (d) es…'), hint: t('(d) coupe [MM′] en son milieu, à angle droit.', '(d) cuts [MM′] at its midpoint, at a right angle.', '(d) يقطع [MM′] في منتصفه بزاوية قائمة.', '(d) corta [MM′] en su punto medio, en ángulo recto.') },
    ],
  };
}

function symCentral(seed: number): Activity {
  const rng = seeded(seed);
  const g: Grid = { minX: 0, maxX: 10, minY: 0, maxY: 8 };
  const O = { x: 5, y: 4 };
  const A = { x: int(rng, 1, 4), y: int(rng, 1, 7) }, B = { x: int(rng, 6, 9), y: int(rng, 1, 3) };
  const scene = (pts: Record<string, P>): Scene & { grid: Grid } => ({ grid: g, points: { O, ...pts }, segments: [] });
  const hint = t('O est le milieu de [AA′] : depuis A, va jusqu’à O, puis refais le même trajet après O.', 'O is the midpoint of [AA′]: go from A to O, then the same trip again past O.', 'O منتصف [AA′]: انتقل من A إلى O ثم كرر نفس المسار بعد O.', 'O es el punto medio de [AA′]: de A a O, y el mismo trayecto otra vez.');
  return {
    title: t('Symétrie centrale', 'Point symmetry', 'التماثل المركزي', 'Simetría central'),
    summary: "O est le milieu de [AA'] · la figure tourne d’un demi-tour autour de O",
    steps: [
      { type: 'grid', scene: scene({ A }), label: "A'", start: { x: O.x, y: 0 }, answer: { x: 2 * O.x - A.x, y: 2 * O.y - A.y }, prompt: t('Place A′, le symétrique de A par rapport au point O.', 'Place A′, the image of A by symmetry about point O.', 'ضع A′ مماثلة A بالنسبة للنقطة O.', 'Coloca A′, simétrico de A respecto al punto O.'), hint },
      { type: 'grid', scene: scene({ B }), label: "B'", start: { x: O.x, y: 0 }, answer: { x: 2 * O.x - B.x, y: 2 * O.y - B.y }, prompt: t('Place B′, le symétrique de B par rapport à O.', 'Place B′, the image of B about O.', 'ضع B′ مماثلة B بالنسبة لـ O.', 'Coloca B′, simétrico de B respecto a O.'), hint },
      { type: 'choice', answer: 0, options: [t('le milieu de [AA′]', 'the midpoint of [AA′]', 'منتصف [AA′]', 'el punto medio de [AA′]'), t('sur la médiatrice de [AA′], n’importe où', 'anywhere on the bisector of [AA′]', 'في أي مكان على واسط [AA′]', 'en cualquier lugar de la mediatriz'), t('confondu avec A', 'the same point as A', 'منطبق على A', 'el mismo punto que A')], prompt: t('Si A′ est le symétrique de A par rapport à O, alors O est…', 'If A′ is the image of A about O, then O is…', 'إذا كانت A′ مماثلة A بالنسبة لـ O فإن O…', 'Si A′ es el simétrico de A respecto a O, entonces O es…'), hint },
    ],
  };
}

function symProperties(seed: number): Activity {
  const rng = seeded(seed);
  const len = pick(rng, [4, 5.5, 7]), ang = pick(rng, [35, 48, 120]), area = pick(rng, [12, 18, 25]);
  return {
    title: t('Ce que conserve la symétrie', 'What symmetry keeps', 'ما يحافظ عليه التماثل', 'Lo que conserva la simetría'),
    summary: 'longueurs, angles et aires sont conservés',
    steps: [
      { type: 'number', answer: len, tolerance: 1e-9, prompt: t(`Le segment [AB] mesure ${d3(len)} cm. Combien mesure son symétrique [A′B′] ?`, `Segment [AB] is ${d3(len)} cm. How long is its reflection [A′B′]?`, `طول القطعة [AB] هو ${d3(len)} cm. كم طول مماثلتها [A′B′]؟`, `[AB] mide ${d3(len)} cm. ¿Cuánto mide su simétrico [A′B′]?`), hint: t('La symétrie est un « pliage » : rien n’est étiré.', 'Symmetry is a “fold”: nothing is stretched.', 'التماثل «طي»: لا شيء يتمدد.', 'La simetría es un «pliegue»: nada se estira.') },
      { type: 'number', answer: ang, tolerance: 0, prompt: t(`L’angle ABC mesure ${ang}°. Combien mesure son symétrique A′B′C′ ?`, `Angle ABC is ${ang}°. What is its reflection A′B′C′?`, `قياس الزاوية ABC هو ${ang}°. كم قياس مماثلتها A′B′C′؟`, `El ángulo ABC mide ${ang}°. ¿Y su simétrico A′B′C′?`), hint: t('Les angles sont conservés.', 'Angles are kept.', 'الزوايا محفوظة.', 'Los ángulos se conservan.') },
      { type: 'choice', answer: 0, options: [t(`${area} cm² : la même aire`, `${area} cm²: the same area`, `${area} cm²: نفس المساحة`, `${area} cm²: la misma área`), t(`${area * 2} cm² : le double`, `${area * 2} cm²: double`, `${area * 2} cm²: الضعف`, `${area * 2} cm²: el doble`), t('on ne peut pas savoir', 'we cannot tell', 'لا يمكن المعرفة', 'no se puede saber')], prompt: t(`Une figure a une aire de ${area} cm². Son symétrique a…`, `A shape has an area of ${area} cm². Its reflection has…`, `مساحة شكل ${area} cm². مماثله له…`, `Una figura tiene ${area} cm². Su simétrica tiene…`), hint: t('Les deux figures se superposent exactement.', 'The two shapes match exactly.', 'الشكلان يتطابقان تمامًا.', 'Las dos figuras coinciden exactamente.') },
    ],
  };
}

// ═════════════ PÉRIMÈTRES, AIRES, VOLUMES ═════════════

/** Figure en L sur le quadrillage : un rectangle W×H privé du coin supérieur droit w×h. */
function lShape(rng: Rng) {
  const W = int(rng, 6, 9), H = int(rng, 4, 6), w = int(rng, 2, W - 3), h = int(rng, 1, H - 2);
  const pts: P[] = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H - h }, { x: W - w, y: H - h }, { x: W - w, y: H }, { x: 0, y: H }];
  const g: Grid = { minX: 0, maxX: 10, minY: 0, maxY: 7 };
  return { W, H, w, h, perimeter: 2 * (W + H), area: W * H - w * h, scene: polygonScene(pts, { grid: g }) };
}

function measPerimeter(seed: number): Activity {
  const rng = seeded(seed);
  const L = lShape(rng);
  const a = pick(rng, [12, 15, 23]), b = pick(rng, [7, 8, 9.5]);
  const km = pick(rng, [1.2, 2.5, 3.75]);
  return {
    title: t('Périmètres', 'Perimeters', 'المحيطات', 'Perímetros'),
    summary: `périmètre = longueur du tour · rectangle : 2 × (L + l) = ${d3(2 * (a + b))}`,
    steps: [
      { type: 'number', scene: L.scene, answer: L.perimeter, tolerance: 0, prompt: t('Un carreau mesure 1 cm. Quel est le périmètre de cette figure (en cm) ?', 'Each square is 1 cm. What is the perimeter of this shape (cm)?', 'طول ضلع المربع 1 cm. ما محيط هذا الشكل (cm)؟', 'Cada cuadro mide 1 cm. ¿Cuál es el perímetro de la figura (cm)?'), hint: t('Fais le tour en comptant les côtés des carreaux sur le bord.', 'Go round the edge counting square sides.', 'دُر حول الشكل وعُدّ أضلاع المربعات على الحافة.', 'Recorre el borde contando lados de cuadros.') },
      { type: 'number', answer: 2 * (a + b), tolerance: 1e-9, prompt: t(`Un rectangle mesure ${d3(a)} m sur ${d3(b)} m. Quel est son périmètre (en m) ?`, `A rectangle is ${d3(a)} m by ${d3(b)} m. What is its perimeter (m)?`, `مستطيل بعداه ${d3(a)} m و ${d3(b)} m. ما محيطه (m)؟`, `Un rectángulo mide ${d3(a)} m por ${d3(b)} m. ¿Su perímetro (m)?`), hint: t(`2 × (${d3(a)} + ${d3(b)})`, `2 × (${d3(a)} + ${d3(b)})`, `2 × (${d3(a)} + ${d3(b)})`, `2 × (${d3(a)} + ${d3(b)})`) },
      { type: 'number', answer: km * 1000, tolerance: 1e-9, prompt: t(`Le tour d’un parc mesure ${d3(km)} km. Combien de mètres ?`, `The path round a park is ${d3(km)} km. How many metres?`, `محيط حديقة ${d3(km)} km. كم مترًا؟`, `La vuelta a un parque mide ${d3(km)} km. ¿Cuántos metros?`), hint: t('1 km = 1 000 m.', '1 km = 1,000 m.', '1 km = 1000 m.', '1 km = 1000 m.') },
    ],
  };
}

function measArea(seed: number): Activity {
  const rng = seeded(seed);
  const L = lShape(rng);
  const a = pick(rng, [7, 8, 12]), b = pick(rng, [4, 5, 6]), base = pick(rng, [6, 8, 10]), height = pick(rng, [3, 5, 7]);
  return {
    title: t('Aires', 'Areas', 'المساحات', 'Áreas'),
    summary: `rectangle : L × l · triangle : base × hauteur ÷ 2 = ${d3((base * height) / 2)}`,
    steps: [
      { type: 'number', scene: L.scene, answer: L.area, tolerance: 0, prompt: t('Un carreau a une aire de 1 cm². Quelle est l’aire de cette figure (en cm²) ?', 'Each square is 1 cm². What is the area of this shape (cm²)?', 'مساحة المربع 1 cm². ما مساحة هذا الشكل (cm²)؟', 'Cada cuadro es 1 cm². ¿Cuál es el área (cm²)?'), hint: t(`Compte les carreaux, ou calcule le grand rectangle ${L.W} × ${L.H} moins le coin ${L.w} × ${L.h}.`, `Count squares, or big rectangle ${L.W} × ${L.H} minus corner ${L.w} × ${L.h}.`, `عُدّ المربعات أو احسب ${L.W} × ${L.H} ناقص ${L.w} × ${L.h}.`, `Cuenta o calcula ${L.W} × ${L.H} menos ${L.w} × ${L.h}.`) },
      { type: 'number', answer: a * b, tolerance: 0, prompt: t(`Aire d’un rectangle de ${a} cm sur ${b} cm (en cm²) ?`, `Area of a ${a} cm by ${b} cm rectangle (cm²)?`, `مساحة مستطيل بعداه ${a} cm و ${b} cm (cm²)؟`, `¿Área de un rectángulo de ${a} cm por ${b} cm (cm²)?`), hint: t('longueur × largeur', 'length × width', 'الطول × العرض', 'largo × ancho') },
      { type: 'number', answer: (base * height) / 2, tolerance: 1e-9, prompt: t(`Aire d’un triangle de base ${base} cm et de hauteur ${height} cm (en cm²) ?`, `Area of a triangle with base ${base} cm and height ${height} cm (cm²)?`, `مساحة مثلث قاعدته ${base} cm وارتفاعه ${height} cm (cm²)؟`, `¿Área de un triángulo de base ${base} cm y altura ${height} cm (cm²)?`), hint: t('Un triangle, c’est la moitié d’un rectangle : base × hauteur ÷ 2.', 'A triangle is half a rectangle: base × height ÷ 2.', 'المثلث نصف مستطيل: القاعدة × الارتفاع ÷ 2.', 'Un triángulo es medio rectángulo: base × altura ÷ 2.') },
      { type: 'choice', answer: 1, options: [same('cm'), same('cm²'), same('cm³')], prompt: t('Une aire s’exprime en…', 'An area is measured in…', 'تُقاس المساحة بـ…', 'Un área se mide en…'), hint: t('On compte des carrés : des centimètres carrés.', 'We count squares: square centimetres.', 'نعد مربعات: سنتيمترات مربعة.', 'Contamos cuadrados: centímetros cuadrados.') },
    ],
  };
}

function measCircle(seed: number): Activity {
  const rng = seeded(seed);
  const r = pick(rng, [2, 3, 4, 5, 10]), d = pick(rng, [6, 8, 12]);
  const scene: Scene = { points: { O: { x: 0, y: 0 }, M: { x: r, y: 0 } }, circle: { c: 'O', r }, segments: [{ id: 'OM', a: 'O', b: 'M', text: `${r} cm`, style: 'bold' }] };
  return {
    title: t('Le cercle et le disque', 'Circle and disc', 'الدائرة والقرص', 'Circunferencia y círculo'),
    summary: `périmètre = 2 × π × r ≈ ${d3(Math.round(2 * Math.PI * r * 10) / 10)} · aire = π × r² ≈ ${d3(Math.round(Math.PI * r * r * 10) / 10)}`,
    steps: [
      { type: 'number', answer: 2 * r, tolerance: 0, scene, prompt: t(`Le rayon de ce cercle est ${r} cm. Combien mesure son diamètre ?`, `This circle has radius ${r} cm. What is its diameter?`, `شعاع هذه الدائرة ${r} cm. كم قطرها؟`, `El radio mide ${r} cm. ¿Cuánto mide el diámetro?`), hint: t('diamètre = 2 × rayon', 'diameter = 2 × radius', 'القطر = 2 × الشعاع', 'diámetro = 2 × radio') },
      { type: 'number', answer: 2 * Math.PI * r, tolerance: 0.06, scene, prompt: t(`Calcule le périmètre de ce cercle de rayon ${r} cm, arrondi au dixième (prends π de la calculatrice).`, `Work out the circumference (radius ${r} cm), to 1 d.p.`, `احسب محيط هذه الدائرة (الشعاع ${r} cm) مقربًا إلى الجزء من عشرة.`, `Calcula la longitud (radio ${r} cm) a las décimas.`), hint: t(`2 × π × ${r}`, `2 × π × ${r}`, `2 × π × ${r}`, `2 × π × ${r}`) },
      { type: 'number', answer: Math.PI * (d / 2) ** 2, tolerance: 0.06, prompt: t(`Un disque a un diamètre de ${d} cm. Calcule son aire, arrondie au dixième (en cm²).`, `A disc has diameter ${d} cm. Work out its area to 1 d.p. (cm²).`, `قرص قطره ${d} cm. احسب مساحته مقربة إلى الجزء من عشرة (cm²).`, `Un círculo tiene ${d} cm de diámetro. Calcula su área a las décimas (cm²).`), hint: t(`Rayon = ${d / 2} cm, puis π × ${d / 2} × ${d / 2}.`, `Radius = ${d / 2} cm, then π × ${d / 2}².`, `الشعاع = ${d / 2} cm ثم π × ${d / 2}².`, `Radio = ${d / 2} cm; luego π × ${d / 2}².`) },
    ],
  };
}

function measVolume(seed: number): Activity {
  const rng = seeded(seed);
  const L = int(rng, 3, 8), l = int(rng, 2, 5), h = int(rng, 2, 6);
  const [aq1, aq2, aq3] = pick(rng, [[50, 30, 40], [60, 25, 30], [80, 35, 40]] as const);
  return {
    title: t('Volume d’un pavé droit', 'Volume of a cuboid', 'حجم متوازي المستطيلات', 'Volumen de un ortoedro'),
    summary: `volume = L × l × h · 1 dm³ = 1 L · aquarium : ${(aq1 * aq2 * aq3) / 1000} L`,
    steps: [
      { type: 'number', answer: L * l * h, tolerance: 0, prompt: t(`On remplit une boîte avec des cubes de 1 cm : ${L} cubes en longueur, ${l} en largeur, ${h} étages. Combien de cubes ?`, `A box is filled with 1 cm cubes: ${L} long, ${l} wide, ${h} layers. How many cubes?`, `نملأ علبة بمكعبات 1 cm: ${L} طولًا و ${l} عرضًا و ${h} طوابق. كم مكعبًا؟`, `Se llena una caja con cubos de 1 cm: ${L} de largo, ${l} de ancho, ${h} pisos. ¿Cuántos cubos?`), hint: t(`Un étage contient ${L} × ${l} cubes ; il y a ${h} étages.`, `One layer holds ${L} × ${l} cubes; there are ${h} layers.`, `الطابق يحوي ${L} × ${l} مكعبات وهناك ${h} طوابق.`, `Un piso tiene ${L} × ${l} cubos; hay ${h} pisos.`) },
      { type: 'choice', answer: 2, options: [same('cm'), same('cm²'), same('cm³')], prompt: t('Ce volume s’exprime en…', 'This volume is measured in…', 'يُقاس هذا الحجم بـ…', 'Este volumen se mide en…'), hint: t('On compte des cubes : des centimètres cubes.', 'We count cubes: cubic centimetres.', 'نعد مكعبات: سنتيمترات مكعبة.', 'Contamos cubos: centímetros cúbicos.') },
      { type: 'number', answer: (aq1 * aq2 * aq3) / 1000, tolerance: 1e-9, prompt: t(`Un aquarium mesure ${aq1} cm × ${aq2} cm × ${aq3} cm. Combien de litres d’eau contient-il, plein ?`, `A fish tank is ${aq1} × ${aq2} × ${aq3} cm. How many litres does it hold?`, `حوض أبعاده ${aq1} × ${aq2} × ${aq3} cm. كم لترًا يسع؟`, `Una pecera mide ${aq1} × ${aq2} × ${aq3} cm. ¿Cuántos litros cabe?`), hint: t(`${aq1} × ${aq2} × ${aq3} = ${aq1 * aq2 * aq3} cm³, et 1 L = 1 000 cm³.`, `${aq1 * aq2 * aq3} cm³, and 1 L = 1,000 cm³.`, `${aq1 * aq2 * aq3} cm³ و 1 L = 1000 cm³.`, `${aq1 * aq2 * aq3} cm³ y 1 L = 1000 cm³.`) },
    ],
  };
}

// ═════════════ Registre ═════════════

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const SIXIEME_SKILLS: Skill[] = [
  { id: 'dec-place-value', review: 2, chapter: 'decimals', build: decPlaceValue, title: s('La valeur des chiffres', 'Place value', 'قيمة الأرقام', 'Valor de las cifras'), desc: s('Unités, dixièmes, centièmes.', 'Units, tenths, hundredths.', 'الوحدات، الأعشار، الأجزاء من مائة.', 'Unidades, décimas, centésimas.') },
  { id: 'dec-compare', review: 0, chapter: 'decimals', build: decCompare, title: s('Comparer et ranger', 'Compare and order', 'المقارنة والترتيب', 'Comparar y ordenar'), desc: s('Le piège de 2,5 et 2,45.', 'The 2.5 vs 2.45 trap.', 'فخ 2,5 و 2,45.', 'La trampa de 2,5 y 2,45.') },
  { id: 'dec-numberline', review: 0, chapter: 'decimals', build: decNumberLine, title: s('Sur une droite graduée', 'On a number line', 'على مستقيم مدرج', 'En la recta numérica'), desc: s('Lire et placer des décimaux.', 'Read and place decimals.', 'قراءة الأعداد العشرية ووضعها.', 'Leer y colocar decimales.') },
  { id: 'dec-times-ten', review: 0, chapter: 'decimals', build: decTimes10, title: s('× et ÷ par 10, 100, 1 000', '× and ÷ by 10, 100, 1,000', '× و ÷ على 10 و 100 و 1000', '× y ÷ por 10, 100, 1000'), desc: s('Les chiffres changent de rang.', 'Digits change place.', 'الأرقام تغير رتبتها.', 'Las cifras cambian de lugar.') },
  { id: 'dec-division', review: 0, chapter: 'decimals', build: decDivision, title: s('Division euclidienne', 'Division with remainder', 'القسمة الإقليدية', 'División entera'), desc: s('Quotient, reste, problèmes.', 'Quotient, remainder, problems.', 'الخارج، الباقي، مسائل.', 'Cociente, resto, problemas.') },
  { id: 'prop-recognise', review: 2, chapter: 'proportion', build: propRecognise, title: s('Reconnaître', 'Recognise', 'التعرف', 'Reconocer'), desc: s('Tableau et coefficient.', 'Table and multiplier.', 'الجدول والمعامل.', 'Tabla y coeficiente.') },
  { id: 'prop-fourth', review: 1, chapter: 'proportion', build: propFourth, title: s('Quatrième proportionnelle', 'Missing value', 'رابع متناسب', 'Cuarta proporcional'), desc: s('Passer par l’unité.', 'Go through one unit.', 'المرور بالوحدة.', 'Pasar por la unidad.') },
  { id: 'prop-percent', review: 0, chapter: 'proportion', build: propPercent, title: s('Pourcentages', 'Percentages', 'النسب المئوية', 'Porcentajes'), desc: s('Calculer un pourcentage, une réduction.', 'A percentage, a discount.', 'حساب نسبة مئوية وتخفيض.', 'Un porcentaje, un descuento.') },
  { id: 'prop-scale', review: 0, chapter: 'proportion', build: propScale, title: s('Échelles', 'Scales', 'السلالم', 'Escalas'), desc: s('Plans et cartes.', 'Plans and maps.', 'التصاميم والخرائط.', 'Planos y mapas.') },
  { id: 'lines-notation', review: 0, chapter: 'lines', build: linesNotation, title: s('Droite, segment, demi-droite', 'Line, segment, ray', 'مستقيم، قطعة، نصف مستقيم', 'Recta, segmento, semirrecta'), desc: s('Les notations (AB), [AB], [AB).', 'Notations (AB), [AB], [AB).', 'الترميزات (AB) و [AB] و [AB).', 'Notaciones (AB), [AB], [AB).') },
  { id: 'lines-perp-parallel', review: 0, chapter: 'lines', build: linesPerpParallel, title: s('Perpendiculaires et parallèles', 'Perpendicular and parallel', 'المتعامدان والمتوازيان', 'Perpendiculares y paralelas'), desc: s('Reconnaître sur un quadrillage.', 'Spot them on a grid.', 'التعرف عليها في شبكة.', 'Reconocerlas en una cuadrícula.') },
  { id: 'angles-measure', review: 0, chapter: 'lines', build: anglesMeasure, title: s('Mesurer un angle', 'Measure an angle', 'قياس زاوية', 'Medir un ángulo'), desc: s('Lire un rapporteur.', 'Read a protractor.', 'قراءة المنقلة.', 'Leer un transportador.') },
  { id: 'angles-kinds', review: 0, chapter: 'lines', build: anglesKinds, title: s('Aigu, droit, obtus, plat', 'Acute, right, obtuse, straight', 'حادة، قائمة، منفرجة، مستقيمة', 'Agudo, recto, obtuso, llano'), desc: s('Nommer un angle.', 'Name an angle.', 'تسمية زاوية.', 'Nombrar un ángulo.') },
  { id: 'sym-axes', review: 0, chapter: 'symmetry', build: symAxes, title: s('Axes de symétrie', 'Lines of symmetry', 'محاور التماثل', 'Ejes de simetría'), desc: s('Carré, rectangle, losange, triangles.', 'Square, rectangle, rhombus, triangles.', 'المربع والمستطيل والمعين والمثلثات.', 'Cuadrado, rectángulo, rombo, triángulos.') },
  { id: 'sym-axial', review: 0, chapter: 'symmetry', build: symAxial, title: s('Symétrique d’un point', 'Reflect a point', 'مماثل نقطة', 'Simétrico de un punto'), desc: s('Sur le quadrillage, par rapport à un axe.', 'On the grid, in an axis.', 'على الشبكة بالنسبة لمحور.', 'En la cuadrícula, respecto a un eje.') },
  { id: 'sym-central', review: 0, chapter: 'symmetry', build: symCentral, title: s('Symétrie centrale', 'Point symmetry', 'التماثل المركزي', 'Simetría central'), desc: s('Pour les programmes qui la voient en 6e (Maroc, Côte d’Ivoire).', 'For curricula that teach it in Grade 6.', 'للبرامج التي تدرسه في السنة الأولى إعدادي.', 'Para los programas que la estudian en 6.º.') },
  { id: 'sym-properties', review: 0, chapter: 'symmetry', build: symProperties, title: s('Ce que conserve la symétrie', 'What symmetry keeps', 'ما يحافظ عليه التماثل', 'Lo que conserva la simetría'), desc: s('Longueurs, angles, aires.', 'Lengths, angles, areas.', 'الأطوال، الزوايا، المساحات.', 'Longitudes, ángulos, áreas.') },
  { id: 'meas-perimeter', review: 1, chapter: 'measures', build: measPerimeter, title: s('Périmètres', 'Perimeters', 'المحيطات', 'Perímetros'), desc: s('Sur quadrillage, rectangle, conversions.', 'On a grid, rectangles, conversions.', 'على الشبكة، المستطيل، التحويلات.', 'En cuadrícula, rectángulo, conversiones.') },
  { id: 'meas-area', review: 1, chapter: 'measures', build: measArea, title: s('Aires', 'Areas', 'المساحات', 'Áreas'), desc: s('Compter, rectangle, triangle.', 'Count, rectangle, triangle.', 'العد، المستطيل، المثلث.', 'Contar, rectángulo, triángulo.') },
  { id: 'meas-circle', review: 0, chapter: 'measures', build: measCircle, title: s('Cercle et disque', 'Circle and disc', 'الدائرة والقرص', 'Circunferencia y círculo'), desc: s('Diamètre, périmètre, aire.', 'Diameter, circumference, area.', 'القطر، المحيط، المساحة.', 'Diámetro, longitud, área.') },
  { id: 'meas-volume', review: 0, chapter: 'measures', build: measVolume, title: s('Volume du pavé droit', 'Volume of a cuboid', 'حجم متوازي المستطيلات', 'Volumen del ortoedro'), desc: s('Compter des cubes, litres.', 'Count cubes, litres.', 'عد المكعبات، اللترات.', 'Contar cubos, litros.') },
];
