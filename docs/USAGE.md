# MarkeThing — Guía de uso (Fase 1.5)

## Auth

- **Local / demos:** `AUTH_MODE=dev` + `NEXT_PUBLIC_AUTH_MODE=dev` (usuario `DEV_USER_*`).
- **Beta:** `AUTH_MODE=supabase` + keys `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_JWT_SECRET`. Login en `/login`, alta en `/signup`.

## Límites

- **Publicación:** LinkedIn es la primera red con OAuth + adapter real. Otras redes siguen stubbeadas.
- **Cuotas free:** 50 contenidos y 20 imágenes / mes / usuario (configurable).
- **Storage:** local por defecto; S3 si `S3_BUCKET` + credenciales están definidos.

## Flujo recomendado

1. Abre http://localhost:3000 → **Comenzar gratis** / **Entrar**
2. Crea una **empresa** y completa el perfil de marca
3. Sube documentos TXT/PDF en **Base de conocimiento**
4. **Generar contenido** (+ imagen)
5. **Programar** en el calendario
6. En **Conexiones**, conecta LinkedIn (si hay client id/secret)
7. Desde el detalle de contenido → **Publicar en LinkedIn**
8. Revisa **Historial** para duplicar / regenerar / restaurar

## Smoke local

```bash
npm run smoke
```

Con `AUTH_MODE=dev`, el smoke no necesita JWT.

## API (nuevas rutas Fase 1.5)

| Método | Ruta |
|---|---|
| GET | `/me` |
| GET | `/companies/:id/connections` |
| GET | `/companies/:id/connections/linkedin/authorize` |
| DELETE | `/companies/:id/connections/:platform` |
| GET | `/oauth/linkedin/callback` |
