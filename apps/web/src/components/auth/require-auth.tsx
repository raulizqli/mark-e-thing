// apps/web/src/components/auth/require-auth.tsx

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { mode, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mode !== "supabase" || loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mode, loading, user, router, pathname]);

  if (mode === "supabase" && (loading || !user)) {
    return (
      <div className="mesh-bg-subtle flex min-h-screen items-center justify-center text-muted">
        Cargando sesión…
      </div>
    );
  }

  return <>{children}</>;
}
