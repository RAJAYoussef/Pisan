// Derniers parcours de Terminale : statistique à deux variables (FR complémentaire, CI, SN, US),
// arithmétique dans ℤ et structures algébriques (2ème Bac sciences mathématiques au Maroc).
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
const r2 = (v: number) => Math.round(v * 100) / 100;
function choices(rng: Rng, list: L[]): { options: L[]; answer: number } {
  const options = shuffle(rng, list);
  return { options, answer: options.indexOf(list[0]!) };
}
/** Reste et quotient de la division euclidienne dans ℤ (reste toujours dans [0 ; n[). */
export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const powMod = (b: number, e: number, n: number) => { let r = 1 % n, x = mod(b, n); for (let k = e; k > 0; k >>= 1) { if (k & 1) r = (r * x) % n; x = (x * x) % n; } return r; };

// ═════════════ STATISTIQUE À DEUX VARIABLES ═════════════

function tvMeanPoint(seed: number): Activity {
  const rng = seeded(seed);
  const xs = [1, 2, 3, 4].map(k => k * pick(rng, [1, 2]) + int(rng, 0, 1) + k), ys = xs.map(() => int(rng, 2, 20));
  const mx = xs.reduce((a, b) => a + b, 0) / 4, my = ys.reduce((a, b) => a + b, 0) / 4;
  return {
    title: t('Nuage de points et point moyen', 'Scatter plot and mean point', 'سحابة النقط والنقطة المتوسطة', 'Nube de puntos y punto medio'),
    summary: `G(x̄ ; ȳ) = (${rel(mx)} ; ${rel(my)})`,
    steps: [
      { type: 'number', answer: mx, tolerance: 1e-9, prompt: t(`Série (xᵢ ; yᵢ) : ${xs.map((x, i) => `(${x} ; ${ys[i]})`).join(', ')}. Abscisse x̄ du point moyen G ?`, `Data (xᵢ, yᵢ): ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. x-coordinate x̄ of the mean point G?`, `ما x̄ للنقطة المتوسطة G؟`, `¿x̄ del punto medio G?`), hint: t('La moyenne des xᵢ.', 'The mean of the xᵢ.', 'معدل xᵢ.', 'La media de los xᵢ.') },
      { type: 'number', answer: my, tolerance: 1e-9, prompt: t('Et son ordonnée ȳ ?', 'And its y-coordinate ȳ?', 'و ȳ؟', '¿Y ȳ?'), hint: t('La moyenne des yᵢ.', 'The mean of the yᵢ.', 'معدل yᵢ.', 'La media de los yᵢ.') },
    ],
  };
}

function tvLine(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [0.5, 1.2, 2, -1.5, 3]), mx = int(rng, 3, 9), my = int(rng, 10, 40), x = mx + int(rng, 2, 6);
  const b = r2(my - a * mx);
  return {
    title: t('Droite des moindres carrés', 'Least-squares line', 'مستقيم المربعات الدنيا', 'Recta de mínimos cuadrados'),
    summary: `y = ${rel(a)}x + b passe par G(${mx} ; ${my}) : b = ${rel(b)} ; en x = ${x}, y ≈ ${rel(r2(a * x + b))}`,
    steps: [
      { type: 'number', answer: b, tolerance: 0.01, prompt: t(`La droite des moindres carrés a pour coefficient directeur ${rel(a)} et le point moyen est G(${mx} ; ${my}). Que vaut b dans y = ${rel(a)}x + b ?`, `The least-squares line has gradient ${a} and the mean point is G(${mx}, ${my}). What is b in y = ${a}x + b?`, `ما قيمة b؟`, `¿Cuánto vale b?`), hint: t(`La droite passe par G : ${my} = ${rel(a)} × ${mx} + b.`, `The line goes through G: ${my} = ${a} × ${mx} + b.`, `المستقيم يمر من G.`, `La recta pasa por G.`) },
      { type: 'number', answer: r2(a * x + b), tolerance: 0.02, prompt: t(`Estime y pour x = ${x}.`, `Estimate y for x = ${x}.`, `قدّر y من أجل x = ${x}.`, `Estima y para x = ${x}.`), hint: t(`${rel(a)} × ${x} + ${rel(b)}.`, `${a} × ${x} + ${b}.`, `${rel(a)} × ${x} + ${rel(b)}.`, `${rel(a)} × ${x} + ${rel(b)}.`) },
    ],
  };
}

