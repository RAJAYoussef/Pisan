/** Preview controls are not an authorization mechanism. */
export function shouldShowTestBar(development: boolean, hostname: string): boolean {
  return development || /^id-preview--[a-z0-9-]+\.lovable\.app$/i.test(hostname);
}