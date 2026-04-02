'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Bookmark, Loader2, CheckCircle } from 'lucide-react'
import { useEscapeKey } from '@/lib/useEscapeKey'
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
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 280)
  }, [onClose])

  useEscapeKey(handleClose)

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
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[9999] p-4 transition-all duration-280"
      style={{
        background: visible ? 'var(--backdrop-bg)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'var(--backdrop-blur)' : 'none',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-modal-title"
        className="w-full max-w-sm rounded-3xl overflow-hidden relative transition-all duration-280"
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {done ? (
          /* ── Estado: sucesso ── */
          <>
            <div
              className="px-6 pt-6 pb-5 text-center"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                <X size={14} />
              </button>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 id="save-modal-title" className="text-xl font-black text-white mb-1">Pesquisa guardada!</h2>
              <p className="text-sm text-white/75">
                Vais receber atualizações para{' '}
                <strong className="text-white">{district || 'Portugal'}</strong>.
              </p>
            </div>
            <div className="bg-white px-6 py-5">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                Continuar a pesquisar
              </button>
            </div>
          </>
        ) : (
          /* ── Estado: formulário ── */
          <>
            {/* Header gradient */}
            <div
              className="px-6 pt-6 pb-5"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <Bookmark size={22} className="text-white" />
                </div>
                <div>
                  <h2 id="save-modal-title" className="text-lg font-black text-white leading-tight">Guardar pesquisa</h2>
                  <p className="text-xs text-white/70">Recebe alertas quando os preços mudam</p>
                </div>
              </div>

              {/* Pills da pesquisa atual */}
              {(district || fuelType !== 'all') && (
                <div className="flex gap-2 flex-wrap">
                  {district && (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}
                    >
                      📍 {district}
                    </span>
                  )}
                  {fuelType !== 'all' && (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}
                    >
                      ⛽ {FUEL_LABELS[fuelType] || fuelType}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="o-teu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Guardar e receber atualizações
                </button>
                <p className="text-[10px] text-center" style={{ color: 'var(--text-dim)' }}>
                  Sem spam. Cancela quando quiseres.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
