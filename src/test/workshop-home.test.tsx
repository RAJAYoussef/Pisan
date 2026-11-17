import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { nextSkill } from '@/lib/skills';
import { Workshop } from '@/components/pisan/workshop';
import { programmeFor, programmeNotions } from '@/lib/programmes';
import type { Attempt } from '@/lib/pisan';
import { localEngine } from '@/lib/skill-session';

const at = (skill: string, correct: number, total: number, d = 1): Attempt => ({ kind: 'workshop', notion: 'vectors', skill, correct, total, date: new Date(Date.UTC(2026, 10, d)).toISOString(), minutes: 5 });

describe('Prochain pas de l’atelier', () => {
  it('starts with the first chapter when nothing was done', () => {
    expect(nextSkill([], ['thales', 'vectors'])).toEqual({ skill: expect.objectContaining({ id: 'thales-recognise' }), resumed: false });
  });
  it('resumes the chapter touched last, at its first skill not mastered', () => {
    const r = nextSkill([at('vec-characterise', 4, 4, 1), at('vec-translation', 1, 3, 2)], ['thales', 'vectors']);
    expect(r).toEqual({ skill: expect.objectContaining({ id: 'vec-translation' }), resumed: true });
  });
  it('a skill to review comes first', () => {
    const r = nextSkill([at('vec-characterise', 4, 4), at('vec-translation', 3, 3), { ...at('vec-characterise', 0, 1, 5), review: true }], ['vectors']);
    expect(r?.skill.id).toBe('vec-characterise');
  });
  it('moves on when the chapter touched last is complete', () => {
    const all = ['vec-characterise', 'vec-translation', 'vec-coordinates', 'vec-sum', 'vec-midpoint'].map(id => at(id, 2, 2));
    expect(nextSkill(all, ['vectors', 'stats'])?.skill.id).toBe('stats-frequency');
  });
});

describe('Accueil de l’atelier', () => {
  const programme = programmeFor('ci', 3)!;
  const notions = programmeNotions(programme);
  const props = { lang: 'fr' as const, level: 3, country: 'ci', notions, programme, onSave: vi.fn(async () => {}), onStart: vi.fn(async () => true), engine: localEngine({ secret: 'test', hash: 'b'.repeat(64) }) };
  it('shows one next step and compact chapter tiles, not every skill', () => {
    render(<Workshop {...props} progress={{ unlocked: [], attempts: [at('vec-characterise', 4, 4)] }} />);
    expect(screen.getByText('Reprendre · Vecteurs')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Continuer/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Vecteurs · 1/5' })).toBeTruthy();
    expect(screen.queryByText('Milieu et distance')).toBeNull(); // le détail est dans le chapitre
    expect(screen.queryByText('Le livre de Nour')).toBeNull(); // les problèmes en barres ont leur page
  });
  it('a chapter tile opens its path, with the next skill highlighted', () => {
    render(<Workshop {...props} progress={{ unlocked: [], attempts: [at('vec-characterise', 4, 4)] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Vecteurs · 1/5' }));
    expect(screen.getByRole('button', { name: '2. Translation · À faire' }).getAttribute('aria-current')).toBe('step');
    expect(screen.getByRole('button', { name: '1. Direction, sens, longueur · Acquis' })).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Atelier/ })[0]!);
    expect(screen.getByText('Mes chapitres')).toBeTruthy();
  });
  it('bar-model problems live behind one entry', () => {
    render(<Workshop {...props} progress={{ unlocked: [], attempts: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /Problèmes en barres/ }));
    expect(screen.getByRole('heading', { name: 'Problèmes en barres' })).toBeTruthy();
  });
});
