// Parcours de compétences : vecteurs, fonctions affines, statistiques (3e / 3e année collège).
// Même démarche que la géométrie : manipuler (placer un point, régler une droite, égaliser des colonnes),
// puis lire, calculer et conclure. Fonctions pures et déterministes : couvert par src/test/skills.test.tsx.
import type { L } from './curriculum';
import { seeded } from './exercises';
import { fmt, pick, t, vec, type Activity, type Grid, type P, type Rng, type Scene, type Skill, type Step, type Table } from './skill-kit';

const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
/** Vecteur : ⟦AB⟧, dessiné avec sa flèche. */
const V = vec;
const same = (s: string) => t(s, s, s, s);
const coord = (p: P) => `(${fmt(p.x)} ; ${fmt(p.y)})`;
const add = (p: P, q: P): P => ({ x: p.x + q.x, y: p.y + q.y });
const sub = (p: P, q: P): P => ({ x: p.x - q.x, y: p.y - q.y });

// ═════════════ VECTEURS ═════════════

const W = 11, H = 7; // quadrillage des vecteurs, sans axes
const plain: Grid = { minX: 0, maxX: W, minY: 0, maxY: H };
const axes: Grid = { minX: -4, maxX: 6, minY: -3, maxY: 5, axes: true };
const arrow = (id: string, a: string, b: string) => ({ id, a, b, style: 'vector' as const });
const SMALL: P[] = [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: -1 }, { x: -1, y: 2 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: -2, y: 1 }, { x: 1, y: -2 }];
/** Une origine pour que le vecteur v tienne dans la bande [x0 ; x1] du quadrillage. */
function origin(rng: Rng, v: P, x0: number, x1: number, g: Grid = plain): P {
  const xs: number[] = [], ys: number[] = [];
  for (let x = x0; x <= x1; x++) if (x + v.x >= x0 && x + v.x <= x1) xs.push(x);
  for (let y = g.minY; y <= g.maxY; y++) if (y + v.y >= g.minY && y + v.y <= g.maxY) ys.push(y);
  return { x: pick(rng, xs), y: pick(rng, ys) };
}

function vecCharacterise(seed: number): Activity {
  const rng = seeded(seed);
  const u = pick(rng, SMALL);
  const cases = shuffle(rng, [
    { w: u, answer: 0 }, { w: { x: -u.x, y: -u.y }, answer: 1 }, { w: { x: 2 * u.x, y: 2 * u.y }, answer: 2 }, { w: { x: -u.y, y: u.x }, answer: 3 },
  ]);
  const options = [
    t('égaux', 'equal', 'متساويتان', 'iguales'),
    t('même direction, sens contraires', 'same direction, opposite senses', 'نفس الاتجاه، منحيان متعاكسان', 'misma dirección, sentidos contrarios'),
    t('même direction, même sens, longueurs différentes', 'same direction and sense, different lengths', 'نفس الاتجاه ونفس المنحى، طولان مختلفان', 'misma dirección y sentido, longitudes distintas'),
    t('directions différentes', 'different directions', 'اتجاهان مختلفان', 'direcciones distintas'),
  ];
  const steps: Step[] = cases.map(c => {
    const A = origin(rng, u, 0, 5), C = origin(rng, c.w, 6, W);
    const scene: Scene = { grid: plain, points: { A, B: add(A, u), C, D: add(C, c.w) }, segments: [arrow('AB', 'A', 'B'), arrow('CD', 'C', 'D')] };
    return {
      type: 'choice', scene, options, answer: c.answer,
      prompt: t(`Compare ${V('AB')} et ${V('CD')} : direction, sens, longueur. Ces vecteurs sont…`, `Compare ${V('AB')} and ${V('CD')}: direction, sense, length. These vectors are…`, `قارن ${V('AB')} و ${V('CD')}: الاتجاه والمنحى والطول. هاتان المتجهتان…`, `Compara ${V('AB')} y ${V('CD')}: dirección, sentido, longitud. Estos vectores son…`),
      hint: t('Même direction : flèches parallèles. Même sens : elles vont du même côté. Compte les carreaux pour la longueur.', 'Same direction: parallel arrows. Same sense: they point the same way. Count squares for the length.', 'نفس الاتجاه: سهمان متوازيان. نفس المنحى: يتجهان إلى نفس الجهة. عُدّ المربعات للطول.', 'Misma dirección: flechas paralelas. Mismo sentido: apuntan al mismo lado. Cuenta cuadros para la longitud.'),
    };
  });
  return { title: t('Direction, sens et longueur', 'Direction, sense and length', 'الاتجاه والمنحى والطول', 'Dirección, sentido y longitud'), steps, summary: 'égaux ⇔ même direction, même sens, même longueur' };
}

function vecTranslation(seed: number): Activity {
  const rng = seeded(seed);
  const u = pick(rng, SMALL);
  const A = origin(rng, u, 0, 4);
  const M = origin(rng, u, 5, W);
  let N = origin(rng, u, 5, W);
  for (let k = 0; k < 20 && Math.abs(N.x - M.x) + Math.abs(N.y - M.y) < 2; k++) N = origin(rng, u, 5, W);
  const base = (extra: Record<string, P>): Scene & { grid: Grid } => ({ grid: plain, points: { A, B: add(A, u), ...extra }, segments: [arrow('AB', 'A', 'B')] });
  const place = (name: string, from: P): Step => ({
    type: 'grid', scene: base({ [name]: from }), label: `${name}'`, start: from, answer: add(from, u),
    prompt: t(`Place ${name}', l’image de ${name} par la translation de vecteur ${V('AB')}.`, `Place ${name}', the image of ${name} under the translation by ${V('AB')}.`, `ضع ${name}'، صورة ${name} بالإزاحة ذات المتجهة ${V('AB')}.`, `Coloca ${name}', la imagen de ${name} por la traslación de vector ${V('AB')}.`),
    hint: t(`Depuis ${name}, refais le même trajet que de A à B : ${u.x >= 0 ? u.x + ' à droite' : -u.x + ' à gauche'}, ${u.y >= 0 ? u.y + ' en haut' : -u.y + ' en bas'}.`, `From ${name}, repeat the trip from A to B: ${u.x >= 0 ? u.x + ' right' : -u.x + ' left'}, ${u.y >= 0 ? u.y + ' up' : -u.y + ' down'}.`, `انطلاقًا من ${name}، أعد نفس المسار من A إلى B.`, `Desde ${name}, repite el trayecto de A a B.`),
  });
  return {
    title: t('Translation', 'Translation', 'الإزاحة', 'Traslación'),
    summary: `${V("MM'")} = ${V('AB')}`,
    steps: [
      place('M', M), place('N', N),
      {
        type: 'choice', scene: { grid: plain, points: { A, B: add(A, u), M, "M'": add(M, u) }, segments: [arrow('AB', 'A', 'B'), arrow("MM'", 'M', "M'")] }, answer: 0,
        options: [same(V("MM'")), same(V("M'M")), same(V('AM'))],
        prompt: t(`M' est l’image de M par la translation de vecteur ${V('AB')}. Quel vecteur est égal à ${V('AB')} ?`, `M' is the image of M under the translation by ${V('AB')}. Which vector equals ${V('AB')}?`, `M' صورة M بالإزاحة ذات المتجهة ${V('AB')}. ما المتجهة التي تساوي ${V('AB')}؟`, `M' es la imagen de M por la traslación de vector ${V('AB')}. ¿Qué vector es igual a ${V('AB')}?`),
        hint: t('Le vecteur va du point de départ vers son image, dans le même sens que de A vers B.', 'The vector goes from the point to its image, the same way as from A to B.', 'المتجهة تنطلق من النقطة نحو صورتها، بنفس منحى A نحو B.', 'El vector va del punto a su imagen, en el mismo sentido que de A a B.'),
      },
    ],
  };
}

