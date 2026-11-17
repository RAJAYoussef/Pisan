// Parcours de compétences dédié aux fractions.
// Générateurs purs et déterministes : une graine produit toujours la même activité.
import { seeded } from './exercises';
import { t, type Activity, type Skill } from './skill-kit';

const pick = <T,>(rng: () => number, values: readonly T[]): T => values[Math.floor(rng() * values.length)]!;

type FractionMeta = {
  prerequisites: string[];
  microSkills: string[];
  misconceptions: { code: string; description: string }[];
};

export const FRACTION_SKILL_META: Record<string, FractionMeta> = {
  'frac-meaning': {
    prerequisites: [],
    microSkills: ['identify-whole', 'identify-equal-parts', 'read-numerator', 'read-denominator'],
    misconceptions: [
      { code: 'fraction-denominator-counts-shaded-parts', description: 'Confond le nombre de parts coloriées et le nombre total de parts égales.' },
      { code: 'fraction-unequal-parts', description: 'Accepte une partition en parts de tailles différentes.' },
    ],
  },
  'frac-equivalent': {
    prerequisites: ['frac-meaning'],
    microSkills: ['scale-numerator', 'scale-denominator', 'preserve-ratio'],
    misconceptions: [
      { code: 'fraction-add-same-number', description: 'Ajoute le même nombre au numérateur et au dénominateur.' },
      { code: 'fraction-scale-one-term', description: 'Multiplie le numérateur sans multiplier le dénominateur, ou inversement.' },
    ],
  },
  'frac-simplify': {
    prerequisites: ['frac-meaning', 'frac-equivalent'],
    microSkills: ['find-common-divisor', 'divide-both-terms', 'recognise-irreducible'],
    misconceptions: [
      { code: 'fraction-simplify-one-term', description: 'Ne divise qu’un seul des deux termes.' },
      { code: 'fraction-simplify-subtract', description: 'Soustrait le même nombre au numérateur et au dénominateur.' },
    ],
  },
  'frac-compare': {
    prerequisites: ['frac-meaning', 'frac-equivalent'],
    microSkills: ['compare-same-denominator', 'compare-same-numerator', 'compare-to-unit'],
    misconceptions: [
      { code: 'fraction-larger-denominator-larger-value', description: 'Pense qu’un plus grand dénominateur donne toujours une plus grande fraction.' },
      { code: 'fraction-compare-numerators-only', description: 'Compare uniquement les numérateurs.' },
    ],
  },
  'frac-add-subtract': {
    prerequisites: ['frac-meaning', 'frac-equivalent'],
    microSkills: ['find-common-denominator', 'convert-fractions', 'add-subtract-numerators', 'simplify-result'],
    misconceptions: [
      { code: 'fraction-add-denominators', description: 'Additionne ou soustrait aussi les dénominateurs.' },
      { code: 'fraction-add-without-equivalence', description: 'Additionne les numérateurs sans rendre les dénominateurs identiques.' },
    ],
  },
  'frac-multiply-divide': {
    prerequisites: ['frac-meaning', 'frac-simplify'],
    microSkills: ['multiply-numerators', 'multiply-denominators', 'invert-divisor', 'simplify-product'],
    misconceptions: [
      { code: 'fraction-multiply-crosswise', description: 'Effectue un produit en croix à la place du produit terme à terme.' },
      { code: 'fraction-divide-by-multiplying', description: 'Multiplie par le diviseur au lieu de multiplier par son inverse.' },
    ],
  },
  'frac-problem': {
    prerequisites: ['frac-meaning', 'frac-add-subtract', 'frac-multiply-divide'],
    microSkills: ['identify-whole-and-part', 'translate-context', 'choose-operation', 'check-plausibility'],
    misconceptions: [
      { code: 'fraction-wrong-whole', description: 'Ne repère pas correctement le tout de référence.' },
      { code: 'fraction-operation-from-keyword', description: 'Choisit une opération à partir d’un mot isolé sans modéliser la situation.' },
    ],
  },
};