function tvCorrelation(seed: number): Activity {
  const rng = seeded(seed);
  const r = pick(rng, [0.97, -0.95, 0.12, -0.08, 0.99]), strong = Math.abs(r) > 0.9;
  const mean = choices(rng, [t(strong ? (r > 0 ? 'forte, les deux grandissent ensemble' : 'forte, quand l’une grandit l’autre diminue') : 'faible : pas d’ajustement affine pertinent', strong ? (r > 0 ? 'strong, both rise together' : 'strong, one rises as the other falls') : 'weak: no sensible linear fit', strong ? 'قوية' : 'ضعيفة', strong ? 'fuerte' : 'débil'), t(strong ? 'faible : pas d’ajustement affine pertinent' : (r > 0 ? 'forte, les deux grandissent ensemble' : 'forte, quand l’une grandit l’autre diminue'), strong ? 'weak: no sensible linear fit' : 'strong', strong ? 'ضعيفة' : 'قوية', strong ? 'débil' : 'fuerte'), t('impossible : r doit être entre 0 et 1', 'impossible: r must be between 0 and 1', 'مستحيل', 'imposible')]);
  return {
    title: t('Corrélation', 'Correlation', 'الارتباط', 'Correlación'),
    summary: `r = ${rel(r)} : corrélation ${strong ? 'forte' : 'faible'}${strong ? (r > 0 ? ' positive' : ' négative') : ''} · corrélation ≠ causalité`,
    steps: [
      { type: 'choice', ...mean, prompt: t(`Le coefficient de corrélation vaut r = ${rel(r)}. La liaison linéaire est…`, `The correlation coefficient is r = ${r}. The linear relationship is…`, `r = ${rel(r)}. العلاقة…`, `r = ${rel(r)}. La relación es…`), hint: t('r est entre −1 et 1 ; |r| proche de 1 : points presque alignés ; le signe donne le sens.', 'r is between −1 and 1; |r| near 1: almost aligned; the sign gives the direction.', '|r| قريب من 1: شبه مستقيمية.', '|r| cerca de 1: casi alineados.') },
      { type: 'choice', options: OUI_NON, answer: 1, prompt: t('Les ventes de glaces et les coups de soleil sont fortement corrélés. Les glaces causent-elles les coups de soleil ?', 'Ice-cream sales and sunburns are strongly correlated. Do ice creams cause sunburn?', 'هل المثلجات تسبب ضربات الشمس؟', '¿Los helados causan quemaduras?'), hint: t('Corrélation ne veut pas dire causalité : ici, un troisième facteur (le soleil) agit sur les deux.', 'Correlation is not causation: a third factor (the sun) drives both.', 'الارتباط ليس سببية.', 'Correlación no es causalidad.') },
    ],
  };
}

function tvChange(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [0.2, 0.3, 0.5]), b = pick(rng, [1, 2, 0.5]), x = pick(rng, [2, 4, 5]);
  const y = r2(Math.exp(a * x + b));
  const form = choices(rng, [same(`y = e^(${rel(a)}x${signed(b)})`), same(`y = ${rel(a)}x${signed(b)}`), same(`y = ln(${rel(a)}x${signed(b)})`)]);
  return {
    title: t('Changement de variable', 'Change of variable', 'تغيير المتغير', 'Cambio de variable'),
    summary: `z = ln y = ${rel(a)}x${signed(b)} ⇔ y = e^(${rel(a)}x${signed(b)}) ; en x = ${x}, y ≈ ${rel(y)}`,
    steps: [
      { type: 'choice', ...form, prompt: t(`Le nuage (x ; y) est courbé ; on pose z = ln y et on trouve l’ajustement z = ${rel(a)}x${signed(b)}. Donc…`, `The (x, y) cloud is curved; set z = ln y and find z = ${a}x${signed(b)}. So…`, `z = ln y = ${rel(a)}x${signed(b)}. إذن…`, `z = ln y = ${rel(a)}x${signed(b)}. Entonces…`), hint: t('z = ln y ⇔ y = eᶻ.', 'z = ln y ⇔ y = eᶻ.', 'y = eᶻ.', 'y = eᶻ.') },
      { type: 'number', answer: y, tolerance: 0.02, prompt: t(`Estime y pour x = ${x} (au centième).`, `Estimate y for x = ${x} (2 d.p.).`, `قدّر y من أجل x = ${x}.`, `Estima y para x = ${x}.`), hint: t(`e^(${rel(r2(a * x + b))}).`, `e^(${r2(a * x + b)}).`, `e^(${rel(r2(a * x + b))}).`, `e^(${rel(r2(a * x + b))}).`) },
    ],
  };
}

