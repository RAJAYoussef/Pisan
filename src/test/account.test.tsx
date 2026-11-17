import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { formatRecovery, parseRecovery } from '@/lib/recovery';
import { AccountSection, ResumeProfile } from '@/components/pisan/account';

const TOKEN = '0123456789abcdef'.repeat(4);

describe('Code de reprise', () => {
  it('is written in 8 groups and read back however it is typed', () => {
    const code = formatRecovery(TOKEN);
    expect(code).toBe('01234567-89ABCDEF-01234567-89ABCDEF-01234567-89ABCDEF-01234567-89ABCDEF');
    expect(parseRecovery(code)).toBe(TOKEN);
    expect(parseRecovery(` ${code.toLowerCase().replace(/-/g, ' ')} `)).toBe(TOKEN);
    expect(parseRecovery(code.slice(0, -1))).toBeNull();
    expect(parseRecovery(code.replace('A', 'G'))).toBeNull();
  });
});

describe('Se déconnecter', () => {
  it('hides the code by default, then asks for confirmation before logging out', () => {
    const onLogout = vi.fn();
    render(<AccountSection lang="fr" token={TOKEN} onLogout={onLogout} />);
    expect(screen.queryByText(formatRecovery(TOKEN))).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Afficher/ }));
    expect(screen.getByText(formatRecovery(TOKEN))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Se déconnecter de cet appareil/ }));
    expect(onLogout).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog').textContent).toMatch(/code de reprise/);
    fireEvent.click(screen.getByRole('button', { name: /^Se déconnecter$/ }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe('Reprendre un profil', () => {
  it('rejects an incomplete code without asking the server', async () => {
    const onResume = vi.fn(async () => true);
    render(<ResumeProfile lang="fr" onResume={onResume} />);
    fireEvent.click(screen.getByRole('button', { name: /J’ai déjà un profil/ }));
    fireEvent.change(screen.getByLabelText('Ton code de reprise'), { target: { value: 'ABCD-1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reprendre mon profil' }));
    expect(screen.getByRole('alert').textContent).toMatch(/64 caractères/);
    expect(onResume).not.toHaveBeenCalled();
  });
  it('sends the clean code, and says when no profile matches', async () => {
    const onResume = vi.fn(async () => false);
    render(<ResumeProfile lang="fr" onResume={onResume} />);
    fireEvent.click(screen.getByRole('button', { name: /J’ai déjà un profil/ }));
    fireEvent.change(screen.getByLabelText('Ton code de reprise'), { target: { value: formatRecovery(TOKEN) } });
    fireEvent.click(screen.getByRole('button', { name: 'Reprendre mon profil' }));
    await waitFor(() => expect(onResume).toHaveBeenCalledWith(TOKEN));
    expect((await screen.findByRole('alert')).textContent).toMatch(/Aucun profil/);
  });
});
