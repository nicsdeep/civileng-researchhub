import { Link } from 'react-router'

/** Official mark (arch bridge over an open book) with the CivilEng ResearchHub wordmark. */
export function BrandMark({ className = '' }: { className?: string }) {
  return <img src="/logo-mark.svg" alt="" width={1116} height={707} className={`brand-mark h-auto ${className}`} />
}

export function Logo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const large = size === 'large'
  return (
    <Link
      to="/"
      aria-label="CivilEng ResearchHub, home"
      className={`inline-flex items-center text-ink ${large ? 'flex-col gap-3 sm:flex-row sm:gap-4' : 'gap-2'}`}
    >
      <BrandMark className={large ? 'w-28 sm:w-32' : 'w-11 sm:w-12'} />
      <span className={`display leading-none whitespace-nowrap ${large ? 'text-[2.6rem] sm:text-6xl' : 'text-[1.4rem] sm:text-2xl'}`}>
        <span className="text-brand-navy">CivilEng</span> <em className="text-brand-italic">ResearchHub</em>
      </span>
    </Link>
  )
}
