'use client'

import { useState } from 'react'
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
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ background: 'var(--backdrop-bg)', backdropFilter: 'var(--backdrop-blur)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>

        {done ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Alerta criado!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Avisamos quando <strong>{fuelType}</strong> em <strong>{station.name}</strong> baixar de <strong>{priceLimit} €/L</strong>.
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition">
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">Alerta de Preço</h2>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{station.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Combustível */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Combustível</label>
                <select
                  value={fuelType}
                  onChange={e => {
                    setFuelType(e.target.value)
                    const fuel = station.fuels.find(f => f.type === e.target.value)
                    if (fuel?.price) setPriceLimit((fuel.price - 0.05).toFixed(3))
                  }}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                >
                  {availableFuels.map(f => (
                    <option key={f.type} value={f.type}>
                      {FUEL_LABELS[f.type] || f.type} — {f.price?.toFixed(3)} €/L atual
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço limite */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Avisa-me quando baixar de
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.001"
                    min="0.5"
                    max="3"
                    value={priceLimit}
                    onChange={e => setPriceLimit(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">€/L</span>
                </div>
                {currentPrice && (
                  <p className="text-[10px] text-gray-400 mt-1">Preço atual: <strong>{currentPrice.toFixed(3)} €/L</strong></p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  placeholder="o-teu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                <Bell size={14} />
                Criar alerta
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
