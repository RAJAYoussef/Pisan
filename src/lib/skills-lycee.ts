// Parcours de compétences de Terminale : suites, dérivation, probabilités.
// Même démarche : observer ou manipuler (termes sur un graphique, tangente qui glisse sur la courbe),
// puis calculer et rédiger. Fonctions pures et déterministes : couvert par src/test/skills.test.tsx.
import { seeded } from './exercises';
import { fmt, pick, t, type Activity, type Grid, type P, type Rng, type Scene, type Skill, type Step, type Table } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const r2 = (v: number) => Math.round(v * 100) / 100;
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const subscript = (n: number) => String(n).split('').map(d => SUB[Number(d)]).join('');
const superscript = (n: number) => String(n).split('').map(d => SUP[Number(d)]).join('');
const signed = (v: number) => (v < 0 ? `− ${fmt(-v)}` : `+ ${fmt(v)}`);

// ═════════════ SUITES ═════════════

function termsScene(terms: number[]): Scene {
  const maxY = Math.max(4, Math.ceil(Math.max(...terms)) + 1), minY = Math.min(0, Math.floor(Math.min(...terms)) - 1);
  const grid: Grid = { minX: 0, maxX: terms.length, minY, maxY, axes: true };
  return { grid, points: Object.fromEntries(terms.map((u, n) => [`u${subscript(n)}`, { x: n, y: u }])), segments: [] };
}

function seqNature(seed: number): Activity {
  const rng = seeded(seed);
  const u0 = int(rng, 1, 3), r = pick(rng, [1, 2, -1]);
  const arith = Array.from({ length: 5 }, (_, n) => u0 + r * n);
  const g0 = pick(rng, [1, 2]), q = pick(rng, [2, 0.5]);
  const geo = Array.from({ length: 5 }, (_, n) => g0 * q ** n);
  const ar = r > 0 ? arith : arith.map(v => v + 5);
  const options = [t('arithmétique', 'arithmetic', 'حسابية', 'aritmética'), t('géométrique', 'geometric', 'هندسية', 'geométrica'), t('ni l’un ni l’autre', 'neither', 'لا هذه ولا تلك', 'ninguna')];
  const n = int(rng, 6, 10);
  return {
    title: t('Suites arithmétiques et géométriques', 'Arithmetic and geometric sequences', 'المتتاليات الحسابية والهندسية', 'Sucesiones aritméticas y geométricas'),
    summary: `arithmétique : uₙ = u₀ + n r · géométrique : uₙ = u₀ × qⁿ`,
    steps: [
      { type: 'choice', scene: termsScene(ar), options, answer: 0, prompt: t(`Les premiers termes sont ${ar.join(' ; ')}. Les points sont alignés : la suite est…`, `The first terms are ${ar.join(' ; ')}. The points line up: the sequence is…`, `الحدود الأولى ${ar.join(' ; ')}. النقط مستقيمية: المتتالية…`, `Los primeros términos son ${ar.join(' ; ')}. Los puntos están alineados: la sucesión es…`), hint: t('On ajoute toujours le même nombre : les points sont alignés.', 'The same number is added each time: the points line up.', 'نضيف دائمًا نفس العدد: النقط مستقيمية.', 'Siempre se suma el mismo número: los puntos están alineados.') },
      { type: 'number', scene: termsScene(ar), answer: ar[1]! - ar[0]!, tolerance: 0, prompt: t('Quelle est sa raison r ?', 'What is its common difference r?', 'ما أساسها r؟', '¿Cuál es su diferencia r?'), hint: t('r = u₁ − u₀', 'r = u₁ − u₀', 'r = u₁ − u₀', 'r = u₁ − u₀') },
      { type: 'choice', scene: termsScene(geo), options, answer: 1, prompt: t(`Et la suite ${geo.map(fmt).join(' ; ')} ?`, `And the sequence ${geo.map(fmt).join(' ; ')}?`, `والمتتالية ${geo.map(fmt).join(' ; ')}؟`, `¿Y la sucesión ${geo.map(fmt).join(' ; ')}?`), hint: t('Chaque terme s’obtient en multipliant le précédent par le même nombre.', 'Each term is the previous one times the same number.', 'كل حد هو سابقه مضروبًا في نفس العدد.', 'Cada término es el anterior multiplicado por el mismo número.') },
      { type: 'number', answer: g0 * q ** n, tolerance: Math.max(1e-6, (g0 * q ** n) * 1e-6), prompt: t(`uₙ est géométrique, u₀ = ${g0}, q = ${fmt(q)}. Calcule u${subscript(n)}.`, `uₙ is geometric, u₀ = ${g0}, q = ${fmt(q)}. Work out u${subscript(n)}.`, `uₙ هندسية، u₀ = ${g0}، q = ${fmt(q)}. احسب u${subscript(n)}.`, `uₙ es geométrica, u₀ = ${g0}, q = ${fmt(q)}. Calcula u${subscript(n)}.`), hint: t(`u${subscript(n)} = u₀ × q${superscript(n)} = ${g0} × ${fmt(q)}${superscript(n)}`, `u${subscript(n)} = u₀ × q${superscript(n)}`, `u${subscript(n)} = u₀ × q${superscript(n)}`, `u${subscript(n)} = u₀ × q${superscript(n)}`) },
    ],
  };
}

