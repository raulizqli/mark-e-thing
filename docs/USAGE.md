# MarkeThing — Guía de uso (Fase 1.5)

## Auth

- **Local / demos:** `AUTH_MODE=dev` + `NEXT_PUBLIC_AUTH_MODE=dev` (usuario `DEV_USER_*`).
- **Beta:** `AUTH_MODE=supabase` + keys `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_JWT_SECRET`. Login en `/login`, alta en `/signup`.

## Límites

- **Publicación:** LinkedIn, Facebook Pages, Instagram Business, X (tweets) y WhatsApp Cloud API (mensaje a destinatario; no Status oficial).
- **Cuotas free:** 50 contenidos y 20 imágenes / mes / usuario (configurable).
- **Storage:** local por defecto; S3 si `S3_BUCKET` + credenciales están definidos. Instagram/WhatsApp imagen necesitan URL pública.
- **Knowledge:** extracción de texto soportada para **TXT y PDF**. Otros formatos se guardan con marcador de extracción pendiente.

## Flujo recomendado

1. Abre http://localhost:3000 → **Comenzar gratis** / **Entrar**
2. Crea una **empresa** y completa el perfil de marca
3. Sube documentos TXT/PDF en **Base de conocimiento**
4. **Generar contenido** (+ imagen)
5. **Programar** en el calendario (arrastra para reprogramar; duplicar / eliminar desde el panel)
6. En **Conexiones**, conecta LinkedIn / Meta / X, o pega token de WhatsApp Cloud API
7. Desde el detalle de contenido → **Publicar** en la red deseada
8. Revisa **Historial** para duplicar / regenerar / restaurar

## Smoke local

```bash
npm run smoke
```

Con `AUTH_MODE=dev`, el smoke no necesita JWT. Recorre health → empresa → `/me` → knowledge TXT → generate → schedule → calendar → cleanup.

## API (resumen)

Todas las respuestas exitosas: `{ "success": true, "data": ... }`

| Método | Ruta |
|---|---|
| GET | `/health` |
| GET | `/me` |
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
| POST | `/companies/:id/calendar/:entryId/duplicate` |
| GET | `/companies/:id/connections` |
| GET | `/companies/:id/connections/linkedin/authorize` |
| GET | `/companies/:id/connections/meta/authorize` |
| GET | `/companies/:id/connections/x/authorize` |
| POST | `/companies/:id/connections/whatsapp` |
| DELETE | `/companies/:id/connections/:platform` |
| GET | `/oauth/linkedin/callback` |
| GET | `/oauth/meta/callback` |
| GET | `/oauth/x/callback` |
| POST | `/companies/:id/publish` |
| GET | `/companies/:id/publish/jobs` |

## Tipos de contenido

`FACEBOOK_POST`, `INSTAGRAM_POST`, `INSTAGRAM_CAROUSEL`, `INSTAGRAM_STORY`, `FACEBOOK_STORY`, `WHATSAPP_STATUS`, `LINKEDIN`, `X`, `BLOG`, `EMAIL`, `PROMOTION`
