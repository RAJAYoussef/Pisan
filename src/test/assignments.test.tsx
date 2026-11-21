import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { from, adminFrom } = vi.hoisted(() => ({ from: vi.fn(), adminFrom: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; }, useServerFn: (fn: unknown) => fn }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
const { adminRpc } = vi.hoisted(() => ({ adminRpc: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { from: adminFrom, rpc: adminRpc } }));

import { addDays, assignmentNext, assignmentProgress, daysLeft, todayIso, validDueDate, visibleAssignments } from '@/lib/assignments';
import * as fns from '@/lib/teacher.functions';
import type { Attempt } from '@/lib/pisan';

const NOW = Date.UTC(2026, 10, 17, 10);
const at = (skill: string, correct: number, total: number, review?: boolean): Attempt => ({ kind: 'workshop', notion: 'vectors', skill, correct, total, date: '2026-11-10T10:00:00Z', minutes: 5, ...(review ? { review } : {}) });
const context = { userId: 'teacher-a', supabase: { from } };
beforeEach(() => { vi.clearAllMocks(); });

describe('Devoirs : logique', () => {
  it('accepts a real date from yesterday to one year ahead', () => {
    expect(validDueDate('2026-11-24', NOW)).toBe(true);
    expect(validDueDate('2026-11-16', NOW)).toBe(true);
    expect(validDueDate('2026-11-15', NOW)).toBe(false);
    expect(validDueDate('2026-02-30', NOW)).toBe(false);
    expect(validDueDate('2028-01-01', NOW)).toBe(false);
    expect(validDueDate('24/11/2026', NOW)).toBe(false);
    expect(addDays(todayIso(NOW), 7)).toBe('2026-11-24');
    expect(daysLeft('2026-11-24', NOW)).toBe(7);
  });
  it('counts mastered skills, and points to the next one (to review first)', () => {
    const a = { skill_ids: ['vec-characterise', 'vec-translation', 'vec-sum', 'unknown-skill'] };
    expect(assignmentProgress([], a)).toEqual({ done: 0, total: 3, complete: false, started: false });
    const attempts = [at('vec-characterise', 4, 4), at('vec-translation', 3, 3), at('vec-characterise', 0, 1, true)];
    expect(assignmentProgress(attempts, a)).toMatchObject({ done: 1, total: 3, started: true });
    expect(assignmentNext(attempts, a)?.id).toBe('vec-characterise');
    const all = [at('vec-characterise', 4, 4), at('vec-translation', 3, 3), at('vec-sum', 4, 4)];
    expect(assignmentProgress(all, a).complete).toBe(true);
    expect(assignmentNext(all, a)).toBeNull();
  });
  it('shows unfinished work first, most urgent first, and hides old ones', () => {
    const list = [
      { id: 'late', title: '', skill_ids: ['vec-sum'], due_date: '2026-11-01' },
      { id: 'soon', title: '', skill_ids: ['vec-sum'], due_date: '2026-11-19' },
      { id: 'done', title: '', skill_ids: ['vec-translation'], due_date: '2026-11-18' },
      { id: 'later', title: '', skill_ids: ['vec-sum'], due_date: '2026-11-30' },
    ];
    expect(visibleAssignments(list, [at('vec-translation', 3, 3)], NOW).map(a => a.id)).toEqual(['soon', 'later', 'done']);
  });
});

describe('Devoirs : accès', () => {
  it('a teacher cannot create an assignment for another teacher’s class', async () => {
    const insert = vi.fn();
    const chain = { select: () => chain, eq: () => chain, single: async () => ({ data: null, error: { message: 'missing' } }), insert };
    from.mockReturnValue(chain);
    const create = fns.createAssignment as unknown as (i: unknown) => Promise<unknown>;
    await expect(create({ data: { classId: 'other', title: 'Vecteurs', skillIds: ['vec-sum'], dueDate: '2026-11-24' }, context })).rejects.toThrow('Forbidden');
    expect(insert).not.toHaveBeenCalled();
  });
  it('deletion is scoped to the class through the caller’s own client', async () => {
    const eq = vi.fn();
    const chain = { delete: () => chain, eq: (k: string, v: string) => { eq(k, v); return chain; }, select: () => chain, single: async () => ({ data: { id: 'a1' }, error: null }) };
    from.mockReturnValue(chain);
    const del = fns.deleteAssignment as unknown as (i: unknown) => Promise<unknown>;
    await del({ data: { classId: 'c1', id: 'a1' }, context });
    expect(from).toHaveBeenCalledWith('class_assignments');
    expect(eq).toHaveBeenCalledWith('class_id', 'c1');
    expect(adminFrom).not.toHaveBeenCalled();
  });
  it('a pupil only gets the assignments of their own classes, without internal ids', async () => {
    const calls: [string, string, unknown][] = [];
    adminFrom.mockImplementation((table: string) => {
      const chain = {
        select: () => chain, order: () => chain, limit: async () => ({ data: [
          { id: 'a1', title: 'Vecteurs', skill_ids: ['vec-sum'], due_date: '2026-11-24', class_id: 'c1', created_at: '2026-11-20T10:00:00Z', kind: 'skills', member_ids: null },
          { id: 'a2', title: 'Pour un autre élève', skill_ids: ['vec-sum'], due_date: '2026-11-24', class_id: 'c1', created_at: '2026-11-20T10:00:00Z', kind: 'skills', member_ids: ['m9'] },
          { id: 'a3', title: 'Rien que pour toi', skill_ids: ['vec-sum'], due_date: '2026-11-25', class_id: 'c1', created_at: '2026-11-20T10:00:00Z', kind: 'review', member_ids: ['m1'] },
        ], error: null }),
        gte: () => chain, in: (k: string, v: unknown) => { calls.push([table, k, v]); return chain; },
        eq: (k: string, v: unknown) => { calls.push([table, k, v]); return table === 'class_members' ? Promise.resolve({ data: [{ id: 'm1', class_id: 'c1', classes: { name: '3e B' } }], error: null }) : chain; },
      };
      return chain;
    });
    const list = fns.studentAssignments as unknown as (i: unknown) => Promise<unknown>;
    const rows = await list({ data: { token: 'a'.repeat(64) } });
    expect(calls[0]).toEqual(['class_members', 'token_hash', expect.stringMatching(/^[a-f0-9]{64}$/)]);
    expect(calls[0]![2]).not.toBe('a'.repeat(64)); // jamais le jeton en clair
    expect(calls[1]).toEqual(['class_assignments', 'class_id', ['c1']]);
    // Le devoir d'un autre élève n'est pas montré, et la liste des élèves ciblés n'est jamais renvoyée.
    expect(rows).toEqual([
      { id: 'a1', title: 'Vecteurs', skill_ids: ['vec-sum'], due_date: '2026-11-24', created_at: '2026-11-20T10:00:00Z', kind: 'skills', class_name: '3e B' },
      { id: 'a3', title: 'Rien que pour toi', skill_ids: ['vec-sum'], due_date: '2026-11-25', created_at: '2026-11-20T10:00:00Z', kind: 'review', class_name: '3e B' },
    ]);
  });
  it('no class, no assignment query', async () => {
    adminFrom.mockImplementation(() => { const chain = { select: () => chain, eq: async () => ({ data: [], error: null }) }; return chain; });
    const list = fns.studentAssignments as unknown as (i: unknown) => Promise<unknown[]>;
    expect(await list({ data: { token: 'b'.repeat(64) } })).toEqual([]);
    expect(adminFrom).toHaveBeenCalledTimes(1);
  });
});

describe('Devoirs : écran professeur', () => {
  it('creates an assignment with the chosen skills and shows who finished', async () => {
    const created: unknown[] = [];
    let rows: unknown[] = [];
    vi.spyOn(fns, 'classAssignments').mockImplementation((async () => rows) as never);
    vi.spyOn(fns, 'createAssignment').mockImplementation((async (input: { data: unknown }) => { created.push(input.data); rows = [{ id: 'a1', title: 'Vecteurs', skill_ids: ['vec-characterise', 'vec-translation'], due_date: addDays(todayIso(), 7), created_at: '' }]; return { id: 'a1' }; }) as never);
    const { ClassAssignments } = await import('@/components/pisan/teacher-skills');
    const students = [
      { id: 'm1', profile: { nickname: 'Nora', country: 'ma', grade: 2, lang: 'fr' as const }, last_active_at: '', dys_default: null, progress: { unlocked: [], attempts: [at('vec-characterise', 4, 4), at('vec-translation', 3, 3)] } },
      { id: 'm2', profile: { nickname: 'Sami', country: 'ma', grade: 2, lang: 'fr' as const }, last_active_at: '', dys_default: null, progress: { unlocked: [], attempts: [at('vec-characterise', 2, 4)] } },
    ];
    render(<QueryClientProvider client={new QueryClient()}><ClassAssignments lang="fr" classId="c1" kinds={['vectors', 'stats']} students={students} /></QueryClientProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Nouveau devoir/ }));
    for (const name of ['Direction, sens, longueur', 'Translation']) fireEvent.click(screen.getByLabelText(name));
    fireEvent.click(screen.getByRole('button', { name: 'Assigner à la classe' }));
    await waitFor(() => expect(created).toHaveLength(1));
    expect(created[0]).toEqual({ classId: 'c1', title: 'Vecteurs', skillIds: ['vec-characterise', 'vec-translation'], dueDate: addDays(todayIso(), 7), kind: 'skills', memberIds: null });
    fireEvent.click(await screen.findByRole('button', { name: /Vecteurs.*1\/2 terminé/ }));
    expect(screen.getByText('✓ Terminé')).toBeTruthy();
    expect(screen.getByText('0/2')).toBeTruthy();
  });
});

