// apps/web/src/components/content/content-card.tsx

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ScheduleContentControl } from "@/components/calendar/schedule-content-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTENT_STATUS_LABELS, CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { Content } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ContentCardProps {
  content: Content;
  companyId: string;
  onDuplicate?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onScheduled?: () => void;
  onScheduleError?: (message: string) => void;
  showSchedule?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function ContentCard({
  content,
  companyId,
  onDuplicate,
  onRegenerate,
  onScheduled,
  onScheduleError,
  showSchedule = true,
  actions,
  className,
}: ContentCardProps) {
  return (
    <article
      className={cn(
        "glass-panel flex flex-col gap-3 p-5 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            <Badge variant="teal">{CONTENT_TYPE_LABELS[content.type]}</Badge>
            <Badge variant="outline">{CONTENT_STATUS_LABELS[content.status]}</Badge>
          </div>
          <h3 className="font-display text-lg text-ink">{content.title}</h3>
        </div>
        <time className="text-xs text-muted">
          {format(new Date(content.createdAt), "d MMM yyyy", { locale: es })}
        </time>
      </div>

      <p className="line-clamp-3 text-sm text-muted">{content.copy}</p>

      {content.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {content.hashtags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-teal">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Link
          href={`/companies/${companyId}/content/${content.id}`}
          className="inline-flex h-8 items-center justify-center rounded-xl border border-teal px-3 text-sm font-medium text-teal transition-colors hover:bg-teal/5"
        >
          Ver detalle
        </Link>
        {onDuplicate && (
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(content.id)}>
            Duplicar
          </Button>
        )}
        {onRegenerate && (
          <Button variant="ghost" size="sm" onClick={() => onRegenerate(content.id)}>
            Regenerar
          </Button>
        )}
        {showSchedule && (
          <ScheduleContentControl
            companyId={companyId}
            contentId={content.id}
            onScheduled={onScheduled}
            onError={onScheduleError}
          />
        )}
        {actions}
      </div>
    </article>
  );
}
