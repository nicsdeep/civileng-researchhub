import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useSearchParams } from 'react-router'
import { Logo } from '../components/ui/Logo'
import { SearchBar } from '../components/research/SearchBar'
import { useAuth } from '../features/auth/AuthProvider'

const NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/researchers', label: 'Researchers' },
  { to: '/library', label: 'My Library' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm transition-colors ${isActive ? 'bg-accent-soft font-semibold text-accent' : 'text-muted hover:text-ink'}`

function AccountLink() {
  const { user, loading } = useAuth()
  if (loading) return <span className="size-9" aria-hidden="true" />
  if (!user) return <NavLink to="/sign-in" className="btn-secondary h-9 py-0">Sign in</NavLink>
  const initial = (user.email ?? '?').charAt(0).toUpperCase()
  return (
    <Link
      to="/account"
      title={`Account: ${user.email}`}
      aria-label="Your account"
      className="grid size-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent hover:ring-2 hover:ring-accent/30"
    >
      {initial}
    </Link>
  )
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [params] = useSearchParams()
  const isHome = location.pathname === '/'
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      <header className={isHome ? '' : 'border-b border-line bg-surface/80 backdrop-blur'}>
        <div className="container-page flex h-16 items-center gap-4">
          {!isHome && <div className="shrink-0"><Logo /></div>}
          {!isHome && location.pathname.startsWith('/explore') && (
            <div className="hidden max-w-xl flex-1 md:block">
              <SearchBar key={params.get('q') ?? ''} initialQuery={params.get('q') ?? ''} />
            </div>
          )}
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
            ))}
            <span className="ml-2"><AccountLink /></span>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:hidden">
            <AccountLink />
            <button
              type="button"
              className="btn-secondary h-9 px-3 py-0"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="container-page flex flex-col gap-1 border-t border-line bg-surface pb-3 sm:hidden">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={(s) => `${navClass(s)} py-2 text-base`}>{item.label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line bg-surface/60">
        <div className="container-page flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <img src="/favicon.svg" alt="" className="size-9" />
            <div>
              <p className="display text-lg leading-tight">CivilEng <em className="text-brand-italic">ResearchHub</em></p>
              <p className="text-muted">Edmund, Ontario</p>
            </div>
          </div>
          <div className="max-w-md text-xs text-muted sm:text-right">
            <p>Civil engineering research discovery for students, lecturers and engineers.</p>
            <p className="mt-1">Publication metadata is openly licensed. Full texts link to their publishers and repositories.</p>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
