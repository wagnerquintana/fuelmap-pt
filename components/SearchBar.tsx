'use client'

import { Search, X, Fuel, Star, LogOut, Calculator } from 'lucide-react'
import Link from 'next/link'
import { StationFilters, FilterFuelType } from '@/types'
import { FUEL_TYPES, FUEL_LABELS } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

interface SearchBarProps {
  filters: StationFilters
  user: User | null
  stationCount: number
  showFavoritesOnly: boolean
  onFiltersChange: (f: Partial<StationFilters>) => void
  onToggleFavorites: () => void
  onSignOut: () => void
}

export default function SearchBar({
  filters, user, stationCount, showFavoritesOnly,
  onFiltersChange, onToggleFavorites, onSignOut,
}: SearchBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex flex-col items-center gap-3 pointer-events-none">

      {/* Barra principal */}
      <div
        className="w-full max-w-xl flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <Fuel size={13} color="white" />
          </div>
          <span className="font-black text-sm tracking-tight text-gray-800 hidden sm:block">FuelMap</span>
        </div>

        <div className="w-px h-5 bg-gray-200 shrink-0" />

        {/* Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar posto, marca, morada..."
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            className="w-full pl-5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          {filters.search && (
            <button onClick={() => onFiltersChange({ search: '' })} className="absolute right-0 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200 shrink-0" />

        {/* Contagem */}
        <span className="text-xs font-semibold text-gray-400 shrink-0">{stationCount} postos</span>

        {/* Favoritos */}
        <button
          onClick={onToggleFavorites}
          className="shrink-0 p-1.5 rounded-xl transition-all"
          style={{
            background: showFavoritesOnly ? '#fef3c7' : 'transparent',
            color: showFavoritesOnly ? '#d97706' : '#9ca3af',
          }}
          title="Ver favoritos"
        >
          <Star size={15} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        </button>

        <Link
          href="/calcular"
          className="shrink-0 p-1.5 rounded-xl transition-all text-gray-400 hover:text-purple-600 hover:bg-purple-50"
          title="Calculadora de poupança"
        >
          <Calculator size={15} />
        </Link>

        {user && (
          <button
            onClick={onSignOut}
            className="shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>

      {/* Pills de combustível */}
      <div className="flex gap-2 pointer-events-auto flex-wrap justify-center">
        {FUEL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => onFiltersChange({ fuelType: type as FilterFuelType })}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: filters.fuelType === type
                ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                : 'rgba(255,255,255,0.88)',
              color: filters.fuelType === type ? '#fff' : '#6b7280',
              backdropFilter: 'blur(12px)',
              boxShadow: filters.fuelType === type
                ? '0 4px 12px rgba(99,102,241,0.35)'
                : '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {FUEL_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
