// Parcours de compétences des ateliers : Pythagore, Thalès, trigonométrie, angles inscrits (ici), vecteurs,
// fonctions affines et statistiques (src/lib/skills-numbers.ts). Chaque chapitre est découpé selon le référentiel
// en compétences ; chaque compétence est une activité faite d'étapes (choisir, toucher la figure, assembler une
// égalité, taper un nombre, rédiger une phrase, placer un point, manipuler). Tout est pur et déterministe
// (une graine = un énoncé) : couvert par src/test/skills.test.tsx.
import type { NotionId } from './curriculum';
import { seeded } from './exercises';
import { FIGURE_NOTIONS, inscribedProblem, thalesProblem, type FigureKind } from './figures';
import { fmt, pick, t, type Activity, type Blank, type P, type Rng, type Scene, type Segment, type Skill, type Step } from './skill-kit';
import { NUMBER_SKILLS } from './skills-numbers';
import { LYCEE_SKILLS } from './skills-lycee';
import { FRACTION_SKILLS } from './skills-fractions';
import { SIXIEME_SKILLS } from './skills-sixieme';
import { RELATIVE_DATA_SKILLS } from './skills-relatifs-donnees';
import { CALCUL_FIGURE_SKILLS } from './skills-calcul-figures';
import { CINQUIEME_SKILLS } from './skills-cinquieme';
import { QUATRIEME_SKILLS } from './skills-quatrieme';
import { TROISIEME_SKILLS } from './skills-troisieme';
import { SECONDE_SKILLS } from './skills-seconde';
import { PREMIERE_SKILLS } from './skills-premiere';
import { LIMIT_SKILLS } from './skills-limites';
import { TERMINALE_SKILLS } from './skills-terminale';
import { TERMINALE_END_SKILLS } from './skills-terminale-fin';
import type { L } from './curriculum';

export * from './skill-kit';

// ───────────── Géométrie ─────────────

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
function rotate(p: P, angle: number): P {
  const c = Math.cos(rad(angle)), s = Math.sin(rad(angle));
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
/** Angle (en degrés) au sommet b du triangle abc. */
export function angleAt(a: P, b: P, c: P): number {
  const u = { x: a.x - b.x, y: a.y - b.y }, v = { x: c.x - b.x, y: c.y - b.y };
  return deg(Math.acos((u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y))));
}
/** Les trois angles d'un triangle, dans l'ordre de ses sommets. */
export const anglesOf = (pts: Record<string, P>, n: string[]) => n.map((v, i) => angleAt(pts[n[(i + 2) % 3]!]!, pts[v]!, pts[n[(i + 1) % 3]!]!));

/** Triangle de sommets nommés : angle `at` au premier sommet entre deux côtés de longueurs p et q, tourné de `turn` degrés. */
function triangle(names: [string, string, string], p: number, q: number, at: number, turn: number): Record<string, P> {
  const [v, a, b] = names;
  const pts = { [v]: { x: 0, y: 0 }, [a]: { x: p, y: 0 }, [b]: { x: q * Math.cos(rad(at)), y: q * Math.sin(rad(at)) } };
  return Object.fromEntries(Object.entries(pts).map(([k, pt]) => [k, rotate(pt, turn)]));
}
const sides = (n: [string, string, string]): Segment[] => [
  { id: n[0] + n[1], a: n[0], b: n[1] }, { id: n[1] + n[2], a: n[1], b: n[2] }, { id: n[0] + n[2], a: n[0], b: n[2] },
];
/** Nom d'un côté dans l'ordre alphabétique des sommets (« AB », jamais « BA »). */
const side = (u: string, v: string) => [u, v].sort().join('');

const LETTERS: [string, string, string][] = [['A', 'B', 'C'], ['D', 'E', 'F'], ['R', 'S', 'T'], ['K', 'L', 'M']];

// ───────────── Textes communs ─────────────

const YES_NO = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const roundHint = t('Arrondis au dixième : un seul chiffre après la virgule.', 'Round to one decimal place.', 'قرّب إلى الجزء من عشرة: رقم واحد بعد الفاصلة.', 'Redondea a las décimas: una cifra tras la coma.');
const tapHyp = (tri: string) => t(`Touche l’hypoténuse du triangle ${tri}.`, `Tap the hypotenuse of triangle ${tri}.`, `المس وتر المثلث ${tri}.`, `Toca la hipotenusa del triángulo ${tri}.`);
const hypHint = t('L’hypoténuse est le côté opposé à l’angle droit ; c’est le plus long.', 'The hypotenuse is opposite the right angle; it is the longest side.', 'الوتر هو الضلع المقابل للزاوية القائمة، وهو أطول الأضلاع.', 'La hipotenusa es el lado opuesto al ángulo recto; es el más largo.');
const pythEqHint = t('Le carré de l’hypoténuse est seul d’un côté du signe =.', 'The square of the hypotenuse stands alone on one side of the = sign.', 'مربع الوتر يكون وحده في أحد طرفي علامة =.', 'El cuadrado de la hipotenusa va solo a un lado del signo =.');

// ═════════════ PYTHAGORE ═════════════

function pythRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const steps: Step[] = [];
  const kinds = [90, pick(rng, [76, 80, 104, 110]), 90];
  const letters = [...LETTERS].sort(() => rng() - 0.5).slice(0, 3);
  let hypStep: Step | null = null;
  kinds.forEach((angle, i) => {
    const n = letters[i]!;
    const at = pick(rng, [0, 1, 2]);
    const order: [string, string, string] = [n[at]!, n[(at + 1) % 3]!, n[(at + 2) % 3]!];
    let pts = triangle(order, 3 + Math.floor(rng() * 3), 3 + Math.floor(rng() * 3), angle, Math.floor(rng() * 360));
    // un triangle « non » ne doit avoir aucun angle presque droit (sinon l'équerre tromperait)
    for (let p = 3; angle !== 90 && anglesOf(pts, order).some(a => Math.abs(a - 90) < 8); p++) pts = triangle(order, p, 3, angle, Math.floor(rng() * 360));
    const scene: Scene = { points: pts, segments: sides(n), polygon: [...n], equerre: true };
    const right = angle === 90;
    const options = [...n.map(v => t(`Oui, en ${v}`, `Yes, at ${v}`, `نعم، في ${v}`, `Sí, en ${v}`)), t('Non', 'No', 'لا', 'No')];
    steps.push({
      type: 'choice', scene, options, answer: right ? n.indexOf(order[0]) : 3,
      prompt: t(`Pose l’équerre sur les sommets (touche-les). Le triangle ${n.join('')} est-il rectangle ?`, `Put the set square on the corners (tap them). Is triangle ${n.join('')} a right triangle?`, `ضع الكوس على الرؤوس (المسها). هل المثلث ${n.join('')} قائم الزاوية؟`, `Pon la escuadra en los vértices (tócalos). ¿Es rectángulo el triángulo ${n.join('')}?`),
      hint: t('Teste chaque sommet : l’angle est droit si les deux côtés touchent l’équerre sur toute leur longueur.', 'Test each corner: the angle is right if both sides lie along the set square.', 'اختبر كل رأس: تكون الزاوية قائمة إذا انطبق الضلعان على الكوس.', 'Prueba cada vértice: el ángulo es recto si ambos lados coinciden con la escuadra.'),
    });
    if (right && !hypStep) hypStep = { type: 'tap', scene: { points: pts, segments: sides(n).map(s => ({ ...s, tappable: true })), rightAngles: [[order[1], order[0], order[2]]] }, answer: side(order[1], order[2]), prompt: tapHyp(n.join('')), hint: hypHint };
  });
  steps.push(hypStep!);
  return { title: t('Reconnaître un triangle rectangle', 'Recognising a right triangle', 'التعرف على مثلث قائم', 'Reconocer un triángulo rectángulo'), steps, summary: 'équerre → angle droit · hypoténuse = côté opposé à l’angle droit' };
}

function pythDiscover(seed: number): Activity {
  const [ab, ac] = pick(seeded(seed), [[3, 4], [4, 3], [5, 3], [4, 5]] as const);
  return {
    title: t('Découvrir l’égalité de Pythagore', 'Discovering Pythagoras’ equality', 'اكتشاف متساوية فيثاغورس', 'Descubrir la igualdad de Pitágoras'),
    summary: 'BC² = AB² + AC² ⇔ Â = 90°',
    steps: [
      {
        type: 'widget', widget: { kind: 'squares', ab, ac },
        prompt: t('Règle l’angle en A, puis verse les carreaux des deux petits carrés dans le grand. Trouve l’angle pour lequel ils le remplissent exactement.', 'Set the angle at A, then pour the tiles of the two small squares into the big one. Find the angle where they fill it exactly.', 'اضبط الزاوية في A ثم اسكب مربعات المربعين الصغيرين في المربع الكبير. أوجد الزاوية التي تملؤه تمامًا.', 'Ajusta el ángulo en A y vierte los cuadraditos de los dos cuadrados pequeños en el grande. Encuentra el ángulo con el que lo llenan exactamente.'),
        hint: t('Si le grand carré déborde, l’angle est trop petit ; s’il reste de la place, il est trop grand.', 'If the big square overflows, the angle is too small; if there is room left, it is too big.', 'إذا فاض المربع الكبير فالزاوية صغيرة جدًا، وإذا بقي فراغ فهي كبيرة جدًا.', 'Si el cuadrado grande se desborda, el ángulo es demasiado pequeño; si sobra sitio, es demasiado grande.'),
      },
      {
        type: 'chips', tokens: ['BC²', 'AB²', 'AC²', '+', '='], groups: [['BC²'], ['AB²', 'AC²']],
        prompt: t('Écris ce que tu as observé avec les étiquettes, quand l’angle en A est droit.', 'Write what you observed with the labels, when the angle at A is right.', 'اكتب ما لاحظته باستعمال البطاقات عندما تكون الزاوية في A قائمة.', 'Escribe con las etiquetas lo que observaste cuando el ángulo en A es recto.'),
        hint: pythEqHint,
      },
      {
        type: 'choice', options: [t('quand l’angle en A est droit', 'when the angle at A is right', 'عندما تكون الزاوية في A قائمة', 'cuando el ángulo en A es recto'), t('pour n’importe quel triangle', 'for any triangle', 'لأي مثلث', 'para cualquier triángulo'), t('quand le triangle est isocèle', 'when the triangle is isosceles', 'عندما يكون المثلث متساوي الساقين', 'cuando el triángulo es isósceles')], answer: 0,
        prompt: t('L’égalité BC² = AB² + AC² est vraie…', 'The equality BC² = AB² + AC² holds…', 'المتساوية BC² = AB² + AC² صحيحة…', 'La igualdad BC² = AB² + AC² es cierta…'),
        hint: t('Repense à la jauge : elle n’était exacte que pour un seul angle.', 'Think back to the gauge: it was exact for only one angle.', 'تذكّر المقياس: كان مضبوطًا لزاوية واحدة فقط.', 'Recuerda el indicador: solo era exacto para un ángulo.'),
      },
    ],
  };
}

