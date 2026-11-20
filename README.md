# CivilEng ResearchHub

An academic research discovery platform for civil engineering, built as a university
coursework project in Ontario, Canada. Search real publications across structural,
geotechnical, transportation, environmental, water resources, construction and materials
engineering, with abstracts, citation counts, DOIs and links to legitimate full texts.

Publication metadata comes from OpenAlex (CC0, so no on-site attribution is required) and
formatted citations from the DOI registration agencies (Crossref/DataCite). The platform
never hosts or proxies PDFs; it links to publishers and open-access repositories.

Features: researcher search and profiles (affiliation, ORCID, h-index, citations per year,
publications), discipline rankings with a Canadian-institutions filter; Scholar-style search with time, sort, discipline and type filters; "Cited by"
navigation; Cite in APA, MLA, Chicago, Harvard, IEEE and BibTeX; passwordless accounts
(email sign-in link); a personal library with collections.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | App setup, design system, navigation, homepage | Done |
| 2 | OpenAlex search, filters, sorting, pagination, publication details | Done, tested with live data |
| 3 | Accounts, saved papers, collections, citations | Done |
| 4 | Researcher profiles, responsive and accessibility pass, Vercel deployment | Done |

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
  works.ts              GET /api/works  (search, including cites=W… for "Cited by")
  work.ts               GET /api/work?id=W…  (single publication)
  cite.ts               GET /api/cite?doi=…&format=apa|mla|chicago|harvard|ieee|bibtex
  authors.ts            GET /api/authors?q=…&discipline=…&canada=1 (search, or ranking by field output)
  author.ts             GET /api/author?id=A…  (profile, metrics, citations per year)
src/
  app/                  Router and page layout
  pages/                One file per page
  components/ui/        Generic UI (status messages, skeletons)
  components/research/  Search bar, filters, result items, pagination
  features/search/      Search data hooks
  features/auth/        Session state, route guard, form validation
  features/library/     Saved papers and collections (Supabase)
  lib/                  API client, search parameters, disciplines, formatting
  types/                Shared TypeScript types
  styles/               Tailwind entry and design tokens
tests/                  Unit tests
brand/                  Official logo artwork and the script that traced it to SVG
supabase/migrations/    Database changes, applied automatically on merge to main
.github/workflows/      CI checks and automatic database migrations
supabase/tests/         Row Level Security tests (run on a local PostgreSQL)
```

## Getting started

Requirements: Node.js 22.

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

## Database (Supabase)

The Supabase project is shared with a future CivilEng Digital CV Portfolio. Every
ResearchHub table is prefixed `rh_` (the portfolio can use `pf_`), and both apps share
Supabase Auth, so one account works on both.

| Table | Purpose |
|---|---|
| `rh_saved_works` | Publications a user saved: OpenAlex id plus a small snapshot (title, authors, venue, year, DOI) and a private note |
| `rh_collections` | Named folders created by a user |
| `rh_collection_items` | Which saved publications are in which collection |

Security: only signed-in users can access these tables; anonymous visitors are denied.
Row Level Security on every table limits each user to their own rows, and `user_id` is
set automatically from the login session. Publications themselves are never stored.

### Auth settings

`supabase/config.toml` sets the site URL and redirect URLs (so sign-in emails link to the live
sites). Sign-in is passwordless: the app only ever sends an email link (`signInWithOtp`), which
also creates the account on first use. The password rules in the config only matter if a
password flow is ever added back. The
workflow below applies it with `supabase config push`.

### Migrations run automatically

`.github/workflows/supabase-migrations.yml` applies any new file in `supabase/migrations/`
to Supabase when it reaches `main`. Already-applied migrations are skipped. It uses these
repository secrets (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens → Generate new token |
| `SUPABASE_DB_PASSWORD` | Optional. Without it the CLI uses a temporary login role |

To run it by hand: GitHub → Actions → Supabase migrations → Run workflow.

### Testing the security rules

CI runs `supabase/tests/run-rls-tests.sh` against PostgreSQL on every push. It simulates
two users and an anonymous visitor and fails if anyone can read or change another user's
data. Locally: `PGHOST=localhost PGUSER=postgres supabase/tests/run-rls-tests.sh`.

## Deployment (Vercel)

1. Import the GitHub repository in Vercel. The Vite framework preset is detected automatically.
2. Add `OPENALEX_API_KEY` (and the Supabase variables from Phase 3) under Project Settings → Environment Variables.
3. Deploy. `vercel.json` sends every non-API path to the app so deep links work.

## Data and licensing

- Metadata and abstracts: OpenAlex, CC0.
- Full texts: only links to open-access copies reported by OpenAlex, or to the publisher's page.
- Search results are cached at the CDN for an hour to stay within OpenAlex usage limits.
