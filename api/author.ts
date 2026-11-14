// GET /api/author?id=A5071268993
import { errorResponse, getAuthor, json } from './_lib/openalex.js'

export async function GET(request: Request): Promise<Response> {
  try {
    return json(await getAuthor(new URL(request.url).searchParams.get('id') ?? ''))
  } catch (error) {
    return errorResponse(error)
  }
}
