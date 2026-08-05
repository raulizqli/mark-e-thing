"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  Calendar,
  History,
  LayoutDashboard,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

interface AppShellProps {
  children: React.ReactNode;
  companyId?: string;
  companyName?: string;
}

const baseNav = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/companies", label: "Empresas", icon: Building2 },
];

function companyNav(companyId: string) {
  return [
    { href: `/companies/${companyId}`, label: "Marca", icon: Building2 },
    { href: `/companies/${companyId}/generate`, label: "Generar", icon: Sparkles },
    { href: `/companies/${companyId}/calendar`, label: "Calendario", icon: Calendar },
    { href: `/companies/${companyId}/knowledge`, label: "Conocimiento", icon: Building2 },
    { href: `/companies/${companyId}/content`, label: "Historial", icon: History },
    { href: `/companies/${companyId}/agent`, label: "Agente IA", icon: Bot },
  ];
}

export function AppShell({ children, companyId, companyName }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = companyId ? companyNav(companyId) : baseNav;

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-teal/10 text-teal"
            : "text-muted hover:bg-ink/5 hover:text-ink",
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="mesh-bg-subtle min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-sand-light/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            {companyName && (
              <span className="hidden text-sm text-muted sm:inline">
                / {companyName}
              </span>
            )}
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-ink md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
