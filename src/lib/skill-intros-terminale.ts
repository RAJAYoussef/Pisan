// Introductions de Terminale (2ème Bac au Maroc) : logarithme, intégrales, espace, dénombrement,
// nombres complexes, équations différentielles. Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const same = (s: string) => t(s, s, s, s);
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const TERMINALE_INTROS: Record<string, Intro> = {
  // ───────────── Logarithme ─────────────
  'ln-rules': {
    goal: t('Multiplie x par 2 cinq fois et regarde de combien ln x augmente à chaque fois.', 'Multiply x by 2 five times and watch how much ln x goes up each time.', 'اضرب x في 2 خمس مرات ولاحظ ln x.', 'Multiplica x por 2 cinco veces y mira ln x.'),
    manip: { kind: 'log-ruler', base: 2, steps: 5 },
    lesson: {
      points: [
        t('**ln** est la fonction réciproque de exp : pour x > 0, **y = ln x ⇔ x = eʸ**. ln 1 = 0, ln e = 1.', '**ln** is the inverse of exp: for x > 0, **y = ln x ⇔ x = eʸ**. ln 1 = 0, ln e = 1.', '**ln** عكس exp: ln 1 = 0 و ln e = 1.', '**ln** es la inversa de exp: ln 1 = 0, ln e = 1.'),
        t('Il transforme les **produits en sommes** : **ln(ab) = ln a + ln b**, ln(a/b) = ln a − ln b, **ln(aⁿ) = n ln a**.', 'It turns **products into sums**: **ln(ab) = ln a + ln b**, ln(a/b) = ln a − ln b, **ln(aⁿ) = n ln a**.', '**ln(ab) = ln a + ln b** و **ln(aⁿ) = n ln a**.', '**ln(ab) = ln a + ln b**, **ln(aⁿ) = n ln a**.'),
      ],
      example: ex(EX, same('ln 6 = ln 2 + ln 3 ≈ 0,693 + 1,099 = 1,792'), same('ln 8 = 3 ln 2 ≈ 2,079')),
    },
  },
  'ln-equation': {
    lesson: {
      points: [
        t('ln est définie et **strictement croissante sur ]0 ; +∞[** : **ln a = ln b ⇔ a = b** et **ln a < ln b ⇔ a < b** (a, b > 0).', 'ln is defined and **strictly increasing on (0, +∞)**: **ln a = ln b ⇔ a = b** and **ln a < ln b ⇔ a < b** (a, b > 0).', 'ln **تزايدية قطعًا على ]0 ; +∞[**.', 'ln es **estrictamente creciente en ]0 ; +∞[**.'),
        t('**eˣ = a ⇔ x = ln a** (a > 0). Toujours vérifier le **domaine** : ce qui est dans le ln doit être > 0.', '**eˣ = a ⇔ x = ln a** (a > 0). Always check the **domain**: what is inside ln must be > 0.', '**eˣ = a ⇔ x = ln a**. تحقق من **مجموعة التعريف**.', '**eˣ = a ⇔ x = ln a**. Comprueba el **dominio**.'),
      ],
      example: ex(EX, same('ln(3x − 2) = ln(x + 6) ⇔ 3x − 2 = x + 6 ⇔ x = 4 (et 10 > 0 ✓)'), same('eˣ = 5 ⇔ x = ln 5')),
    },
  },
  'ln-derivative': {
    goal: t('Promène le point sur la courbe de ln : compare x et la pente de la tangente.', 'Move the point along y = ln x: compare x and the slope of the tangent.', 'قارن x وميل المماس.', 'Compara x y la pendiente.'),
    manip: { kind: 'curve-explore', fns: ['ln'] },
    lesson: {
      points: [
        t('**(ln x)′ = 1/x** sur ]0 ; +∞[ : la pente est positive mais diminue, ln croît de plus en plus lentement.', '**(ln x)′ = 1/x** on (0, +∞): the slope is positive but shrinking; ln grows more and more slowly.', '**(ln x)′ = 1/x**.', '**(ln x)′ = 1/x**.'),
        t('Pour une fonction composée : **(ln u)′ = u′ / u** (avec u > 0).', 'For a composite: **(ln u)′ = u′ / u** (with u > 0).', '**(ln u)′ = u′ / u**.', '**(ln u)′ = u′ / u**.'),
      ],
      example: ex(EX, same('f(x) = 3 ln x − x → f′(x) = 3/x − 1'), same('(ln(x² + 1))′ = 2x / (x² + 1)')),
    },
  },
  'ln-threshold': {
    lesson: {
      points: [
        t('Pour trouver à partir de quand **qⁿ ≥ A**, on applique ln (croissante) : **n ln q ≥ ln A**.', 'To find when **qⁿ ≥ A**, apply ln (increasing): **n ln q ≥ ln A**.', 'نطبق ln: **n ln q ≥ ln A**.', 'Aplica ln: **n ln q ≥ ln A**.'),
        t('Si q > 1, ln q > 0 : **n ≥ ln A / ln q**. Si 0 < q < 1, ln q < 0 : **on change le sens** en divisant.', 'If q > 1, ln q > 0: **n ≥ ln A / ln q**. If 0 < q < 1, ln q < 0: **flip the inequality** when dividing.', 'إذا 0 < q < 1 **نغير الاتجاه**.', 'Si 0 < q < 1 **cambia el sentido**.'),
      ],
      example: ex(EX, same('1,05ⁿ ≥ 2 ⇔ n ≥ ln 2 / ln 1,05 ≈ 14,2 → n = 15')),
    },
  },
  // ───────────── Intégrales ─────────────
  'int-primitive': {
    lesson: {
      points: [
        t('F est une **primitive** de f si **F′ = f**. Deux primitives diffèrent d’une constante.', 'F is an **antiderivative** of f if **F′ = f**. Two antiderivatives differ by a constant.', 'F **دالة أصلية** لـ f إذا **F′ = f**.', 'F es **primitiva** de f si **F′ = f**.'),
        t('À connaître : xⁿ → **xⁿ⁺¹/(n + 1)** ; eˣ → eˣ ; e^(kx) → **(1/k) e^(kx)** ; 1/x → ln x ; u′/u → ln u.', 'Know: xⁿ → **xⁿ⁺¹/(n + 1)**; eˣ → eˣ; e^(kx) → **(1/k) e^(kx)**; 1/x → ln x; u′/u → ln u.', 'xⁿ → xⁿ⁺¹/(n + 1) ؛ e^(kx) → (1/k) e^(kx).', 'xⁿ → xⁿ⁺¹/(n + 1); e^(kx) → (1/k) e^(kx).'),
        t('On **vérifie toujours** en dérivant.', '**Always check** by differentiating.', '**تحقق دائمًا** بالاشتقاق.', '**Comprueba siempre** derivando.'),
      ],
      example: ex(EX, same('f(x) = 6x² + 4x → F(x) = 2x³ + 2x²')),
    },
  },
  'int-compute': {
    goal: t('Double le nombre de rectangles sous la courbe de x² sur [0 ; 2] : vers quelle valeur va leur aire ?', 'Double the number of rectangles under y = x² on [0, 2]: what does their area approach?', 'ضاعف عدد المستطيلات تحت x².', 'Duplica los rectángulos bajo x².'),
    manip: { kind: 'riemann', fn: 'square', b: 2 },
    lesson: {
      points: [
        t('Pour f continue et positive, **∫ de a à b de f(x) dx** est l’**aire** sous la courbe entre a et b.', 'For f continuous and positive, **∫ from a to b of f(x) dx** is the **area** under the curve between a and b.', '**التكامل** هو **المساحة** تحت المنحنى.', 'La **integral** es el **área** bajo la curva.'),
        t('Avec une primitive F : **∫ de a à b de f(x) dx = F(b) − F(a)**.', 'With an antiderivative F: **∫ from a to b of f(x) dx = F(b) − F(a)**.', '**F(b) − F(a)**.', '**F(b) − F(a)**.'),
      ],
      example: ex(EX, same('∫ de 0 à 2 de x² dx = [x³/3] = 8/3 − 0 ≈ 2,667')),
    },
  },
  'int-area': {
    goal: t('Double le nombre de rectangles sous la droite y = x sur [0 ; 4].', 'Double the number of rectangles under y = x on [0, 4].', 'ضاعف عدد المستطيلات تحت y = x.', 'Duplica los rectángulos bajo y = x.'),
    manip: { kind: 'riemann', fn: 'line', b: 4 },
    lesson: {
      points: [
        t('Si la figure est simple (rectangle, triangle), l’intégrale se lit **comme une aire**.', 'If the shape is simple (rectangle, triangle), read the integral **as an area**.', 'نقرأ التكامل **كمساحة**.', 'Se lee **como un área**.'),
        t('**Linéarité** : ∫(af + bg) = a∫f + b∫g. **Chasles** : ∫ de a à b + ∫ de b à c = ∫ de a à c. Sous l’axe, l’aire compte **négativement**.', '**Linearity**: ∫(af + bg) = a∫f + b∫g. **Chasles**: ∫ from a to b + from b to c = from a to c. Below the axis, area counts **negatively**.', '**الخطية** و**شال**.', '**Linealidad** y **Chasles**.'),
      ],
      example: ex(EX, same('∫ de 0 à 4 de x dx = 4 × 4 ÷ 2 = 8'), same('∫ de −1 à 1 de x³ dx = 0')),
    },
  },
  'int-mean': {
    lesson: {
      points: [
        t('La **valeur moyenne** de f sur [a ; b] est **μ = (1/(b − a)) × ∫ de a à b de f(x) dx**.', 'The **mean value** of f on [a, b] is **μ = (1/(b − a)) × ∫ from a to b of f(x) dx**.', '**القيمة المتوسطة** μ = ∫ ÷ (b − a).', '**Valor medio** μ = ∫ ÷ (b − a).'),
        t('C’est la hauteur du rectangle de base [a ; b] qui a la **même aire** que sous la courbe.', 'It is the height of the rectangle on [a, b] with the **same area** as under the curve.', 'ارتفاع المستطيل الذي له **نفس المساحة**.', 'Altura del rectángulo con la **misma área**.'),
      ],
      example: ex(EX, same('∫ de 0 à 4 de 2x dx = 16 → μ = 16 ÷ 4 = 4')),
    },
  },
  // ───────────── Espace ─────────────
  'sp-coords': {
    goal: t('Dans le cube, touche les sommets de coordonnées (1 ; 0 ; 0), (1 ; 1 ; 1) puis (0 ; 1 ; 1).', 'In the cube, tap the vertices at (1, 0, 0), (1, 1, 1) then (0, 1, 1).', 'المس الرؤوس المطلوبة.', 'Toca los vértices pedidos.'),
    manip: { kind: 'cube-coords', targets: [[1, 0, 0], [1, 1, 1], [0, 1, 1]] },
    lesson: {
      points: [
        t('Dans l’espace, un point a **trois coordonnées (x ; y ; z)**. On calcule comme dans le plan, avec une ligne de plus.', 'In space, a point has **three coordinates (x, y, z)**. Calculate as in the plane, with one more line.', 'في الفضاء **ثلاث إحداثيات**.', 'En el espacio, **tres coordenadas**.'),
        t('**AB(x_B − x_A ; y_B − y_A ; z_B − z_A)** ; milieu : la moyenne de chaque coordonnée.', '**AB(x_B − x_A, y_B − y_A, z_B − z_A)**; midpoint: average each coordinate.', '**AB(x_B − x_A ; …)**.', '**AB(x_B − x_A ; …)**.'),
      ],
      example: ex(EX, same('A(1 ; 2 ; −1), B(3 ; 0 ; 4) : AB(2 ; −2 ; 5), milieu (2 ; 1 ; 1,5)')),
    },
  },
  'sp-dot': {
    lesson: {
      points: [
        t('**u · v = xx′ + yy′ + zz′** dans un repère orthonormé ; **u · v = 0 ⇔ u ⊥ v**.', '**u · v = xx′ + yy′ + zz′** in an orthonormal frame; **u · v = 0 ⇔ u ⊥ v**.', '**u · v = xx′ + yy′ + zz′**.', '**u · v = xx′ + yy′ + zz′**.'),
        t('**‖u‖² = x² + y² + z²** : c’est Pythagore deux fois.', '**‖u‖² = x² + y² + z²**: Pythagoras twice.', '**‖u‖² = x² + y² + z²**.', '**‖u‖² = x² + y² + z²**.'),
      ],
      example: ex(EX, same('u(1 ; 2 ; 2) : ‖u‖ = √9 = 3 ; u · v(2 ; −1 ; 0) = 0 → orthogonaux')),
    },
  },
  'sp-plane': {
    lesson: {
      points: [
        t('Un plan de **vecteur normal n(a ; b ; c)** a une équation **ax + by + cz + d = 0**.', 'A plane with **normal vector n(a, b, c)** has equation **ax + by + cz + d = 0**.', 'مستوى منظميته n(a ; b ; c): **ax + by + cz + d = 0**.', 'Plano con normal n(a ; b ; c): **ax + by + cz + d = 0**.'),
        t('On trouve d avec un point du plan ; un point est dans le plan si ses coordonnées **vérifient l’équation**.', 'Find d with a point of the plane; a point is in the plane if its coordinates **satisfy the equation**.', 'نجد d بنقطة من المستوى.', 'd con un punto del plano.'),
      ],
      example: ex(EX, same('n(2 ; −1 ; 1), A(1 ; 0 ; 3) : 2 + 3 + d = 0 → 2x − y + z − 5 = 0')),
    },
  },
  'sp-line': {
    goal: t('Dans le cube, touche C(1 ; 1 ; 0), puis G(1 ; 1 ; 1) : la droite (CG) suit la direction (0 ; 0 ; 1).', 'In the cube, tap C(1, 1, 0) then G(1, 1, 1): line (CG) follows the direction (0, 0, 1).', 'المس C ثم G.', 'Toca C y luego G.'),
    manip: { kind: 'cube-coords', targets: [[1, 1, 0], [1, 1, 1]] },
    lesson: {
      points: [
        t('La droite passant par A(x_A ; y_A ; z_A) de vecteur directeur u(a ; b ; c) : **x = x_A + at, y = y_A + bt, z = z_A + ct** (t réel).', 'The line through A with direction u(a, b, c): **x = x_A + at, y = y_A + bt, z = z_A + ct** (t real).', '**x = x_A + at …**', '**x = x_A + at …**'),
        t('Chaque valeur de t donne un point ; les **coefficients de t** forment un vecteur directeur.', 'Each value of t gives a point; the **coefficients of t** form a direction vector.', 'معاملات t متجهة موجهة.', 'Los coeficientes de t: vector director.'),
      ],
      example: ex(EX, same('x = 1 + 2t, y = −t, z = 3 : t = 1 donne (3 ; −1 ; 3)')),
    },
  },
  // ───────────── Dénombrement ─────────────
  'cnt-permutations': {
    goal: t('Forme tous les mots possibles avec les lettres A, B et C (chacune une fois).', 'Make every possible word with A, B and C (each once).', 'كوّن كل الكلمات بـ A و B و C.', 'Forma todas las palabras con A, B y C.'),
    manip: { kind: 'arrange', letters: ['A', 'B', 'C'], length: 3 },
    lesson: {
      points: [
        t('**Principe multiplicatif** : si on fait des choix successifs, on **multiplie** le nombre de possibilités.', '**Multiplication principle**: for successive choices, **multiply** the numbers of options.', '**مبدأ الجداء**: نضرب عدد الإمكانيات.', '**Principio multiplicativo**: se multiplica.'),
        t('Ranger n objets distincts : **n! = n × (n − 1) × … × 1** façons (une **permutation**).', 'Ordering n distinct objects: **n! = n × (n − 1) × … × 1** ways (a **permutation**).', 'ترتيب n أشياء: **n!**.', 'Ordenar n objetos: **n!**.'),
      ],
      example: ex(EX, same('4 livres : 4! = 24 rangements')),
    },
  },
  'cnt-arrangements': {
    goal: t('Forme tous les mots de 2 lettres différentes avec A, B, C, D.', 'Make every 2-letter word (different letters) from A, B, C, D.', 'كوّن كل الكلمات من حرفين مختلفين.', 'Forma todas las palabras de 2 letras distintas.'),
    manip: { kind: 'arrange', letters: ['A', 'B', 'C', 'D'], length: 2 },
    lesson: {
      points: [
        t('Choisir k éléments **dans l’ordre**, sans répétition, parmi n : **n × (n − 1) × … × (n − k + 1)** (un **arrangement**).', 'Choosing k items **in order**, no repetition, from n: **n × (n − 1) × … × (n − k + 1)** (an **ordered selection**).', '**ترتيبة**: n × (n − 1) × … × (n − k + 1).', '**Variación**: n × (n − 1) × … × (n − k + 1).'),
        t('Question à se poser : **l’ordre compte-t-il ?** (podium, code, mot : oui).', 'Ask yourself: **does the order matter?** (podium, code, word: yes).', '**هل الترتيب مهم؟**', '**¿Importa el orden?**'),
      ],
      example: ex(EX, same('Podium parmi 8 coureurs : 8 × 7 × 6 = 336')),
    },
  },
  'cnt-combinations': {
    goal: t('5 personnes : relie chaque paire une fois pour faire toutes les poignées de main.', '5 people: link every pair once to make all the handshakes.', '5 أشخاص: اربط كل زوج مرة.', '5 personas: une cada pareja una vez.'),
    manip: { kind: 'handshake', n: 5 },
    lesson: {
      points: [
        t('Choisir k éléments **sans ordre** parmi n : **(n parmi k) = n! / (k! (n − k)!)** (une **combinaison**).', 'Choosing k items **without order** from n: **C(n, k) = n! / (k! (n − k)!)** (a **combination**).', '**تأليفة**: C(n, k) = n! / (k! (n − k)!).', '**Combinación**: C(n, k) = n! / (k! (n − k)!).'),
        t('C’est le nombre d’arrangements **divisé par k!** (on oublie l’ordre). (n parmi 2) = n(n − 1)/2.', 'It is the number of ordered selections **divided by k!** (order forgotten). C(n, 2) = n(n − 1)/2.', 'الترتيبات **مقسومة على k!**.', 'Las variaciones **divididas por k!**.'),
      ],
      example: ex(EX, same('Équipes de 3 parmi 6 : (6 × 5 × 4) ÷ 3! = 20')),
    },
  },
  'cnt-lists': {
    lesson: {
      points: [
        t('Avec **répétition** et ordre : **n^k** listes de k éléments pris parmi n.', 'With **repetition** and order: **n^k** lists of k items from n.', 'مع **التكرار**: **n^k**.', 'Con **repetición**: **n^k**.'),
        t('Un ensemble à n éléments a **2ⁿ** parties : pour chaque élément, dedans ou dehors.', 'A set of n elements has **2ⁿ** subsets: each element is in or out.', 'لمجموعة من n عنصرًا **2ⁿ** جزءًا.', 'Un conjunto de n elementos tiene **2ⁿ** subconjuntos.'),
      ],
      example: ex(EX, same('Code à 4 chiffres : 10⁴ = 10 000')),
    },
  },
  // ───────────── Nombres complexes ─────────────
  'cx-algebra': {
    lesson: {
      points: [
        t('ℂ contient un nombre **i** tel que **i² = −1**. Tout complexe s’écrit **z = a + ib** : a partie réelle, b partie imaginaire.', 'ℂ contains a number **i** with **i² = −1**. Every complex is **z = a + ib**: a real part, b imaginary part.', '**i² = −1** و **z = a + ib**.', '**i² = −1**, **z = a + ib**.'),
        t('On calcule comme avec des polynômes en i, puis on remplace **i² par −1**.', 'Calculate as with polynomials in i, then replace **i² by −1**.', 'نحسب ثم نعوض **i² بـ −1**.', 'Calcula y sustituye **i² por −1**.'),
      ],
      example: ex(EX, same('(2 + 3i)(1 − i) = 2 − 2i + 3i − 3i² = 5 + i')),
    },
  },
  'cx-modulus': {
    goal: t('Place le point d’affixe 3 + 4i et lis sa distance à O.', 'Place the point 3 + 4i and read its distance to O.', 'ضع النقطة 3 + 4i.', 'Coloca el punto 3 + 4i.'),
    manip: { kind: 'complex-plane', mode: 'place', a: 3, b: 4 },
    lesson: {
      points: [
        t('z = a + ib est représenté par le point **M(a ; b)**. Son **module |z| = √(a² + b²)** est la distance OM.', 'z = a + ib is the point **M(a, b)**. Its **modulus |z| = √(a² + b²)** is the distance OM.', '**|z| = √(a² + b²)** = OM.', '**|z| = √(a² + b²)** = OM.'),
        t('Le **conjugué z̄ = a − ib** est le symétrique par rapport à l’axe réel ; **z z̄ = |z|²**.', 'The **conjugate z̄ = a − ib** is the reflection in the real axis; **z z̄ = |z|²**.', '**المرافق z̄ = a − ib** و **z z̄ = |z|²**.', '**Conjugado z̄ = a − ib**, **z z̄ = |z|²**.'),
      ],
      example: ex(EX, same('|3 + 4i| = 5 ; (3 + 4i)(3 − 4i) = 25')),
    },
  },
  'cx-powers': {
    goal: t('Multiplie 2 + i par i quatre fois de suite et observe le point.', 'Multiply 2 + i by i four times in a row and watch the point.', 'اضرب 2 + i في i أربع مرات.', 'Multiplica 2 + i por i cuatro veces.'),
    manip: { kind: 'complex-plane', mode: 'rotate', a: 2, b: 1 },
    lesson: {
      points: [
        t('**i² = −1, i³ = −i, i⁴ = 1** : les puissances de i reviennent tous les 4.', '**i² = −1, i³ = −i, i⁴ = 1**: powers of i repeat every 4.', '**i⁴ = 1**: دورة من 4.', '**i⁴ = 1**: ciclo de 4.'),
        t('Pour iⁿ, on prend **le reste de n ÷ 4**. Géométriquement, × i est un **quart de tour**.', 'For iⁿ, use **the remainder of n ÷ 4**. Geometrically, × i is a **quarter turn**.', '**باقي n ÷ 4**.', '**Resto de n ÷ 4**.'),
      ],
      example: ex(EX, same('i²⁰²⁶ : 2026 = 4 × 506 + 2 → i²⁰²⁶ = i² = −1')),
    },
  },
  'cx-quadratic': {
    lesson: {
      points: [
        t('Si **Δ < 0**, az² + bz + c = 0 a **deux solutions complexes conjuguées** : **z = (−b ± i√(−Δ)) / 2a**.', 'If **Δ < 0**, az² + bz + c = 0 has **two complex conjugate solutions**: **z = (−b ± i√(−Δ)) / 2a**.', 'إذا **Δ < 0**: حلان عقديان مترافقان.', 'Si **Δ < 0**: dos soluciones conjugadas.'),
        t('Dans ℂ, un trinôme a **toujours** des racines.', 'In ℂ, a quadratic **always** has roots.', 'في ℂ للمعادلة **دائمًا** حلول.', 'En ℂ **siempre** hay raíces.'),
      ],
      example: ex(EX, same('z² − 2z + 5 = 0 : Δ = −16 → z = 1 − 2i ou 1 + 2i')),
    },
  },
  // ───────────── Équations différentielles ─────────────
  'de-exp': {
    goal: t('y′ = y et y(0) = 1 : avance pas à pas en suivant la pente (égale à y). Compare avec la vraie courbe.', 'y′ = y and y(0) = 1: step forward following the slope (equal to y). Compare with the true curve.', 'تقدم خطوة بخطوة باتباع الميل.', 'Avanza paso a paso siguiendo la pendiente.'),
    manip: { kind: 'euler', a: 1, y0: 1, h: 0.25, steps: 4 },
    lesson: {
      points: [
        t('Une **équation différentielle** relie une fonction inconnue y et sa dérivée y′.', 'A **differential equation** links an unknown function y and its derivative y′.', '**معادلة تفاضلية** تربط y و y′.', 'Una **ecuación diferencial** relaciona y e y′.'),
        t('Les solutions de **y′ = ay** sont les fonctions **y = C e^(ax)** ; une condition initiale y(0) = y₀ donne **C = y₀**.', 'The solutions of **y′ = ay** are **y = C e^(ax)**; an initial condition y(0) = y₀ gives **C = y₀**.', 'حلول **y′ = ay** هي **y = C e^(ax)**.', 'Las soluciones de **y′ = ay**: **y = C e^(ax)**.'),
      ],
      example: ex(EX, same('y′ = 3y, y(0) = 2 → y = 2e^(3x)')),
    },
  },
  'de-affine': {
    lesson: {
      points: [
        t('**y′ = ay + b** (a ≠ 0) a une **solution constante** y = −b/a (là où y′ = 0).', '**y′ = ay + b** (a ≠ 0) has a **constant solution** y = −b/a (where y′ = 0).', '**الحل الثابت** y = −b/a.', '**Solución constante** y = −b/a.'),
        t('Toutes les solutions : **y = C e^(ax) − b/a**. Si a < 0, elles tendent vers −b/a (équilibre).', 'All solutions: **y = C e^(ax) − b/a**. If a < 0, they tend to −b/a (equilibrium).', '**y = C e^(ax) − b/a**.', '**y = C e^(ax) − b/a**.'),
      ],
      example: ex(EX, same('y′ = −2y + 6 → y = Ce^(−2x) + 3, tend vers 3')),
    },
  },
  'de-check': {
    lesson: {
      points: [
        t('Pour vérifier qu’une fonction f est solution : on **calcule f′**, puis on compare avec le **second membre** (ay + b avec y = f).', 'To check f is a solution: **compute f′**, then compare with the **right-hand side** (ay + b with y = f).', 'نحسب **f′** ونقارن.', 'Calcula **f′** y compara.'),
        t('Il faut l’égalité **pour tout x**, pas seulement en un point.', 'The equality must hold **for every x**, not just at one point.', 'المساواة **لكل x**.', 'La igualdad **para todo x**.'),
      ],
      example: ex(EX, same('f(x) = e^(2x) + 1 : f′ = 2e^(2x) = 2f − 2 → solution de y′ = 2y − 2')),
    },
  },
  'de-model': {
    goal: t('y′ = −0,5y et y(0) = 4 : avance pas à pas et compare avec la décroissance exponentielle.', 'y′ = −0.5y and y(0) = 4: step forward and compare with exponential decay.', 'y′ = −0,5y: تقدم خطوة بخطوة.', 'y′ = −0,5y: avanza paso a paso.'),
    manip: { kind: 'euler', a: -0.5, y0: 4, h: 0.5, steps: 6 },
    lesson: {
      points: [
        t('« La vitesse de variation est **proportionnelle** à la quantité » se traduit par **y′ = ky** : refroidissement, radioactivité, médicament…', '“The rate of change is **proportional** to the amount” means **y′ = ky**: cooling, radioactivity, medicine…', '« السرعة **متناسبة** مع الكمية »: **y′ = ky**.', '«Proporcional a la cantidad»: **y′ = ky**.'),
        t('Avec k < 0, la quantité **décroît exponentiellement** : y(t) = y₀ e^(kt).', 'With k < 0, the amount **decays exponentially**: y(t) = y₀ e^(kt).', 'إذا k < 0 **تناقص أسي**.', 'Si k < 0, **decrece exponencialmente**.'),
      ],
      example: ex(EX, same('y′ = −0,1y, y(0) = 80 → y(10) = 80e⁻¹ ≈ 29,43')),
    },
  },
};
