import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CiteButton } from '../components/research/CiteButton'
import { ResultSkeleton, StatusMessage } from '../components/ui/StatusMessage'
import { useCollectionItems, useCollectionMutations, useCollections, useRemoveSaved, useSavedWorks } from '../features/library/hooks'
import type { Collection, SavedWork } from '../features/library/api'
import { usePageTitle } from '../lib/usePageTitle'

function CollectionPicker({ work, collections, memberOf }: { work: SavedWork; collections: Collection[]; memberOf: Set<string> }) {
  const { toggleItem } = useCollectionMutations()
  // Show the new state immediately, until the server confirms it.
  const [pending, setPending] = useState<Record<string, boolean>>({})
  if (collections.length === 0) return null
  return (
    <details className="relative">
      <summary className="btn-quiet cursor-pointer list-none">＋ Collections{memberOf.size > 0 && ` (${memberOf.size})`}</summary>
      <div className="absolute left-0 z-10 mt-1 w-60 rounded-xl border border-line bg-surface p-2 shadow-lg">
        {collections.map((c) => {
          const checked = pending[c.id] ?? memberOf.has(c.id)
          return (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
              <input
                type="checkbox"
                className="size-4 accent-[var(--accent)]"
                checked={checked}
                disabled={c.id in pending}
                onChange={() => {
                  setPending((p) => ({ ...p, [c.id]: !checked }))
                  toggleItem.mutate(
                    { item: { collection_id: c.id, saved_work_id: work.id }, include: !checked },
                    {
                      onSettled: () =>
                        setPending((p) => {
                          const next = { ...p }
                          delete next[c.id]
                          return next
                        }),
                    },
                  )
                }}
              />
              <span className="truncate">{c.name}</span>
            </label>
          )
        })}
      </div>
    </details>
  )
}

function SavedItem({ work, collections, memberOf }: { work: SavedWork; collections: Collection[]; memberOf: Set<string> }) {
  const remove = useRemoveSaved()
  const names = collections.filter((c) => memberOf.has(c.id)).map((c) => c.name)
  const byline = [work.authors, [work.venue, work.year].filter(Boolean).join(', ')].filter(Boolean).join(' - ')
  return (
    <article className="py-5">
      <h3 className="text-[1.075rem] leading-snug font-medium">
        <Link to={`/publication/${work.work_id}`} className="link">{work.title}</Link>
      </h3>
      {byline && <p className="mt-1 text-sm text-byline">{byline}</p>}
      {names.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {names.map((n) => <span key={n} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{n}</span>)}
        </p>
      )}
      <div className="-ml-2 mt-2 flex flex-wrap items-center gap-1">
        <CiteButton doi={work.doi} title={work.title} />
        <CollectionPicker work={work} collections={collections} memberOf={memberOf} />
        <button type="button" className="btn-quiet hover:text-danger" disabled={remove.isPending} onClick={() => remove.mutate(work.id)}>
          {remove.isPending ? 'Removing…' : 'Remove'}
        </button>
        <span className="px-2 text-xs text-muted">Saved {new Date(work.created_at).toLocaleDateString('en-CA')}</span>
      </div>
      {remove.isError && <p role="alert" className="text-xs text-danger">{remove.error.message}</p>}
    </article>
  )
}

function NewCollection() {
  const { create } = useCollectionMutations()
  const [name, setName] = useState('')
  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    create.mutate(name, { onSuccess: () => setName('') })
  }
  return (
    <form onSubmit={onSubmit} className="mt-3 px-2">
      <label htmlFor="new-collection" className="sr-only">New collection name</label>
      <div className="flex gap-1.5">
        <input id="new-collection" className="field py-1.5" placeholder="New collection" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn-secondary px-3 py-1.5" disabled={create.isPending || !name.trim()}>Add</button>
      </div>
      {create.isError && <p role="alert" className="mt-1 text-xs text-danger">{create.error.message}</p>}
    </form>
  )
}

