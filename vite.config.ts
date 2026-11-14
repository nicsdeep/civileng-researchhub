/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Serves the Vercel functions in /api during local development, so
 * `npm run dev` behaves like production without the Vercel CLI.
 * Each file in /api exports `GET(request: Request): Promise<Response>`.
 */
function localApi(): Plugin {
  const routes: Record<string, string> = {
    '/works': '/api/works.ts',
    '/work': '/api/work.ts',
    '/cite': '/api/cite.ts',
  }
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const file = routes[url.pathname]
        if (!file || req.method !== 'GET') return next()
        try {
          const mod = await server.ssrLoadModule(file)
          const response: Response = await mod.GET(new Request(new URL(url.pathname + url.search, 'http://localhost/api')))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          server.config.logger.error(String(error))
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Local API error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make server-only variables from .env.local visible to the /api code.
  const env = loadEnv(mode, process.cwd(), '')
  process.env.OPENALEX_API_KEY ??= env.OPENALEX_API_KEY

  return {
    plugins: [react(), tailwindcss(), localApi()],
    test: {
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  }
})
