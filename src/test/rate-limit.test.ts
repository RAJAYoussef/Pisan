import { describe, expect, it, vi } from 'vitest';

// Une seule connexion pour tout l'établissement, et une table rate_limits en mémoire (même logique que la base).
const store = vi.hoisted(() => new Map<string, { count: number; window_start: string }>());
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader: () => '203.0.113.7', getRequestIP: () => undefined }));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: {
    rpc: async (_: string, a: { p_key: string; p_limit: number; p_window_seconds: number }) => {
      const row = store.get(a.p_key);
      const fresh = row && Date.parse(row.window_start) > Date.now() - a.p_window_seconds * 1000;
      const next = fresh ? { ...row!, count: row!.count + 1 } : { count: 1, window_start: new Date().toISOString() };
      store.set(a.p_key, next);
      return { data: next.count <= a.p_limit, error: null };
    },
    from: () => { let key = ''; const q = { select: () => q, eq: (_: string, v: string) => { key = v; return q; }, maybeSingle: async () => ({ data: store.get(key) ?? null, error: null }) }; return q; },
  },
}));

vi.stubEnv('PISAN_SIGNING_SECRET', 'secret-de-test-0123456789abcdef');
import { allowed, blocked, countFailure } from '@/lib/rate-limit.server';
import { OPEN_PER_HOUR, PARTNER_FAILURES_PER_HOUR } from '@/lib/session.functions';

describe('Limites par connexion (établissements)', () => {
  it('a whole school (3 classes of 30) can create its profiles in the same hour', async () => {
    store.clear();
    for (let i = 0; i < 90; i++) expect(await allowed('open', OPEN_PER_HOUR, 3600)).toBe(true);
    expect(OPEN_PER_HOUR).toBeGreaterThanOrEqual(500);
  });
  it('a class typing the right partner code is never blocked; wrong codes are', async () => {
    store.clear();
    // 30 élèves avec le bon code : rien n'est compté.
    for (let i = 0; i < 30; i++) expect(await blocked('partner-fail', PARTNER_FAILURES_PER_HOUR, 3600)).toBe(false);
    // Des essais au hasard : bloqués au-delà de 20.
    for (let i = 0; i < PARTNER_FAILURES_PER_HOUR; i++) { expect(await blocked('partner-fail', PARTNER_FAILURES_PER_HOUR, 3600)).toBe(false); await countFailure('partner-fail', 3600); }
    expect(await blocked('partner-fail', PARTNER_FAILURES_PER_HOUR, 3600)).toBe(true);
  });
});