// ═════════════ ARITHMÉTIQUE DANS ℤ ═════════════

function cgDivision(seed: number): Activity {
  const rng = seeded(seed);
  const n = int(rng, 3, 9), a = -int(rng, n + 1, 60);
  const q = Math.floor(a / n), r = mod(a, n);
  return {
    title: t('Division euclidienne dans ℤ', 'Euclidean division in ℤ', 'القسمة الإقليدية في ℤ', 'División euclídea en ℤ'),
    summary: `${rel(a)} = ${n} × (${rel(q)}) + ${r}, avec 0 ≤ ${r} < ${n}`,
    steps: [
      { type: 'number', answer: r, tolerance: 0, prompt: t(`Division euclidienne de ${rel(a)} par ${n} : ${rel(a)} = ${n}q + r avec 0 ≤ r < ${n}. Que vaut r ?`, `Euclidean division of ${a} by ${n}: ${a} = ${n}q + r with 0 ≤ r < ${n}. What is r?`, `ما الباقي r؟`, `¿Cuánto vale r?`), hint: t('Le reste est toujours positif : on prend le multiple de n juste en dessous (plus négatif).', 'The remainder is always non-negative: take the multiple of n just below (more negative).', 'الباقي موجب دائمًا.', 'El resto siempre es positivo.') },
      { type: 'number', answer: q, tolerance: 0, prompt: t('Et le quotient q ?', 'And the quotient q?', 'والخارج q؟', '¿Y el cociente q?'), hint: t(`(${rel(a)} − ${r}) ÷ ${n}.`, `(${a} − ${r}) ÷ ${n}.`, `(${rel(a)} − ${r}) ÷ ${n}.`, `(${rel(a)} − ${r}) ÷ ${n}.`) },
    ],
  };
}

function cgMod(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [5, 7, 9, 11]), a = int(rng, 100, 2100), b = a + n * int(rng, 2, 30) + (rng() < 0.5 ? 0 : int(rng, 1, n - 1));
  const cong = mod(a - b, n) === 0;
  return {
    title: t('Congruences', 'Congruences', 'الموافقات', 'Congruencias'),
    summary: `${a} ≡ ${mod(a, n)} [${n}] · ${b} ${cong ? '≡' : '≢'} ${a} [${n}]`,
    steps: [
      { type: 'number', answer: mod(a, n), tolerance: 0, prompt: t(`Trouve r entre 0 et ${n - 1} tel que ${a} ≡ r [${n}].`, `Find r between 0 and ${n - 1} with ${a} ≡ r (mod ${n}).`, `جد r بحيث ${a} ≡ r [${n}].`, `Halla r con ${a} ≡ r [${n}].`), hint: t(`C’est le reste de la division de ${a} par ${n}.`, `It is the remainder of ${a} ÷ ${n}.`, `باقي القسمة على ${n}.`, `El resto de dividir entre ${n}.`) },
      { type: 'choice', options: OUI_NON, answer: cong ? 0 : 1, prompt: t(`${b} ≡ ${a} [${n}] ?`, `Is ${b} ≡ ${a} (mod ${n})?`, `هل ${b} ≡ ${a} [${n}]؟`, `¿${b} ≡ ${a} [${n}]?`), hint: t(`a ≡ b [n] ⇔ n divise a − b. Ici ${b} − ${a} = ${b - a}.`, `a ≡ b (mod n) ⇔ n divides a − b. Here ${b} − ${a} = ${b - a}.`, `n يقسم a − b.`, `n divide a − b.`) },
    ],
  };
}

