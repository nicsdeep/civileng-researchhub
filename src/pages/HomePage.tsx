import { useState } from 'react'
import { Link } from 'react-router'
import { Logo } from '../components/ui/Logo'
import { SearchBar } from '../components/research/SearchBar'
import { ResultList } from '../components/research/ResultList'
import { useWorksSearch } from '../features/search/hooks'
import { DISCIPLINES } from '../lib/disciplines'
import { toQueryString } from '../lib/searchParams'
import { usePageTitle } from '../lib/usePageTitle'

const EXAMPLES = ['recycled aggregate concrete', 'pile foundation settlement', 'freeze-thaw pavement durability']
const SINCE = String(new Date().getFullYear() - 2)

export function HomePage() {
  usePageTitle()
  const [discipline, setDiscipline] = useState(DISCIPLINES[0].slug)
  const featured = useWorksSearch({
    q: '', discipline, from: SINCE, to: '', type: 'article', oa: false, cites: '', sort: 'citations', page: 1,
  })

  return (
    <>
      <section className="container-page flex flex-col items-center pt-10 pb-14 text-center sm:pt-16">
        <Logo size="large" />
        <p className="mt-4 text-muted">Search civil engineering research, from structural design to water resources.</p>
        <div className="mt-8 w-full max-w-2xl">
          <SearchBar size="large" />
        </div>
        <p className="mt-4 text-sm text-muted">
          Try{' '}
          {EXAMPLES.map((q, i) => (
            <span key={q}>
              {i > 0 && ' · '}
              <Link to={`/explore?${toQueryString({ q })}`} className="link">{q}</Link>
            </span>
          ))}
        </p>
        <nav aria-label="Disciplines" className="mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {DISCIPLINES.map((d) => (
            <Link
              key={d.slug}
              to={`/explore?${toQueryString({ discipline: d.slug })}`}
              title={d.description}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink/80 transition-colors hover:border-accent hover:text-accent"
            >
              {d.name}
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="featured" className="container-page">
        <div className="panel px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="featured" className="display text-3xl sm:text-4xl">
                Highly cited. <em className="text-brand-italic">Recently published.</em>
              </h2>
              <p className="mt-1 text-sm text-muted">Most cited journal articles since {SINCE}</p>
            </div>
            <div>
              <label htmlFor="featured-discipline" className="sr-only">Discipline</label>
              <select
                id="featured-discipline"
                className="field sm:w-56"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2">
            <ResultList query={featured} limit={6} />
          </div>
          {featured.data && featured.data.results.length > 0 && (
            <Link
              to={`/explore?${toQueryString({ discipline, from: SINCE, type: 'article', sort: 'citations' })}`}
              className="link mt-2 inline-block text-sm font-semibold"
            >
              See more in {DISCIPLINES.find((d) => d.slug === discipline)?.name} →
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
