/** Database operations for the personal library (tables rh_*). RLS limits every query to the signed-in user. */
import { supabase } from '../../lib/supabase'
import { authorLine } from '../../lib/format'
import type { Work } from '../../types/research'

export interface SavedWork {
  id: string
  work_id: string
  title: string
  authors: string | null
  venue: string | null
  year: number | null
  doi: string | null
  note: string | null
  created_at: string
}

export interface Collection {
  id: string
  name: string
  created_at: string
}

export interface CollectionItem {
  collection_id: string
  saved_work_id: string
}

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(friendly(result.error.message))
  return result.data as T
}

function friendly(message: string): string {
  if (/duplicate key.*rh_collections_user_id_name/i.test(message)) return 'You already have a collection with that name.'
  if (/duplicate key/i.test(message)) return 'This is already in your library.'
  if (/JWT|not authenticated|permission denied/i.test(message)) return 'Your session has expired. Please sign in again.'
  if (/fetch|network/i.test(message)) return 'Could not reach the server. Check your connection and try again.'
  return 'Something went wrong. Please try again.'
}

export async function listSavedWorks(): Promise<SavedWork[]> {
  return check(
    await supabase
      .from('rh_saved_works')
      .select('id, work_id, title, authors, venue, year, doi, note, created_at')
      .order('created_at', { ascending: false }),
  )
}

export async function saveWork(work: Work): Promise<SavedWork> {
  return check(
    await supabase
      .from('rh_saved_works')
      .insert({
        work_id: work.id,
        title: work.title.slice(0, 1000),
        authors: authorLine(work).slice(0, 1000),
        venue: work.venue?.slice(0, 500) ?? null,
        year: work.year,
        doi: work.doi?.slice(0, 300) ?? null,
      })
      .select('id, work_id, title, authors, venue, year, doi, note, created_at')
      .single(),
  )
}

export async function removeSavedWork(id: string): Promise<void> {
  check(await supabase.from('rh_saved_works').delete().eq('id', id))
}

export async function listCollections(): Promise<Collection[]> {
  return check(await supabase.from('rh_collections').select('id, name, created_at').order('name'))
}

export async function createCollection(name: string): Promise<Collection> {
  return check(await supabase.from('rh_collections').insert({ name: name.trim() }).select('id, name, created_at').single())
}

export async function deleteCollection(id: string): Promise<void> {
  check(await supabase.from('rh_collections').delete().eq('id', id))
}

export async function listCollectionItems(): Promise<CollectionItem[]> {
  return check(await supabase.from('rh_collection_items').select('collection_id, saved_work_id'))
}

export async function setInCollection(item: CollectionItem, include: boolean): Promise<void> {
  if (include) check(await supabase.from('rh_collection_items').insert(item))
  else
    check(
      await supabase
        .from('rh_collection_items')
        .delete()
        .eq('collection_id', item.collection_id)
        .eq('saved_work_id', item.saved_work_id),
    )
}
