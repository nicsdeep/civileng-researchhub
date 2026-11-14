import { Link } from 'react-router'
import type { Work } from '../../types/research'
import { authorLine, formatCount, hostname, truncate } from '../../lib/format'
import { toQueryString } from '../../lib/searchParams'
import { SaveButton } from './SaveButton'
import { CiteButton } from './CiteButton'

/** One publication, laid out like a scholarly search result. */
export function ResultItem({ work }: { work: Work }) {
  const source = [work.venue, work.year].filter(Boolean).join(', ')
  const site = hostname(work.landingUrl)
  const byline = [authorLine(work), source, site].filter(Boolean).join(' - ')
  const fullText = work.isOpenAccess && work.openAccessUrl ? work.openAccessUrl : null
  const fullTextKind = fullText && /\.pdf($|\?)/i.test(fullText) ? 'PDF' : 'HTML'

  return (
    <article className="flex flex-col gap-3 py-5 sm:flex-row sm:gap-6">
      <div className="min-w-0 flex-1">
        <h3 className="text-[1.075rem] leading-snug font-medium">
          <Link to={`/publication/${work.id}`} className="link">
            {work.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-byline">{byline}</p>
        {work.abstract && <p className="mt-1.5 text-sm text-ink/85">{truncate(work.abstract, 280)}</p>}
        <div className="-ml-2 mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
          <SaveButton work={work} />
          <CiteButton doi={work.doi} title={work.title} />
          {work.citedBy > 0 ? (
            <Link to={`/explore?${toQueryString({ cites: work.id })}`} className="btn-quiet">
              Cited by {formatCount(work.citedBy)}
            </Link>
          ) : (
            <span className="px-2 text-sm text-muted">Not yet cited</span>
          )}
        </div>
      </div>
      {fullText && (
        <a
          href={fullText}
          target="_blank"
          rel="noopener noreferrer"
          title={fullText}
          className="max-w-full shrink-0 self-start truncate text-sm text-oa hover:underline sm:w-44 sm:text-right"
        >
          <span className="font-semibold">[{fullTextKind}]</span> {hostname(fullText) ?? 'Publisher'}
        </a>
      )}
    </article>
  )
}
