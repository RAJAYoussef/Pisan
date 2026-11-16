import { describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ row: { profile: { nickname: 'A', country: 'ma', grade: 3, lang: 'fr', timezone: 'Africa/Casablanca' }, progress: { attempts: [], unlocked: [] }, challenge_day: null as string | null }, quotaCalls: 0 }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock('@/integrations/supabase/client.server', () => {
  const chain: Record<string, unknown> = {};
  Object.assign(chain, { select: () => chain, eq: () => chain, single: async () => ({ data: db.row, error: null }), update: (u: Record<string, unknown>) => { Object.assign(db.row, u); return chain; } });
  return { supabaseAdmin: {
    from: () => chain,
    // Same rule as public.claim_pisan_challenge: refuse a second claim on the same local day.
    rpc: async (name: string, args: { p_day: string }) => {
      if (name === 'claim_pisan_challenge') { if (db.row.challenge_day === args.p_day) return { data: false, error: null }; db.row.challenge_day = args.p_day; return { data: true, error: null }; }
      if (name === 'consume_pisan_exercise') db.quotaCalls++;
      return { data: { count: 1, last_day: args.p_day, freezes: 0, used_freeze: false, restarted: false }, error: null };
    },
  } };
});
import { answerChallenge } from '@/lib/session.functions';
const answer = answerChallenge as unknown as (i: { data: { token: string; choice?: number } }) => Promise<{ status: string; streak?: { count: number } }>;

describe('Défi du jour côté serveur', () => {
  it('cannot be replayed the same day, counts for the streak, and does not use the exercise quota', async () => {
    const token = 'a'.repeat(64);
    const first = await answer({ data: { token, choice: 0 } });
    expect(first.status).toBe('done');
    expect(first.streak?.count).toBe(1);
    expect((await answer({ data: { token, choice: 1 } })).status).toBe('already');
    expect(db.quotaCalls).toBe(0);
  });
});