function vecCoordinates(seed: number): Activity {
  const rng = seeded(seed);
  let A: P, B: P;
  do { A = { x: int(rng, -3, 2), y: int(rng, -2, 2) }; B = { x: int(rng, -3, 5), y: int(rng, -2, 4) }; } while ((A.x === B.x && A.y === B.y) || A.x === B.x || A.y === B.y);
  const d = sub(B, A);
  const w = pick(rng, SMALL.filter(v => A.x + v.x >= axes.minX && A.x + v.x <= axes.maxX && A.y + v.y >= axes.minY && A.y + v.y <= axes.maxY));
  const scene: Scene & { grid: Grid } = { grid: axes, points: { A, B }, segments: [arrow('AB', 'A', 'B')] };
  const read = t('Lis les coordonnées sur les axes, puis calcule l’arrivée moins le départ.', 'Read the coordinates on the axes, then do end minus start.', 'اقرأ الإحداثيات على المحورين ثم احسب الوصول ناقص الانطلاق.', 'Lee las coordenadas en los ejes y calcula llegada menos salida.');
  return {
    title: t('Coordonnées d’un vecteur', 'Coordinates of a vector', 'إحداثيتا متجهة', 'Coordenadas de un vector'),
    summary: `${V('AB')} (x_B − x_A ; y_B − y_A) = (${fmt(d.x)} ; ${fmt(d.y)})`,
    steps: [
      { type: 'number', scene, answer: d.x, tolerance: 0, hint: t(`x_B − x_A = ${fmt(B.x)} − (${fmt(A.x)})`, `x_B − x_A = ${fmt(B.x)} − (${fmt(A.x)})`, `x_B − x_A = ${fmt(B.x)} − (${fmt(A.x)})`, `x_B − x_A = ${fmt(B.x)} − (${fmt(A.x)})`), prompt: t(`Quelle est l’abscisse du vecteur ${V('AB')} ?`, `What is the x-coordinate of ${V('AB')}?`, `ما أفصول المتجهة ${V('AB')}؟`, `¿Cuál es la abscisa del vector ${V('AB')}?`) },
      { type: 'number', scene, answer: d.y, tolerance: 0, hint: read, prompt: t(`Et son ordonnée ?`, `And its y-coordinate?`, `وما أرتوبها؟`, `¿Y su ordenada?`) },
      {
        type: 'grid', scene: { grid: axes, points: { A }, segments: [] }, label: 'C', start: A, answer: add(A, w),
        prompt: t(`Place le point C tel que ${V('AC')} (${fmt(w.x)} ; ${fmt(w.y)}).`, `Place C so that ${V('AC')} (${fmt(w.x)} ; ${fmt(w.y)}).`, `ضع النقطة C بحيث ${V('AC')} (${fmt(w.x)} ; ${fmt(w.y)}).`, `Coloca C tal que ${V('AC')} (${fmt(w.x)} ; ${fmt(w.y)}).`),
        hint: t('Depuis A : la 1re coordonnée se lit horizontalement, la 2de verticalement.', 'From A: the 1st coordinate goes across, the 2nd up or down.', 'انطلاقًا من A: الإحداثية الأولى أفقيًا والثانية عموديًا.', 'Desde A: la 1.ª coordenada en horizontal, la 2.ª en vertical.'),
      },
    ],
  };
}

function vecSum(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T']] as const);
  const [a, b, c] = n;
  const tokens = shuffle(rng, [V(a + b), V(b + c), V(a + c), V(c + a), V(b + a), '+', '=']);
  let A: P, B: P, C: P;
  do { A = { x: int(rng, 0, 3), y: int(rng, 0, 2) }; B = { x: A.x + int(rng, 2, 4), y: A.y + int(rng, -1, 1) }; C = { x: A.x + int(rng, 0, 2), y: A.y + int(rng, 2, 3) }; } while (B.x + C.x - A.x > W || B.y + C.y - A.y > H || B.y < 0);
  const D = add(B, sub(C, A));
  return {
    title: t('Somme de vecteurs', 'Adding vectors', 'مجموع متجهتين', 'Suma de vectores'),
    summary: `${V(a + b)} + ${V(b + c)} = ${V(a + c)} · ${V('AB')} + ${V('AC')} = ${V('AD')} (ABDC parallélogramme)`,
    steps: [
      {
        type: 'chips', tokens, groups: [[V(a + b), V(b + c)], [V(a + c)]],
        prompt: t(`Écris la relation de Chasles avec ${V(a + b)} et ${V(b + c)}.`, `Write Chasles’ relation with ${V(a + b)} and ${V(b + c)}.`, `اكتب علاقة شال باستعمال ${V(a + b)} و ${V(b + c)}.`, `Escribe la relación de Chasles con ${V(a + b)} y ${V(b + c)}.`),
        hint: t('On va de la première lettre à la dernière en passant par le point commun.', 'Go from the first letter to the last through the shared point.', 'ننتقل من الحرف الأول إلى الأخير مرورًا بالنقطة المشتركة.', 'Se va de la primera letra a la última pasando por el punto común.'),
      },
      {
        type: 'choice', options: [same(V('AC')), same(V('CA')), same(V('BD'))], answer: 0,
        prompt: t(`${V('AB')} + ${V('BC')} = ?`, `${V('AB')} + ${V('BC')} = ?`, `${V('AB')} + ${V('BC')} = ?`, `${V('AB')} + ${V('BC')} = ?`),
        hint: t('Le point d’arrivée du premier est le départ du second.', 'The first one ends where the second starts.', 'نقطة وصول الأولى هي نقطة انطلاق الثانية.', 'El primero termina donde empieza el segundo.'),
      },
      {
        type: 'grid', scene: { grid: plain, points: { A, B, C }, segments: [arrow('AB', 'A', 'B'), arrow('AC', 'A', 'C')] }, label: 'D', start: A, answer: D,
        prompt: t(`Place D tel que ${V('AD')} = ${V('AB')} + ${V('AC')}.`, `Place D so that ${V('AD')} = ${V('AB')} + ${V('AC')}.`, `ضع D بحيث ${V('AD')} = ${V('AB')} + ${V('AC')}.`, `Coloca D tal que ${V('AD')} = ${V('AB')} + ${V('AC')}.`),
        hint: t(`Depuis A, fais le trajet de ${V('AB')}, puis celui de ${V('AC')}.`, `From A, follow ${V('AB')}, then ${V('AC')}.`, `انطلاقًا من A، اتبع ${V('AB')} ثم ${V('AC')}.`, `Desde A, sigue ${V('AB')} y luego ${V('AC')}.`),
      },
      {
        type: 'choice', scene: { grid: plain, points: { A, B, C, D }, segments: [arrow('AB', 'A', 'B'), arrow('AC', 'A', 'C'), arrow('AD', 'A', 'D'), { id: 'BD', a: 'B', b: 'D', style: 'dashed' }, { id: 'CD', a: 'C', b: 'D', style: 'dashed' }] }, answer: 0,
        options: [t('un parallélogramme', 'a parallelogram', 'متوازي أضلاع', 'un paralelogramo'), t('un triangle', 'a triangle', 'مثلث', 'un triángulo'), t('un trapèze quelconque', 'just a trapezium', 'شبه منحرف', 'un trapecio cualquiera')],
        prompt: t('Le quadrilatère ABDC est…', 'Quadrilateral ABDC is…', 'الرباعي ABDC هو…', 'El cuadrilátero ABDC es…'),
        hint: t(`${V('CD')} = ${V('AB')} : ses côtés opposés sont parallèles et de même longueur.`, `${V('CD')} = ${V('AB')}: opposite sides are parallel and equal.`, `${V('CD')} = ${V('AB')}: أضلاعه المتقابلة متوازية ومتقايسة.`, `${V('CD')} = ${V('AB')}: lados opuestos paralelos e iguales.`),
      },
    ],
  };
}

