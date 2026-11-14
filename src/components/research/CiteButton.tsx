import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../lib/api'

const FORMATS = [
  { id: 'apa', label: 'APA' },
  { id: 'mla', label: 'MLA' },
  { id: 'chicago', label: 'Chicago' },
  { id: 'harvard', label: 'Harvard' },
  { id: 'ieee', label: 'IEEE' },
  { id: 'bibtex', label: 'BibTeX' },
] as const

async function fetchCitation(doi: string, format: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(`/api/cite?doi=${encodeURIComponent(doi)}&format=${format}`, { signal })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body?.error ?? 'Citation unavailable.')
  return body.text as string
}

function CitationRow({ doi, format, label }: { doi: string; format: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['cite', doi, format],
    queryFn: ({ signal }) => fetchCitation(doi, format, signal),
    staleTime: Infinity,
    retry: false,
  })

  async function copy() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[5.5rem_1fr_auto] sm:gap-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <div className={`min-w-0 text-sm ${format === 'bibtex' ? 'font-mono text-xs break-all whitespace-pre-wrap' : ''}`}>
        {isPending ? <span className="text-muted">Loading…</span> : isError ? <span className="text-muted">{error.message}</span> : data}
      </div>
      <button type="button" className="btn-quiet justify-self-start" onClick={copy} disabled={!data}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/** ❝ Cite: formatted citations from the publisher's DOI record. */
export function CiteButton({ doi, title, variant = 'quiet' }: { doi: string | null; title: string; variant?: 'quiet' | 'button' }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  function show() {
    setOpen(true)
    dialog.current?.showModal()
  }

  return (
    <>
      <button type="button" onClick={show} className={variant === 'button' ? 'btn-secondary' : 'btn-quiet'}>
        <span aria-hidden="true">❝</span> Cite
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-labelledby="cite-title"
        className="m-auto w-[min(44rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="cite-title" className="display text-2xl">Cite</h2>
            <p className="truncate text-sm text-muted">{title}</p>
          </div>
          <button type="button" className="btn-quiet" onClick={() => dialog.current?.close()} aria-label="Close">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-2">
          {!doi ? (
            <p className="py-6 text-sm text-muted">
              This publication has no DOI, so a verified citation cannot be generated. Use the details on the publication page.
            </p>
          ) : (
            open && FORMATS.map((f) => <CitationRow key={f.id} doi={doi} format={f.id} label={f.label} />)
          )}
        </div>
        {doi && <p className="border-t border-line px-5 py-3 text-xs text-muted">Formatted from the DOI registration record. Check against your course's style guide.</p>}
      </dialog>
    </>
  )
}
