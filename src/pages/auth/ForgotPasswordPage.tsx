import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase, authMessage } from '../../lib/supabase'
import { usePageTitle } from '../../lib/usePageTitle'
import { AuthLayout, Field, FormError } from './AuthLayout'

export function ForgotPasswordPage() {
  usePageTitle('Reset password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account`,
    })
    setBusy(false)
    if (error) setError(authMessage(error))
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Check your" accent="inbox.">
        <p>If an account exists for <strong>{email.trim()}</strong>, we sent a link to choose a new password.</p>
        <Link to="/sign-in" className="btn-secondary mt-6">Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your" accent="password." intro="Enter your account email and we will send you a link to choose a new password.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormError message={error} />
        <button type="submit" className="btn-primary h-11 w-full text-base" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <p className="mt-5 text-sm"><Link to="/sign-in" className="link">Back to sign in</Link></p>
    </AuthLayout>
  )
}
