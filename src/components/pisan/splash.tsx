// Écran de lancement : la mascotte π se construit bloc par bloc, en 3D, au milieu de l'écran. Les blocs sont
// des formes vectorielles nettes (pi-blocks.ts) avec une épaisseur (des flancs empilés en profondeur) ; ils
// arrivent de la profondeur en pivotant, le logo tourne doucement pendant l'assemblage pour montrer le
// relief, puis se met de face. Le mot « PiSan » apparaît, puis tout s'efface vers l'accueil.
// Minutage entièrement en CSS ; un toucher passe l'écran. Couvert par src/test/splash.test.tsx.
import { useEffect, useState, type CSSProperties } from 'react';
import { PI_BLOCKS } from './pi-blocks';
import { PiBlockSvg, PiDefs } from './pi-logo';

/** D'où arrive chaque bloc : décalage (en % du logo) et rotations de départ (en degrés). */
const FROM: Record<string, [number, number, number, number]> = {
  'bar-l': [-70, -80, -30, 50], 'bar-r': [80, -90, 40, -60], 'teal-tl': [-110, -20, 70, 40], 'teal-tr': [110, -30, -60, -50],
  'teal-ml': [-120, 20, 50, 70], 'yel-m': [120, 10, -70, -40], 'teal-foot': [-90, 90, -40, 60], 'yel-foot': [70, 110, 60, -50],
  'yel-curl': [110, 80, -50, 80], face: [0, -40, 360, 0],
};
/** Épaisseur des blocs : nombre de flancs empilés derrière la face, et leur écart (px). */
export const SPLASH_DEPTH = 12;
const DEPTH_STEP = 2.2;
/** Intervalle entre deux blocs, et durée totale (ms) avant de retirer l'écran du DOM. */
export const SPLASH_STEP_MS = 280;
export const SPLASH_MS = 5600;

export function Splash() {
  const [gone, setGone] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setGone(true), SPLASH_MS); return () => window.clearTimeout(id); }, []);
  if (gone) return null;
  return <div className="splash" role="presentation" aria-hidden onClick={() => setGone(true)} onAnimationEnd={e => { if (e.target === e.currentTarget) setGone(true); }}>
    <PiDefs />
    <div className="splash-logo">
      <div className="splash-stage">
        {PI_BLOCKS.map((b, i) => {
          const [dx, dy, rx, ry] = FROM[b.id] ?? [0, -100, 0, 0];
          return <div key={b.id} className="splash-piece" style={{
            transformOrigin: `${(b.cx / 810) * 100}% ${(b.cy / 729) * 100}%`, animationDelay: `${i * SPLASH_STEP_MS}ms`,
            '--dx': `${dx}%`, '--dy': `${dy}%`, '--rx': `${rx}deg`, '--ry': `${ry}deg`,
          } as CSSProperties}>
            {Array.from({ length: SPLASH_DEPTH }, (_, k) => <PiBlockSvg key={k} block={b} side className="splash-side" style={{ '--z': `${-(SPLASH_DEPTH - k) * DEPTH_STEP}px` } as CSSProperties} />)}
            <PiBlockSvg block={b} className="splash-front" />
          </div>;
        })}
      </div>
      <span className="splash-shadow" />
    </div>
    <span className="splash-word brand-letters" dir="ltr">{'PiSan'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${3700 + i * 110}ms` }}>{c}</span>)}</span>
  </div>;
}
