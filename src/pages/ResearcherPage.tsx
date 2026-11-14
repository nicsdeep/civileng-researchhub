import { Link, useParams, useSearchParams } from 'react-router'
import { Avatar } from '../components/research/AuthorCard'
import { CitationsChart } from '../components/research/CitationsChart'
import { ResultList } from '../components/research/ResultList'
import { Pagination } from '../components/research/Pagination'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useAuthor, useWorksSearch } from '../features/search/hooks'
import { ApiError } from '../lib/api'
import { formatCount } from '../lib/format'
import { toQueryString } from '../lib/searchParams'
import { usePageTitle } from '../lib/usePageTitle'
import type { SortOption } from '../types/research'

export function ResearcherPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const sort: SortOption = params.get('sort') === 'newest' ? 'newest' : 'citations'
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)
  const author = useAuthor(id)
  const works = useWorksSearch({ q: '', discipline: '', from: '', to: '', type: '', oa: false, cites: '', author: id, sort, page }, /^A\d+$/.test(id))
  usePageTitle(author.data?.name)

  if (author.isPending) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <div className="flex animate-pulse gap-4"><div className="size-20 rounded-full bg-surface-2" /><div className="flex-1 space-y-3"><div className="h-8 w-1/2 rounded bg-surface-2" /><div className="h-4 w-1/3 rounded bg-surface-2" /></div></div>
      </div>
    )
  }
  if (author.isError) {
    const notFound = author.error instanceof ApiError && (author.error.status === 404 || author.error.status === 400)
    return (
      <div className="container-page py-10">
        <StatusMessage tone="error" title={notFound ? 'Researcher not found' : 'This profile could not be loaded'} action={<Link to="/researchers" className="btn-secondary">Find researchers</Link>}>
          {author.error.message}
        </StatusMessage>
      </div>
    )
  }

  const a = author.data
  const metrics: [string, string][] = [
    ['Citations', formatCount(a.citedBy)],
    ['h-index', a.hIndex === null ? '–' : String(a.hIndex)],
    ['i10-index', a.i10Index === null ? '–' : String(a.i10Index)],
    ['Works', formatCount(a.worksCount)],
  ]
  const setView = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next)
  }

  return (
    <div className="container-page py-8">
      <Link to="/researchers" className="link text-sm">← Researchers</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <header className="flex gap-5">
          <Avatar name={a.name} size="lg" />
          <div className="min-w-0">
            <h1 className="display text-4xl leading-tight sm:text-5xl">{a.name}</h1>
            {a.institutions.length > 0 && <p className="mt-1 text-byline">{a.institutions.join(' · ')}</p>}
            {a.orcid && (
              <p className="mt-1 text-sm">
                <a href={a.orcid} target="_blank" rel="noopener noreferrer" className="link">ORCID {a.orcid.replace('https://orcid.org/', '')} ↗</a>
              </p>
            )}
            {a.topics.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5">
                {a.topics.map((t) => (
                  <Link key={t} to={`/explore?${toQueryString({ q: t })}`} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink/75 hover:border-accent hover:text-accent">{t}</Link>
                ))}
              </p>
            )}
          </div>
        </header>

        <aside className="panel space-y-5 p-5" aria-label="Research metrics">
          <dl className="grid grid-cols-4 gap-2 text-center">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="display text-2xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <CitationsChart data={a.byYear} />
        </aside>
      </div>

      <section aria-labelledby="pubs" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
          <h2 id="pubs" className="display text-3xl">Publications</h2>
          <div className="flex gap-1" role="group" aria-label="Sort publications">
            {(['citations', 'newest'] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sort === s}
                onClick={() => setView({ sort: s === 'citations' ? '' : s, page: '' })}
                className={`rounded-full px-3 py-1.5 text-sm ${sort === s ? 'bg-accent-soft font-semibold text-accent' : 'text-muted hover:text-ink'}`}
              >
                {s === 'citations' ? 'Most cited' : 'Newest'}
              </button>
            ))}
          </div>
        </div>
        <ResultList query={works} emptyMessage="No publications are listed for this researcher." />
        {works.data && (
          <Pagination
            page={page}
            total={works.data.total}
            perPage={works.data.perPage}
            onChange={(p) => { setView({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0 }) }}
          />
        )}
      </section>
    </div>
  )
}
