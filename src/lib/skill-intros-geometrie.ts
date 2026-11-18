// Introductions de la famille « Géométrie » : droites et angles, triangles et quadrilatères, symétries,
// périmètres-aires-volumes, Pythagore, Thalès, trigonométrie, angles inscrits, vecteurs, solides.
// Les compétences dont l'entraînement contient déjà une manipulation (équerre, carreaux, cercle, quadrillage)
// commencent par leur carte de cours. Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const GEOMETRIE_INTROS: Record<string, Intro> = {
  // ───────────── Droites et angles (6e) ─────────────
  'lines-notation': {
    lesson: {
      points: [
        t('**(AB)** : la droite, sans fin des deux côtés. **[AB]** : le segment, de A à B. **[AB)** : la demi-droite, qui part de A et passe par B.', '**(AB)**: the line, endless both ways. **[AB]**: the segment from A to B. **[AB)**: the ray from A through B.', '**(AB)** المستقيم، **[AB]** القطعة، **[AB)** نصف المستقيم.', '**(AB)** recta, **[AB]** segmento, **[AB)** semirrecta.'),
        t('Seul le segment a une **longueur** : on la note AB, sans crochets.', 'Only the segment has a **length**, written AB without brackets.', 'القطعة وحدها لها **طول** نكتبه AB.', 'Solo el segmento tiene **longitud**: AB.'),
      ],
      example: ex(EX, t('[AB] mesure 5 cm : on écrit AB = 5 cm.', '[AB] is 5 cm long: write AB = 5 cm.', 'AB = 5 cm.', 'AB = 5 cm.')),
    },
  },
  'lines-perp-parallel': {
    lesson: {
      points: [
        t('**Perpendiculaires** : elles se coupent en formant un angle droit. **Parallèles** : elles ne se coupent jamais.', '**Perpendicular**: they cross at a right angle. **Parallel**: they never meet.', '**متعامدان**: يتقاطعان بزاوية قائمة. **متوازيان**: لا يتقاطعان.', '**Perpendiculares**: ángulo recto. **Paralelas**: nunca se cortan.'),
        t('Deux droites perpendiculaires à une même troisième sont **parallèles** entre elles.', 'Two lines perpendicular to the same third line are **parallel**.', 'مستقيمان عموديان على نفس المستقيم **متوازيان**.', 'Dos perpendiculares a una misma recta son **paralelas**.'),
      ],
      example: ex(EX, t('(d) ⊥ (Δ) et (e) ⊥ (Δ) donc (d) ∥ (e).', '(d) ⊥ (Δ) and (e) ⊥ (Δ) so (d) ∥ (e).', '(d) ∥ (e).', '(d) ∥ (e).')),
    },
  },
  'angles-measure': {
    goal: t('Ouvre l’angle jusqu’à 65°. Regarde où se place la demi-droite.', 'Open the angle to 65°. See where the ray ends up.', 'افتح الزاوية حتى 65°.', 'Abre el ángulo hasta 65°.'),
    manip: { kind: 'angle-builder', target: 65 },
    lesson: {
      points: [
        t('On place le **centre du rapporteur sur le sommet**, et le 0 sur un côté de l’angle.', 'Put the **protractor’s centre on the vertex** and 0 on one side.', 'نضع **مركز المنقلة على الرأس** والصفر على ضلع.', 'Centro del transportador **en el vértice**, 0 sobre un lado.'),
        t('On lit sur la **graduation qui part de 0** (intérieure ou extérieure) : c’est le piège du sens de lecture.', 'Read on the **scale that starts at 0** (inner or outer): watch the direction.', 'نقرأ على **التدريج الذي يبدأ من 0**.', 'Lee en la **escala que empieza en 0**.'),
      ],
      example: ex(EX, t('Côté sur le 0 de la graduation extérieure, l’autre côté sur 65 → 65°.', 'One side on 0 of the outer scale, the other on 65 → 65°.', '65°.', '65°.')),
    },
  },
  'angles-kinds': {
    goal: t('Ouvre l’angle petit à petit jusqu’à l’angle plat. Il change de nom en route !', 'Open the angle little by little up to a straight angle. Its name changes on the way!', 'افتح الزاوية حتى الزاوية المستقيمة.', 'Abre el ángulo hasta el llano.'),
    manip: { kind: 'angle-builder', target: 180 },
    lesson: {
      points: [
        t('**Aigu** : moins de 90°. **Droit** : 90°. **Obtus** : entre 90° et 180°. **Plat** : 180°.', '**Acute**: under 90°. **Right**: 90°. **Obtuse**: between 90° and 180°. **Straight**: 180°.', '**حادة** < 90°، **قائمة** 90°، **منفرجة** بين 90° و 180°، **مستقيمة** 180°.', '**Agudo** < 90°, **recto** 90°, **obtuso**, **llano** 180°.'),
        t('L’équerre vérifie un angle droit ; le rapporteur mesure les autres.', 'A set square checks a right angle; a protractor measures the others.', 'الكوس للزاوية القائمة والمنقلة للباقي.', 'La escuadra comprueba el recto.'),
      ],
      example: ex(EX, t('120° est obtus ; 35° est aigu.', '120° is obtuse; 35° is acute.', '120° منفرجة.', '120° es obtuso.')),
    },
  },
  // ───────────── Triangles et quadrilatères ─────────────
  'poly-quads': {
    lesson: {
      points: [
        t('**Parallélogramme** : côtés opposés parallèles. **Rectangle** : 4 angles droits. **Losange** : 4 côtés égaux. **Carré** : les deux à la fois.', '**Parallelogram**: opposite sides parallel. **Rectangle**: 4 right angles. **Rhombus**: 4 equal sides. **Square**: both.', 'متوازي الأضلاع، المستطيل، المعين، المربع.', 'Paralelogramo, rectángulo, rombo, cuadrado.'),
        t('Le carré est un rectangle **et** un losange : on donne toujours le nom le plus précis.', 'A square is a rectangle **and** a rhombus: always give the most precise name.', 'المربع مستطيل **و** معين.', 'El cuadrado es rectángulo **y** rombo.'),
      ],
      example: ex(EX, t('4 côtés de 4 cm et 4 angles droits → un carré.', '4 sides of 4 cm and 4 right angles → a square.', '← مربع.', '→ cuadrado.')),
    },
  },
  'poly-triangles': {
    lesson: {
      points: [
        t('**Équilatéral** : 3 côtés égaux. **Isocèle** : 2 côtés égaux. **Rectangle** : un angle droit.', '**Equilateral**: 3 equal sides. **Isosceles**: 2 equal sides. **Right-angled**: one right angle.', '**متساوي الأضلاع**، **متساوي الساقين**، **قائم**.', '**Equilátero**, **isósceles**, **rectángulo**.'),
        t('Sur une figure, les **codages** (traits, angle droit) comptent plus que l’apparence.', 'On a figure, the **markings** count more than how it looks.', '**الترميز** أهم من المظهر.', 'Las **marcas** cuentan más que la apariencia.'),
      ],
      example: ex(EX, t('Périmètre d’un équilatéral de côté 3 cm : 3 × 3 = 9 cm.', 'Perimeter of an equilateral triangle with side 3 cm: 9 cm.', '9 cm.', '9 cm.')),
    },
  },
  'poly-inequality': {
    goal: t('Deux bâtons mesurent 6 et 3. Change la longueur du troisième : quand peut-on fermer le triangle ?', 'Two sticks are 6 and 3 long. Change the third one: when does the triangle close?', 'عودان طولهما 6 و 3. متى يُغلق المثلث؟', 'Dos palos de 6 y 3. ¿Cuándo se cierra el triángulo?'),
    manip: { kind: 'sticks', a: 6, b: 3 },
    lesson: {
      points: [
        t('**Inégalité triangulaire** : le plus grand côté doit être **plus petit que la somme** des deux autres.', '**Triangle inequality**: the longest side must be **less than the sum** of the other two.', '**المتفاوتة المثلثية**: أطول ضلع **أصغر من مجموع** الآخرين.', '**Desigualdad triangular**: el mayor lado **menor que la suma** de los otros.'),
        t('S’il est égal à la somme, les trois points sont **alignés** : triangle « aplati ».', 'If it equals the sum, the points are **collinear**: a “flat” triangle.', 'إذا ساواه فالنقط **مستقيمية**.', 'Si es igual, los puntos están **alineados**.'),
      ],
      example: ex(EX, t('6, 3, 10 : 10 > 6 + 3 → impossible. 6, 3, 8 : 8 < 9 → possible.', '6, 3, 10: 10 > 9 → impossible. 6, 3, 8: 8 < 9 → possible.', '6، 3، 8 ممكن.', '6, 3, 8: posible.')),
    },
  },
  'poly-parallelogram': {
    lesson: {
      points: [
        t('Dans un parallélogramme : **côtés opposés de même longueur**, et **diagonales qui se coupent en leur milieu**.', 'In a parallelogram: **opposite sides are equal**, and **the diagonals bisect each other**.', 'في متوازي الأضلاع: **الأضلاع المتقابلة متقايسة** و**القطران لهما نفس المنتصف**.', 'Lados opuestos **iguales**, diagonales que **se cortan en su punto medio**.'),
        t('Pour placer D : on fait de C à D le même trajet que de B à A.', 'To place D: go from C to D by the same move as from B to A.', 'للانتقال من C إلى D نفس إزاحة B إلى A.', 'De C a D, el mismo trayecto que de B a A.'),
      ],
      example: ex(EX, t('EF = 8 cm → GH = 8 cm · EG = 10 cm → EO = 5 cm', 'EF = 8 cm → GH = 8 cm · EG = 10 cm → EO = 5 cm', 'GH = 8 cm · EO = 5 cm', 'GH = 8 cm · EO = 5 cm')),
    },
  },
  // ───────────── Angles (5e) ─────────────
  'ang-sum': {
    goal: t('Déforme le triangle en déplaçant son sommet. Les angles changent… mais leur somme ?', 'Reshape the triangle by moving its top vertex. The angles change… but their sum?', 'غيّر شكل المثلث. هل يتغير مجموع زواياه؟', 'Deforma el triángulo. ¿Cambia la suma de sus ángulos?'),
    manip: { kind: 'triangle-angles' },
    lesson: {
      points: [
        t('Dans **tout** triangle, la somme des trois angles vaut **180°**.', 'In **every** triangle, the three angles add up to **180°**.', 'في **كل** مثلث مجموع الزوايا **180°**.', 'En **todo** triángulo la suma es **180°**.'),
        t('Triangle rectangle : les deux angles aigus font 90° ensemble. Équilatéral : 60° chacun.', 'Right triangle: the two acute angles make 90°. Equilateral: 60° each.', 'المثلث القائم: الحادتان 90°. متساوي الأضلاع: 60°.', 'Rectángulo: los agudos suman 90°. Equilátero: 60°.'),
      ],
      example: ex(EX, t('70° et 50° → le troisième : 180 − 70 − 50 = 60°.', '70° and 50° → the third: 180 − 70 − 50 = 60°.', '60°.', '60°.')),
    },
  },
  'ang-supplementary': {
    goal: t('Deux angles côte à côte forment un angle plat. Ouvre le premier : que devient le second ?', 'Two angles side by side make a straight angle. Open the first: what happens to the second?', 'زاويتان متجاورتان تكوّنان زاوية مستقيمة.', 'Dos ángulos contiguos forman un llano.'),
    manip: { kind: 'angle-builder', target: 120, pair: true },
    lesson: {
      points: [
        t('**Supplémentaires** : somme 180°. **Complémentaires** : somme 90°.', '**Supplementary**: sum 180°. **Complementary**: sum 90°.', '**متكاملتان**: 180°. **متتامتان**: 90°.', '**Suplementarios**: 180°. **Complementarios**: 90°.'),
        t('Deux angles **opposés par le sommet** ont la même mesure.', '**Vertically opposite** angles are equal.', 'الزاويتان **المتقابلتان بالرأس** متساويتان.', 'Los **opuestos por el vértice** son iguales.'),
      ],
      example: ex(EX, t('120° et 60° sont supplémentaires ; 15° et 75° complémentaires.', '120° and 60° are supplementary; 15° and 75° complementary.', '120° و 60° متكاملتان.', '120° y 60° suplementarios.')),
    },
  },
  'ang-parallel': {
    lesson: {
      points: [
        t('Deux parallèles coupées par une sécante : les angles **alternes-internes** sont égaux, les angles **correspondants** aussi.', 'Two parallels cut by a transversal: **alternate interior** angles are equal, and so are **corresponding** angles.', 'متوازيان وقاطع: الزوايا **المتبادلة داخليًا** و**المتناظرة** متساوية.', 'Paralelas y secante: **alternos internos** y **correspondientes** iguales.'),
        t('Réciproquement : si des alternes-internes sont égaux, les droites sont parallèles.', 'Conversely: equal alternate interior angles mean the lines are parallel.', 'وبالعكس.', 'Y recíprocamente.'),
      ],
      example: ex(EX, t('(d) ∥ (d′), un angle de 40° en bas → son correspondant en haut mesure 40°.', '(d) ∥ (d′), 40° below → its corresponding angle above is 40°.', '40°.', '40°.')),
    },
  },
  // ───────────── Symétries ─────────────
  'sym-axes': {
    lesson: {
      points: [
        t('Un **axe de symétrie** partage la figure en deux moitiés qui se superposent par pliage.', 'An **axis of symmetry** splits the figure into two halves that match when folded.', '**محور التماثل** يقسم الشكل إلى نصفين متطابقين بالطي.', 'Un **eje de simetría** divide la figura en dos mitades que coinciden al doblar.'),
        t('Carré : 4 axes. Rectangle et losange : 2. Triangle équilatéral : 3. Parallélogramme : aucun.', 'Square: 4. Rectangle and rhombus: 2. Equilateral triangle: 3. Parallelogram: none.', 'المربع 4، المستطيل والمعين 2، متساوي الأضلاع 3، متوازي الأضلاع 0.', 'Cuadrado 4, rectángulo y rombo 2, equilátero 3, paralelogramo 0.'),
      ],
      example: ex(EX, t('Un cercle a une infinité d’axes : tous ses diamètres.', 'A circle has infinitely many axes: all its diameters.', 'للدائرة ما لا نهاية من المحاور.', 'El círculo tiene infinitos ejes.')),
    },
  },
  'sym-axial': {
    lesson: {
      points: [
        t('M′ est le symétrique de M par rapport à (d) si (d) est la **médiatrice** de [MM′] : perpendiculaire, et au milieu.', 'M′ is the reflection of M in (d) if (d) is the **perpendicular bisector** of [MM′].', '(d) هو **واسط** [MM′].', '(d) es la **mediatriz** de [MM′].'),
        t('Sur quadrillage : même nombre de carreaux de chaque côté de l’axe, sur une perpendiculaire.', 'On a grid: the same number of squares on each side of the axis, along a perpendicular.', 'نفس عدد المربعات من جهتي المحور.', 'Mismo número de cuadros a cada lado.'),
      ],
      example: ex(EX, t('M est à 3 carreaux à gauche de l’axe → M′ à 3 carreaux à droite.', 'M is 3 squares left of the axis → M′ is 3 squares right.', 'M′ على 3 مربعات يمينًا.', 'M′ a 3 cuadros a la derecha.')),
    },
  },
  'sym-central': {
    lesson: {
      points: [
        t('A′ est le symétrique de A par rapport à O si **O est le milieu de [AA′]** : demi-tour autour de O.', 'A′ is the image of A by point symmetry in O if **O is the midpoint of [AA′]**: a half-turn.', '**O منتصف [AA′]**: نصف دورة.', '**O es el punto medio de [AA′]**.'),
        t('Sur quadrillage : même déplacement de A vers O que de O vers A′.', 'On a grid: the same move from A to O as from O to A′.', 'نفس الإزاحة من A إلى O ومن O إلى A′.', 'Mismo desplazamiento de A a O que de O a A′.'),
      ],
      example: ex(EX, t('A(1 ; 2), O(3 ; 3) : +2, +1 → A′(5 ; 4).', 'A(1, 2), O(3, 3): +2, +1 → A′(5, 4).', 'A′(5 ; 4).', 'A′(5 ; 4).')),
    },
  },
  'sym-properties': {
    lesson: {
      points: [
        t('Une symétrie **conserve** les longueurs, les angles, les aires et l’alignement.', 'A symmetry **keeps** lengths, angles, areas and alignment.', 'التماثل **يحافظ** على الأطوال والزوايا والمساحات.', 'La simetría **conserva** longitudes, ángulos y áreas.'),
        t('La figure symétrique est **superposable** à la figure de départ.', 'The image can be **laid exactly over** the original.', 'الشكل المماثل **قابل للتطابق**.', 'La imagen es **superponible**.'),
      ],
      example: ex(EX, t('[AB] = 7 cm → [A′B′] = 7 cm ; un angle de 35° reste 35°.', '[AB] = 7 cm → [A′B′] = 7 cm; 35° stays 35°.', '7 cm و 35°.', '7 cm y 35°.')),
    },
  },
  // ───────────── Périmètres, aires, volumes (6e) ─────────────
  'meas-perimeter': {
    goal: t('Change la longueur et la largeur du rectangle. Regarde le périmètre (le tour) et l’aire (la surface).', 'Change the rectangle’s length and width. Watch the perimeter (around) and the area (inside).', 'غيّر طول المستطيل وعرضه. لاحظ المحيط والمساحة.', 'Cambia el largo y el ancho. Mira el perímetro y el área.'),
    manip: { kind: 'resize-rect', w: 6, h: 2 },
    lesson: {
      points: [
        t('Le **périmètre** est la longueur du tour. Rectangle : **2 × (L + l)**.', 'The **perimeter** is the distance around. Rectangle: **2 × (L + w)**.', '**المحيط** طول الدوران: **2 × (L + l)**.', 'El **perímetro** es el contorno: **2 × (L + a)**.'),
        t('Conversions : 1 km = 1 000 m, 1 m = 100 cm.', 'Conversions: 1 km = 1,000 m, 1 m = 100 cm.', '1 km = 1000 m.', '1 km = 1 000 m.'),
      ],
      example: ex(EX, t('Rectangle 23 m × 8 m : 2 × (23 + 8) = 62 m.', '23 m × 8 m rectangle: 2 × (23 + 8) = 62 m.', '62 m.', '62 m.')),
    },
  },
  'meas-area': {
    goal: t('Garde un périmètre de 16 et essaie plusieurs rectangles : l’aire change-t-elle ?', 'Keep a perimeter of 16 and try several rectangles: does the area change?', 'حافظ على محيط 16 وجرب مستطيلات عدة.', 'Mantén un perímetro de 16: ¿cambia el área?'),
    manip: { kind: 'resize-rect', w: 7, h: 1 },
    lesson: {
      points: [
        t('L’**aire** mesure la surface, en **cm²** (carreaux de 1 cm de côté). Rectangle : **L × l**.', '**Area** measures the surface, in **cm²**. Rectangle: **L × w**.', '**المساحة** بـ **cm²**: **L × l**.', 'El **área** en **cm²**: **L × a**.'),
        t('Triangle : **(base × hauteur) ÷ 2**. Même périmètre ne veut pas dire même aire !', 'Triangle: **(base × height) ÷ 2**. Same perimeter does not mean same area!', 'المثلث: **(القاعدة × الارتفاع) ÷ 2**.', 'Triángulo: **(base × altura) ÷ 2**.'),
      ],
      example: ex(EX, t('12 cm × 5 cm = 60 cm² · triangle 8 × 3 ÷ 2 = 12 cm²', '12 × 5 = 60 cm² · triangle 8 × 3 ÷ 2 = 12 cm²', '60 cm² · 12 cm²', '60 cm² · 12 cm²')),
    },
  },
  'meas-circle': {
    goal: t('Déroule le cercle de diamètre 2 : combien de diamètres mesure son tour ?', 'Unroll the circle of diameter 2: how many diameters long is it?', 'افرد الدائرة: كم قطرًا يساوي محيطها؟', 'Desenrolla el círculo: ¿cuántos diámetros mide?'),
    manip: { kind: 'unroll', d: 2 },
    lesson: {
      points: [
        t('Le tour d’un cercle mesure **un peu plus de 3 diamètres** : **π × d** (π ≈ 3,14).', 'A circle’s circumference is **a bit more than 3 diameters**: **π × d** (π ≈ 3.14).', 'محيط الدائرة **π × d**.', 'El perímetro es **π × d**.'),
        t('Diamètre = 2 × rayon. Aire du disque : **π × r × r**.', 'Diameter = 2 × radius. Disc area: **π × r × r**.', 'القطر = 2 × الشعاع. المساحة **π × r²**.', 'Diámetro = 2 × radio. Área: **π × r²**.'),
      ],
      example: ex(EX, t('Rayon 5 cm : périmètre ≈ 31,4 cm, aire ≈ 78,5 cm².', 'Radius 5 cm: circumference ≈ 31.4 cm, area ≈ 78.5 cm².', '31,4 cm و 78,5 cm².', '31,4 cm y 78,5 cm².')),
    },
  },
  'meas-volume': {
    goal: t('Remplis la boîte de petits cubes : d’abord une couche, puis les étages.', 'Fill the box with small cubes: one layer first, then the floors.', 'املأ العلبة بمكعبات: طبقة ثم طوابق.', 'Llena la caja de cubitos: una capa y luego los pisos.'),
    manip: { kind: 'cubes', l: 4, w: 3, h: 3 },
    lesson: {
      points: [
        t('Volume du pavé : **L × l × h** (cubes par couche × nombre de couches), en **cm³**.', 'Cuboid volume: **L × w × h** (cubes per layer × layers), in **cm³**.', 'حجم متوازي المستطيلات: **L × l × h**.', 'Volumen del ortoedro: **L × a × h**.'),
        t('**1 L = 1 dm³ = 1 000 cm³**.', '**1 L = 1 dm³ = 1,000 cm³**.', '**1 L = 1 dm³**.', '**1 L = 1 dm³**.'),
      ],
      example: ex(EX, t('50 × 30 × 40 = 60 000 cm³ = 60 L', '50 × 30 × 40 = 60,000 cm³ = 60 L', '60 L', '60 L')),
    },
  },
  // ───────────── Aires et volumes (5e) ─────────────
  'area-triangle': {
    goal: t('Double le triangle : avec sa copie retournée, il forme un parallélogramme de même base et même hauteur.', 'Double the triangle: with its flipped copy it makes a parallelogram with the same base and height.', 'ضاعف المثلث فتحصل على متوازي أضلاع.', 'Duplica el triángulo: forma un paralelogramo.'),
    manip: { kind: 'area-transform', shape: 'triangle', b: 6, h: 4 },
    lesson: {
      points: [
        t('Un triangle est **la moitié** d’un parallélogramme de même base et même hauteur : **A = (b × h) ÷ 2**.', 'A triangle is **half** a parallelogram with the same base and height: **A = (b × h) ÷ 2**.', 'المثلث **نصف** متوازي أضلاع: **(b × h) ÷ 2**.', 'Un triángulo es la **mitad**: **(b × h) ÷ 2**.'),
        t('La **hauteur** est perpendiculaire à la base, elle passe par le sommet opposé.', 'The **height** is perpendicular to the base, through the opposite vertex.', '**الارتفاع** عمودي على القاعدة.', 'La **altura** es perpendicular a la base.'),
      ],
      example: ex(EX, t('Base 8 cm, hauteur 3 cm : 8 × 3 ÷ 2 = 12 cm².', 'Base 8 cm, height 3 cm: 12 cm².', '12 cm².', '12 cm².')),
    },
  },
  'area-parallelogram': {
    goal: t('Découpe le triangle à gauche et recolle-le à droite : quelle forme obtiens-tu ?', 'Cut the triangle off the left and stick it on the right: what shape do you get?', 'قص المثلث الأيسر وألصقه يمينًا.', 'Recorta el triángulo y pégalo a la derecha.'),
    manip: { kind: 'area-transform', shape: 'parallelogram', b: 6, h: 3 },
    lesson: {
      points: [
        t('Un parallélogramme a la même aire qu’un rectangle de même base et même hauteur : **A = b × h**.', 'A parallelogram has the same area as a rectangle with the same base and height: **A = b × h**.', '**A = b × h**.', '**A = b × h**.'),
        t('Attention : on multiplie par la **hauteur**, pas par le côté penché.', 'Careful: multiply by the **height**, not the slanted side.', 'نضرب في **الارتفاع** لا في الضلع المائل.', 'Por la **altura**, no por el lado inclinado.'),
      ],
      example: ex(EX, t('Base 6 cm, hauteur 3 cm : 18 cm².', 'Base 6 cm, height 3 cm: 18 cm².', '18 cm².', '18 cm².')),
    },
  },
  'area-disk': {
    goal: t('Déroule le cercle de diamètre 3 : son tour fait un peu plus de 3 diamètres.', 'Unroll the circle of diameter 3: its circumference is a bit more than 3 diameters.', 'افرد الدائرة ذات القطر 3.', 'Desenrolla el círculo de diámetro 3.'),
    manip: { kind: 'unroll', d: 3 },
    lesson: {
      points: [
        t('Périmètre du cercle : **2 × π × r** (= π × d). Aire du disque : **π × r²**.', 'Circumference: **2 × π × r** (= π × d). Area: **π × r²**.', 'المحيط **2πr** والمساحة **πr²**.', 'Perímetro **2πr**, área **πr²**.'),
        t('On arrondit à la fin seulement, avec π de la calculatrice ou π ≈ 3,14.', 'Round only at the end, using the calculator’s π or π ≈ 3.14.', 'نقرّب في النهاية فقط.', 'Redondea solo al final.'),
      ],
      example: ex(EX, t('r = 7 cm : 2 × π × 7 ≈ 44 cm ; π × 49 ≈ 153,9 cm²', 'r = 7 cm: ≈ 44 cm; ≈ 153.9 cm²', '44 cm · 153,9 cm²', '44 cm · 153,9 cm²')),
    },
  },
  'volume-prism': {
    goal: t('Empile des couches identiques : le volume = aire d’une couche × nombre de couches.', 'Stack identical layers: volume = area of one layer × number of layers.', 'كدّس طبقات متطابقة.', 'Apila capas iguales.'),
    manip: { kind: 'cubes', l: 3, w: 2, h: 4 },
    lesson: {
      points: [
        t('Prisme droit et cylindre : **V = aire de la base × hauteur**.', 'Right prism and cylinder: **V = base area × height**.', 'الموشور والأسطوانة: **مساحة القاعدة × الارتفاع**.', 'Prisma y cilindro: **área de la base × altura**.'),
        t('Cylindre : la base est un disque, V = π × r² × h.', 'Cylinder: the base is a disc, V = π × r² × h.', 'الأسطوانة: V = π × r² × h.', 'Cilindro: V = π × r² × h.'),
      ],
      example: ex(EX, t('Base triangle de 6 cm², hauteur 7 cm : 42 cm³.', 'Triangle base of 6 cm², height 7 cm: 42 cm³.', '42 cm³.', '42 cm³.')),
    },
  },
  // ───────────── Géométrie dans l’espace (3e) ─────────────
  'solid-pyramid': {
    goal: t('Verse le contenu d’une pyramide dans le prisme de même base et même hauteur. Combien de pyramides pour le remplir ?', 'Pour a pyramid into the prism with the same base and height. How many pyramids fill it?', 'كم هرمًا يملأ الموشور؟', '¿Cuántas pirámides llenan el prisma?'),
    manip: { kind: 'pour', times: 3 },
    lesson: {
      points: [
        t('Pyramide et cône : **V = (aire de la base × hauteur) ÷ 3**, le tiers du prisme ou du cylindre.', 'Pyramid and cone: **V = (base area × height) ÷ 3**, a third of the prism or cylinder.', 'الهرم والمخروط: **ثلث** الموشور أو الأسطوانة.', 'Pirámide y cono: **un tercio** del prisma.'),
        t('Cône : V = π × r² × h ÷ 3.', 'Cone: V = π × r² × h ÷ 3.', 'المخروط: π × r² × h ÷ 3.', 'Cono: π × r² × h ÷ 3.'),
      ],
      example: ex(EX, t('Base carrée 7 cm, hauteur 3 cm : 49 × 3 ÷ 3 = 49 cm³.', 'Square base 7 cm, height 3 cm: 49 cm³.', '49 cm³.', '49 cm³.')),
    },
  },
  'solid-sphere': {
    lesson: {
      points: [
        t('Sphère de rayon r : aire **4πr²**. Boule : volume **4/3 πr³**.', 'Sphere of radius r: area **4πr²**. Ball: volume **4/3 πr³**.', 'المساحة **4πr²** والحجم **4/3 πr³**.', 'Área **4πr²**, volumen **4/3 πr³**.'),
        t('La sphère est la « peau », la boule est la sphère avec l’intérieur.', 'The sphere is the “skin”; the ball includes the inside.', 'الفلكة هي السطح والكرة مع الداخل.', 'La esfera es la «piel»; la bola incluye el interior.'),
      ],
      example: ex(EX, t('r = 5 cm : aire ≈ 314,2 cm², volume ≈ 523,6 cm³', 'r = 5 cm: area ≈ 314.2 cm², volume ≈ 523.6 cm³', '314,2 cm² · 523,6 cm³', '314,2 cm² · 523,6 cm³')),
    },
  },
  'solid-section': {
    lesson: {
      points: [
        t('La section d’une sphère par un plan est un **cercle**. Son rayon r vérifie **r² = R² − d²** (d : distance du centre au plan).', 'A plane cuts a sphere in a **circle**. Its radius r satisfies **r² = R² − d²**.', 'المقطع **دائرة** و **r² = R² − d²**.', 'La sección es un **círculo**: **r² = R² − d²**.'),
        t('Section d’un pavé par un plan parallèle à une face : un **rectangle**.', 'Cutting a cuboid parallel to a face gives a **rectangle**.', 'مقطع متوازي المستطيلات: **مستطيل**.', 'Sección de un ortoedro: **rectángulo**.'),
      ],
      example: ex(EX, t('R = 17, d = 8 : r² = 289 − 64 = 225, r = 15.', 'R = 17, d = 8: r² = 225, r = 15.', 'r = 15.', 'r = 15.')),
    },
  },
  'solid-scale': {
    goal: t('Agrandis le cube avec le rapport k. Compare les arêtes, les faces et le volume.', 'Enlarge the cube with scale factor k. Compare edges, faces and volume.', 'كبّر المكعب بالنسبة k.', 'Amplía el cubo con razón k.'),
    manip: { kind: 'enlarge', w: 2, h: 2, solid: true },
    lesson: {
      points: [
        t('Rapport k : longueurs **× k**, aires **× k²**, volumes **× k³**.', 'Scale factor k: lengths **× k**, areas **× k²**, volumes **× k³**.', 'الأطوال × k، المساحات × k²، الأحجام × k³.', 'Longitudes × k, áreas × k², volúmenes × k³.'),
        t('k > 1 : agrandissement ; 0 < k < 1 : réduction.', 'k > 1: enlargement; 0 < k < 1: reduction.', 'k > 1 تكبير، k < 1 تصغير.', 'k > 1 ampliación; k < 1 reducción.'),
      ],
      example: ex(EX, t('k = 1/2 : un volume de 40 cm³ devient 40 × 1/8 = 5 cm³.', 'k = 1/2: 40 cm³ becomes 40 × 1/8 = 5 cm³.', '5 cm³.', '5 cm³.')),
    },
  },
  // ───────────── Théorème de Pythagore ─────────────
  'pyth-recognise': {
    lesson: {
      points: [
        t('Un triangle est **rectangle** s’il a un angle droit. Le côté **en face de l’angle droit** est l’**hypoténuse**, le plus long.', 'A triangle is **right-angled** if it has a right angle. The side **opposite the right angle** is the **hypotenuse**, the longest.', 'المثلث **قائم** إذا كانت له زاوية قائمة؛ **الوتر** يقابلها.', 'El lado **opuesto al recto** es la **hipotenusa**.'),
        t('On vérifie un angle droit avec l’**équerre**.', 'Check a right angle with a **set square**.', 'نتحقق بـ**الكوس**.', 'Se comprueba con la **escuadra**.'),
      ],
      example: ex(EX, t('Rectangle en K : l’hypoténuse est [LM].', 'Right angle at K: the hypotenuse is [LM].', 'الوتر [LM].', 'La hipotenusa es [LM].')),
    },
  },
  'pyth-discover': {
    lesson: {
      points: [
        t('**Théorème de Pythagore** : si ABC est rectangle en A, alors **BC² = AB² + AC²**.', '**Pythagoras’ theorem**: if ABC has a right angle at A, then **BC² = AB² + AC²**.', '**مبرهنة فيثاغورس**: **BC² = AB² + AC²**.', '**Pitágoras**: **BC² = AB² + AC²**.'),
        t('Avec les carrés : l’aire du grand carré (sur l’hypoténuse) = la somme des aires des deux petits.', 'With squares: the big square’s area (on the hypotenuse) = the sum of the two small ones.', 'مساحة المربع الكبير = مجموع الصغيرين.', 'Área del cuadrado grande = suma de los pequeños.'),
      ],
      example: ex(EX, t('3² + 4² = 9 + 16 = 25 = 5²', '3² + 4² = 9 + 16 = 25 = 5²', '25 = 5²', '25 = 5²')),
    },
  },
  'pyth-compute': {
    lesson: {
      points: [
        t('Hypoténuse : **BC² = AB² + AC²** puis BC = √(…).', 'Hypotenuse: **BC² = AB² + AC²**, then BC = √(…).', 'الوتر: **BC² = AB² + AC²**.', 'Hipotenusa: **BC² = AB² + AC²**.'),
        t('Un autre côté : **on soustrait** : AB² = BC² − AC².', 'Another side: **subtract**: AB² = BC² − AC².', 'ضلع آخر: **نطرح**.', 'Otro lado: **resta**.'),
      ],
      example: ex(EX, t('ST² = 5² + 3² = 34, ST = √34 ≈ 5,8', 'ST² = 34, ST ≈ 5.8', 'ST ≈ 5,8', 'ST ≈ 5,8')),
    },
  },
  'pyth-converse': {
    lesson: {
      points: [
        t('**Réciproque** : si le carré du plus grand côté **égale** la somme des carrés des deux autres, le triangle est rectangle.', '**Converse**: if the longest side squared **equals** the sum of the other two squared, the triangle is right-angled.', '**العكسية**: إذا تحققت المساواة فالمثلث قائم.', '**Recíproco**: si se cumple la igualdad, es rectángulo.'),
        t('Sinon (≠), il **n’est pas** rectangle. On calcule les deux membres **séparément**.', 'If not (≠), it is **not** right-angled. Work out both sides **separately**.', 'وإلا فليس قائمًا.', 'Si no, **no** es rectángulo.'),
      ],
      example: ex(EX, t('6² = 36 et 3,6² + 4,8² = 36 : rectangle.', '6² = 36 and 3.6² + 4.8² = 36: right-angled.', 'قائم.', 'Es rectángulo.')),
    },
  },
  'pyth-problem': {
    lesson: {
      points: [
        t('On **repère le triangle rectangle** caché dans la situation (échelle et mur, diagonale…).', '**Spot the right triangle** hidden in the situation (ladder and wall, diagonal…).', '**نجد المثلث القائم** في الوضعية.', '**Busca el triángulo rectángulo** escondido.'),
        t('On fait un schéma, on nomme les points, puis Pythagore et une phrase-réponse.', 'Draw a sketch, name the points, then Pythagoras and a sentence answer.', 'نرسم ونسمي ثم نطبق.', 'Dibuja, nombra, aplica.'),
      ],
      example: ex(EX, t('40 m est puis 30 m nord : √(40² + 30²) = 50 m en diagonale.', '40 m east then 30 m north: √(40² + 30²) = 50 m.', '50 m.', '50 m.')),
    },
  },
  // ───────────── Théorème de Thalès ─────────────
  'thales-recognise': {
    lesson: {
      points: [
        t('Configuration de Thalès : deux droites sécantes en A, coupées par **deux parallèles** (triangles emboîtés ou « papillon »).', 'Intercept configuration: two lines meeting at A, cut by **two parallels** (nested triangles or “bow-tie”).', 'وضعية طاليس: مستقيمان متقاطعان و**متوازيان**.', 'Configuración de Tales: **dos paralelas**.'),
        t('Sans parallèles, pas de Thalès !', 'No parallels, no intercept theorem!', 'بدون توازٍ لا طاليس!', '¡Sin paralelas no hay Tales!'),
      ],
      example: ex(EX, t('E, H, F alignés ; E, K, G alignés ; (HK) ∥ (FG) → configuration de Thalès.', 'E, H, F collinear; E, K, G collinear; (HK) ∥ (FG) → intercept configuration.', '(HK) ∥ (FG).', '(HK) ∥ (FG).')),
    },
  },
  'thales-equality': {
    lesson: {
      points: [
        t('Si (MN) ∥ (BC) : **AM/AB = AN/AC = MN/BC**.', 'If (MN) ∥ (BC): **AM/AB = AN/AC = MN/BC**.', 'إذا (MN) ∥ (BC): **AM/AB = AN/AC = MN/BC**.', 'Si (MN) ∥ (BC): **AM/AB = AN/AC = MN/BC**.'),
        t('Les longueurs du **petit** triangle en haut, celles du **grand** en bas.', '**Small** triangle on top, **big** triangle below.', 'الصغير فوق والكبير تحت.', 'Pequeño arriba, grande abajo.'),
      ],
      example: ex(EX, t('EH/EF = EK/EG = HK/FG', 'EH/EF = EK/EG = HK/FG', 'EH/EF = EK/EG = HK/FG', 'EH/EF = EK/EG = HK/FG')),
    },
  },
  'thales-compute': {
    goal: t('Fais glisser M sur [AB] (N suit, (MN) reste parallèle à (BC)) : les trois rapports restent-ils égaux ?', 'Slide M along [AB] (N follows, (MN) stays parallel to (BC)): do the three ratios stay equal?', 'حرّك M على [AB]: هل تبقى النسب متساوية؟', 'Desliza M por [AB]: ¿siguen iguales las razones?'),
    manip: { kind: 'thales-slide', ab: 8, ac: 6, bc: 10 },
    lesson: {
      points: [
        t('On écrit l’égalité de Thalès, on garde **les deux rapports utiles**, puis **produit en croix**.', 'Write the ratios, keep **the two useful ones**, then **cross-multiply**.', 'نكتب النسب ونحتفظ **بنسبتين** ثم **الجداء التقاطعي**.', 'Escribe las razones, quédate con **dos** y **multiplica en cruz**.'),
        t('En papillon, c’est pareil : les points sont de part et d’autre de A.', 'In a bow-tie it is the same: the points are on either side of A.', 'في الفراشة نفس الشيء.', 'En la mariposa, igual.'),
      ],
      example: ex(EX, t('3/9 = HK/4 → HK = 3 × 4 ÷ 9 ≈ 1,3', '3/9 = HK/4 → HK = 3 × 4 ÷ 9 ≈ 1.3', 'HK ≈ 1,3', 'HK ≈ 1,3')),
    },
  },
  'thales-converse': {
    goal: t('Ici M et N bougent séparément. Trouve une position où AM/AB = AN/AC : que remarques-tu sur (MN) et (BC) ?', 'Here M and N move separately. Find a position where AM/AB = AN/AC: what do you notice about (MN) and (BC)?', 'هنا يتحرك M و N منفصلين. متى تتساوى النسبتان؟', 'M y N se mueven por separado. ¿Cuándo son iguales las razones?'),
    manip: { kind: 'thales-slide', ab: 8, ac: 6, bc: 10, free: true },
    lesson: {
      points: [
        t('**Réciproque** : si AM/AB = AN/AC et que les points sont **alignés dans le même ordre**, alors (MN) ∥ (BC).', '**Converse**: if AM/AB = AN/AC and the points are **in the same order**, then (MN) ∥ (BC).', '**العكسية**: إذا تساوت النسبتان والترتيب نفسه فـ (MN) ∥ (BC).', '**Recíproco**: razones iguales y mismo orden → paralelas.'),
        t('Si les rapports sont différents, les droites **ne sont pas** parallèles.', 'If the ratios differ, the lines are **not** parallel.', 'وإلا فليسا متوازيين.', 'Si no, **no** son paralelas.'),
      ],
      example: ex(EX, t('AM/AB = 3/6 = 0,5 et AN/AC = 4/8 = 0,5 → (MN) ∥ (BC).', 'AM/AB = 0.5 and AN/AC = 0.5 → (MN) ∥ (BC).', '(MN) ∥ (BC).', '(MN) ∥ (BC).')),
    },
  },
  'thales-scale': {
    goal: t('Agrandis le rectangle avec le rapport k : que deviennent les côtés ? Et l’aire ?', 'Enlarge the rectangle with scale factor k: what happens to the sides? And the area?', 'كبّر المستطيل بالنسبة k.', 'Amplía el rectángulo con razón k.'),
    manip: { kind: 'enlarge', w: 3, h: 2 },
    lesson: {
      points: [
        t('Rapport k = longueur image ÷ longueur de départ. Longueurs **× k**, aires **× k²**.', 'Scale factor k = image length ÷ original length. Lengths **× k**, areas **× k²**.', 'k = الصورة ÷ الأصل. الأطوال × k والمساحات × k².', 'k = imagen ÷ original. Longitudes × k, áreas × k².'),
        t('Les angles, eux, ne changent pas.', 'Angles do not change.', 'الزوايا لا تتغير.', 'Los ángulos no cambian.'),
      ],
      example: ex(EX, t('8 cm → 12 cm : k = 1,5 ; une aire de 18 cm² devient 18 × 2,25 = 40,5 cm².', '8 → 12 cm: k = 1.5; 18 cm² becomes 40.5 cm².', 'k = 1,5 · 40,5 cm²', 'k = 1,5 · 40,5 cm²')),
    },
  },
  // ───────────── Trigonométrie ─────────────
  'trigo-vocabulary': {
    lesson: {
      points: [
        t('Pour un angle aigu d’un triangle rectangle : l’**hypoténuse** (en face de l’angle droit), le côté **opposé** (en face de l’angle), le côté **adjacent** (qui touche l’angle).', 'For an acute angle of a right triangle: the **hypotenuse**, the **opposite** side, the **adjacent** side.', '**الوتر**، **المقابل**، **المجاور**.', '**Hipotenusa**, **opuesto**, **adyacente**.'),
        t('Opposé et adjacent **dépendent de l’angle choisi**.', 'Opposite and adjacent **depend on the chosen angle**.', 'المقابل والمجاور **يتعلقان بالزاوية**.', 'Opuesto y adyacente **dependen del ángulo**.'),
      ],
      example: ex(EX, t('Rectangle en R, angle S : opposé [RT], adjacent [RS], hypoténuse [ST].', 'Right angle at R, angle S: opposite [RT], adjacent [RS], hypotenuse [ST].', 'المقابل [RT] والمجاور [RS].', 'Opuesto [RT], adyacente [RS].')),
    },
  },
  'trigo-choose': {
    lesson: {
      points: [
        t('**SOH CAH TOA** : sin = opposé/hypoténuse, cos = adjacent/hypoténuse, tan = opposé/adjacent.', '**SOH CAH TOA**: sin = opp/hyp, cos = adj/hyp, tan = opp/adj.', 'sin = مقابل/وتر، cos = مجاور/وتر، tan = مقابل/مجاور.', 'sen = op/hip, cos = ady/hip, tan = op/ady.'),
        t('On choisit le rapport qui contient **le côté connu et le côté cherché**.', 'Choose the ratio containing **the known side and the side you want**.', 'نختار النسبة التي تحوي **المعلوم والمطلوب**.', 'Elige la razón con **el lado conocido y el buscado**.'),
      ],
      example: ex(EX, t('Adjacent connu, hypoténuse cherchée → cosinus.', 'Adjacent known, hypotenuse wanted → cosine.', '← cos.', '→ coseno.')),
    },
  },
  'trigo-length': {
    goal: t('L’angle reste 40°, change la taille du triangle : que deviennent les rapports adjacent/hypoténuse et opposé/hypoténuse ?', 'The angle stays 40°; change the triangle’s size: what happens to adjacent/hypotenuse and opposite/hypotenuse?', 'الزاوية ثابتة 40°: ماذا يحدث للنسب؟', 'El ángulo es 40°: ¿qué pasa con las razones?'),
    manip: { kind: 'trig-ratio', angle: 40, mode: 'size' },
    lesson: {
      points: [
        t('cos Ŝ = adjacent/hypoténuse donc **adjacent = hyp × cos Ŝ** et **hyp = adjacent ÷ cos Ŝ**.', 'cos Ŝ = adj/hyp so **adj = hyp × cos Ŝ** and **hyp = adj ÷ cos Ŝ**.', 'المجاور = الوتر × cos، الوتر = المجاور ÷ cos.', 'ady = hip × cos, hip = ady ÷ cos.'),
        t('Calculatrice en **mode degrés** ; on arrondit à la fin.', 'Calculator in **degree mode**; round at the end.', 'الآلة بـ**الدرجات**.', 'Calculadora en **grados**.'),
      ],
      example: ex(EX, t('Ŝ = 48°, RS = 5 : ST = 5 ÷ cos 48° ≈ 7,5', 'Ŝ = 48°, RS = 5: ST = 5 ÷ cos 48° ≈ 7.5', 'ST ≈ 7,5', 'ST ≈ 7,5')),
    },
  },
  'trigo-angle': {
    goal: t('Change l’angle du triangle rectangle : le cosinus change. À chaque angle son cosinus.', 'Change the right triangle’s angle: the cosine changes. Each angle has its own cosine.', 'غيّر الزاوية: لكل زاوية جيب تمامها.', 'Cambia el ángulo: cada ángulo tiene su coseno.'),
    manip: { kind: 'trig-ratio', angle: 30, mode: 'angle' },
    lesson: {
      points: [
        t('On calcule le rapport, puis la touche **cos⁻¹, sin⁻¹ ou tan⁻¹** donne l’angle.', 'Work out the ratio, then **cos⁻¹, sin⁻¹ or tan⁻¹** gives the angle.', 'نحسب النسبة ثم **cos⁻¹** يعطي الزاوية.', 'Calcula la razón y usa **cos⁻¹**.'),
        t('Un cosinus ou un sinus est toujours **entre 0 et 1** dans un triangle rectangle.', 'A cosine or sine is always **between 0 and 1** in a right triangle.', 'بين 0 و 1.', 'Entre 0 y 1.'),
      ],
      example: ex(EX, t('tan Ŝ = 3/4 = 0,75 → Ŝ = tan⁻¹(0,75) ≈ 37°', 'tan Ŝ = 0.75 → Ŝ ≈ 37°', 'Ŝ ≈ 37°', 'Ŝ ≈ 37°')),
    },
  },
  // ───────────── Angles inscrits ─────────────
  'inscribed-recognise': {
    lesson: {
      points: [
        t('**Angle inscrit** : sommet sur le cercle. **Angle au centre** : sommet au centre O.', '**Inscribed angle**: vertex on the circle. **Central angle**: vertex at the centre O.', '**محيطية**: رأسها على الدائرة. **مركزية**: رأسها المركز.', '**Inscrito**: vértice en la circunferencia. **Central**: en O.'),
        t('Il **intercepte** l’arc compris entre ses deux côtés.', 'It **subtends** the arc between its two sides.', '**يحصر** القوس بين ضلعيه.', '**Abarca** el arco entre sus lados.'),
      ],
      example: ex(EX, t('AMB, avec M sur le cercle, intercepte l’arc AB (celui qui ne contient pas M).', 'AMB with M on the circle subtends arc AB (not containing M).', 'AMB يحصر القوس AB.', 'AMB abarca el arco AB.')),
    },
  },
  'inscribed-property': {
    lesson: {
      points: [
        t('Un angle inscrit mesure **la moitié** de l’angle au centre qui intercepte le même arc.', 'An inscribed angle is **half** the central angle subtending the same arc.', 'المحيطية **نصف** المركزية.', 'El inscrito es **la mitad** del central.'),
        t('Où que soit M sur le grand arc, l’angle AMB ne change pas.', 'Wherever M is on the major arc, angle AMB stays the same.', 'لا تتغير مهما كان M.', 'No cambia, esté donde esté M.'),
      ],
      example: ex(EX, t('AOB = 120° → AMB = 60°', 'AOB = 120° → AMB = 60°', '60°', '60°')),
    },
  },
  'inscribed-same-arc': {
    lesson: {
      points: [
        t('Deux angles inscrits qui interceptent **le même arc** sont **égaux**.', 'Two inscribed angles subtending **the same arc** are **equal**.', 'محيطيتان تحصران **نفس القوس** متساويتان.', 'Mismo arco → **iguales**.'),
        t('Si [AB] est un **diamètre**, tout angle inscrit AMB est **droit**.', 'If [AB] is a **diameter**, every inscribed angle AMB is a **right angle**.', 'إذا كان [AB] **قطرًا** فـ AMB **قائمة**.', 'Si [AB] es **diámetro**, AMB es **recto**.'),
      ],
      example: ex(EX, t('AMB = 55° → ANB = 55° ; diamètre → 90°.', 'AMB = 55° → ANB = 55°; diameter → 90°.', '55° · 90°', '55° · 90°')),
    },
  },
  // ───────────── Vecteurs ─────────────
  'vec-characterise': {
    lesson: {
      points: [
        t('Un vecteur a une **direction** (la droite), un **sens** (la flèche) et une **longueur**.', 'A vector has a **direction** (the line), a **sense** (the arrow) and a **length**.', 'للمتجهة **اتجاه** و**منحى** و**طول**.', 'Un vector tiene **dirección**, **sentido** y **longitud**.'),
        t('Deux vecteurs sont **égaux** si les trois sont identiques : ABDC est alors un parallélogramme.', 'Two vectors are **equal** if all three match: then ABDC is a parallelogram.', 'متساويتان إذا تطابقت الثلاثة.', 'Iguales si coinciden los tres.'),
      ],
      example: ex(EX, t('⟦AB⟧ = ⟦CD⟧ : même direction, même sens, même longueur.', '⟦AB⟧ = ⟦CD⟧: same direction, sense and length.', '⟦AB⟧ = ⟦CD⟧', '⟦AB⟧ = ⟦CD⟧')),
    },
  },
  'vec-translation': {
    lesson: {
      points: [
        t('La **translation de vecteur ⟦AB⟧** fait glisser chaque point du même trajet que de A à B.', 'The **translation by vector ⟦AB⟧** slides every point by the same move as from A to B.', '**الإزاحة** تنقل كل نقطة بنفس مسار A إلى B.', 'La **traslación** desliza cada punto como de A a B.'),
        t('M′ image de M ⇔ ⟦MM′⟧ = ⟦AB⟧.', 'M′ is the image of M ⇔ ⟦MM′⟧ = ⟦AB⟧.', '⟦MM′⟧ = ⟦AB⟧.', '⟦MM′⟧ = ⟦AB⟧.'),
      ],
      example: ex(EX, t('⟦AB⟧ : 3 à droite, 1 en haut → M(1 ; 2) donne M′(4 ; 3).', '⟦AB⟧: 3 right, 1 up → M(1, 2) gives M′(4, 3).', 'M′(4 ; 3).', 'M′(4 ; 3).')),
    },
  },
  'vec-coordinates': {
    lesson: {
      points: [
        t('⟦AB⟧ a pour coordonnées **(x_B − x_A ; y_B − y_A)** : « arrivée moins départ ».', '⟦AB⟧ has coordinates **(x_B − x_A, y_B − y_A)**: “end minus start”.', '**(x_B − x_A ; y_B − y_A)**: الوصول ناقص الانطلاق.', '**(x_B − x_A ; y_B − y_A)**: «final menos inicio».'),
        t('Sur quadrillage : on compte les carreaux horizontalement, puis verticalement.', 'On a grid: count squares across, then up/down.', 'نعد المربعات أفقيًا ثم عموديًا.', 'Cuenta en horizontal y luego en vertical.'),
      ],
      example: ex(EX, t('A(1 ; 3), B(4 ; 1) : ⟦AB⟧(3 ; −2)', 'A(1, 3), B(4, 1): ⟦AB⟧(3, −2)', '⟦AB⟧(3 ; −2)', '⟦AB⟧(3 ; −2)')),
    },
  },
  'vec-sum': {
    lesson: {
      points: [
        t('**Chasles** : ⟦AB⟧ + ⟦BC⟧ = ⟦AC⟧ (on enchaîne les trajets).', '**Chasles**: ⟦AB⟧ + ⟦BC⟧ = ⟦AC⟧ (chain the moves).', '**شال**: ⟦AB⟧ + ⟦BC⟧ = ⟦AC⟧.', '**Chasles**: ⟦AB⟧ + ⟦BC⟧ = ⟦AC⟧.'),
        t('**Parallélogramme** : ⟦AB⟧ + ⟦AC⟧ = ⟦AD⟧ où ABDC est un parallélogramme.', '**Parallelogram rule**: ⟦AB⟧ + ⟦AC⟧ = ⟦AD⟧ where ABDC is a parallelogram.', '**قاعدة متوازي الأضلاع**.', '**Regla del paralelogramo**.'),
      ],
      example: ex(EX, t('⟦RS⟧ + ⟦ST⟧ = ⟦RT⟧', '⟦RS⟧ + ⟦ST⟧ = ⟦RT⟧', '⟦RT⟧', '⟦RT⟧')),
    },
  },
  'vec-midpoint': {
    lesson: {
      points: [
        t('Milieu I de [AB] : **((x_A + x_B)/2 ; (y_A + y_B)/2)**, la moyenne des coordonnées.', 'Midpoint I of [AB]: **((x_A + x_B)/2, (y_A + y_B)/2)**.', 'المنتصف: **متوسط الإحداثيات**.', 'Punto medio: **media de coordenadas**.'),
        t('Distance : **AB = √((x_B − x_A)² + (y_B − y_A)²)** — c’est Pythagore.', 'Distance: **AB = √((x_B − x_A)² + (y_B − y_A)²)** — it is Pythagoras.', 'المسافة: **فيثاغورس**.', 'Distancia: **Pitágoras**.'),
      ],
      example: ex(EX, t('A(1 ; 0), B(5 ; 4) : I(3 ; 2), AB = √32 ≈ 5,7', 'A(1, 0), B(5, 4): I(3, 2), AB = √32 ≈ 5.7', 'I(3 ; 2) · AB ≈ 5,7', 'I(3 ; 2) · AB ≈ 5,7')),
    },
  },
};
