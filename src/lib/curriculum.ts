import type { Lang } from "./i18n";
import { EXTRA_NOTIONS } from "./notions-extra";

export type L = Record<Lang, string>;
export const t4 = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
export const same = (s: string | number): L => t4(String(s), String(s), String(s), String(s));

// ---------- Countries & grades ----------
// `level` normalises every school system onto 0 (age ~11) → 6 (age ~17-18, final year).

export type Grade = { label: L; level: number };
export type Country = { id: string; flag: string; name: L; program: L; grades: Grade[] };

const g = (label: string, level: number, ar?: string): Grade => ({
  label: t4(label, label, ar ?? label, label),
  level,
});

const frenchGrades = [
  g("6ème", 0, "السادسة"),
  g("5ème", 1, "الخامسة"),
  g("4ème", 2, "الرابعة"),
  g("3ème", 3, "الثالثة"),
  g("2nde", 4, "الثانية"),
  g("1ère", 5, "الأولى"),
  g("Terminale", 6, "النهائي"),
];

export const COUNTRIES: Country[] = [
  {
    id: "ma",
    flag: "🇲🇦",
    name: t4("Maroc", "Morocco", "المغرب", "Marruecos"),
    program: t4(
      "Programme officiel du Ministère de l'Éducation Nationale",
      "Official Ministry of National Education curriculum",
      "المنهاج الرسمي لوزارة التربية الوطنية",
      "Programa oficial del Ministerio de Educación Nacional",
    ),
    grades: [
      g("1ère année collège", 1, "الأولى إعدادي"),
      g("2ème année collège", 2, "الثانية إعدادي"),
      g("3ème année collège", 3, "الثالثة إعدادي"),
      g("Tronc commun", 4, "الجذع المشترك"),
      g("1ère Bac", 5, "الأولى باكالوريا"),
      g("2ème Bac", 6, "الثانية باكالوريا"),
    ],
  },
  {
    id: "fr",
    flag: "🇫🇷",
    name: t4("France", "France", "فرنسا", "Francia"),
    program: t4(
      "Programmes de l'Éducation nationale",
      "French National Education curriculum",
      "برامج التربية الوطنية الفرنسية",
      "Programas de la Educación nacional francesa",
    ),
    grades: frenchGrades,
  },
  {
    id: "ca",
    flag: "🇨🇦",
    name: t4("Canada / Québec", "Canada / Québec", "كندا / كيبيك", "Canadá / Quebec"),
    program: t4(
      "Programme de formation de l'école québécoise (PFEQ)",
      "Québec Education Program (QEP)",
      "برنامج التكوين للمدرسة الكيبيكية",
      "Programa de formación de la escuela quebequense",
    ),
    grades: [
      g("6e année", 0),
      g("Secondaire 1", 1),
      g("Secondaire 2", 2),
      g("Secondaire 3", 3),
      g("Secondaire 4", 4),
      g("Secondaire 5", 5),
      g("Cégep 1", 6),
    ],
  },
  {
    id: "us",
    flag: "🇺🇸",
    name: t4("États-Unis", "United States", "الولايات المتحدة", "Estados Unidos"),
    program: t4(
      "Common Core State Standards",
      "Common Core State Standards",
      "معايير Common Core",
      "Common Core State Standards",
    ),
    grades: [6, 7, 8, 9, 10, 11, 12].map((n, i) => g(`Grade ${n}`, i, `الصف ${n}`)),
  },
  {
    id: "uk",
    flag: "🇬🇧",
    name: t4("Royaume-Uni", "United Kingdom", "المملكة المتحدة", "Reino Unido"),
    program: t4(
      "National Curriculum (Angleterre)",
      "National Curriculum (England)",
      "المنهج الوطني (إنجلترا)",
      "National Curriculum (Inglaterra)",
    ),
    grades: [7, 8, 9, 10, 11, 12, 13].map((n, i) => g(`Year ${n}`, i, `السنة ${n}`)),
  },
  {
    id: "be",
    flag: "🇧🇪",
    name: t4("Belgique", "Belgium", "بلجيكا", "Bélgica"),
    program: t4(
      "Référentiels de la Fédération Wallonie-Bruxelles",
      "Wallonia-Brussels Federation standards",
      "مرجعيات فيدرالية والونيا-بروكسل",
      "Referenciales de la Federación Valonia-Bruselas",
    ),
    grades: [
      g("6e primaire", 0),
      g("1re secondaire", 1),
      g("2e secondaire", 2),
      g("3e secondaire", 3),
      g("4e secondaire", 4),
      g("5e secondaire", 5),
      g("6e secondaire", 6),
    ],
  },
  {
    id: "ch",
    flag: "🇨🇭",
    name: t4("Suisse", "Switzerland", "سويسرا", "Suiza"),
    program: t4(
      "Plan d'études romand (PER)",
      "Plan d'études romand (PER)",
      "مخطط الدراسات الروماندي",
      "Plan de estudios romando (PER)",
    ),
    grades: [
      g("8H", 0),
      g("9H", 1),
      g("10H", 2),
      g("11H", 3),
      g("1re gymnase", 4),
      g("2e gymnase", 5),
      g("3e gymnase", 6),
    ],
  },
  {
    id: "sn",
    flag: "🇸🇳",
    name: t4("Sénégal", "Senegal", "السنغال", "Senegal"),
    program: t4(
      "Programmes officiels du Ministère de l'Éducation nationale",
      "Official Ministry of National Education curriculum",
      "البرامج الرسمية لوزارة التربية الوطنية",
      "Programas oficiales del Ministerio de Educación",
    ),
    grades: frenchGrades,
  },
  {
    id: "ci",
    flag: "🇨🇮",
    name: t4("Côte d'Ivoire", "Côte d'Ivoire", "ساحل العاج", "Costa de Marfil"),
    program: t4(
      "Programmes éducatifs nationaux",
      "National education curriculum",
      "البرامج التعليمية الوطنية",
      "Programas educativos nacionales",
    ),
    grades: frenchGrades,
  },
  {
    id: "ib",
    flag: "🌍",
    name: t4("International / IB", "International / IB", "دولي / البكالوريا الدولية", "Internacional / IB"),
    program: t4(
      "Baccalauréat International (PEI / Diplôme)",
      "International Baccalaureate (MYP / DP)",
      "البكالوريا الدولية",
      "Bachillerato Internacional (PAI / Diploma)",
    ),
    grades: [
      g("MYP 1", 0),
      g("MYP 2", 1),
      g("MYP 3", 2),
      g("MYP 4", 3),
      g("MYP 5", 4),
      g("DP 1", 5),
      g("DP 2", 6),
    ],
  },
];
/** Les pays dans l'ordre alphabétique de leur nom, dans la langue affichée. */
export const countriesByName = (lang: string): Country[] => [...COUNTRIES].sort((a, b) => (a.name[lang as keyof L] ?? a.name.fr).localeCompare(b.name[lang as keyof L] ?? b.name.fr, lang));


