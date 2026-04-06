'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Fuel, Star, LogOut, Calculator, LayoutGrid, List, MapPin, ChevronDown, RotateCcw, Zap } from 'lucide-react'
import Link from 'next/link'
import { StationFilters, FilterFuelType, AppMode } from '@/types'
import { FUEL_TYPES, FUEL_LABELS, FUEL_SLUGS, DISTRICTS } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  filters: StationFilters
  user: User | null
  stationCount: number
  showFavoritesOnly: boolean
  viewMode: 'cards' | 'list'
  hasSearched: boolean
  appMode: AppMode
  onAppModeChange: (mode: AppMode) => void
  onFiltersChange: (f: Partial<StationFilters>) => void
  onToggleFavorites: () => void
  onViewModeChange: (mode: 'cards' | 'list') => void
  onSignOut: () => void
}

// Fuel types without "all" for the results view
const RESULT_FUEL_TYPES: FilterFuelType[] = FUEL_TYPES.filter(t => t !== 'all')

export default function Header({
  filters, user, stationCount, showFavoritesOnly, viewMode, hasSearched,
  appMode, onAppModeChange,
  onFiltersChange, onToggleFavorites, onViewModeChange, onSignOut,
}: HeaderProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [localities, setLocalities] = useState<string[]>([])
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingLocalities, setLoadingLocalities] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => { setLocalSearch(filters.search) }, [filters.search])

  const fetchMunicipalities = useCallback(async (district: string) => {
    if (!district) { setMunicipalities([]); return }
    setLoadingMunicipalities(true)
    try {
      const res = await fetch(`/api/municipalities?district=${encodeURIComponent(district)}`)
      if (res.ok) setMunicipalities(await res.json())
    } catch { /* ignore */ }
    setLoadingMunicipalities(false)
  }, [])

  const fetchLocalities = useCallback(async (district: string, municipality: string) => {
    if (!district || !municipality) { setLocalities([]); return }
    setLoadingLocalities(true)
    try {
      const res = await fetch(`/api/localities?district=${encodeURIComponent(district)}&municipality=${encodeURIComponent(municipality)}`)
      if (res.ok) setLocalities(await res.json())
    } catch { /* ignore */ }
    setLoadingLocalities(false)
  }, [])

  useEffect(() => {
    if (hasSearched && filters.district) {
      fetchMunicipalities(filters.district)
      if (filters.municipality) {
        fetchLocalities(filters.district, filters.municipality)
      }
    }
  }, [hasSearched, filters.district, filters.municipality, fetchMunicipalities, fetchLocalities])

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
    onFiltersChange({ search: '', district: '', municipality: '', locality: '', fuelType: 'Gasolina simples 95' })
  }

  function handleDistrictChange(district: string) {
    onFiltersChange({ district, municipality: '', locality: '' })
  }

  function handleMunicipalityChange(municipality: string) {
    onFiltersChange({ municipality, locality: '' })
    // Fetch localities for the new municipality
    if (municipality && filters.district) {
      fetchLocalities(filters.district, municipality)
    } else {
      setLocalities([])
    }
  }

  function handleLocalityChange(locality: string) {
    onFiltersChange({ locality })
  }

  return (
    <header className="flex-shrink-0">
      {/* Glow accent line */}
      <div className="h-[2px] w-full" style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 12px var(--glow-primary)' }} />

      {/* Navbar */}
      <div className="px-4 sm:px-6 lg:px-8 glass-dark">
        <div className="max-w-7xl mx-auto flex items-center gap-3 h-14 sm:h-16">
          {/* Logo */}
          <button onClick={goHome} className="flex items-center gap-2.5 shrink-0 group" title="Nova consulta">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
              style={{
                background: appMode === 'ev'
                  ? 'linear-gradient(135deg, #06b6d4, #22d3ee)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: appMode === 'ev' ? '0 0 16px var(--ev-glow)' : '0 0 16px var(--glow-primary)',
              }}
            >
              {appMode === 'ev' ? <Zap size={16} color="white" strokeWidth={2.5} /> : <Fuel size={16} color="white" strokeWidth={2.5} />}
            </div>
            <span className="font-extrabold text-base tracking-tight hidden sm:block text-white">
              Fuel<span style={{ color: appMode === 'ev' ? 'var(--ev-primary)' : 'var(--color-primary)' }}>Map</span>
            </span>
          </button>

          {/* Mode Toggle — Fuel / EV */}
          <div className="mode-toggle shrink-0">
            <button
              data-mode="fuel"
              className={appMode === 'fuel' ? 'active' : ''}
              onClick={() => onAppModeChange('fuel')}
            >
              <Fuel size={14} /> <span className="hidden sm:inline">Combustível</span>
            </button>
            <button
              data-mode="ev"
              className={appMode === 'ev' ? 'active' : ''}
              onClick={() => onAppModeChange('ev')}
            >
              <Zap size={14} /> <span className="hidden sm:inline">Elétrico</span>
            </button>
          </div>

          {/* Context chips — shown in results */}
          {hasSearched && (
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto">
              {/* Fuel chip */}
              {filters.fuelType && filters.fuelType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                  style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' }}>
                  ⛽ {FUEL_LABELS[filters.fuelType] || filters.fuelType}
                </span>
              )}
              {/* District chip */}
              {filters.district && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                  <MapPin size={10} /> {filters.district}
                </span>
              )}
              {/* Municipality chip */}
              {filters.municipality && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                  style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                  🏘️ {filters.municipality}
                </span>
              )}
              {/* Locality chip */}
              {filters.locality && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                  style={{ background: 'rgba(244,114,182,0.12)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.25)' }}>
                  📍 {filters.locality}
                </span>
              )}
            </div>
          )}

          {!hasSearched && <div className="flex-1" />}

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
            {hasSearched && (
              <button onClick={goHome} className="btn-icon btn-ghost" title="Nova consulta"
                style={{ color: 'var(--color-primary)' }}>
                <RotateCcw size={15} />
              </button>
            )}
            {user && (
              <button onClick={onSignOut} className="btn-icon btn-ghost" style={{ color: 'var(--red)' }}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULTS FILTERS — MOBILE ── */}
      {hasSearched && appMode === 'fuel' && (
        <div className="sm:hidden px-4 pb-3 space-y-2 glass-dark" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Fuel pills */}
          <div className="pills-scroll flex gap-2 pt-2">
            {RESULT_FUEL_TYPES.map(type => {
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

          {/* District + Municipality + Sort */}
          <div className="flex items-center gap-2">
            <select
              value={filters.district}
              onChange={e => handleDistrictChange(e.target.value)}
              className={`form-select flex-1 text-xs ${filters.district ? 'form-select-active' : ''}`}
            >
              <option value="">Distrito</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={filters.municipality}
              onChange={e => handleMunicipalityChange(e.target.value)}
              className={`form-select flex-1 text-xs ${filters.municipality ? 'form-select-active' : ''}`}
              disabled={!filters.district || loadingMunicipalities}
            >
              <option value="">{loadingMunicipalities ? 'A carregar...' : 'Concelho'}</option>
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Locality row */}
          {filters.municipality && (
            <div className="flex items-center gap-2">
              <select
                value={filters.locality}
                onChange={e => handleLocalityChange(e.target.value)}
                className={`form-select flex-1 text-xs ${filters.locality ? 'form-select-active' : ''}`}
                disabled={!filters.municipality || loadingLocalities}
              >
                <option value="">{loadingLocalities ? 'A carregar...' : 'Todas as localidades'}</option>
                {localities.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Search refinement */}
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg" style={{
              background: 'var(--bg-raised)',
              border: '1px solid ' + (localSearch ? 'var(--color-primary)' : 'var(--border)'),
            }}>
              <Search size={14} style={{ color: localSearch ? 'var(--color-primary)' : 'var(--text-dim)' }} className="shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por nome ou marca..."
                value={localSearch}
                onChange={e => handleSearchChange(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none min-w-0"
                style={{ color: 'var(--text)', fontWeight: 500 }}
              />
              {localSearch && (
                <button onClick={handleClear} className="p-0.5 rounded hover:bg-white/10">
                  <X size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>

            <select
              value={filters.sortBy}
              onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
              className="form-select text-xs"
            >
              <option value="price_asc">Mais barato</option>
              <option value="price_desc">Mais caro</option>
              <option value="name">Nome A-Z</option>
            </select>
            <div className="toggle-group shrink-0">
              <button onClick={() => onViewModeChange('cards')} className={viewMode === 'cards' ? 'active' : ''}><LayoutGrid size={13} /></button>
              <button onClick={() => onViewModeChange('list')} className={viewMode === 'list' ? 'active' : ''}><List size={13} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS FILTERS — DESKTOP ── */}
      {hasSearched && appMode === 'fuel' && (
        <div className="hidden sm:block px-4 sm:px-6 lg:px-8 py-2 glass-dark">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {/* Fuel pills */}
            <div className="flex gap-2 flex-1 min-w-0 flex-wrap">
              {RESULT_FUEL_TYPES.map(type => {
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

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={filters.district}
                onChange={e => handleDistrictChange(e.target.value)}
                className={`form-select text-xs ${filters.district ? 'form-select-active' : ''}`}
              >
                <option value="">Distrito</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={filters.municipality}
                onChange={e => handleMunicipalityChange(e.target.value)}
                className={`form-select text-xs ${filters.municipality ? 'form-select-active' : ''}`}
                disabled={!filters.district || loadingMunicipalities}
              >
                <option value="">{loadingMunicipalities ? 'A carregar...' : 'Concelho'}</option>
                {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {filters.municipality && (
                <select
                  value={filters.locality}
                  onChange={e => handleLocalityChange(e.target.value)}
                  className={`form-select text-xs ${filters.locality ? 'form-select-active' : ''}`}
                  disabled={!filters.municipality || loadingLocalities}
                >
                  <option value="">{loadingLocalities ? 'A carregar...' : 'Localidade'}</option>
                  {localities.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              )}
              <select
                value={filters.sortBy}
                onChange={e => onFiltersChange({ sortBy: e.target.value as StationFilters['sortBy'] })}
                className="form-select text-xs"
              >
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
