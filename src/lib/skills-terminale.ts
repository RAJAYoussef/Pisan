// Parcours de Terminale (FR, CI, SN), 2ème Bac (MA) et Précalcul / AP Calculus (US) : logarithme,
// intégrales, géométrie dans l'espace, dénombrement, nombres complexes, équations différentielles.
// Fonctions pures et déterministes : couvert par src/test/skills.test.tsx.
import { seeded } from './exercises';
import type { L } from './curriculum';
import { pick, t, type Activity, type Rng, type Skill } from './skill-kit';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const shuffle = <T,>(rng: Rng, list: T[]): T[] => list.map(v => ({ v, k: rng() })).sort((a, b) => a.k - b.k).map(x => x.v);
const same = (s: string) => t(s, s, s, s);
const OUI_NON = [t('Oui', 'Yes', 'نعم', 'Sí'), t('Non', 'No', 'لا', 'No')];
const rel = (v: number) => (v < 0 ? `−${String(-v).replace('.', ',')}` : String(v).replace('.', ','));
const signed = (v: number) => (v < 0 ? ` − ${String(-v).replace('.', ',')}` : ` + ${String(v).replace('.', ',')}`);
const r3 = (v: number) => Math.round(v * 1000) / 1000;
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}
/** a x + b y + c z écrit proprement (coefficients nuls omis, 1 implicite). */
export function linear(coefs: number[], vars: string[]): string {
  return coefs.map((c, i) => [c, vars[i]!] as const).filter(([c]) => c !== 0).map(([c, v], i) => {
    const abs = Math.abs(c), body = `${abs === 1 && v ? '' : rel(abs)}${v}`;
    return i === 0 ? `${c < 0 ? '−' : ''}${body}` : ` ${c < 0 ? '−' : '+'} ${body}`;
  }).join('') || '0';
}
/** Les trois premières propositions deux à deux distinctes (la bonne en tête). */
function distinct(list: L[]): L[] { const out: L[] = []; for (const l of list) if (!out.some(o => o.fr === l.fr)) out.push(l); return out.slice(0, 3); }
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const comb = (n: number, k: number) => fact(n) / (fact(k) * fact(n - k));

// ═════════════ LOGARITHME ═════════════

function lnRules(seed: number): Activity {
  const rng = seeded(seed);
  const [a, b] = pick(rng, [[2, 3], [2, 5], [3, 5], [2, 7]] as [number, number][]), k = int(rng, 2, 4);
  const la = r3(Math.log(a)), lb = r3(Math.log(b));
  return {
    title: t('Propriétés du logarithme', 'Logarithm rules', 'خاصيات اللوغاريتم', 'Propiedades del logaritmo'),
    summary: `ln(${a} × ${b}) = ln ${a} + ln ${b} · ln(${a}${'⁰¹²³⁴'[k]}) = ${k} ln ${a} · ln(1/${a}) = −ln ${a}`,
    steps: [
      { type: 'number', answer: r3(la + lb), tolerance: 0.002, prompt: t(`ln ${a} ≈ ${rel(la)} et ln ${b} ≈ ${rel(lb)}. Donne ln ${a * b}.`, `ln ${a} ≈ ${la} and ln ${b} ≈ ${lb}. Give ln ${a * b}.`, `أعط ln ${a * b}.`, `Da ln ${a * b}.`), hint: t(`${a * b} = ${a} × ${b}, et ln(ab) = ln a + ln b.`, `${a * b} = ${a} × ${b}, and ln(ab) = ln a + ln b.`, `ln(ab) = ln a + ln b.`, `ln(ab) = ln a + ln b.`) },
      { type: 'number', answer: r3(k * la), tolerance: 0.002, prompt: t(`Et ln ${a ** k} ?`, `And ln ${a ** k}?`, `و ln ${a ** k}؟`, `¿Y ln ${a ** k}?`), hint: t(`${a ** k} = ${a}${'⁰¹²³⁴'[k]}, et ln(aⁿ) = n ln a.`, `${a ** k} = ${a}${'⁰¹²³⁴'[k]}, and ln(aⁿ) = n ln a.`, `ln(aⁿ) = n ln a.`, `ln(aⁿ) = n ln a.`) },
      { type: 'number', answer: -la, tolerance: 0.002, prompt: t(`Et ln(1/${a}) ?`, `And ln(1/${a})?`, `و ln(1/${a})؟`, `¿Y ln(1/${a})?`), hint: t('ln(1/a) = −ln a (et ln 1 = 0).', 'ln(1/a) = −ln a (and ln 1 = 0).', 'ln(1/a) = −ln a.', 'ln(1/a) = −ln a.') },
    ],
  };
}

function lnEquation(seed: number): Activity {
  const rng = seeded(seed);
  const x = int(rng, 2, 7), p = int(rng, 2, 4), q = Math.min(int(rng, 1, 3), (p - 1) * x - 1), c = (p - 1) * x - q;
  const a = pick(rng, [2, 3, 5, 7, 10]);
  const sol = choices(rng, [same(`x = ln ${a}`), same(`x = e${'⁰¹²³⁴⁵⁶⁷⁸⁹'[a] ?? `^${a}`}`), same(`x = ${a}/e`)]);
  const lt = choices(rng, [same(']0 ; 1['), same(']−∞ ; 1['), same(']1 ; +∞[')]);
  return {
    title: t('Équations avec ln', 'Equations with ln', 'معادلات لوغاريتمية', 'Ecuaciones con ln'),
    summary: `ln(${p}x − ${q}) = ln(x + ${c}) ⇔ x = ${x} · eˣ = ${a} ⇔ x = ln ${a} · ln x < 0 ⇔ 0 < x < 1`,
    steps: [
      { type: 'number', answer: x, tolerance: 0, prompt: t(`Résous ln(${p}x − ${q}) = ln(x + ${c}).`, `Solve ln(${p}x − ${q}) = ln(x + ${c}).`, `حل ln(${p}x − ${q}) = ln(x + ${c}).`, `Resuelve ln(${p}x − ${q}) = ln(x + ${c}).`), hint: t('ln a = ln b ⇔ a = b (avec a, b > 0) : on égale ce qu’il y a dans les ln.', 'ln a = ln b ⇔ a = b (with a, b > 0).', 'ln a = ln b ⇔ a = b.', 'ln a = ln b ⇔ a = b.') },
      { type: 'choice', ...sol, prompt: t(`Résous eˣ = ${a}.`, `Solve eˣ = ${a}.`, `حل eˣ = ${a}.`, `Resuelve eˣ = ${a}.`), hint: t('ln est la fonction réciproque de exp : eˣ = a ⇔ x = ln a.', 'ln is the inverse of exp: eˣ = a ⇔ x = ln a.', 'eˣ = a ⇔ x = ln a.', 'eˣ = a ⇔ x = ln a.') },
      { type: 'choice', ...lt, prompt: t('Pour quels x a-t-on ln x < 0 ?', 'For which x is ln x < 0?', 'متى ln x < 0؟', '¿Para qué x es ln x < 0?'), hint: t('ln 1 = 0, ln est croissante et définie seulement pour x > 0.', 'ln 1 = 0, ln is increasing and only defined for x > 0.', 'ln 1 = 0 و ln تزايدية.', 'ln 1 = 0, ln es creciente.') },
    ],
  };
}

