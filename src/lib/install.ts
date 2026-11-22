// Installer PiSan sur l'écran d'accueil (application web installable) : service worker, invite
// d'installation d'Android/Chrome, et consigne pour l'iPhone (où l'on passe par le menu Partager).
import { useSyncExternalStore } from 'react';

/** Ce que l'appareil permet : déjà installée, invite native disponible, consigne iPhone/iPad, ou rien. */
export type InstallState = 'installed' | 'prompt' | 'ios' | 'none';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

/** Le service worker n'est enregistré qu'en production, hors iframe (éditeur Lovable) et hors préversion. */
export function shouldRegisterServiceWorker({ dev, hostname, framed }: { dev: boolean; hostname: string; framed: boolean }): boolean {
  if (dev || framed) return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  return !/^id-preview--[a-z0-9-]+\.lovable\.app$/i.test(hostname);
}

/** iPhone, iPod ou iPad (un iPad récent se présente comme un Mac tactile). */
export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
}

/** Ouverte depuis l'écran d'accueil (et non dans un onglet du navigateur). */
export function isStandalone(win: Pick<Window, 'matchMedia'> & { navigator: Navigator }): boolean {
  return win.matchMedia?.('(display-mode: standalone)').matches === true || (win.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

let deferred: InstallPromptEvent | null = null;
let installed = false;
let started = false;
const listeners = new Set<() => void>();
const notify = () => { for (const l of listeners) l(); };

function currentState(): InstallState {
  if (typeof window === 'undefined') return 'none';
  if (installed || isStandalone(window)) return 'installed';
  if (deferred) return 'prompt';
  if (isIosDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0)) return 'ios';
  return 'none';
}

/** À appeler une fois au démarrage, dans le navigateur. */
export function startInstallSupport(dev: boolean): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => { deferred = null; installed = true; notify(); });
  let framed = true;
  try { framed = window.self !== window.top; } catch { /* iframe d'une autre origine */ }
  if ('serviceWorker' in navigator && shouldRegisterServiceWorker({ dev, hostname: window.location.hostname, framed })) {
    void navigator.serviceWorker.register('/sw.js').catch(() => { /* sans service worker, l'appli marche quand même */ });
  }
}

/** Ouvre l'invite native d'installation (Android, Chrome, Edge). true si l'élève a accepté. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === 'accepted') installed = true;
  notify();
  return outcome === 'accepted';
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, currentState, () => 'none');
}

/** Pour les tests : remet le module dans son état initial. */
export function resetInstallSupport(): void { deferred = null; installed = false; started = false; listeners.clear(); }