function seqRecurrence(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [0.5, 0.8, 0.6]), b = pick(rng, [2, 3, 4]), u0 = pick(rng, [0, 1, 10]);
  const u1 = a * u0 + b, u2 = a * u1 + b;
  const l = b / (1 - a);
  return {
    title: t('Suite définie par récurrence', 'Recursively defined sequence', 'متتالية معرفة بعلاقة تراجعية', 'Sucesión definida por recurrencia'),
    summary: `uₙ₊₁ = ${fmt(a)} uₙ + ${b} · ℓ = ${fmt(r2(l))} · vₙ = uₙ − ℓ géométrique de raison ${fmt(a)}`,
    steps: [
      { type: 'number', answer: u1, tolerance: 1e-6, prompt: t(`u₀ = ${u0} et uₙ₊₁ = ${fmt(a)} uₙ + ${b}. Calcule u₁.`, `u₀ = ${u0} and uₙ₊₁ = ${fmt(a)} uₙ + ${b}. Work out u₁.`, `u₀ = ${u0} و uₙ₊₁ = ${fmt(a)} uₙ + ${b}. احسب u₁.`, `u₀ = ${u0} y uₙ₊₁ = ${fmt(a)} uₙ + ${b}. Calcula u₁.`), hint: t(`u₁ = ${fmt(a)} × ${u0} + ${b}`, `u₁ = ${fmt(a)} × ${u0} + ${b}`, `u₁ = ${fmt(a)} × ${u0} + ${b}`, `u₁ = ${fmt(a)} × ${u0} + ${b}`) },
      { type: 'number', answer: u2, tolerance: 1e-6, prompt: t('Calcule u₂.', 'Work out u₂.', 'احسب u₂.', 'Calcula u₂.'), hint: t(`u₂ = ${fmt(a)} × u₁ + ${b} = ${fmt(a)} × ${fmt(u1)} + ${b}`, `u₂ = ${fmt(a)} × ${fmt(u1)} + ${b}`, `u₂ = ${fmt(a)} × ${fmt(u1)} + ${b}`, `u₂ = ${fmt(a)} × ${fmt(u1)} + ${b}`) },
      { type: 'number', answer: l, tolerance: 0.006, prompt: t(`Si la suite converge vers ℓ, alors ℓ = ${fmt(a)} ℓ + ${b}. Calcule ℓ.`, `If it converges to ℓ, then ℓ = ${fmt(a)} ℓ + ${b}. Work out ℓ.`, `إذا كانت متقاربة نحو ℓ فإن ℓ = ${fmt(a)} ℓ + ${b}. احسب ℓ.`, `Si converge hacia ℓ, entonces ℓ = ${fmt(a)} ℓ + ${b}. Calcula ℓ.`), hint: t(`ℓ − ${fmt(a)} ℓ = ${b}, donc ℓ = ${b} ÷ (1 − ${fmt(a)}).`, `ℓ = ${b} ÷ (1 − ${fmt(a)}).`, `ℓ = ${b} ÷ (1 − ${fmt(a)}).`, `ℓ = ${b} ÷ (1 − ${fmt(a)}).`) },
      { type: 'choice', answer: 1, options: [t('arithmétique de raison ' + b, 'arithmetic with difference ' + b, 'حسابية أساسها ' + b, 'aritmética de diferencia ' + b), t(`géométrique de raison ${fmt(a)}`, `geometric with ratio ${fmt(a)}`, `هندسية أساسها ${fmt(a)}`, `geométrica de razón ${fmt(a)}`), t('constante', 'constant', 'ثابتة', 'constante')], prompt: t(`On pose vₙ = uₙ − ${fmt(r2(l))}. La suite (vₙ) est…`, `Let vₙ = uₙ − ${fmt(r2(l))}. The sequence (vₙ) is…`, `نضع vₙ = uₙ − ${fmt(r2(l))}. المتتالية (vₙ)…`, `Sea vₙ = uₙ − ${fmt(r2(l))}. La sucesión (vₙ) es…`), hint: t(`vₙ₊₁ = uₙ₊₁ − ℓ = ${fmt(a)} uₙ + ${b} − ℓ = ${fmt(a)} (uₙ − ℓ) = ${fmt(a)} vₙ.`, `vₙ₊₁ = ${fmt(a)} vₙ.`, `vₙ₊₁ = ${fmt(a)} vₙ.`, `vₙ₊₁ = ${fmt(a)} vₙ.`) },
    ],
  };
}

function seqLimits(seed: number): Activity {
  const rng = seeded(seed);
  const qs = shuffle(rng, [{ q: 0.7, a: 0 }, { q: 1.3, a: 1 }, { q: -0.5, a: 0 }]);
  const options = [same('0'), same('+∞'), t('pas de limite', 'no limit', 'لا نهاية لها', 'sin límite')];
  const q = pick(rng, [0.8, 0.9, 0.7]), eps = pick(rng, [0.01, 0.05]);
  const n0 = Math.ceil(Math.log(eps) / Math.log(q));
  return {
    title: t('Limites de suites', 'Limits of sequences', 'نهايات المتتاليات', 'Límites de sucesiones'),
    summary: `qⁿ → 0 si −1 < q < 1, → +∞ si q > 1 · ${fmt(q)}ⁿ < ${fmt(eps)} dès n = ${n0}`,
    steps: [
      ...qs.map(c => ({ type: 'choice' as const, options, answer: c.a, prompt: t(`Limite de (${fmt(c.q)})ⁿ quand n → +∞ ?`, `Limit of (${fmt(c.q)})ⁿ as n → +∞?`, `نهاية (${fmt(c.q)})ⁿ عندما n → +∞؟`, `¿Límite de (${fmt(c.q)})ⁿ cuando n → +∞?`), hint: t('Si −1 < q < 1, qⁿ tend vers 0 ; si q > 1, vers +∞.', 'If −1 < q < 1, qⁿ → 0; if q > 1, → +∞.', 'إذا كان −1 < q < 1 فإن qⁿ → 0؛ وإذا كان q > 1 فإن qⁿ → +∞.', 'Si −1 < q < 1, qⁿ → 0; si q > 1, → +∞.') })),
      { type: 'number', answer: n0, tolerance: 0, prompt: t(`Plus petit entier n tel que ${fmt(q)}ⁿ < ${fmt(eps)} ?`, `Smallest integer n with ${fmt(q)}ⁿ < ${fmt(eps)}?`, `أصغر عدد صحيح n بحيث ${fmt(q)}ⁿ < ${fmt(eps)}؟`, `¿Menor entero n con ${fmt(q)}ⁿ < ${fmt(eps)}?`), hint: t(`n > ln(${fmt(eps)}) ÷ ln(${fmt(q)}) (attention : ln(${fmt(q)}) < 0 change le sens).`, `n > ln(${fmt(eps)}) ÷ ln(${fmt(q)}) (ln(${fmt(q)}) < 0 flips the inequality).`, `n > ln(${fmt(eps)}) ÷ ln(${fmt(q)}).`, `n > ln(${fmt(eps)}) ÷ ln(${fmt(q)}).`) },
    ],
  };
}