function vecMidpoint(seed: number): Activity {
  const rng = seeded(seed);
  let A: P, B: P;
  do { A = { x: int(rng, -4, 1), y: int(rng, -3, 1) }; B = { x: int(rng, 0, 6), y: int(rng, 0, 5) }; } while ((A.x + B.x) % 2 || (A.y + B.y) % 2 || (A.x === B.x && A.y === B.y));
  const I = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const dist = Math.hypot(B.x - A.x, B.y - A.y);
  const pts = `A${coord(A)} et B${coord(B)}`;
  return {
    title: t('Milieu et distance', 'Midpoint and distance', 'المنتصف والمسافة', 'Punto medio y distancia'),
    summary: `I((x_A + x_B)/2 ; (y_A + y_B)/2) = ${coord(I)} · AB = √((x_B − x_A)² + (y_B − y_A)²) ≈ ${fmt(Math.round(dist * 10) / 10)}`,
    steps: [
      { type: 'grid', scene: { grid: axes, points: { A, B }, segments: [{ id: 'AB', a: 'A', b: 'B' }] }, label: 'I', start: A, answer: I, prompt: t('Place I, le milieu de [AB].', 'Place I, the midpoint of [AB].', 'ضع I منتصف [AB].', 'Coloca I, el punto medio de [AB].'), hint: t('Fais la moitié du trajet de A à B, horizontalement puis verticalement.', 'Go half way from A to B, across then up or down.', 'اقطع نصف المسافة من A إلى B أفقيًا ثم عموديًا.', 'Recorre la mitad del camino de A a B.') },
      { type: 'number', answer: I.x, tolerance: 0, prompt: t(`${pts}. Avec la formule, calcule l’abscisse de I : (x_A + x_B) ÷ 2.`, `${pts}. With the formula, work out x_I = (x_A + x_B) ÷ 2.`, `${pts}. احسب أفصول I: (x_A + x_B) ÷ 2.`, `${pts}. Con la fórmula, calcula x_I = (x_A + x_B) ÷ 2.`), hint: t(`(${fmt(A.x)} + ${fmt(B.x)}) ÷ 2`, `(${fmt(A.x)} + ${fmt(B.x)}) ÷ 2`, `(${fmt(A.x)} + ${fmt(B.x)}) ÷ 2`, `(${fmt(A.x)} + ${fmt(B.x)}) ÷ 2`) },
      { type: 'number', answer: I.y, tolerance: 0, prompt: t(`Et l’ordonnée de I ?`, `And y_I?`, `وأرتوب I؟`, `¿Y la ordenada de I?`), hint: t(`(${fmt(A.y)} + ${fmt(B.y)}) ÷ 2`, `(${fmt(A.y)} + ${fmt(B.y)}) ÷ 2`, `(${fmt(A.y)} + ${fmt(B.y)}) ÷ 2`, `(${fmt(A.y)} + ${fmt(B.y)}) ÷ 2`) },
      { type: 'number', answer: dist, tolerance: 0.06, prompt: t(`${pts}. Calcule la distance AB, arrondie au dixième.`, `${pts}. Work out AB to one decimal place.`, `${pts}. احسب المسافة AB مقربة إلى الجزء من عشرة.`, `${pts}. Calcula la distancia AB redondeada a las décimas.`), hint: t(`AB = √((${fmt(B.x)} − (${fmt(A.x)}))² + (${fmt(B.y)} − (${fmt(A.y)}))²) : c’est Pythagore sur le quadrillage.`, `AB = √((x_B − x_A)² + (y_B − y_A)²): Pythagoras on the grid.`, `AB = √((x_B − x_A)² + (y_B − y_A)²): فيثاغورس على الشبكة.`, `AB = √((x_B − x_A)² + (y_B − y_A)²): Pitágoras en la cuadrícula.`) },
    ],
  };
}

// ═════════════ FONCTIONS AFFINES ═════════════

export const fx = (a: number, b: number) => {
  const ax = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '−x' : `${fmt(a).replace('-', '−')}x`;
  if (!ax) return fmt(b).replace('-', '−');
  return b === 0 ? ax : `${ax} ${b > 0 ? '+' : '−'} ${fmt(Math.abs(b))}`;
};
const KINDS = [
  t('linéaire (donc aussi affine)', 'linear (so also affine)', 'خطية (وبالتالي تآلفية)', 'lineal (luego también afín)'),
  t('affine, mais pas linéaire', 'affine but not linear', 'تآلفية وليست خطية', 'afín pero no lineal'),
  t('ni affine, ni linéaire', 'neither affine nor linear', 'ليست تآلفية ولا خطية', 'ni afín ni lineal'),
];
const kindHint = t('Affine : f(x) = ax + b. Linéaire : le cas b = 0, f(x) = ax. Un x² ou un x au dénominateur : ni l’une ni l’autre.', 'Affine: f(x) = ax + b. Linear: the case b = 0, f(x) = ax. An x² or x in a denominator: neither.', 'تآلفية: f(x) = ax + b. خطية: حالة b = 0. وجود x² أو x في المقام: ليست أيًّا منهما.', 'Afín: f(x) = ax + b. Lineal: b = 0. Con x² o x en el denominador: ninguna.');

function affineRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const linear = pick(rng, ['3x', '−0,5x', 'x ÷ 4', '−2x']);
  const affine = pick(rng, ['2x + 3', '5 − x', '−3x + 1', '0,5x − 2']);
  const constant = pick(rng, ['7', '−2']);
  const neither = pick(rng, ['x²', '1 ÷ x', '3x² + 1', 'x² − x']);
  const cases = shuffle(rng, [{ e: linear, k: 0 }, { e: affine, k: 1 }, { e: constant, k: 1 }, { e: neither, k: 2 }]);
  const a = pick(rng, [-3, -2, 2, 4]), b = pick(rng, [-5, -1, 3, 6]);
  return {
    title: t('Reconnaître une fonction affine', 'Recognising an affine function', 'التعرف على دالة تآلفية', 'Reconocer una función afín'),
    summary: 'affine : f(x) = ax + b · linéaire : b = 0 · constante : a = 0',
    steps: [
      ...cases.map(c => ({ type: 'choice' as const, options: KINDS, answer: c.k, hint: c.e === constant ? t('Une constante, c’est ax + b avec a = 0.', 'A constant is ax + b with a = 0.', 'الدالة الثابتة هي ax + b مع a = 0.', 'Una constante es ax + b con a = 0.') : kindHint, prompt: t(`f(x) = ${c.e}. La fonction f est…`, `f(x) = ${c.e}. The function f is…`, `f(x) = ${c.e}. الدالة f…`, `f(x) = ${c.e}. La función f es…`) })),
      { type: 'number', answer: a, tolerance: 0, prompt: t(`g(x) = ${fx(a, b)}. Quel est le coefficient a ?`, `g(x) = ${fx(a, b)}. What is the coefficient a?`, `g(x) = ${fx(a, b)}. ما المعامل a؟`, `g(x) = ${fx(a, b)}. ¿Cuál es el coeficiente a?`), hint: t('a est le nombre qui multiplie x, avec son signe.', 'a multiplies x, sign included.', 'a هو العدد الذي يضرب x مع إشارته.', 'a multiplica a x, con su signo.') },
      { type: 'number', answer: b, tolerance: 0, prompt: t(`Et le nombre b ?`, `And b?`, `والعدد b؟`, `¿Y b?`), hint: t('b est le nombre ajouté (ou soustrait : alors il est négatif).', 'b is the number added (or subtracted: then it is negative).', 'b هو العدد المضاف (أو المطروح فيكون سالبًا).', 'b es el número sumado (o restado: entonces es negativo).') },
    ],
  };
}

function affineImage(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [-3, -2, 2, 3, 4]), b = pick(rng, [-5, -3, 1, 2, 7]);
  const x1 = int(rng, 2, 6), x2 = -int(rng, 1, 4), sol = pick(rng, [-2, 3, 5, 6]);
  const c = a * sol + b;
  const f = `f(x) = ${fx(a, b)}`;
  return {
    title: t('Image et antécédent', 'Image and preimage', 'الصورة والسابق', 'Imagen y antecedente'),
    summary: `f(${x1}) = ${fmt(a * x1 + b)} · f(x) = ${fmt(c)} ⇔ x = ${sol}`,
    steps: [
      { type: 'number', answer: a * x1 + b, tolerance: 0, prompt: t(`${f}. Calcule l’image de ${x1}.`, `${f}. Work out the image of ${x1}.`, `${f}. احسب صورة ${x1}.`, `${f}. Calcula la imagen de ${x1}.`), hint: t(`Remplace x par ${x1} : ${fmt(a)} × ${x1} + (${fmt(b)}).`, `Replace x with ${x1}: ${fmt(a)} × ${x1} + (${fmt(b)}).`, `عوّض x بـ ${x1}.`, `Sustituye x por ${x1}.`) },
      { type: 'number', answer: a * x2 + b, tolerance: 0, prompt: t(`${f}. Calcule f(${x2}).`, `${f}. Work out f(${x2}).`, `${f}. احسب f(${x2}).`, `${f}. Calcula f(${x2}).`), hint: t(`${fmt(a)} × (${x2}) + (${fmt(b)}) : attention aux signes.`, `${fmt(a)} × (${x2}) + (${fmt(b)}): watch the signs.`, `${fmt(a)} × (${x2}) + (${fmt(b)}): انتبه للإشارات.`, `${fmt(a)} × (${x2}) + (${fmt(b)}): cuidado con los signos.`) },
      { type: 'number', answer: sol, tolerance: 0, prompt: t(`${f}. Trouve l’antécédent de ${fmt(c)} : résous ${fx(a, b)} = ${fmt(c)}.`, `${f}. Find the preimage of ${fmt(c)}: solve ${fx(a, b)} = ${fmt(c)}.`, `${f}. أوجد سابق ${fmt(c)}: حل ${fx(a, b)} = ${fmt(c)}.`, `${f}. Halla el antecedente de ${fmt(c)}: resuelve ${fx(a, b)} = ${fmt(c)}.`), hint: t(`Enlève b des deux côtés, puis divise par a : x = (${fmt(c)} − (${fmt(b)})) ÷ ${fmt(a)}.`, `Take b off both sides, then divide by a.`, `اطرح b من الطرفين ثم اقسم على a.`, `Resta b en ambos lados y divide por a.`) },
      { type: 'choice', answer: 1, options: [t('l’image de 3', 'the image of 3', 'صورة 3', 'la imagen de 3'), t('un antécédent de 3', 'a preimage of 3', 'سابق للعدد 3', 'un antecedente de 3')], prompt: t('Si f(x) = 3, alors x est…', 'If f(x) = 3, then x is…', 'إذا كان f(x) = 3 فإن x…', 'Si f(x) = 3, entonces x es…'), hint: t('On part de x pour arriver à son image f(x) ; on remonte de l’image à l’antécédent.', 'x goes to its image f(x); going back from the image gives the preimage.', 'ننتقل من x إلى صورته f(x)، ونرجع من الصورة إلى السابق.', 'De x se llega a su imagen f(x); al volver se obtiene el antecedente.') },
    ],
  };
}

