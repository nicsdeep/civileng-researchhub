import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { WorkSearchResult } from '../../types/research'
import { ResultItem } from './ResultItem'
import { ResultSkeleton, StatusMessage } from '../ui/StatusMessage'

interface Props {
  query: UseQueryResult<WorkSearchResult>
  emptyMessage?: ReactNode
  /** Show only the first N results. */
  limit?: number
}

/** Renders loading, error, empty and result states for a search. */
export function ResultList({ query, emptyMessage, limit }: Props) {
  if (query.isPending) return <ResultSkeleton />

  if (query.isError) {
    return (
      <StatusMessage
        tone="error"
        title="Publications could not be loaded"
        action={
          <button type="button" className="btn-secondary" onClick={() => query.refetch()}>
            Try again
          </button>
        }
      >
        {query.error.message}
      </StatusMessage>
    )
  }

  if (query.data.results.length === 0) {
    return (
      <StatusMessage title="No publications found">
        {emptyMessage ?? 'Try different keywords or remove some filters.'}
      </StatusMessage>
    )
  }

  return (
    <div className={`divide-y divide-line transition-opacity ${query.isFetching ? 'opacity-60' : ''}`} aria-busy={query.isFetching}>
      {query.data.results.slice(0, limit).map((work) => (
        <ResultItem key={work.id} work={work} />
      ))}
    </div>
  )
}