function pythCompute(seed: number): Activity {
  const rng = seeded(seed);
  const [n1, n2] = [...LETTERS].sort(() => rng() - 0.5) as [[string, string, string], [string, string, string]];
  // 1) l'hypoténuse : côtés entiers, pas un triplet
  const a = 3 + Math.floor(rng() * 6);
  let b = 3 + Math.floor(rng() * 6);
  if (Number.isInteger(Math.hypot(a, b))) b += 1;
  const r1 = n1[0], s1 = n1[1], u1 = n1[2]; // angle droit en r1, hypoténuse [s1u1]
  const h1 = side(s1, u1), l1 = side(r1, s1), l2 = side(r1, u1);
  const scene1: Scene = { points: triangle([r1, s1, u1], a, b, 90, Math.floor(rng() * 360)), segments: [{ id: l1, a: r1, b: s1, text: String(a) }, { id: l2, a: r1, b: u1, text: String(b) }, { id: h1, a: s1, b: u1, text: '?' }], rightAngles: [[s1, r1, u1]] };
  // 2) un autre côté
  const hyp = 7 + Math.floor(rng() * 6), leg = 2 + Math.floor(rng() * (hyp - 3));
  const r2 = n2[1], s2 = n2[0], u2 = n2[2]; // angle droit en r2
  const H2 = side(s2, u2), K2 = side(r2, s2), M2 = side(r2, u2);
  const scene2: Scene = { points: triangle([r2, s2, u2], leg, Math.sqrt(hyp * hyp - leg * leg), 90, Math.floor(rng() * 360)), segments: [{ id: K2, a: r2, b: s2, text: String(leg) }, { id: M2, a: r2, b: u2, text: '?' }, { id: H2, a: s2, b: u2, text: String(hyp) }], rightAngles: [[s2, r2, u2]] };
  const sq = (s: string) => `${s}²`;
  return {
    title: t('Calculer une longueur avec Pythagore', 'Finding a length with Pythagoras', 'حساب طول باستعمال فيثاغورس', 'Calcular una longitud con Pitágoras'),
    summary: `${h1}² = ${l1}² + ${l2}² · ${M2}² = ${H2}² − ${K2}²`,
    steps: [
      { type: 'tap', scene: { ...scene1, segments: scene1.segments.map(s => ({ ...s, tappable: true })) }, answer: h1, prompt: tapHyp(n1.join('')), hint: hypHint },
      { type: 'chips', scene: scene1, tokens: [sq(h1), sq(l1), sq(l2), '+', '='], groups: [[sq(h1)], [sq(l1), sq(l2)]], prompt: t(`Le triangle ${n1.join('')} est rectangle en ${r1}. Écris l’égalité de Pythagore.`, `Triangle ${n1.join('')} has its right angle at ${r1}. Write Pythagoras’ equality.`, `المثلث ${n1.join('')} قائم الزاوية في ${r1}. اكتب متساوية فيثاغورس.`, `El triángulo ${n1.join('')} es rectángulo en ${r1}. Escribe la igualdad de Pitágoras.`), hint: pythEqHint },
      { type: 'number', scene: scene1, answer: a * a + b * b, tolerance: 0, prompt: t(`Remplace : ${h1}² = ${a}² + ${b}². Combien vaut ${h1}² ?`, `Substitute: ${h1}² = ${a}² + ${b}². What is ${h1}²?`, `عوّض: ${h1}² = ${a}² + ${b}². كم يساوي ${h1}²؟`, `Sustituye: ${h1}² = ${a}² + ${b}². ¿Cuánto vale ${h1}²?`), hint: t(`${a}² = ${a * a} et ${b}² = ${b * b}.`, `${a}² = ${a * a} and ${b}² = ${b * b}.`, `${a}² = ${a * a} و ${b}² = ${b * b}.`, `${a}² = ${a * a} y ${b}² = ${b * b}.`) },
      { type: 'number', scene: scene1, answer: Math.hypot(a, b), tolerance: 0.06, prompt: t(`${h1} = √${a * a + b * b}. Donne ${h1} arrondi au dixième.`, `${h1} = √${a * a + b * b}. Give ${h1} to one decimal place.`, `${h1} = √${a * a + b * b}. أعط ${h1} مقربًا إلى الجزء من عشرة.`, `${h1} = √${a * a + b * b}. Da ${h1} redondeado a las décimas.`), hint: roundHint },
      { type: 'number', scene: scene2, answer: hyp * hyp - leg * leg, tolerance: 0, prompt: t(`Triangle ${n2.join('')} rectangle en ${r2} : ${H2}² = ${K2}² + ${M2}², donc ${M2}² = ${H2}² − ${K2}². Combien vaut ${M2}² ?`, `Triangle ${n2.join('')}, right angle at ${r2}: ${H2}² = ${K2}² + ${M2}², so ${M2}² = ${H2}² − ${K2}². What is ${M2}²?`, `المثلث ${n2.join('')} قائم الزاوية في ${r2}: ${H2}² = ${K2}² + ${M2}²، إذن ${M2}² = ${H2}² − ${K2}². كم يساوي ${M2}²؟`, `Triángulo ${n2.join('')} rectángulo en ${r2}: ${H2}² = ${K2}² + ${M2}², luego ${M2}² = ${H2}² − ${K2}². ¿Cuánto vale ${M2}²?`), hint: t(`Ici l’inconnue n’est pas l’hypoténuse : on soustrait. ${hyp}² − ${leg}².`, `Here the unknown is not the hypotenuse: subtract. ${hyp}² − ${leg}².`, `المجهول هنا ليس الوتر: نطرح. ${hyp}² − ${leg}².`, `Aquí la incógnita no es la hipotenusa: se resta. ${hyp}² − ${leg}².`) },
      { type: 'number', scene: scene2, answer: Math.sqrt(hyp * hyp - leg * leg), tolerance: 0.06, prompt: t(`Donne ${M2} arrondi au dixième.`, `Give ${M2} to one decimal place.`, `أعط ${M2} مقربًا إلى الجزء من عشرة.`, `Da ${M2} redondeado a las décimas.`), hint: roundHint },
    ],
  };
}

const RIGHT_SETS: [number, number, number][] = [[4.5, 6, 7.5], [1.5, 2, 2.5], [6, 8, 10], [5, 12, 13], [2.4, 3.2, 4], [9, 12, 15]];
const NEAR_RIGHT: [number, number, number][] = [[5, 6, 7.8], [4, 7.5, 8.6], [6, 7, 9.2]];

function converseCase(n: [string, string, string], lengths: [number, number, number], right: boolean, turn: number): Step[] {
  const [x, y, z] = lengths; // z est le plus grand côté
  // Sommets : n[0] opposé au plus grand côté. Côtés : [n1 n2] = z, [n0 n1] = x, [n0 n2] = y.
  const ang = deg(Math.acos((x * x + y * y - z * z) / (2 * x * y)));
  const pts = triangle([n[0], n[1], n[2]], x, y, ang, turn);
  const big = side(n[1], n[2]), s1 = side(n[0], n[1]), s2 = side(n[0], n[2]);
  const scene: Scene = { points: pts, segments: [{ id: s1, a: n[0], b: n[1], text: fmt(x) }, { id: s2, a: n[0], b: n[2], text: fmt(y) }, { id: big, a: n[1], b: n[2], text: fmt(z) }] };
  const sideNames = [s1, s2, big];
  const thm = [t('la réciproque du théorème de Pythagore', 'the converse of Pythagoras’ theorem', 'المبرهنة العكسية لمبرهنة فيثاغورس', 'el recíproco del teorema de Pitágoras'), t('le théorème de Pythagore', 'Pythagoras’ theorem', 'مبرهنة فيثاغورس', 'el teorema de Pitágoras'), t('la contraposée du théorème de Pythagore', 'the contrapositive of Pythagoras’ theorem', 'العكس النقيض لمبرهنة فيثاغورس', 'el contrarrecíproco del teorema de Pitágoras')];
  return [
    { type: 'choice', scene, options: sideNames.map(s => t(`[${s}]`, `[${s}]`, `[${s}]`, `[${s}]`)), answer: 2, prompt: t(`Triangle ${n.join('')} : quel est le plus grand côté ?`, `Triangle ${n.join('')}: which is the longest side?`, `المثلث ${n.join('')}: ما هو أطول ضلع؟`, `Triángulo ${n.join('')}: ¿cuál es el lado más largo?`), hint: t('Compare les trois longueurs.', 'Compare the three lengths.', 'قارن الأطوال الثلاثة.', 'Compara las tres longitudes.') },
    { type: 'number', scene, answer: z * z, tolerance: 1e-6, prompt: t(`Calcule ${big}².`, `Work out ${big}².`, `احسب ${big}².`, `Calcula ${big}².`), hint: t(`${fmt(z)} × ${fmt(z)}`, `${fmt(z)} × ${fmt(z)}`, `${fmt(z)} × ${fmt(z)}`, `${fmt(z)} × ${fmt(z)}`) },
    { type: 'number', scene, answer: x * x + y * y, tolerance: 1e-6, prompt: t(`Calcule ${s1}² + ${s2}².`, `Work out ${s1}² + ${s2}².`, `احسب ${s1}² + ${s2}².`, `Calcula ${s1}² + ${s2}².`), hint: t(`${fmt(x)}² + ${fmt(y)}²`, `${fmt(x)}² + ${fmt(y)}²`, `${fmt(x)}² + ${fmt(y)}²`, `${fmt(x)}² + ${fmt(y)}²`) },
    {
      type: 'sentence', scene,
      prompt: t(`${big}² ${right ? '=' : '≠'} ${s1}² + ${s2}². Rédige la conclusion.`, `${big}² ${right ? '=' : '≠'} ${s1}² + ${s2}². Write the conclusion.`, `${big}² ${right ? '=' : '≠'} ${s1}² + ${s2}². حرّر الاستنتاج.`, `${big}² ${right ? '=' : '≠'} ${s1}² + ${s2}². Redacta la conclusión.`),
      parts: [
        t('D’après', 'By', 'حسب', 'Según'), { options: thm, answer: right ? [0] : [1, 2] },
        t(`, le triangle ${n.join('')}`, `, triangle ${n.join('')}`, `، فإن المثلث ${n.join('')}`, `, el triángulo ${n.join('')}`),
        { options: [t('est rectangle', 'is right-angled', 'قائم الزاوية', 'es rectángulo'), t('n’est pas rectangle', 'is not right-angled', 'ليس قائم الزاوية', 'no es rectángulo')], answer: [right ? 0 : 1] },
        { options: [...n.map(v => t(`en ${v}`, `at ${v}`, `في ${v}`, `en ${v}`)), t('(aucun sommet)', '(no corner)', '(لا يوجد رأس)', '(ningún vértice)')], answer: [right ? 0 : 3] },
        t('.', '.', '.', '.'),
      ],
      hint: right
        ? t(`Égalité vérifiée → réciproque ; l’angle droit est en face du plus grand côté, en ${n[0]}.`, `Equality holds → converse; the right angle faces the longest side, at ${n[0]}.`, `المتساوية محققة ← المبرهنة العكسية؛ الزاوية القائمة تقابل أطول ضلع، في ${n[0]}.`, `Se cumple la igualdad → recíproco; el ángulo recto está frente al lado mayor, en ${n[0]}.`)
        : t('Égalité fausse → le triangle n’est pas rectangle (théorème de Pythagore, ou sa contraposée).', 'Equality fails → not a right triangle (Pythagoras’ theorem, or its contrapositive).', 'المتساوية غير محققة ← المثلث ليس قائمًا (مبرهنة فيثاغورس أو عكسها النقيض).', 'No se cumple → no es rectángulo (teorema de Pitágoras o su contrarrecíproco).'),
    },
  ];
}

