// Accueil de l'atelier : un « prochain pas », une grille compacte de chapitres, puis le parcours d'un chapitre.
import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, RotateCcw, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FigureKind } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import { skillsFor, skillStatus, type Skill, type SkillStatus } from '@/lib/skills';
import { CHAPTER_NAMES } from './skills';
import { Stars } from './skill-intro';
import { bestStars, starsOf, totalPoints } from '@/lib/rewards';

/**
 * Les familles de chapitres (thèmes des programmes) : au-delà de FAMILY_THRESHOLD chapitres, l'atelier les regroupe
 * en lignes repliables pour garder une page courte sur téléphone.
 */
export type Family = 'numbers' | 'algebra' | 'geometry' | 'data';
export const FAMILIES: Family[] = ['numbers', 'algebra', 'geometry', 'data'];
export const FAMILY_THRESHOLD = 8;
export const KIND_FAMILY: Record<FigureKind, Family> = {
  decimals: 'numbers', fractions: 'numbers', relatives: 'numbers', signs: 'numbers', arith: 'numbers', primes: 'numbers', powers: 'numbers', sci: 'numbers', roots: 'numbers',
  expressions: 'algebra', literal: 'algebra', identities: 'algebra', equations: 'algebra', linear: 'algebra', inequalities: 'algebra', systems: 'algebra', affine: 'algebra', seq: 'algebra', deriv: 'algebra',
  lines: 'geometry', polygons: 'geometry', angles: 'geometry', symmetry: 'geometry', measures: 'geometry', surfaces: 'geometry', solids: 'geometry', pythagoras: 'geometry', thales: 'geometry', trigo: 'geometry', inscribed: 'geometry', vectors: 'geometry',
  proportion: 'data', data: 'data', stats: 'data', chance: 'data', proba: 'data',
};
const FAMILY_NAMES: Record<Family, (lang: Lang) => string> = {
  numbers: lang => say(lang, 'Nombres et calculs', 'Numbers', 'الأعداد والحساب', 'Números y cálculo'),
  algebra: lang => say(lang, 'Calcul littéral et fonctions', 'Algebra and functions', 'الحساب الحرفي والدوال', 'Álgebra y funciones'),
  geometry: lang => say(lang, 'Géométrie', 'Geometry', 'الهندسة', 'Geometría'),
  data: lang => say(lang, 'Données, hasard, proportionnalité', 'Data, chance, proportion', 'المعطيات والاحتمال والتناسبية', 'Datos, azar, proporcionalidad'),
};
const FAMILY_TONE: Record<Family, string> = { numbers: 'module-sun', algebra: 'module-sky', geometry: 'module-teal', data: 'module-coral' };

/** Couleur de chaque chapitre (mêmes variables que les modules de l'accueil). */
export const KIND_TONE: Record<FigureKind, string> = { pythagoras: 'module-teal', thales: 'module-coral', trigo: 'module-sky', inscribed: 'module-sun', vectors: 'module-coral', affine: 'module-teal', stats: 'module-sky', seq: 'module-sun', deriv: 'module-coral', proba: 'module-teal', fractions: 'module-sun', decimals: 'module-teal', proportion: 'module-coral', lines: 'module-sky', symmetry: 'module-sun', measures: 'module-coral', relatives: 'module-sky', data: 'module-teal', arith: 'module-coral', powers: 'module-sun', expressions: 'module-sky', equations: 'module-teal', polygons: 'module-coral', primes: 'module-sun', angles: 'module-sky', surfaces: 'module-teal', chance: 'module-coral', signs: 'module-sky', sci: 'module-sun', literal: 'module-teal', linear: 'module-coral', roots: 'module-sun', identities: 'module-sky', inequalities: 'module-coral', systems: 'module-teal', solids: 'module-sun' };

