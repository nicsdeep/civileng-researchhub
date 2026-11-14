// GET /api/cite?doi=10.xxxx/yyy&format=apa|mla|chicago|harvard|ieee|bibtex
//
// Formatted citations come from the DOI registration agencies (Crossref,
// DataCite) through DOI content negotiation, so they match the publisher's
// own record. https://citation.crosscite.org/docs.html
import { UpstreamError, errorResponse } from './_lib/openalex.js'

export const CITATION_FORMATS = {
  apa: 'text/x-bibliography; style=apa; locale=en-US',
  mla: 'text/x-bibliography; style=modern-language-association; locale=en-US',
  chicago: 'text/x-bibliography; style=chicago-author-date; locale=en-US',
  harvard: 'text/x-bibliography; style=harvard-cite-them-right; locale=en-GB',
  ieee: 'text/x-bibliography; style=ieee; locale=en-US',
  bibtex: 'application/x-bibtex',
} as const

export type CitationFormat = keyof typeof CITATION_FORMATS

const DOI = /^10\.\d{4,9}\/\S+$/

/** Removes artefacts some publisher records produce, such as an empty editor list. */
export function tidyCitation(text: string): string {
  return text
    .replace(/,\s*edited by\s*,/gi, ',')
    .replace(/\.\s*Edited by\s*,/g, ',')
    .replace(/^\[\d+\]\s*/, '')
    .trim()
}

export function doiUrl(doi: string): string {
  // Keep the DOI readable but escape characters that would end the path.
  return `https://doi.org/${encodeURI(doi).replace(/[?#]/g, encodeURIComponent)}`
}

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams
    const doi = (params.get('doi') ?? '').trim()
    const format = (params.get('format') ?? 'apa') as CitationFormat
    if (!DOI.test(doi) || doi.length > 300) throw new UpstreamError(400, 'Invalid DOI.')
    if (!(format in CITATION_FORMATS)) throw new UpstreamError(400, 'Unknown citation format.')

    let response: Response
    try {
      response = await fetch(doiUrl(doi), {
        headers: { Accept: CITATION_FORMATS[format] },
        redirect: 'follow',
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      throw new UpstreamError(504, 'The citation service did not respond in time. Please try again.')
    }
    if (response.status === 404) throw new UpstreamError(404, 'No citation data is registered for this DOI.')
    if (!response.ok) throw new UpstreamError(502, 'The citation service returned an error. Please try again.')

    const raw = (await response.text()).trim()
    const text = format === 'bibtex' ? raw : tidyCitation(raw)
    return new Response(JSON.stringify({ format, text }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
