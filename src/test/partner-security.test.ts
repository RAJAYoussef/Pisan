import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shouldShowTestBar } from '@/lib/test-mode';

const { from, queries } = vi.hoisted(() => ({ from: vi.fn(), queries: [] as Array<{ table: string; filters: Record<string, unknown> }> }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }),
}));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { from } }));
import { openSession } from '@/lib/session.functions';

const profile = { nickname: 'Test', country: 'ma', grade: 0, lang: 'fr' as const };
let existingPartner = false;
let active = true;
let lookupError = false;
let savedPartner: boolean | undefined;
// Exercise the real handler, replacing only the database transport.
const open = openSession as unknown as (input: { data: { token: string; profile: typeof profile; code?: string } }) => Promise<{ partner: boolean }>;

beforeEach(() => {
  existingPartner = false; active = true; lookupError = false; savedPartner = undefined; queries.length = 0;
  from.mockImplementation((table: string) => {
    const filters: Record<string, unknown> = {};
    queries.push({ table, filters });
    const chain = {
      select: () => chain,
      eq: (key: string, value: unknown) => { filters[key] = value; return chain; },
      ilike: (key: string, value: string) => { filters[key] = value; return chain; },
      maybeSingle: async () => table === 'learning_sessions'
        ? { data: existingPartner ? { partner: true } : null, error: null }
        : { data: active && filters['active'] === true && String(filters['code']).toUpperCase() === 'PILOTE2026' ? { code: 'PILOTE2026' } : null, error: lookupError ? new Error('offline') : null },
      upsert: (value: { partner: boolean }) => { savedPartner = value.partner; return chain; },
      single: async () => ({ data: { partner: savedPartner }, error: null }),
    };
    return chain;
  });
});

const register = (code?: string) => open({ data: { token: 'a'.repeat(64), profile, code } });
describe('Private partner code verification', () => {
  it('accepts PILOTE2026 without case sensitivity and trims spaces', async () => {
    expect((await register('  pilote2026  ')).partner).toBe(true);
    expect(queries.find(q => q.table === 'partner_codes')?.filters).toEqual({ active: true, code: 'pilote2026' });
  });
  it('rejects an unknown code', async () => { expect((await register('WRONG')).partner).toBe(false); });
  it('rejects an inactive code', async () => { active = false; expect((await register('PILOTE2026')).partner).toBe(false); });
  it('does not allow wildcard code matching', async () => {
    expect((await register('%_'))).partner.toBe(false);
    expect(queries.find(q => q.table === 'partner_codes')?.filters['code']).toBe('\\%\\_');
  });
  it('keeps discovery access when no code is supplied', async () => { expect((await register()).partner).toBe(false); expect(queries.some(q => q.table === 'partner_codes')).toBe(false); });
  it('preserves existing partner access on profile updates', async () => { existingPartner = true; expect((await register()).partner).toBe(true); });
  it('fails closed when code verification is unavailable', async () => { lookupError = true; await expect(register('PILOTE2026')).rejects.toThrow(); expect(savedPartner).toBeUndefined(); });
});

describe('Test bar visibility', () => {
  it('is available in development', () => expect(shouldShowTestBar(true, 'localhost')).toBe(true));
  it('is available in the Lovable preview', () => expect(shouldShowTestBar(false, 'id-preview--69d8c47f-9c43-4f28-b890-247a7ddace7a.lovable.app')).toBe(true));
  it('is hidden on the production site', () => expect(shouldShowTestBar(false, 'pisan.lovable.app')).toBe(false));
  it('is hidden on custom domains and lookalike preview domains', () => {
    expect(shouldShowTestBar(false, 'maths.example.com')).toBe(false);
    expect(shouldShowTestBar(false, 'id-preview--test.lovable.app.example.com')).toBe(false);
  });
});