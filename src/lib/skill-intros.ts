// Introduction de chaque compétence, sur le modèle de Singapour : « Je manipule » (concret, sans note),
// puis « Je retiens » (la carte de cours : l'idée en deux ou trois phrases et un exemple résolu),
// avant « Je m'entraîne » (les étapes notées par le serveur). Prototype : nombres premiers et équations.
// Données pures, couvertes par src/test/skill-intros.test.ts.
import type { L } from './curriculum';
import { NOMBRES_INTROS } from './skill-intros-nombres';
import { ALGEBRE_INTROS } from './skill-intros-algebre';
import { GEOMETRIE_INTROS } from './skill-intros-geometrie';
import { DONNEES_INTROS } from './skill-intros-donnees';
import { SECONDE_INTROS } from './skill-intros-seconde';
import { PREMIERE_INTROS } from './skill-intros-premiere';
import { LIMIT_INTROS } from './skill-intros-limites';
import { TERMINALE_INTROS } from './skill-intros-terminale';

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
  /** Ouvrir un angle de 0° à 180° (et, avec `pair`, voir son supplémentaire). */
  | { kind: 'angle-builder'; target: number; pair?: boolean }
  /** Déformer un triangle : ses angles changent, leur somme reste 180°. */
  | { kind: 'triangle-angles' }
  /** Redimensionner un rectangle sur quadrillage : périmètre et aire. */
  | { kind: 'resize-rect'; w: number; h: number }
  /** Découper un parallélogramme (ou doubler un triangle) pour retrouver un rectangle. */
  | { kind: 'area-transform'; shape: 'parallelogram' | 'triangle'; b: number; h: number }
  /** Dérouler un cercle de diamètre d : un peu plus de 3 diamètres. */
  | { kind: 'unroll'; d: number }
  /** Remplir une boîte de cubes : une couche, puis des étages. */
  | { kind: 'cubes'; l: number; w: number; h: number }
  /** Trois bâtons : peut-on fermer le triangle ? */
  | { kind: 'sticks'; a: number; b: number }
  /** Faire glisser M sur [AB] ; avec `free`, N se déplace aussi : les rapports et le parallélisme. */
  | { kind: 'thales-slide'; ab: number; ac: number; bc: number; free?: boolean }
  /** Agrandir ou réduire de rapport k : longueurs × k, aires × k², volumes × k³. */
  | { kind: 'enlarge'; w: number; h: number; solid?: boolean }
  /** Triangle rectangle : changer sa taille (angle fixe) ou son angle ; les rapports trigonométriques. */
  | { kind: 'trig-ratio'; angle: number; mode: 'size' | 'angle' }
  /** Verser des pyramides dans le prisme de même base et même hauteur. */
  | { kind: 'pour'; times: number }
  /** Colorier n parts d'une bande partagée en d parts égales. */
  | { kind: 'frac-color'; n: number; d: number }
  /** Regrouper les parts d'une bande par paquets de k : n/d devient (n÷k)/(d÷k). */
  | { kind: 'frac-merge'; n: number; d: number; k: number }
  /** n/d d'une quantité : une barre de `total` partagée en d parts, on en prend n (méthode de Singapour). */
  | { kind: 'frac-of'; n: number; d: number; total: number; unit: string }
  /** Modèle d'aire du produit a/b × c/d : on colorie a/b dans un sens, c/d dans l'autre. */
  | { kind: 'frac-area'; a: number; b: number; c: number; d: number }
  /** Tableau de proportionnalité : chaque quantité donne un point ; les points sont alignés avec l'origine. */
  | { kind: 'ratio-graph'; unit: number; label: string }
  /** Bande de 100 % coupée en dix parts de 10 % : on en prend p %. */
  | { kind: 'percent-bar'; total: number; pct: number }
  /** Ranger une série puis retirer les extrêmes deux à deux : il reste la médiane. */
  | { kind: 'line-up'; values: number[] }
  /** Dépouiller une enquête réponse par réponse : les barres montent. */
  | { kind: 'tally'; categories: L[]; answers: number[] }
  /** Simuler une expérience aléatoire (dé, sac) : la fréquence se rapproche de la probabilité. */
  | { kind: 'sim'; outcomes: { label: L; weight: number }[]; event: number[]; seed: number }
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
  | { kind: 'square'; area: number }
  /** Promener x sur une droite graduée : appartient-il à l'intervalle (et à un second, ou à distance ≤ r d'un centre) ? */
  | { kind: 'interval'; a: number; b: number; closedA: boolean; closedB: boolean; other?: { a: number; b: number }; center?: number }
  /** Promener un point sur la courbe d'une fonction de référence (ou chercher les antécédents de `target`). */
  | { kind: 'curve-explore'; fns: RefFn[]; target?: number }
  /** Promener x et lire le signe de chaque facteur, puis du produit (ou du quotient). */
  | { kind: 'sign-explore'; factors: { a: number; b: number }[]; quotient?: boolean }
  /** Régler m et p pour que y = mx + p passe par la droite cible (ou lui soit parallèle). */
  | { kind: 'line-build'; m: number; p: number; parallel?: boolean }
  /** Ranger une série et la couper en quatre : Q1, médiane, Q3, puis la boîte. */
  | { kind: 'quartiles'; values: number[] }
  /** Tableau des 36 issues de deux dés : toucher celles dont la somme vaut `sum`. */
  | { kind: 'dice-grid'; sum: number }
  /** Diagramme de Venn : compter A, ajouter B, retirer ce qui est compté deux fois. */
  | { kind: 'venn'; a: number; b: number; both: number; total: number; labels: [L, L] }
  /** Tourner un point sur le cercle trigonométrique : radians, cos, sin et leurs signes. */
  | { kind: 'unit-circle'; target: number; step: number; quadrants?: boolean; cosLevel?: number }
  /** Monter ou descendre la parabole y = x² + bx + c (on règle c) : Δ et le nombre de points sur l'axe. */
  | { kind: 'parabola'; b: number; c: number }
  /** Faire tourner v autour de u : le produit scalaire ‖u‖ ‖v‖ cos θ, positif, nul puis négatif. */
  | { kind: 'dot-rotate'; u: number; v: number }
  /** Rapprocher M de A sur la courbe de 0,5x² − 2x : la pente de la sécante tend vers f′(a). */
  | { kind: 'secant'; a: number }
  /** Arbre pondéré à deux niveaux : toucher chaque feuille pour multiplier le long du chemin. */
  | { kind: 'tree'; pa: number; pba: number; pbna: number }
  /** Planche de Galton : chaque bille fait n rebonds (à droite avec la probabilité p) ; l'histogramme approche B(n ; p). */
  | { kind: 'galton'; n: number; p: number }
  /** f(x) = (ax + b)/(x − c) : faire grandir x (× 10) ou l'approcher de c par la droite, et lire f(x). */
  | { kind: 'limit-table'; a: number; b: number; c: number; toward: 'infinity' | 'right' }
  /** Dichotomie sur x³ + x − 1 entre 0 et 1 : couper en deux en gardant le changement de signe. */
  | { kind: 'bisection'; steps: number }
  /** Multiplier x par `base` à chaque pas : ln x augmente toujours de ln(base). */
  | { kind: 'log-ruler'; base: number; steps: number }
  /** Rectangles sous la courbe (x² ou x) sur [0 ; b] : on double leur nombre, la somme approche l'intégrale. */
  | { kind: 'riemann'; fn: 'square' | 'line'; b: number }
  /** Cube unité ABCDEFGH dans un repère : toucher le sommet qui a les coordonnées demandées. */
  | { kind: 'cube-coords'; targets: [number, number, number][] }
  /** Former tous les mots de `length` lettres distinctes avec `letters`. */
  | { kind: 'arrange'; letters: string[]; length: number }
  /** n personnes : relier chaque paire une fois (poignées de main). */
  | { kind: 'handshake'; n: number }
  /** Plan complexe : multiplier par i (quart de tour) ou placer a + ib et lire son module. */
  | { kind: 'complex-plane'; mode: 'rotate' | 'place'; a: number; b: number }
  /** Méthode d'Euler pour y′ = ay : avancer de h en suivant la tangente, comparer à la vraie courbe. */
  | { kind: 'euler'; a: number; y0: number; h: number; steps: number };