function cgPowers(seed: number): Activity {
  const rng = seeded(seed);
  const [b, n] = pick(rng, [[2, 5], [3, 5], [2, 7], [3, 7], [4, 9], [2, 9]] as [number, number][]);
  let period = 1; while (powMod(b, period, n) !== 1) period++;
  const e = int(rng, 100, 2026);
  return {
    title: t('Puissances modulo n', 'Powers modulo n', 'القوى بترديد n', 'Potencias módulo n'),
    summary: `${b}^${period} ≡ 1 [${n}] : les restes reviennent tous les ${period} · ${b}^${e} ≡ ${b}^${e % period} ≡ ${powMod(b, e, n)} [${n}]`,
    steps: [
      { type: 'number', answer: period, tolerance: 0, prompt: t(`Quel est le plus petit k ≥ 1 tel que ${b}^k ≡ 1 [${n}] ?`, `What is the smallest k ≥ 1 with ${b}^k ≡ 1 (mod ${n})?`, `ما أصغر k بحيث ${b}^k ≡ 1 [${n}]؟`, `¿Menor k con ${b}^k ≡ 1 [${n}]?`), hint: t(`Calcule les restes de ${b}, ${b}², ${b}³… modulo ${n}, en multipliant à chaque fois le reste précédent par ${b}.`, `Work out ${b}, ${b}², ${b}³… mod ${n}, multiplying the previous remainder by ${b}.`, `احسب البواقي المتتالية.`, `Calcula los restos sucesivos.`) },
      { type: 'number', answer: powMod(b, e, n), tolerance: 0, prompt: t(`Reste de ${b}^${e} dans la division par ${n} ?`, `Remainder of ${b}^${e} divided by ${n}?`, `باقي ${b}^${e} على ${n}؟`, `¿Resto de ${b}^${e} entre ${n}?`), hint: t(`${e} = ${period} × ${Math.floor(e / period)} + ${e % period}, donc ${b}^${e} ≡ ${b}^${e % period} [${n}].`, `${e} = ${period} × ${Math.floor(e / period)} + ${e % period}, so ${b}^${e} ≡ ${b}^${e % period}.`, `${b}^${e} ≡ ${b}^${e % period}.`, `${b}^${e} ≡ ${b}^${e % period}.`) },
    ],
  };
}

function cgGcd(seed: number): Activity {
  const rng = seeded(seed);
  const g = pick(rng, [1, 2, 3, 4, 6, 7, 12]), a = g * int(rng, 5, 20), b = g * int(rng, 3, 14);
  const d = gcd(a, b);
  return {
    title: t('PGCD et algorithme d’Euclide', 'GCD and Euclid’s algorithm', 'القاسم المشترك الأكبر وخوارزمية إقليدس', 'MCD y algoritmo de Euclides'),
    summary: `PGCD(${a} ; ${b}) = ${d}${d === 1 ? ' : premiers entre eux' : ''}`,
    steps: [
      { type: 'number', answer: d, tolerance: 0, prompt: t(`Calcule PGCD(${a} ; ${b}).`, `Work out gcd(${a}, ${b}).`, `احسب PGCD(${a} ; ${b}).`, `Calcula MCD(${a} ; ${b}).`), hint: t(`Euclide : PGCD(a ; b) = PGCD(b ; r) où r est le reste de a ÷ b. ${a} = ${b} × ${Math.floor(a / b)} + ${a % b}.`, `Euclid: gcd(a, b) = gcd(b, r), r the remainder of a ÷ b.`, `PGCD(a ; b) = PGCD(b ; r).`, `MCD(a ; b) = MCD(b ; r).`) },
      { type: 'choice', options: OUI_NON, answer: d === 1 ? 0 : 1, prompt: t(`${a} et ${b} sont-ils premiers entre eux ?`, `Are ${a} and ${b} coprime?`, `هل هما أوليان فيما بينهما؟`, `¿Son primos entre sí?`), hint: t('Premiers entre eux ⇔ PGCD = 1 (Bézout : il existe u, v avec au + bv = 1).', 'Coprime ⇔ gcd = 1 (Bézout: au + bv = 1 for some u, v).', 'PGCD = 1.', 'MCD = 1.') },
    ],
  };
}

// ═════════════ STRUCTURES ALGÉBRIQUES ═════════════

