// Parcours de 2nde (FR, CI, SN), Tronc commun (MA) et Grade 10 (CCSS) : intervalles et valeur absolue,
// fonctions de référence, tableaux de signes, équations de droites, quartiles et écart type,
// probabilités sur un ensemble fini, cercle trigonométrique.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx et src/test/server-grading.test.ts.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Grid, type P, type Rng, type Scene, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const rel = (v: number) => (v < 0 ? `−${-v}` : String(v)).replace('.', ',');
const plus = (b: number) => (b < 0 ? ` − ${String(-b).replace('.', ',')}` : ` + ${String(b).replace('.', ',')}`);
const dec = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}

// ═════════════ INTERVALLES ET VALEUR ABSOLUE ═════════════

function intNotation(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -6, 2), b = a + int(rng, 3, 7);
  const ineq = choices(rng, [same(`${rel(a)} ≤ x < ${rel(b)}`), same(`${rel(a)} < x ≤ ${rel(b)}`), same(`${rel(a)} ≤ x ≤ ${rel(b)}`)]);
  const v = pick(rng, [a, b]);
  return {
    title: t('Écrire un intervalle', 'Interval notation', 'كتابة مجال', 'Notación de intervalos'),
    summary: `x ∈ [${rel(a)} ; ${rel(b)}[ ⇔ ${rel(a)} ≤ x < ${rel(b)} : crochet tourné vers l’intérieur = borne comprise`,
    steps: [
      { type: 'choice', ...ineq, prompt: t(`x ∈ [${rel(a)} ; ${rel(b)}[ signifie…`, `x ∈ [${rel(a)}, ${rel(b)}) means…`, `x ∈ [${rel(a)} ; ${rel(b)}[ تعني…`, `x ∈ [${rel(a)} ; ${rel(b)}[ significa…`), hint: t('Un crochet tourné vers le nombre l’inclut (≤) ; tourné vers l’extérieur, il l’exclut (<).', 'A bracket facing the number includes it (≤); facing away excludes it (<).', 'القوس المتجه نحو العدد يشمله.', 'El corchete hacia el número lo incluye.') },
      { type: 'choice', options: OUI_NON, answer: v === a ? 0 : 1, prompt: t(`${rel(v)} appartient-il à [${rel(a)} ; ${rel(b)}[ ?`, `Is ${rel(v)} in [${rel(a)}, ${rel(b)})?`, `هل ${rel(v)} ينتمي إلى [${rel(a)} ; ${rel(b)}[؟`, `¿${rel(v)} pertenece a [${rel(a)} ; ${rel(b)}[?`), hint: t('Regarde le crochet du côté de ce nombre.', 'Look at the bracket on that side.', 'انظر إلى القوس من جهة هذا العدد.', 'Mira el corchete de ese lado.') },
      { type: 'number', answer: b - a, tolerance: 0, prompt: t(`Combien d’entiers relatifs appartiennent à [${rel(a)} ; ${rel(b)}[ ?`, `How many integers are in [${rel(a)}, ${rel(b)})?`, `كم عددًا صحيحًا ينتمي إلى [${rel(a)} ; ${rel(b)}[؟`, `¿Cuántos enteros hay en [${rel(a)} ; ${rel(b)}[?`), hint: t(`De ${rel(a)} (compris) à ${rel(b)} (exclu) : ${rel(a)}, ${rel(a + 1)}, …, ${rel(b - 1)}.`, `From ${rel(a)} (in) to ${rel(b)} (out).`, `من ${rel(a)} إلى ${rel(b - 1)}.`, `De ${rel(a)} a ${rel(b - 1)}.`) },
    ],
  };
}

function intUnion(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -5, 0), b = a + int(rng, 3, 5), c = a + int(rng, 1, 2), d = b + int(rng, 1, 3);
  const inter = choices(rng, [same(`[${rel(c)} ; ${rel(b)}]`), same(`[${rel(a)} ; ${rel(d)}]`), same(`[${rel(a)} ; ${rel(c)}]`)]);
  const uni = choices(rng, [same(`[${rel(a)} ; ${rel(d)}]`), same(`[${rel(c)} ; ${rel(b)}]`), same(`[${rel(b)} ; ${rel(d)}]`)]);
  return {
    title: t('Intersection et réunion', 'Intersection and union', 'التقاطع والاتحاد', 'Intersección y unión'),
    summary: `[${rel(a)} ; ${rel(b)}] ∩ [${rel(c)} ; ${rel(d)}] = [${rel(c)} ; ${rel(b)}] · ∪ = [${rel(a)} ; ${rel(d)}]`,
    steps: [
      { type: 'choice', ...inter, prompt: t(`[${rel(a)} ; ${rel(b)}] ∩ [${rel(c)} ; ${rel(d)}] = ?`, `[${rel(a)}, ${rel(b)}] ∩ [${rel(c)}, ${rel(d)}] = ?`, `[${rel(a)} ; ${rel(b)}] ∩ [${rel(c)} ; ${rel(d)}] = ؟`, `[${rel(a)} ; ${rel(b)}] ∩ [${rel(c)} ; ${rel(d)}] = ?`), hint: t('∩ (« et ») : les nombres qui sont dans les deux intervalles à la fois.', '∩ (“and”): numbers in both intervals.', '∩: الأعداد المشتركة.', '∩: los números comunes.') },
      { type: 'choice', ...uni, prompt: t(`Et [${rel(a)} ; ${rel(b)}] ∪ [${rel(c)} ; ${rel(d)}] ?`, `And the union?`, `والاتحاد؟`, `¿Y la unión?`), hint: t('∪ (« ou ») : les nombres qui sont dans l’un ou dans l’autre.', '∪ (“or”): numbers in either one.', '∪: في أحدهما.', '∪: en uno u otro.') },
    ],
  };
}

function intAbs(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -4, 6), r = int(rng, 1, 4), p = int(rng, -8, 8), q = p + pick(rng, [-7, -5, -3, 4, 6, 9]);
  const set = choices(rng, [same(`[${rel(a - r)} ; ${rel(a + r)}]`), same(`[${rel(a - r)} ; ${rel(a)}]`), same(`[${rel(a)} ; ${rel(a + r)}]`)]);
  return {
    title: t('Valeur absolue et distance', 'Absolute value and distance', 'القيمة المطلقة والمسافة', 'Valor absoluto y distancia'),
    summary: `|${rel(p)} − (${rel(q)})| = ${Math.abs(p - q)} · |x − ${rel(a)}| ≤ ${r} ⇔ x ∈ [${rel(a - r)} ; ${rel(a + r)}]`,
    steps: [
      { type: 'number', answer: Math.abs(p - q), tolerance: 0, prompt: t(`Quelle est la distance entre ${rel(p)} et ${rel(q)}, c’est-à-dire |${rel(p)} − (${rel(q)})| ?`, `What is the distance between ${rel(p)} and ${rel(q)}, i.e. |${rel(p)} − (${rel(q)})|?`, `ما المسافة بين ${rel(p)} و ${rel(q)}؟`, `¿Distancia entre ${rel(p)} y ${rel(q)}?`), hint: t('Une distance est toujours positive : on soustrait, puis on enlève le signe.', 'A distance is never negative: subtract, then drop the sign.', 'المسافة دائمًا موجبة.', 'Una distancia es positiva.') },
      { type: 'choice', ...set, prompt: t(`|x − ${rel(a)}| ≤ ${r} signifie x ∈ …`, `|x − ${rel(a)}| ≤ ${r} means x ∈ …`, `|x − ${rel(a)}| ≤ ${r} تعني x ∈ …`, `|x − ${rel(a)}| ≤ ${r} significa x ∈ …`), hint: t(`Les nombres à une distance au plus ${r} de ${rel(a)} : de ${rel(a)} − ${r} à ${rel(a)} + ${r}.`, `Numbers within ${r} of ${rel(a)}.`, `الأعداد على بعد ${r} على الأكثر من ${rel(a)}.`, `A distancia ≤ ${r} de ${rel(a)}.`) },
    ],
  };
}

function intSets(seed: number): Activity {
  const rng = seeded(seed);
  const SETS = ['ℕ', 'ℤ', '𝔻', 'ℚ', 'ℝ'].map(same);
  const items: [string, number][] = [['√2', 4], ['π', 4], [`−${int(rng, 2, 9)}`, 1], [`${int(rng, 1, 9)},${int(rng, 1, 9)}`, 2], ['1/3', 3], ['2/7', 3], [`${int(rng, 10, 99)}`, 0], ['√9', 0]];
  const [x, k] = pick(rng, items.slice(0, 6));
  const [y, m] = pick(rng, items.filter(i => i[0] !== x));
  return {
    title: t('Les ensembles de nombres', 'Sets of numbers', 'مجموعات الأعداد', 'Conjuntos de números'),
    summary: 'ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ : √2 et π ne sont pas rationnels, 1/3 n’est pas décimal',
    steps: [x, y].map((v, i) => ({ type: 'choice' as const, options: SETS, answer: i ? m : k, prompt: t(`Quel est le plus petit ensemble qui contient ${v} ?`, `What is the smallest set containing ${v}?`, `ما أصغر مجموعة تحتوي ${v}؟`, `¿El menor conjunto que contiene ${v}?`), hint: t('ℕ entiers positifs, ℤ entiers relatifs, 𝔻 décimaux, ℚ fractions, ℝ tous (√2, π…). √9 = 3.', 'ℕ naturals, ℤ integers, 𝔻 decimals, ℚ fractions, ℝ all reals (√2, π…). √9 = 3.', 'ℕ، ℤ، 𝔻، ℚ، ℝ.', 'ℕ, ℤ, 𝔻, ℚ, ℝ.') })),
  };
}

