'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, MapPin, Star, TrendingDown, Fuel, Award, Bell } from 'lucide-react'
import { Station, StationFilters } from '@/types'
import { formatPrice, getPriceForFuel, FUEL_LABELS } from '@/lib/utils'
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
    icon: <TrendingDown size={10} />,
  },
  {
    label: '2º Lugar',
    gradient: 'linear-gradient(135deg, #1565c0, #3b82f6)',
    glow: 'rgba(59,130,246,0.22)',
    badge: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.10)',
    icon: <Fuel size={10} />,
  },
  {
    label: '3º Lugar',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    glow: 'rgba(245,158,11,0.22)',
    badge: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.10)',
    icon: <Award size={10} />,
  },
  {
    label: '4º Lugar',
    gradient: 'linear-gradient(135deg, #6d28d9, #a78bfa)',
    glow: 'rgba(167,139,250,0.22)',
    badge: '#8b5cf6',
    badgeBg: 'rgba(139,92,246,0.10)',
    icon: <Star size={10} />,
  },
  {
    label: '5º Lugar',
    gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    glow: 'rgba(6,182,212,0.22)',
    badge: '#06b6d4',
    badgeBg: 'rgba(6,182,212,0.10)',
    icon: <MapPin size={10} />,
  },
  {
    label: '6º Lugar',
    gradient: 'linear-gradient(135deg, #9d174d, #ec4899)',
    glow: 'rgba(236,72,153,0.22)',
    badge: '#ec4899',
    badgeBg: 'rgba(236,72,153,0.10)',
    icon: <TrendingDown size={10} />,
  },
]

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

  return (
    <div className="h-full flex flex-col bg-white" style={{ borderTop: '1px solid #e8ecf0' }}>

      {/* Header */}
      <div
        className="px-5 pt-3 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid #f1f5f9' }}
      >
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {FUEL_LABELS[filters.fuelType] || filters.fuelType}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            {loading ? (
              <div className="h-7 w-28 bg-gray-100 rounded-lg animate-pulse" />
            ) : cheapestPrice !== null ? (
              <>
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {cheapestPrice.toFixed(3)}
                </span>
                <span className="text-sm font-medium text-gray-400">€/L</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  melhor preço
                </span>
              </>
            ) : (
              <span className="text-2xl font-black text-gray-300">—</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {avgPrice !== null && (
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Média</p>
              <p className="text-sm font-black text-gray-700">{avgPrice.toFixed(3)} €/L</p>
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Postos</p>
            <p className="text-sm font-black text-gray-700">{stations.length}</p>
          </div>
          <select
            value={filters.sortBy}
            onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
            className="text-[11px] font-semibold border-0 outline-none bg-gray-100 rounded-xl px-3 py-2 text-gray-600"
          >
            <option value="price_asc">Mais barato</option>
            <option value="price_desc">Mais caro</option>
            <option value="name">Nome A→Z</option>
          </select>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            title={expanded ? 'Ver cards' : 'Ver lista completa'}
          >
            {expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Top 6 — grid 2×3 (mobile: 2 cols, tablet+: 3 cols) */}
      {!expanded && (
        <div className="flex-1 overflow-auto px-5 py-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[18px] bg-gray-100 animate-pulse" style={{ minHeight: 128 }} />
              ))}
            </div>
          ) : top6.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {top6.map((station, i) => {
                const price = getPriceForFuel(station, filters.fuelType)
                const isFav = favorites.has(station.id)
                const cfg = RANK_CONFIG[i]
                const isSelected = selectedStation?.id === station.id

                return (
                  <div
                    key={station.id}
                    onClick={() => onSelectStation(station)}
                    className="cursor-pointer transition-all duration-200 rounded-[18px] overflow-hidden"
                    style={{
                      boxShadow: isSelected
                        ? `0 8px 28px ${cfg.glow}, 0 0 0 2px ${cfg.badge}`
                        : `0 3px 16px ${cfg.glow}`,
                      transform: isSelected ? 'translateY(-2px) scale(1.01)' : 'none',
                    }}
                  >
                    {/* Gradient header */}
                    <div
                      className="px-3 pt-2.5 pb-2 flex items-center justify-between"
                      style={{ background: cfg.gradient }}
                    >
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.22)' }}
                      >
                        <span style={{ color: 'white', opacity: 0.9 }}>{cfg.icon}</span>
                        <span className="text-[9px] font-bold text-white">{cfg.label}</span>
                      </div>
                      <span
                        onClick={e => { e.stopPropagation(); onToggleFavorite(station.id) }}
                        className="cursor-pointer p-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.2)', color: isFav ? '#fef08a' : 'rgba(255,255,255,0.7)' }}
                      >
                        <Star size={11} fill={isFav ? 'currentColor' : 'none'} />
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="px-3 py-2.5 bg-white">
                      <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2" style={{ minHeight: 28 }}>
                        {station.name}
                      </p>
                      {station.brand && (
                        <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: cfg.badge }}>
                          {station.brand}
                        </p>
                      )}
                      {station.municipality && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={8} className="text-gray-300 shrink-0" />
                          <p className="text-[9px] text-gray-400 truncate">{station.municipality}</p>
                        </div>
                      )}
                      <div
                        className="mt-2 pt-2 flex items-center justify-between"
                        style={{ borderTop: `1.5px solid ${cfg.badgeBg}` }}
                      >
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black tracking-tight" style={{ color: cfg.badge }}>
                            {price !== null ? price.toFixed(3) : '—'}
                          </span>
                          <span className="text-[9px] font-semibold text-gray-400">€/L</span>
                        </div>
                        <span
                          onClick={e => { e.stopPropagation(); setAlertStation(station) }}
                          className="cursor-pointer p-1.5 rounded-xl"
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
            <div className="flex items-center justify-center h-full py-8 text-gray-300">
              <p className="text-sm">Nenhum posto encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Lista expandida */}
      {expanded && (
        <div className="flex-1 overflow-y-auto">
          {sorted.map((station, idx) => {
            const price = getPriceForFuel(station, filters.fuelType)
            const isFav = favorites.has(station.id)
            const isSelected = selectedStation?.id === station.id
            const priceColor = price === null ? '#d1d5db'
              : price < 1.5 ? '#00c853'
              : price < 1.7 ? '#3b82f6'
              : '#ef4444'
            const priceBg = price === null ? '#f9fafb'
              : price < 1.5 ? '#f0fdf4'
              : price < 1.7 ? '#eff6ff'
              : '#fef2f2'

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                style={{
                  background: isSelected ? '#f0f7ff' : 'transparent',
                  borderBottom: '1px solid #f8fafc',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Rank + preço */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: priceBg }}
                >
                  <span className="text-[8px] font-bold text-gray-400">#{idx + 1}</span>
                  <span className="text-sm font-black leading-tight" style={{ color: priceColor }}>
                    {price !== null ? price.toFixed(2) : '—'}
                  </span>
                  <span className="text-[8px] text-gray-400">€/L</span>
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
                            background: (f.price ?? 0) < 1.5 ? '#f0fdf4' : (f.price ?? 0) < 1.7 ? '#eff6ff' : '#fef2f2',
                            color: (f.price ?? 0) < 1.5 ? '#00c853' : (f.price ?? 0) < 1.7 ? '#3b82f6' : '#ef4444',
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
                    className="p-2 rounded-xl cursor-pointer transition-all"
                    style={{ background: isFav ? '#fef3c7' : '#f9fafb', color: isFav ? '#f59e0b' : '#d1d5db' }}
                  >
                    <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                  </span>
                  <span
                    onClick={e => { e.stopPropagation(); setAlertStation(station) }}
                    className="p-2 rounded-xl cursor-pointer transition-all"
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

      {/* Alert Modal */}
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
