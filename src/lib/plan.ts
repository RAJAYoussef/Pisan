// Business rules for access plans and pricing. Pure functions — covered by src/test/plan.test.ts.

export const DAILY_FREE_LIMIT = 3;

export type Plan = "discovery" | "partner" | "premium";

export const PRICES = {
  monthly: { amount: 12, currency: "EUR", interval: "month" },
  yearly: { amount: 89, currency: "EUR", interval: "year" },
} as const;

/**
 * External payment links (Stripe / Paddle / other checkout URLs).
 * Leave empty until a payment provider is connected; the UI shows a friendly notice instead.
 */
export const PAYMENT_LINKS: Record<keyof typeof PRICES, string> = {
  monthly: "",
  yearly: "",
};

export function isUnlimited(plan: Plan): boolean {
  return plan === "partner" || plan === "premium";
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DailyUsage = { date: string; count: number };

/** Exercises still available today. `null` means unlimited. */
export function exercisesLeft(plan: Plan, daily: DailyUsage, today: string): number | null {
  if (isUnlimited(plan)) return null;
  const used = daily.date === today ? daily.count : 0;
  return Math.max(0, DAILY_FREE_LIMIT - used);
}

export function canStartExercise(plan: Plan, daily: DailyUsage, today: string): boolean {
  const left = exercisesLeft(plan, daily, today);
  return left === null || left > 0;
}

export function incrementDaily(daily: DailyUsage, today: string): DailyUsage {
  return daily.date === today ? { date: today, count: daily.count + 1 } : { date: today, count: 1 };
}

export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7;

export type Streak = { count: number; lastDay: string; freezes?: number };
export type StreakUpdate = { count: number; lastDay: string; freezes: number; usedFreeze: boolean; restarted: boolean };

/** Days between two YYYY-MM-DD keys (b - a). */
export function dayGap(a: string, b: string): number {
  const toUtc = (k: string) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1); };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/**
 * Day-streak update after a finished exercise on local day `today`.
 * Same day keeps it; next day +1; exactly one missed day uses a freeze when available;
 * otherwise the streak restarts at 1. Every 7 streak days earns a freeze (max 2).
 * Mirrored in SQL by public.record_pisan_streak.
 */
export function nextStreak(streak: Streak, today: string): StreakUpdate {
  const freezes = Math.min(MAX_FREEZES, Math.max(0, streak.freezes ?? 0));
  const same = { count: streak.count, lastDay: streak.lastDay, freezes, usedFreeze: false, restarted: false };
  if (!streak.lastDay || streak.count <= 0) return grant({ ...same, count: 1, lastDay: today });
  const gap = dayGap(streak.lastDay, today);
  if (gap <= 0) return same;
  if (gap === 1) return grant({ ...same, count: streak.count + 1, lastDay: today });
  if (gap === 2 && freezes > 0) return grant({ ...same, count: streak.count + 1, lastDay: today, freezes: freezes - 1, usedFreeze: true });
  return { count: 1, lastDay: today, freezes, usedFreeze: false, restarted: true };
}
function grant(u: StreakUpdate): StreakUpdate {
  return u.count % FREEZE_EVERY === 0 ? { ...u, freezes: Math.min(MAX_FREEZES, u.freezes + 1) } : u;
}

/** Streak shown today: still alive if last day is today, yesterday, or two days ago with a freeze. */
export function visibleStreak(streak: Streak, today: string): number {
  if (!streak.lastDay || streak.count <= 0) return 0;
  const gap = dayGap(streak.lastDay, today);
  if (gap <= 1) return streak.count;
  if (gap === 2 && (streak.freezes ?? 0) > 0) return streak.count;
  return 0;
}

/** Valid IANA time zone name (server-side check). */
export function isTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || tz.length > 64 || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(tz)) return false;
  const list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
  if (list && !list.includes(tz) && tz !== "UTC") return false;
  try { new Intl.DateTimeFormat("en-CA", { timeZone: tz }); return true; } catch { return false; }
}

/** Local YYYY-MM-DD for an instant in the given IANA zone (falls back to UTC). */
export function localDay(at: Date, tz: string | undefined): string {
  const zone = isTimeZone(tz) ? tz : "UTC";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export const TIMEZONE_CHANGE_DAYS = 7;
/** Fuseau du profil : un changement est accepté au plus une fois tous les 7 jours (le premier réglage est libre). */
export function resolveTimeZone(current: string | undefined, requested: string | undefined, changedAt: string | null, now: Date): { timezone: string | undefined; changedAt: string | null } {
  const valid = isTimeZone(requested) ? requested : undefined;
  if (!valid || valid === current) return { timezone: current, changedAt: null };
  if (!current) return { timezone: valid, changedAt: now.toISOString() };
  if (changedAt && now.getTime() - new Date(changedAt).getTime() < TIMEZONE_CHANGE_DAYS * 86400000) return { timezone: current, changedAt: null };
  return { timezone: valid, changedAt: now.toISOString() };
}
/** Miroir de la garde SQL : un jour doit être strictement après le dernier, et au plus demain (UTC). */
export function acceptDay(last: string | null | undefined, day: string, now: Date): boolean {
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  return day <= tomorrow && (!last || day > last);
}