function seqInduction(seed: number): Activity {
  const rng = seeded(seed);
  const b = pick(rng, [2, 3, 4]);
  const steps3 = [
    t(`Initialisation : u₀ = 0 ≤ ${b * 2}, donc P(0) est vraie.`, `Base case: u₀ = 0 ≤ ${b * 2}, so P(0) holds.`, `التهيئة: u₀ = 0 ≤ ${b * 2}، إذن P(0) صحيحة.`, `Inicialización: u₀ = 0 ≤ ${b * 2}, P(0) es cierta.`),
    t(`Hérédité : si uₙ ≤ ${b * 2}, alors 0,5 uₙ + ${b} ≤ 0,5 × ${b * 2} + ${b} = ${b * 2}.`, `Inductive step: if uₙ ≤ ${b * 2}, then 0.5 uₙ + ${b} ≤ ${b * 2}.`, `الوراثة: إذا كان uₙ ≤ ${b * 2} فإن 0,5 uₙ + ${b} ≤ ${b * 2}.`, `Herencia: si uₙ ≤ ${b * 2}, entonces 0,5 uₙ + ${b} ≤ ${b * 2}.`),
    t(`Conclusion : pour tout entier n, uₙ ≤ ${b * 2}.`, `Conclusion: for every n, uₙ ≤ ${b * 2}.`, `الخلاصة: لكل عدد صحيح n، uₙ ≤ ${b * 2}.`, `Conclusión: para todo n, uₙ ≤ ${b * 2}.`),
  ];
  const order = shuffle(rng, [0, 1, 2]); // order[k] = étape affichée en (k + 1)
  const label = (k: number) => '(' + 'abc'[k] + ')';
  const listed = (lang: 'fr' | 'en' | 'ar' | 'es') => order.map((i, k) => `${label(k)} ${steps3[i]![lang].replace(/^[^:]+: ?/, '')}`).join('  ');
  const right = [0, 1, 2].map(i => label(order.indexOf(i))).join(' → ');
  const wrong1 = [1, 0, 2].map(i => label(order.indexOf(i))).join(' → '), wrong2 = [0, 2, 1].map(i => label(order.indexOf(i))).join(' → ');
  const options = shuffle(rng, [right, wrong1, wrong2]);
  return {
    title: t('Raisonnement par récurrence', 'Proof by induction', 'الاستدلال بالترجع', 'Razonamiento por inducción'),
    summary: 'initialisation → hérédité (P(n) ⇒ P(n+1)) → conclusion',
    steps: [
      {
        type: 'choice', options: options.map(same), answer: options.indexOf(right),
        prompt: t(`u₀ = 0, uₙ₊₁ = 0,5 uₙ + ${b}. On montre P(n) : « uₙ ≤ ${b * 2} ». Dans quel ordre écrire ces étapes ?  ${listed('fr')}`, `u₀ = 0, uₙ₊₁ = 0.5 uₙ + ${b}. We prove P(n): “uₙ ≤ ${b * 2}”. In which order?  ${listed('en')}`, `u₀ = 0، uₙ₊₁ = 0,5 uₙ + ${b}. نبرهن P(n): «uₙ ≤ ${b * 2}». بأي ترتيب نكتب هذه المراحل؟  ${listed('ar')}`, `u₀ = 0, uₙ₊₁ = 0,5 uₙ + ${b}. Probamos P(n): «uₙ ≤ ${b * 2}». ¿En qué orden?  ${listed('es')}`),
        hint: t('Initialisation (premier rang), puis hérédité (la propriété se transmet), puis conclusion.', 'Base case, then inductive step, then conclusion.', 'التهيئة ثم الوراثة ثم الخلاصة.', 'Inicialización, herencia y conclusión.'),
      },
      {
        type: 'sentence', prompt: t('Complète l’hérédité.', 'Complete the inductive step.', 'أكمل مرحلة الوراثة.', 'Completa la herencia.'),
        parts: [t('Supposons P(n) vraie pour', 'Assume P(n) holds for', 'نفترض أن P(n) صحيحة من أجل', 'Supongamos P(n) cierta para'), { options: [t('un entier n fixé', 'some fixed integer n', 'عدد صحيح n مثبت', 'un entero n fijo'), t('tout entier n', 'every integer n', 'كل عدد صحيح n', 'todo entero n')], answer: [0] }, t('; montrons que', '; let us show that', '؛ لنبين أن', '; probemos que'), { options: [same('P(n + 1)'), same('P(n)'), same('P(0)')], answer: [0] }, t('est vraie.', 'holds.', 'صحيحة.', 'es cierta.')],
        hint: t('Supposer « pour tout n » reviendrait à supposer ce qu’on veut démontrer.', 'Assuming “for every n” would assume what we want to prove.', 'افتراض «لكل n» يعني افتراض ما نريد إثباته.', 'Suponer «para todo n» sería suponer lo que se quiere probar.'),
      },
    ],
  };
}

// ═════════════ DÉRIVATION ═════════════

