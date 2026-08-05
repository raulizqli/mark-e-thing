"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { KNOWLEDGE_TYPE_LABELS } from "@/lib/content-types";
import type { Company, KnowledgeDocument, KnowledgeType } from "@/lib/types";

export default function KnowledgePage() {
  const params = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KnowledgeType>("OTHER");

  async function loadData() {
    const [companyData, docs] = await Promise.all([
      api.get<Company>(`/companies/${params.id}`),
      api.get<KnowledgeDocument[]>(`/companies/${params.id}/knowledge`),
    ]);
    setCompany(companyData);
    setDocuments(docs);
  }

  useEffect(() => {
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("type", type);

      await api.post(`/companies/${params.id}/knowledge`, formData);
      setTitle("");
      setType("OTHER");
      if (fileRef.current) fileRef.current.value = "";
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell companyId={params.id} companyName={company?.name}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Base de conocimiento</h1>
          <p className="mt-2 text-muted">
            Sube documentos para que la IA entienda mejor tu negocio.
          </p>
        </div>

        <form onSubmit={handleUpload} className="glass-panel space-y-4 p-6">
          <h2 className="font-display text-lg text-ink">Subir documento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value as KnowledgeType)}>
                {Object.entries(KNOWLEDGE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="file">Archivo</Label>
              <Input id="file" ref={fileRef} type="file" required />
            </div>
          </div>
          <Button type="submit" disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo…" : "Subir"}
          </Button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Cargando documentos…</p>
        ) : documents.length === 0 ? (
          <div className="glass-panel p-8 text-center text-muted">
            No hay documentos todavía.
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id} className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <h3 className="font-medium text-ink">{doc.title}</h3>
                  <p className="text-sm text-muted">{doc.fileName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="teal">{KNOWLEDGE_TYPE_LABELS[doc.type]}</Badge>
                  <time className="text-xs text-muted">
                    {format(new Date(doc.createdAt), "d MMM yyyy", { locale: es })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
