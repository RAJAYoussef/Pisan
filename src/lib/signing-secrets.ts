// Secrets de signature (jetons de parcours, réponses du coach) : un secret dédié, PISAN_SIGNING_SECRET, et
// l'ancienne clé (la clé service de la base) acceptée en vérification seulement, le temps que les jetons en
// cours expirent. Changer la clé de la base ne casse donc plus les parcours. Serveur uniquement.
export function signingSecrets(): string[] {
  const own = process.env['PISAN_SIGNING_SECRET'], legacy = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const list = [own, legacy].filter((s): s is string => !!s && s.length >= 16);
  if (!list.length) throw new Error('Correction indisponible.');
  return list;
}
