// « Mes récompenses » : niveau, série de jours, prochain badge et médailles par chapitre.
// Tout se calcule à partir des tentatives enregistrées et de la série du serveur.
import { ArrowLeft, ArrowRight, Flame, Lock, Snowflake, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FigureKind } from '@/lib/figures';
import type { Lang } from '@/lib/i18n';
import { say, type Attempt } from '@/lib/pisan';
import { localDay } from '@/lib/plan';
import { lastDays, levelOf, medalFor, starsOf, toNextMedal, totalPoints, type Medal } from '@/lib/rewards';
import { skillsFor, skillStatus } from '@/lib/skills';
import mascot from '@/assets/pisan-avatar.png';
import { CHAPTER_NAMES } from './skills';
import { ChapterGlyph, FAMILIES, FAMILY_NAMES, KIND_FAMILY, KIND_TONE } from './workshop-home';
import { streakNow, type StreakView } from './streak';

export const MEDAL_NAMES: Record<Medal, (lang: Lang) => string> = {
  none: lang => say(lang, 'à gagner', 'to earn', 'للربح', 'por ganar'),
  bronze: lang => say(lang, 'bronze', 'bronze', 'برونزية', 'bronce'),
  silver: lang => say(lang, 'argent', 'silver', 'فضية', 'plata'),
  gold: lang => say(lang, 'or', 'gold', 'ذهبية', 'oro'),
};
const DAY_LETTERS: Record<Lang, string[]> = { fr: ['D', 'L', 'M', 'M', 'J', 'V', 'S'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], es: ['D', 'L', 'M', 'X', 'J', 'V', 'S'] };

export const masteredIn = (attempts: Attempt[], k: FigureKind) => skillsFor(k).filter(s => skillStatus(attempts, s.id) === 'mastered').length;

/** Une médaille ronde avec le dessin du chapitre ; grisée et cadenassée tant qu'elle n'est pas gagnée. */
export function MedalBadge({ kind, medal, size = 'md' }: { kind: FigureKind; medal: Medal; size?: 'sm' | 'md' }) {
  return <span className={`medal medal-${medal} medal-${size} ${KIND_TONE[kind]}`} aria-hidden>
    <span className="medal-face"><ChapterGlyph kind={kind} /></span>
    {medal === 'none' && size === 'md' && <span className="medal-lock"><Lock className="h-3 w-3" /></span>}
  </span>;
}

