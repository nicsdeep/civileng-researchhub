import { MAX_PAGE } from '../../lib/searchParams'

interface Props {
  page: number
  total: number
  perPage: number
  onChange: (page: number) => void
}

export function Pagination({ page, total, perPage, onChange }: Props) {
  const lastPage = Math.min(Math.ceil(total / perPage), MAX_PAGE)
  if (lastPage <= 1) return null

  return (
    <nav aria-label="Result pages" className="flex items-center justify-between border-t border-line pt-5">
      <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span className="text-sm text-muted">
        Page {page} of {lastPage.toLocaleString('en-CA')}
      </span>
      <button type="button" className="btn-secondary" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </nav>
  )
}