// ═════════════ FONCTIONS DE RÉFÉRENCE ═════════════

const G6: Grid = { minX: -4, maxX: 4, minY: -4, maxY: 6, axes: true };
function curveScene(f: (x: number) => number, grid: Grid = G6, extra: Record<string, P> = {}): Scene & { grid: Grid } {
  const pts: P[] = [];
  for (let x = grid.minX; x <= grid.maxX + 1e-9; x += 0.1) { const y = f(x); if (y >= grid.minY - 0.5 && y <= grid.maxY + 0.5) pts.push({ x: Math.round(x * 100) / 100, y }); }
  return { grid, points: extra, segments: [], curves: [pts] };
}

function fnImage(seed: number): Activity {
  const rng = seeded(seed);
  const c = int(rng, 1, 5), x = int(rng, -4, 4) || 3, k = int(rng, 2, 7);
  return {
    title: t('Image et antécédents', 'Images and pre-images', 'الصورة والسوابق', 'Imagen y antecedentes'),
    summary: `f(x) = x² − ${c} : f(${rel(x)}) = ${x * x - c} · antécédents de ${k * k - c} : ${k} et −${k}`,
    steps: [
      { type: 'number', answer: x * x - c, tolerance: 0, prompt: t(`f(x) = x² − ${c}. Calcule l’image de ${rel(x)}.`, `f(x) = x² − ${c}. Work out the image of ${rel(x)}.`, `f(x) = x² − ${c}. احسب صورة ${rel(x)}.`, `f(x) = x² − ${c}. Calcula la imagen de ${rel(x)}.`), hint: t(`Remplace x par (${rel(x)}) : (${rel(x)})² − ${c}.`, `Replace x by (${rel(x)}).`, `عوّض x بـ (${rel(x)}).`, `Sustituye x por (${rel(x)}).`) },
      { type: 'choice', options: [same('0'), same('1'), same('2')], answer: 2, prompt: t(`Combien ${k * k - c} a-t-il d’antécédents par f ?`, `How many pre-images does ${k * k - c} have?`, `كم سابقة لـ ${k * k - c}؟`, `¿Cuántos antecedentes tiene ${k * k - c}?`), hint: t(`x² − ${c} = ${k * k - c} ⇔ x² = ${k * k} : deux nombres ont ce carré.`, `x² = ${k * k}: two numbers have this square.`, `x² = ${k * k}: عددان.`, `x² = ${k * k}: dos números.`) },
      { type: 'number', answer: -k, tolerance: 0, prompt: t('Donne l’antécédent négatif.', 'Give the negative pre-image.', 'أعط السابقة السالبة.', 'Da el antecedente negativo.'), hint: t(`−√${k * k}.`, `−√${k * k}.`, `−√${k * k}.`, `−√${k * k}.`) },
    ],
  };
}

function fnReading(seed: number): Activity {
  const rng = seeded(seed);
  const h = int(rng, -1, 1), k = int(rng, -2, 0);
  const f = (x: number) => (x - h) ** 2 + k;
  const x0 = h + pick(rng, [-2, 2, 1, -1]);
  const level = k + pick(rng, [1, 4]);
  const scene = curveScene(f);
  return {
    title: t('Lire un graphique', 'Reading a graph', 'قراءة تمثيل مبياني', 'Leer una gráfica'),
    summary: `minimum ${rel(k)} en x = ${rel(h)} ; f(${rel(x0)}) = ${rel(f(x0))} ; f(x) = ${rel(level)} a deux solutions`,
    steps: [
      { type: 'number', scene, answer: f(x0), tolerance: 0, prompt: t(`Lis f(${rel(x0)}) sur la courbe.`, `Read f(${rel(x0)}) on the curve.`, `اقرأ f(${rel(x0)}) على المنحنى.`, `Lee f(${rel(x0)}) en la curva.`), hint: t(`Pars de x = ${rel(x0)} sur l’axe horizontal, monte (ou descends) jusqu’à la courbe, puis lis l’ordonnée.`, `From x = ${rel(x0)}, go to the curve, then read across.`, `انطلق من x = ${rel(x0)} حتى المنحنى.`, `Desde x = ${rel(x0)} hasta la curva.`) },
      { type: 'number', scene, answer: k, tolerance: 0, prompt: t('Quel est le minimum de f ?', 'What is the minimum of f?', 'ما القيمة الدنيا لـ f؟', '¿Cuál es el mínimo de f?'), hint: t('C’est l’ordonnée du point le plus bas.', 'The y-value of the lowest point.', 'أرتوب أدنى نقطة.', 'La ordenada del punto más bajo.') },
      { type: 'choice', scene, options: [same('0'), same('1'), same('2')], answer: 2, prompt: t(`Combien de solutions a l’équation f(x) = ${rel(level)} ?`, `How many solutions does f(x) = ${rel(level)} have?`, `كم حلًا لـ f(x) = ${rel(level)}؟`, `¿Cuántas soluciones tiene f(x) = ${rel(level)}?`), hint: t(`Trace la droite horizontale y = ${rel(level)} : combien de fois coupe-t-elle la courbe ?`, `Draw y = ${rel(level)}: how many crossings?`, `ارسم y = ${rel(level)}.`, `Traza y = ${rel(level)}.`) },
    ],
  };
}

function fnVariations(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -4, -1), m = a + int(rng, 2, 4), b = m + int(rng, 2, 4), fa = int(rng, -3, 2), fm = fa + int(rng, 2, 6), fb = fm - int(rng, 1, 7);
  const x1 = a + 0.5, x2 = m - 0.5;
  const cmp = choices(rng, [same(`f(${dec(x1)}) < f(${dec(x2)})`), same(`f(${dec(x1)}) > f(${dec(x2)})`), same(`f(${dec(x1)}) = f(${dec(x2)})`)]);
  return {
    title: t('Tableau de variations', 'Variation table', 'جدول التغيرات', 'Tabla de variación'),
    summary: `croissante sur [${rel(a)} ; ${rel(m)}], décroissante sur [${rel(m)} ; ${rel(b)}] : maximum ${rel(fm)} en ${rel(m)}`,
    steps: [
      { type: 'number', answer: fm, tolerance: 0, prompt: t(`f est définie sur [${rel(a)} ; ${rel(b)}] : f(${rel(a)}) = ${rel(fa)}, f croît jusqu’à f(${rel(m)}) = ${rel(fm)}, puis décroît jusqu’à f(${rel(b)}) = ${rel(fb)}. Quel est le maximum de f ?`, `f on [${rel(a)}, ${rel(b)}]: f(${rel(a)}) = ${rel(fa)}, increases to f(${rel(m)}) = ${rel(fm)}, then decreases to f(${rel(b)}) = ${rel(fb)}. Maximum of f?`, `f تتزايد حتى f(${rel(m)}) = ${rel(fm)} ثم تتناقص. ما قيمتها القصوى؟`, `f crece hasta f(${rel(m)}) = ${rel(fm)} y luego decrece. ¿Máximo?`), hint: t('Le maximum est la plus grande valeur atteinte : au sommet du tableau.', 'The maximum is the largest value reached: the peak of the table.', 'القيمة القصوى في أعلى الجدول.', 'El máximo está en lo alto.') },
      { type: 'choice', ...cmp, prompt: t(`Sans calculer, compare f(${dec(x1)}) et f(${dec(x2)}).`, `Without calculating, compare f(${dec(x1)}) and f(${dec(x2)}).`, `قارن دون حساب.`, `Compara sin calcular.`), hint: t(`${dec(x1)} et ${dec(x2)} sont dans [${rel(a)} ; ${rel(m)}] où f est croissante : elle range dans le même ordre.`, `Both lie where f is increasing: same order.`, `f تزايدية هنا: نفس الترتيب.`, `f es creciente allí: mismo orden.`) },
      { type: 'number', answer: Math.min(fa, fb), tolerance: 0, prompt: t('Et le minimum de f sur l’intervalle ?', 'And the minimum of f on the interval?', 'والقيمة الدنيا؟', '¿Y el mínimo?'), hint: t(`Compare les valeurs aux bornes : ${rel(fa)} et ${rel(fb)}.`, `Compare the end values: ${rel(fa)} and ${rel(fb)}.`, `قارن ${rel(fa)} و ${rel(fb)}.`, `Compara ${rel(fa)} y ${rel(fb)}.`) },
    ],
  };
}

