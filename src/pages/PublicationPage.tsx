import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useWork } from '../features/search/hooks'
import { ApiError } from '../lib/api'
import { doiUrl, formatCount, typeLabel } from '../lib/format'
import { usePageTitle } from '../lib/usePageTitle'
import { StatusMessage } from '../components/ui/StatusMessage'
import { SaveButton } from '../components/research/SaveButton'
import { CiteButton } from '../components/research/CiteButton'
import { toQueryString } from '../lib/searchParams'

export function PublicationPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: work, isPending, isError, error, refetch } = useWork(id)
  usePageTitle(work?.title)

  const back = (
    <button type="button" onClick={() => navigate(-1)} className="link text-sm">
      ← Back to results
    </button>
  )

  if (isPending) {
    return (
      <div className="container-page py-8" aria-busy="true">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-3/4 rounded bg-surface" />
          <div className="h-4 w-1/2 rounded bg-surface" />
          <div className="h-32 w-full rounded bg-surface" />
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
    return (
      <div className="container-page py-8">
        {back}
        <div className="mt-6">
          <StatusMessage
            tone="error"
            title={notFound ? 'Publication not found' : 'This publication could not be loaded'}
            action={!notFound && <button type="button" className="btn-secondary" onClick={() => refetch()}>Try again</button>}
          >
            {error.message}
          </StatusMessage>
        </div>
      </div>
    )
  }

  const details: [string, ReactNode][] = [
    ['Published in', work.venue],
    ['Published', work.date ?? work.year],
    ['Type', typeLabel(work.type)],
    ['Cited by', formatCount(work.citedBy)],
    ['Topic', work.topic],
    ['DOI', work.doi && <a href={doiUrl(work.doi)} target="_blank" rel="noopener noreferrer" className="link break-all">{work.doi}</a>],
  ]

  return (
    <article className="container-page py-8">
      {back}

      <header className="mt-4 max-w-3xl">
        {work.isOpenAccess && <p className="text-xs font-semibold tracking-wide text-oa uppercase">Free full text available</p>}
        <h1 className="display mt-1 text-3xl leading-tight sm:text-4xl">{work.title}</h1>
        <p className="mt-3 text-byline">
          {work.authors.map((a) => a.name).join(', ')}
          {work.authorCount > work.authors.length && `, and ${work.authorCount - work.authors.length} more`}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {work.openAccessUrl && (
            <a href={work.openAccessUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Read full text ↗</a>
          )}
          <SaveButton work={work} variant="button" />
          <CiteButton doi={work.doi} title={work.title} variant="button" />
          {work.citedBy > 0 && (
            <Link to={`/explore?${toQueryString({ cites: work.id })}`} className="btn-secondary">
              Cited by {formatCount(work.citedBy)}
            </Link>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_16rem]">
        <section aria-labelledby="abstract" className="max-w-prose">
          <h2 id="abstract" className="display text-2xl">Abstract</h2>
          {work.abstract ? (
            <p className="mt-3 leading-7">{work.abstract}</p>
          ) : (
            <p className="mt-3 text-muted">No abstract is available for this publication. See the publisher page for details.</p>
          )}
        </section>

        <aside className="panel h-fit space-y-6 p-5">
          <section aria-labelledby="access">
            <h2 id="access" className="label">Access</h2>
            <ul className="space-y-2 text-sm">
              {work.openAccessUrl && (
                <li>
                  <a href={work.openAccessUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-oa hover:underline">
                    Free full text ↗
                  </a>
                </li>
              )}
              {work.landingUrl && (
                <li><a href={work.landingUrl} target="_blank" rel="noopener noreferrer" className="link">Publisher page ↗</a></li>
              )}
            </ul>
            {!work.openAccessUrl && (
              <p className="mt-2 text-xs text-muted">No free full text is known. Your university library may provide access.</p>
            )}
          </section>

          <section aria-labelledby="details">
            <h2 id="details" className="label">Details</h2>
            <dl className="space-y-2 text-sm">
              {details.filter(([, value]) => value).map(([term, value]) => (
                <div key={term}>
                  <dt className="text-muted">{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </article>
  )
}