function pythConverse(seed: number): Activity {
  const rng = seeded(seed);
  const [n1, n2] = [...LETTERS].sort(() => rng() - 0.5) as [[string, string, string], [string, string, string]];
  const near = pick(rng, NEAR_RIGHT);
  const turn2 = Math.floor(rng() * 360);
  const [x, y, z] = near;
  const ang = deg(Math.acos((x * x + y * y - z * z) / (2 * x * y)));
  const trap: Step = {
    type: 'choice',
    scene: { points: triangle(n2, x, y, ang, turn2), segments: sides(n2), polygon: [...n2], equerre: true },
    options: [t('Oui : l’équerre le prouve', 'Yes: the set square proves it', 'نعم: الكوس يثبت ذلك', 'Sí: la escuadra lo demuestra'), t('Non : il faut calculer avec les longueurs', 'No: we must calculate with the lengths', 'لا: يجب الحساب بالأطوال', 'No: hay que calcular con las longitudes')], answer: 1,
    prompt: t(`Pose l’équerre en ${n2[0]} : l’angle semble droit. Peut-on conclure que ${n2.join('')} est rectangle ?`, `Put the set square at ${n2[0]}: the angle looks right. Can we conclude that ${n2.join('')} is a right triangle?`, `ضع الكوس في ${n2[0]}: تبدو الزاوية قائمة. هل يمكن أن نستنتج أن ${n2.join('')} قائم؟`, `Pon la escuadra en ${n2[0]}: el ángulo parece recto. ¿Podemos concluir que ${n2.join('')} es rectángulo?`),
    hint: t('Une figure ou une mesure ne prouve rien : seul le calcul avec les longueurs permet de conclure.', 'A drawing or a measurement proves nothing: only calculating with the lengths lets us conclude.', 'الشكل أو القياس لا يثبت شيئًا: وحده الحساب بالأطوال يسمح بالاستنتاج.', 'Un dibujo o una medida no prueban nada: solo el cálculo con las longitudes permite concluir.'),
  };
  return {
    title: t('La réciproque du théorème de Pythagore', 'The converse of Pythagoras’ theorem', 'المبرهنة العكسية لفيثاغورس', 'El recíproco del teorema de Pitágoras'),
    summary: 'plus grand côté² = somme des deux autres carrés ⇔ rectangle',
    steps: [...converseCase(n1, pick(rng, RIGHT_SETS), true, Math.floor(rng() * 360)), trap, ...converseCase(n2, near, false, turn2)],
  };
}

type Scenario = { title: L; story: (a: number, b: number) => L; names: [string, string, string]; labels: [L, L, L]; legKnown: boolean; values: [number, number][] };
const SCENARIOS: Scenario[] = [
  {
    title: t('L’échelle', 'The ladder', 'السلم', 'La escalera'), names: ['S', 'P', 'H'], legKnown: true,
    story: (l, d) => t(`Une échelle de ${fmt(l)} m est posée contre un mur vertical. Son pied est à ${fmt(d)} m du mur. À quelle hauteur touche-t-elle le mur ?`, `A ${fmt(l)} m ladder leans on a vertical wall. Its foot is ${fmt(d)} m from the wall. How high does it reach?`, `سلم طوله ${fmt(l)} m مستند إلى حائط عمودي. قدمه على بعد ${fmt(d)} m من الحائط. على أي ارتفاع يلمس الحائط؟`, `Una escalera de ${fmt(l)} m se apoya en una pared vertical. Su pie está a ${fmt(d)} m de la pared. ¿A qué altura toca la pared?`),
    labels: [t('sol', 'ground', 'الأرض', 'suelo'), t('mur', 'wall', 'الحائط', 'pared'), t('échelle', 'ladder', 'السلم', 'escalera')], values: [[5, 1.4], [4, 1.2], [6, 1.8], [3, 0.9]],
  },
  {
    title: t('L’écran', 'The screen', 'الشاشة', 'La pantalla'), names: ['A', 'B', 'C'], legKnown: false,
    story: (w, h) => t(`Un écran mesure ${fmt(w)} cm de large et ${fmt(h)} cm de haut. Combien mesure sa diagonale ?`, `A screen is ${fmt(w)} cm wide and ${fmt(h)} cm high. How long is its diagonal?`, `شاشة عرضها ${fmt(w)} cm وارتفاعها ${fmt(h)} cm. كم يبلغ طول قطرها؟`, `Una pantalla mide ${fmt(w)} cm de ancho y ${fmt(h)} cm de alto. ¿Cuánto mide su diagonal?`),
    labels: [t('largeur', 'width', 'العرض', 'ancho'), t('hauteur', 'height', 'الارتفاع', 'alto'), t('diagonale', 'diagonal', 'القطر', 'diagonal')], values: [[102, 57], [80, 45], [60, 34], [140, 79]],
  },
  {
    title: t('Le raccourci', 'The shortcut', 'الطريق المختصر', 'El atajo'), names: ['O', 'E', 'N'], legKnown: false,
    story: (a, b) => t(`Pour traverser un terrain rectangulaire, Lina fait ${fmt(a)} m vers l’est puis ${fmt(b)} m vers le nord. Quelle distance ferait-elle en coupant en ligne droite ?`, `To cross a rectangular field, Lina walks ${fmt(a)} m east then ${fmt(b)} m north. How far would the straight shortcut be?`, `لعبور أرض مستطيلة، تمشي لينا ${fmt(a)} m نحو الشرق ثم ${fmt(b)} m نحو الشمال. ما المسافة لو قطعت في خط مستقيم؟`, `Para cruzar un terreno rectangular, Lina camina ${fmt(a)} m al este y luego ${fmt(b)} m al norte. ¿Qué distancia recorrería en línea recta?`),
    labels: [t('est', 'east', 'الشرق', 'este'), t('nord', 'north', 'الشمال', 'norte'), t('raccourci', 'shortcut', 'المختصر', 'atajo')], values: [[40, 30], [60, 25], [35, 50], [48, 20]],
  },
];

function pythProblem(seed: number): Activity {
  const rng = seeded(seed);
  const sc = pick(rng, SCENARIOS);
  const [u, v] = pick(rng, sc.values);
  const [r, a, b] = sc.names; // angle droit en r ; [ra] et [rb] les côtés de l'angle droit, [ab] l'hypoténuse
  const pts = triangle([r, a, b], 4, 3, 90, 0);
  const hyp = side(a, b), base = side(r, a), up = side(r, b);
  const unknown = sc.legKnown ? up : hyp;
  const scene: Scene = {
    points: pts, rightAngles: [[a, r, b]],
    segments: [{ id: base, a: r, b: a, text: sc.legKnown ? fmt(v) : fmt(u), tappable: true }, { id: up, a: r, b, text: sc.legKnown ? '?' : fmt(v), tappable: true }, { id: hyp, a, b, text: sc.legKnown ? fmt(u) : '?', tappable: true }],
    caption: t(`${sc.labels[0].fr} [${base}] · ${sc.labels[1].fr} [${up}] · ${sc.labels[2].fr} [${hyp}]`, `${sc.labels[0].en} [${base}] · ${sc.labels[1].en} [${up}] · ${sc.labels[2].en} [${hyp}]`, `${sc.labels[0].ar} [${base}] · ${sc.labels[1].ar} [${up}] · ${sc.labels[2].ar} [${hyp}]`, `${sc.labels[0].es} [${base}] · ${sc.labels[1].es} [${up}] · ${sc.labels[2].es} [${hyp}]`),
  };
  const answerSq = sc.legKnown ? u * u - v * v : u * u + v * v;
  return {
    title: t(`Problème : ${sc.title.fr.toLowerCase()}`, `Problem: ${sc.title.en.toLowerCase()}`, `مسألة: ${sc.title.ar}`, `Problema: ${sc.title.es.toLowerCase()}`),
    summary: `${unknown}² = ${fmt(answerSq)} → ${unknown} ≈ ${fmt(Math.round(Math.sqrt(answerSq) * 10) / 10)}`,
    steps: [
      { type: 'tap', scene, answer: hyp, prompt: t(`${sc.story(u, v).fr} Sur le schéma, touche l’hypoténuse.`, `${sc.story(u, v).en} On the diagram, tap the hypotenuse.`, `${sc.story(u, v).ar} في الرسم، المس الوتر.`, `${sc.story(u, v).es} En el esquema, toca la hipotenusa.`), hint: t('Le mur et le sol (ou les deux directions) forment l’angle droit : l’hypoténuse est en face.', 'The two perpendicular directions form the right angle: the hypotenuse faces it.', 'الاتجاهان المتعامدان يكوّنان الزاوية القائمة: الوتر يقابلها.', 'Las dos direcciones perpendiculares forman el ángulo recto: la hipotenusa está enfrente.') },
      { type: 'number', scene, answer: answerSq, tolerance: 1e-6, prompt: t(`Avec Pythagore, combien vaut ${unknown}² ?`, `Using Pythagoras, what is ${unknown}²?`, `باستعمال فيثاغورس، كم يساوي ${unknown}²؟`, `Con Pitágoras, ¿cuánto vale ${unknown}²?`), hint: sc.legKnown ? t(`${hyp}² − ${base}² = ${fmt(u)}² − ${fmt(v)}²`, `${hyp}² − ${base}² = ${fmt(u)}² − ${fmt(v)}²`, `${hyp}² − ${base}² = ${fmt(u)}² − ${fmt(v)}²`, `${hyp}² − ${base}² = ${fmt(u)}² − ${fmt(v)}²`) : t(`${base}² + ${up}² = ${fmt(u)}² + ${fmt(v)}²`, `${base}² + ${up}² = ${fmt(u)}² + ${fmt(v)}²`, `${base}² + ${up}² = ${fmt(u)}² + ${fmt(v)}²`, `${base}² + ${up}² = ${fmt(u)}² + ${fmt(v)}²`) },
      { type: 'number', scene, answer: Math.sqrt(answerSq), tolerance: 0.06, prompt: t(`Donne ${unknown} arrondi au dixième.`, `Give ${unknown} to one decimal place.`, `أعط ${unknown} مقربًا إلى الجزء من عشرة.`, `Da ${unknown} redondeado a las décimas.`), hint: roundHint },
    ],
  };
}

// ═════════════ THALÈS ═════════════

