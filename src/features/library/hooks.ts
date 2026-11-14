import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import * as api from './api'
import type { Work } from '../../types/research'

const keys = {
  saved: (uid: string) => ['library', uid, 'saved'] as const,
  collections: (uid: string) => ['library', uid, 'collections'] as const,
  items: (uid: string) => ['library', uid, 'items'] as const,
}

export function useSavedWorks() {
  const { user } = useAuth()
  return useQuery({ queryKey: keys.saved(user?.id ?? ''), queryFn: api.listSavedWorks, enabled: !!user, staleTime: 60_000 })
}

/** Map of OpenAlex work id → saved row id, for showing ★ states. */
export function useSavedIndex(): Map<string, string> {
  const { data } = useSavedWorks()
  return new Map((data ?? []).map((s) => [s.work_id, s.id]))
}

export function useToggleSave() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ work, savedId }: { work: Work; savedId?: string }) =>
      savedId ? api.removeSavedWork(savedId) : api.saveWork(work),
    onSettled: () => {
      if (!user) return
      queryClient.invalidateQueries({ queryKey: keys.saved(user.id) })
      queryClient.invalidateQueries({ queryKey: keys.items(user.id) })
    },
  })
}

export function useRemoveSaved() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.removeSavedWork,
    onSuccess: () => {
      if (!user) return
      queryClient.invalidateQueries({ queryKey: keys.saved(user.id) })
      queryClient.invalidateQueries({ queryKey: keys.items(user.id) })
    },
  })
}

export function useCollections() {
  const { user } = useAuth()
  return useQuery({ queryKey: keys.collections(user?.id ?? ''), queryFn: api.listCollections, enabled: !!user })
}

export function useCollectionItems() {
  const { user } = useAuth()
  return useQuery({ queryKey: keys.items(user?.id ?? ''), queryFn: api.listCollectionItems, enabled: !!user })
}

export function useCollectionMutations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  // Returned promises make each mutation wait until the lists are fresh again.
  const refresh = () =>
    user
      ? Promise.all([
          queryClient.invalidateQueries({ queryKey: keys.collections(user.id) }),
          queryClient.invalidateQueries({ queryKey: keys.items(user.id) }),
        ])
      : undefined
  return {
    create: useMutation({ mutationFn: api.createCollection, onSuccess: refresh }),
    remove: useMutation({ mutationFn: api.deleteCollection, onSuccess: refresh }),
    toggleItem: useMutation({
      mutationFn: ({ item, include }: { item: api.CollectionItem; include: boolean }) => api.setInCollection(item, include),
      onSettled: refresh,
    }),
  }
}
