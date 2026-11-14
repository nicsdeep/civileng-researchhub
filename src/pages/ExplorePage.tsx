import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { SearchBar } from '../components/research/SearchBar'
import { SearchFilters } from '../components/research/SearchFilters'
import { ResultList } from '../components/research/ResultList'
import { Pagination } from '../components/research/Pagination'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useWork, useWorksSearch } from '../features/search/hooks'
import { DISCIPLINES, findDiscipline } from '../lib/disciplines'
import { formatCount } from '../lib/format'
import { parseSearchParams, toQueryString } from '../lib/searchParams'
import { usePageTitle } from '../lib/usePageTitle'
import type { WorkSearchParams } from '../types/research'

/** "Papers citing …" banner for Cited-by searches. */
function CitingBanner({ id, onClear }: { id: string; onClear: () => void }) {
  const { data } = useWork(id)
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent-soft px-4 py-2.5 text-sm">
      <p className="min-w-0">
        Papers citing{' '}
        <Link to={`/publication/${id}`} className="link font-semibold">{data?.title ?? 'this publication'}</Link>
      </p>
      <button type="button" className="btn-quiet" onClick={onClear}>Show all results</button>
    </div>
  )
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const params = parseSearchParams(searchParams)
  const hasQuery = Boolean(params.q || params.discipline || params.cites)
  const results = useWorksSearch(params, hasQuery)
  const discipline = findDiscipline(params.discipline)
  usePageTitle(params.q ? `“${params.q}”` : params.cites ? 'Cited by' : discipline ? `${discipline.name} engineering` : 'Explore')

  function update(changes: Partial<WorkSearchParams>) {
    // Any change other than paging starts again from page 1.
    setSearchParams(toQueryString({ ...params, page: 1, ...changes }))
    if ('page' in changes) window.scrollTo({ top: 0 })
  }

  return (
    <div className="container-page py-6">
      {/* The header carries the search bar on wide screens. */}
      <div className="mb-5 md:hidden">
        <SearchBar key={params.q} initialQuery={params.q} />
      </div>

      <div className="grid gap-8 md:grid-cols-[13.5rem_1fr]">
        <aside aria-label="Filters">
          <button
            type="button"
            className="btn-secondary w-full md:hidden"
            aria-expanded={filtersOpen}
            aria-controls="filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Filters and sorting'}
          </button>
          <div id="filters" className={`${filtersOpen ? 'block pt-4' : 'hidden'} md:sticky md:top-4 md:block md:pt-0`}>
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
              {params.cites && <CitingBanner id={params.cites} onClear={() => update({ cites: '' })} />}
              <p className="border-b border-line pb-3 text-sm text-muted" aria-live="polite">
                {results.data
                  ? `About ${formatCount(results.data.total)} results${discipline ? ` in ${discipline.name} engineering` : ''}`
                  : results.isPending ? 'Searching…' : ''}
              </p>
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
