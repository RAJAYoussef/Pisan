import { describe, expect, it } from 'vitest';
import { NOTIONS } from '@/lib/curriculum';
import { CHALLENGE_BANK } from '@/lib/challenge-bank';
import { checkFreeAnswer, freeAnswer } from '@/lib/answer-check';

const LANGS = ['fr', 'en', 'ar', 'es'] as const;
const squash = (s: string) => s.replace(/\s+/g, '');

describe('Banque du défi du jour', () => {
  it('has at least 2 questions for every notion', () => {
    for (const n of NOTIONS) expect(CHALLENGE_BANK[n.id]?.length, n.id).toBeGreaterThanOrEqual(2);
  });
  it('never reuses a question from the graded tests', () => {
    for (const n of NOTIONS) for (const item of CHALLENGE_BANK[n.id]) {
      // Une question = sa consigne + son expression + sa bonne réponse (la même formule peut servir avec d'autres nombres).
      const key = (q: typeof item.question) => squash(`${typeof q.prompt === 'string' ? q.prompt : q.prompt.fr}|${q.expr}|${q.options[q.answer]}`);
      expect(n.questions.some(q => key(q) === key(item.question)), `${n.id}: ${item.question.expr}`).toBe(false);
    }
  });
  it('has valid answers, distinct options, translations and a solution ending on the answer', () => {
    for (const n of NOTIONS) CHALLENGE_BANK[n.id].forEach(({ question: q, steps }, i) => {
      const where = `${n.id} #${i}`;
      expect(q.answer, where).toBeGreaterThanOrEqual(0);
      expect(q.answer, where).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, where).toBe(q.options.length);
      if (typeof q.prompt !== 'string') for (const lang of LANGS) expect(q.prompt[lang]?.trim().length, `${where} ${lang}`).toBeGreaterThan(3);
      const last = squash(steps.at(-1) ?? ''); const right = squash(q.options[q.answer]!);
      expect(last.endsWith(right) || last.includes(right), `${where}: « ${steps.at(-1)} » vs « ${q.options[q.answer]} »`).toBe(true);
      for (const step of steps) expect(/\b[a-zàâéèêîôûç]{6,}\b/i.test(step.replace(/\b(cos|sin|tan|ln|lim)\b/g, '')), `${where}: ${step}`).toBe(false);
    });
  });
  it('works with typed answers when the answer can be typed', () => {
    let typed = 0;
    for (const n of NOTIONS) for (const { question: q } of CHALLENGE_BANK[n.id]) {
      if (!freeAnswer(q)) continue;
      typed++;
      expect(checkFreeAnswer(q, q.options[q.answer]!), `${n.id}: ${q.expr}`).toBe(true);
    }
    expect(typed).toBeGreaterThan(40);
  });
});
