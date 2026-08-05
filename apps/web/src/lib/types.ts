export type ContentType =
  | "FACEBOOK_POST"
  | "INSTAGRAM_POST"
  | "INSTAGRAM_CAROUSEL"
  | "INSTAGRAM_STORY"
  | "FACEBOOK_STORY"
  | "WHATSAPP_STATUS"
  | "LINKEDIN"
  | "X"
  | "BLOG"
  | "EMAIL"
  | "PROMOTION";

export type ContentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED"
  | "ARCHIVED";

export type KnowledgeType =
  | "PDF"
  | "WORD"
  | "IMAGE"
  | "CATALOG"
  | "MANUAL"
  | "FAQ"
  | "SUCCESS_CASE"
  | "OTHER";

export interface Company {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  industry?: string | null;
  services: string[];
  products: string[];
  promotions: string[];
  city?: string | null;
  website?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialLinkedin?: string | null;
  socialX?: string | null;
  socialWhatsapp?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  typography?: string | null;
  targetAudience?: string | null;
  toneOfVoice?: string | null;
  forbiddenWords: string[];
  preferredCtas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  description?: string;
  industry?: string;
  services?: string[];
  products?: string[];
  promotions?: string[];
  city?: string;
  website?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialX?: string;
  socialWhatsapp?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  typography?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  forbiddenWords?: string[];
  preferredCtas?: string[];
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export interface KnowledgeDocument {
  id: string;
  companyId: string;
  title: string;
  type: KnowledgeType;
  fileName: string;
  mimeType: string;
  storageKey: string;
  storageUrl?: string | null;
  extractedText?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  companyId: string;
  prompt: string;
  storageKey?: string | null;
  url?: string | null;
  model: string;
  createdAt: string;
}

export interface Content {
  id: string;
  companyId: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  copy: string;
  cta?: string | null;
  emojis: string[];
  hashtags: string[];
  imagePrompt?: string | null;
  seoKeywords: string[];
  currentVersion: number;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  imageId?: string | null;
  image?: GeneratedImage | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  copy: string;
  cta?: string | null;
  emojis: string[];
  hashtags: string[];
  imagePrompt?: string | null;
  seoKeywords: string[];
  snapshot?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ContentWithVersions extends Content {
  versions: ContentVersion[];
}

export interface CalendarEntry {
  id: string;
  companyId: string;
  contentId: string;
  scheduledAt: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  content?: Content;
}

export interface GenerateContentInput {
  types: ContentType[];
  topic?: string;
}

export interface GenerateContentResult {
  type: ContentType;
  title: string;
  copy: string;
  cta?: string;
  emojis: string[];
  hashtags: string[];
  imagePrompt?: string;
  seoKeywords: string[];
}

export interface GenerateImageInput {
  prompt: string;
  contentId?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
