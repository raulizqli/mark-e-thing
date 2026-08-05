// apps/api/src/application/dto/company.dto.ts

export interface CreateCompanyInput {
  name: string;
  description?: string | null;
  industry?: string | null;
  services?: string[];
  products?: string[];
  promotions?: string[];
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
  forbiddenWords?: string[];
  preferredCtas?: string[];
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string | null;
  industry?: string | null;
  services?: string[];
  products?: string[];
  promotions?: string[];
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
  forbiddenWords?: string[];
  preferredCtas?: string[];
}
