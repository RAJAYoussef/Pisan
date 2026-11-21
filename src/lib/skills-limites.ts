// Parcours « Limites et continuité » (1ère au Maroc, en Côte d'Ivoire et au Sénégal ; Terminale partout) :
// limites à l'infini, limites en un point, asymptotes, théorème des valeurs intermédiaires.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Rng, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const rel = (v: number) => (v < 0 ? `−${String(-v).replace('.', ',')}` : String(v).replace('.', ','));
const signed = (v: number) => (v < 0 ? ` − ${String(-v).replace('.', ',')}` : ` + ${String(v).replace('.', ',')}`);
const LIMS = [same('+∞'), same('−∞'), same('0')];
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}

function limInfinity(seed: number): Activity {
  const rng = seeded(seed);
  const c = pick(rng, [1, 2, 3]), q = pick(rng, [-3, -2, 1, 2, 4]), a = c * q, b = int(rng, -6, 6) || 1, d = int(rng, -5, 5) || 2;
  const k = pick(rng, [-3, -2, 2, 4]), m = int(rng, 1, 9);
  const pos = k > 0;
  return {
    title: t('Limites à l’infini', 'Limits at infinity', 'النهايات عند اللانهاية', 'Límites en el infinito'),
    summary: `(${rel(a)}x${signed(b)}) / (${c === 1 ? '' : c}x${signed(d)}) → ${rel(q)} · ${rel(k)}x³ + ${m}x → ${pos ? '+∞' : '−∞'}`,
    steps: [
      { type: 'number', answer: q, tolerance: 0, prompt: t(`Limite en +∞ de f(x) = (${rel(a)}x${signed(b)}) / (${c === 1 ? '' : c}x${signed(d)}) ?`, `Limit at +∞ of f(x) = (${rel(a)}x${signed(b)}) / (${c === 1 ? '' : c}x${signed(d)})?`, `نهاية f عند +∞؟`, `¿Límite de f en +∞?`), hint: t('En +∞, seuls les termes de plus haut degré comptent : ax ÷ cx = a ÷ c.', 'At +∞ only the highest-degree terms matter: ax ÷ cx = a ÷ c.', 'الحدود ذات أعلى درجة فقط.', 'Solo cuentan los términos de mayor grado.') },
      { type: 'choice', ...choices(rng, [same(pos ? '+∞' : '−∞'), same(pos ? '−∞' : '+∞'), same('0')]), prompt: t(`Limite en +∞ de g(x) = ${rel(k)}x³ + ${m}x ?`, `Limit at +∞ of g(x) = ${rel(k)}x³ + ${m}x?`, `نهاية g عند +∞؟`, `¿Límite de g en +∞?`), hint: t(`Un polynôme se comporte comme son terme de plus haut degré : ${rel(k)}x³.`, `A polynomial behaves like its leading term: ${rel(k)}x³.`, `الحدودية تتصرف كحدها الأعلى.`, `Se comporta como su término principal.`) },
    ],
  };
}

