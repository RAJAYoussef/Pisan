import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FractionBars } from '@/components/pisan/fraction-bars';

describe('FractionBars', () => {
  it('requires the student to shade both fractions before comparing', () => {
    const onComplete = vi.fn();
    render(<FractionBars lang="fr" left={{ n: 1, d: 2 }} right={{ n: 2, d: 3 }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(onComplete).toHaveBeenCalledWith(false);
    expect(screen.getByText(/représentation ne montre pas encore/i)).toBeInTheDocument();
  });

  it('accepts an accurately shaded and correctly compared pair', () => {
    const onComplete = vi.fn();
    render(<FractionBars lang="fr" left={{ n: 1, d: 2 }} right={{ n: 2, d: 3 }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Part 1 / 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Part 1 / 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Part 2 / 3' }));
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(onComplete).toHaveBeenCalledWith(true);
    expect(screen.getByText('Bonne comparaison')).toBeInTheDocument();
  });

  it('reports a wrong relation without confirming a misconception', () => {
    const onDiagnosis = vi.fn();
    render(<FractionBars lang="fr" left={{ n: 1, d: 2 }} right={{ n: 2, d: 3 }} onDiagnosis={onDiagnosis} />);
    fireEvent.click(screen.getByRole('button', { name: 'Part 1 / 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Part 1 / 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Part 2 / 3' }));
    fireEvent.click(screen.getByRole('button', { name: '>' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
    expect(onDiagnosis).toHaveBeenCalledWith(expect.objectContaining({ correct: false, misconception: 'unknown', confirmed: false }));
  });
});
