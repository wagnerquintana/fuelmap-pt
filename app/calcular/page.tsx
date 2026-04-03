'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calculator, Fuel, TrendingDown, Loader2, CheckCircle, ArrowLeft, Zap, MapPin } from 'lucide-react'
import Link from 'next/link'
import { FUEL_TYPES, FUEL_LABELS, DISTRICTS } from '@/lib/utils'
import PrivacyCheckbox from '@/components/PrivacyCheckbox'
import { Station } from '@/types'

function getPriceForFuel(station: Station, fuelType: string): number | null {
  const fuel = station.fuels.find(f => f.type === fuelType)
  return fuel?.price ?? null
}

export default function CalcularPage() {
  const [district, setDistrict] = useState('')
  const [km, setKm] = useState('')
  const [consumo, setConsumo] = useState('')
  const [fuelType, setFuelType] = useState('Gasolina simples 95')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Real price data
  const [stations, setStations] = useState<Station[]>([])
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [bestPrice, setBestPrice] = useState<number | null>(null)
  const [avgPrice, setAvgPrice] = useState<number | null>(null)
  const [bestStation, setBestStation] = useState<string>('')
  const [stationCount, setStationCount] = useState(0)

  // Fetch real prices when district changes
  const fetchPrices = useCallback(async () => {
    if (!district) {
      setBestPrice(null)
      setAvgPrice(null)
      setBestStation('')
      setStationCount(0)
      return
    }
    setLoadingPrices(true)
    const res = await fetch(`/api/stations?district=${encodeURIComponent(district)}`)
    if (res.ok) {
      const data: Station[] = await res.json()
      setStations(data)

      // Calculate real prices for selected fuel
      const prices = data
        .map(s => ({ name: s.name, price: getPriceForFuel(s, fuelType) }))
        .filter((p): p is { name: string; price: number } => p.price !== null)
        .sort((a, b) => a.price - b.price)

      if (prices.length > 0) {
        setBestPrice(prices[0].price)
        setBestStation(prices[0].name)
        setAvgPrice(prices.reduce((sum, p) => sum + p.price, 0) / prices.length)
        setStationCount(prices.length)
      } else {
        setBestPrice(null)
        setAvgPrice(null)
        setBestStation('')
        setStationCount(0)
      }
    }
    setLoadingPrices(false)
  }, [district, fuelType])

  useEffect(() => {
    const t = setTimeout(fetchPrices, 300)
    return () => clearTimeout(t)
  }, [fetchPrices])

  const kmNum = parseFloat(km) || 0
  const consumoNum = parseFloat(consumo) || 0
  const litrosMes = (kmNum / 100) * consumoNum

  const canCalculate = kmNum > 0 && consumoNum > 0 && bestPrice !== null && avgPrice !== null

  const custoMedia = canCalculate ? litrosMes * avgPrice! : 0
  const custoBest = canCalculate ? litrosMes * bestPrice! : 0
  const poupancaMes = custoMedia - custoBest
  const poupancaAno = poupancaMes * 12

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
        metadata: { km: kmNum, consumo: consumoNum, district, poupanca_mes: poupancaMes.toFixed(2), best_station: bestStation },
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

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
  }

  return (
    <div className="h-dvh overflow-y-auto overscroll-contain" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg mb-6 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
          >
            <Calculator size={26} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'white' }}>
            Calculadora de Poupança
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Descobre quanto poupas usando os postos mais baratos do teu distrito
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Formulario */}
        <div className="rounded-2xl p-5 sm:p-6 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Distrito — primeiro campo */}
          <div className="mb-5">
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <MapPin size={11} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
              Onde abasteces?
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                ...inputStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px',
                paddingRight: '36px',
              }}
            >
              <option value="" style={{ background: '#1a1a2e' }}>Seleciona o teu distrito</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d} style={{ background: '#1a1a2e', color: 'white' }}>{d}</option>
              ))}
            </select>
            {district && !loadingPrices && bestPrice !== null && (
              <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span><strong style={{ color: 'var(--green)' }}>{bestPrice.toFixed(3)} €/L</strong> melhor</span>
                <span>·</span>
                <span><strong style={{ color: 'var(--color-primary)' }}>{avgPrice?.toFixed(3)} €/L</strong> media</span>
                <span>·</span>
                <span>{stationCount} postos</span>
              </div>
            )}
            {loadingPrices && (
              <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Loader2 size={12} className="animate-spin" /> A carregar preços reais...
              </div>
            )}
          </div>

          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
            <Fuel size={16} style={{ color: 'var(--color-primary)' }} />
            Os teus dados de consumo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Km por mês</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 1500"
                  value={km}
                  onChange={e => setKm(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-12"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(129,140,248,0.15)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>km</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Consumo médio</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 6.5"
                  value={consumo}
                  onChange={e => setConsumo(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-20"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(129,140,248,0.15)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>L/100km</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Tipo de combustível</label>
            <div className="flex gap-2 flex-wrap">
              {FUEL_TYPES.filter(t => t !== 'all').map(type => (
                <button
                  key={type}
                  onClick={() => setFuelType(type)}
                  className={`pill ${fuelType === type ? 'pill-active' : ''}`}
                >
                  {FUEL_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultado */}
        {canCalculate && (
          <div className="rounded-2xl p-5 sm:p-6 mb-5 animate-slide-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
              <TrendingDown size={16} style={{ color: 'var(--green)' }} />
              O teu resultado em {district}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#f87171' }}>Preço médio</p>
                <p className="text-2xl font-black" style={{ color: '#f87171' }}>{custoMedia.toFixed(0)}€</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(248,113,113,0.6)' }}>por mês</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#34d399' }}>Posto + barato</p>
                <p className="text-2xl font-black" style={{ color: '#34d399' }}>{custoBest.toFixed(0)}€</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(52,211,153,0.6)' }}>por mês</p>
              </div>
            </div>

            {/* Best station name */}
            {bestStation && (
              <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(52,211,153,0.1)' }}>
                <MapPin size={11} className="inline mr-1" style={{ verticalAlign: '-1px', color: 'var(--green)' }} />
                Mais barato: <strong style={{ color: 'white' }}>{bestStation}</strong> — {bestPrice!.toFixed(3)} €/L
              </p>
            )}

            {!showResult ? (
              <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.12)' }}>
                <div className="text-4xl font-black mb-2 select-none" style={{ color: 'rgba(255,255,255,0.08)', filter: 'blur(6px)' }}>
                  €{poupancaMes.toFixed(0)}/mes
                </div>

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <Zap size={14} style={{ color: 'var(--gold)' }} fill="currentColor" />
                  <p className="text-sm font-bold" style={{ color: 'white' }}>
                    Podes poupar até <strong style={{ color: 'var(--color-primary)' }}>€{poupancaAno.toFixed(0)} por ano</strong>
                  </p>
                </div>

                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Introduz o teu email para ver o relatório completo
                </p>

                {submitted ? (
                  <div className="flex items-center justify-center gap-2 font-bold text-sm" style={{ color: 'var(--green)' }}>
                    <CheckCircle size={18} />
                    Relatório enviado para {email}!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="o-teu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(129,140,248,0.15)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                      <button type="submit" disabled={loading || !acceptedPrivacy} className="btn btn-primary shrink-0">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Ver resultado
                      </button>
                    </div>
                    <PrivacyCheckbox checked={acceptedPrivacy} onChange={setAcceptedPrivacy} />
                  </form>
                )}
                {emailError && <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>{emailError}</p>}
              </div>
            ) : (
              <div className="space-y-3 animate-slide-up">
                <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', boxShadow: '0 0 24px rgba(52,211,153,0.1)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#34d399' }}>A tua poupança</p>
                  <p className="text-5xl font-black" style={{ color: '#34d399' }}>€{poupancaMes.toFixed(0)}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: 'rgba(52,211,153,0.7)' }}>
                    por mês · €{poupancaAno.toFixed(0)} por ano
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Litros/mês', value: litrosMes.toFixed(0) + ' L' },
                    { label: 'Média distrito', value: avgPrice!.toFixed(3) + ' €/L' },
                    { label: 'Melhor preço', value: bestPrice!.toFixed(3) + ' €/L' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                      <p className="text-sm font-black mt-0.5" style={{ color: 'white' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/?district=${encodeURIComponent(district)}`} className="btn btn-primary w-full py-3 text-sm">
                  <Fuel size={16} />
                  Ver postos em {district}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!canCalculate && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Calculator size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {!district
                ? 'Seleciona o teu distrito para comecar'
                : loadingPrices
                ? 'A carregar preços...'
                : bestPrice === null
                ? `Sem preços de ${FUEL_LABELS[fuelType]} em ${district}`
                : 'Preenche km e consumo para calcular'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
