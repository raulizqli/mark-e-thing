"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CompanyForm } from "@/components/company/company-form";
import { api } from "@/lib/api";
import type { Company, UpdateCompanyInput } from "@/lib/types";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<Company>(`/companies/${params.id}`)
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(data: UpdateCompanyInput) {
    const updated = await api.patch<Company>(`/companies/${params.id}`, data);
    setCompany(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <AppShell companyId={params.id}>
        <p className="text-muted">Cargando empresa…</p>
      </AppShell>
    );
  }

  if (!company) {
    return (
      <AppShell companyId={params.id}>
        <p className="text-muted">No se encontró la empresa.</p>
      </AppShell>
    );
  }

  return (
    <AppShell companyId={company.id} companyName={company.name}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Configuración de marca</h1>
          <p className="mt-2 text-muted">
            Define la identidad y voz de {company.name} para generar contenido personalizado.
          </p>
          {saved && (
            <p className="mt-2 text-sm text-teal">Cambios guardados correctamente.</p>
          )}
        </div>

        <div className="glass-panel p-6">
          <CompanyForm initial={company} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
        </div>
      </div>
    </AppShell>
  );
}
