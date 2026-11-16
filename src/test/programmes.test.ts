import { describe, expect, it } from 'vitest';
import { COUNTRIES, NOTIONS, getNotion, localizeMath, chaptersForLevel } from '@/lib/curriculum';
import { PROGRAMMES, notionsForGrade, programmeFor, programmeNotions, tracksFor } from '@/lib/programmes';

const LANGS = ['fr', 'en', 'ar', 'es'] as const;
const filled = (l: Record<string, string>) => LANGS.every(lang => typeof l[lang] === 'string' && l[lang].trim().length > 0);

describe('Notions', () => {
  it('have unique ids', () => expect(new Set(NOTIONS.map(n => n.id)).size).toBe(NOTIONS.length));
  it('are translated in the 4 languages', () => {
    for (const n of NOTIONS) {
      expect(filled(n.name), n.id).toBe(true);
      expect(filled(n.lesson), n.id).toBe(true);
      for (const q of n.questions) if (typeof q.prompt !== 'string') expect(filled(q.prompt), `${n.id}: ${q.expr}`).toBe(true);
    }
  });
  it('have questions with a valid answer and distinct options', () => {
    for (const n of NOTIONS) {
      expect(n.questions.length, n.id).toBeGreaterThanOrEqual(2);
      for (const q of n.questions) {
        expect(q.answer, `${n.id}: ${q.expr}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${n.id}: ${q.expr}`).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, `${n.id}: ${q.expr}`).toBe(q.options.length);
      }
    }
  });
  it('do not always put the right answer in the same place', () => {
    const extra = NOTIONS.slice(11).flatMap(n => n.questions.map(q => q.answer));
    expect(new Set(extra).size).toBe(4);
  });
  it('point to existing prerequisites', () => {
    for (const n of NOTIONS) if (n.prereq) expect(() => getNotion(n.prereq!), n.id).not.toThrow();
  });
});

describe('Programmes', () => {
  it('only use existing notions and translated chapter titles', () => {
    for (const p of PROGRAMMES) {
      expect(p.chapters.length, `${p.country} ${p.grade}`).toBeGreaterThan(0);
      for (const c of p.chapters) {
        expect(filled(c.title), `${p.country} ${p.grade}`).toBe(true);
        expect(c.notions.length).toBeGreaterThan(0);
        for (const id of c.notions) expect(NOTIONS.some(n => n.id === id), `${p.country} ${p.grade}: ${id}`).toBe(true);
      }
      if (p.track) expect(filled(p.track.label)).toBe(true);
    }
  });
  it('point to real grades of the country', () => {
    for (const p of PROGRAMMES) expect(COUNTRIES.find(c => c.id === p.country)?.grades[p.grade], `${p.country} ${p.grade}`).toBeDefined();
  });
  it('cover 6e, 3e and Terminale (or their equivalents) in every requested country', () => {
    const wanted: [string, number][] = [['fr', 0], ['fr', 3], ['fr', 6], ['ma', 0], ['ma', 2], ['ma', 5], ['sn', 0], ['sn', 3], ['sn', 6], ['ci', 0], ['ci', 3], ['ci', 6], ['us', 0], ['us', 3], ['us', 6]];
    for (const [country, grade] of wanted) expect(programmeFor(country, grade), `${country} ${grade}`).not.toBeNull();
  });
  it('offer the Terminale tracks', () => {
    expect(tracksFor('fr', 6).map(t => t.id)).toEqual(['spe', 'comp']);
    expect(tracksFor('ma', 5).map(t => t.id)).toEqual(['pc-svt', 'sm']);
  });
  it('choose the right track, and the first one by default', () => {
    expect(programmeFor('ma', 5, 'sm')?.track?.id).toBe('sm');
    expect(programmeFor('ma', 5)?.track?.id).toBe('pc-svt');
    expect(programmeFor('ma', 5, 'unknown')?.track?.id).toBe('pc-svt');
  });
  it('keep track-specific chapters apart', () => {
    const ids = (country: string, grade: number, track?: string) => programmeNotions(programmeFor(country, grade, track)!).map(n => n.id);
    expect(ids('ma', 5, 'sm')).toContain('congruences');
    expect(ids('ma', 5, 'pc-svt')).not.toContain('congruences');
    expect(ids('fr', 6, 'comp')).toContain('regression');
    expect(ids('fr', 6, 'spe')).toContain('space-geometry');
    expect(ids('fr', 3)).not.toContain('systems'); // plus au programme du collège en France
    expect(ids('ma', 2)).toContain('systems');
  });
  it('fall back to the age level when a country has no programme yet', () => {
    expect(programmeFor('uk', 0)).toBeNull();
    expect(notionsForGrade('uk', 0, chaptersForLevel).map(n => n.id)).toEqual(chaptersForLevel(0).map(n => n.id));
  });
});

describe('Decimal display', () => {
  it('uses a decimal point in English only', () => {
    expect(localizeMath('3,7 + 2,45', 'en')).toBe('3.7 + 2.45');
    expect(localizeMath('3,7 + 2,45', 'fr')).toBe('3,7 + 2,45');
    expect(localizeMath('A(2 ; 3)', 'en')).toBe('A(2 ; 3)');
  });
});