function meaning(seed: number): Activity {
  const rng = seeded(seed);
  const n = pick(rng, [2, 3, 4, 5, 6, 8]);
  const p = pick(rng, Array.from({ length: n - 1 }, (_, i) => i + 1));
  const options = [
    t(`${p} parts prises sur ${n} parts égales`, `${p} parts taken out of ${n} equal parts`, `${p} أجزاء مأخوذة من أصل ${n} أجزاء متساوية`, `${p} partes tomadas de ${n} partes iguales`),
    t(`${n} parts prises sur ${p} parts égales`, `${n} parts taken out of ${p} equal parts`, `${n} أجزاء مأخوذة من أصل ${p} أجزاء متساوية`, `${n} partes tomadas de ${p} partes iguales`),
    t(`${p} parts prises sur ${n + p} parts égales`, `${p} parts taken out of ${n + p} equal parts`, `${p} أجزاء مأخوذة من أصل ${n + p} أجزاء متساوية`, `${p} partes tomadas de ${n + p} partes iguales`),
  ];
  const secondN = pick(rng, [3, 4, 5, 6, 8, 10]);
  const secondP = pick(rng, Array.from({ length: secondN }, (_, i) => i));
  return {
    title: t('Comprendre une fraction', 'Understanding a fraction', 'فهم الكسر', 'Comprender una fracción'),
    summary: `${p}/${n} : numérateur = parts prises ; dénominateur = parts égales du tout`,
    steps: [
      { type: 'choice', options, answer: 0, prompt: t(`Que signifie la fraction ${p}/${n} ?`, `What does the fraction ${p}/${n} mean?`, `ماذا يعني الكسر ${p}/${n}؟`, `¿Qué significa la fracción ${p}/${n}?`), hint: t('Le dénominateur indique en combien de parts égales le tout est partagé. Le numérateur indique combien de parts sont prises.', 'The denominator tells how many equal parts make the whole. The numerator tells how many parts are taken.', 'المقام يبيّن عدد الأجزاء المتساوية في الكل، والبسط يبيّن عدد الأجزاء المأخوذة.', 'El denominador indica en cuántas partes iguales se divide el todo. El numerador indica cuántas partes se toman.') },
      { type: 'choice', options: [t('le numérateur', 'the numerator', 'البسط', 'el numerador'), t('le dénominateur', 'the denominator', 'المقام', 'el denominador'), t('les deux', 'both', 'كلاهما', 'ambos')], answer: 1, prompt: t(`Dans ${secondP}/${secondN}, quel nombre indique le nombre total de parts égales ?`, `In ${secondP}/${secondN}, which number tells the total number of equal parts?`, `في ${secondP}/${secondN}، أي عدد يبيّن العدد الكلي للأجزاء المتساوية؟`, `En ${secondP}/${secondN}, ¿qué número indica el total de partes iguales?`), hint: t('C’est le nombre écrit sous la barre de fraction.', 'It is the number below the fraction bar.', 'هو العدد المكتوب تحت خط الكسر.', 'Es el número escrito debajo de la barra de fracción.') },
    ],
  };
}

function equivalent(seed: number): Activity {
  const rng = seeded(seed);
  const d = pick(rng, [2, 3, 4, 5, 6, 8]);
  const n = pick(rng, Array.from({ length: d - 1 }, (_, i) => i + 1));
  const k = pick(rng, [2, 3, 4]);
  const m = pick(rng, [2, 3, 4]);
  return {
    title: t('Reconnaître des fractions équivalentes', 'Recognising equivalent fractions', 'التعرف على الكسور المتكافئة', 'Reconocer fracciones equivalentes'),
    summary: `n/d = (n × k)/(d × k)`,
    steps: [
      { type: 'number', answer: n * k, tolerance: 0, prompt: t(`Complète : ${n}/${d} = ?/${d * k}. Quel numérateur manque ?`, `Complete: ${n}/${d} = ?/${d * k}. Which numerator is missing?`, `أكمل: ${n}/${d} = ?/${d * k}. ما البسط الناقص؟`, `Completa: ${n}/${d} = ?/${d * k}. ¿Qué numerador falta?`), hint: t(`Le dénominateur a été multiplié par ${k}. Fais la même chose au numérateur.`, `The denominator was multiplied by ${k}. Do the same to the numerator.`, `ضُرب المقام في ${k}. افعل الشيء نفسه للبسط.`, `El denominador se multiplicó por ${k}. Haz lo mismo con el numerador.`) },
      { type: 'number', answer: d * m, tolerance: 0, prompt: t(`Complète : ${n * m}/? = ${n}/${d}. Quel dénominateur manque ?`, `Complete: ${n * m}/? = ${n}/${d}. Which denominator is missing?`, `أكمل: ${n * m}/? = ${n}/${d}. ما المقام الناقص؟`, `Completa: ${n * m}/? = ${n}/${d}. ¿Qué denominador falta?`), hint: t(`Le numérateur a été multiplié par ${m}. Multiplie aussi le dénominateur par ${m}.`, `The numerator was multiplied by ${m}. Multiply the denominator by ${m} too.`, `ضُرب البسط في ${m}. اضرب المقام أيضًا في ${m}.`, `El numerador se multiplicó por ${m}. Multiplica también el denominador por ${m}.`) },
    ],
  };
}

