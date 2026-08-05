"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Company, CreateCompanyInput, UpdateCompanyInput } from "@/lib/types";

interface CompanyFormProps {
  initial?: Partial<Company>;
  onSubmit: (data: CreateCompanyInput | UpdateCompanyInput) => Promise<void>;
  submitLabel?: string;
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinList(items?: string[]): string {
  return items?.join(", ") ?? "";
}

export function CompanyForm({
  initial,
  onSubmit,
  submitLabel = "Guardar",
}: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [services, setServices] = useState(joinList(initial?.services));
  const [products, setProducts] = useState(joinList(initial?.products));
  const [promotions, setPromotions] = useState(joinList(initial?.promotions));
  const [city, setCity] = useState(initial?.city ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [socialFacebook, setSocialFacebook] = useState(initial?.socialFacebook ?? "");
  const [socialInstagram, setSocialInstagram] = useState(initial?.socialInstagram ?? "");
  const [socialLinkedin, setSocialLinkedin] = useState(initial?.socialLinkedin ?? "");
  const [socialX, setSocialX] = useState(initial?.socialX ?? "");
  const [socialWhatsapp, setSocialWhatsapp] = useState(initial?.socialWhatsapp ?? "");
  const [primaryColor, setPrimaryColor] = useState(initial?.primaryColor ?? "#0F766E");
  const [secondaryColor, setSecondaryColor] = useState(initial?.secondaryColor ?? "#0B3D3A");
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? "#E8D5B7");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [typography, setTypography] = useState(initial?.typography ?? "");
  const [targetAudience, setTargetAudience] = useState(initial?.targetAudience ?? "");
  const [toneOfVoice, setToneOfVoice] = useState(initial?.toneOfVoice ?? "");
  const [forbiddenWords, setForbiddenWords] = useState(joinList(initial?.forbiddenWords));
  const [preferredCtas, setPreferredCtas] = useState(joinList(initial?.preferredCtas));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        name,
        description: description || undefined,
        industry: industry || undefined,
        services: parseList(services),
        products: parseList(products),
        promotions: parseList(promotions),
        city: city || undefined,
        website: website || undefined,
        socialFacebook: socialFacebook || undefined,
        socialInstagram: socialInstagram || undefined,
        socialLinkedin: socialLinkedin || undefined,
        socialX: socialX || undefined,
        socialWhatsapp: socialWhatsapp || undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        logoUrl: logoUrl || undefined,
        typography: typography || undefined,
        targetAudience: targetAudience || undefined,
        toneOfVoice: toneOfVoice || undefined,
        forbiddenWords: parseList(forbiddenWords),
        preferredCtas: parseList(preferredCtas),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Información general</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre de la empresa *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿A qué se dedica tu negocio?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Giro / industria</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="services">Servicios (separados por coma)</Label>
            <Input id="services" value={services} onChange={(e) => setServices(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="products">Productos (separados por coma)</Label>
            <Input id="products" value={products} onChange={(e) => setProducts(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="promotions">Promociones (separadas por coma)</Label>
            <Input id="promotions" value={promotions} onChange={(e) => setPromotions(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Presencia digital</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input id="socialFacebook" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input id="socialInstagram" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialLinkedin">LinkedIn</Label>
            <Input id="socialLinkedin" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialX">X (Twitter)</Label>
            <Input id="socialX" value={socialX} onChange={(e) => setSocialX(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialWhatsapp">WhatsApp</Label>
            <Input id="socialWhatsapp" value={socialWhatsapp} onChange={(e) => setSocialWhatsapp(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Identidad visual</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Color primario</Label>
            <div className="flex gap-2">
              <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 p-1" />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Color secundario</Label>
            <div className="flex gap-2">
              <Input id="secondaryColor" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-14 p-1" />
              <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Color de acento</Label>
            <div className="flex gap-2">
              <Input id="accentColor" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 w-14 p-1" />
              <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del logo</Label>
            <Input id="logoUrl" type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="typography">Tipografía preferida</Label>
            <Input id="typography" value={typography} onChange={(e) => setTypography(e.target.value)} placeholder="Ej: Sora, Montserrat" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink">Voz de marca</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="targetAudience">Audiencia objetivo</Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="¿A quién le hablas?"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="toneOfVoice">Tono de voz</Label>
            <Textarea
              id="toneOfVoice"
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
              placeholder="Ej: cercano, profesional, divertido"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="forbiddenWords">Palabras prohibidas (separadas por coma)</Label>
            <Input id="forbiddenWords" value={forbiddenWords} onChange={(e) => setForbiddenWords(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="preferredCtas">CTAs preferidos (separados por coma)</Label>
            <Input id="preferredCtas" value={preferredCtas} onChange={(e) => setPreferredCtas(e.target.value)} placeholder="Ej: Escríbenos, Compra ahora" />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
