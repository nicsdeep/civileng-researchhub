import type { ReactNode } from 'react'

interface Props {
  title: string
  children?: ReactNode
  tone?: 'neutral' | 'error'
  action?: ReactNode
}

/** Consistent empty and error states. */
export function StatusMessage({ title, children, tone = 'neutral', action }: Props) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className="border-y border-line py-10 text-center">
      <p className={`font-serif text-lg ${tone === 'error' ? 'text-danger' : 'text-ink'}`}>{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Placeholder lines shown while results load. */
export function ResultSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-pulse space-y-2 py-5">
          <div className="h-5 w-4/5 rounded bg-surface" />
          <div className="h-3.5 w-1/2 rounded bg-surface" />
          <div className="h-3.5 w-full rounded bg-surface" />
        </div>
      ))}
    </div>
  )
}