function lnDerivative(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [2, 3, 4, -2, 6]), b = int(rng, -3, 3) || 1, x0 = pick(rng, [1, 2]);
  const u = pick(rng, [['x² + 1', '2x / (x² + 1)', '1 / (x² + 1)'], ['3x + 2', '3 / (3x + 2)', '1 / (3x + 2)'], ['x² + x', '(2x + 1) / (x² + x)', '1 / (2x + 1)']] as [string, string, string][]);
  const der = choices(rng, [same(u[1]), same(u[2]), same(`ln(${u[1]})`)]);
  return {
    title: t('Dériver ln', 'Differentiating ln', 'اشتقاق ln', 'Derivar ln'),
    summary: `(ln x)′ = 1/x · (ln u)′ = u′/u · f(x) = ${a} ln x${signed(b)}x → f′(${x0}) = ${rel(a / x0 + b)}`,
    steps: [
      { type: 'number', answer: a / x0 + b, tolerance: 1e-9, prompt: t(`f(x) = ${rel(a)} ln x${signed(b)}x. Calcule f′(${x0}).`, `f(x) = ${rel(a)} ln x${signed(b)}x. Work out f′(${x0}).`, `احسب f′(${x0}).`, `Calcula f′(${x0}).`), hint: t(`f′(x) = ${rel(a)}/x${signed(b)}.`, `f′(x) = ${rel(a)}/x${signed(b)}.`, `f′(x) = ${rel(a)}/x${signed(b)}.`, `f′(x) = ${rel(a)}/x${signed(b)}.`) },
      { type: 'choice', ...der, prompt: t(`La dérivée de ln(${u[0]}) est…`, `The derivative of ln(${u[0]}) is…`, `مشتقة ln(${u[0]})…`, `La derivada de ln(${u[0]}) es…`), hint: t('(ln u)′ = u′ / u.', '(ln u)′ = u′ / u.', '(ln u)′ = u′ / u.', '(ln u)′ = u′ / u.') },
    ],
  };
}

function lnThreshold(seed: number): Activity {
  const rng = seeded(seed);
  const [q, target] = pick(rng, [[2, 1000], [3, 500], [1.05, 2], [1.1, 3], [1.02, 1.5], [2, 10000]] as [number, number][]);
  const n = Math.ceil(Math.log(target) / Math.log(q) - 1e-12);
  return {
    title: t('Seuil avec le logarithme', 'Thresholds with logarithms', 'العتبة باللوغاريتم', 'Umbral con logaritmo'),
    summary: `${rel(q)}ⁿ ≥ ${rel(target)} ⇔ n ≥ ln ${rel(target)} / ln ${rel(q)} ≈ ${rel(r3(Math.log(target) / Math.log(q)))} → n = ${n}`,
    steps: [
      { type: 'choice', options: [same(`n ≥ ln ${rel(target)} / ln ${rel(q)}`), same(`n ≥ ln ${rel(target)} − ln ${rel(q)}`), same(`n ≥ ${rel(target)} / ${rel(q)}`)], answer: 0, prompt: t(`On résout ${rel(q)}ⁿ ≥ ${rel(target)}. En appliquant ln :`, `Solve ${rel(q)}ⁿ ≥ ${rel(target)}. Applying ln:`, `نطبق ln:`, `Aplicando ln:`), hint: t(`ln(qⁿ) = n ln q, et ln ${rel(q)} > 0 : on divise sans changer le sens.`, `ln(qⁿ) = n ln q, and ln ${q} > 0: divide without flipping.`, `ln(qⁿ) = n ln q.`, `ln(qⁿ) = n ln q.`) },
      { type: 'number', answer: n, tolerance: 0, prompt: t('Quel est le plus petit entier n qui convient ?', 'What is the smallest whole number n that works?', 'ما أصغر عدد صحيح n؟', '¿Cuál es el menor entero n?'), hint: t(`ln ${rel(target)} / ln ${rel(q)} ≈ ${rel(r3(Math.log(target) / Math.log(q)))} : on prend l’entier juste au-dessus.`, `≈ ${r3(Math.log(target) / Math.log(q))}: take the next whole number up.`, `نأخذ العدد الصحيح الموالي.`, `Toma el entero siguiente.`) },
    ],
  };
}

// ═════════════ INTÉGRALES ═════════════

function intPrimitive(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [3, 6, 9, 12]), b = pick(rng, [2, 4, 6, -4]), k = pick(rng, [2, 3, -1, 5]);
  const kk = k === -1 ? '−' : String(k);
  const prim = choices(rng, distinct([same(k === -1 ? '−e^(−x)' : `(1/${k}) e^(${kk}x)`), same(`${kk}e^(${kk}x)`), same(`e^(${kk}x)`), same(`x e^(${kk}x)`)]));
  return {
    title: t('Primitives', 'Antiderivatives', 'الدوال الأصلية', 'Primitivas'),
    summary: `F(x) = ${a / 3}x³ + ${b / 2}x² est une primitive de ${a}x² + ${b}x · primitive de e^(kx) : (1/k) e^(kx)`,
    steps: [
      { type: 'number', answer: a / 3, tolerance: 0, prompt: t(`Une primitive de f(x) = ${a}x²${signed(b)}x est F(x) = p x³ + q x². Que vaut p ?`, `An antiderivative of f(x) = ${a}x²${signed(b)}x is F(x) = p x³ + q x². What is p?`, `ما قيمة p؟`, `¿Cuánto vale p?`), hint: t(`Une primitive de xⁿ est xⁿ⁺¹ / (n + 1) : ${a}x² → ${a}x³ / 3.`, `An antiderivative of xⁿ is xⁿ⁺¹ / (n + 1).`, `xⁿ⁺¹ / (n + 1).`, `xⁿ⁺¹ / (n + 1).`) },
      { type: 'number', answer: b / 2, tolerance: 0, prompt: t('Et q ?', 'And q?', 'و q؟', '¿Y q?'), hint: t(`${rel(b)}x → ${rel(b)}x² / 2. Vérifie : F′ = f.`, `${b}x → ${b}x² / 2. Check: F′ = f.`, `تحقق: F′ = f.`, `Comprueba: F′ = f.`) },
      { type: 'choice', ...prim, prompt: t(`Une primitive de x ↦ e^(${kk}x) est…`, `An antiderivative of x ↦ e^(${kk}x) is…`, `دالة أصلية لـ e^(${kk}x)…`, `Una primitiva de e^(${kk}x) es…`), hint: t('On dérive la proposition : il faut retrouver e^(kx), donc diviser par k.', 'Differentiate the candidate: you must get back e^(kx), so divide by k.', 'نقسم على k.', 'Se divide por k.') },
    ],
  };
}

