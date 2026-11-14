import { describe, expect, it } from 'vitest'
import { MAX_PAGE, parseSearchParams, toQueryString } from '../src/lib/searchParams'

describe('parseSearchParams', () => {
  it('applies defaults', () => {
    expect(parseSearchParams(new URLSearchParams())).toEqual({
      q: '', discipline: '', from: '', to: '', type: '', oa: false, cites: '', author: '', sort: 'relevance', page: 1,
    })
  })

  it('rejects invalid values', () => {
    const p = parseSearchParams(new URLSearchParams('from=19x&type=poem&sort=random&page=-4&cites=X1'))
    expect(p).toMatchObject({ from: '', type: '', sort: 'relevance', page: 1, cites: '' })
  })

  it('caps the page at the OpenAlex paging limit', () => {
    expect(parseSearchParams(new URLSearchParams('page=99999')).page).toBe(MAX_PAGE)
  })

  it('round-trips through toQueryString', () => {
    const qs = 'q=bridge+fatigue&discipline=structural&from=2015&to=2024&type=article&oa=1&cites=W123&author=A99&sort=newest&page=3'
    const parsed = parseSearchParams(new URLSearchParams(qs))
    expect(parseSearchParams(new URLSearchParams(toQueryString(parsed)))).toEqual(parsed)
  })

  it('leaves defaults out of the URL', () => {
    expect(toQueryString({ q: 'soil', sort: 'relevance', page: 1, oa: false })).toBe('q=soil')
  })
})
