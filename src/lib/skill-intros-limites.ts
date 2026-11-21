// Introductions du parcours « Limites et continuité ». Données pures, couvertes par src/test/skill-intros.test.tsx.
import type { L } from './curriculum';
import type { Intro } from './skill-intros';

const t = (fr: string, en: string, ar: string, es: string): L => ({ fr, en, ar, es });
const ex = (title: L, ...lines: L[]) => ({ title, lines });
const same = (s: string) => t(s, s, s, s);
const EX = t('Exemple', 'Example', 'مثال', 'Ejemplo');

export const LIMIT_INTROS: Record<string, Intro> = {
  'lim-infinity': {
    goal: t('f(x) = (2x + 1)/(x − 3) : multiplie x par 10 plusieurs fois. De quel nombre f(x) se rapproche-t-il ?', 'f(x) = (2x + 1)/(x − 3): multiply x by 10 several times. Which number does f(x) approach?', 'اضرب x في 10 عدة مرات: من أي عدد تقترب f(x)؟', 'Multiplica x por 10 varias veces: ¿a qué número se acerca f(x)?'),
    manip: { kind: 'limit-table', a: 2, b: 1, c: 3, toward: 'infinity' },
    lesson: {
      points: [
        t('En **±∞**, un polynôme (ou un quotient de polynômes) se comporte comme **son terme de plus haut degré** (ou le quotient de ces termes).', 'At **±∞**, a polynomial (or a quotient of polynomials) behaves like **its highest-degree term** (or the quotient of those terms).', 'عند **±∞** الحدودية تتصرف **كحدها الأعلى درجة**.', 'En **±∞** un polinomio se comporta como **su término de mayor grado**.'),
        t('Repères : x², x³, √x → +∞ ; 1/x, 1/x² → 0.', 'Landmarks: x², x³, √x → +∞; 1/x, 1/x² → 0.', 'x² و x³ و √x → +∞ ؛ 1/x → 0.', 'x², x³, √x → +∞; 1/x → 0.'),
      ],
      example: ex(EX, same('(2x + 1)/(x − 3) → 2x/x = 2 en +∞'), same('−3x³ + 5x → −∞ en +∞')),
    },
  },
  'lim-point': {
    goal: t('f(x) = (2x + 1)/(x − 3) : approche x de 3 par la droite. Que devient f(x) ?', 'f(x) = (2x + 1)/(x − 3): bring x close to 3 from the right. What happens to f(x)?', 'قرّب x من 3 من اليمين.', 'Acerca x a 3 por la derecha.'),
    manip: { kind: 'limit-table', a: 2, b: 1, c: 3, toward: 'right' },
    lesson: {
      points: [
        t('Si le dénominateur tend vers **0** (et pas le numérateur), le quotient tend vers **+∞ ou −∞**.', 'If the denominator tends to **0** (and not the numerator), the quotient tends to **+∞ or −∞**.', 'إذا آل المقام إلى **0** فالخارج يؤول إلى **±∞**.', 'Si el denominador → **0**, el cociente → **±∞**.'),
        t('Le **signe** décide : on regarde si le dénominateur tend vers 0 en étant **positif (0⁺)** ou **négatif (0⁻)**.', 'The **sign** decides: does the denominator tend to 0 while **positive (0⁺)** or **negative (0⁻)**?', '**الإشارة** تحسم: 0⁺ أو 0⁻.', 'El **signo** decide: 0⁺ o 0⁻.'),
      ],
      example: ex(EX, same('1/(x − 2) : → +∞ quand x → 2⁺, → −∞ quand x → 2⁻'), same('1/(x − 2)² → +∞ des deux côtés')),
    },
  },
  'lim-asymptote': {
    lesson: {
      points: [
        t('**lim f = k en ±∞** : la droite **y = k** est une **asymptote horizontale**.', '**lim f = k at ±∞**: the line **y = k** is a **horizontal asymptote**.', '**y = k** مقارب أفقي.', '**y = k** asíntota horizontal.'),
        t('**lim f = ±∞ en a** : la droite **x = a** est une **asymptote verticale** (souvent une valeur interdite).', '**lim f = ±∞ at a**: the line **x = a** is a **vertical asymptote** (often an excluded value).', '**x = a** مقارب عمودي.', '**x = a** asíntota vertical.'),
      ],
      example: ex(EX, same('f(x) = (2x + 1)/(x − 3) : y = 2 et x = 3')),
    },
  },
  'lim-ivt': {
    goal: t('g(x) = x³ + x − 1 s’annule entre 0 et 1. Coupe l’intervalle en deux 5 fois pour encadrer la solution.', 'g(x) = x³ + x − 1 is zero between 0 and 1. Halve the interval 5 times to trap the solution.', 'اقسم المجال إلى نصفين 5 مرات.', 'Divide el intervalo 5 veces.'),
    manip: { kind: 'bisection', steps: 5 },
    lesson: {
      points: [
        t('**Théorème des valeurs intermédiaires** : si f est **continue** sur [a ; b] et k entre f(a) et f(b), alors f(x) = k a **au moins une** solution dans [a ; b].', '**Intermediate value theorem**: if f is **continuous** on [a, b] and k lies between f(a) and f(b), then f(x) = k has **at least one** solution in [a, b].', 'إذا كانت f **متصلة** و k بين f(a) و f(b) فللمعادلة حل **على الأقل**.', 'Si f es **continua** y k está entre f(a) y f(b), hay **al menos una** solución.'),
        t('Si de plus f est **strictement monotone**, la solution est **unique**. La **dichotomie** l’encadre de plus en plus finement.', 'If f is also **strictly monotonic**, the solution is **unique**. **Bisection** traps it more and more tightly.', 'إذا كانت **رتيبة قطعًا** فالحل **وحيد**.', 'Si es **estrictamente monótona**, la solución es **única**.'),
      ],
      example: ex(EX, t('g(0) = −1 < 0 < g(1) = 1 et g croissante → une seule solution, ≈ 0,68', 'g(0) = −1 < 0 < g(1) = 1, g increasing → one solution, ≈ 0.68', 'حل وحيد ≈ 0,68', 'Una solución ≈ 0,68')),
    },
  },
};
