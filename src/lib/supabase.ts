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
  if (/rate limit|too many|security purposes/i.test(text)) return 'Too many sign-in emails were sent. Please wait a few minutes and try again.'
  if (/invalid.*email|unable to validate email/i.test(text)) return 'Please enter a valid email address.'
  if (/signups? not allowed/i.test(text)) return 'New accounts are switched off at the moment.'
  if (/expired|invalid.*(link|token)/i.test(text)) return 'That sign-in link has expired or was already used. Request a new one.'
  if (/fetch|network/i.test(text)) return 'Could not reach the server. Check your connection and try again.'
  return text || 'Something went wrong. Please try again.'
}
