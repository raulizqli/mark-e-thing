# MarkeThing API

NestJS API for MarkeThing Phase 1.

## Prisma

The Prisma schema lives at the repository root: `../../prisma/schema.prisma`.

From this package:

```bash
npm run prisma:generate
```

From the monorepo root:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Environment

Copy `/workspace/.env.example` to `/workspace/.env` and set `DATABASE_URL`.

When `OPENAI_API_KEY` is missing, content and image generation use deterministic mock providers.

## Development

```bash
npm run dev
```

API listens on `API_PORT` (default `3001`).
