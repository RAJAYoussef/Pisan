// Programmes officiels par pays, niveau et filière : la liste des chapitres, dans l'ordre du programme,
// chacun relié aux notions de PiSan (le contenu est écrit une seule fois par notion).
// Couvert par src/test/programmes.test.ts.
//
// `status` dit d'où vient la liste des chapitres :
//  - "official" : lue dans le texte officiel publié par le ministère ;
//  - "reference" : programme officiel connu (BO, Common Core, College Board), titres reformulés ;
//  - "to-review" : établie d'après les progressions en usage ; à faire relire par un enseignant du pays.
import type { Lang } from './i18n';
import { getCountry, getNotion, NOTIONS, type L, type Notion, type NotionId } from './curriculum';

export type Chapter = { title: L; notions: NotionId[] };
export type Track = { id: string; label: L };
export type ProgrammeSource = { label: string; url?: string; status: 'official' | 'reference' | 'to-review' };
export type Programme = { country: string; grade: number; track?: Track; source: ProgrammeSource; chapters: Chapter[] };

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const c = (fr: string, en: string, ar: string, es: string, notions: NotionId[]): Chapter => ({ title: t(fr, en, ar, es), notions });

// Chapitres partagés (mêmes intitulés dans plusieurs pays)
const ch = {
  decimals: c('Nombres entiers et décimaux', 'Whole numbers and decimals', 'الأعداد الصحيحة الطبيعية والعشرية', 'Números enteros y decimales', ['decimals']),
  relative: c('Nombres relatifs', 'Positive and negative numbers', 'الأعداد النسبية', 'Números relativos', ['integers']),
  fractions: c('Fractions', 'Fractions', 'الكسور', 'Fracciones', ['fractions']),
  proportion: c('Proportionnalité et pourcentages', 'Proportionality and percentages', 'التناسبية والنسب المئوية', 'Proporcionalidad y porcentajes', ['proportion']),
  stats: c('Statistiques', 'Statistics', 'الإحصاء', 'Estadística', ['statistics']),
  squareRoots: c('Racines carrées', 'Square roots', 'الجذور المربعة', 'Raíces cuadradas', ['square-roots']),
  powers: c('Puissances', 'Powers', 'القوى', 'Potencias', ['powers']),
  literal: c('Calcul littéral et identités remarquables', 'Algebra and special products', 'الحساب الحرفي والمتطابقات الهامة', 'Cálculo literal e identidades notables', ['algebra']),
  equationsIneq: c('Équations et inéquations du premier degré', 'Linear equations and inequalities', 'المعادلات والمتراجحات من الدرجة الأولى', 'Ecuaciones e inecuaciones de primer grado', ['equations', 'inequalities']),
  systems: c('Systèmes de deux équations à deux inconnues', 'Systems of two equations', 'نظمة معادلتين من الدرجة الأولى بمجهولين', 'Sistemas de dos ecuaciones con dos incógnitas', ['systems']),
  affine: c('Fonctions linéaires et affines', 'Linear functions', 'الدالة الخطية والدالة التآلفية', 'Funciones lineales y afines', ['functions']),
  thales: c('Théorème de Thalès', 'Intercept theorem', 'مبرهنة طاليس', 'Teorema de Tales', ['pythagoras-thales']),
  trigo: c('Trigonométrie dans le triangle rectangle', 'Right-triangle trigonometry', 'حساب المثلثات', 'Trigonometría en el triángulo rectángulo', ['trigonometry']),
  inscribed: c('Angles inscrits et angles au centre', 'Inscribed and central angles', 'الزوايا المحيطية والزوايا المركزية', 'Ángulos inscritos y centrales', ['geometry']),
  vectors: c('Vecteurs et translation', 'Vectors and translations', 'المتجهات والإزاحة', 'Vectores y traslaciones', ['vectors']),
  coords: c('Repère : coordonnées et équations de droites', 'Coordinates and equations of lines', 'المعلم في المستوى ومعادلة مستقيم', 'Coordenadas y ecuaciones de rectas', ['vectors', 'functions']),
  pyramids: c('Pyramides et cônes', 'Pyramids and cones', 'الهرم والمخروط', 'Pirámides y conos', ['solids']),
  limits: c('Limites et continuité', 'Limits and continuity', 'النهايات والاتصال', 'Límites y continuidad', ['limits']),
  derivation: c('Dérivation et étude des fonctions', 'Derivatives and curve sketching', 'الاشتقاق ودراسة الدوال', 'Derivación y estudio de funciones', ['derivatives']),
  sequences: c('Suites numériques', 'Sequences', 'المتتاليات العددية', 'Sucesiones numéricas', ['sequences']),
  primitives: c('Fonctions primitives', 'Antiderivatives', 'الدوال الأصلية', 'Primitivas', ['integrals']),
  log: c('Fonctions logarithmes', 'Logarithmic functions', 'الدوال اللوغاريتمية', 'Funciones logarítmicas', ['logarithm']),
  exp: c('Fonctions exponentielles', 'Exponential functions', 'الدوال الأسية', 'Funciones exponenciales', ['exponential']),
  complex: c('Nombres complexes', 'Complex numbers', 'الأعداد العقدية', 'Números complejos', ['complex-numbers']),
  integral: c('Calcul intégral', 'Integration', 'الحساب التكاملي', 'Cálculo integral', ['integrals']),
  diffEq: c('Équations différentielles', 'Differential equations', 'المعادلات التفاضلية', 'Ecuaciones diferenciales', ['differential-equations']),
  space: c('Géométrie dans l’espace', 'Geometry in space', 'الهندسة الفضائية', 'Geometría del espacio', ['space-geometry']),
  countingProba: c('Dénombrement et probabilités', 'Counting and probability', 'التعداد والاحتمالات', 'Combinatoria y probabilidad', ['counting', 'probability-laws']),
  twoVar: c('Statistique à deux variables', 'Two-variable statistics', 'الإحصاء بمتغيرين', 'Estadística bidimensional', ['regression']),
};

