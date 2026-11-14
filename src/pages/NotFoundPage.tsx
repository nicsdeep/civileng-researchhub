import { Link } from 'react-router'
import { usePageTitle } from '../lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <div className="container-page py-12">
      <h1 className="display text-5xl">Page <em className="text-brand-italic">not found.</em></h1>
      <p className="mt-3 text-muted">The page you were looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  )
}
