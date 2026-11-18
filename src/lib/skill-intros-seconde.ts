// Introductions de 2nde (Tronc commun au Maroc, Grade 10 aux États-Unis) : intervalles, fonctions de
// référence, tableaux de signes, équations de droites, quartiles, probabilités, cercle trigonométrique.
// Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const same = (s: string) => t(s, s, s, s);
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const SECONDE_INTROS: Record<string, Intro> = {
  // ───────────── Intervalles et valeur absolue ─────────────
  'int-notation': {
    goal: t('Promène x sur la droite : passe par −2, par 3 et entre les deux. Lesquels sont dans [−2 ; 3[ ?', 'Move x along the line: try −2, 3 and in between. Which are in [−2, 3)?', 'حرّك x: جرّب −2 و 3 وما بينهما.', 'Mueve x: prueba −2, 3 y entre ambos.'),
    manip: { kind: 'interval', a: -2, b: 3, closedA: true, closedB: false },
    lesson: {
      points: [
        t('[a ; b] est l’ensemble des réels x tels que **a ≤ x ≤ b** : tous les nombres entre a et b, pas seulement les entiers.', '[a, b] is the set of real numbers x with **a ≤ x ≤ b**: every number between a and b, not just whole ones.', '[a ; b] مجموعة الأعداد x بحيث **a ≤ x ≤ b**.', '[a ; b] son los reales con **a ≤ x ≤ b**.'),
        t('Crochet **tourné vers le nombre** : borne **comprise** (≤). Crochet **tourné vers l’extérieur** : borne **exclue** (<). Du côté de l’infini, toujours ouvert : [2 ; +∞[.', 'Bracket **facing the number**: end **included** (≤). Facing away (or a round bracket): end **excluded** (<). Infinity is always open.', 'القوس **نحو العدد**: الحد **مشمول**. **نحو الخارج**: **مستثنى**. اللانهاية دائمًا مفتوحة.', 'Corchete **hacia el número**: **incluido**. **Hacia fuera**: **excluido**. El infinito siempre abierto.'),
      ],
      example: ex(EX, same('x ∈ [−2 ; 3[ ⇔ −2 ≤ x < 3'), same('x > 5 ⇔ x ∈ ]5 ; +∞[')),
    },
  },
  'int-union': {
    goal: t('Promène x : trouve un nombre seulement dans A, un seulement dans B, et un dans les deux.', 'Move x: find a number only in A, one only in B, and one in both.', 'جد عددًا في A فقط، وفي B فقط، وفي الاثنين.', 'Halla un número solo en A, solo en B y en ambos.'),
    manip: { kind: 'interval', a: -3, b: 2, closedA: true, closedB: true, other: { a: 0, b: 4 } },
    lesson: {
      points: [
        t('**A ∩ B** (« A **inter** B ») : les nombres qui sont dans A **et** dans B, là où les intervalles se **chevauchent**.', '**A ∩ B** (“A **intersect** B”): numbers in A **and** in B, where the intervals **overlap**.', '**A ∩ B**: الأعداد في A **و** B.', '**A ∩ B**: en A **y** en B.'),
        t('**A ∪ B** (« A **union** B ») : les nombres qui sont dans A **ou** dans B (ou les deux).', '**A ∪ B** (“A **union** B”): numbers in A **or** B (or both).', '**A ∪ B**: في A **أو** B.', '**A ∪ B**: en A **o** en B.'),
        t('Dessine toujours les deux intervalles sur une même droite graduée avant de conclure.', 'Always draw both intervals on one number line before concluding.', 'ارسم المجالين على نفس المستقيم.', 'Dibuja ambos en la misma recta.'),
      ],
      example: ex(EX, same('[−3 ; 2] ∩ [0 ; 4] = [0 ; 2]'), same('[−3 ; 2] ∪ [0 ; 4] = [−3 ; 4]')),
    },
  },
  'int-abs': {
    goal: t('Promène x et regarde |x − 2| : quels nombres sont à distance au plus 3 de 2 ?', 'Move x and watch |x − 2|: which numbers are within 3 of 2?', 'حرّك x ولاحظ |x − 2|.', 'Mueve x y mira |x − 2|.'),
    manip: { kind: 'interval', a: -1, b: 5, closedA: true, closedB: true, center: 2 },
    lesson: {
      points: [
        t('|a| est la **distance** entre a et 0 : |−5| = 5, |5| = 5. Une valeur absolue est toujours **positive**.', '|a| is the **distance** from a to 0: |−5| = 5, |5| = 5. Always **non-negative**.', '|a| هي **المسافة** بين a و 0.', '|a| es la **distancia** de a a 0.'),
        t('|a − b| est la **distance entre a et b** sur la droite graduée.', '|a − b| is the **distance between a and b** on the number line.', '|a − b| هي **المسافة بين a و b**.', '|a − b| es la **distancia entre a y b**.'),
        t('|x − c| ≤ r ⇔ x ∈ **[c − r ; c + r]** : l’intervalle de **centre c** et de **rayon r**.', '|x − c| ≤ r ⇔ x ∈ **[c − r, c + r]**: the interval with **centre c** and **radius r**.', '|x − c| ≤ r ⇔ x ∈ **[c − r ; c + r]**.', '|x − c| ≤ r ⇔ x ∈ **[c − r ; c + r]**.'),
      ],
      example: ex(EX, same('|3 − (−4)| = |7| = 7'), same('|x − 2| ≤ 3 ⇔ −1 ≤ x ≤ 5')),
    },
  },
  'int-sets': {
    lesson: {
      points: [
        t('**ℕ** entiers naturels (0, 1, 2…) ⊂ **ℤ** entiers relatifs (−3…) ⊂ **𝔻** décimaux (2,75) ⊂ **ℚ** rationnels (1/3) ⊂ **ℝ** réels.', '**ℕ** naturals (0, 1, 2…) ⊂ **ℤ** integers (−3…) ⊂ **𝔻** decimals (2.75) ⊂ **ℚ** rationals (1/3) ⊂ **ℝ** reals.', '**ℕ** ⊂ **ℤ** ⊂ **𝔻** ⊂ **ℚ** ⊂ **ℝ**.', '**ℕ** ⊂ **ℤ** ⊂ **𝔻** ⊂ **ℚ** ⊂ **ℝ**.'),
        t('1/3 = 0,333… n’est **pas décimal** (écriture infinie) mais il est **rationnel**. √2 et π ne sont **pas rationnels** : ils sont seulement réels.', '1/3 = 0.333… is **not a decimal** (it never ends) but it is **rational**. √2 and π are **not rational**: only real.', '1/3 ليس عشريًا لكنه جذري. √2 و π ليسا جذريين.', '1/3 no es decimal pero sí racional. √2 y π no son racionales.'),
        t('Simplifie d’abord : √9 = 3 est un entier naturel, 12/4 = 3 aussi.', 'Simplify first: √9 = 3 is a natural number, so is 12/4.', 'بسّط أولًا: √9 = 3.', 'Simplifica: √9 = 3.'),
      ],
      example: ex(EX, t('−7 ∈ ℤ ; 2,5 ∈ 𝔻 ; 2/7 ∈ ℚ ; √2 ∈ ℝ', '−7 ∈ ℤ; 2.5 ∈ 𝔻; 2/7 ∈ ℚ; √2 ∈ ℝ', '−7 ∈ ℤ ; 2,5 ∈ 𝔻 ; 2/7 ∈ ℚ ; √2 ∈ ℝ', '−7 ∈ ℤ ; 2,5 ∈ 𝔻 ; 2/7 ∈ ℚ ; √2 ∈ ℝ')),
    },
  },
  // ───────────── Fonctions de référence ─────────────
  'fn-image': {
    goal: t('f(x) = x². Promène x et trouve tous les nombres dont l’image vaut 4.', 'f(x) = x². Move x and find every number whose image is 4.', 'f(x) = x². جد كل الأعداد التي صورتها 4.', 'f(x) = x². Halla todos los números con imagen 4.'),
    manip: { kind: 'curve-explore', fns: ['square'], target: 4 },
    lesson: {
      points: [
        t('Une fonction f associe à chaque nombre x **une seule image** f(x). On la calcule en **remplaçant x** par sa valeur (avec des parenthèses).', 'A function f gives each x **exactly one image** f(x). Compute it by **substituting** (use brackets).', 'الدالة تربط كل x **بصورة واحدة** f(x).', 'Una función da a cada x **una sola imagen** f(x).'),
        t('Un **antécédent** de k est un x tel que **f(x) = k** : on résout une équation. Il peut y en avoir 0, 1 ou plusieurs.', 'A **pre-image** of k is an x with **f(x) = k**: solve an equation. There can be 0, 1 or several.', '**سابقة** k هي x بحيث **f(x) = k**.', 'Un **antecedente** de k cumple **f(x) = k**.'),
      ],
      example: ex(EX, same('f(x) = x² − 3 : f(−2) = (−2)² − 3 = 1'), t('f(x) = 6 ⇔ x² = 9 ⇔ x = 3 ou x = −3', 'f(x) = 6 ⇔ x² = 9 ⇔ x = 3 or x = −3', 'x = 3 أو x = −3', 'x = 3 o x = −3')),
    },
  },
  'fn-reading': {
    goal: t('Promène le point sur la courbe de gauche à droite : où descend-elle, où remonte-t-elle ?', 'Move the point along the curve left to right: where does it go down, where up?', 'حرّك النقطة على المنحنى: أين ينزل وأين يصعد؟', 'Mueve el punto: ¿dónde baja y dónde sube?'),
    manip: { kind: 'curve-explore', fns: ['parabola'] },
    lesson: {
      points: [
        t('**Image** de a : pars de a sur l’axe des **abscisses**, va jusqu’à la courbe, lis l’**ordonnée**.', '**Image** of a: start at a on the **x-axis**, go to the curve, read the **y-value**.', '**الصورة**: من a على محور الأفاصيل إلى المنحنى ثم الأرتوب.', '**Imagen**: de a en el eje x a la curva, lee la ordenada.'),
        t('**Résoudre f(x) = k** : trace la droite horizontale y = k ; les solutions sont les **abscisses** des points d’intersection.', '**Solve f(x) = k**: draw the horizontal line y = k; the solutions are the **x-values** of the crossing points.', '**حل f(x) = k**: ارسم y = k وخذ الأفاصيل.', '**Resolver f(x) = k**: traza y = k y lee las abscisas.'),
        t('Le **minimum** est l’ordonnée du point le plus **bas** ; le maximum, celle du plus **haut**.', 'The **minimum** is the y-value of the **lowest** point; the maximum, of the **highest**.', '**القيمة الدنيا** أرتوب أدنى نقطة.', 'El **mínimo**: ordenada del punto más bajo.'),
      ],
      example: ex(EX, t('Courbe de f(x) = (x − 1)² − 2 : minimum −2 atteint en x = 1.', 'Curve of f(x) = (x − 1)² − 2: minimum −2 at x = 1.', 'القيمة الدنيا −2 عند x = 1.', 'Mínimo −2 en x = 1.')),
    },
  },
  'fn-variations': {
    lesson: {
      points: [
        t('f est **croissante** sur un intervalle si, quand x augmente, f(x) augmente : **elle conserve l’ordre**.', 'f is **increasing** on an interval if f(x) goes up as x goes up: **it keeps the order**.', 'f **تزايدية** إذا حافظت على الترتيب.', 'f es **creciente** si conserva el orden.'),
        t('f est **décroissante** si, quand x augmente, f(x) diminue : **elle inverse l’ordre**.', 'f is **decreasing** if f(x) goes down as x goes up: **it reverses the order**.', 'f **تناقصية** إذا عكست الترتيب.', 'f es **decreciente** si invierte el orden.'),
        t('Le **tableau de variations** résume tout : des flèches ↗ ↘ et les valeurs aux bornes. Le maximum (ou minimum) se lit au sommet (ou au creux).', 'The **variation table** sums it up: arrows ↗ ↘ and values at the ends. Read the max (or min) at the peak (or dip).', '**جدول التغيرات** يلخص كل شيء.', 'La **tabla de variación** lo resume todo.'),
      ],
      example: ex(EX, t('f croissante sur [0 ; 3] et 1 < 2 donc f(1) < f(2).', 'f increasing on [0, 3] and 1 < 2, so f(1) < f(2).', 'f تزايدية و 1 < 2 إذن f(1) < f(2).', 'f creciente y 1 < 2, luego f(1) < f(2).')),
    },
  },
  'fn-reference': {
    goal: t('Change de fonction et promène x sur chacune : laquelle descend sur ]0 ; +∞[ ?', 'Switch functions and move x on each: which one goes down on (0, +∞)?', 'بدّل الدالة: أيها تتناقص على ]0 ; +∞[؟', 'Cambia de función: ¿cuál baja en ]0 ; +∞[?'),
    manip: { kind: 'curve-explore', fns: ['square', 'inverse', 'sqrt', 'cube'] },
    lesson: {
      points: [
        t('**x ↦ x²** : parabole, décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[. **x ↦ x³** : toujours croissante.', '**x ↦ x²**: parabola, decreasing then increasing. **x ↦ x³**: always increasing.', '**x²**: شلجم. **x³**: تزايدية دائمًا.', '**x²**: parábola. **x³**: siempre creciente.'),
        t('**x ↦ 1/x** : hyperbole, définie pour x ≠ 0, **décroissante** sur ]−∞ ; 0[ et sur ]0 ; +∞[.', '**x ↦ 1/x**: hyperbola, defined for x ≠ 0, **decreasing** on each branch.', '**1/x**: هذلول، تناقصية على كل فرع.', '**1/x**: hipérbola, decreciente en cada rama.'),
        t('**x ↦ √x** : définie pour x ≥ 0, croissante. Entre 0 et 1 : x³ < x² < x < √x.', '**x ↦ √x**: defined for x ≥ 0, increasing. Between 0 and 1: x³ < x² < x < √x.', '**√x**: معرفة لـ x ≥ 0، تزايدية.', '**√x**: definida para x ≥ 0, creciente.'),
      ],
      example: ex(EX, same('0,5² = 0,25 < 0,5 < √0,5 ≈ 0,71'), t('1/0,25 = 4', '1/0.25 = 4', '1/0,25 = 4', '1/0,25 = 4')),
    },
  },
  // ───────────── Tableaux de signes ─────────────
  'sign-affine': {
    goal: t('Promène x : explore les deux côtés de la racine de 2x − 3. Que remarques-tu sur le signe ?', 'Move x: explore both sides of the root of 2x − 3. What about the sign?', 'استكشف جهتي جذر 2x − 3.', 'Explora ambos lados de la raíz de 2x − 3.'),
    manip: { kind: 'sign-explore', factors: [{ a: 2, b: -3 }] },
    lesson: {
      points: [
        t('ax + b s’annule en **x = −b/a** (on résout ax + b = 0).', 'ax + b is zero at **x = −b/a** (solve ax + b = 0).', 'ax + b ينعدم في **x = −b/a**.', 'ax + b se anula en **x = −b/a**.'),
        t('À **droite** de la racine, ax + b a **le signe de a** ; à gauche, le signe contraire.', 'To the **right** of the root, ax + b has **the sign of a**; to the left, the opposite.', 'يمين الجذر **إشارة a**، ويساره عكسها.', 'A la **derecha**, **el signo de a**; a la izquierda, el contrario.'),
      ],
      example: ex(EX, t('−2x + 6 : racine 3, a = −2 < 0 → positif pour x < 3, négatif pour x > 3.', '−2x + 6: root 3, a = −2 < 0 → positive for x < 3, negative for x > 3.', '−2x + 6: موجب قبل 3 وسالب بعده.', '−2x + 6: positivo antes de 3, negativo después.')),
    },
  },
  'sign-product': {
    goal: t('Promène x dans chaque zone et regarde le signe de chaque facteur, puis du produit.', 'Move x through each zone and watch the sign of each factor, then of the product.', 'لاحظ إشارة كل عامل ثم الجداء.', 'Mira el signo de cada factor y del producto.'),
    manip: { kind: 'sign-explore', factors: [{ a: 1, b: 1 }, { a: 1, b: -3 }] },
    lesson: {
      points: [
        t('Un **tableau de signes** : une ligne pour x (racines rangées), une ligne par facteur, une dernière pour le produit.', 'A **sign table**: a row for x (roots in order), one row per factor, a last row for the product.', '**جدول الإشارة**: سطر لـ x وسطر لكل عامل وسطر للجداء.', '**Tabla de signos**: x, cada factor y el producto.'),
        t('Dans chaque colonne, on applique la **règle des signes** ; le produit vaut **0** sur les racines.', 'In each column apply the **sign rule**; the product is **0** at the roots.', 'نطبق **قاعدة الإشارات**؛ الجداء 0 عند الجذور.', 'Aplica la **regla de los signos**; 0 en las raíces.'),
      ],
      example: ex(EX, same('(x + 1)(x − 3) :  +  0  −  0  +'), t('négatif entre −1 et 3, positif ailleurs', 'negative between −1 and 3, positive elsewhere', 'سالب بين −1 و 3', 'negativo entre −1 y 3')),
    },
  },
  'sign-inequality': {
    goal: t('Promène x dans les trois zones : où le produit (x − 1)(x − 4) est-il négatif ?', 'Move x through the three zones: where is (x − 1)(x − 4) negative?', 'أين يكون الجداء سالبًا؟', '¿Dónde es negativo el producto?'),
    manip: { kind: 'sign-explore', factors: [{ a: 1, b: -1 }, { a: 1, b: -4 }] },
    lesson: {
      points: [
        t('Pour résoudre A(x) × B(x) ≤ 0 : on **ne développe pas** ; on fait le tableau de signes et on lit les zones « − ».', 'To solve A(x) × B(x) ≤ 0: **don’t expand**; build the sign table and read the “−” zones.', '**لا ننشر**؛ نقرأ مناطق « − » في الجدول.', '**No desarrolles**: lee las zonas «−».'),
        t('« ≤ » ou « ≥ » : les racines sont **solutions** (crochets fermés). « < » ou « > » : on les **exclut**.', '“≤” or “≥”: the roots **are** solutions (closed brackets). “<” or “>”: **exclude** them.', '« ≤ »: الجذور حلول. « < »: نستثنيها.', '«≤»: raíces incluidas. «<»: excluidas.'),
      ],
      example: ex(EX, same('(x − 1)(x − 4) ≤ 0 ⇔ x ∈ [1 ; 4]'), same('(x − 1)(x − 4) > 0 ⇔ x ∈ ]−∞ ; 1[ ∪ ]4 ; +∞[')),
    },
  },
  'sign-quotient': {
    goal: t('Promène x : le quotient change-t-il de signe aux mêmes endroits qu’un produit ? Que se passe-t-il en x = −1 ?', 'Move x: does the quotient change sign like a product? What happens at x = −1?', 'ماذا يحدث في x = −1؟', '¿Qué pasa en x = −1?'),
    manip: { kind: 'sign-explore', factors: [{ a: 1, b: -2 }, { a: 1, b: 1 }], quotient: true },
    lesson: {
      points: [
        t('Un quotient A/B a **le même signe que le produit** A × B : même tableau de signes.', 'A quotient A/B has **the same sign as the product** A × B: same sign table.', 'الخارج له **نفس إشارة** الجداء.', 'El cociente tiene **el mismo signo** que el producto.'),
        t('Mais on ne divise **jamais par 0** : la racine du dénominateur est une **valeur interdite** (double barre ‖), toujours exclue.', 'But you **never divide by 0**: the root of the denominator is an **excluded value** (double bar ‖), always left out.', 'جذر المقام **قيمة ممنوعة** (‖).', 'La raíz del denominador es un **valor prohibido** (‖).'),
      ],
      example: ex(EX, t('(x − 2)/(x + 1) : valeur interdite −1 ;  +  ‖  −  0  +', '(x − 2)/(x + 1): excluded −1;  +  ‖  −  0  +', 'القيمة الممنوعة −1', 'Valor prohibido −1')),
    },
  },
  // ───────────── Équations de droites ─────────────
  'line-slope': {
    goal: t('Règle m et p pour que ta droite passe par les deux points.', 'Set m and p so your line goes through both points.', 'اضبط m و p ليمر مستقيمك من النقطتين.', 'Ajusta m y p para pasar por los dos puntos.'),
    manip: { kind: 'line-build', m: 1.5, p: -1 },
    lesson: {
      points: [
        t('Une droite non verticale a une équation **y = mx + p** : m est le **coefficient directeur** (la pente), p l’**ordonnée à l’origine**.', 'A non-vertical line has equation **y = mx + p**: m is the **gradient** (slope), p the **y-intercept**.', 'معادلة المستقيم **y = mx + p**.', 'Ecuación **y = mx + p**: m pendiente, p ordenada en el origen.'),
        t('Avec deux points : **m = (y_B − y_A) ÷ (x_B − x_A)**, puis p en remplaçant les coordonnées de A.', 'From two points: **m = (y_B − y_A) ÷ (x_B − x_A)**, then find p by substituting A.', '**m = (y_B − y_A) ÷ (x_B − x_A)** ثم p.', '**m = (y_B − y_A) ÷ (x_B − x_A)**, luego p.'),
      ],
      example: ex(EX, same('A(0 ; −1), B(2 ; 2) : m = 3 ÷ 2 = 1,5'), same('−1 = 1,5 × 0 + p → p = −1 : y = 1,5x − 1')),
    },
  },
  'line-read': {
    goal: t('Superpose ta droite à la droite en pointillés : d’abord p, puis m.', 'Lay your line on the dashed one: first p, then m.', 'طابق المستقيم: p أولًا ثم m.', 'Superpón la recta: primero p, luego m.'),
    manip: { kind: 'line-build', m: -1, p: 2 },
    lesson: {
      points: [
        t('**p** se lit là où la droite coupe l’**axe vertical** (x = 0).', '**p** is where the line crosses the **vertical axis** (x = 0).', '**p** حيث يقطع المستقيم المحور العمودي.', '**p**: corte con el eje vertical.'),
        t('**m** : avance de 1 vers la droite, et compte de combien la droite **monte** (m > 0) ou **descend** (m < 0).', '**m**: step 1 to the right and count how much the line **rises** (m > 0) or **falls** (m < 0).', '**m**: تقدم 1 وعد الصعود أو النزول.', '**m**: avanza 1 y cuenta cuánto sube o baja.'),
      ],
      example: ex(EX, t('Coupe l’axe en 2, descend de 1 par carreau : y = −x + 2.', 'Crosses at 2, falls 1 per square: y = −x + 2.', 'y = −x + 2', 'y = −x + 2')),
    },
  },
  'line-parallel': {
    goal: t('Trace une droite parallèle à la droite en pointillés, mais différente.', 'Draw a line parallel to the dashed one, but different.', 'ارسم مستقيمًا موازيًا ومختلفًا.', 'Traza una paralela distinta.'),
    manip: { kind: 'line-build', m: 2, p: -1, parallel: true },
    lesson: {
      points: [
        t('Deux droites y = mx + p et y = m′x + p′ sont **parallèles** si et seulement si **m = m′**.', 'Two lines y = mx + p and y = m′x + p′ are **parallel** if and only if **m = m′**.', 'متوازيان إذا وفقط إذا **m = m′**.', 'Paralelas si y solo si **m = m′**.'),
        t('Un point est **sur la droite** si ses coordonnées **vérifient l’équation** : on remplace x et on compare à y.', 'A point is **on the line** if its coordinates **satisfy the equation**: substitute x, compare with y.', 'النقطة على المستقيم إذا **حققت المعادلة**.', 'Un punto está en la recta si **cumple la ecuación**.'),
      ],
      example: ex(EX, same('y = 2x − 1 // y = 2x + 3'), t('(2 ; 3) : 2 × 2 − 1 = 3 ✓, sur la droite', '(2, 3): 2 × 2 − 1 = 3 ✓, on the line', '(2 ; 3) على المستقيم', '(2 ; 3) está en la recta')),
    },
  },
  'line-cartesian': {
    lesson: {
      points: [
        t('Toute droite a une **équation cartésienne** ax + by + c = 0. Si b ≠ 0, on isole y pour retrouver y = mx + p, avec **m = −a/b**.', 'Every line has a **Cartesian equation** ax + by + c = 0. If b ≠ 0, isolate y to get y = mx + p, with **m = −a/b**.', 'كل مستقيم له **معادلة ديكارتية** ax + by + c = 0.', 'Toda recta tiene **ecuación cartesiana** ax + by + c = 0.'),
        t('u(−b ; a) est un **vecteur directeur**. Deux vecteurs u(x ; y), v(x′ ; y′) sont **colinéaires** ⇔ **det(u, v) = xy′ − yx′ = 0**.', 'u(−b, a) is a **direction vector**. u(x, y), v(x′, y′) are **collinear** ⇔ **det(u, v) = xy′ − yx′ = 0**.', 'مستقيميتان ⇔ **det(u, v) = xy′ − yx′ = 0**.', 'Colineales ⇔ **det(u, v) = xy′ − yx′ = 0**.'),
      ],
      example: ex(EX, same('3x + 2y − 4 = 0 ⇔ y = −1,5x + 2'), same('u(2 ; 3), v(4 ; 6) : 2 × 6 − 3 × 4 = 0 → colinéaires')),
    },
  },
  // ───────────── Quartiles, écart type ─────────────
  'q-quartiles': {
    goal: t('Range la série, coupe-la en quatre, puis dessine la boîte.', 'Sort the data, cut it into quarters, then draw the box.', 'رتّب السلسلة واقسمها إلى أرباع.', 'Ordena, corta en cuartos y dibuja la caja.'),
    manip: { kind: 'quartiles', values: [12, 5, 9, 15, 7, 11, 8, 14] },
    lesson: {
      points: [
        t('On **range** la série. **Q1** est la plus petite valeur telle qu’**au moins 25 %** des données lui soient inférieures ou égales : rang **n ÷ 4 arrondi au-dessus**.', '**Sort** the data. **Q1** is the smallest value with **at least 25%** of the data ≤ it: rank **n ÷ 4 rounded up**.', '**Q1**: الرتبة **n ÷ 4 بالتقريب الأعلى**.', '**Q1**: rango **n ÷ 4 redondeado arriba**.'),
        t('**Q3** : même idée avec **75 %** (rang 3n ÷ 4 arrondi au-dessus). **Q3 − Q1** est l’**écart interquartile**.', '**Q3**: same idea with **75%** (rank 3n ÷ 4 rounded up). **Q3 − Q1** is the **interquartile range**.', '**Q3**: 75 %. **Q3 − Q1** الانحراف الربيعي.', '**Q3**: 75 %. **Q3 − Q1**: rango intercuartílico.'),
      ],
      example: ex(EX, same('5 7 8 9 11 12 14 15 (n = 8)'), t('Q1 : rang 2 → 7 ; Q3 : rang 6 → 12 ; écart 5', 'Q1: rank 2 → 7; Q3: rank 6 → 12; IQR 5', 'Q1 = 7 ، Q3 = 12', 'Q1 = 7, Q3 = 12')),
    },
  },
  'q-box': {
    goal: t('Range ces 11 valeurs, coupe-les en quatre et construis la boîte.', 'Sort these 11 values, cut into quarters and build the box.', 'رتّب القيم الـ 11 وابن العلبة.', 'Ordena los 11 valores y construye la caja.'),
    manip: { kind: 'quartiles', values: [3, 8, 6, 10, 4, 12, 7, 9, 5, 11, 6] },
    lesson: {
      points: [
        t('Le **diagramme en boîte** résume la série en **cinq nombres** : min, Q1, médiane, Q3, max.', 'A **box plot** sums up the data in **five numbers**: min, Q1, median, Q3, max.', '**مخطط العلبة**: خمسة أعداد.', 'El **diagrama de caja**: cinco números.'),
        t('La **boîte** (de Q1 à Q3) contient environ **la moitié** des valeurs ; chaque « moustache », environ un quart.', 'The **box** (Q1 to Q3) holds about **half** the values; each “whisker” about a quarter.', '**العلبة** تحوي حوالي **النصف**.', 'La **caja** contiene cerca de **la mitad**.'),
        t('L’**étendue** est max − min ; une boîte étroite = une série **homogène** au centre.', 'The **range** is max − min; a narrow box = data **tightly packed** in the middle.', '**المدى** = max − min.', '**Rango** = máx − mín.'),
      ],
      example: ex(EX, t('min 3, Q1 5, Me 7, Q3 10, max 12 : étendue 9', 'min 3, Q1 5, Me 7, Q3 10, max 12: range 9', 'المدى 9', 'rango 9')),
    },
  },
  'q-weighted': {
    lesson: {
      points: [
        t('Quand chaque valeur apparaît plusieurs fois, on **pondère** : moyenne = (Σ valeur × effectif) ÷ **effectif total**.', 'When values repeat, **weight** them: mean = (Σ value × count) ÷ **total count**.', 'المعدل = (Σ القيمة × الحصيص) ÷ **الحصيص الإجمالي**.', 'Media = (Σ valor × efectivo) ÷ **efectivo total**.'),
        t('Piège classique : diviser par le **nombre de valeurs différentes** au lieu de l’effectif total.', 'Classic trap: dividing by the **number of different values** instead of the total count.', 'خطأ شائع: القسمة على عدد القيم المختلفة.', 'Error típico: dividir por el número de valores distintos.'),
      ],
      example: ex(EX, t('notes 8 (×2), 12 (×3), 15 (×1) : (16 + 36 + 15) ÷ 6 ≈ 11,17', 'marks 8 (×2), 12 (×3), 15 (×1): (16 + 36 + 15) ÷ 6 ≈ 11.17', '(16 + 36 + 15) ÷ 6 ≈ 11,17', '(16 + 36 + 15) ÷ 6 ≈ 11,17')),
    },
  },
  'q-std': {
    lesson: {
      points: [
        t('L’**écart type** σ mesure l’écart moyen à la moyenne : **σ = √( moyenne des (x − x̄)² )**.', 'The **standard deviation** σ measures the typical distance from the mean: **σ = √(mean of (x − x̄)²)**.', '**الانحراف المعياري** σ = √(معدل (x − x̄)²).', '**Desviación típica** σ = √(media de (x − x̄)²).'),
        t('Plus σ est **petit**, plus la série est **homogène** (valeurs serrées autour de la moyenne).', 'The **smaller** σ, the more **consistent** the data (values close to the mean).', 'كلما **صغر** σ كانت السلسلة **أكثر تجانسًا**.', 'Cuanto **menor** σ, más **homogénea**.'),
      ],
      example: ex(EX, t('9 ; 10 ; 11 : moyenne 10, σ = √((1 + 0 + 1) ÷ 3) ≈ 0,82', '9, 10, 11: mean 10, σ = √((1 + 0 + 1) ÷ 3) ≈ 0.82', 'σ ≈ 0,82', 'σ ≈ 0,82')),
    },
  },
  // ───────────── Probabilités ─────────────
  'ev-universe': {
    goal: t('Deux dés : touche toutes les cases dont la somme vaut 8.', 'Two dice: tap every cell adding up to 8.', 'نردان: المس كل الخانات التي مجموعها 8.', 'Dos dados: toca las casillas que suman 8.'),
    manip: { kind: 'dice-grid', sum: 8 },
    lesson: {
      points: [
        t('L’**univers** Ω est l’ensemble de toutes les **issues** possibles. Un **événement** est une partie de Ω.', 'The **sample space** Ω is the set of all possible **outcomes**. An **event** is a subset of Ω.', '**الكون** Ω مجموعة كل الإمكانيات. **الحدث** جزء منه.', 'El **espacio muestral** Ω; un **suceso** es una parte.'),
        t('Si les issues sont **équiprobables** : P(A) = **nombre d’issues de A ÷ nombre d’issues de Ω**.', 'If outcomes are **equally likely**: P(A) = **outcomes in A ÷ outcomes in Ω**.', 'في حالة **تساوي الاحتمال**: P(A) = عدد إمكانيات A ÷ عدد إمكانيات Ω.', 'Si son **equiprobables**: P(A) = casos favorables ÷ casos posibles.'),
      ],
      example: ex(EX, t('Deux dés : 36 issues ; somme 8 : (2;6) (3;5) (4;4) (5;3) (6;2) → P = 5/36', 'Two dice: 36 outcomes; sum 8: 5 of them → P = 5/36', 'P = 5/36', 'P = 5/36')),
    },
  },
  'ev-union': {
    goal: t('30 élèves : 12 font du sport, 9 de la musique, 4 les deux. Compte ceux qui font sport OU musique.', '30 pupils: 12 do sport, 9 music, 4 both. Count those doing sport OR music.', '30 تلميذًا: كم يمارس الرياضة أو الموسيقى؟', '30 alumnos: ¿cuántos hacen deporte O música?'),
    manip: { kind: 'venn', a: 12, b: 9, both: 4, total: 30, labels: [t('Sport', 'Sport', 'رياضة', 'Deporte'), t('Musique', 'Music', 'موسيقى', 'Música')] },
    lesson: {
      points: [
        t('**P(A ∪ B) = P(A) + P(B) − P(A ∩ B)** : on retire l’intersection, comptée deux fois.', '**P(A ∪ B) = P(A) + P(B) − P(A ∩ B)**: remove the overlap, counted twice.', '**P(A ∪ B) = P(A) + P(B) − P(A ∩ B)**.', '**P(A ∪ B) = P(A) + P(B) − P(A ∩ B)**.'),
        t('L’événement **contraire** Ā (« A ne se produit pas ») : **P(Ā) = 1 − P(A)**.', 'The **complement** Ā (“A does not happen”): **P(Ā) = 1 − P(A)**.', '**الحدث المضاد**: P(Ā) = 1 − P(A).', '**Suceso contrario**: P(Ā) = 1 − P(A).'),
      ],
      example: ex(EX, same('P(A) = 0,4 ; P(B) = 0,3 ; P(A ∩ B) = 0,1'), same('P(A ∪ B) = 0,4 + 0,3 − 0,1 = 0,6 ; P(Ā) = 0,6')),
    },
  },
  'ev-table': {
    goal: t('30 élèves : 14 filles (A), 11 externes (E), dont 6 filles externes. Compte A ∪ E.', '30 pupils: 14 girls (A), 11 day pupils (E), 6 of them girls. Count A ∪ E.', '30 تلميذًا: 14 فتاة و 11 خارجيًا منهم 6 فتيات.', '30 alumnos: 14 chicas, 11 externos, 6 chicas externas.'),
    manip: { kind: 'venn', a: 14, b: 11, both: 6, total: 30, labels: [t('Filles', 'Girls', 'فتيات', 'Chicas'), t('Externes', 'Day pupils', 'خارجيون', 'Externos')] },
    lesson: {
      points: [
        t('Un **tableau croisé** range l’effectif selon deux critères ; les **totaux** sont en bout de ligne et de colonne.', 'A **two-way table** sorts counts by two criteria; **totals** at the end of each row and column.', '**الجدول المزدوج** يرتب حسب معيارين.', 'La **tabla de contingencia** usa dos criterios.'),
        t('P(A) = **total de la ligne A ÷ effectif total** ; P(A ∩ E) = **case à l’intersection ÷ effectif total**.', 'P(A) = **row total for A ÷ grand total**; P(A ∩ E) = **cell at the crossing ÷ grand total**.', 'P(A ∩ E) = **الخانة ÷ المجموع**.', 'P(A ∩ E) = **casilla ÷ total**.'),
      ],
      example: ex(EX, t('6 filles externes sur 30 : P(A ∩ E) = 6/30 = 0,2', '6 girl day pupils out of 30: P(A ∩ E) = 0.2', 'P(A ∩ E) = 0,2', 'P(A ∩ E) = 0,2')),
    },
  },
  'ev-two-draws': {
    lesson: {
      points: [
        t('Avec **remise**, la composition de l’urne ne change pas : les deux tirages sont **indépendants**.', 'With **replacement**, the urn does not change: the two draws are **independent**.', 'مع **الإرجاع** السحبان **مستقلان**.', 'Con **reemplazo**, las extracciones son **independientes**.'),
        t('Sur un **arbre**, on **multiplie** le long d’un chemin et on **additionne** les chemins qui mènent au même événement.', 'On a **tree**, **multiply** along a path and **add** the paths leading to the same event.', 'على **الشجرة** نضرب على المسار ونجمع المسارات.', 'En el **árbol**, multiplica en el camino y suma caminos.'),
      ],
      example: ex(EX, t('3 rouges, 2 bleues : P(R puis R) = 3/5 × 3/5 = 9/25', '3 red, 2 blue: P(R then R) = 3/5 × 3/5 = 9/25', 'P = 9/25', 'P = 9/25'), t('P(une de chaque) = 2 × 3/5 × 2/5 = 12/25', 'P(one of each) = 2 × 3/5 × 2/5 = 12/25', 'P = 12/25', 'P = 12/25')),
    },
  },
  // ───────────── Cercle trigonométrique ─────────────
  'uc-radians': {
    goal: t('Fais tourner M jusqu’à 120° : combien de radians ?', 'Turn M to 120°: how many radians?', 'أدر M حتى 120°: كم راديانًا؟', 'Gira M hasta 120°: ¿cuántos radianes?'),
    manip: { kind: 'unit-circle', target: 120, step: 30 },
    lesson: {
      points: [
        t('Sur le cercle de **rayon 1**, un angle se mesure aussi par la **longueur de l’arc** : c’est le **radian**. Un demi-tour = π.', 'On the circle of **radius 1**, an angle can be measured by the **arc length**: the **radian**. Half a turn = π.', 'على دائرة **شعاعها 1** نقيس الزاوية بطول القوس: **الراديان**.', 'En el círculo de **radio 1**, el ángulo se mide por el arco: **radián**.'),
        t('**180° = π rad** : pour convertir, x° = **x × π ÷ 180** ; et π/n rad = 180° ÷ n.', '**180° = π rad**: x° = **x × π ÷ 180**; π/n rad = 180° ÷ n.', '**180° = π rad**.', '**180° = π rad**.'),
      ],
      example: ex(EX, same('90° = π/2 ; 60° = π/3 ; 45° = π/4 ; 30° = π/6'), same('3π/4 = 3 × 180° ÷ 4 = 135°')),
    },
  },
  'uc-values': {
    goal: t('Fais tourner M jusqu’à 60° et lis cos et sin.', 'Turn M to 60° and read cos and sin.', 'أدر M حتى 60° واقرأ cos و sin.', 'Gira M hasta 60° y lee cos y sen.'),
    manip: { kind: 'unit-circle', target: 60, step: 15 },
    lesson: {
      points: [
        t('Le point M du cercle associé à x a pour coordonnées **(cos x ; sin x)** : cos est l’**abscisse**, sin l’**ordonnée**.', 'The point M for x has coordinates **(cos x, sin x)**: cos is the **x-coordinate**, sin the **y-coordinate**.', 'M إحداثياتها **(cos x ; sin x)**.', 'M tiene coordenadas **(cos x ; sen x)**.'),
        t('Valeurs à connaître : **π/6** → (√3/2 ; 1/2) ; **π/4** → (√2/2 ; √2/2) ; **π/3** → (1/2 ; √3/2).', 'Values to know: **π/6** → (√3/2, 1/2); **π/4** → (√2/2, √2/2); **π/3** → (1/2, √3/2).', '**π/6** → (√3/2 ; 1/2) ، **π/4** → (√2/2 ; √2/2) ، **π/3** → (1/2 ; √3/2).', '**π/6**, **π/4**, **π/3**.'),
      ],
      example: ex(EX, t('cos(π/3) = 1/2 : demi-triangle équilatéral de côté 1.', 'cos(π/3) = 1/2: half an equilateral triangle of side 1.', 'cos(π/3) = 1/2', 'cos(π/3) = 1/2')),
    },
  },
  'uc-signs': {
    goal: t('Fais faire un tour complet à M : visite les quatre quarts du cercle.', 'Take M all the way round: visit the four quarters.', 'أدر M دورة كاملة: زر الأرباع الأربعة.', 'Da una vuelta completa: visita los cuatro cuadrantes.'),
    manip: { kind: 'unit-circle', target: 0, step: 30, quadrants: true },
    lesson: {
      points: [
        t('**cos x > 0** quand M est **à droite** de l’axe vertical ; **sin x > 0** quand M est **au-dessus** de l’axe horizontal.', '**cos x > 0** when M is **right** of the vertical axis; **sin x > 0** when M is **above** the horizontal axis.', '**cos > 0** يمينًا و**sin > 0** فوق.', '**cos > 0** a la derecha, **sen > 0** arriba.'),
        t('Quart 1 (0°–90°) : + / + ; quart 2 : − / + ; quart 3 : − / − ; quart 4 : + / −.', 'Quarter 1 (0°–90°): + / +; quarter 2: − / +; quarter 3: − / −; quarter 4: + / −.', 'الربع 1: + / + ؛ 2: − / + ؛ 3: − / − ؛ 4: + / −.', 'Cuadrante 1: +/+; 2: −/+; 3: −/−; 4: +/−.'),
      ],
      example: ex(EX, t('210° (quart 3) : cos et sin sont négatifs.', '210° (quarter 3): cos and sin are both negative.', '210°: كلاهما سالب.', '210°: ambos negativos.')),
    },
  },
  'uc-identity': {
    goal: t('Fais tourner M jusqu’à 150° : que vaut toujours cos² + sin² ?', 'Turn M to 150°: what is cos² + sin² always equal to?', 'أدر M حتى 150°: كم تساوي دائمًا cos² + sin²؟', 'Gira M hasta 150°: ¿cuánto vale siempre cos² + sen²?'),
    manip: { kind: 'unit-circle', target: 150, step: 30 },
    lesson: {
      points: [
        t('Pour tout x : **cos² x + sin² x = 1** (Pythagore dans le cercle de rayon 1).', 'For every x: **cos² x + sin² x = 1** (Pythagoras in the circle of radius 1).', 'لكل x: **cos² x + sin² x = 1**.', 'Para todo x: **cos² x + sen² x = 1**.'),
        t('Si on connaît cos x : sin² x = 1 − cos² x, puis **sin x = ±√(…)**, le signe venant du **quart** où se trouve M.', 'If you know cos x: sin² x = 1 − cos² x, then **sin x = ±√(…)**, the sign coming from M’s **quarter**.', 'sin x = ±√(1 − cos² x) حسب الربع.', 'sen x = ±√(1 − cos² x) según el cuadrante.'),
      ],
      example: ex(EX, same('cos x = 0,6, sin x < 0 : sin² x = 0,64 → sin x = −0,8')),
    },
  },
};
