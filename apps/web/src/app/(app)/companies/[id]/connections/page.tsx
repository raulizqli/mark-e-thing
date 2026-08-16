// apps/web/src/app/(app)/companies/[id]/connections/page.tsx

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Company } from "@/lib/types";

interface ConnectionSummary {
  id: string;
  platform: string;
  displayName?: string | null;
  externalId?: string | null;
  connectedAt?: string | null;
  hasToken: boolean;
  defaultRecipient?: string | null;
}

interface ConnectionsPayload {
  connections: ConnectionSummary[];
  linkedInConfigured: boolean;
  metaConfigured: boolean;
  xConfigured: boolean;
  whatsappConfigured: boolean;
}

function ConnectionsInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [payload, setPayload] = useState<ConnectionsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(() => {
    if (search.get("linkedin") === "connected") return "LinkedIn conectado correctamente.";
    if (search.get("x") === "connected") return "X conectado correctamente.";
    const meta = search.get("meta");
    if (meta === "connected") return "Facebook e Instagram conectados.";
    if (meta === "page_only") {
      return "Facebook Page conectada. No se encontró Instagram Business vinculado a la página.";
    }
    return null;
  });
  const [busy, setBusy] = useState(false);
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waRecipient, setWaRecipient] = useState("");
  const [waName, setWaName] = useState("");

  async function load() {
    const [companyData, connections] = await Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      api.get<ConnectionsPayload>(`/companies/${params.id}/connections`),
    ]);
    setCompany(companyData);
    setPayload(connections);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"));
  }, [params.id]);

  async function connect(provider: "linkedin" | "meta" | "x") {
    setBusy(true);
    setError(null);
    try {
      const data = await api.get<{ url: string }>(
        `/companies/${params.id}/connections/${provider}/authorize`,
      );
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo iniciar OAuth de ${provider}`);
      setBusy(false);
    }
  }

  async function disconnect(platform: string) {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/companies/${params.id}/connections/${platform}`);
      await load();
      setNotice(`${platform} desconectado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desconectar");
    } finally {
      setBusy(false);
    }
  }

  async function connectWhatsApp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/companies/${params.id}/connections/whatsapp`, {
        accessToken: waToken,
        phoneNumberId: waPhoneId,
        defaultRecipient: waRecipient,
        displayName: waName || undefined,
      });
      setWaToken("");
      setWaPhoneId("");
      setWaRecipient("");
      setWaName("");
      await load();
      setNotice("WhatsApp Cloud API conectado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar WhatsApp");
    } finally {
      setBusy(false);
    }
  }

  const linkedIn = payload?.connections.find((c) => c.platform === "LINKEDIN");
  const facebook = payload?.connections.find((c) => c.platform === "FACEBOOK");
  const instagram = payload?.connections.find((c) => c.platform === "INSTAGRAM");
  const x = payload?.connections.find((c) => c.platform === "X");
  const whatsapp = payload?.connections.find((c) => c.platform === "WHATSAPP");

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Conexiones</h1>
          <p className="mt-2 text-muted">
            Conecta redes para publicar: LinkedIn, Meta (FB/IG), X y WhatsApp Cloud API.
          </p>
        </div>

        {notice && (
          <div className="rounded-xl border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">LinkedIn</h2>
              <p className="text-sm text-muted">Posts de texto en tu perfil.</p>
            </div>
            <Badge variant={linkedIn?.hasToken ? "teal" : "outline"}>
              {linkedIn?.hasToken ? "Conectado" : "No conectado"}
            </Badge>
          </div>
          {linkedIn?.displayName && (
            <p className="text-sm text-muted">Cuenta: {linkedIn.displayName}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {!linkedIn?.hasToken ? (
              <Button
                type="button"
                disabled={busy || !payload?.linkedInConfigured}
                onClick={() => connect("linkedin")}
              >
                <Link2 className="h-4 w-4" />
                Conectar LinkedIn
              </Button>
            ) : (
              <Button type="button" variant="ghost" disabled={busy} onClick={() => disconnect("LINKEDIN")}>
                Desconectar
              </Button>
            )}
          </div>
        </article>

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">Facebook + Instagram</h2>
              <p className="text-sm text-muted">OAuth Meta → Page + Instagram Business vinculado.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={facebook?.hasToken ? "teal" : "outline"}>
                FB {facebook?.hasToken ? "OK" : "—"}
              </Badge>
              <Badge variant={instagram?.hasToken ? "teal" : "outline"}>
                IG {instagram?.hasToken ? "OK" : "—"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!facebook?.hasToken ? (
              <Button
                type="button"
                disabled={busy || !payload?.metaConfigured}
                onClick={() => connect("meta")}
              >
                <Link2 className="h-4 w-4" />
                Conectar Meta
              </Button>
            ) : (
              <>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => disconnect("FACEBOOK")}>
                  Desconectar Facebook
                </Button>
                {instagram?.hasToken && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => disconnect("INSTAGRAM")}
                  >
                    Desconectar Instagram
                  </Button>
                )}
              </>
            )}
          </div>
        </article>

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">X</h2>
              <p className="text-sm text-muted">Publica tweets (texto truncado a 280 caracteres).</p>
            </div>
            <Badge variant={x?.hasToken ? "teal" : "outline"}>
              {x?.hasToken ? "Conectado" : "No conectado"}
            </Badge>
          </div>
          {x?.displayName && <p className="text-sm text-muted">Cuenta: {x.displayName}</p>}
          <div className="flex flex-wrap gap-2">
            {!x?.hasToken ? (
              <Button
                type="button"
                disabled={busy || !payload?.xConfigured}
                onClick={() => connect("x")}
              >
                <Link2 className="h-4 w-4" />
                Conectar X
              </Button>
            ) : (
              <Button type="button" variant="ghost" disabled={busy} onClick={() => disconnect("X")}>
                Desconectar
              </Button>
            )}
          </div>
          {payload && !payload.xConfigured && (
            <p className="text-xs text-muted">
              Configura `X_CLIENT_ID` y `X_CLIENT_SECRET` (app con OAuth 2.0 PKCE).
            </p>
          )}
        </article>

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">WhatsApp</h2>
              <p className="text-sm text-muted">
                Cloud API: envía mensaje de texto/imagen a un destinatario. No publica Status oficial.
              </p>
            </div>
            <Badge variant={whatsapp?.hasToken ? "teal" : "outline"}>
              {whatsapp?.hasToken ? "Conectado" : "No conectado"}
            </Badge>
          </div>

          {whatsapp?.hasToken ? (
            <>
              <p className="text-sm text-muted">
                Phone number id: {whatsapp.externalId}
                {whatsapp.defaultRecipient ? ` · Destino: ${whatsapp.defaultRecipient}` : ""}
              </p>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => disconnect("WHATSAPP")}>
                Desconectar
              </Button>
            </>
          ) : (
            <form onSubmit={connectWhatsApp} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="wa-token">Access token (permanente / system user)</Label>
                <Input
                  id="wa-token"
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-phone">Phone number ID</Label>
                <Input
                  id="wa-phone"
                  value={waPhoneId}
                  onChange={(e) => setWaPhoneId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-recipient">Destinatario E.164</Label>
                <Input
                  id="wa-recipient"
                  placeholder="5215512345678"
                  value={waRecipient}
                  onChange={(e) => setWaRecipient(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="wa-name">Nombre (opcional)</Label>
                <Input id="wa-name" value={waName} onChange={(e) => setWaName(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy}>
                  Guardar WhatsApp
                </Button>
              </div>
            </form>
          )}
        </article>
      </div>
    </AppShell>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Cargando conexiones…</div>}>
      <ConnectionsInner />
    </Suspense>
  );
}
