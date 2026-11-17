// Parcours de 6e (suite) : nombres relatifs (Maroc 1AC, Côte d'Ivoire 6e, CCSS 6.NS.C) et organisation
// et gestion de données (France, cycle 3). Fonctions pures et déterministes, corrigées par le serveur
// comme les autres parcours (src/lib/skill-session.ts). Couvert par src/test/skills.test.tsx.
import { seeded } from './exercises';
import { pick, t, type Activity, type Grid, type P, type Rng, type Scene, type Skill, type Table } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
/** Relatif écrit avec un vrai signe moins et une virgule : −2,5. */
const rel = (v: number) => (v < 0 ? '−' : '') + String(Math.round(Math.abs(v) * 100) / 100).replace('.', ',');
/** Entre parenthèses s'il est négatif, pour l'écrire dans une opération : (−4) + 7. */
const par = (v: number) => (v < 0 ? `(${rel(v)})` : rel(v));
const SIGNS = [same('<'), same('='), same('>')];

// ═════════════ NOMBRES RELATIFS ═════════════

/** Droite graduée de −5 à 5, un trait par unité. */
function relLine(extra: Record<string, P> = {}): Scene & { grid: Grid } {
  const xs = Array.from({ length: 11 }, (_, i) => i - 5);
  return {
    grid: { minX: -5, maxX: 5, minY: 0, maxY: 0 },
    points: { ...Object.fromEntries(xs.flatMap(x => [[`t${x}a`, { x, y: x % 5 ? 0.22 : 0.4 }], [`t${x}b`, { x, y: x % 5 ? -0.22 : -0.4 }]])), L0: { x: -5.4, y: 0 }, L1: { x: 5.4, y: 0 }, ...extra },
    hidden: [...xs.flatMap(x => [`t${x}a`, `t${x}b`]), 'L0', 'L1'],
    segments: [{ id: 'axe', a: 'L0', b: 'L1', style: 'bold' }, ...xs.map(x => ({ id: `t${x}`, a: `t${x}a`, b: `t${x}b` }))],
    labels: [{ at: { x: -5, y: -1 }, text: '−5' }, { at: { x: 0, y: -1 }, text: '0' }, { at: { x: 5, y: -1 }, text: '5' }],
  };
}
/** Zoom entre deux entiers, partagé en dixièmes (positions 0 à 10). */
function zoomLine(from: string, to: string, extra: Record<string, P>): Scene {
  const xs = Array.from({ length: 11 }, (_, i) => i);
  return {
    points: { ...Object.fromEntries(xs.flatMap(i => [[`z${i}a`, { x: i, y: i % 10 ? 0.25 : 0.45 }], [`z${i}b`, { x: i, y: i % 10 ? -0.25 : -0.45 }]])), L0: { x: -0.3, y: 0 }, L1: { x: 10.3, y: 0 }, ...extra },
    hidden: [...xs.flatMap(i => [`z${i}a`, `z${i}b`]), 'L0', 'L1'],
    segments: [{ id: 'axe', a: 'L0', b: 'L1', style: 'bold' }, ...xs.map(i => ({ id: `z${i}`, a: `z${i}a`, b: `z${i}b` }))],
    labels: [{ at: { x: 0, y: -1.1 }, text: from }, { at: { x: 10, y: -1.1 }, text: to }],
  };
}

