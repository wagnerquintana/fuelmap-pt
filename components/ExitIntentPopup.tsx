'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Zap, Loader2, CheckCircle } from 'lucide-react'
import { useEscapeKey } from '@/lib/useEscapeKey'
import PrivacyCheckbox from './PrivacyCheckbox'

interface ExitIntentPopupProps {
  district?: string
  onClose: () => void
}

export default function ExitIntentPopup({ district, onClose }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
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
      className="fixed inset-0 flex items-center justify-center z-[9999] p-6 sm:p-4 transition-all duration-300"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'none',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
        className="w-full max-w-sm rounded-2xl overflow-hidden relative transition-all duration-300"
        style={{
          boxShadow: '0 0 48px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.1)',
          border: '1px solid var(--border)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {done ? (
          <>
            <div className="px-6 pt-6 pb-5 text-center relative" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><X size={14} /></button>
              <CheckCircle size={36} className="text-white mx-auto mb-3" />
              <h2 id="exit-modal-title" className="text-xl font-black text-white mb-1">Ótimo, estás dentro!</h2>
              <p className="text-sm text-white/75">Vais receber o teu resumo semanal em breve.</p>
            </div>
            <div className="px-6 py-5" style={{ background: 'var(--bg-raised)' }}>
              <button onClick={handleClose} className="btn btn-primary w-full py-3 text-sm" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', borderColor: 'rgba(16,185,129,0.3)', boxShadow: '0 0 16px rgba(16,185,129,0.25)' }}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-6 pb-5 text-white text-center relative" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
              <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><X size={14} /></button>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Zap size={26} className="text-yellow-300" fill="currentColor" />
              </div>
              <h2 id="exit-modal-title" className="text-xl font-black mb-1">Antes de saíres!</h2>
              <p className="text-sm opacity-80">
                Recebe os <strong>3 postos mais baratos</strong>{district ? ` em ${district}` : ' perto de ti'} todas as semanas — de graça.
              </p>
            </div>
            <div className="px-6 py-5" style={{ background: 'var(--bg-raised)' }}>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {['⛽ Preços reais', '📍 Por distrito', '🔔 Sem spam'].map(item => (
                  <span key={item} className="text-[10px] font-bold whitespace-nowrap" style={{ color: 'var(--color-primary)' }}>{item}</span>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email" placeholder="o-teu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 12px rgba(124,58,237,0.15)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <PrivacyCheckbox checked={acceptedPrivacy} onChange={setAcceptedPrivacy} />
                {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
                <button type="submit" disabled={loading || !acceptedPrivacy} className="btn btn-primary w-full py-3 text-sm" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', borderColor: 'rgba(124,58,237,0.3)', boxShadow: '0 0 16px rgba(124,58,237,0.25)' }}>
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Quero receber os melhores preços
                </button>
              </form>
              <button onClick={handleClose} className="w-full mt-2 text-xs py-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Não, obrigado</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
