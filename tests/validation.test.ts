import { describe, expect, it } from 'vitest'
import { passwordProblem, safeNext } from '../src/features/auth/validation'

describe('safeNext', () => {
  it('keeps same-site paths', () => expect(safeNext('/explore?q=soil')).toBe('/explore?q=soil'))
  it('blocks other sites and falls back to the library', () => {
    expect(safeNext('https://evil.example')).toBe('/library')
    expect(safeNext('//evil.example')).toBe('/library')
    expect(safeNext(null)).toBe('/library')
  })
})

describe('passwordProblem', () => {
  it('requires 8+ characters with letters and digits', () => {
    expect(passwordProblem('short1')).toMatch(/8 characters/)
    expect(passwordProblem('onlyletters')).toMatch(/letters and numbers/)
    expect(passwordProblem('12345678')).toMatch(/letters and numbers/)
    expect(passwordProblem('bridge2026')).toBeNull()
  })
})
