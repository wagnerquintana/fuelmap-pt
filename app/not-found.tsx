import { Fuel } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--gradient-bg)' }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 12px 36px rgba(99,102,241,0.35)',
          }}
        >
          <Fuel size={36} className="text-white" />
        </div>

        <h1
          className="text-6xl font-black mb-2"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        <p className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
          Página não encontrada
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Esta bomba ficou sem combustível. Volta ao mapa para encontrar as melhores ofertas.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }}
          />
          <Fuel size={16} />
          Voltar ao mapa
        </Link>
      </div>
    </div>
  )
}
