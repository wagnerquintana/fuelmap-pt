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

function priceColor(price: number | null, isFav: boolean) {
  if (isFav) return '#f59e0b'
  if (price === null) return '#d1d5db'
  if (price < 1.5) return '#22c55e'
  if (price < 1.7) return '#3b82f6'
  return '#ef4444'
}

function priceShadow(price: number | null, isFav: boolean) {
  if (isFav) return 'rgba(245,158,11,0.40)'
  if (price === null) return 'rgba(0,0,0,0.10)'
  if (price < 1.5) return 'rgba(34,197,94,0.38)'
  if (price < 1.7) return 'rgba(59,130,246,0.38)'
  return 'rgba(239,68,68,0.38)'
}

function priceGradient(price: number | null) {
  if (price === null) return 'linear-gradient(135deg, #e2e8f0, #cbd5e1)'
  if (price < 1.5) return 'linear-gradient(135deg, #16a34a, #22c55e)'
  if (price < 1.7) return 'linear-gradient(135deg, #1d4ed8, #3b82f6)'
  return 'linear-gradient(135deg, #dc2626, #ef4444)'
}

function fuelLabel(type: string) {
  return type
    .replace('Gasolina simples ', 'G')
    .replace('Gasolina especial ', 'G+')
    .replace('Gasóleo simples', 'Gasóleo')
    .replace('Gasóleo especial', 'Gasóleo+')
}