/** Petit dessin propre à chaque chapitre. */
export function ChapterGlyph({ kind }: { kind: FigureKind }) {
  const g: Record<FigureKind, ReactNode> = {
    pythagoras: <><path d="M10 30 L30 30 L10 14 Z" /><rect x="10" y="30" width="20" height="6" className="glyph-soft" /><path d="M10 14 L4 14 L4 30 L10 30" className="glyph-thin" /><path d="M10 26 h4 v4" className="glyph-thin" /></>,
    thales: <><path d="M6 32 L34 32 L20 6 Z" /><path d="M13 19 L27 19" className="glyph-accent" /></>,
    trigo: <><path d="M6 32 L34 32 L34 10 Z" /><path d="M14 32 A8 8 0 0 0 13.2 28.6" className="glyph-accent" /><path d="M30 32 v-4 h4" className="glyph-thin" /></>,
    inscribed: <><circle cx="20" cy="20" r="14" /><path d="M9 28 L20 6 L31 28" className="glyph-accent" /></>,
    vectors: <><path d="M6 32 L30 10" /><path d="M22 10 L30 10 L30 18" /><path d="M8 20 L20 20" className="glyph-accent" /><path d="M16 16 L20 20 L16 24" className="glyph-accent" /></>,
    affine: <><path d="M6 34 V6 M4 30 H36" className="glyph-thin" /><path d="M6 32 L34 10" className="glyph-accent" /></>,
    stats: <><path d="M6 34 H34" className="glyph-thin" /><rect x="8" y="20" width="5" height="14" /><rect x="17" y="10" width="5" height="24" className="glyph-fill" /><rect x="26" y="16" width="5" height="18" /></>,
    seq: <><path d="M6 34 V6 M4 32 H36" className="glyph-thin" /><circle cx="10" cy="28" r="2" className="glyph-fill" /><circle cx="17" cy="20" r="2" className="glyph-fill" /><circle cx="24" cy="15" r="2" className="glyph-fill" /><circle cx="31" cy="12" r="2" className="glyph-fill" /><path d="M6 10 H36" className="glyph-thin" strokeDasharray="2 3" /></>,
    deriv: <><path d="M6 34 V6 M4 32 H36" className="glyph-thin" /><path d="M8 10 Q20 44 33 10" /><path d="M11 26 L29 26" className="glyph-accent" /></>,
    decimals: <><text x="20" y="27" textAnchor="middle" className="glyph-text">3,7</text><path d="M6 33 H34" className="glyph-thin" /></>,
    proportion: <><rect x="5" y="9" width="30" height="22" rx="3" className="glyph-thin" /><path d="M5 20 H35 M15 9 V31 M25 9 V31" className="glyph-thin" /><path d="M29 12 C36 14 36 26 29 28" className="glyph-accent" /><path d="M27 25 L29 28 L32 26" className="glyph-accent" /></>,
    lines: <><path d="M6 32 H34" /><path d="M8 32 L30 9" /><path d="M14 32 A8 8 0 0 0 13.5 26.5" className="glyph-accent" /></>,
    symmetry: <><path d="M20 5 V35" className="glyph-thin" strokeDasharray="3 3" /><path d="M16 10 L6 30 H16 Z" /><path d="M24 10 L34 30 H24 Z" className="glyph-accent" /></>,
    measures: <><rect x="6" y="11" width="22" height="18" rx="1" /><path d="M6 34 H28 M6 32 V36 M28 32 V36" className="glyph-thin" /><path d="M32 11 V29 M30 11 H34 M30 29 H34" className="glyph-thin" /></>,
    roots: <><path d="M6 22 L11 22 L16 32 L22 8 H35" /><text x="28" y="26" textAnchor="middle" className="glyph-text glyph-small">x</text></>,
    identities: <><text x="20" y="26" textAnchor="middle" className="glyph-text glyph-small">a²−b²</text></>,
    inequalities: <><text x="20" y="27" textAnchor="middle" className="glyph-text">x&lt;3</text></>,
    systems: <><path d="M8 8 Q4 8 4 14 V18 Q4 20 2 20 Q4 20 4 22 V26 Q4 32 8 32" className="glyph-thin" /><path d="M12 14 H34 M12 26 H34" /></>,
    solids: <><path d="M20 6 L34 30 L6 30 Z" /><path d="M20 6 L24 34 M6 30 L24 34 L34 30" className="glyph-thin" /></>,
    signs: <><text x="20" y="27" textAnchor="middle" className="glyph-text">−×−</text></>,
    sci: <><text x="16" y="29" textAnchor="middle" className="glyph-text">10</text><text x="31" y="16" textAnchor="middle" className="glyph-text glyph-small">−3</text></>,
    literal: <><text x="20" y="26" textAnchor="middle" className="glyph-text glyph-small">(x+a)²</text></>,
    linear: <><text x="20" y="26" textAnchor="middle" className="glyph-text">x=?</text><path d="M8 32 H32" className="glyph-thin" /></>,
    primes: <><text x="20" y="27" textAnchor="middle" className="glyph-text">7</text><circle cx="20" cy="21" r="13" className="glyph-thin" /></>,
    angles: <><path d="M4 14 H36 M4 28 H36" className="glyph-thin" /><path d="M12 36 L28 4" /><path d="M21 14 a6 6 0 0 0 4 -5" className="glyph-thin" /></>,
    surfaces: <><path d="M6 32 L22 32 L14 14 Z" className="glyph-fill" /><circle cx="28" cy="16" r="8" /></>,
    chance: <><rect x="8" y="8" width="24" height="24" rx="5" /><circle cx="15" cy="15" r="2" className="glyph-fill" /><circle cx="25" cy="25" r="2" className="glyph-fill" /><circle cx="20" cy="20" r="2" className="glyph-fill" /></>,
    arith: <><text x="20" y="25" textAnchor="middle" className="glyph-text">÷</text><path d="M8 32 H32" className="glyph-thin" /></>,
    powers: <><text x="15" y="29" textAnchor="middle" className="glyph-text">2</text><text x="27" y="17" textAnchor="middle" className="glyph-text glyph-small">5</text></>,
    expressions: <><text x="20" y="26" textAnchor="middle" className="glyph-text">3x</text></>,
    equations: <><text x="20" y="26" textAnchor="middle" className="glyph-text">x=?</text></>,
    polygons: <><path d="M6 32 L18 10 L24 32 Z" className="glyph-fill" /><path d="M24 14 H36 V32 H26" /></>,
    relatives: <><path d="M4 22 H36" /><path d="M20 17 V27 M10 19 V25 M30 19 V25" className="glyph-thin" /><text x="10" y="13" textAnchor="middle" className="glyph-text glyph-small">−</text><text x="30" y="13" textAnchor="middle" className="glyph-text glyph-small">+</text></>,
    data: <><path d="M6 34 H34 M6 34 V6" className="glyph-thin" /><rect x="10" y="22" width="5" height="12" className="glyph-fill" /><rect x="18" y="14" width="5" height="20" /><rect x="26" y="18" width="5" height="16" className="glyph-fill" /></>,
    fractions: <><rect x="6" y="8" width="28" height="9" rx="2" /><path d="M15.3 8 V17 M24.6 8 V17" className="glyph-thin" /><rect x="6" y="8" width="9.3" height="9" rx="2" className="glyph-soft" /><rect x="6" y="23" width="28" height="9" rx="2" /><path d="M13 23 V32 M20 23 V32 M27 23 V32" className="glyph-thin" /><rect x="6" y="23" width="14" height="9" rx="2" className="glyph-soft" /></>,
    proba: <><circle cx="8" cy="20" r="2.5" className="glyph-fill" /><path d="M10 19 L28 9 M10 21 L28 31" /><path d="M30 9 L35 6 M30 9 L35 12 M30 31 L35 28 M30 31 L35 34" className="glyph-thin" /></>,
  };
  return <svg viewBox="0 0 40 40" className="chapter-glyph" aria-hidden>{g[kind]}</svg>;
}

