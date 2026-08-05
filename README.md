# MarkeThing

SaaS de Marketing con Inteligencia Artificial. Evoluciona desde un generador de contenido (Fase 1) hacia un agente autónomo de marketing (Fase 2).

## Fase 1 — MVP

Configura la marca una vez, genera contenido e imágenes con IA, organiza un calendario editorial y deja lista la arquitectura de publicación por adaptadores.

### Capacidades

| Módulo | Qué hace |
|---|---|
| Empresas | Perfil de marca: giro, servicios, productos, colores, tono, CTAs, palabras prohibidas, redes |
| Base de conocimiento | Sube PDF, Word, imágenes, catálogos, FAQs y casos de éxito |
| Generación de contenido | Facebook, Instagram (post/carousel/story), Stories, WhatsApp Status, LinkedIn, X, Blog, Email, Promociones |
| Imágenes | Prompt + generación (OpenAI o mock offline) |
| Calendario | Vista mensual, programar, arrastrar, duplicar, eliminar |
| Publicación | Adaptadores desacoplados listos para Graph API / LinkedIn / X / WhatsApp |
| Historial | Versiones con duplicar, regenerar y restaurar |

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, UI tipo shadcn
- **Backend:** NestJS, Clean Architecture (domain → application → infrastructure → presentation)
- **Datos:** PostgreSQL + Prisma
- **IA:** OpenAI (contenido + imágenes) con fallback mock sin API key
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
- OpenAI API key (opcional; sin ella se usan generadores mock)

## Setup

```bash
cp .env.example .env
# Edita DATABASE_URL y, si quieres, OPENAI_API_KEY

npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Health: `GET http://localhost:3001/health`

Auth en MVP: usuario de desarrollo (`DEV_USER_*` en `.env`). Se crea automáticamente al arrancar la API.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | API + Web |
| `npm run dev:api` | Solo API |
| `npm run dev:web` | Solo Web |
| `npm test` | Tests unitarios de casos de uso |
| `npm run build` | Build API + Web |
| `npm run prisma:migrate` | Migraciones |

## Arquitectura de publicación

Cada red social tiene un adaptador (`FacebookAdapter`, `InstagramAdapter`, …) detrás de `PublishAdapterRegistry`. En Fase 1 los adaptadores están stubbeados a propósito: la cola `PublishJob` y el contrato están listos para conectar credenciales reales después.

WhatsApp Status: la API oficial de WhatsApp Business Platform no cubre Estados de la misma forma que posts; la publicación automática se evalúa aparte.

## Fase 2 (próxima)

Sistema multiagente (Brand, Content, Image, SEO, Social, Analytics, Campaign, Trend, Planner) orquestado por un Director de Marketing Digital que decide qué publicar, cuándo, qué reciclar y qué presupuestos sugerir.
