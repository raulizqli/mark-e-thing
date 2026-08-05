"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Loader2, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import type {
  AgentRun,
  Company,
  CompanyAiSettings,
  Recommendation,
  RecommendationStatus,
} from "@/lib/types";

const PROVIDERS = ["openai", "anthropic", "gemini", "mock"] as const;

const TYPE_LABELS: Record<string, string> = {
  PUBLISH: "Publicar",
  SCHEDULE: "Programar",
  RECYCLE: "Reciclar",
  CREATE_CONTENT: "Crear contenido",
  PAUSE_CAMPAIGN: "Pausar campaña",
  REPEAT_CAMPAIGN: "Repetir campaña",
  CREATE_PROMOTION: "Crear promoción",
  TARGET_AUDIENCE: "Audiencia",
  AD_BUDGET: "Presupuesto ads",
  FUNNEL: "Embudo",
  MONTHLY_PLAN: "Plan mensual",
  OTHER: "Otro",
};

export default function AgentPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [settings, setSettings] = useState<Partial<CompanyAiSettings>>({});
  const [goal, setGoal] = useState("monthly_plan");
  const [running, setRunning] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [companyData, runsData, recs, aiSettings] = await Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      api.get<AgentRun[]>(`/companies/${params.id}/agent/runs`),
      api.get<Recommendation[]>(`/companies/${params.id}/recommendations`),
      api.get<CompanyAiSettings | null>(`/companies/${params.id}/ai-settings`),
    ]);
    setCompany(companyData);
    setRuns(runsData);
    setRecommendations(recs);
    if (aiSettings) setSettings(aiSettings);
  }, [params.id]);

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [load]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      const run = await api.post<AgentRun>(`/companies/${params.id}/agent/run`, {
        goal: goal || undefined,
      });
      setSelectedRun(run);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar el agente");
    } finally {
      setRunning(false);
    }
  }

  async function openRun(runId: string) {
    try {
      const run = await api.get<AgentRun>(
        `/companies/${params.id}/agent/runs/${runId}`,
      );
      setSelectedRun(run);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el run");
    }
  }

  async function updateRec(id: string, status: RecommendationStatus) {
    try {
      await api.patch(`/companies/${params.id}/recommendations/${id}`, { status });
      await load();
      if (selectedRun) await openRun(selectedRun.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    try {
      const updated = await api.put<CompanyAiSettings>(
        `/companies/${params.id}/ai-settings`,
        {
          contentProvider: settings.contentProvider || null,
          contentModel: settings.contentModel || null,
          imageProvider: settings.imageProvider || null,
          imageModel: settings.imageModel || null,
          reasoningProvider: settings.reasoningProvider || null,
          reasoningModel: settings.reasoningModel || null,
        },
      );
      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar settings");
    } finally {
      setSavingSettings(false);
    }
  }

  const pendingRecs = recommendations.filter((r) => r.status === "PENDING");

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Agente de Marketing IA</h1>
          <p className="mt-2 text-muted">
            El Director Digital coordina 9 agentes para analizar señales, proponer campañas
            y decidir qué publicar.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="glass-panel space-y-4 p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1 space-y-2">
              <Label htmlFor="goal">Objetivo</Label>
              <Input
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="monthly_plan"
              />
            </div>
            <Button onClick={handleRun} disabled={running || loading}>
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              {running ? "Ejecutando…" : "Ejecutar orquestador"}
            </Button>
          </div>
        </section>

        <section className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-xl text-ink">Proveedores de IA</h2>
          <p className="text-sm text-muted">
            Configura qué modelo usar para copy, imagen y razonamiento de agentes.
          </p>
          <form onSubmit={saveSettings} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Proveedor de contenido</Label>
              <Select
                value={settings.contentProvider ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contentProvider: e.target.value || null }))
                }
              >
                <option value="">Default (env)</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo de contenido</Label>
              <Input
                value={settings.contentModel ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contentModel: e.target.value || null }))
                }
                placeholder="gpt-4o-mini"
              />
            </div>
            <div className="space-y-2">
              <Label>Proveedor de imagen</Label>
              <Select
                value={settings.imageProvider ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, imageProvider: e.target.value || null }))
                }
              >
                <option value="">Default (env)</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo de imagen</Label>
              <Input
                value={settings.imageModel ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, imageModel: e.target.value || null }))
                }
                placeholder="dall-e-3"
              />
            </div>
            <div className="space-y-2">
              <Label>Proveedor de razonamiento</Label>
              <Select
                value={settings.reasoningProvider ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    reasoningProvider: e.target.value || null,
                  }))
                }
              >
                <option value="">Default (env)</option>
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo de razonamiento</Label>
              <Input
                value={settings.reasoningModel ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, reasoningModel: e.target.value || null }))
                }
                placeholder="gpt-4o-mini"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="outline" disabled={savingSettings}>
                {savingSettings ? "Guardando…" : "Guardar preferencias"}
              </Button>
            </div>
          </form>
        </section>

        {loading ? (
          <p className="text-muted">Cargando…</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">Ejecuciones</h2>
                <Button variant="ghost" size="sm" onClick={() => load()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {runs.length === 0 ? (
                <p className="text-sm text-muted">Aún no hay ejecuciones.</p>
              ) : (
                <ul className="space-y-2">
                  {runs.map((run) => (
                    <li key={run.id}>
                      <button
                        type="button"
                        onClick={() => openRun(run.id)}
                        className="glass-panel w-full p-4 text-left transition hover:bg-teal/5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={run.status === "COMPLETED" ? "teal" : "outline"}>
                            {run.status}
                          </Badge>
                          <span className="text-sm text-muted">
                            {run.goal ?? "sin objetivo"}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-ink">
                          {run.summary ?? "Sin resumen"}
                        </p>
                        <time className="mt-1 block text-xs text-muted">
                          {format(new Date(run.createdAt), "d MMM yyyy HH:mm", {
                            locale: es,
                          })}
                        </time>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl text-ink">
                Recomendaciones pendientes ({pendingRecs.length})
              </h2>
              {pendingRecs.length === 0 ? (
                <p className="text-sm text-muted">No hay recomendaciones pendientes.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingRecs.slice(0, 12).map((rec) => (
                    <li key={rec.id} className="glass-panel space-y-3 p-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="sand">
                          {TYPE_LABELS[rec.type] ?? rec.type}
                        </Badge>
                        <Badge variant="outline">P{rec.priority}</Badge>
                      </div>
                      <h3 className="font-medium text-ink">{rec.title}</h3>
                      <p className="text-sm text-muted">{rec.description}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateRec(rec.id, "ACCEPTED")}
                        >
                          <Check className="h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRec(rec.id, "REJECTED")}
                        >
                          <X className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {selectedRun && (
          <section className="glass-panel space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl text-ink">Detalle del run</h2>
              <Badge variant="teal">{selectedRun.status}</Badge>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted">
              {selectedRun.summary}
            </p>
            {selectedRun.steps && selectedRun.steps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-ink">Pasos de agentes</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {selectedRun.steps.map((step) => (
                    <li
                      key={step.id}
                      className="rounded-xl border border-border bg-sand-light/50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-ink">{step.agent}</span>
                        <Badge variant="outline">{step.status}</Badge>
                      </div>
                      {step.latencyMs != null && (
                        <p className="mt-1 text-xs text-muted">{step.latencyMs} ms</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