function stLaw(seed: number): Activity {
  const rng = seeded(seed);
  const k = int(rng, 1, 4), a = int(rng, -3, 5), b = int(rng, -3, 5);
  const op = (x: number, y: number) => x + y - k * x * y;
  return {
    title: t('Loi de composition interne', 'Binary operations', 'قانون التركيب الداخلي', 'Ley de composición interna'),
    summary: `x * y = x + y − ${k}xy : ${rel(a)} * ${rel(b)} = ${rel(op(a, b))}, loi commutative`,
    steps: [
      { type: 'number', answer: op(a, b), tolerance: 0, prompt: t(`Sur ℝ, on pose x * y = x + y − ${k}xy. Calcule ${rel(a)} * ${rel(b)}.`, `On ℝ, x * y = x + y − ${k}xy. Work out ${a} * ${b}.`, `احسب ${rel(a)} * ${rel(b)}.`, `Calcula ${rel(a)} * ${rel(b)}.`), hint: t(`${rel(a)} + ${rel(b)} − ${k} × ${rel(a)} × ${rel(b)}.`, `${a} + ${b} − ${k} × ${a} × ${b}.`, `عوّض.`, `Sustituye.`) },
      { type: 'choice', options: OUI_NON, answer: 0, prompt: t('La loi * est-elle commutative (x * y = y * x) ?', 'Is * commutative (x * y = y * x)?', 'هل القانون تبادلي؟', '¿Es conmutativa?'), hint: t('Échange x et y dans x + y − kxy : rien ne change.', 'Swap x and y in x + y − kxy: nothing changes.', 'بدّل x و y.', 'Intercambia x e y.') },
      { type: 'number', answer: 0, tolerance: 0, prompt: t('Quel est l’élément neutre e (x * e = x pour tout x) ?', 'What is the identity element e (x * e = x for every x)?', 'ما العنصر المحايد؟', '¿Elemento neutro?'), hint: t(`x + e − ${k}xe = x ⇔ e(1 − ${k}x) = 0 pour tout x.`, `x + e − ${k}xe = x ⇔ e(1 − ${k}x) = 0 for every x.`, `e(1 − ${k}x) = 0.`, `e(1 − ${k}x) = 0.`) },
    ],
  };
}

function stNeutral(seed: number): Activity {
  const rng = seeded(seed);
  const k = pick(rng, [-3, -2, 2, 3, 5]), a = int(rng, -4, 8);
  return {
    title: t('Neutre et symétrique', 'Identity and inverse', 'المحايد والمماثل', 'Neutro y simétrico'),
    summary: `x * y = x + y${signed(k)} sur ℤ : neutre ${rel(-k)}, symétrique de ${rel(a)} : ${rel(-a - 2 * k)}`,
    steps: [
      { type: 'number', answer: -k, tolerance: 0, prompt: t(`Sur ℤ, x * y = x + y${signed(k)}. Quel est l’élément neutre ?`, `On ℤ, x * y = x + y${signed(k)}. What is the identity element?`, `ما العنصر المحايد؟`, `¿Elemento neutro?`), hint: t(`x + e${signed(k)} = x.`, `x + e${signed(k)} = x.`, `x + e${signed(k)} = x.`, `x + e${signed(k)} = x.`) },
      { type: 'number', answer: -a - 2 * k, tolerance: 0, prompt: t(`Quel est le symétrique de ${rel(a)} ?`, `What is the inverse of ${a}?`, `ما مماثل ${rel(a)}؟`, `¿Simétrico de ${rel(a)}?`), hint: t(`${rel(a)} * a′ = neutre : ${rel(a)} + a′${signed(k)} = ${rel(-k)}.`, `${a} * a′ = identity: ${a} + a′${signed(k)} = ${-k}.`, `${rel(a)} * a′ = ${rel(-k)}.`, `${rel(a)} * a′ = ${rel(-k)}.`) },
      { type: 'choice', options: OUI_NON, answer: 0, prompt: t('(ℤ, *) est-il un groupe commutatif ?', 'Is (ℤ, *) a commutative group?', 'هل (ℤ, *) زمرة تبادلية؟', '¿(ℤ, *) es un grupo conmutativo?'), hint: t('Associative, commutative, un neutre, et chaque élément a un symétrique dans ℤ.', 'Associative, commutative, an identity, and every element has an inverse in ℤ.', 'تجميعي، تبادلي، محايد ومماثل.', 'Asociativa, conmutativa, neutro y simétricos.') },
    ],
  };
}