/** f(x) = a x² + b x + c */
const quad = (a: number, b: number, c: number) => (x: number) => a * x * x + b * x + c;
const coefText = (k: number) => (k === 1 ? '' : k === -1 ? '−' : fmt(k).replace('-', '−'));
/** a x² + b x + c écrit proprement (pas de « 1x », pas de « + 0 »). */
export function quadText(a: number, b: number, c: number): string {
  let out = `${coefText(a)}x²`;
  if (b) out += ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : fmt(Math.abs(b))}x`;
  if (c) out += ` ${signed(c)}`;
  return out;
}
const linText = (k: number, m: number) => `${k === 0 ? '' : `${coefText(k)}x`}${m ? (k === 0 ? fmt(m).replace('-', '−') : ` ${signed(m)}`) : k === 0 ? '0' : ''}`;
export function curvePoints(f: (x: number) => number, g: Grid, steps = 80): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= steps; i++) { const x = g.minX + ((g.maxX - g.minX) * i) / steps; const y = f(x); if (y >= g.minY && y <= g.maxY) pts.push({ x, y }); }
  return pts;
}

function derivSlope(seed: number): Activity {
  const rng = seeded(seed);
  const xv = pick(rng, [-1, 1, 2]), k = pick(rng, [-2, -1, 1]);
  const a = 0.5, b = -2 * a * xv, c = k + a * xv * xv; // sommet en (xv ; k)
  const f = quad(a, b, c);
  const g: Grid = { minX: -4, maxX: 5, minY: -3, maxY: 6, axes: true };
  const x0 = pick(rng, [xv + 2, xv - 2].filter(x => x >= g.minX + 1 && x <= g.maxX - 1));
  const slope = 2 * a * x0 + b;
  const tan = (x: number) => f(x0) + slope * (x - x0);
  const scene: Scene = { grid: g, curves: [curvePoints(f, g)], points: { M: { x: x0, y: f(x0) }, T1: { x: x0 - 1.5, y: tan(x0 - 1.5) }, T2: { x: x0 + 1.5, y: tan(x0 + 1.5) } }, hidden: ['T1', 'T2'], segments: [{ id: 't', a: 'T1', b: 'T2', style: 'bold' }] };
  return {
    title: t('Nombre dérivé et tangente', 'Derivative and tangent', 'العدد المشتق والمماس', 'Derivada y tangente'),
    summary: `f′(a) = pente de la tangente en a · tangente horizontale ⇔ f′(a) = 0 (ici en x = ${xv})`,
    steps: [
      { type: 'widget', widget: { kind: 'tangent', a, b, c, target: xv }, prompt: t(`f(x) = ${quadText(a, b, c)}. Fais glisser le point sur la courbe jusqu’à ce que la tangente soit horizontale.`, `f(x) = ${quadText(a, b, c)}. Slide the point along the curve until the tangent is horizontal.`, `f(x) = ${quadText(a, b, c)}. حرّك النقطة على المنحنى حتى يصبح المماس أفقيًا.`, `f(x) = ${quadText(a, b, c)}. Desliza el punto por la curva hasta que la tangente sea horizontal.`), hint: t('Regarde le signe de la pente affichée : il faut qu’elle vaille 0.', 'Watch the slope shown: it must be 0.', 'لاحظ قيمة الميل المعروضة: يجب أن تساوي 0.', 'Mira la pendiente mostrada: debe valer 0.') },
      { type: 'choice', answer: 0, options: [t(`f′(${xv}) = 0`, `f′(${xv}) = 0`, `f′(${xv}) = 0`, `f′(${xv}) = 0`), t(`f(${xv}) = 0`, `f(${xv}) = 0`, `f(${xv}) = 0`, `f(${xv}) = 0`), t(`f′(0) = ${xv}`, `f′(0) = ${xv}`, `f′(0) = ${xv}`, `f′(0) = ${xv}`)], prompt: t(`La tangente est horizontale en x = ${xv}. On peut donc écrire…`, `The tangent is horizontal at x = ${xv}. So…`, `المماس أفقي عند x = ${xv}. إذن…`, `La tangente es horizontal en x = ${xv}. Entonces…`), hint: t('Le nombre dérivé est la pente de la tangente ; une droite horizontale a une pente nulle.', 'The derivative is the tangent’s slope; a horizontal line has slope 0.', 'العدد المشتق هو ميل المماس، والمستقيم الأفقي ميله منعدم.', 'La derivada es la pendiente de la tangente; una horizontal tiene pendiente 0.') },
      { type: 'number', scene, answer: slope, tolerance: 0, prompt: t(`La tangente à la courbe au point M d’abscisse ${x0} est tracée. Lis f′(${x0}) sur le graphique.`, `The tangent at M (x = ${x0}) is drawn. Read f′(${x0}) on the graph.`, `المماس عند النقطة M ذات الأفصول ${x0} مرسوم. اقرأ f′(${x0}).`, `La tangente en M (x = ${x0}) está trazada. Lee f′(${x0}).`), hint: t('Depuis M, avance de 1 vers la droite le long de la tangente : de combien monte-t-elle (ou descend-elle) ?', 'From M, go 1 right along the tangent: how much does it rise (or fall)?', 'من M تقدّم 1 نحو اليمين على المماس: بكم يرتفع أو ينخفض؟', 'Desde M, avanza 1 a la derecha por la tangente: ¿cuánto sube o baja?') },
    ],
  };
}

const RULES: { q: [string, string]; options: string[] }[] = [
  { q: ['(u v)′ = ?', '(u v)′ = ?'], options: ['u′ v + u v′', 'u′ v′', 'u′ v − u v′'] },
  { q: ['(u / v)′ = ?', '(u / v)′ = ?'], options: ['(u′ v − u v′) / v²', '(u′ v + u v′) / v²', 'u′ / v′'] },
  { q: ['(eᵘ)′ = ?', '(eᵘ)′ = ?'], options: ['u′ eᵘ', 'eᵘ', 'u eᵘ⁻¹'] },
  { q: ['(ln u)′ = ?', '(ln u)′ = ?'], options: ['u′ / u', '1 / u', 'ln u′'] },
];

function derivRules(seed: number): Activity {
  const rng = seeded(seed);
  const rules = shuffle(rng, RULES).slice(0, 2);
  const a = pick(rng, [2, 3, -1]), b = pick(rng, [-4, 1, 5]), c = pick(rng, [-2, 7]), x0 = pick(rng, [-1, 2, 3]);
  const k = pick(rng, [2, 3]);
  const steps: Step[] = rules.map(r => {
    const order = shuffle(rng, [0, 1, 2]);
    return { type: 'choice', options: order.map(i => same(r.options[i]!)), answer: order.indexOf(0), prompt: same(r.q[0]), hint: t('Formule du cours : apprends-la par cœur, puis vérifie avec un exemple simple.', 'A formula to know by heart: check it on a simple example.', 'صيغة من الدرس: احفظها وتحقق منها بمثال بسيط.', 'Fórmula del curso: apréndela y compruébala con un ejemplo.') };
  });
  steps.push(
    { type: 'number', answer: 2 * a * x0 + b, tolerance: 0, prompt: t(`f(x) = ${quadText(a, b, c)}. Calcule f′(${x0}).`, `f(x) = ${quadText(a, b, c)}. Work out f′(${x0}).`, `f(x) = ${quadText(a, b, c)}. احسب f′(${x0}).`, `f(x) = ${quadText(a, b, c)}. Calcula f′(${x0}).`), hint: same(`f′(x) = ${linText(2 * a, b)}`) },
    { type: 'number', answer: k, tolerance: 0, prompt: t(`g(x) = e^(${k}x). Calcule g′(0).`, `g(x) = e^(${k}x). Work out g′(0).`, `g(x) = e^(${k}x). احسب g′(0).`, `g(x) = e^(${k}x). Calcula g′(0).`), hint: t(`g′(x) = ${k} e^(${k}x), et e⁰ = 1.`, `g′(x) = ${k} e^(${k}x), and e⁰ = 1.`, `g′(x) = ${k} e^(${k}x) و e⁰ = 1.`, `g′(x) = ${k} e^(${k}x), y e⁰ = 1.`) },
  );
  return { title: t('Calculer une dérivée', 'Computing a derivative', 'حساب مشتقة', 'Calcular una derivada'), steps, summary: `(uv)′ = u′v + uv′ · (eᵘ)′ = u′eᵘ · f′(${x0}) = ${fmt(2 * a * x0 + b)}` };
}

function derivVariations(seed: number): Activity {
  const rng = seeded(seed);
  const p = pick(rng, [-2, -1, 0]), q = p + pick(rng, [2, 3, 4]);
  const table: Table = { head: [same('x'), same('f′(x)')], rows: [['−∞', '', String(p), '', String(q), '', '+∞'], ['', '+', '0', '−', '0', '+', '']] };
  return {
    title: t('Variations d’une fonction', 'Variations of a function', 'تغيرات دالة', 'Variaciones de una función'),
    summary: `f′ > 0 ⇒ f croissante · f′ < 0 ⇒ f décroissante · maximum en ${p}, minimum en ${q}`,
    steps: [
      { type: 'choice', table, answer: 1, options: [t(`croissante`, 'increasing', 'تزايدية', 'creciente'), t('décroissante', 'decreasing', 'تناقصية', 'decreciente'), t('constante', 'constant', 'ثابتة', 'constante')], prompt: t(`Voici le tableau de signes de f′. Sur [${p} ; ${q}], f est…`, `Here is the sign table of f′. On [${p} ; ${q}], f is…`, `هذا جدول إشارة f′. على [${p} ; ${q}] الدالة f…`, `Esta es la tabla de signos de f′. En [${p} ; ${q}], f es…`), hint: t('f′ < 0 sur cet intervalle : f y est décroissante.', 'f′ < 0 there: f is decreasing.', 'f′ < 0 على هذا المجال: f تناقصية.', 'f′ < 0 allí: f es decreciente.') },
      {
        type: 'sentence', table, prompt: t('Complète.', 'Complete.', 'أكمل.', 'Completa.'),
        parts: [t('f admet un', 'f has a local', 'تقبل f', 'f tiene un'), { options: [t('maximum local', 'maximum', 'قيمة قصوى محلية', 'máximo local'), t('minimum local', 'minimum', 'قيمة دنيا محلية', 'mínimo local')], answer: [0] }, t('en x =', 'at x =', 'عند x =', 'en x ='), { options: [same(String(p)), same(String(q))], answer: [0] }, t(', où f′ s’annule en changeant de signe (+ puis −).', ', where f′ changes sign (+ then −).', '، حيث تنعدم f′ مغيرة إشارتها (+ ثم −).', ', donde f′ cambia de signo (+ y luego −).')],
        hint: t('f monte puis descend : c’est un sommet, donc un maximum.', 'f goes up then down: a peak, so a maximum.', 'f تتزايد ثم تتناقص: إنها قمة، أي قيمة قصوى.', 'f sube y luego baja: una cima, un máximo.'),
      },
      { type: 'number', table, answer: q, tolerance: 0, prompt: t('En quelle valeur de x la fonction f admet-elle un minimum local ?', 'At which x does f have a local minimum?', 'عند أي قيمة لـ x تقبل f قيمة دنيا محلية؟', '¿En qué x tiene f un mínimo local?'), hint: t('f′ passe de − à + : f descend puis remonte.', 'f′ goes from − to +: f falls then rises.', 'f′ تنتقل من − إلى +.', 'f′ pasa de − a +.') },
    ],
  };
}

function derivTangentLine(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [1, -1, 2]), b = pick(rng, [-2, 0, 3]), c = pick(rng, [1, -3, 4]), x0 = pick(rng, [1, 2, -1]);
  const f = quad(a, b, c), fa = f(x0), d = 2 * a * x0 + b;
  const right = `y = ${linText(d, fa - d * x0)}`;
  const options = shuffle(rng, [...new Set([right, `y = ${linText(fa, d - fa * x0)}`, `y = ${linText(d, fa)}`, `y = ${linText(-d, fa + d * x0)}`])].slice(0, 3).map(same));
  return {
    title: t('Équation d’une tangente', 'Equation of a tangent', 'معادلة المماس', 'Ecuación de la tangente'),
    summary: `y = f′(a)(x − a) + f(a) → ${right}`,
    steps: [
      { type: 'number', answer: fa, tolerance: 0, prompt: t(`f(x) = ${quadText(a, b, c)}, a = ${x0}. Calcule f(${x0}).`, `f(x) = ${quadText(a, b, c)}, a = ${x0}. Work out f(${x0}).`, `f(x) = ${quadText(a, b, c)}، a = ${x0}. احسب f(${x0}).`, `f(x) = ${quadText(a, b, c)}, a = ${x0}. Calcula f(${x0}).`), hint: t('Remplace x par a.', 'Replace x with a.', 'عوّض x بـ a.', 'Sustituye x por a.') },
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Calcule f′(${x0}).`, `Work out f′(${x0}).`, `احسب f′(${x0}).`, `Calcula f′(${x0}).`), hint: same(`f′(x) = ${linText(2 * a, b)}`) },
      { type: 'choice', options, answer: options.findIndex(o => o.fr === right), prompt: t(`f(${x0}) = ${fmt(fa)} et f′(${x0}) = ${fmt(d)}. L’équation de la tangente en ${x0} est…`, `f(${x0}) = ${fmt(fa)} and f′(${x0}) = ${fmt(d)}. The tangent at ${x0} is…`, `f(${x0}) = ${fmt(fa)} و f′(${x0}) = ${fmt(d)}. معادلة المماس عند ${x0}…`, `f(${x0}) = ${fmt(fa)} y f′(${x0}) = ${fmt(d)}. La tangente en ${x0} es…`), hint: t(`y = f′(a)(x − a) + f(a) = ${fmt(d)}(x − (${x0})) + ${fmt(fa)}, puis développe.`, `y = f′(a)(x − a) + f(a), then expand.`, `y = f′(a)(x − a) + f(a) ثم انشر.`, `y = f′(a)(x − a) + f(a), luego desarrolla.`) },
    ],
  };
}

