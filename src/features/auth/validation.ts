/** Only allow returning to pages on this site after signing in. */
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/library'
}

/** Mirrors the Supabase password rules (8+ characters, letters and digits). */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return 'Use both letters and numbers.'
  return null
}