function limPoint(seed: number): Activity {
  const rng = seeded(seed);
  const c = int(rng, -4, 5), right = rng() < 0.5, num = pick(rng, [1, 2, 3, 5]);
  const sq = rng() < 0.4;
  return {
    title: t('Limites en un point', 'Limits at a point', 'النهايات في نقطة', 'Límites en un punto'),
    summary: `${num}/(x${signed(-c)}) en ${rel(c)}${right ? '⁺' : '⁻'} → ${right ? '+∞' : '−∞'} · ${num}/(x${signed(-c)})² → +∞`,
    steps: [
      { type: 'choice', ...choices(rng, [same(right ? '+∞' : '−∞'), same(right ? '−∞' : '+∞'), same('0')]), prompt: t(`Limite de ${num}/(x${signed(-c)}) quand x tend vers ${rel(c)} par ${right ? 'la droite (x > ' : 'la gauche (x < '}${rel(c)}) ?`, `Limit of ${num}/(x${signed(-c)}) as x → ${rel(c)} from the ${right ? 'right' : 'left'}?`, `النهاية عندما x يؤول إلى ${rel(c)}؟`, `¿Límite cuando x → ${rel(c)}?`), hint: t(`Le dénominateur tend vers 0 en restant ${right ? 'positif' : 'négatif'} : on divise ${num} par un nombre minuscule ${right ? 'positif' : 'négatif'}.`, `The denominator tends to 0 staying ${right ? 'positive' : 'negative'}.`, `المقام يؤول إلى 0.`, `El denominador tiende a 0.`) },
      { type: 'choice', options: LIMS, answer: sq ? 0 : 2, prompt: sq ? t(`Limite de ${num}/(x${signed(-c)})² en ${rel(c)} ?`, `Limit of ${num}/(x${signed(-c)})² at ${rel(c)}?`, `النهاية في ${rel(c)}؟`, `¿Límite en ${rel(c)}?`) : t(`Limite de ${num}/x² en +∞ ?`, `Limit of ${num}/x² at +∞?`, `نهاية ${num}/x² عند +∞؟`, `¿Límite de ${num}/x² en +∞?`), hint: sq ? t('Un carré est positif : le dénominateur tend vers 0⁺ des deux côtés.', 'A square is positive: the denominator tends to 0⁺ on both sides.', 'المربع موجب.', 'Un cuadrado es positivo.') : t('On divise par un nombre de plus en plus grand.', 'Dividing by bigger and bigger numbers.', 'نقسم على عدد يكبر.', 'Dividimos por números cada vez mayores.') },
    ],
  };
}

function limAsymptote(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [-3, -2, -1, 1, 2, 3, 4]), c = int(rng, -4, 4), b = int(rng, -5, 5);
  const fixedB = a * c + b === 0 ? b + 1 : b;
  return {
    title: t('Asymptotes', 'Asymptotes', 'المقاربات', 'Asíntotas'),
    summary: `f(x) = (${rel(a)}x${signed(fixedB)}) / (x${signed(-c)}) : asymptote horizontale y = ${rel(a)}, verticale x = ${rel(c)}`,
    steps: [
      { type: 'number', answer: a, tolerance: 0, prompt: t(`f(x) = (${rel(a)}x${signed(fixedB)}) / (x${signed(-c)}). Sa courbe a une asymptote horizontale y = k en +∞. Que vaut k ?`, `f(x) = (${rel(a)}x${signed(fixedB)}) / (x${signed(-c)}). Its graph has a horizontal asymptote y = k at +∞. What is k?`, `ما قيمة k؟`, `¿Cuánto vale k?`), hint: t('Asymptote horizontale y = k ⇔ lim f = k en l’infini.', 'Horizontal asymptote y = k ⇔ lim f = k at infinity.', 'y = k ⇔ lim f = k.', 'y = k ⇔ lim f = k.') },
      { type: 'number', answer: c, tolerance: 0, prompt: t('Et l’asymptote verticale x = m : que vaut m ?', 'And the vertical asymptote x = m: what is m?', 'والمقارب العمودي x = m؟', '¿Y la asíntota vertical x = m?'), hint: t('Là où le dénominateur s’annule (et pas le numérateur) : f tend vers ±∞.', 'Where the denominator is zero (and not the numerator): f tends to ±∞.', 'حيث ينعدم المقام.', 'Donde se anula el denominador.') },
    ],
  };
}

