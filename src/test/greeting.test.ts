import { describe, expect, it } from 'vitest';
import { greeting } from '@/lib/greeting';

describe('Salutation de l’accueil', () => {
  it('says Bonjour until 15:59 and Bonsoir from 16:00', () => {
    expect(greeting('fr', 8)).toBe('Bonjour');
    expect(greeting('fr', 15)).toBe('Bonjour');
    expect(greeting('fr', 16)).toBe('Bonsoir');
    expect(greeting('fr', 23)).toBe('Bonsoir');
    expect(greeting('fr', 2)).toBe('Bonsoir'); // en pleine nuit
    expect(greeting('fr', 5)).toBe('Bonjour');
  });
  it('is translated', () => {
    expect([greeting('en', 9), greeting('en', 18)]).toEqual(['Hello', 'Good evening']);
    expect([greeting('es', 9), greeting('es', 18)]).toEqual(['Buenos días', 'Buenas tardes']);
    expect([greeting('ar', 9), greeting('ar', 18)]).toEqual(['مرحبًا', 'مساء الخير']);
  });
});
