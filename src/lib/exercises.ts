import { t4, same, type L, type NotionId } from "./curriculum";

// ---------- Singapore-method exercise model ----------

export type BarColor = 1 | 2 | 3 | 4;
export type BarSpec = { name: L; units: number; extra?: boolean; color: BarColor };
/** Slots where a value chip can be placed on the bar model. */
export type Slot = `unit:${number}` | `extra:${number}` | `total:${number}` | "all";
export type Requirement = { slots: Slot[]; chip: string };
export type Choice = { options: L[]; answer: number };

export type Exercise = {
  id: string;
  template: string;
  notion: NotionId;
  minLevel: number;
  title: L;
  story: L;
  question: L;
  verbal: { sentence: L; blanks: Choice[] };
  bars: BarSpec[];
  chips: string[];
  required: Requirement[];
  equations: string[];
  equationAnswer: number;
  answer: number;
  unit: L;
  hints: { verbal: L; model: L; equation: L; answer: L };
};

type Rng = () => number;
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pick = <T,>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)] as T;

function shuffled<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Builds a shuffled multiple-choice; first item is the correct one. */
function choice(rng: Rng, correct: L, ...wrong: L[]): Choice {
  const all = shuffled(rng, [correct, ...wrong]);
  return { options: all, answer: all.indexOf(correct) };
}

function equationChoice(rng: Rng, correct: string, wrong: string[]) {
  const all = shuffled(rng, [correct, ...wrong]);
  return { equations: all, equationAnswer: all.indexOf(correct) };
}

/** Deterministic PRNG so sample exercises stay stable between renders. */
export function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Params = {
  a?: number;
  b?: number;
  k?: number;
  x?: number;
  d?: number;
  den?: number;
  num?: number;
  u?: number;
  pct?: number;
};

type Template = {
  id: string;
  minLevel: number;
  build: (rng: Rng, p?: Params) => Exercise;
};

