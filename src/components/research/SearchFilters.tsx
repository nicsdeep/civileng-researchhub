import type { WorkSearchParams } from '../../types/research'
import { DISCIPLINES } from '../../lib/disciplines'
import { PUBLICATION_TYPES } from '../../lib/searchParams'

interface Props {
  params: WorkSearchParams
  onChange: (changes: Partial<WorkSearchParams>) => void
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => String(currentYear - i))

export function SearchFilters({ params, onChange }: Props) {
  const hasFilters = params.discipline || params.from || params.to || params.type || params.oa

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-discipline" className="label">Discipline</label>
        <select
          id="f-discipline"
          className="field"
          value={params.discipline}
          onChange={(e) => onChange({ discipline: e.target.value })}
        >
          <option value="">All of civil engineering</option>
          {DISCIPLINES.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Publication year</legend>
        <div className="flex items-center gap-2">
          <label htmlFor="f-from" className="sr-only">From year</label>
          <select id="f-from" className="field" value={params.from} onChange={(e) => onChange({ from: e.target.value })}>
            <option value="">Any</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-sm text-muted">to</span>
          <label htmlFor="f-to" className="sr-only">To year</label>
          <select id="f-to" className="field" value={params.to} onChange={(e) => onChange({ to: e.target.value })}>
            <option value="">Any</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </fieldset>

      <div>
        <label htmlFor="f-type" className="label">Publication type</label>
        <select id="f-type" className="field" value={params.type} onChange={(e) => onChange({ type: e.target.value })}>
          <option value="">All types</option>
          {PUBLICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={params.oa}
          onChange={(e) => onChange({ oa: e.target.checked })}
          className="size-4 accent-[var(--accent)]"
        />
        Open access only
      </label>

      {hasFilters && (
        <button
          type="button"
          className="link text-sm"
          onClick={() => onChange({ discipline: '', from: '', to: '', type: '', oa: false })}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
