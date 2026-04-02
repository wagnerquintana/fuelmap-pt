'use client'

import { useState } from 'react'
import { X, Bookmark, Loader2, CheckCircle } from 'lucide-react'
import { FUEL_LABELS } from '@/lib/utils'

interface SaveSearchModalProps {
  district: string
  fuelType: string
  onClose: () => void
}

export default function SaveSearchModal({ district, fuelType, onClose }: SaveSearchModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source: 'save_search',
        district: district || null,
        fuel_type: fuelType !== 'all' ? fuelType : null,
        metadata: { district, fuelType },
      }),
    })

    setLoading(false)
    if (res.ok) {
      setDone(true)
      localStorage.setItem('fuelmap_search_saved', 'true')
    } else {
      setError('Erro ao guardar. Tenta novamente.')
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[9999] p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>

        {done ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Pesquisa guardada!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vais receber atualizações de preços para {district ? <strong>{district}</strong> : 'Portugal'}.
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm">
              Continuar a pesquisar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Bookmark size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Guardar esta pesquisa</h2>
                <p className="text-xs text-gray-500">Recebe atualizações quando os preços mudam</p>
              </div>
            </div>

            {/* Resumo da pesquisa */}
            <div className="flex gap-2 mb-4">
              {district && (
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                  📍 {district}
                </span>
              )}
              {fuelType !== 'all' && (
                <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                  ⛽ {FUEL_LABELS[fuelType] || fuelType}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="o-teu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Guardar e receber atualizações
              </button>
              <p className="text-[10px] text-gray-400 text-center">Sem spam. Cancela quando quiseres.</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