const TEMPLATES: Template[] = [
  {
    id: "multiple",
    minLevel: 0,
    build: (rng, p) => {
      const a = p?.a ?? int(rng, 6, 20);
      const k = p?.k ?? int(rng, 2, 4);
      const T = a * (k + 1);
      return {
        id: "",
        template: "multiple",
        notion: "equations",
        minLevel: 0,
        title: t4("Les billes", "The marbles", "الكُرات الزجاجية", "Las canicas"),
        story: t4(
          `Lina a ${k} fois plus de billes qu'Omar. Ensemble, ils ont ${T} billes.`,
          `Lina has ${k} times as many marbles as Omar. Together they have ${T} marbles.`,
          `لدى لينا ${k} أضعاف كرات عمر. معًا لديهما ${T} كرة.`,
          `Lina tiene ${k} veces más canicas que Omar. Juntos tienen ${T} canicas.`,
        ),
        question: t4(
          "Combien de billes a Omar ?",
          "How many marbles does Omar have?",
          "كم كرة لدى عمر؟",
          "¿Cuántas canicas tiene Omar?",
        ),
        verbal: {
          sentence: t4(
            "On cherche {0}. Ensemble, ils ont {1} billes.",
            "We are looking for {0}. Together they have {1} marbles.",
            "نبحث عن {0}. معًا لديهما {1} كرة.",
            "Buscamos {0}. Juntos tienen {1} canicas.",
          ),
          blanks: [
            choice(
              rng,
              t4("le nombre de billes d'Omar", "Omar's number of marbles", "عدد كرات عمر", "el número de canicas de Omar"),
              t4("le nombre de billes de Lina", "Lina's number of marbles", "عدد كرات لينا", "el número de canicas de Lina"),
              t4("le nombre total de billes", "the total number of marbles", "العدد الإجمالي للكرات", "el número total de canicas"),
            ),
            choice(rng, same(T), same(k), same(a + k)),
          ],
        },
        bars: [
          { name: t4("Omar", "Omar", "عمر", "Omar"), units: 1, color: 2 },
          { name: t4("Lina", "Lina", "لينا", "Lina"), units: k, color: 1 },
        ],
        chips: ["x", String(T), String(k)],
        required: [
          { slots: ["unit:0", "unit:1"], chip: "x" },
          { slots: ["all"], chip: String(T) },
        ],
        ...equationChoice(rng, `${k + 1}x = ${T}`, [`${k}x = ${T}`, `x + ${k} = ${T}`, `${T}x = ${k + 1}`]),
        answer: a,
        unit: t4("billes", "marbles", "كرة", "canicas"),
        hints: {
          verbal: t4(
            "Relis la question : de qui parle-t-on à la fin ?",
            "Read the question again: who is it asking about?",
            "أعد قراءة السؤال: عمّن يتحدث في النهاية؟",
            "Vuelve a leer la pregunta: ¿de quién habla al final?",
          ),
          model: t4(
            `Omar a 1 part, Lina en a ${k}. Coupe la barre de Lina en ${k} parts, mets x sur une part et ${T} sous les deux barres.`,
            `Omar has 1 part, Lina has ${k}. Split Lina's bar into ${k} parts, put x on one part and ${T} under both bars.`,
            `لعمر جزء واحد وللينا ${k}. قسّم شريط لينا إلى ${k} أجزاء، ضع x على جزء و${T} تحت الشريطين.`,
            `Omar tiene 1 parte, Lina ${k}. Divide la barra de Lina en ${k} partes, pon x en una parte y ${T} bajo las dos barras.`,
          ),
          equation: t4(
            `Compte toutes les parts égales : 1 + ${k} = ${k + 1} parts valent ${T}.`,
            `Count all the equal parts: 1 + ${k} = ${k + 1} parts make ${T}.`,
            `عُدّ كل الأجزاء المتساوية: 1 + ${k} = ${k + 1} أجزاء تساوي ${T}.`,
            `Cuenta todas las partes iguales: 1 + ${k} = ${k + 1} partes valen ${T}.`,
          ),
          answer: t4(
            `Partage ${T} en ${k + 1} parts égales.`,
            `Share ${T} into ${k + 1} equal parts.`,
            `قسّم ${T} إلى ${k + 1} أجزاء متساوية.`,
            `Reparte ${T} en ${k + 1} partes iguales.`,
          ),
        },
      };
    },
  },
  {
    id: "difference",
    minLevel: 1,
    build: (rng, p) => {
      const x = p?.x ?? int(rng, 10, 45);
      const d = p?.d ?? int(rng, 5, 20);
      const T = 2 * x + d;
      return {
        id: "",
        template: "difference",
        notion: "equations",
        minLevel: 1,
        title: t4("L'argent de poche", "Pocket money", "مصروف الجيب", "La paga"),
        story: t4(
          `Sami a ${d} € de plus que Yasmine. À eux deux, ils ont ${T} €.`,
          `Sami has €${d} more than Yasmine. Together they have €${T}.`,
          `لدى سامي ${d} € أكثر من ياسمين. معًا لديهما ${T} €.`,
          `Sami tiene ${d} € más que Yasmine. Entre los dos tienen ${T} €.`,
        ),
        question: t4("Combien a Yasmine ?", "How much does Yasmine have?", "كم لدى ياسمين؟", "¿Cuánto tiene Yasmine?"),
        verbal: {
          sentence: t4(
            "On cherche {0}. Sami a {1} € de plus qu'elle.",
            "We are looking for {0}. Sami has €{1} more than her.",
            "نبحث عن {0}. لدى سامي {1} € أكثر منها.",
            "Buscamos {0}. Sami tiene {1} € más que ella.",
          ),
          blanks: [
            choice(
              rng,
              t4("l'argent de Yasmine", "Yasmine's money", "مال ياسمين", "el dinero de Yasmine"),
              t4("l'argent de Sami", "Sami's money", "مال سامي", "el dinero de Sami"),
              t4("la différence", "the difference", "الفرق", "la diferencia"),
            ),
            choice(rng, same(d), same(T), same(T - d)),
          ],
        },
        bars: [
          { name: t4("Yasmine", "Yasmine", "ياسمين", "Yasmine"), units: 1, color: 3 },
          { name: t4("Sami", "Sami", "سامي", "Sami"), units: 1, extra: true, color: 4 },
        ],
        chips: ["x", String(d), String(T)],
        required: [
          { slots: ["unit:0", "unit:1"], chip: "x" },
          { slots: ["extra:1"], chip: String(d) },
          { slots: ["all"], chip: String(T) },
        ],
        ...equationChoice(rng, `2x + ${d} = ${T}`, [`x + ${d} = ${T}`, `2x = ${T} + ${d}`, `2x − ${d} = ${T}`]),
        answer: x,
        unit: t4("€", "€", "€", "€"),
        hints: {
          verbal: t4(
            "Qui a le moins ? C'est souvent l'inconnue x.",
            "Who has less? That's usually the unknown x.",
            "من لديه أقل؟ غالبًا هو المجهول x.",
            "¿Quién tiene menos? Suele ser la incógnita x.",
          ),
          model: t4(
            `Les deux barres ont la même part x. Sami a en plus un morceau de ${d} € : ajoute-le à sa barre.`,
            `Both bars share the same part x. Sami has an extra piece of €${d}: add it to his bar.`,
            `للشريطين نفس الجزء x. لسامي قطعة إضافية بقيمة ${d} €: أضفها إلى شريطه.`,
            `Ambas barras tienen la misma parte x. Sami tiene un trozo extra de ${d} €: añádelo a su barra.`,
          ),
          equation: t4(
            `Il y a 2 parts x et un morceau de ${d} : le tout fait ${T}.`,
            `There are 2 parts x plus a piece of ${d}: altogether ${T}.`,
            `هناك جزءان x وقطعة ${d}: المجموع ${T}.`,
            `Hay 2 partes x y un trozo de ${d}: en total ${T}.`,
          ),
          answer: t4(
            `Enlève d'abord ${d}, puis partage en 2.`,
            `First take away ${d}, then split in 2.`,
            `اطرح أولًا ${d} ثم اقسم على 2.`,
            `Primero quita ${d} y luego divide entre 2.`,
          ),
        },
      };
    },
  },
  {
    id: "fraction",
    minLevel: 0,
    build: (rng, p) => {
      const den: number = p?.den ?? pick(rng, [3, 4, 5]);
      const num = p?.num ?? (den === 3 ? 2 : den === 4 ? 3 : 2);
      const u = p?.u ?? int(rng, 8, 30);
      const P = den * u;
      return {
        id: "",
        template: "fraction",
        notion: "fractions",
        minLevel: 0,
        title: t4("Le livre de Nour", "Nour's book", "كتاب نور", "El libro de Nour"),
        story: t4(
          `Le livre de Nour a ${P} pages. Elle en a déjà lu les ${num}/${den}.`,
          `Nour's book has ${P} pages. She has already read ${num}/${den} of it.`,
          `كتاب نور فيه ${P} صفحة. قرأت منه ${num}/${den}.`,
          `El libro de Nour tiene ${P} páginas. Ya ha leído ${num}/${den}.`,
        ),
        question: t4(
          "Combien de pages a-t-elle lues ?",
          "How many pages has she read?",
          "كم صفحة قرأت؟",
          "¿Cuántas páginas ha leído?",
        ),
        verbal: {
          sentence: t4(
            "On coupe le livre en {0} parts égales et on cherche {1}.",
            "We cut the book into {0} equal parts and look for {1}.",
            "نقسم الكتاب إلى {0} أجزاء متساوية ونبحث عن {1}.",
            "Cortamos el libro en {0} partes iguales y buscamos {1}.",
          ),
          blanks: [
            choice(rng, same(den), same(num), same(P)),
            choice(
              rng,
              t4(`la valeur de ${num} parts`, `the value of ${num} parts`, `قيمة ${num} أجزاء`, `el valor de ${num} partes`),
              t4("le nombre total de pages", "the total number of pages", "العدد الإجمالي للصفحات", "el total de páginas"),
              t4("les pages restantes", "the pages left", "الصفحات المتبقية", "las páginas restantes"),
            ),
          ],
        },
        bars: [{ name: t4("Livre", "Book", "الكتاب", "Libro"), units: den, color: 3 }],
        chips: ["x", String(P), String(num)],
        required: [
          { slots: ["unit:0"], chip: "x" },
          { slots: ["total:0", "all"], chip: String(P) },
        ],
        ...equationChoice(rng, `${den}x = ${P}`, [`${num}x = ${P}`, `x = ${P} × ${num}`, `${den}x = ${num}`]),
        answer: num * u,
        unit: t4("pages", "pages", "صفحة", "páginas"),
        hints: {
          verbal: t4(
            `Le dénominateur (${den}) dit en combien de parts on coupe.`,
            `The denominator (${den}) tells how many parts to cut.`,
            `المقام (${den}) يحدد عدد الأجزاء.`,
            `El denominador (${den}) indica en cuántas partes cortar.`,
          ),
          model: t4(
            `Coupe la barre en ${den} parts, mets x sur une part et ${P} pour toute la barre.`,
            `Split the bar into ${den} parts, put x on one part and ${P} on the whole bar.`,
            `قسّم الشريط إلى ${den} أجزاء، ضع x على جزء و${P} للشريط كله.`,
            `Divide la barra en ${den} partes, pon x en una parte y ${P} en toda la barra.`,
          ),
          equation: t4(
            `${den} parts égales valent ${P}.`,
            `${den} equal parts make ${P}.`,
            `${den} أجزاء متساوية تساوي ${P}.`,
            `${den} partes iguales valen ${P}.`,
          ),
          answer: t4(
            `Trouve x = ${P} ÷ ${den}, puis prends-en ${num}.`,
            `Find x = ${P} ÷ ${den}, then take ${num} of them.`,
            `أوجد x = ${P} ÷ ${den} ثم خذ ${num} منها.`,
            `Halla x = ${P} ÷ ${den} y luego toma ${num}.`,
          ),
        },
      };
    },
  },
  {
    id: "percent",
    minLevel: 1,
    build: (rng, p) => {
      const pct: number = p?.pct ?? pick(rng, [25, 20, 10]);
      const n = 100 / pct;
      const u = p?.u ?? int(rng, 3, 15);
      const P = n * u;
      return {
        id: "",
        template: "percent",
        notion: "proportion",
        minLevel: 1,
        title: t4("Les soldes", "The sale", "التخفيضات", "Las rebajas"),
        story: t4(
          `Une veste coûte ${P} €. Elle est soldée à −${pct} %.`,
          `A jacket costs €${P}. It's on sale at ${pct}% off.`,
          `سعر سترة ${P} €. عليها تخفيض ${pct}%.`,
          `Una chaqueta cuesta ${P} €. Tiene un descuento del ${pct} %.`,
        ),
        question: t4("Combien vas-tu payer ?", "How much will you pay?", "كم ستدفع؟", "¿Cuánto vas a pagar?"),
        verbal: {
          sentence: t4(
            "On cherche {0}. La remise est de {1} % du prix.",
            "We are looking for {0}. The discount is {1}% of the price.",
            "نبحث عن {0}. التخفيض {1}% من السعر.",
            "Buscamos {0}. El descuento es el {1} % del precio.",
          ),
          blanks: [
            choice(
              rng,
              t4("le prix à payer", "the price to pay", "الثمن الذي سندفعه", "el precio a pagar"),
              t4("le montant de la remise", "the discount amount", "قيمة التخفيض", "el importe del descuento"),
              t4("le prix de départ", "the original price", "الثمن الأصلي", "el precio inicial"),
            ),
            choice(rng, same(pct), same(100 - pct), same(P)),
          ],
        },
        bars: [{ name: t4("Prix", "Price", "الثمن", "Precio"), units: n, color: 1 }],
        chips: ["x", String(P), String(pct)],
        required: [
          { slots: ["unit:0"], chip: "x" },
          { slots: ["total:0", "all"], chip: String(P) },
        ],
        ...equationChoice(rng, `${n}x = ${P}`, [`${pct}x = ${P}`, `x = ${P} − ${pct}`, `${P}x = ${n}`]),
        answer: P - u,
        unit: t4("€", "€", "€", "€"),
        hints: {
          verbal: t4(
            "La question parle de ce que tu paies, pas de ce que tu économises.",
            "The question is about what you pay, not what you save.",
            "السؤال عمّا تدفعه، لا عمّا توفّره.",
            "La pregunta es lo que pagas, no lo que ahorras.",
          ),
          model: t4(
            `${pct} %, c'est 1 part sur ${n}. Coupe le prix en ${n} parts égales.`,
            `${pct}% is 1 part out of ${n}. Split the price into ${n} equal parts.`,
            `${pct}% تعني جزءًا من ${n}. قسّم الثمن إلى ${n} أجزاء متساوية.`,
            `El ${pct} % es 1 parte de ${n}. Divide el precio en ${n} partes iguales.`,
          ),
          equation: t4(
            `${n} parts valent ${P} €.`,
            `${n} parts make €${P}.`,
            `${n} أجزاء تساوي ${P} €.`,
            `${n} partes valen ${P} €.`,
          ),
          answer: t4(
            `Une part = ${P} ÷ ${n}. Tu paies toutes les parts sauf une.`,
            `One part = ${P} ÷ ${n}. You pay all the parts except one.`,
            `جزء واحد = ${P} ÷ ${n}. تدفع كل الأجزاء إلا واحدًا.`,
            `Una parte = ${P} ÷ ${n}. Pagas todas las partes menos una.`,
          ),
        },
      };
    },
  },
  {
    id: "ratio",
    minLevel: 1,
    build: (rng, p) => {
      const pair: readonly [number, number] = pick(rng, [
        [3, 2],
        [2, 1],
        [3, 1],
        [4, 3],
        [5, 2],
      ] as const) as readonly [number, number];
      const a = p?.a ?? pair[0];
      const b = p?.b ?? pair[1];
      const u = p?.u ?? int(rng, 2, 8) * 10;
      const T = (a + b) * u;
      return {
        id: "",
        template: "ratio",
        notion: "proportion",
        minLevel: 1,
        title: t4("La recette de gâteau", "The cake recipe", "وصفة الكعكة", "La receta del pastel"),
        story: t4(
          `Pour un gâteau, on mélange farine et sucre dans le rapport ${a} : ${b}. Le mélange pèse ${T} g.`,
          `For a cake, flour and sugar are mixed in the ratio ${a} : ${b}. The mix weighs ${T} g.`,
          `لصنع كعكة نخلط الدقيق والسكر بنسبة ${a} : ${b}. يزن الخليط ${T} غ.`,
          `Para un pastel se mezclan harina y azúcar en la proporción ${a} : ${b}. La mezcla pesa ${T} g.`,
        ),
        question: t4(
          "Quelle masse de farine faut-il ?",
          "How much flour is needed?",
          "كم من الدقيق نحتاج؟",
          "¿Cuánta harina se necesita?",
        ),
        verbal: {
          sentence: t4(
            "On cherche {0}. Pour {1} parts de farine, il y a {2} parts de sucre.",
            "We are looking for {0}. For {1} parts of flour there are {2} parts of sugar.",
            "نبحث عن {0}. مقابل {1} أجزاء دقيق هناك {2} أجزاء سكر.",
            "Buscamos {0}. Por {1} partes de harina hay {2} partes de azúcar.",
          ),
          blanks: [
            choice(
              rng,
              t4("la masse de farine", "the mass of flour", "كتلة الدقيق", "la masa de harina"),
              t4("la masse de sucre", "the mass of sugar", "كتلة السكر", "la masa de azúcar"),
              t4("la masse totale", "the total mass", "الكتلة الإجمالية", "la masa total"),
            ),
            choice(rng, same(a), same(b), same(a + b)),
            choice(rng, same(b), same(a), same(a * b)),
          ],
        },
        bars: [
          { name: t4("Farine", "Flour", "الدقيق", "Harina"), units: a, color: 4 },
          { name: t4("Sucre", "Sugar", "السكر", "Azúcar"), units: b, color: 2 },
        ],
        chips: ["x", String(T), String(a + b)],
        required: [
          { slots: ["unit:0", "unit:1"], chip: "x" },
          { slots: ["all"], chip: String(T) },
        ],
        ...equationChoice(rng, `${a + b}x = ${T}`, [`${a}x = ${T}`, `${a}x + ${b} = ${T}`, `${a * b}x = ${T}`]),
        answer: a * u,
        unit: t4("g", "g", "غ", "g"),
        hints: {
          verbal: t4(
            `Le premier nombre du rapport (${a}) va avec la farine.`,
            `The first number of the ratio (${a}) goes with flour.`,
            `العدد الأول في النسبة (${a}) يخص الدقيق.`,
            `El primer número (${a}) corresponde a la harina.`,
          ),
          model: t4(
            `Farine : ${a} parts, sucre : ${b} parts, toutes de même taille x. Le total ${T} va sous les deux barres.`,
            `Flour: ${a} parts, sugar: ${b} parts, all the same size x. The total ${T} goes under both bars.`,
            `الدقيق: ${a} أجزاء، السكر: ${b} أجزاء، كلها بحجم x. المجموع ${T} تحت الشريطين.`,
            `Harina: ${a} partes, azúcar: ${b} partes, todas del mismo tamaño x. El total ${T} va bajo las dos barras.`,
          ),
          equation: t4(
            `${a} + ${b} = ${a + b} parts égales valent ${T}.`,
            `${a} + ${b} = ${a + b} equal parts make ${T}.`,
            `${a} + ${b} = ${a + b} أجزاء متساوية تساوي ${T}.`,
            `${a} + ${b} = ${a + b} partes iguales valen ${T}.`,
          ),
          answer: t4(
            `x = ${T} ÷ ${a + b}. La farine, c'est ${a} parts.`,
            `x = ${T} ÷ ${a + b}. Flour is ${a} parts.`,
            `x = ${T} ÷ ${a + b}. الدقيق ${a} أجزاء.`,
            `x = ${T} ÷ ${a + b}. La harina son ${a} partes.`,
          ),
        },
      };
    },
  },
  {
    id: "perimeter",
    minLevel: 2,
    build: (rng, p) => {
      const x = p?.x ?? int(rng, 4, 15);
      const d = p?.d ?? int(rng, 2, 8);
      const half = 2 * x + d;
      const P = 2 * half;
      return {
        id: "",
        template: "perimeter",
        notion: "equations",
        minLevel: 2,
        title: t4("Le jardin rectangulaire", "The rectangular garden", "الحديقة المستطيلة", "El jardín rectangular"),
        story: t4(
          `Un jardin rectangulaire a un périmètre de ${P} m. Sa longueur mesure ${d} m de plus que sa largeur.`,
          `A rectangular garden has a perimeter of ${P} m. Its length is ${d} m more than its width.`,
          `حديقة مستطيلة محيطها ${P} م. طولها يزيد عن عرضها بـ ${d} م.`,
          `Un jardín rectangular tiene un perímetro de ${P} m. Su largo mide ${d} m más que su ancho.`,
        ),
        question: t4("Quelle est sa largeur ?", "What is its width?", "ما هو عرضها؟", "¿Cuál es su ancho?"),
        verbal: {
          sentence: t4(
            "On cherche {0}. Largeur + longueur = {1} m (la moitié du périmètre).",
            "We are looking for {0}. Width + length = {1} m (half the perimeter).",
            "نبحث عن {0}. العرض + الطول = {1} م (نصف المحيط).",
            "Buscamos {0}. Ancho + largo = {1} m (la mitad del perímetro).",
          ),
          blanks: [
            choice(
              rng,
              t4("la largeur", "the width", "العرض", "el ancho"),
              t4("la longueur", "the length", "الطول", "el largo"),
              t4("le périmètre", "the perimeter", "المحيط", "el perímetro"),
            ),
            choice(rng, same(half), same(P), same(d)),
          ],
        },
        bars: [
          { name: t4("Largeur", "Width", "العرض", "Ancho"), units: 1, color: 2 },
          { name: t4("Longueur", "Length", "الطول", "Largo"), units: 1, extra: true, color: 1 },
        ],
        chips: ["x", String(d), String(half), String(P)],
        required: [
          { slots: ["unit:0", "unit:1"], chip: "x" },
          { slots: ["extra:1"], chip: String(d) },
          { slots: ["all"], chip: String(half) },
        ],
        ...equationChoice(rng, `2x + ${d} = ${half}`, [`2x + ${d} = ${P}`, `x + ${d} = ${half}`, `4x = ${P}`]),
        answer: x,
        unit: t4("m", "m", "م", "m"),
        hints: {
          verbal: t4(
            "Le périmètre fait le tour complet : 2 largeurs + 2 longueurs.",
            "The perimeter goes all the way round: 2 widths + 2 lengths.",
            "المحيط هو الدورة الكاملة: عرضان + طولان.",
            "El perímetro es la vuelta completa: 2 anchos + 2 largos.",
          ),
          model: t4(
            `Largeur = x. Longueur = x + un morceau de ${d}. Ensemble : ${half} (pas ${P} !).`,
            `Width = x. Length = x + a piece of ${d}. Together: ${half} (not ${P}!).`,
            `العرض = x. الطول = x + قطعة ${d}. معًا: ${half} (وليس ${P}!).`,
            `Ancho = x. Largo = x + un trozo de ${d}. Juntos: ${half} (¡no ${P}!).`,
          ),
          equation: t4(
            `x + x + ${d} = ${half}.`,
            `x + x + ${d} = ${half}.`,
            `x + x + ${d} = ${half}.`,
            `x + x + ${d} = ${half}.`,
          ),
          answer: t4(
            `${half} − ${d}, puis partage en 2.`,
            `${half} − ${d}, then split in 2.`,
            `${half} − ${d} ثم اقسم على 2.`,
            `${half} − ${d} y luego divide entre 2.`,
          ),
        },
      };
    },
  },
];