function Segments({ kind, attempts }: { kind: FigureKind; attempts: Attempt[] }) {
  return <span className="ws-segments" aria-hidden>{skillsFor(kind).map(s => <span key={s.id} className={`ws-seg ws-seg-${skillStatus(attempts, s.id)}`} />)}</span>;
}

export type Tile = { id: string; title: string; note: string; icon: ReactNode; tone: string; onOpen: () => void };

/** Accueil de l'atelier. */
export function WorkshopHome({ lang, assignments, kinds, attempts, chapterLabel, next, due, extras, busy, onChapter, onSkill, onReview, lastKind }: {
  lang: Lang; assignments?: ReactNode[]; kinds: FigureKind[]; attempts: Attempt[]; chapterLabel: (k: FigureKind) => string | null;
  next: { skill: Skill; resumed: boolean } | null; due: number; extras: Tile[]; busy: boolean;
  onChapter: (k: FigureKind) => void; onSkill: (s: Skill) => void; onReview: () => void;
  /** Le dernier chapitre ouvert : sa famille reste dépliée au retour. */ lastKind?: FigureKind | null;
}) {
  const mastered = (k: FigureKind) => skillsFor(k).filter(s => skillStatus(attempts, s.id) === 'mastered').length;
  const grouped = kinds.length > FAMILY_THRESHOLD;
  // La famille du dernier chapitre ouvert (sinon du prochain pas) est dépliée ; une seule à la fois.
  const first = lastKind ?? next?.skill.chapter;
  const [open, setOpen] = useState<Family | null>(first ? KIND_FAMILY[first] : null);
  const tile = (k: FigureKind) => {
    const done = mastered(k), total = skillsFor(k).length;
    return <button key={k} type="button" className={`ws-tile ${KIND_TONE[k]}`} onClick={() => onChapter(k)} aria-label={`${CHAPTER_NAMES[k][lang]} · ${done}/${total}`}>
      <span className="ws-tile-top"><span className="ws-tile-glyph"><ChapterGlyph kind={k} /></span>{done === total ? <span className="ws-done"><Check className="h-3.5 w-3.5" /></span> : !chapterLabel(k) && <span className="ws-tag">{say(lang, 'Rappel', 'Review', 'تذكير', 'Repaso')}</span>}</span>
      <span className="ws-tile-title">{CHAPTER_NAMES[k][lang]}</span>
      <span className="flex items-center gap-2"><Segments kind={k} attempts={attempts} /><span className="text-xs font-bold text-muted-foreground">{done}/{total}</span></span>
    </button>;
  };
  return <section className="mx-auto max-w-4xl">
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Atelier', 'Workshop', 'الورشة', 'Taller')}</span><h1>{say(lang, 'Comprendre en manipulant', 'Learn by doing', 'أفهم بالتجريب', 'Aprender manipulando')}</h1></div>
    <div className="ws-score" aria-label={say(lang, 'Mes récompenses', 'My rewards', 'مكافآتي', 'Mis recompensas')}>
      <span className="points-badge"><Zap className="h-4 w-4" aria-hidden />{totalPoints(attempts)} {say(lang, 'points', 'points', 'نقطة', 'puntos')}</span>
      <span className="points-badge points-stars"><Star className="h-4 w-4" aria-hidden />{starsOf(attempts, kinds.flatMap(k => skillsFor(k).map(s => s.id)))} / {kinds.reduce((n, k) => n + skillsFor(k).length, 0) * 3}</span>
    </div>

    {due > 0 && <button type="button" className="ws-review" disabled={busy} onClick={onReview}>
      <RotateCcw className="h-5 w-5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 text-start"><span className="block font-bold">{say(lang, 'Mini-contrôle', 'Quick check', 'مراقبة قصيرة', 'Mini control')}</span><span className="block text-sm">{say(lang, `${due} compétence${due > 1 ? 's' : ''} à vérifier`, `${due} skill${due > 1 ? 's' : ''} to check`, `${due} كفايات للتحقق`, `${due} competencia(s) por comprobar`)}</span></span>
      <ChevronRight className="h-5 w-5 shrink-0 rtl:rotate-180" aria-hidden />
    </button>}

    {assignments && assignments.length > 0 && <div className="mb-4 grid gap-2">{assignments}</div>}

    {next && <div className={`ws-next ${KIND_TONE[next.skill.chapter]}`}>
      <div className="flex items-center gap-4">
        <span className="ws-next-glyph"><ChapterGlyph kind={next.skill.chapter} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide">{next.resumed ? say(lang, 'Reprendre', 'Continue', 'متابعة', 'Continuar') : say(lang, 'Pour commencer', 'Start here', 'للبدء', 'Para empezar')} · {CHAPTER_NAMES[next.skill.chapter][lang]}</p>
          <p className="mt-1 text-xl font-bold leading-snug">{next.skill.title[lang]}</p>
          <div className="mt-2 flex items-center gap-2"><Segments kind={next.skill.chapter} attempts={attempts} /><span className="text-xs font-bold">{mastered(next.skill.chapter)}/{skillsFor(next.skill.chapter).length}</span></div>
        </div>
      </div>
      <Button size="lg" className="mt-4 w-full" disabled={busy} onClick={() => onSkill(next.skill)}>{next.resumed ? say(lang, 'Continuer', 'Continue', 'تابع', 'Continuar') : say(lang, 'Commencer', 'Start', 'ابدأ', 'Empezar')}<ArrowRight /></Button>
    </div>}

    {kinds.length > 0 && <>
      <h2 className="ws-heading">{say(lang, 'Mes chapitres', 'My chapters', 'فصولي', 'Mis capítulos')}</h2>
      {!grouped ? <div className="ws-grid">{kinds.map(tile)}</div> : <div className="ws-families">{FAMILIES.map(f => {
        const members = kinds.filter(k => KIND_FAMILY[k] === f);
        if (!members.length) return null;
        const done = members.reduce((n, k) => n + mastered(k), 0), total = members.reduce((n, k) => n + skillsFor(k).length, 0);
        const isOpen = open === f;
        return <div key={f} className={`ws-family ${FAMILY_TONE[f]}`}>
          <button type="button" className="ws-family-head" aria-expanded={isOpen} aria-controls={`ws-family-${f}`} onClick={() => setOpen(isOpen ? null : f)}>
            <span className="ws-family-glyphs" aria-hidden>{members.slice(0, 3).map(k => <span key={k} className={`ws-family-glyph ${KIND_TONE[k]}`}><ChapterGlyph kind={k} /></span>)}</span>
            <span className="min-w-0 flex-1 text-start">
              <span className="block font-bold leading-snug">{FAMILY_NAMES[f](lang)}</span>
              <span className="block text-xs text-muted-foreground">{say(lang, `${members.length} chapitre${members.length > 1 ? 's' : ''} · ${done}/${total} acquises`, `${members.length} chapter${members.length > 1 ? 's' : ''} · ${done}/${total} mastered`, `${members.length} فصول · ${done}/${total} مكتسبة`, `${members.length} capítulo${members.length > 1 ? 's' : ''} · ${done}/${total} dominadas`)}</span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {isOpen && <div id={`ws-family-${f}`} className="ws-grid ws-family-body">{members.map(tile)}</div>}
        </div>;
      })}</div>}
    </>}

    {extras.length > 0 && <>
      <h2 className="ws-heading">{say(lang, 'Autres ateliers', 'More workshops', 'ورشات أخرى', 'Más talleres')}</h2>
      <div className="ws-list">{extras.map(x => <button key={x.id} type="button" className={`ws-row ${x.tone}`} disabled={busy} onClick={x.onOpen}>
        <span className="ws-row-icon">{x.icon}</span>
        <span className="min-w-0 flex-1 text-start"><span className="block font-bold">{x.title}</span><span className="block text-sm text-muted-foreground">{x.note}</span></span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden />
      </button>)}</div>
    </>}
  </section>;
}