describe('Devoirs : mini-contrôles et élèves choisis', () => {
  it('a quick check is done when every skill was taken after the assignment was created, by sets of 4', async () => {
    const { assignmentProgress, assignmentTarget, assignedTo } = await import('@/lib/assignments');
    const a = { skill_ids: ['vec-characterise', 'vec-translation', 'vec-sum', 'stats-median', 'stats-mean'], kind: 'review' as const, created_at: '2026-11-20T10:00:00Z' };
    const review = (skill: string, date: string, correct = 1) => ({ kind: 'workshop' as const, notion: 'vectors' as never, skill, review: true, correct, total: 1, date, minutes: 2 });
    // Un mini-contrôle passé AVANT le devoir ne compte pas.
    const before = [review('vec-sum', '2026-11-19T10:00:00Z')];
    expect(assignmentProgress(before, a)).toMatchObject({ done: 0, complete: false });
    const first = assignmentTarget(before, a);
    expect(first?.kind === 'review' && first.skills.map(s => s.id)).toEqual(['vec-characterise', 'vec-translation', 'vec-sum', 'stats-median']);
    // Après une première série (même ratée), il reste la dernière compétence.
    const after = ['vec-characterise', 'vec-translation', 'vec-sum', 'stats-median'].map(id => review(id, '2026-11-21T10:00:00Z', 0));
    const second = assignmentTarget(after, a);
    expect(second?.kind === 'review' && second.skills.map(s => s.id)).toEqual(['stats-mean']);
    expect(assignmentProgress([...after, review('stats-mean', '2026-11-21T11:00:00Z')], a)).toMatchObject({ done: 5, complete: true });
    expect(assignedTo({ member_ids: null }, 'm1')).toBe(true);
    expect(assignedTo({ member_ids: ['m2'] }, 'm1')).toBe(false);
  });
});

