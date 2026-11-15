export async function sessionHash(token: string) {
 const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
 return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
