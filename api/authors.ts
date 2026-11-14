// GET /api/authors?q=…&discipline=…&canada=1&page=…
import { parseAuthorParams } from '../src/lib/searchParams.js'
import { errorResponse, json, searchAuthors } from './_lib/openalex.js'

export async function GET(request: Request): Promise<Response> {
  try {
    return json(await searchAuthors(parseAuthorParams(new URL(request.url).searchParams)))
  } catch (error) {
    return errorResponse(error)
  }
}
