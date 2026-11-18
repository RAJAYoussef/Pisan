// Introductions de la famille « Nombres et calculs » : décimaux, relatifs, produits de relatifs, division
// euclidienne, puissances, puissances de 10, racines carrées. Modèle de Singapour : manipuler, puis retenir.
// Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });

export const NOMBRES_INTROS: Record<string, Intro> = {
  // ───────────── Nombres décimaux ─────────────
  'dec-place-value': {
    goal: t('Fabrique le nombre « 2 unités et 7 centièmes » dans le tableau de numération.', 'Build the number “2 units and 7 hundredths” in the place-value table.', 'كوّن العدد « 2 وحدات و 7 أجزاء من مائة » في جدول المراتب.', 'Forma el número «2 unidades y 7 centésimas» en la tabla.'),
    manip: { kind: 'place-value', start: 0, target: 2.07 },
    lesson: {
      points: [
        t('Chaque chiffre a une **valeur selon son rang** : dans 538,17, le 1 vaut 1 dixième, le 7 vaut 7 centièmes.', 'Each digit is **worth its place**: in 538.17, the 1 is 1 tenth, the 7 is 7 hundredths.', 'لكل رقم **قيمة حسب مرتبته**.', 'Cada cifra **vale según su lugar**.'),
        t('1 unité = 10 dixièmes = 100 centièmes. Un rang vide s’écrit avec un 0 : 2,07.', '1 unit = 10 tenths = 100 hundredths. An empty place is written 0: 2.07.', '1 وحدة = 10 أعشار = 100 جزء من مائة.', '1 unidad = 10 décimas = 100 centésimas.'),
      ],
      example: ex(t('Exemple : 5,27', 'Example: 5.27', 'مثال: 5,27', 'Ejemplo: 5,27'), t('5 unités, 2 dixièmes, 7 centièmes.', '5 units, 2 tenths, 7 hundredths.', '5 وحدات و 2 أعشار و 7 أجزاء من مائة.', '5 unidades, 2 décimas, 7 centésimas.'), t('En tout : 527 centièmes.', 'In all: 527 hundredths.', 'في المجموع: 527 جزءًا من مائة.', 'En total: 527 centésimas.')),
    },
  },
  'dec-compare': {
    goal: t('Pars de 2,45 et avance d’un centième à chaque saut jusqu’à 2,5. Lequel est le plus grand ?', 'Start at 2.45 and move one hundredth per hop up to 2.5. Which is larger?', 'انطلق من 2,45 وتقدّم جزءًا من مائة في كل قفزة حتى 2,5.', 'Sal de 2,45 y avanza una centésima por salto hasta 2,5.'),
    manip: { kind: 'hops', min: 2.4, max: 2.6, step: 0.01, start: 2.45, target: 2.5 },
    lesson: {
      points: [
        t('On compare d’abord les parties entières, puis **chiffre par chiffre** : dixièmes, centièmes…', 'Compare the whole parts first, then **digit by digit**: tenths, hundredths…', 'نقارن الجزأين الصحيحين ثم **رقمًا برقم**.', 'Compara la parte entera y luego **cifra a cifra**.'),
        t('Le piège : 2,5 > 2,45 car 5 dixièmes > 4 dixièmes. On peut écrire 2,5 = 2,50.', 'The trap: 2.5 > 2.45 because 5 tenths > 4 tenths. You can write 2.5 = 2.50.', 'الفخ: 2,5 > 2,45 لأن 5 أعشار > 4 أعشار.', 'La trampa: 2,5 > 2,45 porque 5 décimas > 4.'),
      ],
      example: ex(t('Exemple : 7,7 et 7,65', 'Example: 7.7 and 7.65', 'مثال: 7,7 و 7,65', 'Ejemplo: 7,7 y 7,65'), t('Mêmes unités (7). Dixièmes : 7 contre 6.', 'Same units (7). Tenths: 7 against 6.', 'الأعشار: 7 مقابل 6.', 'Décimas: 7 contra 6.'), t('Donc 7,7 > 7,65.', 'So 7.7 > 7.65.', 'إذن 7,7 > 7,65.', 'Así 7,7 > 7,65.')),
    },
  },
  'dec-numberline': {
    goal: t('L’unité est coupée en 10 : avance de dixième en dixième jusqu’à 0,7.', 'The unit is cut into 10: move tenth by tenth up to 0.7.', 'الوحدة مقسمة إلى 10: تقدّم عشرًا عشرًا حتى 0,7.', 'La unidad está en 10 partes: avanza de décima en décima hasta 0,7.'),
    manip: { kind: 'hops', min: 0, max: 1, step: 0.1, start: 0, target: 0.7 },
    lesson: {
      points: [
        t('Pour lire une droite graduée, on cherche d’abord **ce que vaut un petit trait** : unité ÷ nombre de parts.', 'To read a number line, first find **what one small mark is worth**: unit ÷ number of parts.', 'نبحث أولًا **عن قيمة التدريجة الصغيرة**.', 'Primero busca **cuánto vale cada marca**.'),
        t('Unité partagée en 10 → dixièmes ; en 100 → centièmes.', 'Unit cut into 10 → tenths; into 100 → hundredths.', 'مقسمة إلى 10 ← أعشار؛ إلى 100 ← أجزاء من مائة.', 'En 10 → décimas; en 100 → centésimas.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('Entre 6 et 7, A est 6 traits après 6 : A = 6,6.', 'Between 6 and 7, A is 6 marks after 6: A = 6.6.', 'بين 6 و 7، A بعد 6 تدريجات: A = 6,6.', 'Entre 6 y 7, A está 6 marcas después: A = 6,6.')),
    },
  },
  'dec-times-ten': {
    goal: t('Fais glisser les chiffres de 7,2 avec × 10 jusqu’à obtenir 720.', 'Slide the digits of 7.2 with × 10 until you get 720.', 'أزح أرقام 7,2 بـ × 10 حتى تحصل على 720.', 'Desliza las cifras de 7,2 con × 10 hasta obtener 720.'),
    manip: { kind: 'place-value', start: 7.2, target: 720 },
    lesson: {
      points: [
        t('Multiplier par 10, 100, 1 000 : chaque chiffre **monte de 1, 2, 3 rangs** (il devient 10, 100, 1 000 fois plus grand).', 'Multiplying by 10, 100, 1,000: every digit **moves up 1, 2, 3 places**.', 'الضرب في 10، 100، 1000: كل رقم **يرتفع 1، 2، 3 مراتب**.', 'Multiplicar por 10, 100, 1 000: cada cifra **sube 1, 2, 3 lugares**.'),
        t('Diviser : les chiffres **descendent** d’autant de rangs. On complète par des 0 si besoin.', 'Dividing: the digits **move down** as many places. Fill with 0 if needed.', 'القسمة: الأرقام **تنزل** بنفس عدد المراتب.', 'Dividir: las cifras **bajan** otros tantos lugares.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('72,04 × 1 000 = 72 040 · 510,1 ÷ 1 000 = 0,5101', '72.04 × 1,000 = 72,040 · 510.1 ÷ 1,000 = 0.5101', '72,04 × 1000 = 72040', '72,04 × 1 000 = 72 040')),
    },
  },
  'dec-division': {
    goal: t('Range 44 œufs en boîtes de 12 : fais des paquets jusqu’à ne plus pouvoir.', 'Pack 44 eggs into boxes of 12: make packs until you can’t.', 'رتّب 44 بيضة في علب من 12.', 'Mete 44 huevos en cajas de 12.'),
    manip: { kind: 'share', n: 44, by: 12 },
    lesson: {
      points: [
        t('Division euclidienne : **dividende = diviseur × quotient + reste**, avec un reste **plus petit que le diviseur**.', 'Division with remainder: **dividend = divisor × quotient + remainder**, remainder **smaller than the divisor**.', 'القسمة الإقليدية: **المقسوم = القاسم × الخارج + الباقي** والباقي أصغر من القاسم.', 'División entera: **dividendo = divisor × cociente + resto**, resto menor que el divisor.'),
        t('Dans un problème, on se demande ce qu’on fait du reste : on le laisse, ou il faut un paquet de plus.', 'In a problem, ask what to do with the remainder: leave it, or add one more pack.', 'في المسألة نتساءل ماذا نفعل بالباقي.', 'En un problema, ¿qué hacemos con el resto?'),
      ],
      example: ex(t('Exemple : 135 ÷ 10', 'Example: 135 ÷ 10', 'مثال: 135 ÷ 10', 'Ejemplo: 135 ÷ 10'), t('135 = 10 × 13 + 5 : quotient 13, reste 5.', '135 = 10 × 13 + 5: quotient 13, remainder 5.', '135 = 10 × 13 + 5.', '135 = 10 × 13 + 5.')),
    },
  },
  // ───────────── Nombres relatifs ─────────────
  'rel-numberline': {
    goal: t('Pars de 0 et recule jusqu’à −4 sur la droite graduée.', 'Start at 0 and go back to −4 on the number line.', 'انطلق من 0 وتراجع حتى −4.', 'Sal de 0 y retrocede hasta −4.'),
    manip: { kind: 'hops', min: -6, max: 6, step: 1, start: 0, target: -4 },
    lesson: {
      points: [
        t('À gauche de 0, les **nombres négatifs** : on écrit le signe −. À droite, les positifs.', 'Left of 0 are the **negative numbers**, written with a − sign. Right of 0, the positives.', 'يسار 0 **الأعداد السالبة** ونكتب الإشارة −.', 'A la izquierda de 0, los **negativos** (signo −).'),
        t('Un nombre relatif = un **signe** + une **distance à zéro**. −4 est à 4 unités de 0.', 'A signed number = a **sign** + a **distance from zero**. −4 is 4 units from 0.', 'العدد النسبي = **إشارة** + **مسافة عن الصفر**.', 'Un número relativo = **signo** + **distancia a cero**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('Le point est 3 traits à gauche de 0 : il repère −3.', 'The point is 3 marks left of 0: it is −3.', 'النقطة على بعد 3 تدريجات يسار 0: −3.', 'El punto está 3 marcas a la izquierda: −3.')),
    },
  },
  'rel-compare': {
    goal: t('Pars de −8 et avance jusqu’à −5. Dans quel sens vont les nombres ?', 'Start at −8 and move to −5. Which way do the numbers grow?', 'انطلق من −8 وتقدّم حتى −5.', 'Sal de −8 y avanza hasta −5.'),
    manip: { kind: 'hops', min: -10, max: 2, step: 1, start: -8, target: -5 },
    lesson: {
      points: [
        t('Sur la droite, le **plus petit est le plus à gauche**.', 'On the line, the **smaller number is further left**.', 'على المستقيم، **الأصغر هو الأبعد يسارًا**.', 'En la recta, el **menor está más a la izquierda**.'),
        t('Entre deux négatifs, le plus petit est le **plus loin de 0** : −8 < −5.', 'Between two negatives, the smaller is **further from 0**: −8 < −5.', 'بين سالبين، الأصغر هو **الأبعد عن 0**.', 'Entre dos negativos, el menor está **más lejos de 0**.'),
        t('L’**opposé** de −6 est 6 : même distance à 0, de l’autre côté.', 'The **opposite** of −6 is 6: same distance from 0, other side.', '**مقابل** −6 هو 6.', 'El **opuesto** de −6 es 6.'),
      ],
      example: ex(t('Exemple : ranger −3 ; 2 ; −7 ; 0', 'Example: order −3, 2, −7, 0', 'مثال: رتّب −3 ؛ 2 ؛ −7 ؛ 0', 'Ejemplo: ordenar −3, 2, −7, 0'), t('−7 < −3 < 0 < 2', '−7 < −3 < 0 < 2', '−7 < −3 < 0 < 2', '−7 < −3 < 0 < 2')),
    },
  },
  'rel-coordinates': {
    lesson: {
      points: [
        t('Un point du plan a deux coordonnées : l’**abscisse** (horizontale) puis l’**ordonnée** (verticale).', 'A point has two coordinates: the **x-coordinate** (across) then the **y-coordinate** (up).', 'للنقطة إحداثيتان: **الأفصول** ثم **الأرتوب**.', 'Un punto tiene dos coordenadas: **abscisa** y luego **ordenada**.'),
        t('Négatif : vers la gauche pour l’abscisse, vers le bas pour l’ordonnée.', 'Negative: left for x, down for y.', 'السالب: يسارًا للأفصول، أسفل للأرتوب.', 'Negativo: izquierda en x, abajo en y.'),
      ],
      example: ex(t('Exemple : B(−1 ; −4)', 'Example: B(−1, −4)', 'مثال: B(−1 ; −4)', 'Ejemplo: B(−1 ; −4)'), t('Depuis l’origine : 1 vers la gauche, puis 4 vers le bas.', 'From the origin: 1 left, then 4 down.', 'من الأصل: 1 يسارًا ثم 4 أسفل.', 'Desde el origen: 1 a la izquierda, 4 abajo.')),
    },
  },
  'rel-add-sub': {
    goal: t('Calcule 4 + (−6) avec des jetons : un jeton + et un jeton − s’annulent.', 'Work out 4 + (−6) with counters: one + and one − cancel out.', 'احسب 4 + (−6) بالقطع: + و − يلغيان بعضهما.', 'Calcula 4 + (−6) con fichas: un + y un − se anulan.'),
    manip: { kind: 'zero-pairs', a: 4, b: -6 },
    lesson: {
      points: [
        t('Un jeton + et un jeton − forment une **paire nulle** : ensemble, ils valent 0.', 'One + and one − counter make a **zero pair**: together they are worth 0.', '+ و − يكوّنان **زوجًا منعدمًا**.', 'Un + y un − forman un **par nulo**.'),
        t('Même signe : on ajoute les distances. Signes différents : on soustrait, et on garde le signe du plus « fort ».', 'Same sign: add the distances. Different signs: subtract, and keep the sign of the “stronger” one.', 'نفس الإشارة: نجمع. إشارتان مختلفتان: نطرح ونأخذ إشارة الأقوى.', 'Mismo signo: suma. Distintos: resta y toma el signo del mayor.'),
        t('**Soustraire, c’est ajouter l’opposé** : 4 − 6 = 4 + (−6).', '**Subtracting means adding the opposite**: 4 − 6 = 4 + (−6).', '**الطرح هو جمع المقابل**.', '**Restar es sumar el opuesto**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('(−7) + (−5) = −12 · (−5) + 6 = 1 · 4 − 6 = −2', '(−7) + (−5) = −12 · (−5) + 6 = 1 · 4 − 6 = −2', '(−7) + (−5) = −12', '(−7) + (−5) = −12')),
    },
  },
  // ───────────── Produits et quotients de relatifs ─────────────
  'signs-rule': {
    goal: t('Prolonge chaque suite : à chaque ligne, on multiplie par 1 de moins. Que se passe-t-il après 0 ?', 'Continue each pattern: each row multiplies by one less. What happens after 0?', 'أكمل كل متتالية: ماذا يحدث بعد 0؟', 'Continúa cada serie: ¿qué pasa después de 0?'),
    manip: { kind: 'pattern', factors: [3, -3] },
    lesson: {
      points: [
        t('**Signes identiques → produit positif. Signes différents → produit négatif.**', '**Same signs → positive product. Different signs → negative product.**', '**إشارتان متشابهتان ← جداء موجب. مختلفتان ← سالب.**', '**Signos iguales → positivo. Distintos → negativo.**'),
        t('Avec plusieurs facteurs : on compte les négatifs. Nombre **pair** → +, **impair** → −.', 'With several factors, count the negatives: **even** → +, **odd** → −.', 'نعد العوامل السالبة: **زوجي** ← +، **فردي** ← −.', 'Con varios factores, cuenta los negativos: **par** → +, **impar** → −.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('(−2) × 7 = −14 · (−2) × (−7) = 14', '(−2) × 7 = −14 · (−2) × (−7) = 14', '(−2) × 7 = −14', '(−2) × 7 = −14'), t('(−1) × 1 × (−5) × (−2) : 3 négatifs → négatif.', '(−1) × 1 × (−5) × (−2): 3 negatives → negative.', '3 عوامل سالبة ← سالب.', '3 negativos → negativo.')),
    },
  },
  'signs-quotient': {
    goal: t('Prolonge chaque suite de divisions : à chaque ligne, le nombre divisé diminue. Que se passe-t-il après 0 ?', 'Continue each pattern of divisions: the number being divided gets smaller each row. What happens after 0?', 'أكمل متتالية القسمات: ماذا يحدث بعد 0؟', 'Continúa cada serie de divisiones: ¿qué pasa después de 0?'),
    manip: { kind: 'pattern', factors: [3, -3], divide: true },
    lesson: {
      points: [
        t('La division suit **la même règle des signes** que la multiplication.', 'Division follows **the same sign rule** as multiplication.', 'القسمة تتبع **نفس قاعدة الإشارات**.', 'La división sigue **la misma regla de signos**.'),
        t('Un trait de fraction est une division : −4 / −2 = 2.', 'A fraction bar is a division: −4 / −2 = 2.', 'خط الكسر قسمة: −4 / −2 = 2.', 'La raya de fracción es una división: −4 / −2 = 2.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('(−14) ÷ 2 = −7 · (−10) ÷ (−2) = 5', '(−14) ÷ 2 = −7 · (−10) ÷ (−2) = 5', '(−14) ÷ 2 = −7', '(−14) ÷ 2 = −7')),
    },
  },
  'signs-mixed': {
    lesson: {
      points: [
        t('Les **priorités** ne changent pas : parenthèses, puissances, × et ÷, puis + et −.', '**Order of operations** stays the same: brackets, powers, × and ÷, then + and −.', '**الأولويات** لا تتغير.', 'Las **prioridades** no cambian.'),
        t('On gère le signe à chaque étape, en gardant les parenthèses autour des négatifs.', 'Handle the sign at every step, keeping brackets around negatives.', 'نعالج الإشارة في كل خطوة.', 'Controla el signo en cada paso.'),
      ],
      example: ex(t('Exemple : −7 + 2 × (−3)', 'Example: −7 + 2 × (−3)', 'مثال: −7 + 2 × (−3)', 'Ejemplo: −7 + 2 × (−3)'), t('D’abord 2 × (−3) = −6, puis −7 + (−6) = −13.', 'First 2 × (−3) = −6, then −7 + (−6) = −13.', 'أولًا −6 ثم −13.', 'Primero −6, luego −13.')),
    },
  },
  'signs-square': {
    lesson: {
      points: [
        t('(−3)² = (−3) × (−3) = 9, mais **−3² = −(3 × 3) = −9** : sans parenthèses, le carré ne porte que sur 3.', '(−3)² = (−3) × (−3) = 9, but **−3² = −(3 × 3) = −9**: without brackets only 3 is squared.', '(−3)² = 9 لكن **−3² = −9**.', '(−3)² = 9, pero **−3² = −9**.'),
        t('Pour remplacer x par un négatif, on met **toujours des parenthèses** : 3x² pour x = −2 → 3 × (−2)².', 'When substituting a negative, **always use brackets**: 3x² for x = −2 → 3 × (−2)².', 'عند التعويض بعدد سالب نضع **دائمًا أقواسًا**.', 'Al sustituir por un negativo, **siempre paréntesis**.'),
      ],
      example: ex(t('Exemple : 3x² pour x = −2', 'Example: 3x² for x = −2', 'مثال: 3x² من أجل x = −2', 'Ejemplo: 3x² para x = −2'), t('3 × (−2)² = 3 × 4 = 12.', '3 × (−2)² = 3 × 4 = 12.', '3 × 4 = 12.', '3 × 4 = 12.')),
    },
  },
  // ───────────── Division euclidienne et opérations (6e) ─────────────
  'arith-euclid': {
    goal: t('Fais des paquets de 5 avec 23 jetons. Combien de paquets ? Combien en reste-t-il ?', 'Make packs of 5 with 23 counters. How many packs? How many left?', 'كوّن رزمًا من 5 بـ 23 قطعة.', 'Haz paquetes de 5 con 23 fichas.'),
    manip: { kind: 'share', n: 23, by: 5 },
    lesson: {
      points: [
        t('**a = b × q + r** avec **r < b** : q est le quotient, r le reste.', '**a = b × q + r** with **r < b**: q is the quotient, r the remainder.', '**a = b × q + r** مع **r < b**.', '**a = b × q + r** con **r < b**.'),
        t('Si le reste est plus grand que le diviseur, on pouvait faire un paquet de plus !', 'If the remainder is bigger than the divisor, one more pack was possible!', 'إذا كان الباقي أكبر من القاسم، أمكن تكوين رزمة أخرى!', '¡Si el resto es mayor que el divisor, cabía otro paquete!'),
      ],
      example: ex(t('Exemple : 65 ÷ 10', 'Example: 65 ÷ 10', 'مثال: 65 ÷ 10', 'Ejemplo: 65 ÷ 10'), t('65 = 10 × 6 + 5 (et non 10 × 5 + 15).', '65 = 10 × 6 + 5 (not 10 × 5 + 15).', '65 = 10 × 6 + 5.', '65 = 10 × 6 + 5.')),
    },
  },
  'arith-divisibility': {
    lesson: {
      points: [
        t('Divisible par **2** : chiffre des unités pair. Par **5** : 0 ou 5. Par **10** : 0.', 'Divisible by **2**: even last digit. By **5**: 0 or 5. By **10**: 0.', 'القسمة على **2**: رقم الوحدات زوجي. على **5**: 0 أو 5.', 'Por **2**: última cifra par. Por **5**: 0 o 5.'),
        t('Divisible par **3** (ou **9**) : la **somme des chiffres** est dans la table de 3 (ou de 9).', 'Divisible by **3** (or **9**): the **digit sum** is in the 3 (or 9) times table.', 'على **3** (أو **9**): **مجموع الأرقام** من مضاعفاتها.', 'Por **3** (o **9**): la **suma de cifras** lo es.'),
      ],
      example: ex(t('Exemple : 336', 'Example: 336', 'مثال: 336', 'Ejemplo: 336'), t('3 + 3 + 6 = 12 : divisible par 3, pas par 9.', '3 + 3 + 6 = 12: divisible by 3, not by 9.', '12: يقبل القسمة على 3 لا على 9.', '12: divisible por 3, no por 9.')),
    },
  },
  'arith-priorities': {
    lesson: {
      points: [
        t('Ordre de calcul : **1. parenthèses, 2. × et ÷, 3. + et −**.', 'Order: **1. brackets, 2. × and ÷, 3. + and −**.', 'الترتيب: **1. الأقواس 2. × و ÷ 3. + و −**.', 'Orden: **1. paréntesis, 2. × y ÷, 3. + y −**.'),
        t('À priorité égale, on calcule **de gauche à droite**.', 'With equal priority, work **left to right**.', 'عند التساوي، **من اليسار إلى اليمين**.', 'Con igual prioridad, **de izquierda a derecha**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('7 + 2 × 5 = 7 + 10 = 17 (et non 9 × 5).', '7 + 2 × 5 = 7 + 10 = 17 (not 9 × 5).', '7 + 2 × 5 = 17.', '7 + 2 × 5 = 17.'), t('30 − 20 ÷ 5 = 30 − 4 = 26.', '30 − 20 ÷ 5 = 30 − 4 = 26.', '30 − 20 ÷ 5 = 26.', '30 − 20 ÷ 5 = 26.')),
    },
  },
  'arith-problems': {
    goal: t('27 œufs, des boîtes de 6 : fais les paquets. Faut-il une boîte de plus pour les derniers ?', '27 eggs, boxes of 6: make the packs. Do the last ones need one more box?', '27 بيضة وعلب من 6: هل نحتاج علبة إضافية؟', '27 huevos, cajas de 6: ¿hace falta otra caja?'),
    manip: { kind: 'share', n: 27, by: 6 },
    lesson: {
      points: [
        t('« Combien de boîtes **pleines** ? » → le quotient. « Combien de cars **faut-il** ? » → le quotient **+ 1** s’il y a un reste.', '“How many **full** boxes?” → the quotient. “How many coaches **are needed**?” → the quotient **+ 1** if there is a remainder.', '« كم علبة **ممتلئة**؟» ← الخارج. « كم حافلة **نحتاج**؟» ← الخارج + 1 إذا كان هناك باقٍ.', '«¿Cuántas cajas **llenas**?» → cociente. «¿Cuántos autocares **hacen falta**?» → cociente **+ 1** si sobra.'),
        t('Avant de calculer, on **estime** en arrondissant : 29 × 81 ≈ 30 × 80 = 2 400.', 'Before calculating, **estimate** by rounding: 29 × 81 ≈ 30 × 80 = 2,400.', 'قبل الحساب **نقدّر**: 29 × 81 ≈ 2400.', 'Antes de calcular, **estima**: 29 × 81 ≈ 2 400.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('128 élèves, cars de 50 : 128 = 50 × 2 + 28 → il faut 3 cars.', '128 pupils, 50-seat coaches: 128 = 50 × 2 + 28 → 3 coaches.', '128 = 50 × 2 + 28 ← 3 حافلات.', '128 = 50 × 2 + 28 → 3 autocares.')),
    },
  },
  // ───────────── Puissances ─────────────
  'pow-notation': {
    goal: t('Multiplie 2 par lui-même, encore et encore, jusqu’à l’exposant 5. Observe comme ça grandit !', 'Multiply 2 by itself again and again, up to exponent 5. Watch it grow!', 'اضرب 2 في نفسه حتى الأس 5.', 'Multiplica 2 por sí mismo hasta el exponente 5.'),
    manip: { kind: 'repeat', base: 2, exponent: 5 },
    lesson: {
      points: [
        t('aⁿ = a × a × … × a (**n facteurs**). n est l’**exposant**.', 'aⁿ = a × a × … × a (**n factors**). n is the **exponent**.', 'aⁿ = a × a × … × a (**n عوامل**).', 'aⁿ = a × a × … × a (**n factores**).'),
        t('a² se lit « a au carré », a³ « a au cube ». Attention : 6² = 36, pas 12.', 'a² is “a squared”, a³ “a cubed”. Careful: 6² = 36, not 12.', 'انتبه: 6² = 36 وليس 12.', 'Cuidado: 6² = 36, no 12.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('5 × 5 × 5 = 5³ = 125.', '5 × 5 × 5 = 5³ = 125.', '5 × 5 × 5 = 5³ = 125.', '5 × 5 × 5 = 5³ = 125.')),
    },
  },
  'pow-ten': {
    goal: t('Pars de 1 et multiplie par 10 jusqu’à 1 000. Combien de fois as-tu multiplié ?', 'Start at 1 and multiply by 10 up to 1,000. How many times did you multiply?', 'انطلق من 1 واضرب في 10 حتى 1000.', 'Sal de 1 y multiplica por 10 hasta 1 000.'),
    manip: { kind: 'place-value', start: 1, target: 1000 },
    lesson: {
      points: [
        t('10ⁿ s’écrit **1 suivi de n zéros** : 10³ = 1 000, 10⁶ = 1 000 000.', '10ⁿ is **1 followed by n zeros**: 10³ = 1,000, 10⁶ = 1,000,000.', '10ⁿ هو **1 متبوعًا بـ n أصفار**.', '10ⁿ es **1 seguido de n ceros**.'),
        t('Multiplier par 10ⁿ, c’est faire monter les chiffres de n rangs.', 'Multiplying by 10ⁿ moves the digits up n places.', 'الضرب في 10ⁿ يرفع الأرقام n مراتب.', 'Multiplicar por 10ⁿ sube las cifras n lugares.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('5,1 × 10² = 5,1 × 100 = 510.', '5.1 × 10² = 5.1 × 100 = 510.', '5,1 × 10² = 510.', '5,1 × 10² = 510.')),
    },
  },
  'pow-priorities': {
    lesson: {
      points: [
        t('Les **puissances passent avant** ×, ÷, + et − (mais après les parenthèses).', '**Powers come before** ×, ÷, + and − (but after brackets).', '**القوى قبل** × و ÷ و + و −.', '**Las potencias van antes** que ×, ÷, + y −.'),
        t('2 × 3² = 2 × 9 = 18, alors que (2 × 3)² = 6² = 36.', '2 × 3² = 2 × 9 = 18, whereas (2 × 3)² = 6² = 36.', '2 × 3² = 18 بينما (2 × 3)² = 36.', '2 × 3² = 18, pero (2 × 3)² = 36.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('7 + 2² = 7 + 4 = 11 · (7 + 2)² = 9² = 81', '7 + 2² = 7 + 4 = 11 · (7 + 2)² = 9² = 81', '7 + 2² = 11', '7 + 2² = 11')),
    },
  },
  'pow-compare': {
    lesson: {
      points: [
        t('Pour comparer des puissances, on les **calcule** : échanger base et exposant change le résultat.', 'To compare powers, **work them out**: swapping base and exponent changes the result.', 'لمقارنة القوى **نحسبها**.', 'Para comparar potencias, **calcúlalas**.'),
        t('Les **carrés parfaits** à connaître : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.', '**Perfect squares** to know: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.', '**المربعات الكاملة**: 1، 4، 9، 16، 25…', '**Cuadrados perfectos**: 1, 4, 9, 16, 25…'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('2⁵ = 32 et 5² = 25 : donc 2⁵ > 5².', '2⁵ = 32 and 5² = 25: so 2⁵ > 5².', '2⁵ = 32 و 5² = 25.', '2⁵ = 32 y 5² = 25.')),
    },
  },
  // ───────────── Puissances de 10 et notation scientifique (4e) ─────────────
  'sci-negative': {
    goal: t('Pars de 1 et divise par 10 jusqu’à 0,001. Combien de fois as-tu divisé ?', 'Start at 1 and divide by 10 down to 0.001. How many times did you divide?', 'انطلق من 1 واقسم على 10 حتى 0,001.', 'Sal de 1 y divide entre 10 hasta 0,001.'),
    manip: { kind: 'place-value', start: 1, target: 0.001 },
    lesson: {
      points: [
        t('10⁻ⁿ = 1 ÷ 10ⁿ : c’est un **petit nombre positif**, pas un négatif.', '10⁻ⁿ = 1 ÷ 10ⁿ: a **small positive number**, not a negative one.', '10⁻ⁿ = 1 ÷ 10ⁿ: **عدد موجب صغير**.', '10⁻ⁿ = 1 ÷ 10ⁿ: un **número positivo pequeño**.'),
        t('Dans 10⁻ⁿ, le 1 est au **n-ième rang après la virgule** : 10⁻³ = 0,001.', 'In 10⁻ⁿ, the 1 is in the **n-th place after the point**: 10⁻³ = 0.001.', 'في 10⁻ⁿ يكون 1 في **المرتبة n بعد الفاصلة**.', 'En 10⁻ⁿ, el 1 está en el **lugar n tras la coma**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('0,00001 : le 1 est au 5ᵉ rang → 10⁻⁵.', '0.00001: the 1 is in the 5th place → 10⁻⁵.', '0,00001 = 10⁻⁵.', '0,00001 = 10⁻⁵.')),
    },
  },
  'sci-rules': {
    lesson: {
      points: [
        t('10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ : on **ajoute** les exposants.', '10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ: **add** the exponents.', 'نجمع الأسس عند الضرب.', 'Al multiplicar, **se suman** los exponentes.'),
        t('10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ : on **soustrait**. (10ᵃ)ᵇ = 10ᵃˣᵇ : on **multiplie**.', '10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ: **subtract**. (10ᵃ)ᵇ: **multiply**.', 'نطرح عند القسمة ونضرب في قوة القوة.', 'Al dividir **se restan**; potencia de potencia: **se multiplican**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('10⁶ ÷ 10⁻⁴ = 10⁶⁻⁽⁻⁴⁾ = 10¹⁰.', '10⁶ ÷ 10⁻⁴ = 10⁶⁻⁽⁻⁴⁾ = 10¹⁰.', '10⁶ ÷ 10⁻⁴ = 10¹⁰.', '10⁶ ÷ 10⁻⁴ = 10¹⁰.')),
    },
  },
  'sci-notation': {
    goal: t('Fais glisser 7 400 avec ÷ 10 jusqu’à 7,4 (un seul chiffre avant la virgule). Compte les glissements.', 'Slide 7,400 with ÷ 10 down to 7.4 (one digit before the point). Count the moves.', 'أزح 7400 بـ ÷ 10 حتى 7,4. عد الإزاحات.', 'Desliza 7 400 con ÷ 10 hasta 7,4. Cuenta.'),
    manip: { kind: 'place-value', start: 7400, target: 7.4 },
    lesson: {
      points: [
        t('Notation scientifique : **a × 10ⁿ avec 1 ≤ a < 10** (un seul chiffre non nul avant la virgule).', 'Scientific notation: **a × 10ⁿ with 1 ≤ a < 10** (one non-zero digit before the point).', 'الكتابة العلمية: **a × 10ⁿ حيث 1 ≤ a < 10**.', 'Notación científica: **a × 10ⁿ con 1 ≤ a < 10**.'),
        t('n compte les rangs du glissement : positif pour un grand nombre, **négatif pour un nombre plus petit que 1**.', 'n counts the moves: positive for a big number, **negative for a number below 1**.', 'n موجب للعدد الكبير و**سالب للعدد الأصغر من 1**.', 'n positivo si es grande, **negativo si es menor que 1**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('7 400 = 7,4 × 10³ · 0,0017 = 1,7 × 10⁻³', '7,400 = 7.4 × 10³ · 0.0017 = 1.7 × 10⁻³', '7400 = 7,4 × 10³', '7 400 = 7,4 × 10³')),
    },
  },
  'sci-decimal': {
    lesson: {
      points: [
        t('× 10ⁿ : la virgule va **à droite** de n rangs. × 10⁻ⁿ : **à gauche** de n rangs.', '× 10ⁿ: the point moves **right** n places. × 10⁻ⁿ: **left** n places.', '× 10ⁿ: الفاصلة **يمينًا**. × 10⁻ⁿ: **يسارًا**.', '× 10ⁿ: la coma va a la **derecha**. × 10⁻ⁿ: a la **izquierda**.'),
        t('Pour comparer, on regarde d’abord les **exposants** : 2 × 10⁵ > 9 × 10³.', 'To compare, look at the **exponents** first: 2 × 10⁵ > 9 × 10³.', 'للمقارنة ننظر أولًا إلى **الأسس**.', 'Para comparar, mira primero los **exponentes**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('7,5 × 10² = 750 · 5,1 × 10⁻¹ = 0,51', '7.5 × 10² = 750 · 5.1 × 10⁻¹ = 0.51', '7,5 × 10² = 750', '7,5 × 10² = 750')),
    },
  },
  // ───────────── Racines carrées (3e) ─────────────
  'root-perfect': {
    goal: t('Construis un carré de 49 jetons : quelle longueur de côté faut-il ?', 'Build a square of 49 counters: what side length do you need?', 'كوّن مربعًا من 49 قطعة: ما طول الضلع؟', 'Forma un cuadrado de 49 fichas: ¿qué lado necesitas?'),
    manip: { kind: 'square', area: 49 },
    lesson: {
      points: [
        t('√a est le nombre **positif** dont le carré vaut a : √49 = 7 car 7² = 49.', '√a is the **positive** number whose square is a: √49 = 7 because 7² = 49.', '√a هو العدد **الموجب** الذي مربعه a.', '√a es el número **positivo** cuyo cuadrado es a.'),
        t('Piège : **√(a + b) ≠ √a + √b**. √(9 + 16) = √25 = 5, pas 3 + 4.', 'Trap: **√(a + b) ≠ √a + √b**. √(9 + 16) = √25 = 5, not 3 + 4.', 'فخ: **√(a + b) ≠ √a + √b**.', 'Trampa: **√(a + b) ≠ √a + √b**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('√144 = 12 car 12 × 12 = 144.', '√144 = 12 because 12 × 12 = 144.', '√144 = 12.', '√144 = 12.')),
    },
  },
  'root-simplify': {
    lesson: {
      points: [
        t('**√a × √b = √(a × b)** (pour a et b positifs).', '**√a × √b = √(a × b)** (for positive a and b).', '**√a × √b = √(a × b)**.', '**√a × √b = √(a × b)**.'),
        t('Pour simplifier, on fait apparaître un **carré parfait** : √27 = √(9 × 3) = 3√3.', 'To simplify, find a **perfect square**: √27 = √(9 × 3) = 3√3.', 'للتبسيط نُظهر **مربعًا كاملًا**.', 'Para simplificar, busca un **cuadrado perfecto**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('√2 × √8 = √16 = 4 · √12 = √(4 × 3) = 2√3', '√2 × √8 = √16 = 4 · √12 = 2√3', '√2 × √8 = 4', '√2 × √8 = 4')),
    },
  },
  'root-equation': {
    lesson: {
      points: [
        t('x² = a avec **a > 0** : deux solutions, **√a et −√a**.', 'x² = a with **a > 0**: two solutions, **√a and −√a**.', 'x² = a مع **a > 0**: حلان **√a و −√a**.', 'x² = a con **a > 0**: dos soluciones, **√a y −√a**.'),
        t('x² = 0 : une seule solution, 0. **x² = a avec a < 0 : aucune**, car un carré n’est jamais négatif.', 'x² = 0: one solution, 0. **x² = a with a < 0: none**, a square is never negative.', 'x² = 0: حل واحد. **a < 0: لا حل**.', 'x² = 0: una solución. **a < 0: ninguna**.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('x² = 81 : x = 9 ou x = −9 · x² = −2 : pas de solution', 'x² = 81: x = 9 or x = −9 · x² = −2: no solution', 'x² = 81: x = 9 أو x = −9', 'x² = 81: x = 9 o x = −9')),
    },
  },
  'root-approx': {
    goal: t('Essaie de faire un carré de 54 jetons. Quels carrés l’encadrent ?', 'Try to make a square of 54 counters. Which squares are either side?', 'حاول تكوين مربع من 54 قطعة.', 'Intenta formar un cuadrado de 54 fichas.'),
    manip: { kind: 'square', area: 54 },
    lesson: {
      points: [
        t('Si a n’est pas un carré parfait, on **encadre** √a entre deux entiers : 7² = 49 < 54 < 64 = 8², donc 7 < √54 < 8.', 'If a is not a perfect square, **bound** √a: 7² = 49 < 54 < 64 = 8², so 7 < √54 < 8.', 'إذا لم يكن a مربعًا كاملًا **نؤطر** √a.', 'Si a no es un cuadrado perfecto, **acota** √a.'),
        t('La calculatrice donne une valeur approchée ; on **arrondit** comme demandé.', 'A calculator gives an approximate value; **round** as asked.', 'الآلة الحاسبة تعطي قيمة مقربة.', 'La calculadora da un valor aproximado.'),
      ],
      example: ex(t('Exemple', 'Example', 'مثال', 'Ejemplo'), t('Hypoténuse : √(7² + 2²) = √53 ≈ 7,3 cm.', 'Hypotenuse: √(7² + 2²) = √53 ≈ 7.3 cm.', 'الوتر: √53 ≈ 7,3 cm.', 'Hipotenusa: √53 ≈ 7,3 cm.')),
    },
  },
};
