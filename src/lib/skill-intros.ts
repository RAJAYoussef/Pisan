// Introduction de chaque compétence, sur le modèle de Singapour : « Je manipule » (concret, sans note),
// puis « Je retiens » (la carte de cours : l'idée en deux ou trois phrases et un exemple résolu),
// avant « Je m'entraîne » (les étapes notées par le serveur). Prototype : nombres premiers et équations.
// Données pures, couvertes par src/test/skill-intros.test.ts.
import type { L } from './curriculum';
import { NOMBRES_INTROS } from './skill-intros-nombres';
import { ALGEBRE_INTROS } from './skill-intros-algebre';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });

/** Un plateau de balance : des boîtes x et des unités. */
export type Side = { x: number; u: number };
export type Manip =
  /** Ranger n jetons en rectangles : chaque rectangle donne une paire de diviseurs. */
  | { kind: 'rectangles'; n: number }
  /** Casser n en produits jusqu'à n'avoir que des nombres premiers. */
  | { kind: 'factor-tree'; n: number }
  /** Garder la balance en équilibre : même opération des deux côtés jusqu'à isoler x. */
  | { kind: 'balance'; left: Side; right: Side }
  /** Modèle en barres : `parts` barres égales (l'inconnue) plus un morceau connu `extra`, pour un total. */
  | { kind: 'bars'; parts: number; extra: number; total: number; unit: string; rectangle?: boolean }
  /** Machine à calculer : on règle le nombre d'entrée jusqu'à obtenir la sortie `target`. */
  | { kind: 'machine'; ops: { op: '×' | '+' | '−'; k: number }[]; target: number; min: number; max: number }
  /** Tuiles algébriques : rectangle (x? + u)(x? + u) ; on touche chaque morceau pour révéler son aire. */
  | { kind: 'tiles'; rows: { x: number; u: number }; cols: { x: number; u: number } }
  /** Ranger les morceaux x² + bx + c en carré (x + k)² : on cherche k. */
  | { kind: 'square-build'; b: number; c: number }
  /** Regrouper les termes semblables d'une somme. */
  | { kind: 'collect'; terms: { c: number; x: boolean }[] }
  /** Tester des valeurs de x dans a x + b (signe) c, et voir apparaître l'ensemble des solutions. */
  | { kind: 'test-values'; a: number; b: number; c: number; sign: '<' | '>'; min: number; max: number }
  /** Tableau d'essais pour un système { y = a x + b ; c x + e y = d }. */
  | { kind: 'guess'; a: number; b: number; c: number; e: number; d: number; min: number; max: number }
  /** Construire une suite terme à terme : uₙ₊₁ = a uₙ + b. */
  | { kind: 'sequence'; u0: number; a: number; b: number; n: number }
  /** Sauts sur une droite graduée de `min` à `max`, par pas de `step`, de `start` jusqu'à `target`. */
  | { kind: 'hops'; min: number; max: number; step: number; start: number; target: number }
  /** Jetons + et − : on associe les paires nulles, il reste a + b. */
  | { kind: 'zero-pairs'; a: number; b: number }
  /** Faire des paquets de `by` avec n jetons : quotient et reste. */
  | { kind: 'share'; n: number; by: number }
  /** Tableau de numération : × 10 et ÷ 10 font glisser les chiffres, de `start` jusqu'à `target`. */
  | { kind: 'place-value'; start: number; target: number }
  /** Multiplier `base` par lui-même jusqu'à l'exposant `exponent`. */
  | { kind: 'repeat'; base: number; exponent: number }
  /** Prolonger la suite a × 3, a × 2, a × 1, a × 0… pour chaque a : la règle des signes apparaît. */
  | { kind: 'pattern'; factors: number[]; divide?: boolean }
  /** Construire un carré de jetons d'aire `area` (ou l'encadrer). */
  | { kind: 'square'; area: number };

export type Lesson = { points: L[]; example: { title: L; lines: L[] } };
/** Une compétence a toujours sa carte de cours ; la manipulation est facultative (sinon on commence par le cours). */
export type Intro = { lesson: Lesson; goal?: L; manip?: Manip };

