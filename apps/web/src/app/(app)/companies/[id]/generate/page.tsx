// apps/web/src/app/companies/[id]/generate/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { ScheduleContentControl } from "@/components/calendar/schedule-content-control";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { CONTENT_TYPE_OPTIONS } from "@/lib/content-types";
import type {
  Company,
  Content,
  ContentType,
  GenerateContentResult,
  GeneratedImage,
} from "@/lib/types";
import { cn } from "@/lib/cn";

export default function GeneratePage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerateContentResult[]>([]);
  const [savedContents, setSavedContents] = useState<Content[]>([]);
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);
  const [images, setImages] = useState<Record<number, GeneratedImage>>({});
  const [error, setError] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  useEffect(() => {
    api.get<Company>(`/companies/${params.id}`).then(setCompany).catch(() => null);
  }, [params.id]);

  function toggleType(type: ContentType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTypes.length === 0) return;

    setGenerating(true);
    setError(null);
    setResults([]);
    setSavedContents([]);
    setImages({});

    try {
      const contents: Content[] = [];
      const generated: GenerateContentResult[] = [];

      for (const type of selectedTypes) {
        const content = await api.post<Content>(
          `/companies/${params.id}/content/generate`,
          { type, topic: topic || undefined },
        );
        contents.push(content);
        generated.push({
          type: content.type,
          title: content.title,
          copy: content.copy,
          cta: content.cta ?? undefined,
          emojis: content.emojis,
          hashtags: content.hashtags,
          imagePrompt: content.imagePrompt ?? undefined,
          seoKeywords: content.seoKeywords,
        });
      }

      setResults(generated);
      setSavedContents(contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar contenido");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateImage(index: number, prompt: string, contentId?: string) {
    setGeneratingImageFor(index);
    try {
      const image = await api.post<GeneratedImage>(
        `/companies/${params.id}/images/generate`,
        { prompt, contentId },
      );
      setImages((prev) => ({ ...prev, [index]: image }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar imagen");
    } finally {
      setGeneratingImageFor(null);
    }
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Generar contenido</h1>
          <p className="mt-2 text-muted">
            Elige el tipo de contenido y deja que la IA cree publicaciones para tu marca.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="glass-panel space-y-6 p-6">
          <div className="space-y-3">
            <Label>Tipo(s) de contenido</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleType(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedTypes.includes(value)
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-border text-muted hover:border-teal/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Tema (opcional)</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: promoción de verano, nuevo producto"
            />
          </div>

          <Button type="submit" disabled={generating || selectedTypes.length === 0}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Generando…" : "Generar"}
          </Button>
        </form>

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

        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-ink">Resultados</h2>
            {results.map((result, index) => (
              <article key={`${result.type}-${index}`} className="glass-panel space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="teal">{result.type}</Badge>
                  {savedContents[index]?.id && (
                    <ScheduleContentControl
                      companyId={params.id}
                      contentId={savedContents[index].id}
                      onScheduled={() =>
                        setScheduleNotice(`"${result.title}" programado en el calendario.`)
                      }
                      onError={setError}
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-display text-xl text-ink">{result.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{result.copy}</p>
                </div>

                {result.cta && (
                  <p className="text-sm">
                    <span className="font-medium text-ink">CTA:</span>{" "}
                    <span className="text-teal">{result.cta}</span>
                  </p>
                )}

                {result.emojis.length > 0 && (
                  <p className="text-lg">{result.emojis.join(" ")}</p>
                )}

                {result.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag) => (
                      <span key={tag} className="text-sm text-teal">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {result.imagePrompt && (
                  <div className="rounded-xl bg-ink/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Prompt de imagen
                    </p>
                    <p className="mt-1 text-sm text-ink">{result.imagePrompt}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      disabled={generatingImageFor === index}
                      onClick={() =>
                        handleGenerateImage(
                          index,
                          result.imagePrompt!,
                          savedContents[index]?.id,
                        )
                      }
                    >
                      <ImageIcon className="h-4 w-4" />
                      {generatingImageFor === index ? "Generando imagen…" : "Generar imagen"}
                    </Button>
                    {images[index]?.url && (
                      <img
                        src={images[index].url!}
                        alt="Imagen generada"
                        className="mt-4 max-h-64 rounded-xl object-cover"
                      />
                    )}
                  </div>
                )}

                {result.seoKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Palabras clave SEO
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.seoKeywords.map((kw) => (
                        <Badge key={kw} variant="sand">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
