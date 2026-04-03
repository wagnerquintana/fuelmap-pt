'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Star, Fuel, Bell, ArrowUp, Search, SearchX, TrendingDown, X, Zap } from 'lucide-react'
import { Station, StationFilters } from '@/types'
import { formatPrice, getPriceForFuel, FUEL_LABELS, DISTRICTS } from '@/lib/utils'
import StationDetail from '@/components/StationDetail'
import AlertModal from '@/components/AlertModal'

interface StationGridProps {
  stations: Station[]
  loading: boolean
  filters: StationFilters
  selectedStation: Station | null
  favorites: Set<string>
  viewMode: 'cards' | 'list'
  hasSearched: boolean
  onSelectStation: (s: Station | null) => void
  onToggleFavorite: (id: string) => void
  onFiltersChange: (f: Partial<StationFilters>) => void
}

const RANK_CONFIG = [
  { label: '1.o Mais Barato', gradient: 'linear-gradient(135deg, #00c853, #00e676)', glow: 'rgba(0,200,83,0.22)', badge: '#00c853', badgeBg: 'rgba(0,200,83,0.10)', medal: '\uD83E\uDD47' },
  { label: '2.o Lugar', gradient: 'linear-gradient(135deg, #1565c0, #3b82f6)', glow: 'rgba(59,130,246,0.22)', badge: '#3b82f6', badgeBg: 'rgba(59,130,246,0.10)', medal: '\uD83E\uDD48' },
  { label: '3.o Lugar', gradient: 'linear-gradient(135deg, #b45309, #f59e0b)', glow: 'rgba(245,158,11,0.22)', badge: '#f59e0b', badgeBg: 'rgba(245,158,11,0.10)', medal: '\uD83E\uDD49' },
]

const POPULAR_DISTRICTS = [
  { name: 'Lisboa', color: '#818cf8', glow: 'rgba(129,140,248,0.25)' },
  { name: 'Porto', color: '#f472b6', glow: 'rgba(244,114,182,0.25)' },
  { name: 'Faro', color: '#fbbf24', glow: 'rgba(251,191,36,0.25)' },
  { name: 'Braga', color: '#34d399', glow: 'rgba(52,211,153,0.25)' },
  { name: 'Setúbal', color: '#fb923c', glow: 'rgba(251,146,60,0.25)' },
  { name: 'Coimbra', color: '#38bdf8', glow: 'rgba(56,189,248,0.25)' },
]

function getPriceColor(price: number | null) {
  if (price === null) return '#475569'
  if (price < 1.5) return '#34d399'
  if (price < 1.7) return '#818cf8'
  return '#f87171'
}

function getPriceBg(price: number | null) {
  if (price === null) return 'rgba(255,255,255,0.03)'
  if (price < 1.5) return 'rgba(52,211,153,0.08)'
  if (price < 1.7) return 'rgba(129,140,248,0.08)'
  return 'rgba(248,113,113,0.08)'
}

function getPriceGlow(price: number | null) {
  if (price === null) return 'none'
  if (price < 1.5) return '0 0 16px rgba(52,211,153,0.2)'
  if (price < 1.7) return '0 0 16px rgba(129,140,248,0.2)'
  return '0 0 16px rgba(248,113,113,0.2)'
}

