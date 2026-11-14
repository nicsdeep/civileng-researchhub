import type { Work } from '../types/research'
import { PUBLICATION_TYPES } from './searchParams'

export const doiUrl = (doi: string) => `https://doi.org/${doi}`

/** "A. Author, B. Author, C. Author, et al." */
export function authorLine(work: Work, max = 3): string {
  const names = work.authors.slice(0, max).map((a) => a.name)
  if (names.length === 0) return 'Unknown authors'
  return work.authorCount > max ? `${names.join(', ')}, et al.` : names.join(', ')
}

export function typeLabel(type: string | null): string | null {
  if (!type) return null
  return PUBLICATION_TYPES.find((t) => t.value === type)?.label ?? type.replace(/-/g, ' ')
}

const number = new Intl.NumberFormat('en-CA')
export const formatCount = (n: number) => number.format(n)

/** Shortens text at a word boundary. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max)).replace(/[\s.,;:]+$/, '')}…`
}

/** "www.sciencedirect.com" → "sciencedirect.com"; null when not a URL or only a DOI resolver. */
export function hostname(url: string | null): string | null {
  if (!url) return null
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return /(^|\.)doi\.org$/.test(host) ? null : host
  } catch {
    return null
  }
}
