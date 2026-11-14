import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAuthor, getWork, searchAuthors, searchWorks } from '../../lib/api'
import type { AuthorSearchParams, WorkSearchParams } from '../../types/research'

export function useWorksSearch(params: WorkSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['works', params],
    queryFn: ({ signal }) => searchWorks(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useWork(id: string) {
  return useQuery({
    queryKey: ['work', id],
    queryFn: ({ signal }) => getWork(id, signal),
  })
}

export function useAuthorSearch(params: AuthorSearchParams) {
  return useQuery({
    queryKey: ['authors', params],
    queryFn: ({ signal }) => searchAuthors(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useAuthor(id: string) {
  return useQuery({ queryKey: ['author', id], queryFn: ({ signal }) => getAuthor(id, signal) })
}
