// Écran de lancement : la mascotte π se construit bloc par bloc au milieu de l'écran, le mot « PiSan »
// apparaît, puis tout s'efface pour laisser place à l'accueil. Le minutage est entièrement en CSS
// (l'écran disparaît même si le JavaScript tarde) ; un toucher le passe. Couvert par src/test/splash.test.tsx.
import { useEffect, useState } from 'react';
import mascot from '@/assets/pisan-avatar.png';

/** Les dix blocs de la mascotte, en polygones (en % de l'image), dans l'ordre où ils se posent. */
export const SPLASH_PIECES: string[] = [
  '0% 0%, 69.14% 0%, 69.14% 24.14%, 23.21% 24.14%, 14.81% 29.08%, 8.64% 38.68%, 0% 38.68%',
  '69.14% 0%, 100% 0%, 100% 24.14%, 69.14% 24.14%',
  '20.74% 24.14%, 44.2% 24.14%, 44.2% 44.72%, 20.74% 44.72%',
  '56.54% 23.32%, 80.25% 23.32%, 80.25% 44.99%, 56.54% 44.99%',
  '20.74% 44.72%, 36.54% 44.72%, 36.54% 69% , 20.74% 69%',
  '68.15% 44.99%, 80.86% 44.99%, 80.86% 68.59%, 68.15% 68.59%',
  '9.88% 69%, 45.19% 69%, 45.19% 100%, 9.88% 100%',
  '56.3% 68.59%, 80% 68.59%, 80% 100%, 56.3% 100%',
  '80% 64.47%, 100% 64.47%, 100% 100%, 80% 100%',
  '36.54% 43.35%, 68.15% 43.35%, 68.15% 68.59%, 36.54% 68.59%',
];
/** D'où arrive chaque bloc (décalage en % de la taille du logo, rotation en degrés). */
const FROM: [number, number, number][] = [[-60, -90, -14], [70, -90, 12], [-80, -40, -20], [80, -40, 18], [-90, 10, -16], [90, 10, 16], [-60, 80, -12], [60, 80, 14], [90, 60, 20], [0, -120, 0]];
/** Durée totale (ms) : l'écran est retiré du DOM ensuite. */
export const SPLASH_MS = 3100;

export function Splash() {
  const [gone, setGone] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setGone(true), SPLASH_MS); return () => window.clearTimeout(id); }, []);
  if (gone) return null;
  return <div className="splash" role="presentation" aria-hidden onClick={() => setGone(true)} onAnimationEnd={e => { if (e.target === e.currentTarget) setGone(true); }}>
    <div className="splash-logo">
      {SPLASH_PIECES.map((poly, i) => <img key={i} src={mascot} alt="" className="splash-piece" draggable={false}
        style={{ clipPath: `polygon(${poly})`, animationDelay: `${i * 120}ms`, ['--dx' as string]: `${FROM[i]![0]}%`, ['--dy' as string]: `${FROM[i]![1]}%`, ['--r' as string]: `${FROM[i]![2]}deg` }} />)}
      <img src={mascot} alt="" className="splash-whole" draggable={false} />
    </div>
    <span className="splash-word brand-letters" dir="ltr">{'PiSan'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${1600 + i * 90}ms` }}>{c}</span>)}</span>
  </div>;
}
