import { describe, expect, it } from 'vitest';
import { expectedValues, figureProblem, GRID, placementOk, pointN, pythagorasProblem, thalesProblem, valueOk } from '@/lib/figures';

describe('Figures : Pythagore', () => {
  it('always draws a right triangle that fits the grid, with whole sides', () => {
    for (let seed = 0; seed < 200; seed++) {
      const p = pythagorasProblem(seed);
      expect(p.ab * p.ab + p.ac * p.ac).toBe(p.bc * p.bc);
      expect(Math.max(p.ab, p.ac)).toBeLessThanOrEqual(GRID);
    }
  });
  it('checks the placement, then BC² and BC', () => {
    const p = pythagorasProblem(3);
    expect(placementOk(p, p.ab, p.ac)).toBe(true);
    expect(placementOk(p, p.ac === p.ab ? p.ab + 1 : p.ac, p.ab)).toBe(false);
    expect(expectedValues(p)).toEqual([p.bc * p.bc, p.bc]);
  });
});

describe('Figures : Thalès', () => {
  it('always gives whole lengths AM and MN, with M strictly inside [AB]', () => {
    for (let seed = 0; seed < 200; seed++) {
      const p = thalesProblem(seed);
      expect(Number.isInteger(p.am) && Number.isInteger(p.mn)).toBe(true);
      expect(p.am).toBeGreaterThan(0);
      expect(p.am).toBeLessThan(p.ab);
      expect(p.am / p.ab).toBeCloseTo(p.ratio[0] / p.ratio[1]);
      expect(p.mn / p.bc).toBeCloseTo(p.ratio[0] / p.ratio[1]);
    }
  });
  it('keeps (MN) parallel to (BC) wherever M is', () => {
    const p = thalesProblem(5);
    for (let am = 1; am < p.ab; am++) {
      const n = pointN(p, am);
      // BC est vertical (C au-dessus de B) : MN aussi, donc N a la même abscisse que M.
      expect(n.x).toBeCloseTo(am);
      expect(n.y / p.bc).toBeCloseTo(am / p.ab);
    }
  });
  it('accepts the ratio as a fraction, an equivalent fraction or a rounded decimal', () => {
    expect(valueOk('1/3', 1 / 3)).toBe(true);
    expect(valueOk('2/6', 1 / 3)).toBe(true);
    expect(valueOk('0,33', 1 / 3)).toBe(true);
    expect(valueOk('0.3', 1 / 3)).toBe(false);
    expect(valueOk('3', 3)).toBe(true);
    expect(valueOk('3,0', 3)).toBe(true);
    expect(valueOk('2,99', 3)).toBe(false);
    expect(valueOk('x', 3)).toBe(false);
  });
  it('is deterministic for a given seed', () => {
    expect(figureProblem('thales', 42)).toEqual(figureProblem('thales', 42));
  });
});

import { angleDeg, answerOk, figureChapter, figuresFor, inscribedAngle, inscribedProblem, INSCRIBED_SPAN, trigoProblem } from '@/lib/figures';
import { programmeFor, programmeNotions } from '@/lib/programmes';

describe('Figures : trigonométrie', () => {
  it('uses right triangles with whole sides that fit the grid', () => {
    for (let seed = 0; seed < 200; seed++) {
      const p = trigoProblem(seed);
      expect(p.ab * p.ab + p.bc * p.bc).toBe(p.ac * p.ac);
      expect(Math.max(p.ab, p.bc)).toBeLessThanOrEqual(GRID);
      expect(p.angle).toBe(angleDeg(p.bc, p.ab));
    }
  });
  it('checks BC, then cos Â, then Â to the nearest degree', () => {
    const p = trigoProblem(1);
    expect(placementOk(p, 0, p.bc)).toBe(true);
    expect(placementOk(p, 0, p.bc + 1)).toBe(false);
    expect(answerOk(p, 1, `${p.ab}/${p.ac}`)).toBe(true);
    expect(answerOk(p, 1, `${p.bc}/${p.ac}`)).toBe(false); // sinus au lieu de cosinus
    expect(answerOk(p, 2, String(p.angle))).toBe(true);
    expect(answerOk(p, 2, `${p.angle + 1}°`)).toBe(true); // arrondi voisin accepté
    expect(answerOk(p, 2, String(p.angle + 3))).toBe(false);
  });
  it('knows the classic angle of the 3-4-5 triangle', () => expect(angleDeg(3, 4)).toBe(37));
});

describe('Figures : angles inscrits', () => {
  it('asks values that stay whole and on the right arc', () => {
    for (let seed = 0; seed < 100; seed++) {
      const p = inscribedProblem(seed);
      expect(p.askCentral).not.toBe(p.central);
      expect(Number.isInteger(inscribedAngle(p.askCentral))).toBe(true);
      expect(p.askInscribed * 2).toBeLessThan(180);
    }
  });
  it('requires moving M far enough, then applies the half rule both ways', () => {
    const p = inscribedProblem(2);
    expect(placementOk(p, INSCRIBED_SPAN - 5)).toBe(false);
    expect(placementOk(p, INSCRIBED_SPAN)).toBe(true);
    expect(answerOk(p, 1, String(p.askCentral / 2))).toBe(true);
    expect(answerOk(p, 1, String(p.askCentral))).toBe(false);
    expect(answerOk(p, 2, `${p.askInscribed * 2}°`)).toBe(true);
  });
});

describe('Figures proposées selon le programme', () => {
  const at = (country: string, grade: number) => { const p = programmeFor(country, grade)!; return figuresFor(p, programmeNotions(p).map(n => n.id), 0); };
  it('Maroc 3e année collège : Pythagore (rappel), Thalès, trigonométrie et angles inscrits', () => {
    expect(at('ma', 2)).toEqual(['pythagoras', 'thales', 'trigo', 'inscribed', 'vectors', 'affine', 'stats']);
    expect(figureChapter(programmeFor('ma', 2), 'pythagoras')).toBeNull(); // Pythagore est vu en 2AC : « rappel »
    expect(figureChapter(programmeFor('ma', 2), 'inscribed')?.fr).toBe('Angles inscrits et angles au centre');
  });
  it('France 3e : pas d’angles inscrits (hors programme)', () => {
    expect(at('fr', 3)).toEqual(['pythagoras', 'thales', 'trigo', 'affine', 'stats']);
  });
  it('France 6e : aucune de ces figures, même si la 6e a un chapitre de géométrie', () => {
    expect(at('fr', 0)).toEqual([]);
  });
  it('Côte d’Ivoire 3e : le chapitre « Triangle rectangle » sert à Pythagore et à la trigonométrie', () => {
    const p = programmeFor('ci', 3);
    expect(at('ci', 3)).toEqual(['pythagoras', 'thales', 'trigo', 'inscribed', 'vectors', 'affine', 'stats']);
    expect(figureChapter(p, 'pythagoras')?.fr).toBe('Triangle rectangle');
    expect(figureChapter(p, 'trigo')?.fr).toBe('Triangle rectangle');
  });
});
