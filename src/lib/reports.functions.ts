// Signalements d'erreur : écrits par n'importe quel élève (limité par adresse), lus et clos par l'administrateur seul.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { reportedStep, reportInput } from './reports';
import { isAdmin } from './teacher-accounts';

async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
async function requireAdmin(userId: string) {
  const { data, error } = await (await admin()).auth.admin.getUserById(userId);
  if (error || !data.user || !isAdmin(data.user.app_metadata)) throw new Error('Réservé à l’administrateur.');
}

export const reportQuestion = createServerFn({ method: 'POST' }).inputValidator(reportInput).handler(async ({ data }) => {
  if (!reportedStep(data.skill, data.seed, data.step)) return { ok: false as const, reason: 'unknown' as const };
  const { allowed } = await import('./rate-limit.server');
  if (!(await allowed('report', 20, 3600))) return { ok: false as const, reason: 'limit' as const };
  const { error } = await (await admin()).from('question_reports').insert({
    skill_id: data.skill, seed: data.seed, step: data.step, context: data.context, lang: data.lang, reason: data.reason, message: data.message,
  });
  if (error) throw new Error('Signalement non enregistré.');
  return { ok: true as const };
});

export type QuestionReport = { id: string; created_at: string; skill_id: string; seed: number; step: number; context: string; lang: string; reason: string; message: string; status: string };

export const listReports = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ status: z.enum(['open', 'done']) }).strict())
  .handler(async ({ data, context }): Promise<QuestionReport[]> => {
    await requireAdmin(context.userId);
    const { data: rows, error } = await (await admin()).from('question_reports')
      .select('id, created_at, skill_id, seed, step, context, lang, reason, message, status')
      .eq('status', data.status).order('created_at', { ascending: false }).limit(200);
    if (error) throw new Error('Liste indisponible.');
    return rows ?? [];
  });

export const setReportStatus = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['open', 'done']) }).strict())
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { error } = await (await admin()).from('question_reports').update({ status: data.status }).eq('id', data.id);
    if (error) throw new Error('Mise à jour impossible.');
    return { ok: true };
  });