/** Configuration de Thalès « triangle » ou « papillon ». M sur (AB), N sur (AC), k = AM/AB (négatif = papillon). */
function thalesScene(n: { A: string; B: string; C: string; M: string; N: string }, k: number, turn: number, texts: Partial<Record<string, string>> = {}, parallel = true): Scene {
  const base = triangle([n.A, n.B, n.C], 6, 5, 50, turn);
  const A = base[n.A]!, B = base[n.B]!, C = base[n.C]!;
  const M = { x: A.x + k * (B.x - A.x), y: A.y + k * (B.y - A.y) };
  const kn = parallel ? k : k * 1.3;
  const N = { x: A.x + kn * (C.x - A.x), y: A.y + kn * (C.y - A.y) };
  const seg = (id: string, a: string, b: string, style?: Segment['style']): Segment => ({ id, a, b, ...(texts[id] ? { text: texts[id] } : {}), ...(style ? { style } : {}) });
  return {
    points: { [n.A]: A, [n.B]: B, [n.C]: C, [n.M]: M, [n.N]: N },
    segments: k > 0
      ? [seg(side(n.A, n.B), n.A, n.B), seg(side(n.A, n.C), n.A, n.C), seg(side(n.B, n.C), n.B, n.C, 'bold'), seg(side(n.M, n.N), n.M, n.N, 'bold'), seg(side(n.A, n.M), n.A, n.M, 'soft'), seg(side(n.A, n.N), n.A, n.N, 'soft')]
      : [seg(side(n.A, n.B), n.A, n.B), seg(side(n.A, n.C), n.A, n.C), seg(side(n.B, n.C), n.B, n.C, 'bold'), seg(side(n.M, n.N), n.M, n.N, 'bold'), seg(side(n.A, n.M), n.A, n.M), seg(side(n.A, n.N), n.A, n.N)],
  };
}
const isTenth = (v: number) => Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
const TH_LETTERS = [{ A: 'A', B: 'B', C: 'C', M: 'M', N: 'N' }, { A: 'R', B: 'S', C: 'T', M: 'U', N: 'V' }, { A: 'E', B: 'F', C: 'G', M: 'H', N: 'K' }];
const thalesEqHint = t('Chaque rapport compare un côté du petit triangle au côté qui lui correspond dans le grand, en partant du même sommet.', 'Each ratio compares a side of the small triangle with the matching side of the big one, starting from the same vertex.', 'كل نسبة تقارن ضلعًا من المثلث الصغير بالضلع المقابل له في الكبير، انطلاقًا من نفس الرأس.', 'Cada razón compara un lado del triángulo pequeño con el lado correspondiente del grande, desde el mismo vértice.');

function thalesRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, TH_LETTERS);
  const steps: Step[] = [];
  const cases: { k: number; parallel: boolean }[] = [{ k: 0.5, parallel: true }, { k: -0.6, parallel: true }, { k: 0.55, parallel: false }].sort(() => rng() - 0.5);
  for (const c of cases) {
    steps.push({
      type: 'choice', scene: thalesScene(n, c.k, Math.floor(rng() * 360), {}, c.parallel), options: YES_NO, answer: c.parallel ? 0 : 1,
      prompt: t(`(${n.M}${n.N}) et (${n.B}${n.C}) sont-elles parallèles sur ce dessin ? (Les points ${n.A}, ${n.M}, ${n.B} sont alignés, ainsi que ${n.A}, ${n.N}, ${n.C}.) Est-ce une configuration de Thalès ?`, `Are (${n.M}${n.N}) and (${n.B}${n.C}) parallel here? (${n.A}, ${n.M}, ${n.B} are collinear, as are ${n.A}, ${n.N}, ${n.C}.) Is this an intercept-theorem configuration?`, `هل (${n.M}${n.N}) و (${n.B}${n.C}) متوازيان هنا؟ (النقط ${n.A} و ${n.M} و ${n.B} مستقيمية، وكذلك ${n.A} و ${n.N} و ${n.C}.) هل هذا تشكيل طاليس؟`, `¿Son paralelas (${n.M}${n.N}) y (${n.B}${n.C}) aquí? (${n.A}, ${n.M}, ${n.B} están alineados, igual que ${n.A}, ${n.N}, ${n.C}.) ¿Es una configuración de Tales?`),
      hint: t('Il faut deux droites sécantes en un point, coupées par deux droites parallèles. Triangle emboîté ou « papillon », les deux comptent.', 'You need two lines meeting at a point, cut by two parallel lines. Nested triangles or a “butterfly” both count.', 'نحتاج مستقيمين متقاطعين في نقطة يقطعهما مستقيمان متوازيان. المثلث المتداخل أو «الفراشة» كلاهما صالح.', 'Hacen falta dos rectas secantes cortadas por dos paralelas. Triángulos encajados o «mariposa», ambos valen.'),
    });
  }
  steps.push({
    type: 'choice', scene: thalesScene(n, -0.6, Math.floor(rng() * 360)), answer: 0,
    options: [t(`(${n.M}${n.N}) et (${n.B}${n.C})`, `(${n.M}${n.N}) and (${n.B}${n.C})`, `(${n.M}${n.N}) و (${n.B}${n.C})`, `(${n.M}${n.N}) y (${n.B}${n.C})`), t(`(${n.A}${n.M}) et (${n.A}${n.N})`, `(${n.A}${n.M}) and (${n.A}${n.N})`, `(${n.A}${n.M}) و (${n.A}${n.N})`, `(${n.A}${n.M}) y (${n.A}${n.N})`), t(`(${n.M}${n.B}) et (${n.N}${n.C})`, `(${n.M}${n.B}) and (${n.N}${n.C})`, `(${n.M}${n.B}) و (${n.N}${n.C})`, `(${n.M}${n.B}) y (${n.N}${n.C})`)],
    prompt: t('Dans ce « papillon », quelles droites doivent être parallèles ?', 'In this “butterfly”, which lines must be parallel?', 'في هذه «الفراشة»، ما المستقيمان اللذان يجب أن يكونا متوازيين؟', 'En esta «mariposa», ¿qué rectas deben ser paralelas?'),
    hint: t('Ce sont les deux droites qui ne passent pas par le point d’intersection.', 'They are the two lines that do not go through the crossing point.', 'هما المستقيمان اللذان لا يمران من نقطة التقاطع.', 'Son las dos rectas que no pasan por el punto de corte.'),
  });
  return { title: t('Reconnaître une configuration de Thalès', 'Recognising an intercept configuration', 'التعرف على تشكيل طاليس', 'Reconocer una configuración de Tales'), steps, summary: 'deux sécantes + deux parallèles · triangle ou papillon' };
}

const thalesTokens = (n: { A: string; B: string; C: string; M: string; N: string }) => {
  const r = (a: string, b: string, c: string, d: string) => `${a}${b}/${c}${d}`;
  return {
    good: [r(n.A, n.M, n.A, n.B), r(n.A, n.N, n.A, n.C), r(n.M, n.N, n.B, n.C)],
    bad: [r(n.A, n.M, n.M, n.B), r(n.M, n.N, n.A, n.B)],
  };
};

function thalesEquality(seed: number): Activity {
  const rng = seeded(seed);
  const problem = thalesProblem(seed);
  const n = pick(rng, TH_LETTERS);
  const tk = thalesTokens(n);
  return {
    title: t('Écrire l’égalité de Thalès', 'Writing the intercept equality', 'كتابة متساوية طاليس', 'Escribir la igualdad de Tales'),
    summary: `${tk.good.join(' = ')}`,
    steps: [
      { type: 'widget', widget: { kind: 'thales', problem }, prompt: t(`Fais glisser M pour que AM = ${problem.am}, et regarde les rapports.`, `Slide M so that AM = ${problem.am}, and watch the ratios.`, `حرّك M بحيث AM = ${problem.am}، ولاحظ النسب.`, `Desliza M para que AM = ${problem.am} y mira las razones.`), hint: t('Compte les carreaux depuis A.', 'Count the squares from A.', 'عُدّ المربعات انطلاقًا من A.', 'Cuenta los cuadros desde A.') },
      { type: 'chips', scene: thalesScene(n, 0.5, Math.floor(rng() * 360)), tokens: [...tk.good, ...tk.bad, '=', '='].sort(() => rng() - 0.5), groups: tk.good.map(g => [g]), prompt: t(`(${n.M}${n.N}) ∥ (${n.B}${n.C}). Écris l’égalité des trois rapports.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C}). Write the equality of the three ratios.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C}). اكتب متساوية النسب الثلاث.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C}). Escribe la igualdad de las tres razones.`), hint: thalesEqHint },
    ],
  };
}

function thalesCompute(seed: number): Activity {
  const rng = seeded(seed);
  const steps: Step[] = [];
  const summaries: string[] = [];
  for (const butterfly of [false, true]) {
    const n = pick(rng, TH_LETTERS);
    const k = pick(rng, butterfly ? [0.5, 0.4, 0.75] : [1 / 3, 0.5, 2 / 3, 0.4]);
    const AB = pick(rng, [6, 9, 10, 12, 15].filter(v => isTenth(v * k))), BC = pick(rng, [4, 7, 8, 10, 14]);
    const AM = Math.round(AB * k * 10) / 10, MN = BC * k;
    const exact = isTenth(MN);
    const tk = thalesTokens(n);
    const ids = { AM: side(n.A, n.M), AB: side(n.A, n.B), MN: side(n.M, n.N), BC: side(n.B, n.C) };
    const scene = thalesScene(n, butterfly ? -k : k, Math.floor(rng() * 360), { [ids.AB]: fmt(AB), [ids.BC]: fmt(BC), [ids.AM]: fmt(AM), [ids.MN]: '?' });
    steps.push(
      { type: 'chips', scene, tokens: [...tk.good, ...tk.bad, '=', '='].sort(() => rng() - 0.5), groups: tk.good.map(g => [g]), prompt: t(`(${n.M}${n.N}) ∥ (${n.B}${n.C})${butterfly ? ' (papillon)' : ''}. Écris l’égalité de Thalès.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C})${butterfly ? ' (butterfly)' : ''}. Write the intercept equality.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C})${butterfly ? ' (فراشة)' : ''}. اكتب متساوية طاليس.`, `(${n.M}${n.N}) ∥ (${n.B}${n.C})${butterfly ? ' (mariposa)' : ''}. Escribe la igualdad de Tales.`), hint: thalesEqHint },
      { type: 'number', scene, answer: MN, tolerance: exact ? 1e-6 : 0.06, prompt: t(`${tk.good[0]} = ${tk.good[2]}, donc ${fmt(AM)}/${fmt(AB)} = ${ids.MN}/${fmt(BC)}. Calcule ${ids.MN}${exact ? '' : ' (au dixième)'}.`, `${tk.good[0]} = ${tk.good[2]}, so ${fmt(AM)}/${fmt(AB)} = ${ids.MN}/${fmt(BC)}. Work out ${ids.MN}${exact ? '' : ' (to 1 d.p.)'}.`, `${tk.good[0]} = ${tk.good[2]}، إذن ${fmt(AM)}/${fmt(AB)} = ${ids.MN}/${fmt(BC)}. احسب ${ids.MN}.`, `${tk.good[0]} = ${tk.good[2]}, luego ${fmt(AM)}/${fmt(AB)} = ${ids.MN}/${fmt(BC)}. Calcula ${ids.MN}.`), hint: t(`Produit en croix : ${ids.MN} = ${fmt(AM)} × ${fmt(BC)} ÷ ${fmt(AB)}.`, `Cross-multiply: ${ids.MN} = ${fmt(AM)} × ${fmt(BC)} ÷ ${fmt(AB)}.`, `الجداء التقاطعي: ${ids.MN} = ${fmt(AM)} × ${fmt(BC)} ÷ ${fmt(AB)}.`, `Producto cruzado: ${ids.MN} = ${fmt(AM)} × ${fmt(BC)} ÷ ${fmt(AB)}.`) },
    );
    summaries.push(`${ids.MN} = ${fmt(AM)} × ${fmt(BC)} ÷ ${fmt(AB)} = ${fmt(MN)}`);
  }
  return { title: t('Calculer une longueur avec Thalès', 'Finding a length with the intercept theorem', 'حساب طول باستعمال طاليس', 'Calcular una longitud con Tales'), steps, summary: summaries.join(' · ') };
}

