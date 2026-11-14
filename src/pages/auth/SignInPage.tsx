import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { supabase, authMessage } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthProvider'
import { usePageTitle } from '../../lib/usePageTitle'
import { AuthLayout, Field, FormError } from './AuthLayout'
import { safeNext } from '../../features/auth/validation'

export function SignInPage() {
  usePageTitle('Sign in')
  const { user } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={next} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setError(authMessage(error))
    else navigate(next, { replace: true })
  }

  return (
    <AuthLayout title="Welcome" accent="back." intro="Sign in to save publications and organize them into collections.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormError message={error} />
        <button type="submit" className="btn-primary h-11 w-full text-base" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link to="/forgot-password" className="link">Forgot password?</Link>
        <Link to={`/sign-up?next=${encodeURIComponent(next)}`} className="link font-semibold">Create an account</Link>
      </div>
    </AuthLayout>
  )
}
