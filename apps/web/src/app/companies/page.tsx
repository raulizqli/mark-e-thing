"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Company } from "@/lib/types";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get<Company[]>("/companies")
      .then(setCompanies)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const company = await api.post<Company>("/companies", { name: newName.trim() });
      router.push(`/companies/${company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear empresa");
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-ink">Empresas</h1>
            <p className="mt-2 text-muted">
              Gestiona las marcas de tus negocios.
            </p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" />
            Nueva empresa
          </Button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="glass-panel space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="newName">Nombre de la empresa</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mi negocio"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creando…" : "Crear"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Cargando empresas…</p>
        ) : companies.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-muted">Aún no tienes empresas registradas.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Crear tu primera empresa
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {companies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  className="glass-panel block p-5 transition-all hover:shadow-md cta-hover"
                >
                  <h2 className="font-display text-xl text-ink">{company.name}</h2>
                  {company.industry && (
                    <p className="mt-1 text-sm text-muted">{company.industry}</p>
                  )}
                  {company.city && (
                    <p className="mt-1 text-xs text-muted">{company.city}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
