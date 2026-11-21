// Gestion des comptes enseignants, réservée à l'administrateur (app_metadata.pisan_admin, posé côté serveur).
// Les inscriptions libres sont fermées : seuls les comptes créés ici peuvent se connecter.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { isAdmin, mustChangePassword, temporaryPassword } from './teacher-accounts';

async function admin() { return (await import('@/integrations/supabase/client.server')).supabaseAdmin; }
/** Lit les drapeaux du compte à la source (pas dans le jeton, qui peut dater d'avant un changement). */
async function flags(userId: string) {
  const { data, error } = await (await admin()).auth.admin.getUserById(userId);
  if (error || !data.user) throw new Error('Compte introuvable.');
  return { meta: (data.user.app_metadata ?? {}) as Record<string, unknown>, user: data.user };
}
async function requireAdmin(userId: string) {
  if (!isAdmin((await flags(userId)).meta)) throw new Error('Réservé à l’administrateur.');
}

/** Ce que l'espace enseignant doit savoir sur la personne connectée. */
export const whoAmI = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { meta } = await flags(context.userId);
  return { admin: isAdmin(meta), mustChangePassword: mustChangePassword(meta) };
});

/** Après avoir choisi son mot de passe (dans le navigateur), on retire l'obligation de le changer. */
export const passwordChanged = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { meta } = await flags(context.userId);
  const { error } = await (await admin()).auth.admin.updateUserById(context.userId, { app_metadata: { ...meta, must_change_password: false } });
  if (error) throw new Error('Mise à jour impossible.');
  return { ok: true };
});

export type TeacherAccount = { id: string; email: string; display_name: string; school_name: string; last_sign_in_at: string | null; active: boolean; admin: boolean; pending: boolean };

export const listTeachers = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<TeacherAccount[]> => {
  await requireAdmin(context.userId);
  const db = await admin();
  const [users, rows] = await Promise.all([db.auth.admin.listUsers({ page: 1, perPage: 1000 }), db.from('teachers').select('id, display_name, school_name')]);
  if (users.error || rows.error) throw new Error('Liste indisponible.');
  const byId = new Map((rows.data ?? []).map(r => [r.id, r]));
  return users.data.users.map(u => ({
    id: u.id, email: u.email ?? '', display_name: byId.get(u.id)?.display_name ?? '', school_name: byId.get(u.id)?.school_name ?? '',
    last_sign_in_at: u.last_sign_in_at ?? null, active: !u.banned_until || Date.parse(u.banned_until) < Date.now(),
    admin: isAdmin(u.app_metadata), pending: mustChangePassword(u.app_metadata),
  })).sort((a, b) => a.school_name.localeCompare(b.school_name) || a.display_name.localeCompare(b.display_name));
});

export const createTeacherAccount = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().trim().toLowerCase().email().max(200), display_name: z.string().trim().min(1).max(80), school_name: z.string().trim().min(1).max(120) }).strict())
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const db = await admin();
    const password = temporaryPassword();
    const created = await db.auth.admin.createUser({ email: data.email, password, email_confirm: true, app_metadata: { must_change_password: true } });
    if (created.error || !created.data.user) return { ok: false as const, reason: /already|exists|registered/i.test(created.error?.message ?? '') ? 'exists' as const : 'error' as const };
    const row = await db.from('teachers').insert({ id: created.data.user.id, display_name: data.display_name, school_name: data.school_name });
    if (row.error) { await db.auth.admin.deleteUser(created.data.user.id); return { ok: false as const, reason: 'error' as const }; }
    return { ok: true as const, password };
  });

export const resetTeacherPassword = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).strict())
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { meta } = await flags(data.id);
    const password = temporaryPassword();
    const { error } = await (await admin()).auth.admin.updateUserById(data.id, { password, app_metadata: { ...meta, must_change_password: true } });
    if (error) throw new Error('Réinitialisation impossible.');
    return { password };
  });

export const setTeacherActive = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), active: z.boolean() }).strict())
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    if (data.id === context.userId) throw new Error('Impossible de désactiver son propre compte.');
    const { error } = await (await admin()).auth.admin.updateUserById(data.id, { ban_duration: data.active ? 'none' : '876000h' });
    if (error) throw new Error('Mise à jour impossible.');
    return { ok: true };
  });
