// Logo PiSan : la mascotte π, et dessous le mot « PiSan » en vrai texte, lettres aux couleurs des blocs
// qui sautillent, souligné d'une seule ondulation aux couleurs de la mascotte.
import { useId } from 'react';
import mascot from '@/assets/pisan-avatar.png';

export function BrandMark({ size = 'header', className = '' }: { size?: 'header' | 'large'; className?: string }) {
  const id = useId().replace(/:/g, '');
  return <span className={`brand-mark brand-${size} ${className}`} role="img" aria-label="PiSan" dir="ltr">
    <img src={mascot} alt="" className="brand-mascot" />
    <span className="brand-word" aria-hidden>
      <span className="brand-letters">{'PiSan'.split('').map((c, i) => <span key={i}>{c}</span>)}</span>
      <svg className="brand-wave" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
        <defs><linearGradient id={`wave-${id}`} x1="0" x2="1"><stop offset="0" stopColor="var(--brand-p)" /><stop offset=".38" stopColor="var(--brand-teal)" /><stop offset=".68" stopColor="var(--brand-yellow)" /><stop offset="1" stopColor="var(--brand-brown)" /></linearGradient></defs>
        <path d="M3 8 C 26 0, 42 0, 52 6 S 78 12, 97 4" fill="none" stroke={`url(#wave-${id})`} strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    </span>
  </span>;
}
