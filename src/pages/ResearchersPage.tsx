import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { AuthorCard } from '../components/research/AuthorCard'
import { Pagination } from '../components/research/Pagination'
import { ResultSkeleton, StatusMessage } from '../components/ui/StatusMessage'
import { useAuthorSearch } from '../features/search/hooks'
import { DISCIPLINES, findDiscipline } from '../lib/disciplines'
import { formatCount } from '../lib/format'
import { parseAuthorParams, toAuthorQueryString } from '../lib/searchParams'
import { usePageTitle } from '../lib/usePageTitle'
import type { AuthorSearchParams } from '../types/research'

export function ResearchersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseAuthorParams(searchParams)
  const [name, setName] = useState(params.q)
  const results = useAuthorSearch(params)
  const discipline = findDiscipline(params.discipline)
  usePageTitle(params.q ? `Researchers: “${params.q}”` : 'Researchers')

  function update(changes: Partial<AuthorSearchParams>) {
    setSearchParams(toAuthorQueryString({ ...params, page: 1, ...changes }))
    if ('page' in changes) window.scrollTo({ top: 0 })
  }

  function onSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: name.trim() })
  }

  const data = results.data
  const field = discipline ? `${discipline.name.toLowerCase()} engineering` : 'civil engineering'
  const heading = params.q
    ? data ? `About ${formatCount(data.total)} researchers named “${params.q}”` : 'Searching…'
    : `Most active in ${field}${params.canada ? ' in Canada' : ''}${data?.since ? ` since ${data.since}` : ''}`

  const chip = (selected: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${selected ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-line bg-surface text-ink/80 hover:border-accent hover:text-accent'}`

  return (
    <div className="container-page py-8">
      <h1 className="display text-5xl">Find <em className="text-brand-italic">researchers.</em></h1>
      <p className="mt-1 text-muted">Profiles, affiliations and publications of civil engineering researchers.</p>

      <form role="search" onSubmit={onSearch} className="mt-6 flex max-w-2xl items-center gap-1 rounded-full border border-line bg-surface p-1 pl-4 focus-within:border-accent">
        <label htmlFor="researcher-q" className="sr-only">Researcher name</label>
        <input
          id="researcher-q"
          type="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search by name, e.g. Hesham El Naggar"
          autoComplete="off"
          className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <button type="submit" className="btn-primary h-9 px-4">Search</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Filters">
        {!params.q && (
          <>
            <button type="button" className={chip(!params.discipline)} onClick={() => update({ discipline: '' })} aria-pressed={!params.discipline}>All civil</button>
            {DISCIPLINES.map((d) => (
              <button key={d.slug} type="button" className={chip(params.discipline === d.slug)} aria-pressed={params.discipline === d.slug} onClick={() => update({ discipline: d.slug })}>
                {d.name}
              </button>
            ))}
          </>
        )}
        <label className="ml-1 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={params.canada} onChange={(e) => update({ canada: e.target.checked })} />
          Canadian institutions only
        </label>
        {params.q && (
          <button type="button" className="btn-quiet" onClick={() => { setName(''); update({ q: '' }) }}>Browse by discipline instead</button>
        )}
      </div>

      <section aria-label="Researchers" className="mt-6">
        <div className="border-b border-line pb-3">
          <h2 className="text-sm font-semibold" aria-live="polite">{heading}</h2>
          {!params.q && (
            <p className="text-xs text-muted">
              Ranked by number of papers published in the field{params.canada ? ' at Canadian institutions. Affiliations shown are current, so some researchers have since moved' : ''}.
            </p>
          )}
        </div>

        {results.isPending ? (
          <ResultSkeleton />
        ) : results.isError ? (
          <StatusMessage tone="error" title="Researchers could not be loaded" action={<button type="button" className="btn-secondary" onClick={() => results.refetch()}>Try again</button>}>
            {results.error.message}
          </StatusMessage>
        ) : data && data.results.length === 0 ? (
          <StatusMessage title="No researchers found">Check the spelling, try fewer words, or turn off the Canada filter.</StatusMessage>
        ) : (
          <div className={`divide-y divide-line ${results.isFetching ? 'opacity-60' : ''}`}>
            {data?.results.map((a) => <AuthorCard key={a.id} author={a} sinceLabel={data.since ? `since ${data.since}` : undefined} />)}
          </div>
        )}
        {data && <Pagination page={params.page} total={data.total} perPage={data.perPage} onChange={(page) => update({ page })} />}
      </section>
    </div>
  )
}
