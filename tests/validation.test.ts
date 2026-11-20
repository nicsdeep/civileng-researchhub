import { describe, expect, it } from 'vitest'
import { safeNext } from '../src/features/auth/validation'

describe('safeNext', () => {
  it('keeps same-site paths', () => expect(safeNext('/explore?q=soil')).toBe('/explore?q=soil'))
  it('blocks other sites and falls back to the library', () => {
    expect(safeNext('https://evil.example')).toBe('/library')
    expect(safeNext('//evil.example')).toBe('/library')
    expect(safeNext(null)).toBe('/library')
  })
})


import { initials, niceMax } from '../src/lib/format'

describe('display helpers', () => {
  it('makes initials from names with hyphens and accents', () => {
    expect(initials('Kok‐Kwang Phoon')).toBe('KP')
    expect(initials('M. Hesham El Naggar')).toBe('MN')
    expect(initials('Zhen-Yu Yin')).toBe('ZY')
  })
  it('rounds chart axes up to 1, 2 or 5 × 10ⁿ', () => {
    expect(niceMax(2761)).toBe(5000)
    expect(niceMax(180)).toBe(200)
    expect(niceMax(0)).toBe(1)
  })
})