const graphGrid: Grid = { minX: -5, maxX: 5, minY: -5, maxY: 5, axes: true };
/** Extrémités de la droite y = ax + b dans le quadrillage. */
export function clipLine(a: number, b: number, g: Grid): [P, P] {
  const pts: P[] = [];
  for (const x of [g.minX, g.maxX]) { const y = a * x + b; if (y >= g.minY - 1e-9 && y <= g.maxY + 1e-9) pts.push({ x, y }); }
  if (a !== 0) for (const y of [g.minY, g.maxY]) { const x = (y - b) / a; if (x > g.minX + 1e-9 && x < g.maxX - 1e-9) pts.push({ x, y }); }
  pts.sort((p, q) => p.x - q.x);
  return [pts[0]!, pts[pts.length - 1]!];
}
/** Deux points à coordonnées entières de la droite y = ax + b, dans le quadrillage. */
function linePoints(a: number, b: number, g: Grid): [P, P] {
  const xs: number[] = [];
  for (let x = g.minX + 1; x < g.maxX; x++) { const y = a * x + b; if (Number.isInteger(y) && y > g.minY && y < g.maxY && x !== 0) xs.push(x); }
  return [{ x: xs[0]!, y: a * xs[0]! + b }, { x: xs[xs.length - 1]!, y: a * xs[xs.length - 1]! + b }];
}

function affineGraph(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [-2, -1, -0.5, 0.5, 1, 2]), b = pick(rng, [-3, -2, -1, 1, 2, 3]);
  const [A, B] = linePoints(a, b, graphGrid);
  const a2 = pick(rng, [-2, -1, 1, 2, 3].filter(v => v !== a)), b2 = pick(rng, [-3, -1, 0, 2, 4].filter(v => v !== b));
  const [E1, E2] = clipLine(a2, b2, graphGrid);
  const scene: Scene = { grid: graphGrid, points: { P: E1, Q: E2 }, hidden: ['P', 'Q'], segments: [{ id: 'd', a: 'P', b: 'Q', style: 'bold' }] };
  return {
    title: t('Représenter une fonction affine', 'Graphing an affine function', 'تمثيل دالة تآلفية', 'Representar una función afín'),
    summary: `f(x) = ax + b : droite, b = ordonnée à l’origine, a = coefficient directeur · ici ${fx(a2, b2)}`,
    steps: [
      { type: 'widget', widget: { kind: 'line', a, b, A, B }, prompt: t(`Règle a et b pour que la droite d’équation y = ax + b passe par A${coord(A)} et B${coord(B)}.`, `Set a and b so that the line y = ax + b goes through A${coord(A)} and B${coord(B)}.`, `اضبط a و b ليمر المستقيم y = ax + b من A${coord(A)} و B${coord(B)}.`, `Ajusta a y b para que la recta y = ax + b pase por A${coord(A)} y B${coord(B)}.`), hint: t('b fait monter ou descendre la droite ; a la fait tourner (plus ou moins pentue).', 'b moves the line up or down; a turns it (steeper or flatter).', 'b يرفع المستقيم أو يخفضه؛ a يديره.', 'b sube o baja la recta; a la gira.') },
      { type: 'choice', answer: 0, options: [t('l’ordonnée du point où la droite coupe l’axe des ordonnées', 'the y-value where the line crosses the y-axis', 'أرتوب نقطة تقاطع المستقيم مع محور الأراتيب', 'la ordenada donde la recta corta el eje y'), t('la pente de la droite', 'the slope of the line', 'ميل المستقيم', 'la pendiente de la recta'), t('l’abscisse où la droite coupe l’axe des abscisses', 'the x-value where it crosses the x-axis', 'أفصول نقطة التقاطع مع محور الأفاصيل', 'la abscisa donde corta el eje x')], prompt: t('Qu’as-tu remarqué : b est…', 'What did you notice: b is…', 'ماذا لاحظت: b هو…', '¿Qué notaste? b es…'), hint: t('Pour x = 0, y = a × 0 + b = b.', 'For x = 0, y = a × 0 + b = b.', 'من أجل x = 0 يكون y = b.', 'Para x = 0, y = b.') },
      { type: 'choice', answer: 0, options: [t('quand x augmente de 1, y change de a', 'when x goes up by 1, y changes by a', 'عندما يزداد x بـ 1 يتغير y بـ a', 'cuando x aumenta 1, y cambia en a'), t('a est l’ordonnée à l’origine', 'a is the y-intercept', 'a هو الأرتوب عند الأصل', 'a es la ordenada en el origen'), t('a ne change rien à la droite', 'a does not change the line', 'a لا يغيّر المستقيم', 'a no cambia la recta')], prompt: t('Et a ?', 'And a?', 'وماذا عن a؟', '¿Y a?'), hint: t('Avance d’un carreau vers la droite : de combien monte (ou descend) la droite ?', 'Move one square right: how much does the line go up (or down)?', 'تقدّم مربعًا نحو اليمين: بكم يرتفع المستقيم أو ينخفض؟', 'Avanza un cuadro a la derecha: ¿cuánto sube o baja?') },
      { type: 'number', scene, answer: b2, tolerance: 0, prompt: t('Cette droite représente f(x) = ax + b. Lis b sur le graphique.', 'This line represents f(x) = ax + b. Read b on the graph.', 'هذا المستقيم يمثل f(x) = ax + b. اقرأ b على المبيان.', 'Esta recta representa f(x) = ax + b. Lee b en la gráfica.'), hint: t('Regarde où la droite coupe l’axe vertical.', 'Look where it crosses the vertical axis.', 'انظر أين يقطع المستقيم المحور العمودي.', 'Mira dónde corta el eje vertical.') },
      { type: 'number', scene, answer: a2, tolerance: 0, prompt: t('Lis maintenant a.', 'Now read a.', 'اقرأ الآن a.', 'Ahora lee a.'), hint: t('Depuis le point (0 ; b), avance de 1 vers la droite et compte combien la droite monte (positif) ou descend (négatif).', 'From (0 ; b), go 1 right and count how much it rises (positive) or falls (negative).', 'من النقطة (0 ; b) تقدّم 1 نحو اليمين وعُدّ الارتفاع أو الانخفاض.', 'Desde (0 ; b), avanza 1 a la derecha y cuenta cuánto sube o baja.') },
    ],
  };
}