// ═════════════ PROBABILITÉS ═════════════

function probaTree(seed: number): Activity {
  const rng = seeded(seed);
  const pA = pick(rng, [0.3, 0.4, 0.6]), pBA = pick(rng, [0.5, 0.7, 0.9]), pBnA = pick(rng, [0.1, 0.2, 0.3]);
  const ab = pA * pBA, b = ab + (1 - pA) * pBnA;
  const table: Table = { head: [same('P(A)'), same('P_A(B)'), same('P_Ā(B)')], rows: [[fmt(pA)], [fmt(pBA)], [fmt(pBnA)]] };
  return {
    title: t('Arbre et probabilités conditionnelles', 'Trees and conditional probability', 'الشجرة والاحتمالات الشرطية', 'Árboles y probabilidad condicionada'),
    summary: `P(A ∩ B) = ${fmt(r3(ab))} · P(B) = ${fmt(r3(b))} · P_B(A) ≈ ${fmt(r2(ab / b))}`,
    steps: [
      { type: 'number', table, answer: 1 - pA, tolerance: 1e-6, prompt: t('Calcule P(Ā).', 'Work out P(Ā).', 'احسب P(Ā).', 'Calcula P(Ā).'), hint: t('Les branches issues d’un même nœud ont une somme égale à 1.', 'Branches from one node add up to 1.', 'مجموع الفروع المنطلقة من نفس العقدة يساوي 1.', 'Las ramas de un nodo suman 1.') },
      { type: 'number', table, answer: ab, tolerance: 1e-6, prompt: t('Calcule P(A ∩ B).', 'Work out P(A ∩ B).', 'احسب P(A ∩ B).', 'Calcula P(A ∩ B).'), hint: t('On multiplie le long du chemin : P(A) × P_A(B).', 'Multiply along the path: P(A) × P_A(B).', 'نضرب على طول المسار: P(A) × P_A(B).', 'Se multiplica a lo largo del camino.') },
      { type: 'number', table, answer: b, tolerance: 1e-6, prompt: t('Calcule P(B) (formule des probabilités totales).', 'Work out P(B) (law of total probability).', 'احسب P(B) (صيغة الاحتمالات الكلية).', 'Calcula P(B) (probabilidad total).'), hint: t('P(B) = P(A ∩ B) + P(Ā ∩ B).', 'P(B) = P(A ∩ B) + P(Ā ∩ B).', 'P(B) = P(A ∩ B) + P(Ā ∩ B).', 'P(B) = P(A ∩ B) + P(Ā ∩ B).') },
      { type: 'number', table, answer: ab / b, tolerance: 0.006, prompt: t('Calcule P_B(A), arrondie au centième.', 'Work out P_B(A) to 2 d.p.', 'احسب P_B(A) مقربة إلى الجزء من مائة.', 'Calcula P_B(A) a las centésimas.'), hint: t('P_B(A) = P(A ∩ B) ÷ P(B).', 'P_B(A) = P(A ∩ B) ÷ P(B).', 'P_B(A) = P(A ∩ B) ÷ P(B).', 'P_B(A) = P(A ∩ B) ÷ P(B).') },
    ],
  };
}