const SAMPLE_PARAMS: Array<[string, Params]> = [
  ["multiple", { a: 12, k: 3 }],
  ["fraction", { den: 5, num: 2, u: 24 }],
  ["difference", { x: 35, d: 15 }],
  ["percent", { pct: 25, u: 15 }],
  ["ratio", { a: 3, b: 2, u: 50 }],
  ["perimeter", { x: 11, d: 6 }],
];

/** The 6 built-in sample exercises (stable content). */
export const SAMPLE_EXERCISES: Exercise[] = SAMPLE_PARAMS.map(([id, params], i) => {
  const tpl = TEMPLATES.find((t) => t.id === id)!;
  return { ...tpl.build(seeded(100 + i), params), id: `sample-${i + 1}` };
});

export type GenerateContext = { level: number; countryId: string; lang: string; notions?: NotionId[] | undefined; focus?: NotionId | undefined };

const LEVEL_DEMOS: Array<Array<[string, Params]>> = [
  [['sharing', { a: 3 }], ['fraction', { den: 4, num: 3, u: 3 }]],
  [['sharing', { a: 5 }], ['fraction', { den: 5, num: 2, u: 4 }], ['percent', { pct: 25, u: 5 }]],
  [['difference', { x: 8, d: 4 }], ['ratio', { a: 3, b: 2, u: 10 }], ['perimeter', { x: 6, d: 3 }]],
  [['difference', { x: 35, d: 15 }], ['ratio', { a: 5, b: 3, u: 20 }], ['percent', { pct: 20, u: 24 }]],
  [['difference', { x: 42, d: 18 }], ['ratio', { a: 7, b: 3, u: 30 }], ['percent', { pct: 10, u: 18 }]],
  [['perimeter', { x: 24, d: 12 }], ['ratio', { a: 7, b: 5, u: 40 }], ['percent', { pct: 20, u: 45 }]],
  [['difference', { x: 75, d: 25 }], ['ratio', { a: 9, b: 7, u: 50 }], ['percent', { pct: 10, u: 35 }]],
];

