// Réponses libres : l'élève tape sa réponse au lieu de cocher un QCM.
// Un petit analyseur (sans eval) comprend les nombres, fractions, décimales (virgule ou point),
// √, π, e, x, puissances (^ ou exposants ²³…), parenthèses et multiplication implicite (2x, 3(x+1)).
// Deux réponses sont équivalentes si elles ont la même valeur (en plusieurs points pour une
// expression en x) et si l'élève n'a pas simplement recopié le calcul demandé.
// Couvert par src/test/answer-check.test.ts.
import type { Question } from './curriculum';

type Fn = (x: number) => number;
type Parsed = { fn: Fn; usesX: boolean; ops: number; xCount: number };

const SUPERSCRIPTS: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+', 'ˣ': 'x' };
const UNITS = /(cm³|cm²|cm|m²|m³|m|€|°|%|dh|mad)$/i;
// Préfixes « x = », « f′(x) = », « F(x) = », « y = » : seul ce qui suit le signe = compte.
const PREFIX = /^\s*(x|y|[fFgG]′?\(x\)|[fFgG]′|[uv]ₙ|[uv][0-9₀-₉]+)\s*=\s*/;

export function normalize(raw: string): string {
  let s = raw.trim().replace(PREFIX, '');
  s = s.replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  s = s.replace(UNITS, '');
  // Une suite d'exposants devient ^(…)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣ]+/g, run => `^(${[...run].map(c => SUPERSCRIPTS[c]).join('')})`);
  return s.toLowerCase();
}

/** Analyse une expression ; null si elle contient quelque chose qu'on ne sait pas lire. */
export function parse(raw: string): Parsed | null {
  const s = normalize(raw);
  if (!s || s.length > 80) return null;
  let i = 0;
  let ops = 0;
  let xCount = 0;
  const peek = () => s[i];
  const startsPrimary = (c: string | undefined) => c !== undefined && /[0-9.x(eπ√]/.test(c);

  function primary(): Fn {
    const c = peek();
    if (c === undefined) throw new Error('end');
    if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+|^\d+\.?/.exec(s.slice(i));
      if (!m) throw new Error('number');
      i += m[0].length;
      const v = Number(m[0]);
      return () => v;
    }
    if (c === 'x') { i++; xCount++; return x => x; }
    if (c === 'e') { i++; return () => Math.E; }
    if (c === 'π') { i++; return () => Math.PI; }
    if (c === '(') {
      i++;
      const inner = expr();
      if (peek() !== ')') throw new Error(')');
      i++;
      return inner;
    }
    throw new Error(`unexpected ${c}`);
  }
  function power(): Fn {
    if (peek() === '√') { i++; ops++; const arg = power(); return x => Math.sqrt(arg(x)); }
    const base = primary();
    if (peek() === '^') { i++; ops++; const exp = unary(); return x => Math.pow(base(x), exp(x)); }
    return base;
  }
  function unary(): Fn {
    if (peek() === '-') { i++; const a = unary(); return x => -a(x); }
    if (peek() === '+') { i++; return unary(); }
    return power();
  }
  function term(): Fn {
    let left = unary();
    for (;;) {
      const c = peek();
      if (c === '*' || c === '/') {
        i++; ops++;
        const right = unary();
        const l = left;
        left = c === '*' ? x => l(x) * right(x) : x => l(x) / right(x);
      } else if (startsPrimary(c)) {
        const right = power();
        const l = left;
        left = x => l(x) * right(x);
      } else return left;
    }
  }
  function expr(): Fn {
    let left = term();
    for (;;) {
      const c = peek();
      if (c !== '+' && c !== '-') return left;
      i++; ops++;
      const right = term();
      const l = left;
      left = c === '+' ? x => l(x) + right(x) : x => l(x) - right(x);
    }
  }
  try {
    const fn = expr();
    if (i !== s.length) return null;
    return { fn, usesX: xCount > 0, ops, xCount };
  } catch {
    return null;
  }
}

const SAMPLES = [-2.3, -1.1, 0.7, 1.9, 3.4];
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const sameValue = (a: Parsed, b: Parsed) => (a.usesX || b.usesX ? SAMPLES : [0]).every(x => close(a.fn(x), b.fn(x)));

/** Prompts où la forme de la réponse compte (développer, simplifier) : on garde le QCM. */
const FORM_PROMPTS = new Set(['simplify', 'expand']);

/** La question peut-elle se faire en réponse libre ? La bonne réponse doit se lire et ne ressembler à aucun leurre. */
export function freeAnswer(question: Question): Parsed | null {
  if (question.choiceOnly) return null;
  if (typeof question.prompt === 'string' && FORM_PROMPTS.has(question.prompt)) return null;
  const right = question.options[question.answer];
  if (right === undefined) return null;
  const expected = parse(right);
  if (!expected) return null;
  const n = normalize(right);
  const ambiguous = question.options.some((o, k) => {
    if (k === question.answer) return false;
    const p = parse(o);
    return p !== null && (sameValue(p, expected) || normalize(o) === n);
  });
  return ambiguous ? null : expected;
}

/** Vrai si la réponse tapée est équivalente à la bonne réponse, sans recopier le calcul. */
export function checkFreeAnswer(question: Question, input: string): boolean {
  const expected = freeAnswer(question);
  const given = parse(input);
  if (!expected || !given) return false;
  if (given.ops > expected.ops || given.xCount > expected.xCount) return false;
  if (normalize(input) === normalize(question.expr)) return false;
  return sameValue(given, expected);
}