function stGroup(seed: number): Activity {
  const rng = seeded(seed);
  const p = pick(rng, [5, 7, 11, 13]), a = int(rng, 2, p - 1);
  const inv = Array.from({ length: p }, (_, k) => k).find(k => (a * k) % p === 1)!;
  return {
    title: t('Le groupe (ℤ/pℤ*, ×)', 'The group (ℤ/pℤ*, ×)', 'الزمرة (ℤ/pℤ*, ×)', 'El grupo (ℤ/pℤ*, ×)'),
    summary: `dans ℤ/${p}ℤ : ${a} × ${inv} ≡ 1, donc ${a}⁻¹ = ${inv}`,
    steps: [
      { type: 'number', answer: inv, tolerance: 0, prompt: t(`Dans ℤ/${p}ℤ, quel est l’inverse de ${a} pour la multiplication ?`, `In ℤ/${p}ℤ, what is the multiplicative inverse of ${a}?`, `ما مقلوب ${a} في ℤ/${p}ℤ؟`, `¿Inverso de ${a} en ℤ/${p}ℤ?`), hint: t(`Cherche b entre 1 et ${p - 1} tel que ${a} × b ≡ 1 [${p}].`, `Find b between 1 and ${p - 1} with ${a} × b ≡ 1 (mod ${p}).`, `${a} × b ≡ 1 [${p}].`, `${a} × b ≡ 1 [${p}].`) },
      { type: 'number', answer: (a * a) % p, tolerance: 0, prompt: t(`Et ${a} × ${a} dans ℤ/${p}ℤ ?`, `And ${a} × ${a} in ℤ/${p}ℤ?`, `و ${a} × ${a}؟`, `¿Y ${a} × ${a}?`), hint: t(`${a * a} modulo ${p}.`, `${a * a} mod ${p}.`, `${a * a} بترديد ${p}.`, `${a * a} mód ${p}.`) },
    ],
  };
}

function stRing(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [6, 8, 9, 10, 12, 7, 11, 5]), prime = [5, 7, 11].includes(n);
  const d = prime ? 0 : [2, 3].find(k => n % k === 0)!;
  return {
    title: t('Anneaux et corps', 'Rings and fields', 'الحلقات والحقول', 'Anillos y cuerpos'),
    summary: `ℤ/${n}ℤ est un corps ⇔ ${n} est premier : ${prime ? 'oui' : `non (${d} × ${n / d} ≡ 0)`}`,
    steps: [
      { type: 'choice', options: OUI_NON, answer: prime ? 0 : 1, prompt: t(`(ℤ/${n}ℤ, +, ×) est-il un corps ?`, `Is (ℤ/${n}ℤ, +, ×) a field?`, `هل (ℤ/${n}ℤ, +, ×) حقل؟`, `¿(ℤ/${n}ℤ, +, ×) es un cuerpo?`), hint: t('ℤ/nℤ est un corps exactement quand n est premier : sinon n = ab donne a × b ≡ 0 (diviseurs de zéro).', 'ℤ/nℤ is a field exactly when n is prime: otherwise n = ab gives a × b ≡ 0 (zero divisors).', 'حقل ⇔ n أولي.', 'Cuerpo ⇔ n primo.') },
      { type: 'number', answer: prime ? 0 : (d * (n / d)) % n, tolerance: 0, prompt: prime ? t(`Dans ℤ/${n}ℤ, que vaut ${n - 1} + 1 ?`, `In ℤ/${n}ℤ, what is ${n - 1} + 1?`, `كم يساوي ${n - 1} + 1؟`, `¿${n - 1} + 1?`) : t(`Dans ℤ/${n}ℤ, que vaut ${d} × ${n / d} ?`, `In ℤ/${n}ℤ, what is ${d} × ${n / d}?`, `كم يساوي ${d} × ${n / d}؟`, `¿${d} × ${n / d}?`), hint: t(`On calcule puis on prend le reste modulo ${n}.`, `Compute, then take the remainder mod ${n}.`, `الباقي بترديد ${n}.`, `Resto módulo ${n}.`) },
    ],
  };
}