function simplify(seed: number): Activity {
  const rng = seeded(seed);
  const base = pick(rng, [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [3, 7]] as const);
  const k = pick(rng, [2, 3, 4, 5]);
  const [n, d] = base;
  const options = [`${n}/${d}`, `${n * k}/${d}`, `${n}/${d * k}`, `${n * k}/${d * k}`];
  const shuffled = options.map(value => ({ value, key: rng() })).sort((a, b) => a.key - b.key).map(x => x.value);
  return {
    title: t('Simplifier une fraction', 'Simplifying a fraction', 'اختزال كسر', 'Simplificar una fracción'),
    summary: `Diviser le numérateur et le dénominateur par un même diviseur non nul.`,
    steps: [
      { type: 'choice', options: shuffled.map(x => t(x, x, x, x)), answer: shuffled.indexOf(`${n}/${d}`), prompt: t(`Quelle est la forme irréductible de ${n * k}/${d * k} ?`, `What is the simplest form of ${n * k}/${d * k}?`, `ما الصورة غير القابلة للاختزال للكسر ${n * k}/${d * k}؟`, `¿Cuál es la forma irreducible de ${n * k}/${d * k}?`), hint: t('Cherche un diviseur commun au numérateur et au dénominateur, puis divise les deux par ce même nombre.', 'Find a common divisor of numerator and denominator, then divide both by it.', 'ابحث عن قاسم مشترك للبسط والمقام، ثم اقسمهما عليه.', 'Busca un divisor común del numerador y del denominador y divide ambos por él.') },
      { type: 'choice', options: [t('la valeur ne change pas', 'the value stays the same', 'القيمة لا تتغير', 'el valor no cambia'), t('la valeur est divisée par deux', 'the value is halved', 'القيمة تنقسم على اثنين', 'el valor se divide por dos'), t('la valeur augmente', 'the value increases', 'القيمة تزداد', 'el valor aumenta')], answer: 0, prompt: t('Pourquoi peut-on simplifier une fraction en divisant ses deux termes par le même nombre non nul ?', 'Why can we simplify a fraction by dividing both terms by the same non-zero number?', 'لماذا يمكن اختزال كسر بقسمة البسط والمقام على العدد نفسه غير المنعدم؟', '¿Por qué podemos simplificar una fracción dividiendo sus dos términos por el mismo número no nulo?'), hint: t('Diviser le numérateur et le dénominateur par le même nombre revient à multiplier par 1.', 'Dividing numerator and denominator by the same number is equivalent to multiplying by 1.', 'قسمة البسط والمقام على العدد نفسه تعادل الضرب في 1.', 'Dividir el numerador y el denominador por el mismo número equivale a multiplicar por 1.') },
    ],
  };
}

