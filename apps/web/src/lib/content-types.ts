import type { ContentType } from "./types";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  FACEBOOK_POST: "Publicación de Facebook",
  INSTAGRAM_POST: "Publicación de Instagram",
  INSTAGRAM_CAROUSEL: "Carrusel de Instagram",
  INSTAGRAM_STORY: "Historia de Instagram",
  FACEBOOK_STORY: "Historia de Facebook",
  WHATSAPP_STATUS: "Estado de WhatsApp",
  LINKEDIN: "Publicación de LinkedIn",
  X: "Publicación de X",
  BLOG: "Artículo de blog",
  EMAIL: "Correo electrónico",
  PROMOTION: "Promoción",
};

export const CONTENT_TYPE_OPTIONS = (
  Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]
).map(([value, label]) => ({ value, label }));

export const KNOWLEDGE_TYPE_LABELS = {
  PDF: "PDF",
  WORD: "Word",
  IMAGE: "Imagen",
  CATALOG: "Catálogo",
  MANUAL: "Manual",
  FAQ: "Preguntas frecuentes",
  SUCCESS_CASE: "Caso de éxito",
  OTHER: "Otro",
} as const;

export const CONTENT_STATUS_LABELS = {
  DRAFT: "Borrador",
  SCHEDULED: "Programado",
  PUBLISHED: "Publicado",
  FAILED: "Fallido",
  ARCHIVED: "Archivado",
} as const;
