// apps/web/src/components/publishing/publish-content-control.tsx

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PublishContentControlProps {
  companyId: string;
  contentId: string;
  onPublished?: () => void;
  onError?: (message: string) => void;
}

export function PublishContentControl({
  companyId,
  contentId,
  onPublished,
  onError,
}: PublishContentControlProps) {
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    setBusy(true);
    try {
      await api.post(`/companies/${companyId}/publish`, {
        contentId,
        platform: "LINKEDIN",
      });
      onPublished?.();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={handlePublish}>
      <Send className="h-4 w-4" />
      {busy ? "Publicando…" : "Publicar en LinkedIn"}
    </Button>
  );
}