function intCompute(seed: number): Activity {
  const rng = seeded(seed);
  const c = pick(rng, [2, 4, 6, -2]), d = int(rng, -3, 4), a = int(rng, 0, 2), b = a + int(rng, 1, 3);
  const F = (x: number) => (c / 2) * x * x + d * x;
  return {
    title: t('Calculer une intégrale', 'Computing an integral', 'حساب تكامل', 'Calcular una integral'),
    summary: `∫ de ${a} à ${b} de (${c}x${signed(d)}) dx = F(${b}) − F(${a}) = ${rel(F(b) - F(a))}, avec F(x) = ${rel(c / 2)}x²${signed(d)}x`,
    steps: [
      { type: 'number', answer: F(b), tolerance: 0, prompt: t(`On calcule ∫ de ${a} à ${b} de (${rel(c)}x${signed(d)}) dx avec la primitive F(x) = ${rel(c / 2)}x²${signed(d)}x. Que vaut F(${b}) ?`, `Compute ∫ from ${a} to ${b} of (${c}x${signed(d)}) dx with F(x) = ${c / 2}x²${signed(d)}x. What is F(${b})?`, `ما قيمة F(${b})؟`, `¿Cuánto vale F(${b})?`), hint: t(`Remplace x par ${b}.`, `Substitute x = ${b}.`, `عوّض x بـ ${b}.`, `Sustituye x por ${b}.`) },
      { type: 'number', answer: F(b) - F(a), tolerance: 0, prompt: t('Donc l’intégrale vaut… ?', 'So the integral equals…?', 'إذن التكامل يساوي…؟', 'Entonces la integral vale…?'), hint: t(`F(${b}) − F(${a}), avec F(${a}) = ${rel(F(a))}.`, `F(${b}) − F(${a}), with F(${a}) = ${F(a)}.`, `F(${b}) − F(${a}).`, `F(${b}) − F(${a}).`) },
    ],
  };
}

function intArea(seed: number): Activity {
  const rng = seeded(seed);
  const b = pick(rng, [2, 4, 6]), If = int(rng, 2, 6), Ig = int(rng, -4, 3), k = pick(rng, [2, 3]);
  return {
    title: t('Intégrale et aire', 'Integral and area', 'التكامل والمساحة', 'Integral y área'),
    summary: `∫ de 0 à ${b} de x dx = aire du triangle = ${b * b / 2} · linéarité : ∫(${k}f − g) = ${k} × ${If} − (${rel(Ig)}) = ${k * If - Ig}`,
    steps: [
      { type: 'number', answer: (b * b) / 2, tolerance: 0, prompt: t(`Sans primitive : ∫ de 0 à ${b} de x dx est l’aire d’une figure simple sous la droite y = x. Combien vaut-elle ?`, `Without an antiderivative: ∫ from 0 to ${b} of x dx is the area of a simple shape under y = x. What is it?`, `ما قيمة المساحة؟`, `¿Cuánto vale el área?`), hint: t(`Un triangle rectangle de base ${b} et de hauteur ${b}.`, `A right triangle with base ${b} and height ${b}.`, `مثلث قائم قاعدته ${b}.`, `Un triángulo de base ${b}.`) },
      { type: 'number', answer: k * If - Ig, tolerance: 0, prompt: t(`∫ f = ${If} et ∫ g = ${rel(Ig)} sur le même intervalle. Calcule ∫ (${k}f − g).`, `∫ f = ${If} and ∫ g = ${Ig} on the same interval. Work out ∫ (${k}f − g).`, `احسب ∫ (${k}f − g).`, `Calcula ∫ (${k}f − g).`), hint: t('L’intégrale est linéaire : ∫(af + bg) = a∫f + b∫g.', 'The integral is linear: ∫(af + bg) = a∫f + b∫g.', 'التكامل خطي.', 'La integral es lineal.') },
      { type: 'choice', options: [same('0'), same('2'), same('−2')], answer: 0, prompt: t('∫ de −1 à 1 de x³ dx = ?', '∫ from −1 to 1 of x³ dx = ?', '∫ من −1 إلى 1 لـ x³ = ؟', '∫ de −1 a 1 de x³ = ?'), hint: t('x³ est impaire : les aires au-dessus et en dessous de l’axe se compensent.', 'x³ is odd: the areas above and below the axis cancel out.', 'x³ فردية: المساحتان تتعادلان.', 'x³ es impar: las áreas se compensan.') },
    ],
  };
}

function intMean(seed: number): Activity {
  const rng = seeded(seed);
  const c = pick(rng, [2, 4, 6]), b = pick(rng, [2, 4, 6]);
  const I = (c * b * b) / 2;
  return {
    title: t('Valeur moyenne', 'Mean value', 'القيمة المتوسطة', 'Valor medio'),
    summary: `μ = (1/${b}) ∫ de 0 à ${b} de ${c}x dx = ${I} ÷ ${b} = ${I / b}`,
    steps: [
      { type: 'number', answer: I, tolerance: 0, prompt: t(`Calcule ∫ de 0 à ${b} de ${c}x dx.`, `Work out ∫ from 0 to ${b} of ${c}x dx.`, `احسب التكامل.`, `Calcula la integral.`), hint: t(`Primitive : ${c / 2}x².`, `Antiderivative: ${c / 2}x².`, `${c / 2}x².`, `${c / 2}x².`) },
      { type: 'number', answer: I / b, tolerance: 0, prompt: t(`Quelle est la valeur moyenne de x ↦ ${c}x sur [0 ; ${b}] ?`, `What is the mean value of x ↦ ${c}x on [0, ${b}]?`, `ما القيمة المتوسطة؟`, `¿Valor medio?`), hint: t('μ = (1 / (b − a)) × ∫ de a à b de f.', 'μ = (1 / (b − a)) × ∫ from a to b of f.', 'μ = ∫ ÷ (b − a).', 'μ = ∫ ÷ (b − a).') },
    ],
  };
}

// ═════════════ GÉOMÉTRIE DANS L'ESPACE ═════════════

const pt = (p: number[]) => `(${p.map(rel).join(' ; ')})`;

function spCoords(seed: number): Activity {
  const rng = seeded(seed);
  const A = [int(rng, -3, 3), int(rng, -3, 3), int(rng, -3, 3)], B = [int(rng, -3, 4), int(rng, -3, 4), int(rng, -3, 4)];
  const AB = B.map((v, i) => v - A[i]!);
  if (AB.every(v => v === 0)) B[0]! += 1;
  const M = A.map((v, i) => (v + B[i]!) / 2);
  return {
    title: t('Coordonnées dans l’espace', 'Coordinates in space', 'الإحداثيات في الفضاء', 'Coordenadas en el espacio'),
    summary: `A${pt(A)}, B${pt(B)} : AB${pt(B.map((v, i) => v - A[i]!))}, milieu ${pt(M)}`,
    steps: [
      ...(['x', 'y', 'z'] as const).map((c, i) => ({ type: 'number' as const, answer: B[i]! - A[i]!, tolerance: 0, prompt: t(`A${pt(A)} et B${pt(B)}. Quelle est la coordonnée ${c} du vecteur AB ?`, `A${pt(A)} and B${pt(B)}. What is the ${c}-coordinate of vector AB?`, `ما الإحداثية ${c} للمتجهة AB؟`, `¿Coordenada ${c} de AB?`), hint: t(`${c}_B − ${c}_A.`, `${c}_B − ${c}_A.`, `${c}_B − ${c}_A.`, `${c}_B − ${c}_A.`) })),
      { type: 'number', answer: M[2]!, tolerance: 1e-9, prompt: t('Quelle est la cote z du milieu de [AB] ?', 'What is the z-coordinate of the midpoint of [AB]?', 'ما الإحداثية z لمنتصف [AB]؟', '¿Coordenada z del punto medio?'), hint: t('(z_A + z_B) ÷ 2.', '(z_A + z_B) ÷ 2.', '(z_A + z_B) ÷ 2.', '(z_A + z_B) ÷ 2.') },
    ],
  };
}

