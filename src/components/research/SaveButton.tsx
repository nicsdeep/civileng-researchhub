import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/AuthProvider'
import { useSavedIndex, useToggleSave } from '../../features/library/hooks'
import type { Work } from '../../types/research'

/** ☆ Save / ★ Saved. Signed-out visitors are sent to sign in first. */
export function SaveButton({ work, variant = 'quiet' }: { work: Work; variant?: 'quiet' | 'button' }) {
  const { user } = useAuth()
  const index = useSavedIndex()
  const toggle = useToggleSave()
  const navigate = useNavigate()
  const location = useLocation()
  const savedId = index.get(work.id)
  const saved = Boolean(savedId)

  function onClick() {
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    toggle.mutate({ work, savedId })
  }

  const label = toggle.isPending ? (saved ? 'Removing…' : 'Saving…') : saved ? 'Saved' : 'Save'
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={toggle.isPending}
        aria-pressed={saved}
        title={saved ? 'Remove from My Library' : 'Save to My Library'}
        className={variant === 'button' ? (saved ? 'btn-secondary' : 'btn-primary') : `btn-quiet ${saved ? 'text-accent' : ''}`}
      >
        <span aria-hidden="true">{saved ? '★' : '☆'}</span> {label}
      </button>
      {toggle.isError && <span role="alert" className="text-xs text-danger">{toggle.error.message}</span>}
    </span>
  )
}
