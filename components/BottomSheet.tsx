'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, MapPin, Star, TrendingDown, Fuel, Award, Bell } from 'lucide-react'
import { Station, StationFilters } from '@/types'
import { formatPrice, getPriceForFuel, FUEL_LABELS, DISTRICTS } from '@/lib/utils'
import AlertModal from './AlertModal'

interface BottomSheetProps {
  stations: Station[]
  loading: boolean
  filters: StationFilters
  selectedStation: Station | null
  favorites: Set<string>
  onSelectStation: (s: Station) => void
  onToggleFavorite: (id: string) => void
  onFiltersChange: (f: Partial<StationFilters>) => void
}

const RANK_CONFIG = [
  {
    label: 'Mais Barato',
    gradient: 'linear-gradient(135deg, #00c853, #00e676)',
    glow: 'rgba(0,200,83,0.22)',
    badge: '#00c853',
    badgeBg: 'rgba(0,200,83,0.10)',
    softBg: '#f0fdf4',
    icon: <TrendingDown size={10} />,
  },
  {
    label: '2º Lugar',
    gradient: 'linear-gradient(135deg, #1565c0, #3b82f6)',
    glow: 'rgba(59,130,246,0.22)',
    badge: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.10)',
    softBg: '#eff6ff',
    icon: <Fuel size={10} />,
  },
  {
    label: '3º Lugar',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    glow: 'rgba(245,158,11,0.22)',
    badge: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.10)',
    softBg: '#fffbeb',
    icon: <Award size={10} />,
  },
  {
    label: '4º Lugar',
    gradient: 'linear-gradient(135deg, #6d28d9, #a78bfa)',
    glow: 'rgba(167,139,250,0.22)',
    badge: '#8b5cf6',
    badgeBg: 'rgba(139,92,246,0.10)',
    softBg: '#f5f3ff',
    icon: <Star size={10} />,
  },
  {
    label: '5º Lugar',
    gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    glow: 'rgba(6,182,212,0.22)',
    badge: '#06b6d4',
    badgeBg: 'rgba(6,182,212,0.10)',
    softBg: '#ecfeff',
    icon: <MapPin size={10} />,
  },
  {
    label: '6º Lugar',
    gradient: 'linear-gradient(135deg, #9d174d, #ec4899)',
    glow: 'rgba(236,72,153,0.22)',
    badge: '#ec4899',
    badgeBg: 'rgba(236,72,153,0.10)',
    softBg: '#fdf2f8',
    icon: <TrendingDown size={10} />,
  },
]

function getPriceColor(price: number | null) {
  if (price === null) return '#d1d5db'
  if (price < 1.5) return '#00c853'
  if (price < 1.7) return '#3b82f6'
  return '#ef4444'
}

function getPriceBg(price: number | null) {
  if (price === null) return '#f9fafb'
  if (price < 1.5) return '#f0fdf4'
  if (price < 1.7) return '#eff6ff'
  return '#fef2f2'
}