function limIvt(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -3, 0), b = a + int(rng, 2, 4), fa = -int(rng, 1, 5), fb = int(rng, 1, 6), k = fb + int(rng, 1, 4);
  return {
    title: t('Théorème des valeurs intermédiaires', 'Intermediate value theorem', 'مبرهنة القيم الوسيطية', 'Teorema de los valores intermedios'),
    summary: `f continue et strictement croissante sur [${rel(a)} ; ${rel(b)}], f(${rel(a)}) = ${rel(fa)} < 0 < f(${rel(b)}) = ${fb} : une seule solution de f(x) = 0`,
    steps: [
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 1, prompt: t(`f est continue et strictement croissante sur [${rel(a)} ; ${rel(b)}], f(${rel(a)}) = ${rel(fa)} et f(${rel(b)}) = ${fb}. Combien de solutions a f(x) = 0 sur cet intervalle ?`, `f is continuous and strictly increasing on [${rel(a)}, ${rel(b)}], f(${rel(a)}) = ${rel(fa)} and f(${rel(b)}) = ${fb}. How many solutions does f(x) = 0 have there?`, `كم حلًا للمعادلة f(x) = 0؟`, `¿Cuántas soluciones tiene f(x) = 0?`), hint: t('0 est entre f(a) et f(b) : au moins une solution (continuité) ; strictement croissante : au plus une.', '0 lies between f(a) and f(b): at least one (continuity); strictly increasing: at most one.', 'حل واحد على الأقل وعلى الأكثر.', 'Al menos una y como mucho una.') },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 0, prompt: t(`Et f(x) = ${k} ?`, `And f(x) = ${k}?`, `و f(x) = ${k}؟`, `¿Y f(x) = ${k}?`), hint: t(`Sur l’intervalle, f prend ses valeurs entre ${rel(fa)} et ${fb}.`, `On the interval, f takes values between ${rel(fa)} and ${fb}.`, `قيم f بين ${rel(fa)} و ${fb}.`, `f toma valores entre ${rel(fa)} y ${fb}.`) },
      { type: 'choice', options: [same('[0 ; 0,5]'), same('[0,5 ; 1]')], answer: 1, prompt: t('g(x) = x³ + x − 1 s’annule entre 0 et 1, et g(0,5) = −0,375. Dans quelle moitié est la solution ?', 'g(x) = x³ + x − 1 is zero between 0 and 1, and g(0.5) = −0.375. Which half holds the solution?', 'في أي نصف يوجد الحل؟', '¿En qué mitad está la solución?'), hint: t('g(1) = 1 > 0 et g(0,5) < 0 : le changement de signe se fait entre 0,5 et 1 (dichotomie).', 'g(1) = 1 > 0 and g(0.5) < 0: the sign changes between 0.5 and 1 (bisection).', 'تغير الإشارة بين 0,5 و 1.', 'El cambio de signo está entre 0,5 y 1.') },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const LIMIT_SKILLS: Skill[] = [
  { id: 'lim-infinity', review: 0, chapter: 'limits', build: limInfinity, title: s('Limites à l’infini', 'Limits at infinity', 'النهايات عند اللانهاية', 'Límites en el infinito'), desc: s('Le terme qui domine.', 'The dominant term.', 'الحد المهيمن.', 'El término dominante.') },
  { id: 'lim-point', review: 0, chapter: 'limits', build: limPoint, title: s('Limites en un point', 'Limits at a point', 'النهايات في نقطة', 'Límites en un punto'), desc: s('Diviser par presque 0.', 'Dividing by almost 0.', 'القسمة على ما يقارب 0.', 'Dividir por casi 0.') },
  { id: 'lim-asymptote', review: 0, chapter: 'limits', build: limAsymptote, title: s('Asymptotes', 'Asymptotes', 'المقاربات', 'Asíntotas'), desc: s('Horizontale et verticale.', 'Horizontal and vertical.', 'أفقي وعمودي.', 'Horizontal y vertical.') },
  { id: 'lim-ivt', review: 0, chapter: 'limits', build: limIvt, title: s('Valeurs intermédiaires', 'Intermediate values', 'القيم الوسيطية', 'Valores intermedios'), desc: s('Continuité et dichotomie.', 'Continuity and bisection.', 'الاتصال والتفرع الثنائي.', 'Continuidad y bisección.') },
];
