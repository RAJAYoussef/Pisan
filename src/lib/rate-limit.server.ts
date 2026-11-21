// Limitation de débit côté serveur (table public.rate_limits, fonction public.pisan_rate_limit).
// La clé ne contient jamais l'adresse IP en clair : seulement une empreinte salée par le secret de signature.
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';
import { signingSecrets } from './signing-secrets';

/** Empreinte (16 caractères) de l'adresse IP de la requête, ou null si on ne la connaît pas. */
export async function clientFingerprint(): Promise<string | null> {
  let ip: string | undefined;
  try { ip = getRequestHeader('cf-connecting-ip') ?? getRequestIP({ xForwardedFor: true }); } catch { return null; } // hors requête (tests)
  if (!ip) return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`pisan-ip:${signingSecrets()[0]}:${ip}`));
  return Array.from(new Uint8Array(bytes).slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
}

/** true si l'action est permise (moins de `limit` fois par fenêtre de `windowSeconds` pour cette empreinte). */
export async function allowed(action: string, limit: number, windowSeconds: number): Promise<boolean> {
  const who = await clientFingerprint();
  if (!who) return true;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('pisan_rate_limit', { p_key: `${action}:${who}`, p_limit: limit, p_window_seconds: windowSeconds });
  // En cas de panne de la limite, on ne bloque pas les élèves.
  return error ? true : data !== false;
}

/** Sans rien compter : la limite est-elle déjà atteinte pour cette action sur cette fenêtre ? */
export async function blocked(action: string, limit: number, windowSeconds: number): Promise<boolean> {
  const who = await clientFingerprint();
  if (!who) return false;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.from('rate_limits').select('count, window_start').eq('key', `${action}:${who}`).maybeSingle();
  if (error || !data) return false;
  const fresh = Date.parse(data.window_start) > Date.now() - windowSeconds * 1000;
  return fresh && data.count >= limit;
}

/** Compte un échec (par exemple un mauvais code) sans rien bloquer : blocked() fera le tri au prochain essai. */
export async function countFailure(action: string, windowSeconds: number): Promise<void> {
  const who = await clientFingerprint();
  if (!who) return;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin.rpc('pisan_rate_limit', { p_key: `${action}:${who}`, p_limit: 1_000_000, p_window_seconds: windowSeconds });
}
