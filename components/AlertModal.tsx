'use client'

import { useState, useEffect } from 'react'
import { X, Bell, Loader2, CheckCircle } from 'lucide-react'
import { Station } from '@/types'
import { FUEL_TYPES, FUEL_LABELS } from '@/lib/utils'

interface AlertModalProps {
  station: Station
  defaultFuelType?: string
  onClose: () => void
}

export default function AlertModal({ station, defaultFuelType, onClose }: AlertModalProps) {
  const availableFuels = station.fuels.filter(f => f.price !== null)
  const [email, setEmail] = useState('')
  const [fuelType, setFuelType] = useState(defaultFuelType || availableFuels[0]?.type || '')
  const [priceLimit, setPriceLimit] = useState(() => {
    const fuel = station.fuels.find(f => f.type === fuelType)
    return fuel?.price ? (fuel.price - 0.05).toFixed(3) : ''
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
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
    if (!email || !fuelType || !priceLimit) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        station_id: station.id,
        fuel_type: fuelType,
        price_limit: parseFloat(priceLimit),
      }),
    })

    setLoading(false)
    if (res.ok) setDone(true)
    else setError('Erro ao criar alerta. Tenta novamente.')
  }

  const currentPrice = station.fuels.find(f => f.type === fuelType)?.price

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
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(255,255,255,0.20)' }}
              >
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Alerta criado!</h2>
              <p className="text-sm text-white/75">
                Avisamos quando <strong className="text-white">{fuelType}</strong>{' '}
                baixar de <strong className="text-white">{priceLimit} €/L</strong>.
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
            {/* Header gradient laranja/âmbar */}
            <div
              className="px-6 pt-6 pb-5 relative"
              style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}
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
                  <Bell size={22} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-white leading-tight">Alerta de Preço</h2>
                  <p className="text-xs text-white/70 truncate">{station.name}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Combustível */}
                <div>
                  <label className="label-xs block mb-1.5">Combustível</label>
                  <select
                    value={fuelType}
                    onChange={e => {
                      setFuelType(e.target.value)
                      const fuel = station.fuels.find(f => f.type === e.target.value)
                      if (fuel?.price) setPriceLimit((fuel.price - 0.05).toFixed(3))
                    }}
                    className="w-full text-sm rounded-xl px-3 py-2.5 outline-none transition-all"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    {availableFuels.map(f => (
                      <option key={f.type} value={f.type}>
                        {FUEL_LABELS[f.type] || f.type} — {f.price?.toFixed(3)} €/L
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preço limite */}
                <div>
                  <label className="label-xs block mb-1.5">Avisar quando baixar de</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.5"
                      max="3"
                      value={priceLimit}
                      onChange={e => setPriceLimit(e.target.value)}
                      required
                      className="w-full rounded-xl px-3 py-2.5 pr-12 text-sm outline-none transition-all font-mono"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#f97316')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>€/L</span>
                  </div>
                  {currentPrice && (
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>
                      Preço atual: <strong style={{ color: 'var(--text-muted)' }}>{currentPrice.toFixed(3)} €/L</strong>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="label-xs block mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="o-teu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#f97316')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>

                {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #c2410c, #f97316)' }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <Bell size={14} />
                  Criar alerta
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