function affineTwoPoints(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [-3, -2, -0.5, 1.5, 2, 4]), b = pick(rng, [-4, -1, 2, 5].filter(v => v !== a));
  const x1 = pick(rng, [-2, 0, 2]), x2 = x1 + pick(rng, [2, 4, 6]);
  const y1 = a * x1 + b, y2 = a * x2 + b;
  const choices = shuffle(rng, [{ e: fx(a, b), ok: true }, { e: fx(b, a), ok: false }, { e: fx(a, -b), ok: false }]);
  const given = `f(${x1}) = ${fmt(y1)} et f(${x2}) = ${fmt(y2)}`;
  return {
    title: t('Trouver f avec deux points', 'Finding f from two points', 'إيجاد f انطلاقًا من نقطتين', 'Hallar f con dos puntos'),
    summary: `a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁) = ${fmt(a)} · b = f(x₁) − a × x₁ = ${fmt(b)}`,
    steps: [
      { type: 'number', answer: a, tolerance: 0, prompt: t(`f est affine et ${given}. Calcule a = (f(${x2}) − f(${x1})) ÷ (${x2} − ${x1}).`, `f is affine with ${given.replace(' et ', ' and ')}. Work out a = (f(${x2}) − f(${x1})) ÷ (${x2} − ${x1}).`, `f تآلفية و ${given.replace(' et ', ' و ')}. احسب a.`, `f es afín y ${given.replace(' et ', ' y ')}. Calcula a.`), hint: t(`(${fmt(y2)} − (${fmt(y1)})) ÷ ${x2 - x1}`, `(${fmt(y2)} − (${fmt(y1)})) ÷ ${x2 - x1}`, `(${fmt(y2)} − (${fmt(y1)})) ÷ ${x2 - x1}`, `(${fmt(y2)} − (${fmt(y1)})) ÷ ${x2 - x1}`) },
      { type: 'number', answer: b, tolerance: 0, prompt: t(`Avec a = ${fmt(a)} et f(${x1}) = ${fmt(y1)}, calcule b.`, `With a = ${fmt(a)} and f(${x1}) = ${fmt(y1)}, work out b.`, `مع a = ${fmt(a)} و f(${x1}) = ${fmt(y1)}، احسب b.`, `Con a = ${fmt(a)} y f(${x1}) = ${fmt(y1)}, calcula b.`), hint: t(`${fmt(y1)} = ${fmt(a)} × ${x1} + b, donc b = ${fmt(y1)} − ${fmt(a)} × ${x1}.`, `b = ${fmt(y1)} − ${fmt(a)} × ${x1}.`, `b = ${fmt(y1)} − ${fmt(a)} × ${x1}.`, `b = ${fmt(y1)} − ${fmt(a)} × ${x1}.`) },
      { type: 'choice', options: choices.map(c => same(`f(x) = ${c.e}`)), answer: choices.findIndex(c => c.ok), prompt: t('Donc…', 'So…', 'إذن…', 'Entonces…'), hint: t('a multiplie x, b est ajouté.', 'a multiplies x, b is added.', 'a يضرب x و b يُضاف.', 'a multiplica a x, b se suma.') },
    ],
  };
}

// ═════════════ STATISTIQUES ═════════════

const VALUE = t('Valeur', 'Value', 'القيمة', 'Valor'), COUNT = t('Effectif', 'Frequency', 'الحصيص', 'Frecuencia absoluta');
const table = (values: number[], counts: number[]): Table => ({ head: [VALUE, COUNT], rows: [values.map(String), counts.map(String)] });

function statsFrequency(seed: number): Activity {
  const rng = seeded(seed);
  const total = pick(rng, [20, 25, 40, 50]);
  const values = pick(rng, [[8, 10, 12, 14, 16], [36, 37, 38, 39, 40], [0, 1, 2, 3, 4]]);
  const counts = values.map(() => 1);
  let left = total - values.length;
  while (left > 0) { counts[int(rng, 0, values.length - 1)]! += 1; left--; }
  const top = counts.indexOf(Math.max(...counts));
  if (counts.filter(c => c === counts[top]).length > 1) { // un seul mode
    const j = counts.findIndex((c, k) => k !== top && c > 1);
    counts[top]! += 1; counts[j]! -= 1;
  }
  const i = int(rng, 0, values.length - 1);
  const tab = table(values, counts);
  return {
    title: t('Effectifs et fréquences', 'Frequencies', 'الحصيصات والترددات', 'Frecuencias'),
    summary: `N = ${total} · fréquence = effectif ÷ N · ${values[i]} : ${fmt((counts[i]! / total) * 100)} %`,
    steps: [
      { type: 'number', table: tab, answer: total, tolerance: 0, prompt: t('Quel est l’effectif total N ?', 'What is the total count N?', 'ما الحصيص الإجمالي N؟', '¿Cuál es el total N?'), hint: t('Additionne tous les effectifs.', 'Add up all the frequencies.', 'اجمع كل الحصيصات.', 'Suma todas las frecuencias.') },
      { type: 'number', table: tab, answer: (counts[i]! / total) * 100, tolerance: 0.06, prompt: t(`Quelle est la fréquence de la valeur ${values[i]}, en % ?`, `What is the relative frequency of ${values[i]}, as a %?`, `ما تردد القيمة ${values[i]} بالنسبة المئوية؟`, `¿Cuál es la frecuencia relativa de ${values[i]}, en %?`), hint: t(`effectif ÷ effectif total × 100 = ${counts[i]} ÷ ${total} × 100`, `count ÷ total × 100 = ${counts[i]} ÷ ${total} × 100`, `الحصيص ÷ الحصيص الإجمالي × 100`, `frecuencia ÷ total × 100`) },
      { type: 'choice', table: tab, options: values.map(v => same(String(v))), answer: top, prompt: t('Quelle valeur est la plus fréquente (le mode) ?', 'Which value is the most frequent (the mode)?', 'ما القيمة الأكثر تكرارًا (المنوال)؟', '¿Qué valor es el más frecuente (la moda)?'), hint: t('Cherche le plus grand effectif.', 'Look for the largest count.', 'ابحث عن أكبر حصيص.', 'Busca la mayor frecuencia.') },
    ],
  };
}