function spDot(seed: number): Activity {
  const rng = seeded(seed);
  const u = [int(rng, -3, 3) || 1, int(rng, -3, 3), int(rng, -3, 3) || 2];
  const orth = rng() < 0.5;
  const v = orth ? [u[1]!, -u[0]!, 0] : [int(rng, -3, 3), int(rng, -3, 3) || 1, int(rng, -3, 3)];
  const dot = u.reduce((a, x, i) => a + x * v[i]!, 0);
  return {
    title: t('Produit scalaire dans l’espace', 'Dot product in space', 'الجداء السلمي في الفضاء', 'Producto escalar en el espacio'),
    summary: `u${pt(u)} · v${pt(v)} = ${rel(dot)}`,
    steps: [
      { type: 'number', answer: dot, tolerance: 0, prompt: t(`u${pt(u)}, v${pt(v)}. Calcule u · v.`, `u${pt(u)}, v${pt(v)}. Work out u · v.`, `احسب u · v.`, `Calcula u · v.`), hint: t('u · v = xx′ + yy′ + zz′.', 'u · v = xx′ + yy′ + zz′.', 'xx′ + yy′ + zz′.', 'xx′ + yy′ + zz′.') },
      { type: 'choice', options: OUI_NON, answer: dot === 0 ? 0 : 1, prompt: t('u et v sont-ils orthogonaux ?', 'Are u and v orthogonal?', 'هل هما متعامدتان؟', '¿Son ortogonales?'), hint: t('Orthogonaux ⇔ u · v = 0.', 'Orthogonal ⇔ u · v = 0.', 'u · v = 0.', 'u · v = 0.') },
      { type: 'number', answer: u.reduce((a, x) => a + x * x, 0), tolerance: 0, prompt: t('Calcule ‖u‖².', 'Work out ‖u‖².', 'احسب ‖u‖².', 'Calcula ‖u‖².'), hint: t('‖u‖² = u · u = x² + y² + z².', '‖u‖² = u · u = x² + y² + z².', 'x² + y² + z².', 'x² + y² + z².') },
    ],
  };
}

function spPlane(seed: number): Activity {
  const rng = seeded(seed);
  const n = [int(rng, 1, 3), int(rng, -2, 2), int(rng, -2, 3) || 1], A = [int(rng, -2, 2), int(rng, -2, 2), int(rng, -2, 2)];
  const d = -n.reduce((s, v, i) => s + v * A[i]!, 0);
  const on = rng() < 0.5, B = [A[0]! + n[1]!, A[1]! - n[0]!, A[2]! + (on ? 0 : 1)];
  const eq = linear(n, ['x', 'y', 'z']);
  return {
    title: t('Équation d’un plan', 'Equation of a plane', 'معادلة مستوى', 'Ecuación de un plano'),
    summary: `n${pt(n)} normal, A${pt(A)} : ${linear([...n, d], ['x', 'y', 'z', ''])} = 0`,
    steps: [
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Le plan P passe par A${pt(A)} et a pour vecteur normal n${pt(n)}. Son équation est ${eq} + d = 0. Que vaut d ?`, `Plane P goes through A${pt(A)} with normal n${pt(n)}. Its equation is ${eq} + d = 0. What is d?`, `ما قيمة d؟`, `¿Cuánto vale d?`), hint: t('Un vecteur normal n(a ; b ; c) donne ax + by + cz + d = 0 ; A est dans le plan, on remplace ses coordonnées.', 'A normal n(a, b, c) gives ax + by + cz + d = 0; A lies in the plane, substitute its coordinates.', 'نعوض بإحداثيات A.', 'Sustituye A.') },
      { type: 'choice', options: OUI_NON, answer: on ? 0 : 1, prompt: t(`Le point B${pt(B)} appartient-il à P ?`, `Does B${pt(B)} lie in P?`, `هل B ينتمي إلى P؟`, `¿B pertenece a P?`), hint: t('Remplace ses coordonnées dans l’équation : obtient-on 0 ?', 'Substitute its coordinates: do you get 0?', 'هل نحصل على 0؟', '¿Da 0?') },
    ],
  };
}

function spLine(seed: number): Activity {
  const rng = seeded(seed);
  const A = [int(rng, -2, 3), int(rng, -2, 3), int(rng, -2, 3)], u = [int(rng, 1, 3), int(rng, -2, 2), int(rng, -2, 2) || 1], tt = pick(rng, [2, -1, 3]);
  const P = A.map((v, i) => v + tt * u[i]!);
  const par = ['x', 'y', 'z'].map((c, i) => `${c} = ${rel(A[i]!)}${signed(u[i]!)}t`).join(' ; ');
  const dir = choices(rng, distinct([same(`(${u.map(rel).join(' ; ')})`), same(`(${A.map(rel).join(' ; ')})`), same(`(${P.map(rel).join(' ; ')})`), same(`(${u.map(v => rel(v + 1)).join(' ; ')})`), same(`(${u.map(v => rel(v + 2)).join(' ; ')})`)]));
  return {
    title: t('Représentation paramétrique', 'Parametric equations of a line', 'تمثيل بارامتري', 'Ecuaciones paramétricas'),
    summary: `{ ${par} } : vecteur directeur (${u.map(rel).join(' ; ')}), point pour t = ${tt} : ${pt(P)}`,
    steps: [
      { type: 'choice', ...dir, prompt: t(`La droite d : { ${par} }. Un vecteur directeur de d est…`, `Line d: { ${par} }. A direction vector of d is…`, `متجهة موجهة لـ d…`, `Un vector director de d es…`), hint: t('Les coefficients de t.', 'The coefficients of t.', 'معاملات t.', 'Los coeficientes de t.') },
      { type: 'number', answer: P[0]!, tolerance: 0, prompt: t(`Pour t = ${tt}, quelle est l’abscisse x du point obtenu ?`, `For t = ${tt}, what is the x-coordinate of the point?`, `من أجل t = ${tt}، ما x؟`, `Para t = ${tt}, ¿x?`), hint: t(`${rel(A[0]!)} + ${rel(u[0]!)} × (${rel(tt)}).`, `${A[0]} + ${u[0]} × (${tt}).`, `${rel(A[0]!)} + ${rel(u[0]!)} × (${rel(tt)}).`, `${rel(A[0]!)} + ${rel(u[0]!)} × (${rel(tt)}).`) },
      { type: 'number', answer: P[2]!, tolerance: 0, prompt: t('Et sa cote z ?', 'And its z-coordinate?', 'و z؟', '¿Y z?'), hint: t(`${rel(A[2]!)} + ${rel(u[2]!)} × (${rel(tt)}).`, `${A[2]} + ${u[2]} × (${tt}).`, `${rel(A[2]!)} + ${rel(u[2]!)} × (${rel(tt)}).`, `${rel(A[2]!)} + ${rel(u[2]!)} × (${rel(tt)}).`) },
    ],
  };
}

// ═════════════ DÉNOMBREMENT ═════════════

function cntPermutations(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 3, 7), m = int(rng, 4, 6);
  return {
    title: t('Permutations', 'Permutations', 'التبديلات', 'Permutaciones'),
    summary: `${n}! = ${fact(n)} façons de ranger ${n} objets`,
    steps: [
      { type: 'number', answer: fact(n), tolerance: 0, prompt: t(`De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`, `In how many ways can ${n} different books be arranged on a shelf?`, `بكم طريقة نرتب ${n} كتب؟`, `¿De cuántas formas se ordenan ${n} libros?`), hint: t(`${n} choix pour la 1re place, ${n - 1} pour la 2e… : ${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')}.`, `${n} choices for 1st, ${n - 1} for 2nd…: ${n}!.`, `${n}!`, `${n}!`) },
      { type: 'number', answer: fact(m), tolerance: 0, prompt: t(`Combien d’anagrammes (avec ou sans sens) a un mot de ${m} lettres toutes différentes ?`, `How many anagrams does a word of ${m} different letters have?`, `كم ترتيبًا لكلمة من ${m} أحرف مختلفة؟`, `¿Cuántos anagramas tiene una palabra de ${m} letras distintas?`), hint: t(`C’est une permutation des ${m} lettres : ${m}!.`, `A permutation of the ${m} letters: ${m}!.`, `${m}!`, `${m}!`) },
    ],
  };
}

function cntArrangements(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 5, 12), k = pick(rng, [2, 3]);
  const A = Array.from({ length: k }, (_, i) => n - i).reduce((a, b) => a * b, 1);
  return {
    title: t('Arrangements', 'Ordered selections', 'الترتيبات', 'Variaciones'),
    summary: `${k} places ordonnées parmi ${n} : ${Array.from({ length: k }, (_, i) => n - i).join(' × ')} = ${A}`,
    steps: [
      { type: 'number', answer: A, tolerance: 0, prompt: t(`${n} coureurs. Combien de ${k === 3 ? 'podiums (1er, 2e, 3e)' : 'couples (1er, 2e)'} différents ?`, `${n} runners. How many different ${k === 3 ? 'podiums (1st, 2nd, 3rd)' : '(1st, 2nd) pairs'}?`, `${n} عدّائين. كم ترتيبًا؟`, `${n} corredores. ¿Cuántos podios?`), hint: t(`L’ordre compte et pas de répétition : ${n} choix, puis ${n - 1}${k === 3 ? `, puis ${n - 2}` : ''}.`, `Order matters, no repetition: ${n}, then ${n - 1}${k === 3 ? `, then ${n - 2}` : ''}.`, `الترتيب مهم.`, `El orden importa.`) },
      { type: 'choice', options: OUI_NON, answer: 0, prompt: t('L’ordre des coureurs compte-t-il ici ?', 'Does the order of the runners matter here?', 'هل الترتيب مهم هنا؟', '¿Importa el orden?'), hint: t('Être 1er ou 2e, ce n’est pas pareil.', 'Being 1st or 2nd is not the same.', 'الأول ليس كالثاني.', 'Ser 1º o 2º no es igual.') },
    ],
  };
}

