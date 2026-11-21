import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Splash, SPLASH_MS, SPLASH_PIECES } from '@/components/pisan/splash';

describe('Écran de lancement', () => {
  it('builds the π from its ten blocks, then shows the word PiSan', () => {
    const { container } = render(<Splash />);
    expect(container.querySelectorAll('.splash-piece')).toHaveLength(10);
    expect(SPLASH_PIECES).toHaveLength(10);
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