function thalesConverse(seed: number): Activity {
  const rng = seeded(seed);
  const steps: Step[] = [];
  for (const parallel of [true, false].sort(() => rng() - 0.5)) {
    const n = pick(rng, TH_LETTERS);
    const AB = pick(rng, [5, 8, 10, 12]), AC = pick(rng, [4, 6, 9, 15]);
    const k = pick(rng, [0.4, 0.5, 0.75]);
    const AM = AB * k, AN = parallel ? AC * k : Math.round(AC * (k + 0.1) * 10) / 10;
    const ids = { AM: side(n.A, n.M), AB: side(n.A, n.B), AN: side(n.A, n.N), AC: side(n.A, n.C) };
    const scene = thalesScene(n, k, Math.floor(rng() * 360), { [ids.AM]: fmt(AM), [ids.AB]: fmt(AB), [ids.AN]: fmt(AN), [ids.AC]: fmt(AC) }, parallel);
    const thm = [t('la réciproque du théorème de Thalès', 'the converse of the intercept theorem', 'المبرهنة العكسية لمبرهنة طاليس', 'el recíproco del teorema de Tales'), t('le théorème de Thalès', 'the intercept theorem', 'مبرهنة طاليس', 'el teorema de Tales'), t('la contraposée du théorème de Thalès', 'the contrapositive of the intercept theorem', 'العكس النقيض لمبرهنة طاليس', 'el contrarrecíproco del teorema de Tales')];
    steps.push(
      { type: 'number', scene, answer: AM / AB, tolerance: 0.006, prompt: t(`Calcule ${ids.AM}/${ids.AB} (fraction ou décimal au centième).`, `Work out ${ids.AM}/${ids.AB} (fraction or 2 d.p.).`, `احسب ${ids.AM}/${ids.AB} (كسر أو عدد عشري إلى الجزء من مائة).`, `Calcula ${ids.AM}/${ids.AB} (fracción o decimal a las centésimas).`), hint: t(`${fmt(AM)} ÷ ${fmt(AB)}`, `${fmt(AM)} ÷ ${fmt(AB)}`, `${fmt(AM)} ÷ ${fmt(AB)}`, `${fmt(AM)} ÷ ${fmt(AB)}`) },
      { type: 'number', scene, answer: AN / AC, tolerance: 0.006, prompt: t(`Calcule ${ids.AN}/${ids.AC}.`, `Work out ${ids.AN}/${ids.AC}.`, `احسب ${ids.AN}/${ids.AC}.`, `Calcula ${ids.AN}/${ids.AC}.`), hint: t(`${fmt(AN)} ÷ ${fmt(AC)}`, `${fmt(AN)} ÷ ${fmt(AC)}`, `${fmt(AN)} ÷ ${fmt(AC)}`, `${fmt(AN)} ÷ ${fmt(AC)}`) },
      {
        type: 'sentence', scene,
        prompt: t(`Les points ${n.A}, ${n.M}, ${n.B} et ${n.A}, ${n.N}, ${n.C} sont alignés dans le même ordre. Rédige la conclusion.`, `${n.A}, ${n.M}, ${n.B} and ${n.A}, ${n.N}, ${n.C} are collinear in the same order. Write the conclusion.`, `النقط ${n.A}، ${n.M}، ${n.B} و ${n.A}، ${n.N}، ${n.C} مستقيمية بنفس الترتيب. حرّر الاستنتاج.`, `${n.A}, ${n.M}, ${n.B} y ${n.A}, ${n.N}, ${n.C} están alineados en el mismo orden. Redacta la conclusión.`),
        parts: [t('D’après', 'By', 'حسب', 'Según'), { options: thm, answer: parallel ? [0] : [1, 2] }, t(`, les droites (${n.M}${n.N}) et (${n.B}${n.C})`, `, lines (${n.M}${n.N}) and (${n.B}${n.C})`, `، فإن المستقيمين (${n.M}${n.N}) و (${n.B}${n.C})`, `, las rectas (${n.M}${n.N}) y (${n.B}${n.C})`), { options: [t('sont parallèles', 'are parallel', 'متوازيان', 'son paralelas'), t('ne sont pas parallèles', 'are not parallel', 'غير متوازيين', 'no son paralelas')], answer: [parallel ? 0 : 1] }, t('.', '.', '.', '.')],
        hint: parallel ? t('Rapports égaux et points dans le même ordre → réciproque : parallèles.', 'Equal ratios, same order → converse: parallel.', 'نسب متساوية ونفس الترتيب ← المبرهنة العكسية: متوازيان.', 'Razones iguales y mismo orden → recíproco: paralelas.') : t('Rapports différents → les droites ne sont pas parallèles (théorème de Thalès ou sa contraposée).', 'Different ratios → not parallel (intercept theorem or its contrapositive).', 'نسب مختلفة ← غير متوازيين (مبرهنة طاليس أو عكسها النقيض).', 'Razones distintas → no son paralelas (teorema de Tales o su contrarrecíproco).'),
      },
    );
  }
  return { title: t('La réciproque du théorème de Thalès', 'The converse of the intercept theorem', 'المبرهنة العكسية لطاليس', 'El recíproco del teorema de Tales'), steps, summary: 'AM/AB = AN/AC (même ordre) ⇔ (MN) ∥ (BC)' };
}

function thalesScale(seed: number): Activity {
  const rng = seeded(seed);
  const [AB, AB2] = pick(rng, [[4, 6], [6, 9], [10, 4], [8, 12], [5, 3]] as const);
  const k = AB2 / AB;
  const side2 = pick(rng, [3, 5, 6, 7]), area = pick(rng, [12, 18, 20, 24]);
  const grow = k > 1;
  return {
    title: t('Agrandissement et réduction', 'Enlargement and reduction', 'التكبير والتصغير', 'Ampliación y reducción'),
    summary: `k = ${fmt(k)} · longueurs × k · aires × k²`,
    steps: [
      { type: 'number', answer: k, tolerance: 0.006, prompt: t(`Un triangle a un côté de ${AB} cm. Sur sa ${grow ? 'version agrandie' : 'version réduite'}, ce côté mesure ${AB2} cm. Quel est le coefficient k ?`, `A triangle has a ${AB} cm side. On its ${grow ? 'enlargement' : 'reduction'}, that side is ${AB2} cm. What is the scale factor k?`, `مثلث أحد أضلاعه ${AB} cm. في ${grow ? 'تكبيره' : 'تصغيره'} يصبح هذا الضلع ${AB2} cm. ما المعامل k؟`, `Un triángulo tiene un lado de ${AB} cm. En su ${grow ? 'ampliación' : 'reducción'}, ese lado mide ${AB2} cm. ¿Cuál es el coeficiente k?`), hint: t(`k = nouvelle longueur ÷ ancienne : ${AB2} ÷ ${AB}.`, `k = new length ÷ old length: ${AB2} ÷ ${AB}.`, `k = الطول الجديد ÷ القديم: ${AB2} ÷ ${AB}.`, `k = longitud nueva ÷ antigua: ${AB2} ÷ ${AB}.`) },
      { type: 'number', answer: side2 * k, tolerance: 0.006, prompt: t(`Un autre côté mesure ${side2} cm. Combien mesure-t-il après la transformation ?`, `Another side is ${side2} cm. How long is it after the transformation?`, `ضلع آخر طوله ${side2} cm. كم يصبح بعد التحويل؟`, `Otro lado mide ${side2} cm. ¿Cuánto mide después de la transformación?`), hint: t(`Les longueurs sont multipliées par k : ${side2} × ${fmt(k)}.`, `Lengths are multiplied by k: ${side2} × ${fmt(k)}.`, `الأطوال تُضرب في k: ${side2} × ${fmt(k)}.`, `Las longitudes se multiplican por k: ${side2} × ${fmt(k)}.`) },
      { type: 'number', answer: area * k * k, tolerance: 0.006, prompt: t(`L’aire du triangle de départ est ${area} cm². Quelle est l’aire après la transformation ?`, `The original area is ${area} cm². What is the area after the transformation?`, `مساحة المثلث الأصلي ${area} cm². ما مساحته بعد التحويل؟`, `El área inicial es ${area} cm². ¿Cuál es el área después?`), hint: t(`Les aires sont multipliées par k² : ${area} × ${fmt(k)}².`, `Areas are multiplied by k²: ${area} × ${fmt(k)}².`, `المساحات تُضرب في k²: ${area} × ${fmt(k)}².`, `Las áreas se multiplican por k²: ${area} × ${fmt(k)}².`) },
    ],
  };
}

// ═════════════ TRIGONOMÉTRIE ═════════════

/** Triangle rectangle en R, d'angle aigu marqué en V. */
function trigoTriangle(rng: Rng, n: [string, string, string], adj = 4, opp = 3) {
  const [r, v, w] = [...n].sort(() => rng() - 0.5) as [string, string, string];
  const pts = triangle([r, v, w], adj, opp, 90, Math.floor(rng() * 360));
  return { r, v, w, pts, hyp: side(v, w), adj: side(r, v), opp: side(r, w) };
}

function trigoVocabulary(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, LETTERS);
  const tr = trigoTriangle(rng, n);
  const scene = (angle: string): Scene => ({ points: tr.pts, segments: sides(n).map(s => ({ ...s, tappable: true })), rightAngles: [[tr.v, tr.r, tr.w]], angleMarks: [[angle === tr.v ? tr.r : tr.r, angle, angle === tr.v ? tr.w : tr.v]] });
  const ask = (what: L, angle: string, answer: string, hint: L): Step => ({ type: 'tap', scene: scene(angle), answer, prompt: t(`Pour l’angle ${angle} marqué, touche ${what.fr}.`, `For the marked angle ${angle}, tap ${what.en}.`, `بالنسبة للزاوية ${angle} المشار إليها، المس ${what.ar}.`, `Para el ángulo ${angle} marcado, toca ${what.es}.`), hint });
  const H = t('l’hypoténuse', 'the hypotenuse', 'الوتر', 'la hipotenusa'), O = t('le côté opposé', 'the opposite side', 'الضلع المقابل', 'el cateto opuesto'), A = t('le côté adjacent', 'the adjacent side', 'الضلع المجاور', 'el cateto contiguo');
  const oHint = t('Le côté opposé est en face de l’angle : il ne le touche pas.', 'The opposite side faces the angle: it does not touch it.', 'الضلع المقابل يواجه الزاوية ولا يلمسها.', 'El cateto opuesto está enfrente del ángulo: no lo toca.');
  const aHint = t('Le côté adjacent touche l’angle, mais ce n’est pas l’hypoténuse.', 'The adjacent side touches the angle but is not the hypotenuse.', 'الضلع المجاور يلمس الزاوية لكنه ليس الوتر.', 'El cateto contiguo toca el ángulo pero no es la hipotenusa.');
  return {
    title: t('Vocabulaire : opposé, adjacent, hypoténuse', 'Vocabulary: opposite, adjacent, hypotenuse', 'المفردات: المقابل والمجاور والوتر', 'Vocabulario: opuesto, contiguo, hipotenusa'),
    summary: `${tr.v} : opposé ${tr.opp}, adjacent ${tr.adj} · ${tr.w} : opposé ${tr.adj}, adjacent ${tr.opp}`,
    steps: [
      ask(H, tr.v, tr.hyp, hypHint), ask(O, tr.v, tr.opp, oHint), ask(A, tr.v, tr.adj, aHint),
      ask(O, tr.w, tr.adj, t('L’angle a changé : le côté opposé aussi !', 'The angle changed: so did the opposite side!', 'تغيرت الزاوية: وتغير الضلع المقابل أيضًا!', '¡El ángulo cambió: el cateto opuesto también!')), ask(A, tr.w, tr.opp, aHint),
    ],
  };
}

