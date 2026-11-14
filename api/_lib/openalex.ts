/**
 * Server-only client for the publication metadata source (OpenAlex). Runs inside Vercel functions (and the local
 * dev middleware); the API key never reaches the browser.
 * Docs: https://docs.openalex.org
 */
import type { AuthorProfile, AuthorSearchParams, AuthorSearchResult, AuthorSummary, Work, WorkSearchParams, WorkSearchResult } from '../../src/types/research.js'
import { findDiscipline } from '../../src/lib/disciplines.js'
import { AUTHOR_PER_PAGE, AUTHOR_RANKING_PAGES, PER_PAGE } from '../../src/lib/searchParams.js'

const BASE_URL = 'https://api.openalex.org'
const TIMEOUT_MS = 10_000
const MAX_AUTHORS = 12
const FIELDS = [
  'id', 'doi', 'display_name', 'publication_year', 'publication_date', 'type',
  'cited_by_count', 'authorships', 'primary_location', 'open_access',
  'abstract_inverted_index', 'primary_topic',
].join(',')

/** An error with an HTTP status and a message that is safe to show users. */
export class UpstreamError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Minimal view of the OpenAlex fields we read.
interface RawWork {
  id: string
  doi: string | null
  display_name: string | null
  publication_year: number | null
  publication_date: string | null
  type: string | null
  cited_by_count: number | null
  authorships?: { author: { id: string | null; display_name: string | null } }[]
  primary_location?: { landing_page_url: string | null; source: { display_name: string | null } | null } | null
  open_access?: { is_oa: boolean; oa_url: string | null } | null
  abstract_inverted_index?: Record<string, number[]> | null
  primary_topic?: { display_name: string | null } | null
}

const shortId = (url: string | null) => (url ? url.replace('https://openalex.org/', '') : null)

/** OpenAlex stores abstracts as word → positions; rebuild the plain text. */
export function rebuildAbstract(index: Record<string, number[]> | null | undefined): string | null {
  if (!index) return null
  const words: string[] = []
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word
  }
  const text = words.filter(Boolean).join(' ').trim()
  return text || null
}

export function toWork(raw: RawWork): Work {
  const authorships = raw.authorships ?? []
  return {
    id: shortId(raw.id) ?? raw.id,
    title: raw.display_name?.trim() || 'Untitled',
    year: raw.publication_year,
    date: raw.publication_date,
    type: raw.type,
    citedBy: raw.cited_by_count ?? 0,
    doi: raw.doi ? raw.doi.replace(/^https?:\/\/doi\.org\//i, '') : null,
    authors: authorships.slice(0, MAX_AUTHORS).map((a) => ({
      id: shortId(a.author.id),
      name: a.author.display_name ?? 'Unknown author',
    })),
    authorCount: authorships.length,
    venue: raw.primary_location?.source?.display_name ?? null,
    landingUrl: raw.primary_location?.landing_page_url ?? null,
    isOpenAccess: raw.open_access?.is_oa ?? false,
    openAccessUrl: raw.open_access?.oa_url ?? null,
    abstract: rebuildAbstract(raw.abstract_inverted_index),
    topic: raw.primary_topic?.display_name ?? null,
  }
}

/** Commas separate OpenAlex filters, so strip them from free text. */
const clean = (text: string) => text.replace(/[,|]/g, ' ').trim()

/** Translates our search parameters into an OpenAlex /works query string. */
export function buildWorksQuery(p: WorkSearchParams): URLSearchParams {
  const query = new URLSearchParams()
  // Retracted papers are never shown.
  const filters: string[] = ['is_retracted:false']
  const discipline = findDiscipline(p.discipline)

  if (p.q) query.set('search', clean(p.q))
  if (discipline) filters.push(discipline.filter)
  if (p.cites) filters.push(`cites:${p.cites}`)
  if (p.author) filters.push(`authorships.author.id:${p.author}`)
  if (p.from) filters.push(`from_publication_date:${p.from}-01-01`)
  if (p.to) filters.push(`to_publication_date:${p.to}-12-31`)
  if (p.type) filters.push(`type:${p.type}`)
  if (p.oa) filters.push('is_oa:true')
  query.set('filter', filters.join(','))

  // Relevance only means something for a typed query; browsing defaults to most cited.
  const sort =
    p.sort === 'newest' ? 'publication_date:desc'
    : p.sort === 'citations' || !p.q ? 'cited_by_count:desc'
    : 'relevance_score:desc'
  query.set('sort', sort)
  query.set('page', String(p.page))
  query.set('per-page', String(PER_PAGE))
  query.set('select', FIELDS)
  return query
}

async function request(path: string, query: URLSearchParams): Promise<unknown> {
  const key = process.env.OPENALEX_API_KEY
  if (!key) throw new UpstreamError(503, 'The publication service is not configured yet.')

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}?${query}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new UpstreamError(504, 'The publication database did not respond in time. Please try again.')
  }

  if (response.ok) return response.json()
  if (response.status === 404) throw new UpstreamError(404, 'Publication not found.')
  if (response.status === 429) throw new UpstreamError(503, 'Too many requests to the publication database. Please try again shortly.')
  if (response.status === 401 || response.status === 403) {
    console.error(`OpenAlex rejected the API key (${response.status})`)
    throw new UpstreamError(503, 'The publication service is temporarily unavailable.')
  }
  console.error(`OpenAlex error ${response.status}: ${await response.text().catch(() => '')}`)
  throw new UpstreamError(502, 'The publication database returned an error. Please try again.')
}

