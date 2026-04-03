'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Mail, Loader2, Sparkles } from 'lucide-react'
import { useEscapeKey } from '@/lib/useEscapeKey'
import PrivacyCheckbox from './PrivacyCheckbox'

interface EmailModalProps {
  onSend: (email: string) => Promise<{ error: any }>
  onClose: () => void
}

export default function EmailModal({ onSend, onClose }: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
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
    const { error } = await onSend(email)
    setLoading(false)
    if (error) setError('Erro ao enviar. Tenta novamente.')
    else setSent(true)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-6 sm:p-4 transition-all duration-280"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'none',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-title"
        className="w-full max-w-sm rounded-2xl overflow-hidden transition-all duration-280"
        style={{
          boxShadow: '0 0 48px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.1)',
          border: '1px solid var(--border)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {sent ? (
          <>
            <div className="px-6 pt-6 pb-5 text-center relative" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><X size={14} /></button>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.20)' }}>
                <Mail size={26} className="text-white" />
              </div>
              <h2 id="email-modal-title" className="text-xl font-black text-white mb-1">Link enviado!</h2>
              <p className="text-sm text-white/75">Verifica <strong className="text-white">{email}</strong> e clica no link para aceder.</p>
            </div>
            <div className="px-6 py-5" style={{ background: 'var(--bg-raised)' }}>
              <button onClick={handleClose} className="btn btn-primary w-full py-3 text-sm" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', borderColor: 'rgba(16,185,129,0.3)', boxShadow: '0 0 16px rgba(16,185,129,0.25)' }}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-6 pb-5 relative" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}><X size={14} /></button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h2 id="email-modal-title" className="text-lg font-black text-white leading-tight">Guardar favorito</h2>
                  <p className="text-xs text-white/70">Link mágico — sem passwords</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5" style={{ background: 'var(--bg-raised)' }}>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Insere o teu email para guardar as tuas bombas favoritas e aceder em qualquer dispositivo.
              </p>
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
                <button type="submit" disabled={loading || !acceptedPrivacy} className="btn btn-primary w-full py-3 text-sm">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Enviar link de acesso
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