function fnReference(seed: number): Activity {
  const rng = seeded(seed);
  const NAMES = [t('la fonction carré', 'the square function', 'دالة المربع', 'la función cuadrado'), t('la fonction inverse', 'the reciprocal function', 'دالة المقلوب', 'la función inversa'), t('la fonction racine carrée', 'the square root function', 'دالة الجذر', 'la función raíz'), t('la fonction cube', 'the cube function', 'دالة المكعب', 'la función cubo')];
  const dec1 = choices(rng, [NAMES[1]!, NAMES[0]!, NAMES[2]!, NAMES[3]!]);
  const q = pick(rng, [2, 4, 5, 10]), a = pick(rng, [0.3, 0.5, 0.8]);
  const sq = choices(rng, [same(`${dec(a * a)} < ${dec(a)}`), same(`${dec(a * a)} > ${dec(a)}`), same(`${dec(a * a)} = ${dec(a)}`)]);
  return {
    title: t('Les fonctions de référence', 'Reference functions', 'الدوال المرجعية', 'Funciones de referencia'),
    summary: `carré (parabole), inverse (hyperbole), racine, cube · 1/${q} = ${dec(1 / q)} · ${dec(a)}² = ${dec(a * a)} < ${dec(a)}`,
    steps: [
      { type: 'choice', ...dec1, prompt: t('Laquelle de ces fonctions est décroissante sur ]0 ; +∞[ ?', 'Which of these functions is decreasing on (0, +∞)?', 'أي هذه الدوال تناقصية على ]0 ; +∞[؟', '¿Cuál es decreciente en ]0 ; +∞[?'), hint: t('Plus on divise 1 par un grand nombre, plus le résultat est petit.', 'Dividing 1 by a bigger number gives a smaller result.', 'كلما كبر المقام صغرت النتيجة.', 'Cuanto mayor el divisor, menor el resultado.') },
      { type: 'number', answer: q, tolerance: 1e-9, prompt: t(`Calcule l’image de ${dec(1 / q)} par la fonction inverse.`, `Work out the image of ${dec(1 / q)} under x ↦ 1/x.`, `احسب صورة ${dec(1 / q)} بدالة المقلوب.`, `Calcula la imagen de ${dec(1 / q)} por la inversa.`), hint: t(`1 ÷ ${dec(1 / q)}.`, `1 ÷ ${dec(1 / q)}.`, `1 ÷ ${dec(1 / q)}.`, `1 ÷ ${dec(1 / q)}.`) },
      { type: 'choice', ...sq, prompt: t(`Compare ${dec(a)}² et ${dec(a)}.`, `Compare ${dec(a)}² and ${dec(a)}.`, `قارن ${dec(a)}² و ${dec(a)}.`, `Compara ${dec(a)}² y ${dec(a)}.`), hint: t('Entre 0 et 1, élever au carré **rapetisse** le nombre.', 'Between 0 and 1, squaring makes a number **smaller**.', 'بين 0 و 1 التربيع **يصغّر** العدد.', 'Entre 0 y 1, elevar al cuadrado **reduce**.') },
    ],
  };
}

// ═════════════ TABLEAUX DE SIGNES ═════════════

const SIGNS2 = [same('+'), same('−')];

function signAffine(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [2, 3, -2, -3, 4, -4]), r = int(rng, -4, 5), b = -a * r, x = r + pick(rng, [2, 3, -2, -3]);
  const where = choices(rng, [same(a > 0 ? `x > ${rel(r)}` : `x < ${rel(r)}`), same(a > 0 ? `x < ${rel(r)}` : `x > ${rel(r)}`), same(`x = ${rel(r)}`)]);
  return {
    title: t('Signe d’une fonction affine', 'Sign of a linear function', 'إشارة دالة تآلفية', 'Signo de una función afín'),
    summary: `${a}x${plus(b)} s’annule en ${rel(r)} ; signe de a = ${a > 0 ? '+' : '−'} à droite de ${rel(r)}`,
    steps: [
      { type: 'number', answer: r, tolerance: 0, prompt: t(`Pour quelle valeur de x a-t-on ${rel(a)}x${plus(b)} = 0 ?`, `For which x is ${rel(a)}x${plus(b)} = 0?`, `متى ${rel(a)}x${plus(b)} = 0؟`, `¿Para qué x es ${rel(a)}x${plus(b)} = 0?`), hint: t(`Résous ${rel(a)}x = ${rel(-b)}.`, `Solve ${rel(a)}x = ${rel(-b)}.`, `حل ${rel(a)}x = ${rel(-b)}.`, `Resuelve ${rel(a)}x = ${rel(-b)}.`) },
      { type: 'choice', options: SIGNS2, answer: a * x + b > 0 ? 0 : 1, prompt: t(`Quel est le signe de ${rel(a)}x${plus(b)} pour x = ${rel(x)} ?`, `What is the sign of ${rel(a)}x${plus(b)} when x = ${rel(x)}?`, `ما إشارة ${rel(a)}x${plus(b)} من أجل x = ${rel(x)}؟`, `¿Signo de ${rel(a)}x${plus(b)} para x = ${rel(x)}?`), hint: t(`Calcule : ${rel(a)} × ${rel(x)}${plus(b)} = ${rel(a * x + b)}.`, `Calculate: ${rel(a * x + b)}.`, `${rel(a * x + b)}.`, `${rel(a * x + b)}.`) },
      { type: 'choice', ...where, prompt: t(`${rel(a)}x${plus(b)} est positif pour…`, `${rel(a)}x${plus(b)} is positive when…`, `${rel(a)}x${plus(b)} موجب عندما…`, `${rel(a)}x${plus(b)} es positivo cuando…`), hint: t('À droite de la racine, ax + b a le signe de a.', 'Right of the root, ax + b has the sign of a.', 'يمين الجذر إشارة a.', 'A la derecha de la raíz, el signo de a.') },
    ],
  };
}

function signProduct(seed: number): Activity {
  const rng = seeded(seed);
  const p = int(rng, -5, 0), q = p + int(rng, 2, 6), mid = (p + q) / 2;
  return {
    title: t('Tableau de signes d’un produit', 'Sign table of a product', 'جدول إشارة جداء', 'Tabla de signos de un producto'),
    summary: `(x${plus(-p)})(x${plus(-q)}) : + puis − entre ${rel(p)} et ${rel(q)} puis +`,
    steps: [
      { type: 'number', answer: p, tolerance: 0, prompt: t(`(x${plus(-p)})(x${plus(-q)}) s’annule en deux valeurs. Donne la plus petite.`, `(x${plus(-p)})(x${plus(-q)}) is zero at two values. Give the smaller.`, `الجداء ينعدم في قيمتين. أعط الأصغر.`, `Se anula en dos valores. Da el menor.`), hint: t('Un produit est nul si un facteur est nul.', 'A product is zero if one factor is zero.', 'الجداء منعدم إذا انعدم عامل.', 'Un producto es nulo si un factor lo es.') },
      { type: 'choice', options: SIGNS2, answer: 1, prompt: t(`Quel est le signe du produit pour x entre ${rel(p)} et ${rel(q)} (par exemple x = ${dec(mid)}) ?`, `Sign of the product between ${rel(p)} and ${rel(q)} (e.g. x = ${dec(mid)})?`, `إشارة الجداء بين ${rel(p)} و ${rel(q)}؟`, `¿Signo entre ${rel(p)} y ${rel(q)}?`), hint: t(`Entre les racines, le premier facteur est positif et le second négatif.`, `Between the roots, one factor is + and the other −.`, `بين الجذرين عامل موجب وآخر سالب.`, `Entre raíces, un factor + y otro −.`) },
      { type: 'choice', options: SIGNS2, answer: 0, prompt: t(`Et pour x > ${rel(q)} ?`, `And for x > ${rel(q)}?`, `ومن أجل x > ${rel(q)}؟`, `¿Y para x > ${rel(q)}?`), hint: t('Les deux facteurs sont positifs.', 'Both factors are positive.', 'العاملان موجبان.', 'Ambos factores positivos.') },
    ],
  };
}