const STATUS_TEXT: Record<SkillStatus, (lang: Lang) => string> = {
  mastered: lang => say(lang, 'Acquis', 'Mastered', 'مكتسبة', 'Adquirida'),
  started: lang => say(lang, 'Commencé', 'Started', 'بدأت', 'Empezada'),
  review: lang => say(lang, 'À revoir', 'To review', 'للمراجعة', 'Por repasar'),
  todo: lang => say(lang, 'À faire', 'To do', 'للإنجاز', 'Por hacer'),
};

/** Le parcours d'un chapitre : les compétences dans l'ordre, la prochaine mise en avant. */
export function ChapterPath({ lang, kind, attempts, chapterLabel, busy, onSkill, onBack, children }: { lang: Lang; kind: FigureKind; attempts: Attempt[]; chapterLabel: string | null; busy: boolean; onSkill: (s: Skill) => void; onBack: () => void; /** Après les parcours : les problèmes en barres du chapitre. */ children?: ReactNode }) {
  const skills = skillsFor(kind);
  const statuses = skills.map(s => skillStatus(attempts, s.id));
  const current = statuses.findIndex(s => s === 'review') >= 0 ? statuses.findIndex(s => s === 'review') : statuses.findIndex(s => s !== 'mastered');
  const done = statuses.filter(s => s === 'mastered').length;
  return <section className="mx-auto max-w-2xl">
    <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="rtl:rotate-180" />{say(lang, 'Atelier', 'Workshop', 'الورشة', 'Taller')}</Button>
    <div className={`ws-chapter-head ${KIND_TONE[kind]}`}>
      <span className="ws-tile-glyph"><ChapterGlyph kind={kind} /></span>
      <div className="min-w-0 flex-1">
        {chapterLabel !== CHAPTER_NAMES[kind][lang] && <p className="text-xs font-bold text-muted-foreground">{chapterLabel ?? say(lang, 'Rappel des années précédentes', 'Review from earlier years', 'تذكير من السنوات السابقة', 'Repaso de cursos anteriores')}</p>}
        <h1 className="text-2xl font-bold leading-tight">{CHAPTER_NAMES[kind][lang]}</h1>
        <div className="mt-2 flex items-center gap-2"><Segments kind={kind} attempts={attempts} /><span className="text-xs font-bold">{say(lang, `${done}/${skills.length} acquises`, `${done}/${skills.length} mastered`, `${done}/${skills.length} مكتسبة`, `${done}/${skills.length} adquiridas`)}</span></div>
      </div>
    </div>
    <ol className="ws-path">{skills.map((s, i) => {
      const st = statuses[i]!, isCurrent = i === current;
      return <li key={s.id} className={`ws-step ws-step-${st}${isCurrent ? ' ws-step-current' : ''}`}>
        <button type="button" className="ws-step-button" disabled={busy} onClick={() => onSkill(s)} aria-label={`${i + 1}. ${s.title[lang]} · ${STATUS_TEXT[st](lang)}`} aria-current={isCurrent ? 'step' : undefined}>
          <span className="ws-node" aria-hidden>{st === 'mastered' ? <Check className="h-4 w-4" /> : st === 'review' ? <RotateCcw className="h-4 w-4" /> : i + 1}</span>
          <span className="min-w-0 flex-1 text-start">
            <span className="block font-bold leading-snug">{s.title[lang]}</span>
            <span className="block text-sm text-muted-foreground">{s.desc[lang]}</span>
            {isCurrent && <span className="ws-go">{st === 'todo' ? say(lang, 'Commencer', 'Start', 'ابدأ', 'Empezar') : say(lang, 'Continuer', 'Continue', 'تابع', 'Continuar')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></span>}
          </span>
          {!isCurrent && (bestStars(attempts, s.id) > 0 ? <Stars value={bestStars(attempts, s.id)} lang={lang} /> : <span className={`ws-state ws-state-${st}`}>{STATUS_TEXT[st](lang)}</span>)}
        </button>
      </li>;
    })}</ol>
    {children}
  </section>;
}