function buildDemo(id: string, params: Params, rng: Rng): Exercise {
  const template = TEMPLATES.find(t => t.id === (id === 'sharing' ? 'multiple' : id));
  if (!template) throw new Error('Unknown exercise template');
  const ex = template.build(rng, id === 'sharing' ? { ...params, k: 1 } : params);
  if (id !== 'sharing') return ex;
  const total = ex.answer * 2;
  return { ...ex, template: 'sharing', notion: 'integers',
    title: t4('Le partage des billes', 'Sharing marbles', 'تقاسم الكرات', 'Repartir canicas'),
    story: t4(`Omar et Lina se partagent équitablement ${total} billes.`, `Omar and Lina share ${total} marbles equally.`, `يتقاسم عمر ولينا ${total} كرة بالتساوي.`, `Omar y Lina reparten ${total} canicas por igual.`),
    verbal: { ...ex.verbal, sentence: t4('On cherche {0}. On partage {1} billes en deux groupes égaux.', 'We seek {0}. We share {1} marbles in two equal groups.', 'نبحث عن {0}. نوزع {1} كرة في مجموعتين متساويتين.', 'Buscamos {0}. Repartimos {1} canicas en dos grupos iguales.') },
  };
}

export function demonstrationsForLevel(level: number): Exercise[] {
  const index = Math.max(0, Math.min(6, Math.floor(level)));
  return (LEVEL_DEMOS[index] ?? LEVEL_DEMOS[0] ?? []).map(([id, params], i) => ({
    ...buildDemo(id, params, seeded(100 + index * 10 + i)), id: `demo-${index}-${i}`, minLevel: index,
  }));
}

