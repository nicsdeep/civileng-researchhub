import { Link } from 'react-router'

/** Wordmark: "CivilEng" in serif with an italic teal "ResearchHub". */
export function Logo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const large = size === 'large'
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 text-ink ${large ? 'flex-col sm:flex-row' : ''}`} aria-label="CivilEng ResearchHub, home">
      <img src="/favicon.svg" alt="" className={large ? 'size-12 sm:size-14' : 'size-8'} />
      <span className={`display leading-none whitespace-nowrap ${large ? 'text-[2.6rem] sm:text-6xl' : 'text-2xl'}`}>
        CivilEng <em className="text-brand-italic">ResearchHub</em>
      </span>
    </Link>
  )
}
