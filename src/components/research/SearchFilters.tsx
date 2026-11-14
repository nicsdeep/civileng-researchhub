import type { ReactNode } from 'react'
import type { SortOption, WorkSearchParams } from '../../types/research'
import { DISCIPLINES } from '../../lib/disciplines'
import { PUBLICATION_TYPES } from '../../lib/searchParams'

interface Props {
  params: WorkSearchParams
  onChange: (changes: Partial<WorkSearchParams>) => void
}

const currentYear = new Date().getFullYear()
const SINCE = [currentYear, currentYear - 1, currentYear - 4, currentYear - 9].map(String)
const YEARS = Array.from({ length: 70 }, (_, i) => String(currentYear - i))
const SORTS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Sort by relevance' },
  { value: 'newest', label: 'Sort by date' },
  { value: 'citations', label: 'Most cited' },
]

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`w-full rounded-lg px-2 py-1 text-left text-sm transition-colors ${active ? 'bg-accent-soft font-semibold text-accent' : 'text-ink/80 hover:bg-surface-2 hover:text-ink'}`}
      >
        {children}
      </button>
    </li>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="label px-2">{title}</h3>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

/** Left rail of filters, in the style of scholarly search engines. */
export function SearchFilters({ params, onChange }: Props) {
  const anyTime = !params.from && !params.to
  const isSince = (y: string) => params.from === y && !params.to
  const custom = !anyTime && !SINCE.some(isSince)

  return (
    <div className="space-y-6">
      <Group title="Time">
        <Option active={anyTime} onClick={() => onChange({ from: '', to: '' })}>Any time</Option>
        {SINCE.map((y) => (
          <Option key={y} active={isSince(y)} onClick={() => onChange({ from: y, to: '' })}>Since {y}</Option>
        ))}
        <li className={`rounded-lg px-2 py-1.5 ${custom ? 'bg-accent-soft' : ''}`}>
          <span className="mb-1 block text-sm text-ink/80">Custom range</span>
          <div className="flex items-center gap-1.5">
            <label htmlFor="f-from" className="sr-only">From year</label>
            <select id="f-from" className="field px-2 py-1" value={params.from} onChange={(e) => onChange({ from: e.target.value })}>
              <option value="">From</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-xs text-muted">to</span>
            <label htmlFor="f-to" className="sr-only">To year</label>
            <select id="f-to" className="field px-2 py-1" value={params.to} onChange={(e) => onChange({ to: e.target.value })}>
              <option value="">To</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </li>
      </Group>

      <Group title="Sort">
        {SORTS.map((s) => (
          <Option key={s.value} active={params.sort === s.value} onClick={() => onChange({ sort: s.value })}>{s.label}</Option>
        ))}
      </Group>

      <Group title="Discipline">
        <Option active={!params.discipline} onClick={() => onChange({ discipline: '' })}>All civil engineering</Option>
        {DISCIPLINES.map((d) => (
          <Option key={d.slug} active={params.discipline === d.slug} onClick={() => onChange({ discipline: d.slug })}>{d.name}</Option>
        ))}
      </Group>

      <Group title="Type">
        <Option active={!params.type} onClick={() => onChange({ type: '' })}>Any type</Option>
        {PUBLICATION_TYPES.map((t) => (
          <Option key={t.value} active={params.type === t.value} onClick={() => onChange({ type: t.value })}>{t.label}</Option>
        ))}
      </Group>

      <label className="flex cursor-pointer items-center gap-2 px-2 text-sm">
        <input
          type="checkbox"
          checked={params.oa}
          onChange={(e) => onChange({ oa: e.target.checked })}
          className="size-4 accent-[var(--accent)]"
        />
        Free full text only
      </label>
    </div>
  )
}