const RATIOS = ['cos', 'sin', 'tan'] as const;
const ratioNames = RATIOS.map(r => t(r, r, r, r === 'sin' ? 'sen' : r));
const KNOWN: Record<string, L> = { hyp: t('l’hypoténuse', 'the hypotenuse', 'الوتر', 'la hipotenusa'), opp: t('le côté opposé', 'the opposite side', 'الضلع المقابل', 'el cateto opuesto'), adj: t('le côté adjacent', 'the adjacent side', 'الضلع المجاور', 'el cateto contiguo') };
const ratioFor = (a: string, b: string) => { const s = [a, b].sort().join('+'); return s === 'adj+hyp' ? 0 : s === 'hyp+opp' ? 1 : 2; };
const sohcahtoa = t('cos = adjacent ÷ hypoténuse, sin = opposé ÷ hypoténuse, tan = opposé ÷ adjacent.', 'cos = adjacent ÷ hypotenuse, sin = opposite ÷ hypotenuse, tan = opposite ÷ adjacent.', 'cos = المجاور ÷ الوتر، sin = المقابل ÷ الوتر، tan = المقابل ÷ المجاور.', 'cos = contiguo ÷ hipotenusa, sen = opuesto ÷ hipotenusa, tan = opuesto ÷ contiguo.');

function trigoChoose(seed: number): Activity {
  const rng = seeded(seed);
  const pairs: [string, string][] = ([['hyp', 'adj'], ['hyp', 'opp'], ['adj', 'opp'], ['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']] as [string, string][]).sort(() => rng() - 0.5).slice(0, 4);
  return {
    title: t('Choisir le bon rapport', 'Choosing the right ratio', 'اختيار النسبة المناسبة', 'Elegir la razón correcta'),
    summary: 'cos = adj/hyp · sin = opp/hyp · tan = opp/adj',
    steps: pairs.map(([known, wanted]) => ({
      type: 'choice' as const, options: ratioNames, answer: ratioFor(known, wanted), hint: sohcahtoa,
      prompt: t(`Pour l’angle Â, on connaît ${KNOWN[known]!.fr} et on cherche ${KNOWN[wanted]!.fr}. Quel rapport utiliser ?`, `For angle Â, we know ${KNOWN[known]!.en} and want ${KNOWN[wanted]!.en}. Which ratio?`, `بالنسبة للزاوية Â، نعرف ${KNOWN[known]!.ar} ونبحث عن ${KNOWN[wanted]!.ar}. ما النسبة المناسبة؟`, `Para el ángulo Â, conocemos ${KNOWN[known]!.es} y buscamos ${KNOWN[wanted]!.es}. ¿Qué razón usamos?`),
    })),
  };
}

function trigoLength(seed: number): Activity {
  const rng = seeded(seed);
  const steps: Step[] = [];
  const summaries: string[] = [];
  for (const [known, wanted] of [['hyp', 'adj'], ['adj', 'hyp']] as const) {
    const n = pick(rng, LETTERS);
    const tr = trigoTriangle(rng, n);
    const angle = pick(rng, [25, 32, 40, 48, 55]);
    const value = pick(rng, [6, 7.5, 8, 9, 12]);
    const result = known === 'hyp' ? value * Math.cos(rad(angle)) : value / Math.cos(rad(angle));
    const name = { hyp: tr.hyp, adj: tr.adj, opp: tr.opp };
    const scene: Scene = { points: tr.pts, rightAngles: [[tr.v, tr.r, tr.w]], angleMarks: [[tr.r, tr.v, tr.w]], segments: [{ id: tr.hyp, a: tr.v, b: tr.w, text: known === 'hyp' ? fmt(value) : '?' }, { id: tr.adj, a: tr.r, b: tr.v, text: known === 'adj' ? fmt(value) : '?' }, { id: tr.opp, a: tr.r, b: tr.w }] };
    const cos = `cos ${tr.v}̂`;
    steps.push(
      { type: 'choice', scene, options: ratioNames, answer: 0, prompt: t(`${tr.v}̂ = ${angle}°. On connaît ${name[known]} et on cherche ${name[wanted]}. Quel rapport ?`, `${tr.v}̂ = ${angle}°. We know ${name[known]} and want ${name[wanted]}. Which ratio?`, `${tr.v}̂ = ${angle}°. نعرف ${name[known]} ونبحث عن ${name[wanted]}. ما النسبة؟`, `${tr.v}̂ = ${angle}°. Conocemos ${name[known]} y buscamos ${name[wanted]}. ¿Qué razón?`), hint: sohcahtoa },
      { type: 'chips', scene, tokens: [cos, `${tr.adj}/${tr.hyp}`, `${tr.opp}/${tr.hyp}`, `${tr.opp}/${tr.adj}`, '='], groups: [[cos], [`${tr.adj}/${tr.hyp}`]], prompt: t('Écris la formule.', 'Write the formula.', 'اكتب الصيغة.', 'Escribe la fórmula.'), hint: sohcahtoa },
      { type: 'number', scene, answer: result, tolerance: 0.06, prompt: t(`${tr.v}̂ = ${angle}°. Calcule ${name[wanted]}, arrondi au dixième.`, `${tr.v}̂ = ${angle}°. Work out ${name[wanted]} to one decimal place.`, `${tr.v}̂ = ${angle}°. احسب ${name[wanted]} مقربًا إلى الجزء من عشرة.`, `${tr.v}̂ = ${angle}°. Calcula ${name[wanted]} redondeado a las décimas.`), hint: known === 'hyp' ? t(`${name.adj} = ${name.hyp} × cos ${angle}° = ${fmt(value)} × cos ${angle}°.`, `${name.adj} = ${name.hyp} × cos ${angle}°.`, `${name.adj} = ${name.hyp} × cos ${angle}°.`, `${name.adj} = ${name.hyp} × cos ${angle}°.`) : t(`${name.hyp} = ${name.adj} ÷ cos ${angle}° = ${fmt(value)} ÷ cos ${angle}°.`, `${name.hyp} = ${name.adj} ÷ cos ${angle}°.`, `${name.hyp} = ${name.adj} ÷ cos ${angle}°.`, `${name.hyp} = ${name.adj} ÷ cos ${angle}°.`) },
    );
    summaries.push(`${name[wanted]} ≈ ${fmt(Math.round(result * 10) / 10)}`);
  }
  return { title: t('Calculer une longueur avec la trigonométrie', 'Finding a length with trigonometry', 'حساب طول باستعمال حساب المثلثات', 'Calcular una longitud con trigonometría'), steps, summary: summaries.join(' · ') };
}

function trigoAngle(seed: number): Activity {
  const rng = seeded(seed);
  const steps: Step[] = [];
  const summaries: string[] = [];
  for (const kind of ['tan', 'sin'] as const) {
    const n = pick(rng, LETTERS);
    const opp = pick(rng, [3, 4, 5, 7]), other = pick(rng, [8, 9, 10, 12]);
    const tr = trigoTriangle(rng, n, kind === 'tan' ? other : Math.sqrt(other * other - opp * opp), opp);
    const ratio = opp / other;
    const angle = deg(kind === 'tan' ? Math.atan(ratio) : Math.asin(ratio));
    const scene: Scene = { points: tr.pts, rightAngles: [[tr.v, tr.r, tr.w]], angleMarks: [[tr.r, tr.v, tr.w]], segments: [{ id: tr.opp, a: tr.r, b: tr.w, text: String(opp) }, kind === 'tan' ? { id: tr.adj, a: tr.r, b: tr.v, text: String(other) } : { id: tr.adj, a: tr.r, b: tr.v }, kind === 'sin' ? { id: tr.hyp, a: tr.v, b: tr.w, text: String(other) } : { id: tr.hyp, a: tr.v, b: tr.w }] };
    const given = kind === 'tan' ? tr.adj : tr.hyp;
    steps.push(
      { type: 'choice', scene, options: ratioNames, answer: kind === 'tan' ? 2 : 1, prompt: t(`On connaît ${tr.opp} et ${given}. Quel rapport donne l’angle ${tr.v}̂ ?`, `We know ${tr.opp} and ${given}. Which ratio gives angle ${tr.v}̂?`, `نعرف ${tr.opp} و ${given}. ما النسبة التي تعطي الزاوية ${tr.v}̂؟`, `Conocemos ${tr.opp} y ${given}. ¿Qué razón da el ángulo ${tr.v}̂?`), hint: sohcahtoa },
      { type: 'number', scene, answer: ratio, tolerance: 0.006, prompt: t(`Calcule ${kind} ${tr.v}̂ = ${tr.opp}/${given} (au centième).`, `Work out ${kind} ${tr.v}̂ = ${tr.opp}/${given} (to 2 d.p.).`, `احسب ${kind} ${tr.v}̂ = ${tr.opp}/${given} (إلى الجزء من مائة).`, `Calcula ${kind === 'sin' ? 'sen' : kind} ${tr.v}̂ = ${tr.opp}/${given} (a las centésimas).`), hint: t(`${opp} ÷ ${other}`, `${opp} ÷ ${other}`, `${opp} ÷ ${other}`, `${opp} ÷ ${other}`) },
      { type: 'number', scene, answer: angle, tolerance: 1, prompt: t(`Avec la touche ${kind}⁻¹ de la calculatrice, donne ${tr.v}̂ au degré près.`, `Using the ${kind}⁻¹ key, give ${tr.v}̂ to the nearest degree.`, `باستعمال الزر ${kind}⁻¹، أعط ${tr.v}̂ بالتقريب إلى الدرجة.`, `Con la tecla ${kind}⁻¹, da ${tr.v}̂ redondeado al grado.`), hint: t(`${tr.v}̂ = ${kind}⁻¹(${opp} ÷ ${other}), calculatrice en degrés.`, `${tr.v}̂ = ${kind}⁻¹(${opp} ÷ ${other}), calculator in degrees.`, `${tr.v}̂ = ${kind}⁻¹(${opp} ÷ ${other}) والآلة على الدرجات.`, `${tr.v}̂ = ${kind}⁻¹(${opp} ÷ ${other}), calculadora en grados.`) },
    );
    summaries.push(`${tr.v}̂ ≈ ${Math.round(angle)}°`);
  }
  return { title: t('Calculer un angle', 'Finding an angle', 'حساب زاوية', 'Calcular un ángulo'), steps, summary: summaries.join(' · ') };
}

// ═════════════ ANGLES INSCRITS ═════════════

