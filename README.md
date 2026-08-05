# Business Prospect Finder

Business Prospect Finder discovers local businesses through Google Places,
enriches their digital presence, scores their sales potential, and generates
personalized outreach material.

The repository contains an Express API, BullMQ workers, and a map-based
Leaflet GUI.

## Capabilities

- Grid-based Google Places discovery with place-ID deduplication
- Interactive OpenStreetMap search center and radius selection
- Email, technology, analytics pixel, SSL, performance, and social extraction
- Weighted lead scoring with `LOW`, `MEDIUM`, and `HIGH` priorities
- OpenAI, Gemini, or Claude structured analysis
- CSV, Excel, and JSON exports
- Search analytics and pipeline status polling

## Processing flow

```text
Map GUI / API
  → discovery queue
  → Google Places grid search
  → enrichment queue per business
  → analysis queue per business
  → completed search, analytics, and exports
```

## Requirements

- Node.js 22+
- PostgreSQL, such as Supabase
- Redis, such as Upstash
- Google Places API (New) key
- OpenAI, Gemini, or Claude API key

Local PostgreSQL and Redis installations are not required when using cloud
providers.

## Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Configure these values:

| Variable | Purpose |
|---|---|
| `PORT` | Express API port. Use `5175` during GUI development because the Vite proxy targets that port. |
| `NODE_ENV` | `development`, `production`, or `test` |
| `DATABASE_URL` | Direct PostgreSQL connection used by Prisma and migrations |
| `REDIS_URL` | Redis protocol URL beginning with `redis://` or `rediss://` |
| `GOOGLE_PLACES_API_KEY` | Google Places API (New) credential |
| `LLM_PROVIDER` | `openai`, `gemini`, or `claude` |
| `LLM_API_KEY` | Credential for the selected provider |
| `RATE_LIMIT_WINDOW_MS` | API rate-limit window |
| `RATE_LIMIT_MAX_REQUESTS` | Requests allowed per window |
| `SUPABASE_URL` | Supabase project URL (API JWT verification) |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (HS256) from Project Settings → API |

Also create `client/.env` from `client/.env.example`:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Same project URL (browser-safe) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

Important:

- Use a Supabase direct connection (port `5432`) for `prisma migrate dev`.
- URL-encode special characters in database passwords (`/` becomes `%2F`,
  `@` becomes `%40`).
- BullMQ cannot use an Upstash HTTPS REST URL. Copy the Redis URL instead.
- `DIRECT_URL` is documented in `.env.example`, but the current Prisma schema
  does not consume it. Use `DATABASE_URL` for both runtime and migrations.
- Never put `SUPABASE_JWT_SECRET` in Vite/`client/.env`. Only the anon key is
  browser-safe.

## Install and migrate

```bash
npm install
npm run prisma:migrate
```

Use the repository script instead of a bare `npx prisma migrate dev`; the
script uses the locally installed, project-compatible Prisma CLI.

## Authentication (Supabase)

1. In Supabase → **Authentication → Providers**:
   - Enable **Email** (magic link)
   - Enable **Google** (OAuth Client ID/Secret from Google Cloud)
2. Add redirect URLs:
   - `http://localhost:5176`
   - production origin when deployed
3. Copy **Project URL**, **anon key**, and **JWT Secret** into `.env` /
   `client/.env` as above.

The map GUI shows **Continue with Google** and **Send magic link**. After
sign-in, the client sends `Authorization: Bearer <access_token>`. The API
verifies the JWT, upserts a local `User` with `id = auth.sub`, and never
accepts `userId` from the request body.

Protected routes: `/searches*`, export, and analytics. Public: `/health`,
`/ready`.

## Development

Set `PORT=5175` in `.env`, then run:

```bash
npm run dev
```

Open:

- GUI: <http://localhost:5176>
- API: <http://localhost:5175>
- Health: <http://localhost:5175/health>
- Readiness: <http://localhost:5175/ready>

The GUI development server proxies `/searches`, `/health`, and `/ready` to
the API on port `5175`.

### Using the map

1. Sign in with Google or email magic link.
2. Enter a business category, such as `coffee shop` or `dentist`.
3. Click the map, drag the marker, or select **Use my location**.
4. Adjust the search-radius slider.
5. Select **Start search**.
6. Wait for `COMPLETED`, then review analytics or download an export.

Larger radii create more grid cells and can significantly increase Google
Places, website-fetching, and LLM usage.

## Production build

```bash
npm run build
npm run start:api
```

`npm run build` builds the Vite client into `public/` and compiles the API to
`dist/`. Express serves the built GUI and API from
<http://localhost:5175>.

`start:api` currently sets port `5175` explicitly. There is no `npm start`
script.

## API overview

All JSON endpoints use `{ "success": true, "data": ... }` on success and
`{ "success": false, "error": ... }` on failure.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Process liveness |
| `GET` | `/ready` | PostgreSQL readiness |
| `POST` | `/searches` | Create and enqueue a search |
| `GET` | `/searches/:id` | Retrieve a search |
| `GET` | `/searches/:id/status` | Poll pipeline status |
| `GET` | `/searches/:id/export?format=csv\|excel\|json` | Download results |
| `GET` | `/searches/:id/analytics` | Retrieve aggregate metrics |

Example search (requires a valid Supabase access token):

```bash
curl -X POST http://localhost:5175/searches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "category": "coffee shop",
    "city": "Mexico City",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "radiusMeters": 1000
  }'
```

Poll the returned search UUID:

```bash
curl http://localhost:5175/searches/SEARCH-UUID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Status values are `PENDING`, `PROCESSING`, `COMPLETED`, and `FAILED`.
Unauthenticated requests return `401`. Accessing another user's search returns
`404`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API and GUI; GUI uses port `5176` |
| `npm run dev:local` | Free ports `5175`/`5176`, then start development |
| `npm run dev:api` | Start only the API using `PORT` from `.env` |
| `npm run dev:gui` | Start only Vite using its default port `5173` |
| `npm run build:client` | Build the GUI into `public/` |
| `npm run build` | Build GUI and compile TypeScript API |
| `npm run start:api` | Run compiled API and GUI on port `5175` |
| `npm test` | Run the Vitest suite |
| `npm run prisma:migrate` | Create/apply development migrations |
| `npm run prisma:generate` | Regenerate Prisma Client |

## Technology

Node.js 22, TypeScript, Express, Prisma, PostgreSQL, Redis, BullMQ, Axios,
Zod, Pino, Vitest, Vite, Leaflet, and ExcelJS.

## Current limitations

- Role-based admin APIs are not implemented yet (`Role` is stored only)
- One LLM provider is active at a time
- Progress is coarse (`0`, `50`, or `100`) rather than per-stage
- Failed enrichment or analysis jobs do not expose detailed errors via API
- Website extraction depends on public HTML and may be blocked by target sites
- OpenStreetMap tiles require internet access and are subject to its usage policy

## Detailed documentation

See [docs/USAGE.md](docs/USAGE.md) for response examples, scoring rules,
exports, analytics fields, and troubleshooting.
