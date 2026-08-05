"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { api } from "@/lib/api";
import type { CalendarEntry, Company } from "@/lib/types";

export default function CalendarPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  const loadEntries = useCallback(async (month?: Date) => {
    const date = month ?? new Date();
    const year = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const data = await api.get<CalendarEntry[]>(
      `/companies/${params.id}/calendar?year=${year}&month=${monthNum}`,
    );
    setEntries(data);
  }, [params.id]);

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
      await loadEntries();
      setSelectedEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reprogramar");
    }
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Calendario editorial</h1>
          <p className="mt-2 text-muted">
            Visualiza y reprograma tus publicaciones. Arrastra un elemento a otro día para cambiar la fecha.
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
            onMonthChange={loadEntries}
            onReschedule={handleReschedule}
            onEntryClick={setSelectedEntry}
          />
        )}

        {selectedEntry && (
          <div className="glass-panel p-6">
            <h2 className="font-display text-lg text-ink">
              {selectedEntry.content?.title ?? "Contenido programado"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Programado para:{" "}
              {format(new Date(selectedEntry.scheduledAt), "d 'de' MMMM yyyy, HH:mm")}
            </p>
            {selectedEntry.notes && (
              <p className="mt-2 text-sm text-muted">{selectedEntry.notes}</p>
            )}
            <div className="mt-4">
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
