// Comptes enseignants créés par l'administrateur : mot de passe provisoire lisible, à changer à la première
// connexion. Pur (Web Crypto), couvert par src/test/teacher-accounts.test.ts.

/** Sans caractères ambigus (0/O, 1/l/I) : facile à recopier depuis une feuille. */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Mot de passe provisoire : 3 groupes de 4 caractères (environ 70 bits d'aléa), par ex. « Kp7m-Xr4t-Qa9z ». */
export function temporaryPassword(random: (n: number) => Uint8Array = n => crypto.getRandomValues(new Uint8Array(n))): string {
  const bytes = random(12);
  const chars = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]!);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map(g => g.join('')).join('-');
}
/** Règle du nouveau mot de passe choisi par l'enseignant. */
export const PASSWORD_MIN = 10;
export const passwordOk = (p: string) => p.length >= PASSWORD_MIN && /[A-Za-z]/.test(p) && /\d/.test(p);

/** Métadonnées d'application d'un compte (posées par le serveur, jamais par le navigateur). */
export type TeacherFlags = { pisan_admin?: boolean; must_change_password?: boolean };
export const isAdmin = (meta: unknown) => (meta as TeacherFlags | null)?.pisan_admin === true;
export const mustChangePassword = (meta: unknown) => (meta as TeacherFlags | null)?.must_change_password === true;