const s = (fr: string, en: string, ar: string, es: string) => t(fr, en, ar, es);
export const TERMINALE_END_SKILLS: Skill[] = [
  { id: 'tv-mean-point', review: 0, chapter: 'twovar', build: tvMeanPoint, title: s('Point moyen', 'Mean point', 'النقطة المتوسطة', 'Punto medio'), desc: s('Le centre du nuage.', 'The centre of the cloud.', 'مركز السحابة.', 'El centro de la nube.') },
  { id: 'tv-line', review: 0, chapter: 'twovar', build: tvLine, title: s('Ajustement affine', 'Linear fit', 'التعديل الخطي', 'Ajuste lineal'), desc: s('Prévoir avec la droite.', 'Predict with the line.', 'التوقع بالمستقيم.', 'Predecir con la recta.') },
  { id: 'tv-correlation', review: 0, chapter: 'twovar', build: tvCorrelation, title: s('Corrélation', 'Correlation', 'الارتباط', 'Correlación'), desc: s('Lire r, sans conclure trop vite.', 'Read r carefully.', 'قراءة r.', 'Leer r.') },
  { id: 'tv-change', review: 1, chapter: 'twovar', build: tvChange, title: s('Changement de variable', 'Change of variable', 'تغيير المتغير', 'Cambio de variable'), desc: s('z = ln y.', 'z = ln y.', 'z = ln y.', 'z = ln y.') },
  { id: 'cg-division', review: 0, chapter: 'congru', build: cgDivision, title: s('Division dans ℤ', 'Division in ℤ', 'القسمة في ℤ', 'División en ℤ'), desc: s('Un reste toujours positif.', 'A non-negative remainder.', 'باقٍ موجب.', 'Resto positivo.') },
  { id: 'cg-mod', review: 0, chapter: 'congru', build: cgMod, title: s('Congruences', 'Congruences', 'الموافقات', 'Congruencias'), desc: s('Même reste.', 'Same remainder.', 'نفس الباقي.', 'Mismo resto.') },
  { id: 'cg-powers', review: 0, chapter: 'congru', build: cgPowers, title: s('Puissances modulo n', 'Powers mod n', 'القوى بترديد n', 'Potencias mód n'), desc: s('Les restes tournent en rond.', 'Remainders go round in cycles.', 'البواقي دورية.', 'Los restos son cíclicos.') },
  { id: 'cg-gcd', review: 1, chapter: 'congru', build: cgGcd, title: s('PGCD et Euclide', 'GCD and Euclid', 'PGCD وإقليدس', 'MCD y Euclides'), desc: s('Divisions successives.', 'Repeated division.', 'قسمات متتالية.', 'Divisiones sucesivas.') },
  { id: 'st-law', review: 0, chapter: 'structures', build: stLaw, title: s('Loi interne', 'Binary operation', 'قانون داخلي', 'Ley interna'), desc: s('Calculer, commutativité, neutre.', 'Compute, commutativity, identity.', 'الحساب والتبادلية والمحايد.', 'Calcular, conmutatividad, neutro.') },
  { id: 'st-neutral', review: 0, chapter: 'structures', build: stNeutral, title: s('Neutre et symétrique', 'Identity and inverse', 'المحايد والمماثل', 'Neutro y simétrico'), desc: s('Vers la notion de groupe.', 'Towards groups.', 'نحو الزمرة.', 'Hacia los grupos.') },
  { id: 'st-group', review: 0, chapter: 'structures', build: stGroup, title: s('Groupe ℤ/pℤ*', 'Group ℤ/pℤ*', 'الزمرة ℤ/pℤ*', 'Grupo ℤ/pℤ*'), desc: s('Les inverses modulo p.', 'Inverses mod p.', 'المقلوبات بترديد p.', 'Inversos mód p.') },
  { id: 'st-ring', review: 1, chapter: 'structures', build: stRing, title: s('Anneaux et corps', 'Rings and fields', 'الحلقات والحقول', 'Anillos y cuerpos'), desc: s('Quand ℤ/nℤ est un corps.', 'When ℤ/nℤ is a field.', 'متى يكون ℤ/nℤ حقلًا.', 'Cuándo ℤ/nℤ es cuerpo.') },
];