const binom = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };

function probaBinomial(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [5, 8, 10]), p = pick(rng, [0.2, 0.3, 0.5]), k = int(rng, 1, 3);
  const pk = binom(n, k) * p ** k * (1 - p) ** (n - k);
  return {
    title: t('Loi binomiale', 'Binomial distribution', 'القانون الحداني', 'Distribución binomial'),
    summary: `X ~ B(${n} ; ${fmt(p)}) · P(X = ${k}) ≈ ${fmt(r3(pk))} · E(X) = ${fmt(n * p)}`,
    steps: [
      { type: 'choice', answer: 0, options: [t('des épreuves identiques et indépendantes à deux issues', 'identical independent trials with two outcomes', 'تجارب متطابقة ومستقلة ذات مخرجين', 'pruebas idénticas e independientes con dos resultados'), t('des tirages sans remise', 'draws without replacement', 'سحب بدون إحلال', 'extracciones sin reposición'), t('une seule épreuve', 'a single trial', 'تجربة واحدة', 'una sola prueba')], prompt: t('Une loi binomiale compte les succès dans…', 'A binomial distribution counts successes in…', 'القانون الحداني يعد النجاحات في…', 'La binomial cuenta los éxitos en…'), hint: t('Schéma de Bernoulli : même probabilité de succès à chaque fois, indépendance.', 'Bernoulli scheme: same success probability, independence.', 'خطاطة برنولي: نفس احتمال النجاح والاستقلالية.', 'Esquema de Bernoulli: misma probabilidad, independencia.') },
      { type: 'number', answer: binom(n, k), tolerance: 0, prompt: t(`On lance ${n} fois une épreuve de succès p = ${fmt(p)}. Combien vaut (${n} parmi ${k}) ?`, `${n} trials with success p = ${fmt(p)}. What is (${n} choose ${k})?`, `${n} تجارب احتمال نجاحها ${fmt(p)}. كم يساوي C(${n} ; ${k})؟`, `${n} pruebas con p = ${fmt(p)}. ¿Cuánto vale C(${n} ; ${k})?`), hint: t(`Nombre de chemins avec ${k} succès : ${n}! ÷ (${k}! × ${n - k}!).`, `${n}! ÷ (${k}! × ${n - k}!)`, `${n}! ÷ (${k}! × ${n - k}!)`, `${n}! ÷ (${k}! × ${n - k}!)`) },
      { type: 'number', answer: pk, tolerance: 0.0006, prompt: t(`X ~ B(${n} ; ${fmt(p)}). Calcule P(X = ${k}), au millième.`, `X ~ B(${n} ; ${fmt(p)}). Work out P(X = ${k}) to 3 d.p.`, `X ~ B(${n} ; ${fmt(p)}). احسب P(X = ${k}) إلى الجزء من ألف.`, `X ~ B(${n} ; ${fmt(p)}). Calcula P(X = ${k}) a las milésimas.`), hint: t(`(${n} parmi ${k}) × ${fmt(p)}${superscript(k)} × ${fmt(1 - p)}${superscript(n - k)}`, `C(${n},${k}) × ${fmt(p)}^${k} × ${fmt(1 - p)}^${n - k}`, `C(${n},${k}) × ${fmt(p)}^${k} × ${fmt(1 - p)}^${n - k}`, `C(${n},${k}) × ${fmt(p)}^${k} × ${fmt(1 - p)}^${n - k}`) },
      { type: 'number', answer: n * p, tolerance: 1e-6, prompt: t(`X ~ B(${n} ; ${fmt(p)}). Quelle est l’espérance E(X) ?`, `X ~ B(${n} ; ${fmt(p)}). What is E(X)?`, `X ~ B(${n} ; ${fmt(p)}). ما الأمل الرياضي E(X)؟`, `X ~ B(${n} ; ${fmt(p)}). ¿Cuál es E(X)?`), hint: t('E(X) = n p.', 'E(X) = n p.', 'E(X) = n p.', 'E(X) = n p.') },
    ],
  };
}

