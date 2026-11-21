// Introductions des derniers parcours de Terminale : statistique à deux variables, arithmétique dans ℤ,
// structures algébriques. Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const same = (s: string) => t(s, s, s, s);
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');
const SCATTER = { kind: 'scatter' as const, xs: [1, 2, 3, 4, 5, 6], ys: [2, 1.5, 2.5, 3, 3, 4.5], m: 0.5, p: 1 };

export const TERMINALE_END_INTROS: Record<string, Intro> = {
  // ───────────── Statistique à deux variables ─────────────
  'tv-mean-point': {
    goal: t('Règle la droite pour qu’elle passe au plus près des six points.', 'Adjust the line so it passes as close as possible to the six points.', 'اضبط المستقيم ليمر بأقرب ما يمكن من النقط.', 'Ajusta la recta para que pase lo más cerca posible de los puntos.'),
    manip: SCATTER,
    lesson: {
      points: [
        t('Une série à deux variables (xᵢ ; yᵢ) se représente par un **nuage de points**.', 'Two-variable data (xᵢ, yᵢ) is shown as a **scatter plot**.', 'تمثل بـ **سحابة نقط**.', 'Se representa con una **nube de puntos**.'),
        t('Le **point moyen** G a pour coordonnées **(x̄ ; ȳ)**, les moyennes des xᵢ et des yᵢ.', 'The **mean point** G is **(x̄, ȳ)**, the means of the xᵢ and of the yᵢ.', '**النقطة المتوسطة** G(x̄ ; ȳ).', '**Punto medio** G(x̄ ; ȳ).'),
      ],
      example: ex(EX, same('(1 ; 4), (2 ; 6), (3 ; 7), (6 ; 11) : G(3 ; 7)')),
    },
  },
  'tv-line': {
    goal: t('Règle m puis p pour rendre la somme des carrés des écarts la plus petite possible.', 'Set m then p to make the sum of squared gaps as small as possible.', 'اجعل مجموع مربعات الفروق أصغر ما يمكن.', 'Minimiza la suma de cuadrados.'),
    manip: SCATTER,
    lesson: {
      points: [
        t('La **droite des moindres carrés** (de y en x) rend minimale la **somme des carrés des écarts verticaux** ; elle passe par **G**.', 'The **least-squares line** (y on x) minimises the **sum of squared vertical gaps**; it goes through **G**.', '**مستقيم المربعات الدنيا** يمر من **G**.', 'La **recta de mínimos cuadrados** pasa por **G**.'),
        t('On l’utilise pour **prévoir** (interpoler) ; extrapoler loin des données est risqué.', 'Use it to **predict** (interpolate); extrapolating far from the data is risky.', 'نستعمله **للتوقع**.', 'Sirve para **predecir**.'),
      ],
      example: ex(EX, same('a = 1,2, G(5 ; 20) : b = 20 − 1,2 × 5 = 14 → y = 1,2x + 14')),
    },
  },
  'tv-correlation': {
    lesson: {
      points: [
        t('Le **coefficient de corrélation r** est entre −1 et 1. **|r| proche de 1** : points presque alignés ; proche de 0 : pas de lien affine.', 'The **correlation coefficient r** is between −1 and 1. **|r| near 1**: nearly aligned; near 0: no linear link.', '**r** بين −1 و 1.', '**r** entre −1 y 1.'),
        t('**Corrélation n’est pas causalité** : un troisième facteur peut expliquer les deux variables.', '**Correlation is not causation**: a third factor may drive both.', '**الارتباط ليس سببية**.', '**Correlación no es causalidad**.'),
      ],
      example: ex(EX, t('r = −0,95 : forte liaison, y diminue quand x augmente.', 'r = −0.95: strong link, y falls as x rises.', 'r = −0,95: علاقة قوية.', 'r = −0,95: relación fuerte.')),
    },
  },
  'tv-change': {
    lesson: {
      points: [
        t('Si le nuage est **courbé** (croissance exponentielle), on pose **z = ln y** : le nuage (x ; z) devient presque aligné.', 'If the cloud is **curved** (exponential growth), set **z = ln y**: the (x, z) cloud becomes nearly straight.', 'نضع **z = ln y**.', 'Se pone **z = ln y**.'),
        t('Si z = ax + b, alors **y = e^(ax + b) = eᵇ × e^(ax)**.', 'If z = ax + b then **y = e^(ax + b) = eᵇ × e^(ax)**.', '**y = e^(ax + b)**.', '**y = e^(ax + b)**.'),
      ],
      example: ex(EX, same('z = 0,3x + 1 → y = e^(0,3x + 1) ; x = 5 : y = e^2,5 ≈ 12,18')),
    },
  },
  // ───────────── Arithmétique dans ℤ ─────────────
  'cg-division': {
    lesson: {
      points: [
        t('Pour a ∈ ℤ et b ≥ 1, il existe un unique couple (q ; r) avec **a = bq + r et 0 ≤ r < b**.', 'For a ∈ ℤ and b ≥ 1 there is a unique pair (q, r) with **a = bq + r and 0 ≤ r < b**.', '**a = bq + r و 0 ≤ r < b**.', '**a = bq + r, 0 ≤ r < b**.'),
        t('Pour un a **négatif**, le reste reste **positif** : le quotient est plus petit qu’on ne croit.', 'For a **negative** a the remainder stays **non-negative**: the quotient is lower than you might think.', 'الباقي يبقى **موجبًا**.', 'El resto sigue **positivo**.'),
      ],
      example: ex(EX, same('−17 = 5 × (−4) + 3 (et non 5 × (−3) − 2)')),
    },
  },
  'cg-mod': {
    goal: t('Horloge à 7 cases : pars de 0 et avance de 3 à chaque fois, 7 fois. Quels restes obtiens-tu ?', '7-hour clock: start at 0 and move on 3 each time, 7 times. Which remainders do you get?', 'ساعة من 7 خانات: تقدم بـ 3.', 'Reloj de 7: avanza de 3 en 3.'),
    manip: { kind: 'clock', n: 7, start: 0, step: 3, op: 'add', turns: 7 },
    lesson: {
      points: [
        t('**a ≡ b [n]** (a congru à b modulo n) ⇔ a et b ont le **même reste** dans la division par n ⇔ **n divise a − b**.', '**a ≡ b (mod n)** ⇔ a and b have the **same remainder** mod n ⇔ **n divides a − b**.', '**a ≡ b [n]** ⇔ **n يقسم a − b**.', '**a ≡ b [n]** ⇔ **n divide a − b**.'),
        t('On peut **additionner et multiplier** des congruences membre à membre.', 'You can **add and multiply** congruences side by side.', 'يمكن **جمع وضرب** الموافقات.', 'Se pueden **sumar y multiplicar**.'),
      ],
      example: ex(EX, same('2026 = 7 × 289 + 3 → 2026 ≡ 3 [7]')),
    },
  },
  'cg-powers': {
    goal: t('Horloge à 5 cases : pars de 3 et multiplie par 3 jusqu’à revenir à 3.', '5-hour clock: start at 3 and multiply by 3 until you are back at 3.', 'ساعة من 5 خانات: اضرب في 3.', 'Reloj de 5: multiplica por 3.'),
    manip: { kind: 'clock', n: 5, start: 3, step: 3, op: 'mul', turns: 4 },
    lesson: {
      points: [
        t('Si **a ≡ b [n]**, alors **aᵏ ≡ bᵏ [n]** : on réduit avant d’élever à la puissance.', 'If **a ≡ b (mod n)**, then **aᵏ ≡ bᵏ (mod n)**: reduce before raising to a power.', '**aᵏ ≡ bᵏ [n]**.', '**aᵏ ≡ bᵏ [n]**.'),
        t('Les restes des puissances sont **périodiques** : si **aᵖ ≡ 1**, on divise l’exposant par p et on garde le reste.', 'Remainders of powers are **periodic**: if **aᵖ ≡ 1**, divide the exponent by p and keep the remainder.', 'البواقي **دورية**.', 'Los restos son **periódicos**.'),
      ],
      example: ex(EX, same('3⁴ ≡ 1 [5] ; 2026 = 4 × 506 + 2 → 3²⁰²⁶ ≡ 3² ≡ 4 [5]')),
    },
  },
  'cg-gcd': {
    goal: t('Applique l’algorithme d’Euclide à 252 et 198.', 'Run Euclid’s algorithm on 252 and 198.', 'طبق خوارزمية إقليدس على 252 و 198.', 'Aplica Euclides a 252 y 198.'),
    manip: { kind: 'euclid', a: 252, b: 198 },
    lesson: {
      points: [
        t('**Algorithme d’Euclide** : PGCD(a ; b) = PGCD(b ; r) où r est le reste de a ÷ b ; le **dernier reste non nul** est le PGCD.', '**Euclid’s algorithm**: gcd(a, b) = gcd(b, r), r the remainder of a ÷ b; the **last non-zero remainder** is the gcd.', '**آخر باقٍ غير منعدم** هو PGCD.', 'El **último resto no nulo** es el MCD.'),
        t('**Bézout** : a et b sont premiers entre eux ⇔ il existe u, v avec **au + bv = 1**. **Gauss** : si a | bc et PGCD(a ; b) = 1, alors a | c.', '**Bézout**: a, b coprime ⇔ **au + bv = 1** for some u, v. **Gauss**: if a | bc and gcd(a, b) = 1 then a | c.', '**بوزو** و**غوص**.', '**Bézout** y **Gauss**.'),
      ],
      example: ex(EX, same('252 = 198 × 1 + 54 ; 198 = 54 × 3 + 36 ; 54 = 36 + 18 ; 36 = 18 × 2 → PGCD = 18')),
    },
  },
  // ───────────── Structures algébriques ─────────────
  'st-law': {
    lesson: {
      points: [
        t('Une **loi de composition interne** * sur E associe à deux éléments de E un élément **de E**.', 'A **binary operation** * on E combines two elements of E into an element **of E**.', '**قانون تركيب داخلي** يعطي عنصرًا **من E**.', 'Una **ley interna** da un elemento **de E**.'),
        t('Propriétés à tester : **commutative** (x * y = y * x), **associative**, **élément neutre** e (x * e = e * x = x).', 'Properties to test: **commutative**, **associative**, **identity** e (x * e = e * x = x).', '**تبادلي**، **تجميعي**، **محايد**.', '**Conmutativa**, **asociativa**, **neutro**.'),
      ],
      example: ex(EX, same('x * y = x + y − xy : 2 * 3 = 5 − 6 = −1 ; neutre 0')),
    },
  },
  'st-neutral': {
    lesson: {
      points: [
        t('Le **symétrique** x′ de x vérifie **x * x′ = x′ * x = e** (le neutre).', 'The **inverse** x′ of x satisfies **x * x′ = x′ * x = e** (the identity).', '**المماثل**: x * x′ = e.', '**Simétrico**: x * x′ = e.'),
        t('(G, *) est un **groupe** si * est interne, associative, a un neutre, et si tout élément a un symétrique.', '(G, *) is a **group** if * is internal, associative, has an identity, and every element has an inverse.', '**الزمرة**: تجميعي، محايد، مماثل.', '**Grupo**: asociativa, neutro, simétricos.'),
      ],
      example: ex(EX, same('x * y = x + y + 2 sur ℤ : neutre −2, symétrique de 5 : −9')),
    },
  },
  'st-group': {
    goal: t('Table de multiplication de ℤ/7ℤ : dans chaque ligne, touche la case qui vaut 1.', 'Multiplication table of ℤ/7ℤ: in each row, tap the cell equal to 1.', 'المس الخانة 1 في كل سطر.', 'Toca la casilla 1 de cada fila.'),
    manip: { kind: 'cayley', n: 7, goal: 'inverses' },
    lesson: {
      points: [
        t('Dans **ℤ/nℤ**, on calcule avec les restes modulo n. Un élément a est **inversible** s’il existe b avec **a × b ≡ 1**.', 'In **ℤ/nℤ** you work with remainders mod n. a is **invertible** if some b has **a × b ≡ 1**.', 'a **قابل للقلب** إذا a × b ≡ 1.', 'a es **invertible** si a × b ≡ 1.'),
        t('a est inversible dans ℤ/nℤ ⇔ **PGCD(a ; n) = 1**. Si **p est premier**, (ℤ/pℤ*, ×) est un **groupe**.', 'a is invertible in ℤ/nℤ ⇔ **gcd(a, n) = 1**. If **p is prime**, (ℤ/pℤ*, ×) is a **group**.', 'إذا كان **p أوليًا** فهي **زمرة**.', 'Si **p es primo**, es un **grupo**.'),
      ],
      example: ex(EX, same('Dans ℤ/7ℤ : 3 × 5 = 15 ≡ 1 → 3⁻¹ = 5')),
    },
  },
  'st-ring': {
    goal: t('Table de multiplication de ℤ/6ℤ : touche toutes les cases qui valent 0.', 'Multiplication table of ℤ/6ℤ: tap every cell equal to 0.', 'المس كل خانة 0 في ℤ/6ℤ.', 'Toca todas las casillas 0 de ℤ/6ℤ.'),
    manip: { kind: 'cayley', n: 6, goal: 'zero-divisors' },
    lesson: {
      points: [
        t('Un **anneau** (A, +, ×) : (A, +) groupe commutatif, × associative et distributive. Un **corps** : en plus, tout élément non nul est inversible.', 'A **ring** (A, +, ×): (A, +) a commutative group, × associative and distributive. A **field**: also every non-zero element is invertible.', '**الحلقة** و**الحقل**.', '**Anillo** y **cuerpo**.'),
        t('**ℤ/nℤ est un corps ⇔ n est premier.** Sinon, il a des **diviseurs de zéro** (a × b ≡ 0 avec a, b ≢ 0).', '**ℤ/nℤ is a field ⇔ n is prime.** Otherwise it has **zero divisors** (a × b ≡ 0 with a, b ≢ 0).', '**ℤ/nℤ حقل ⇔ n أولي**.', '**ℤ/nℤ es cuerpo ⇔ n primo**.'),
      ],
      example: ex(EX, same('Dans ℤ/6ℤ : 2 × 3 ≡ 0 → pas un corps')),
    },
  },
};
