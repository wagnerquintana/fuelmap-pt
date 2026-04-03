'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Station, StationFilters } from '@/types'
import { useAuth } from '@/lib/useAuth'
import { useFavorites } from '@/lib/useFavorites'
import { useExitIntent } from '@/lib/useExitIntent'
import SearchBar from '@/components/SearchBar'
import BottomSheet from '@/components/BottomSheet'
import EmailModal from '@/components/EmailModal'
import SaveSearchModal from '@/components/SaveSearchModal'
import ExitIntentPopup from '@/components/ExitIntentPopup'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const DEFAULT_FILTERS: StationFilters = {
  search: '',
  fuelType: 'Gasolina simples 95',
  district: '',
  sortBy: 'price_asc',
}

export default function Home() {
  const { user, loading: authLoading, sendMagicLink, signOut } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user)
  const exitIntentTriggered = useExitIntent()

  const [stations, setStations] = useState<Station[]>([])
  const [loadingStations, setLoadingStations] = useState(true)
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_FILTERS)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null)

  // Contador de pesquisas para trigger "Guardar Pesquisa"
  const searchCountRef = useRef(0)
  const saveSearchShownRef = useRef(false)

  const fetchStations = useCallback(async () => {
    setLoadingStations(true)
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.district) params.set('district', filters.district)
    const res = await fetch(`/api/stations?${params}`)
    if (res.ok) setStations(await res.json())
    setLoadingStations(false)

    // Trigger "Guardar Pesquisa" na 2ª pesquisa com filtros
    if (filters.search || filters.district) {
      searchCountRef.current += 1
      const alreadySaved = localStorage.getItem('fuelmap_search_saved')
      if (searchCountRef.current >= 2 && !saveSearchShownRef.current && !alreadySaved) {
        saveSearchShownRef.current = true
        setTimeout(() => setShowSaveSearch(true), 800)
      }
    }
  }, [filters.search, filters.district])

  useEffect(() => {
    const t = setTimeout(fetchStations, 300)
    return () => clearTimeout(t)
  }, [fetchStations])

  // Exit intent
  useEffect(() => {
    if (exitIntentTriggered) setShowExitIntent(true)
  }, [exitIntentTriggered])

  function handleFiltersChange(partial: Partial<StationFilters>) {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  function handleToggleFavorite(stationId: string) {
    if (!user) {
      setPendingFavoriteId(stationId)
      setShowEmailModal(true)
      return
    }
    toggleFavorite(stationId)
  }

  async function handleMagicLink(email: string) {
    const result = await sendMagicLink(email)
    if (!result.error) setPendingFavoriteId(null)
    return result
  }

  useEffect(() => {
    if (user && pendingFavoriteId) {
      toggleFavorite(pendingFavoriteId)
      setPendingFavoriteId(null)
    }
  }, [user, pendingFavoriteId])

  const displayedStations = showFavoritesOnly
    ? stations.filter(s => favorites.has(s.id))
    : stations

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FuelMap PT',
    url: 'https://fuelmap-pt.vercel.app',
    description: 'Mapa interativo de preços de combustíveis em Portugal com dados atualizados diariamente da DGEG.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Organization', name: 'FuelMap PT' },
  }

  return (
    <div id="main-content" className="flex flex-col w-screen h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #eef2f7 0%, #e8edf5 100%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Mapa — compacto */}
      <div className="relative flex-shrink-0" style={{ height: '30vh' }}>
        {!authLoading && (
          <Map
            stations={displayedStations}
            selectedStation={selectedStation}
            favorites={favorites}
            fuelType={filters.fuelType}
            onSelectStation={setSelectedStation}
          />
        )}
        <SearchBar
          filters={filters}
          user={user}
          stationCount={displayedStations.length}
          showFavoritesOnly={showFavoritesOnly}
          onFiltersChange={handleFiltersChange}
          onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
          onSignOut={signOut}
        />
        {/* Gradiente de transição suave na base do mapa */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 56,
            background: 'linear-gradient(to bottom, transparent, rgba(238,242,247,0.85))',
          }}
        />
      </div>

      {/* Painel inferior — ocupa o restante */}
      <div className="flex-1 overflow-hidden">
        <BottomSheet
          stations={displayedStations}
          loading={loadingStations}
          filters={filters}
          selectedStation={selectedStation}
          favorites={favorites}
          onSelectStation={setSelectedStation}
          onToggleFavorite={handleToggleFavorite}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Magic Link (favoritos) */}
      {showEmailModal && (
        <EmailModal
          onSend={handleMagicLink}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {/* Guardar pesquisa — trigger na 2ª pesquisa */}
      {showSaveSearch && (
        <SaveSearchModal
          district={filters.district}
          fuelType={filters.fuelType}
          onClose={() => setShowSaveSearch(false)}
        />
      )}

      {/* Exit intent */}
      {showExitIntent && (
        <ExitIntentPopup
          district={filters.district}
          onClose={() => setShowExitIntent(false)}
        />
      )}
    </div>
  )
}
