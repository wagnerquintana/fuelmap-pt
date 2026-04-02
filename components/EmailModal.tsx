'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Loader2, Sparkles } from 'lucide-react'

interface EmailModalProps {
  onSend: (email: string) => Promise<{ error: any }>
  onClose: () => void
}

export default function EmailModal({ onSend, onClose }: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

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
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-280"
      style={{
        background: visible ? 'var(--backdrop-bg)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'var(--backdrop-blur)' : 'none',
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden transition-all duration-280"
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
          opacity: visible ? 1 : 0,
        }}
      >
        {sent ? (
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
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                <Mail size={26} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Link enviado!</h2>
              <p className="text-sm text-white/75">
                Verifica <strong className="text-white">{email}</strong> e clica no link para aceder.
              </p>
            </div>
            <div className="bg-white px-6 py-5">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                Fechar
              </button>
            </div>
          </>
        ) : (
          /* ── Formulário ── */
          <>
            {/* Header gradiente indigo/roxo */}
            <div
              className="px-6 pt-6 pb-5 relative"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">Guardar favorito</h2>
                  <p className="text-xs text-white/70">Link mágico — sem passwords</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Insere o teu email para guardar as tuas bombas favoritas e aceder em qualquer dispositivo.
              </p>
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
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
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
