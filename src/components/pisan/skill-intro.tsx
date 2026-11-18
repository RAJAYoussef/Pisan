// Les trois temps d'une compétence (Je manipule → Je retiens → Je m'entraîne) et l'écran de fin ludifié.
import { useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Hand, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localizeMath } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import type { Intro, Lesson } from '@/lib/skill-intros';
import mascot from '@/assets/pisan-avatar.png';
import { Speaker } from './shared';
import { Rich } from './math-text';
import { Manipulation } from './manipulations';

export type Phase = 'discover' | 'lesson' | 'practice';
const PHASES: { id: Phase; icon: typeof Hand; label: (lang: Lang) => string }[] = [
  { id: 'discover', icon: Hand, label: lang => say(lang, 'Je manipule', 'I explore', 'أجرّب', 'Manipulo') },
  { id: 'lesson', icon: BookOpen, label: lang => say(lang, 'Je retiens', 'I remember', 'أحفظ', 'Recuerdo') },
  { id: 'practice', icon: Sparkles, label: lang => say(lang, 'Je m’entraîne', 'I practise', 'أتمرّن', 'Practico') },
];

export function PhaseStepper({ lang, phase, onPhase, manipulate = true }: { lang: Lang; phase: Phase; onPhase: (p: Phase) => void; manipulate?: boolean }) {
  const phases = manipulate ? PHASES : PHASES.filter(p => p.id !== 'discover');
  const at = phases.findIndex(p => p.id === phase);
  return <ol className="phase-stepper" aria-label={say(lang, 'Les étapes', 'Stages', 'المراحل', 'Las etapas')}>
    {phases.map((p, i) => <li key={p.id}>
      <button type="button" className={`phase ${i === at ? 'phase-current' : i < at ? 'phase-done' : ''}`} aria-current={i === at ? 'step' : undefined} disabled={i > at} onClick={() => onPhase(p.id)}>
        <span className="phase-icon"><p.icon className="h-4 w-4" aria-hidden /></span>{p.label(lang)}
      </button>
    </li>)}
  </ol>;
}

/** Je manipule : la manipulation, puis le bouton pour passer au cours dès que la découverte est faite. */
export function DiscoverPanel({ lang, intro, onNext }: { lang: Lang; intro: Intro; onNext: () => void }) {
  const [found, setFound] = useState(false);
  const goal = intro.goal?.[lang] ?? '';
  return <div className="activity-panel">
    <div className="mb-4 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug">{goal}</p><Speaker text={goal} lang={lang} /></div>
    {intro.manip && <Manipulation manip={intro.manip} lang={lang} onDone={() => setFound(true)} />}
    <Button className="mt-5 w-full" variant={found ? 'default' : 'soft'} onClick={onNext}>{found ? say(lang, 'J’ai compris, voir le cours', 'Got it, see the lesson', 'فهمت، أرني الدرس', 'Entendido, ver la lección') : say(lang, 'Passer au cours', 'Skip to the lesson', 'الانتقال إلى الدرس', 'Ir a la lección')}<ArrowRight /></Button>
  </div>;
}

/** Je retiens : l'idée en quelques phrases et un exemple résolu, lus à voix haute sur demande. */
export function LessonCard({ lang, lesson, compact = false }: { lang: Lang; lesson: Lesson; compact?: boolean }) {
  const text = [...lesson.points.map(p => p[lang]), lesson.example.title[lang], ...lesson.example.lines.map(l => l[lang])].join(' ').replace(/\*\*/g, '');
  return <div className={`lesson-card ${compact ? 'lesson-compact' : ''}`}>
    <div className="flex items-start justify-between gap-3"><p className="lesson-kicker"><BookOpen className="h-4 w-4" aria-hidden />{say(lang, 'À retenir', 'Key ideas', 'ما يجب حفظه', 'Para recordar')}</p><Speaker text={text} lang={lang} /></div>
    <ul className="lesson-points">{lesson.points.map((p, i) => <li key={i}><Bold text={localizeMath(p[lang], lang)} lang={lang} /></li>)}</ul>
    <div className="lesson-example">
      <p className="font-bold">{lesson.example.title[lang]}</p>
      {lesson.example.lines.map((l, i) => <p key={i}><Rich lang={lang} text={localizeMath(l[lang], lang)} /></p>)}
    </div>
  </div>;
}
/** Texte avec des passages **en gras**. */
function Bold({ text, lang }: { text: string; lang: Lang }) {
  return <>{text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Rich key={i} lang={lang} text={part} />))}</>;
}

