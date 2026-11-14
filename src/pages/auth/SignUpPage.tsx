import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { supabase, authMessage } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthProvider'
import { usePageTitle } from '../../lib/usePageTitle'
import { AuthLayout, Field, FormError } from './AuthLayout'
import { passwordProblem, safeNext } from '../../features/auth/validation'

export function SignUpPage() {
  usePageTitle('Create account')
  const { user } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (user && !sentTo) return <Navigate to={next} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = passwordProblem(password)
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    })
    setBusy(false)
    if (error) return setError(authMessage(error))
    // With email confirmation on, there is no session until the link is clicked.
    if (data.session) navigate(next, { replace: true })
    else setSentTo(email.trim())
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your" accent="inbox.">
        <p>
          We sent a confirmation link to <strong>{sentTo}</strong>. Open it to finish creating your account, then you
          will be signed in automatically.
        </p>
        <p className="mt-3 text-sm text-muted">No email after a few minutes? Check spam, or try again with the same address.</p>
        <Link to="/sign-in" className="btn-secondary mt-6">Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your" accent="library." intro="Free account to save publications, build collections and cite them later.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters, with letters and numbers."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormError message={error} />
        <button type="submit" className="btn-primary h-11 w-full text-base" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-5 text-sm">
        Already have an account? <Link to={`/sign-in?next=${encodeURIComponent(next)}`} className="link font-semibold">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
