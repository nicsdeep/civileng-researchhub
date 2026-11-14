import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET, doiUrl, tidyCitation } from '../api/cite'

const call = (qs: string) => GET(new Request(`http://x/api/cite?${qs}`))

describe('GET /api/cite', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('rejects invalid DOIs and formats without calling out', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await call('doi=not-a-doi')).status).toBe(400)
    expect((await call('doi=10.1000/x&format=poem')).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('asks doi.org for the requested style and returns the text', async () => {
    const fetchMock = vi.fn(async () => new Response('Doe, J. (2020). A study. Journal X.\n'))
    vi.stubGlobal('fetch', fetchMock)
    const response = await call('doi=10.1061/(asce)0733-9410(1990)116:11(1717)&format=ieee')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ format: 'ieee', text: 'Doe, J. (2020). A study. Journal X.' })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://doi.org/10.1061/(asce)0733-9410(1990)116:11(1717)')
    expect((init.headers as Record<string, string>).Accept).toContain('style=ieee')
  })

  it('reports DOIs without citation data as not found', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    expect((await call('doi=10.9999/missing')).status).toBe(404)
  })

  it('tidies empty editor lists and reference numbers', () => {
    expect(tidyCitation('Thomas, C. “Title.” Journal, edited by , vol. 40, 2013.')).toBe('Thomas, C. “Title.” Journal, vol. 40, 2013.')
    expect(tidyCitation('Thomas, C. (2013) ‘Title,’ Journal. Edited by , 40, pp. 1–2.')).toBe('Thomas, C. (2013) ‘Title,’ Journal, 40, pp. 1–2.')
    expect(tidyCitation('[1]C. Thomas, “Title,” Journal, 2013.')).toBe('C. Thomas, “Title,” Journal, 2013.')
  })

  it('escapes characters that would break the URL path', () => {
    expect(doiUrl('10.1000/a?b#c')).toBe('https://doi.org/10.1000/a%3Fb%23c')
  })
})
