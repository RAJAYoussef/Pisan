// La mascotte π redessinée en formes vectorielles (repère 810 × 729, celui de l'image d'origine) :
// un tracé net par bloc, sa couleur, et l'ordre dans lequel les blocs se posent à l'écran de lancement.
export type PiColor = 'navy' | 'teal' | 'yellow' | 'brown';
export type PiBlock = { id: string; color: PiColor; d: string; cx: number; cy: number };

const rect = (x0: number, y0: number, x1: number, y1: number, r: number) =>
  `M ${x0 + r} ${y0} H ${x1 - r} Q ${x1} ${y0} ${x1} ${y0 + r} V ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1} H ${x0 + r} Q ${x0} ${y1} ${x0} ${y1 - r} V ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;

/** Les dix blocs, dans l'ordre où ils se posent (le visage en dernier). cx, cy : centre du bloc. */
export const PI_BLOCKS: PiBlock[] = [
  { id: 'bar-l', color: 'navy', cx: 280, cy: 120, d: 'M 190 10 L 543 10 Q 558 10 558 25 L 558 156 Q 558 171 543 171 L 212 171 C 162 175 130 204 106 231 C 88 251 76 271 54 276 C 24 281 8 262 8 226 C 8 172 20 122 50 83 C 86 38 131 12 190 10 Z' },
  { id: 'bar-r', color: 'navy', cx: 680, cy: 91, d: rect(562, 8, 800, 174, 18) },
  { id: 'teal-tl', color: 'teal', cx: 264, cy: 253, d: rect(174, 182, 354, 324, 20) },
  { id: 'teal-tr', color: 'teal', cx: 554, cy: 251, d: rect(462, 176, 646, 327, 20) },
  { id: 'teal-ml', color: 'teal', cx: 235, cy: 415, d: rect(174, 328, 296, 502, 20) },
  { id: 'yel-m', color: 'yellow', cx: 601, cy: 414, d: rect(557, 332, 646, 496, 16) },
  { id: 'teal-foot', color: 'teal', cx: 230, cy: 610, d: 'M 186 504 L 343 504 Q 356 504 356 517 L 352 580 C 348 640 320 690 270 712 C 230 728 175 722 140 695 C 110 672 100 640 104 610 C 108 575 135 550 158 533 C 172 522 176 512 186 504 Z' },
  { id: 'yel-foot', color: 'yellow', cx: 555, cy: 604, d: 'M 475 500 L 635 500 Q 648 500 648 513 L 648 695 Q 648 708 635 708 L 600 708 C 545 704 505 680 485 640 C 470 610 462 570 463 530 Q 464 500 475 500 Z' },
  { id: 'yel-curl', color: 'yellow', cx: 725, cy: 598, d: 'M 653 558 C 672 548 692 528 706 500 Q 712 487 734 486 C 776 484 800 502 798 540 C 795 600 770 655 730 690 C 710 706 685 712 664 708 Q 653 706 653 694 Z' },
  { id: 'face', color: 'brown', cx: 427, cy: 411, d: rect(299, 319, 554, 503, 18) },
];
/** Le visage du bloc marron : deux yeux et un sourire. */
export const PI_FACE = { eyes: [[366, 400], [490, 400]] as const, eyeR: 18, smile: 'M 394 432 Q 428 462 462 432' };
/** Dégradés (haut, bas) et couleur des flancs de chaque couleur de bloc. */
export const PI_SHADES: Record<PiColor, { top: string; bottom: string; side: string }> = {
  navy: { top: '#5d60cf', bottom: '#272b86', side: '#1b1e62' },
  teal: { top: '#9af3e1', bottom: '#46c4ae', side: '#2a8f7e' },
  yellow: { top: '#ffdf7a', bottom: '#efb12a', side: '#bf8414' },
  brown: { top: '#d98448', bottom: '#ab5a2c', side: '#7f3f1d' },
};
