'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Station, StationFilters, EVStation, AppMode } from '@/types'
import { useAuth } from '@/lib/useAuth'
import { useFavorites } from '@/lib/useFavorites'
import { useExitIntent } from '@/lib/useExitIntent'
import StationGrid from '@/components/StationGrid'
import EVStationGrid from '@/components/EVStationGrid'
import EmailModal from '@/components/EmailModal'
import SaveSearchModal from '@/components/SaveSearchModal'
import ExitIntentPopup from '@/components/ExitIntentPopup'
import Header from '@/components/Header'

const DEFAULT_FILTERS: StationFilters = {
  search: '',
  fuelType: 'Gasolina simples 95',
  district: '',
  municipality: '',
  locality: '',
  sortBy: 'price_asc',
}

export default function Home() {
  const { user, loading: authLoading, sendMagicLink, signOut } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user)
  const exitIntentTriggered = useExitIntent()

  const [appMode, setAppMode] = useState<AppMode>('fuel')
  const [stations, setStations] = useState<Station[]>([])
  const [evStations, setEvStations] = useState<EVStation[]>([])
  const [loadingStations, setLoadingStations] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_FILTERS)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [selectedEVStation, setSelectedEVStation] = useState<EVStation | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null)

  const searchCountRef = useRef(0)
  const saveSearchShownRef = useRef(false)

  // Only fetch when there's a search query, district, municipality or locality selected
  const shouldFetch = !!(filters.search || filters.district || filters.municipality || filters.locality)

  // Fetch fuel stations
  const fetchStations = useCallback(async () => {
    if (appMode !== 'fuel' || !shouldFetch) {
      if (appMode === 'fuel') { setStations([]); setHasSearched(false) }
      return
    }
    setLoadingStations(true)
    setHasSearched(true)
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.district) params.set('district', filters.district)
    if (filters.municipality) params.set('municipality', filters.municipality)
    if (filters.locality) params.set('locality', filters.locality)
    const res = await fetch(`/api/stations?${params}`)
    if (res.ok) setStations(await res.json())
    setLoadingStations(false)

    searchCountRef.current += 1
    const alreadySaved = localStorage.getItem('fuelmap_search_saved')
    if (searchCountRef.current >= 2 && !saveSearchShownRef.current && !alreadySaved) {
      saveSearchShownRef.current = true
      setTimeout(() => setShowSaveSearch(true), 800)
    }
  }, [appMode, filters.search, filters.district, filters.municipality, filters.locality, shouldFetch])

  // Fetch EV stations
  const fetchEVStations = useCallback(async () => {
    if (appMode !== 'ev') return
    if (!filters.district) { setEvStations([]); setHasSearched(false); return }
    setLoadingStations(true)
    setHasSearched(true)
    const params = new URLSearchParams()
    if (filters.district) params.set('district', filters.district)
    if (filters.search) params.set('search', filters.search)
    const res = await fetch(`/api/ev-stations?${params}`)
    if (res.ok) setEvStations(await res.json())
    setLoadingStations(false)
  }, [appMode, filters.district, filters.search])

  useEffect(() => {
    const t = setTimeout(appMode === 'fuel' ? fetchStations : fetchEVStations, 350)
    return () => clearTimeout(t)
  }, [appMode, fetchStations, fetchEVStations])

  useEffect(() => {
    if (exitIntentTriggered) setShowExitIntent(true)
  }, [exitIntentTriggered])

  function handleAppModeChange(mode: AppMode) {
    setAppMode(mode)
    setHasSearched(false)
    setStations([])
    setEvStations([])
    setSelectedStation(null)
    setSelectedEVStation(null)
    setFilters(DEFAULT_FILTERS)
  }

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
    description: 'Precos de combustiveis e postos de carregamento eletrico em Portugal.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Organization', name: 'FuelMap PT' },
  }

  return (
    <div id="main-content" className="flex flex-col w-screen h-dvh" style={{ background: 'var(--bg-base)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header
        filters={filters}
        user={user}
        stationCount={appMode === 'fuel' ? displayedStations.length : evStations.length}
        showFavoritesOnly={showFavoritesOnly}
        viewMode={viewMode}
        hasSearched={hasSearched}
        appMode={appMode}
        onAppModeChange={handleAppModeChange}
        onFiltersChange={handleFiltersChange}
        onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
        onViewModeChange={setViewMode}
        onSignOut={signOut}
      />

      <main className="flex-1 min-h-0">
        {appMode === 'fuel' ? (
          <StationGrid
            stations={displayedStations}
            loading={loadingStations}
            filters={filters}
            selectedStation={selectedStation}
            favorites={favorites}
            viewMode={viewMode}
            hasSearched={hasSearched}
            onSelectStation={setSelectedStation}
            onToggleFavorite={handleToggleFavorite}
            onFiltersChange={handleFiltersChange}
          />
        ) : (
          <EVStationGrid
            stations={evStations}
            loading={loadingStations}
            filters={filters}
            selectedStation={selectedEVStation}
            viewMode={viewMode}
            hasSearched={hasSearched}
            onSelectStation={setSelectedEVStation}
            onFiltersChange={handleFiltersChange}
            onAppModeChange={handleAppModeChange}
          />
        )}
      </main>

      {showEmailModal && (
        <EmailModal
          onSend={handleMagicLink}
          onClose={() => setShowEmailModal(false)}
        />
      )}
      {showSaveSearch && (
        <SaveSearchModal
          district={filters.district}
          fuelType={filters.fuelType}
          onClose={() => setShowSaveSearch(false)}
        />
      )}
      {showExitIntent && (
        <ExitIntentPopup
          district={filters.district}
          onClose={() => setShowExitIntent(false)}
        />
      )}
    </div>
  )
}
