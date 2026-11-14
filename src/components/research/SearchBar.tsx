import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toQueryString } from '../../lib/searchParams'

interface Props {
  initialQuery?: string
  size?: 'large' | 'default'
  autoFocus?: boolean
}

/** Main search input. Submitting opens Explore with the query in the URL. */
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
    <form role="search" onSubmit={onSubmit} className="flex w-full gap-2">
      <label htmlFor={`search-${size}`} className="sr-only">
        Search publications
      </label>
      <input
        id={`search-${size}`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search papers, topics or DOIs"
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className={`field min-w-0 flex-1 ${large ? 'h-12 px-4 text-base' : 'h-10'}`}
      />
      <button type="submit" className={`btn-primary ${large ? 'h-12 px-6 text-base' : 'h-10'}`}>
        Search
      </button>
    </form>
  )
}
