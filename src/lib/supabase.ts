import { createClient } from '@supabase/supabase-js'

// Both values are public by design (Row Level Security protects the data).
// Environment variables win; the fallbacks keep the site working if they are
// missing from a deployment.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://iealljnqewqyojtlgheh.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_KKkB6HH5NpGfqCFQw5ZQDA_R4ziATa1'

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

/** Turns Supabase auth errors into plain, actionable messages. */
export function authMessage(error: { message?: string; code?: string } | null): string {
  const text = error?.message ?? ''
  if (/invalid login credentials/i.test(text)) return 'Email or password is incorrect.'
  if (/email not confirmed/i.test(text)) return 'Please confirm your email first. Check your inbox for the link we sent.'
  if (/rate limit|too many/i.test(text)) return 'Too many attempts. Please wait a minute and try again.'
  if (/password should|weak password|password.*characters/i.test(text))
    return 'Choose a password of at least 8 characters with both letters and numbers.'
  if (/same.*password|different from the old/i.test(text)) return 'Choose a password different from your current one.'
  if (/user already registered/i.test(text)) return 'An account with this email already exists. Try signing in.'
  if (/fetch|network/i.test(text)) return 'Could not reach the server. Check your connection and try again.'
  return text || 'Something went wrong. Please try again.'
}
