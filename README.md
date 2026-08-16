# MarkeThing

SaaS de Marketing con Inteligencia Artificial. Evoluciona desde un generador de contenido (Fase 1) hacia un agente autónomo de marketing (Fase 2).

## Fase 1 — MVP

Configura la marca una vez, genera contenido e imágenes con IA y organiza un calendario editorial. La arquitectura de publicación por adaptadores queda lista, pero **las redes sociales no publican de verdad en esta fase** (adapters stub).

### Capacidades

| Módulo | Qué hace | Estado Fase 1 |
|---|---|---|
| Empresas | Perfil de marca: giro, servicios, productos, colores, tono, CTAs, palabras prohibidas, redes | Listo |
| Base de conocimiento | Sube TXT/PDF (extracción de texto). Word/imágenes se almacenan; extracción puede quedar pendiente | Parcial |
| Generación de contenido | Facebook, Instagram (post/carousel/story), Stories, WhatsApp Status, LinkedIn, X, Blog, Email, Promociones | Listo |
| Imágenes | Prompt + generación (Gemini / Together / OpenAI / mock) | Listo |
| Calendario | Vista mensual, programar desde generar/historial, arrastrar, duplicar, eliminar | Listo |
| Publicación | Cola `PublishJob` + registry de adaptadores; **stubs** (`PLATFORM_NOT_CONFIGURED`) hasta conectar OAuth | Arquitectura lista |
| Historial | Versiones con duplicar, regenerar y restaurar | Listo |
| Auth | Usuario de desarrollo (`DEV_USER_*`); no hay signup/login real | Solo demos internas |

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, UI tipo shadcn
- **Backend:** NestJS, Clean Architecture (domain → application → infrastructure → presentation)
- **Datos:** PostgreSQL + Prisma
- **IA:** Factory multi-provider (`AI_CONTENT_PROVIDER` / `AI_IMAGE_PROVIDER`) con Gemini, Groq, Together, OpenAI y mock
- **Storage:** local MVP (S3-compatible preparado vía env)

## Estructura

```text
apps/
  api/     NestJS API (Clean Architecture)
  web/     Next.js 15 UI
prisma/    Schema compartido
```

## Requisitos

- Node.js 22+
- PostgreSQL
- Al menos una API key de IA (opcional; sin ella se usan generadores mock)

## Setup

```bash
cp .env.example .env
# Edita DATABASE_URL y, si quieres, GEMINI_API_KEY / TOGETHER_API_KEY / OPENAI_API_KEY

npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Health: `GET http://localhost:3001/health`

Auth en MVP: usuario de desarrollo (`DEV_USER_*` en `.env`). Se crea automáticamente al arrancar la API. **No apto para beta externa.**

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | API + Web |
| `npm run dev:api` | Solo API |
| `npm run dev:web` | Solo Web |
| `npm test` | Tests unitarios de casos de uso |
| `npm run smoke` | Smoke del flujo USAGE contra API local |
| `npm run build` | Build API + Web |
| `npm run prisma:migrate` | Migraciones |

## Arquitectura de publicación

Cada red social tiene un adaptador (`FacebookAdapter`, `InstagramAdapter`, …) detrás de `PublishAdapterRegistry`. En Fase 1 los adaptadores están **stubbeados a propósito**: `canPublish()` es false y la cola `PublishJob` queda en `PENDING`. No hay OAuth ni UI de publicación todavía.

WhatsApp Status: la API oficial de WhatsApp Business Platform no cubre Estados de la misma forma que posts; la publicación automática se evalúa aparte.

## Proveedores de IA

Por defecto `AI_*_PROVIDER=auto`:

1. Contenido: Gemini → Groq → OpenAI → mock
2. Imagen: Together (FLUX) → Gemini image → OpenAI → mock

Ver detalles y costes en [`docs/AI_GENERATORS_PROPOSAL.md`](docs/AI_GENERATORS_PROPOSAL.md).

## Fase 2 (próxima)

Sistema multiagente (Brand, Content, Image, SEO, Social, Analytics, Campaign, Trend, Planner) orquestado por un Director de Marketing Digital que decide qué publicar, cuándo, qué reciclar y qué presupuestos sugerir.