// ───────────── Atelier adapté au programme ─────────────

/** Notions du programme que chaque type de problème en barres fait travailler. */
export const TEMPLATE_NOTIONS: Record<string, NotionId[]> = {
  sharing: ['integers', 'decimals'],
  multiple: ['equations', 'algebra'],
  difference: ['equations', 'systems'],
  fraction: ['fractions'],
  percent: ['proportion'],
  ratio: ['proportion'],
  perimeter: ['equations', 'areas'],
};
const TEMPLATE_ORDER = ['sharing', 'fraction', 'percent', 'ratio', 'multiple', 'difference', 'perimeter'] as const;

/** Les paramètres du niveau le plus proche qui utilise ce type de problème (difficulté alignée sur la classe). */
function paramsFor(template: string, index: number): Params | null {
  for (let d = 0; d <= 6; d++) {
    for (const i of [index - d, index + d]) {
      const found = LEVEL_DEMOS[i]?.find(([id]) => id === template);
      if (found) return found[1];
    }
  }
  return SAMPLE_PARAMS.find(([id]) => id === template)?.[1] ?? null;
}

/** Les types de problèmes utiles pour ces notions ; la notion visée (chapitre en cours) d'abord. */
export function templatesFor(notions: NotionId[], focus?: NotionId): string[] {
  const useful = TEMPLATE_ORDER.filter(id => TEMPLATE_NOTIONS[id]!.some(n => notions.includes(n)));
  if (!focus) return useful;
  return [...useful.filter(id => TEMPLATE_NOTIONS[id]!.includes(focus)), ...useful.filter(id => !TEMPLATE_NOTIONS[id]!.includes(focus))];
}

