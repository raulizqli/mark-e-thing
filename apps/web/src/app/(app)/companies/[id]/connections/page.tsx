// apps/web/src/app/(app)/companies/[id]/connections/page.tsx

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Company } from "@/lib/types";

interface ConnectionSummary {
  id: string;
  platform: string;
  displayName?: string | null;
  externalId?: string | null;
  connectedAt?: string | null;
  hasToken: boolean;
}

interface ConnectionsPayload {
  connections: ConnectionSummary[];
  linkedInConfigured: boolean;
  metaConfigured: boolean;
}

function ConnectionsInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [payload, setPayload] = useState<ConnectionsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(() => {
    const linkedin = search.get("linkedin");
    const meta = search.get("meta");
    if (linkedin === "connected") return "LinkedIn conectado correctamente.";
    if (meta === "connected") return "Facebook e Instagram conectados.";
    if (meta === "page_only") {
      return "Facebook Page conectada. No se encontró Instagram Business vinculado a la página.";
    }
    return null;
  });
  const [busy, setBusy] = useState(false);

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

  async function connect(provider: "linkedin" | "meta") {
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

  const linkedIn = payload?.connections.find((c) => c.platform === "LINKEDIN");
  const facebook = payload?.connections.find((c) => c.platform === "FACEBOOK");
  const instagram = payload?.connections.find((c) => c.platform === "INSTAGRAM");

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Conexiones</h1>
          <p className="mt-2 text-muted">
            Conecta redes para publicar desde MarkeThing. LinkedIn, Facebook Pages e Instagram
            Business están soportados.
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
              <p className="text-sm text-muted">Publica posts de texto en tu perfil.</p>
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
          {payload && !payload.linkedInConfigured && (
            <p className="text-xs text-muted">
              Configura `LINKEDIN_CLIENT_ID` y `LINKEDIN_CLIENT_SECRET` para habilitar OAuth.
            </p>
          )}
        </article>

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">Facebook + Instagram</h2>
              <p className="text-sm text-muted">
                Un solo OAuth de Meta conecta tu Facebook Page y, si existe, el Instagram Business
                vinculado.
              </p>
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

          {facebook?.displayName && (
            <p className="text-sm text-muted">Page: {facebook.displayName}</p>
          )}
          {instagram?.displayName && (
            <p className="text-sm text-muted">Instagram: {instagram.displayName}</p>
          )}

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
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => disconnect("FACEBOOK")}
                >
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

          {payload && !payload.metaConfigured && (
            <p className="text-xs text-muted">
              Configura `META_APP_ID` y `META_APP_SECRET`. Instagram requiere cuenta Business
              vinculada a la Page.
            </p>
          )}
        </article>

        <article className="glass-panel space-y-2 p-6">
          <h2 className="font-display text-lg text-ink">Próximamente</h2>
          <p className="text-sm text-muted">X y WhatsApp siguen con adapters stub (sin OAuth aún).</p>
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
