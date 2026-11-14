import { useEffect } from 'react'

/** Sets the browser tab title, e.g. "Explore · CivilEng ResearchHub". */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · CivilEng ResearchHub` : 'CivilEng ResearchHub'
  }, [title])
}