export type RefFn = 'square' | 'inverse' | 'sqrt' | 'cube' | 'parabola' | 'exp' | 'cubic' | 'ln';

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

export const INTROS: Record<string, Intro> = { ...PROTOTYPE, ...NOMBRES_INTROS, ...ALGEBRE_INTROS, ...GEOMETRIE_INTROS, ...DONNEES_INTROS, ...SECONDE_INTROS, ...PREMIERE_INTROS, ...LIMIT_INTROS, ...TERMINALE_INTROS };
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

/** La nature d'un angle selon sa mesure. */
export const angleKind = (deg: number): 'nul' | 'aigu' | 'droit' | 'obtus' | 'plat' => (deg === 0 ? 'nul' : deg < 90 ? 'aigu' : deg === 90 ? 'droit' : deg < 180 ? 'obtus' : 'plat');
/** Inégalité triangulaire : le plus grand côté est strictement plus petit que la somme des deux autres. */
export const closes = (a: number, b: number, c: number) => Math.max(a, b, c) * 2 < a + b + c;

/** La médiane d'une série. */
export function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b), m = v.length / 2;
  return v.length % 2 ? v[Math.floor(m)]! : (v[m - 1]! + v[m]!) / 2;
}
/** Tirages pseudo-aléatoires reproductibles (même graine → mêmes résultats) pour les simulations. */
export function simulate(weights: number[], count: number, seed: number): number[] {
  let s = seed >>> 0 || 1;
  const total = weights.reduce((a, w) => a + w, 0);
  return Array.from({ length: count }, () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    let r = (s / 2 ** 32) * total;
    return weights.findIndex(w => (r -= w) < 0);
  });
}