function relNumberLine(seed: number): Activity {
  const rng = seeded(seed);
  const k = pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]), m = pick(rng, [-4, -3, -2, -1].filter(v => v !== k));
  const n = pick(rng, [-4, -3, -2]), j = int(rng, 1, 9);
  return {
    title: t('Les relatifs sur une droite graduée', 'Negative numbers on a number line', 'الأعداد النسبية على مستقيم مدرج', 'Los enteros en la recta numérica'),
    summary: `A = ${rel(k)} · B = ${rel(m)} · C = ${rel(n + j / 10)} : à gauche de 0, les nombres négatifs`,
    steps: [
      { type: 'number', scene: relLine({ A: { x: k, y: 0 } }), answer: k, tolerance: 0, prompt: t('Quel nombre repère le point A ?', 'Which number is at point A?', 'ما العدد الذي يمثله النقطة A؟', '¿Qué número marca el punto A?'), hint: t('Compte les traits depuis 0 : à gauche de 0, les nombres sont négatifs (on écrit le signe −).', 'Count marks from 0: to the left of 0, numbers are negative (write the − sign).', 'عُدّ التدريجات انطلاقًا من 0: على يسار 0 الأعداد سالبة (نكتب الإشارة −).', 'Cuenta desde 0: a la izquierda los números son negativos (se escribe −).') },
      { type: 'grid', scene: relLine(), label: 'B', start: { x: 0, y: 0 }, answer: { x: m, y: 0 }, prompt: t(`Place le point B d’abscisse ${rel(m)}.`, `Place point B at ${rel(m)}.`, `ضع النقطة B ذات الأفصول ${rel(m)}.`, `Coloca el punto B en ${rel(m)}.`), hint: t(`${rel(m)} est à ${-m} unités à gauche de 0.`, `${rel(m)} is ${-m} units to the left of 0.`, `${rel(m)} على بعد ${-m} وحدات يسار 0.`, `${rel(m)} está ${-m} unidades a la izquierda de 0.`) },
      { type: 'number', scene: zoomLine(rel(n), rel(n + 1), { C: { x: j, y: 0 } }), answer: n + j / 10, tolerance: 1e-9, prompt: t(`Zoom entre ${rel(n)} et ${rel(n + 1)}, partagé en dixièmes. Quel nombre repère C ?`, `Zoomed in between ${rel(n)} and ${rel(n + 1)}, split into tenths. Which number is at C?`, `تكبير بين ${rel(n)} و ${rel(n + 1)} مقسم إلى أعشار. ما العدد الذي يمثله C؟`, `Ampliamos entre ${rel(n)} y ${rel(n + 1)} en décimas. ¿Qué número marca C?`), hint: t(`On part de ${rel(n)} et on avance vers la droite de ${j} dixièmes : on se rapproche de 0, donc C = ${rel(n)} + ${j} dixièmes.`, `Start at ${rel(n)} and move ${j} tenths right, towards 0.`, `ننطلق من ${rel(n)} ونتقدم ${j} أعشار نحو اليمين، أي نحو 0.`, `Desde ${rel(n)}, avanza ${j} décimas hacia la derecha, hacia 0.`) },
    ],
  };
}

