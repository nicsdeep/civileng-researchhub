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

/** "Kok-Kwang Phoon" → "KP". */
export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s-]/gu, '').split(/[\s-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

/** "Nice" axis maximum: 1, 2 or 5 × a power of ten, at or above the data maximum. */
export function niceMax(value: number): number {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  return ([1, 2, 5, 10].map((m) => m * power).find((v) => v >= value) ?? 10 * power)
}
