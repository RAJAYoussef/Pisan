// Introductions de la famille « Données, hasard, proportionnalité » (et les fractions) : fractions,
// proportionnalité, statistiques, tableaux et graphiques, probabilités (collège et lycée).
// Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');
const SPORTS = [t('Football', 'Football', 'كرة القدم', 'Fútbol'), t('Basket', 'Basketball', 'كرة السلة', 'Baloncesto'), t('Danse', 'Dance', 'الرقص', 'Danza')];
const DIE = [1, 2, 3, 4, 5, 6].map(n => ({ label: t(String(n), String(n), String(n), String(n)), weight: 1 }));

export const DONNEES_INTROS: Record<string, Intro> = {
  // ───────────── Fractions ─────────────
  'frac-meaning': {
    goal: t('La bande est partagée en 6 parts égales. Colorie 1/6 de la bande, puis 5/6.', 'The bar is split into 6 equal parts. Shade 1/6 of it, then 5/6.', 'الشريط مقسم إلى 6 أجزاء متساوية. لوّن 1/6 ثم 5/6.', 'La barra tiene 6 partes iguales. Colorea 1/6 y luego 5/6.'),
    manip: { kind: 'frac-color', n: 5, d: 6 },
    lesson: {
      points: [
        t('Dans n/d, le **dénominateur d** dit en combien de **parts égales** on partage le tout ; le **numérateur n** dit combien on en **prend**.', 'In n/d, the **denominator d** says how many **equal parts** the whole is cut into; the **numerator n** says how many you **take**.', 'في n/d، **المقام** عدد **الأجزاء المتساوية** و**البسط** عدد الأجزاء **المأخوذة**.', 'En n/d, el **denominador** son las **partes iguales**; el **numerador**, las que **tomas**.'),
        t('Les parts doivent être **égales**, sinon ce n’est pas une fraction du tout.', 'The parts must be **equal**, otherwise it is not a fraction of the whole.', 'يجب أن تكون الأجزاء **متساوية**.', 'Las partes deben ser **iguales**.'),
      ],
      example: ex(EX, t('3/4 d’une pizza : 4 parts égales, on en prend 3.', '3/4 of a pizza: 4 equal slices, take 3.', '3/4: 4 أجزاء ونأخذ 3.', '3/4: 4 partes, tomas 3.')),
    },
  },
  'frac-equivalent': {
    goal: t('Colorie 1/3 de la bande, puis observe 2/6 et 4/12 : même quantité ?', 'Shade 1/3 of the bar, then look at 2/6 and 4/12: same amount?', 'لوّن 1/3 ثم قارن مع 2/6 و 4/12.', 'Colorea 1/3 y compara con 2/6 y 4/12.'),
    manip: { kind: 'frac-merge', n: 4, d: 12, k: 4 },
    lesson: {
      points: [
        t('On obtient une **fraction égale** en multipliant (ou divisant) **le numérateur et le dénominateur par le même nombre**.', 'You get an **equal fraction** by multiplying (or dividing) **top and bottom by the same number**.', 'نحصل على **كسر مساوٍ** بضرب **البسط والمقام في نفس العدد**.', '**Fracción equivalente**: multiplica **arriba y abajo por el mismo número**.'),
        t('Couper chaque part en 3 multiplie le nombre de parts **et** le nombre de parts prises par 3.', 'Cutting each part in 3 multiplies both the parts **and** the parts taken by 3.', 'تقسيم كل جزء إلى 3 يضرب العددين في 3.', 'Cortar cada parte en 3 multiplica ambos por 3.'),
      ],
      example: ex(EX, t('1/6 = 3/18 (× 3 en haut et en bas)', '1/6 = 3/18 (× 3 top and bottom)', '1/6 = 3/18', '1/6 = 3/18')),
    },
  },
  'frac-simplify': {
    goal: t('La bande montre 6/10. Regroupe les parts deux par deux : quelle fraction obtiens-tu ?', 'The bar shows 6/10. Group the parts in twos: what fraction do you get?', 'الشريط يبين 6/10. اجمع الأجزاء مثنى مثنى.', 'La barra muestra 6/10. Agrupa las partes de dos en dos.'),
    manip: { kind: 'frac-merge', n: 6, d: 10, k: 2 },
    lesson: {
      points: [
        t('**Simplifier**, c’est diviser le numérateur et le dénominateur par un **diviseur commun**.', '**Simplifying** means dividing top and bottom by a **common factor**.', '**الاختزال**: القسمة على **قاسم مشترك**.', '**Simplificar**: dividir entre un **divisor común**.'),
        t('Une fraction est **irréductible** quand on ne peut plus simplifier.', 'A fraction is in **lowest terms** when it cannot be simplified further.', 'الكسر **غير قابل للاختزال** عندما لا يمكن اختزاله أكثر.', 'Es **irreducible** cuando ya no se puede.'),
      ],
      example: ex(EX, t('6/10 = 3/5 (÷ 2) · 12/18 = 2/3 (÷ 6)', '6/10 = 3/5 (÷ 2) · 12/18 = 2/3 (÷ 6)', '6/10 = 3/5', '6/10 = 3/5')),
    },
  },
  'frac-visual-compare': {
    lesson: {
      points: [
        t('Pour comparer deux fractions sur des bandes, il faut **le même tout** (des bandes de même longueur).', 'To compare fractions with bars, use **the same whole** (bars of the same length).', 'للمقارنة نحتاج **نفس الكل**.', 'Para comparar, usa **el mismo todo**.'),
        t('Même dénominateur : on compare les numérateurs. Même numérateur : la plus grande part gagne (1/3 > 1/5).', 'Same denominator: compare numerators. Same numerator: bigger parts win (1/3 > 1/5).', 'نفس المقام: نقارن البسطين.', 'Mismo denominador: compara numeradores.'),
      ],
      example: ex(EX, t('3/8 < 5/8 · 2/3 > 2/7', '3/8 < 5/8 · 2/3 > 2/7', '3/8 < 5/8', '3/8 < 5/8')),
    },
  },
  'frac-equivalence-visual': {
    lesson: {
      points: [
        t('Redécouper une bande en parts plus petites ne change pas la quantité coloriée : 1/4 = 3/12.', 'Cutting a bar into smaller parts doesn’t change the shaded amount: 1/4 = 3/12.', 'إعادة التقسيم لا تغير الكمية: 1/4 = 3/12.', 'Recortar no cambia la cantidad: 1/4 = 3/12.'),
        t('Les deux termes sont multipliés **par le même nombre**.', 'Both terms are multiplied **by the same number**.', 'نضرب الحدين **في نفس العدد**.', 'Ambos términos **por el mismo número**.'),
      ],
      example: ex(EX, t('1/4 : chaque quart coupé en 3 → 3/12', '1/4: each quarter cut in 3 → 3/12', '3/12', '3/12')),
    },
  },
  'frac-add-visual': {
    lesson: {
      points: [
        t('On additionne des parts **de même taille** : 1/6 + 3/6 = 4/6. On ajoute les numérateurs, le dénominateur ne change pas.', 'Add parts **of the same size**: 1/6 + 3/6 = 4/6. Add numerators; the denominator stays.', 'نجمع أجزاء **من نفس الحجم**: نجمع البسطين.', 'Se suman partes **del mismo tamaño**.'),
        t('Piège : 1/6 + 3/6 ≠ 4/12 (les parts ne deviennent pas plus petites).', 'Trap: 1/6 + 3/6 ≠ 4/12 (the parts don’t get smaller).', 'فخ: 1/6 + 3/6 ≠ 4/12.', 'Trampa: ≠ 4/12.'),
      ],
      example: ex(EX, t('2/8 + 5/8 = 7/8', '2/8 + 5/8 = 7/8', '7/8', '7/8')),
    },
  },
  'frac-numberline': {
    lesson: {
      points: [
        t('Sur une droite graduée, on partage l’unité **en d parts égales** et on avance de n parts : c’est n/d.', 'On a number line, split the unit **into d equal parts** and move n parts along: that is n/d.', 'نقسم الوحدة **إلى d أجزاء** ونتقدم n جزءًا.', 'Divide la unidad **en d partes** y avanza n.'),
        t('Une fraction est **un nombre** : 3/5 est entre 0 et 1, 7/5 est plus grand que 1.', 'A fraction is **a number**: 3/5 is between 0 and 1, 7/5 is greater than 1.', 'الكسر **عدد**.', 'Una fracción es **un número**.'),
      ],
      example: ex(EX, t('3/5 : unité en 5, 3 graduations après 0.', '3/5: unit in 5, 3 marks after 0.', '3/5', '3/5')),
    },
  },
  'frac-compare': {
    lesson: {
      points: [
        t('On met les fractions **au même dénominateur**, puis on compare les numérateurs.', 'Put the fractions **over the same denominator**, then compare numerators.', 'نوحد **المقامات** ثم نقارن البسطين.', 'Pon **el mismo denominador** y compara.'),
        t('On peut aussi comparer à des repères : 1/2, 1.', 'You can also compare with benchmarks: 1/2, 1.', 'أو نقارن بمرجع: 1/2، 1.', 'O compara con 1/2 y 1.'),
      ],
      example: ex(EX, t('2/3 et 3/4 : 8/12 < 9/12, donc 2/3 < 3/4.', '2/3 and 3/4: 8/12 < 9/12, so 2/3 < 3/4.', '2/3 < 3/4', '2/3 < 3/4')),
    },
  },
  'frac-add-subtract': {
    lesson: {
      points: [
        t('On rend les dénominateurs **identiques**, puis on ajoute (ou soustrait) les numérateurs.', 'Make the denominators **the same**, then add (or subtract) the numerators.', 'نوحد المقامات ثم نجمع البسطين.', 'Iguala denominadores y suma numeradores.'),
        t('Le dénominateur indique la taille des parts : il ne s’additionne pas.', 'The denominator gives the size of the parts: it is not added.', 'المقام لا يُجمع.', 'El denominador no se suma.'),
      ],
      example: ex(EX, t('1/2 + 1/3 = 3/6 + 2/6 = 5/6 · 5/7 − 2/7 = 3/7', '1/2 + 1/3 = 5/6 · 5/7 − 2/7 = 3/7', '5/6 · 3/7', '5/6 · 3/7')),
    },
  },
  'frac-multiply-divide': {
    goal: t('Colorie 3/5 du carré dans un sens, puis 2/3 dans l’autre. La partie colorée deux fois, c’est 3/5 × 2/3.', 'Shade 3/5 of the square one way, then 2/3 the other way. The double-shaded part is 3/5 × 2/3.', 'لوّن 3/5 في اتجاه و 2/3 في الآخر.', 'Colorea 3/5 en un sentido y 2/3 en el otro.'),
    manip: { kind: 'frac-area', a: 3, b: 5, c: 2, d: 3 },
    lesson: {
      points: [
        t('**Multiplier** : numérateur × numérateur, dénominateur × dénominateur : a/b × c/d = (a × c)/(b × d).', '**Multiply**: tops together, bottoms together: a/b × c/d = (ac)/(bd).', '**الضرب**: البسط × البسط، المقام × المقام.', '**Multiplicar**: arriba por arriba, abajo por abajo.'),
        t('**Diviser** par une fraction, c’est multiplier par son **inverse** : a/b ÷ c/d = a/b × d/c.', '**Dividing** by a fraction means multiplying by its **reciprocal**.', '**القسمة** هي الضرب في **المقلوب**.', '**Dividir** es multiplicar por el **inverso**.'),
      ],
      example: ex(EX, t('3/5 × 2/3 = 6/15 = 2/5 · 3/5 ÷ 2/3 = 3/5 × 3/2 = 9/10', '3/5 × 2/3 = 6/15 = 2/5 · 3/5 ÷ 2/3 = 9/10', '2/5 · 9/10', '2/5 · 9/10')),
    },
  },
  'frac-problem': {
    goal: t('Méthode de Singapour : une réserve de 24 L, on en utilise 3/4. Partage la barre en 4, puis prends-en 3.', 'Singapore method: a 24 L tank, 3/4 is used. Split the bar into 4, then take 3.', 'خزان 24 L نستعمل 3/4 منه. اقسم الشريط إلى 4 وخذ 3.', 'Depósito de 24 L, se usan 3/4. Divide en 4 y toma 3.'),
    manip: { kind: 'frac-of', n: 3, d: 4, total: 24, unit: 'L' },
    lesson: {
      points: [
        t('Prendre n/d d’une quantité : on **divise par d** (une part), puis on **multiplie par n**.', 'Taking n/d of an amount: **divide by d** (one part), then **multiply by n**.', 'نأخذ n/d من كمية: **نقسم على d** ثم **نضرب في n**.', 'n/d de una cantidad: **divide entre d** y **multiplica por n**.'),
        t('On vérifie la vraisemblance : 3/4 de 24 est plus petit que 24.', 'Check it makes sense: 3/4 of 24 is less than 24.', 'نتحقق من المعقولية.', 'Comprueba que tiene sentido.'),
      ],
      example: ex(EX, t('3/4 de 24 L : 24 ÷ 4 = 6, 6 × 3 = 18 L.', '3/4 of 24 L: 24 ÷ 4 = 6, 6 × 3 = 18 L.', '18 L.', '18 L.')),
    },
  },
  // ───────────── Proportionnalité ─────────────
  'prop-recognise': {
    goal: t('Un cahier coûte 1,5 €. Change le nombre de cahiers : les points (nombre ; prix) sont-ils alignés ?', 'A notebook costs €1.50. Change the number of notebooks: are the points (number, price) lined up?', 'الدفتر بـ 1,5. غيّر العدد: هل النقط مستقيمية؟', 'Un cuaderno cuesta 1,5 €. ¿Están alineados los puntos?'),
    manip: { kind: 'ratio-graph', unit: 1.5, label: '€' },
    lesson: {
      points: [
        t('Deux grandeurs sont **proportionnelles** si on passe de l’une à l’autre en **multipliant toujours par le même nombre** (le coefficient).', 'Two quantities are **proportional** if you always **multiply by the same number** (the coefficient) to go from one to the other.', '**متناسبتان** إذا ضربنا **دائمًا في نفس العدد**.', '**Proporcionales**: siempre **se multiplica por el mismo número**.'),
        t('Graphiquement : des points **alignés avec l’origine**.', 'On a graph: points **in a line through the origin**.', 'مبيانيًا: نقط **مستقيمية مع الأصل**.', 'Gráficamente: puntos **alineados con el origen**.'),
      ],
      example: ex(EX, t('2 → 3 ; 4 → 6 ; 6 → 9 : on multiplie toujours par 1,5.', '2 → 3; 4 → 6; 6 → 9: always × 1.5.', '× 1,5 دائمًا.', 'Siempre × 1,5.')),
    },
  },
  'prop-fourth': {
    goal: t('3 cahiers coûtent 4,50 €. Le modèle en barres : partage pour trouver le prix d’un cahier.', '3 notebooks cost €4.50. The bar model: share to find the price of one.', '3 دفاتر بـ 4,50. اقسم لتجد ثمن دفتر.', '3 cuadernos cuestan 4,50 €. Reparte.'),
    manip: { kind: 'bars', parts: 3, extra: 0, total: 4.5, unit: '€' },
    lesson: {
      points: [
        t('**Passer par l’unité** : on calcule pour 1, puis pour la quantité voulue.', '**Go through one unit**: work out the value for 1, then for the amount you want.', '**نمر بالوحدة**: نحسب لـ 1 ثم للكمية المطلوبة.', '**Pasa por la unidad**: calcula para 1.'),
        t('Ou on utilise un **rapport** : pour 6 personnes au lieu de 4, on multiplie par 6/4 = 1,5.', 'Or use a **ratio**: for 6 people instead of 4, multiply by 6/4 = 1.5.', 'أو نستعمل **نسبة**.', 'O usa una **razón**.'),
      ],
      example: ex(EX, t('4 personnes → 360 g ; 1 → 90 g ; 6 → 540 g.', '4 people → 360 g; 1 → 90 g; 6 → 540 g.', '540 g.', '540 g.')),
    },
  },
  'prop-percent': {
    goal: t('La bande vaut 50 € (100 %). Elle est coupée en dix parts de 10 %. Colorie 10 % : c’est la réduction.', 'The bar is worth €50 (100%), cut into ten 10% parts. Shade 10%: that is the discount.', 'الشريط 50 (100 %) مقسم إلى أجزاء 10 %.', 'La barra vale 50 € (100 %).'),
    manip: { kind: 'percent-bar', total: 50, pct: 10 },
    lesson: {
      points: [
        t('**p % de x** = x × p ÷ 100. 10 % = un dixième, 25 % = un quart, 50 % = la moitié.', '**p% of x** = x × p ÷ 100. 10% = a tenth, 25% = a quarter, 50% = half.', '**p % من x** = x × p ÷ 100.', '**p % de x** = x × p ÷ 100.'),
        t('Une **réduction** de p % : on enlève p % du prix (prix × (1 − p/100)).', 'A **discount** of p%: take p% off the price.', '**تخفيض** p %: نطرح p % من الثمن.', 'Un **descuento** de p %: quita p %.'),
      ],
      example: ex(EX, t('50 € soldés à −10 % : 50 − 5 = 45 €.', '€50 with 10% off: 50 − 5 = €45.', '45.', '45 €.')),
    },
  },
  'prop-scale': {
    lesson: {
      points: [
        t('Une **échelle** 1/100 : 1 cm sur le plan représente 100 cm en vrai.', 'A **scale** of 1/100: 1 cm on the plan is 100 cm in reality.', '**السلم** 1/100: 1 cm يمثل 100 cm.', '**Escala** 1/100: 1 cm = 100 cm reales.'),
        t('Réel = plan × 100 ; plan = réel ÷ 100. Attention aux **unités** (cm, m, km).', 'Real = plan × 100; plan = real ÷ 100. Watch the **units**.', 'انتبه **للوحدات**.', 'Cuidado con las **unidades**.'),
      ],
      example: ex(EX, t('Carte au 1/25 000 : 2 cm → 50 000 cm = 500 m = 0,5 km.', '1/25,000 map: 2 cm → 50,000 cm = 0.5 km.', '0,5 km.', '0,5 km.')),
    },
  },
  // ───────────── Statistiques ─────────────
  'stats-frequency': {
    lesson: {
      points: [
        t('**Effectif** : combien de fois une valeur apparaît. **Effectif total N** : la somme des effectifs.', '**Count**: how many times a value appears. **Total N**: the sum of the counts.', '**الحصيص** و**الحصيص الإجمالي**.', '**Frecuencia absoluta** y **total N**.'),
        t('**Fréquence** = effectif ÷ N (souvent en %). Le **mode** est la valeur la plus fréquente.', '**Relative frequency** = count ÷ N (often in %). The **mode** is the most frequent value.', '**التردد** = الحصيص ÷ N. **المنوال** الأكثر تكرارًا.', '**Frecuencia relativa** = n ÷ N; **moda**.'),
      ],
      example: ex(EX, t('La note 14 apparaît 5 fois sur 20 : fréquence 5 ÷ 20 = 25 %.', 'The mark 14 appears 5 times out of 20: 25%.', '25 %.', '25 %.')),
    },
  },
  'stats-mean': {
    lesson: {
      points: [
        t('La **moyenne**, c’est la valeur qu’auraient toutes les données si on les **égalisait** : somme ÷ nombre de valeurs.', 'The **mean** is the value all data would have if **levelled out**: sum ÷ number of values.', '**المعدل**: المجموع ÷ عدد القيم.', 'La **media**: suma ÷ número de valores.'),
        t('**Moyenne pondérée** : chaque valeur compte autant de fois que son effectif (ou son coefficient).', '**Weighted mean**: each value counts as many times as its count (or weight).', '**المعدل المرجح**.', '**Media ponderada**.'),
      ],
      example: ex(EX, t('15 ; 12 ; 12 ; 8 ; 9 : 56 ÷ 5 = 11,2', '15, 12, 12, 8, 9: 56 ÷ 5 = 11.2', '11,2', '11,2')),
    },
  },
  'stats-median': {
    goal: t('Range la série, puis retire la plus petite et la plus grande valeur, encore et encore. Que reste-t-il au milieu ?', 'Sort the data, then remove the smallest and largest values again and again. What is left in the middle?', 'رتّب السلسلة ثم أزل الأصغر والأكبر مرارًا.', 'Ordena y quita el menor y el mayor una y otra vez.'),
    manip: { kind: 'line-up', values: [11, 4, 15, 10, 3, 15, 11] },
    lesson: {
      points: [
        t('La **médiane** partage la série **rangée** en deux groupes de même effectif : la moitié des valeurs en dessous, la moitié au-dessus.', 'The **median** splits the **sorted** data into two equal halves.', '**الوسيط** يقسم السلسلة **المرتبة** إلى نصفين.', 'La **mediana** divide la serie **ordenada** en dos mitades.'),
        t('Effectif impair : la valeur du milieu. Pair : la moyenne des deux valeurs du milieu.', 'Odd count: the middle value. Even: the mean of the two middle values.', 'عدد فردي: القيمة الوسطى؛ زوجي: متوسط القيمتين.', 'Impar: el valor central; par: media de los dos.'),
      ],
      example: ex(EX, t('12 ; 15 ; 16 ; 18 ; 24 ; 27 ; 32 ; 34 : (18 + 24) ÷ 2 = 21', '12, 15, 16, 18, 24, 27, 32, 34: (18 + 24) ÷ 2 = 21', '21', '21')),
    },
  },
  'stats-spread': {
    lesson: {
      points: [
        t('**Étendue** = plus grande valeur − plus petite valeur.', '**Range** = largest value − smallest value.', '**المدى** = الأكبر − الأصغر.', '**Rango** = mayor − menor.'),
        t('À moyenne égale, la série de **plus petite étendue** est la plus régulière (homogène).', 'With equal means, the series with the **smaller range** is the more consistent.', 'السلسلة ذات **المدى الأصغر** أكثر انتظامًا.', 'Menor rango → más **homogénea**.'),
      ],
      example: ex(EX, t('Notes de 8 à 18 : étendue 10 ; de 11 à 15 : étendue 4 (plus régulière).', 'Marks from 8 to 18: range 10; 11 to 15: range 4 (more consistent).', '10 و 4.', '10 y 4.')),
    },
  },
  // ───────────── Tableaux et graphiques ─────────────
  'data-table': {
    goal: t('Dépouille l’enquête : pour chaque élève, touche le sport qu’il a choisi.', 'Tally the survey: for each pupil, tap the sport they chose.', 'فرز الاستطلاع: المس الرياضة المختارة لكل تلميذ.', 'Recuento: toca el deporte elegido.'),
    manip: { kind: 'tally', categories: SPORTS, answers: [0, 1, 0, 2, 1, 0, 2, 0, 1, 0] },
    lesson: {
      points: [
        t('Un **tableau à double entrée** croise deux informations : on lit une case au **croisement d’une ligne et d’une colonne**.', 'A **two-way table** crosses two pieces of information: read a cell where **a row meets a column**.', '**الجدول المزدوج** يقاطع معلومتين.', 'La **tabla de doble entrada** cruza dos datos.'),
        t('Les **totaux** se lisent en bout de ligne ou de colonne.', '**Totals** are at the end of rows or columns.', '**المجاميع** في نهاية الأسطر أو الأعمدة.', 'Los **totales** al final de filas o columnas.'),
      ],
      example: ex(EX, t('Ligne « 6e B », colonne « Danse » : 9 élèves.', 'Row “6e B”, column “Dance”: 9 pupils.', '9 تلاميذ.', '9 alumnos.')),
    },
  },
  'data-bars': {
    goal: t('Dépouille l’enquête : à chaque réponse, la barre du sport choisi monte d’un cran.', 'Tally the survey: with each answer, the chosen sport’s bar goes up one step.', 'مع كل جواب يرتفع عمود الرياضة المختارة.', 'Con cada respuesta, la barra sube.'),
    manip: { kind: 'tally', categories: SPORTS, answers: [2, 0, 0, 1, 2, 0, 0, 1, 0, 2, 0] },
    lesson: {
      points: [
        t('Dans un **diagramme en barres**, la **hauteur** de chaque barre donne l’effectif : on la lit sur l’axe gradué.', 'In a **bar chart**, the **height** of each bar is the count: read it on the scale.', '**ارتفاع** العمود هو الحصيص.', 'La **altura** de la barra es la frecuencia.'),
        t('On regarde d’abord la **graduation** (de 1 en 1 ? de 2 en 2 ?).', 'Check the **scale** first (steps of 1? of 2?).', 'ننظر أولًا إلى **التدريج**.', 'Mira primero la **escala**.'),
      ],
      example: ex(EX, t('Barre du mercredi au niveau 6 : 6 livres.', 'Wednesday’s bar at 6: 6 books.', '6 كتب.', '6 libros.')),
    },
  },
  'data-line': {
    lesson: {
      points: [
        t('Un **graphique en courbe** montre une **évolution** dans le temps : on lit l’heure en bas, la valeur sur le côté.', 'A **line graph** shows **change over time**: time along the bottom, value up the side.', '**التمثيل بمنحنى** يبين **التطور**.', 'La **gráfica de líneas** muestra la **evolución**.'),
        t('Le point le plus haut est le **maximum** ; une augmentation = valeur d’arrivée − valeur de départ.', 'The highest point is the **maximum**; an increase = end value − start value.', 'أعلى نقطة **القيمة القصوى**.', 'El punto más alto es el **máximo**.'),
      ],
      example: ex(EX, t('8 h : 9 °C, 16 h : 13 °C → +4 °C.', '8:00: 9 °C, 16:00: 13 °C → +4 °C.', '+4 °C.', '+4 °C.')),
    },
  },
  'data-build': {
    lesson: {
      points: [
        t('Pour tracer une barre : on part du bon libellé et on monte jusqu’à la graduation de l’effectif.', 'To draw a bar: start at the right label and go up to the count on the scale.', 'ننطلق من التسمية ونصعد حتى التدريجة.', 'Desde la etiqueta, sube hasta el valor.'),
        t('**Barres** pour comparer des catégories, **courbe** pour une évolution dans le temps.', '**Bars** to compare categories, a **line** for change over time.', '**الأعمدة** للمقارنة، **المنحنى** للتطور.', '**Barras** para comparar, **líneas** para evolucionar.'),
      ],
      example: ex(EX, t('Températures heure par heure → graphique en courbe.', 'Hourly temperatures → line graph.', '← منحنى.', '→ gráfica de líneas.')),
    },
  },
  // ───────────── Probabilités (collège) ─────────────
  'chance-vocab': {
    goal: t('Lance le dé et compte les « 6 ». Puis essaie d’obtenir un 7… possible ?', 'Roll the die and count the 6s. Then try to get a 7… possible?', 'ارمِ النرد وعد الستات.', 'Lanza el dado y cuenta los 6.'),
    manip: { kind: 'sim', outcomes: DIE, event: [5], seed: 7 },
    lesson: {
      points: [
        t('Un événement **impossible** a une probabilité **0**, un événement **certain** une probabilité **1**.', 'An **impossible** event has probability **0**, a **certain** one probability **1**.', '**المستحيل** احتماله **0** و**الأكيد** **1**.', '**Imposible**: 0; **seguro**: 1.'),
        t('Entre les deux : peu probable, une chance sur deux (1/2), très probable.', 'In between: unlikely, even chance (1/2), likely.', 'بينهما: قليل الاحتمال، فرصة من اثنتين، محتمل جدًا.', 'Entre ambos: poco probable, 1/2, muy probable.'),
      ],
      example: ex(EX, t('Obtenir 7 avec un dé : impossible. Obtenir moins de 7 : certain.', 'Rolling a 7: impossible. Rolling under 7: certain.', 'مستحيل · أكيد.', 'Imposible · seguro.')),
    },
  },
  'chance-dice': {
    goal: t('Lance le dé beaucoup de fois et regarde la part des nombres pairs.', 'Roll the die many times and watch the share of even numbers.', 'ارمِ النرد مرات عديدة ولاحظ نسبة الأعداد الزوجية.', 'Lanza muchas veces: ¿qué parte son pares?'),
    manip: { kind: 'sim', outcomes: DIE, event: [1, 3, 5], seed: 11 },
    lesson: {
      points: [
        t('Quand toutes les issues ont la même chance : **P = issues favorables ÷ issues possibles**.', 'When all outcomes are equally likely: **P = favourable ÷ possible outcomes**.', '**P = الملائمة ÷ الممكنة**.', '**P = favorables ÷ posibles**.'),
        t('Un dé équilibré : 6 issues possibles.', 'A fair die: 6 possible outcomes.', 'النرد المتوازن: 6 إمكانيات.', 'Dado equilibrado: 6 resultados.'),
      ],
      example: ex(EX, t('Obtenir un nombre pair : 3 issues (2, 4, 6) sur 6 → 3/6 = 1/2.', 'An even number: 3 outcomes (2, 4, 6) out of 6 → 1/2.', '1/2.', '1/2.')),
    },
  },
  'chance-urn': {
    goal: t('Un sac : 6 rouges, 2 bleues, 2 jaunes. Tire beaucoup de boules (on les remet) : quelle part de rouges ?', 'A bag: 6 red, 2 blue, 2 yellow. Draw many balls (putting them back): what share is red?', 'كيس: 6 حمراء و 2 زرقاء و 2 صفراء.', 'Bolsa: 6 rojas, 2 azules, 2 amarillas.'),
    manip: { kind: 'sim', outcomes: [{ label: t('rouge', 'red', 'حمراء', 'roja'), weight: 6 }, { label: t('bleue', 'blue', 'زرقاء', 'azul'), weight: 2 }, { label: t('jaune', 'yellow', 'صفراء', 'amarilla'), weight: 2 }], event: [0], seed: 5 },
    lesson: {
      points: [
        t('Chaque **boule** est une issue : P(rouge) = nombre de rouges ÷ nombre total de boules.', 'Each **ball** is one outcome: P(red) = number of red ÷ total number of balls.', 'كل **كرة** إمكانية.', 'Cada **bola** es un resultado.'),
        t('**Événement contraire** : P(pas rouge) = 1 − P(rouge).', '**Complementary event**: P(not red) = 1 − P(red).', '**الحدث المضاد**: 1 − P.', '**Contrario**: 1 − P.'),
      ],
      example: ex(EX, t('6 rouges sur 10 : P = 6/10 ; pas rouge : 4/10.', '6 red out of 10: P = 6/10; not red: 4/10.', '6/10 · 4/10', '6/10 · 4/10')),
    },
  },
  'chance-frequency': {
    goal: t('Lance le dé 10 fois, puis 100, puis 1 000 : la fréquence des « 6 » se rapproche-t-elle de 1/6 ≈ 0,17 ?', 'Roll the die 10, then 100, then 1,000 times: does the frequency of 6 approach 1/6 ≈ 0.17?', 'ارمِ 10 ثم 100 ثم 1000 مرة.', 'Lanza 10, 100 y 1 000 veces.'),
    manip: { kind: 'sim', outcomes: DIE, event: [5], seed: 3 },
    lesson: {
      points: [
        t('**Fréquence** = nombre de fois observé ÷ nombre d’essais. Elle **varie** d’une série à l’autre.', '**Frequency** = times observed ÷ number of trials. It **varies** between runs.', '**التردد** يتغير من سلسلة لأخرى.', 'La **frecuencia** varía.'),
        t('Sur **un grand nombre d’essais**, elle se rapproche de la **probabilité**.', 'Over **many trials**, it gets close to the **probability**.', 'مع **عدد كبير** تقترب من **الاحتمال**.', 'Con **muchos intentos** se acerca a la **probabilidad**.'),
      ],
      example: ex(EX, t('25 « 6 » sur 200 lancers : 25 ÷ 200 = 0,125.', '25 sixes in 200 rolls: 0.125.', '0,125', '0,125')),
    },
  },
  // ───────────── Probabilités (Terminale) ─────────────
  'proba-tree': {
    lesson: {
      points: [
        t('Sur un **arbre pondéré**, la somme des branches issues d’un même nœud vaut 1 ; on **multiplie** le long d’un chemin.', 'On a **probability tree**, branches from one node add up to 1; **multiply** along a path.', 'في **الشجرة**: مجموع الفروع 1 ونضرب على المسار.', 'En un **árbol**: las ramas suman 1; multiplica.'),
        t('**Probabilités totales** : P(B) = P(A ∩ B) + P(Ā ∩ B). **Conditionnelle** : P_B(A) = P(A ∩ B) ÷ P(B).', '**Total probability**: P(B) = P(A ∩ B) + P(Ā ∩ B). **Conditional**: P_B(A) = P(A ∩ B) ÷ P(B).', 'الاحتمالات الكلية والشرطية.', 'Probabilidad total y condicionada.'),
      ],
      example: ex(EX, t('P(A) = 0,3, P_A(B) = 0,5 : P(A ∩ B) = 0,15.', 'P(A) = 0.3, P_A(B) = 0.5: P(A ∩ B) = 0.15.', '0,15', '0,15')),
    },
  },
  'proba-binomial': {
    lesson: {
      points: [
        t('**Loi binomiale B(n ; p)** : n épreuves **identiques et indépendantes**, deux issues (succès p) ; X compte les succès.', '**Binomial B(n, p)**: n **identical, independent** trials, two outcomes (success p); X counts the successes.', '**القانون الحداني**: n تجارب **مستقلة ومتطابقة**.', '**Binomial**: n pruebas **idénticas e independientes**.'),
        t('P(X = k) = (n parmi k) pᵏ (1 − p)ⁿ⁻ᵏ ; **E(X) = n p**.', 'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ; **E(X) = np**.', '**E(X) = np**.', '**E(X) = np**.'),
      ],
      example: ex(EX, t('B(10 ; 0,2) : E(X) = 2, P(X = 2) ≈ 0,302', 'B(10, 0.2): E(X) = 2, P(X = 2) ≈ 0.302', 'E(X) = 2', 'E(X) = 2')),
    },
  },
  'proba-expectation': {
    lesson: {
      points: [
        t('Les probabilités d’une loi **somment à 1** (on complète la case manquante).', 'The probabilities of a distribution **add up to 1**.', 'مجموع الاحتمالات **1**.', 'Las probabilidades **suman 1**.'),
        t('**E(X) = Σ xᵢ × pᵢ**. Un jeu est **équitable** si E(gain) = 0.', '**E(X) = Σ xᵢ pᵢ**. A game is **fair** if E(gain) = 0.', '**E(X) = Σ xᵢ pᵢ**. اللعبة **عادلة** إذا E = 0.', '**E(X) = Σ xᵢ pᵢ**. **Justo** si E = 0.'),
      ],
      example: ex(EX, t('Gains −2, 0, 5 avec 0,5 ; 0,3 ; 0,2 : E = −1 + 0 + 1 = 0 → équitable.', 'Gains −2, 0, 5 with 0.5, 0.3, 0.2: E = 0 → fair.', 'E = 0', 'E = 0')),
    },
  },
  'proba-independence': {
    lesson: {
      points: [
        t('A et B sont **indépendants** si **P(A ∩ B) = P(A) × P(B)**.', 'A and B are **independent** if **P(A ∩ B) = P(A) × P(B)**.', '**مستقلان** إذا **P(A ∩ B) = P(A) × P(B)**.', '**Independientes** si **P(A ∩ B) = P(A) × P(B)**.'),
        t('Alors savoir que B est réalisé ne change rien : P_B(A) = P(A).', 'Then knowing B happened changes nothing: P_B(A) = P(A).', 'P_B(A) = P(A).', 'P_B(A) = P(A).'),
      ],
      example: ex(EX, t('P(A) = 0,4, P(B) = 0,5, P(A ∩ B) = 0,2 = 0,4 × 0,5 → indépendants.', 'P(A) = 0.4, P(B) = 0.5, P(A ∩ B) = 0.2 → independent.', 'مستقلان.', 'Independientes.')),
    },
  },
};
