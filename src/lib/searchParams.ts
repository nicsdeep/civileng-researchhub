import type { SortOption, WorkSearchParams } from '../types/research'

export const PER_PAGE = 20
/** OpenAlex basic paging stops at 10,000 results. */
export const MAX_PAGE = Math.floor(10_000 / PER_PAGE)

export const PUBLICATION_TYPES: { value: string; label: string }[] = [
  { value: 'article', label: 'Journal article' },
  { value: 'review', label: 'Review' },
  { value: 'book-chapter', label: 'Book chapter' },
  { value: 'book', label: 'Book' },
  { value: 'report', label: 'Report' },
  { value: 'dissertation', label: 'Thesis / dissertation' },
  { value: 'preprint', label: 'Preprint' },
]

const SORTS: SortOption[] = ['relevance', 'newest', 'citations']
const YEAR = /^\d{4}$/

/** Reads and validates search parameters from a URL query string. */
export function parseSearchParams(params: URLSearchParams): WorkSearchParams {
  const sort = params.get('sort') as SortOption
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  const year = (key: string) => {
    const value = params.get(key) ?? ''
    return YEAR.test(value) ? value : ''
  }
  const type = params.get('type') ?? ''
  return {
    q: (params.get('q') ?? '').trim().slice(0, 300),
    discipline: params.get('discipline') ?? '',
    from: year('from'),
    to: year('to'),
    type: PUBLICATION_TYPES.some((t) => t.value === type) ? type : '',
    oa: params.get('oa') === '1',
    sort: SORTS.includes(sort) ? sort : 'relevance',
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), MAX_PAGE) : 1,
  }
}

/** Builds a compact query string, leaving out defaults. */
export function toQueryString(p: Partial<WorkSearchParams>): string {
  const out = new URLSearchParams()
  if (p.q) out.set('q', p.q)
  if (p.discipline) out.set('discipline', p.discipline)
  if (p.from) out.set('from', p.from)
  if (p.to) out.set('to', p.to)
  if (p.type) out.set('type', p.type)
  if (p.oa) out.set('oa', '1')
  if (p.sort && p.sort !== 'relevance') out.set('sort', p.sort)
  if (p.page && p.page > 1) out.set('page', String(p.page))
  return out.toString()
}
