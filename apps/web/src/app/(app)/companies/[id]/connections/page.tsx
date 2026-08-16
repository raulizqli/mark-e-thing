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
}

function ConnectionsInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [payload, setPayload] = useState<ConnectionsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    search.get("linkedin") === "connected" ? "LinkedIn conectado correctamente." : null,
  );
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

  async function connectLinkedIn() {
    setBusy(true);
    setError(null);
    try {
      const data = await api.get<{ url: string }>(
        `/companies/${params.id}/connections/linkedin/authorize`,
      );
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar OAuth de LinkedIn");
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

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Conexiones</h1>
          <p className="mt-2 text-muted">
            Conecta redes para publicar desde MarkeThing. En Fase 1.5, LinkedIn es la primera red
            con publicación real.
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
              <Button type="button" disabled={busy || !payload?.linkedInConfigured} onClick={connectLinkedIn}>
                <Link2 className="h-4 w-4" />
                Conectar LinkedIn
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => disconnect("LINKEDIN")}
              >
                Desconectar
              </Button>
            )}
          </div>

          {payload && !payload.linkedInConfigured && (
            <p className="text-xs text-muted">
              Configura `LINKEDIN_CLIENT_ID` y `LINKEDIN_CLIENT_SECRET` en el entorno de la API para
              habilitar OAuth.
            </p>
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
