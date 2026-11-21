import { afterEach, describe, expect, it, vi } from 'vitest';
import { newTicket, readTicket, signTicket } from '@/lib/skill-session';
import { signingSecrets } from '@/lib/signing-secrets';
import { readSessionKey, writeSessionKey } from '@/lib/recovery';
import { SECURITY_HEADERS, withSecurityHeaders } from '@/server';

const HASH = 'a'.repeat(64);

describe('Corrections de l’audit', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  it('signs with the dedicated secret and still accepts tickets signed with the old key', async () => {
    vi.stubEnv('PISAN_SIGNING_SECRET', 'nouveau-secret-pisan-0123456789');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'ancienne-cle-service-0123456789');
    const keys = signingSecrets();
    expect(keys[0]).toBe('nouveau-secret-pisan-0123456789');
    const t = newTicket(HASH, 'skill', ['frac-meaning']);
    const old = await signTicket(t, 'ancienne-cle-service-0123456789');
    expect(await readTicket(old, keys, HASH)).toEqual(t);
    expect(await readTicket(await signTicket(t, keys[0]!), keys, HASH)).toEqual(t);
    expect(await readTicket(await signTicket(t, 'pirate-0123456789-abcdef'), keys, HASH)).toBeNull();
  });
  it('refuses to sign without any secret', () => {
    vi.stubEnv('PISAN_SIGNING_SECRET', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect(() => signingSecrets()).toThrow();
  });
  it('adds the security headers without replacing those already set', () => {
    const res = withSecurityHeaders(new Response('ok', { status: 201, headers: { 'referrer-policy': 'no-referrer' } }));
    expect(res.status).toBe(201);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toBe(SECURITY_HEADERS['content-security-policy']);
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect(res.headers.get('x-frame-options')).toBeNull();
  });
  it('keeps working when the browser blocks storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('SecurityError'); });
    expect(writeSessionKey('b'.repeat(64))).toBe(false);
    expect(readSessionKey()).toEqual({ key: 'b'.repeat(64), persisted: false });
  });
});