export function getCountry(id: string): Country {
  return (COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0])!;
}

export function getLevel(countryId: string, gradeIndex: number): number {
  const c = getCountry(countryId);
  return (c.grades[gradeIndex] ?? c.grades[0])!.level;
}

// ---------- Notions (chapters) ----------

export type NotionId =
  | "integers"
  | "fractions"
  | "proportion"
  | "powers"
  | "algebra"
  | "equations"
  | "functions"
  | "quadratics"
  | "derivatives"
  | "sequences"
  | "exponential"
  // Ajoutées pour les programmes de 6e, 3e et Terminale (src/lib/notions-extra.ts)
  | "decimals"
  | "geometry"
  | "symmetry"
  | "areas"
  | "statistics"
  | "square-roots"
  | "arithmetic"
  | "inequalities"
  | "systems"
  | "pythagoras-thales"
  | "trigonometry"
  | "vectors"
  | "probability"
  | "solids"
  | "limits"
  | "logarithm"
  | "integrals"
  | "differential-equations"
  | "complex-numbers"
  | "counting"
  | "probability-laws"
  | "space-geometry"
  | "trig-functions"
  | "congruences"
  | "algebraic-structures"
  | "regression";

export type PromptKind = "compute" | "solve" | "simplify" | "expand" | "derive" | "value";