function signInequality(seed: number): Activity {
  const rng = seeded(seed);
  const p = int(rng, -5, 0), q = p + int(rng, 2, 6), le = rng() < 0.5;
  const sol = choices(rng, le
    ? [same(`[${rel(p)} ; ${rel(q)}]`), same(`]−∞ ; ${rel(p)}] ∪ [${rel(q)} ; +∞[`), same(`]${rel(p)} ; ${rel(q)}[`)]
    : [same(`]−∞ ; ${rel(p)}[ ∪ ]${rel(q)} ; +∞[`), same(`]${rel(p)} ; ${rel(q)}[`), same(`[${rel(p)} ; ${rel(q)}]`)]);
  return {
    title: t('Résoudre une inéquation produit', 'Solving a product inequality', 'حل متراجحة جداء', 'Inecuación producto'),
    summary: `(x${plus(-p)})(x${plus(-q)}) ≤ 0 ⇔ x ∈ [${rel(p)} ; ${rel(q)}]`,
    steps: [{ type: 'choice', ...sol, prompt: t(`Résous (x${plus(-p)})(x${plus(-q)}) ${le ? '≤' : '>'} 0.`, `Solve (x${plus(-p)})(x${plus(-q)}) ${le ? '≤' : '>'} 0.`, `حل (x${plus(-p)})(x${plus(-q)}) ${le ? '≤' : '>'} 0.`, `Resuelve (x${plus(-p)})(x${plus(-q)}) ${le ? '≤' : '>'} 0.`), hint: t(`Dresse le tableau de signes : + , − entre ${rel(p)} et ${rel(q)}, + . ${le ? 'On garde le − et les zéros (crochets fermés).' : 'On garde les + (crochets ouverts).'}`, `Build the sign table: +, − between ${rel(p)} and ${rel(q)}, +.`, `جدول الإشارة: +، −، +.`, `Tabla de signos: +, −, +.`) },
      { type: 'choice', options: OUI_NON, answer: le ? 0 : 1, prompt: t(`${rel(p)} est-il solution ?`, `Is ${rel(p)} a solution?`, `هل ${rel(p)} حل؟`, `¿${rel(p)} es solución?`), hint: t(`En ${rel(p)}, le produit vaut 0. Est-ce ${le ? '≤' : '>'} 0 ?`, `At ${rel(p)}, the product is 0.`, `في ${rel(p)} الجداء 0.`, `En ${rel(p)} vale 0.`) }],
  };
}

function signQuotient(seed: number): Activity {
  const rng = seeded(seed);
  const p = int(rng, -4, 4), q = p + pick(rng, [-5, -3, 2, 4, 6]), x = Math.max(p, q) + int(rng, 1, 3);
  return {
    title: t('Signe d’un quotient', 'Sign of a quotient', 'إشارة خارج', 'Signo de un cociente'),
    summary: `(x${plus(-p)})/(x${plus(-q)}) : valeur interdite ${rel(q)} (le dénominateur ne s’annule pas)`,
    steps: [
      { type: 'number', answer: q, tolerance: 0, prompt: t(`Quelle est la valeur interdite de (x${plus(-p)}) / (x${plus(-q)}) ?`, `What value is excluded for (x${plus(-p)}) / (x${plus(-q)})?`, `ما القيمة الممنوعة؟`, `¿Valor prohibido?`), hint: t('On ne divise jamais par 0 : cherche où le dénominateur s’annule.', 'Never divide by 0: where is the denominator zero?', 'لا نقسم على 0.', 'Nunca se divide por 0.') },
      { type: 'choice', options: SIGNS2, answer: 0, prompt: t(`Signe du quotient pour x = ${rel(x)} ?`, `Sign of the quotient for x = ${rel(x)}?`, `إشارة الخارج من أجل x = ${rel(x)}؟`, `¿Signo para x = ${rel(x)}?`), hint: t('Mêmes règles de signes que pour un produit : ici les deux termes sont positifs.', 'Same sign rules as a product: both terms are positive here.', 'نفس قواعد الجداء.', 'Mismas reglas que el producto.') },
    ],
  };
}

// ═════════════ ÉQUATIONS DE DROITES ═════════════

function lineSlope(seed: number): Activity {
  const rng = seeded(seed);
  let A: P, B: P, m: number;
  do { A = { x: int(rng, -4, 1), y: int(rng, -3, 3) }; B = { x: A.x + int(rng, 1, 4), y: int(rng, -4, 5) }; m = (B.y - A.y) / (B.x - A.x); } while (!Number.isInteger(m * 2));
  const p = A.y - m * A.x;
  return {
    title: t('Coefficient directeur', 'Gradient', 'المعامل الموجه', 'Pendiente'),
    summary: `A(${rel(A.x)} ; ${rel(A.y)}), B(${rel(B.x)} ; ${rel(B.y)}) : m = ${dec(m)}, p = ${dec(p)} → y = ${dec(m)}x${plus(Math.round(p * 1000) / 1000)}`,
    steps: [
      { type: 'number', answer: m, tolerance: 1e-9, prompt: t(`Calcule le coefficient directeur de la droite (AB) avec A(${rel(A.x)} ; ${rel(A.y)}) et B(${rel(B.x)} ; ${rel(B.y)}).`, `Find the gradient of (AB) with A(${rel(A.x)}, ${rel(A.y)}) and B(${rel(B.x)}, ${rel(B.y)}).`, `احسب المعامل الموجه لـ (AB).`, `Calcula la pendiente de (AB).`), hint: t('m = (y_B − y_A) ÷ (x_B − x_A).', 'm = (y_B − y_A) ÷ (x_B − x_A).', 'm = (y_B − y_A) ÷ (x_B − x_A).', 'm = (y_B − y_A) ÷ (x_B − x_A).') },
      { type: 'number', answer: p, tolerance: 1e-9, prompt: t('Puis l’ordonnée à l’origine p (y = mx + p).', 'Then the y-intercept p (y = mx + p).', 'ثم الأرتوب عند الأصل p.', 'Luego la ordenada en el origen p.'), hint: t(`A est sur la droite : ${rel(A.y)} = ${dec(m)} × ${rel(A.x)} + p.`, `A is on the line: ${rel(A.y)} = ${dec(m)} × ${rel(A.x)} + p.`, `A على المستقيم.`, `A está en la recta.`) },
    ],
  };
}

function lineRead(seed: number): Activity {
  const rng = seeded(seed);
  const m = pick(rng, [-2, -1, 1, 2, 0.5, -0.5]), p = int(rng, -2, 3);
  const g: Grid = { minX: -4, maxX: 4, minY: -4, maxY: 5, axes: true };
  const scene: Scene & { grid: Grid } = { grid: g, points: {}, segments: [], curves: [curvePts(m, p, g)] };
  return {
    title: t('Lire une équation de droite', 'Reading a line’s equation', 'قراءة معادلة مستقيم', 'Leer la ecuación de una recta'),
    summary: `y = ${dec(m)}x${plus(p)} : p se lit sur l’axe vertical, m en avançant de 1`,
    steps: [
      { type: 'number', scene, answer: p, tolerance: 0, prompt: t('Lis l’ordonnée à l’origine p de cette droite.', 'Read the y-intercept p of this line.', 'اقرأ الأرتوب عند الأصل p.', 'Lee la ordenada en el origen p.'), hint: t('C’est là où la droite coupe l’axe vertical.', 'Where the line crosses the vertical axis.', 'حيث يقطع المستقيم المحور العمودي.', 'Donde corta el eje vertical.') },
      { type: 'number', scene, answer: m, tolerance: 1e-9, prompt: t('Lis le coefficient directeur m.', 'Read the gradient m.', 'اقرأ المعامل الموجه m.', 'Lee la pendiente m.'), hint: t('Quand x augmente de 1 (ou de 2), de combien monte ou descend y ?', 'When x goes up by 1 (or 2), how much does y change?', 'عندما يزيد x بـ 1، بكم يتغير y؟', '¿Cuánto cambia y si x aumenta 1?') },
    ],
  };
}
function curvePts(m: number, p: number, g: Grid): P[] {
  const pts: P[] = [];
  for (let x = g.minX; x <= g.maxX + 1e-9; x += 0.25) { const y = m * x + p; if (y >= g.minY - 0.2 && y <= g.maxY + 0.2) pts.push({ x, y }); }
  return pts;
}

function lineParallel(seed: number): Activity {
  const rng = seeded(seed);
  const m = int(rng, -3, 3) || 2, p = int(rng, -5, 5), q = p + int(rng, 1, 4), x = int(rng, -3, 3), on = rng() < 0.5;
  const y = m * x + p + (on ? 0 : int(rng, 1, 3));
  const par = choices(rng, [same(`y = ${rel(m)}x${plus(q)}`), same(`y = ${rel(-m)}x${plus(p)}`), same(`y = ${rel(m + 1)}x${plus(p)}`)]);
  return {
    title: t('Droites parallèles, point sur une droite', 'Parallel lines, points on a line', 'مستقيمات متوازية', 'Rectas paralelas'),
    summary: `(d) : y = ${rel(m)}x${plus(p)} · une parallèle a le même coefficient ${rel(m)}`,
    steps: [
      { type: 'choice', ...par, prompt: t(`Quelle droite est parallèle à (d) : y = ${rel(m)}x${plus(p)} ?`, `Which line is parallel to (d): y = ${rel(m)}x${plus(p)}?`, `أي مستقيم يوازي (d)؟`, `¿Cuál es paralela a (d)?`), hint: t('Deux droites (non verticales) sont parallèles si elles ont le même coefficient directeur.', 'Two (non-vertical) lines are parallel if they have the same gradient.', 'متوازيان إذا كان لهما نفس المعامل الموجه.', 'Paralelas si tienen la misma pendiente.') },
      { type: 'choice', options: OUI_NON, answer: on ? 0 : 1, prompt: t(`Le point (${rel(x)} ; ${rel(y)}) est-il sur (d) ?`, `Is (${rel(x)}, ${rel(y)}) on (d)?`, `هل النقطة (${rel(x)} ; ${rel(y)}) على (d)؟`, `¿(${rel(x)} ; ${rel(y)}) está en (d)?`), hint: t(`Calcule ${rel(m)} × ${rel(x)}${plus(p)} et compare à ${rel(y)}.`, `Work out ${rel(m)} × ${rel(x)}${plus(p)} and compare with ${rel(y)}.`, `احسب وقارن.`, `Calcula y compara.`) },
    ],
  };
}