const PROTOTYPE: Record<string, Intro> = {
  // ───────────── Multiples et nombres premiers ─────────────
  'prime-multiples': {
    goal: t('Range les 12 jetons en rectangles bien remplis. Trouve tous les rectangles possibles.', 'Arrange the 12 counters into full rectangles. Find every possible rectangle.', 'رتّب 12 قطعة في مستطيلات ممتلئة. جد كل المستطيلات الممكنة.', 'Ordena las 12 fichas en rectángulos completos. Encuentra todos los posibles.'),
    manip: { kind: 'rectangles', n: 12 },
    lesson: {
      points: [
        t('Si a × b = n, on dit que n est un **multiple** de a, et que a est un **diviseur** de n.', 'If a × b = n, then n is a **multiple** of a, and a is a **factor** of n.', 'إذا كان a × b = n نقول إن n **مضاعف** لـ a و a **قاسم** لـ n.', 'Si a × b = n, n es **múltiplo** de a y a es **divisor** de n.'),
        t('Chaque rectangle de jetons donne une paire de diviseurs : 3 lignes de 4 → 3 × 4 = 12.', 'Each rectangle of counters gives a pair of factors: 3 rows of 4 → 3 × 4 = 12.', 'كل مستطيل يعطي زوجًا من القواسم: 3 صفوف من 4 ← 3 × 4 = 12.', 'Cada rectángulo da un par de divisores: 3 filas de 4 → 3 × 4 = 12.'),
        t('Pour tester, on divise : si le reste est 0, c’est un diviseur.', 'To test, divide: if the remainder is 0, it is a factor.', 'للاختبار نقسم: إذا كان الباقي 0 فهو قاسم.', 'Para comprobar, divide: si el resto es 0, es divisor.'),
      ],
      example: { title: t('Exemple : 36 est-il un multiple de 4 ?', 'Example: is 36 a multiple of 4?', 'مثال: هل 36 مضاعف لـ 4؟', 'Ejemplo: ¿36 es múltiplo de 4?'), lines: [t('36 ÷ 4 = 9, reste 0.', '36 ÷ 4 = 9, remainder 0.', '36 ÷ 4 = 9 والباقي 0.', '36 ÷ 4 = 9, resto 0.'), t('Donc 36 = 4 × 9 : oui, 36 est un multiple de 4.', 'So 36 = 4 × 9: yes, 36 is a multiple of 4.', 'إذن 36 = 4 × 9: نعم.', 'Así 36 = 4 × 9: sí.')] },
    },
  },
  'prime-divisors': {
    goal: t('Avec 18 jetons, trouve tous les rectangles : chacun te donne deux diviseurs de 18.', 'With 18 counters, find every rectangle: each one gives two factors of 18.', 'بـ 18 قطعة، جد كل المستطيلات: كل واحد يعطي قاسمين لـ 18.', 'Con 18 fichas, encuentra todos los rectángulos: cada uno da dos divisores de 18.'),
    manip: { kind: 'rectangles', n: 18 },
    lesson: {
      points: [
        t('On cherche les diviseurs **par paires** : 1 × 18, 2 × 9, 3 × 6.', 'Look for factors **in pairs**: 1 × 18, 2 × 9, 3 × 6.', 'نبحث عن القواسم **أزواجًا**: 1 × 18، 2 × 9، 3 × 6.', 'Busca los divisores **por parejas**: 1 × 18, 2 × 9, 3 × 6.'),
        t('On s’arrête quand les paires se croisent : après 3 × 6 viendrait 6 × 3.', 'Stop when the pairs cross over: after 3 × 6 comes 6 × 3.', 'نتوقف عندما تتقاطع الأزواج.', 'Para cuando las parejas se cruzan.'),
      ],
      example: { title: t('Exemple : les diviseurs de 20', 'Example: the factors of 20', 'مثال: قواسم 20', 'Ejemplo: los divisores de 20'), lines: [t('1 × 20, 2 × 10, 4 × 5 (3 ne marche pas).', '1 × 20, 2 × 10, 4 × 5 (3 does not work).', '1 × 20، 2 × 10، 4 × 5.', '1 × 20, 2 × 10, 4 × 5.'), t('Diviseurs : 1, 2, 4, 5, 10, 20 → 6 diviseurs.', 'Factors: 1, 2, 4, 5, 10, 20 → 6 factors.', 'القواسم: 1، 2، 4، 5، 10، 20.', 'Divisores: 1, 2, 4, 5, 10, 20.')] },
    },
  },
  'prime-recognise': {
    goal: t('Essaie de ranger 13 jetons en rectangle… Combien de rectangles trouves-tu ?', 'Try to arrange 13 counters in a rectangle… How many rectangles can you find?', 'حاول ترتيب 13 قطعة في مستطيل… كم مستطيلًا تجد؟', 'Intenta ordenar 13 fichas en rectángulo… ¿Cuántos encuentras?'),
    manip: { kind: 'rectangles', n: 13 },
    lesson: {
      points: [
        t('Un nombre **premier** a exactement **deux diviseurs** : 1 et lui-même. Ses jetons ne forment qu’une seule ligne.', 'A **prime** number has exactly **two factors**: 1 and itself. Its counters only make one line.', 'العدد **الأولي** له **قاسمان** فقط: 1 ونفسه.', 'Un número **primo** tiene exactamente **dos divisores**: 1 y él mismo.'),
        t('Les premiers nombres premiers : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29…', 'The first primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29…', 'أول الأعداد الأولية: 2، 3، 5، 7، 11، 13…', 'Los primeros primos: 2, 3, 5, 7, 11, 13…'),
        t('1 n’est pas premier (un seul diviseur). Attention aux faux amis : 51 = 3 × 17, 91 = 7 × 13.', '1 is not prime (only one factor). Watch out: 51 = 3 × 17, 91 = 7 × 13.', '1 ليس أوليًا. انتبه: 51 = 3 × 17، 91 = 7 × 13.', '1 no es primo. Cuidado: 51 = 3 × 17, 91 = 7 × 13.'),
      ],
      example: { title: t('Exemple : 39 est-il premier ?', 'Example: is 39 prime?', 'مثال: هل 39 أولي؟', 'Ejemplo: ¿39 es primo?'), lines: [t('Somme des chiffres : 3 + 9 = 12, divisible par 3.', 'Digit sum: 3 + 9 = 12, divisible by 3.', 'مجموع الأرقام 12 يقبل القسمة على 3.', 'Suma de cifras: 12, divisible por 3.'), t('39 = 3 × 13 : il a plus de deux diviseurs, il n’est pas premier.', '39 = 3 × 13: more than two factors, not prime.', '39 = 3 × 13: ليس أوليًا.', '39 = 3 × 13: no es primo.')] },
    },
  },
  'prime-factor': {
    goal: t('Casse 60 en morceaux : touche un nombre et choisis par quoi le diviser, jusqu’à n’avoir que des nombres premiers.', 'Break 60 apart: tap a number and choose what to divide it by, until only primes are left.', 'فكّك 60: المس عددًا واختر القاسم حتى لا يبقى إلا أعداد أولية.', 'Rompe 60: toca un número y elige entre qué dividirlo, hasta tener solo primos.'),
    manip: { kind: 'factor-tree', n: 60 },
    lesson: {
      points: [
        t('Tout nombre s’écrit comme un **produit de nombres premiers**, d’une seule façon (à l’ordre près).', 'Every number is a **product of primes** in exactly one way (up to order).', 'كل عدد يُكتب **جداء أعداد أولية** بطريقة وحيدة.', 'Todo número es un **producto de primos** de una sola forma.'),
        t('Pour simplifier une fraction, on décompose le haut et le bas, puis on barre les facteurs communs.', 'To simplify a fraction, factorise top and bottom, then cancel common factors.', 'لاختزال كسر نفكك البسط والمقام ونختزل العوامل المشتركة.', 'Para simplificar, descompón arriba y abajo y tacha los factores comunes.'),
      ],
      example: { title: t('Exemple : simplifier 12/18', 'Example: simplify 12/18', 'مثال: اختزل 12/18', 'Ejemplo: simplifica 12/18'), lines: [t('12 = 2 × 2 × 3 et 18 = 2 × 3 × 3.', '12 = 2 × 2 × 3 and 18 = 2 × 3 × 3.', '12 = 2 × 2 × 3 و 18 = 2 × 3 × 3.', '12 = 2 × 2 × 3 y 18 = 2 × 3 × 3.'), t('On barre 2 × 3 en haut et en bas : 12/18 = 2/3.', 'Cancel 2 × 3 top and bottom: 12/18 = 2/3.', 'نختزل 2 × 3: 12/18 = 2/3.', 'Se tacha 2 × 3: 12/18 = 2/3.')] },
    },
  },
  // ───────────── Équations du premier degré ─────────────
  'lin-two-step': {
    goal: t('La balance est en équilibre : 3 boîtes x et 2 billes d’un côté, 11 billes de l’autre. Garde-la en équilibre et trouve ce que pèse une boîte.', 'The scale balances: 3 boxes x and 2 marbles on one side, 11 marbles on the other. Keep it balanced and find what one box weighs.', 'الميزان متوازن: 3 علب x وكرتان في جهة و 11 كرة في الأخرى. حافظ على التوازن وجد وزن علبة.', 'La balanza está equilibrada: 3 cajas x y 2 canicas de un lado, 11 del otro. Mantén el equilibrio y halla cuánto pesa una caja.'),
    manip: { kind: 'balance', left: { x: 3, u: 2 }, right: { x: 0, u: 11 } },
    lesson: {
      points: [
        t('Une équation, c’est une **balance en équilibre**. On peut faire la **même opération des deux côtés** : elle reste en équilibre.', 'An equation is a **balanced scale**. Do the **same thing to both sides** and it stays balanced.', 'المعادلة **ميزان متوازن**. نجري **نفس العملية على الطرفين**.', 'Una ecuación es una **balanza equilibrada**. Haz **lo mismo en los dos lados**.'),
        t('D’abord on enlève le nombre seul (+ 2 → on retire 2), ensuite on partage (3x → on divise par 3).', 'First remove the constant (+ 2 → take 2 away), then share (3x → divide by 3).', 'أولًا نزيل العدد الثابت ثم نقسم.', 'Primero quita el número suelto, luego reparte.'),
      ],
      example: { title: t('Exemple : 3x + 2 = 11', 'Example: 3x + 2 = 11', 'مثال: 3x + 2 = 11', 'Ejemplo: 3x + 2 = 11'), lines: [t('3x + 2 − 2 = 11 − 2, donc 3x = 9.', '3x + 2 − 2 = 11 − 2, so 3x = 9.', '3x = 9.', '3x = 9.'), t('3x ÷ 3 = 9 ÷ 3, donc x = 3. Vérification : 3 × 3 + 2 = 11 ✓', '3x ÷ 3 = 9 ÷ 3, so x = 3. Check: 3 × 3 + 2 = 11 ✓', 'x = 3. تحقق: 3 × 3 + 2 = 11 ✓', 'x = 3. Comprobación: 3 × 3 + 2 = 11 ✓')] },
    },
  },
  'lin-both-sides': {
    goal: t('Il y a des boîtes des deux côtés : 5x + 1 = 2x + 10. Enlève ce qui est pareil des deux côtés pour isoler une boîte.', 'There are boxes on both sides: 5x + 1 = 2x + 10. Remove what is the same on both sides to get one box alone.', 'هناك علب في الجهتين: 5x + 1 = 2x + 10. أزل المتشابه من الجهتين.', 'Hay cajas en ambos lados: 5x + 1 = 2x + 10. Quita lo igual de los dos lados.'),
    manip: { kind: 'balance', left: { x: 5, u: 1 }, right: { x: 2, u: 10 } },
    lesson: {
      points: [
        t('On **regroupe les x d’un seul côté** en enlevant le même nombre de x des deux côtés.', '**Collect the x terms on one side** by removing the same number of x from both sides.', '**نجمع x في جهة واحدة** بطرح نفس العدد من x من الطرفين.', '**Agrupa las x en un lado** quitando las mismas x de ambos lados.'),
        t('Puis on finit comme d’habitude : on enlève les nombres seuls, on partage.', 'Then finish as usual: remove the constants, then share.', 'ثم نكمل كالعادة.', 'Luego termina como siempre.'),
        t('Toujours **vérifier** en remplaçant x dans les deux membres.', 'Always **check** by substituting x into both sides.', '**تحقق** دائمًا بتعويض x في الطرفين.', '**Comprueba** siempre sustituyendo x.'),
      ],
      example: { title: t('Exemple : 5x + 1 = 2x + 10', 'Example: 5x + 1 = 2x + 10', 'مثال: 5x + 1 = 2x + 10', 'Ejemplo: 5x + 1 = 2x + 10'), lines: [t('− 2x des deux côtés : 3x + 1 = 10.', '− 2x on both sides: 3x + 1 = 10.', 'نطرح 2x: 3x + 1 = 10.', '− 2x: 3x + 1 = 10.'), t('− 1 : 3x = 9, puis ÷ 3 : x = 3. Vérification : 16 = 16 ✓', '− 1: 3x = 9, then ÷ 3: x = 3. Check: 16 = 16 ✓', 'x = 3. تحقق: 16 = 16 ✓', 'x = 3. Comprobación: 16 = 16 ✓')] },
    },
  },
  'lin-brackets': {
    goal: t('2(x + 3) = 14 : deux sacs identiques contenant chacun une boîte x et 3 billes. Partage d’abord la balance en deux.', '2(x + 3) = 14: two identical bags, each holding one box x and 3 marbles. Share the scale in two first.', '2(x + 3) = 14: كيسان متماثلان في كل منهما علبة x و 3 كرات. اقسم الميزان على 2 أولًا.', '2(x + 3) = 14: dos bolsas iguales con una caja x y 3 canicas. Reparte primero entre dos.'),
    manip: { kind: 'balance', left: { x: 2, u: 6 }, right: { x: 0, u: 14 } },
    lesson: {
      points: [
        t('Deux méthodes : **développer** d’abord (2x + 6 = 14), ou **diviser** les deux membres par le facteur (x + 3 = 7).', 'Two ways: **expand** first (2x + 6 = 14), or **divide** both sides by the factor (x + 3 = 7).', 'طريقتان: **النشر** أولًا أو **القسمة** على العامل.', 'Dos métodos: **desarrollar** primero o **dividir** entre el factor.'),
        t('Attention au signe − devant une parenthèse : −(x − 2) = −x + 2.', 'Careful with a minus before brackets: −(x − 2) = −x + 2.', 'انتبه للإشارة − أمام القوس: −(x − 2) = −x + 2.', 'Cuidado con el − delante del paréntesis.'),
      ],
      example: { title: t('Exemple : 2(x + 3) = 14', 'Example: 2(x + 3) = 14', 'مثال: 2(x + 3) = 14', 'Ejemplo: 2(x + 3) = 14'), lines: [t('÷ 2 : x + 3 = 7.', '÷ 2: x + 3 = 7.', 'نقسم على 2: x + 3 = 7.', '÷ 2: x + 3 = 7.'), t('− 3 : x = 4. Vérification : 2 × (4 + 3) = 14 ✓', '− 3: x = 4. Check: 2 × (4 + 3) = 14 ✓', 'x = 4. تحقق ✓', 'x = 4. Comprobación ✓')] },
    },
  },
  'lin-problem': {
    goal: t('Méthode de Singapour : un rectangle a un périmètre de 34 cm et sa longueur dépasse sa largeur de 3 cm. Le modèle en barres montre la moitié du périmètre. Trouve la largeur.', 'Singapore method: a rectangle has a perimeter of 34 cm and is 3 cm longer than it is wide. The bar model shows half the perimeter. Find the width.', 'طريقة سنغافورة: مستطيل محيطه 34 cm وطوله يزيد عن عرضه بـ 3 cm. النموذج الشريطي يبين نصف المحيط. جد العرض.', 'Método de Singapur: un rectángulo tiene 34 cm de perímetro y mide 3 cm más de largo que de ancho. El modelo de barras muestra medio perímetro. Halla el ancho.'),
    manip: { kind: 'bars', parts: 2, extra: 3, total: 17, unit: 'cm', rectangle: true },
    lesson: {
      points: [
        t('**Dessine avant de calculer** : une barre par quantité inconnue, de même longueur si elles sont égales.', '**Draw before you calculate**: one bar per unknown quantity, the same length when they are equal.', '**ارسم قبل أن تحسب**: شريط لكل مجهول.', '**Dibuja antes de calcular**: una barra por cada incógnita.'),
        t('Le dessin donne l’équation : x + x + 3 = 17, soit 2x + 3 = 17.', 'The drawing gives the equation: x + x + 3 = 17, that is 2x + 3 = 17.', 'الرسم يعطي المعادلة: 2x + 3 = 17.', 'El dibujo da la ecuación: 2x + 3 = 17.'),
        t('On choisit l’inconnue, on écrit l’équation, on résout, puis on **répond à la question** avec une phrase.', 'Choose the unknown, write the equation, solve, then **answer the question** in a sentence.', 'نختار المجهول، نكتب المعادلة، نحل، ثم **نجيب عن السؤال**.', 'Elige la incógnita, plantea, resuelve y **responde con una frase**.'),
      ],
      example: { title: t('Exemple : âges', 'Example: ages', 'مثال: الأعمار', 'Ejemplo: edades'), lines: [t('Léa a 4 ans de plus que Tom ; ensemble ils ont 30 ans.', 'Lea is 4 years older than Tom; together they are 30.', 'ليا أكبر من توم بـ 4 سنوات ومجموع عمريهما 30.', 'Lea tiene 4 años más que Tom; juntos suman 30.'), t('x + x + 4 = 30 → 2x = 26 → x = 13 : Tom a 13 ans, Léa 17 ans.', 'x + x + 4 = 30 → 2x = 26 → x = 13: Tom is 13, Lea 17.', 'x = 13: توم 13 سنة وليا 17.', 'x = 13: Tom 13 años, Lea 17.')] },
    },
  },
};

