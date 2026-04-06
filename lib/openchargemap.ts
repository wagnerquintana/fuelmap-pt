import { EVStation, EVConnector } from '@/types'

const OCM_BASE = 'https://api.openchargemap.io/v3/poi'

interface OCMConnection {
  ConnectionTypeID: number
  ConnectionType?: { Title: string }
  PowerKW?: number
  Quantity?: number
  StatusType?: { IsOperational: boolean; Title: string }
}

interface OCMRecord {
  ID: number
  AddressInfo: {
    Title: string
    AddressLine1?: string
    Town?: string
    StateOrProvince?: string
    Latitude: number
    Longitude: number
    Distance?: number
  }
  OperatorInfo?: { Title: string } | null
  Connections?: OCMConnection[]
  NumberOfPoints?: number
  UsageCost?: string | null
  StatusType?: { IsOperational: boolean }
  DateLastStatusUpdate?: string
}

const CONNECTOR_NAMES: Record<number, string> = {
  1: 'Type 1 (J1772)',
  2: 'CHAdeMO',
  25: 'Type 2 (Mennekes)',
  27: 'Tesla Supercharger',
  30: 'Tesla (Type 2)',
  32: 'CCS (Type 1)',
  33: 'CCS (Type 2)',
  0: 'Desconhecido',
}

function mapConnector(c: OCMConnection): EVConnector {
  return {
    type: c.ConnectionType?.Title || CONNECTOR_NAMES[c.ConnectionTypeID] || `Tipo ${c.ConnectionTypeID}`,
    powerKW: c.PowerKW ?? null,
    quantity: c.Quantity ?? 1,
    status: c.StatusType?.Title ?? null,
  }
}

function mapStation(r: OCMRecord): EVStation {
  const connectors = (r.Connections || []).map(mapConnector)
  return {
    id: `ev-${r.ID}`,
    name: r.AddressInfo.Title || 'Posto EV',
    operator: r.OperatorInfo?.Title ?? null,
    address: r.AddressInfo.AddressLine1 ?? null,
    town: r.AddressInfo.Town ?? null,
    state: r.AddressInfo.StateOrProvince ?? null,
    lat: r.AddressInfo.Latitude,
    lng: r.AddressInfo.Longitude,
    connectors,
    totalPoints: r.NumberOfPoints ?? connectors.reduce((sum, c) => sum + c.quantity, 0),
    usageCost: r.UsageCost ?? null,
    isOperational: r.StatusType?.IsOperational !== false,
    distance: r.AddressInfo.Distance ?? null,
    updated_at: r.DateLastStatusUpdate || new Date().toISOString(),
  }
}

export interface EVSearchParams {
  latitude?: number
  longitude?: number
  district?: string
  maxResults?: number
}

// District center coordinates for Portugal
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Aveiro': [40.6405, -8.6538],
  'Beja': [38.0154, -7.8631],
  'Braga': [41.5503, -8.4269],
  'Bragança': [41.8061, -6.7568],
  'Castelo Branco': [39.8197, -7.4909],
  'Coimbra': [40.2033, -8.4103],
  'Évora': [38.5711, -7.9093],
  'Faro': [37.0194, -7.9304],
  'Guarda': [40.5373, -7.2676],
  'Leiria': [39.7436, -8.8072],
  'Lisboa': [38.7223, -9.1393],
  'Portalegre': [39.2967, -7.4307],
  'Porto': [41.1579, -8.6291],
  'Santarém': [39.2369, -8.6870],
  'Setúbal': [38.5244, -8.8882],
  'Viana do Castelo': [41.6918, -8.8344],
  'Vila Real': [41.2959, -7.7462],
  'Viseu': [40.6610, -7.9097],
  'Região Autónoma dos Açores': [37.7412, -25.6756],
  'Região Autónoma da Madeira': [32.6669, -16.9241],
}

export async function fetchEVStations(params: EVSearchParams): Promise<EVStation[]> {
  const { district, maxResults = 200 } = params
  let { latitude, longitude } = params

  if (!latitude || !longitude) {
    if (district && DISTRICT_COORDS[district]) {
      [latitude, longitude] = DISTRICT_COORDS[district]
    } else {
      // Default: center of Portugal
      latitude = 39.5
      longitude = -8.0
    }
  }

  const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY || ''
  const url = new URL(OCM_BASE)
  url.searchParams.set('output', 'json')
  url.searchParams.set('countrycode', 'PT')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('distance', '80')
  url.searchParams.set('distanceunit', 'KM')
  url.searchParams.set('maxresults', String(maxResults))
  url.searchParams.set('compact', 'false')
  url.searchParams.set('verbose', 'false')
  if (apiKey) url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    console.error(`Open Charge Map error: ${res.status}`)
    return []
  }

  const data: OCMRecord[] = await res.json()
  return data.map(mapStation)
}