const R = 4;
const onCircle = (d: number): P => ({ x: R * Math.cos(rad(d)), y: R * Math.sin(rad(d)) });

function inscribedRecognise(seed: number): Activity {
  const rng = seeded(seed);
  const options = [t('un angle inscrit', 'an inscribed angle', 'زاوية محيطية', 'un ángulo inscrito'), t('un angle au centre', 'a central angle', 'زاوية مركزية', 'un ángulo central'), t('ni l’un ni l’autre', 'neither', 'لا هذه ولا تلك', 'ninguno de los dos')];
  const kinds = (['inscribed', 'central', 'inside', 'inscribed2'] as const).slice().sort(() => rng() - 0.5).slice(0, 3);
  const steps: Step[] = kinds.map(kind => {
    const a = pick(rng, [200, 210, 225]), b = pick(rng, [315, 330, 340]);
    const vertex: P = kind === 'central' ? { x: 0, y: 0 } : kind === 'inside' ? { x: 0.8, y: 1.5 } : onCircle(pick(rng, [80, 100, 120]));
    const scene: Scene = { points: { O: { x: 0, y: 0 }, A: onCircle(a), B: onCircle(b), V: vertex }, segments: [{ id: 'VA', a: 'V', b: 'A', style: 'bold' }, { id: 'VB', a: 'V', b: 'B', style: 'bold' }], circle: { c: 'O', r: R }, angleMarks: [['A', 'V', 'B']], hidden: kind === 'central' ? ['V'] : [] };
    return {
      type: 'choice' as const, scene, options, answer: kind === 'central' ? 1 : kind === 'inside' ? 2 : 0,
      prompt: t('L’angle marqué est…', 'The marked angle is…', 'الزاوية المشار إليها هي…', 'El ángulo marcado es…'),
      hint: t('Inscrit : sommet sur le cercle, côtés qui recoupent le cercle. Au centre : sommet au centre O.', 'Inscribed: vertex on the circle, sides cutting the circle. Central: vertex at the centre O.', 'محيطية: رأسها على الدائرة وضلعاها يقطعان الدائرة. مركزية: رأسها في المركز O.', 'Inscrito: vértice en la circunferencia y lados que la cortan. Central: vértice en el centro O.'),
    };
  });
  const scene: Scene = { points: { O: { x: 0, y: 0 }, A: onCircle(210), B: onCircle(330), M: onCircle(100) }, segments: [{ id: 'MA', a: 'M', b: 'A', style: 'bold' }, { id: 'MB', a: 'M', b: 'B', style: 'bold' }], circle: { c: 'O', r: R }, angleMarks: [['A', 'M', 'B']], arcs: [{ id: 'small', start: 210, end: 330, text: '1', tappable: true }, { id: 'left', start: 100, end: 210, text: '2', tappable: true }, { id: 'right', start: 330, end: 460, text: '3', tappable: true }] };
  steps.push({ type: 'tap', scene, answer: 'small', prompt: t('Touche l’arc intercepté par l’angle inscrit AMB.', 'Tap the arc intercepted by the inscribed angle AMB.', 'المس القوس الذي تحصره الزاوية المحيطية AMB.', 'Toca el arco que abarca el ángulo inscrito AMB.'), hint: t('C’est l’arc entre A et B qui ne contient pas M.', 'It is the arc between A and B that does not contain M.', 'هو القوس بين A و B الذي لا يحتوي على M.', 'Es el arco entre A y B que no contiene M.') });
  return { title: t('Reconnaître angle inscrit et angle au centre', 'Recognising inscribed and central angles', 'التعرف على الزاوية المحيطية والمركزية', 'Reconocer ángulos inscritos y centrales'), steps, summary: 'inscrit : sommet sur le cercle · au centre : sommet en O · arc intercepté : entre les côtés' };
}

function inscribedProperty(seed: number): Activity {
  const problem = inscribedProblem(seed);
  return {
    title: t('Angle inscrit = moitié de l’angle au centre', 'Inscribed angle = half the central angle', 'الزاوية المحيطية = نصف المركزية', 'Ángulo inscrito = mitad del central'),
    summary: `AMB = AOB ÷ 2 · ${problem.askCentral}° → ${problem.askCentral / 2}° · ${problem.askInscribed}° → ${problem.askInscribed * 2}°`,
    steps: [
      { type: 'widget', widget: { kind: 'inscribed', problem }, prompt: t(`AOB = ${problem.central}°. Fais tourner M sur le cercle et regarde l’angle inscrit AMB.`, `AOB = ${problem.central}°. Move M round the circle and watch the inscribed angle AMB.`, `AOB = ${problem.central}°. حرّك M على الدائرة ولاحظ الزاوية المحيطية AMB.`, `AOB = ${problem.central}°. Mueve M por la circunferencia y mira el ángulo inscrito AMB.`), hint: t('Fais tourner M plus loin.', 'Move M further round.', 'حرّك M أكثر.', 'Mueve M más.') },
      { type: 'choice', options: [t('il ne change pas : c’est la moitié de AOB', 'it stays the same: half of AOB', 'لا تتغير: إنها نصف AOB', 'no cambia: es la mitad de AOB'), t('il grandit quand M s’éloigne de A', 'it grows as M moves away from A', 'تكبر كلما ابتعدت M عن A', 'crece cuando M se aleja de A'), t('il est égal à AOB', 'it equals AOB', 'تساوي AOB', 'es igual a AOB')], answer: 0, prompt: t('Qu’as-tu observé pour l’angle AMB ?', 'What did you notice about angle AMB?', 'ماذا لاحظت بالنسبة للزاوية AMB؟', '¿Qué observaste del ángulo AMB?'), hint: t('Regarde la valeur affichée pendant que M tourne.', 'Look at the value shown while M moves.', 'لاحظ القيمة المعروضة أثناء دوران M.', 'Mira el valor mostrado mientras M gira.') },
      { type: 'number', answer: problem.askCentral / 2, tolerance: 0, prompt: t(`Un angle au centre mesure ${problem.askCentral}°. Combien mesure un angle inscrit qui intercepte le même arc ?`, `A central angle is ${problem.askCentral}°. What is an inscribed angle on the same arc?`, `زاوية مركزية قياسها ${problem.askCentral}°. كم قياس زاوية محيطية تحصر نفس القوس؟`, `Un ángulo central mide ${problem.askCentral}°. ¿Cuánto mide un inscrito que abarca el mismo arco?`), hint: t(`${problem.askCentral} ÷ 2`, `${problem.askCentral} ÷ 2`, `${problem.askCentral} ÷ 2`, `${problem.askCentral} ÷ 2`) },
      { type: 'number', answer: problem.askInscribed * 2, tolerance: 0, prompt: t(`Un angle inscrit mesure ${problem.askInscribed}°. Combien mesure l’angle au centre qui intercepte le même arc ?`, `An inscribed angle is ${problem.askInscribed}°. What is the central angle on the same arc?`, `زاوية محيطية قياسها ${problem.askInscribed}°. كم قياس الزاوية المركزية التي تحصر نفس القوس؟`, `Un ángulo inscrito mide ${problem.askInscribed}°. ¿Cuánto mide el central que abarca el mismo arco?`), hint: t(`${problem.askInscribed} × 2`, `${problem.askInscribed} × 2`, `${problem.askInscribed} × 2`, `${problem.askInscribed} × 2`) },
    ],
  };
}

function inscribedSameArc(seed: number): Activity {
  const rng = seeded(seed);
  const x = pick(rng, [35, 42, 48, 55, 63]);
  const two: Scene = { points: { O: { x: 0, y: 0 }, A: onCircle(215), B: onCircle(325), M: onCircle(70), N: onCircle(140) }, segments: [{ id: 'MA', a: 'M', b: 'A' }, { id: 'MB', a: 'M', b: 'B' }, { id: 'NA', a: 'N', b: 'A', style: 'bold' }, { id: 'NB', a: 'N', b: 'B', style: 'bold' }], circle: { c: 'O', r: R }, angleMarks: [['A', 'M', 'B'], ['A', 'N', 'B']] };
  const diam: Scene = { points: { O: { x: 0, y: 0 }, A: onCircle(180), B: onCircle(0), M: onCircle(pick(rng, [60, 110, 135])) }, segments: [{ id: 'AB', a: 'A', b: 'B' }, { id: 'MA', a: 'M', b: 'A', style: 'bold' }, { id: 'MB', a: 'M', b: 'B', style: 'bold' }], circle: { c: 'O', r: R }, angleMarks: [['A', 'M', 'B']] };
  return {
    title: t('Angles qui interceptent le même arc', 'Angles on the same arc', 'زوايا تحصر نفس القوس', 'Ángulos que abarcan el mismo arco'),
    summary: `AMB = ANB = ${x}° · [AB] diamètre → AMB = 90°`,
    steps: [
      { type: 'choice', options: [t('égaux', 'equal', 'متساويتان', 'iguales'), t('supplémentaires', 'supplementary', 'متكاملتان', 'suplementarios'), t('complémentaires', 'complementary', 'متتامتان', 'complementarios')], answer: 0, scene: two, prompt: t('Deux angles inscrits qui interceptent le même arc sont…', 'Two inscribed angles on the same arc are…', 'زاويتان محيطيتان تحصران نفس القوس تكونان…', 'Dos ángulos inscritos que abarcan el mismo arco son…'), hint: t('Chacun vaut la moitié du même angle au centre AOB.', 'Each is half of the same central angle AOB.', 'كل منهما يساوي نصف نفس الزاوية المركزية AOB.', 'Cada uno es la mitad del mismo ángulo central AOB.') },
      { type: 'number', answer: x, tolerance: 0, scene: two, prompt: t(`AMB = ${x}°. Combien mesure ANB ?`, `AMB = ${x}°. What is ANB?`, `AMB = ${x}°. كم قياس ANB؟`, `AMB = ${x}°. ¿Cuánto mide ANB?`), hint: t('Même arc AB → même angle inscrit.', 'Same arc AB → same inscribed angle.', 'نفس القوس AB ← نفس الزاوية المحيطية.', 'Mismo arco AB → mismo ángulo inscrito.') },
      { type: 'number', answer: 90, tolerance: 0, scene: diam, prompt: t('[AB] est un diamètre. Combien mesure l’angle AMB ?', '[AB] is a diameter. What is angle AMB?', '[AB] قطر. كم قياس الزاوية AMB؟', '[AB] es un diámetro. ¿Cuánto mide el ángulo AMB?'), hint: t('L’angle au centre AOB est plat : 180°. L’angle inscrit en est la moitié.', 'The central angle AOB is a straight angle: 180°. The inscribed angle is half of it.', 'الزاوية المركزية AOB مستقيمة: 180°. والزاوية المحيطية نصفها.', 'El ángulo central AOB es llano: 180°. El inscrito es la mitad.') },
    ],
  };
}

// ═════════════ Registre ═════════════

