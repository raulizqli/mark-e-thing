// apps/api/src/domain/entities/company.entity.ts

export interface Company {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  industry: string | null;
  services: string[];
  products: string[];
  promotions: string[];
  city: string | null;
  website: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  socialX: string | null;
  socialWhatsapp: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  typography: string | null;
  targetAudience: string | null;
  toneOfVoice: string | null;
  forbiddenWords: string[];
  preferredCtas: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCompanyData = Pick<Company, 'userId' | 'name'> &
  Partial<
    Omit<Company, 'id' | 'userId' | 'name' | 'createdAt' | 'updatedAt'>
  >;

export type UpdateCompanyData = Partial<
  Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;