function lineCartesian(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, 1, 4), b = pick(rng, [1, 2, -1, -2]), c = int(rng, -6, 6);
  const u = { x: int(rng, 1, 4), y: int(rng, -3, 3) }, k = pick(rng, [2, -1, 3]), col = rng() < 0.5;
  const v = col ? { x: u.x * k, y: u.y * k } : { x: u.x * k, y: u.y * k + 1 };
  return {
    title: t('Équation cartésienne, colinéarité', 'Cartesian equation, collinearity', 'المعادلة الديكارتية والاستقامية', 'Ecuación cartesiana'),
    summary: `${a}x${plus(b)}y${plus(c)} = 0 ⇔ y = ${dec(-a / b)}x${plus(Math.round((-c / b) * 1000) / 1000)} · det(u, v) = 0 ⇔ colinéaires`,
    steps: [
      { type: 'number', answer: -a / b, tolerance: 1e-9, prompt: t(`(d) : ${a}x${plus(b)}y${plus(c)} = 0. Quel est son coefficient directeur ?`, `(d): ${a}x${plus(b)}y${plus(c)} = 0. What is its gradient?`, `ما معاملها الموجه؟`, `¿Su pendiente?`), hint: t('Isole y : by = −ax − c, puis divise par b.', 'Isolate y: by = −ax − c, then divide by b.', 'اعزل y.', 'Despeja y.') },
      { type: 'number', answer: u.x * v.y - u.y * v.x, tolerance: 0, prompt: t(`Calcule det(u, v) avec u(${rel(u.x)} ; ${rel(u.y)}) et v(${rel(v.x)} ; ${rel(v.y)}).`, `Work out det(u, v) with u(${rel(u.x)}, ${rel(u.y)}) and v(${rel(v.x)}, ${rel(v.y)}).`, `احسب det(u, v).`, `Calcula det(u, v).`), hint: t('det(u, v) = x × y′ − y × x′.', 'det(u, v) = x y′ − y x′.', 'det = x y′ − y x′.', 'det = x y′ − y x′.') },
      { type: 'choice', options: OUI_NON, answer: col ? 0 : 1, prompt: t('u et v sont-ils colinéaires ?', 'Are u and v collinear?', 'هل u و v مستقيميتان؟', '¿u y v son colineales?'), hint: t('Colinéaires ⇔ det(u, v) = 0.', 'Collinear ⇔ det(u, v) = 0.', 'مستقيميتان ⇔ det = 0.', 'Colineales ⇔ det = 0.') },
    ],
  };
}

// ═════════════ QUARTILES, ÉCART TYPE ═════════════

const fr1 = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');
function quartile(sorted: number[], q: 1 | 3): number { return sorted[Math.ceil((q * sorted.length) / 4) - 1]!; }

function qQuartiles(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [8, 11, 12]);
  const values = Array.from({ length: n }, () => int(rng, 2, 20)).sort((a, b) => a - b);
  return {
    title: t('Les quartiles', 'Quartiles', 'الربيعيات', 'Los cuartiles'),
    summary: `Q1 = ${quartile(values, 1)}, Q3 = ${quartile(values, 3)} : le quart et les trois quarts de la série rangée`,
    steps: [
      { type: 'number', answer: quartile(values, 1), tolerance: 0, prompt: t(`Série rangée de ${n} valeurs : ${values.join(' ; ')}. Quel est le premier quartile Q1 ?`, `Sorted data (${n} values): ${values.join(', ')}. What is Q1?`, `سلسلة مرتبة: ${values.join(' ; ')}. ما Q1؟`, `Serie: ${values.join(' ; ')}. ¿Q1?`), hint: t(`Q1 est la plus petite valeur telle qu’au moins 25 % des données lui soient inférieures ou égales : rang ${Math.ceil(n / 4)} (${n} ÷ 4 arrondi au-dessus).`, `Q1 is at rank ${Math.ceil(n / 4)} (${n} ÷ 4 rounded up).`, `الرتبة ${Math.ceil(n / 4)}.`, `Rango ${Math.ceil(n / 4)}.`) },
      { type: 'number', answer: quartile(values, 3), tolerance: 0, prompt: t('Et le troisième quartile Q3 ?', 'And Q3?', 'و Q3؟', '¿Y Q3?'), hint: t(`Rang ${Math.ceil((3 * n) / 4)} (3 × ${n} ÷ 4 arrondi au-dessus).`, `Rank ${Math.ceil((3 * n) / 4)}.`, `الرتبة ${Math.ceil((3 * n) / 4)}.`, `Rango ${Math.ceil((3 * n) / 4)}.`) },
      { type: 'number', answer: quartile(values, 3) - quartile(values, 1), tolerance: 0, prompt: t('Quel est l’écart interquartile Q3 − Q1 ?', 'What is the interquartile range Q3 − Q1?', 'ما الانحراف الربيعي؟', '¿Rango intercuartílico?'), hint: t('Il mesure la dispersion de la moitié centrale des données.', 'It measures the spread of the middle half.', 'يقيس تشتت النصف المركزي.', 'Mide la dispersión central.') },
    ],
  };
}

function qWeighted(seed: number): Activity {
  const rng = seeded(seed);
  const vals = [int(rng, 6, 9), int(rng, 10, 13), int(rng, 14, 18)], eff = vals.map(() => int(rng, 1, 6));
  const n = eff.reduce((a, b) => a + b, 0), mean = vals.reduce((s, v, i) => s + v * eff[i]!, 0) / n;
  return {
    title: t('Moyenne pondérée', 'Weighted mean', 'المعدل المرجح', 'Media ponderada'),
    summary: `moyenne = (Σ valeur × effectif) ÷ N = ${fr1(mean)}`,
    steps: [
      { type: 'number', answer: n, tolerance: 0, prompt: t(`Notes ${vals.join(' ; ')} avec les effectifs ${eff.join(' ; ')}. Quel est l’effectif total ?`, `Marks ${vals.join(', ')} with counts ${eff.join(', ')}. Total count?`, `ما الحصيص الإجمالي؟`, `¿Efectivo total?`), hint: t('Additionne les effectifs.', 'Add the counts.', 'اجمع الحصيصات.', 'Suma los efectivos.') },
      { type: 'number', answer: Math.round(mean * 100) / 100, tolerance: 0.01, prompt: t('Calcule la moyenne (au centième).', 'Work out the mean (to 2 decimal places).', 'احسب المعدل.', 'Calcula la media.'), hint: t(`(${vals.map((v, i) => `${v} × ${eff[i]}`).join(' + ')}) ÷ ${n}.`, `(${vals.map((v, i) => `${v} × ${eff[i]}`).join(' + ')}) ÷ ${n}.`, `المجموع ÷ ${n}.`, `Suma ÷ ${n}.`) },
    ],
  };
}

function qStd(seed: number): Activity {
  const rng = seeded(seed);
  const m = int(rng, 8, 14), d = int(rng, 1, 4), e = d + int(rng, 2, 4);
  const sA = d * Math.sqrt(2 / 3);
  const reg = choices(rng, [t('la série A', 'series A', 'السلسلة A', 'la serie A'), t('la série B', 'series B', 'السلسلة B', 'la serie B')]);
  return {
    title: t('L’écart type', 'Standard deviation', 'الانحراف المعياري', 'La desviación típica'),
    summary: `A : ${m - d} ; ${m} ; ${m + d} → moyenne ${m}, écart type ≈ ${fr1(sA)} (moins dispersée que B)`,
    steps: [
      { type: 'number', answer: m, tolerance: 0, prompt: t(`Série A : ${m - d} ; ${m} ; ${m + d}. Quelle est sa moyenne ?`, `Series A: ${m - d}, ${m}, ${m + d}. Mean?`, `السلسلة A: ما معدلها؟`, `Serie A: ¿media?`), hint: t('Les écarts à droite et à gauche se compensent.', 'The deviations either side cancel out.', 'الانحرافات تتعادل.', 'Las desviaciones se compensan.') },
      { type: 'number', answer: Math.round(sA * 100) / 100, tolerance: 0.01, prompt: t('Son écart type, au centième ?', 'Its standard deviation, to 2 decimal places?', 'انحرافها المعياري؟', '¿Su desviación típica?'), hint: t(`σ = √( (${d}² + 0² + ${d}²) ÷ 3 ).`, `σ = √((${d}² + 0 + ${d}²) ÷ 3).`, `σ = √((${d}² + 0 + ${d}²) ÷ 3).`, `σ = √((${d}² + 0 + ${d}²) ÷ 3).`) },
      { type: 'choice', ...reg, prompt: t(`Série B : ${m - e} ; ${m} ; ${m + e}, même moyenne. Laquelle est la plus homogène ?`, `Series B: ${m - e}, ${m}, ${m + e}, same mean. Which is more consistent?`, `أيهما أكثر تجانسًا؟`, `¿Cuál es más homogénea?`), hint: t('La plus homogène a le plus petit écart type.', 'The more consistent has the smaller standard deviation.', 'الأصغر انحرافًا.', 'La de menor desviación.') },
    ],
  };
}

