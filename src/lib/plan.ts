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

/** Day-streak update: same day keeps it, consecutive day increments, a gap restarts at 1. */
export function nextStreak(
  streak: { count: number; lastDay: string },
  today: string,
): { count: number; lastDay: string } {
  if (streak.lastDay === today) return streak;
  const prev = new Date(today + "T12:00:00");
  prev.setDate(prev.getDate() - 1);
  const yesterday = todayKey(prev);
  return { count: streak.lastDay === yesterday ? streak.count + 1 : 1, lastDay: today };
}
