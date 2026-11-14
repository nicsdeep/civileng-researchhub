/** Shapes returned by our own /api endpoints (a compact view of OpenAlex data). */

export interface AuthorRef {
  id: string | null
  name: string
}

export interface Work {
  /** OpenAlex short id, e.g. "W2741809807". */
  id: string
  title: string
  year: number | null
  date: string | null
  type: string | null
  citedBy: number
  /** Bare DOI, e.g. "10.1016/j.conbuildmat.2020.118000". */
  doi: string | null
  authors: AuthorRef[]
  authorCount: number
  venue: string | null
  /** Publisher or repository page for the work. */
  landingUrl: string | null
  isOpenAccess: boolean
  /** Best legal open-access copy reported by OpenAlex. */
  openAccessUrl: string | null
  abstract: string | null
  topic: string | null
}

export interface WorkSearchResult {
  total: number
  page: number
  perPage: number
  results: Work[]
}

export type SortOption = 'relevance' | 'newest' | 'citations'

export interface WorkSearchParams {
  q: string
  discipline: string
  from: string
  to: string
  type: string
  oa: boolean
  sort: SortOption
  page: number
}