function qBox(seed: number): Activity {
  const rng = seeded(seed);
  const min = int(rng, 2, 6), q1 = min + int(rng, 2, 4), me = q1 + int(rng, 1, 4), q3 = me + int(rng, 2, 4), max = q3 + int(rng, 2, 6);
  const half = choices(rng, [same('50 %'), same('25 %'), same('75 %')]);
  return {
    title: t('Diagramme en boîte', 'Box plot', 'مخطط العلبة', 'Diagrama de caja'),
    summary: `min ${min}, Q1 ${q1}, Me ${me}, Q3 ${q3}, max ${max}`,
    steps: [
      { type: 'number', answer: max - min, tolerance: 0, prompt: t(`Boîte : min ${min}, Q1 ${q1}, médiane ${me}, Q3 ${q3}, max ${max}. Quelle est l’étendue ?`, `Box: min ${min}, Q1 ${q1}, median ${me}, Q3 ${q3}, max ${max}. Range?`, `ما المدى؟`, `¿Rango?`), hint: t('max − min.', 'max − min.', 'max − min.', 'max − min.') },
      { type: 'choice', ...half, prompt: t(`Quelle part des valeurs se trouve entre Q1 = ${q1} et Q3 = ${q3} ?`, `What share of the values lies between Q1 and Q3?`, `ما نسبة القيم بين Q1 و Q3؟`, `¿Qué parte está entre Q1 y Q3?`), hint: t('Chaque quart de la série contient environ 25 % des valeurs.', 'Each quarter holds about 25% of the values.', 'كل ربع يحوي 25 %.', 'Cada cuarto, 25 %.') },
    ],
  };
}

// ═════════════ PROBABILITÉS : ÉVÉNEMENTS ═════════════

function evUniverse(seed: number): Activity {
  const rng = seeded(seed);
  const s = int(rng, 4, 10), ways = Array.from({ length: 6 }, (_, i) => i + 1).filter(a => s - a >= 1 && s - a <= 6).length;
  return {
    title: t('Univers et événements', 'Sample space and events', 'الكون والأحداث', 'Espacio muestral y sucesos'),
    summary: `deux dés : 6 × 6 = 36 issues ; somme ${s} : ${ways} issues → p = ${ways}/36`,
    steps: [
      { type: 'number', answer: 36, tolerance: 0, prompt: t('On lance deux dés (un rouge, un bleu). Combien y a-t-il d’issues possibles ?', 'Two dice are rolled (one red, one blue). How many possible outcomes?', 'نرمي نردين. كم إمكانية؟', 'Se lanzan dos dados. ¿Cuántos resultados?'), hint: t('Un tableau 6 × 6 : chaque case est une issue.', 'A 6 × 6 table: each cell is an outcome.', 'جدول 6 × 6.', 'Una tabla 6 × 6.') },
      { type: 'number', answer: ways, tolerance: 0, prompt: t(`Combien d’issues donnent une somme égale à ${s} ?`, `How many outcomes give a sum of ${s}?`, `كم إمكانية مجموعها ${s}؟`, `¿Cuántos suman ${s}?`), hint: t(`Liste les couples (rouge ; bleu) : (1 ; ${s - 1}), (2 ; ${s - 2})… s’ils existent.`, `List the pairs (1, ${s - 1}), (2, ${s - 2})…`, `عدّد الأزواج.`, `Enumera los pares.`) },
    ],
  };
}

function evUnion(seed: number): Activity {
  const rng = seeded(seed);
  const pa = int(rng, 3, 6) / 10, pb = int(rng, 2, 5) / 10, pab = int(rng, 1, Math.min(pa, pb) * 10 - 1) / 10;
  return {
    title: t('Réunion et contraire', 'Union and complement', 'الاتحاد والحدث المضاد', 'Unión y contrario'),
    summary: `P(A ∪ B) = ${dec(pa)} + ${dec(pb)} − ${dec(pab)} = ${dec(pa + pb - pab)} · P(Ā) = ${dec(1 - pa)}`,
    steps: [
      { type: 'number', answer: Math.round((1 - pa) * 100) / 100, tolerance: 1e-9, prompt: t(`P(A) = ${dec(pa)}. Calcule P(Ā).`, `P(A) = ${dec(pa)}. Find P(Ā).`, `احسب P(Ā).`, `Calcula P(Ā).`), hint: t('P(Ā) = 1 − P(A).', 'P(Ā) = 1 − P(A).', 'P(Ā) = 1 − P(A).', 'P(Ā) = 1 − P(A).') },
      { type: 'number', answer: Math.round((pa + pb - pab) * 100) / 100, tolerance: 1e-9, prompt: t(`P(B) = ${dec(pb)} et P(A ∩ B) = ${dec(pab)}. Calcule P(A ∪ B).`, `P(B) = ${dec(pb)}, P(A ∩ B) = ${dec(pab)}. Find P(A ∪ B).`, `احسب P(A ∪ B).`, `Calcula P(A ∪ B).`), hint: t('P(A ∪ B) = P(A) + P(B) − P(A ∩ B) : on retire ce qui est compté deux fois.', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B): remove the double count.', 'نطرح ما عُدّ مرتين.', 'Resta lo contado dos veces.') },
    ],
  };
}

function evTable(seed: number): Activity {
  const rng = seeded(seed);
  const fa = int(rng, 4, 12), fb = int(rng, 4, 12), ga = int(rng, 4, 12), gb = int(rng, 4, 12), n = fa + fb + ga + gb;
  return {
    title: t('Tableau croisé et probabilités', 'Two-way table and probability', 'جدول مزدوج واحتمالات', 'Tabla de contingencia'),
    summary: `P(A) = ${fa + fb}/${n} · P(A ∩ E) = ${fa}/${n}`,
    steps: [
      { type: 'number', answer: fa + fb, tolerance: 0, prompt: t(`Dans un lycée : filles externes ${fa}, filles demi-pensionnaires ${fb}, garçons externes ${ga}, garçons demi-pensionnaires ${gb}. On choisit un élève au hasard. Combien de filles en tout (événement A) ?`, `Girls day pupils ${fa}, girls lunch ${fb}, boys day ${ga}, boys lunch ${gb}. How many girls (event A)?`, `كم فتاة في المجموع؟`, `¿Cuántas chicas?`), hint: t(`${fa} + ${fb}.`, `${fa} + ${fb}.`, `${fa} + ${fb}.`, `${fa} + ${fb}.`) },
      { type: 'number', answer: Math.round(((fa + fb) / n) * 1000) / 1000, tolerance: 0.001, prompt: t(`P(A), au millième ? (${n} élèves en tout)`, `P(A), to 3 decimal places? (${n} pupils)`, `P(A)؟ (${n} تلميذ)`, `¿P(A)? (${n} alumnos)`), hint: t(`${fa + fb} ÷ ${n}.`, `${fa + fb} ÷ ${n}.`, `${fa + fb} ÷ ${n}.`, `${fa + fb} ÷ ${n}.`) },
      { type: 'number', answer: Math.round((fa / n) * 1000) / 1000, tolerance: 0.001, prompt: t('E : « l’élève est externe ». P(A ∩ E), au millième ?', 'E: “day pupil”. P(A ∩ E), to 3 decimal places?', 'P(A ∩ E)؟', '¿P(A ∩ E)?'), hint: t(`A ∩ E : les filles externes, ${fa} sur ${n}.`, `A ∩ E: girls who are day pupils, ${fa} of ${n}.`, `${fa} من ${n}.`, `${fa} de ${n}.`) },
    ],
  };
}

function evTwoDraws(seed: number): Activity {
  const rng = seeded(seed);
  const r = int(rng, 2, 6), b = int(rng, 2, 6), n = r + b;
  const both = (r * r) / (n * n);
  return {
    title: t('Deux tirages avec remise', 'Two draws with replacement', 'سحبان بإرجاع', 'Dos extracciones con reemplazo'),
    summary: `P(rouge puis rouge) = ${r}/${n} × ${r}/${n} = ${r * r}/${n * n}`,
    steps: [
      { type: 'number', answer: Math.round(both * 1000) / 1000, tolerance: 0.001, prompt: t(`Une urne : ${r} boules rouges, ${b} bleues. On tire une boule, on la remet, on en tire une autre. P(deux rouges), au millième ?`, `An urn: ${r} red, ${b} blue. Draw, replace, draw again. P(two reds), to 3 decimal places?`, `P(كرتان حمراوان)؟`, `¿P(dos rojas)?`), hint: t(`On multiplie le long des branches de l’arbre : ${r}/${n} × ${r}/${n}.`, `Multiply along the tree: ${r}/${n} × ${r}/${n}.`, `نضرب على الفروع.`, `Multiplica por las ramas.`) },
      { type: 'number', answer: Math.round((2 * r * b) / (n * n) * 1000) / 1000, tolerance: 0.001, prompt: t('P(une rouge et une bleue, dans n’importe quel ordre), au millième ?', 'P(one red and one blue, any order)?', 'P(حمراء وزرقاء)؟', '¿P(una roja y una azul)?'), hint: t(`Deux chemins : R puis B, et B puis R : 2 × ${r}/${n} × ${b}/${n}.`, `Two paths: 2 × ${r}/${n} × ${b}/${n}.`, `مساران.`, `Dos caminos.`) },
    ],
  };
}

// ═════════════ CERCLE TRIGONOMÉTRIQUE ═════════════

const ANGLES: { deg: number; rad: string; cos: string; sin: string }[] = [
  { deg: 0, rad: '0', cos: '1', sin: '0' }, { deg: 30, rad: 'π/6', cos: '√3/2', sin: '1/2' }, { deg: 45, rad: 'π/4', cos: '√2/2', sin: '√2/2' },
  { deg: 60, rad: 'π/3', cos: '1/2', sin: '√3/2' }, { deg: 90, rad: 'π/2', cos: '0', sin: '1' },
];
const VALUES = ['0', '1/2', '√2/2', '√3/2', '1'].map(same);

function ucRadians(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, ANGLES.slice(1));
  const rads = choices(rng, [same(a.rad), ...ANGLES.filter(x => x.deg !== a.deg && x.deg !== 0).slice(0, 2).map(x => same(x.rad))]);
  const k = pick(rng, [2, 3, 4, 5, 6]), d = pick(rng, [3, 4, 6].filter(v => k < v * 2 && (k % v !== 0)));
  return {
    title: t('Degrés et radians', 'Degrees and radians', 'الدرجات والراديان', 'Grados y radianes'),
    summary: `180° = π rad · ${a.deg}° = ${a.rad} · ${k}π/${d} = ${(180 * k) / d}°`,
    steps: [
      { type: 'choice', ...rads, prompt: t(`${a.deg}° en radians ?`, `${a.deg}° in radians?`, `${a.deg}° بالراديان؟`, `¿${a.deg}° en radianes?`), hint: t(`180° = π : ${a.deg}° = π × ${a.deg}/180.`, `180° = π: ${a.deg}° = π × ${a.deg}/180.`, `180° = π.`, `180° = π.`) },
      { type: 'number', answer: (180 * k) / d, tolerance: 0, prompt: t(`${k}π/${d} rad en degrés ?`, `${k}π/${d} rad in degrees?`, `${k}π/${d} بالدرجات؟`, `¿${k}π/${d} en grados?`), hint: t(`Remplace π par 180° : ${k} × 180 ÷ ${d}.`, `Replace π by 180°: ${k} × 180 ÷ ${d}.`, `π = 180°.`, `π = 180°.`) },
    ],
  };
}

