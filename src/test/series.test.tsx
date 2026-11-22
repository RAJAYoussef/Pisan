import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; }, useServerFn: (fn: unknown) => fn }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@tanstack/react-router', () => ({ Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a> }));

import { SeriesActivity } from '@/components/pisan/series';
import { LevelPicker, seriesUnlocked } from '@/components/pisan/level-picker';
import { CoachPage } from '@/components/pisan/legal';
import { localEngine } from '@/lib/skill-session';
import { reviewStep, SKILLS, skillsFor } from '@/lib/skills';
import type { Attempt } from '@/lib/pisan';

// rand = 0.5 → graine 50000 pour chaque question ; une compétence en tête de chapitre (niveau 3 = elle seule).
const SEED = 50000;
const skill = SKILLS.find(s => skillsFor(s.chapter)[0]!.id === s.id && reviewStep(s, SEED).type === 'choice')!;
const step = reviewStep(skill, SEED) as Extract<ReturnType<typeof reviewStep>, { type: 'choice' }>;
const wrongOption = step.options[(step.answer + 1) % step.options.length]!.fr;
const engine = () => localEngine({ secret: 'test', hash: 'a'.repeat(64), rand: () => 0.5 });

describe('Niveaux d’un parcours', () => {
  it('levels 2 and 3 open only after the guided pathway', () => {
    const done: Attempt = { kind: 'workshop', notion: 'vectors', skill: skill.id, correct: 3, total: 3, date: '2026-11-20', minutes: 5 };
    expect(seriesUnlocked([], skill.id)).toBe(false);
    expect(seriesUnlocked([{ ...done, series: 2 }], skill.id)).toBe(false);
    expect(seriesUnlocked([{ ...done, review: true }], skill.id)).toBe(false);
    expect(seriesUnlocked([done], skill.id)).toBe(true);
    const onPick = vi.fn();
    render(<LevelPicker lang="fr" current={1} unlocked={false} onPick={onPick} />);
    expect(screen.getByRole('button', { name: /En autonomie/ })).toBeDisabled();
    expect(screen.getByText(/s’ouvrent quand tu as terminé/)).toBeTruthy();
  });
  it('level 2: five questions, a hint right after a mistake', async () => {
    render(<SeriesActivity lang="fr" skill={skill} level={2} engine={engine()} onLevel={vi.fn()} onBack={vi.fn()} />);
    expect(await screen.findByText('Question 1 / 5')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: wrongOption }));
    expect(await screen.findByAltText('π')).toBeTruthy(); // l'indice (Tutor) s'affiche tout de suite
    expect(screen.queryByText(/l’indice viendra/)).toBeNull();
  });
  it('level 3: no hint at the first mistake, only at the second', async () => {
    render(<SeriesActivity lang="fr" skill={skill} level={3} engine={engine()} onLevel={vi.fn()} onBack={vi.fn()} />);
    expect(await screen.findByText('Question 1 / 6')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: wrongOption }));
    expect(await screen.findByText(/l’indice viendra/)).toBeTruthy();
    expect(screen.queryByAltText('π')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: wrongOption }));
    expect(await screen.findByAltText('π')).toBeTruthy();
    expect(screen.queryByText(/l’indice viendra/)).toBeNull();
  });
});

describe('Page « Coach Pi et ses limites »', () => {
  it('says plainly that the coach can be wrong and never grades', () => {
    render(<CoachPage />);
    expect(screen.getByText(/Comme toute IA, il peut se tromper/)).toBeTruthy();
    expect(screen.getByText(/Il ne corrige pas tes exercices/)).toBeTruthy();
    expect(screen.getByText(/Il se tait pendant les tests/)).toBeTruthy();
  });
});
