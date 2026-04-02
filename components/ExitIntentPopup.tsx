'use client'

import { useState, useEffect } from 'react'
import { X, Zap, Loader2, CheckCircle } from 'lucide-react'

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
    // Animar entrada
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

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
        className="w-full max-w-md rounded-3xl overflow-hidden relative transition-all duration-300"
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header colorido */}
        <div
          className="px-6 pt-6 pb-5 text-white text-center"
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
          <h2 className="text-xl font-black mb-1">Antes de saíres!</h2>
          <p className="text-sm opacity-80">
            Recebe os <strong>3 postos mais baratos</strong>{district ? ` em ${district}` : ' perto de ti'} todas as semanas — de graça.
          </p>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-5">
          {done ? (
            <div className="text-center py-2">
              <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-1">Ótimo, estás dentro!</p>
              <p className="text-sm text-gray-500 mb-4">Vais receber o teu resumo semanal em breve.</p>
              <button onClick={handleClose} className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm">
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-blue-50">
                {['⛽ Preços em tempo real', '📍 Por distrito', '🔔 Sem spam'].map(item => (
                  <span key={item} className="text-[10px] font-semibold text-blue-700 whitespace-nowrap">{item}</span>
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Quero receber os melhores preços
                </button>
              </form>
              <button
                onClick={handleClose}
                className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 py-1"
              >
                Não, obrigado
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