const GEOMETRY_SKILLS: Skill[] = [
  { id: 'pyth-recognise', review: 0, chapter: 'pythagoras', build: pythRecognise, title: t('Reconnaître un triangle rectangle', 'Recognise a right triangle', 'التعرف على مثلث قائم', 'Reconocer un triángulo rectángulo'), desc: t('L’équerre, l’angle droit, l’hypoténuse.', 'Set square, right angle, hypotenuse.', 'الكوس، الزاوية القائمة، الوتر.', 'Escuadra, ángulo recto, hipotenusa.') },
  { id: 'pyth-discover', review: 2, chapter: 'pythagoras', build: pythDiscover, title: t('Découvrir l’égalité', 'Discover the equality', 'اكتشاف المتساوية', 'Descubrir la igualdad'), desc: t('Remplir le grand carré avec les deux petits.', 'Fill the big square with the two small ones.', 'ملء المربع الكبير بالمربعين الصغيرين.', 'Llenar el cuadrado grande con los dos pequeños.') },
  { id: 'pyth-compute', review: 5, chapter: 'pythagoras', build: pythCompute, title: t('Calculer une longueur', 'Find a length', 'حساب طول', 'Calcular una longitud'), desc: t('L’hypoténuse ou un autre côté.', 'The hypotenuse or another side.', 'الوتر أو ضلع آخر.', 'La hipotenusa u otro lado.') },
  { id: 'pyth-converse', review: -1, chapter: 'pythagoras', build: pythConverse, title: t('La réciproque', 'The converse', 'المبرهنة العكسية', 'El recíproco'), desc: t('Prouver qu’un triangle est rectangle… ou pas.', 'Prove a triangle is right-angled… or not.', 'إثبات أن مثلثًا قائم… أو لا.', 'Probar que un triángulo es rectángulo… o no.') },
  { id: 'pyth-problem', review: -1, chapter: 'pythagoras', build: pythProblem, title: t('Problème en situation', 'Real-life problem', 'مسألة من الحياة', 'Problema contextualizado'), desc: t('Échelle, écran, raccourci.', 'Ladder, screen, shortcut.', 'سلم، شاشة، طريق مختصر.', 'Escalera, pantalla, atajo.') },
  { id: 'thales-recognise', review: 0, chapter: 'thales', build: thalesRecognise, title: t('Reconnaître la configuration', 'Recognise the configuration', 'التعرف على التشكيل', 'Reconocer la configuración'), desc: t('Triangle emboîté ou papillon.', 'Nested triangles or butterfly.', 'مثلث متداخل أو فراشة.', 'Triángulos encajados o mariposa.') },
  { id: 'thales-equality', review: 1, chapter: 'thales', build: thalesEquality, title: t('Écrire l’égalité', 'Write the equality', 'كتابة المتساوية', 'Escribir la igualdad'), desc: t('Les trois rapports qui se correspondent.', 'The three matching ratios.', 'النسب الثلاث المتوافقة.', 'Las tres razones que se corresponden.') },
  { id: 'thales-compute', review: 3, chapter: 'thales', build: thalesCompute, title: t('Calculer une longueur', 'Find a length', 'حساب طول', 'Calcular una longitud'), desc: t('Produit en croix, aussi en papillon.', 'Cross-multiplying, butterfly too.', 'الجداء التقاطعي، والفراشة أيضًا.', 'Producto cruzado, también en mariposa.') },
  { id: 'thales-converse', review: 2, chapter: 'thales', build: thalesConverse, title: t('La réciproque', 'The converse', 'المبرهنة العكسية', 'El recíproco'), desc: t('Prouver que deux droites sont parallèles… ou pas.', 'Prove two lines are parallel… or not.', 'إثبات أن مستقيمين متوازيان… أو لا.', 'Probar que dos rectas son paralelas… o no.') },
  { id: 'thales-scale', review: 0, chapter: 'thales', build: thalesScale, title: t('Agrandir et réduire', 'Enlarge and reduce', 'التكبير والتصغير', 'Ampliar y reducir'), desc: t('Longueurs × k, aires × k².', 'Lengths × k, areas × k².', 'الأطوال × k، المساحات × k².', 'Longitudes × k, áreas × k².') },
  { id: 'trigo-vocabulary', review: 1, chapter: 'trigo', build: trigoVocabulary, title: t('Opposé, adjacent, hypoténuse', 'Opposite, adjacent, hypotenuse', 'المقابل، المجاور، الوتر', 'Opuesto, contiguo, hipotenusa'), desc: t('Nommer les côtés selon l’angle.', 'Name the sides from the angle.', 'تسمية الأضلاع حسب الزاوية.', 'Nombrar los lados según el ángulo.') },
  { id: 'trigo-choose', review: 0, chapter: 'trigo', build: trigoChoose, title: t('Choisir cos, sin ou tan', 'Choose cos, sin or tan', 'اختيار cos أو sin أو tan', 'Elegir cos, sen o tan'), desc: t('Selon ce qu’on connaît et ce qu’on cherche.', 'From what we know and what we want.', 'حسب المعطى والمطلوب.', 'Según lo que conocemos y buscamos.') },
  { id: 'trigo-length', review: 2, chapter: 'trigo', build: trigoLength, title: t('Calculer une longueur', 'Find a length', 'حساب طول', 'Calcular una longitud'), desc: t('Multiplier ou diviser par le cosinus.', 'Multiply or divide by the cosine.', 'الضرب أو القسمة على جيب التمام.', 'Multiplicar o dividir por el coseno.') },
  { id: 'trigo-angle', review: 2, chapter: 'trigo', build: trigoAngle, title: t('Calculer un angle', 'Find an angle', 'حساب زاوية', 'Calcular un ángulo'), desc: t('Avec cos⁻¹, sin⁻¹ ou tan⁻¹.', 'With cos⁻¹, sin⁻¹ or tan⁻¹.', 'باستعمال cos⁻¹ أو sin⁻¹ أو tan⁻¹.', 'Con cos⁻¹, sen⁻¹ o tan⁻¹.') },
  { id: 'inscribed-recognise', review: -1, chapter: 'inscribed', build: inscribedRecognise, title: t('Reconnaître les angles', 'Recognise the angles', 'التعرف على الزوايا', 'Reconocer los ángulos'), desc: t('Inscrit, au centre, arc intercepté.', 'Inscribed, central, intercepted arc.', 'محيطية، مركزية، القوس المحصور.', 'Inscrito, central, arco abarcado.') },
  { id: 'inscribed-property', review: 2, chapter: 'inscribed', build: inscribedProperty, title: t('La propriété', 'The property', 'الخاصية', 'La propiedad'), desc: t('Inscrit = moitié de l’angle au centre.', 'Inscribed = half the central angle.', 'المحيطية = نصف المركزية.', 'Inscrito = mitad del central.') },
  { id: 'inscribed-same-arc', review: 2, chapter: 'inscribed', build: inscribedSameArc, title: t('Même arc, demi-cercle', 'Same arc, semicircle', 'نفس القوس، نصف الدائرة', 'Mismo arco, semicírculo'), desc: t('Angles égaux ; angle droit dans un demi-cercle.', 'Equal angles; right angle in a semicircle.', 'زوايا متساوية؛ زاوية قائمة في نصف دائرة.', 'Ángulos iguales; ángulo recto en un semicírculo.') },
];

export const SKILLS: Skill[] = [...GEOMETRY_SKILLS, ...NUMBER_SKILLS, ...LYCEE_SKILLS, ...FRACTION_SKILLS, ...SIXIEME_SKILLS, ...RELATIVE_DATA_SKILLS, ...CALCUL_FIGURE_SKILLS, ...CINQUIEME_SKILLS, ...QUATRIEME_SKILLS, ...TROISIEME_SKILLS, ...SECONDE_SKILLS, ...PREMIERE_SKILLS, ...LIMIT_SKILLS, ...TERMINALE_SKILLS, ...TERMINALE_END_SKILLS];
export const skillsFor = (chapter: FigureKind) => SKILLS.filter(s => s.chapter === chapter);
export const getSkill = (id: string) => SKILLS.find(s => s.id === id) ?? null;
export const skillNotion = (skill: Skill): NotionId => FIGURE_NOTIONS[skill.chapter][0]!;
/** L'étape d'une activité reprise dans les mini-contrôles. */
export const reviewStep = (skill: Skill, seed: number): Step => { const steps = skill.build(seed).steps; return steps.at(skill.review)!; };

// ───────────── Acquis, à revoir, mini-contrôles ─────────────

export type SkillStatus = 'mastered' | 'started' | 'review' | 'todo';
type SkillAttempt = { skill?: string | undefined; review?: boolean | undefined; series?: number | undefined; correct: number; total: number; date: string };
const DAY = 86400000;
/** Premier mini-contrôle 3 jours après l'acquisition, puis l'écart double à chaque réussite (au plus 30 jours). */
export const REVIEW_DAYS = 3;
export type SkillState = { status: SkillStatus; due: boolean; since: string | null; reviews: number };

/**
 * Acquis : une activité complète réussie du premier coup. Un mini-contrôle raté fait passer la compétence
 * « à revoir » jusqu'à la prochaine activité complète sans faute. Les tentatives sont dans l'ordre chronologique.
 */
export function skillState(attempts: SkillAttempt[], id: string, now = Date.now()): SkillState {
  // Les séries d'entraînement (niveaux 2 et 3) ne changent pas l'état d'acquisition.
  const mine = attempts.filter(a => a.skill === id && !a.series);
  let mastered = false, failed = false, since: string | null = null, reviews = 0;
  for (const a of mine) {
    const perfect = a.correct === a.total;
    if (!a.review) { if (perfect) { mastered = true; failed = false; since = a.date; reviews = 0; } }
    else if (perfect) { if (mastered) { reviews++; since = a.date; } }
    else { mastered = false; failed = true; }
  }
  const status: SkillStatus = mastered ? 'mastered' : failed ? 'review' : mine.length ? 'started' : 'todo';
  const wait = Math.min(30, REVIEW_DAYS * 2 ** reviews) * DAY;
  return { status, due: mastered && since !== null && now - Date.parse(since) >= wait, since, reviews };
}
export const skillStatus = (attempts: SkillAttempt[], id: string): SkillStatus => skillState(attempts, id).status;

/** Les compétences à revérifier, la plus anciennement validée d'abord (au plus `max`). */
export function dueReviews(attempts: SkillAttempt[], now = Date.now(), max = 4): Skill[] {
  return SKILLS
    .map(s => ({ s, st: skillState(attempts, s.id, now) }))
    .filter(x => x.st.due)
    .sort((a, b) => Date.parse(a.st.since!) - Date.parse(b.st.since!))
    .slice(0, max).map(x => x.s);
}


/**
 * La prochaine compétence à travailler : dans le chapitre touché le plus récemment (sinon le premier proposé),
 * une compétence « à revoir », sinon la première pas encore acquise. Null si tout est acquis.
 */
export function nextSkill(attempts: SkillAttempt[], chapters: FigureKind[]): { skill: Skill; resumed: boolean } | null {
  const open = (k: FigureKind) => skillsFor(k).some(s => skillStatus(attempts, s.id) !== 'mastered');
  const last = [...attempts].reverse().map(a => a.skill && getSkill(a.skill)).find(s => s && chapters.includes(s.chapter) && open(s.chapter));
  const chapter = last ? last.chapter : chapters.find(open);
  if (!chapter) return null;
  const skills = skillsFor(chapter);
  const skill = skills.find(s => skillStatus(attempts, s.id) === 'review') ?? skills.find(s => skillStatus(attempts, s.id) !== 'mastered')!;
  return { skill, resumed: Boolean(last) };
}
