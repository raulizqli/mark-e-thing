// apps/web/src/components/calendar/schedule-content-control.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { CalendarEntry } from "@/lib/types";

interface ScheduleContentControlProps {
  companyId: string;
  contentId: string;
  onScheduled?: (entry: CalendarEntry) => void;
  onError?: (message: string) => void;
  size?: "sm" | "md";
  className?: string;
}

function defaultScheduleValue(): string {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function ScheduleContentControl({
  companyId,
  contentId,
  onScheduled,
  onError,
  size = "sm",
  className,
}: ScheduleContentControlProps) {
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleValue);
  const [saving, setSaving] = useState(false);

  async function handleSchedule() {
    if (!scheduledAt) return;
    setSaving(true);
    try {
      const entry = await api.post<CalendarEntry>(`/companies/${companyId}/calendar`, {
        contentId,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      setOpen(false);
      onScheduled?.(entry);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Error al programar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={className}>
      {!open ? (
        <Button type="button" variant="outline" size={size} onClick={() => setOpen(true)}>
          <CalendarPlus className="h-4 w-4" />
          Programar
        </Button>
      ) : (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-white/70 p-3">
          <div className="space-y-1">
            <Label htmlFor={`schedule-${contentId}`}>Fecha y hora</Label>
            <input
              id={`schedule-${contentId}`}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex h-8 rounded-xl border border-border bg-white/80 px-3 text-sm"
            />
          </div>
          <Button type="button" size="sm" disabled={saving || !scheduledAt} onClick={handleSchedule}>
            {saving ? "Guardando…" : "Confirmar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