const sciencesBac = [ch.limits, ch.derivation, ch.sequences, ch.primitives, ch.log, ch.exp, ch.complex, ch.integral, ch.diffEq];

export const PROGRAMMES: Programme[] = [
  // ───────────── France ─────────────
  {
    country: 'fr', grade: 0,
    source: { label: 'Programme de mathématiques du cycle 3 (classe de 6e), Bulletin officiel', url: 'https://eduscol.education.fr/', status: 'reference' },
    chapters: [
      ch.decimals,
      c('Calcul : les quatre opérations et la division euclidienne', 'Arithmetic: the four operations and division with remainder', 'الحساب: العمليات الأربع والقسمة الإقليدية', 'Cálculo: las cuatro operaciones y la división entera', ['decimals']),
      ch.fractions,
      ch.proportion,
      c('Droites, angles et triangles', 'Lines, angles and triangles', 'المستقيمات والزوايا والمثلثات', 'Rectas, ángulos y triángulos', ['geometry']),
      c('Symétrie axiale', 'Line symmetry', 'التماثل المحوري', 'Simetría axial', ['symmetry']),
      c('Périmètres, aires et volumes', 'Perimeter, area and volume', 'المحيطات والمساحات والحجوم', 'Perímetros, áreas y volúmenes', ['areas']),
      c('Organisation et gestion de données', 'Handling data', 'تنظيم المعطيات ومعالجتها', 'Organización y gestión de datos', ['statistics']),
    ],
  },
  {
    country: 'fr', grade: 3,
    source: { label: 'Programme de mathématiques du cycle 4 (classe de 3e), Bulletin officiel', url: 'https://eduscol.education.fr/', status: 'reference' },
    chapters: [
      c('Arithmétique : nombres premiers', 'Prime numbers', 'الحسابيات: الأعداد الأولية', 'Aritmética: números primos', ['arithmetic']),
      c('Puissances et notation scientifique', 'Powers and scientific notation', 'القوى والكتابة العلمية', 'Potencias y notación científica', ['powers']),
      ch.squareRoots,
      ch.literal,
      c('Équations, équations produit et inéquations', 'Equations and inequalities', 'المعادلات ومعادلات الجداء والمتراجحات', 'Ecuaciones e inecuaciones', ['equations', 'inequalities']),
      c('Notion de fonction, fonctions linéaires et affines', 'Functions, linear functions', 'مفهوم الدالة، الدوال الخطية والتآلفية', 'Funciones lineales y afines', ['functions']),
      ch.proportion,
      c('Théorème de Pythagore', 'Pythagoras’ theorem', 'مبرهنة فيثاغورس', 'Teorema de Pitágoras', ['pythagoras-thales']),
      c('Théorème de Thalès et homothéties', 'Intercept theorem and enlargements', 'مبرهنة طاليس والتحاكي', 'Teorema de Tales y homotecias', ['pythagoras-thales']),
      ch.trigo,
      c('Probabilités', 'Probability', 'الاحتمالات', 'Probabilidad', ['probability']),
      ch.stats,
      c('Géométrie dans l’espace : sphère, agrandissement-réduction', 'Solids, spheres and scale', 'الهندسة الفضائية: الفلكة والتكبير والتصغير', 'Geometría del espacio: esfera, ampliación y reducción', ['solids']),
    ],
  },
  {
    country: 'fr', grade: 6,
    track: { id: 'spe', label: t('Spécialité mathématiques', 'Mathematics specialty', 'تخصص الرياضيات', 'Especialidad de matemáticas') },
    source: { label: 'Programme de spécialité mathématiques de Terminale générale, Bulletin officiel spécial n° 8 du 25 juillet 2019', url: 'https://eduscol.education.fr/', status: 'reference' },
    chapters: [
      c('Combinatoire et dénombrement', 'Combinatorics and counting', 'التوفيقات والتعداد', 'Combinatoria', ['counting']),
      c('Suites : récurrence et limites', 'Sequences: induction and limits', 'المتتاليات: الاستدلال بالترجع والنهايات', 'Sucesiones: inducción y límites', ['sequences']),
      c('Limites de fonctions', 'Limits of functions', 'نهايات الدوال', 'Límites de funciones', ['limits']),
      c('Continuité et théorème des valeurs intermédiaires', 'Continuity and the intermediate value theorem', 'الاتصال ومبرهنة القيم الوسيطية', 'Continuidad y teorema de los valores intermedios', ['limits']),
      c('Compléments sur la dérivation, convexité', 'More on derivatives, convexity', 'تتمات في الاشتقاق، التحدب', 'Complementos de derivación, convexidad', ['derivatives']),
      c('Fonction logarithme', 'Logarithm function', 'الدالة اللوغاريتمية', 'Función logaritmo', ['logarithm']),
      c('Fonctions sinus et cosinus', 'Sine and cosine functions', 'الدالتان جيب وجيب التمام', 'Funciones seno y coseno', ['trig-functions']),
      c('Primitives et équations différentielles', 'Antiderivatives and differential equations', 'الدوال الأصلية والمعادلات التفاضلية', 'Primitivas y ecuaciones diferenciales', ['integrals', 'differential-equations']),
      ch.integral,
      c('Vecteurs, droites et plans de l’espace', 'Vectors, lines and planes in space', 'المتجهات والمستقيمات والمستويات في الفضاء', 'Vectores, rectas y planos del espacio', ['space-geometry']),
      c('Orthogonalité et distances dans l’espace', 'Orthogonality and distances in space', 'التعامد والمسافات في الفضاء', 'Ortogonalidad y distancias en el espacio', ['space-geometry']),
      c('Loi binomiale, sommes de variables aléatoires, loi des grands nombres', 'Binomial distribution, sums of random variables, law of large numbers', 'القانون الحداني، مجموع متغيرات عشوائية، قانون الأعداد الكبيرة', 'Ley binomial, sumas de variables aleatorias, ley de los grandes números', ['probability-laws']),
    ],
  },
  {
    country: 'fr', grade: 6,
    track: { id: 'comp', label: t('Mathématiques complémentaires', 'Complementary mathematics', 'الرياضيات التكميلية', 'Matemáticas complementarias') },
    source: { label: 'Programme de mathématiques complémentaires de Terminale, Bulletin officiel spécial n° 8 du 25 juillet 2019', url: 'https://eduscol.education.fr/', status: 'reference' },
    chapters: [
      c('Modèles définis par une fonction : dérivation, convexité', 'Function models: derivatives and convexity', 'نماذج معرفة بدالة: الاشتقاق والتحدب', 'Modelos definidos por una función: derivación y convexidad', ['derivatives']),
      c('Suites et modèles discrets', 'Sequences and discrete models', 'المتتاليات والنماذج المتقطعة', 'Sucesiones y modelos discretos', ['sequences']),
      c('Fonctions exponentielle et logarithme', 'Exponential and logarithm functions', 'الدالتان الأسية واللوغاريتمية', 'Funciones exponencial y logaritmo', ['exponential', 'logarithm']),
      ch.integral,
      c('Équations différentielles y′ = ay + b', 'Differential equations y′ = ay + b', 'المعادلات التفاضلية y′ = ay + b', 'Ecuaciones diferenciales y′ = ay + b', ['differential-equations']),
      c('Lois discrètes : binomiale et géométrique', 'Discrete distributions: binomial and geometric', 'القوانين المتقطعة: الحداني والهندسي', 'Leyes discretas: binomial y geométrica', ['probability-laws']),
      c('Lois à densité : uniforme et exponentielle', 'Continuous distributions: uniform and exponential', 'القوانين ذات الكثافة: المنتظم والأسي', 'Leyes de densidad: uniforme y exponencial', ['probability-laws']),
      ch.twoVar,
    ],
  },
  // ───────────── Maroc (index 0 = 1re année collège, 2 = 3e année collège, 5 = 2e année Bac) ─────────────
  {
    country: 'ma', grade: 0,
    source: { label: 'Programme du Ministère de l’Éducation nationale, 1re année du cycle secondaire collégial', status: 'to-review' },
    chapters: [
      c('Nombres entiers et décimaux : opérations et priorités', 'Whole numbers and decimals: operations and order', 'الأعداد الصحيحة الطبيعية والعشرية: العمليات والأولويات', 'Enteros y decimales: operaciones y prioridades', ['decimals']),
      ch.fractions,
      c('Nombres décimaux relatifs', 'Positive and negative decimals', 'الأعداد العشرية النسبية', 'Decimales relativos', ['integers']),
      c('Puissances', 'Powers', 'القوى', 'Potencias', ['powers']),
      c('Développement et factorisation', 'Expanding and factorising', 'النشر والتعميل', 'Desarrollo y factorización', ['algebra']),
      c('Équations', 'Equations', 'المعادلات', 'Ecuaciones', ['equations']),
      c('Proportionnalité', 'Proportionality', 'التناسبية', 'Proporcionalidad', ['proportion']),
      c('Droites, angles et triangles', 'Lines, angles and triangles', 'المستقيمات والزوايا والمثلث', 'Rectas, ángulos y triángulos', ['geometry']),
      c('Symétrie axiale et symétrie centrale', 'Line and point symmetry', 'التماثل المحوري والتماثل المركزي', 'Simetría axial y central', ['symmetry']),
      c('Périmètres, aires, prisme droit et cylindre', 'Perimeter, area, prisms and cylinders', 'المحيطات والمساحات، الموشور القائم والأسطوانة', 'Perímetros, áreas, prisma y cilindro', ['areas']),
    ],
  },
  {
    country: 'ma', grade: 2,
    source: { label: 'Programme du Ministère de l’Éducation nationale, 3e année du cycle secondaire collégial', status: 'to-review' },
    chapters: [
      c('Développement, factorisation et identités remarquables', 'Expanding, factorising and special products', 'النشر والتعميل والمتطابقات الهامة', 'Desarrollo, factorización e identidades notables', ['algebra']),
      ch.squareRoots,
      ch.powers,
      c('Ordre et opérations', 'Order and operations', 'الترتيب والعمليات', 'Orden y operaciones', ['inequalities']),
      ch.equationsIneq,
      ch.systems,
      ch.affine,
      ch.stats,
      ch.thales,
      ch.trigo,
      ch.inscribed,
      c('Triangles isométriques et triangles semblables', 'Congruent and similar triangles', 'المثلثات المتقايسة والمثلثات المتشابهة', 'Triángulos congruentes y semejantes', ['geometry', 'pythagoras-thales']),
      ch.vectors,
      ch.coords,
      c('Géométrie dans l’espace', 'Solids', 'الهندسة الفضائية', 'Geometría del espacio', ['solids']),
    ],
  },
  {
    country: 'ma', grade: 5,
    track: { id: 'pc-svt', label: t('Sciences expérimentales (PC, SVT)', 'Experimental sciences (Physics, Life sciences)', 'العلوم التجريبية (الفيزياء، علوم الحياة والأرض)', 'Ciencias experimentales (Física, Ciencias de la vida)') },
    source: { label: 'Programme du Ministère de l’Éducation nationale, 2e année du baccalauréat, sciences expérimentales', status: 'to-review' },
    chapters: [...sciencesBac, ch.space, ch.countingProba],
  },
  {
    country: 'ma', grade: 5,
    track: { id: 'sm', label: t('Sciences mathématiques (A, B)', 'Mathematical sciences (A, B)', 'العلوم الرياضية (أ، ب)', 'Ciencias matemáticas (A, B)') },
    source: { label: 'Programme du Ministère de l’Éducation nationale, 2e année du baccalauréat, sciences mathématiques', status: 'to-review' },
    chapters: [
      ...sciencesBac,
      ch.space,
      ch.countingProba,
      c('Arithmétique dans ℤ', 'Number theory in ℤ', 'الحسابيات في ℤ', 'Aritmética en ℤ', ['congruences']),
      c('Structures algébriques', 'Algebraic structures', 'البنيات الجبرية', 'Estructuras algebraicas', ['algebraic-structures']),
    ],
  },
  // ───────────── Côte d'Ivoire (textes officiels 2023 pour la 6e et la 3e) ─────────────
  {
    country: 'ci', grade: 0,
    source: { label: 'Programme éducatif et guide d’exécution, Mathématiques 6e, MENA, DPFC (2023)', url: 'https://dpfc-ci.net/', status: 'official' },
    chapters: [
      c('Nombres entiers naturels', 'Whole numbers', 'الأعداد الصحيحة الطبيعية', 'Números naturales', ['decimals']),
      c('Nombres décimaux relatifs', 'Positive and negative decimals', 'الأعداد العشرية النسبية', 'Decimales relativos', ['integers', 'decimals']),
      ch.fractions,
      c('Proportionnalité', 'Proportionality', 'التناسبية', 'Proporcionalidad', ['proportion']),
      ch.stats,
      c('Droites, points, segments et angles', 'Lines, points, segments and angles', 'المستقيمات والنقط والقطع والزوايا', 'Rectas, puntos, segmentos y ángulos', ['geometry']),
      c('Cercles et disques', 'Circles and discs', 'الدوائر والأقراص', 'Circunferencias y círculos', ['areas']),
      c('Triangles et parallélogramme', 'Triangles and parallelograms', 'المثلثات ومتوازي الأضلاع', 'Triángulos y paralelogramos', ['geometry']),
      c('Pavés droits et cylindres droits', 'Cuboids and cylinders', 'متوازي المستطيلات والأسطوانة القائمة', 'Ortoedros y cilindros', ['areas']),
      c('Figures symétriques par rapport à un point', 'Point symmetry', 'الأشكال المتماثلة بالنسبة لنقطة', 'Figuras simétricas respecto a un punto', ['symmetry']),
    ],
  },
  {
    country: 'ci', grade: 3,
    source: { label: 'Programme éducatif et guide d’exécution, Mathématiques 3e, MENA, DPFC (2023)', url: 'https://dpfc-ci.net/', status: 'official' },
    chapters: [
      c('Calcul littéral', 'Algebra', 'الحساب الحرفي', 'Cálculo literal', ['algebra']),
      ch.squareRoots,
      c('Calcul numérique', 'Numerical calculation', 'الحساب العددي', 'Cálculo numérico', ['powers', 'fractions']),
      c('Équations et inéquations du premier degré dans ℝ', 'Linear equations and inequalities', 'المعادلات والمتراجحات من الدرجة الأولى في ℝ', 'Ecuaciones e inecuaciones de primer grado en ℝ', ['equations', 'inequalities']),
      c('Équations et inéquations du premier degré dans ℝ × ℝ', 'Systems of linear equations', 'المعادلات والمتراجحات من الدرجة الأولى في ℝ × ℝ', 'Ecuaciones e inecuaciones de primer grado en ℝ × ℝ', ['systems']),
      c('Applications affines', 'Affine functions', 'التطبيقات التآلفية', 'Aplicaciones afines', ['functions']),
      ch.stats,
      c('Triangle rectangle', 'Right triangles', 'المثلث القائم', 'Triángulo rectángulo', ['pythagoras-thales', 'trigonometry']),
      c('Propriétés de Thalès dans un triangle', 'Intercept theorem', 'خاصيات طاليس في مثلث', 'Propiedades de Tales en un triángulo', ['pythagoras-thales']),
      c('Angles inscrits', 'Inscribed angles', 'الزوايا المحيطية', 'Ángulos inscritos', ['geometry']),
      c('Vecteurs', 'Vectors', 'المتجهات', 'Vectores', ['vectors']),
      c('Coordonnées d’un vecteur', 'Coordinates of a vector', 'إحداثيتا متجهة', 'Coordenadas de un vector', ['vectors']),
      c('Équations de droites', 'Equations of lines', 'معادلات المستقيمات', 'Ecuaciones de rectas', ['functions', 'vectors']),
      ch.pyramids,
    ],
  },
  {
    country: 'ci', grade: 6,
    track: { id: 'd', label: t('Terminale D', 'Final year, series D', 'السنة النهائية، الشعبة D', 'Último curso, serie D') },
    source: { label: 'Programme de mathématiques de Terminale D, MENA', url: 'https://dpfc-ci.net/', status: 'to-review' },
    chapters: [...sciencesBac, c('Probabilités', 'Probability', 'الاحتمالات', 'Probabilidad', ['counting', 'probability-laws']), ch.twoVar],
  },
  // ───────────── Sénégal ─────────────
  {
    country: 'sn', grade: 0,
    source: { label: 'Programme de mathématiques de la classe de 6e, Ministère de l’Éducation nationale', status: 'to-review' },
    chapters: [
      ch.decimals,
      ch.fractions,
      c('Proportionnalité', 'Proportionality', 'التناسبية', 'Proporcionalidad', ['proportion']),
      c('Droites, segments et angles', 'Lines, segments and angles', 'المستقيمات والقطع والزوايا', 'Rectas, segmentos y ángulos', ['geometry']),
      c('Cercle', 'Circles', 'الدائرة', 'Circunferencia', ['areas']),
      c('Triangles et quadrilatères', 'Triangles and quadrilaterals', 'المثلثات والرباعيات', 'Triángulos y cuadriláteros', ['geometry']),
      c('Symétrie orthogonale', 'Line symmetry', 'التماثل المحوري', 'Simetría axial', ['symmetry']),
      c('Aires, périmètres et pavé droit', 'Area, perimeter and cuboids', 'المساحات والمحيطات ومتوازي المستطيلات', 'Áreas, perímetros y ortoedro', ['areas']),
    ],
  },
  {
    country: 'sn', grade: 3,
    source: { label: 'Programme de mathématiques de la classe de 3e (BFEM), Ministère de l’Éducation nationale', status: 'to-review' },
    chapters: [
      ch.squareRoots,
      c('Applications affines', 'Affine functions', 'التطبيقات التآلفية', 'Aplicaciones afines', ['functions']),
      ch.equationsIneq,
      ch.systems,
      ch.stats,
      ch.thales,
      c('Relations trigonométriques dans le triangle rectangle', 'Trigonometric ratios', 'العلاقات المثلثية في المثلث القائم', 'Razones trigonométricas', ['trigonometry']),
      c('Angles inscrits', 'Inscribed angles', 'الزوايا المحيطية', 'Ángulos inscritos', ['geometry']),
      c('Vecteurs et repérage', 'Vectors and coordinates', 'المتجهات والمعلم', 'Vectores y coordenadas', ['vectors']),
      ch.pyramids,
    ],
  },
  {
    country: 'sn', grade: 6,
    track: { id: 's2', label: t('Terminale S2', 'Final year, series S2', 'السنة النهائية، الشعبة S2', 'Último curso, serie S2') },
    source: { label: 'Programmes de mathématiques du second cycle, Terminales S2 et S4, Inspection générale de l’éducation nationale', status: 'to-review' },
    chapters: [...sciencesBac, c('Dénombrement', 'Counting', 'التعداد', 'Combinatoria', ['counting']), c('Probabilités', 'Probability', 'الاحتمالات', 'Probabilidad', ['probability-laws']), ch.twoVar],
  },
  // ───────────── États-Unis (index 0 = Grade 6, 3 = Grade 9, 6 = Grade 12) ─────────────
  {
    country: 'us', grade: 0,
    source: { label: 'Common Core State Standards for Mathematics, Grade 6', url: 'https://www.thecorestandards.org/Math/Content/6/', status: 'reference' },
    chapters: [
      c('Ratios et taux (6.RP)', 'Ratios and rates (6.RP)', 'النسب والمعدلات (6.RP)', 'Razones y tasas (6.RP)', ['proportion']),
      c('Division de fractions (6.NS.A)', 'Dividing fractions (6.NS.A)', 'قسمة الكسور (6.NS.A)', 'División de fracciones (6.NS.A)', ['fractions']),
      c('Calcul avec les décimaux (6.NS.B)', 'Multi-digit and decimal operations (6.NS.B)', 'العمليات على الأعداد العشرية (6.NS.B)', 'Operaciones con decimales (6.NS.B)', ['decimals']),
      c('Nombres négatifs et plan de coordonnées (6.NS.C)', 'Negative numbers and the coordinate plane (6.NS.C)', 'الأعداد السالبة والمستوى الإحداثي (6.NS.C)', 'Números negativos y plano cartesiano (6.NS.C)', ['integers']),
      c('Expressions et équations (6.EE)', 'Expressions and equations (6.EE)', 'التعابير والمعادلات (6.EE)', 'Expresiones y ecuaciones (6.EE)', ['algebra', 'equations']),
      c('Aires, aires latérales et volumes (6.G)', 'Area, surface area and volume (6.G)', 'المساحات والحجوم (6.G)', 'Áreas y volúmenes (6.G)', ['areas']),
      c('Statistiques (6.SP)', 'Statistics (6.SP)', 'الإحصاء (6.SP)', 'Estadística (6.SP)', ['statistics']),
    ],
  },
  {
    country: 'us', grade: 3,
    source: { label: 'Common Core State Standards for Mathematics, High School (Algebra, Functions), Algebra I course', url: 'https://www.thecorestandards.org/Math/Content/HSA/', status: 'reference' },
    chapters: [
      c('Équations et inéquations linéaires', 'Linear equations and inequalities', 'المعادلات والمتراجحات الخطية', 'Ecuaciones e inecuaciones lineales', ['equations', 'inequalities']),
      c('Fonctions linéaires', 'Linear functions', 'الدوال الخطية', 'Funciones lineales', ['functions']),
      c('Systèmes d’équations', 'Systems of equations', 'نظمات المعادلات', 'Sistemas de ecuaciones', ['systems']),
      c('Exposants et radicaux', 'Exponents and radicals', 'الأسس والجذور', 'Exponentes y radicales', ['powers', 'square-roots']),
      c('Polynômes et factorisation', 'Polynomials and factoring', 'الحدوديات والتعميل', 'Polinomios y factorización', ['algebra']),
      c('Fonctions et équations du second degré', 'Quadratic functions and equations', 'الدوال والمعادلات من الدرجة الثانية', 'Funciones y ecuaciones cuadráticas', ['quadratics']),
      c('Statistiques et données', 'Data and statistics', 'الإحصاء والمعطيات', 'Datos y estadística', ['statistics']),
    ],
  },
  {
    country: 'us', grade: 6,
    track: { id: 'calculus', label: t('Précalcul et AP Calculus AB', 'Precalculus and AP Calculus AB', 'ما قبل التفاضل وAP Calculus AB', 'Precálculo y AP Calculus AB') },
    source: { label: 'Common Core High School (Functions) and AP Calculus AB Course and Exam Description (College Board)', url: 'https://www.thecorestandards.org/Math/Content/HSF/', status: 'reference' },
    chapters: [
      c('Fonctions exponentielles et logarithmes', 'Exponential and logarithmic functions', 'الدوال الأسية واللوغاريتمية', 'Funciones exponenciales y logarítmicas', ['exponential', 'logarithm']),
      c('Fonctions trigonométriques', 'Trigonometric functions', 'الدوال المثلثية', 'Funciones trigonométricas', ['trig-functions']),
      c('Suites et séries', 'Sequences and series', 'المتتاليات والمتسلسلات', 'Sucesiones y series', ['sequences']),
      c('Limites et continuité', 'Limits and continuity', 'النهايات والاتصال', 'Límites y continuidad', ['limits']),
      c('Dérivation et applications', 'Differentiation and its applications', 'الاشتقاق وتطبيقاته', 'Derivación y aplicaciones', ['derivatives']),
      c('Intégration et accumulation', 'Integration and accumulation of change', 'التكامل والتراكم', 'Integración y acumulación', ['integrals']),
      c('Équations différentielles', 'Differential equations', 'المعادلات التفاضلية', 'Ecuaciones diferenciales', ['differential-equations']),
      c('Probabilités et statistiques', 'Probability and statistics', 'الاحتمالات والإحصاء', 'Probabilidad y estadística', ['probability-laws', 'regression']),
    ],
  },
];

