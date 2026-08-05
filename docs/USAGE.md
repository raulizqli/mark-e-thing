# MarkeThing — Guía de uso (Fase 1)

## Flujo recomendado

1. Abre http://localhost:3000 → **Empezar**
2. Crea una **empresa** y completa el perfil de marca
3. Sube documentos en **Base de conocimiento**
4. Ve a **Generar contenido**, elige formatos y genera
5. Genera imagen a partir del prompt
6. Programa en el **Calendario** (arrastra para reprogramar)
7. Revisa **Historial** para duplicar / regenerar / restaurar versiones

## API (resumen)

Todas las respuestas exitosas: `{ "success": true, "data": ... }`

| Método | Ruta |
|---|---|
| GET | `/health` |
| GET/POST | `/companies` |
| GET/PATCH/DELETE | `/companies/:id` |
| GET/POST | `/companies/:id/knowledge` |
| DELETE | `/companies/:id/knowledge/:docId` |
| POST | `/companies/:id/content/generate` body `{ type, topic? }` |
| GET | `/companies/:id/content` |
| GET/PATCH | `/companies/:id/content/:contentId` |
| POST | `/companies/:id/content/:contentId/duplicate` |
| POST | `/companies/:id/content/:contentId/regenerate` |
| GET | `/companies/:id/content/:contentId/versions` |
| POST | `/companies/:id/content/:contentId/versions/:version/restore` |
| POST | `/companies/:id/images/generate` body `{ prompt, contentId? }` |
| GET | `/companies/:id/calendar?month=YYYY-MM` |
| POST | `/companies/:id/calendar` body `{ contentId, scheduledAt }` |
| PATCH/DELETE | `/companies/:id/calendar/:entryId` |
| POST | `/companies/:id/publish` |
| GET | `/companies/:id/publish/jobs` |

## Fase 2 — Agente de Marketing

| Método | Ruta |
|---|---|
| POST | `/companies/:id/agent/run` body `{ goal? }` |
| GET | `/companies/:id/agent/runs` |
| GET | `/companies/:id/agent/runs/:runId` |
| GET | `/companies/:id/recommendations` |
| PATCH | `/companies/:id/recommendations/:id` body `{ status }` |
| GET/PUT | `/companies/:id/ai-settings` |

UI: `/companies/:id/agent`

Orquestador: Analytics → Trend → Brand → Campaign → Planner → Content → SEO → Social → Image.

Multi-IA: ver `docs/PHASE2_MULTI_AI_PLAN.md`. Variables `AI_*_PROVIDER`, `AI_FALLBACK_PROVIDER`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`.
