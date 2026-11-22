// Code de reprise : la clé secrète du profil élève (anonyme, sans e-mail), écrite pour être recopiée.
// La garder permet de se déconnecter d'un appareil partagé puis de retrouver son profil ailleurs.
export const SESSION_KEY = 'pisan-session';
/** Lecture et écriture de la clé de l'élève qui ne plantent jamais : si le navigateur bloque le stockage
 *  (navigation privée stricte, poste verrouillé), on garde la clé en mémoire et `persisted` vaut false. */
let memoryKey: string | null = null;
export function readSessionKey(): { key: string | null; persisted: boolean } {
  try { return { key: localStorage.getItem(SESSION_KEY), persisted: true }; } catch { return { key: memoryKey, persisted: false }; }
}
export function writeSessionKey(key: string): boolean {
  memoryKey = key;
  try { localStorage.setItem(SESSION_KEY, key); return true; } catch { return false; }
}

/** 64 caractères hexadécimaux en 8 groupes de 8, plus faciles à recopier. */
export const formatRecovery = (token: string) => token.toUpperCase().match(/.{1,8}/g)?.join('-') ?? '';

/** Accepte le code tel qu'il est tapé ou collé (espaces, tirets, majuscules) ; null s'il est incomplet. */
export function parseRecovery(input: string): string | null {
  const hex = input.toLowerCase().replace(/[\s\-–—_.]/g, '');
  return /^[a-f0-9]{64}$/.test(hex) ? hex : null;
}

// ───────────── Code de reprise court ─────────────
// 12 caractères (alphabet de Crockford : sans I, L, O, U), soit 60 bits. La clé du profil (64 caractères hexadécimaux,
// la seule que voit le serveur) est calculée à partir du code : le même code redonne donc le même profil sur tous les
// appareils. Les profils créés avant gardent leur code long, toujours accepté.
export const SHORT_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const SHORT_LENGTH = 12;
export const CODE_KEY = 'pisan-recovery-code';

export function newShortCode(random: (n: number) => Uint8Array = n => crypto.getRandomValues(new Uint8Array(n))): string {
  return Array.from(random(SHORT_LENGTH), b => SHORT_ALPHABET[b & 31]!).join('');
}
/** Le code tel qu'il est tapé : majuscules, sans séparateurs, O lu comme 0, I et L lus comme 1. Null s'il est invalide. */
export function normalizeShort(input: string): string | null {
  const c = input.toUpperCase().replace(/[\s\-–—_.]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  return c.length === SHORT_LENGTH && [...c].every(ch => SHORT_ALPHABET.includes(ch)) ? c : null;
}
export const formatShort = (code: string) => code.match(/.{1,4}/g)?.join('-') ?? code;
/** La clé du profil correspondant à un code court. */
export async function tokenFromShort(code: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`pisan-recovery:v1:${code}`));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
/** Code long (64 caractères) ou code court (12 caractères) → la clé du profil, et le code court s'il y en a un. */
export async function resolveRecovery(input: string): Promise<{ token: string; short: string | null } | null> {
  const long = parseRecovery(input);
  if (long) return { token: long, short: null };
  const short = normalizeShort(input);
  return short ? { token: await tokenFromShort(short), short } : null;
}
let memoryCode: string | null = null;
export function readShortCode(): string | null { try { return localStorage.getItem(CODE_KEY); } catch { return memoryCode; } }
export function writeShortCode(code: string | null) {
  memoryCode = code;
  try { if (code) localStorage.setItem(CODE_KEY, code); else localStorage.removeItem(CODE_KEY); } catch { /* gardé en mémoire */ }
}