function cntCombinations(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 4, 10), k = pick(rng, [2, 3]), m = int(rng, 5, 8);
  return {
    title: t('Combinaisons', 'Combinations', 'التأليفات', 'Combinaciones'),
    summary: `(${n} parmi 2) = ${comb(n, 2)} poignées de main · (${m} parmi ${k}) = ${comb(m, k)} équipes`,
    steps: [
      { type: 'number', answer: comb(n, 2), tolerance: 0, prompt: t(`${n} personnes se serrent toutes la main une fois. Combien de poignées de main ?`, `${n} people all shake hands once. How many handshakes?`, `كم مصافحة بين ${n} أشخاص؟`, `¿Cuántos apretones de manos entre ${n}?`), hint: t(`On choisit 2 personnes sans ordre : ${n} × ${n - 1} ÷ 2.`, `Choose 2 people, order irrelevant: ${n} × ${n - 1} ÷ 2.`, `${n} × ${n - 1} ÷ 2.`, `${n} × ${n - 1} ÷ 2.`) },
      { type: 'number', answer: comb(m, k), tolerance: 0, prompt: t(`Combien d’équipes de ${k} peut-on former avec ${m} élèves ?`, `How many teams of ${k} can be made from ${m} pupils?`, `كم فريقًا من ${k}؟`, `¿Cuántos equipos de ${k}?`), hint: t(`(${m} parmi ${k}) = ${Array.from({ length: k }, (_, i) => m - i).join(' × ')} ÷ ${k}!.`, `C(${m}, ${k}) = ${Array.from({ length: k }, (_, i) => m - i).join(' × ')} ÷ ${k}!.`, `C(${m}, ${k}).`, `C(${m}, ${k}).`) },
    ],
  };
}

function cntLists(seed: number): Activity {
  const rng = seeded(seed);
  const len = int(rng, 3, 5), n = int(rng, 3, 8);
  return {
    title: t('Listes avec répétition', 'Sequences with repetition', 'القوائم مع التكرار', 'Listas con repetición'),
    summary: `codes de ${len} chiffres : 10${'⁰¹²³⁴⁵'[len]} = ${10 ** len} · parties d’un ensemble à ${n} éléments : 2${'⁰¹²³⁴⁵⁶⁷⁸'[n]} = ${2 ** n}`,
    steps: [
      { type: 'number', answer: 10 ** len, tolerance: 0, prompt: t(`Combien de codes à ${len} chiffres (de 0 à 9, répétitions permises) ?`, `How many ${len}-digit codes (0–9, repeats allowed)?`, `كم رمزًا من ${len} أرقام؟`, `¿Cuántos códigos de ${len} cifras?`), hint: t(`10 choix pour chaque chiffre : 10 × 10 × … (${len} fois).`, `10 choices per digit: 10 multiplied ${len} times.`, `10 أس ${len}.`, `10 elevado a ${len}.`) },
      { type: 'number', answer: 2 ** n, tolerance: 0, prompt: t(`Combien de sous-ensembles a un ensemble de ${n} éléments ?`, `How many subsets does a set of ${n} elements have?`, `كم جزءًا لمجموعة من ${n} عناصر؟`, `¿Cuántos subconjuntos?`), hint: t('Pour chaque élément : dedans ou dehors, 2 choix.', 'For each element: in or out, 2 choices.', 'لكل عنصر اختياران.', 'Dos opciones por elemento.') },
    ],
  };
}

// ═════════════ NOMBRES COMPLEXES ═════════════

const cx = (a: number, b: number) => (a === 0 && b === 0 ? '0' : `${a ? rel(a) : ''}${b ? `${a ? (b < 0 ? ' − ' : ' + ') : b < 0 ? '−' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}i` : ''}`);