/** La notion du programme travaillée par un problème : la notion visée si elle en fait partie, sinon la première du programme. */
function notionServed(template: string, notions: NotionId[], focus?: NotionId): NotionId | null {
  const served = TEMPLATE_NOTIONS[template] ?? [];
  if (focus && served.includes(focus)) return focus;
  return served.find(n => notions.includes(n)) ?? null;
}

/**
 * Les exercices de l'atelier pour le programme de l'élève (au plus 3). Sans programme connu,
 * on garde les démonstrations par niveau. Liste vide si aucun problème en barres ne sert ce programme
 * (fréquent au lycée) : l'atelier propose alors les activités graphiques.
 */
export function workshopExercises(level: number, notions?: NotionId[], focus?: NotionId, limit = 3): Exercise[] {
  if (!notions?.length) return demonstrationsForLevel(level);
  const index = Math.max(0, Math.min(6, Math.floor(level)));
  return templatesFor(notions, focus).slice(0, limit).flatMap(template => {
    const params = paramsFor(template, index);
    const notion = notionServed(template, notions, focus);
    if (!params || !notion) return [];
    return [{ ...buildDemo(template, params, seeded(300 + index * 10 + TEMPLATE_ORDER.indexOf(template as (typeof TEMPLATE_ORDER)[number]))), id: `prog-${index}-${template}`, minLevel: index, notion }];
  });
}