export function LibraryPage() {
  usePageTitle('My Library')
  const [params, setParams] = useSearchParams()
  const active = params.get('collection') ?? ''
  const [filter, setFilter] = useState('')
  const saved = useSavedWorks()
  const collections = useCollections()
  const items = useCollectionItems()
  const { remove: removeCollection } = useCollectionMutations()

  const membership = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const i of items.data ?? []) {
      if (!map.has(i.saved_work_id)) map.set(i.saved_work_id, new Set())
      map.get(i.saved_work_id)!.add(i.collection_id)
    }
    return map
  }, [items.data])

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const i of items.data ?? []) c.set(i.collection_id, (c.get(i.collection_id) ?? 0) + 1)
    return c
  }, [items.data])

  const list = (saved.data ?? [])
    .filter((w) => !active || membership.get(w.id)?.has(active))
    .filter((w) => {
      const f = filter.trim().toLowerCase()
      return !f || [w.title, w.authors, w.venue, w.doi].some((v) => v?.toLowerCase().includes(f))
    })
  const activeCollection = collections.data?.find((c) => c.id === active)
  const empty = saved.data && saved.data.length === 0

  function onDelete(c: Collection) {
    if (!window.confirm(`Delete the collection “${c.name}”? The papers stay in your library.`)) return
    removeCollection.mutate(c.id, { onSuccess: () => active === c.id && setParams({}) })
  }

  const railItem = (selected: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${selected ? 'bg-accent-soft font-semibold text-accent' : 'text-ink/80 hover:bg-surface-2'}`

  return (
    <div className="container-page py-8">
      <h1 className="display text-5xl">My <em className="text-brand-italic">Library.</em></h1>
      <p className="mt-1 text-muted">Papers you saved, organized your way.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[14rem_1fr]">
        <aside aria-label="Collections">
          <h2 className="label px-2">Library</h2>
          <button type="button" className={railItem(!active)} onClick={() => setParams({})}>
            <span>All saved</span><span className="text-xs tabular-nums">{saved.data?.length ?? ''}</span>
          </button>
          <h2 className="label mt-6 px-2">Collections</h2>
          <ul className="space-y-0.5">
            {(collections.data ?? []).map((c) => (
              <li key={c.id} className="group flex items-center">
                <button type="button" className={railItem(active === c.id)} onClick={() => setParams({ collection: c.id })}>
                  <span className="truncate">{c.name}</span><span className="text-xs tabular-nums">{counts.get(c.id) ?? 0}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete collection ${c.name}`}
                  className="ml-1 rounded-full px-1.5 text-muted opacity-60 hover:text-danger group-hover:opacity-100"
                  onClick={() => onDelete(c)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {collections.data?.length === 0 && <p className="px-2 text-xs text-muted">Group papers by course, project or thesis chapter.</p>}
          <NewCollection />
        </aside>

        <section aria-label="Saved publications" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <p className="text-sm text-muted" aria-live="polite">
              {activeCollection ? <><strong className="text-ink">{activeCollection.name}</strong> · </> : null}
              {saved.data ? `${list.length} ${list.length === 1 ? 'paper' : 'papers'}` : 'Loading…'}
            </p>
            {!empty && (
              <div className="w-full sm:w-64">
                <label htmlFor="library-filter" className="sr-only">Filter your library</label>
                <input id="library-filter" type="search" className="field" placeholder="Filter by title, author or journal" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
            )}
          </div>

          {saved.isPending ? (
            <ResultSkeleton rows={3} />
          ) : saved.isError ? (
            <StatusMessage tone="error" title="Your library could not be loaded" action={<button type="button" className="btn-secondary" onClick={() => saved.refetch()}>Try again</button>}>
              {saved.error.message}
            </StatusMessage>
          ) : empty ? (
            <StatusMessage title="Your library is empty" action={<Link to="/explore" className="btn-primary">Find papers</Link>}>
              Use <strong>☆ Save</strong> on any search result or publication page to keep it here.
            </StatusMessage>
          ) : list.length === 0 ? (
            <StatusMessage title={active ? 'Nothing in this collection yet' : 'No matches'}>
              {active ? 'Use “＋ Collections” on a paper to add it here.' : 'Try a different filter.'}
            </StatusMessage>
          ) : (
            <div className="divide-y divide-line">
              {list.map((w) => (
                <SavedItem key={w.id} work={w} collections={collections.data ?? []} memberOf={membership.get(w.id) ?? new Set()} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