/** Points gagnés pendant le parcours, avec le combo en cours. */
export function PointsBadge({ lang, points, combo }: { lang: Lang; points: number; combo: number }) {
  return <div className="points-row" aria-live="polite">
    <span className="points-badge"><Zap className="h-4 w-4" aria-hidden />{points} {say(lang, 'pts', 'pts', 'نقطة', 'pts')}</span>
    {combo >= 3 && <span key={combo} className="combo-badge">{say(lang, `Combo ×${combo} · +5`, `Combo ×${combo} · +5`, `سلسلة ×${combo} · +5`, `Combo ×${combo} · +5`)}</span>}
  </div>;
}

/** Fin de parcours : la mascotte, les étoiles qui s'allument une à une, les points, des confettis. */
export function Celebration({ lang, stars, points, bestCombo, message, children }: { lang: Lang; stars: 1 | 2 | 3; points: number; bestCombo: number; message: string; children?: ReactNode }) {
  const title = stars === 3 ? say(lang, 'Parfait !', 'Perfect!', 'ممتاز!', '¡Perfecto!') : stars === 2 ? say(lang, 'Très bien !', 'Great job!', 'أحسنت!', '¡Muy bien!') : say(lang, 'Parcours terminé', 'Pathway complete', 'انتهى المسار', 'Itinerario terminado');
  return <div className="celebration">
    {stars === 3 && <div className="confetti" aria-hidden>{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` }} className={`confetto confetto-${i % 4}`} />)}</div>}
    <img src={mascot} alt="" className="celebration-mascot" />
    <p className="celebration-title">{title}</p>
    <div className="celebration-stars" role="img" aria-label={say(lang, `${stars} étoile${stars > 1 ? 's' : ''} sur 3`, `${stars} star${stars > 1 ? 's' : ''} out of 3`, `${stars} من 3 نجوم`, `${stars} de 3 estrellas`)}>
      {[1, 2, 3].map(i => <Star key={i} className={`celebration-star ${i <= stars ? 'star-on' : ''}`} style={{ animationDelay: `${0.25 + i * 0.25}s` }} aria-hidden />)}
    </div>
    <p className="celebration-points"><Zap className="h-5 w-5" aria-hidden />+{points} {say(lang, 'points', 'points', 'نقطة', 'puntos')}{bestCombo >= 3 && <span className="combo-badge">{say(lang, `Meilleur combo ×${bestCombo}`, `Best combo ×${bestCombo}`, `أفضل سلسلة ×${bestCombo}`, `Mejor combo ×${bestCombo}`)}</span>}</p>
    <p className="font-semibold">{message}</p>
    {stars < 3 && <p className="text-sm text-muted-foreground">{say(lang, 'Refais le parcours sans erreur pour décrocher les 3 étoiles.', 'Redo the pathway with no mistakes to earn all 3 stars.', 'أعد المسار دون أخطاء للحصول على 3 نجوم.', 'Repite sin errores para conseguir las 3 estrellas.')}</p>}
    {children}
  </div>;
}

/** Étoiles compactes (★★☆) pour les listes. */
export function Stars({ value, lang }: { value: number; lang: Lang }) {
  return <span className="mini-stars" role="img" aria-label={say(lang, `${value} étoile${value > 1 ? 's' : ''} sur 3`, `${value} of 3 stars`, `${value} من 3`, `${value} de 3`)}>{[1, 2, 3].map(i => <Star key={i} className={i <= value ? 'star-on' : ''} aria-hidden />)}</span>;
}