function probaExpectation(seed: number): Activity {
  const rng = seeded(seed);
  const values = pick(rng, [[-2, 0, 3, 5], [0, 1, 2, 4], [-5, 2, 10, 20]]);
  const probs = pick(rng, [[0.1, 0.4, 0.3, 0.2], [0.25, 0.25, 0.3, 0.2], [0.5, 0.2, 0.2, 0.1]]);
  const hide = int(rng, 0, 3);
  const e = values.reduce((s, v, i) => s + v * probs[i]!, 0);
  const shown = probs.map((p, i) => (i === hide ? '?' : fmt(p)));
  const minus = (v: number) => fmt(v).replace('-', '−');
  const table: Table = { head: [same('xᵢ'), same('P(X = xᵢ)')], rows: [values.map(minus), shown] };
  const full: Table = { head: table.head, rows: [values.map(minus), probs.map(fmt)] };
  return {
    title: t('Loi de probabilité et espérance', 'Distribution and expectation', 'قانون الاحتمال والأمل الرياضي', 'Ley de probabilidad y esperanza'),
    summary: `Σ pᵢ = 1 · E(X) = Σ xᵢ pᵢ = ${fmt(r2(e))}`,
    steps: [
      { type: 'number', table, answer: probs[hide]!, tolerance: 1e-6, prompt: t('Complète la probabilité manquante.', 'Fill in the missing probability.', 'أكمل الاحتمال الناقص.', 'Completa la probabilidad que falta.'), hint: t('La somme des probabilités vaut 1.', 'The probabilities add up to 1.', 'مجموع الاحتمالات يساوي 1.', 'Las probabilidades suman 1.') },
      { type: 'number', table: full, answer: e, tolerance: 0.006, prompt: t('Calcule l’espérance E(X).', 'Work out E(X).', 'احسب الأمل الرياضي E(X).', 'Calcula la esperanza E(X).'), hint: t(`E(X) = ${values.map((v, i) => `${v < 0 ? `(${minus(v)})` : v} × ${fmt(probs[i]!)}`).join(' + ')}`, `E(X) = Σ xᵢ pᵢ`, `E(X) = Σ xᵢ pᵢ`, `E(X) = Σ xᵢ pᵢ`) },
      { type: 'choice', table: full, answer: e > 0 ? 0 : e < 0 ? 1 : 2, options: [t('favorable au joueur', 'favourable to the player', 'لصالح اللاعب', 'favorable al jugador'), t('défavorable au joueur', 'unfavourable to the player', 'في غير صالح اللاعب', 'desfavorable al jugador'), t('équitable', 'fair', 'عادلة', 'equitativo')], prompt: t('X est le gain d’un joueur (en €). Le jeu est…', 'X is a player’s gain (€). The game is…', 'X ربح اللاعب (€). اللعبة…', 'X es la ganancia (€). El juego es…'), hint: t('Regarde le signe de E(X) : gain moyen par partie.', 'Look at the sign of E(X): average gain per game.', 'انظر إلى إشارة E(X).', 'Mira el signo de E(X).') },
    ],
  };
}

function probaIndependence(seed: number): Activity {
  const rng = seeded(seed);
  const pA = pick(rng, [0.4, 0.5, 0.6]), pB = pick(rng, [0.3, 0.5]);
  const indep = rng() < 0.5;
  const pAB = indep ? pA * pB : r2(pA * pB + 0.1);
  const table: Table = { head: [same('P(A)'), same('P(B)'), same('P(A ∩ B)')], rows: [[fmt(pA)], [fmt(pB)], [fmt(pAB)]] };
  return {
    title: t('Indépendance', 'Independence', 'الاستقلالية', 'Independencia'),
    summary: `A et B indépendants ⇔ P(A ∩ B) = P(A) × P(B)`,
    steps: [
      { type: 'number', table, answer: pA * pB, tolerance: 1e-6, prompt: t('Calcule P(A) × P(B).', 'Work out P(A) × P(B).', 'احسب P(A) × P(B).', 'Calcula P(A) × P(B).'), hint: t(`${fmt(pA)} × ${fmt(pB)}`, `${fmt(pA)} × ${fmt(pB)}`, `${fmt(pA)} × ${fmt(pB)}`, `${fmt(pA)} × ${fmt(pB)}`) },
      {
        type: 'sentence', table, prompt: t('A et B sont-ils indépendants ? Compare P(A ∩ B) et P(A) × P(B), puis conclus.', 'Are A and B independent? Compare P(A ∩ B) with P(A) × P(B), then conclude.', 'هل A و B مستقلان؟ قارن P(A ∩ B) و P(A) × P(B) ثم استنتج.', '¿Son A y B independientes? Compara P(A ∩ B) con P(A) × P(B) y concluye.'),
        parts: [t('P(A ∩ B)', 'P(A ∩ B)', 'P(A ∩ B)', 'P(A ∩ B)'), { options: [same('='), same('≠')], answer: [indep ? 0 : 1] }, t('P(A) × P(B), donc A et B', 'P(A) × P(B), so A and B', 'P(A) × P(B)، إذن A و B', 'P(A) × P(B), luego A y B'), { options: [t('sont indépendants', 'are independent', 'مستقلان', 'son independientes'), t('ne sont pas indépendants', 'are not independent', 'غير مستقلين', 'no son independientes')], answer: [indep ? 0 : 1] }, t('.', '.', '.', '.')],
        hint: t('Compare le produit avec P(A ∩ B) donné dans le tableau.', 'Compare the product with P(A ∩ B) in the table.', 'قارن الجداء مع P(A ∩ B) المعطى.', 'Compara el producto con P(A ∩ B).'),
      },
      { type: 'choice', answer: 0, options: [same('P(A)'), same('P(B)'), same('P(A) × P(B)')], prompt: t('Si A et B sont indépendants (P(B) ≠ 0), P_B(A) = ?', 'If A and B are independent (P(B) ≠ 0), P_B(A) = ?', 'إذا كان A و B مستقلين فإن P_B(A) = ؟', 'Si A y B son independientes, P_B(A) = ?'), hint: t('Savoir que B est réalisé ne change pas la probabilité de A.', 'Knowing B happened does not change the probability of A.', 'تحقق B لا يغير احتمال A.', 'Saber que B ocurrió no cambia la probabilidad de A.') },
    ],
  };
}