// ───────────── 2nde ─────────────

/** x appartient-il à l'intervalle de bornes a et b (fermé ou ouvert de chaque côté) ? */
export const inInterval = (x: number, a: number, b: number, closedA: boolean, closedB: boolean) => (closedA ? x >= a : x > a) && (closedB ? x <= b : x < b);
/** Valeur d'une fonction de référence (null hors de l'ensemble de définition). La « parabole » est (x − 1)² − 2. */
export function refValue(fn: RefFn, x: number): number | null {
  if (fn === 'square') return x * x;
  if (fn === 'cube') return x * x * x;
  if (fn === 'inverse') return x === 0 ? null : 1 / x;
  if (fn === 'sqrt') return x < 0 ? null : Math.sqrt(x);
  if (fn === 'exp') return Math.exp(x);
  if (fn === 'cubic') return (x * x * x) / 3 - x;
  if (fn === 'ln') return x <= 0 ? null : Math.log(x);
  return (x - 1) ** 2 - 2;
}
/** Nombre de racines réelles de x² + bx + c (selon le signe de Δ). */
export const rootCount = (b: number, c: number) => { const d = b * b - 4 * c; return d > 0 ? 2 : d === 0 ? 1 : 0; };
/** Les angles de [0 ; 360[ (multiples de `step`) dont le cosinus vaut `level` (à 10⁻⁹ près). */
export const anglesWithCos = (level: number, step: number) => Array.from({ length: 360 / step }, (_, i) => i * step).filter(d => Math.abs(Math.cos((d * Math.PI) / 180) - level) < 1e-9);
/** Les régions délimitées par les racines des facteurs ax + b (triées) : un représentant entier ou demi-entier de chacune. */
export function signRegions(factors: { a: number; b: number }[]): number[] {
  const roots = [...new Set(factors.map(f => -f.b / f.a))].sort((x, y) => x - y);
  const reps = [roots[0]! - 1, ...roots.slice(1).map((r, i) => (r + roots[i]!) / 2), roots[roots.length - 1]! + 1];
  return reps;
}
/** Quartiles d'une série (définition du lycée français : rangs ⌈n/4⌉ et ⌈3n/4⌉) et médiane. */
export function fiveNumbers(values: number[]): { min: number; q1: number; me: number; q3: number; max: number } {
  const s = [...values].sort((a, b) => a - b), n = s.length;
  return { min: s[0]!, q1: s[Math.ceil(n / 4) - 1]!, me: median(s), q3: s[Math.ceil((3 * n) / 4) - 1]!, max: s[n - 1]! };
}
/** Les couples (dé 1 ; dé 2) dont la somme vaut s. */
export const diceWays = (s: number) => Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1] as [number, number]).filter(([a, b]) => a + b === s);
/** Pente de la courbe en x pour les fonctions dont on montre la tangente (sinon null). */
export const refSlope = (fn: RefFn, x: number): number | null => (fn === 'exp' ? Math.exp(x) : fn === 'cubic' ? x * x - 1 : fn === 'ln' ? (x > 0 ? 1 / x : null) : null);
/** f(x) = 0,5x² − 2x et la pente de la sécante entre a et a + h. */
export const secantFn = (x: number) => 0.5 * x * x - 2 * x;
export const secantSlope = (a: number, h: number) => (secantFn(a + h) - secantFn(a)) / h;
/** Coefficient binomial et loi B(n ; p). */
export const choose = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 || k === n ? 1 : choose(n - 1, k - 1) + choose(n - 1, k));
export const binomialP = (n: number, p: number, k: number) => choose(n, k) * p ** k * (1 - p) ** (n - k);
/** f(x) = (ax + b)/(x − c), et les x successifs d'un tableau vers +∞ ou vers c par la droite. */
export const limitF = (a: number, b: number, c: number, x: number) => (a * x + b) / (x - c);
export const limitXs = (c: number, toward: 'infinity' | 'right') => (toward === 'infinity' ? [10, 100, 1000, 10000, 100000] : [1, 0.1, 0.01, 0.001, 0.0001].map(h => c + h));
/** Une étape de dichotomie pour g(x) = x³ + x − 1 : la moitié de [lo ; hi] où g change de signe. */
export const bisectG = (x: number) => x * x * x + x - 1;
export function bisectStep(lo: number, hi: number): [number, number] { const m = (lo + hi) / 2; return bisectG(lo) * bisectG(m) <= 0 ? [lo, m] : [m, hi]; }
/** Somme des rectangles à gauche (n rectangles) sous x² ou x sur [0 ; b], et la valeur exacte de l'intégrale. */
export const riemannF = (fn: 'square' | 'line', x: number) => (fn === 'square' ? x * x : x);
export const riemannSum = (fn: 'square' | 'line', b: number, n: number) => Array.from({ length: n }, (_, i) => riemannF(fn, (i * b) / n) * (b / n)).reduce((a, v) => a + v, 0);
export const riemannExact = (fn: 'square' | 'line', b: number) => (fn === 'square' ? (b ** 3) / 3 : (b * b) / 2);
/** Les sommets du cube unité, nommés comme en classe. */
export const CUBE: Record<string, [number, number, number]> = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
/** Nombre d'arrangements de k objets parmi n. */
export const arrangements = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).reduce((a, b) => a * b, 1);
/** Un pas de la méthode d'Euler pour y′ = ay. */
export const eulerStep = (a: number, y: number, h: number) => y + h * a * y;
