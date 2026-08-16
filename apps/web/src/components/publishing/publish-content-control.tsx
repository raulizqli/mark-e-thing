// apps/web/src/components/publishing/publish-content-control.tsx

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type PublishPlatform = "LINKEDIN" | "FACEBOOK" | "INSTAGRAM" | "X" | "WHATSAPP";

const LABELS: Record<PublishPlatform, string> = {
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  X: "X",
  WHATSAPP: "WhatsApp",
};

interface PublishContentControlProps {
  companyId: string;
  contentId: string;
  platforms?: PublishPlatform[];
  onPublished?: (platform: PublishPlatform) => void;
  onError?: (message: string) => void;
}

export function PublishContentControl({
  companyId,
  contentId,
  platforms = ["LINKEDIN", "FACEBOOK", "INSTAGRAM", "X", "WHATSAPP"],
  onPublished,
  onError,
}: PublishContentControlProps) {
  const [busyPlatform, setBusyPlatform] = useState<PublishPlatform | null>(null);

  async function handlePublish(platform: PublishPlatform) {
    setBusyPlatform(platform);
    try {
      await api.post(`/companies/${companyId}/publish`, {
        contentId,
        platform,
      });
      onPublished?.(platform);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setBusyPlatform(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <Button
          key={platform}
          type="button"
          variant="outline"
          size="sm"
          disabled={busyPlatform !== null}
          onClick={() => handlePublish(platform)}
        >
          <Send className="h-4 w-4" />
          {busyPlatform === platform
            ? `Publicando en ${LABELS[platform]}…`
            : `Publicar en ${LABELS[platform]}`}
        </Button>
      ))}
    </div>
  );
}
