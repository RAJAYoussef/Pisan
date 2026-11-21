// Introductions de 1ère (1ère Bac au Maroc, Grade 11 aux États-Unis) : second degré, exponentielle,
// produit scalaire, trigonométrie. Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const same = (s: string) => t(s, s, s, s);
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const PREMIERE_INTROS: Record<string, Intro> = {
  // ───────────── Second degré ─────────────
  'quad-canonical': {
    goal: t('Range x² + 6x + 9 en un carré (x + k)² : quelle valeur de k ?', 'Arrange x² + 6x + 9 into a square (x + k)²: which k?', 'رتّب x² + 6x + 9 في مربع (x + k)².', 'Ordena x² + 6x + 9 en un cuadrado (x + k)².'),
    manip: { kind: 'square-build', b: 6, c: 9 },
    lesson: {
      points: [
        t('Tout trinôme ax² + bx + c s’écrit sous **forme canonique** a(x − α)² + β, avec **α = −b ÷ 2a** et **β = f(α)**.', 'Every quadratic ax² + bx + c can be written in **vertex form** a(x − α)² + β, with **α = −b ÷ 2a** and **β = f(α)**.', 'الشكل النموذجي a(x − α)² + β مع **α = −b ÷ 2a** و **β = f(α)**.', 'Forma canónica a(x − α)² + β, con **α = −b ÷ 2a** y **β = f(α)**.'),
        t('Le **sommet** de la parabole est S(α ; β) : un **minimum** si a > 0, un **maximum** si a < 0.', 'The **vertex** is S(α, β): a **minimum** if a > 0, a **maximum** if a < 0.', '**الرأس** S(α ; β): قيمة دنيا إذا a > 0.', 'El **vértice** S(α ; β): mínimo si a > 0.'),
        t('On complète le carré : x² + 6x = (x + 3)² − 9.', 'Complete the square: x² + 6x = (x + 3)² − 9.', 'نكمل المربع: x² + 6x = (x + 3)² − 9.', 'Completa el cuadrado: x² + 6x = (x + 3)² − 9.'),
      ],
      example: ex(EX, same('x² + 6x + 5 = (x + 3)² − 9 + 5 = (x + 3)² − 4'), t('sommet (−3 ; −4), minimum −4', 'vertex (−3, −4), minimum −4', 'الرأس (−3 ; −4)', 'vértice (−3 ; −4)')),
    },
  },
  'quad-discriminant': {
    goal: t('Monte et descends la parabole y = x² − 2x + c : trouve une position à 2, à 1 et à 0 point sur l’axe.', 'Move the parabola y = x² − 2x + c up and down: find positions with 2, 1 and 0 points on the axis.', 'حرّك الشلجم: جد 2 ثم 1 ثم 0 نقطة على المحور.', 'Mueve la parábola: 2, 1 y 0 puntos en el eje.'),
    manip: { kind: 'parabola', b: -2, c: -3 },
    lesson: {
      points: [
        t('Le **discriminant** de ax² + bx + c est **Δ = b² − 4ac**.', 'The **discriminant** of ax² + bx + c is **Δ = b² − 4ac**.', '**المميز** Δ = b² − 4ac.', 'El **discriminante** es **Δ = b² − 4ac**.'),
        t('**Δ > 0** : deux solutions **x = (−b ± √Δ) ÷ 2a**. **Δ = 0** : une seule, x = −b ÷ 2a. **Δ < 0** : aucune solution réelle.', '**Δ > 0**: two solutions **x = (−b ± √Δ) ÷ 2a**. **Δ = 0**: one, x = −b ÷ 2a. **Δ < 0**: no real solution.', '**Δ > 0**: حلان. **Δ = 0**: حل واحد. **Δ < 0**: لا حل.', '**Δ > 0**: dos. **Δ = 0**: una. **Δ < 0**: ninguna.'),
      ],
      example: ex(EX, same('x² − 2x − 3 : Δ = 4 + 12 = 16, √Δ = 4'), same('x₁ = (2 − 4) ÷ 2 = −1 ; x₂ = (2 + 4) ÷ 2 = 3')),
    },
  },
  'quad-factor': {
    lesson: {
      points: [
        t('Si le trinôme a deux racines x₁ et x₂ : **ax² + bx + c = a(x − x₁)(x − x₂)**. Le coefficient a reste **devant**.', 'If the quadratic has two roots x₁ and x₂: **ax² + bx + c = a(x − x₁)(x − x₂)**. Keep a **in front**.', '**ax² + bx + c = a(x − x₁)(x − x₂)**.', '**ax² + bx + c = a(x − x₁)(x − x₂)**.'),
        t('Contrôle rapide : **x₁ + x₂ = −b/a** et **x₁ × x₂ = c/a**.', 'Quick check: **x₁ + x₂ = −b/a** and **x₁ × x₂ = c/a**.', 'تحقق: **x₁ + x₂ = −b/a** و **x₁ × x₂ = c/a**.', 'Comprueba: **x₁ + x₂ = −b/a**, **x₁ × x₂ = c/a**.'),
      ],
      example: ex(EX, same('2x² − 2x − 12, racines −2 et 3'), same('= 2(x + 2)(x − 3) ; −2 + 3 = 1 = −(−2) ÷ 2 ✓')),
    },
  },
  'quad-sign': {
    goal: t('(x + 1)(x − 3) = x² − 2x − 3 : promène x et regarde le signe dans chaque zone.', '(x + 1)(x − 3) = x² − 2x − 3: move x and watch the sign in each zone.', 'لاحظ الإشارة في كل منطقة.', 'Mira el signo en cada zona.'),
    manip: { kind: 'sign-explore', factors: [{ a: 1, b: 1 }, { a: 1, b: -3 }] },
    lesson: {
      points: [
        t('Un trinôme a **le signe de a à l’extérieur des racines**, et le signe **contraire entre** les racines.', 'A quadratic has **the sign of a outside the roots**, and the **opposite sign between** them.', '**إشارة a خارج الجذرين** وعكسها بينهما.', '**Signo de a fuera de las raíces**, contrario entre ellas.'),
        t('Si Δ < 0, il garde **toujours le signe de a**. Si Δ = 0, aussi, sauf en sa racine où il vaut 0.', 'If Δ < 0, it **always has the sign of a**. If Δ = 0, too, except at its root where it is 0.', 'إذا Δ < 0: **دائمًا إشارة a**.', 'Si Δ < 0: **siempre el signo de a**.'),
      ],
      example: ex(EX, same('−x² + x + 6 = −(x + 2)(x − 3), a < 0'), t('positif sur ]−2 ; 3[, négatif ailleurs', 'positive on (−2, 3), negative elsewhere', 'موجب على ]−2 ; 3[', 'positivo en ]−2 ; 3[')),
    },
  },
  // ───────────── Exponentielle ─────────────
  'exp-rules': {
    lesson: {
      points: [
        t('exp est l’unique fonction égale à sa dérivée avec exp(0) = 1. On note **eˣ**, avec e ≈ 2,718.', 'exp is the only function equal to its derivative with exp(0) = 1. Write **eˣ**, with e ≈ 2.718.', 'exp هي الدالة الوحيدة المساوية لمشتقتها مع exp(0) = 1.', 'exp es la única función igual a su derivada con exp(0) = 1.'),
        t('Elle suit les **règles des puissances** : eᵃ × eᵇ = **eᵃ⁺ᵇ** ; eᵃ ÷ eᵇ = **eᵃ⁻ᵇ** ; (eᵃ)ⁿ = **eⁿᵃ** ; e⁻ᵃ = 1/eᵃ.', 'It follows the **power rules**: eᵃ × eᵇ = **eᵃ⁺ᵇ**; eᵃ ÷ eᵇ = **eᵃ⁻ᵇ**; (eᵃ)ⁿ = **eⁿᵃ**; e⁻ᵃ = 1/eᵃ.', '**قواعد القوى**: eᵃ × eᵇ = eᵃ⁺ᵇ.', '**Reglas de potencias**: eᵃ × eᵇ = eᵃ⁺ᵇ.'),
      ],
      example: ex(EX, same('e³ × e⁵ = e⁸ ; (e²)⁴ = e⁸ ; e⁷ ÷ e² = e⁵')),
    },
  },
  'exp-equation': {
    lesson: {
      points: [
        t('eˣ est **toujours strictement positif** : eˣ = −2 n’a pas de solution.', 'eˣ is **always strictly positive**: eˣ = −2 has no solution.', 'eˣ **موجب قطعًا دائمًا**.', 'eˣ es **siempre positivo**.'),
        t('exp est **strictement croissante** : **eᵃ = eᵇ ⇔ a = b** et **eᵃ < eᵇ ⇔ a < b**. On compare les exposants.', 'exp is **strictly increasing**: **eᵃ = eᵇ ⇔ a = b** and **eᵃ < eᵇ ⇔ a < b**. Compare the exponents.', '**eᵃ = eᵇ ⇔ a = b** و **eᵃ < eᵇ ⇔ a < b**.', '**eᵃ = eᵇ ⇔ a = b**, **eᵃ < eᵇ ⇔ a < b**.'),
      ],
      example: ex(EX, same('e^(3x + 1) = e^(2x + 4) ⇔ 3x + 1 = 2x + 4 ⇔ x = 3'), same('eˣ > e² ⇔ x > 2')),
    },
  },
  'exp-derivative': {
    goal: t('Promène le point sur la courbe de eˣ : compare la valeur et la pente de la tangente.', 'Move the point along y = eˣ: compare the value and the slope of the tangent.', 'قارن القيمة وميل المماس.', 'Compara el valor y la pendiente.'),
    manip: { kind: 'curve-explore', fns: ['exp'] },
    lesson: {
      points: [
        t('**(eˣ)′ = eˣ** : en chaque point, la pente de la tangente est égale à la valeur.', '**(eˣ)′ = eˣ**: at each point, the tangent’s slope equals the value.', '**(eˣ)′ = eˣ**.', '**(eˣ)′ = eˣ**.'),
        t('Plus généralement **(e^(kx))′ = k e^(kx)** ; comme e^(kx) > 0, la fonction croît si k > 0 et décroît si k < 0.', 'More generally **(e^(kx))′ = k e^(kx)**; since e^(kx) > 0, it increases if k > 0 and decreases if k < 0.', '**(e^(kx))′ = k e^(kx)**.', '**(e^(kx))′ = k e^(kx)**.'),
      ],
      example: ex(EX, same('f(x) = 3eˣ − 2x → f′(x) = 3eˣ − 2, f′(0) = 1'), same('(e^(−x))′ = −e^(−x) < 0')),
    },
  },
  'exp-growth': {
    goal: t('Une quantité augmente de 50 % à chaque étape : construis les premiers termes.', 'A quantity grows by 50% each step: build the first terms.', 'كمية تزداد بـ 50 % في كل مرحلة.', 'Una cantidad crece un 50 % cada paso.'),
    manip: { kind: 'sequence', u0: 100, a: 1.5, b: 0, n: 5 },
    lesson: {
      points: [
        t('Augmenter de t % revient à **multiplier par 1 + t/100** ; diminuer de t %, par 1 − t/100.', 'Increasing by t% means **multiplying by 1 + t/100**; decreasing by t%, by 1 − t/100.', 'الزيادة بـ t % = **الضرب في 1 + t/100**.', 'Aumentar un t % = **multiplicar por 1 + t/100**.'),
        t('Répéter la même multiplication donne une **suite géométrique** uₙ = u₀ × qⁿ : c’est la **croissance exponentielle**, de plus en plus rapide.', 'Repeating the same multiplication gives a **geometric sequence** uₙ = u₀ × qⁿ: **exponential growth**, faster and faster.', '**متتالية هندسية** uₙ = u₀ × qⁿ.', '**Sucesión geométrica** uₙ = u₀ × qⁿ.'),
      ],
      example: ex(EX, same('+5 % par an sur 200 : 200 × 1,05² = 220,5')),
    },
  },
  // ───────────── Produit scalaire ─────────────
  'dot-coords': {
    lesson: {
      points: [
        t('Dans un repère orthonormé, u(x ; y) · v(x′ ; y′) = **xx′ + yy′**. Le résultat est un **nombre**, pas un vecteur.', 'In an orthonormal frame, u(x, y) · v(x′, y′) = **xx′ + yy′**. The result is a **number**, not a vector.', 'u · v = **xx′ + yy′**: عدد وليس متجهة.', 'u · v = **xx′ + yy′**: un **número**.'),
        t('**u · v = 0 ⇔ u et v sont orthogonaux.** Et u · u = ‖u‖².', '**u · v = 0 ⇔ u and v are orthogonal.** And u · u = ‖u‖².', '**u · v = 0 ⇔ متعامدتان.**', '**u · v = 0 ⇔ ortogonales.**'),
      ],
      example: ex(EX, same('u(2 ; 3) · v(−3 ; 2) = −6 + 6 = 0 → orthogonaux')),
    },
  },
  'dot-norm': {
    goal: t('Ouvre l’angle entre u et v : trouve un angle aigu, un angle droit et un angle obtus.', 'Open the angle between u and v: find an acute, a right and an obtuse angle.', 'جد زاوية حادة وقائمة ومنفرجة.', 'Halla un ángulo agudo, recto y obtuso.'),
    manip: { kind: 'dot-rotate', u: 4, v: 3 },
    lesson: {
      points: [
        t('**u · v = ‖u‖ × ‖v‖ × cos θ**, où θ est l’angle entre u et v.', '**u · v = ‖u‖ × ‖v‖ × cos θ**, where θ is the angle between u and v.', '**u · v = ‖u‖ × ‖v‖ × cos θ**.', '**u · v = ‖u‖ × ‖v‖ × cos θ**.'),
        t('Son **signe** est celui de cos θ : positif si θ aigu, **nul si θ droit**, négatif si θ obtus.', 'Its **sign** is that of cos θ: positive if acute, **zero if right**, negative if obtuse.', 'إشارته إشارة cos θ.', 'Su signo es el de cos θ.'),
      ],
      example: ex(EX, same('‖u‖ = 4, ‖v‖ = 3, θ = 60° : u · v = 4 × 3 × 0,5 = 6')),
    },
  },
  'dot-orthogonal': {
    goal: t('Fais tourner v jusqu’à rendre le produit scalaire nul.', 'Turn v until the dot product is zero.', 'أدر v حتى ينعدم الجداء السلمي.', 'Gira v hasta que el producto sea nulo.'),
    manip: { kind: 'dot-rotate', u: 3, v: 4 },
    lesson: {
      points: [
        t('Pour trouver un paramètre qui rend deux vecteurs orthogonaux : on écrit **u · v = 0** et on résout.', 'To find a parameter making two vectors orthogonal: write **u · v = 0** and solve.', 'نكتب **u · v = 0** ونحل.', 'Escribe **u · v = 0** y resuelve.'),
        t('AB · AC = 0 ⇔ (AB) ⊥ (AC) : le triangle ABC est **rectangle en A**.', 'AB · AC = 0 ⇔ (AB) ⊥ (AC): triangle ABC is **right-angled at A**.', 'المثلث **قائم في A**.', 'El triángulo es **rectángulo en A**.'),
      ],
      example: ex(EX, same('u(2 ; m) · v(3 ; −6) = 6 − 6m = 0 ⇔ m = 1')),
    },
  },
  'dot-alkashi': {
    lesson: {
      points: [
        t('**Al-Kashi** : dans tout triangle, **BC² = AB² + AC² − 2 × AB × AC × cos Â**.', '**Law of cosines**: in any triangle, **BC² = AB² + AC² − 2 × AB × AC × cos A**.', '**الكاشي**: BC² = AB² + AC² − 2 AB·AC cos A.', '**Teorema del coseno**: BC² = AB² + AC² − 2 AB·AC cos A.'),
        t('Si Â = 90°, cos Â = 0 : on retrouve **Pythagore**.', 'If A = 90°, cos A = 0: you get **Pythagoras** back.', 'إذا كانت Â قائمة نجد **فيثاغورس**.', 'Si Â = 90°, es **Pitágoras**.'),
      ],
      example: ex(EX, same('AB = 5, AC = 8, Â = 60° : BC² = 25 + 64 − 40 = 49, BC = 7')),
    },
  },
  // ───────────── Trigonométrie ─────────────
  'trig-associated': {
    goal: t('Fais tourner M jusqu’à 150° = 5π/6 et compare avec 30° = π/6.', 'Turn M to 150° = 5π/6 and compare with 30° = π/6.', 'أدر M حتى 150° وقارن مع 30°.', 'Gira M hasta 150° y compara con 30°.'),
    manip: { kind: 'unit-circle', target: 150, step: 30 },
    lesson: {
      points: [
        t('Symétrie d’axe vertical (π − x) : **cos(π − x) = −cos x**, **sin(π − x) = sin x**.', 'Reflection in the vertical axis (π − x): **cos(π − x) = −cos x**, **sin(π − x) = sin x**.', '**cos(π − x) = −cos x**، **sin(π − x) = sin x**.', '**cos(π − x) = −cos x**, **sen(π − x) = sen x**.'),
        t('Symétrie d’axe horizontal (−x) : **cos(−x) = cos x**, **sin(−x) = −sin x**.', 'Reflection in the horizontal axis (−x): **cos(−x) = cos x**, **sin(−x) = −sin x**.', '**cos(−x) = cos x**، **sin(−x) = −sin x**.', '**cos(−x) = cos x**, **sen(−x) = −sen x**.'),
      ],
      example: ex(EX, same('cos(5π/6) = −cos(π/6) = −√3/2 ; sin(5π/6) = 1/2')),
    },
  },
  'trig-equation': {
    goal: t('Fais tourner M : trouve tous les angles dont le cosinus vaut 1/2.', 'Turn M: find every angle whose cosine is 1/2.', 'جد كل الزوايا التي جيب تمامها 1/2.', 'Halla los ángulos con coseno 1/2.'),
    manip: { kind: 'unit-circle', target: 0, step: 30, cosLevel: 0.5 },
    lesson: {
      points: [
        t('**cos x = cos a** : les points ont la même abscisse → **x = a ou x = −a** (à 2π près).', '**cos x = cos a**: same x-coordinate → **x = a or x = −a** (up to 2π).', '**cos x = cos a ⇔ x = a أو x = −a**.', '**cos x = cos a ⇔ x = a o x = −a**.'),
        t('**sin x = sin a** : même ordonnée → **x = a ou x = π − a** (à 2π près).', '**sin x = sin a**: same y-coordinate → **x = a or x = π − a** (up to 2π).', '**sin x = sin a ⇔ x = a أو x = π − a**.', '**sen x = sen a ⇔ x = a o x = π − a**.'),
      ],
      example: ex(EX, same('cos x = 1/2 sur ]−π ; π] : x = −π/3 ou x = π/3')),
    },
  },
  'trig-measure': {
    goal: t('Fais tourner M jusqu’à 330° : quel autre angle, plus court, arrive au même point ?', 'Turn M to 330°: which shorter angle reaches the same point?', 'أدر M حتى 330°: أي زاوية أقصر تصل إلى نفس النقطة؟', 'Gira M hasta 330°: ¿qué ángulo más corto llega al mismo punto?'),
    manip: { kind: 'unit-circle', target: 330, step: 30 },
    lesson: {
      points: [
        t('Ajouter ou enlever **un tour (2π)** ramène au même point du cercle : x et x + 2kπ ont la même image.', 'Adding or removing **a full turn (2π)** brings you to the same point: x and x + 2kπ share their point.', 'إضافة **دورة (2π)** تعيد إلى نفس النقطة.', 'Sumar **una vuelta (2π)** lleva al mismo punto.'),
        t('La **mesure principale** est celle qui tombe dans **]−π ; π]**.', 'The **principal measure** is the one in **(−π, π]**.', '**القياس الرئيسي** في ]−π ; π].', 'La **medida principal** está en **]−π ; π]**.'),
      ],
      example: ex(EX, same('17π/6 − 2π = 5π/6 ; 11π/6 − 2π = −π/6')),
    },
  },
  'trig-functions': {
    lesson: {
      points: [
        t('cos et sin sont **2π-périodiques** : cos(x + 2π) = cos x. Leur courbe se répète tous les 2π.', 'cos and sin are **2π-periodic**: cos(x + 2π) = cos x. Their graphs repeat every 2π.', 'دوريتان دورهما **2π**.', '**2π-periódicas**.'),
        t('**cos est paire** (courbe symétrique par rapport à l’axe des ordonnées) ; **sin est impaire** (symétrique par rapport à l’origine).', '**cos is even** (graph symmetric in the y-axis); **sin is odd** (symmetric about the origin).', '**cos زوجية** و**sin فردية**.', '**cos es par**, **sen es impar**.'),
      ],
      example: ex(EX, same('cos(2026π) = cos 0 = 1 ; sin(−π/2) = −1')),
    },
  },
};