describe('Devoirs ciblés et codes de reprise : accès', () => {
  it('only pupils of the class can be targeted', async () => {
    vi.restoreAllMocks();
    const insert = vi.fn(() => ({ select: () => ({ single: async () => ({ data: { id: 'a1' }, error: null }) }) }));
    from.mockImplementation((table: string) => {
      if (table === 'classes') { const c = { select: () => c, eq: () => c, single: async () => ({ data: { id: 'c1' }, error: null }) }; return c; }
      if (table === 'class_members') { const c = { select: () => c, eq: async () => ({ data: [{ id: 'm1' }, { id: 'm2' }], error: null }) }; return c; }
      return { insert };
    });
    const create = fns.createAssignment as unknown as (i: unknown) => Promise<unknown>;
    await create({ data: { classId: 'c1', title: 'Groupe', skillIds: ['vec-sum'], dueDate: '2026-11-24', kind: 'review', memberIds: ['m1', 'intrus'] }, context });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ class_id: 'c1', kind: 'review', member_ids: ['m1'] }));
    await expect(create({ data: { classId: 'c1', title: 'Groupe', skillIds: ['vec-sum'], dueDate: '2026-11-24', kind: 'skills', memberIds: ['intrus'] }, context })).rejects.toThrow();
  });
  it('a new recovery code needs the class to be the caller’s, and keeps the hash server-side', async () => {
    const notOwned = { select: () => notOwned, eq: () => notOwned, single: async () => ({ data: null, error: { message: 'missing' } }) };
    from.mockReturnValue(notOwned);
    const reissue = fns.reissueRecoveryCode as unknown as (i: unknown) => Promise<{ token: string }>;
    await expect(reissue({ data: { classId: 'other', memberId: 'm1' }, context })).rejects.toThrow('Forbidden');
    expect(adminFrom).not.toHaveBeenCalled();
    const owned = { select: () => owned, eq: () => owned, single: async () => ({ data: { id: 'c1' }, error: null }) };
    from.mockReturnValue(owned);
    const member = { select: () => member, eq: () => member, single: async () => ({ data: { token_hash: 'f'.repeat(64) }, error: null }) };
    adminFrom.mockReturnValue(member);
    adminRpc.mockResolvedValue({ data: true, error: null });
    const r = await reissue({ data: { classId: 'c1', memberId: 'm1' }, context });
    expect(r.token).toMatch(/^[a-f0-9]{64}$/);
    const call = adminRpc.mock.calls[0]!;
    expect(call[0]).toBe('rekey_pisan_session');
    expect(call[1].p_old_hash).toBe('f'.repeat(64));
    expect(call[1].p_new_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(call[1].p_new_hash).not.toBe(r.token); // la base ne voit jamais le code en clair
  });
});
