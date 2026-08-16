# MarkeThing — Guía de uso (Fase 1)

## Límites del MVP

- **Auth:** usuario de desarrollo (`DEV_USER_*`). No hay login real.
- **Publicación:** `POST /companies/:id/publish` encola jobs, pero los adapters están stubbeados (`PLATFORM_NOT_CONFIGURED`). No se publica en redes.
- **Knowledge:** extracción de texto soportada para **TXT y PDF**. Otros formatos se guardan con marcador de extracción pendiente.

## Flujo recomendado

1. Abre http://localhost:3000 → **Empezar**
2. Crea una **empresa** y completa el perfil de marca
3. Sube documentos TXT/PDF en **Base de conocimiento**
4. Ve a **Generar contenido**, elige formatos y genera
5. Genera imagen a partir del prompt
6. Pulsa **Programar** en el resultado (o desde Historial / detalle) para crear la entrada en el **Calendario**
7. En el calendario: arrastra para reprogramar, o abre una entrada para **duplicar** / **eliminar**
8. Revisa **Historial** para duplicar / regenerar / restaurar versiones

## Smoke local

Con la API en marcha (`npm run dev:api`) y `DATABASE_URL` configurada:

```bash
npm run smoke
```

El script recorre health → empresa → knowledge TXT → generate → schedule → calendar list → delete entry.

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
| POST | `/companies/:id/calendar/:entryId/duplicate` |
| POST | `/companies/:id/publish` |
| GET | `/companies/:id/publish/jobs` |

## Tipos de contenido

`FACEBOOK_POST`, `INSTAGRAM_POST`, `INSTAGRAM_CAROUSEL`, `INSTAGRAM_STORY`, `FACEBOOK_STORY`, `WHATSAPP_STATUS`, `LINKEDIN`, `X`, `BLOG`, `EMAIL`, `PROMOTION`