export const INTROS: Record<string, Intro> = { ...PROTOTYPE, ...NOMBRES_INTROS, ...ALGEBRE_INTROS };
export const introFor = (skillId: string): Intro | null => INTROS[skillId] ?? null;

/** Valeur arrondie au milliardième (les × 10 et ÷ 10 successifs ne doivent pas laisser 0,30000000000000004). */
export const clean = (v: number) => Math.round(v * 1e9) / 1e9;
/** Les chiffres d'un nombre par rang, des milliers aux millièmes. */
export const PLACE_RANKS = [1000, 100, 10, 1, 0.1, 0.01, 0.001];
export function digitsByRank(v: number): number[] {
  const units = Math.round(Math.abs(v) * 1000);
  return PLACE_RANKS.map(r => Math.floor(units / Math.round(r * 1000)) % 10);
}
/** Ce qu'il reste après avoir associé les paires nulles. */
export const zeroPairs = (a: number, b: number) => ({ pairs: Math.min(Math.abs(a), Math.abs(b)) * (Math.sign(a) !== Math.sign(b) ? 1 : 0), result: a + b });

/** Les paires de diviseurs de n (a ≤ b, a × b = n) : chaque rectangle de jetons en donne une. */
export function rectanglePairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]);
  return out;
}

export const isPrime = (n: number) => n > 1 && rectanglePairs(n).length === 1;

