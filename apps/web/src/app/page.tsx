import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function LandingPage() {
  return (
    <div className="mesh-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
        <div className="absolute -right-10 bottom-32 h-96 w-96 rounded-full bg-sand/50 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <Link
          href="/login"
          className="text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center px-6 pb-20 pt-12">
        <div className="max-w-3xl">
          <div className="animate-initial-hidden animate-fade-up">
            <Logo size="hero" href={undefined} className="brand-underline" />
          </div>

          <h1 className="animate-initial-hidden animate-fade-up-delay mt-8 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl md:text-5xl">
            Tu marketing, impulsado por inteligencia artificial
          </h1>

          <p className="animate-initial-hidden animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-muted">
            Crea contenido para redes, programa publicaciones y mantén la voz de tu marca — todo en un solo lugar.
          </p>

          <div className="animate-initial-hidden animate-fade-up-delay-2 mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="cta-hover inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-teal-light"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="cta-hover inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-teal px-6 text-base font-medium text-teal transition-colors hover:bg-teal/5"
            >
              <Sparkles className="h-4 w-4" />
              Entrar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
