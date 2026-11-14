import type { AuthorProfile, AuthorSearchParams, AuthorSearchResult, Work, WorkSearchParams, WorkSearchResult } from '../types/research'
import { toAuthorQueryString, toQueryString } from './searchParams'

/** Error carrying a user-facing message from our /api endpoints. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, body?.error ?? 'Something went wrong. Please try again.')
  }
  return body as T
}

export function searchWorks(params: WorkSearchParams, signal?: AbortSignal) {
  return getJson<WorkSearchResult>(`/api/works?${toQueryString(params)}`, signal)
}

export function getWork(id: string, signal?: AbortSignal) {
  return getJson<Work>(`/api/work?id=${encodeURIComponent(id)}`, signal)
}

export function searchAuthors(params: AuthorSearchParams, signal?: AbortSignal) {
  return getJson<AuthorSearchResult>(`/api/authors?${toAuthorQueryString(params)}`, signal)
}

export function getAuthor(id: string, signal?: AbortSignal) {
  return getJson<AuthorProfile>(`/api/author?id=${encodeURIComponent(id)}`, signal)
}
