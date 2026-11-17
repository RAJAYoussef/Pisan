// Code de reprise : la clé secrète du profil élève (anonyme, sans e-mail), écrite pour être recopiée.
// La garder permet de se déconnecter d'un appareil partagé puis de retrouver son profil ailleurs.
export const SESSION_KEY = 'pisan-session';

/** 64 caractères hexadécimaux en 8 groupes de 8, plus faciles à recopier. */
export const formatRecovery = (token: string) => token.toUpperCase().match(/.{1,8}/g)?.join('-') ?? '';

/** Accepte le code tel qu'il est tapé ou collé (espaces, tirets, majuscules) ; null s'il est incomplet. */
export function parseRecovery(input: string): string | null {
  const hex = input.toLowerCase().replace(/[\s\-–—_.]/g, '');
  return /^[a-f0-9]{64}$/.test(hex) ? hex : null;
}
