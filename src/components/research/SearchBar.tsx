import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toQueryString } from '../../lib/searchParams'

interface Props {
  initialQuery?: string
  size?: 'large' | 'default'
  autoFocus?: boolean
}

/** Search pill. Submitting opens Explore with the query in the URL. */
export function SearchBar({ initialQuery = '', size = 'default', autoFocus }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const navigate = useNavigate()
  const large = size === 'large'

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const q = query.trim()
    if (q) navigate(`/explore?${toQueryString({ q })}`)
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`flex w-full items-center gap-1 rounded-full border border-line bg-surface shadow-[0_1px_2px_rgba(16,40,36,0.06)] focus-within:border-accent ${large ? 'p-1.5 pl-5' : 'p-1 pl-4'}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className={`shrink-0 text-muted ${large ? 'size-5' : 'size-4'}`} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <label htmlFor={`search-${size}`} className="sr-only">Search publications</label>
      <input
        id={`search-${size}`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search papers, topics, authors or DOIs"
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className={`min-w-0 flex-1 bg-transparent px-2 text-ink placeholder:text-muted focus:outline-none ${large ? 'h-11 text-base' : 'h-9 text-sm'}`}
      />
      <button type="submit" className={`btn-primary ${large ? 'h-11 px-6 text-base' : 'h-9 px-4'}`}>
        Search
      </button>
    </form>
  )
}
