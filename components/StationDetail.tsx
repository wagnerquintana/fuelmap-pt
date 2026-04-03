'use client'

import { useState, useCallback } from 'react'
import { X, Star, MapPin, Bell, Fuel } from 'lucide-react'
import { Station } from '@/types'
import { formatPrice, getPriceForFuel, FUEL_LABELS } from '@/lib/utils'
import AlertModal from './AlertModal'

interface StationDetailProps {
  station: Station
  rank: number
  fuelType: string
  isFavorite: boolean
  cheapestPrice: number | null
  onBack: () => void
  onToggleFavorite: () => void
  onFuelTypeChange?: (fuelType: string) => void
}

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

export default function StationDetail({
  station, rank, fuelType, isFavorite, cheapestPrice, onBack, onToggleFavorite, onFuelTypeChange,
}: StationDetailProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [activeFuel, setActiveFuel] = useState(fuelType)

  const handleFuelClick = useCallback((type: string) => {
    setActiveFuel(type)
    onFuelTypeChange?.(type)
  }, [onFuelTypeChange])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onBack()
  }, [onBack])

  return (
    <>
      {/* Overlay — click outside to close */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={handleOverlayClick}
      >
        {/* Popup card */}
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl animate-slide-up overscroll-contain"
          style={{ border: '1px solid var(--border)', boxShadow: '0 0 48px rgba(0,0,0,0.5), 0 0 24px rgba(99,102,241,0.1)' }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 relative overflow-hidden sticky top-0 z-10"
            style={{ background: rank <= 3
              ? ['linear-gradient(135deg, #059669, #34d399)', 'linear-gradient(135deg, #4f46e5, #818cf8)', 'linear-gradient(135deg, #d97706, #fbbf24)'][rank - 1]
              : 'linear-gradient(135deg, #334155, #475569)'
            }}
          >
            <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
            <div className="flex items-start justify-between relative">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs" style={{ background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    {rank}
                  </span>
                  <span className="text-[11px] font-bold text-white/70">#{rank} mais barato</span>
                </div>
                <h2 className="text-lg font-black text-white leading-tight">{station.name}</h2>
                {station.brand && (
                  <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{station.brand}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <button
                  onClick={onToggleFavorite}
                  className="p-2 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', color: isFavorite ? '#fef08a' : 'rgba(255,255,255,0.5)' }}
                >
                  <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl transition-all hover:bg-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5" style={{ background: 'var(--bg-raised)' }}>
            {/* Address + navigation */}
            {station.address && (
              <div className="mb-5">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'white' }}>{station.address}</p>
                    {station.municipality && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{station.municipality}{station.district ? `, ${station.district}` : ''}</p>
                    )}
                  </div>
                </div>
                {station.lat && station.lng && (
                  <div className="flex gap-2 mt-3 ml-7">
                    <a
                      href={`https://waze.com/ul?ll=${station.lat},${station.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(51,171,255,0.1)', border: '1px solid rgba(51,171,255,0.25)', color: '#33abff' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(51,171,255,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.95 1.29 5.59 3.33 7.4L4 22l2.82-1.2A9.93 9.93 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#33abff"/><circle cx="8.5" cy="10.5" r="1.5" fill="#fff"/><circle cx="15.5" cy="10.5" r="1.5" fill="#fff"/><path d="M8.5 15c0 0 1.5 2 3.5 2s3.5-2 3.5-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                      Waze
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', color: '#4285f4' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(66,133,244,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285f4"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>
                      Maps
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Fuels — clickable to change selection */}
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Combustíveis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {station.fuels.map(f => {
                const color = getPriceColor(f.price ?? null)
                const bg = getPriceBg(f.price ?? null)
                const isActive = f.type === activeFuel
                return (
                  <button
                    key={f.type}
                    onClick={() => handleFuelClick(f.type)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: isActive ? `${color}15` : bg,
                      border: isActive ? `1.5px solid ${color}` : '1px solid var(--border)',
                      boxShadow: isActive ? `0 0 20px ${color}25` : 'none',
                      transform: isActive ? 'scale(1.02)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Fuel size={13} style={{ color }} />
                      <span className="text-xs font-bold" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.8)' }}>{f.type}</span>
                    </div>
                    {f.price ? (
                      <span className="text-base font-black" style={{ color }}>{f.price.toFixed(3)} €/L</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Alert */}
            <button
              onClick={() => setShowAlert(true)}
              className="btn w-full py-3 text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', borderColor: 'rgba(249,115,22,0.3)', boxShadow: '0 0 20px rgba(249,115,22,0.25)' }}
            >
              <Bell size={14} />
              Criar alerta de preço
            </button>
          </div>
        </div>
      </div>

      {showAlert && (
        <AlertModal
          station={station}
          defaultFuelType={activeFuel !== 'all' ? activeFuel : undefined}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  )
}