export default function BottomSheet({
  stations, loading, filters, selectedStation,
  favorites, onSelectStation, onToggleFavorite, onFiltersChange,
}: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const [alertStation, setAlertStation] = useState<Station | null>(null)

  const sorted = useMemo(() => {
    return [...stations].sort((a, b) => {
      const pa = getPriceForFuel(a, filters.fuelType)
      const pb = getPriceForFuel(b, filters.fuelType)
      if (pa === null && pb === null) return 0
      if (pa === null) return 1
      if (pb === null) return -1
      return pa - pb
    })
  }, [stations, filters.fuelType])

  const top6 = sorted.slice(0, 6)
  const cheapest = sorted.find(s => getPriceForFuel(s, filters.fuelType) !== null)
  const cheapestPrice = cheapest ? getPriceForFuel(cheapest, filters.fuelType) : null

  const avgPrice = useMemo(() => {
    const withPrices = sorted.filter(s => getPriceForFuel(s, filters.fuelType) !== null)
    if (withPrices.length < 3) return null
    const sample = withPrices.slice(0, 100)
    return sample.reduce((sum, s) => sum + getPriceForFuel(s, filters.fuelType)!, 0) / sample.length
  }, [sorted, filters.fuelType])

  const savings = cheapestPrice !== null && avgPrice !== null
    ? avgPrice - cheapestPrice
    : null

  return (
    <div className="h-full flex flex-col bg-white" style={{ boxShadow: '0 -8px 40px rgba(59,130,246,0.08)' }}>
      {/* Faixa accent gradient no topo */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' }} />

      {/* Header */}
      <div
        className="px-4 pt-3 pb-2.5 flex items-center justify-between flex-shrink-0 gap-3"
        style={{ borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)' }}
      >
        {/* Preço + label */}
        <div className="min-w-0">
          <p className="label-xs">{FUEL_LABELS[filters.fuelType] || filters.fuelType}</p>
          <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
            {loading ? (
              <div className="h-7 w-28 skeleton" />
            ) : cheapestPrice !== null ? (
              <>
                <span
                  className="text-3xl font-black tracking-tight"
                  style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {cheapestPrice.toFixed(3)}
                </span>
                <span className="text-sm font-semibold text-gray-400">€/L</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', color: '#15803d' }}
                >
                  melhor preço
                </span>
                {savings !== null && savings > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    poupa {savings.toFixed(3)} €/L
                  </span>
                )}
              </>
            ) : stations.length > 0 ? (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                {FUEL_LABELS[filters.fuelType] || filters.fuelType} não disponível.
              </span>
            ) : (
              <span className="text-2xl font-black text-gray-300">—</span>
            )}
          </div>
        </div>

        {/* Stats + controlos */}
        <div className="flex items-center gap-2 shrink-0">
          {avgPrice !== null && (
            <div className="text-right hidden xs:block">
              <p className="label-xs">Média</p>
              <p className="text-xs font-black" style={{ color: '#334155' }}>
                {avgPrice.toFixed(3)}<span className="text-[9px] font-medium text-gray-400 ml-0.5">€/L</span>
              </p>
            </div>
          )}
          <div className="w-px h-7 bg-gray-100 hidden xs:block" />
          <div className="text-right hidden sm:block">
            <p className="label-xs">Postos</p>
            <p className="text-xs font-black" style={{ color: '#334155' }}>{stations.length}</p>
          </div>
          <div className="w-px h-7 bg-gray-100 hidden sm:block" />
          <select
            value={filters.district}
            onChange={e => onFiltersChange({ district: e.target.value })}
            aria-label="Filtrar por distrito"
            className="text-[11px] font-bold border-0 outline-none rounded-xl px-2.5 py-1.5 max-w-[110px]"
            style={{
              background: filters.district ? 'linear-gradient(135deg, #eff6ff, #f5f3ff)' : '#f1f5f9',
              color: filters.district ? '#4f46e5' : '#475569',
              border: filters.district ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            }}
          >
            <option value="">Distrito</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={filters.sortBy}
            onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
            aria-label="Ordenar postos"
            className="text-[11px] font-bold border-0 outline-none rounded-xl px-2.5 py-1.5"
            style={{ background: '#f1f5f9', color: '#475569' }}
          >
            <option value="price_asc">Mais barato</option>
            <option value="price_desc">Mais caro</option>
            <option value="name">Nome A→Z</option>
          </select>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] hover:opacity-90"
            style={{
              background: 'linear-gradient(rgba(241,245,255,0.95), rgba(241,245,255,0.95)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box',
              border: '1.5px solid transparent',
              color: '#4f46e5',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.08), 0 4px 12px rgba(59,130,246,0.15)',
            }}
          >
            {expanded
              ? <><ChevronDown size={12} strokeWidth={2.5} />Cards</>
              : <><ChevronUp size={12} strokeWidth={2.5} />Ver lista</>
            }
          </button>
        </div>
      </div>

      {/* ═══ TOP 6 CARDS ═══ */}
      {!expanded && (
        <div className="flex-1 overflow-auto px-4 py-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[18px] overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <div className="h-10 skeleton" style={{ borderRadius: 0 }} />
                  <div className="px-3 py-3 space-y-2" style={{ background: 'var(--surface2)' }}>
                    <div className="h-3 skeleton w-4/5" />
                    <div className="h-2 skeleton w-1/2" />
                    <div className="h-2 skeleton w-2/3" />
                    <div className="h-7 skeleton w-2/5 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : top6.length > 0 && cheapestPrice === null ? (
            /* ─── Estado: combustível sem preços ─── */
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="relative mb-5">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}
                >
                  <Fuel size={32} style={{ color: '#c7d2fe' }} />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                >
                  ✕
                </div>
              </div>
              <p className="text-base font-black text-gray-800 mb-1 leading-snug">
                {FUEL_LABELS[filters.fuelType] || filters.fuelType}
              </p>
              <p className="text-sm font-medium text-gray-400 mb-6">
                não disponível neste posto de combustível.
              </p>
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                <button
                  onClick={() => onFiltersChange({ fuelType: 'Gasolina simples 95' })}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white active:scale-[0.98] relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)',
                    boxShadow: '0 6px 24px rgba(99,102,241,0.40), 0 1px 0 rgba(255,255,255,0.25) inset',
                  }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
                  Mudar para Gasolina 95
                </button>
                <button
                  onClick={() => onFiltersChange({ fuelType: 'all' })}
                  className="w-full py-3 rounded-2xl font-bold text-sm active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box, linear-gradient(135deg, #cbd5e1, #94a3b8) border-box',
                    border: '1.5px solid transparent',
                    color: '#475569',
                  }}
                >
                  Ver todos os combustíveis
                </button>
              </div>
            </div>
          ) : top6.length > 0 ? (
            /* ─── Grid de cards ─── */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {top6.map((station, i) => {
                const price = getPriceForFuel(station, filters.fuelType)
                const isFav = favorites.has(station.id)
                const cfg = RANK_CONFIG[i]
                const isSelected = selectedStation?.id === station.id
                // Savings vs cheapest (só para postos 2-6)
                const savingsVsFirst = i > 0 && price !== null && cheapestPrice !== null
                  ? price - cheapestPrice
                  : null

                return (
                  <div
                    key={station.id}
                    onClick={() => onSelectStation(station)}
                    className="animate-slide-up cursor-pointer rounded-[18px] overflow-hidden press-scale"
                    style={{
                      animationDelay: `${i * 45}ms`,
                      boxShadow: isSelected
                        ? `0 12px 36px ${cfg.glow}, 0 0 0 2px ${cfg.badge}`
                        : `0 4px 20px ${cfg.glow}, 0 1px 4px rgba(0,0,0,0.06)`,
                      transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                  >
                    {/* ── Gradient header ── */}
                    <div
                      className="px-3 pt-2 pb-2 flex items-center justify-between"
                      style={{ background: cfg.gradient, position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Shine no header */}
                      <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.16) 0%, transparent 60%)' }} />

                      {/* Rank badge */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px]"
                          style={{ background: 'rgba(0,0,0,0.18)', color: 'white' }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[9px] font-bold text-white opacity-90">{cfg.label}</span>
                      </div>

                      {/* Favorito */}
                      <span
                        onClick={e => { e.stopPropagation(); onToggleFavorite(station.id) }}
                        className="cursor-pointer p-1 rounded-full transition-transform hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.2)', color: isFav ? '#fef08a' : 'rgba(255,255,255,0.65)' }}
                      >
                        <Star size={11} fill={isFav ? 'currentColor' : 'none'} />
                      </span>
                    </div>

                    {/* ── Card body ── */}
                    <div className="px-3 pt-2.5 pb-2" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)' }}>
                      {/* Nome */}
                      <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2" style={{ minHeight: 30 }}>
                        {station.name}
                      </p>

                      {/* Marca */}
                      {station.brand && (
                        <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: cfg.badge }}>
                          {station.brand}
                        </p>
                      )}

                      {/* Localização */}
                      {station.municipality && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={8} className="text-gray-300 shrink-0" />
                          <p className="text-[9px] text-gray-400 truncate">{station.municipality}</p>
                        </div>
                      )}

                      {/* Preço + Bell */}
                      <div
                        className="mt-2 pt-2 flex items-end justify-between"
                        style={{ borderTop: `1.5px solid ${cfg.badgeBg}` }}
                      >
                        <div>
                          {price !== null ? (
                            <>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-[22px] font-black tracking-tight leading-none" style={{ color: cfg.badge }}>
                                  {price.toFixed(3)}
                                </span>
                                <span className="text-[9px] font-semibold text-gray-400 mb-0.5">€/L</span>
                              </div>
                              {savingsVsFirst !== null && (
                                <p className="text-[9px] font-semibold mt-0.5" style={{ color: '#94a3b8' }}>
                                  +{savingsVsFirst.toFixed(3)} vs 1º
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-300">Sem preço</span>
                          )}
                        </div>
                        <span
                          onClick={e => { e.stopPropagation(); setAlertStation(station) }}
                          className="cursor-pointer p-1.5 rounded-xl hover:scale-110 transition-transform"
                          style={{ background: cfg.badgeBg, color: cfg.badge }}
                          title="Criar alerta de preço"
                        >
                          <Bell size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-300">Nenhum posto encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ LISTA EXPANDIDA ═══ */}
      {expanded && (
        <div className="flex-1 overflow-y-auto">
          {sorted.map((station, idx) => {
            const price = getPriceForFuel(station, filters.fuelType)
            const isFav = favorites.has(station.id)
            const isSelected = selectedStation?.id === station.id
            const priceColor = getPriceColor(price)
            const priceBg = getPriceBg(price)

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 relative"
                style={{
                  background: isSelected ? 'var(--surface3)' : 'transparent',
                  borderBottom: '1px solid var(--surface2)',
                  borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderLeftColor = 'var(--border-hover)' } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' } }}
              >
                {/* Rank + preço */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: priceBg }}
                >
                  <span className="text-[8px] font-bold" style={{ color: priceColor, opacity: 0.6 }}>#{idx + 1}</span>
                  {price !== null ? (
                    <>
                      <span className="text-[13px] font-black leading-tight" style={{ color: priceColor }}>
                        {price.toFixed(3)}
                      </span>
                      <span className="text-[7px] font-semibold text-gray-400">€/L</span>
                    </>
                  ) : (
                    <span className="text-[8px] font-semibold text-gray-300 text-center px-1 leading-tight">Sem preço</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate leading-tight">{station.name}</p>
                  {station.brand && (
                    <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: priceColor }}>
                      {station.brand}
                    </p>
                  )}
                  {station.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={9} className="text-gray-300 shrink-0" />
                      <p className="text-[10px] text-gray-400 truncate">{station.address}</p>
                    </div>
                  )}
                  {station.fuels.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {station.fuels.filter(f => f.price).slice(0, 3).map(f => (
                        <span
                          key={f.type}
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: getPriceBg(f.price ?? null),
                            color: getPriceColor(f.price ?? null),
                          }}
                        >
                          {f.type.replace('Gasolina simples ', 'G').replace('Gasolina especial ', 'G+').replace('Gasóleo simples', 'Gsl').replace('Gasóleo especial', 'Gsl+')} {formatPrice(f.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-1 shrink-0">
                  <span
                    onClick={e => { e.stopPropagation(); onToggleFavorite(station.id) }}
                    className="p-2 rounded-xl cursor-pointer transition-all hover:scale-110"
                    style={{ background: isFav ? '#fef3c7' : '#f9fafb', color: isFav ? '#f59e0b' : '#d1d5db' }}
                  >
                    <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                  </span>
                  <span
                    onClick={e => { e.stopPropagation(); setAlertStation(station) }}
                    className="p-2 rounded-xl cursor-pointer transition-all hover:scale-110"
                    style={{ background: '#fff7ed', color: '#f97316' }}
                    title="Criar alerta de preço"
                  >
                    <Bell size={13} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {alertStation && (
        <AlertModal
          station={alertStation}
          defaultFuelType={filters.fuelType !== 'all' ? filters.fuelType : undefined}
          onClose={() => setAlertStation(null)}
        />
      )}
    </div>
  )
}
