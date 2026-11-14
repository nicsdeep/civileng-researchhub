import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { SearchBar } from '../components/research/SearchBar'
import { SearchFilters } from '../components/research/SearchFilters'
import { ResultList } from '../components/research/ResultList'
import { Pagination } from '../components/research/Pagination'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useWorksSearch } from '../features/search/hooks'
import { DISCIPLINES, findDiscipline } from '../lib/disciplines'
import { formatCount } from '../lib/format'
import { parseSearchParams, toQueryString } from '../lib/searchParams'
import { usePageTitle } from '../lib/usePageTitle'
import type { SortOption, WorkSearchParams } from '../types/research'

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const params = parseSearchParams(searchParams)
  const hasQuery = Boolean(params.q || params.discipline)
  const results = useWorksSearch(params, hasQuery)
  const discipline = findDiscipline(params.discipline)
  usePageTitle(params.q ? `“${params.q}”` : discipline ? `${discipline.name} engineering` : 'Explore')

  function update(changes: Partial<WorkSearchParams>) {
    // Any change other than paging starts again from page 1.
    setSearchParams(toQueryString({ ...params, page: 1, ...changes }))
    if ('page' in changes) window.scrollTo({ top: 0 })
  }

  return (
    <div className="container-page py-6">
      <div className="max-w-2xl">
        {/* key resets the input when the query changes via navigation */}
        <SearchBar key={params.q} initialQuery={params.q} />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[14rem_1fr]">
        <aside aria-label="Filters">
          {/* One set of filters: collapsible on phones, always visible on wider screens. */}
          <button
            type="button"
            className="btn-secondary w-full md:hidden"
            aria-expanded={filtersOpen}
            aria-controls="filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Filters'}
          </button>
          <div id="filters" className={`${filtersOpen ? 'block pt-4' : 'hidden'} md:block md:pt-0`}>
            <SearchFilters params={params} onChange={update} />
          </div>
        </aside>

        <section aria-label="Search results" className="min-w-0">
          {!hasQuery ? (
            <StatusMessage title="Search civil engineering research">
              <p>Enter keywords above, or start from a discipline:</p>
              <p className="mt-2">
                {DISCIPLINES.map((d, i) => (
                  <span key={d.slug}>
                    {i > 0 && ' · '}
                    <Link to={`/explore?${toQueryString({ discipline: d.slug })}`} className="link">{d.name}</Link>
                  </span>
                ))}
              </p>
            </StatusMessage>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <p className="text-sm text-muted" aria-live="polite">
                  {results.data
                    ? `${formatCount(results.data.total)} results${discipline ? ` in ${discipline.name}` : ''}`
                    : results.isPending ? 'Searching…' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-muted">Sort by</label>
                  <select
                    id="sort"
                    className="field w-auto"
                    value={params.sort}
                    onChange={(e) => update({ sort: e.target.value as SortOption })}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="citations">Most cited</option>
                  </select>
                </div>
              </div>
              <ResultList query={results} />
              {results.data && (
                <Pagination
                  page={params.page}
                  total={results.data.total}
                  perPage={results.data.perPage}
                  onChange={(page) => update({ page })}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
