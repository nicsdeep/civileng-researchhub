# CivilEng ResearchHub

An academic research discovery platform for civil engineering, built as a university
coursework project in Ontario, Canada. Search real publications across structural,
geotechnical, transportation, environmental, water resources, construction and materials
engineering, with abstracts, citation counts, DOIs and links to legitimate full texts.

Publication data comes from [OpenAlex](https://openalex.org) (CC0). The platform never
hosts or proxies PDFs; it links to publishers and open-access repositories.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | App setup, design system, navigation, homepage | Done |
| 2 | OpenAlex search, filters, sorting, pagination, publication details | Basic version done; needs a working API key to test live |
| 3 | Supabase accounts, saved papers, collections | Not started |
| 4 | Researcher profiles, responsive and accessibility pass, Vercel deployment | Not started |

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS 4
- React Router 7 (client-side navigation)
- TanStack Query (data loading, caching, retries)
- Vercel serverless functions in `api/` (keep the OpenAlex key server-side)
- Supabase (Postgres + Auth), from Phase 3
- Vitest for tests

## Architecture

```
Browser (React app)
  ├── /api/works, /api/work  →  Vercel functions  →  OpenAlex API (key stays on the server)
  └── Supabase client (publishable key only)  →  Auth + Postgres with Row Level Security
```

## Project structure

```
api/                    Vercel functions (server-only code)
  _lib/openalex.ts      OpenAlex client: query building, field mapping, error handling
  works.ts              GET /api/works  (search)
  work.ts               GET /api/work?id=W…  (single publication)
src/
  app/                  Router and page layout
  pages/                One file per page
  components/ui/        Generic UI (status messages, skeletons)
  components/research/  Search bar, filters, result items, pagination
  features/search/      Data hooks
  lib/                  API client, search parameters, disciplines, formatting
  types/                Shared TypeScript types
  styles/               Tailwind entry and design tokens
tests/                  Unit tests
```

## Getting started

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:5173
```

`npm run dev` also serves the `api/` functions locally, so no Vercel CLI is needed.

### Environment variables

| Name | Where it is used | Secret? |
|---|---|---|
| `OPENALEX_API_KEY` | `api/` functions only. Get a free key at https://openalex.org/settings/api-key | Yes. Never prefix with `VITE_` and never commit it |
| `VITE_SUPABASE_URL` | Browser (Phase 3) | No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser (Phase 3) | No, publishable by design |

Never put the Supabase service-role key or the database password in this project.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with the local API |
| `npm run build` | Type-check and build for production |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |

## Deployment (Vercel)

1. Import the GitHub repository in Vercel. The Vite framework preset is detected automatically.
2. Add `OPENALEX_API_KEY` (and the Supabase variables from Phase 3) under Project Settings → Environment Variables.
3. Deploy. `vercel.json` sends every non-API path to the app so deep links work.

## Data and licensing

- Metadata and abstracts: OpenAlex, CC0.
- Full texts: only links to open-access copies reported by OpenAlex, or to the publisher's page.
- Search results are cached at the CDN for an hour to stay within OpenAlex usage limits.
