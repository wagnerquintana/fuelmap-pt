'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ArrowUp, SearchX, Zap, BatteryCharging, Plug } from 'lucide-react'
import { EVStation, StationFilters, AppMode } from '@/types'
import { getMaxPowerKW, formatPowerKW, getSpeedLabel, DISTRICTS } from '@/lib/utils'
import EVStationDetail from '@/components/EVStationDetail'

interface EVStationGridProps {
  stations: EVStation[]
  loading: boolean
  filters: StationFilters
  selectedStation: EVStation | null
  viewMode: 'cards' | 'list'
  hasSearched: boolean
  onSelectStation: (s: EVStation | null) => void
  onFiltersChange: (f: Partial<StationFilters>) => void
  onAppModeChange: (mode: AppMode) => void
}

const SPEED_FILTERS = [
  { label: 'Todos', min: 0 },
  { label: 'Normal (≤22 kW)', min: 0, max: 22 },
  { label: 'Semi-rápido (22-50 kW)', min: 22, max: 50 },
  { label: 'Rápido (50-150 kW)', min: 50, max: 150 },
  { label: 'Ultra-rápido (150+ kW)', min: 150 },
]

export default function EVStationGrid({
  stations, loading, filters, selectedStation, viewMode, hasSearched,
  onSelectStation, onFiltersChange, onAppModeChange,
}: EVStationGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [speedFilter, setSpeedFilter] = useState(0)

  const sorted = useMemo(() => {
    let list = [...stations]

    // Speed filter
    const sf = SPEED_FILTERS[speedFilter]
    if (sf.min > 0 || sf.max) {
      list = list.filter(s => {
        const maxKW = getMaxPowerKW(s)
        if (maxKW === null) return false
        if (sf.max) return maxKW >= sf.min && maxKW < sf.max
        return maxKW >= sf.min
      })
    }

    // Sort by max power descending
    return list.sort((a, b) => {
      const pa = getMaxPowerKW(a)
      const pb = getMaxPowerKW(b)
      if (pa === null && pb === null) return 0
      if (pa === null) return 1
      if (pb === null) return -1
      return pb - pa
    })
  }, [stations, speedFilter])

  const totalPoints = useMemo(() =>
    sorted.reduce((sum, s) => sum + s.totalPoints, 0),
  [sorted])

  const maxPower = useMemo(() => {
    const powers = sorted.map(s => getMaxPowerKW(s)).filter((p): p is number => p !== null)
    return powers.length > 0 ? Math.max(...powers) : null
  }, [sorted])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() { setShowScrollTop((el?.scrollTop ?? 0) > 400) }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Welcome screen for EV
  if (!hasSearched && !loading) {
    return <EVWelcomeScreen onFiltersChange={onFiltersChange} onAppModeChange={onAppModeChange} />
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Stats banner */}
      {hasSearched && (
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex-shrink-0 glass-dark">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            {loading ? (
              <div className="h-6 w-40 skeleton" />
            ) : sorted.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <Zap size={16} style={{ color: 'var(--ev-primary)' }} />
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                    {sorted.length}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>postos</span>
                </div>
                <span className="badge badge-ev">{totalPoints} pontos de carga</span>
                {maxPower !== null && (
                  <span className="badge badge-ev hidden sm:inline-flex">
                    max {formatPowerKW(maxPower)}
                  </span>
                )}
                {/* Speed filter pills */}
                <div className="flex gap-1.5 ml-auto pills-scroll">
                  {SPEED_FILTERS.map((sf, i) => (
                    <button
                      key={i}
                      onClick={() => setSpeedFilter(i)}
                      className={`pill pill-ev text-[10px] px-3 py-1.5 ${speedFilter === i ? 'pill-active pill-ev' : ''}`}
                    >
                      {sf.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="badge badge-warning">Nenhum posto EV encontrado</span>
            )}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 pb-8 pt-3">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <EVSkeletonGrid viewMode={viewMode} />
          ) : sorted.length === 0 && hasSearched ? (
            <EVEmptyState filters={filters} onFiltersChange={onFiltersChange} />
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {sorted.map((station, i) => (
                <EVStationCard
                  key={station.id}
                  station={station}
                  index={i}
                  onSelect={() => onSelectStation(station)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sorted.map((station, i) => (
                <EVStationRow
                  key={station.id}
                  station={station}
                  index={i}
                  onSelect={() => onSelectStation(station)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-9 h-9 rounded-lg flex items-center justify-center text-white animate-fade-in-up"
          style={{ background: '#06b6d4', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}
          aria-label="Voltar ao topo"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      )}

      {selectedStation && (
        <EVStationDetail
          station={selectedStation}
          onBack={() => onSelectStation(null)}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════
   EV Card Component
   ════════════════════════════════════════════════ */

function EVStationCard({ station, index, onSelect }: {
  station: EVStation; index: number; onSelect: () => void
}) {
  const maxKW = getMaxPowerKW(station)
  const speed = getSpeedLabel(maxKW)

  return (
    <div
      onClick={onSelect}
      className="animate-slide-up cursor-pointer rounded-2xl overflow-hidden press-scale card-lift"
      style={{
        animationDelay: `${Math.min(index, 11) * 25}ms`,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: maxKW && maxKW >= 150
          ? '0 0 24px rgba(245,158,11,0.15)'
          : maxKW && maxKW >= 50
          ? '0 0 24px rgba(52,211,153,0.12)'
          : '0 0 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 sm:px-4 py-2.5 flex items-center justify-between relative overflow-hidden"
        style={{
          background: maxKW && maxKW >= 150
            ? 'linear-gradient(135deg, #d97706, #f59e0b)'
            : maxKW && maxKW >= 50
            ? 'linear-gradient(135deg, #059669, #34d399)'
            : 'linear-gradient(135deg, #06b6d4, #22d3ee)',
        }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
        <div className="flex items-center gap-1.5">
          <Zap size={12} color="white" />
          <span className="text-[10px] font-bold text-white/90">{speed.label}</span>
        </div>
        <div className="flex items-center gap-1.5 relative z-10">
          {station.isOperational ? (
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              Operacional
            </span>
          ) : (
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-red-500/30 text-white">
              Indisponível
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Mobile: horizontal */}
        <div className="flex sm:hidden gap-2.5 items-start">
          <div className="shrink-0 min-w-[52px]">
            {maxKW !== null ? (
              <>
                <span className="text-xl font-black tracking-tight leading-none block" style={{ color: speed.color }}>
                  {maxKW}
                </span>
                <span className="text-[9px] font-semibold text-slate-400">kW</span>
              </>
            ) : (
              <span className="text-[10px] text-slate-500">N/A</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90 leading-snug line-clamp-2">{station.name}</p>
            {station.operator && (
              <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'var(--ev-primary)' }}>
                {station.operator}
              </p>
            )}
            {station.town && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={8} className="text-slate-500 shrink-0" />
                <p className="text-[9px] text-slate-400 truncate">{station.town}{station.state ? `, ${station.state}` : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: vertical */}
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white/90 leading-snug line-clamp-2" style={{ minHeight: 34 }}>
            {station.name}
          </p>
          {station.operator && (
            <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'var(--ev-primary)' }}>
              {station.operator}
            </p>
          )}
          {station.town && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={9} className="text-slate-500 shrink-0" />
              <p className="text-[10px] text-slate-400 truncate">{station.town}</p>
            </div>
          )}
          <div className="mt-2.5 pt-2.5 flex items-end justify-between" style={{ borderTop: '1.5px solid rgba(34,211,238,0.1)' }}>
            <div>
              {maxKW !== null ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-black tracking-tight leading-none" style={{ color: speed.color }}>
                    {maxKW}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">kW</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500">N/A</span>
              )}
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--ev-dim)', color: 'var(--ev-primary)' }}>
                {station.totalPoints} ponto{station.totalPoints !== 1 ? 's' : ''}
              </span>
              {station.connectors.slice(0, 2).map((c, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: speed.bg, color: speed.color }}>
                  {c.type.replace('Type ', 'T').replace('(Mennekes)', '').replace('(J1772)', '').trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   EV List Row Component
   ════════════════════════════════════════════════ */

function EVStationRow({ station, index, onSelect }: {
  station: EVStation; index: number; onSelect: () => void
}) {
  const maxKW = getMaxPowerKW(station)
  const speed = getSpeedLabel(maxKW)

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer card-lift"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}
    >
      <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
        style={{
          background: maxKW && maxKW >= 150
            ? 'linear-gradient(135deg, #d97706, #f59e0b)'
            : maxKW && maxKW >= 50
            ? 'linear-gradient(135deg, #059669, #34d399)'
            : 'linear-gradient(135deg, #06b6d4, #22d3ee)',
        }}
      >
        <Zap size={12} color="white" className="mb-0.5" />
        {maxKW !== null ? (
          <>
            <span className="text-[14px] font-black leading-tight text-white">{maxKW}</span>
            <span className="text-[7px] font-semibold text-white/70">kW</span>
          </>
        ) : (
          <span className="text-[8px] font-semibold text-white/70">N/A</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white/90 truncate">{station.name}</p>
        {station.operator && (
          <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: 'var(--ev-primary)' }}>
            {station.operator}
          </p>
        )}
        {station.address && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} className="text-slate-500 shrink-0" />
            <p className="text-[9px] text-slate-400 truncate">{station.town ? `${station.town} — ` : ''}{station.address}</p>
          </div>
        )}
        <div className="flex gap-1 mt-1 flex-wrap">
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: speed.bg, color: speed.color }}>
            {speed.label}
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--ev-dim)', color: 'var(--ev-primary)' }}>
            {station.totalPoints} ponto{station.totalPoints !== 1 ? 's' : ''}
          </span>
          {station.connectors.slice(0, 2).map((c, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
              {c.type.replace('Type ', 'T').replace('(Mennekes)', '').replace('(J1772)', '').trim()}
              {c.powerKW ? ` ${c.powerKW}kW` : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        {station.isOperational ? (
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--red)' }} />
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   EV Welcome Screen
   ════════════════════════════════════════════════ */

const ALL_DISTRICTS = [
  { name: 'Aveiro', color: '#22d3ee' }, { name: 'Beja', color: '#06b6d4' },
  { name: 'Braga', color: '#34d399' }, { name: 'Bragança', color: '#22d3ee' },
  { name: 'Castelo Branco', color: '#06b6d4' }, { name: 'Coimbra', color: '#22d3ee' },
  { name: 'Évora', color: '#34d399' }, { name: 'Faro', color: '#06b6d4' },
  { name: 'Guarda', color: '#22d3ee' }, { name: 'Leiria', color: '#34d399' },
  { name: 'Lisboa', color: '#22d3ee' }, { name: 'Portalegre', color: '#06b6d4' },
  { name: 'Porto', color: '#22d3ee' }, { name: 'Santarém', color: '#34d399' },
  { name: 'Setúbal', color: '#06b6d4' }, { name: 'Viana do Castelo', color: '#22d3ee' },
  { name: 'Vila Real', color: '#34d399' }, { name: 'Viseu', color: '#06b6d4' },
  { name: 'Região Autónoma dos Açores', color: '#22d3ee' },
  { name: 'Região Autónoma da Madeira', color: '#06b6d4' },
]

function EVWelcomeScreen({ onFiltersChange, onAppModeChange }: {
  onFiltersChange: (f: Partial<StationFilters>) => void
  onAppModeChange: (mode: AppMode) => void
}) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain relative">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px]" style={{
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(34,211,238,0.08) 35%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        <div className="absolute top-[30%] -left-40 w-[500px] h-[500px]" style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }} />
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 relative">
        {/* Header */}
        <div className="pt-12 sm:pt-20 pb-6 sm:pb-10">
          <div className="flex justify-center mb-6 animate-slide-up">
            <span
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--ev-dim)',
                color: 'var(--ev-primary)',
                border: '1px solid rgba(34,211,238,0.15)',
                boxShadow: '0 0 24px rgba(34,211,238,0.1)',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: 'var(--ev-primary)' }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--ev-primary)', boxShadow: '0 0 8px var(--ev-primary)' }} />
              </span>
              Rede MOBI.E + Open Charge Map
            </span>
          </div>

          <h1 className="text-center animate-slide-up" style={{ animationDelay: '60ms' }}>
            <span className="block text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]" style={{ color: 'white' }}>
              Carregamento
            </span>
            <span className="block text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mt-1" style={{
              background: 'linear-gradient(135deg, #06b6d4, #22d3ee, #67e8f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(34,211,238,0.4))',
            }}>
              elétrico
            </span>
          </h1>

          <p className="text-center text-sm mt-4 animate-slide-up" style={{ color: 'rgba(255,255,255,0.5)', animationDelay: '80ms' }}>
            Encontre postos de carregamento EV perto de si
          </p>
        </div>

        {/* District selection */}
        <div className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-center text-xl sm:text-2xl font-bold mb-2" style={{ color: 'white' }}>
            Selecione o Distrito
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Vamos encontrar os postos de carregamento na sua zona
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {ALL_DISTRICTS.map(d => (
              <button
                key={d.name}
                onClick={() => onFiltersChange({ district: d.name })}
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${d.color}25`,
                  color: 'rgba(255,255,255,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${d.color}60`
                  e.currentTarget.style.background = `${d.color}10`
                  e.currentTarget.style.color = d.color
                  e.currentTarget.style.boxShadow = `0 0 24px ${d.color}20`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${d.color}25`
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <Zap size={14} style={{ color: d.color }} className="shrink-0" />
                <span className="truncate">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Switch to fuel */}
        <div className="mt-12 mb-10 text-center animate-slide-up" style={{ animationDelay: '180ms' }}>
          <button
            onClick={() => onAppModeChange('fuel')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--color-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.2)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <BatteryCharging size={16} />
            Procurar combustível tradicional
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Dados <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Open Charge Map</strong> &middot; Rede MOBI.E &middot; <Link href="/privacidade" className="underline hover:text-white/60 transition-colors">Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════ */

function EVEmptyState({ filters, onFiltersChange }: { filters: StationFilters; onFiltersChange: (f: Partial<StationFilters>) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--ev-dim)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <SearchX size={28} style={{ color: 'var(--ev-primary)' }} />
      </div>
      <p className="text-base font-black mb-1" style={{ color: 'var(--text)' }}>Nenhum posto EV encontrado</p>
      <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Tente outro distrito ou pesquisa.
      </p>
      {filters.district && (
        <button onClick={() => onFiltersChange({ district: '' })} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--ev-primary)', color: 'var(--ev-primary)' }}>
          Limpar distrito
        </button>
      )}
    </div>
  )
}

function EVSkeletonGrid({ viewMode }: { viewMode: string }) {
  return (
    <div className={viewMode === 'cards' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-2'}>
      {Array.from({ length: 8 }).map((_, i) => (
        viewMode === 'cards' ? (
          <div key={i} className="rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="h-10 skeleton" style={{ borderRadius: 0 }} />
            <div className="p-4 space-y-2 bg-transparent">
              <div className="h-4 skeleton w-4/5" />
              <div className="h-3 skeleton w-1/2" />
              <div className="h-7 skeleton w-2/5 mt-2" />
            </div>
          </div>
        ) : (
          <div key={i} className="h-18 rounded-xl skeleton animate-slide-up" style={{ animationDelay: `${i * 30}ms` }} />
        )
      ))}
    </div>
  )
}
