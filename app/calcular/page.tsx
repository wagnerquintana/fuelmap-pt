'use client'

import { useState } from 'react'
import { Calculator, Fuel, TrendingDown, Loader2, CheckCircle, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { FUEL_TYPES, FUEL_LABELS } from '@/lib/utils'

const FUEL_PRICES: Record<string, number> = {
  'Gasolina simples 95': 1.85,
  'Gasolina especial 95': 1.92,
  'Gasolina especial 98': 2.05,
  'Gasóleo simples': 1.75,
  'Gasóleo especial': 1.82,
  'GPL Auto': 0.85,
}

export default function CalcularPage() {
  const [km, setKm] = useState('')
  const [consumo, setConsumo] = useState('')
  const [fuelType, setFuelType] = useState('Gasolina simples 95')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [showResult, setShowResult] = useState(false)

  const kmNum = parseFloat(km) || 0
  const consumoNum = parseFloat(consumo) || 0
  const currentPrice = FUEL_PRICES[fuelType] || 1.85
  const bestPrice = currentPrice * 0.88

  const custoAtual = (kmNum / 100) * consumoNum * currentPrice
  const custoBest = (kmNum / 100) * consumoNum * bestPrice
  const poupancaMes = custoAtual - custoBest
  const poupancaAno = poupancaMes * 12
  const litrosMes = (kmNum / 100) * consumoNum

  const canCalculate = kmNum > 0 && consumoNum > 0

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setEmailError('')

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source: 'calculator',
        fuel_type: fuelType,
        metadata: { km: kmNum, consumo: consumoNum, poupanca_mes: poupancaMes.toFixed(2) },
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSubmitted(true)
      setShowResult(true)
    } else {
      setEmailError('Erro ao processar. Tenta novamente.')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-6 transition-all hover:opacity-80"
          style={{
            background: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box',
            border: '1.5px solid transparent',
            color: '#4f46e5',
          }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          Voltar ao mapa
        </Link>

        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
            }}
          >
            <Calculator size={28} className="text-white" />
          </div>
          <h1
            className="text-3xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Calculadora de Poupança
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Descobre quanto podes poupar por mês usando os postos mais baratos
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* ═══ Formulário ═══ */}
        <div
          className="rounded-3xl p-6 mb-5"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: 'var(--shadow-card), 0 0 0 1px rgba(255,255,255,0.7) inset',
            border: '1px solid rgba(226,232,240,0.5)',
          }}
        >
          <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <Fuel size={16} style={{ color: 'var(--color-primary)' }} />
            Os teus dados de consumo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-xs block mb-1.5">Km por mês</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 1500"
                  value={km}
                  onChange={e => setKm(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-12"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>km</span>
              </div>
            </div>

            <div>
              <label className="label-xs block mb-1.5">Consumo médio</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 6.5"
                  value={consumo}
                  onChange={e => setConsumo(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-20"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>L/100km</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="label-xs block mb-2">Tipo de combustível</label>
            <div className="flex gap-2 flex-wrap">
              {FUEL_TYPES.filter(t => t !== 'all').map(type => {
                const active = fuelType === type
                return (
                  <button
                    key={type}
                    onClick={() => setFuelType(type)}
                    className="text-[11px] px-3.5 py-1.5 rounded-full font-bold"
                    style={active ? {
                      background: 'linear-gradient(rgba(241,245,255,0.95), rgba(241,245,255,0.95)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box',
                      border: '1.5px solid transparent',
                      color: '#4f46e5',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.10), 0 4px 16px rgba(59,130,246,0.18)',
                      transform: 'translateY(-1px)',
                    } : {
                      background: 'rgba(255,255,255,0.78)',
                      border: '1px solid rgba(203,213,225,0.5)',
                      color: '#94a3b8',
                    }}
                  >
                    {FUEL_LABELS[type]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══ Resultado ═══ */}
        {canCalculate && (
          <div
            className="rounded-3xl p-6 mb-5 animate-slide-up"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'var(--shadow-card), 0 0 0 1px rgba(255,255,255,0.7) inset',
              border: '1px solid rgba(226,232,240,0.5)',
            }}
          >
            <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown size={16} className="text-green-500" />
              O teu resultado
            </h2>

            {/* Comparação atual vs melhor */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
                <p className="label-xs block mb-1" style={{ color: '#dc2626' }}>Gastas</p>
                <p className="text-2xl font-black" style={{ color: '#dc2626' }}>{custoAtual.toFixed(0)}€</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#f87171' }}>por mês</p>
              </div>
              <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                <p className="label-xs block mb-1" style={{ color: '#16a34a' }}>Posto + barato</p>
                <p className="text-2xl font-black" style={{ color: '#16a34a' }}>{custoBest.toFixed(0)}€</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#4ade80' }}>por mês</p>
              </div>
            </div>

            {/* Gate de email OU resultado completo */}
            {!showResult ? (
              <div
                className="rounded-2xl p-5 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}
              >
                {/* Shine */}
                <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }} />

                <div
                  className="text-4xl font-black mb-2 select-none"
                  style={{ WebkitTextStroke: '2px #d1d5db', color: 'transparent', filter: 'blur(6px)' }}
                >
                  €{poupancaMes.toFixed(0)}/mês
                </div>

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <Zap size={14} className="text-amber-500" fill="currentColor" />
                  <p className="text-sm font-bold text-gray-700">
                    Podes poupar até <strong className="text-indigo-600">€{poupancaAno.toFixed(0)} por ano</strong>
                  </p>
                </div>

                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Introduz o teu email para ver o relatório completo
                </p>

                {submitted ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                    <CheckCircle size={18} />
                    Relatório enviado para {email}!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="o-teu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: 'white',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-50 shrink-0 relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                      <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                      Ver resultado
                    </button>
                  </form>
                )}
                {emailError && <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>{emailError}</p>}
              </div>
            ) : (
              /* ── Resultado completo ── */
              <div className="space-y-3 animate-slide-up">
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}
                >
                  <p className="label-xs block mb-1" style={{ color: '#16a34a' }}>A tua poupança</p>
                  <p className="text-5xl font-black" style={{ color: '#16a34a' }}>€{poupancaMes.toFixed(0)}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#22c55e' }}>
                    por mês · €{poupancaAno.toFixed(0)} por ano
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Litros/mês', value: litrosMes.toFixed(0) + ' L' },
                    { label: 'Preço atual', value: currentPrice.toFixed(3) + ' €/L' },
                    { label: 'Melhor preço', value: bestPrice.toFixed(3) + ' €/L' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-sm font-black mt-0.5" style={{ color: 'var(--text)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
                  <Fuel size={16} />
                  Ver os postos mais baratos no mapa
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {!canCalculate && (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              <Calculator size={28} style={{ color: 'var(--text-dim)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Preenche os campos acima para ver a tua poupança
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