export default function StationGrid({
  stations, loading, filters, selectedStation,
  favorites, viewMode, hasSearched, onSelectStation, onToggleFavorite, onFiltersChange,
}: StationGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [alertStation, setAlertStation] = useState<Station | null>(null)

  const sorted = useMemo(() => {
    const list = [...stations]
    if (filters.sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list.sort((a, b) => {
      const pa = getPriceForFuel(a, filters.fuelType)
      const pb = getPriceForFuel(b, filters.fuelType)
      if (pa === null && pb === null) return 0
      if (pa === null) return 1
      if (pb === null) return -1
      return filters.sortBy === 'price_desc' ? pb - pa : pa - pb
    })
  }, [stations, filters.fuelType, filters.sortBy])

  const cheapest = sorted.find(s => getPriceForFuel(s, filters.fuelType) !== null)
  const cheapestPrice = cheapest ? getPriceForFuel(cheapest, filters.fuelType) : null

  const avgPrice = useMemo(() => {
    const withPrices = sorted.filter(s => getPriceForFuel(s, filters.fuelType) !== null)
    if (withPrices.length < 3) return null
    const sample = withPrices.slice(0, 100)
    return sample.reduce((sum, s) => sum + getPriceForFuel(s, filters.fuelType)!, 0) / sample.length
  }, [sorted, filters.fuelType])

  const savings = cheapestPrice !== null && avgPrice !== null ? avgPrice - cheapestPrice : null

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

  // Home — no search yet
  if (!hasSearched && !loading) {
    return <WelcomeScreen onFiltersChange={onFiltersChange} />
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Sticky stats banner */}
      {hasSearched && (
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex-shrink-0 glass-dark">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            {loading ? (
              <div className="h-6 w-40 skeleton" />
            ) : cheapestPrice !== null ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                    {cheapestPrice.toFixed(3)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>€/L</span>
                </div>
                <span className="badge badge-success">melhor preço</span>
                {savings !== null && savings > 0 && (
                  <span className="badge badge-info hidden sm:inline-flex">poupa {savings.toFixed(3)} €/L</span>
                )}
                {avgPrice !== null && (
                  <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
                    Media: <strong style={{ color: 'var(--text)' }}>{avgPrice.toFixed(3)}</strong>
                  </span>
                )}
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{stations.length} postos</span>
              </>
            ) : sorted.length > 0 ? (
              <span className="badge badge-warning">{FUEL_LABELS[filters.fuelType] || filters.fuelType} indisponivel</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 pb-8 pt-3">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <SkeletonGrid viewMode={viewMode} />
          ) : sorted.length === 0 && hasSearched ? (
            <EmptyState filters={filters} onFiltersChange={onFiltersChange} />
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {sorted.map((station, i) => (
                <StationCard
                  key={station.id}
                  station={station}
                  index={i}
                  fuelType={filters.fuelType}
                  isFavorite={favorites.has(station.id)}
                  cheapestPrice={cheapestPrice}
                  onSelect={() => onSelectStation(station)}
                  onToggleFavorite={() => onToggleFavorite(station.id)}
                  onAlert={() => setAlertStation(station)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sorted.map((station, i) => (
                <StationRow
                  key={station.id}
                  station={station}
                  index={i}
                  fuelType={filters.fuelType}
                  isFavorite={favorites.has(station.id)}
                  onSelect={() => onSelectStation(station)}
                  onToggleFavorite={() => onToggleFavorite(station.id)}
                  onAlert={() => setAlertStation(station)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll-to-top — smaller on mobile */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-9 h-9 rounded-lg flex items-center justify-center text-white animate-fade-in-up"
          style={{ background: '#4f46e5', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}
          aria-label="Voltar ao topo"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      )}

      {alertStation && (
        <AlertModal
          station={alertStation}
          defaultFuelType={filters.fuelType !== 'all' ? filters.fuelType : undefined}
          onClose={() => setAlertStation(null)}
        />
      )}

      {selectedStation && (
        <StationDetail
          station={selectedStation}
          rank={sorted.findIndex(s => s.id === selectedStation.id) + 1}
          fuelType={filters.fuelType}
          isFavorite={favorites.has(selectedStation.id)}
          cheapestPrice={cheapestPrice}
          onBack={() => onSelectStation(null)}
          onToggleFavorite={() => onToggleFavorite(selectedStation.id)}
          onFuelTypeChange={(ft) => onFiltersChange({ fuelType: ft as any })}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════
   Welcome / Home Screen
   ════════════════════════════════════════════════ */

function WelcomeScreen({ onFiltersChange }: { onFiltersChange: (f: Partial<StationFilters>) => void }) {
  const [heroSearch, setHeroSearch] = useState('')
  const heroDebounce = useRef<ReturnType<typeof setTimeout>>(null)

  function handleHeroSearch(value: string) {
    setHeroSearch(value)
    if (heroDebounce.current) clearTimeout(heroDebounce.current)
    heroDebounce.current = setTimeout(() => {
      if (value.trim()) onFiltersChange({ search: value })
    }, 500)
  }

  function handleHeroSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (heroDebounce.current) clearTimeout(heroDebounce.current)
    if (heroSearch.trim()) onFiltersChange({ search: heroSearch })
  }
  return (
    <div className="h-full overflow-y-auto overscroll-contain relative">
      {/* Ambient orbs — layered glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top-center indigo */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px]" style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 35%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        {/* Left purple */}
        <div className="absolute top-[30%] -left-40 w-[500px] h-[500px]" style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }} />
        {/* Right blue */}
        <div className="absolute top-[50%] -right-32 w-[400px] h-[400px]" style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }} />
        {/* Bottom green hint */}
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px]" style={{
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 relative">

        {/* ── HERO ── */}
        <div className="pt-16 sm:pt-28 pb-12 sm:pb-16">
          {/* Live status */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <span
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(52,211,153,0.06)',
                color: 'var(--green)',
                border: '1px solid rgba(52,211,153,0.15)',
                boxShadow: '0 0 24px rgba(52,211,153,0.1), 0 0 0 1px rgba(52,211,153,0.05) inset',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: 'var(--green)' }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              </span>
              3.000+ postos · dados DGEG atualizados hoje
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center animate-slide-up" style={{ animationDelay: '60ms' }}>
            <span className="block text-4xl sm:text-7xl font-black tracking-tight leading-[1.05]" style={{ color: 'white' }}>
              Combustível
            </span>
            <span className="block text-4xl sm:text-7xl font-black tracking-tight leading-[1.05] mt-1 sm:mt-2" style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 25%, #c084fc 50%, #f0abfc 75%, #818cf8 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(129,140,248,0.4))',
            }}>
              mais barato
            </span>
            <span className="block text-4xl sm:text-7xl font-black tracking-tight leading-[1.05] mt-1 sm:mt-2" style={{ color: 'white' }}>
              perto de si
            </span>
          </h1>

          <p className="text-center text-base sm:text-lg mt-5 max-w-md mx-auto leading-relaxed animate-slide-up" style={{ color: 'white', animationDelay: '100ms' }}>
            Preços atualizados diariamente da DGEG.
          </p>

          {/* ── HERO SEARCH — full width ── */}
          <form onSubmit={handleHeroSubmit} className="mt-10 animate-slide-up" style={{ animationDelay: '140ms' }}>
            <div
              className="flex items-center gap-4 px-6 py-5 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (heroSearch ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'),
                boxShadow: heroSearch
                  ? '0 0 40px rgba(99,102,241,0.2), 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(129,140,248,0.15) inset'
                  : '0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              <Search size={22} style={{ color: heroSearch ? '#818cf8' : 'rgba(255,255,255,0.3)' }} className="shrink-0" />
              <input
                type="text"
                placeholder="Pesquisar por localidade, marca ou posto..."
                value={heroSearch}
                onChange={e => handleHeroSearch(e.target.value)}
                className="flex-1 text-lg bg-transparent outline-none min-w-0 focus:ring-0 focus:outline-none"
                style={{ color: 'white', fontWeight: 500, border: 'none', boxShadow: 'none' }}
                autoFocus
              />
              {heroSearch && (
                <button
                  type="button"
                  onClick={() => setHeroSearch('')}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10 mr-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.3), 0 4px 12px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.5), 0 6px 20px rgba(0,0,0,0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3), 0 4px 12px rgba(0,0,0,0.3)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <Search size={15} />
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* ── DISTRICTS ── */}
        <div className="pb-14 sm:pb-20 animate-slide-up" style={{ animationDelay: '180ms' }}>
          <div className="flex flex-wrap gap-3 justify-center">
            {POPULAR_DISTRICTS.map(d => (
              <button
                key={d.name}
                onClick={() => onFiltersChange({ district: d.name })}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${d.color}30`,
                  color: 'rgba(255,255,255,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${d.color}70`
                  e.currentTarget.style.background = `${d.color}10`
                  e.currentTarget.style.color = d.color
                  e.currentTarget.style.boxShadow = `0 0 28px ${d.glow}, 0 8px 24px rgba(0,0,0,0.3)`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${d.color}30`
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <MapPin size={14} style={{ color: d.color }} />
                {d.name}
              </button>
            ))}
            <button
              onClick={() => { document.querySelector<HTMLSelectElement>('select')?.focus() }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              }}
            >
              + Ver todos
            </button>
          </div>
        </div>

        {/* ── CALCULATOR BANNER ── */}
        <Link
          href="/calcular"
          className="block mb-14 sm:mb-20 rounded-2xl p-5 sm:p-6 transition-all card-lift animate-slide-up relative overflow-hidden"
          style={{
            animationDelay: '220ms',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
            border: '1px solid rgba(129,140,248,0.2)',
            boxShadow: '0 0 32px rgba(99,102,241,0.1)',
          }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />
          <div className="flex items-center gap-4 relative">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            >
              <Zap size={22} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold" style={{ color: 'white' }}>Calculadora de Poupança</h3>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Descobre quanto poupas por mês com os postos mais baratos</p>
            </div>
            <span className="text-lg shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
          </div>
        </Link>

        {/* ── STEPS ── */}
        <div className="pb-16 sm:pb-28">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.3))' }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full" style={{ color: 'white', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)' }}>Como funciona</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(129,140,248,0.3), transparent)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { num: '01', icon: <Search size={22} />, title: 'Pesquise', desc: 'Digite uma localidade, marca ou nome do posto.', accent: '#818cf8', accentLight: '#c7d2fe', glow: 'rgba(129,140,248,0.2)', border: 'rgba(129,140,248,0.2)' },
              { num: '02', icon: <TrendingDown size={22} />, title: 'Compare', desc: 'Veja os preços ordenados do mais barato ao mais caro.', accent: '#34d399', accentLight: '#6ee7b7', glow: 'rgba(52,211,153,0.2)', border: 'rgba(52,211,153,0.2)' },
              { num: '03', icon: <Bell size={22} />, title: 'Poupe', desc: 'Crie alertas e seja notificado quando o preço baixar.', accent: '#fbbf24', accentLight: '#fde68a', glow: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.2)' },
            ].map((item, i) => (
              <div
                key={item.num}
                className="rounded-2xl p-6 animate-slide-up card-lift relative overflow-hidden group"
                style={{
                  animationDelay: `${240 + i * 80}ms`,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${item.border}`,
                  boxShadow: `0 0 32px ${item.glow}, 0 0 0 1px ${item.accent}08 inset`,
                }}
              >
                {/* Corner number */}
                <span className="absolute top-3 right-4 text-[48px] font-black leading-none transition-colors" style={{ color: `${item.accent}10` }}>
                  {item.num}
                </span>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`, opacity: 0.5 }} />

                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent}20, ${item.accent}08)`,
                      color: item.accent,
                      boxShadow: `0 0 20px ${item.glow}`,
                      border: `1px solid ${item.accent}25`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: 'white' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="text-center pb-8">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Dados abertos <strong style={{ color: 'rgba(255,255,255,0.5)' }}>DGEG</strong> &middot; Regulamento UE 2023/138 &middot; <Link href="/privacidade" className="underline hover:text-white/60 transition-colors">Política de Privacidade</Link>
          </p>
        </div>

      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════ */

function EmptyState({ filters, onFiltersChange }: { filters: StationFilters; onFiltersChange: (f: Partial<StationFilters>) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <SearchX size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <p className="text-base font-black mb-1" style={{ color: 'var(--text)' }}>Nenhum posto encontrado</p>
      <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Tente outro nome, marca ou localidade.
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {filters.search && (
          <button onClick={() => onFiltersChange({ search: '' })} className="btn btn-primary btn-sm">Limpar pesquisa</button>
        )}
        {filters.district && (
          <button onClick={() => onFiltersChange({ district: '' })} className="btn btn-outline btn-sm">Limpar distrito</button>
        )}
      </div>
    </div>
  )
}

function SkeletonGrid({ viewMode }: { viewMode: string }) {
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

/* ════════════════════════════════════════════════
   Card Component
   ════════════════════════════════════════════════ */

function StationCard({ station, index, fuelType, isFavorite, cheapestPrice, onSelect, onToggleFavorite, onAlert }: {
  station: Station; index: number; fuelType: string; isFavorite: boolean
  cheapestPrice: number | null; onSelect: () => void; onToggleFavorite: () => void; onAlert: () => void
}) {
  const price = getPriceForFuel(station, fuelType)
  const isTop3 = index < 3
  const cfg = isTop3 ? RANK_CONFIG[index] : null
  const priceColor = getPriceColor(price)
  const priceBg = getPriceBg(price)
  const diff = index > 0 && price !== null && cheapestPrice !== null ? price - cheapestPrice : null

  return (
    <div
      onClick={onSelect}
      className="animate-slide-up cursor-pointer rounded-2xl overflow-hidden press-scale card-lift"
      style={{
        animationDelay: `${Math.min(index, 11) * 25}ms`,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: cfg ? `0 0 24px ${cfg.glow}` : getPriceGlow(price),
      }}
    >
      {/* Header */}
      <div
        className={`px-3 sm:px-4 flex items-center justify-between relative overflow-hidden ${isTop3 ? 'py-2.5' : 'py-2'}`}
        style={{ background: cfg?.gradient || 'rgba(255,255,255,0.02)' }}
      >
        <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
        <div className="flex items-center gap-1.5">
          {isTop3 ? (
            <span className="text-base">{cfg!.medal}</span>
          ) : (
            <div className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px]" style={{ background: priceBg, color: priceColor }}>
              {index + 1}
            </div>
          )}
          <span className={`font-bold ${isTop3 ? 'text-[10px] text-white/90' : 'text-[9px] text-slate-500'}`}>
            {cfg?.label || `#${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-0.5 relative z-10">
          <button
            onClick={e => { e.stopPropagation(); onAlert() }}
            className="p-1 rounded-full hover:scale-110"
            style={{ color: cfg ? 'rgba(255,255,255,0.6)' : '#d1d5db' }}
          >
            <Bell size={10} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite() }}
            className="p-1 rounded-full hover:scale-110"
            style={{ color: isFavorite ? (cfg ? '#fef08a' : '#f59e0b') : (cfg ? 'rgba(255,255,255,0.6)' : '#d1d5db') }}
          >
            <Star size={10} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body — horizontal on mobile, vertical on desktop */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent">
        {/* Mobile: horizontal */}
        <div className="flex sm:hidden gap-2.5 items-start">
          <div className="shrink-0 min-w-[52px]">
            {price !== null ? (
              <>
                <span className="text-xl font-black tracking-tight leading-none block" style={{ color: cfg?.badge || priceColor }}>
                  {price.toFixed(3)}
                </span>
                <span className="text-[9px] font-semibold text-slate-400">€/L</span>
                {diff !== null && diff > 0 && (
                  <span className="text-[8px] text-slate-400 block">+{diff.toFixed(3)}</span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-slate-500">Sem preço</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90 leading-snug line-clamp-2">{station.name}</p>
            {station.brand && <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: cfg?.badge || priceColor }}>{station.brand}</p>}
            {station.municipality && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={8} className="text-slate-500 shrink-0" />
                <p className="text-[9px] text-slate-400 truncate">{station.municipality}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: vertical */}
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white/90 leading-snug line-clamp-2" style={{ minHeight: 34 }}>{station.name}</p>
          {station.brand && <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: cfg?.badge || priceColor }}>{station.brand}</p>}
          {station.municipality && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={9} className="text-slate-500 shrink-0" />
              <p className="text-[10px] text-slate-400 truncate">{station.municipality}</p>
            </div>
          )}
          <div className="mt-2.5 pt-2.5 flex items-end justify-between" style={{ borderTop: `1.5px solid ${cfg?.badgeBg || '#f1f5f9'}` }}>
            <div>
              {price !== null ? (
                <>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black tracking-tight leading-none" style={{ color: cfg?.badge || priceColor }}>{price.toFixed(3)}</span>
                    <span className="text-[9px] font-semibold text-slate-400">€/L</span>
                  </div>
                  {diff !== null && diff > 0 && <p className="text-[9px] text-slate-400 mt-0.5">+{diff.toFixed(3)} vs 1.o</p>}
                </>
              ) : (
                <span className="text-[10px] text-slate-500">Sem preço</span>
              )}
            </div>
            {station.fuels.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-end">
                {station.fuels.filter(f => f.price).slice(0, 2).map(f => (
                  <span key={f.type} className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: getPriceBg(f.price ?? null), color: getPriceColor(f.price ?? null) }}>
                    {f.type.replace('Gasolina simples ', 'G').replace('Gasolina especial ', 'G+').replace('Gasóleo simples', 'Gsl').replace('Gasóleo especial', 'Gsl+').replace('GPL Auto', 'GPL')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   List Row Component
   ════════════════════════════════════════════════ */

function StationRow({ station, index, fuelType, isFavorite, onSelect, onToggleFavorite, onAlert }: {
  station: Station; index: number; fuelType: string; isFavorite: boolean
  onSelect: () => void; onToggleFavorite: () => void; onAlert: () => void
}) {
  const price = getPriceForFuel(station, fuelType)
  const priceColor = getPriceColor(price)
  const priceBg = getPriceBg(price)
  const isTop3 = index < 3
  const cfg = isTop3 ? RANK_CONFIG[index] : null

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer card-lift"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}
    >
      <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: cfg?.gradient || priceBg }}>
        {isTop3 ? <span className="text-xs mb-0.5">{cfg!.medal}</span> : <span className="text-[8px] font-bold" style={{ color: priceColor, opacity: 0.6 }}>#{index + 1}</span>}
        {price !== null ? (
          <>
            <span className="text-[14px] font-black leading-tight" style={{ color: cfg ? 'white' : priceColor }}>{price.toFixed(3)}</span>
            <span className="text-[7px] font-semibold" style={{ color: cfg ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>€/L</span>
          </>
        ) : (
          <span className="text-[8px] font-semibold text-center px-1" style={{ color: cfg ? 'rgba(255,255,255,0.7)' : '#d1d5db' }}>--</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white/90 truncate">{station.name}</p>
        {station.brand && <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: cfg?.badge || priceColor }}>{station.brand}</p>}
        {station.address && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} className="text-slate-500 shrink-0" />
            <p className="text-[9px] text-slate-400 truncate">{station.address}</p>
          </div>
        )}
        {station.fuels.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {station.fuels.filter(f => f.price).slice(0, 3).map(f => (
              <span key={f.type} className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: getPriceBg(f.price ?? null), color: getPriceColor(f.price ?? null) }}>
                {f.type.replace('Gasolina simples ', 'G').replace('Gasolina especial ', 'G+').replace('Gasóleo simples', 'Gsl').replace('Gasóleo especial', 'Gsl+').replace('GPL Auto', 'GPL')} {formatPrice(f.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={e => { e.stopPropagation(); onToggleFavorite() }} className="p-1.5 rounded-lg hover:scale-110" style={{ background: isFavorite ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)', color: isFavorite ? 'var(--gold)' : 'var(--text-dim)' }}>
          <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button onClick={e => { e.stopPropagation(); onAlert() }} className="p-1.5 rounded-lg hover:scale-110" style={{ background: 'rgba(251,191,36,0.08)', color: 'var(--gold)' }}>
          <Bell size={12} />
        </button>
      </div>
    </div>
  )
}