function compare(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [[1, 2, 2, 3], [2, 5, 3, 5], [3, 4, 5, 8], [2, 3, 3, 4], [3, 7, 2, 5]] as const);
  const [n1, d1, n2, d2] = a;
  const left = n1 / d1, right = n2 / d2;
  const answer = left > right ? 0 : left < right ? 1 : 2;
  return {
    title: t('Comparer des fractions', 'Comparing fractions', 'مقارنة الكسور', 'Comparar fracciones'),
    summary: 'Comparer des fractions en utilisant une représentation, un dénominateur commun ou un repère.',
    steps: [
      { type: 'choice', options: [t(`${n1}/${d1} > ${n2}/${d2}`, `${n1}/${d1} > ${n2}/${d2}`, `${n1}/${d1} > ${n2}/${d2}`, `${n1}/${d1} > ${n2}/${d2}`), t(`${n1}/${d1} < ${n2}/${d2}`, `${n1}/${d1} < ${n2}/${d2}`, `${n1}/${d1} < ${n2}/${d2}`, `${n1}/${d1} < ${n2}/${d2}`), t(`${n1}/${d1} = ${n2}/${d2}`, `${n1}/${d1} = ${n2}/${d2}`, `${n1}/${d1} = ${n2}/${d2}`, `${n1}/${d1} = ${n2}/${d2}`)], answer, prompt: t('Compare les deux fractions.', 'Compare the two fractions.', 'قارن الكسرين.', 'Compara las dos fracciones.'), hint: t('Tu peux les écrire avec un même dénominateur, ou les situer par rapport à 1/2 et à 1.', 'You can rewrite them with a common denominator, or compare them with 1/2 and 1.', 'يمكنك توحيد المقامين أو مقارنتهما بالنسبة إلى 1/2 و1.', 'Puedes expresarlas con un denominador común o compararlas con 1/2 y 1.') },
      { type: 'choice', options: [t('Le plus grand dénominateur donne toujours la plus grande fraction.', 'The larger denominator always gives the larger fraction.', 'المقام الأكبر يعطي دائمًا الكسر الأكبر.', 'El denominador mayor siempre da la fracción mayor.'), t('Il faut tenir compte du numérateur et du dénominateur.', 'You must consider both numerator and denominator.', 'يجب مراعاة البسط والمقام معًا.', 'Hay que tener en cuenta el numerador y el denominador.')], answer: 1, prompt: t('Quelle affirmation est correcte ?', 'Which statement is correct?', 'أي العبارتين صحيحة؟', '¿Qué afirmación es correcta?'), hint: t('Le dénominateur seul ne suffit pas pour comparer deux fractions.', 'The denominator alone is not enough to compare two fractions.', 'المقام وحده لا يكفي لمقارنة كسرين.', 'El denominador por sí solo no basta para comparar dos fracciones.') },
    ],
  };
}

function addSubtract(seed: number): Activity {
  const rng = seeded(seed);
  const d = pick(rng, [4, 5, 6, 8, 10, 12]);
  const a = pick(rng, Array.from({ length: d - 1 }, (_, i) => i + 1));
  const b = pick(rng, Array.from({ length: d - a }, (_, i) => i + 1));
  const sum = a + b;
  const d2 = pick(rng, [2, 3, 4, 5]);
  const x = pick(rng, [1, 2, 3].filter(v => v < d2));
  const y = pick(rng, [1, 2, 3].filter(v => v <= x && v < d2));
  return {
    title: t('Additionner et soustraire des fractions', 'Adding and subtracting fractions', 'جمع وطرح الكسور', 'Sumar y restar fracciones'),
    summary: 'Rendre les dénominateurs identiques avant d’additionner ou de soustraire les numérateurs.',
    steps: [
      { type: 'number', answer: sum, tolerance: 0, prompt: t(`Calcule le numérateur : ${a}/${d} + ${b}/${d} = ?/${d}.`, `Find the numerator: ${a}/${d} + ${b}/${d} = ?/${d}.`, `احسب البسط: ${a}/${d} + ${b}/${d} = ?/${d}.`, `Calcula el numerador: ${a}/${d} + ${b}/${d} = ?/${d}.`), hint: t('Les dénominateurs sont identiques : additionne les numérateurs et conserve le dénominateur.', 'The denominators are the same: add the numerators and keep the denominator.', 'المقامات متساوية: اجمع البسطين واحتفظ بالمقام.', 'Los denominadores son iguales: suma los numeradores y conserva el denominador.') },
      { type: 'number', answer: x - y, tolerance: 0, prompt: t(`Calcule le numérateur : ${x}/${d2} - ${y}/${d2} = ?/${d2}.`, `Find the numerator: ${x}/${d2} - ${y}/${d2} = ?/${d2}.`, `احسب البسط: ${x}/${d2} - ${y}/${d2} = ?/${d2}.`, `Calcula el numerador: ${x}/${d2} - ${y}/${d2} = ?/${d2}.`), hint: t('Les dénominateurs sont identiques : soustrais les numérateurs et conserve le dénominateur.', 'The denominators are the same: subtract the numerators and keep the denominator.', 'المقامات متساوية: اطرح البسطين واحتفظ بالمقام.', 'Los denominadores son iguales: resta los numeradores y conserva el denominador.') },
    ],
  };
}

