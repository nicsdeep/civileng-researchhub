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
    expect(q.get('filter')).toBe('from_publication_date:2010-01-01,to_publication_date:2020-12-31,type:article,is_oa:true')
    expect(q.get('sort')).toBe('relevance_score:desc')
    expect(q.get('per-page')).toBe('20')
  })

  it('uses discipline terms as the search when there is no query', () => {
    const q = buildWorksQuery(params('discipline=geotechnical'))
    expect(q.get('search')).toBe('geotechnical')
    expect(q.get('sort')).toBe('cited_by_count:desc')
  })

  it('narrows a query by discipline through a title/abstract filter', () => {
    const q = buildWorksQuery(params('q=fatigue&discipline=structural'))
    expect(q.get('search')).toBe('fatigue')
    expect(q.get('filter')).toBe('title_and_abstract.search:structural engineering')
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