function statsMean(seed: number): Activity {
  const rng = seeded(seed);
  let values: number[];
  do { values = Array.from({ length: 4 }, () => int(rng, 1, 7)); } while (values.reduce((s, v) => s + v, 0) % 4 || new Set(values).size < 3);
  const series = Array.from({ length: 5 }, () => int(rng, 6, 18));
  const mean = series.reduce((s, v) => s + v, 0) / series.length;
  const notes = pick(rng, [[8, 10, 12, 15], [9, 11, 13, 16], [5, 10, 14, 18]]);
  const counts = notes.map(() => int(rng, 1, 6));
  const n = counts.reduce((s, c) => s + c, 0);
  const wmean = notes.reduce((s, v, k) => s + v * counts[k]!, 0) / n;
  return {
    title: t('Calculer une moyenne', 'Finding a mean', 'حساب معدل', 'Calcular una media'),
    summary: `moyenne = somme ÷ effectif total · ${fmt(Math.round(mean * 10) / 10)} · pondérée ≈ ${fmt(Math.round(wmean * 10) / 10)}`,
    steps: [
      { type: 'widget', widget: { kind: 'level', values }, prompt: t('Déplace des cubes d’une colonne à l’autre pour que toutes les colonnes aient la même hauteur.', 'Move cubes between columns until every column has the same height.', 'انقل مكعبات من عمود إلى آخر حتى تتساوى كل الأعمدة.', 'Mueve cubos entre columnas hasta que todas tengan la misma altura.'), hint: t('Prends un cube dans une colonne trop haute (▼), pose-le sur une colonne trop basse (▲).', 'Take a cube from a tall column (▼), put it on a short one (▲).', 'خذ مكعبًا من عمود مرتفع (▼) وضعه على عمود منخفض (▲).', 'Quita un cubo de una columna alta (▼) y ponlo en una baja (▲).') },
      { type: 'number', answer: mean, tolerance: 0.06, prompt: t(`Calcule la moyenne de la série ${series.join(' ; ')} (au dixième).`, `Work out the mean of ${series.join(' ; ')} (to 1 d.p.).`, `احسب معدل السلسلة ${series.join(' ; ')}.`, `Calcula la media de ${series.join(' ; ')} (a las décimas).`), hint: t(`On égalise comme avec les cubes : somme ÷ nombre de valeurs = ${series.reduce((s, v) => s + v, 0)} ÷ ${series.length}.`, `Like levelling cubes: sum ÷ number of values.`, `مثل تسوية المكعبات: المجموع ÷ عدد القيم.`, `Como nivelar cubos: suma ÷ número de valores.`) },
      { type: 'number', table: { head: [t('Note', 'Mark', 'النقطة', 'Nota'), COUNT], rows: [notes.map(String), counts.map(String)] }, answer: wmean, tolerance: 0.06, prompt: t('Calcule la moyenne des notes de la classe (au dixième).', 'Work out the class’s mean mark (to 1 d.p.).', 'احسب معدل نقط القسم.', 'Calcula la nota media de la clase (a las décimas).'), hint: t(`Chaque note compte autant de fois que son effectif : (${notes.map((v, k) => `${v}×${counts[k]}`).join(' + ')}) ÷ ${n}.`, `Each mark counts as many times as its frequency: (${notes.map((v, k) => `${v}×${counts[k]}`).join(' + ')}) ÷ ${n}.`, `كل نقطة تُحسب بعدد مرات حصيصها.`, `Cada nota cuenta tantas veces como su frecuencia.`) },
    ],
  };
}

function statsMedian(seed: number): Activity {
  const rng = seeded(seed);
  const odd = Array.from({ length: 7 }, () => int(rng, 3, 19));
  const sorted = [...odd].sort((x, y) => x - y);
  const even = Array.from({ length: 8 }, () => int(rng, 10, 40)).sort((x, y) => x - y);
  const medEven = (even[3]! + even[4]!) / 2;
  return {
    title: t('Trouver la médiane', 'Finding the median', 'إيجاد القيمة الوسطية', 'Hallar la mediana'),
    summary: `médiane : au milieu de la série rangée · ${sorted[3]} · ${fmt(medEven)}`,
    steps: [
      { type: 'chips', ordered: true, tokens: odd.map(String), groups: [sorted.map(String)], prompt: t('Range la série dans l’ordre croissant.', 'Sort the series in increasing order.', 'رتّب السلسلة ترتيبًا تزايديًا.', 'Ordena la serie de menor a mayor.'), hint: t('Commence par la plus petite valeur ; une valeur répétée s’écrit autant de fois.', 'Start with the smallest; a repeated value is written each time.', 'ابدأ بأصغر قيمة؛ القيمة المكررة تُكتب بعدد مرات تكرارها.', 'Empieza por la menor; un valor repetido se escribe cada vez.') },
      { type: 'number', answer: sorted[3]!, tolerance: 0, prompt: t(`Série rangée : ${sorted.join(' ; ')}. Quelle est la médiane ?`, `Sorted: ${sorted.join(' ; ')}. What is the median?`, `السلسلة المرتبة: ${sorted.join(' ; ')}. ما القيمة الوسطية؟`, `Ordenada: ${sorted.join(' ; ')}. ¿Cuál es la mediana?`), hint: t('7 valeurs : la médiane est la 4e, avec 3 valeurs de chaque côté.', '7 values: the median is the 4th, with 3 on each side.', '7 قيم: الوسطية هي الرابعة.', '7 valores: la mediana es la 4.ª.') },
      { type: 'number', answer: medEven, tolerance: 0, prompt: t(`Série rangée de 8 valeurs : ${even.join(' ; ')}. Quelle est la médiane ?`, `Sorted series of 8 values: ${even.join(' ; ')}. What is the median?`, `سلسلة مرتبة من 8 قيم: ${even.join(' ; ')}. ما القيمة الوسطية؟`, `Serie ordenada de 8 valores: ${even.join(' ; ')}. ¿Cuál es la mediana?`), hint: t(`Nombre pair de valeurs : la moyenne des deux du milieu, (${even[3]} + ${even[4]}) ÷ 2.`, `Even count: the mean of the two middle values, (${even[3]} + ${even[4]}) ÷ 2.`, `عدد زوجي: معدل القيمتين الوسطيين.`, `Número par: media de los dos centrales.`) },
      { type: 'choice', answer: 0, options: [t('au moins la moitié des valeurs sont inférieures ou égales à la médiane', 'at least half of the values are less than or equal to the median', 'نصف القيم على الأقل أصغر من الوسطية أو تساويها', 'al menos la mitad de los valores son menores o iguales que la mediana'), t('la médiane est toujours égale à la moyenne', 'the median always equals the mean', 'الوسطية تساوي المعدل دائمًا', 'la mediana siempre es igual a la media'), t('la médiane est la valeur la plus fréquente', 'the median is the most frequent value', 'الوسطية هي القيمة الأكثر تكرارًا', 'la mediana es el valor más frecuente')], prompt: t('Que signifie la médiane ?', 'What does the median mean?', 'ماذا تعني القيمة الوسطية؟', '¿Qué significa la mediana?'), hint: t('Elle partage la série rangée en deux moitiés.', 'It splits the sorted series into two halves.', 'تقسم السلسلة المرتبة إلى نصفين.', 'Divide la serie ordenada en dos mitades.') },
    ],
  };
}

