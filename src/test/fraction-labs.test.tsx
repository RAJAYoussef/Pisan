import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FractionAdditionLab, FractionEquivalenceLab, FractionNumberLineLab } from '@/components/pisan/fraction-labs';

describe('Fraction interactive labs', () => {
  it('builds an equivalent fraction by shading the refined partition', () => {
    const done = vi.fn();
    render(<FractionEquivalenceLab lang="fr" source={{ n: 1, d: 2 }} factor={2} onComplete={done} />);
    fireEvent.click(screen.getByRole('button', { name: 'Parts coloriées 1/4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parts coloriées 2/4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(done).toHaveBeenCalledWith(true);
  });

  it('composes a sum with equal-sized parts', () => {
    const done = vi.fn();
    render(<FractionAdditionLab lang="fr" left={{ n: 1, d: 4 }} right={{ n: 2, d: 4 }} onComplete={done} />);
    fireEvent.click(screen.getByRole('button', { name: 'Parts coloriées 1/4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parts coloriées 2/4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parts coloriées 3/4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(done).toHaveBeenCalledWith(true);
  });

  it('locates a fraction on the unit interval', () => {
    const done = vi.fn();
    render(<FractionNumberLineLab lang="fr" target={{ n: 1, d: 2 }} onComplete={done} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Position choisie' }), { target: { value: '0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(done).toHaveBeenCalledWith(true);
  });
});
