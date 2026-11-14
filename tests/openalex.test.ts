import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildWorksQuery, rebuildAbstract, toWork } from '../api/_lib/openalex'
import { GET } from '../api/works'
import { parseSearchParams } from '../src/lib/searchParams'

const params = (qs: string) => parseSearchParams(new URLSearchParams(qs))

describe('rebuildAbstract', () => {
  it('restores word order from the inverted index', () => {
    expect(rebuildAbstract({ concrete: [1], Reinforced: [0], beams: [2] })).toBe('Reinforced concrete beams')
  })
  it('returns null when there is no abstract', () => {
    expect(rebuildAbstract(null)).toBeNull()
    expect(rebuildAbstract({})).toBeNull()
  })
})

describe('buildWorksQuery', () => {
  it('builds search, filters and relevance sort', () => {
    const q = buildWorksQuery(params('q=slope stability&from=2010&to=2020&type=article&oa=1'))
    expect(q.get('search')).toBe('slope stability')
    expect(q.get('filter')).toBe('is_retracted:false,from_publication_date:2010-01-01,to_publication_date:2020-12-31,type:article,is_oa:true')
    expect(q.get('sort')).toBe('relevance_score:desc')
    expect(q.get('per-page')).toBe('20')
  })

  it('browses a discipline by its filter, most cited first', () => {
    const q = buildWorksQuery(params('discipline=geotechnical'))
    expect(q.has('search')).toBe(false)
    expect(q.get('filter')).toBe('is_retracted:false,primary_topic.id:T10233|T11375|T11046|T13941')
    expect(q.get('sort')).toBe('cited_by_count:desc')
  })

  it('combines a query with a discipline filter', () => {
    const q = buildWorksQuery(params('q=fatigue&discipline=structural'))
    expect(q.get('search')).toBe('fatigue')
    expect(q.get('filter')).toContain('primary_topic.subfield.id:2205')
    expect(q.get('sort')).toBe('relevance_score:desc')
  })

  it('finds works that cite a given work', () => {
    const q = buildWorksQuery(params('cites=W2061655501'))
    expect(q.get('filter')).toBe('is_retracted:false,cites:W2061655501')
    expect(q.get('sort')).toBe('cited_by_count:desc')
  })

  it('ignores unknown disciplines', () => {
    expect(buildWorksQuery(params('discipline=astrology')).get('filter')).toBe('is_retracted:false')
  })

  it('strips characters that would break the filter syntax', () => {
    expect(buildWorksQuery(params('q=steel,concrete|timber')).get('search')).toBe('steel concrete timber')
  })
})

describe('toWork', () => {
  it('maps OpenAlex fields to the compact shape', () => {
    const work = toWork({
      id: 'https://openalex.org/W1',
      doi: 'https://doi.org/10.1000/xyz',
      display_name: 'A study',
      publication_year: 2021,
      publication_date: '2021-05-01',
      type: 'article',
      cited_by_count: 7,
      authorships: [{ author: { id: 'https://openalex.org/A9', display_name: 'Jane Doe' } }],
      primary_location: { landing_page_url: 'https://example.org/a', source: { display_name: 'Journal X' } },
      open_access: { is_oa: true, oa_url: 'https://example.org/a.pdf' },
      abstract_inverted_index: null,
      primary_topic: null,
    })
    expect(work).toMatchObject({
      id: 'W1', doi: '10.1000/xyz', venue: 'Journal X', citedBy: 7, isOpenAccess: true,
      authors: [{ id: 'A9', name: 'Jane Doe' }], authorCount: 1,
    })
  })
})

describe('GET /api/works', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('reports a clear error when the API key is missing', async () => {
    vi.stubEnv('OPENALEX_API_KEY', '')
    const response = await GET(new Request('http://x/api/works?q=bridge'))
    expect(response.status).toBe(503)
    expect(((await response.json()) as { error: string }).error).toMatch(/not configured/)
  })

  it('turns an OpenAlex rate limit into a friendly 503', async () => {
    vi.stubEnv('OPENALEX_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 429 })))
    const response = await GET(new Request('http://x/api/works?q=bridge'))
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('returns mapped results and sends the key only in the header', async () => {
    vi.stubEnv('OPENALEX_API_KEY', 'test-key')
    const fetchMock = vi.fn(async () =>
      Response.json({ meta: { count: 1 }, results: [{ id: 'https://openalex.org/W5', display_name: 'Bridge decks' }] }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const response = await GET(new Request('http://x/api/works?q=bridge'))
    const body: unknown = await response.json()
    expect(body).toMatchObject({ total: 1, page: 1, results: [{ id: 'W5', title: 'Bridge decks' }] })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).not.toContain('test-key')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key')
  })
})

describe('researchers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('filters works by researcher', () => {
    expect(buildWorksQuery(params('author=A5071268993')).get('filter')).toBe('is_retracted:false,authorships.author.id:A5071268993')
  })

  it('ranks researchers by discipline output, keeping the ranking order', async () => {
    vi.stubEnv('OPENALEX_API_KEY', 'k')
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('group_by')) {
        return Response.json({ group_by: [{ key: 'https://openalex.org/A2', count: 40 }, { key: 'https://openalex.org/A1', count: 12 }, { key: 'unknown', count: 3 }] })
      }
      // Details come back in a different order than the ranking.
      return Response.json({ results: [
        { id: 'https://openalex.org/A1', display_name: 'Second', orcid: null, works_count: 5, cited_by_count: 9, last_known_institutions: [{ display_name: 'Queen’s University', country_code: 'CA' }] },
        { id: 'https://openalex.org/A2', display_name: 'First', orcid: null, works_count: 50, cited_by_count: 900 },
      ] })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { searchAuthors } = await import('../api/_lib/openalex')
    const result = await searchAuthors({ q: '', discipline: 'geotechnical', canada: true, page: 1 })
    expect(result.mode).toBe('ranking')
    expect(result.results.map((a) => [a.name, a.disciplineWorks])).toEqual([['First', 40], ['Second', 12]])
    expect(result.results[1].institutions).toEqual(['Queen’s University'])
    const groupUrl = decodeURIComponent((fetchMock.mock.calls[0] as unknown as [string])[0])
    expect(groupUrl).toContain('authorships.institutions.country_code:ca')
    expect(groupUrl).toContain('primary_topic.id:T10233')
  })

  it('rejects malformed researcher ids', async () => {
    const { GET } = await import('../api/author')
    expect((await GET(new Request('http://x/api/author?id=../../etc'))).status).toBe(400)
  })
})