export function RewardsScreen({ lang, kinds, attempts, streak, onChapter, onBack }: { lang: Lang; kinds: FigureKind[]; attempts: Attempt[]; streak?: StreakView | undefined; onChapter: (k: FigureKind) => void; onBack: () => void }) {
  const points = totalPoints(attempts), lvl = levelOf(points);
  const stars = starsOf(attempts, kinds.flatMap(k => skillsFor(k).map(s => s.id))), maxStars = kinds.reduce((n, k) => n + skillsFor(k).length * 3, 0);
  const medals = kinds.map(k => ({ kind: k, mastered: masteredIn(attempts, k), total: skillsFor(k).length })).map(m => ({ ...m, medal: medalFor(m.mastered, m.total), next: toNextMedal(m.mastered, m.total) }));
  const won = medals.filter(m => m.medal !== 'none').length, gold = medals.filter(m => m.medal === 'gold').length;
  // Le prochain badge : un chapitre déjà commencé d'abord (finir ce qu'on a entamé), puis celui où il manque le moins.
  const goal = medals.filter(m => m.next).sort((a, b) => Number(b.mastered > 0) - Number(a.mastered > 0) || a.next!.missing - b.next!.missing)[0];
  const tz = streak?.timezone;
  const today = localDay(new Date(), tz);
  const days = lastDays(attempts, today, iso => localDay(new Date(iso), tz));
  const count = streak ? streakNow(streak) : 0, freezes = Math.min(2, Math.max(0, streak?.freezes ?? 0));
  return <section className="mx-auto max-w-4xl">
    <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="rtl:rotate-180" />{say(lang, 'Atelier', 'Workshop', 'الورشة', 'Taller')}</Button>
    <div className="section-heading"><span className="eyebrow">{say(lang, 'Atelier', 'Workshop', 'الورشة', 'Taller')}</span><h1>{say(lang, 'Mes récompenses', 'My rewards', 'مكافآتي', 'Mis recompensas')}</h1></div>

    <div className="rw-hero">
      <img src={mascot} alt="" className="rw-mascot" />
      <div className="min-w-0 flex-1">
        <p className="rw-level">{say(lang, `Niveau ${lvl.level}`, `Level ${lvl.level}`, `المستوى ${lvl.level}`, `Nivel ${lvl.level}`)}</p>
        <div className="rw-xp" role="progressbar" aria-valuemin={0} aria-valuemax={lvl.need} aria-valuenow={lvl.into} aria-label={say(lang, 'Vers le niveau suivant', 'To the next level', 'نحو المستوى الموالي', 'Hacia el siguiente nivel')}><span style={{ width: `${(lvl.into / lvl.need) * 100}%` }} /></div>
        <p className="text-xs font-bold text-muted-foreground">{say(lang, `${lvl.need - lvl.into} points avant le niveau ${lvl.level + 1}`, `${lvl.need - lvl.into} points to level ${lvl.level + 1}`, `${lvl.need - lvl.into} نقطة قبل المستوى ${lvl.level + 1}`, `${lvl.need - lvl.into} puntos para el nivel ${lvl.level + 1}`)}</p>
      </div>
    </div>
    <div className="rw-stats">
      <span className="points-badge"><Zap className="h-4 w-4" aria-hidden />{points} {say(lang, 'points', 'points', 'نقطة', 'puntos')}</span>
      <span className="points-badge points-stars"><Star className="h-4 w-4" aria-hidden />{stars} / {maxStars}</span>
      <span className="points-badge rw-medals-count">🏅 {won} / {kinds.length}{gold ? ` · ${gold} ${MEDAL_NAMES.gold(lang)}` : ''}</span>
    </div>

    <div className="rw-card">
      <div className="flex items-center gap-3">
        <span className={`rw-flame ${count ? 'rw-flame-on' : ''}`}><Flame className="h-7 w-7" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold">{say(lang, `${count} jour${count > 1 ? 's' : ''} d’affilée`, `${count}-day streak`, `${count} أيام متتالية`, `${count} días seguidos`)}</p>
          <p className="text-sm text-muted-foreground">{count ? say(lang, 'Reviens demain pour la garder allumée !', 'Come back tomorrow to keep it alight!', 'عد غدًا لتبقى مشتعلة!', '¡Vuelve mañana!') : say(lang, 'Fais un exercice aujourd’hui pour allumer la flamme.', 'Do one exercise today to light the flame.', 'أنجز تمرينًا اليوم لتشعل الشعلة.', 'Haz un ejercicio hoy.')}</p>
        </div>
        {freezes > 0 && <span className="rw-freeze" title={say(lang, 'Jokers : un jour manqué ne casse pas la série', 'Freezes: a missed day won’t break the streak', 'أيام الحماية', 'Comodines')}><Snowflake className="h-4 w-4" aria-hidden />{freezes}</span>}
      </div>
      <ol className="rw-week" aria-label={say(lang, 'Les 7 derniers jours', 'The last 7 days', 'الأيام السبعة الأخيرة', 'Los últimos 7 días')}>
        {days.map(d => <li key={d.day} className={`${d.active ? 'rw-day-on' : ''} ${d.day === today ? 'rw-today' : ''}`} aria-label={`${d.day} : ${d.active ? say(lang, 'actif', 'active', 'نشط', 'activo') : say(lang, 'repos', 'rest', 'راحة', 'descanso')}`}>
          <span className="rw-dot">{d.active ? <Flame className="h-4 w-4" aria-hidden /> : null}</span>
          <span className="rw-letter">{DAY_LETTERS[lang][new Date(`${d.day}T12:00:00Z`).getUTCDay()]}</span>
        </li>)}
      </ol>
    </div>

    {goal && <button type="button" className={`rw-goal ${KIND_TONE[goal.kind]}`} onClick={() => onChapter(goal.kind)}>
      <MedalBadge kind={goal.kind} medal={goal.next!.medal} />
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-xs font-bold uppercase tracking-wide">{say(lang, 'Prochain badge', 'Next badge', 'الشارة الموالية', 'Próxima insignia')}</span>
        <span className="block font-bold">{CHAPTER_NAMES[goal.kind][lang]} · {MEDAL_NAMES[goal.next!.medal](lang)}</span>
        <span className="block text-sm">{say(lang, `Encore ${goal.next!.missing} compétence${goal.next!.missing > 1 ? 's' : ''} à acquérir`, `${goal.next!.missing} more skill${goal.next!.missing > 1 ? 's' : ''} to master`, `${goal.next!.missing} كفايات متبقية`, `Faltan ${goal.next!.missing} competencias`)}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180" aria-hidden />
    </button>}

    <h2 className="ws-heading">{say(lang, 'Mes médailles', 'My medals', 'ميدالياتي', 'Mis medallas')}</h2>
    <p className="mb-3 text-sm text-muted-foreground">{say(lang, 'Bronze : une compétence acquise · Argent : la moitié · Or : tout le chapitre.', 'Bronze: one skill mastered · Silver: half · Gold: the whole chapter.', 'برونزية: كفاية · فضية: النصف · ذهبية: الفصل كله.', 'Bronce: una · Plata: la mitad · Oro: todo.')}</p>
    {FAMILIES.map(f => {
      const list = medals.filter(m => KIND_FAMILY[m.kind] === f);
      if (!list.length) return null;
      return <div key={f} className="mb-5">
        <h3 className="mb-2 text-sm font-bold text-muted-foreground">{FAMILY_NAMES[f](lang)}</h3>
        <div className="rw-grid">{list.map(m => <button key={m.kind} type="button" className="rw-medal" onClick={() => onChapter(m.kind)} aria-label={`${CHAPTER_NAMES[m.kind][lang]} · ${MEDAL_NAMES[m.medal](lang)} · ${m.mastered}/${m.total}`}>
          <MedalBadge kind={m.kind} medal={m.medal} />
          <span className="rw-medal-name">{CHAPTER_NAMES[m.kind][lang]}</span>
          <span className="text-xs font-bold text-muted-foreground">{m.medal === 'none' ? `${m.mastered}/${m.total}` : MEDAL_NAMES[m.medal](lang)}</span>
        </button>)}</div>
      </div>;
    })}
  </section>;
}
