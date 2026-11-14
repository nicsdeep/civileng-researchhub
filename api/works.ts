// GET /api/works?q=…&discipline=…&from=…&to=…&type=…&oa=1&sort=…&page=…
import { parseSearchParams } from '../src/lib/searchParams.js'
import { errorResponse, json, searchWorks } from './_lib/openalex.js'

export async function GET(request: Request): Promise<Response> {
  try {
    const params = parseSearchParams(new URL(request.url).searchParams)
    return json(await searchWorks(params))
  } catch (error) {
    return errorResponse(error)
  }
}
