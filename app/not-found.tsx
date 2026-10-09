import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-brand px-6 text-center text-white">
      <p className="text-7xl" aria-hidden>🍔</p>
      <h1 className="font-display text-6xl uppercase tracking-wide">Página no encontrada</h1>
      <p className="max-w-sm text-white/80">Esta página se la comió alguien. Vuelve al inicio y pide algo rico.</p>
      <Link href="/" className="btn-gold">
        Ir al inicio
      </Link>
    </main>
  );
}