export type HighSchoolMode = 'graph' | 'tree' | 'sign';
const MODE_NOTIONS: Record<HighSchoolMode, NotionId[]> = {
  graph: ['functions', 'quadratics', 'derivatives', 'limits', 'exponential', 'logarithm', 'trig-functions'],
  tree: ['probability', 'probability-laws', 'counting'],
  sign: ['quadratics', 'inequalities', 'derivatives'],
};
/** Les activités graphiques utiles au programme (toutes, sans programme connu). */
export function highSchoolModes(notions?: NotionId[]): HighSchoolMode[] {
  const modes: HighSchoolMode[] = ['graph', 'tree', 'sign'];
  return notions?.length ? modes.filter(m => MODE_NOTIONS[m].some(n => notions.includes(n))) : modes;
}
/** La notion enregistrée pour une activité graphique : celle du programme quand c'est possible. */
export function highSchoolNotion(mode: HighSchoolMode, notions?: NotionId[]): NotionId {
  return MODE_NOTIONS[mode].find(n => notions?.includes(n)) ?? (mode === 'tree' ? 'probability' : mode === 'sign' ? 'inequalities' : 'functions');
}

/** A concrete tray for each equal part, plus a separate tray for any known excess. */
export function concreteSpec(ex: Exercise) {
  const total = Number(ex.required.find(r => r.slots.includes('all'))?.chip);
  const extras = ex.bars.map((bar, i) => bar.extra ? Number(ex.required.find(r => r.slots.includes(`extra:${i}`))?.chip) : 0);
  const part = (total - extras.reduce((s, n) => s + n, 0)) / ex.bars.reduce((s, b) => s + b.units, 0);
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const value = total > 40 ? extras.reduce((s, n) => n ? gcd(s, n) : s, part) : 1;
  const groups = ex.bars.flatMap((bar, barIndex) => [
    ...Array.from({ length: bar.units }, (_, partIndex) => ({ barIndex, partIndex, extra: false, target: part / value })),
    ...(bar.extra ? [{ barIndex, partIndex: bar.units, extra: true, target: (extras[barIndex] ?? 0) / value }] : []),
  ]);
  return { total, part, value, groups, tokenCount: total / value };
}

export function checkConcrete(ex: Exercise, counts: number[]) {
  const { groups } = concreteSpec(ex);
  return counts.length === groups.length && groups.every((g, i) => counts[i] === g.target);
}

export function checkCalculation(ex: Exercise, equation: number | null, part: string, answer: string) {
  const number = (s: string) => s.trim() === '' ? NaN : Number(s.replace(',', '.'));
  return equation === ex.equationAnswer && number(part) === concreteSpec(ex).part && number(answer) === ex.answer;
}