function ucValues(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, ANGLES.slice(1, 4)), b = pick(rng, ANGLES.filter(x => x !== a));
  return {
    title: t('Valeurs remarquables', 'Key values', 'القيم الخاصة', 'Valores notables'),
    summary: ANGLES.map(x => `${x.rad} : cos ${x.cos}, sin ${x.sin}`).join(' · '),
    steps: [
      { type: 'choice', options: VALUES, answer: VALUES.findIndex(v => v.fr === a.cos), prompt: t(`cos(${a.rad}) = ?`, `cos(${a.rad}) = ?`, `cos(${a.rad}) = ؟`, `cos(${a.rad}) = ?`), hint: t('Sur le cercle de rayon 1, cos est l’abscisse du point. π/3 = 60° : demi-triangle équilatéral → 1/2.', 'On the unit circle, cos is the x-coordinate. π/3: half an equilateral triangle → 1/2.', 'cos هو الأفصول.', 'cos es la abscisa.') },
      { type: 'choice', options: VALUES, answer: VALUES.findIndex(v => v.fr === b.sin), prompt: t(`sin(${b.rad}) = ?`, `sin(${b.rad}) = ?`, `sin(${b.rad}) = ؟`, `sen(${b.rad}) = ?`), hint: t('sin est l’ordonnée du point sur le cercle.', 'sin is the y-coordinate on the circle.', 'sin هو الأرتوب.', 'sen es la ordenada.') },
    ],
  };
}

function ucSigns(seed: number): Activity {
  const rng = seeded(seed);
  const deg = pick(rng, [120, 135, 150, 210, 225, 240, 300, 315, 330]);
  const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180);
  return {
    title: t('Signes de cos et sin', 'Signs of cos and sin', 'إشارتا cos و sin', 'Signos de cos y sen'),
    summary: `${deg}° : cos ${c > 0 ? '+' : '−'}, sin ${s > 0 ? '+' : '−'} (quart ${deg < 180 ? 2 : deg < 270 ? 3 : 4})`,
    steps: [
      { type: 'choice', options: SIGNS2, answer: c > 0 ? 0 : 1, prompt: t(`Quel est le signe de cos(${deg}°) ?`, `Sign of cos(${deg}°)?`, `إشارة cos(${deg}°)؟`, `¿Signo de cos(${deg}°)?`), hint: t('Place le point sur le cercle : à gauche de l’axe vertical, le cosinus est négatif.', 'Place the point: left of the vertical axis, cosine is negative.', 'يسار المحور العمودي cos سالب.', 'A la izquierda, cos es negativo.') },
      { type: 'choice', options: SIGNS2, answer: s > 0 ? 0 : 1, prompt: t(`Et le signe de sin(${deg}°) ?`, `And the sign of sin(${deg}°)?`, `وإشارة sin(${deg}°)؟`, `¿Y de sen(${deg}°)?`), hint: t('Sous l’axe horizontal, le sinus est négatif.', 'Below the horizontal axis, sine is negative.', 'تحت المحور الأفقي sin سالب.', 'Debajo, sen es negativo.') },
    ],
  };
}