function relCompare(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 2, 6), b = int(rng, 1, 6);
  const pairs = shuffle(rng, [[-a, b], [-(a + 3), -a], [-2.5, -2.05]]).slice(0, 2);
  const list = shuffle(rng, [-int(rng, 5, 8), int(rng, 1, 4), -1.5, 0, -int(rng, 2, 4)]);
  const uniq = [...new Set(list)];
  const sorted = [...uniq].sort((x, y) => x - y);
  const o = int(rng, 3, 9), d = int(rng, 4, 12);
  return {
    title: t('Comparer des relatifs', 'Comparing signed numbers', 'مقارنة الأعداد النسبية', 'Comparar números enteros'),
    summary: `${sorted.map(rel).join(' < ')} · opposé de −${o} : ${o}`,
    steps: [
      ...pairs.map(([x, y]) => ({ type: 'choice' as const, options: SIGNS, answer: x! < y! ? 0 : x === y ? 1 : 2, prompt: t(`Compare : ${rel(x!)} … ${rel(y!)}`, `Compare: ${rel(x!)} … ${rel(y!)}`, `قارن: ${rel(x!)} … ${rel(y!)}`, `Compara: ${rel(x!)} … ${rel(y!)}`), hint: t('Sur la droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est celui qui est le plus loin de 0.', 'On the number line, the smaller one is further left. Between two negatives, the smaller is further from 0.', 'على المستقيم المدرج الأصغر هو الأبعد إلى اليسار. بين سالبين، الأصغر هو الأبعد عن 0.', 'En la recta, el menor está más a la izquierda. Entre dos negativos, el menor está más lejos de 0.') })),
      { type: 'chips', ordered: true, tokens: uniq.map(rel), groups: [sorted.map(rel)], prompt: t('Range ces nombres du plus petit au plus grand.', 'Order these numbers from smallest to largest.', 'رتّب هذه الأعداد من الأصغر إلى الأكبر.', 'Ordena estos números de menor a mayor.'), hint: t('Les négatifs d’abord (du plus loin de 0 au plus proche), puis 0, puis les positifs.', 'Negatives first (furthest from 0 first), then 0, then positives.', 'السالبة أولًا (من الأبعد عن 0 إلى الأقرب) ثم 0 ثم الموجبة.', 'Primero los negativos (del más lejano a 0), luego 0 y los positivos.') },
      { type: 'number', answer: o, tolerance: 0, prompt: t(`Quel est l’opposé de −${o} ?`, `What is the opposite of −${o}?`, `ما مقابل −${o}؟`, `¿Cuál es el opuesto de −${o}?`), hint: t('L’opposé est à la même distance de 0, de l’autre côté.', 'The opposite is the same distance from 0, on the other side.', 'المقابل على نفس البعد من 0 في الجهة الأخرى.', 'El opuesto está a la misma distancia de 0, al otro lado.') },
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Quelle est la distance entre −${d} et 0 ?`, `What is the distance between −${d} and 0?`, `ما المسافة بين −${d} و 0؟`, `¿Cuál es la distancia entre −${d} y 0?`), hint: t('Une distance est toujours positive : on compte les unités jusqu’à 0.', 'A distance is always positive: count the units to 0.', 'المسافة دائمًا موجبة: نعد الوحدات إلى 0.', 'Una distancia siempre es positiva: cuenta las unidades hasta 0.') },
    ],
  };
}

function relCoordinates(seed: number): Activity {
  const rng = seeded(seed);
  const g: Grid = { minX: -5, maxX: 5, minY: -5, maxY: 5, axes: true };
  const nz = () => pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4]);
  const A = { x: nz(), y: nz() };
  let B = { x: nz(), y: nz() };
  while (Math.sign(B.x) === Math.sign(A.x) && Math.sign(B.y) === Math.sign(A.y)) B = { x: -B.x, y: B.y };
  const scene: Scene & { grid: Grid } = { grid: g, points: { A }, segments: [] };
  return {
    title: t('Se repérer dans le plan', 'Coordinates in four quadrants', 'المعلم في المستوى', 'Coordenadas en el plano'),
    summary: `A(${rel(A.x)} ; ${rel(A.y)}) · B(${rel(B.x)} ; ${rel(B.y)}) : abscisse d’abord, ordonnée ensuite`,
    steps: [
      { type: 'number', scene, answer: A.x, tolerance: 0, prompt: t('Quelle est l’abscisse du point A ?', 'What is the x-coordinate of A?', 'ما أفصول النقطة A؟', '¿Cuál es la abscisa de A?'), hint: t('L’abscisse se lit sur l’axe horizontal, à la verticale de A.', 'Read the x-coordinate on the horizontal axis, straight below or above A.', 'يُقرأ الأفصول على المحور الأفقي عموديًا على A.', 'La abscisa se lee en el eje horizontal.') },
      { type: 'number', scene, answer: A.y, tolerance: 0, prompt: t('Et son ordonnée ?', 'And its y-coordinate?', 'وما أرتوبها؟', '¿Y su ordenada?'), hint: t('L’ordonnée se lit sur l’axe vertical ; en dessous de l’axe horizontal, elle est négative.', 'Read it on the vertical axis; below the horizontal axis it is negative.', 'يُقرأ الأرتوب على المحور العمودي؛ تحت المحور الأفقي يكون سالبًا.', 'Se lee en el eje vertical; por debajo del horizontal es negativa.') },
      { type: 'grid', scene: { grid: g, points: {}, segments: [] }, label: 'B', start: { x: 0, y: 0 }, answer: B, prompt: t(`Place le point B(${rel(B.x)} ; ${rel(B.y)}).`, `Place point B(${rel(B.x)} ; ${rel(B.y)}).`, `ضع النقطة B(${rel(B.x)} ; ${rel(B.y)}).`, `Coloca el punto B(${rel(B.x)} ; ${rel(B.y)}).`), hint: t('Depuis l’origine : d’abord horizontalement (abscisse), puis verticalement (ordonnée). Négatif : vers la gauche ou vers le bas.', 'From the origin: across first (x), then up or down (y). Negative: left or down.', 'من الأصل: أفقيًا أولًا ثم عموديًا. السالب: نحو اليسار أو الأسفل.', 'Desde el origen: primero en horizontal, luego en vertical. Negativo: izquierda o abajo.') },
    ],
  };
}

function relAddSub(seed: number): Activity {
  const rng = seeded(seed);
  const t0 = -int(rng, 2, 6), up = int(rng, t0 * -1 + 1, 12);
  const t1 = int(rng, 1, 4), down = int(rng, t1 + 2, 9);
  const a = -int(rng, 2, 8), b = -int(rng, 2, 8), c = int(rng, 2, 6), dd = c + int(rng, 2, 6);
  return {
    title: t('Additionner et soustraire des relatifs', 'Adding and subtracting signed numbers', 'جمع وطرح الأعداد النسبية', 'Sumar y restar enteros'),
    summary: `${par(t0)} + ${up} = ${rel(t0 + up)} · ${par(a)} + ${par(b)} = ${rel(a + b)} · ${c} − ${dd} = ${rel(c - dd)}`,
    steps: [
      { type: 'number', answer: t0 + up, tolerance: 0, prompt: t(`Il fait ${rel(t0)} °C le matin. La température monte de ${up} °C. Quelle température fait-il ensuite ?`, `It is ${rel(t0)} °C in the morning. It rises by ${up} °C. What is the temperature then?`, `الحرارة ${rel(t0)} °C صباحًا. ترتفع بـ ${up} °C. كم تصبح؟`, `Hace ${rel(t0)} °C por la mañana. Sube ${up} °C. ¿Qué temperatura hace después?`), hint: t(`Sur la droite graduée, pars de ${rel(t0)} et avance de ${up} vers la droite : ${-t0} pour arriver à 0, puis le reste.`, `From ${rel(t0)}, move ${up} to the right: ${-t0} to reach 0, then the rest.`, `من ${rel(t0)} تقدم ${up} نحو اليمين.`, `Desde ${rel(t0)}, avanza ${up} a la derecha.`) },
      { type: 'number', answer: t1 - down, tolerance: 0, prompt: t(`Il fait ${t1} °C. La température baisse de ${down} °C. Quelle température fait-il ensuite ?`, `It is ${t1} °C. It drops by ${down} °C. What is the temperature then?`, `الحرارة ${t1} °C. تنخفض بـ ${down} °C. كم تصبح؟`, `Hace ${t1} °C. Baja ${down} °C. ¿Qué temperatura hace?`), hint: t(`On descend de ${t1} jusqu’à 0, puis encore ${down - t1} en dessous de 0.`, `Go down ${t1} to 0, then ${down - t1} more below 0.`, `ننزل ${t1} إلى 0 ثم ${down - t1} تحت الصفر.`, `Baja ${t1} hasta 0 y ${down - t1} más.`) },
      { type: 'number', answer: a + b, tolerance: 0, prompt: t(`Calcule ${par(a)} + ${par(b)}.`, `Work out ${par(a)} + ${par(b)}.`, `احسب ${par(a)} + ${par(b)}.`, `Calcula ${par(a)} + ${par(b)}.`), hint: t('Deux dettes s’ajoutent : même signe, on additionne les distances à zéro et on garde le signe −.', 'Two debts add up: same sign, add the distances from zero and keep the − sign.', 'دينان يُجمعان: نفس الإشارة، نجمع المسافتين عن الصفر ونحتفظ بالإشارة −.', 'Dos deudas se suman: mismo signo, se suman las distancias y se mantiene −.') },
      { type: 'number', answer: c - dd, tolerance: 0, prompt: t(`Calcule ${c} − ${dd}.`, `Work out ${c} − ${dd}.`, `احسب ${c} − ${dd}.`, `Calcula ${c} − ${dd}.`), hint: t(`On enlève plus qu’on n’a : le résultat est négatif. ${dd} − ${c} = ${dd - c}, donc ${c} − ${dd} = −${dd - c}.`, `Taking away more than you have: the result is negative.`, `نطرح أكثر مما لدينا: النتيجة سالبة.`, `Se quita más de lo que hay: el resultado es negativo.`) },
    ],
  };
}

// ═════════════ ORGANISATION ET GESTION DE DONNÉES ═════════════

const DAYS: [string, string, string, string][] = [['Lundi', 'Monday', 'الإثنين', 'Lunes'], ['Mardi', 'Tuesday', 'الثلاثاء', 'Martes'], ['Mercredi', 'Wednesday', 'الأربعاء', 'Miércoles'], ['Jeudi', 'Thursday', 'الخميس', 'Jueves'], ['Vendredi', 'Friday', 'الجمعة', 'Viernes']];
const SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve'];
const day = (i: number) => t(...DAYS[i]!);

const barX = (i: number) => 2 * i + 2;
/** Diagramme en barres : une barre par jour (x = 1 à 5), quadrillage gradué de 0 à 10. */
function barChart(values: (number | null)[]): Scene & { grid: Grid } {
  return {
    // Barres espacées de 2 : le diagramme est plus large que haut et tient sur un écran de téléphone.
    grid: { minX: 0, maxX: 12, minY: 0, maxY: 10 },
    points: { O: { x: 0, y: 0 }, X: { x: 12, y: 0 }, Y: { x: 0, y: 10 } },
    hidden: ['O', 'X', 'Y'],
    segments: [{ id: 'ox', a: 'O', b: 'X' }, { id: 'oy', a: 'O', b: 'Y' }],
    rects: values.flatMap((v, i) => (v === null ? [] : [{ x: barX(i) - 0.6, y: 0, w: 1.2, h: v }])),
    labels: [...SHORT.map((s, i) => ({ at: { x: barX(i), y: -0.8 }, text: s })), ...[2, 4, 6, 8, 10].map(v => ({ at: { x: -0.7, y: v }, text: String(v) }))],
  };
}

function dataTable(seed: number): Activity {
  const rng = seeded(seed);
  // Pictogrammes dans le tableau (une case ne se traduit pas), noms complets dans les questions.
  const icons = ['⚽', '🏀', '💃'];
  const sports = [t('⚽ Football', '⚽ Football', '⚽ كرة القدم', '⚽ Fútbol'), t('🏀 Basket', '🏀 Basketball', '🏀 كرة السلة', '🏀 Baloncesto'), t('💃 Danse', '💃 Dance', '💃 الرقص', '💃 Danza')];
  let A: number[], B: number[], totals: number[];
  do { A = sports.map(() => int(rng, 3, 12)); B = sports.map(() => int(rng, 3, 12)); totals = A.map((v, i) => v + B[i]!); } while (new Set(totals).size < 3);
  const best = totals.indexOf(Math.max(...totals));
  const table: Table = { head: [t('Sport', 'Sport', 'الرياضة', 'Deporte'), same('6e A'), same('6e B')], rows: [icons, A.map(String), B.map(String)] };
  const k = int(rng, 0, 2);
  return {
    title: t('Lire un tableau à double entrée', 'Reading a two-way table', 'قراءة جدول مزدوج المدخل', 'Leer una tabla de doble entrada'),
    summary: `ligne × colonne → une case · total 6e A = ${A.reduce((x, y) => x + y, 0)}`,
    steps: [
      { type: 'number', table, answer: B[k]!, tolerance: 0, prompt: t(`Combien d’élèves de 6e B font ce sport : ${sports[k]!.fr} ?`, `How many 6e B pupils do this sport: ${sports[k]!.en}?`, `كم تلميذًا من 6e B يمارس هذه الرياضة: ${sports[k]!.ar}؟`, `¿Cuántos alumnos de 6e B hacen este deporte: ${sports[k]!.es}?`), hint: t('Cherche la colonne du sport et la ligne de la classe : la réponse est à leur croisement.', 'Find the sport’s column and the class’s row: the answer is where they meet.', 'ابحث عن عمود الرياضة وسطر القسم: الجواب في تقاطعهما.', 'Busca la columna del deporte y la fila de la clase.') },
      { type: 'number', table, answer: A.reduce((x, y) => x + y, 0), tolerance: 0, prompt: t('Combien d’élèves de 6e A ont répondu en tout ?', 'How many 6e A pupils answered in total?', 'كم تلميذًا من 6e A أجاب في المجموع؟', '¿Cuántos alumnos de 6e A respondieron en total?'), hint: t('Additionne toutes les cases de la ligne 6e A.', 'Add every cell of the 6e A row.', 'اجمع كل خانات سطر 6e A.', 'Suma todas las casillas de la fila 6e A.') },
      { type: 'choice', table, options: sports, answer: best, prompt: t('Quel sport est le plus pratiqué par les deux classes réunies ?', 'Which sport is most popular across both classes?', 'ما الرياضة الأكثر ممارسة في القسمين معًا؟', '¿Qué deporte es el más practicado en las dos clases?'), hint: t('Pour chaque sport, additionne les deux classes, puis compare.', 'For each sport, add both classes, then compare.', 'لكل رياضة، اجمع القسمين ثم قارن.', 'Para cada deporte, suma las dos clases y compara.') },
    ],
  };
}

function dataBars(seed: number): Activity {
  const rng = seeded(seed);
  let values: number[];
  do { values = DAYS.map(() => int(rng, 1, 9)); } while (new Set(values).size < 4 || values.filter(v => v === Math.max(...values)).length > 1);
  const k = int(rng, 0, 4), best = values.indexOf(Math.max(...values));
  const scene = barChart(values);
  return {
    title: t('Lire un diagramme en barres', 'Reading a bar chart', 'قراءة مخطط بالأعمدة', 'Leer un diagrama de barras'),
    summary: DAYS.map((d, i) => `${d[0]} : ${values[i]}`).join(' · '),
    steps: [
      { type: 'number', scene, answer: values[k]!, tolerance: 0, prompt: t(`Ce diagramme montre le nombre de livres empruntés au CDI chaque jour. Combien le ${DAYS[k]![0].toLowerCase()} ?`, `This chart shows books borrowed from the library each day. How many on ${DAYS[k]![1]}?`, `يبين هذا المخطط عدد الكتب المستعارة كل يوم. كم يوم ${DAYS[k]![2]}؟`, `El diagrama muestra los libros prestados cada día. ¿Cuántos el ${DAYS[k]![3].toLowerCase()}?`), hint: t('Suis le haut de la barre horizontalement jusqu’à l’axe gradué.', 'Follow the top of the bar across to the scale.', 'تتبع أعلى العمود أفقيًا حتى المحور المدرج.', 'Sigue la parte alta de la barra hasta la escala.') },
      { type: 'choice', scene, options: DAYS.map((_, i) => day(i)), answer: best, prompt: t('Quel jour a-t-on emprunté le plus de livres ?', 'On which day were the most books borrowed?', 'في أي يوم استُعير أكبر عدد من الكتب؟', '¿Qué día se prestaron más libros?'), hint: t('C’est la barre la plus haute.', 'It is the tallest bar.', 'إنه العمود الأعلى.', 'Es la barra más alta.') },
      { type: 'number', scene, answer: Math.max(...values) - Math.min(...values), tolerance: 0, prompt: t('Quelle différence y a-t-il entre la plus haute et la plus basse barre ?', 'What is the difference between the tallest and the shortest bar?', 'ما الفرق بين أعلى عمود وأدناه؟', '¿Qué diferencia hay entre la barra más alta y la más baja?'), hint: t('Lis les deux valeurs, puis soustrais.', 'Read both values, then subtract.', 'اقرأ القيمتين ثم اطرح.', 'Lee los dos valores y resta.') },
    ],
  };
}

function dataLine(seed: number): Activity {
  const rng = seeded(seed);
  const hours = [8, 10, 12, 14, 16, 18];
  let temps: number[];
  do { const peak = int(rng, 2, 4); temps = hours.map((_, i) => 12 - Math.abs(i - peak) * int(rng, 1, 3) + (i === peak ? 1 : 0)); } while (temps.some(v => v < 1 || v > 13) || temps.filter(v => v === Math.max(...temps)).length > 1);
  const g: Grid = { minX: 0, maxX: 12, minY: 0, maxY: 14 };
  const pts = temps.map((v, i) => ({ x: 2 * i + 1, y: v }));
  const scene: Scene & { grid: Grid } = {
    grid: g,
    points: { O: { x: 0, y: 0 }, X: { x: 12, y: 0 }, Y: { x: 0, y: 14 }, ...Object.fromEntries(pts.map((p, i) => [`h${i}`, p])) },
    hidden: ['O', 'X', 'Y', ...pts.map((_, i) => `h${i}`)],
    segments: [{ id: 'ox', a: 'O', b: 'X' }, { id: 'oy', a: 'O', b: 'Y' }],
    curves: [pts],
    labels: [...hours.map((h, i) => ({ at: { x: 2 * i + 1, y: -0.9 }, text: `${h} h` })), ...[2, 4, 6, 8, 10, 12, 14].map(v => ({ at: { x: -0.7, y: v }, text: String(v) }))],
  };
  const k = int(rng, 0, 5), hot = temps.indexOf(Math.max(...temps));
  return {
    title: t('Lire un graphique', 'Reading a line graph', 'قراءة تمثيل مبياني', 'Leer una gráfica'),
    summary: hours.map((h, i) => `${h} h : ${temps[i]} °C`).join(' · '),
    steps: [
      { type: 'number', scene, answer: temps[k]!, tolerance: 0, prompt: t(`Ce graphique montre la température (en °C) au cours d’une journée. Quelle température fait-il à ${hours[k]} h ?`, `This graph shows the temperature (°C) during a day. What is it at ${hours[k]}:00?`, `يبين هذا التمثيل درجة الحرارة (°C) خلال يوم. كم هي على الساعة ${hours[k]}؟`, `La gráfica muestra la temperatura (°C) durante un día. ¿Cuánto marca a las ${hours[k]} h?`), hint: t(`Monte depuis « ${hours[k]} h » jusqu’à la courbe, puis lis sur l’axe vertical.`, `Go up from ${hours[k]}:00 to the curve, then read the vertical axis.`, `اصعد من الساعة ${hours[k]} إلى المنحنى ثم اقرأ على المحور العمودي.`, `Sube desde las ${hours[k]} h hasta la curva y lee en el eje vertical.`) },
      { type: 'choice', scene, options: hours.map(h => same(`${h} h`)), answer: hot, prompt: t('À quelle heure fait-il le plus chaud ?', 'At what time is it hottest?', 'في أي ساعة تكون الحرارة أعلى؟', '¿A qué hora hace más calor?'), hint: t('C’est le point le plus haut de la courbe.', 'It is the highest point of the curve.', 'إنها أعلى نقطة في المنحنى.', 'Es el punto más alto de la curva.') },
      { type: 'number', scene, answer: temps[hot]! - temps[0]!, tolerance: 0, prompt: t(`De combien de degrés la température a-t-elle augmenté entre 8 h et ${hours[hot]} h ?`, `By how many degrees did it rise between 8:00 and ${hours[hot]}:00?`, `بكم درجة ارتفعت الحرارة بين الساعة 8 والساعة ${hours[hot]}؟`, `¿Cuántos grados subió entre las 8 h y las ${hours[hot]} h?`), hint: t('Lis les deux températures, puis soustrais.', 'Read both temperatures, then subtract.', 'اقرأ الدرجتين ثم اطرح.', 'Lee las dos temperaturas y resta.') },
    ],
  };
}

function dataBuild(seed: number): Activity {
  const rng = seeded(seed);
  const values = DAYS.map(() => int(rng, 2, 9));
  const k = int(rng, 0, 4);
  const line = t('un graphique en courbe', 'a line graph', 'تمثيل بمنحنى', 'una gráfica de líneas');
  const options = shuffle(rng, [line, t('un diagramme en barres', 'a bar chart', 'مخطط بالأعمدة', 'un diagrama de barras'), t('un tableau à double entrée', 'a two-way table', 'جدول مزدوج المدخل', 'una tabla de doble entrada')]);
  return {
    title: t('Compléter un diagramme', 'Completing a chart', 'إتمام مخطط', 'Completar un diagrama'),
    summary: `barre du ${DAYS[k]![0].toLowerCase()} : hauteur ${values[k]}`,
    steps: [
      { type: 'grid', scene: barChart(values.map((v, i) => (i === k ? null : v))), label: '', heightOnly: true, start: { x: barX(k), y: 0 }, answer: { x: barX(k), y: values[k]! }, prompt: t(`Le ${DAYS[k]![0].toLowerCase()}, ${values[k]} livres ont été empruntés. Place le haut de la barre manquante.`, `On ${DAYS[k]![1]}, ${values[k]} books were borrowed. Place the top of the missing bar.`, `يوم ${DAYS[k]![2]} استُعير ${values[k]} كتب. ضع أعلى العمود الناقص.`, `El ${DAYS[k]![3].toLowerCase()} se prestaron ${values[k]} libros. Coloca la parte alta de la barra que falta.`), hint: t('Monte le point au-dessus du bon jour jusqu’à la graduation qui correspond au nombre de livres.', 'Move the point above the right day up to the matching number.', 'ارفع النقطة فوق اليوم المناسب حتى التدريجة المناسبة.', 'Sube el punto sobre el día correcto hasta el número.') },
      { type: 'choice', options, answer: options.indexOf(line), prompt: t('Pour montrer comment la température évolue heure par heure dans la journée, on choisit plutôt…', 'To show how the temperature changes hour by hour, it is best to use…', 'لإظهار تطور درجة الحرارة ساعة بساعة، نختار…', 'Para mostrar cómo cambia la temperatura hora a hora, se elige…'), hint: t('Une évolution dans le temps se lit mieux sur une courbe ; des catégories à comparer, sur des barres.', 'Change over time reads best as a line; categories to compare, as bars.', 'التطور عبر الزمن يُقرأ أفضل بمنحنى؛ ومقارنة الفئات بالأعمدة.', 'Una evolución en el tiempo se lee mejor en una curva.') },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const RELATIVE_DATA_SKILLS: Skill[] = [
  { id: 'rel-numberline', review: 0, chapter: 'relatives', build: relNumberLine, title: s('Sur une droite graduée', 'On a number line', 'على مستقيم مدرج', 'En la recta numérica'), desc: s('Lire et placer des nombres négatifs.', 'Read and place negative numbers.', 'قراءة الأعداد السالبة ووضعها.', 'Leer y colocar números negativos.') },
  { id: 'rel-compare', review: 3, chapter: 'relatives', build: relCompare, title: s('Comparer et ranger', 'Compare and order', 'المقارنة والترتيب', 'Comparar y ordenar'), desc: s('Opposé, distance à zéro.', 'Opposite, distance from zero.', 'المقابل، المسافة عن الصفر.', 'Opuesto, distancia a cero.') },
  { id: 'rel-coordinates', review: 2, chapter: 'relatives', build: relCoordinates, title: s('Se repérer dans le plan', 'Coordinates', 'المعلم في المستوى', 'Coordenadas'), desc: s('Les quatre quarts du repère.', 'All four quadrants.', 'الأرباع الأربعة للمعلم.', 'Los cuatro cuadrantes.') },
  { id: 'rel-add-sub', review: 2, chapter: 'relatives', build: relAddSub, title: s('Additionner et soustraire', 'Add and subtract', 'الجمع والطرح', 'Sumar y restar'), desc: s('Températures et calculs.', 'Temperatures and sums.', 'درجات الحرارة والحساب.', 'Temperaturas y cálculos.') },
  { id: 'data-table', review: 0, chapter: 'data', build: dataTable, title: s('Tableau à double entrée', 'Two-way table', 'جدول مزدوج المدخل', 'Tabla de doble entrada'), desc: s('Lire une case, un total.', 'Read a cell, a total.', 'قراءة خانة ومجموع.', 'Leer una casilla, un total.') },
  { id: 'data-bars', review: 0, chapter: 'data', build: dataBars, title: s('Diagramme en barres', 'Bar chart', 'مخطط بالأعمدة', 'Diagrama de barras'), desc: s('Lire et comparer des barres.', 'Read and compare bars.', 'قراءة الأعمدة ومقارنتها.', 'Leer y comparar barras.') },
  { id: 'data-line', review: 0, chapter: 'data', build: dataLine, title: s('Graphique en courbe', 'Line graph', 'تمثيل بمنحنى', 'Gráfica de líneas'), desc: s('Lire une évolution.', 'Read a change over time.', 'قراءة تطور.', 'Leer una evolución.') },
  { id: 'data-build', review: 1, chapter: 'data', build: dataBuild, title: s('Compléter un diagramme', 'Complete a chart', 'إتمام مخطط', 'Completar un diagrama'), desc: s('Placer une barre, choisir un graphique.', 'Place a bar, choose a graph.', 'وضع عمود واختيار تمثيل.', 'Colocar una barra, elegir una gráfica.') },
];
