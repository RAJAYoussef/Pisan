// Écran de lancement : la mascotte π se construit bloc par bloc, en 3D, au milieu de l'écran. Chaque bloc
// (découpé selon sa forme exacte, src/assets/splash) a une épaisseur et arrive de la profondeur en pivotant ;
// le logo tourne doucement pendant l'assemblage pour montrer le relief, puis se met de face. Le mot « PiSan »
// apparaît, puis tout s'efface vers l'accueil. Minutage entièrement en CSS ; un toucher passe l'écran.
// Couvert par src/test/splash.test.tsx.
import { useEffect, useState, type CSSProperties } from 'react';
import mascot from '@/assets/pisan-avatar.png';
import barL from '@/assets/splash/bar-l.png';
import barR from '@/assets/splash/bar-r.png';
import tealTl from '@/assets/splash/teal-tl.png';
import tealTr from '@/assets/splash/teal-tr.png';
import tealMl from '@/assets/splash/teal-ml.png';
import yelM from '@/assets/splash/yel-m.png';
import tealFoot from '@/assets/splash/teal-foot.png';
import yelFoot from '@/assets/splash/yel-foot.png';
import yelCurl from '@/assets/splash/yel-curl.png';
import face from '@/assets/splash/face.png';

/** Les dix blocs, dans l'ordre où ils se posent : image, place (en % du logo), et d'où ils arrivent. */
export const SPLASH_PIECES = [
  { src: barL, x: 0.741, y: 0.96, w: 68.395, h: 36.763, from: [-70, -80, -30, 50] },
  { src: barR, x: 69.136, y: 0.823, w: 30, h: 23.731, from: [80, -90, 40, -60] },
  { src: tealTl, x: 19.506, y: 24.554, w: 24.568, h: 20.576, from: [-110, -20, 70, 40] },
  { src: tealTr, x: 56.914, y: 22.908, w: 23.21, h: 22.497, from: [110, -30, -60, -50] },
  { src: tealMl, x: 21.235, y: 44.993, w: 15.679, h: 24.143, from: [-120, 20, 50, 70] },
  { src: yelM, x: 67.654, y: 45.267, w: 12.346, h: 23.457, from: [120, 10, -70, -40] },
  { src: tealFoot, x: 12.593, y: 68.587, w: 31.605, h: 30.453, from: [-90, 90, -40, 60] },
  { src: yelFoot, x: 56.79, y: 67.901, w: 23.21, h: 29.767, from: [70, 110, 60, -50] },
  { src: yelCurl, x: 79.877, y: 63.1, w: 18.765, h: 34.294, from: [110, 80, -50, 80] },
  { src: face, x: 35.185, y: 43.073, w: 34.321, h: 26.337, from: [0, -40, 360, 0] },
] as const;
/** Épaisseur des blocs : nombre de couches empilées en profondeur. */
const LAYERS = 7;
/** Intervalle entre deux blocs, et durée totale (ms) avant de retirer l'écran du DOM. */
export const SPLASH_STEP_MS = 280;
export const SPLASH_MS = 5600;

export function Splash() {
  const [gone, setGone] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setGone(true), SPLASH_MS); return () => window.clearTimeout(id); }, []);
  if (gone) return null;
  return <div className="splash" role="presentation" aria-hidden onClick={() => setGone(true)} onAnimationEnd={e => { if (e.target === e.currentTarget) setGone(true); }}>
    <div className="splash-logo">
      <div className="splash-stage">
        {SPLASH_PIECES.map((p, i) => <div key={i} className="splash-piece" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`, animationDelay: `${i * SPLASH_STEP_MS}ms`,
          '--dx': `${p.from[0]}%`, '--dy': `${p.from[1]}%`, '--rx': `${p.from[2]}deg`, '--ry': `${p.from[3]}deg`,
        } as CSSProperties}>
          {Array.from({ length: LAYERS }, (_, k) => <img key={k} src={p.src} alt="" draggable={false} className={k === 0 ? 'splash-front' : 'splash-side'} style={{ '--z': `${-k * 1.6}px` } as CSSProperties} />)}
        </div>)}
        <img src={mascot} alt="" className="splash-whole" draggable={false} />
      </div>
      <span className="splash-shadow" />
    </div>
    <span className="splash-word brand-letters" dir="ltr">{'PiSan'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${3900 + i * 110}ms` }}>{c}</span>)}</span>
  </div>;
}
