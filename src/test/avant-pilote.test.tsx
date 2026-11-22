import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const { adminFrom, adminRpc, getUserById, allowedMock } = vi.hoisted(() => ({ adminFrom: vi.fn(), adminRpc: vi.fn(), getUserById: vi.fn(), allowedMock: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; }, useServerFn: (fn: unknown) => fn }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { from: adminFrom, rpc: adminRpc, auth: { admin: { getUserById } } } }));
vi.mock('@/lib/rate-limit.server', () => ({ allowed: allowedMock }));

import { formatShort, newShortCode, normalizeShort, resolveRecovery, SHORT_ALPHABET, tokenFromShort } from '@/lib/recovery';
import { expectedAnswer, reportedStep, reportInput, reviewIndex } from '@/lib/reports';
import * as reports from '@/lib/reports.functions';
import * as session from '@/lib/session.functions';
import { reviewStep, SKILLS } from '@/lib/skills';
import { StepView } from '@/components/pisan/skills';
import type { Step } from '@/lib/skill-kit';

beforeEach(() => { vi.clearAllMocks(); allowedMock.mockResolvedValue(true); });
const L = (s: string) => ({ fr: s, en: s, ar: s, es: s });

describe('Code de reprise court', () => {
  it('draws 12 characters from an unambiguous alphabet', () => {
    for (let i = 0; i < 50; i++) { const c = newShortCode(); expect(c).toHaveLength(12); expect([...c].every(ch => SHORT_ALPHABET.includes(ch))).toBe(true); }
    expect(SHORT_ALPHABET).not.toMatch(/[ILOU]/);
  });
  it('forgives case, separators and look-alike letters', () => {
    expect(normalizeShort('ab3d-ef7h-k9mn')).toBe('AB3DEF7HK9MN');
    expect(normalizeShort('AB3D EF7H K9MO')).toBe('AB3DEF7HK9M0');
    expect(normalizeShort('ab3d-ef7h-k9ml')).toBe('AB3DEF7HK9M1');
    expect(normalizeShort('AB3D-EF7H')).toBeNull();
    expect(normalizeShort('AB3D-EF7H-K9MU')).toBeNull();
    expect(formatShort('AB3DEF7HK9MN')).toBe('AB3D-EF7H-K9MN');
  });
  it('derives the same 64-hex key on every device, a different one for another code', async () => {
    const a = await tokenFromShort('AB3DEF7HK9MN');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await tokenFromShort('AB3DEF7HK9MN')).toBe(a);
    expect(await tokenFromShort('AB3DEF7HK9MP')).not.toBe(a);
    expect(await resolveRecovery('ab3d-ef7h-k9mn')).toEqual({ token: a, short: 'AB3DEF7HK9MN' });
  });
  it('still accepts the old 64-character codes', async () => {
    const long = 'a'.repeat(64);
    expect(await resolveRecovery(long)).toEqual({ token: long, short: null });
    expect(await resolveRecovery('nope')).toBeNull();
  });
  it('switching to a short code rekeys the session by hashes only', async () => {
    adminRpc.mockResolvedValue({ data: true, error: null });
    const sw = session.switchRecovery as unknown as (i: unknown) => Promise<{ ok: boolean }>;
    const r = await sw({ data: { token: 'a'.repeat(64), newToken: 'b'.repeat(64) } });
    expect(r.ok).toBe(true);
    const [name, args] = adminRpc.mock.calls[0]! as [string, Record<string, string>];
    expect(name).toBe('rekey_pisan_session');
    expect(Object.values(args).join(' ')).not.toContain('a'.repeat(64));
    expect(Object.values(args).join(' ')).not.toContain('b'.repeat(64));
  });
});

describe('Test de positionnement : valider sans correction', () => {
  const choice = { type: 'choice', prompt: L('?'), options: [L('Un'), L('Deux')], answer: 1, hint: L('') } as Step;
  it('selecting an option does not answer nor reveal; « Valider » does', () => {
    const onAnswer = vi.fn();
    render(<StepView lang="fr" step={choice} solved={false} submitLabel="Valider" onAnswer={onAnswer} />);
    const valider = screen.getByRole('button', { name: /Valider/ });
    expect(valider).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Un' }));
    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.queryByText(/C’est juste/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Deux' }));
    fireEvent.click(valider);
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith({ type: 'choice', choice: 1 });
  });
  it('outside a test, a click still answers right away', () => {
    const onAnswer = vi.fn();
    render(<StepView lang="fr" step={choice} solved={false} onAnswer={onAnswer} />);
    expect(screen.queryByRole('button', { name: /Valider/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Un' }));
    expect(onAnswer).toHaveBeenCalledWith({ type: 'choice', choice: 0 });
  });
});

describe('Signaler une erreur', () => {
  it('points at the very step shown in quick checks and placement tests', () => {
    for (const skill of SKILLS) {
      const i = reviewIndex(skill.id, 1234);
      expect(reportedStep(skill.id, 1234, i)).toEqual(reviewStep(skill, 1234));
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(30);
    }
  });
  it('shows the expected answer of every step', () => {
    for (const skill of SKILLS) for (const step of skill.build(77).steps) expect(expectedAnswer(step, 'fr').length).toBeGreaterThan(0);
  });
  it('validates the input strictly', () => {
    const ok = { skill: SKILLS[0]!.id, seed: 5, step: 0, context: 'pathway', lang: 'fr', reason: 'unclear', message: '  trop vague  ' };
    expect(reportInput.parse(ok).message).toBe('trop vague');
    expect(reportInput.safeParse({ ...ok, message: 'x'.repeat(501) }).success).toBe(false);
    expect(reportInput.safeParse({ ...ok, reason: 'spam' }).success).toBe(false);
    expect(reportInput.safeParse({ ...ok, token: 'a'.repeat(64) }).success).toBe(false);
  });
  const send = reports.reportQuestion as unknown as (i: unknown) => Promise<{ ok: boolean; reason?: string }>;
  const base = { skill: SKILLS[0]!.id, seed: 5, step: 0, context: 'review', lang: 'fr', reason: 'wrong-answer', message: '' };
  it('stores a report with no learner identifier', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    adminFrom.mockReturnValue({ insert });
    expect(await send({ data: base })).toEqual({ ok: true });
    expect(adminFrom).toHaveBeenCalledWith('question_reports');
    expect(Object.keys((insert.mock.calls[0] as unknown[])[0] as object).sort()).toEqual(['context', 'lang', 'message', 'reason', 'seed', 'skill_id', 'step']);
  });
  it('refuses unknown questions and floods', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    adminFrom.mockReturnValue({ insert });
    expect(await send({ data: { ...base, step: 30 } })).toEqual({ ok: false, reason: 'unknown' });
    allowedMock.mockResolvedValue(false);
    expect(await send({ data: base })).toEqual({ ok: false, reason: 'limit' });
    expect(insert).not.toHaveBeenCalled();
  });
  it('only the administrator lists or closes reports', async () => {
    getUserById.mockResolvedValue({ data: { user: { app_metadata: {} } }, error: null });
    const list = reports.listReports as unknown as (i: unknown) => Promise<unknown>;
    const close = reports.setReportStatus as unknown as (i: unknown) => Promise<unknown>;
    await expect(list({ data: { status: 'open' }, context: { userId: 'u' } })).rejects.toThrow('administrateur');
    await expect(close({ data: { id: crypto.randomUUID(), status: 'done' }, context: { userId: 'u' } })).rejects.toThrow('administrateur');
    expect(adminFrom).not.toHaveBeenCalled();
  });
});
