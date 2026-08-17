// apps/web/src/app/signup/page.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const { mode, signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "dev") {
        router.push("/dashboard");
        return;
      }
      await signUp(email, password, name || undefined);
      setNotice("Cuenta creada. Revisa tu email si Supabase pide confirmación, o inicia sesión.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md space-y-5 p-8">
        <Logo size="md" />
        <div>
          <h1 className="font-display text-2xl text-ink">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "dev"
              ? "Auth en modo desarrollo: el alta abre el panel directamente."
              : "Regístrate con email y contraseña (Supabase Auth)."}
          </p>
        </div>

        {mode === "supabase" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal">
            {notice}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando…" : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-teal hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
