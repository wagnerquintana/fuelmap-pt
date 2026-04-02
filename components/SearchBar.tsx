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
    <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-4 pb-3 flex flex-col items-center gap-2.5 pointer-events-none">

      {/* Barra principal */}
      <div
        className="w-full max-w-xl flex items-center gap-3 px-4 py-2.5 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.7) inset',
          border: '1px solid rgba(226,232,240,0.6)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}
          >
            <Fuel size={14} color="white" strokeWidth={2.5} />
          </div>
          <span
            className="font-black text-sm tracking-tight hidden sm:block"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            FuelMap
          </span>
        </div>

        <div className="w-px h-5 bg-gray-200/80 shrink-0" />

        {/* Input */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Buscar posto, marca, morada..."
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            className="w-full pl-5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
            style={{ fontWeight: 500 }}
          />
          {filters.search && (
            <button onClick={() => onFiltersChange({ search: '' })} className="absolute right-0 top-1/2 -translate-y-1/2">
              <X size={13} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200/80 shrink-0" />

        {/* Contagem */}
        <span
          className="text-[11px] font-black shrink-0 tabular-nums"
          style={{ color: '#3b82f6' }}
        >
          {stationCount}
          <span className="font-medium text-gray-400 ml-0.5">postos</span>
        </span>

        {/* Favoritos */}
        <button
          onClick={onToggleFavorites}
          className="shrink-0 p-1.5 rounded-xl press-scale"
          style={{
            background: showFavoritesOnly ? '#fef3c7' : 'transparent',
            color: showFavoritesOnly ? '#d97706' : '#9ca3af',
            boxShadow: showFavoritesOnly ? '0 2px 8px rgba(217,119,6,0.20)' : 'none',
          }}
          title="Ver favoritos"
        >
          <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        <Link
          href="/calcular"
          className="shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 press-scale"
          title="Calculadora de poupança"
        >
          <Calculator size={14} strokeWidth={2} />
        </Link>

        {user && (
          <button
            onClick={onSignOut}
            className="shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Sair"
          >
            <LogOut size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Pills de combustível — gradient border technique */}
      <div className="flex gap-2 pointer-events-auto flex-wrap justify-center">
        {FUEL_TYPES.map(type => {
          const active = filters.fuelType === type
          return (
            <button
              key={type}
              onClick={() => onFiltersChange({ fuelType: type as FilterFuelType })}
              className="text-[11px] px-3.5 py-1.5 rounded-full font-bold press-scale"
              style={active ? {
                /* Gradient border trick: padding-box + border-box */
                background: 'linear-gradient(rgba(241,245,255,0.95), rgba(241,245,255,0.95)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box',
                border: '1.5px solid transparent',
                color: '#4f46e5',
                boxShadow: '0 0 0 3px rgba(99,102,241,0.10), 0 4px 16px rgba(59,130,246,0.18)',
                transform: 'translateY(-1px)',
                backdropFilter: 'blur(16px)',
              } : {
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid rgba(203,213,225,0.5)',
                color: '#94a3b8',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {FUEL_LABELS[type]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
