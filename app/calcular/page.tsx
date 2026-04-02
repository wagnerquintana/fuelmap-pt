'use client'

import { useState } from 'react'
import { Calculator, Fuel, TrendingDown, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
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
  const bestPrice = currentPrice * 0.88 // simula poupança de ~12% no melhor posto

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)' }}>
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao mapa
        </Link>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            <Calculator size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Calculadora de Poupança</h1>
          <p className="text-gray-500">Descobre quanto podes poupar por mês usando os postos mais baratos</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Fuel size={18} className="text-blue-500" />
            Os teus dados de consumo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Km por mês</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  placeholder="Ex: 1500"
                  value={km}
                  onChange={e => setKm(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">km</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Consumo médio</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 6.5"
                  value={consumo}
                  onChange={e => setConsumo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">L/100km</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de combustível</label>
            <div className="flex gap-2 flex-wrap mt-2">
              {FUEL_TYPES.filter(t => t !== 'all').map(type => (
                <button
                  key={type}
                  onClick={() => setFuelType(type)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all border"
                  style={{
                    background: fuelType === type ? '#3b82f6' : 'transparent',
                    color: fuelType === type ? '#fff' : '#6b7280',
                    borderColor: fuelType === type ? '#3b82f6' : '#e5e7eb',
                  }}
                >
                  {FUEL_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview parcial — sempre visível */}
        {canCalculate && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-green-500" />
              O teu resultado
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl p-4" style={{ background: '#fef2f2' }}>
                <p className="text-xs font-semibold text-red-400 mb-1">Gastas atualmente</p>
                <p className="text-2xl font-black text-red-500">{custoAtual.toFixed(0)}€</p>
                <p className="text-xs text-red-300 mt-0.5">por mês</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: '#f0fdf4' }}>
                <p className="text-xs font-semibold text-green-500 mb-1">No posto mais barato</p>
                <p className="text-2xl font-black text-green-600">{custoBest.toFixed(0)}€</p>
                <p className="text-xs text-green-400 mt-0.5">por mês</p>
              </div>
            </div>

            {/* Gate de email para ver poupança total */}
            {!showResult ? (
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}
              >
                <div className="text-4xl font-black text-transparent mb-1 select-none"
                  style={{ WebkitTextStroke: '2px #d1d5db', filter: 'blur(6px)' }}>
                  €{poupancaMes.toFixed(0)}/mês
                </div>
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Podes poupar até <strong className="text-blue-600">€{poupancaAno.toFixed(0)} por ano</strong> 🎉
                </p>
                <p className="text-xs text-gray-500 mb-4">Introduz o teu email para ver o relatório completo</p>

                {submitted ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
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
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-50 shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                      Ver resultado
                    </button>
                  </form>
                )}
                {emailError && <p className="text-xs text-red-500 mt-2">{emailError}</p>}
              </div>
            ) : (
              /* Resultado completo após email */
              <div className="space-y-3">
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}
                >
                  <p className="text-xs font-bold text-green-500 uppercase tracking-wide mb-1">A tua poupança</p>
                  <p className="text-5xl font-black text-green-600 mb-1">€{poupancaMes.toFixed(0)}</p>
                  <p className="text-sm text-green-500 font-semibold">por mês · €{poupancaAno.toFixed(0)} por ano</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Litros/mês', value: litrosMes.toFixed(0) + ' L' },
                    { label: 'Preço atual', value: currentPrice.toFixed(3) + ' €/L' },
                    { label: 'Melhor preço', value: bestPrice.toFixed(3) + ' €/L' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3 bg-gray-50">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-black text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  <Fuel size={16} />
                  Ver os postos mais baratos no mapa
                </Link>
              </div>
            )}
          </div>
        )}

        {!canCalculate && (
          <div className="text-center py-8 text-gray-400">
            <Calculator size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Preenche os campos acima para ver a tua poupança</p>
          </div>
        )}
      </div>
    </div>
  )
}
