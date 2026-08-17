// apps/web/src/app/companies/[id]/content/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ContentCard } from "@/components/content/content-card";
import { api } from "@/lib/api";
import type { Company, Content } from "@/lib/types";

export default function ContentHistoryPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  async function loadData() {
    const [companyData, contentList] = await Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      api.get<Content[]>(`/companies/${params.id}/content`),
    ]);
    setCompany(companyData);
    setContents(contentList);
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDuplicate(contentId: string) {
    try {
      await api.post(`/companies/${params.id}/content/${contentId}/duplicate`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al duplicar");
    }
  }

  async function handleRegenerate(contentId: string) {
    try {
      await api.post(`/companies/${params.id}/content/${contentId}/regenerate`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al regenerar");
    }
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Historial de contenido</h1>
          <p className="mt-2 text-muted">
            Revisa todo el contenido generado para tu marca.
          </p>
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

        {loading ? (
          <p className="text-muted">Cargando contenido…</p>
        ) : contents.length === 0 ? (
          <div className="glass-panel p-8 text-center text-muted">
            Aún no hay contenido generado.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                companyId={params.id}
                onDuplicate={handleDuplicate}
                onRegenerate={handleRegenerate}
                onScheduled={async () => {
                  setScheduleNotice("Contenido programado en el calendario.");
                  await loadData();
                }}
                onScheduleError={setError}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
