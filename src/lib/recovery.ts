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
