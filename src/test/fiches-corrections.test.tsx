import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NOTIONS, localizeMath } from '@/lib/curriculum';
import { CORRECTIONS } from '@/lib/corrections';
import { SHEETS } from '@/lib/sheets';
import { Why } from '@/components/pisan/learning-aids';

const LANGS = ['fr', 'en', 'ar', 'es'] as const;
const squash = (s: string) => s.replace(/\s+/g, '');

describe('Corrections pas à pas', () => {
  it('exist for every question of every notion', () => {
    for (const n of NOTIONS) {
      expect(CORRECTIONS[n.id], n.id).toBeDefined();
      expect(CORRECTIONS[n.id].length, n.id).toBe(n.questions.length);
      CORRECTIONS[n.id].forEach((steps, i) => expect(steps.length, `${n.id} #${i}`).toBeGreaterThan(0));
    }
  });
  it('end on the right answer', () => {
    for (const n of NOTIONS) n.questions.forEach((q, i) => {
      const last = squash(CORRECTIONS[n.id][i]!.at(-1)!);
      const right = squash(q.options[q.answer]!);
      expect(last.endsWith(right) || last.includes(right), `${n.id} #${i}: « ${CORRECTIONS[n.id][i]!.at(-1)} » vs « ${q.options[q.answer]} »`).toBe(true);
    });
  });
  it('use math only, so they read the same in every language', () => {
    for (const n of NOTIONS) for (const steps of CORRECTIONS[n.id]) for (const step of steps)
      expect(/\b[a-zàâéèêîôûç]{6,}\b/i.test(step.replace(/\b(cos|sin|tan|ln|lim)\b/g, '')), `${n.id}: ${step}`).toBe(false);
  });
});

describe('Fiches', () => {
  it('have 3 key ideas and 3 method steps in 4 languages for every notion', () => {
    for (const n of NOTIONS) {
      const sheet = SHEETS[n.id];
      expect(sheet, n.id).toBeDefined();
      expect(sheet.cours.length, n.id).toBe(3);
      expect(sheet.methode.length, n.id).toBe(3);
      for (const item of [...sheet.cours, ...sheet.methode]) for (const lang of LANGS) expect(item[lang]?.trim().length, `${n.id} ${lang}`).toBeGreaterThan(5);
    }
  });
});

describe('Bouton « Pourquoi ? »', () => {
  it('shows the steps, with a decimal point in English', () => {
    render(<Why notion="decimals" index={0} lang="en" />);
    fireEvent.click(screen.getByRole('button', { name: /Why\?/ }));
    expect(screen.getByText('= 6.15')).toBeTruthy();
    expect(localizeMath('= 6,15', 'fr')).toBe('= 6,15');
  });
});
