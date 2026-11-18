import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { lastDays, levelOf, medalFor, toNextMedal } from '@/lib/rewards';
import { Workshop } from '@/components/pisan/workshop';
import { programmeFor, programmeNotions } from '@/lib/programmes';
import { localEngine } from '@/lib/skill-session';
import { skillsFor } from '@/lib/skills';
import type { Attempt } from '@/lib/pisan';

const done = (skill: string, day = '2026-11-10'): Attempt => ({ kind: 'workshop', notion: 'fractions', skill, correct: 3, total: 3, date: `${day}T10:00:00Z`, minutes: 4 });

describe('Niveaux, médailles, jours', () => {
  it('levels get longer to climb', () => {
    expect(levelOf(0)).toEqual({ level: 1, into: 0, need: 100 });
    expect(levelOf(130)).toEqual({ level: 2, into: 30, need: 150 });
    expect(levelOf(250).level).toBe(3);
  });
  it('bronze for one skill, silver at half, gold for the whole chapter', () => {
    expect([medalFor(0, 4), medalFor(1, 4), medalFor(2, 4), medalFor(4, 4)]).toEqual(['none', 'bronze', 'silver', 'gold']);
    expect(toNextMedal(0, 4)).toEqual({ medal: 'bronze', missing: 1 });
    expect(toNextMedal(1, 5)).toEqual({ medal: 'silver', missing: 2 });
    expect(toNextMedal(3, 5)).toEqual({ medal: 'gold', missing: 2 });
    expect(toNextMedal(5, 5)).toBeNull();
  });
  it('the last 7 days, oldest first, with the active ones', () => {
    const days = lastDays([done('a', '2026-11-16'), done('b', '2026-11-18')], '2026-11-18', iso => iso.slice(0, 10));
    expect(days.map(d => d.day)).toEqual(['2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18']);
    expect(days.filter(d => d.active).map(d => d.day)).toEqual(['2026-11-16', '2026-11-18']);
  });
});

describe('Écran « Mes récompenses »', () => {
  const programme = programmeFor('fr', 1)!;
  const props = { lang: 'fr' as const, level: 1, country: 'fr', notions: programmeNotions(programme), programme, onSave: vi.fn(async () => {}), onStart: vi.fn(async () => true), engine: localEngine({ secret: 'test', hash: '6'.repeat(64) }), streak: { count: 4, lastDay: new Date().toISOString().slice(0, 10), freezes: 1, timezone: 'UTC' } };
  const fractions = skillsFor('fractions').map(s => s.id);
  it('the workshop shows a rewards strip that opens the rewards screen', () => {
    render(<Workshop {...props} progress={{ unlocked: [], attempts: [done(fractions[0]!), done(fractions[1]!)] }} />);
    const strip = screen.getByRole('button', { name: /Mes récompenses : niveau 1, 4 jours d’affilée, 1 médailles/ });
    fireEvent.click(strip);
    expect(screen.getByRole('heading', { name: 'Mes récompenses' })).toBeTruthy();
    expect(screen.getByText('4 jours d’affilée')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Fractions · bronze · 2\/11/ })).toBeTruthy();
    // Le prochain badge : Fractions, à qui il manque le moins pour l'argent.
    expect(screen.getByText(/Fractions · argent/)).toBeTruthy();
    expect(screen.getByText('Encore 4 compétences à acquérir')).toBeTruthy();
  });
  it('a medal opens its chapter', () => {
    render(<Workshop {...props} progress={{ unlocked: [], attempts: [] }} />);
    fireEvent.click(screen.getByRole('button', { name: /Mes récompenses/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Probabilités · à gagner/ }));
    expect(screen.getByRole('heading', { name: 'Probabilités' })).toBeTruthy();
  });
});