export function programmesFor(country: string, grade: number): Programme[] {
  return PROGRAMMES.filter((p) => p.country === country && p.grade === grade);
}

export function tracksFor(country: string, grade: number): Track[] {
  return programmesFor(country, grade).flatMap((p) => (p.track ? [p.track] : []));
}

/** Le programme de l'élève ; la première filière par défaut. */
export function programmeFor(country: string, grade: number, track?: string): Programme | null {
  const list = programmesFor(country, grade);
  return list.find((p) => p.track?.id === track) ?? list[0] ?? null;
}

/** Les notions du programme, dans l'ordre, sans doublon. */
export function programmeNotions(programme: Programme): Notion[] {
  const ids = Array.from(new Set(programme.chapters.flatMap((chapter) => chapter.notions)));
  return ids.map(getNotion);
}

/** Notions d'un niveau : toutes filières confondues (pour une classe), sinon le repli par niveau d'âge. */
export function notionsForGrade(country: string, grade: number, fallback: (level: number) => Notion[]): Notion[] {
  const list = programmesFor(country, grade);
  if (!list.length) return fallback(getCountry(country).grades[grade]?.level ?? 0);
  const ids = Array.from(new Set(list.flatMap((p) => p.chapters.flatMap((chapter) => chapter.notions))));
  return NOTIONS.filter((n) => ids.includes(n.id));
}

export const sourceStatusLabel = (status: ProgrammeSource['status'], lang: Lang): string =>
  ({
    official: t('Texte officiel', 'Official text', 'النص الرسمي', 'Texto oficial'),
    reference: t('Programme officiel', 'Official curriculum', 'المنهاج الرسمي', 'Programa oficial'),
    'to-review': t('À faire relire par un enseignant', 'To be reviewed by a teacher', 'يحتاج مراجعة من أستاذ', 'Pendiente de revisión docente'),
  })[status][lang];
