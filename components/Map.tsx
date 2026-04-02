'use client'

import { useEffect, useRef } from 'react'
import { Station, FilterFuelType } from '@/types'
import { formatPrice, getPriceForFuel } from '@/lib/utils'

interface MapProps {
  stations: Station[]
  selectedStation: Station | null
  favorites: Set<string>
  fuelType: FilterFuelType
  onSelectStation: (station: Station) => void
}

export default function Map({ stations, selectedStation, favorites, fuelType, onSelectStation }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    import('leaflet').then(L => {
      if (!containerRef.current) return
      if ((containerRef.current as any)._leaflet_id) return
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl

      const map = L.map(containerRef.current, {
        center: [39.5, -8.0],
        zoom: 7,
        zoomControl: false,
        attributionControl: true,
      })

      // Tiles limpos e modernos — CartoDB Positron
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Zoom no canto inferior direito, acima do bottom sheet
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapRef.current = map
      updateMarkers(L, map)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => updateMarkers(L, mapRef.current))
  }, [stations, fuelType, favorites])

  useEffect(() => {
    if (!selectedStation || !mapRef.current) return
    if (selectedStation.lat && selectedStation.lng) {
      mapRef.current.setView([selectedStation.lat, selectedStation.lng], 15, { animate: true })
    }
  }, [selectedStation])

  function updateMarkers(L: any, map: any) {
    if (markersRef.current) markersRef.current.clearLayers()
    const group = L.layerGroup().addTo(map)
    markersRef.current = group

    stations.forEach(station => {
      if (!station.lat || !station.lng) return

      const isFav = favorites.has(station.id)
      const price = getPriceForFuel(station, fuelType)
      const isSelected = false // handled via map pan

      const color = isFav      ? '#f59e0b'
        : price === null       ? '#d1d5db'
        : price < 1.5          ? '#22c55e'
        : price < 1.7          ? '#3b82f6'
        : '#ef4444'

      const shadow = isFav     ? 'rgba(245,158,11,0.4)'
        : price === null       ? 'rgba(0,0,0,0.1)'
        : price < 1.5          ? 'rgba(34,197,94,0.35)'
        : price < 1.7          ? 'rgba(59,130,246,0.35)'
        : 'rgba(239,68,68,0.35)'

      const icon = L.divIcon({
        html: `
          <div style="
            background: white;
            border: 2.5px solid ${color};
            border-radius: 50%;
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            font-size: 7.5px; font-weight: 800;
            color: ${color};
            box-shadow: 0 4px 14px ${shadow}, 0 0 0 4px ${shadow.replace('0.35', '0.12')};
            letter-spacing: -0.3px;
            transition: transform 0.15s;
          ">${isFav ? '★' : price ? price.toFixed(2) : '?'}</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const fuelsHtml = station.fuels
        .filter(f => f.price)
        .map(f => {
          const p = f.price!
          const c = p < 1.5 ? '#22c55e' : p < 1.7 ? '#3b82f6' : '#ef4444'
          return `<div style="display:flex;justify-content:space-between;gap:14px;padding:4px 0;border-bottom:1px solid #f3f4f6">
            <span style="color:#6b7280;font-size:11px">${f.type}</span>
            <b style="color:${c};font-size:11px">${formatPrice(f.price)}</b>
          </div>`
        }).join('')

      const marker = L.marker([station.lat, station.lng], { icon })
      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,sans-serif;padding:2px">
          <div style="font-weight:800;font-size:13px;color:#111827;margin-bottom:2px">${station.name}</div>
          ${station.brand ? `<div style="font-size:10px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">${station.brand}</div>` : ''}
          ${station.address ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:10px">${station.address}</div>` : ''}
          <div>${fuelsHtml || '<span style="color:#9ca3af;font-size:11px">Preços não disponíveis</span>'}</div>
        </div>
      `, { maxWidth: 260 })
      marker.on('click', () => onSelectStation(station))
      group.addLayer(marker)
    })
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <style>{`
        .leaflet-control-zoom { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; border-radius: 12px !important; border: none !important; overflow: hidden; margin-bottom: 8px !important; }
        .leaflet-control-zoom a { background: white !important; color: #374151 !important; border: none !important; font-size: 16px !important; }
        .leaflet-control-zoom a:hover { background: #f9fafb !important; }
        .leaflet-control-attribution { background: rgba(255,255,255,0.7) !important; backdrop-filter: blur(8px); border-radius: 8px 0 0 0 !important; font-size: 9px !important; }
        .leaflet-popup-content-wrapper { border-radius: 16px !important; box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important; border: 1px solid #f3f4f6 !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