export default function Map({ stations, selectedStation, favorites, fuelType, onSelectStation }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any>(null)

  // Inicialização do mapa
  useEffect(() => {
    if (typeof window === 'undefined') return
    Promise.all([
      import('leaflet'),
      import('leaflet.markercluster'),
    ]).then(([L]) => {
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

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapRef.current = map
      updateMarkers(L, map, stations, fuelType, favorites, selectedStation)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = null
      }
    }
  }, [])

  // Atualiza marcadores quando dados ou seleção mudam
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => updateMarkers(L, mapRef.current, stations, fuelType, favorites, selectedStation))
  }, [stations, fuelType, favorites, selectedStation])

  // Pan para posto selecionado
  useEffect(() => {
    if (!selectedStation || !mapRef.current) return
    if (selectedStation.lat && selectedStation.lng) {
      mapRef.current.setView([selectedStation.lat, selectedStation.lng], 15, { animate: true })
    }
  }, [selectedStation])

  function updateMarkers(L: any, map: any, stationList: Station[], fuel: FilterFuelType, favs: Set<string>, selected: Station | null) {
    if (markersRef.current) {
      map.removeLayer(markersRef.current)
    }

    // @ts-ignore — markerClusterGroup vem do plugin
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (clusterObj: any) => {
        const count = clusterObj.getChildCount()
        const size = count < 20 ? 'small' : count < 80 ? 'medium' : 'large'
        return L.divIcon({
          html: `<div class="fm-cluster fm-cluster-${size}"><span>${count}</span></div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
      },
    })

    stationList.forEach(station => {
      if (!station.lat || !station.lng) return

      const isFav = favs.has(station.id)
      const price = getPriceForFuel(station, fuel)
      const isSelected = selected?.id === station.id
      const color = priceColor(price, isFav)
      const shadow = priceShadow(price, isFav)
      const label = isFav ? '★' : price ? price.toFixed(3) : '?'

      const icon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 8px ${shadow})">
            ${isSelected ? `
              <div style="
                position:absolute;top:-6px;left:50%;transform:translateX(-50%);
                width:52px;height:52px;border-radius:50%;
                border:2px solid ${color};opacity:0.5;
                animation:fm-pulse 1.4s ease-out infinite;
                pointer-events:none;
              "></div>` : ''}
            <div style="
              background:${isSelected ? color : 'white'};
              border:2px solid ${color};
              border-radius:10px;
              padding:${price ? '2px 6px' : '4px 6px'};
              font-size:${price ? '9px' : '10px'};
              font-weight:900;
              color:${isSelected ? 'white' : color};
              white-space:nowrap;
              letter-spacing:-0.3px;
              min-width:${price ? '44px' : '20px'};
              text-align:center;
              line-height:1.3;
              ${isSelected ? `box-shadow:0 0 0 3px ${shadow.replace('0.38','0.25')},0 0 0 5px ${shadow.replace('0.38','0.10')};` : ''}
            ">${label}</div>
            <div style="
              width:0;height:0;
              border-left:5px solid transparent;
              border-right:5px solid transparent;
              border-top:5px solid ${color};
              margin-top:-1px;
            "></div>
          </div>
        `,
        className: '',
        iconSize: [54, 34],
        iconAnchor: [27, 34],
        popupAnchor: [0, -36],
      })

      const headerGradient = isFav
        ? 'linear-gradient(135deg, #b45309, #f59e0b)'
        : priceGradient(price)

      const fuelsHtml = station.fuels
        .filter(f => f.price)
        .map(f => {
          const p = f.price!
          const c = p < 1.5 ? '#16a34a' : p < 1.7 ? '#1d4ed8' : '#dc2626'
          const bg = p < 1.5 ? '#f0fdf4' : p < 1.7 ? '#eff6ff' : '#fef2f2'
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f8fafc">
              <span style="font-size:11px;color:#6b7280;font-weight:500">${fuelLabel(f.type)}</span>
              <span style="
                font-size:11px;font-weight:900;
                background:${bg};color:${c};
                padding:2px 8px;border-radius:20px;
              ">${formatPrice(f.price)} €/L</span>
            </div>`
        }).join('')

      const popup = `
        <div style="min-width:210px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden">
          <div style="background:${headerGradient};padding:10px 12px 10px;margin:-1px -1px 0 -1px;border-radius:15px 15px 0 0">
            <div style="font-weight:800;font-size:13px;color:white;line-height:1.3">${station.name}</div>
            ${station.brand ? `<div style="font-size:9px;color:rgba(255,255,255,0.75);font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px">${station.brand}</div>` : ''}
          </div>
          ${station.address ? `
            <div style="padding:7px 12px 0;font-size:10px;color:#9ca3af;display:flex;align-items:center;gap:4px">
              <span>📍</span>${station.address}
            </div>` : ''}
          <div style="padding:${station.address ? '6px' : '10px'} 12px 10px">
            ${fuelsHtml || '<span style="color:#9ca3af;font-size:11px">Preços não disponíveis</span>'}
          </div>
        </div>
      `

      const marker = L.marker([station.lat, station.lng], { icon })
      marker.bindPopup(popup, { maxWidth: 280, minWidth: 210 })
      marker.on('click', () => onSelectStation(station))
      cluster.addLayer(marker)
    })

    map.addLayer(cluster)
    markersRef.current = cluster
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <style>{`
        /* Cluster icons — brand gradient */
        .fm-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          border: 2.5px solid rgba(255,255,255,0.9);
        }
        .fm-cluster span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
        .fm-cluster-small {
          width: 36px; height: 36px;
          font-size: 11px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 4px 14px rgba(99,102,241,0.40);
        }
        .fm-cluster-medium {
          width: 42px; height: 42px;
          font-size: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 6px 18px rgba(124,58,237,0.40);
        }
        .fm-cluster-large {
          width: 48px; height: 48px;
          font-size: 13px;
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          box-shadow: 0 8px 22px rgba(147,51,234,0.40);
        }

        /* Override default markercluster styles */
        .marker-cluster-anim .leaflet-marker-icon,
        .marker-cluster-anim .leaflet-marker-shadow {
          transition: transform 0.25s ease-out, opacity 0.25s ease-out !important;
        }

        /* Zoom controls */
        .leaflet-control-zoom {
          box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important;
          border-radius: 14px !important;
          border: 1px solid rgba(226,232,240,0.8) !important;
          overflow: hidden;
          margin-bottom: 8px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(255,255,255,0.95) !important;
          color: #334155 !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 18px !important;
          font-weight: 300 !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover { background: #f8fafc !important; color: #3b82f6 !important; }
        .leaflet-control-zoom-out { border-bottom: none !important; }

        /* Attribution */
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(8px);
          border-radius: 8px 0 0 0 !important;
          font-size: 9px !important;
          padding: 3px 6px !important;
        }

        /* Popup */
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(226,232,240,0.6) !important;
          border: none !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-close-button {
          top: 6px !important;
          right: 8px !important;
          color: rgba(255,255,255,0.8) !important;
          font-size: 18px !important;
          font-weight: 300 !important;
        }
        .leaflet-popup-close-button:hover { color: white !important; }

        /* Animação do anel pulsante */
        @keyframes fm-pulse {
          0%   { transform: translateX(-50%) scale(0.8); opacity: 0.7; }
          100% { transform: translateX(-50%) scale(1.8); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" role="application" aria-label="Mapa de postos de combustível em Portugal" />
    </>
  )
}
