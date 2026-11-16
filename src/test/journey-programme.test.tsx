import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Journey } from '@/components/pisan/progress';
import { programmeFor } from '@/lib/programmes';
import { emptyProgress } from '@/lib/pisan';

describe('Parcours avec le programme officiel', () => {
  it('shows the official chapters of a Moroccan 2nd Bac sciences-maths student', () => {
    render(<Journey lang="fr" level={6} programme={programmeFor('ma', 5, 'sm')} progress={emptyProgress} onPractice={() => {}} />);
    expect(screen.getByText('Structures algébriques')).toBeTruthy();
    expect(screen.getByText('Arithmétique dans ℤ')).toBeTruthy();
    expect(screen.getByText(/Sciences mathématiques/)).toBeTruthy();
  });
  it('shows chapter titles in Arabic', () => {
    render(<Journey lang="ar" level={3} programme={programmeFor('ma', 2)} progress={emptyProgress} onPractice={() => {}} />);
    expect(screen.getByText('نظمة معادلتين من الدرجة الأولى بمجهولين')).toBeTruthy();
  });
});
