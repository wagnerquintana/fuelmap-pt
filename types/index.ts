export type FuelType =
  | 'Gasolina 95'
  | 'Gasolina 98'
  | 'Gasóleo'
  | 'Gasóleo Verde'
  | 'GPL Auto'
  | 'GNV'
  | string

export interface FuelPrice {
  type: FuelType
  price: number | null
  updated_at: string
}

export interface Station {
  id: string
  name: string
  brand: string | null
  address: string | null
  locality: string | null
  municipality: string | null
  district: string | null
  lat: number | null
  lng: number | null
  schedule: string | null
  fuels: FuelPrice[]
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  station_id: string
  created_at: string
  station?: Station
}

export type FilterFuelType = FuelType | 'all'

export interface StationFilters {
  search: string
  fuelType: FilterFuelType
  district: string
  municipality: string
  locality: string
  sortBy: 'price_asc' | 'price_desc' | 'name'
}

// ── EV Types ──

export type AppMode = 'fuel' | 'ev'

export interface EVConnector {
  type: string
  powerKW: number | null
  quantity: number
  status: string | null
}

export interface EVStation {
  id: string
  name: string
  operator: string | null
  address: string | null
  town: string | null
  state: string | null
  lat: number
  lng: number
  connectors: EVConnector[]
  totalPoints: number
  usageCost: string | null
  isOperational: boolean
  distance: number | null
  updated_at: string
}
