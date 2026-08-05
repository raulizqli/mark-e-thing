"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CalendarEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

interface MonthCalendarProps {
  entries: CalendarEntry[];
  onMonthChange?: (date: Date) => void;
  onReschedule?: (entryId: string, newDate: Date) => void;
  onEntryClick?: (entry: CalendarEntry) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthCalendar({
  entries,
  onMonthChange,
  onReschedule,
  onEntryClick,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function changeMonth(delta: number) {
    const next = delta > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
    setCurrentMonth(next);
    onMonthChange?.(next);
  }

  function entriesForDay(day: Date) {
    return entries.filter((e) => isSameDay(new Date(e.scheduledAt), day));
  }

  function handleDrop(day: Date) {
    if (!draggedEntryId || !onReschedule) return;
    const entry = entries.find((e) => e.id === draggedEntryId);
    if (!entry) return;

    const original = new Date(entry.scheduledAt);
    const newDate = new Date(day);
    newDate.setHours(original.getHours(), original.getMinutes(), 0, 0);
    onReschedule(draggedEntryId, newDate);
    setDraggedEntryId(null);
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display text-lg capitalize text-ink">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEntries = entriesForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] border-b border-r border-border p-1.5 transition-colors sm:min-h-[120px]",
                !inMonth && "bg-ink/[0.02] text-muted",
                draggedEntryId && inMonth && "hover:bg-teal/5",
              )}
              onDragOver={(e) => {
                if (draggedEntryId && inMonth) e.preventDefault();
              }}
              onDrop={() => inMonth && handleDrop(day)}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday && "bg-teal text-white font-medium",
                )}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 space-y-1">
                {dayEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    draggable={!!onReschedule}
                    onDragStart={() => setDraggedEntryId(entry.id)}
                    onDragEnd={() => setDraggedEntryId(null)}
                    onClick={() => onEntryClick?.(entry)}
                    className="w-full truncate rounded-md bg-teal/10 px-1.5 py-0.5 text-left text-[10px] font-medium text-teal hover:bg-teal/20 sm:text-xs"
                    title={entry.content?.title ?? entry.notes ?? "Contenido programado"}
                  >
                    {entry.content?.title ?? "Sin título"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
