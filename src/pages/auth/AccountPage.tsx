import { Link, useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthProvider'
import { useSavedWorks, useCollections } from '../../features/library/hooks'
import { usePageTitle } from '../../lib/usePageTitle'

export function AccountPage() {
  usePageTitle('Account')
  const { user } = useAuth()
  const navigate = useNavigate()
  const saved = useSavedWorks()
  const collections = useCollections()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="display text-5xl">Your <em className="text-brand-italic">account.</em></h1>

      <section className="panel mt-8 p-6" aria-labelledby="profile">
        <h2 id="profile" className="label">Signed in as</h2>
        <p className="font-medium break-all">{user?.email}</p>
        {joined && <p className="mt-1 text-sm text-muted">Member since {joined}</p>}
        <p className="mt-1 text-sm text-muted">You sign in with a link sent to this email. There is no password.</p>
        <dl className="mt-5 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-muted">Saved papers</dt>
            <dd className="display text-3xl">{saved.data?.length ?? '–'}</dd>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-muted">Collections</dt>
            <dd className="display text-3xl">{collections.data?.length ?? '–'}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/library" className="btn-primary">Open My Library</Link>
          <button type="button" className="btn-secondary" onClick={signOut}>Sign out</button>
        </div>
      </section>
    </div>
  )
}
