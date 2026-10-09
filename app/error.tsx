'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-brand px-6 text-center text-white">
      <p className="text-7xl" aria-hidden>🔥</p>
      <h1 className="font-display text-5xl uppercase tracking-wide">Algo salió mal</h1>
      <p className="max-w-sm text-white/80">No pudimos cargar esta página. Intenta de nuevo en unos segundos.</p>
      <button type="button" onClick={reset} className="btn-gold">
        Reintentar
      </button>
    </main>
  );
}