export type Question = {
  prompt: PromptKind | L;
  expr: string;
  options: string[];
  answer: number;
  /** QCM obligatoire : plusieurs réponses justes existent (« lequel est premier ? », une primitive…). */
  choiceOnly?: boolean;
};

export type Notion = {
  id: NotionId;
  minLevel: number;
  prereq: NotionId | null;
  name: L;
  emoji: string;
  lesson: L;
  example: string;
  questions: Question[];
};

const BASE_NOTIONS: Notion[] = [
  {
    id: "integers",
    minLevel: 0,
    prereq: null,
    emoji: "➕",
    name: t4("Nombres relatifs", "Negative numbers", "الأعداد النسبية", "Números enteros"),
    lesson: t4(
      "Imagine un thermomètre : ajouter, c'est monter ; soustraire, c'est descendre. Deux signes identiques donnent + quand on multiplie, deux signes différents donnent −.",
      "Picture a thermometer: adding moves up, subtracting moves down. When multiplying, same signs give +, different signs give −.",
      "تخيّل ميزان حرارة: الجمع صعود والطرح نزول. عند الضرب، إشارتان متشابهتان تعطيان + وإشارتان مختلفتان تعطيان −.",
      "Imagina un termómetro: sumar es subir, restar es bajar. Al multiplicar, signos iguales dan + y signos distintos dan −.",
    ),
    example: "−7 + 4 = −3   ·   (−3) × (−5) = 15",
    questions: [
      { prompt: "compute", expr: "−7 + 4", options: ["−3", "3", "−11", "11"], answer: 0 },
      { prompt: "compute", expr: "(−3) × (−5)", options: ["−15", "15", "−8", "8"], answer: 1 },
      { prompt: "compute", expr: "−2 − 6", options: ["4", "−4", "−8", "8"], answer: 2 },
    ],
  },
  {
    id: "fractions",
    minLevel: 0,
    prereq: "integers",
    emoji: "🍕",
    name: t4("Fractions", "Fractions", "الكسور", "Fracciones"),
    lesson: t4(
      "Une fraction, c'est une barre coupée en parts égales. Pour additionner, il faut des parts de même taille : on met les fractions au même dénominateur.",
      "A fraction is a bar cut into equal parts. To add, parts must be the same size: give the fractions a common denominator.",
      "الكسر هو شريط مقسّم إلى أجزاء متساوية. للجمع، يجب أن تكون الأجزاء بنفس الحجم: نوحّد المقامات.",
      "Una fracción es una barra cortada en partes iguales. Para sumar, las partes deben ser del mismo tamaño: usa un denominador común.",
    ),
    example: "1/2 + 1/4 = 2/4 + 1/4 = 3/4",
    questions: [
      { prompt: "compute", expr: "1/2 + 1/4", options: ["2/6", "3/4", "1/6", "2/4"], answer: 1 },
      { prompt: "compute", expr: "2/3 × 9", options: ["6", "18/27", "3", "11/3"], answer: 0 },
      { prompt: "compute", expr: "3/5 − 1/5", options: ["2/0", "4/5", "2/5", "2/10"], answer: 2 },
    ],
  },
  {
    id: "proportion",
    minLevel: 1,
    prereq: "fractions",
    emoji: "⚖️",
    name: t4("Proportionnalité & pourcentages", "Ratios & percentages", "التناسبية والنسب المئوية", "Proporcionalidad y porcentajes"),
    lesson: t4(
      "25 %, c'est 25 parts sur 100, donc un quart. Pour trouver un pourcentage, découpe la quantité en parts égales puis prends le bon nombre de parts.",
      "25% means 25 parts out of 100 — a quarter. To find a percentage, split the amount into equal parts and take the right number of parts.",
      "25% تعني 25 جزءًا من 100، أي الربع. لإيجاد نسبة مئوية، قسّم الكمية إلى أجزاء متساوية وخذ العدد المناسب منها.",
      "25 % son 25 partes de 100, es decir, un cuarto. Para hallar un porcentaje, divide la cantidad en partes iguales y toma las necesarias.",
    ),
    example: "25 % × 80 = 80 ÷ 4 = 20",
    questions: [
      {
        prompt: t4("Combien font 25 % de 80 ?", "What is 25% of 80?", "كم يساوي 25% من 80؟", "¿Cuánto es el 25 % de 80?"),
        expr: "25 % × 80",
        options: ["25", "20", "40", "16"],
        answer: 1,
      },
      {
        prompt: t4(
          "3 cahiers coûtent 6 €. Combien coûtent 5 cahiers ?",
          "3 notebooks cost €6. How much do 5 notebooks cost?",
          "3 دفاتر ثمنها 6 €. كم ثمن 5 دفاتر؟",
          "3 cuadernos cuestan 6 €. ¿Cuánto cuestan 5?",
        ),
        expr: "3 → 6 €   ·   5 → ?",
        options: ["10 €", "8 €", "11 €", "15 €"],
        answer: 0,
      },
    ],
  },
  {
    id: "powers",
    minLevel: 2,
    prereq: "integers",
    emoji: "⚡",
    name: t4("Puissances", "Powers", "القوى", "Potencias"),
    lesson: t4(
      "2³ veut dire 2 × 2 × 2. Quand on multiplie des puissances du même nombre, on additionne les exposants : on compte simplement tous les facteurs.",
      "2³ means 2 × 2 × 2. Multiplying powers of the same base adds the exponents — you're just counting all the factors.",
      "2³ تعني 2 × 2 × 2. عند ضرب قوى لنفس العدد نجمع الأسس: نعدّ كل العوامل ببساطة.",
      "2³ significa 2 × 2 × 2. Al multiplicar potencias de la misma base se suman los exponentes: solo cuentas todos los factores.",
    ),
    example: "2³ × 2² = 2⁵ = 32",
    questions: [
      { prompt: "simplify", expr: "2³ × 2²", options: ["2⁶", "2⁵", "4⁵", "4⁶"], answer: 1 },
      { prompt: "compute", expr: "10⁻²", options: ["−100", "1/10", "1/100", "−20"], answer: 2 },
      { prompt: "simplify", expr: "(3²)³", options: ["3⁶", "3⁵", "9⁵", "27"], answer: 0 },
    ],
  },
  {
    id: "algebra",
    minLevel: 2,
    prereq: "integers",
    emoji: "🧩",
    name: t4("Calcul littéral", "Algebraic expressions", "الحساب الحرفي", "Cálculo algebraico"),
    lesson: t4(
      "x est une boîte qui cache un nombre. 3(x + 4) veut dire « 3 fois la boîte et 3 fois 4 » : on distribue le 3 à chaque terme.",
      "x is a box hiding a number. 3(x + 4) means “3 boxes and 3 fours”: the 3 is shared out to each term.",
      "x صندوق يخفي عددًا. ‏3(x + 4) تعني «3 صناديق و3 مرات 4»: نوزّع 3 على كل حد.",
      "x es una caja que esconde un número. 3(x + 4) significa «3 cajas y 3 veces 4»: el 3 se reparte a cada término.",
    ),
    example: "3(x + 4) = 3x + 12",
    questions: [
      { prompt: "expand", expr: "3(x + 4)", options: ["3x + 4", "3x + 12", "x + 12", "7x"], answer: 1 },
      { prompt: "simplify", expr: "5x − 2x + 3", options: ["3x + 3", "6x", "3x − 3", "7x + 3"], answer: 0 },
      { prompt: "expand", expr: "(x + 2)(x − 2)", options: ["x² + 4", "2x", "x² − 4", "x² − 4x − 4"], answer: 2 },
    ],
  },
  {
    id: "equations",
    minLevel: 3,
    prereq: "algebra",
    emoji: "🎯",
    name: t4("Équations", "Equations", "المعادلات", "Ecuaciones"),
    lesson: t4(
      "Une équation est une balance en équilibre. Ce que tu fais d'un côté, fais-le de l'autre pour isoler x.",
      "An equation is a balanced scale. Whatever you do to one side, do to the other until x is alone.",
      "المعادلة ميزان متوازن. ما تفعله في جهة افعله في الجهة الأخرى حتى تعزل x.",
      "Una ecuación es una balanza en equilibrio. Lo que hagas en un lado, hazlo en el otro hasta aislar x.",
    ),
    example: "2x + 5 = 13  →  2x = 8  →  x = 4",
    questions: [
      { prompt: "solve", expr: "2x + 5 = 13", options: ["x = 9", "x = 4", "x = 3", "x = 8"], answer: 1 },
      { prompt: "solve", expr: "3x − 7 = 2x + 1", options: ["x = 8", "x = −6", "x = 6", "x = 1"], answer: 0 },
      { prompt: "solve", expr: "x / 4 = 3", options: ["x = 3/4", "x = 7", "x = 12", "x = 4/3"], answer: 2 },
    ],
  },
  {
    id: "functions",
    minLevel: 3,
    prereq: "equations",
    emoji: "📈",
    name: t4("Fonctions", "Functions", "الدوال", "Funciones"),
    lesson: t4(
      "Une fonction est une machine : tu donnes x, elle rend f(x). Pour calculer f(3), remplace chaque x par 3.",
      "A function is a machine: you give it x, it returns f(x). To find f(3), replace every x with 3.",
      "الدالة آلة: تعطيها x فتعيد f(x). لحساب f(3) عوّض كل x بـ 3.",
      "Una función es una máquina: le das x y devuelve f(x). Para calcular f(3), sustituye cada x por 3.",
    ),
    example: "f(x) = 2x − 1  →  f(3) = 2×3 − 1 = 5",
    questions: [
      { prompt: "value", expr: "f(x) = 2x − 1   →   f(3)", options: ["6", "5", "7", "3"], answer: 1 },
      {
        prompt: t4(
          "Quel est le coefficient directeur ?",
          "What is the slope?",
          "ما هو المعامل الموجه؟",
          "¿Cuál es la pendiente?",
        ),
        expr: "y = −3x + 2",
        options: ["−3", "2", "3", "−2"],
        answer: 0,
      },
    ],
  },
  {
    id: "quadratics",
    minLevel: 5,
    prereq: "algebra",
    emoji: "🌉",
    name: t4("Second degré", "Quadratics", "الدرجة الثانية", "Ecuaciones de segundo grado"),
    lesson: t4(
      "Pour ax² + bx + c, le discriminant Δ = b² − 4ac dit combien il y a de solutions.",
      "For ax² + bx + c, the discriminant Δ = b² − 4ac tells you how many solutions there are.",
      "بالنسبة لـ ax² + bx + c، المميّز Δ = b² − 4ac يحدد عدد الحلول.",
      "Para ax² + bx + c, el discriminante Δ = b² − 4ac indica cuántas soluciones hay.",
    ),
    example: "x² − 4x + 3 : Δ = 16 − 12 = 4",
    questions: [
      { prompt: "solve", expr: "x² = 49", options: ["x = 7", "x = ±7", "x = 49", "x = −7"], answer: 1 },
      {
        prompt: t4("Calcule le discriminant Δ", "Find the discriminant Δ", "احسب المميّز Δ", "Calcula el discriminante Δ"),
        expr: "x² − 4x + 3",
        options: ["−8", "16", "4", "28"],
        answer: 2,
      },
    ],
  },
  {
    id: "derivatives",
    minLevel: 5,
    prereq: "functions",
    emoji: "🏔️",
    name: t4("Dérivation", "Derivatives", "الاشتقاق", "Derivadas"),
    lesson: t4(
      "La dérivée mesure la pente de la courbe. Pour xⁿ, on descend l'exposant devant et on enlève 1 : (xⁿ)' = n·xⁿ⁻¹.",
      "The derivative measures the slope of the curve. For xⁿ, bring the exponent down and subtract 1: (xⁿ)' = n·xⁿ⁻¹.",
      "المشتقة تقيس ميل المنحنى. بالنسبة لـ xⁿ ننزل الأس ونطرح 1: ‏(xⁿ)' = n·xⁿ⁻¹.",
      "La derivada mide la pendiente de la curva. Para xⁿ, baja el exponente y réstale 1: (xⁿ)' = n·xⁿ⁻¹.",
    ),
    example: "(x³)' = 3x²",
    questions: [
      { prompt: "derive", expr: "f(x) = x³", options: ["x²", "3x²", "3x³", "x⁴/4"], answer: 1 },
      { prompt: "derive", expr: "f(x) = 5x² − 2x", options: ["10x − 2", "5x − 2", "10x² − 2", "10x"], answer: 0 },
    ],
  },
  {
    id: "sequences",
    minLevel: 5,
    prereq: "powers",
    emoji: "🪜",
    name: t4("Suites", "Sequences", "المتتاليات", "Sucesiones"),
    lesson: t4(
      "Une suite arithmétique ajoute toujours la même raison r, une suite géométrique multiplie toujours par q.",
      "An arithmetic sequence always adds the same difference r; a geometric one always multiplies by q.",
      "المتتالية الحسابية تضيف دائمًا نفس الأساس r، والهندسية تضرب دائمًا في q.",
      "Una sucesión aritmética suma siempre la misma diferencia r; una geométrica multiplica siempre por q.",
    ),
    example: "u₀ = 3, r = 4 : 3, 7, 11, 15…",
    questions: [
      { prompt: "value", expr: "u₀ = 3, r = 4   →   u₅", options: ["20", "23", "27", "19"], answer: 1 },
      { prompt: "value", expr: "v₀ = 2, q = 3   →   v₃", options: ["54", "18", "162", "11"], answer: 0 },
    ],
  },
  {
    id: "exponential",
    minLevel: 6,
    prereq: "powers",
    emoji: "🚀",
    name: t4("Exponentielle & logarithme", "Exponential & logarithm", "الدالة الأسية واللوغاريتم", "Exponencial y logaritmo"),
    lesson: t4(
      "L'exponentielle suit les mêmes règles que les puissances : eᵃ × eᵇ = eᵃ⁺ᵇ. Le logarithme fait l'inverse.",
      "The exponential follows the same rules as powers: eᵃ × eᵇ = eᵃ⁺ᵇ. The logarithm undoes it.",
      "الدالة الأسية تتبع قواعد القوى: eᵃ × eᵇ = eᵃ⁺ᵇ. واللوغاريتم يعكسها.",
      "La exponencial sigue las reglas de las potencias: eᵃ × eᵇ = eᵃ⁺ᵇ. El logaritmo la deshace.",
    ),
    example: "e² × e³ = e⁵",
    questions: [
      { prompt: "simplify", expr: "e² × e³", options: ["e⁶", "e⁵", "2e⁵", "e"], answer: 1 },
      { prompt: "solve", expr: "ln(x) = 0", options: ["x = 1", "x = 0", "x = e", "x = −1"], answer: 0 },
    ],
  },
];

export const NOTIONS: Notion[] = [...BASE_NOTIONS, ...EXTRA_NOTIONS];
export const NOTION_IDS: NotionId[] = NOTIONS.map((n) => n.id);
export const isNotionId = (value: string): value is NotionId => (NOTION_IDS as string[]).includes(value);

/** Les nombres à virgule s'écrivent avec un point en anglais : 2,5 → 2.5 (jamais « 2 ; 5 »). */
export function localizeMath(text: string, lang: Lang): string {
  return lang === "en" ? text.replace(/(\d),(\d)/g, "$1.$2") : text;
}

export function getNotion(id: NotionId): Notion {
  return NOTIONS.find((n) => n.id === id)!;
}

/** Chapters of the student's programme: notions reachable at this level (most recent last). */
export function chaptersForLevel(level: number): Notion[] {
  return NOTIONS.filter((n) => n.minLevel <= level && n.minLevel >= level - 4);
}

/** The underlying prerequisite to repair when a notion is failed. */
export function lacunaFor(failed: NotionId): NotionId {
  return getNotion(failed).prereq ?? failed;
}