export async function searchWorks(p: WorkSearchParams): Promise<WorkSearchResult> {
  const data = (await request('/works', buildWorksQuery(p))) as { meta: { count: number }; results: RawWork[] }
  return { total: data.meta.count, page: p.page, perPage: PER_PAGE, results: data.results.map(toWork) }
}

export async function getWork(id: string): Promise<Work> {
  if (!/^W\d+$/.test(id)) throw new UpstreamError(400, 'Invalid publication id.')
  const raw = (await request(`/works/${id}`, new URLSearchParams({ select: FIELDS }))) as RawWork
  return toWork(raw)
}

/** JSON response helper with CDN caching for successful results. */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
    },
  })
}

export function errorResponse(error: unknown): Response {
  if (error instanceof UpstreamError) return json({ error: error.message }, error.status)
  console.error(error)
  return json({ error: 'Something went wrong. Please try again.' }, 500)
}

// ---------------------------------------------------------------------------
// Researchers
// ---------------------------------------------------------------------------

const AUTHOR_FIELDS = 'id,display_name,orcid,works_count,cited_by_count,summary_stats,last_known_institutions,topics'
/** Broad civil engineering scope for rankings without a chosen discipline. */
const CIVIL_SCOPE = 'primary_topic.subfield.id:2205|2215'
const RANKING_YEARS = 5

interface RawAuthor {
  id: string
  display_name: string | null
  orcid: string | null
  works_count: number | null
  cited_by_count: number | null
  summary_stats?: { h_index?: number; i10_index?: number } | null
  last_known_institutions?: { display_name: string | null; country_code: string | null }[] | null
  topics?: { display_name: string }[] | null
  counts_by_year?: { year: number; works_count: number; cited_by_count: number }[] | null
}

export function toAuthor(raw: RawAuthor): AuthorSummary {
  const institutions = (raw.last_known_institutions ?? []).filter((i) => i.display_name)
  return {
    id: shortId(raw.id) ?? raw.id,
    name: raw.display_name?.trim() || 'Unknown researcher',
    orcid: raw.orcid,
    institutions: institutions.map((i) => i.display_name as string).slice(0, 3),
    countryCode: institutions[0]?.country_code ?? null,
    worksCount: raw.works_count ?? 0,
    citedBy: raw.cited_by_count ?? 0,
    hIndex: raw.summary_stats?.h_index ?? null,
    i10Index: raw.summary_stats?.i10_index ?? null,
    topics: (raw.topics ?? []).slice(0, 4).map((t) => t.display_name),
  }
}

export async function searchAuthors(p: AuthorSearchParams): Promise<AuthorSearchResult> {
  if (p.q) {
    const query = new URLSearchParams({
      search: clean(p.q),
      page: String(p.page),
      'per-page': String(AUTHOR_PER_PAGE),
      select: AUTHOR_FIELDS,
    })
    if (p.canada) query.set('filter', 'last_known_institutions.country_code:CA')
    const data = (await request('/authors', query)) as { meta: { count: number }; results: RawAuthor[] }
    return { total: data.meta.count, page: p.page, perPage: AUTHOR_PER_PAGE, mode: 'search', results: data.results.map(toAuthor) }
  }

  // Rank researchers by how many papers they published in the discipline recently.
  const page = Math.min(p.page, AUTHOR_RANKING_PAGES)
  const since = new Date().getFullYear() - RANKING_YEARS
  const discipline = findDiscipline(p.discipline)
  const filters = ['is_retracted:false', `from_publication_date:${since}-01-01`, discipline?.filter ?? CIVIL_SCOPE]
  if (p.canada) filters.push('authorships.institutions.country_code:ca')
  const groups = (await request('/works', new URLSearchParams({
    filter: filters.join(','),
    group_by: 'authorships.author.id',
    'per-page': String(AUTHOR_PER_PAGE * AUTHOR_RANKING_PAGES),
  }))) as { group_by: { key: string; count: number }[] }

  const ranked = groups.group_by.filter((g) => /A\d+$/.test(g.key))
  const slice = ranked.slice((page - 1) * AUTHOR_PER_PAGE, page * AUTHOR_PER_PAGE)
  if (slice.length === 0) return { total: ranked.length, page, perPage: AUTHOR_PER_PAGE, mode: 'ranking', since, results: [] }

  const ids = slice.map((g) => shortId(g.key) as string)
  const details = (await request('/authors', new URLSearchParams({
    filter: `ids.openalex:${ids.join('|')}`,
    'per-page': String(ids.length),
    select: AUTHOR_FIELDS,
  }))) as { results: RawAuthor[] }
  const byId = new Map(details.results.map((a) => [shortId(a.id), toAuthor(a)]))
  const results: AuthorSummary[] = []
  for (const g of slice) {
    const author = byId.get(shortId(g.key))
    if (author) results.push({ ...author, disciplineWorks: g.count })
  }
  return { total: ranked.length, page, perPage: AUTHOR_PER_PAGE, mode: 'ranking', since, results }
}

export async function getAuthor(id: string): Promise<AuthorProfile> {
  if (!/^A\d+$/.test(id)) throw new UpstreamError(400, 'Invalid researcher id.')
  const raw = (await request(`/authors/${id}`, new URLSearchParams({ select: `${AUTHOR_FIELDS},counts_by_year` }))) as RawAuthor
  const thisYear = new Date().getFullYear()
  const counts = new Map((raw.counts_by_year ?? []).map((c) => [c.year, c]))
  // Last 10 years, oldest first, with empty years filled in.
  const byYear = Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map((year) => ({
    year,
    works: counts.get(year)?.works_count ?? 0,
    citations: counts.get(year)?.cited_by_count ?? 0,
  }))
  return { ...toAuthor(raw), byYear }
}
