import { Link } from 'react-router'
import type { AuthorSummary } from '../../types/research'
import { formatCount, initials } from '../../lib/format'

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent ${size === 'lg' ? 'size-20 text-2xl' : 'size-12 text-base'}`}
    >
      {initials(name)}
    </span>
  )
}

/** One researcher in a list: name, affiliation, metrics and research topics. */
export function AuthorCard({ author, sinceLabel }: { author: AuthorSummary; sinceLabel?: string }) {
  return (
    <article className="flex gap-4 py-5">
      <Avatar name={author.name} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[1.075rem] leading-snug font-medium">
          <Link to={`/researchers/${author.id}`} className="link">{author.name}</Link>
        </h3>
        {author.institutions.length > 0 && <p className="text-sm text-byline">{author.institutions.join(' · ')}</p>}
        <p className="mt-1 text-sm text-muted tabular-nums">
          Cited by {formatCount(author.citedBy)}
          {author.hIndex !== null && <> · h-index {author.hIndex}</>}
          {' '}· {formatCount(author.worksCount)} works
          {author.disciplineWorks !== undefined && sinceLabel && (
            <> · <strong className="font-semibold text-ink">{formatCount(author.disciplineWorks)}</strong> papers in this field {sinceLabel}</>
          )}
        </p>
        {author.topics.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-1.5">
            {author.topics.map((t) => (
              <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink/75">{t}</span>
            ))}
          </p>
        )}
      </div>
    </article>
  )
}