function statsSpread(seed: number): Activity {
  const rng = seeded(seed);
  const mean = pick(rng, [11, 12, 13]);
  const tight = [mean - 2, mean - 1, mean, mean + 1, mean + 2], wide = [mean - 6, mean - 3, mean, mean + 3, mean + 6];
  const [nameA, nameB] = pick(rng, [['3e A', '3e B'], ['Lina', 'Omar'], ['Groupe 1', 'Groupe 2']]);
  const tightFirst = rng() < 0.5;
  const sA = shuffle(rng, tightFirst ? tight : wide), sB = shuffle(rng, tightFirst ? wide : tight);
  const tab: Table = { head: [same(nameA), same(nameB)], rows: [sA.map(String), sB.map(String)] };
  const range = (s: number[]) => Math.max(...s) - Math.min(...s);
  return {
    title: t('Étendue et comparaison', 'Range and comparing', 'المدى والمقارنة', 'Rango y comparación'),
    summary: `étendue = max − min · ${nameA} : ${range(sA)} · ${nameB} : ${range(sB)} · même moyenne ${mean}`,
    steps: [
      { type: 'number', table: tab, answer: range(sA), tolerance: 0, prompt: t(`Calcule l’étendue des notes de ${nameA}.`, `Work out the range of ${nameA}’s marks.`, `احسب مدى نقط ${nameA}.`, `Calcula el rango de las notas de ${nameA}.`), hint: t('Étendue = plus grande valeur − plus petite valeur.', 'Range = largest − smallest.', 'المدى = أكبر قيمة − أصغر قيمة.', 'Rango = mayor − menor.') },
      { type: 'number', table: tab, answer: range(sB), tolerance: 0, prompt: t(`Et l’étendue de ${nameB} ?`, `And ${nameB}’s range?`, `وما مدى ${nameB}؟`, `¿Y el rango de ${nameB}?`), hint: t('Étendue = plus grande valeur − plus petite valeur.', 'Range = largest − smallest.', 'المدى = أكبر قيمة − أصغر قيمة.', 'Rango = mayor − menor.') },
      { type: 'choice', table: tab, options: [same(nameA), same(nameB)], answer: tightFirst ? 0 : 1, prompt: t(`Les deux séries ont la même moyenne, ${mean}. Laquelle est la plus régulière (homogène) ?`, `Both have the same mean, ${mean}. Which one is more consistent?`, `للسلسلتين نفس المعدل ${mean}. أيهما أكثر تجانسًا؟`, `Ambas tienen la misma media, ${mean}. ¿Cuál es más regular?`), hint: t('La plus petite étendue : les notes sont plus serrées autour de la moyenne.', 'The smaller range: values are closer to the mean.', 'المدى الأصغر: القيم أقرب إلى المعدل.', 'El menor rango: valores más cercanos a la media.') },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string): L => t(fr, en, ar, es);
export const NUMBER_SKILLS: Skill[] = [
  { id: 'vec-characterise', review: 0, chapter: 'vectors', build: vecCharacterise, title: s('Direction, sens, longueur', 'Direction, sense, length', 'الاتجاه، المنحى، الطول', 'Dirección, sentido, longitud'), desc: s('Comparer deux vecteurs ; vecteurs égaux.', 'Compare two vectors; equal vectors.', 'مقارنة متجهتين؛ المتجهتان المتساويتان.', 'Comparar dos vectores; vectores iguales.') },
  { id: 'vec-translation', review: 0, chapter: 'vectors', build: vecTranslation, title: s('Translation', 'Translation', 'الإزاحة', 'Traslación'), desc: s('Placer l’image d’un point.', 'Place the image of a point.', 'إنشاء صورة نقطة.', 'Colocar la imagen de un punto.') },
  { id: 'vec-coordinates', review: 2, chapter: 'vectors', build: vecCoordinates, title: s('Coordonnées d’un vecteur', 'Coordinates of a vector', 'إحداثيتا متجهة', 'Coordenadas de un vector'), desc: s('Lire, calculer, placer.', 'Read, calculate, place.', 'القراءة والحساب والإنشاء.', 'Leer, calcular, colocar.') },
  { id: 'vec-sum', review: 2, chapter: 'vectors', build: vecSum, title: s('Somme de vecteurs', 'Adding vectors', 'مجموع متجهتين', 'Suma de vectores'), desc: s('Chasles et le parallélogramme.', 'Chasles and the parallelogram.', 'علاقة شال ومتوازي الأضلاع.', 'Chasles y el paralelogramo.') },
  { id: 'vec-midpoint', review: 3, chapter: 'vectors', build: vecMidpoint, title: s('Milieu et distance', 'Midpoint and distance', 'المنتصف والمسافة', 'Punto medio y distancia'), desc: s('Avec les coordonnées.', 'With coordinates.', 'باستعمال الإحداثيات.', 'Con coordenadas.') },
  { id: 'affine-recognise', review: 0, chapter: 'affine', build: affineRecognise, title: s('Reconnaître', 'Recognise', 'التعرف', 'Reconocer'), desc: s('Linéaire, affine, ou ni l’une ni l’autre.', 'Linear, affine, or neither.', 'خطية، تآلفية، أو لا هذه ولا تلك.', 'Lineal, afín o ninguna.') },
  { id: 'affine-image', review: 2, chapter: 'affine', build: affineImage, title: s('Image et antécédent', 'Image and preimage', 'الصورة والسابق', 'Imagen y antecedente'), desc: s('Calculer f(x), résoudre f(x) = c.', 'Work out f(x), solve f(x) = c.', 'حساب f(x) وحل f(x) = c.', 'Calcular f(x), resolver f(x) = c.') },
  { id: 'affine-graph', review: 3, chapter: 'affine', build: affineGraph, title: s('La droite de f', 'The line of f', 'مستقيم الدالة f', 'La recta de f'), desc: s('Le rôle de a et de b ; lire un graphique.', 'What a and b do; read a graph.', 'دور a و b؛ قراءة مبيان.', 'El papel de a y b; leer una gráfica.') },
  { id: 'affine-two-points', review: 0, chapter: 'affine', build: affineTwoPoints, title: s('f avec deux points', 'f from two points', 'f انطلاقًا من نقطتين', 'f con dos puntos'), desc: s('Calculer a, puis b.', 'Work out a, then b.', 'حساب a ثم b.', 'Calcular a y luego b.') },
  { id: 'stats-frequency', review: 1, chapter: 'stats', build: statsFrequency, title: s('Effectifs et fréquences', 'Counts and frequencies', 'الحصيصات والترددات', 'Frecuencias'), desc: s('Effectif total, fréquence en %, mode.', 'Total, relative frequency, mode.', 'الحصيص الإجمالي، التردد، المنوال.', 'Total, frecuencia relativa, moda.') },
  { id: 'stats-mean', review: 2, chapter: 'stats', build: statsMean, title: s('Moyenne', 'Mean', 'المعدل', 'Media'), desc: s('Égaliser, puis calculer ; moyenne pondérée.', 'Level out, then calculate; weighted mean.', 'التسوية ثم الحساب؛ المعدل المرجح.', 'Nivelar y calcular; media ponderada.') },
  { id: 'stats-median', review: 2, chapter: 'stats', build: statsMedian, title: s('Médiane', 'Median', 'القيمة الوسطية', 'Mediana'), desc: s('Ranger la série, trouver le milieu.', 'Sort the series, find the middle.', 'ترتيب السلسلة وإيجاد الوسط.', 'Ordenar la serie, hallar el centro.') },
  { id: 'stats-spread', review: 0, chapter: 'stats', build: statsSpread, title: s('Étendue', 'Range', 'المدى', 'Rango'), desc: s('Comparer la régularité de deux séries.', 'Compare how consistent two series are.', 'مقارنة تجانس سلسلتين.', 'Comparar la regularidad de dos series.') },
];
