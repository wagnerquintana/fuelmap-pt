'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Zap, Loader2, CheckCircle } from 'lucide-react'
import { useEscapeKey } from '@/lib/useEscapeKey'

interface ExitIntentPopupProps {
  district?: string
  onClose: () => void
}

export default function ExitIntentPopup({ district, onClose }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300)
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
        source: 'exit_intent',
        district: district || null,
        metadata: { trigger: 'exit_intent' },
      }),
    })

    setLoading(false)
    if (res.ok) setDone(true)
    else setError('Erro ao guardar. Tenta novamente.')
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-300"
      style={{
        background: visible ? 'var(--backdrop-bg)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'var(--backdrop-blur)' : 'none',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
        className="w-full max-w-md rounded-3xl overflow-hidden relative transition-all duration-300"
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {done ? (
          /* ── Sucesso ── */
          <>
            <div
              className="px-6 pt-6 pb-5 text-center relative"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                <X size={14} />
              </button>
              <CheckCircle size={36} className="text-white mx-auto mb-3" />
              <h2 id="exit-modal-title" className="text-xl font-black text-white mb-1">Ótimo, estás dentro!</h2>
              <p className="text-sm text-white/75">Vais receber o teu resumo semanal em breve.</p>
            </div>
            <div className="bg-white px-6 py-5">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                Fechar
              </button>
            </div>
          </>
        ) : (
          /* ── Formulário ── */
          <>
            {/* Header gradient */}
            <div
              className="px-6 pt-6 pb-5 text-white text-center relative"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
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
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Zap size={26} className="text-yellow-300" fill="currentColor" />
              </div>
              <h2 id="exit-modal-title" className="text-xl font-black mb-1">Antes de saíres!</h2>
              <p className="text-sm opacity-80">
                Recebe os <strong>3 postos mais baratos</strong>{district ? ` em ${district}` : ' perto de ti'} todas as semanas — de graça.
              </p>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5">
              {/* Benefícios */}
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: 'var(--surface3)' }}>
                {['⛽ Preços em tempo real', '📍 Por distrito', '🔔 Sem spam'].map(item => (
                  <span
                    key={item}
                    className="text-[10px] font-bold whitespace-nowrap"
                    style={{ color: 'var(--accent)' }}
                  >
                    {item}
                  </span>
                ))}
              </div>

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
                  className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 relative overflow-hidden press-scale"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Quero receber os melhores preços
                </button>
              </form>
              <button
                onClick={handleClose}
                className="w-full mt-2 text-xs py-1"
                style={{ color: 'var(--text-dim)' }}
              >
                Não, obrigado
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
