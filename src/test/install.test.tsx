import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isIosDevice, resetInstallSupport, shouldRegisterServiceWorker, startInstallSupport } from '@/lib/install';
import { InstallBanner, InstallCard } from '@/components/pisan/install-app';

const root = join(__dirname, '..', '..');
const setMatch = (coarse: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query === '(pointer: coarse)' ? coarse : false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() }));
};
beforeEach(() => { resetInstallSupport(); setMatch(false); try { localStorage.clear(); } catch { /* */ } });
afterEach(() => { vi.restoreAllMocks(); });

describe('Application installable : réglages', () => {
  it('the manifest is valid and its icons exist', () => {
    const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8')) as { short_name: string; display: string; start_url: string; icons: { src: string; sizes: string; purpose: string }[] };
    expect(manifest.short_name).toBe('PiSan');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url.startsWith('/')).toBe(true);
    expect(manifest.icons.map(i => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some(i => i.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) expect(existsSync(join(root, 'public', icon.src))).toBe(true);
    expect(existsSync(join(root, 'public/icons/apple-touch-icon.png'))).toBe(true);
  });
  it('the service worker caches only the offline page, never the app or its data', () => {
    const sw = readFileSync(join(root, 'public/sw.js'), 'utf8');
    expect(sw).toMatch(/OFFLINE = \['\/offline\.html', '\/icons\/icon-192\.png'\]/);
    expect(sw).toContain("request.method !== 'GET'");
    expect(sw).not.toMatch(/cache\.put/);
    expect(existsSync(join(root, 'public/offline.html'))).toBe(true);
  });
  it('registers the service worker only on the published site', () => {
    expect(shouldRegisterServiceWorker({ dev: false, hostname: 'pisan.lovable.app', framed: false })).toBe(true);
    expect(shouldRegisterServiceWorker({ dev: true, hostname: 'pisan.lovable.app', framed: false })).toBe(false);
    expect(shouldRegisterServiceWorker({ dev: false, hostname: 'pisan.lovable.app', framed: true })).toBe(false);
    expect(shouldRegisterServiceWorker({ dev: false, hostname: 'id-preview--69d8c47f-9c43.lovable.app', framed: false })).toBe(false);
    expect(shouldRegisterServiceWorker({ dev: false, hostname: 'localhost', framed: false })).toBe(false);
  });
  it('recognises iPhones and iPads', () => {
    expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5)).toBe(true);
    expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true);
    expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false);
    expect(isIosDevice('Mozilla/5.0 (Linux; Android 14)', 5)).toBe(false);
  });
});

describe('Installer PiSan', () => {
  it('Android: the native prompt opens from the button, and the card then says it is installed', async () => {
    startInstallSupport(true);
    render(<InstallCard lang="fr" />);
    expect(screen.queryByRole('button', { name: /Installer PiSan/ })).toBeNull();
    const prompt = vi.fn(async () => {});
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt, userChoice: Promise.resolve({ outcome: 'accepted' as const }) });
    act(() => { window.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Installer PiSan/ }));
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/est installé sur cet appareil/)).toBeTruthy();
  });
  it('iPhone: step-by-step instructions instead of a button', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
    render(<InstallCard lang="fr" />);
    expect(screen.getByText(/Touche le bouton Partager/)).toBeTruthy();
    expect(screen.getByText(/Sur l’écran d’accueil/)).toBeTruthy();
  });
  it('the home banner shows on phones only, and stays closed once dismissed', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
    const desktop = render(<InstallBanner lang="fr" />);
    expect(screen.queryByText(/écran d’accueil/)).toBeNull();
    desktop.unmount();
    setMatch(true);
    const phone = render(<InstallBanner lang="fr" />);
    expect(screen.getByText(/Mets PiSan sur ton écran d’accueil/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByText(/Mets PiSan sur ton écran d’accueil/)).toBeNull();
    phone.unmount();
    render(<InstallBanner lang="fr" />);
    expect(screen.queryByText(/Mets PiSan sur ton écran d’accueil/)).toBeNull();
  });
});
