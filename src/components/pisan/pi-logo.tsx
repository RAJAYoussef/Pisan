// Dessin vectoriel d'un bloc du π (face avant avec dégradé et reflet, ou flanc uni pour l'épaisseur 3D).
import type { CSSProperties } from 'react';
import { PI_BLOCKS, PI_FACE, PI_SHADES, type PiBlock, type PiColor } from './pi-blocks';

/** Les dégradés partagés, à poser une seule fois dans la page. */
export function PiDefs() {
  return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden><defs>
    {(Object.keys(PI_SHADES) as PiColor[]).map(c => <linearGradient key={c} id={`pi-${c}`} x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor={PI_SHADES[c].top} /><stop offset="1" stopColor={PI_SHADES[c].bottom} /></linearGradient>)}
    <linearGradient id="pi-bevel" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".2" /></linearGradient>
    <radialGradient id="pi-shine" cx="0.3" cy="0.2" r="0.75"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".45" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
  </defs></svg>;
}

export function PiBlockSvg({ block, side = false, className, style }: { block: PiBlock; side?: boolean; className?: string; style?: CSSProperties }) {
  const shade = PI_SHADES[block.color];
  return <svg viewBox="0 0 810 729" className={className} style={style} aria-hidden>
    {side ? <path d={block.d} fill={shade.side} /> : <>
      <path d={block.d} fill={`url(#pi-${block.color})`} />
      <path d={block.d} fill="url(#pi-bevel)" />
      <path d={block.d} fill="url(#pi-shine)" />
      <path d={block.d} fill="none" stroke={shade.side} strokeOpacity=".35" strokeWidth="3" />
      {block.id === 'face' && <g fill="#4a2311">{PI_FACE.eyes.map(([x, y]) => <g key={x}><circle cx={x} cy={y} r={PI_FACE.eyeR} /><circle cx={x - 6} cy={y - 6} r={5} fill="#fff" fillOpacity=".7" /></g>)}<path d={PI_FACE.smile} fill="none" stroke="#4a2311" strokeWidth="11" strokeLinecap="round" /></g>}
    </>}
  </svg>;
}

/** Le π entier, à plat (pour comparer avec l'image d'origine). */
export function PiLogo({ className }: { className?: string }) {
  return <span className={className} style={{ position: 'relative', display: 'inline-block', aspectRatio: '810 / 729' }}>
    <PiDefs />
    {PI_BLOCKS.map(b => <PiBlockSvg key={b.id} block={b} className="pi-layer" />)}
  </span>;
}
