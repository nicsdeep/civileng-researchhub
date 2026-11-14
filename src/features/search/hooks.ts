import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getWork, searchWorks } from '../../lib/api'
import type { WorkSearchParams } from '../../types/research'

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