function multiplyDivide(seed: number): Activity {
  const rng = seeded(seed);
  const a = pick(rng, [[1, 2, 2, 3], [2, 3, 3, 4], [3, 5, 5, 6], [1, 4, 2, 5]] as const);
  const [n1, d1, n2, d2] = a;
  const [u, v] = pick(rng, [[2, 3], [3, 4], [4, 5]] as const);
  return {
    title: t('Multiplier et diviser des fractions', 'Multiplying and dividing fractions', 'ضرب وقسمة الكسور', 'Multiplicar y dividir fracciones'),
    summary: 'Multiplier terme à terme ; diviser par une fraction revient à multiplier par son inverse.',
    steps: [
      { type: 'number', answer: (n1 * n2) / (d1 * d2), tolerance: 0.00000051, prompt: t(`Calcule ${n1}/${d1} × ${n2}/${d2}. Donne une fraction ou un décimal.`, `Calculate ${n1}/${d1} × ${n2}/${d2}. Give a fraction or decimal.`, `احسب ${n1}/${d1} × ${n2}/${d2}. أعط كسرًا أو عددًا عشريًا.`, `Calcula ${n1}/${d1} × ${n2}/${d2}. Da una fracción o un decimal.`), hint: t('Multiplie les numérateurs entre eux et les dénominateurs entre eux.', 'Multiply the numerators together and the denominators together.', 'اضرب البسطين معًا والمقامين معًا.', 'Multiplica los numeradores entre sí y los denominadores entre sí.') },
      { type: 'number', answer: (n1 / d1) / (u / v), tolerance: 1e-9, prompt: t(`Calcule ${n1}/${d1} ÷ ${u}/${v}. Donne une fraction ou un décimal.`, `Calculate ${n1}/${d1} ÷ ${u}/${v}. Give a fraction or decimal.`, `احسب ${n1}/${d1} ÷ ${u}/${v}. أعط كسرًا أو عددًا عشريًا.`, `Calcula ${n1}/${d1} ÷ ${u}/${v}. Da una fracción o un decimal.`), hint: t(`Remplace la division par une multiplication par l’inverse : ${n1}/${d1} × ${v}/${u}.`, `Replace division with multiplication by the reciprocal: ${n1}/${d1} × ${v}/${u}.`, `عوّض القسمة بضرب في المقلوب: ${n1}/${d1} × ${v}/${u}.`, `Sustituye la división por una multiplicación por el inverso: ${n1}/${d1} × ${v}/${u}.`) },
    ],
  };
}

function problem(seed: number): Activity {
  const rng = seeded(seed);
  const total = pick(rng, [24, 30, 36, 40, 48, 60]);
  const [n, d] = pick(rng, [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5]] as const);
  const answer = total * n / d;
  return {
    title: t('Résoudre un problème avec des fractions', 'Solving a fraction problem', 'حل مسألة باستعمال الكسور', 'Resolver un problema con fracciones'),
    summary: 'Identifier le tout, la fraction utilisée et l’opération adaptée.',
    steps: [
      { type: 'number', answer, tolerance: 0, prompt: t(`Une réserve contient ${total} litres d’eau. On utilise ${n}/${d} de cette réserve. Combien de litres utilise-t-on ?`, `A tank contains ${total} litres of water. We use ${n}/${d} of it. How many litres are used?`, `يحتوي خزان على ${total} لترًا من الماء. استُعمل ${n}/${d} من الكمية. كم لترًا استُعمل؟`, `Un depósito contiene ${total} litros de agua. Se utiliza ${n}/${d} de esa reserva. ¿Cuántos litros se utilizan?`), hint: t(`Calcule ${total} × ${n}/${d}.`, `Calculate ${total} × ${n}/${d}.`, `احسب ${total} × ${n}/${d}.`, `Calcula ${total} × ${n}/${d}.`) },
      { type: 'choice', options: [t('une partie de la réserve', 'a part of the tank', 'جزء من الخزان', 'una parte del depósito'), t('la réserve entière', 'the whole tank', 'الخزان كله', 'todo el depósito'), t('une quantité sans lien avec la réserve', 'an unrelated quantity', 'كمية لا علاقة لها بالخزان', 'una cantidad sin relación con el depósito')], answer: 0, prompt: t('Que représente le résultat ?', 'What does the result represent?', 'ماذا تمثل النتيجة؟', '¿Qué representa el resultado?'), hint: t('La fraction indique une partie du tout de référence.', 'The fraction describes part of the reference whole.', 'الكسر يصف جزءًا من الكل المرجعي.', 'La fracción representa una parte del total de referencia.') },
    ],
  };
}

