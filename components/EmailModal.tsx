'use client'

import { useState } from 'react'
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
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-2xl relative"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-hover)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={16} />
        </button>

        {sent ? (
          <div className="text-center py-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,230,118,0.2)' }}
            >
              <Mail size={24} style={{ color: 'var(--green)' }} />
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Link enviado!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Verifica o email <strong style={{ color: 'var(--accent)' }}>{email}</strong> e clica no link para aceder.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,201,71,0.2)' }}
              >
                <Sparkles size={20} style={{ color: 'var(--gold)' }} />
              </div>
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Guardar favorito</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Insere o teu email para guardar as tuas bombas favoritas. Recebes um link mágico — sem passwords.
              </p>
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
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar link de acesso
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
