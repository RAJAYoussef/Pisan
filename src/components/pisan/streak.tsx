import { Flame, Snowflake } from 'lucide-react';
import { localDay, visibleStreak } from '@/lib/plan';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

export type StreakView = { count?: number | undefined; lastDay?: string | null | undefined; freezes?: number | undefined; timezone?: string | undefined };

export const browserTimeZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return undefined; } };

export function streakNow(s: StreakView) {
  return visibleStreak({ count: s.count ?? 0, lastDay: s.lastDay ?? '', freezes: s.freezes ?? 0 }, localDay(new Date(), s.timezone));
}

export const dayLabel = (lang: Lang, n: number) => n === 1 ? say(lang, 'jour de suite', 'day in a row', 'يوم متتالٍ', 'día seguido') : say(lang, 'jours de suite', 'days in a row', 'أيام متتالية', 'días seguidos');
export const freezeLabel = (lang: Lang, n: number) => say(lang, `${n} gel${n > 1 ? 's' : ''} en réserve`, `${n} freeze${n === 1 ? '' : 's'} saved`, `${n} تجميد محفوظ`, `${n} congelación${n === 1 ? '' : 'es'} guardada${n === 1 ? '' : 's'}`);

/** Flamme : jours de suite et gels disponibles (flocons). Aucune animation. */
export function StreakBadge({ lang, streak, compact = false }: { lang: Lang; streak: StreakView; compact?: boolean }) {
  const count = streakNow(streak);
  const freezes = Math.min(2, Math.max(0, streak.freezes ?? 0));
  if (compact) return <span className="inline-flex items-center gap-1 whitespace-nowrap" title={`${count} ${dayLabel(lang, count)} · ${freezeLabel(lang, freezes)}`}><Flame className="h-4 w-4 text-accent-deep" aria-hidden /><span className="font-bold">{count}</span>{Array.from({ length: freezes }, (_, i) => <Snowflake key={i} className="h-3.5 w-3.5 text-primary-deep" aria-hidden />)}<span className="sr-only">{dayLabel(lang, count)}, {freezeLabel(lang, freezes)}</span></span>;
  return <div className="flex items-center gap-3" data-testid="streak"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft"><Flame className="h-5 w-5 text-accent-deep" aria-hidden /></span><div><p className="text-lg font-bold">{count} <span className="text-sm font-normal text-muted-foreground">{dayLabel(lang, count)}</span></p><p className="flex items-center gap-1 text-xs text-muted-foreground">{Array.from({ length: freezes }, (_, i) => <Snowflake key={i} className="h-3.5 w-3.5 text-primary-deep" aria-hidden />)}{freezes ? freezeLabel(lang, freezes) : say(lang, '1 gel tous les 7 jours', '1 freeze every 7 days', 'تجميد واحد كل 7 أيام', '1 congelación cada 7 días')}</p></div></div>;
}
