// Introductions de la famille « Calcul littéral et fonctions » : expressions, calcul littéral, identités
// remarquables, équations (6e), inéquations, systèmes, fonctions affines, suites et dérivation (lycée).
// Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const ALGEBRE_INTROS: Record<string, Intro> = {
  // ───────────── Expressions littérales (6e, 6.EE) ─────────────
  'expr-evaluate': {
    goal: t('La machine fait « × 7, puis + 1 ». Règle le nombre d’entrée pour que la machine affiche 36.', 'The machine does “× 7, then + 1”. Set the input so the machine shows 36.', 'الآلة تجري « × 7 ثم + 1 ». اختر العدد المدخل لتعرض 36.', 'La máquina hace «× 7 y luego + 1». Ajusta la entrada para obtener 36.'),
    manip: { kind: 'machine', ops: [{ op: '×', k: 7 }, { op: '+', k: 1 }], target: 36, min: 0, max: 10 },
    lesson: {
      points: [
        t('Une expression comme **7x + 1** est un programme de calcul : on **remplace x** par un nombre, puis on calcule.', 'An expression like **7x + 1** is a calculation recipe: **replace x** with a number, then calculate.', 'التعبير **7x + 1** برنامج حساب: **نعوّض x** بعدد ثم نحسب.', 'Una expresión como **7x + 1** es un programa: **sustituye x** y calcula.'),
        t('On respecte les priorités : 7x + 1 pour x = 5 donne 7 × 5 + 1 = 36.', 'Respect the order of operations: 7x + 1 for x = 5 gives 7 × 5 + 1 = 36.', 'نحترم الأولويات: 7 × 5 + 1 = 36.', 'Respeta las prioridades: 7 × 5 + 1 = 36.'),
      ],
      example: ex(EX, t('2(y + 5) pour y = 4 : 2 × (4 + 5) = 2 × 9 = 18.', '2(y + 5) for y = 4: 2 × (4 + 5) = 18.', '2 × (4 + 5) = 18.', '2 × (4 + 5) = 18.')),
    },
  },
  'expr-conventions': {
    lesson: {
      points: [
        t('On peut **supprimer le signe ×** devant une lettre ou une parenthèse : 7 × a = **7a**, 3 × (x + 1) = 3(x + 1).', 'You can **drop the × sign** before a letter or bracket: 7 × a = **7a**.', 'يمكن **حذف ×** أمام حرف أو قوس: 7 × a = **7a**.', 'Se puede **quitar ×** delante de una letra: 7 × a = **7a**.'),
        t('a × a = **a²**, a × a × a = **a³**. Piège : **2a ≠ a²** (pour a = 3 : 2a = 6 mais a² = 9).', 'a × a = **a²**. Trap: **2a ≠ a²** (a = 3: 2a = 6 but a² = 9).', 'a × a = **a²**. فخ: **2a ≠ a²**.', 'a × a = **a²**. Trampa: **2a ≠ a²**.'),
      ],
      example: ex(EX, t('5 × x × x = 5x² · 4 × y × 2 = 8y', '5 × x × x = 5x² · 4 × y × 2 = 8y', '5x² · 8y', '5x² · 8y')),
    },
  },
  'expr-reduce': {
    goal: t('Range les tuiles : les x avec les x, les nombres avec les nombres.', 'Sort the tiles: x with x, numbers with numbers.', 'رتّب البطاقات: x مع x والأعداد مع الأعداد.', 'Ordena las fichas: x con x, números con números.'),
    manip: { kind: 'collect', terms: [{ c: 7, x: true }, { c: 3, x: false }, { c: 2, x: true }, { c: 4, x: false }] },
    lesson: {
      points: [
        t('Réduire, c’est **regrouper les termes de même nature** : 7x + 2x = 9x (7 x plus 2 x font 9 x).', 'Simplifying means **grouping like terms**: 7x + 2x = 9x.', 'الاختزال هو **تجميع الحدود المتشابهة**: 7x + 2x = 9x.', 'Reducir es **agrupar términos semejantes**: 7x + 2x = 9x.'),
        t('On **ne mélange pas** les x et les nombres seuls : 5x + 4 reste 5x + 4 (≠ 9x).', 'You **can’t mix** x terms and plain numbers: 5x + 4 stays 5x + 4 (≠ 9x).', '**لا نخلط** x مع الأعداد: 5x + 4 ≠ 9x.', '**No se mezclan** x y números: 5x + 4 ≠ 9x.'),
      ],
      example: ex(EX, t('7x + 3 + 2x + 4 = 9x + 7', '7x + 3 + 2x + 4 = 9x + 7', '7x + 3 + 2x + 4 = 9x + 7', '7x + 3 + 2x + 4 = 9x + 7')),
    },
  },
  'expr-distribute': {
    goal: t('Un rectangle de largeur 3 et de longueur x + 4. Touche chaque morceau pour trouver son aire.', 'A rectangle 3 wide and x + 4 long. Tap each piece to find its area.', 'مستطيل عرضه 3 وطوله x + 4. المس كل جزء لتجد مساحته.', 'Un rectángulo de 3 por x + 4. Toca cada trozo para ver su área.'),
    manip: { kind: 'tiles', rows: { x: 0, u: 3 }, cols: { x: 1, u: 4 } },
    lesson: {
      points: [
        t('**Distributivité** : k(a + b) = ka + kb. Le facteur multiplie **chaque** terme de la parenthèse.', '**Distributive law**: k(a + b) = ka + kb. The factor multiplies **each** term.', '**التوزيعية**: k(a + b) = ka + kb.', '**Distributiva**: k(a + b) = ka + kb.'),
        t('Dans l’autre sens, c’est **factoriser** : 6x + 30 = 6(x + 5).', 'The other way round is **factorising**: 6x + 30 = 6(x + 5).', 'في الاتجاه الآخر **نعمّل**: 6x + 30 = 6(x + 5).', 'Al revés es **factorizar**: 6x + 30 = 6(x + 5).'),
      ],
      example: ex(EX, t('3(x + 4) = 3x + 12 · 6 × 102 = 6 × 100 + 6 × 2 = 612', '3(x + 4) = 3x + 12 · 6 × 102 = 612', '3(x + 4) = 3x + 12', '3(x + 4) = 3x + 12')),
    },
  },
  // ───────────── Équations (6e, 6.EE) ─────────────
  'eq-test': {
    lesson: {
      points: [
        t('Une **solution** d’une équation est une valeur de x qui rend l’égalité **vraie**.', 'A **solution** of an equation is a value of x that makes it **true**.', '**حل** المعادلة قيمة لـ x تجعل المتساوية **صحيحة**.', 'Una **solución** es un valor de x que hace la igualdad **cierta**.'),
        t('Pour tester : on **remplace x** dans les deux membres et on compare.', 'To test: **substitute x** into both sides and compare.', 'للاختبار: **نعوّض x** في الطرفين ونقارن.', 'Para comprobar: **sustituye x** y compara.'),
      ],
      example: ex(t('Exemple : 5x + 5 = 15', 'Example: 5x + 5 = 15', 'مثال: 5x + 5 = 15', 'Ejemplo: 5x + 5 = 15'), t('x = 1 : 5 + 5 = 10 ≠ 15 ✗ · x = 2 : 10 + 5 = 15 ✓', 'x = 1: 10 ≠ 15 ✗ · x = 2: 15 = 15 ✓', 'x = 2: 15 = 15 ✓', 'x = 2: 15 = 15 ✓')),
    },
  },
  'eq-add': {
    goal: t('Balance : x + 5 = 12. Retire ce qu’il faut des deux côtés pour isoler la boîte.', 'Scale: x + 5 = 12. Take off what you need from both sides to leave the box alone.', 'ميزان: x + 5 = 12. أزل ما يلزم من الجهتين.', 'Balanza: x + 5 = 12. Quita lo necesario de ambos lados.'),
    manip: { kind: 'balance', left: { x: 1, u: 5 }, right: { x: 0, u: 12 } },
    lesson: {
      points: [
        t('Pour résoudre x + a = b, on **enlève a des deux côtés** : x = b − a.', 'To solve x + a = b, **subtract a from both sides**: x = b − a.', 'لحل x + a = b **نطرح a من الطرفين**.', 'Para x + a = b, **resta a en ambos lados**.'),
        t('Pour x − a = b, on **ajoute a** : x = b + a.', 'For x − a = b, **add a**: x = b + a.', 'لحل x − a = b **نضيف a**.', 'Para x − a = b, **suma a**.'),
      ],
      example: ex(EX, t('x + 23 = 29 → x = 29 − 23 = 6 · x − 11 = 5 → x = 16', 'x + 23 = 29 → x = 6 · x − 11 = 5 → x = 16', 'x = 6 · x = 16', 'x = 6 · x = 16')),
    },
  },
  'eq-mult': {
    goal: t('Balance : 3 boîtes x pèsent 12 billes. Partage pour trouver une boîte.', 'Scale: 3 boxes x weigh 12 marbles. Share to find one box.', 'ميزان: 3 علب تزن 12 كرة. اقسم لتجد علبة.', 'Balanza: 3 cajas pesan 12 canicas. Reparte.'),
    manip: { kind: 'balance', left: { x: 3, u: 0 }, right: { x: 0, u: 12 } },
    lesson: {
      points: [
        t('Pour résoudre a × x = b, on **divise par a** : x = b ÷ a.', 'To solve a × x = b, **divide by a**: x = b ÷ a.', 'لحل a × x = b **نقسم على a**.', 'Para a × x = b, **divide entre a**.'),
        t('Pour x ÷ a = b, on **multiplie par a** : x = b × a.', 'For x ÷ a = b, **multiply by a**: x = b × a.', 'لحل x ÷ a = b **نضرب في a**.', 'Para x ÷ a = b, **multiplica por a**.'),
      ],
      example: ex(EX, t('7x = 14 → x = 2 · x ÷ 4 = 2 → x = 8', '7x = 14 → x = 2 · x ÷ 4 = 2 → x = 8', 'x = 2 · x = 8', 'x = 2 · x = 8')),
    },
  },
  'eq-problem': {
    goal: t('Méthode de Singapour : je pense à un nombre, je le multiplie par 4 et j’ajoute 2 ; j’obtiens 30. Les 4 barres égales représentent 4 fois le nombre.', 'Singapore method: I think of a number, multiply by 4 and add 2; I get 30. The 4 equal bars stand for 4 times the number.', 'طريقة سنغافورة: أضرب عددًا في 4 وأضيف 2 فأحصل على 30.', 'Método de Singapur: multiplico un número por 4 y sumo 2; obtengo 30.'),
    manip: { kind: 'bars', parts: 4, extra: 2, total: 30, unit: '' },
    lesson: {
      points: [
        t('On **dessine** d’abord : une barre par fois le nombre, plus le morceau connu.', '**Draw** first: one bar per copy of the number, plus the known piece.', '**نرسم** أولًا: شريط لكل مرة، ثم الجزء المعلوم.', '**Dibuja** primero: una barra por cada vez, más la parte conocida.'),
        t('Puis on **remonte** le calcul : on enlève le morceau connu, on partage.', 'Then **work backwards**: remove the known piece, then share.', 'ثم **نرجع** بالحساب.', 'Luego **deshaz** el cálculo.'),
      ],
      example: ex(EX, t('4x + 2 = 30 → 4x = 28 → x = 7', '4x + 2 = 30 → 4x = 28 → x = 7', '4x = 28 → x = 7', '4x = 28 → x = 7')),
    },
  },
  // ───────────── Calcul littéral (4e) ─────────────
  'lit-reduce': {
    goal: t('Range les tuiles de 7x + 1 − 3x + 1 : les x ensemble, les nombres ensemble.', 'Sort the tiles of 7x + 1 − 3x + 1: x with x, numbers with numbers.', 'رتّب بطاقات 7x + 1 − 3x + 1.', 'Ordena las fichas de 7x + 1 − 3x + 1.'),
    manip: { kind: 'collect', terms: [{ c: 7, x: true }, { c: 1, x: false }, { c: -3, x: true }, { c: 1, x: false }] },
    lesson: {
      points: [
        t('On regroupe les **termes semblables** en gardant leur signe : 7x − 3x = 4x.', 'Group **like terms**, keeping their sign: 7x − 3x = 4x.', 'نجمع **الحدود المتشابهة** مع إشاراتها.', 'Agrupa **términos semejantes** con su signo.'),
        t('x × 5x = 5x² : on **multiplie**, on n’additionne pas.', 'x × 5x = 5x²: **multiply**, don’t add.', 'x × 5x = 5x²: **نضرب** ولا نجمع.', 'x × 5x = 5x²: **multiplica**, no sumes.'),
      ],
      example: ex(EX, t('7x + 1 − 3x + 1 = 4x + 2', '7x + 1 − 3x + 1 = 4x + 2', '4x + 2', '4x + 2')),
    },
  },
  'lit-minus': {
    lesson: {
      points: [
        t('Un **signe − devant une parenthèse** change le signe de **chaque** terme : −(7x − 1) = −7x + 1.', 'A **minus before brackets** flips the sign of **every** term: −(7x − 1) = −7x + 1.', '**الإشارة − أمام القوس** تغير إشارة **كل** حد.', 'Un **− delante del paréntesis** cambia **todos** los signos.'),
        t('Avec un nombre devant : 5 − 2(x − 5) = 5 − 2x + 10 = 15 − 2x (−2 × −5 = +10).', 'With a number: 5 − 2(x − 5) = 5 − 2x + 10 = 15 − 2x.', '5 − 2(x − 5) = 15 − 2x.', '5 − 2(x − 5) = 15 − 2x.'),
      ],
      example: ex(EX, t('−(3x + 4) = −3x − 4 · 8 − (x − 2) = 10 − x', '−(3x + 4) = −3x − 4 · 8 − (x − 2) = 10 − x', '−(3x + 4) = −3x − 4', '−(3x + 4) = −3x − 4')),
    },
  },
  'lit-double': {
    goal: t('Le rectangle mesure (x + 3) sur (x + 2). Touche chaque morceau pour révéler son aire, puis additionne.', 'The rectangle is (x + 3) by (x + 2). Tap each piece to reveal its area, then add them up.', 'المستطيل بُعداه (x + 3) و (x + 2). المس كل جزء لتكشف مساحته.', 'El rectángulo mide (x + 3) por (x + 2). Toca cada trozo.'),
    manip: { kind: 'tiles', rows: { x: 1, u: 2 }, cols: { x: 1, u: 3 } },
    lesson: {
      points: [
        t('**(a + b)(c + d) = ac + ad + bc + bd** : chaque terme de la 1ʳᵉ parenthèse multiplie chaque terme de la 2ᵉ.', '**(a + b)(c + d) = ac + ad + bc + bd**: each term multiplies each term.', '**(a + b)(c + d) = ac + ad + bc + bd**.', '**(a + b)(c + d) = ac + ad + bc + bd**.'),
        t('C’est l’aire d’un rectangle découpé en 4 morceaux. Ensuite, on réduit.', 'It is the area of a rectangle cut into 4 pieces. Then simplify.', 'إنها مساحة مستطيل مقسم إلى 4 أجزاء.', 'Es el área de un rectángulo en 4 trozos.'),
      ],
      example: ex(EX, t('(x + 3)(x + 2) = x² + 2x + 3x + 6 = x² + 5x + 6', '(x + 3)(x + 2) = x² + 2x + 3x + 6 = x² + 5x + 6', 'x² + 5x + 6', 'x² + 5x + 6')),
    },
  },
  'lit-factor': {
    lesson: {
      points: [
        t('**Factoriser**, c’est trouver le **facteur commun** et l’écrire devant : 7x + 14 = 7(x + 2).', '**Factorising** means finding the **common factor** and putting it in front: 7x + 14 = 7(x + 2).', '**التعميل**: نجد **العامل المشترك**.', '**Factorizar**: busca el **factor común**.'),
        t('On vérifie en redéveloppant. Piège : **(x + 2)² ≠ x² + 4**.', 'Check by expanding again. Trap: **(x + 2)² ≠ x² + 4**.', 'نتحقق بالنشر. فخ: **(x + 2)² ≠ x² + 4**.', 'Comprueba desarrollando. Trampa: **(x + 2)² ≠ x² + 4**.'),
      ],
      example: ex(EX, t('x² + 5x = x × x + 5 × x = x(x + 5)', 'x² + 5x = x × x + 5 × x = x(x + 5)', 'x(x + 5)', 'x(x + 5)')),
    },
  },
  // ───────────── Identités remarquables (3e) ─────────────
  'id-square-sum': {
    goal: t('Le carré a pour côté x + 3. Touche les morceaux : combien de bandes « 3x » y a-t-il ?', 'The square has side x + 3. Tap the pieces: how many “3x” strips are there?', 'ضلع المربع x + 3. كم شريطًا « 3x » يوجد؟', 'El cuadrado tiene lado x + 3. ¿Cuántas bandas «3x» hay?'),
    manip: { kind: 'tiles', rows: { x: 1, u: 3 }, cols: { x: 1, u: 3 } },
    lesson: {
      points: [
        t('**(a + b)² = a² + 2ab + b²**. Le **double produit 2ab** est le morceau qu’on oublie.', '**(a + b)² = a² + 2ab + b²**. The **middle term 2ab** is the one people forget.', '**(a + b)² = a² + 2ab + b²**.', '**(a + b)² = a² + 2ab + b²**.'),
        t('Calcul mental : 107² = (100 + 7)² = 10 000 + 1 400 + 49 = 11 449.', 'Mental maths: 107² = (100 + 7)² = 11,449.', '107² = 11449.', '107² = 11 449.'),
      ],
      example: ex(EX, t('(x + 3)² = x² + 6x + 9', '(x + 3)² = x² + 6x + 9', '(x + 3)² = x² + 6x + 9', '(x + 3)² = x² + 6x + 9')),
    },
  },
  'id-square-diff': {
    lesson: {
      points: [
        t('**(a − b)² = a² − 2ab + b²** : le double produit est **soustrait**, b² reste positif.', '**(a − b)² = a² − 2ab + b²**: the middle term is **subtracted**, b² stays positive.', '**(a − b)² = a² − 2ab + b²**.', '**(a − b)² = a² − 2ab + b²**.'),
        t('Attention au coefficient : (2x)² = 4x², pas 2x².', 'Watch the coefficient: (2x)² = 4x², not 2x².', '(2x)² = 4x².', '(2x)² = 4x².'),
      ],
      example: ex(EX, t('(2x − 7)² = 4x² − 28x + 49', '(2x − 7)² = 4x² − 28x + 49', '4x² − 28x + 49', '4x² − 28x + 49')),
    },
  },
  'id-product': {
    lesson: {
      points: [
        t('**(a + b)(a − b) = a² − b²** : les deux doubles produits s’annulent.', '**(a + b)(a − b) = a² − b²**: the middle terms cancel.', '**(a + b)(a − b) = a² − b²**.', '**(a + b)(a − b) = a² − b²**.'),
        t('Calcul mental : 41 × 39 = (40 + 1)(40 − 1) = 1 600 − 1 = 1 599.', 'Mental maths: 41 × 39 = (40 + 1)(40 − 1) = 1,599.', '41 × 39 = 1599.', '41 × 39 = 1 599.'),
      ],
      example: ex(EX, t('(x + 9)(x − 9) = x² − 81', '(x + 9)(x − 9) = x² − 81', 'x² − 81', 'x² − 81')),
    },
  },
  'id-factor': {
    goal: t('On a les morceaux de x² + 6x + 9. Choisis k pour les ranger en un carré (x + k)².', 'You have the pieces of x² + 6x + 9. Choose k to arrange them into a square (x + k)².', 'لديك قطع x² + 6x + 9. اختر k لترتيبها في مربع.', 'Tienes las piezas de x² + 6x + 9. Elige k para formar un cuadrado.'),
    manip: { kind: 'square-build', b: 6, c: 9 },
    lesson: {
      points: [
        t('On **reconnaît** une identité : a² − b² = (a − b)(a + b) ; a² + 2ab + b² = (a + b)².', '**Spot** an identity: a² − b² = (a − b)(a + b); a² + 2ab + b² = (a + b)².', '**نتعرف** على متطابقة.', '**Reconoce** una identidad.'),
        t('Ou un **facteur commun**, même entre parenthèses : (x + 1)² − 3(x + 1) = (x + 1)(x + 1 − 3).', 'Or a **common factor**, even in brackets: (x + 1)² − 3(x + 1) = (x + 1)(x − 2).', 'أو **عاملًا مشتركًا** بين قوسين.', 'O un **factor común** entre paréntesis.'),
      ],
      example: ex(EX, t('x² − 81 = (x − 9)(x + 9) · x² + 4x + 4 = (x + 2)²', 'x² − 81 = (x − 9)(x + 9) · x² + 4x + 4 = (x + 2)²', '(x − 9)(x + 9) · (x + 2)²', '(x − 9)(x + 9) · (x + 2)²')),
    },
  },
  // ───────────── Inéquations et équation produit (3e) ─────────────
  'ineq-solve': {
    goal: t('Teste des valeurs de x dans 2x − 1 < 5 : lesquelles marchent ? Colorie au moins six essais.', 'Test values of x in 2x − 1 < 5: which work? Try at least six.', 'جرّب قيمًا لـ x في 2x − 1 < 5.', 'Prueba valores de x en 2x − 1 < 5.'),
    manip: { kind: 'test-values', a: 2, b: -1, c: 5, sign: '<', min: -2, max: 6 },
    lesson: {
      points: [
        t('On résout une inéquation **comme une équation** : on ajoute, on soustrait, on divise par un positif.', 'Solve an inequality **like an equation**: add, subtract, divide by a positive.', 'نحل المتراجحة **كالمعادلة**.', 'Se resuelve **como una ecuación**.'),
        t('Les solutions forment un **intervalle** : x < 3, tous les nombres à gauche de 3 sur la droite.', 'The solutions form an **interval**: x < 3, every number left of 3.', 'الحلول **مجال**: x < 3.', 'Las soluciones forman un **intervalo**: x < 3.'),
      ],
      example: ex(EX, t('5x − 1 < −21 → 5x < −20 → x < −4', '5x − 1 < −21 → 5x < −20 → x < −4', 'x < −4', 'x < −4')),
    },
  },
  'ineq-flip': {
    goal: t('Teste des valeurs de x dans −2x > 4. Les solutions sont-elles à droite ou à gauche ?', 'Test values of x in −2x > 4. Are the solutions to the right or the left?', 'جرّب قيمًا في −2x > 4. هل الحلول يمينًا أم يسارًا؟', 'Prueba valores en −2x > 4. ¿Las soluciones están a la derecha o a la izquierda?'),
    manip: { kind: 'test-values', a: -2, b: 0, c: 4, sign: '>', min: -5, max: 3 },
    lesson: {
      points: [
        t('**Multiplier ou diviser par un négatif change le sens** de l’inégalité.', '**Multiplying or dividing by a negative flips** the inequality.', '**الضرب أو القسمة على سالب يغير الاتجاه**.', '**Multiplicar o dividir entre un negativo invierte** el sentido.'),
        t('Ajouter ou soustraire ne change jamais le sens.', 'Adding or subtracting never flips it.', 'الجمع والطرح لا يغيران الاتجاه.', 'Sumar o restar nunca lo cambia.'),
      ],
      example: ex(EX, t('−5x > 25 → x < −5 (÷ (−5), le sens change)', '−5x > 25 → x < −5 (÷ (−5), the sign flips)', 'x < −5', 'x < −5')),
    },
  },
  'ineq-product': {
    lesson: {
      points: [
        t('**Un produit est nul si et seulement si l’un de ses facteurs est nul.**', '**A product is zero exactly when one of its factors is zero.**', '**الجداء منعدم إذا وفقط إذا انعدم أحد عوامله.**', '**Un producto es cero si y solo si un factor es cero.**'),
        t('(x − 7)(x + 1) = 0 ⇔ x − 7 = 0 ou x + 1 = 0 : deux équations simples.', '(x − 7)(x + 1) = 0 ⇔ x − 7 = 0 or x + 1 = 0: two simple equations.', 'نحصل على معادلتين بسيطتين.', 'Dos ecuaciones sencillas.'),
      ],
      example: ex(EX, t('(x − 7)(x + 1) = 0 : x = 7 ou x = −1 · x(3x − 3) = 0 : x = 0 ou x = 1', '(x − 7)(x + 1) = 0: x = 7 or x = −1 · x(3x − 3) = 0: x = 0 or x = 1', 'x = 7 أو x = −1', 'x = 7 o x = −1')),
    },
  },
  'ineq-square-diff': {
    lesson: {
      points: [
        t('Pour résoudre x² − a² = 0, on **factorise** : (x − a)(x + a) = 0, puis équation produit.', 'To solve x² − a² = 0, **factorise**: (x − a)(x + a) = 0, then zero product.', 'نعمّل ثم نطبق معادلة الجداء.', 'Factoriza y usa la ecuación producto.'),
        t('Deux solutions opposées : a et −a.', 'Two opposite solutions: a and −a.', 'حلان متقابلان: a و −a.', 'Dos soluciones opuestas: a y −a.'),
      ],
      example: ex(EX, t('x² − 64 = 0 ⇔ (x − 8)(x + 8) = 0 ⇔ x = 8 ou x = −8', 'x² − 64 = 0 ⇔ x = 8 or x = −8', 'x = 8 أو x = −8', 'x = 8 o x = −8')),
    },
  },
  // ───────────── Systèmes (3e) ─────────────
  'sys-check': {
    lesson: {
      points: [
        t('Une solution d’un système est un **couple (x ; y)** qui vérifie **les deux équations à la fois**.', 'A solution of a system is a **pair (x, y)** that satisfies **both equations at once**.', 'حل النظمة **زوج (x ; y)** يحقق **المعادلتين معًا**.', 'Una solución es un **par (x ; y)** que cumple **las dos ecuaciones**.'),
        t('Une seule équation fausse suffit à rejeter le couple.', 'If even one equation fails, the pair is rejected.', 'تكفي معادلة خاطئة واحدة لرفض الزوج.', 'Basta una ecuación falsa para rechazarlo.'),
      ],
      example: ex(t('Exemple : (4 ; −3) et { 2x + 3y = −1 ; 3x − y = 15 }', 'Example: (4, −3) and { 2x + 3y = −1 ; 3x − y = 15 }', 'مثال: (4 ; −3)', 'Ejemplo: (4 ; −3)'), t('8 − 9 = −1 ✓ et 12 + 3 = 15 ✓ : c’est une solution.', '8 − 9 = −1 ✓ and 12 + 3 = 15 ✓: it is a solution.', 'إنه حل.', 'Es solución.')),
    },
  },
  'sys-substitution': {
    goal: t('Système { y = 2x ; x + y = 12 }. Choisis x : y se calcule avec la 1ʳᵉ équation. Trouve le couple qui vérifie aussi la 2ᵉ.', 'System { y = 2x ; x + y = 12 }. Choose x: y comes from the first equation. Find the pair that also fits the second.', 'النظمة { y = 2x ; x + y = 12 }. اختر x وابحث عن الزوج المناسب.', 'Sistema { y = 2x ; x + y = 12 }. Elige x y busca el par que cumple la segunda.'),
    manip: { kind: 'guess', a: 2, b: 0, c: 1, e: 1, d: 12, min: 0, max: 8 },
    lesson: {
      points: [
        t('**Substitution** : on remplace y par son expression dans l’autre équation ; il ne reste que x.', '**Substitution**: replace y by its expression in the other equation; only x is left.', '**التعويض**: نعوّض y في المعادلة الأخرى.', '**Sustitución**: reemplaza y en la otra ecuación.'),
        t('On calcule x, puis y, puis on **vérifie** dans les deux équations.', 'Find x, then y, then **check** both equations.', 'نحسب x ثم y ثم **نتحقق**.', 'Halla x, luego y, y **comprueba**.'),
      ],
      example: ex(EX, t('y = 2x et x + y = 12 → x + 2x = 12 → x = 4, y = 8', 'y = 2x and x + y = 12 → 3x = 12 → x = 4, y = 8', 'x = 4, y = 8', 'x = 4, y = 8')),
    },
  },
  'sys-combination': {
    goal: t('Système { x + y = 10 ; x − y = 4 }. Choisis x : y = 10 − x. Quand la 2ᵉ équation est-elle vraie ?', 'System { x + y = 10 ; x − y = 4 }. Choose x: y = 10 − x. When is the second equation true?', 'النظمة { x + y = 10 ; x − y = 4 }.', 'Sistema { x + y = 10 ; x − y = 4 }.'),
    manip: { kind: 'guess', a: -1, b: 10, c: 1, e: -1, d: 4, min: 0, max: 10 },
    lesson: {
      points: [
        t('**Combinaison** : on ajoute (ou soustrait) les équations pour **éliminer** une inconnue.', '**Elimination**: add (or subtract) the equations to **eliminate** one unknown.', '**التأليفة**: نجمع المعادلتين **لحذف** مجهول.', '**Reducción**: suma las ecuaciones para **eliminar** una incógnita.'),
        t('x + y = 10 et x − y = 4 : en ajoutant, 2x = 14, donc x = 7, puis y = 3.', 'x + y = 10 and x − y = 4: adding gives 2x = 14, so x = 7, then y = 3.', '2x = 14 ← x = 7 و y = 3.', '2x = 14 → x = 7, y = 3.'),
      ],
      example: ex(EX, t('{ x + y = 5 ; x − y = 13 } → 2x = 18 → x = 9, y = −4', '{ x + y = 5 ; x − y = 13 } → x = 9, y = −4', 'x = 9, y = −4', 'x = 9, y = −4')),
    },
  },
  'sys-problem': {
    lesson: {
      points: [
        t('On choisit **deux inconnues** (a adultes, e enfants) et on traduit **deux informations** en deux équations.', 'Choose **two unknowns** (a adults, c children) and turn **two facts** into two equations.', 'نختار **مجهولين** ونترجم **معلومتين** إلى معادلتين.', 'Elige **dos incógnitas** y traduce **dos datos**.'),
        t('Un nombre de personnes donne a + e = … ; un prix total donne 12a + 4e = …', 'A number of people gives a + c = …; a total price gives 12a + 4c = …', 'العدد يعطي a + e والثمن يعطي 12a + 4e.', 'Personas: a + e = …; precio: 12a + 4e = …'),
      ],
      example: ex(EX, t('{ a + e = 23 ; 12a + 4e = 220 } → e = 23 − a → 8a + 92 = 220 → a = 16, e = 7', '{ a + c = 23 ; 12a + 4c = 220 } → a = 16, c = 7', 'a = 16, e = 7', 'a = 16, e = 7')),
    },
  },
  // ───────────── Fonctions affines (3e) ─────────────
  'affine-recognise': {
    lesson: {
      points: [
        t('**f(x) = ax + b** est affine. Si b = 0, f(x) = ax est **linéaire** (proportionnalité).', '**f(x) = ax + b** is affine (linear in the US sense). If b = 0, f(x) = ax is a **proportional** function.', '**f(x) = ax + b** تآلفية؛ إذا b = 0 فهي **خطية**.', '**f(x) = ax + b** es afín; si b = 0 es **lineal**.'),
        t('x², 1/x… ne sont pas affines. f(x) = 7 est affine (a = 0, fonction constante).', 'x², 1/x… are not. f(x) = 7 is (a = 0, constant).', 'x² ليست تآلفية. f(x) = 7 ثابتة.', 'x² no lo es. f(x) = 7 es constante.'),
      ],
      example: ex(EX, t('g(x) = −2x + 3 : a = −2, b = 3 · f(x) = x ÷ 4 : linéaire, a = 1/4', 'g(x) = −2x + 3: a = −2, b = 3 · f(x) = x ÷ 4: a = 1/4', 'a = −2، b = 3', 'a = −2, b = 3')),
    },
  },
  'affine-image': {
    goal: t('La machine f fait « × 3, puis − 5 ». Trouve le nombre d’entrée qui donne 13 : c’est l’antécédent de 13.', 'Machine f does “× 3, then − 5”. Find the input that gives 13: it is the pre-image of 13.', 'الآلة f تجري « × 3 ثم − 5 ». جد المدخل الذي يعطي 13.', 'La máquina f hace «× 3 y − 5». Halla la entrada que da 13.'),
    manip: { kind: 'machine', ops: [{ op: '×', k: 3 }, { op: '−', k: 5 }], target: 13, min: -3, max: 8 },
    lesson: {
      points: [
        t('**Image** : on donne x, on calcule f(x). **Antécédent** : on donne f(x), on cherche x (on résout une équation).', '**Image**: given x, work out f(x). **Pre-image**: given f(x), find x (solve an equation).', '**الصورة**: نحسب f(x). **السابقة**: نحل معادلة.', '**Imagen**: calcula f(x). **Antecedente**: resuelve una ecuación.'),
        t('f(4) = 3 × 4 − 5 = 7 : 7 est l’image de 4, 4 est un antécédent de 7.', 'f(4) = 3 × 4 − 5 = 7: 7 is the image of 4, 4 a pre-image of 7.', '7 صورة 4 و 4 سابقة 7.', '7 es imagen de 4; 4 antecedente de 7.'),
      ],
      example: ex(EX, t('Antécédent de 13 : 3x − 5 = 13 → 3x = 18 → x = 6', 'Pre-image of 13: 3x − 5 = 13 → x = 6', 'x = 6', 'x = 6')),
    },
  },
  'affine-graph': {
    lesson: {
      points: [
        t('La courbe d’une fonction affine est une **droite**. **b** est l’**ordonnée à l’origine** (où la droite coupe l’axe vertical).', 'An affine function’s graph is a **straight line**. **b** is the **y-intercept**.', 'تمثيل الدالة التآلفية **مستقيم**. **b** هو **الأرتوب عند الأصل**.', 'La gráfica es una **recta**. **b** es la **ordenada en el origen**.'),
        t('**a** est le **coefficient directeur** : quand x augmente de 1, y change de a.', '**a** is the **gradient**: when x goes up by 1, y changes by a.', '**a** هو **المعامل الموجه**.', '**a** es la **pendiente**.'),
      ],
      example: ex(EX, t('y = 2x − 3 : passe par (0 ; −3), puis +1 à droite, +2 en haut.', 'y = 2x − 3: through (0, −3), then 1 right, 2 up.', 'يمر بـ (0 ; −3).', 'Pasa por (0 ; −3).')),
    },
  },
  'affine-two-points': {
    lesson: {
      points: [
        t('Avec deux points : **a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁)**, l’accroissement de y divisé par celui de x.', 'From two points: **a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁)**, change in y over change in x.', 'من نقطتين: **a = (f(x₂) − f(x₁)) ÷ (x₂ − x₁)**.', 'Con dos puntos: **a = Δy ÷ Δx**.'),
        t('Puis b avec un point : b = f(x₁) − a × x₁.', 'Then b from one point: b = f(x₁) − a × x₁.', 'ثم b = f(x₁) − a × x₁.', 'Luego b = f(x₁) − a × x₁.'),
      ],
      example: ex(EX, t('f(0) = −4 et f(2) = 0 : a = 4 ÷ 2 = 2, b = −4 → f(x) = 2x − 4', 'f(0) = −4, f(2) = 0: a = 2, b = −4 → f(x) = 2x − 4', 'f(x) = 2x − 4', 'f(x) = 2x − 4')),
    },
  },
  // ───────────── Suites (Terminale) ─────────────
  'seq-nature': {
    goal: t('Construis la suite u₀ = 1, uₙ₊₁ = 2uₙ terme par terme. Ajoute-t-on ou multiplie-t-on toujours la même chose ?', 'Build u₀ = 1, uₙ₊₁ = 2uₙ term by term. Do you always add or always multiply the same thing?', 'كوّن المتتالية u₀ = 1 و uₙ₊₁ = 2uₙ.', 'Construye u₀ = 1, uₙ₊₁ = 2uₙ.'),
    manip: { kind: 'sequence', u0: 1, a: 2, b: 0, n: 6 },
    lesson: {
      points: [
        t('**Arithmétique** : on ajoute toujours r (uₙ = u₀ + n r). **Géométrique** : on multiplie toujours par q (uₙ = u₀ × qⁿ).', '**Arithmetic**: always add r (uₙ = u₀ + nr). **Geometric**: always multiply by q (uₙ = u₀ qⁿ).', '**حسابية**: نضيف r. **هندسية**: نضرب في q.', '**Aritmética**: suma r. **Geométrica**: multiplica por q.'),
        t('Les points d’une suite arithmétique sont **alignés** ; ceux d’une géométrique (q > 1) montent de plus en plus vite.', 'Arithmetic terms lie on a **line**; geometric ones (q > 1) climb faster and faster.', 'نقط المتتالية الحسابية **مستقيمية**.', 'Los puntos aritméticos están **alineados**.'),
      ],
      example: ex(EX, t('u₀ = 1, q = 2 : u₉ = 1 × 2⁹ = 512', 'u₀ = 1, q = 2: u₉ = 2⁹ = 512', 'u₉ = 512', 'u₉ = 512')),
    },
  },
  'seq-recurrence': {
    goal: t('Construis u₀ = 1, uₙ₊₁ = 0,6 uₙ + 2. Vers quelle valeur les termes se rapprochent-ils ?', 'Build u₀ = 1, uₙ₊₁ = 0.6uₙ + 2. What value do the terms approach?', 'كوّن u₀ = 1 و uₙ₊₁ = 0,6 uₙ + 2. نحو أي قيمة تقترب؟', 'Construye u₀ = 1, uₙ₊₁ = 0,6uₙ + 2. ¿A qué valor se acercan?'),
    manip: { kind: 'sequence', u0: 1, a: 0.6, b: 2, n: 8 },
    lesson: {
      points: [
        t('Si (uₙ) converge vers ℓ et uₙ₊₁ = f(uₙ) avec f continue, alors **ℓ = f(ℓ)** (point fixe).', 'If (uₙ) converges to ℓ and uₙ₊₁ = f(uₙ) with f continuous, then **ℓ = f(ℓ)** (fixed point).', 'إذا تقاربت نحو ℓ فإن **ℓ = f(ℓ)**.', 'Si converge a ℓ, entonces **ℓ = f(ℓ)**.'),
        t('Avec vₙ = uₙ − ℓ, la suite (vₙ) est souvent **géométrique**.', 'With vₙ = uₙ − ℓ, (vₙ) is often **geometric**.', 'vₙ = uₙ − ℓ غالبًا **هندسية**.', 'vₙ = uₙ − ℓ suele ser **geométrica**.'),
      ],
      example: ex(EX, t('ℓ = 0,6 ℓ + 2 → 0,4 ℓ = 2 → ℓ = 5 ; vₙ = uₙ − 5 est géométrique de raison 0,6.', 'ℓ = 0.6ℓ + 2 → ℓ = 5; vₙ = uₙ − 5 is geometric with ratio 0.6.', 'ℓ = 5', 'ℓ = 5')),
    },
  },
  'seq-limits': {
    lesson: {
      points: [
        t('Si **q > 1**, qⁿ → +∞. Si **−1 < q < 1**, qⁿ → 0. Si q ≤ −1, pas de limite.', 'If **q > 1**, qⁿ → +∞. If **−1 < q < 1**, qⁿ → 0. If q ≤ −1, no limit.', 'q > 1 ← +∞. −1 < q < 1 ← 0.', 'q > 1 → +∞. −1 < q < 1 → 0.'),
        t('Un **seuil** se trouve avec la calculatrice (ou ln) : plus petit n tel que qⁿ < ε.', 'A **threshold** is found with a calculator (or ln): the smallest n with qⁿ < ε.', '**العتبة** بالآلة الحاسبة أو ln.', 'El **umbral**, con calculadora o ln.'),
      ],
      example: ex(EX, t('0,8ⁿ < 0,05 : n > ln 0,05 ÷ ln 0,8 ≈ 13,4 → n = 14', '0.8ⁿ < 0.05: n > ln 0.05 ÷ ln 0.8 ≈ 13.4 → n = 14', 'n = 14', 'n = 14')),
    },
  },
  'seq-induction': {
    lesson: {
      points: [
        t('**Récurrence** : 1. *Initialisation* : P(0) est vraie. 2. *Hérédité* : si P(n) est vraie, alors P(n + 1) l’est. 3. *Conclusion*.', '**Induction**: 1. *Base case*: P(0) holds. 2. *Inductive step*: P(n) ⇒ P(n + 1). 3. *Conclusion*.', '**الاستدلال بالترجع**: التأسيس، الوراثة، الخلاصة.', '**Inducción**: base, paso inductivo, conclusión.'),
        t('Comme des dominos : le premier tombe, et chacun fait tomber le suivant.', 'Like dominoes: the first falls, and each one knocks over the next.', 'كقطع الدومينو.', 'Como fichas de dominó.'),
      ],
      example: ex(t('Exemple : uₙ ≤ 8 avec uₙ₊₁ = 0,5 uₙ + 4', 'Example: uₙ ≤ 8 with uₙ₊₁ = 0.5uₙ + 4', 'مثال', 'Ejemplo'), t('Si uₙ ≤ 8, alors 0,5 uₙ ≤ 4, donc uₙ₊₁ ≤ 8.', 'If uₙ ≤ 8, then 0.5uₙ ≤ 4, so uₙ₊₁ ≤ 8.', 'إذا uₙ ≤ 8 فإن uₙ₊₁ ≤ 8.', 'Si uₙ ≤ 8, entonces uₙ₊₁ ≤ 8.')),
    },
  },
  // ───────────── Dérivation (Terminale) ─────────────
  'deriv-slope': {
    lesson: {
      points: [
        t('Le **nombre dérivé f′(a)** est la **pente de la tangente** à la courbe au point d’abscisse a.', 'The **derivative f′(a)** is the **slope of the tangent** at x = a.', '**العدد المشتق f′(a)** هو **ميل المماس**.', 'La **derivada f′(a)** es la **pendiente de la tangente**.'),
        t('Tangente horizontale ⇔ **f′(a) = 0** (souvent un maximum ou un minimum).', 'Horizontal tangent ⇔ **f′(a) = 0** (often a max or min).', 'مماس أفقي ⇔ **f′(a) = 0**.', 'Tangente horizontal ⇔ **f′(a) = 0**.'),
      ],
      example: ex(EX, t('f(x) = 0,5x² − 2x : f′(x) = x − 2, nulle en x = 2.', 'f(x) = 0.5x² − 2x: f′(x) = x − 2, zero at x = 2.', 'f′(2) = 0', 'f′(2) = 0')),
    },
  },
  'deriv-rules': {
    lesson: {
      points: [
        t('(uv)′ = u′v + uv′ · (u/v)′ = (u′v − uv′)/v² · (eᵘ)′ = u′eᵘ · (ln u)′ = u′/u', '(uv)′ = u′v + uv′ · (u/v)′ = (u′v − uv′)/v² · (eᵘ)′ = u′eᵘ · (ln u)′ = u′/u', 'قواعد الاشتقاق', 'Reglas de derivación'),
        t('Pour un polynôme : (xⁿ)′ = n xⁿ⁻¹, terme à terme.', 'For a polynomial: (xⁿ)′ = n xⁿ⁻¹, term by term.', '(xⁿ)′ = n xⁿ⁻¹.', '(xⁿ)′ = n xⁿ⁻¹.'),
      ],
      example: ex(EX, t('f(x) = −x² + x − 2 : f′(x) = −2x + 1, f′(−1) = 3 · g(x) = e²ˣ : g′(0) = 2', 'f(x) = −x² + x − 2: f′(−1) = 3 · g(x) = e²ˣ: g′(0) = 2', 'f′(−1) = 3', 'f′(−1) = 3')),
    },
  },
  'deriv-variations': {
    lesson: {
      points: [
        t('**f′ > 0** sur un intervalle ⇒ f **croissante** ; **f′ < 0** ⇒ f **décroissante**.', '**f′ > 0** ⇒ f **increasing**; **f′ < 0** ⇒ f **decreasing**.', '**f′ > 0** ⇒ **تزايدية**؛ **f′ < 0** ⇒ **تناقصية**.', '**f′ > 0** ⇒ **creciente**; **f′ < 0** ⇒ **decreciente**.'),
        t('Si f′ s’annule en **changeant de signe**, f a un **extremum local** en ce point.', 'If f′ is zero and **changes sign**, f has a **local extremum** there.', 'إذا انعدمت f′ **وغيرت إشارتها** فلـ f **قيمة قصوى**.', 'Si f′ se anula **cambiando de signo**, hay un **extremo**.'),
      ],
      example: ex(EX, t('f′ : − puis + en x = 2 → minimum local en x = 2.', 'f′: − then + at x = 2 → local minimum at x = 2.', 'قيمة دنيا في x = 2.', 'Mínimo en x = 2.')),
    },
  },
  'deriv-tangent': {
    lesson: {
      points: [
        t('Tangente au point d’abscisse a : **y = f′(a)(x − a) + f(a)**.', 'Tangent at x = a: **y = f′(a)(x − a) + f(a)**.', 'المماس: **y = f′(a)(x − a) + f(a)**.', 'Tangente: **y = f′(a)(x − a) + f(a)**.'),
        t('Méthode : calcule f(a), puis f′(a), puis remplace et développe.', 'Method: work out f(a), then f′(a), then substitute and expand.', 'احسب f(a) ثم f′(a) ثم عوّض.', 'Calcula f(a), f′(a), sustituye.'),
      ],
      example: ex(EX, t('f(1) = −3, f′(1) = 2 : y = 2(x − 1) − 3 = 2x − 5', 'f(1) = −3, f′(1) = 2: y = 2(x − 1) − 3 = 2x − 5', 'y = 2x − 5', 'y = 2x − 5')),
    },
  },
};
