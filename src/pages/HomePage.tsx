import { useState } from 'react'
import { Link } from 'react-router'
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
    q: '', discipline, from: SINCE, to: '', type: 'article', oa: false, sort: 'citations', page: 1,
  })

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="container-page py-14 sm:py-20">
          <h1 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Discover civil engineering research
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Search millions of scholarly publications, from structural design to water resources, with
            abstracts, citations and links to legitimate full texts.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar size="large" />
          </div>
          <p className="mt-3 text-sm text-muted">
            Try:{' '}
            {EXAMPLES.map((q, i) => (
              <span key={q}>
                {i > 0 && ' · '}
                <Link to={`/explore?${toQueryString({ q })}`} className="link">{q}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <section aria-labelledby="disciplines" className="container-page py-12">
        <h2 id="disciplines" className="font-serif text-2xl">Browse by discipline</h2>
        <ul className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {DISCIPLINES.map((d) => (
            <li key={d.slug}>
              <Link to={`/explore?${toQueryString({ discipline: d.slug })}`} className="link font-medium">
                {d.name} engineering
              </Link>
              <p className="text-sm text-muted">{d.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="featured" className="container-page">
        <div className="flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="featured" className="font-serif text-2xl">Highly cited recent articles</h2>
            <p className="text-sm text-muted">Most cited journal articles published since {SINCE}</p>
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
        <ResultList query={featured} limit={6} />
        {featured.data && featured.data.results.length > 0 && (
          <Link
            to={`/explore?${toQueryString({ discipline, from: SINCE, type: 'article', sort: 'citations' })}`}
            className="link mt-2 inline-block text-sm font-medium"
          >
            See more in {DISCIPLINES.find((d) => d.slug === discipline)?.name} →
          </Link>
        )}
      </section>
    </>
  )
}
