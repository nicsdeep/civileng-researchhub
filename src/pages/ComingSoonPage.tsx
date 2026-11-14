import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { usePageTitle } from '../lib/usePageTitle'

export function ComingSoonPage({ title, children }: { title: string; children: ReactNode }) {
  usePageTitle(title)
  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-3xl">{title}</h1>
      <p className="mt-3 max-w-prose text-muted">{children}</p>
      <Link to="/explore" className="btn-primary mt-6">
        Explore research
      </Link>
    </div>
  )
}
