import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Splash, SPLASH_MS } from '@/components/pisan/splash';
import { PI_BLOCKS } from '@/components/pisan/pi-blocks';

describe('Écran de lancement', () => {
  it('builds the π from its ten 3D blocks, then shows the word PiSan', () => {
    const { container } = render(<Splash />);
    expect(container.querySelectorAll('.splash-piece')).toHaveLength(10);
    // chaque bloc a une épaisseur : une face avant et des couches en profondeur
    for (const piece of container.querySelectorAll('.splash-piece')) { expect(piece.querySelectorAll('.splash-front')).toHaveLength(1); expect(piece.querySelectorAll('.splash-side').length).toBeGreaterThan(3); }
    expect(PI_BLOCKS).toHaveLength(10);
    // des formes vectorielles nettes, pas une image découpée
    expect(container.querySelectorAll('.splash img')).toHaveLength(0);
    expect(PI_BLOCKS.at(-1)!.id).toBe('face');
    expect(container.querySelector('.splash-word')!.textContent).toBe('PiSan');
    // chaque bloc se pose après le précédent
    const delays = [...container.querySelectorAll<HTMLElement>('.splash-piece')].map(el => parseInt(el.style.animationDelay));
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
  });
  it('leaves by itself, and a tap skips it', () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<Splash />);
    act(() => { vi.advanceTimersByTime(SPLASH_MS + 10); });
    expect(container.querySelector('.splash')).toBeNull();
    unmount();
    vi.useRealTimers();
    const second = render(<Splash />);
    fireEvent.click(second.container.querySelector('.splash')!);
    expect(second.container.querySelector('.splash')).toBeNull();
  });
});
