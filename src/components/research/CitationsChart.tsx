import { useState } from 'react'
import { formatCount, niceMax } from '../../lib/format'

interface Point {
  year: number
  citations: number
}

// Drawn at roughly its on-screen size so 11px labels stay readable.
const W = 320
const H = 150
const PAD = { top: 12, right: 4, bottom: 22, left: 38 }

/** Citations received per year, single series, with hover values and a table fallback. */
export function CitationsChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(...data.map((d) => d.citations)))
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const band = plotW / data.length
  const barW = Math.min(18, band * 0.6)
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH
  const ticks = [0, max / 2, max]
  const shown = active ?? data.length - 1

  return (
    <figure className="m-0">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="label mb-0">Citations per year</span>
        <span className="text-sm tabular-nums text-muted" aria-live="polite">
          {data[shown].year}: <strong className="text-ink">{formatCount(data[shown].citations)}</strong>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Bar chart of citations per year; the same data is in the table below.">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--muted)" className="tabular-nums">
              {formatCount(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = PAD.left + band * i + band / 2
          const top = y(d.citations)
          const height = PAD.top + plotH - top
          const r = Math.min(4, height / 2, barW / 2)
          return (
            <g key={d.year} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} tabIndex={0} aria-label={`${d.year}: ${d.citations} citations`}>
              {/* Hit target spans the whole column, larger than the bar. */}
              <rect x={PAD.left + band * i} y={PAD.top} width={band} height={plotH} fill="transparent" />
              {height > 0 && (
                <path
                  d={`M${cx - barW / 2} ${PAD.top + plotH}V${top + r}q0 ${-r} ${r} ${-r}h${barW - 2 * r}q${r} 0 ${r} ${r}V${PAD.top + plotH}Z`}
                  fill="var(--chart)"
                  opacity={active === null || active === i ? 1 : 0.45}
                />
              )}
              {(i % 2 === (data.length - 1) % 2 || data.length <= 6) && (
                <text x={cx} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">{`’${String(d.year).slice(2)}`}</text>
              )}
            </g>
          )
        })}
      </svg>
      <details className="mt-1 text-xs text-muted">
        <summary className="cursor-pointer">Show as table</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead><tr><th className="text-left font-medium">Year</th><th className="text-right font-medium">Citations</th></tr></thead>
          <tbody>
            {data.map((d) => <tr key={d.year}><td>{d.year}</td><td className="text-right">{formatCount(d.citations)}</td></tr>)}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
