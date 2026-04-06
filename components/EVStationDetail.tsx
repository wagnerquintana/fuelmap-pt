'use client'

import { useCallback } from 'react'
import { X, MapPin, Zap, Plug, Clock, ExternalLink } from 'lucide-react'
import { EVStation } from '@/types'
import { getMaxPowerKW, formatPowerKW, getSpeedLabel, getConnectorIcon } from '@/lib/utils'

interface EVStationDetailProps {
  station: EVStation
  onBack: () => void
}

export default function EVStationDetail({ station, onBack }: EVStationDetailProps) {
  const maxKW = getMaxPowerKW(station)
  const speed = getSpeedLabel(maxKW)

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onBack()
  }, [onBack])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl animate-slide-up overscroll-contain"
        style={{ border: '1px solid var(--border)', boxShadow: '0 0 48px rgba(0,0,0,0.5), 0 0 24px rgba(34,211,238,0.1)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 relative overflow-hidden sticky top-0 z-10"
          style={{
            background: maxKW && maxKW >= 150
              ? 'linear-gradient(135deg, #d97706, #f59e0b)'
              : maxKW && maxKW >= 50
              ? 'linear-gradient(135deg, #059669, #34d399)'
              : 'linear-gradient(135deg, #06b6d4, #22d3ee)',
          }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
          <div className="flex items-start justify-between relative">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <Zap size={14} color="white" />
                </div>
                <span className="text-[11px] font-bold text-white/70">{speed.label}</span>
                {station.isOperational ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">Operacional</span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/30 text-white">Indisponível</span>
                )}
              </div>
              <h2 className="text-lg font-black text-white leading-tight">{station.name}</h2>
              {station.operator && (
                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{station.operator}</p>
              )}
            </div>
            <button
              onClick={onBack}
              className="p-2 rounded-xl transition-all hover:bg-white/20 shrink-0 ml-3"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <X size={16} />
            </button>
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
                  {station.town && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {station.town}{station.state ? `, ${station.state}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 ml-7">
                <a
                  href={`https://waze.com/ul?ll=${station.lat},${station.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(51,171,255,0.1)', border: '1px solid rgba(51,171,255,0.25)', color: '#33abff' }}
                >
                  Waze
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)', color: '#4285f4' }}
                >
                  Maps
                </a>
              </div>
            </div>
          )}

          {/* Power summary */}
          <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--ev-dim)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--ev-primary)' }}>Potência máxima</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: 'white' }}>
                  {maxKW !== null ? formatPowerKW(maxKW) : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--ev-primary)' }}>Pontos de carga</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: 'white' }}>{station.totalPoints}</p>
              </div>
            </div>
          </div>

          {/* Connectors */}
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Conectores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {station.connectors.map((c, i) => {
              const cSpeed = getSpeedLabel(c.powerKW)
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: cSpeed.bg, border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getConnectorIcon(c.type)}</span>
                    <div>
                      <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.type}</span>
                      {c.quantity > 1 && (
                        <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>x{c.quantity}</span>
                      )}
                    </div>
                  </div>
                  {c.powerKW ? (
                    <span className="text-base font-black" style={{ color: cSpeed.color }}>{c.powerKW} kW</span>
                  ) : (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Cost */}
          {station.usageCost && (
            <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Custo</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{station.usageCost}</p>
            </div>
          )}

          {/* Open in OCM */}
          <a
            href={`https://openchargemap.org/site/poi/details/${station.id.replace('ev-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full py-3 text-sm font-bold text-white"
            style={{
              background: 'var(--ev-gradient)',
              borderColor: 'rgba(34,211,238,0.3)',
              boxShadow: '0 0 20px var(--ev-glow)',
            }}
          >
            <ExternalLink size={14} />
            Ver no Open Charge Map
          </a>
        </div>
      </div>
    </div>
  )
}
