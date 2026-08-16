// apps/web/src/app/companies/[id]/calendar/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { CalendarEntry, Company } from "@/lib/types";

export default function CalendarPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const loadEntries = useCallback(async (month?: Date) => {
    const date = month ?? currentMonth;
    const year = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const data = await api.get<CalendarEntry[]>(
      `/companies/${params.id}/calendar?month=${year}-${String(monthNum).padStart(2, "0")}`,
    );
    setEntries(data);
  }, [params.id, currentMonth]);

  useEffect(() => {
    Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      loadEntries(),
    ])
      .then(([companyData]) => setCompany(companyData))
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [params.id, loadEntries]);

  async function handleReschedule(entryId: string, newDate: Date) {
    try {
      await api.patch(`/companies/${params.id}/calendar/${entryId}`, {
        scheduledAt: newDate.toISOString(),
      });
      await loadEntries(currentMonth);
      setSelectedEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reprogramar");
    }
  }

  async function handleDelete(entryId: string) {
    setBusy(true);
    try {
      await api.delete(`/companies/${params.id}/calendar/${entryId}`);
      setSelectedEntry(null);
      await loadEntries(currentMonth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicate(entryId: string) {
    setBusy(true);
    try {
      await api.post(`/companies/${params.id}/calendar/${entryId}/duplicate`);
      await loadEntries(currentMonth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al duplicar");
    } finally {
      setBusy(false);
    }
  }

  function handleMonthChange(month: Date) {
    setCurrentMonth(month);
    void loadEntries(month);
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Calendario editorial</h1>
          <p className="mt-2 text-muted">
            Visualiza, reprograma, duplica o elimina publicaciones. Arrastra un elemento a otro día
            para cambiar la fecha.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Cargando calendario…</p>
        ) : (
          <MonthCalendar
            entries={entries}
            onMonthChange={handleMonthChange}
            onReschedule={handleReschedule}
            onEntryClick={setSelectedEntry}
          />
        )}

        {selectedEntry && (
          <div className="glass-panel space-y-4 p-6">
            <h2 className="font-display text-lg text-ink">
              {selectedEntry.content?.title ?? "Contenido programado"}
            </h2>
            <p className="text-sm text-muted">
              Programado para:{" "}
              {format(new Date(selectedEntry.scheduledAt), "d 'de' MMMM yyyy, HH:mm")}
            </p>
            {selectedEntry.notes && (
              <p className="text-sm text-muted">{selectedEntry.notes}</p>
            )}
            <div>
              <label className="text-sm font-medium text-ink" htmlFor="reschedule">
                Cambiar fecha
              </label>
              <input
                id="reschedule"
                type="datetime-local"
                className="mt-2 flex h-10 w-full max-w-xs rounded-xl border border-border bg-white/80 px-3 text-sm"
                defaultValue={format(new Date(selectedEntry.scheduledAt), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    handleReschedule(selectedEntry.id, new Date(value));
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => handleDuplicate(selectedEntry.id)}
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => handleDelete(selectedEntry.id)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
