# Plan: Multi-IA + Fase 2 (Agente de Marketing)

Este documento define el trabajo **antes y durante** la Fase 2: soporte multi-proveedor de IA y el sistema multiagente de Director de Marketing Digital.

---

## Parte A — Multi-proveedor de IA

### Objetivo

Elegir IA por **capacidad** (copy, imagen, SEO, embeddings, razonamiento de agentes) y por **empresa**, con fallback, sin acoplar casos de uso ni UI a un vendor.

### Estado actual (Fase 1)

- Puertos: `ContentGeneratorPort`, `ImageGeneratorPort`
- Factory binaria: OpenAI **o** Mock
- Imágenes ya persisten `model`

### Arquitectura objetivo

```text
Use case / Agent
  → AiGateway
      → ProviderRegistry (openai | anthropic | gemini | mock)
      → AiPolicy (env → workspace → company → request)
      → Fallback + usage metadata
```

### Capacidades (`AiCapability`)

| Capability | Uso |
|---|---|
| `content` | Posts, emails, blogs, CTAs |
| `image` | Generación visual |
| `seo` | Keywords, meta, scoring |
| `reasoning` | Decisiones de agentes / orquestador |
| `embeddings` | (futuro) RAG sobre knowledge base |

### Resolución de proveedor

1. Override en request  
2. `CompanyAiSettings`  
3. Defaults de entorno (`AI_CONTENT_PROVIDER`, `AI_IMAGE_PROVIDER`, …)  
4. Mock si no hay keys

### Variables de entorno

```bash
AI_CONTENT_PROVIDER=openai
AI_CONTENT_MODEL=gpt-4o-mini
AI_IMAGE_PROVIDER=openai
AI_IMAGE_MODEL=dall-e-3
AI_REASONING_PROVIDER=openai
AI_REASONING_MODEL=gpt-4o-mini
AI_FALLBACK_PROVIDER=anthropic

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
```

### Orden de implementación Multi-IA

1. Registry + metadata (`provider`, `model`, `latencyMs`, `usage`)
2. Proveedores content: OpenAI, Anthropic, Gemini, Mock
3. AiGateway + fallback
4. Settings por empresa (API + UI mínima)
5. Segundo proveedor de imagen
6. Reutilizar gateway en todos los agentes de Fase 2

### Fuera de alcance inmediato

- LangChain/CrewAI como dependencia core
- Billing por tokens
- Un solo port genérico text+image

---

## Parte B — Fase 2: Agente de Marketing IA

### Objetivo

Un **Director de Marketing Digital** multiagente que analiza rendimiento (o señales mock hasta conectar APIs), decide qué publicar / cuándo / en qué formato, y propone campañas, embudos y presupuestos.

### Agentes

| Agente | Responsabilidad |
|---|---|
| Brand Agent | Coherencia de marca, tono, forbidden words |
| Content Agent | Qué piezas crear / reciclar |
| Image Agent | Briefs visuales y generación |
| SEO Agent | Keywords, ángulos orgánicos |
| Social Media Agent | Formato y red óptima |
| Analytics Agent | Alcance, likes, comentarios, horarios |
| Campaign Agent | Repetir / pausar / presupuestos |
| Trend Agent | Tendencias, eventos, competencia |
| Planner Agent | Calendario mensual y secuencias |
| **Orchestrator** | Coordina flujo y consolida decisiones |

### Flujo del orquestador

```text
1. Analytics + Trend  (señales)
2. Brand              (constraints)
3. Campaign + Planner (estrategia)
4. Content + SEO + Social + Image (ejecución sugerida)
5. Orchestrator       (plan consolidado + recomendaciones)
```

### Persistencia

- `AgentRun` — ejecución del orquestador
- `AgentStep` — salida por agente
- `Recommendation` — acciones sugeridas (publicar, programar, reciclar, presupuesto…)
- `MetricsSnapshot` — métricas importadas o mock
- `CompanyAiSettings` — preferencias multi-IA

### Integración con Fase 1

- Lee `Company`, `Content`, `CalendarEntry`, knowledge
- Puede **crear borradores** de contenido / entradas de calendario a partir de recomendaciones aceptadas
- Publicación sigue vía adaptadores (stubs hasta Graph API)

### Entregables de esta iteración

- [x] Documento de plan (este archivo)
- [x] AiGateway multi-proveedor
- [x] Schema Prisma Fase 2
- [x] Agentes + Orchestrator
- [x] API `POST /companies/:id/agent/run`, listado de runs/recommendations
- [x] UI básica “Agente IA”
- [x] Tests del orquestador y gateway
### Fase 2+ (posterior)

- Ingesta real de métricas (Graph API insights)
- Aceptar/rechazar recomendaciones desde UI
- n8n webhooks para automatizar ejecución
- Embeddings + RAG sobre knowledge base