/** Les opérations permises sur la balance, et ce qu'elles donnent. Garder l'équilibre = même opération des deux côtés. */
export type BalanceOp = { kind: 'unit' } | { kind: 'box' } | { kind: 'share'; by: number };
export function balanceOps(left: Side, right: Side): BalanceOp[] {
  const ops: BalanceOp[] = [];
  if (left.u > 0 && right.u > 0) ops.push({ kind: 'unit' });
  if (left.x > 0 && right.x > 0) ops.push({ kind: 'box' });
  const boxes = left.x || right.x;
  // On partage quand il ne reste des boîtes que d'un côté et que chaque plateau se coupe en parts égales.
  if (boxes > 1 && (left.x === 0 || right.x === 0) && left.u % boxes === 0 && right.u % boxes === 0) ops.push({ kind: 'share', by: boxes });
  return ops;
}
export function applyBalance(op: BalanceOp, left: Side, right: Side): [Side, Side] {
  if (op.kind === 'unit') return [{ ...left, u: left.u - 1 }, { ...right, u: right.u - 1 }];
  if (op.kind === 'box') return [{ ...left, x: left.x - 1 }, { ...right, x: right.x - 1 }];
  return [{ x: left.x / op.by, u: left.u / op.by }, { x: right.x / op.by, u: right.u / op.by }];
}
/** La valeur de x quand une seule boîte reste seule face à des billes, sinon null. */
export function balanceSolved(left: Side, right: Side): number | null {
  if (left.x === 1 && left.u === 0 && right.x === 0) return right.u;
  if (right.x === 1 && right.u === 0 && left.x === 0) return left.u;
  return null;
}

/** Valeur de la machine pour une entrée. */
export const runMachine = (ops: { op: '×' | '+' | '−'; k: number }[], x: number) => ops.reduce((v, o) => (o.op === '×' ? v * o.k : o.op === '+' ? v + o.k : v - o.k), x);
/** Aire de chaque tuile d'un rectangle (x? + u)(x? + u) : x², x et unités. */
export function tileAreas(rows: { x: number; u: number }, cols: { x: number; u: number }) {
  return { x2: rows.x * cols.x, x: rows.x * cols.u + rows.u * cols.x, u: rows.u * cols.u };
}