export const FRACTION_SKILLS: Skill[] = [
  { id: 'frac-meaning', chapter: 'fractions', build: meaning, review: 0, title: t('Sens d’une fraction', 'Meaning of a fraction', 'معنى الكسر', 'Significado de una fracción'), desc: t('Identifier le tout, les parts égales, le numérateur et le dénominateur.', 'Identify the whole, equal parts, numerator and denominator.', 'تحديد الكل والأجزاء المتساوية والبسط والمقام.', 'Identificar el todo, las partes iguales, el numerador y el denominador.') },
  { id: 'frac-equivalent', chapter: 'fractions', build: equivalent, review: 0, title: t('Fractions équivalentes', 'Equivalent fractions', 'الكسور المتكافئة', 'Fracciones equivalentes'), desc: t('Produire une fraction équivalente en multipliant les deux termes.', 'Generate an equivalent fraction by multiplying both terms.', 'إنشاء كسر مكافئ بضرب البسط والمقام.', 'Obtener una fracción equivalente multiplicando ambos términos.') },
  { id: 'frac-simplify', chapter: 'fractions', build: simplify, review: 0, title: t('Simplifier une fraction', 'Simplifying a fraction', 'اختزال كسر', 'Simplificar una fracción'), desc: t('Diviser le numérateur et le dénominateur par un diviseur commun.', 'Divide numerator and denominator by a common divisor.', 'قسمة البسط والمقام على قاسم مشترك.', 'Dividir el numerador y el denominador por un divisor común.') },
  { id: 'frac-compare', chapter: 'fractions', build: compare, review: 0, title: t('Comparer des fractions', 'Comparing fractions', 'مقارنة الكسور', 'Comparar fracciones'), desc: t('Comparer avec un dénominateur commun ou des repères.', 'Compare using a common denominator or benchmarks.', 'المقارنة باستعمال مقام مشترك أو مراجع.', 'Comparar usando un denominador común o referencias.') },
  { id: 'frac-add-subtract', chapter: 'fractions', build: addSubtract, review: 0, title: t('Addition et soustraction', 'Addition and subtraction', 'الجمع والطرح', 'Suma y resta'), desc: t('Additionner ou soustraire après avoir rendu les dénominateurs identiques.', 'Add or subtract after making denominators equal.', 'جمع الكسور أو طرحها بعد توحيد المقامات.', 'Sumar o restar tras igualar los denominadores.') },
  { id: 'frac-multiply-divide', chapter: 'fractions', build: multiplyDivide, review: 0, title: t('Multiplication et division', 'Multiplication and division', 'الضرب والقسمة', 'Multiplicación y división'), desc: t('Multiplier terme à terme et diviser en utilisant l’inverse.', 'Multiply term by term and divide using the reciprocal.', 'الضرب حدًا بحد والقسمة باستعمال المقلوب.', 'Multiplicar término a término y dividir usando el inverso.') },
  { id: 'frac-problem', chapter: 'fractions', build: problem, review: 0, title: t('Problèmes', 'Word problems', 'مسائل', 'Problemas'), desc: t('Modéliser une situation et vérifier la vraisemblance du résultat.', 'Model a situation and check whether the result is plausible.', 'نمذجة وضعية والتحقق من معقولية النتيجة.', 'Modelizar una situación y comprobar si el resultado es razonable.') },
];
