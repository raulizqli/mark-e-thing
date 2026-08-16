"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { ScheduleContentControl } from "@/components/calendar/schedule-content-control";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CONTENT_STATUS_LABELS, CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { Company, ContentWithVersions } from "@/lib/types";

export default function ContentDetailPage() {
  const params = useParams<{ id: string; contentId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [content, setContent] = useState<ContentWithVersions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  async function loadData() {
    const [companyData, payload] = await Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      api.get<{ content: ContentWithVersions; versions: ContentWithVersions["versions"] }>(
        `/companies/${params.id}/content/${params.contentId}`,
      ),
    ]);
    setCompany(companyData);
    setContent({
      ...payload.content,
      versions: payload.versions ?? [],
    });
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [params.id, params.contentId]);

  async function handleRestore(version: number) {
    setRestoring(version);
    try {
      await api.post(
        `/companies/${params.id}/content/${params.contentId}/versions/${version}/restore`,
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restaurar versión");
    } finally {
      setRestoring(null);
    }
  }

  if (loading) {
    return (
      <AppShell companyId={params.id} companyName={company?.name}>
        <p className="text-muted">Cargando contenido…</p>
      </AppShell>
    );
  }

  if (!content) {
    return (
      <AppShell companyId={params.id} companyName={company?.name}>
        <p className="text-muted">No se encontró el contenido.</p>
      </AppShell>
    );
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <Link
            href={`/companies/${params.id}/content`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al historial
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="teal">{CONTENT_TYPE_LABELS[content.type]}</Badge>
            <Badge variant="outline">{CONTENT_STATUS_LABELS[content.status]}</Badge>
            <Badge variant="sand">v{content.currentVersion}</Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl text-ink">{content.title}</h1>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {scheduleNotice && (
          <div className="rounded-xl border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal">
            {scheduleNotice}
          </div>
        )}

        <article className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ScheduleContentControl
              companyId={params.id}
              contentId={content.id}
              size="md"
              onScheduled={async () => {
                setScheduleNotice("Contenido programado en el calendario.");
                await loadData();
              }}
              onError={setError}
            />
          </div>

          <p className="whitespace-pre-wrap text-muted">{content.copy}</p>

          {content.cta && (
            <p className="text-sm">
              <span className="font-medium text-ink">CTA:</span>{" "}
              <span className="text-teal">{content.cta}</span>
            </p>
          )}

          {content.emojis.length > 0 && (
            <p className="text-lg">{content.emojis.join(" ")}</p>
          )}

          {content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.hashtags.map((tag) => (
                <span key={tag} className="text-sm text-teal">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {content.imagePrompt && (
            <div className="rounded-xl bg-ink/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Prompt de imagen
              </p>
              <p className="mt-1 text-sm">{content.imagePrompt}</p>
            </div>
          )}

          {content.image?.url && (
            <img
              src={content.image.url}
              alt="Imagen del contenido"
              className="max-h-80 rounded-xl object-cover"
            />
          )}

          {content.seoKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.seoKeywords.map((kw) => (
                <Badge key={kw} variant="sand">
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {content.versions && content.versions.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Historial de versiones</h2>
            <ul className="space-y-3">
              {[...content.versions]
                .sort((a, b) => b.version - a.version)
                .map((version) => (
                  <li key={version.id} className="glass-panel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">
                          Versión {version.version}
                          {version.version === content.currentVersion && (
                            <Badge variant="teal" className="ml-2">
                              Actual
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted">{version.title}</p>
                        <time className="text-xs text-muted">
                          {format(new Date(version.createdAt), "d MMM yyyy HH:mm", {
                            locale: es,
                          })}
                        </time>
                      </div>
                      {version.version !== content.currentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={restoring === version.version}
                          onClick={() => handleRestore(version.version)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          {restoring === version.version ? "Restaurando…" : "Restaurar"}
                        </Button>
                      )}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-muted">{version.copy}</p>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
