'use client'

import { Fuel, RefreshCw } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen p-6"
      style={{ background: 'var(--gradient-bg)' }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            boxShadow: '0 12px 36px rgba(239,68,68,0.35)',
          }}
        >
          <Fuel size={36} className="text-white" />
        </div>

        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>
          Algo correu mal
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Houve um problema ao carregar a página. Tenta novamente.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 relative overflow-hidden press-scale"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }}
          />
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
