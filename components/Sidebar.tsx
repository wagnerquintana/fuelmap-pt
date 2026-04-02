'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal, Star, LogOut, Fuel, ChevronDown } from 'lucide-react'
import { Station, StationFilters, FilterFuelType } from '@/types'
import { DISTRICTS, FUEL_TYPES, FUEL_LABELS, getPriceForFuel } from '@/lib/utils'
import StationCard from './StationCard'
import { User } from '@supabase/supabase-js'

interface SidebarProps {
  stations: Station[]
  loading: boolean
  filters: StationFilters
  selectedStation: Station | null
  favorites: Set<string>
  user: User | null
  onFiltersChange: (f: Partial<StationFilters>) => void
  onSelectStation: (s: Station) => void
  onToggleFavorite: (id: string) => void
  onSignOut: () => void
}

export default function Sidebar({
  stations, loading, filters, selectedStation,
  favorites, user, onFiltersChange, onSelectStation,
  onToggleFavorite, onSignOut,
}: SidebarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filtered = useMemo(() => {
    let list = showFavoritesOnly ? stations.filter(s => favorites.has(s.id)) : stations
    return list.sort((a, b) => {
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      const pa = getPriceForFuel(a, filters.fuelType)
      const pb = getPriceForFuel(b, filters.fuelType)
      if (pa === null && pb === null) return 0
      if (pa === null) return 1
      if (pb === null) return -1
      return filters.sortBy === 'price_asc' ? pa - pb : pb - pa
    })
  }, [stations, filters, showFavoritesOnly, favorites])

  const cheapest = filtered.find(s => getPriceForFuel(s, filters.fuelType) !== null)
  const cheapestPrice = cheapest ? getPriceForFuel(cheapest, filters.fuelType) : null

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Logo + ações */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)', border: '1px solid rgba(79,142,247,0.3)' }}
            >
              <Fuel size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-bold text-sm leading-none" style={{ color: 'var(--text)' }}>FuelMap</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>Portugal</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={onSignOut}
                title="Sair"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={14} />
              </button>
            )}
            <button
              onClick={() => setShowFavoritesOnly(v => !v)}
              className="p-1.5 rounded-lg transition-all"
              style={{
                color: showFavoritesOnly ? 'var(--gold)' : 'var(--text-muted)',
                background: showFavoritesOnly ? 'var(--gold-dim)' : 'transparent',
              }}
              title="Favoritos"
            >
              <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="p-1.5 rounded-lg transition-all"
              style={{
                color: showFilters ? 'var(--accent)' : 'var(--text-muted)',
                background: showFilters ? 'var(--blue-dim)' : 'transparent',
              }}
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Stat destaque */}
        {cheapestPrice !== null && !loading && (
          <div
            className="rounded-xl p-3 mb-4 flex items-center justify-between"
            style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,230,118,0.15)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {FUEL_LABELS[filters.fuelType] || filters.fuelType} · mais barato
              </p>
              <p className="text-lg font-black" style={{ color: 'var(--green)' }}>
                {cheapestPrice.toFixed(3)} <span className="text-xs font-medium">€/L</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} postos</p>
              {filters.district && (
                <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{filters.district}</p>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Buscar posto, marca, morada..."
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            className="w-full pl-8 pr-8 py-2.5 rounded-xl text-sm transition-all outline-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* Fuel type pills */}
            <div className="flex gap-1.5 flex-wrap">
              {FUEL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => onFiltersChange({ fuelType: type as FilterFuelType })}
                  className="text-xs px-2.5 py-1 rounded-full transition-all font-medium"
                  style={{
                    background: filters.fuelType === type ? 'var(--accent)' : 'var(--surface2)',
                    color: filters.fuelType === type ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${filters.fuelType === type ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {FUEL_LABELS[type]}
                </button>
              ))}
            </div>

            {/* Distrito */}
            <div className="relative">
              <select
                value={filters.district}
                onChange={e => onFiltersChange({ district: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl appearance-none outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: filters.district ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                <option value="">Todos os distritos</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
                className="w-full text-xs px-3 py-2 rounded-xl appearance-none outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                <option value="price_asc">Preço: mais barato primeiro</option>
                <option value="price_desc">Preço: mais caro primeiro</option>
                <option value="name">Nome A → Z</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>A carregar postos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Fuel size={28} style={{ color: 'var(--text-dim)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {showFavoritesOnly ? 'Nenhum favorito guardado.' : 'Nenhum posto encontrado.'}
            </p>
          </div>
        ) : (
          filtered.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isSelected={selectedStation?.id === station.id}
              isFavorite={favorites.has(station.id)}
              fuelType={filters.fuelType}
              onSelect={() => onSelectStation(station)}
              onToggleFavorite={() => onToggleFavorite(station.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
