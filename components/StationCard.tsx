'use client'

import { Star, MapPin } from 'lucide-react'
import { Station, FilterFuelType } from '@/types'
import { formatPrice, getPriceForFuel, FUEL_LABELS } from '@/lib/utils'

interface StationCardProps {
  station: Station
  isSelected: boolean
  isFavorite: boolean
  fuelType: FilterFuelType
  onSelect: () => void
  onToggleFavorite: () => void
}

export default function StationCard({
  station, isSelected, isFavorite, fuelType, onSelect, onToggleFavorite,
}: StationCardProps) {
  const price = getPriceForFuel(station, fuelType)

  const priceColor = price === null
    ? 'var(--text-dim)'
    : price < 1.5 ? 'var(--green)'
    : price < 1.7 ? 'var(--accent)'
    : 'var(--red)'

  const priceBg = price === null
    ? 'transparent'
    : price < 1.5 ? 'var(--green-dim)'
    : price < 1.7 ? 'var(--blue-dim)'
    : 'var(--red-dim)'

  return (
    <div
      onClick={onSelect}
      className="p-3 rounded-xl cursor-pointer transition-all group"
      style={{
        background: isSelected ? 'var(--surface2)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(79,142,247,0.3)' : 'transparent'}`,
        boxShadow: isSelected ? '0 0 0 1px rgba(79,142,247,0.1) inset' : 'none',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.background = 'var(--surface2)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}
    >
      <div className="flex items-start gap-2">
        {/* Preço destaque */}
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
          style={{ background: priceBg }}
        >
          {price !== null ? (
            <>
              <span className="text-xs font-black leading-none" style={{ color: priceColor }}>
                {price.toFixed(2)}
              </span>
              <span className="text-[9px] leading-none mt-0.5" style={{ color: priceColor, opacity: 0.7 }}>€/L</span>
            </>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>—</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'var(--text)' }}>
            {station.name}
          </p>
          {station.brand && (
            <p className="text-[10px] font-medium uppercase tracking-wide mt-0.5" style={{ color: 'var(--accent)' }}>
              {station.brand}
            </p>
          )}
          {station.address && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={9} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {station.address}
              </p>
            </div>
          )}
        </div>

        {/* Favorito */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite() }}
          className="shrink-0 p-1 rounded-lg transition-all"
          style={{
            color: isFavorite ? 'var(--gold)' : 'var(--text-dim)',
            background: isFavorite ? 'var(--gold-dim)' : 'transparent',
          }}
        >
          <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Pills de combustíveis */}
      {station.fuels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-14">
          {station.fuels
            .filter(f => f.price !== null)
            .slice(0, 3)
            .map(f => {
              const p = f.price!
              const c = p < 1.5 ? 'var(--green)' : p < 1.7 ? 'var(--accent)' : 'var(--red)'
              const bg = p < 1.5 ? 'var(--green-dim)' : p < 1.7 ? 'var(--blue-dim)' : 'var(--red-dim)'
              const label = FUEL_LABELS[f.type] || f.type.replace('Gasolina ', 'G').replace('Gasóleo', 'Gsl').replace(' simples', '').replace(' especial', '+')
              return (
                <span
                  key={f.type}
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: bg, color: c }}
                >
                  {label} {formatPrice(f.price)}
                </span>
              )
            })}
        </div>
      )}
    </div>
  )
}
