import { describe, expect, it } from 'vitest';
import { isAdmin, mustChangePassword, passwordOk, temporaryPassword } from '@/lib/teacher-accounts';
import { COUNTRIES, countriesByName } from '@/lib/curriculum';

describe('Comptes enseignants', () => {
  it('temporary passwords are readable, random and never ambiguous', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const p = temporaryPassword();
      expect(p).toMatch(/^[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}$/);
      expect(p).not.toMatch(/[01OIl]/);
      seen.add(p);
    }
    expect(seen.size).toBe(200);
  });
  it('a chosen password needs 10 characters with letters and digits', () => {
    expect([passwordOk('court1'), passwordOk('sanschiffres'), passwordOk('1234567890'), passwordOk('pisan2026maths')]).toEqual([false, false, false, true]);
  });
  it('admin and first-login flags only come from the server metadata', () => {
    expect(isAdmin({ pisan_admin: true })).toBe(true);
    expect(isAdmin({ pisan_admin: 'true' })).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(mustChangePassword({ must_change_password: true })).toBe(true);
    expect(mustChangePassword({})).toBe(false);
  });
});

describe('Pays', () => {
  it('are listed in alphabetical order of their name, in every language', () => {
    for (const lang of ['fr', 'en', 'ar', 'es'] as const) {
      const names = countriesByName(lang).map(c => c.name[lang]);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, lang)));
      expect(names).toHaveLength(COUNTRIES.length);
    }
    expect(countriesByName('fr')[0]!.name.fr.localeCompare(countriesByName('fr')[1]!.name.fr, 'fr')).toBeLessThan(0);
  });
});
