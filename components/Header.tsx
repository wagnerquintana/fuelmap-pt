'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Fuel, Star, LogOut, Calculator, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { StationFilters, FilterFuelType } from '@/types'
import { FUEL_TYPES, FUEL_LABELS, FUEL_SLUGS, DISTRICTS } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  filters: StationFilters
  user: User | null
  stationCount: number
  showFavoritesOnly: boolean
  viewMode: 'cards' | 'list'
  hasSearched: boolean
  onFiltersChange: (f: Partial<StationFilters>) => void
  onToggleFavorites: () => void
  onViewModeChange: (mode: 'cards' | 'list') => void
  onSignOut: () => void
}

export default function Header({
  filters, user, stationCount, showFavoritesOnly, viewMode, hasSearched,
  onFiltersChange, onToggleFavorites, onViewModeChange, onSignOut,
}: HeaderProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => { setLocalSearch(filters.search) }, [filters.search])

  function handleSearchChange(value: string) {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onFiltersChange({ search: value }), 400)
  }

  function handleClear() {
    setLocalSearch('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onFiltersChange({ search: '' })
  }

  function goHome() {
    setLocalSearch('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onFiltersChange({ search: '', district: '' })
  }

  const searchStyle = {
    background: 'var(--bg-raised)',
    border: '1px solid ' + (localSearch ? 'var(--color-primary)' : 'var(--border)'),
    boxShadow: localSearch ? '0 0 20px var(--glow-primary)' : 'none',
  }

  return (
    <header className="flex-shrink-0">
      {/* Glow accent line */}
      <div className="h-[2px] w-full" style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 12px var(--glow-primary)' }} />

      {/* Navbar */}
      <div className="px-4 sm:px-6 lg:px-8 glass-dark">
        <div className="max-w-7xl mx-auto flex items-center gap-3 h-14 sm:h-16">
          {/* Logo */}
          <button onClick={goHome} className="flex items-center gap-2.5 shrink-0 group" title="Voltar ao inicio">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px var(--glow-primary)' }}
            >
              <Fuel size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:block text-white">
              Fuel<span style={{ color: 'var(--color-primary)' }}>Map</span>
            </span>
          </button>

          {/* Desktop search — hidden on home */}
          <div className={`${hasSearched ? 'sm:flex' : 'hidden'} hidden flex-1 max-w-lg items-center gap-2 px-3 py-2 rounded-lg transition-all`} style={searchStyle}>
            <Search size={16} className="shrink-0" style={{ color: localSearch ? 'var(--color-primary)' : 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Pesquisar posto, marca ou localidade..."
              value={localSearch}
              onChange={e => handleSearchChange(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none min-w-0"
              style={{ color: 'var(--text)', fontWeight: 500 }}
            />
            {localSearch && (
              <button onClick={handleClear} className="btn-icon btn-ghost p-1">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex-1 sm:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {hasSearched && (
              <span className="text-xs font-bold tabular-nums mr-1" style={{ color: 'var(--color-primary)' }}>
                {stationCount}
              </span>
            )}
            {hasSearched && (
              <button
                onClick={onToggleFavorites}
                className="btn-icon btn-ghost"
                aria-pressed={showFavoritesOnly}
                style={showFavoritesOnly ? { background: 'var(--gold-dim)', color: 'var(--gold)' } : {}}
              >
                <Star size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>
            )}
            <Link href="/calcular" className="btn-icon btn-ghost">
              <Calculator size={16} />
            </Link>
            {user && (
              <button onClick={onSignOut} className="btn-icon btn-ghost" style={{ color: 'var(--red)' }}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: search + pills + filters — hidden on home */}
      <div className={`${hasSearched ? 'block' : 'hidden'} sm:hidden px-4 pb-3 space-y-2 glass-dark`} style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mt-2 transition-all" style={searchStyle}>
          <Search size={16} style={{ color: localSearch ? 'var(--color-primary)' : 'var(--text-dim)' }} className="shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar posto, marca ou localidade..."
            value={localSearch}
            onChange={e => handleSearchChange(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none min-w-0"
            style={{ color: 'var(--text)', fontWeight: 500 }}
          />
          {localSearch && (
            <button onClick={handleClear} className="p-1 rounded hover:bg-white/10">
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        <div className="pills-scroll flex gap-2">
          {FUEL_TYPES.map(type => {
            const active = filters.fuelType === type
            return (
              <button
                key={type}
                onClick={() => onFiltersChange({ fuelType: type as FilterFuelType })}
                className={`pill shrink-0 ${active ? 'pill-active' : ''}`}
                data-fuel={FUEL_SLUGS[type] || 'all'}
              >
                <span className="pill-dot" />
                {FUEL_LABELS[type]}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.district}
            onChange={e => onFiltersChange({ district: e.target.value })}
            className={`form-select flex-1 text-xs ${filters.district ? 'form-select-active' : ''}`}
          >
            <option value="">Todos os distritos</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filters.sortBy}
            onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
            className="form-select text-xs"
          >
            <option value="price_asc">Mais barato</option>
            <option value="price_desc">Mais caro</option>
            <option value="name">Nome A-Z</option>
          </select>
          {hasSearched && (
            <div className="toggle-group shrink-0">
              <button onClick={() => onViewModeChange('cards')} className={viewMode === 'cards' ? 'active' : ''}><LayoutGrid size={13} /></button>
              <button onClick={() => onViewModeChange('list')} className={viewMode === 'list' ? 'active' : ''}><List size={13} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop filters */}
      {hasSearched && (
        <div className="hidden sm:block px-4 sm:px-6 lg:px-8 py-2 glass-dark">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="flex gap-2 flex-1 min-w-0 flex-wrap">
              {FUEL_TYPES.map(type => {
                const active = filters.fuelType === type
                return (
                  <button
                    key={type}
                    onClick={() => onFiltersChange({ fuelType: type as FilterFuelType })}
                    className={`pill ${active ? 'pill-active' : ''}`}
                    data-fuel={FUEL_SLUGS[type] || 'all'}
                  >
                    <span className="pill-dot" />
                    {FUEL_LABELS[type]}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select value={filters.district} onChange={e => onFiltersChange({ district: e.target.value })} className={`form-select text-xs ${filters.district ? 'form-select-active' : ''}`}>
                <option value="">Distrito</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filters.sortBy} onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })} className="form-select text-xs">
                <option value="price_asc">Mais barato</option>
                <option value="price_desc">Mais caro</option>
                <option value="name">Nome A-Z</option>
              </select>
              <div className="toggle-group">
                <button onClick={() => onViewModeChange('cards')} className={viewMode === 'cards' ? 'active' : ''}><LayoutGrid size={14} /></button>
                <button onClick={() => onViewModeChange('list')} className={viewMode === 'list' ? 'active' : ''}><List size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
