// Fiches de chaque notion : « Cours » (l'essentiel à retenir) et « Méthode » (les étapes à suivre).
// Contenu original écrit pour PiSan, en FR, EN, AR et ES. Couvert par src/test/fiches-corrections.test.ts.
import type { L, NotionId } from './curriculum';

export type Sheet = { cours: L[]; methode: L[] };
const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });

export const SHEETS: Record<NotionId, Sheet> = {
  integers: {
    cours: [
      t('Un nombre relatif a un signe (+ ou −) et une distance à zéro.', 'A signed number has a sign (+ or −) and a distance from zero.', 'العدد النسبي له إشارة (+ أو −) ومسافة إلى الصفر.', 'Un número relativo tiene un signo (+ o −) y una distancia al cero.'),
      t('Ajouter un nombre négatif revient à soustraire sa distance à zéro.', 'Adding a negative number means subtracting its distance from zero.', 'جمع عدد سالب يعني طرح مسافته إلى الصفر.', 'Sumar un número negativo es restar su distancia al cero.'),
      t('Produit : signes identiques → +, signes différents → −.', 'Product: same signs → +, different signs → −.', 'الجداء: إشارتان متشابهتان ← +، إشارتان مختلفتان ← −.', 'Producto: signos iguales → +, signos distintos → −.'),
    ],
    methode: [
      t('Transforme chaque soustraction en addition de l’opposé.', 'Turn each subtraction into adding the opposite.', 'حوّل كل طرح إلى جمع المقابل.', 'Convierte cada resta en suma del opuesto.'),
      t('Même signe : additionne les distances et garde le signe.', 'Same sign: add the distances and keep the sign.', 'نفس الإشارة: اجمع المسافتين واحتفظ بالإشارة.', 'Mismo signo: suma las distancias y conserva el signo.'),
      t('Signes différents : soustrais les distances et prends le signe de la plus grande.', 'Different signs: subtract the distances and take the sign of the larger one.', 'إشارتان مختلفتان: اطرح المسافتين وخذ إشارة الأكبر.', 'Signos distintos: resta las distancias y toma el signo de la mayor.'),
    ],
  },
  fractions: {
    cours: [
      t('a/b : le tout est partagé en b parts égales, on en prend a.', 'a/b: the whole is cut into b equal parts and we take a of them.', 'a/b: نقسم الكل إلى b أجزاء متساوية ونأخذ منها a.', 'a/b: el todo se divide en b partes iguales y se toman a.'),
      t('On ne change pas une fraction en multipliant le haut et le bas par le même nombre.', 'Multiplying top and bottom by the same number does not change a fraction.', 'لا يتغيّر الكسر إذا ضربنا البسط والمقام في نفس العدد.', 'Una fracción no cambia si se multiplican arriba y abajo por el mismo número.'),
      t('Pour multiplier : haut × haut et bas × bas.', 'To multiply: top × top and bottom × bottom.', 'للضرب: البسط × البسط والمقام × المقام.', 'Para multiplicar: arriba × arriba y abajo × abajo.'),
    ],
    methode: [
      t('Pour additionner, mets d’abord les fractions au même dénominateur.', 'To add, first give the fractions a common denominator.', 'للجمع، وحّد المقامات أولًا.', 'Para sumar, pon primero un denominador común.'),
      t('Additionne les numérateurs, garde le dénominateur.', 'Add the numerators, keep the denominator.', 'اجمع البسوط واحتفظ بالمقام.', 'Suma los numeradores y conserva el denominador.'),
      t('Simplifie le résultat si c’est possible.', 'Simplify the result if you can.', 'اختزل النتيجة إن أمكن.', 'Simplifica el resultado si es posible.'),
    ],
  },
  proportion: {
    cours: [
      t('Deux grandeurs sont proportionnelles si on passe de l’une à l’autre en multipliant toujours par le même nombre.', 'Two quantities are proportional when one is always the other times the same number.', 'تكون مقداران متناسبين إذا انتقلنا من أحدهما إلى الآخر بالضرب دائمًا في نفس العدد.', 'Dos magnitudes son proporcionales si se pasa de una a otra multiplicando siempre por el mismo número.'),
      t('p % d’une quantité, c’est la quantité × p ÷ 100.', 'p% of an amount is the amount × p ÷ 100.', 'p% من كمية هي الكمية × p ÷ 100.', 'El p % de una cantidad es la cantidad × p ÷ 100.'),
      t('25 % = 1/4, 50 % = 1/2, 10 % = 1/10.', '25% = 1/4, 50% = 1/2, 10% = 1/10.', '25% = 1/4 و 50% = 1/2 و 10% = 1/10.', '25 % = 1/4, 50 % = 1/2, 10 % = 1/10.'),
    ],
    methode: [
      t('Écris les données dans un tableau à deux lignes.', 'Put the data in a two-row table.', 'اكتب المعطيات في جدول من سطرين.', 'Escribe los datos en una tabla de dos filas.'),
      t('Cherche la valeur pour 1 (passage à l’unité).', 'Find the value for 1 (unit rate).', 'ابحث عن القيمة الموافقة لـ 1 (الرجوع إلى الوحدة).', 'Busca el valor para 1 (reducción a la unidad).'),
      t('Multiplie par la quantité demandée.', 'Multiply by the amount asked for.', 'اضرب في الكمية المطلوبة.', 'Multiplica por la cantidad pedida.'),
    ],
  },
  powers: {
    cours: [
      t('aⁿ = a × a × … × a (n facteurs).', 'aⁿ = a × a × … × a (n factors).', 'aⁿ = a × a × … × a (n عاملًا).', 'aⁿ = a × a × … × a (n factores).'),
      t('aⁿ × aᵐ = aⁿ⁺ᵐ et (aⁿ)ᵐ = aⁿˣᵐ.', 'aⁿ × aᵐ = aⁿ⁺ᵐ and (aⁿ)ᵐ = aⁿˣᵐ.', 'aⁿ × aᵐ = aⁿ⁺ᵐ و (aⁿ)ᵐ = aⁿˣᵐ.', 'aⁿ × aᵐ = aⁿ⁺ᵐ y (aⁿ)ᵐ = aⁿˣᵐ.'),
      t('a⁻ⁿ = 1/aⁿ et a⁰ = 1.', 'a⁻ⁿ = 1/aⁿ and a⁰ = 1.', 'a⁻ⁿ = 1/aⁿ و a⁰ = 1.', 'a⁻ⁿ = 1/aⁿ y a⁰ = 1.'),
    ],
    methode: [
      t('Vérifie que les puissances ont la même base.', 'Check that the powers have the same base.', 'تأكد أن القوى لها نفس الأساس.', 'Comprueba que las potencias tengan la misma base.'),
      t('Choisis la bonne règle : produit → on additionne, puissance de puissance → on multiplie.', 'Pick the rule: product → add exponents, power of a power → multiply them.', 'اختر القاعدة: جداء ← نجمع الأسس، قوة قوة ← نضربها.', 'Elige la regla: producto → se suman, potencia de potencia → se multiplican.'),
      t('Écris le résultat sous la forme d’une seule puissance.', 'Write the result as a single power.', 'اكتب النتيجة على شكل قوة واحدة.', 'Escribe el resultado como una sola potencia.'),
    ],
  },
  algebra: {
    cours: [
      t('Développer : k(a + b) = ka + kb.', 'Expand: k(a + b) = ka + kb.', 'النشر: k(a + b) = ka + kb.', 'Desarrollar: k(a + b) = ka + kb.'),
      t('Identités : (a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b², (a + b)(a − b) = a² − b².', 'Special products: (a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b², (a + b)(a − b) = a² − b².', 'المتطابقات: (a + b)² = a² + 2ab + b² و (a − b)² = a² − 2ab + b² و (a + b)(a − b) = a² − b².', 'Identidades: (a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b², (a + b)(a − b) = a² − b².'),
      t('On ne réduit ensemble que les termes de même nature (les x avec les x).', 'Only like terms can be combined (x with x).', 'لا نختزل إلا الحدود من نفس النوع (x مع x).', 'Solo se reducen los términos semejantes (las x con las x).'),
    ],
    methode: [
      t('Repère la forme : k(a + b), produit de deux parenthèses ou identité.', 'Spot the shape: k(a + b), product of two brackets, or a special product.', 'حدّد الشكل: k(a + b) أو جداء قوسين أو متطابقة.', 'Identifica la forma: k(a + b), producto de dos paréntesis o identidad.'),
      t('Multiplie chaque terme, sans oublier les signes.', 'Multiply every term, keeping track of signs.', 'اضرب كل حد دون نسيان الإشارات.', 'Multiplica cada término sin olvidar los signos.'),
      t('Regroupe et réduis les termes semblables.', 'Group and combine like terms.', 'جمّع الحدود المتشابهة واختزلها.', 'Agrupa y reduce los términos semejantes.'),
    ],
  },
  equations: {
    cours: [
      t('Résoudre une équation, c’est trouver la valeur de x qui rend l’égalité vraie.', 'Solving an equation means finding the x that makes it true.', 'حل معادلة هو إيجاد قيمة x التي تجعل المتساوية صحيحة.', 'Resolver una ecuación es hallar el valor de x que la hace verdadera.'),
      t('On peut ajouter ou soustraire le même nombre des deux côtés.', 'You may add or subtract the same number on both sides.', 'يمكن إضافة أو طرح نفس العدد من الطرفين.', 'Se puede sumar o restar el mismo número en ambos lados.'),
      t('On peut multiplier ou diviser les deux côtés par le même nombre non nul.', 'You may multiply or divide both sides by the same non-zero number.', 'يمكن ضرب أو قسمة الطرفين على نفس العدد غير المنعدم.', 'Se pueden multiplicar o dividir ambos lados por el mismo número no nulo.'),
    ],
    methode: [
      t('Rassemble les x d’un côté et les nombres de l’autre.', 'Put the x terms on one side and the numbers on the other.', 'اجمع حدود x في طرف والأعداد في الطرف الآخر.', 'Pon las x a un lado y los números al otro.'),
      t('Divise par le nombre devant x.', 'Divide by the number in front of x.', 'اقسم على العدد الذي أمام x.', 'Divide entre el número delante de x.'),
      t('Vérifie en remplaçant x dans l’équation de départ.', 'Check by putting x back into the original equation.', 'تحقّق بتعويض x في المعادلة الأصلية.', 'Comprueba sustituyendo x en la ecuación inicial.'),
    ],
  },
  functions: {
    cours: [
      t('Une fonction associe à chaque x un seul nombre f(x), son image.', 'A function gives each x exactly one number f(x), its image.', 'الدالة تربط كل x بعدد وحيد f(x) هو صورته.', 'Una función asocia a cada x un único número f(x), su imagen.'),
      t('Une fonction affine s’écrit f(x) = ax + b ; sa courbe est une droite.', 'A linear (affine) function is f(x) = ax + b; its graph is a straight line.', 'الدالة التآلفية تُكتب f(x) = ax + b ومنحناها مستقيم.', 'Una función afín es f(x) = ax + b; su gráfica es una recta.'),
      t('a est le coefficient directeur (la pente), b l’ordonnée à l’origine.', 'a is the slope, b is the y-intercept.', 'a هو المعامل الموجه (الميل) و b هو الأرتوب عند الأصل.', 'a es la pendiente y b la ordenada en el origen.'),
    ],
    methode: [
      t('Pour une image : remplace x par la valeur donnée.', 'For an image: replace x with the given value.', 'لحساب صورة: عوّض x بالقيمة المعطاة.', 'Para una imagen: sustituye x por el valor dado.'),
      t('Calcule en respectant les priorités.', 'Calculate following the order of operations.', 'احسب مع احترام الأولويات.', 'Calcula respetando las prioridades.'),
      t('Pour un antécédent : résous l’équation f(x) = valeur.', 'For a pre-image: solve f(x) = value.', 'لإيجاد سابقة: حل المعادلة f(x) = القيمة.', 'Para una preimagen: resuelve f(x) = valor.'),
    ],
  },
  quadratics: {
    cours: [
      t('Une équation du second degré s’écrit ax² + bx + c = 0 avec a ≠ 0.', 'A quadratic equation is ax² + bx + c = 0 with a ≠ 0.', 'المعادلة من الدرجة الثانية تُكتب ax² + bx + c = 0 حيث a ≠ 0.', 'Una ecuación de segundo grado es ax² + bx + c = 0 con a ≠ 0.'),
      t('Le discriminant Δ = b² − 4ac donne le nombre de solutions.', 'The discriminant Δ = b² − 4ac tells how many solutions there are.', 'المميز Δ = b² − 4ac يحدد عدد الحلول.', 'El discriminante Δ = b² − 4ac da el número de soluciones.'),
      t('Δ > 0 : deux solutions ; Δ = 0 : une ; Δ < 0 : aucune dans ℝ.', 'Δ > 0: two solutions; Δ = 0: one; Δ < 0: none in ℝ.', 'Δ > 0: حلان؛ Δ = 0: حل وحيد؛ Δ < 0: لا حل في ℝ.', 'Δ > 0: dos soluciones; Δ = 0: una; Δ < 0: ninguna en ℝ.'),
    ],
    methode: [
      t('Repère a, b et c (avec leurs signes).', 'Identify a, b and c (with their signs).', 'حدّد a و b و c بإشاراتها.', 'Identifica a, b y c (con sus signos).'),
      t('Calcule Δ = b² − 4ac.', 'Work out Δ = b² − 4ac.', 'احسب Δ = b² − 4ac.', 'Calcula Δ = b² − 4ac.'),
      t('Si Δ ≥ 0, applique x = (−b ± √Δ) / (2a).', 'If Δ ≥ 0, use x = (−b ± √Δ) / (2a).', 'إذا كان Δ ≥ 0 طبّق x = (−b ± √Δ) / (2a).', 'Si Δ ≥ 0, aplica x = (−b ± √Δ) / (2a).'),
    ],
  },
  derivatives: {
    cours: [
      t('f′(a) est la pente de la tangente à la courbe au point d’abscisse a.', 'f′(a) is the slope of the tangent to the curve at x = a.', 'f′(a) هو ميل المماس للمنحنى في النقطة ذات الأفصول a.', 'f′(a) es la pendiente de la tangente a la curva en x = a.'),
      t('(xⁿ)′ = n xⁿ⁻¹, (k)′ = 0, (u + v)′ = u′ + v′.', '(xⁿ)′ = n xⁿ⁻¹, (k)′ = 0, (u + v)′ = u′ + v′.', '(xⁿ)′ = n xⁿ⁻¹ و (k)′ = 0 و (u + v)′ = u′ + v′.', '(xⁿ)′ = n xⁿ⁻¹, (k)′ = 0, (u + v)′ = u′ + v′.'),
      t('f′ > 0 : f croît ; f′ < 0 : f décroît.', 'f′ > 0: f increases; f′ < 0: f decreases.', 'f′ > 0: f تزايدية؛ f′ < 0: f تناقصية.', 'f′ > 0: f crece; f′ < 0: f decrece.'),
    ],
    methode: [
      t('Découpe f en une somme de termes simples.', 'Split f into a sum of simple terms.', 'جزّئ f إلى مجموع حدود بسيطة.', 'Divide f en una suma de términos simples.'),
      t('Dérive chaque terme avec la formule qui convient.', 'Differentiate each term with the right formula.', 'اشتق كل حد بالصيغة المناسبة.', 'Deriva cada término con la fórmula adecuada.'),
      t('Étudie le signe de f′ pour obtenir les variations.', 'Study the sign of f′ to find where f goes up or down.', 'ادرس إشارة f′ لاستنتاج التغيرات.', 'Estudia el signo de f′ para obtener la variación.'),
    ],
  },
  sequences: {
    cours: [
      t('Suite arithmétique : on ajoute toujours r. uₙ = u₀ + n r.', 'Arithmetic sequence: always add r. uₙ = u₀ + n r.', 'متتالية حسابية: نضيف دائمًا r. uₙ = u₀ + n r.', 'Sucesión aritmética: se suma siempre r. uₙ = u₀ + n r.'),
      t('Suite géométrique : on multiplie toujours par q. vₙ = v₀ × qⁿ.', 'Geometric sequence: always multiply by q. vₙ = v₀ × qⁿ.', 'متتالية هندسية: نضرب دائمًا في q. vₙ = v₀ × qⁿ.', 'Sucesión geométrica: se multiplica siempre por q. vₙ = v₀ × qⁿ.'),
      t('Si |q| < 1, qⁿ tend vers 0 ; si q > 1, qⁿ tend vers +∞.', 'If |q| < 1, qⁿ tends to 0; if q > 1, qⁿ tends to +∞.', 'إذا كان |q| < 1 فإن qⁿ تؤول إلى 0؛ وإذا كان q > 1 فإنها تؤول إلى +∞.', 'Si |q| < 1, qⁿ tiende a 0; si q > 1, tiende a +∞.'),
    ],
    methode: [
      t('Calcule u₁ − u₀ et u₂ − u₁ : égaux ? La suite est arithmétique.', 'Work out u₁ − u₀ and u₂ − u₁: equal? It is arithmetic.', 'احسب u₁ − u₀ و u₂ − u₁: إذا تساويا فالمتتالية حسابية.', 'Calcula u₁ − u₀ y u₂ − u₁: ¿iguales? Es aritmética.'),
      t('Sinon calcule u₁ ÷ u₀ et u₂ ÷ u₁ : égaux ? Elle est géométrique.', 'Otherwise work out u₁ ÷ u₀ and u₂ ÷ u₁: equal? It is geometric.', 'وإلا احسب u₁ ÷ u₀ و u₂ ÷ u₁: إذا تساويا فهي هندسية.', 'Si no, calcula u₁ ÷ u₀ y u₂ ÷ u₁: ¿iguales? Es geométrica.'),
      t('Applique la formule du terme général avec le bon n.', 'Use the general-term formula with the right n.', 'طبّق صيغة الحد العام بقيمة n المناسبة.', 'Aplica la fórmula del término general con el n correcto.'),
    ],
  },
  exponential: {
    cours: [
      t('exp est la fonction égale à sa dérivée avec exp(0) = 1 ; on note eˣ.', 'exp is the function equal to its own derivative with exp(0) = 1; written eˣ.', 'exp هي الدالة المساوية لمشتقتها والتي تحقق exp(0) = 1، ونكتب eˣ.', 'exp es la función igual a su derivada con exp(0) = 1; se escribe eˣ.'),
      t('eᵃ × eᵇ = eᵃ⁺ᵇ, eᵃ / eᵇ = eᵃ⁻ᵇ, (eᵃ)ⁿ = eⁿᵃ.', 'eᵃ × eᵇ = eᵃ⁺ᵇ, eᵃ / eᵇ = eᵃ⁻ᵇ, (eᵃ)ⁿ = eⁿᵃ.', 'eᵃ × eᵇ = eᵃ⁺ᵇ و eᵃ / eᵇ = eᵃ⁻ᵇ و (eᵃ)ⁿ = eⁿᵃ.', 'eᵃ × eᵇ = eᵃ⁺ᵇ, eᵃ / eᵇ = eᵃ⁻ᵇ, (eᵃ)ⁿ = eⁿᵃ.'),
      t('eˣ > 0 pour tout x, et la fonction est croissante.', 'eˣ > 0 for every x, and the function is increasing.', 'eˣ > 0 لكل x، والدالة تزايدية.', 'eˣ > 0 para todo x, y la función es creciente.'),
    ],
    methode: [
      t('Écris tout avec la même base e.', 'Write everything with the same base e.', 'اكتب كل شيء بنفس الأساس e.', 'Escríbelo todo con la misma base e.'),
      t('Applique les règles des puissances aux exposants.', 'Apply the power rules to the exponents.', 'طبّق قواعد القوى على الأسس.', 'Aplica las reglas de las potencias a los exponentes.'),
      t('Pour eᵃ = eᵇ, conclus a = b.', 'If eᵃ = eᵇ, conclude a = b.', 'إذا كان eᵃ = eᵇ فإن a = b.', 'Si eᵃ = eᵇ, concluye que a = b.'),
    ],
  },
  decimals: {
    cours: [
      t('Dans 3,47 : 3 unités, 4 dixièmes, 7 centièmes.', 'In 3.47: 3 ones, 4 tenths, 7 hundredths.', 'في 3,47: 3 وحدات و 4 أعشار و 7 أجزاء من مائة.', 'En 3,47: 3 unidades, 4 décimas, 7 centésimas.'),
      t('× 10 décale la virgule d’un rang vers la droite, ÷ 10 vers la gauche.', '× 10 moves the decimal point one place right, ÷ 10 one place left.', '× 10 يُزيح الفاصلة رتبة نحو اليمين، و ÷ 10 نحو اليسار.', '× 10 mueve la coma un lugar a la derecha, ÷ 10 a la izquierda.'),
      t('Division euclidienne : a = b × q + r avec r < b.', 'Division with remainder: a = b × q + r with r < b.', 'القسمة الإقليدية: a = b × q + r حيث r < b.', 'División entera: a = b × q + r con r < b.'),
    ],
    methode: [
      t('Pose l’opération en alignant les virgules.', 'Write the sum with the decimal points lined up.', 'ضع العملية مع محاذاة الفواصل.', 'Coloca la operación alineando las comas.'),
      t('Complète avec des zéros pour avoir autant de chiffres après la virgule.', 'Add zeros so both numbers have the same number of decimal places.', 'أكمل بأصفار ليكون عدد الأرقام بعد الفاصلة متساويًا.', 'Completa con ceros para tener las mismas cifras decimales.'),
      t('Calcule colonne par colonne, de droite à gauche.', 'Work column by column, from right to left.', 'احسب عمودًا بعد عمود من اليمين إلى اليسار.', 'Calcula columna por columna, de derecha a izquierda.'),
    ],
  },
  geometry: {
    cours: [
      t('La somme des angles d’un triangle vaut 180°.', 'The angles of a triangle add up to 180°.', 'مجموع زوايا المثلث يساوي 180°.', 'Los ángulos de un triángulo suman 180°.'),
      t('Deux droites perpendiculaires à une même droite sont parallèles.', 'Two lines perpendicular to the same line are parallel.', 'مستقيمان عموديان على نفس المستقيم متوازيان.', 'Dos rectas perpendiculares a una misma recta son paralelas.'),
      t('Un angle inscrit vaut la moitié de l’angle au centre qui intercepte le même arc.', 'An inscribed angle is half the central angle on the same arc.', 'الزاوية المحيطية تساوي نصف الزاوية المركزية التي تحصر نفس القوس.', 'Un ángulo inscrito mide la mitad del ángulo central que abarca el mismo arco.'),
    ],
    methode: [
      t('Fais une figure à main levée et code les données.', 'Sketch the figure and mark the given information.', 'ارسم شكلًا تقريبيًا وضع عليه المعطيات.', 'Haz un esquema y marca los datos.'),
      t('Cherche la propriété qui relie ce que tu sais à ce que tu cherches.', 'Find the property that links what you know to what you want.', 'ابحث عن الخاصية التي تربط المعطيات بالمطلوب.', 'Busca la propiedad que une lo que sabes con lo que buscas.'),
      t('Rédige : « On sait que… Or… Donc… ».', 'Write it up: “We know that… Since… Therefore…”.', 'حرّر: «نعلم أن… وبما أن… إذن…».', 'Redacta: «Sabemos que… Como… Por lo tanto…».'),
    ],
  },
  symmetry: {
    cours: [
      t('Symétrie axiale : la figure se replie sur elle-même le long de l’axe.', 'Line symmetry: the figure folds onto itself along the axis.', 'التماثل المحوري: ينطبق الشكل على نفسه بالطي حول المحور.', 'Simetría axial: la figura se pliega sobre sí misma a lo largo del eje.'),
      t('Symétrie centrale : demi-tour autour du centre O, qui est le milieu de [AA′].', 'Point symmetry: a half-turn about O, the midpoint of [AA′].', 'التماثل المركزي: نصف دورة حول المركز O الذي هو منتصف [AA′].', 'Simetría central: media vuelta alrededor de O, punto medio de [AA′].'),
      t('Une symétrie conserve longueurs, angles et aires.', 'A symmetry keeps lengths, angles and areas.', 'التماثل يحافظ على الأطوال والزوايا والمساحات.', 'Una simetría conserva longitudes, ángulos y áreas.'),
    ],
    methode: [
      t('Pour construire A′ : trace la perpendiculaire à l’axe passant par A (ou la droite (AO)).', 'To build A′: draw the line through A perpendicular to the axis (or the line AO).', 'لإنشاء A′: ارسم العمودي على المحور المار من A (أو المستقيم (AO)).', 'Para construir A′: traza la perpendicular al eje por A (o la recta AO).'),
      t('Reporte la même distance de l’autre côté.', 'Measure the same distance on the other side.', 'انقل نفس المسافة إلى الجهة الأخرى.', 'Lleva la misma distancia al otro lado.'),
      t('Vérifie que l’axe (ou O) est bien au milieu.', 'Check that the axis (or O) is exactly in the middle.', 'تحقّق أن المحور (أو O) في المنتصف تمامًا.', 'Comprueba que el eje (u O) queda justo en el medio.'),
    ],
  },
  areas: {
    cours: [
      t('Rectangle : P = 2 × (L + l), A = L × l.', 'Rectangle: P = 2 × (L + w), A = L × w.', 'المستطيل: P = 2 × (L + l) و A = L × l.', 'Rectángulo: P = 2 × (L + l), A = L × l.'),
      t('Triangle : A = b × h ÷ 2. Disque : A = π r², cercle : P = 2 π r.', 'Triangle: A = b × h ÷ 2. Disc: A = π r², circle: C = 2 π r.', 'المثلث: A = b × h ÷ 2. القرص: A = π r² والدائرة: P = 2 π r.', 'Triángulo: A = b × h ÷ 2. Círculo: A = π r², circunferencia: P = 2 π r.'),
      t('Pavé droit : V = L × l × h. Cylindre : V = π r² h.', 'Cuboid: V = L × w × h. Cylinder: V = π r² h.', 'متوازي المستطيلات: V = L × l × h. الأسطوانة: V = π r² h.', 'Ortoedro: V = L × l × h. Cilindro: V = π r² h.'),
    ],
    methode: [
      t('Identifie la figure et écris sa formule.', 'Identify the shape and write its formula.', 'حدّد الشكل واكتب صيغته.', 'Identifica la figura y escribe su fórmula.'),
      t('Mets toutes les longueurs dans la même unité.', 'Put all lengths in the same unit.', 'حوّل كل الأطوال إلى نفس الوحدة.', 'Pon todas las longitudes en la misma unidad.'),
      t('Calcule et écris l’unité : cm, cm² ou cm³.', 'Calculate and write the unit: cm, cm² or cm³.', 'احسب واكتب الوحدة: cm أو cm² أو cm³.', 'Calcula y escribe la unidad: cm, cm² o cm³.'),
    ],
  },
  statistics: {
    cours: [
      t('Moyenne = somme des valeurs ÷ effectif total.', 'Mean = sum of the values ÷ number of values.', 'المعدل = مجموع القيم ÷ الحصيص الإجمالي.', 'Media = suma de los valores ÷ número de valores.'),
      t('Médiane : la valeur qui partage la série rangée en deux moitiés.', 'Median: the value that splits the ordered data into two halves.', 'الوسيط: القيمة التي تقسم السلسلة المرتبة إلى نصفين.', 'Mediana: el valor que divide la serie ordenada en dos mitades.'),
      t('Étendue = plus grande valeur − plus petite valeur.', 'Range = largest value − smallest value.', 'المدى = أكبر قيمة − أصغر قيمة.', 'Rango = valor mayor − valor menor.'),
    ],
    methode: [
      t('Range les valeurs dans l’ordre croissant.', 'Sort the values from smallest to largest.', 'رتّب القيم تصاعديًا.', 'Ordena los valores de menor a mayor.'),
      t('Compte l’effectif total.', 'Count how many values there are.', 'احسب الحصيص الإجمالي.', 'Cuenta el número total de valores.'),
      t('Applique la formule demandée.', 'Use the formula you need.', 'طبّق الصيغة المطلوبة.', 'Aplica la fórmula pedida.'),
    ],
  },
  'square-roots': {
    cours: [
      t('√a (a ≥ 0) est le nombre positif dont le carré vaut a.', '√a (a ≥ 0) is the positive number whose square is a.', '√a (حيث a ≥ 0) هو العدد الموجب الذي مربعه a.', '√a (a ≥ 0) es el número positivo cuyo cuadrado es a.'),
      t('√(a × b) = √a × √b et √(a/b) = √a / √b.', '√(a × b) = √a × √b and √(a/b) = √a / √b.', '√(a × b) = √a × √b و √(a/b) = √a / √b.', '√(a × b) = √a × √b y √(a/b) = √a / √b.'),
      t('Attention : √(a + b) n’est pas égal à √a + √b.', 'Careful: √(a + b) is not √a + √b.', 'انتبه: √(a + b) لا يساوي √a + √b.', 'Atención: √(a + b) no es igual a √a + √b.'),
    ],
    methode: [
      t('Cherche le plus grand carré parfait qui divise le nombre (4, 9, 16, 25…).', 'Find the largest perfect square that divides the number (4, 9, 16, 25…).', 'ابحث عن أكبر مربع كامل يقسم العدد (4، 9، 16، 25…).', 'Busca el mayor cuadrado perfecto que divide al número (4, 9, 16, 25…).'),
      t('Sépare : √(25 × 2) = √25 × √2.', 'Split it: √(25 × 2) = √25 × √2.', 'فكّك: √(25 × 2) = √25 × √2.', 'Sepáralo: √(25 × 2) = √25 × √2.'),
      t('Écris sous la forme a√b, puis additionne les termes en √b.', 'Write it as a√b, then add the terms in √b.', 'اكتب على شكل a√b ثم اجمع الحدود التي فيها √b.', 'Escríbelo como a√b y suma los términos en √b.'),
    ],
  },
  arithmetic: {
    cours: [
      t('Un nombre premier a exactement deux diviseurs : 1 et lui-même.', 'A prime number has exactly two divisors: 1 and itself.', 'العدد الأولي له قاسمان فقط: 1 ونفسه.', 'Un número primo tiene exactamente dos divisores: 1 y él mismo.'),
      t('Tout entier ≥ 2 se décompose en produit de nombres premiers.', 'Every whole number ≥ 2 is a product of primes.', 'كل عدد صحيح ≥ 2 يُفكَّك إلى جداء أعداد أولية.', 'Todo entero ≥ 2 se descompone en producto de primos.'),
      t('PGCD : produit des facteurs premiers communs, avec le plus petit exposant.', 'GCD: product of the shared prime factors, each with its smaller exponent.', 'القاسم المشترك الأكبر: جداء العوامل الأولية المشتركة بأصغر أس.', 'MCD: producto de los factores primos comunes con el menor exponente.'),
    ],
    methode: [
      t('Divise successivement par 2, 3, 5, 7… tant que c’est possible.', 'Keep dividing by 2, 3, 5, 7… while you can.', 'اقسم تباعًا على 2 و 3 و 5 و 7… ما دام ذلك ممكنًا.', 'Divide sucesivamente entre 2, 3, 5, 7… mientras se pueda.'),
      t('Écris chaque nombre comme un produit de puissances de nombres premiers.', 'Write each number as a product of prime powers.', 'اكتب كل عدد على شكل جداء قوى أعداد أولية.', 'Escribe cada número como producto de potencias de primos.'),
      t('Garde les facteurs communs pour le PGCD et simplifie la fraction.', 'Keep the shared factors for the GCD and simplify the fraction.', 'احتفظ بالعوامل المشتركة للقاسم المشترك الأكبر واختزل الكسر.', 'Conserva los factores comunes para el MCD y simplifica la fracción.'),
    ],
  },
  inequalities: {
    cours: [
      t('Une inéquation a souvent une infinité de solutions : un intervalle.', 'An inequality usually has infinitely many solutions: an interval.', 'للمتراجحة غالبًا ما لا نهاية من الحلول: مجال.', 'Una inecuación suele tener infinitas soluciones: un intervalo.'),
      t('Ajouter ou soustraire ne change pas le sens de l’inégalité.', 'Adding or subtracting does not change the direction of the sign.', 'الجمع أو الطرح لا يغيّر اتجاه المتفاوتة.', 'Sumar o restar no cambia el sentido de la desigualdad.'),
      t('Multiplier ou diviser par un nombre négatif retourne le sens.', 'Multiplying or dividing by a negative number flips the sign.', 'الضرب أو القسمة على عدد سالب يعكس الاتجاه.', 'Multiplicar o dividir por un número negativo invierte el sentido.'),
    ],
    methode: [
      t('Isole les x d’un côté, comme pour une équation.', 'Get the x terms on one side, as for an equation.', 'اعزل حدود x في طرف كما في المعادلة.', 'Aísla las x en un lado, como en una ecuación.'),
      t('Divise par le nombre devant x ; s’il est négatif, retourne le signe.', 'Divide by the number in front of x; if it is negative, flip the sign.', 'اقسم على العدد الذي أمام x، وإذا كان سالبًا اعكس الإشارة.', 'Divide entre el número delante de x; si es negativo, invierte el signo.'),
      t('Donne les solutions et teste une valeur pour vérifier.', 'State the solutions and test one value to check.', 'اكتب الحلول واختبر قيمة للتحقق.', 'Da las soluciones y prueba un valor para comprobar.'),
    ],
  },
  systems: {
    cours: [
      t('Résoudre un système, c’est trouver le couple (x ; y) qui vérifie les deux équations.', 'Solving a system means finding the pair (x, y) that fits both equations.', 'حل نظمة هو إيجاد الزوج (x ; y) الذي يحقق المعادلتين معًا.', 'Resolver un sistema es hallar el par (x ; y) que cumple ambas ecuaciones.'),
      t('Substitution : on exprime une inconnue en fonction de l’autre.', 'Substitution: write one unknown in terms of the other.', 'التعويض: نعبّر عن مجهول بدلالة الآخر.', 'Sustitución: se expresa una incógnita en función de la otra.'),
      t('Combinaison : on ajoute ou soustrait les équations pour en éliminer une inconnue.', 'Elimination: add or subtract the equations to remove one unknown.', 'التأليفة الخطية: نجمع أو نطرح المعادلتين لحذف أحد المجهولين.', 'Reducción: se suman o restan las ecuaciones para eliminar una incógnita.'),
    ],
    methode: [
      t('Choisis la méthode la plus rapide (un coefficient égal à 1 → substitution).', 'Pick the quickest method (a coefficient of 1 → substitution).', 'اختر الطريقة الأسرع (معامل يساوي 1 ← التعويض).', 'Elige el método más rápido (un coeficiente igual a 1 → sustitución).'),
      t('Trouve la première inconnue, puis remplace-la pour trouver l’autre.', 'Find the first unknown, then substitute it to find the other.', 'أوجد المجهول الأول ثم عوّضه لإيجاد الآخر.', 'Halla la primera incógnita y sustitúyela para hallar la otra.'),
      t('Vérifie le couple dans les deux équations.', 'Check the pair in both equations.', 'تحقّق من الزوج في المعادلتين.', 'Comprueba el par en las dos ecuaciones.'),
    ],
  },
  'pythagoras-thales': {
    cours: [
      t('Pythagore : si ABC est rectangle en A, alors BC² = AB² + AC².', 'Pythagoras: if ABC has a right angle at A, then BC² = AB² + AC².', 'فيثاغورس: إذا كان ABC قائم الزاوية في A فإن BC² = AB² + AC².', 'Pitágoras: si ABC es rectángulo en A, entonces BC² = AB² + AC².'),
      t('Réciproque : si BC² = AB² + AC², alors ABC est rectangle en A.', 'Converse: if BC² = AB² + AC², then ABC has a right angle at A.', 'العكس: إذا كان BC² = AB² + AC² فإن ABC قائم الزاوية في A.', 'Recíproco: si BC² = AB² + AC², entonces ABC es rectángulo en A.'),
      t('Thalès : si (MN) ∥ (BC), alors AM/AB = AN/AC = MN/BC.', 'Intercept theorem: if (MN) ∥ (BC), then AM/AB = AN/AC = MN/BC.', 'طاليس: إذا كان (MN) ∥ (BC) فإن AM/AB = AN/AC = MN/BC.', 'Tales: si (MN) ∥ (BC), entonces AM/AB = AN/AC = MN/BC.'),
    ],
    methode: [
      t('Repère l’angle droit (Pythagore) ou les droites parallèles (Thalès).', 'Spot the right angle (Pythagoras) or the parallel lines (intercept theorem).', 'حدّد الزاوية القائمة (فيثاغورس) أو المستقيمين المتوازيين (طاليس).', 'Localiza el ángulo recto (Pitágoras) o las rectas paralelas (Tales).'),
      t('Écris l’égalité avec les bonnes lettres.', 'Write the equality with the right letters.', 'اكتب المتساوية بالحروف المناسبة.', 'Escribe la igualdad con las letras correctas.'),
      t('Remplace par les longueurs connues et calcule la longueur cherchée.', 'Put in the known lengths and work out the missing one.', 'عوّض بالأطوال المعروفة واحسب الطول المطلوب.', 'Sustituye las longitudes conocidas y calcula la buscada.'),
    ],
  },
  trigonometry: {
    cours: [
      t('Dans un triangle rectangle, pour un angle aigu : cos = adjacent / hypoténuse.', 'In a right triangle, for an acute angle: cos = adjacent / hypotenuse.', 'في مثلث قائم، بالنسبة لزاوية حادة: cos = المجاور / الوتر.', 'En un triángulo rectángulo, para un ángulo agudo: cos = contiguo / hipotenusa.'),
      t('sin = opposé / hypoténuse et tan = opposé / adjacent.', 'sin = opposite / hypotenuse and tan = opposite / adjacent.', 'sin = المقابل / الوتر و tan = المقابل / المجاور.', 'sen = opuesto / hipotenusa y tan = opuesto / contiguo.'),
      t('cos²x + sin²x = 1 et tan x = sin x / cos x.', 'cos²x + sin²x = 1 and tan x = sin x / cos x.', 'cos²x + sin²x = 1 و tan x = sin x / cos x.', 'cos²x + sen²x = 1 y tan x = sen x / cos x.'),
    ],
    methode: [
      t('Repère l’hypoténuse, puis le côté opposé et le côté adjacent à l’angle.', 'Find the hypotenuse, then the sides opposite and adjacent to the angle.', 'حدّد الوتر ثم الضلع المقابل والضلع المجاور للزاوية.', 'Localiza la hipotenusa y luego los lados opuesto y contiguo al ángulo.'),
      t('Choisis la formule qui utilise ce que tu connais et ce que tu cherches.', 'Choose the ratio that uses what you know and what you want.', 'اختر النسبة التي تستعمل المعطى والمطلوب.', 'Elige la razón que usa lo que sabes y lo que buscas.'),
      t('Calcule avec la calculatrice en mode degrés.', 'Use the calculator in degree mode.', 'احسب بالآلة الحاسبة في وضع الدرجات.', 'Calcula con la calculadora en grados.'),
    ],
  },
  vectors: {
    cours: [
      t('Un vecteur a une direction, un sens et une longueur.', 'A vector has a direction, a sense and a length.', 'للمتجهة اتجاه ومنحى وطول.', 'Un vector tiene dirección, sentido y longitud.'),
      t('AB→(xB − xA ; yB − yA) et AB = √((xB − xA)² + (yB − yA)²).', 'AB→(xB − xA, yB − yA) and AB = √((xB − xA)² + (yB − yA)²).', 'AB→(xB − xA ; yB − yA) و AB = √((xB − xA)² + (yB − yA)²).', 'AB→(xB − xA ; yB − yA) y AB = √((xB − xA)² + (yB − yA)²).'),
      t('La translation de vecteur u→ fait glisser chaque point de u→.', 'The translation by u→ slides every point by u→.', 'الإزاحة ذات المتجهة u→ تنقل كل نقطة بالمتجهة u→.', 'La traslación de vector u→ desliza cada punto según u→.'),
    ],
    methode: [
      t('Écris les coordonnées des points sous la formule.', 'Write the point coordinates under the formula.', 'اكتب إحداثيات النقط تحت الصيغة.', 'Escribe las coordenadas de los puntos bajo la fórmula.'),
      t('Calcule toujours « arrivée − départ ».', 'Always do “end − start”.', 'احسب دائمًا «الوصول − الانطلاق».', 'Calcula siempre «llegada − salida».'),
      t('Pour le milieu, fais la moyenne des x et la moyenne des y.', 'For the midpoint, average the x values and the y values.', 'للمنتصف، احسب معدل الأفاصيل ومعدل الأراتيب.', 'Para el punto medio, promedia las x y las y.'),
    ],
  },
  probability: {
    cours: [
      t('Une probabilité est un nombre entre 0 et 1.', 'A probability is a number between 0 and 1.', 'الاحتمال عدد بين 0 و 1.', 'Una probabilidad es un número entre 0 y 1.'),
      t('Issues équiprobables : P(A) = issues favorables ÷ issues possibles.', 'Equally likely outcomes: P(A) = favourable ÷ possible outcomes.', 'إمكانيات متساوية الاحتمال: P(A) = الإمكانيات الملائمة ÷ جميع الإمكانيات.', 'Casos equiprobables: P(A) = casos favorables ÷ casos posibles.'),
      t('P(non A) = 1 − P(A).', 'P(not A) = 1 − P(A).', 'P(Ā) = 1 − P(A).', 'P(no A) = 1 − P(A).'),
    ],
    methode: [
      t('Liste toutes les issues possibles (un arbre aide pour deux épreuves).', 'List every possible outcome (a tree helps for two stages).', 'اكتب كل الإمكانيات (الشجرة تساعد في تجربتين).', 'Enumera todos los resultados posibles (un árbol ayuda con dos pruebas).'),
      t('Compte les issues qui réalisent l’événement.', 'Count the outcomes in the event.', 'عُدّ الإمكانيات التي تحقق الحدث.', 'Cuenta los resultados que cumplen el suceso.'),
      t('Divise, puis vérifie que le résultat est entre 0 et 1.', 'Divide, then check the result is between 0 and 1.', 'اقسم ثم تحقّق أن النتيجة بين 0 و 1.', 'Divide y comprueba que el resultado está entre 0 y 1.'),
    ],
  },
  solids: {
    cours: [
      t('Prisme et cylindre : V = aire de la base × hauteur.', 'Prism and cylinder: V = base area × height.', 'الموشور والأسطوانة: V = مساحة القاعدة × الارتفاع.', 'Prisma y cilindro: V = área de la base × altura.'),
      t('Pyramide et cône : V = aire de la base × hauteur ÷ 3.', 'Pyramid and cone: V = base area × height ÷ 3.', 'الهرم والمخروط: V = مساحة القاعدة × الارتفاع ÷ 3.', 'Pirámide y cono: V = área de la base × altura ÷ 3.'),
      t('Agrandir de rapport k : longueurs × k, aires × k², volumes × k³.', 'Enlarging by k: lengths × k, areas × k², volumes × k³.', 'التكبير بنسبة k: الأطوال × k والمساحات × k² والحجوم × k³.', 'Ampliar con razón k: longitudes × k, áreas × k², volúmenes × k³.'),
    ],
    methode: [
      t('Reconnais le solide et repère sa base et sa hauteur.', 'Recognise the solid and find its base and height.', 'تعرّف على المجسم وحدّد قاعدته وارتفاعه.', 'Reconoce el sólido y localiza su base y su altura.'),
      t('Calcule d’abord l’aire de la base.', 'Work out the base area first.', 'احسب مساحة القاعدة أولًا.', 'Calcula primero el área de la base.'),
      t('Applique la formule du volume et écris l’unité en cm³.', 'Use the volume formula and write the unit in cm³.', 'طبّق صيغة الحجم واكتب الوحدة cm³.', 'Aplica la fórmula del volumen y escribe la unidad en cm³.'),
    ],
  },
  limits: {
    cours: [
      t('lim 1/x = 0 en ±∞, et 1/x tend vers +∞ quand x → 0⁺.', 'lim 1/x = 0 at ±∞, and 1/x tends to +∞ as x → 0⁺.', 'نهاية 1/x هي 0 عند ±∞، و 1/x تؤول إلى +∞ عندما x → 0⁺.', 'lím 1/x = 0 en ±∞, y 1/x tiende a +∞ cuando x → 0⁺.'),
      t('En ±∞, un polynôme ou une fraction rationnelle se comporte comme ses termes de plus haut degré.', 'At ±∞, a polynomial or rational function behaves like its highest-degree terms.', 'عند ±∞ تتصرف الحدودية أو الدالة الجذرية مثل حدودها ذات أعلى درجة.', 'En ±∞, un polinomio o una fracción racional se comporta como sus términos de mayor grado.'),
      t('Valeurs intermédiaires : f continue sur [a ; b] prend toutes les valeurs entre f(a) et f(b).', 'Intermediate values: f continuous on [a, b] takes every value between f(a) and f(b).', 'القيم الوسيطية: f المتصلة على [a ; b] تأخذ كل القيم بين f(a) و f(b).', 'Valores intermedios: f continua en [a ; b] toma todos los valores entre f(a) y f(b).'),
    ],
    methode: [
      t('Essaie de remplacer directement : pas de forme indéterminée ? C’est fini.', 'Try plugging in directly: no indeterminate form? You are done.', 'جرّب التعويض مباشرة: إذا لم تظهر شكل غير محدد فقد انتهيت.', 'Prueba a sustituir: ¿no hay indeterminación? Ya está.'),
      t('Forme ∞/∞ ou ∞ − ∞ : factorise par le terme de plus haut degré.', '∞/∞ or ∞ − ∞: factor out the highest-degree term.', 'شكل ∞/∞ أو ∞ − ∞: عمّل بالحد ذي أعلى درجة.', '∞/∞ o ∞ − ∞: saca factor común el término de mayor grado.'),
      t('Utilise les limites de référence pour conclure.', 'Use the standard limits to conclude.', 'استعمل النهايات المرجعية للاستنتاج.', 'Usa los límites de referencia para concluir.'),
    ],
  },
  logarithm: {
    cours: [
      t('ln est définie sur ]0 ; +∞[ : y = ln x ⇔ x = eʸ.', 'ln is defined on (0, +∞): y = ln x ⇔ x = eʸ.', 'ln معرفة على ]0 ; +∞[: y = ln x ⇔ x = eʸ.', 'ln está definida en ]0 ; +∞[: y = ln x ⇔ x = eʸ.'),
      t('ln(ab) = ln a + ln b, ln(a/b) = ln a − ln b, ln(aⁿ) = n ln a.', 'ln(ab) = ln a + ln b, ln(a/b) = ln a − ln b, ln(aⁿ) = n ln a.', 'ln(ab) = ln a + ln b و ln(a/b) = ln a − ln b و ln(aⁿ) = n ln a.', 'ln(ab) = ln a + ln b, ln(a/b) = ln a − ln b, ln(aⁿ) = n ln a.'),
      t('ln 1 = 0, ln e = 1, (ln x)′ = 1/x.', 'ln 1 = 0, ln e = 1, (ln x)′ = 1/x.', 'ln 1 = 0 و ln e = 1 و (ln x)′ = 1/x.', 'ln 1 = 0, ln e = 1, (ln x)′ = 1/x.'),
    ],
    methode: [
      t('Vérifie d’abord que ce qui est dans ln est strictement positif.', 'First check that what is inside ln is strictly positive.', 'تحقّق أولًا أن ما داخل ln موجب قطعًا.', 'Comprueba primero que lo que hay dentro de ln es estrictamente positivo.'),
      t('Regroupe les ln avec les propriétés, pour n’en avoir qu’un.', 'Combine the logs with the rules so only one is left.', 'جمّع اللوغاريتمات بالخاصيات للحصول على لوغاريتم واحد.', 'Agrupa los ln con las propiedades hasta tener uno solo.'),
      t('Passe à l’exponentielle : ln x = a ⇔ x = eᵃ.', 'Switch to the exponential: ln x = a ⇔ x = eᵃ.', 'انتقل إلى الأسية: ln x = a ⇔ x = eᵃ.', 'Pasa a la exponencial: ln x = a ⇔ x = eᵃ.'),
    ],
  },
  integrals: {
    cours: [
      t('F est une primitive de f si F′ = f ; deux primitives diffèrent d’une constante.', 'F is an antiderivative of f if F′ = f; two antiderivatives differ by a constant.', 'F دالة أصلية لـ f إذا كان F′ = f، والدالتان الأصليتان تختلفان بثابت.', 'F es una primitiva de f si F′ = f; dos primitivas difieren en una constante.'),
      t('∫ₐᵇ f(x) dx = F(b) − F(a).', '∫ₐᵇ f(x) dx = F(b) − F(a).', '∫ₐᵇ f(x) dx = F(b) − F(a).', '∫ₐᵇ f(x) dx = F(b) − F(a).'),
      t('Si f ≥ 0, l’intégrale est l’aire sous la courbe entre a et b.', 'If f ≥ 0, the integral is the area under the curve from a to b.', 'إذا كانت f ≥ 0 فالتكامل هو المساحة تحت المنحنى بين a و b.', 'Si f ≥ 0, la integral es el área bajo la curva entre a y b.'),
    ],
    methode: [
      t('Trouve une primitive F de f avec le tableau des primitives.', 'Find an antiderivative F of f using the table.', 'أوجد دالة أصلية F لـ f باستعمال جدول الدوال الأصلية.', 'Halla una primitiva F de f con la tabla de primitivas.'),
      t('Vérifie en dérivant F : tu dois retrouver f.', 'Check by differentiating F: you should get f.', 'تحقّق باشتقاق F: يجب أن تحصل على f.', 'Comprueba derivando F: debes obtener f.'),
      t('Calcule F(b) − F(a).', 'Work out F(b) − F(a).', 'احسب F(b) − F(a).', 'Calcula F(b) − F(a).'),
    ],
  },
  'differential-equations': {
    cours: [
      t('Les solutions de y′ = ay sont y = Ceᵃˣ (C réel).', 'The solutions of y′ = ay are y = Ceᵃˣ (C real).', 'حلول y′ = ay هي y = Ceᵃˣ (C عدد حقيقي).', 'Las soluciones de y′ = ay son y = Ceᵃˣ (C real).'),
      t('Pour y′ = ay + b : y = Ceᵃˣ − b/a.', 'For y′ = ay + b: y = Ceᵃˣ − b/a.', 'بالنسبة لـ y′ = ay + b: y = Ceᵃˣ − b/a.', 'Para y′ = ay + b: y = Ceᵃˣ − b/a.'),
      t('Pour y″ + ω²y = 0 : y = A cos(ωx) + B sin(ωx).', 'For y″ + ω²y = 0: y = A cos(ωx) + B sin(ωx).', 'بالنسبة لـ y″ + ω²y = 0: y = A cos(ωx) + B sin(ωx).', 'Para y″ + ω²y = 0: y = A cos(ωx) + B sen(ωx).'),
    ],
    methode: [
      t('Mets l’équation sous la forme y′ = ay + b (ou y″ + ω²y = 0).', 'Rewrite the equation as y′ = ay + b (or y″ + ω²y = 0).', 'اكتب المعادلة على شكل y′ = ay + b (أو y″ + ω²y = 0).', 'Escribe la ecuación como y′ = ay + b (o y″ + ω²y = 0).'),
      t('Écris la solution générale avec sa constante.', 'Write the general solution with its constant.', 'اكتب الحل العام بثابته.', 'Escribe la solución general con su constante.'),
      t('Utilise la condition initiale pour trouver la constante.', 'Use the initial condition to find the constant.', 'استعمل الشرط البدئي لإيجاد الثابت.', 'Usa la condición inicial para hallar la constante.'),
    ],
  },
  'complex-numbers': {
    cours: [
      t('z = a + ib, avec i² = −1 ; a est la partie réelle, b la partie imaginaire.', 'z = a + ib with i² = −1; a is the real part, b the imaginary part.', 'z = a + ib حيث i² = −1؛ a هو الجزء الحقيقي و b الجزء التخيلي.', 'z = a + ib con i² = −1; a es la parte real y b la imaginaria.'),
      t('Conjugué : z̄ = a − ib. Module : |z| = √(a² + b²).', 'Conjugate: z̄ = a − ib. Modulus: |z| = √(a² + b²).', 'المرافق: z̄ = a − ib. المعيار: |z| = √(a² + b²).', 'Conjugado: z̄ = a − ib. Módulo: |z| = √(a² + b²).'),
      t('Forme exponentielle : z = r e^(iθ), avec r = |z| et θ un argument.', 'Exponential form: z = r e^(iθ), with r = |z| and θ an argument.', 'الشكل الأسي: z = r e^(iθ) حيث r = |z| و θ عمدة.', 'Forma exponencial: z = r e^(iθ), con r = |z| y θ un argumento.'),
    ],
    methode: [
      t('Calcule comme avec des expressions, en remplaçant i² par −1.', 'Calculate as with algebra, replacing i² with −1.', 'احسب كما في التعابير الجبرية مع تعويض i² بـ −1.', 'Calcula como con expresiones, sustituyendo i² por −1.'),
      t('Regroupe partie réelle et partie imaginaire.', 'Group the real part and the imaginary part.', 'جمّع الجزء الحقيقي والجزء التخيلي.', 'Agrupa la parte real y la imaginaria.'),
      t('Pour un quotient, multiplie en haut et en bas par le conjugué du dénominateur.', 'For a quotient, multiply top and bottom by the conjugate of the denominator.', 'للخارج، اضرب البسط والمقام في مرافق المقام.', 'Para un cociente, multiplica arriba y abajo por el conjugado del denominador.'),
    ],
  },
  counting: {
    cours: [
      t('Principe multiplicatif : n choix puis m choix donnent n × m possibilités.', 'Multiplication principle: n choices then m choices give n × m possibilities.', 'المبدأ الضربي: n اختيارًا ثم m اختيارًا تعطي n × m إمكانية.', 'Principio multiplicativo: n opciones y luego m dan n × m posibilidades.'),
      t('Ranger n objets : n! = n × (n − 1) × … × 1.', 'Arranging n objects: n! = n × (n − 1) × … × 1.', 'ترتيب n شيئًا: n! = n × (n − 1) × … × 1.', 'Ordenar n objetos: n! = n × (n − 1) × … × 1.'),
      t('Choisir k parmi n sans ordre : C(n ; k) = n! / (k! (n − k)!).', 'Choosing k from n, order not mattering: C(n, k) = n! / (k! (n − k)!).', 'اختيار k من بين n دون ترتيب: C(n ; k) = n! / (k! (n − k)!).', 'Elegir k entre n sin orden: C(n ; k) = n! / (k! (n − k)!).'),
    ],
    methode: [
      t('Demande-toi : l’ordre compte-t-il ? Les répétitions sont-elles permises ?', 'Ask yourself: does order matter? Are repeats allowed?', 'اسأل نفسك: هل الترتيب مهم؟ هل التكرار مسموح؟', 'Pregúntate: ¿importa el orden? ¿Se permiten repeticiones?'),
      t('Choisis : nᵏ (ordre et répétitions), n! (rangement), C(n ; k) (sans ordre).', 'Pick: nᵏ (order and repeats), n! (arrangement), C(n, k) (no order).', 'اختر: nᵏ (ترتيب وتكرار) أو n! (ترتيب) أو C(n ; k) (بدون ترتيب).', 'Elige: nᵏ (orden y repetición), n! (ordenación), C(n ; k) (sin orden).'),
      t('Calcule en simplifiant les factorielles avant de multiplier.', 'Simplify the factorials before multiplying.', 'اختزل العامليات قبل الضرب.', 'Simplifica los factoriales antes de multiplicar.'),
    ],
  },
  'probability-laws': {
    cours: [
      t('Espérance : E(X) = Σ xᵢ pᵢ, la valeur moyenne à long terme.', 'Expected value: E(X) = Σ xᵢ pᵢ, the long-run average.', 'الأمل الرياضي: E(X) = Σ xᵢ pᵢ، أي القيمة المتوسطة على المدى الطويل.', 'Esperanza: E(X) = Σ xᵢ pᵢ, el valor medio a largo plazo.'),
      t('Loi binomiale B(n ; p) : n épreuves identiques et indépendantes, E(X) = np, V(X) = np(1 − p).', 'Binomial B(n, p): n identical independent trials, E(X) = np, V(X) = np(1 − p).', 'القانون الحداني B(n ; p): n تجربة متماثلة ومستقلة، E(X) = np و V(X) = np(1 − p).', 'Binomial B(n ; p): n pruebas idénticas e independientes, E(X) = np, V(X) = np(1 − p).'),
      t('Probabilité conditionnelle : P(B | A) = P(A ∩ B) ÷ P(A).', 'Conditional probability: P(B | A) = P(A ∩ B) ÷ P(A).', 'الاحتمال الشرطي: P(B | A) = P(A ∩ B) ÷ P(A).', 'Probabilidad condicionada: P(B | A) = P(A ∩ B) ÷ P(A).'),
    ],
    methode: [
      t('Identifie la loi : épreuves répétées et indépendantes ? Pense binomiale.', 'Identify the distribution: repeated independent trials? Think binomial.', 'حدّد القانون: تجارب متكررة ومستقلة؟ فكّر في القانون الحداني.', 'Identifica la ley: ¿pruebas repetidas e independientes? Piensa en la binomial.'),
      t('Donne n et p, ou dresse le tableau de la loi.', 'State n and p, or draw up the distribution table.', 'حدّد n و p أو أنشئ جدول القانون.', 'Indica n y p, o construye la tabla de la ley.'),
      t('Applique la formule et vérifie que les probabilités sont entre 0 et 1.', 'Apply the formula and check probabilities are between 0 and 1.', 'طبّق الصيغة وتحقّق أن الاحتمالات بين 0 و 1.', 'Aplica la fórmula y comprueba que las probabilidades están entre 0 y 1.'),
    ],
  },
  'space-geometry': {
    cours: [
      t('Dans un repère orthonormé : u→ · v→ = xx′ + yy′ + zz′.', 'In an orthonormal frame: u→ · v→ = xx′ + yy′ + zz′.', 'في معلم متعامد ممنظم: u→ · v→ = xx′ + yy′ + zz′.', 'En una referencia ortonormal: u→ · v→ = xx′ + yy′ + zz′.'),
      t('u→ et v→ sont orthogonaux si et seulement si u→ · v→ = 0.', 'u→ and v→ are orthogonal exactly when u→ · v→ = 0.', 'u→ و v→ متعامدتان إذا وفقط إذا كان u→ · v→ = 0.', 'u→ y v→ son ortogonales si y solo si u→ · v→ = 0.'),
      t('Le plan ax + by + cz + d = 0 a pour vecteur normal n→(a ; b ; c).', 'The plane ax + by + cz + d = 0 has normal vector n→(a, b, c).', 'المستوى ax + by + cz + d = 0 له المتجهة المنظمية n→(a ; b ; c).', 'El plano ax + by + cz + d = 0 tiene vector normal n→(a ; b ; c).'),
    ],
    methode: [
      t('Écris les coordonnées des vecteurs utiles.', 'Write the coordinates of the vectors you need.', 'اكتب إحداثيات المتجهات اللازمة.', 'Escribe las coordenadas de los vectores útiles.'),
      t('Utilise le produit scalaire pour l’orthogonalité et les angles.', 'Use the dot product for orthogonality and angles.', 'استعمل الجداء السلمي للتعامد والزوايا.', 'Usa el producto escalar para la ortogonalidad y los ángulos.'),
      t('Pour un point dans un plan, remplace ses coordonnées dans l’équation.', 'To test a point in a plane, put its coordinates into the equation.', 'لمعرفة انتماء نقطة إلى مستوى، عوّض إحداثياتها في المعادلة.', 'Para un punto en un plano, sustituye sus coordenadas en la ecuación.'),
    ],
  },
  'trig-functions': {
    cours: [
      t('cos et sin sont définies sur ℝ, à valeurs dans [−1 ; 1], de période 2π.', 'cos and sin are defined on ℝ, take values in [−1, 1], and repeat every 2π.', 'cos و sin معرفتان على ℝ، قيمهما في [−1 ; 1]، ودورهما 2π.', 'cos y sen están definidas en ℝ, toman valores en [−1 ; 1] y tienen periodo 2π.'),
      t('(sin x)′ = cos x et (cos x)′ = −sin x.', '(sin x)′ = cos x and (cos x)′ = −sin x.', '(sin x)′ = cos x و (cos x)′ = −sin x.', '(sen x)′ = cos x y (cos x)′ = −sen x.'),
      t('Valeurs à connaître : cos 0 = 1, sin(π/6) = 1/2, cos(π/3) = 1/2, cos π = −1.', 'Values to know: cos 0 = 1, sin(π/6) = 1/2, cos(π/3) = 1/2, cos π = −1.', 'قيم يجب معرفتها: cos 0 = 1 و sin(π/6) = 1/2 و cos(π/3) = 1/2 و cos π = −1.', 'Valores que conocer: cos 0 = 1, sen(π/6) = 1/2, cos(π/3) = 1/2, cos π = −1.'),
    ],
    methode: [
      t('Place l’angle sur le cercle trigonométrique.', 'Place the angle on the unit circle.', 'ضع الزاوية على الدائرة المثلثية.', 'Sitúa el ángulo en la circunferencia goniométrica.'),
      t('Lis cos sur l’axe horizontal et sin sur l’axe vertical.', 'Read cos on the horizontal axis and sin on the vertical axis.', 'اقرأ cos على المحور الأفقي و sin على المحور العمودي.', 'Lee el cos en el eje horizontal y el sen en el vertical.'),
      t('Pour dériver, applique les formules et la règle des fonctions composées.', 'To differentiate, use the formulas and the chain rule.', 'للاشتقاق، طبّق الصيغ وقاعدة الدوال المركبة.', 'Para derivar, aplica las fórmulas y la regla de la cadena.'),
    ],
  },
  congruences: {
    cours: [
      t('a ≡ b [n] : a et b ont le même reste dans la division par n.', 'a ≡ b (mod n): a and b leave the same remainder when divided by n.', 'a ≡ b [n]: للعددين a و b نفس الباقي في القسمة على n.', 'a ≡ b [n]: a y b tienen el mismo resto al dividir por n.'),
      t('On peut additionner, multiplier et élever à une puissance des congruences.', 'Congruences can be added, multiplied and raised to powers.', 'يمكن جمع الموافقات وضربها ورفعها إلى قوة.', 'Las congruencias se pueden sumar, multiplicar y elevar a potencias.'),
      t('Bézout : a et b sont premiers entre eux si et seulement s’il existe u, v avec au + bv = 1.', 'Bézout: a and b are coprime exactly when au + bv = 1 for some integers u, v.', 'بوزو: a و b أوليان فيما بينهما إذا وفقط إذا وجد u و v بحيث au + bv = 1.', 'Bézout: a y b son primos entre sí si y solo si existen u, v con au + bv = 1.'),
    ],
    methode: [
      t('Remplace le nombre par un reste simple (souvent 1 ou −1).', 'Replace the number by a simple remainder (often 1 or −1).', 'عوّض العدد بباقٍ بسيط (غالبًا 1 أو −1).', 'Sustituye el número por un resto sencillo (a menudo 1 o −1).'),
      t('Élève à la puissance avec les règles des congruences.', 'Raise to the power using the congruence rules.', 'ارفع إلى القوة باستعمال قواعد الموافقات.', 'Eleva a la potencia con las reglas de las congruencias.'),
      t('Donne le reste final entre 0 et n − 1.', 'Give the final remainder between 0 and n − 1.', 'أعطِ الباقي النهائي بين 0 و n − 1.', 'Da el resto final entre 0 y n − 1.'),
    ],
  },
  'algebraic-structures': {
    cours: [
      t('Une loi * sur E associe à deux éléments de E un élément de E.', 'An operation * on E combines two elements of E into an element of E.', 'قانون التركيب الداخلي * في E يربط كل عنصرين من E بعنصر من E.', 'Una ley * en E asocia a dos elementos de E un elemento de E.'),
      t('Élément neutre e : a * e = e * a = a pour tout a.', 'Identity e: a * e = e * a = a for every a.', 'العنصر المحايد e: a * e = e * a = a لكل a.', 'Elemento neutro e: a * e = e * a = a para todo a.'),
      t('Groupe : loi associative, élément neutre, et un symétrique pour chaque élément.', 'Group: associative operation, identity element, and an inverse for every element.', 'الزمرة: قانون تجميعي وعنصر محايد ومماثل لكل عنصر.', 'Grupo: ley asociativa, elemento neutro y un simétrico para cada elemento.'),
    ],
    methode: [
      t('Écris la définition demandée avec la loi de l’énoncé.', 'Write the required definition using the given operation.', 'اكتب التعريف المطلوب باستعمال قانون النص.', 'Escribe la definición pedida con la ley del enunciado.'),
      t('Résous l’équation obtenue (par exemple a * e = a).', 'Solve the resulting equation (for example a * e = a).', 'حل المعادلة المحصل عليها (مثلًا a * e = a).', 'Resuelve la ecuación obtenida (por ejemplo a * e = a).'),
      t('Vérifie que le résultat appartient bien à l’ensemble E.', 'Check the result really belongs to E.', 'تحقّق أن النتيجة تنتمي فعلًا إلى المجموعة E.', 'Comprueba que el resultado pertenece al conjunto E.'),
    ],
  },
  regression: {
    cours: [
      t('Un nuage de points représente deux variables mesurées ensemble.', 'A scatter plot shows two variables measured together.', 'سحابة النقط تمثل متغيرين مقيسين معًا.', 'Una nube de puntos representa dos variables medidas a la vez.'),
      t('Le point moyen G(x̄ ; ȳ) est sur la droite d’ajustement.', 'The mean point G(x̄, ȳ) lies on the line of best fit.', 'النقطة المتوسطة G(x̄ ; ȳ) تنتمي إلى مستقيم التعديل.', 'El punto medio G(x̄ ; ȳ) está en la recta de ajuste.'),
      t('La droite y = ax + b sert à estimer des valeurs.', 'The line y = ax + b is used to estimate values.', 'المستقيم y = ax + b يستعمل لتقدير القيم.', 'La recta y = ax + b sirve para estimar valores.'),
    ],
    methode: [
      t('Calcule x̄ et ȳ.', 'Work out x̄ and ȳ.', 'احسب x̄ و ȳ.', 'Calcula x̄ e ȳ.'),
      t('Écris la droite qui passe par G avec la pente donnée : ȳ = a x̄ + b.', 'Write the line through G with the given slope: ȳ = a x̄ + b.', 'اكتب المستقيم المار من G بالميل المعطى: ȳ = a x̄ + b.', 'Escribe la recta que pasa por G con la pendiente dada: ȳ = a x̄ + b.'),
      t('Remplace x par la valeur voulue pour estimer y.', 'Put in the x value you want to estimate y.', 'عوّض x بالقيمة المطلوبة لتقدير y.', 'Sustituye x por el valor deseado para estimar y.'),
    ],
  },
};
