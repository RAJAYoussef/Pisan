// Banque du défi du jour : des questions DIFFÉRENTES de celles des contrôles notés, pour que le
// défi ne dévoile jamais une question de contrôle. Deux questions par notion, chacune avec sa
// correction pas à pas (étapes mathématiques, identiques dans les 4 langues).
// Couvert par src/test/challenge-bank.test.ts.
import type { Lang } from './i18n';
import type { NotionId, Question } from './curriculum';

type L = Record<Lang, string>;
export type ChallengeItem = { question: Question; steps: string[] };
const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const c = (prompt: Question['prompt'], expr: string, options: string[], answer: number, steps: string[], choiceOnly = false): ChallengeItem => ({
  question: { prompt, expr, options, answer, ...(choiceOnly ? { choiceOnly } : {}) },
  steps,
});

export const CHALLENGE_BANK: Record<NotionId, ChallengeItem[]> = {
  integers: [
    c('compute', '−9 + 13', ['−4', '4', '−22', '22'], 1, ['13 − 9', '= 4']),
    c('compute', '(−4) × 6', ['24', '−10', '−24', '2'], 2, ['(−) × (+) = (−)', '4 × 6 = 24', '−24']),
  ],
  fractions: [
    c('compute', '2/3 + 1/6', ['3/9', '5/6', '3/6', '1/2'], 1, ['2/3 = 4/6', '4/6 + 1/6 = 5/6']),
    c('compute', '3/4 × 8', ['6', '24/32', '11/4', '3/32'], 0, ['(3 × 8)/4 = 24/4', '= 6']),
  ],
  proportion: [
    c(t('Combien font 10 % de 350 ?', 'What is 10% of 350?', 'كم يساوي 10% من 350؟', '¿Cuánto es el 10 % de 350?'), '10 % × 350', ['3,5', '35', '350', '0,35'], 1, ['10 % = 1/10', '350 ÷ 10 = 35']),
    c(t('4 stylos coûtent 6 €. Combien coûtent 10 stylos ?', '4 pens cost €6. How much do 10 pens cost?', '4 أقلام ثمنها 6 €. كم ثمن 10 أقلام؟', '4 bolígrafos cuestan 6 €. ¿Cuánto cuestan 10?'), '4 → 6 €   ·   10 → ?', ['12 €', '15 €', '24 €', '16 €'], 1, ['6 € ÷ 4 = 1,50 €', '10 × 1,50 € = 15 €']),
  ],
  powers: [
    c('compute', '2⁴', ['8', '6', '16', '32'], 2, ['2 × 2 × 2 × 2', '= 16']),
    c('compute', '10³ × 10⁻¹', ['10²', '10⁻³', '10⁴', '1'], 0, ['10³⁺⁽⁻¹⁾', '= 10²']),
  ],
  algebra: [
    c(t('Valeur de 3x − 5 pour x = 4 :', 'Value of 3x − 5 when x = 4:', 'قيمة 3x − 5 عندما x = 4:', 'Valor de 3x − 5 para x = 4:'), '3x − 5', ['7', '17', '12', '−7'], 0, ['3 × 4 − 5', '= 12 − 5', '= 7']),
    c(t('Valeur de x² + 2x pour x = −3 :', 'Value of x² + 2x when x = −3:', 'قيمة x² + 2x عندما x = −3:', 'Valor de x² + 2x para x = −3:'), 'x² + 2x', ['15', '−15', '3', '−3'], 2, ['(−3)² + 2 × (−3)', '= 9 − 6', '= 3']),
  ],
  equations: [
    c('solve', '5x − 3 = 17', ['x = 3', 'x = 4', 'x = 14/5', 'x = 20'], 1, ['5x = 17 + 3 = 20', 'x = 20 ÷ 5', 'x = 4']),
    c('solve', '2(x + 1) = 10', ['x = 4', 'x = 5', 'x = 9/2', 'x = 6'], 0, ['x + 1 = 10 ÷ 2 = 5', 'x = 5 − 1', 'x = 4']),
  ],
  functions: [
    c('value', 'g(x) = −x + 7   →   g(2)', ['9', '−5', '5', '14'], 2, ['g(2) = −2 + 7', '= 5']),
    c(t('Antécédent de 9 par f(x) = 2x + 1 :', 'Pre-image of 9 under f(x) = 2x + 1:', 'سابقة 9 بالدالة f(x) = 2x + 1:', 'Preimagen de 9 por f(x) = 2x + 1:'), '2x + 1 = 9', ['x = 5', 'x = 19', 'x = 4', 'x = 8'], 2, ['2x = 9 − 1 = 8', 'x = 8 ÷ 2', 'x = 4']),
  ],
  quadratics: [
    c(t('Calcule le discriminant Δ', 'Work out the discriminant Δ', 'احسب المميز Δ', 'Calcula el discriminante Δ'), 'x² + 2x − 3', ['−8', '16', '4', '8'], 1, ['Δ = b² − 4ac', '= 2² − 4 × 1 × (−3)', '= 4 + 12 = 16']),
    c('solve', 'x² = 25', ['x = 5', 'x = ±5', 'x = 25', 'x = 12,5'], 1, ['x = √25 ; x = −√25', 'x = ±5']),
  ],
  derivatives: [
    c('derive', 'f(x) = 4x³', ['f′(x) = 12x²', 'f′(x) = 4x²', 'f′(x) = 12x³', 'f′(x) = x⁴'], 0, ['(x³)′ = 3x²', '4 × 3x² = 12x²', 'f′(x) = 12x²']),
    c('derive', 'f(x) = x² + 7x − 1', ['f′(x) = 2x + 6', 'f′(x) = x + 7', 'f′(x) = 2x + 7', 'f′(x) = 2x + 7x'], 2, ['(x²)′ = 2x', '(7x)′ = 7', '(−1)′ = 0', 'f′(x) = 2x + 7']),
  ],
  sequences: [
    c('value', 'u₀ = 10, r = −3   →   u₄', ['−2', '22', '−12', '2'], 0, ['u₄ = 10 + 4 × (−3)', '= 10 − 12', '= −2']),
    c('value', 'v₀ = 5, q = 2   →   v₃', ['30', '40', '11', '80'], 1, ['v₃ = 5 × 2³', '= 5 × 8', '= 40']),
  ],
  exponential: [
    c('value', 'e⁰', ['0', 'e', '1', '−1'], 2, ['e⁰ = 1']),
    c('solve', 'eˣ = e⁵', ['x = 1', 'x = 5', 'x = e', 'x = ln 5'], 1, ['eᵃ = eᵇ ⇔ a = b', 'x = 5']),
  ],
  decimals: [
    c('compute', '12,4 − 3,75', ['8,65', '9,35', '8,71', '9,65'], 0, ['12,40 − 3,75', '= 8,65']),
    c('compute', '56,3 ÷ 100', ['5630', '5,63', '0,563', '0,0563'], 2, ['56,3 ÷ 100', '= 0,563']),
  ],
  geometry: [
    c(t('Un triangle rectangle a un angle de 35°. Combien mesure l’autre angle aigu ?', 'A right triangle has a 35° angle. What is the other acute angle?', 'مثلث قائم له زاوية 35°. ما قياس الزاوية الحادة الأخرى؟', 'Un triángulo rectángulo tiene un ángulo de 35°. ¿Cuánto mide el otro ángulo agudo?'), '90° + 35° + ? = 180°', ['55°', '65°', '145°', '45°'], 0, ['180° − 90° − 35°', '= 55°']),
    c(t('Triangle équilatéral : combien mesure chaque angle ?', 'Equilateral triangle: how big is each angle?', 'مثلث متقايس الأضلاع: كم تقيس كل زاوية؟', 'Triángulo equilátero: ¿cuánto mide cada ángulo?'), '3 × ? = 180°', ['90°', '45°', '60°', '30°'], 2, ['180° ÷ 3', '= 60°']),
  ],
  symmetry: [
    c(t('Combien d’axes de symétrie a un cercle ?', 'How many lines of symmetry does a circle have?', 'كم عدد محاور تماثل الدائرة؟', '¿Cuántos ejes de simetría tiene una circunferencia?'), '○', ['1', '2', '4', '∞'], 3, ['○ : (d) ∋ O', '∞']),
    c(t('Symétrique de B(−1 ; 4) par rapport à l’origine :', 'Image of B(−1, 4) by symmetry about the origin:', 'مماثل B(−1 ; 4) بالنسبة لأصل المعلم:', 'Simétrico de B(−1 ; 4) respecto al origen:'), 'B(−1 ; 4)', ['(1 ; 4)', '(1 ; −4)', '(−1 ; −4)', '(4 ; −1)'], 1, ['(x ; y) → (−x ; −y)', '(1 ; −4)']),
  ],
  areas: [
    c(t('Aire d’un carré de côté 7 cm :', 'Area of a square with side 7 cm:', 'مساحة مربع طول ضلعه 7 cm:', 'Área de un cuadrado de lado 7 cm:'), 'A = c²', ['28 cm²', '49 cm²', '14 cm²', '49 cm'], 1, ['7 × 7', '= 49 cm²']),
    c(t('Périmètre d’un triangle de côtés 5 cm, 6 cm et 8 cm :', 'Perimeter of a triangle with sides 5 cm, 6 cm and 8 cm:', 'محيط مثلث أطوال أضلاعه 5 cm و 6 cm و 8 cm:', 'Perímetro de un triángulo de lados 5 cm, 6 cm y 8 cm:'), '5 + 6 + 8', ['19 cm', '240 cm', '19 cm²', '13 cm'], 0, ['5 + 6 + 8', '= 19 cm']),
  ],
  statistics: [
    c(t('Moyenne de 4, 7, 9 et 12 :', 'Mean of 4, 7, 9 and 12:', 'معدل 4 و 7 و 9 و 12:', 'Media de 4, 7, 9 y 12:'), '(4 + 7 + 9 + 12) ÷ 4', ['32', '7', '8', '9'], 2, ['4 + 7 + 9 + 12 = 32', '32 ÷ 4 = 8']),
    c(t('Médiane de la série :', 'Median of the data:', 'وسيط السلسلة:', 'Mediana de la serie:'), '2 · 6 · 8 · 10', ['7', '8', '6', '6,5'], 0, ['2 · [6 · 8] · 10', '(6 + 8) ÷ 2', '= 7']),
  ],
  'square-roots': [
    c('compute', '√81', ['9', '40,5', '−9', '18'], 0, ['9² = 81', '√81 = 9']),
    c('compute', '√2 × √8', ['√10', '16', '4', '2√2'], 2, ['√2 × √8 = √16', '= 4']),
  ],
  arithmetic: [
    c(t('Plus grand diviseur commun de 18 et 30 :', 'Greatest common divisor of 18 and 30:', 'القاسم المشترك الأكبر لـ 18 و 30:', 'Máximo común divisor de 18 y 30:'), '18 ; 30', ['3', '6', '9', '90'], 1, ['18 = 2 × 3² · 30 = 2 × 3 × 5', '2 × 3', '= 6']),
    c(t('Combien de diviseurs a 12 ?', 'How many divisors does 12 have?', 'كم عدد قواسم 12؟', '¿Cuántos divisores tiene 12?'), '12', ['4', '5', '6', '12'], 2, ['{1 ; 2 ; 3 ; 4 ; 6 ; 12}', '6']),
  ],
  inequalities: [
    c('solve', '4x + 1 < 9', ['x < 2', 'x > 2', 'x < 5/2', 'x < 8'], 0, ['4x < 8', 'x < 2']),
    c('solve', '−2x ≥ 6', ['x ≥ −3', 'x ≥ 3', 'x ≤ −3', 'x ≤ 3'], 2, ['÷ (−2) : ≥ → ≤', 'x ≤ −3']),
  ],
  systems: [
    c('solve', 'x + y = 7 ; x − y = 1', ['x = 3, y = 4', 'x = 4, y = 3', 'x = 5, y = 2', 'x = 6, y = 1'], 1, ['2x = 8 → x = 4', 'y = 7 − 4 = 3', 'x = 4, y = 3']),
    c('solve', 'y = 3x ; x + y = 12', ['x = 4, y = 8', 'x = 2, y = 10', 'x = 3, y = 9', 'x = 6, y = 6'], 2, ['x + 3x = 12', '4x = 12 → x = 3', 'y = 9', 'x = 3, y = 9']),
  ],
  'pythagoras-thales': [
    c(t('ABC rectangle en A, AB = 6 et AC = 8. BC = ?', 'ABC has a right angle at A, AB = 6, AC = 8. BC = ?', 'ABC قائم الزاوية في A، AB = 6 و AC = 8. BC = ؟', 'ABC rectángulo en A, AB = 6 y AC = 8. ¿BC?'), 'BC² = AB² + AC²', ['14', '10', '100', '48'], 1, ['36 + 64 = 100', 'BC = √100', '= 10']),
    c(t('(MN) ∥ (BC), AM = 3, AB = 9 et BC = 12. MN = ?', '(MN) ∥ (BC), AM = 3, AB = 9, BC = 12. MN = ?', '(MN) ∥ (BC)، AM = 3 و AB = 9 و BC = 12. MN = ؟', '(MN) ∥ (BC), AM = 3, AB = 9 y BC = 12. ¿MN?'), 'AM/AB = MN/BC', ['4', '36', '6', '3'], 0, ['3/9 = 1/3', '12 × 1/3', '= 4']),
  ],
  trigonometry: [
    c('value', 'sin 30°', ['√3/2', '1/2', '1', '√2/2'], 1, ['sin 30° = 1/2']),
    c(t('ABC rectangle en B, AC = 8 et Â = 60°. AB = ?', 'ABC has a right angle at B, AC = 8, Â = 60°. AB = ?', 'ABC قائم الزاوية في B، AC = 8 و Â = 60°. AB = ؟', 'ABC rectángulo en B, AC = 8 y Â = 60°. ¿AB?'), 'cos 60° = AB/AC', ['4', '6,93', '16', '8'], 0, ['AB = AC × cos 60°', '= 8 × 1/2', '= 4']),
  ],
  vectors: [
    c(t('A(2 ; 1) et B(5 ; 5). Longueur AB :', 'A(2, 1) and B(5, 5). Length AB:', 'A(2 ; 1) و B(5 ; 5). المسافة AB:', 'A(2 ; 1) y B(5 ; 5). Longitud AB:'), '√((xB − xA)² + (yB − yA)²)', ['7', '25', '5', '√7'], 2, ['√(3² + 4²)', '= √25', '= 5']),
    c(t('Coefficient directeur de (AB), A(1 ; 3) et B(3 ; −1) :', 'Slope of (AB), A(1, 3) and B(3, −1):', 'المعامل الموجه لـ (AB)، A(1 ; 3) و B(3 ; −1):', 'Pendiente de (AB), A(1 ; 3) y B(3 ; −1):'), '(yB − yA)/(xB − xA)', ['2', '−1/2', '−2', '1'], 2, ['(−1 − 3)/(3 − 1)', '= −4/2', '= −2']),
  ],
  probability: [
    c(t('Une urne contient 2 boules vertes et 6 jaunes. Probabilité de tirer une verte :', 'An urn holds 2 green and 6 yellow balls. Probability of green:', 'صندوق به كرتان خضراوان و 6 صفراء. احتمال سحب كرة خضراء:', 'Una urna tiene 2 bolas verdes y 6 amarillas. Probabilidad de verde:'), '2 + 6 = 8', ['1/3', '1/4', '2/6', '3/4'], 1, ['2/8', '= 1/4']),
    c(t('On lance un dé à 6 faces. Probabilité d’obtenir au moins 5 :', 'A 6-sided die is rolled. Probability of at least 5:', 'نرمي نردًا ذا 6 أوجه. احتمال الحصول على 5 على الأقل:', 'Se lanza un dado de 6 caras. Probabilidad de sacar al menos 5:'), '{5 ; 6}', ['1/6', '5/6', '1/3', '1/2'], 2, ['{5 ; 6} → 2/6', '= 1/3']),
  ],
  solids: [
    c(t('Volume d’un cube d’arête 3 cm :', 'Volume of a cube with edge 3 cm:', 'حجم مكعب طول حرفه 3 cm:', 'Volumen de un cubo de arista 3 cm:'), 'V = a³', ['9 cm³', '27 cm³', '12 cm³', '27 cm²'], 1, ['3 × 3 × 3', '= 27 cm³']),
    c(t('Volume d’un cylindre de rayon 2 et de hauteur 5 :', 'Volume of a cylinder with radius 2 and height 5:', 'حجم أسطوانة شعاعها 2 وارتفاعها 5:', 'Volumen de un cilindro de radio 2 y altura 5:'), 'V = π r² h', ['10π', '20π', '50π', '4π'], 1, ['π × 2² × 5', '= 20π']),
  ],
  limits: [
    c('value', 'lim (x→+∞) (5x + 1)/(x − 3)', ['5', '+∞', '−1/3', '1'], 0, ['(5x + 1)/(x − 3) ~ 5x/x', '= 5']),
    c('value', 'lim (x→+∞) e⁻ˣ', ['+∞', '1', '0', '−∞'], 2, ['e⁻ˣ = 1/eˣ', 'eˣ → +∞', '0']),
  ],
  logarithm: [
    c('simplify', 'ln(12) − ln(3)', ['ln(9)', 'ln(4)', 'ln(36)', '4'], 1, ['ln a − ln b = ln(a/b)', 'ln(12/3)', '= ln(4)'], true),
    c('solve', 'ln(x) = ln(7)', ['x = 7', 'x = e⁷', 'x = ln 7', 'x = 1/7'], 0, ['ln a = ln b ⇔ a = b', 'x = 7']),
  ],
  integrals: [
    c('value', '∫₀³ 2x dx', ['6', '9', '3', '18'], 1, ['[x²]₀³', '= 9 − 0', '= 9']),
    c('value', '∫₀¹ eˣ dx', ['e', 'e − 1', '1', 'e + 1'], 1, ['[eˣ]₀¹', '= e¹ − e⁰', '= e − 1']),
  ],
  'differential-equations': [
    c(t('Solution qui vérifie y(0) = 2 :', 'Solution with y(0) = 2:', 'الحل الذي يحقق y(0) = 2:', 'Solución con y(0) = 2:'), 'y′ = −y', ['y = 2eˣ', 'y = −2eˣ', 'y = 2e⁻ˣ', 'y = e⁻²ˣ'], 2, ['y = Ce⁻ˣ', 'y(0) = C = 2', 'y = 2e⁻ˣ']),
    c(t('Solution constante de l’équation :', 'Constant solution of the equation:', 'الحل الثابت للمعادلة:', 'Solución constante de la ecuación:'), 'y′ = 2y − 6', ['y = 6', 'y = −3', 'y = 3', 'y = 2'], 2, ['y′ = 0', '0 = 2y − 6', 'y = 3']),
  ],
  'complex-numbers': [
    c('compute', '(3 − i) − (1 + 2i)', ['2 − 3i', '2 + i', '4 + i', '2 − i'], 0, ['(3 − 1) + (−1 − 2)i', '= 2 − 3i']),
    c(t('Module de z = 6 − 8i :', 'Modulus of z = 6 − 8i:', 'معيار z = 6 − 8i:', 'Módulo de z = 6 − 8i:'), '|z|', ['14', '2', '100', '10'], 3, ['√(6² + 8²)', '= √100', '= 10']),
  ],
  counting: [
    c('compute', '3!', ['3', '9', '6', '27'], 2, ['3 × 2 × 1', '= 6']),
    c('compute', 'C(4 ; 2)', ['8', '6', '12', '16'], 1, ['(4 × 3)/(2 × 1)', '= 6']),
  ],
  'probability-laws': [
    c(t('X suit la loi B(20 ; 0,1). Espérance E(X) :', 'X follows B(20, 0.1). Expected value E(X):', 'X يتبع B(20 ; 0,1). الأمل الرياضي E(X):', 'X sigue B(20 ; 0,1). Esperanza E(X):'), 'E(X) = np', ['2', '0,1', '20', '18'], 0, ['20 × 0,1', '= 2']),
    c(t('P(A) = 0,4 et P(B | A) = 0,5. P(A ∩ B) = ?', 'P(A) = 0.4 and P(B | A) = 0.5. P(A ∩ B) = ?', 'P(A) = 0,4 و P(B | A) = 0,5. P(A ∩ B) = ؟', 'P(A) = 0,4 y P(B | A) = 0,5. ¿P(A ∩ B)?'), 'P(A) × P(B | A)', ['0,9', '0,8', '0,2', '0,1'], 2, ['0,4 × 0,5', '= 0,2']),
  ],
  'space-geometry': [
    c('compute', 'u→(2 ; 1 ; 0) · v→(1 ; −2 ; 5)', ['0', '4', '−1', '7'], 0, ['2 × 1 + 1 × (−2) + 0 × 5', '= 2 − 2 + 0', '= 0']),
    c(t('Norme du vecteur u→(2 ; 3 ; 6) :', 'Length of the vector u→(2, 3, 6):', 'منظم المتجهة u→(2 ; 3 ; 6):', 'Norma del vector u→(2 ; 3 ; 6):'), '‖u→‖', ['11', '7', '49', '√11'], 1, ['√(4 + 9 + 36)', '= √49', '= 7']),
  ],
  'trig-functions': [
    c('value', 'cos(π/3)', ['√3/2', '0', '1/2', '1'], 2, ['cos(π/3) = 1/2']),
    c('value', 'sin(π/2)', ['1', '0', '−1', 'π/2'], 0, ['sin(π/2) = 1']),
  ],
  congruences: [
    c(t('Reste de la division euclidienne de 59 par 8 :', 'Remainder when 59 is divided by 8:', 'باقي القسمة الإقليدية لـ 59 على 8:', 'Resto de la división entera de 59 entre 8:'), '59 = 8q + r', ['7', '3', '5', '1'], 1, ['8 × 7 = 56', '59 = 8 × 7 + 3', '3']),
    c(t('Complète avec un entier r tel que 0 ≤ r < 4 :', 'Fill in with an integer r where 0 ≤ r < 4:', 'أتمم بعدد صحيح r حيث 0 ≤ r < 4:', 'Completa con un entero r tal que 0 ≤ r < 4:'), '3⁵ ≡ r [4]', ['1', '0', '2', '3'], 3, ['3 ≡ −1 [4]', '3⁵ ≡ (−1)⁵ = −1 [4]', '−1 + 4 = 3']),
  ],
  'algebraic-structures': [
    c(t('Élément neutre de (ℝ, ×) :', 'Identity element of (ℝ, ×):', 'العنصر المحايد في (ℝ, ×):', 'Elemento neutro de (ℝ, ×):'), 'a × e = a', ['0', '1', '−1', 'a'], 1, ['a × 1 = 1 × a = a', '1']),
    c(t('Dans (ℤ/7ℤ, +) :', 'In (ℤ/7ℤ, +):', 'في (ℤ/7ℤ, +):', 'En (ℤ/7ℤ, +):'), '5̄ + 4̄', ['9̄', '1̄', '2̄', '0̄'], 2, ['5 + 4 = 9 = 7 + 2', '2̄']),
  ],
  regression: [
    c(t('Point moyen du nuage (2 ; 3), (4 ; 7), (6 ; 8) :', 'Mean point of (2, 3), (4, 7), (6, 8):', 'النقطة المتوسطة للسحابة (2 ; 3) و (4 ; 7) و (6 ; 8):', 'Punto medio de la nube (2 ; 3), (4 ; 7), (6 ; 8):'), 'G(x̄ ; ȳ)', ['(4 ; 6)', '(12 ; 18)', '(4 ; 7)', '(3 ; 6)'], 0, ['x̄ = 12/3 = 4', 'ȳ = 18/3 = 6', '(4 ; 6)']),
    c(t('Avec y = 1,5x + 2, estimation pour x = 10 :', 'With y = 1.5x + 2, estimate for x = 10:', 'باستعمال y = 1,5x + 2، التقدير من أجل x = 10:', 'Con y = 1,5x + 2, estimación para x = 10:'), 'y = 1,5 × 10 + 2', ['15', '17', '12', '20'], 1, ['15 + 2', '= 17']),
  ],
};
