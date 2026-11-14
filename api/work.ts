// GET /api/work?id=W123456789
import { errorResponse, getWork, json } from './_lib/openalex.js'

export async function GET(request: Request): Promise<Response> {
  try {
    const id = new URL(request.url).searchParams.get('id') ?? ''
    return json(await getWork(id))
  } catch (error) {
    return errorResponse(error)
  }
}