type L = ReturnType<typeof t>;
const s = (fr: string, en: string, ar: string, es: string): L => t(fr, en, ar, es);
export const LYCEE_SKILLS: Skill[] = [
  { id: 'seq-nature', review: 3, chapter: 'seq', build: seqNature, title: s('Arithmétique ou géométrique', 'Arithmetic or geometric', 'حسابية أم هندسية', 'Aritmética o geométrica'), desc: s('Reconnaître, trouver la raison, calculer un terme.', 'Recognise, find the ratio, compute a term.', 'التعرف، إيجاد الأساس، حساب حد.', 'Reconocer, hallar la razón, calcular un término.') },
  { id: 'seq-recurrence', review: 2, chapter: 'seq', build: seqRecurrence, title: s('Suite récurrente', 'Recursive sequence', 'متتالية تراجعية', 'Sucesión recurrente'), desc: s('Termes, point fixe, suite auxiliaire.', 'Terms, fixed point, auxiliary sequence.', 'الحدود، النقطة الصامدة، المتتالية المساعدة.', 'Términos, punto fijo, sucesión auxiliar.') },
  { id: 'seq-limits', review: 0, chapter: 'seq', build: seqLimits, title: s('Limites', 'Limits', 'النهايات', 'Límites'), desc: s('qⁿ et recherche de seuil.', 'qⁿ and threshold.', 'qⁿ والبحث عن العتبة.', 'qⁿ y umbral.') },
  { id: 'seq-induction', review: 1, chapter: 'seq', build: seqInduction, title: s('Récurrence', 'Induction', 'الترجع', 'Inducción'), desc: s('Initialisation, hérédité, conclusion.', 'Base case, step, conclusion.', 'التهيئة، الوراثة، الخلاصة.', 'Inicialización, herencia, conclusión.') },
  { id: 'deriv-slope', review: 2, chapter: 'deriv', build: derivSlope, title: s('Nombre dérivé et tangente', 'Derivative and tangent', 'العدد المشتق والمماس', 'Derivada y tangente'), desc: s('Faire glisser la tangente sur la courbe.', 'Slide the tangent along the curve.', 'تحريك المماس على المنحنى.', 'Deslizar la tangente por la curva.') },
  { id: 'deriv-rules', review: -2, chapter: 'deriv', build: derivRules, title: s('Calculer une dérivée', 'Computing derivatives', 'حساب المشتقات', 'Calcular derivadas'), desc: s('Produit, quotient, exponentielle.', 'Product, quotient, exponential.', 'الجداء، الخارج، الأسية.', 'Producto, cociente, exponencial.') },
  { id: 'deriv-variations', review: 2, chapter: 'deriv', build: derivVariations, title: s('Variations et extremums', 'Variations and extrema', 'التغيرات والقيم القصوى', 'Variaciones y extremos'), desc: s('Du signe de f′ au sens de variation.', 'From the sign of f′ to the variations.', 'من إشارة f′ إلى منحى التغير.', 'Del signo de f′ a las variaciones.') },
  { id: 'deriv-tangent', review: 2, chapter: 'deriv', build: derivTangentLine, title: s('Équation de tangente', 'Tangent equation', 'معادلة المماس', 'Ecuación de la tangente'), desc: s('y = f′(a)(x − a) + f(a).', 'y = f′(a)(x − a) + f(a).', 'y = f′(a)(x − a) + f(a).', 'y = f′(a)(x − a) + f(a).') },
  { id: 'proba-tree', review: 2, chapter: 'proba', build: probaTree, title: s('Arbres pondérés', 'Probability trees', 'الشجرة المرجحة', 'Árboles ponderados'), desc: s('Probabilités totales, conditionnelles.', 'Total and conditional probability.', 'الاحتمالات الكلية والشرطية.', 'Probabilidad total y condicionada.') },
  { id: 'proba-binomial', review: 2, chapter: 'proba', build: probaBinomial, title: s('Loi binomiale', 'Binomial distribution', 'القانون الحداني', 'Binomial'), desc: s('Reconnaître, calculer P(X = k), E(X).', 'Recognise, P(X = k), E(X).', 'التعرف، P(X = k)، E(X).', 'Reconocer, P(X = k), E(X).') },
  { id: 'proba-expectation', review: 1, chapter: 'proba', build: probaExpectation, title: s('Espérance', 'Expectation', 'الأمل الرياضي', 'Esperanza'), desc: s('Compléter une loi, jeu équitable ?', 'Complete a law, is the game fair?', 'إكمال قانون، هل اللعبة عادلة؟', 'Completar una ley, ¿juego justo?') },
  { id: 'proba-independence', review: 1, chapter: 'proba', build: probaIndependence, title: s('Indépendance', 'Independence', 'الاستقلالية', 'Independencia'), desc: s('P(A ∩ B) = P(A) × P(B) ?', 'P(A ∩ B) = P(A) × P(B)?', 'P(A ∩ B) = P(A) × P(B)؟', '¿P(A ∩ B) = P(A) × P(B)?') },
];
