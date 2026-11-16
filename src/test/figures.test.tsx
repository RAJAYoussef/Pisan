import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectedValues, figureProblem, GRID, placementOk, pointN, pythagorasProblem, thalesProblem, valueOk } from '@/lib/figures';
import { FigureActivity } from '@/components/pisan/figures';

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

describe('Activité à l’écran', () => {
  it('can be completed with the keyboard only, then saves the result', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(3);
    const p = pythagorasProblem(3);
    const onSave = vi.fn(async () => {});
    render(<FigureActivity lang="fr" kind="pythagoras" onSave={onSave} onBack={() => {}} />);
    const move = (name: string, to: number) => { const h = screen.getByRole('slider', { name }); for (let v = 2; v < to; v++) fireEvent.keyDown(h, { key: 'ArrowRight' }); };
    move('B', p.ab); move('C', p.ac);
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: String(p.bc * p.bc) } });
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    fireEvent.change(screen.getByLabelText('Ta réponse'), { target: { value: String(p.bc) } });
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(await screen.findByText('Bravo, figure réussie !')).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ kind: 'workshop', notion: 'pythagoras-thales', correct: 1 }));
    vi.restoreAllMocks();
  });
  it('gives a hint instead of the answer when wrong', () => {
    vi.spyOn(Date, 'now').mockReturnValue(3);
    render(<FigureActivity lang="fr" kind="pythagoras" onSave={async () => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Vérifier/ }));
    expect(screen.getByText(/compte les carreaux/)).toBeTruthy();
    vi.restoreAllMocks();
  });
});