/**
 * Generates a new exercise adapted to the student's programme.
 * Integration point: replace the body with a call to an AI endpoint that returns an `Exercise`
 * (same shape). The local fallback re-draws a template suited to the level with fresh numbers.
 */
export async function generateAdaptedExercise(ctx: GenerateContext, seed: number = Date.now() % 1_000_000): Promise<Exercise> {
  const index = Math.max(0, Math.min(6, Math.floor(ctx.level)));
  const templates = ctx.notions?.length ? templatesFor(ctx.notions, ctx.focus) : [];
  if (!templates.length) return buildGenerated(index, seed);
  // Le chapitre en cours une fois sur deux, sinon un autre problème utile au programme.
  const template = seeded(seed)() < 0.5 ? templates[0]! : templates[seed % templates.length]!;
  const ex = buildGeneratedFrom(index, seed, template);
  const notion = notionServed(template, ctx.notions!, ctx.focus);
  return notion ? { ...ex, notion } : ex;
}

function buildGeneratedFrom(index: number, seed: number, template: string): Exercise {
  const rng = seeded(seed);
  const params = paramsFor(template, index) ?? {};
  const ex = buildDemo(template, { ...params, ...(template === 'sharing' ? { a: int(rng, 3, 8) } : template === 'difference' || template === 'perimeter' ? { x: (params.x ?? 5) + int(rng, 1, 5) } : template === 'multiple' ? { a: (params.a ?? 6) + int(rng, 1, 5) } : { u: (params.u ?? 3) + int(rng, 1, 5) }) }, rng);
  return { ...ex, id: `gen-${index}-${seed}-${template}` };
}

/** Deterministic: the server can rebuild the exact same exercise from its id. */
function buildGenerated(index: number, seed: number): Exercise {
  const rng = seeded(seed);
  const [id, params] = pick(rng, LEVEL_DEMOS[index] ?? LEVEL_DEMOS[0] ?? []);
  const ex = buildDemo(id, { ...params, ...(id === 'sharing' ? { a: int(rng, 3, 8) } : id === 'difference' || id === 'perimeter' ? { x: (params.x ?? 5) + int(rng, 1, 5) } : { u: (params.u ?? 3) + int(rng, 1, 5) }) }, rng);
  return { ...ex, id: `gen-${index}-${seed}` };
}

/** Rebuilds a workshop exercise from its id (demo, sample or generated). */
export function exerciseById(id: string): Exercise | null {
  const demo = /^demo-([0-6])-\d$/.exec(id);
  if (demo) return demonstrationsForLevel(Number(demo[1])).find(e => e.id === id) ?? null;
  const gen = /^gen-([0-6])-(\d{1,7})$/.exec(id);
  if (gen) return buildGenerated(Number(gen[1]), Number(gen[2]));
  const genT = /^gen-([0-6])-(\d{1,7})-([a-z]{3,12})$/.exec(id);
  if (genT && genT[3]! in TEMPLATE_NOTIONS) return buildGeneratedFrom(Number(genT[1]), Number(genT[2]), genT[3]!);
  const prog = /^prog-([0-6])-([a-z]{3,12})$/.exec(id);
  if (prog && prog[2]! in TEMPLATE_NOTIONS) {
    const index = Number(prog[1]);
    const params = paramsFor(prog[2]!, index);
    return params ? { ...buildDemo(prog[2]!, params, seeded(300 + index * 10 + TEMPLATE_ORDER.indexOf(prog[2] as (typeof TEMPLATE_ORDER)[number]))), id, minLevel: index } : null;
  }
  return SAMPLE_EXERCISES.find(e => e.id === id) ?? null;
}

/** Returns the chip placed on each requirement check. */
export function checkModel(
  ex: Exercise,
  units: number[],
  extras: boolean[],
  placed: Partial<Record<Slot, string>>,
): { unitsOk: boolean; labelsOk: boolean } {
  const unitsOk = ex.bars.every((b, i) => units[i] === b.units && !!extras[i] === !!b.extra);
  const labelsOk = ex.required.every((r) => r.slots.some((s) => placed[s] === r.chip));
  return { unitsOk, labelsOk };
}

/** Explains why a concrete distribution is refused: totals right but excess misplaced, or unequal parts. */
export function concreteMistake(ex: Exercise, counts: number[]): 'extra' | 'equal' | 'count' | null {
  if (checkConcrete(ex, counts)) return null;
  const { groups } = concreteSpec(ex);
  const barSum = (b: number, from: number[]) => groups.reduce((s, g, i) => g.barIndex === b ? s + (from[i] ?? 0) : s, 0);
  const target = groups.map(g => g.target);
  const barsOk = ex.bars.every((_, b) => barSum(b, counts) === barSum(b, target));
  if (barsOk && groups.some(g => g.extra)) return 'extra';
  const parts = groups.map((g, i) => g.extra ? null : counts[i]).filter((n): n is number => n != null);
  if (parts.some(n => n !== parts[0])) return 'equal';
  return 'count';
}
