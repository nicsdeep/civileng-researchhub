import { Link } from 'react-router'
import type { Work } from '../../types/research'
import { authorLine, doiUrl, formatCount, truncate } from '../../lib/format'

/** One publication in a list, laid out like a citation. */
export function ResultItem({ work }: { work: Work }) {
  const meta = [authorLine(work), work.venue, work.year].filter(Boolean).join(' · ')

  return (
    <article className="py-5">
      <h3 className="font-serif text-lg leading-snug">
        <Link to={`/publication/${work.id}`} className="link text-accent">
          {work.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{meta}</p>
      {work.abstract && <p className="mt-2 text-sm text-ink/90">{truncate(work.abstract, 260)}</p>}
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted">Cited by {formatCount(work.citedBy)}</span>
        {work.doi && (
          <a href={doiUrl(work.doi)} target="_blank" rel="noopener noreferrer" className="link">
            DOI
          </a>
        )}
        {work.isOpenAccess && work.openAccessUrl && (
          <a
            href={work.openAccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-oa hover:underline"
          >
            Open access ↗
          </a>
        )}
      </p>
    </article>
  )
}
