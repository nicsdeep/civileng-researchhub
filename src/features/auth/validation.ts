/** Only allow returning to pages on this site after signing in. */
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/library'
}
