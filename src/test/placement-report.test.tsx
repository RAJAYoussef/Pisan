import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; }, useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@/lib/teacher.functions', () => ({
  teacherOverview: async () => ({ teacher: { id: 't', display_name: 'M. Raja', school_name: 'Lycée test', partner: false }, classes: [] }),
  classDashboard: async () => ({ classroom: { id: 'c1', name: '3e B', country: 'fr', grade: 3, track: null, join_code: 'ABCDEF' }, students: [
    { id: 'm1', profile: { nickname: 'Nora', country: 'fr', grade: 3, lang: 'fr' }, progress: { unlocked: [], attempts: [{ kind: 'workshop', notion: 'algebra', correct: 3, total: 3, date: '2026-12-10T10:00:00Z', minutes: 90 }] }, last_active_at: '', dys_default: null },
    { id: 'm2', profile: { nickname: 'Sami', country: 'fr', grade: 3, lang: 'fr' }, progress: { unlocked: [], attempts: [{ kind: 'workshop', notion: 'algebra', correct: 3, total: 3, date: '2026-12-10T10:00:00Z', minutes: 10 }] }, last_active_at: '', dys_default: null },
  ] }),
}));
vi.mock('@/lib/placement.functions', () => ({
  classTests: async () => ({
    tests: [{ id: 'A', form: 'A', is_open: false, created_at: '2026-11-25T08:00:00Z', closed_at: null, count: 4 }, { id: 'B', form: 'B', is_open: false, created_at: '2027-06-10T08:00:00Z', closed_at: null, count: 4 }],
    results: [
      { test_id: 'A', member_id: 'm1', correct: 2, total: 4, details: [{ skill: 'roots-square', chapter: 'roots', ok: true }, { skill: 'roots-square', chapter: 'roots', ok: false }], submitted_at: '' },
      { test_id: 'B', member_id: 'm1', correct: 4, total: 4, details: [{ skill: 'roots-square', chapter: 'roots', ok: true }, { skill: 'roots-square', chapter: 'roots', ok: true }], submitted_at: '' },
      { test_id: 'A', member_id: 'm2', correct: 2, total: 4, details: [{ skill: 'roots-square', chapter: 'roots', ok: false }], submitted_at: '' },
      { test_id: 'B', member_id: 'm2', correct: 3, total: 4, details: [{ skill: 'roots-square', chapter: 'roots', ok: true }], submitted_at: '' },
    ],
  }),
}));

import { placementSummary } from '@/lib/placement';
import { PlacementReport } from '@/components/pisan/placement-report';

describe('Bilan imprimable', () => {
  it('summarises progress, and compares regular and occasional users', () => {
    const s = placementSummary([
      { memberId: '1', nickname: 'a', a: 40, b: 70, gain: 30, minutes: 300, activities: 20 },
      { memberId: '2', nickname: 'b', a: 50, b: 55, gain: 5, minutes: 20, activities: 2 },
      { memberId: '3', nickname: 'c', a: 60, b: null, gain: null, minutes: 0, activities: 0 },
    ]);
    expect(s).toMatchObject({ pupils: 3, tookA: 3, tookB: 2, both: 2, avgA: 50, avgB: 63, avgGain: 18, progressed: 2, minutes: 320 });
    expect(s.regular).toEqual({ count: 1, gain: 30 });
    expect(s.occasional).toEqual({ count: 1, gain: 5 });
  });
  it('shows the key figures, hides nicknames by default and can show them', async () => {
    render(<QueryClientProvider client={new QueryClient()}><PlacementReport classId="c1" /></QueryClientProvider>);
    expect(await screen.findByText('Bilan des tests de positionnement')).toBeTruthy();
    expect(screen.getByText('+38 pts')).toBeTruthy(); // (50 + 25) / 2 arrondi
    expect(screen.getByText('2/2')).toBeTruthy();
    expect(screen.getByText(/Lycée test/)).toBeTruthy();
    expect(screen.queryByText('Nora')).toBeNull();
    expect(screen.getByText('Élève 1')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Afficher les pseudos'));
    expect(screen.getByText('Nora')).toBeTruthy();
  });
});