function ucIdentity(seed: number): Activity {
  const rng = seeded(seed);
  const [c, s] = pick(rng, [[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28]] as [number, number][]);
  const neg = rng() < 0.5;
  return {
    title: t('cos² + sin² = 1', 'cos² + sin² = 1', 'cos² + sin² = 1', 'cos² + sen² = 1'),
    summary: `cos x = ${dec(c)} et sin x ${neg ? '< 0' : '> 0'} : sin x = ${neg ? '−' : ''}${dec(s)}`,
    steps: [{ type: 'number', answer: Math.round((1 - c * c) * 10000) / 10000, tolerance: 1e-9, prompt: t(`cos x = ${dec(c)}. Calcule sin² x.`, `cos x = ${dec(c)}. Work out sin² x.`, `احسب sin² x.`, `Calcula sen² x.`), hint: t(`sin² x = 1 − cos² x = 1 − ${dec(c)}².`, `sin² x = 1 − cos² x = 1 − ${dec(c)}².`, `sin² x = 1 − cos² x.`, `sen² x = 1 − cos² x.`) },
      { type: 'number', answer: neg ? -s : s, tolerance: 1e-9, prompt: t(`cos x = ${dec(c)} et sin x ${neg ? 'est négatif' : 'est positif'}. Calcule sin x.`, `cos x = ${dec(c)} and sin x is ${neg ? 'negative' : 'positive'}. Find sin x.`, `احسب sin x.`, `Calcula sen x.`), hint: t(`sin² x = 1 − ${dec(c)}² = ${dec(1 - c * c)}, puis la racine avec le bon signe.`, `sin² x = 1 − ${dec(c)}² = ${dec(1 - c * c)}, then the root with the right sign.`, `sin² x = ${dec(1 - c * c)}.`, `sen² x = ${dec(1 - c * c)}.`) }],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const SECONDE_SKILLS: Skill[] = [
  { id: 'int-notation', review: 1, chapter: 'intervals', build: intNotation, title: s('Écrire un intervalle', 'Interval notation', 'كتابة مجال', 'Notación de intervalos'), desc: s('Crochets ouverts ou fermés.', 'Open or closed brackets.', 'أقواس مفتوحة أو مغلقة.', 'Corchetes abiertos o cerrados.') },
  { id: 'int-union', review: 0, chapter: 'intervals', build: intUnion, title: s('Intersection et réunion', 'Intersection and union', 'التقاطع والاتحاد', 'Intersección y unión'), desc: s('« Et », « ou ».', '“And”, “or”.', '« و » ، « أو ».', '«Y», «o».') },
  { id: 'int-abs', review: 0, chapter: 'intervals', build: intAbs, title: s('Valeur absolue', 'Absolute value', 'القيمة المطلقة', 'Valor absoluto'), desc: s('Une distance sur la droite.', 'A distance on the line.', 'مسافة على المستقيم.', 'Una distancia en la recta.') },
  { id: 'int-sets', review: 0, chapter: 'intervals', build: intSets, title: s('Ensembles de nombres', 'Sets of numbers', 'مجموعات الأعداد', 'Conjuntos de números'), desc: s('ℕ, ℤ, 𝔻, ℚ, ℝ.', 'ℕ, ℤ, 𝔻, ℚ, ℝ.', 'ℕ، ℤ، 𝔻، ℚ، ℝ.', 'ℕ, ℤ, 𝔻, ℚ, ℝ.') },
  { id: 'fn-image', review: 0, chapter: 'reference', build: fnImage, title: s('Image et antécédents', 'Images and pre-images', 'الصورة والسوابق', 'Imagen y antecedentes'), desc: s('Calculer, résoudre f(x) = k.', 'Compute, solve f(x) = k.', 'الحساب وحل f(x) = k.', 'Calcular, resolver f(x) = k.') },
  { id: 'fn-reading', review: 0, chapter: 'reference', build: fnReading, title: s('Lire une courbe', 'Read a curve', 'قراءة منحنى', 'Leer una curva'), desc: s('Image, minimum, solutions.', 'Image, minimum, solutions.', 'الصورة والقيمة الدنيا والحلول.', 'Imagen, mínimo, soluciones.') },
  { id: 'fn-variations', review: 0, chapter: 'reference', build: fnVariations, title: s('Variations', 'Variations', 'التغيرات', 'Variaciones'), desc: s('Maximum, minimum, comparer.', 'Max, min, compare.', 'القصوى والدنيا والمقارنة.', 'Máximo, mínimo, comparar.') },
  { id: 'fn-reference', review: 2, chapter: 'reference', build: fnReference, title: s('Fonctions de référence', 'Reference functions', 'الدوال المرجعية', 'Funciones de referencia'), desc: s('Carré, inverse, racine, cube.', 'Square, reciprocal, root, cube.', 'المربع، المقلوب، الجذر، المكعب.', 'Cuadrado, inversa, raíz, cubo.') },
  { id: 'sign-affine', review: 0, chapter: 'signtable', build: signAffine, title: s('Signe de ax + b', 'Sign of ax + b', 'إشارة ax + b', 'Signo de ax + b'), desc: s('La racine, puis le signe de a.', 'The root, then the sign of a.', 'الجذر ثم إشارة a.', 'La raíz y el signo de a.') },
  { id: 'sign-product', review: 0, chapter: 'signtable', build: signProduct, title: s('Signe d’un produit', 'Sign of a product', 'إشارة جداء', 'Signo de un producto'), desc: s('Le tableau de signes.', 'The sign table.', 'جدول الإشارة.', 'La tabla de signos.') },
  { id: 'sign-inequality', review: 0, chapter: 'signtable', build: signInequality, title: s('Inéquations produit', 'Product inequalities', 'متراجحات الجداء', 'Inecuaciones producto'), desc: s('Lire les solutions dans le tableau.', 'Read the solutions in the table.', 'قراءة الحلول من الجدول.', 'Leer las soluciones.') },
  { id: 'sign-quotient', review: 0, chapter: 'signtable', build: signQuotient, title: s('Signe d’un quotient', 'Sign of a quotient', 'إشارة خارج', 'Signo de un cociente'), desc: s('Valeur interdite et signe.', 'Excluded value and sign.', 'القيمة الممنوعة والإشارة.', 'Valor prohibido y signo.') },
  { id: 'line-slope', review: 0, chapter: 'lineeq', build: lineSlope, title: s('Coefficient directeur', 'Gradient', 'المعامل الموجه', 'Pendiente'), desc: s('Avec deux points.', 'From two points.', 'من نقطتين.', 'Con dos puntos.') },
  { id: 'line-read', review: 0, chapter: 'lineeq', build: lineRead, title: s('Lire une droite', 'Read a line', 'قراءة مستقيم', 'Leer una recta'), desc: s('p et m sur le graphique.', 'p and m on the graph.', 'p و m على التمثيل.', 'p y m en la gráfica.') },
  { id: 'line-parallel', review: 0, chapter: 'lineeq', build: lineParallel, title: s('Parallèles et points', 'Parallels and points', 'التوازي والنقط', 'Paralelas y puntos'), desc: s('Même coefficient directeur.', 'Same gradient.', 'نفس المعامل الموجه.', 'Misma pendiente.') },
  { id: 'line-cartesian', review: 0, chapter: 'lineeq', build: lineCartesian, title: s('Équation cartésienne', 'Cartesian equation', 'المعادلة الديكارتية', 'Ecuación cartesiana'), desc: s('ax + by + c = 0, déterminant.', 'ax + by + c = 0, determinant.', 'ax + by + c = 0 والمحدد.', 'ax + by + c = 0, determinante.') },
  { id: 'q-quartiles', review: 0, chapter: 'quartiles', build: qQuartiles, title: s('Les quartiles', 'Quartiles', 'الربيعيات', 'Cuartiles'), desc: s('Q1, Q3, écart interquartile.', 'Q1, Q3, IQR.', 'Q1 و Q3.', 'Q1, Q3, rango.') },
  { id: 'q-box', review: 0, chapter: 'quartiles', build: qBox, title: s('Diagramme en boîte', 'Box plot', 'مخطط العلبة', 'Diagrama de caja'), desc: s('Lire les cinq nombres.', 'Read the five numbers.', 'قراءة الأعداد الخمسة.', 'Leer los cinco números.') },
  { id: 'q-weighted', review: 1, chapter: 'quartiles', build: qWeighted, title: s('Moyenne pondérée', 'Weighted mean', 'المعدل المرجح', 'Media ponderada'), desc: s('Valeurs et effectifs.', 'Values and counts.', 'القيم والحصيصات.', 'Valores y efectivos.') },
  { id: 'q-std', review: 1, chapter: 'quartiles', build: qStd, title: s('Écart type', 'Standard deviation', 'الانحراف المعياري', 'Desviación típica'), desc: s('Mesurer la dispersion.', 'Measure the spread.', 'قياس التشتت.', 'Medir la dispersión.') },
  { id: 'ev-universe', review: 1, chapter: 'events', build: evUniverse, title: s('Univers et événements', 'Sample space', 'الكون والأحداث', 'Espacio muestral'), desc: s('Compter les issues.', 'Count the outcomes.', 'عد الإمكانيات.', 'Contar resultados.') },
  { id: 'ev-union', review: 0, chapter: 'events', build: evUnion, title: s('Réunion, contraire', 'Union, complement', 'الاتحاد والمضاد', 'Unión, contrario'), desc: s('P(A ∪ B), P(Ā).', 'P(A ∪ B), P(Ā).', 'P(A ∪ B)، P(Ā).', 'P(A ∪ B), P(Ā).') },
  { id: 'ev-table', review: 0, chapter: 'events', build: evTable, title: s('Tableau croisé', 'Two-way table', 'الجدول المزدوج', 'Tabla de contingencia'), desc: s('Lire des probabilités.', 'Read probabilities.', 'قراءة الاحتمالات.', 'Leer probabilidades.') },
  { id: 'ev-two-draws', review: 0, chapter: 'events', build: evTwoDraws, title: s('Deux tirages', 'Two draws', 'سحبان', 'Dos extracciones'), desc: s('Multiplier sur un arbre.', 'Multiply along a tree.', 'الضرب على الشجرة.', 'Multiplicar en el árbol.') },
  { id: 'uc-radians', review: 0, chapter: 'unitcircle', build: ucRadians, title: s('Degrés et radians', 'Degrees and radians', 'الدرجات والراديان', 'Grados y radianes'), desc: s('180° = π.', '180° = π.', '180° = π.', '180° = π.') },
  { id: 'uc-values', review: 0, chapter: 'unitcircle', build: ucValues, title: s('Valeurs remarquables', 'Key values', 'القيم الخاصة', 'Valores notables'), desc: s('π/6, π/4, π/3.', 'π/6, π/4, π/3.', 'π/6، π/4، π/3.', 'π/6, π/4, π/3.') },
  { id: 'uc-signs', review: 0, chapter: 'unitcircle', build: ucSigns, title: s('Signes de cos et sin', 'Signs of cos and sin', 'الإشارات', 'Signos'), desc: s('Les quatre quarts du cercle.', 'The four quarters.', 'الأرباع الأربعة.', 'Los cuatro cuadrantes.') },
  { id: 'uc-identity', review: 0, chapter: 'unitcircle', build: ucIdentity, title: s('cos² + sin² = 1', 'cos² + sin² = 1', 'cos² + sin² = 1', 'cos² + sen² = 1'), desc: s('Trouver l’un avec l’autre.', 'Find one from the other.', 'إيجاد أحدهما من الآخر.', 'Hallar uno con el otro.') },
];