function cxAlgebra(seed: number): Activity {
  const rng = seeded(seed);
  const a = int(rng, -4, 5), b = int(rng, -4, 4) || 2, c = int(rng, -3, 4) || 1, d = int(rng, -4, 4) || -1;
  return {
    title: t('Calcul algébrique', 'Complex arithmetic', 'الحساب الجبري', 'Cálculo algebraico'),
    summary: `(${cx(a, b)})(${cx(c, d)}) = ${cx(a * c - b * d, a * d + b * c)} car i² = −1`,
    steps: [
      { type: 'number', answer: a * c - b * d, tolerance: 0, prompt: t(`z = (${cx(a, b)})(${cx(c, d)}). Quelle est la partie réelle de z ?`, `z = (${cx(a, b)})(${cx(c, d)}). What is the real part of z?`, `ما الجزء الحقيقي؟`, `¿Parte real?`), hint: t(`On développe, et i × i = −1 : ${rel(a)} × ${rel(c)} − (${rel(b)}) × (${rel(d)}).`, `Expand, with i × i = −1: ${a} × ${c} − (${b}) × (${d}).`, `i² = −1.`, `i² = −1.`) },
      { type: 'number', answer: a * d + b * c, tolerance: 0, prompt: t('Et sa partie imaginaire ?', 'And its imaginary part?', 'والجزء التخيلي؟', '¿Y la parte imaginaria?'), hint: t(`${rel(a)} × ${rel(d)} + ${rel(b)} × ${rel(c)}.`, `${a} × ${d} + ${b} × ${c}.`, `${rel(a)} × ${rel(d)} + ${rel(b)} × ${rel(c)}.`, `${rel(a)} × ${rel(d)} + ${rel(b)} × ${rel(c)}.`) },
    ],
  };
}

function cxModulus(seed: number): Activity {
  const rng = seeded(seed);
  const [p, q, r] = pick(rng, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5]] as [number, number, number][]);
  const a = rng() < 0.5 ? p : -p, b = rng() < 0.5 ? q : -q;
  const conj = choices(rng, [same(cx(a, -b)), same(cx(-a, b)), same(cx(-a, -b))]);
  return {
    title: t('Module et conjugué', 'Modulus and conjugate', 'المعيار والمرافق', 'Módulo y conjugado'),
    summary: `|${cx(a, b)}| = √(${a * a} + ${b * b}) = ${r} · conjugué ${cx(a, -b)}`,
    steps: [
      { type: 'number', answer: r, tolerance: 0, prompt: t(`Calcule le module de z = ${cx(a, b)}.`, `Work out the modulus of z = ${cx(a, b)}.`, `احسب معيار z = ${cx(a, b)}.`, `Calcula el módulo de z = ${cx(a, b)}.`), hint: t('|a + ib| = √(a² + b²) : la distance de l’origine au point.', '|a + ib| = √(a² + b²): distance from the origin.', '√(a² + b²).', '√(a² + b²).') },
      { type: 'choice', ...conj, prompt: t('Son conjugué z̄ est…', 'Its conjugate z̄ is…', 'مرافقه…', 'Su conjugado…'), hint: t('On change le signe de la partie imaginaire (symétrie par rapport à l’axe réel).', 'Change the sign of the imaginary part (reflection in the real axis).', 'نغير إشارة الجزء التخيلي.', 'Cambia el signo de la parte imaginaria.') },
      { type: 'number', answer: r * r, tolerance: 0, prompt: t('Que vaut z × z̄ ?', 'What is z × z̄?', 'كم يساوي z × z̄؟', '¿Cuánto vale z × z̄?'), hint: t('z z̄ = |z|², un réel positif.', 'z z̄ = |z|², a positive real.', 'z z̄ = |z|².', 'z z̄ = |z|².') },
    ],
  };
}

const IPOW = ['1', 'i', '−1', '−i'].map(same);
function cxPowers(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 5, 40), m = int(rng, 2, 3);
  return {
    title: t('Puissances de i', 'Powers of i', 'قوى i', 'Potencias de i'),
    summary: `i¹ = i, i² = −1, i³ = −i, i⁴ = 1 : on reste sur un cycle de 4 · i^${n} = ${IPOW[n % 4]!.fr}`,
    steps: [
      { type: 'choice', options: IPOW, answer: m % 4, prompt: t(`Que vaut i${m === 2 ? '²' : '³'} ?`, `What is i${m === 2 ? '²' : '³'}?`, `كم يساوي i${m === 2 ? '²' : '³'}؟`, `¿Cuánto vale i${m === 2 ? '²' : '³'}?`), hint: t('i² = −1 par définition ; i³ = i² × i.', 'i² = −1 by definition; i³ = i² × i.', 'i² = −1.', 'i² = −1.') },
      { type: 'choice', options: IPOW, answer: n % 4, prompt: t(`Que vaut i^${n} ?`, `What is i^${n}?`, `كم يساوي i^${n}؟`, `¿Cuánto vale i^${n}?`), hint: t(`i⁴ = 1 : on prend le reste de ${n} ÷ 4 (= ${n % 4}).`, `i⁴ = 1: use the remainder of ${n} ÷ 4 (= ${n % 4}).`, `باقي ${n} ÷ 4.`, `Resto de ${n} ÷ 4.`) },
    ],
  };
}

