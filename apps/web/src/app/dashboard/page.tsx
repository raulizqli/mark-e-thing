import Link from "next/link";
import {
  Building2,
  Calendar,
  History,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const sections = [
  {
    href: "/companies",
    title: "Empresas",
    description: "Administra tus marcas y configura la identidad de cada negocio.",
    icon: Building2,
  },
  {
    href: "/companies",
    title: "Generar contenido",
    description: "Crea publicaciones, historias y más con IA adaptada a tu marca.",
    icon: Sparkles,
    note: "Selecciona una empresa primero",
  },
  {
    href: "/companies",
    title: "Calendario",
    description: "Programa y visualiza tus publicaciones en un calendario mensual.",
    icon: Calendar,
    note: "Selecciona una empresa primero",
  },
  {
    href: "/companies",
    title: "Base de conocimiento",
    description: "Sube documentos para que la IA conozca mejor tu negocio.",
    icon: BookOpen,
    note: "Selecciona una empresa primero",
  },
  {
    href: "/companies",
    title: "Historial",
    description: "Revisa, duplica o regenera contenido creado anteriormente.",
    icon: History,
    note: "Selecciona una empresa primero",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Panel de control</h1>
          <p className="mt-2 text-muted">
            Bienvenido a MarkeThing. Elige una sección para comenzar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="glass-panel group flex flex-col gap-3 p-6 transition-all hover:shadow-md cta-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-ink group-hover:text-teal transition-colors">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{section.description}</p>
                  {section.note && (
                    <p className="mt-2 text-xs text-teal/80">{section.note}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
