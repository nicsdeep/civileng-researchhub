import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'

const NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/researchers', label: 'Researchers' },
  { to: '/library', label: 'My Library' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-bg focus:px-3 focus:py-2">
        Skip to content
      </a>

      <header className="border-b border-line">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
            <img src="/favicon.svg" alt="" className="size-6" />
            CivilEng <span className="font-normal text-muted">ResearchHub</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/sign-in" className="btn-secondary h-9 py-0">
              Sign in
            </NavLink>
          </nav>

          <button
            type="button"
            className="btn-secondary h-9 px-3 py-0 sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="container-page flex flex-col gap-1 border-t border-line pb-3 sm:hidden">
            {[...NAV, { to: '/sign-in', label: 'Sign in' }].map((item) => (
              <NavLink key={item.to} to={item.to} className={(s) => `${navClass(s)} py-2 text-base`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            Publication data from{' '}
            <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="link">
              OpenAlex
            </a>{' '}
            (CC0). Full texts link to their original publishers and repositories.
          </p>
          <p>CivilEng ResearchHub · Civil Engineering coursework project, Ontario</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