function cxQuadratic(seed: number): Activity {
  const rng = seeded(seed);
  const p = int(rng, -3, 3), q = int(rng, 1, 4);
  const b = -2 * p, c = p * p + q * q, d = b * b - 4 * c;
  const sol = choices(rng, distinct([same(`${cx(p, -q)} et ${cx(p, q)}`), same(`${cx(-p, -q)} et ${cx(-p, q)}`), same(`${rel(p - q)} et ${rel(p + q)}`), same(`${cx(p, -2 * q)} et ${cx(p, 2 * q)}`)]));
  const poly = linear([1, b, c], ['z²', 'z', '']);
  return {
    title: t('Équation du second degré dans ℂ', 'Quadratics over ℂ', 'معادلة من الدرجة الثانية في ℂ', 'Ecuación de segundo grado en ℂ'),
    summary: `${poly} = 0 : Δ = ${d} < 0 → z = ${cx(p, -q)} ou ${cx(p, q)}`,
    steps: [
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Calcule le discriminant de ${poly} = 0.`, `Work out the discriminant of ${poly} = 0.`, `احسب المميز.`, `Calcula el discriminante.`), hint: t('Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.', 'Δ = b² − 4ac.') },
      { type: 'choice', ...sol, prompt: t('Les solutions dans ℂ sont…', 'The solutions in ℂ are…', 'الحلول في ℂ…', 'Las soluciones en ℂ…'), hint: t(`Δ < 0 : z = (−b ± i√(−Δ)) ÷ 2a, avec √${-d} = ${Math.sqrt(-d)}. Les deux solutions sont conjuguées.`, `Δ < 0: z = (−b ± i√(−Δ)) ÷ 2a, √${-d} = ${Math.sqrt(-d)}. They are conjugates.`, `حلان مترافقان.`, `Soluciones conjugadas.`) },
    ],
  };
}

// ═════════════ ÉQUATIONS DIFFÉRENTIELLES ═════════════

function deExp(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [2, 3, -1, -2, 0.5]), k = int(rng, 1, 9);
  const gen = choices(rng, [same(`y = C e^(${rel(a)}x)`), same(`y = e^(${rel(a)}x) + C`), same(`y = C x e^(${rel(a)}x)`)]);
  return {
    title: t('y′ = ay', 'y′ = ay', 'y′ = ay', 'y′ = ay'),
    summary: `y′ = ${rel(a)}y : y = C e^(${rel(a)}x) ; y(0) = ${k} → C = ${k}`,
    steps: [
      { type: 'choice', ...gen, prompt: t(`Les solutions de y′ = ${rel(a)}y sont les fonctions…`, `The solutions of y′ = ${rel(a)}y are…`, `حلول y′ = ${rel(a)}y…`, `Las soluciones de y′ = ${rel(a)}y…`), hint: t('(C e^(ax))′ = a × C e^(ax) : la dérivée est a fois la fonction.', '(C e^(ax))′ = a C e^(ax): the derivative is a times the function.', '(C e^(ax))′ = a C e^(ax).', '(C e^(ax))′ = a C e^(ax).') },
      { type: 'number', answer: k, tolerance: 0, prompt: t(`On veut de plus y(0) = ${k}. Que vaut C ?`, `We also want y(0) = ${k}. What is C?`, `y(0) = ${k}. ما C؟`, `y(0) = ${k}. ¿C?`), hint: t('e⁰ = 1, donc y(0) = C.', 'e⁰ = 1, so y(0) = C.', 'y(0) = C.', 'y(0) = C.') },
    ],
  };
}

function deAffine(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [-2, -1, 2, 3, -0.5]), yc = int(rng, -5, 6) || 2, b = -a * yc;
  return {
    title: t('y′ = ay + b', 'y′ = ay + b', 'y′ = ay + b', 'y′ = ay + b'),
    summary: `y′ = ${rel(a)}y${signed(b)} : solution constante ${rel(yc)} ; y = C e^(${rel(a)}x)${signed(yc)}`,
    steps: [
      { type: 'number', answer: yc, tolerance: 1e-9, prompt: t(`y′ = ${rel(a)}y${signed(b)}. Quelle est la solution constante ?`, `y′ = ${rel(a)}y${signed(b)}. What is the constant solution?`, `ما الحل الثابت؟`, `¿Cuál es la solución constante?`), hint: t(`Une constante a une dérivée nulle : 0 = ${rel(a)}y${signed(b)}, donc y = −b/a.`, `A constant has zero derivative: 0 = ${a}y${signed(b)}, so y = −b/a.`, `y = −b/a.`, `y = −b/a.`) },
      { type: 'choice', ...choices(rng, [t(a < 0 ? `vers ${rel(yc)}` : 'vers ±∞', a < 0 ? `to ${yc}` : 'to ±∞', a < 0 ? `نحو ${rel(yc)}` : 'نحو ±∞', a < 0 ? `hacia ${rel(yc)}` : 'hacia ±∞'), t(a < 0 ? 'vers ±∞' : `vers ${rel(yc)}`, a < 0 ? 'to ±∞' : `to ${yc}`, a < 0 ? 'نحو ±∞' : `نحو ${rel(yc)}`, a < 0 ? 'hacia ±∞' : `hacia ${rel(yc)}`)]), prompt: t('Les solutions non constantes tendent en +∞…', 'Non-constant solutions tend at +∞…', 'الحلول غير الثابتة تؤول…', 'Las soluciones no constantes tienden…'), hint: t(`y = C e^(${rel(a)}x)${signed(yc)} : e^(${rel(a)}x) tend vers ${a < 0 ? '0' : '+∞'}.`, `e^(${a}x) tends to ${a < 0 ? '0' : '+∞'}.`, `e^(${rel(a)}x) → ${a < 0 ? '0' : '+∞'}.`, `e^(${rel(a)}x) → ${a < 0 ? '0' : '+∞'}.`) },
    ],
  };
}

function deCheck(seed: number): Activity {
  const rng = seeded(seed);
  const k = pick(rng, [2, 3, -1]), c = int(rng, 1, 4), good = rng() < 0.5, b = good ? -k * c : -k * c + int(rng, 1, 3);
  return {
    title: t('Vérifier une solution', 'Checking a solution', 'التحقق من حل', 'Comprobar una solución'),
    summary: `f(x) = e^(${rel(k)}x) + ${c} : f′ = ${rel(k)}e^(${rel(k)}x) = ${rel(k)}f${signed(-k * c)}`,
    steps: [
      { type: 'number', answer: k, tolerance: 0, prompt: t(`f(x) = e^(${rel(k)}x) + ${c}. Que vaut f′(0) ?`, `f(x) = e^(${rel(k)}x) + ${c}. What is f′(0)?`, `ما f′(0)؟`, `¿f′(0)?`), hint: t(`f′(x) = ${rel(k)}e^(${rel(k)}x).`, `f′(x) = ${k}e^(${k}x).`, `f′(x) = ${rel(k)}e^(${rel(k)}x).`, `f′(x) = ${rel(k)}e^(${rel(k)}x).`) },
      { type: 'choice', options: OUI_NON, answer: good ? 0 : 1, prompt: t(`f est-elle solution de y′ = ${rel(k)}y${signed(b)} ?`, `Is f a solution of y′ = ${k}y${signed(b)}?`, `هل f حل؟`, `¿f es solución?`), hint: t(`Compare f′(x) et ${rel(k)}f(x)${signed(b)} = ${rel(k)}e^(${rel(k)}x)${signed(k * c + b)}.`, `Compare f′(x) and ${k}f(x)${signed(b)}.`, `قارن f′ و ${rel(k)}f${signed(b)}.`, `Compara f′ y ${rel(k)}f${signed(b)}.`) },
    ],
  };
}

function deModel(seed: number): Activity {
  const rng = seeded(seed);
  const y0 = pick(rng, [50, 80, 100, 200]), k = pick(rng, [0.1, 0.05, 0.2]), tt = pick(rng, [5, 10, 20]);
  const v = Math.round(y0 * Math.exp(-k * tt) * 100) / 100;
  return {
    title: t('Un modèle de décroissance', 'A decay model', 'نموذج تناقص', 'Un modelo de decrecimiento'),
    summary: `y′ = −${rel(k)}y, y(0) = ${y0} : y(t) = ${y0}e^(−${rel(k)}t) ; y(${tt}) ≈ ${rel(v)}`,
    steps: [
      { type: 'number', answer: y0, tolerance: 0, prompt: t(`Une quantité vérifie y′ = −${rel(k)}y avec y(0) = ${y0}, donc y(t) = C e^(−${rel(k)}t). Que vaut C ?`, `A quantity satisfies y′ = −${k}y with y(0) = ${y0}, so y(t) = C e^(−${k}t). What is C?`, `ما C؟`, `¿C?`), hint: t('C = y(0).', 'C = y(0).', 'C = y(0).', 'C = y(0).') },
      { type: 'number', answer: v, tolerance: 0.02, prompt: t(`Combien en reste-t-il à t = ${tt} (au centième) ?`, `How much is left at t = ${tt} (2 d.p.)?`, `كم يبقى عند t = ${tt}؟`, `¿Cuánto queda en t = ${tt}?`), hint: t(`${y0} × e^(−${rel(k * tt)}).`, `${y0} × e^(−${k * tt}).`, `${y0} × e^(−${rel(k * tt)}).`, `${y0} × e^(−${rel(k * tt)}).`) },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const TERMINALE_SKILLS: Skill[] = [
  { id: 'ln-rules', review: 0, chapter: 'ln', build: lnRules, title: s('Propriétés de ln', 'Rules for ln', 'خاصيات ln', 'Propiedades de ln'), desc: s('Les produits deviennent des sommes.', 'Products become sums.', 'الجداءات تصبح مجاميع.', 'Productos en sumas.') },
  { id: 'ln-equation', review: 0, chapter: 'ln', build: lnEquation, title: s('Équations avec ln', 'Equations with ln', 'معادلات ln', 'Ecuaciones con ln'), desc: s('ln, réciproque de exp.', 'ln, the inverse of exp.', 'ln عكس exp.', 'ln, inversa de exp.') },
  { id: 'ln-derivative', review: 0, chapter: 'ln', build: lnDerivative, title: s('Dériver ln', 'Differentiate ln', 'اشتقاق ln', 'Derivar ln'), desc: s('(ln x)′ = 1/x.', '(ln x)′ = 1/x.', '(ln x)′ = 1/x.', '(ln x)′ = 1/x.') },
  { id: 'ln-threshold', review: 1, chapter: 'ln', build: lnThreshold, title: s('Seuils', 'Thresholds', 'العتبات', 'Umbrales'), desc: s('qⁿ ≥ A avec ln.', 'qⁿ ≥ A with ln.', 'qⁿ ≥ A.', 'qⁿ ≥ A.') },
  { id: 'int-primitive', review: 0, chapter: 'integral', build: intPrimitive, title: s('Primitives', 'Antiderivatives', 'الدوال الأصلية', 'Primitivas'), desc: s('Remonter la dérivée.', 'Undo the derivative.', 'عكس الاشتقاق.', 'Deshacer la derivada.') },
  { id: 'int-compute', review: 0, chapter: 'integral', build: intCompute, title: s('Calculer une intégrale', 'Compute an integral', 'حساب تكامل', 'Calcular una integral'), desc: s('F(b) − F(a).', 'F(b) − F(a).', 'F(b) − F(a).', 'F(b) − F(a).') },
  { id: 'int-area', review: 0, chapter: 'integral', build: intArea, title: s('Aire et linéarité', 'Area and linearity', 'المساحة والخطية', 'Área y linealidad'), desc: s('L’intégrale comme aire.', 'The integral as an area.', 'التكامل كمساحة.', 'La integral como área.') },
  { id: 'int-mean', review: 1, chapter: 'integral', build: intMean, title: s('Valeur moyenne', 'Mean value', 'القيمة المتوسطة', 'Valor medio'), desc: s('L’intégrale divisée par la longueur.', 'Integral over length.', 'التكامل مقسوم على الطول.', 'Integral entre longitud.') },
  { id: 'sp-coords', review: 0, chapter: 'space', build: spCoords, title: s('Coordonnées', 'Coordinates', 'الإحداثيات', 'Coordenadas'), desc: s('x, y et z.', 'x, y and z.', 'x و y و z.', 'x, y y z.') },
  { id: 'sp-dot', review: 0, chapter: 'space', build: spDot, title: s('Produit scalaire', 'Dot product', 'الجداء السلمي', 'Producto escalar'), desc: s('xx′ + yy′ + zz′.', 'xx′ + yy′ + zz′.', 'xx′ + yy′ + zz′.', 'xx′ + yy′ + zz′.') },
  { id: 'sp-plane', review: 0, chapter: 'space', build: spPlane, title: s('Équation de plan', 'Plane equation', 'معادلة مستوى', 'Ecuación del plano'), desc: s('Avec un vecteur normal.', 'With a normal vector.', 'بمتجهة منظمية.', 'Con un vector normal.') },
  { id: 'sp-line', review: 0, chapter: 'space', build: spLine, title: s('Droite paramétrée', 'Parametric line', 'مستقيم بارامتري', 'Recta paramétrica'), desc: s('Un point et une direction.', 'A point and a direction.', 'نقطة واتجاه.', 'Un punto y una dirección.') },
  { id: 'cnt-permutations', review: 0, chapter: 'counting', build: cntPermutations, title: s('Permutations', 'Permutations', 'التبديلات', 'Permutaciones'), desc: s('n! rangements.', 'n! orderings.', 'n! ترتيبًا.', 'n! ordenaciones.') },
  { id: 'cnt-arrangements', review: 0, chapter: 'counting', build: cntArrangements, title: s('Arrangements', 'Ordered selections', 'الترتيبات', 'Variaciones'), desc: s('L’ordre compte.', 'Order matters.', 'الترتيب مهم.', 'El orden importa.') },
  { id: 'cnt-combinations', review: 0, chapter: 'counting', build: cntCombinations, title: s('Combinaisons', 'Combinations', 'التأليفات', 'Combinaciones'), desc: s('L’ordre ne compte pas.', 'Order doesn’t matter.', 'الترتيب غير مهم.', 'El orden no importa.') },
  { id: 'cnt-lists', review: 1, chapter: 'counting', build: cntLists, title: s('Listes', 'Lists', 'القوائم', 'Listas'), desc: s('Avec répétition.', 'With repetition.', 'مع التكرار.', 'Con repetición.') },
  { id: 'cx-algebra', review: 0, chapter: 'complex', build: cxAlgebra, title: s('Forme algébrique', 'Algebraic form', 'الشكل الجبري', 'Forma algebraica'), desc: s('a + ib, i² = −1.', 'a + ib, i² = −1.', 'a + ib.', 'a + ib.') },
  { id: 'cx-modulus', review: 0, chapter: 'complex', build: cxModulus, title: s('Module et conjugué', 'Modulus and conjugate', 'المعيار والمرافق', 'Módulo y conjugado'), desc: s('Distance et symétrie.', 'Distance and reflection.', 'المسافة والتماثل.', 'Distancia y simetría.') },
  { id: 'cx-powers', review: 0, chapter: 'complex', build: cxPowers, title: s('Puissances de i', 'Powers of i', 'قوى i', 'Potencias de i'), desc: s('Un quart de tour.', 'A quarter turn.', 'ربع دورة.', 'Un cuarto de vuelta.') },
  { id: 'cx-quadratic', review: 0, chapter: 'complex', build: cxQuadratic, title: s('Second degré dans ℂ', 'Quadratics over ℂ', 'الدرجة الثانية في ℂ', 'Segundo grado en ℂ'), desc: s('Quand Δ < 0.', 'When Δ < 0.', 'عندما Δ < 0.', 'Cuando Δ < 0.') },
  { id: 'de-exp', review: 0, chapter: 'diffeq', build: deExp, title: s('y′ = ay', 'y′ = ay', 'y′ = ay', 'y′ = ay'), desc: s('Les solutions exponentielles.', 'Exponential solutions.', 'الحلول الأسية.', 'Soluciones exponenciales.') },
  { id: 'de-affine', review: 0, chapter: 'diffeq', build: deAffine, title: s('y′ = ay + b', 'y′ = ay + b', 'y′ = ay + b', 'y′ = ay + b'), desc: s('La solution constante.', 'The constant solution.', 'الحل الثابت.', 'La solución constante.') },
  { id: 'de-check', review: 0, chapter: 'diffeq', build: deCheck, title: s('Vérifier une solution', 'Check a solution', 'التحقق من حل', 'Comprobar una solución'), desc: s('Dériver et comparer.', 'Differentiate and compare.', 'نشتق ونقارن.', 'Derivar y comparar.') },
  { id: 'de-model', review: 1, chapter: 'diffeq', build: deModel, title: s('Modéliser', 'Modelling', 'النمذجة', 'Modelizar'), desc: s('Refroidissement, désintégration.', 'Cooling, decay.', 'التبريد والتفكك.', 'Enfriamiento, desintegración.') },
];
