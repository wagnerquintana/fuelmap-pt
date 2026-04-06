import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Station, FilterFuelType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null): string {
  if (price === null) return '—'
  return price.toFixed(3) + ' €/L'
}

export function getPriceForFuel(station: Station, fuelType: FilterFuelType): number | null {
  if (fuelType === 'all') {
    const prices = station.fuels.map(f => f.price).filter((p): p is number => p !== null)
    return prices.length > 0 ? Math.min(...prices) : null
  }
  const fuel = station.fuels.find(f => f.type === fuelType)
  return fuel?.price ?? null
}

export const DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
  'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
  'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
  'Viana do Castelo', 'Vila Real', 'Viseu',
  'Região Autónoma dos Açores', 'Região Autónoma da Madeira'
]

export const FUEL_TYPES: FilterFuelType[] = [
  'all',
  'Gasolina simples 95',
  'Gasolina especial 95',
  'Gasolina especial 98',
  'Gasóleo simples',
  'Gasóleo especial',
  'GPL Auto',
]

export const FUEL_LABELS: Record<string, string> = {
  all: 'Todos',
  'Gasolina simples 95': 'Gasolina 95',
  'Gasolina especial 95': 'Gasolina 95+',
  'Gasolina especial 98': 'Gasolina 98',
  'Gasóleo simples': 'Gasóleo',
  'Gasóleo especial': 'Gasóleo+',
  'GPL Auto': 'GPL Auto',
}

export const FUEL_SLUGS: Record<string, string> = {
  all: 'all',
  'Gasolina simples 95': 'g95',
  'Gasolina especial 95': 'g95e',
  'Gasolina especial 98': 'g98',
  'Gasóleo simples': 'gsl',
  'Gasóleo especial': 'gsle',
  'GPL Auto': 'gpl',
}

// ── EV Helpers ──

import { EVStation } from '@/types'

export function getMaxPowerKW(station: EVStation): number | null {
  const powers = station.connectors.map(c => c.powerKW).filter((p): p is number => p !== null)
  return powers.length > 0 ? Math.max(...powers) : null
}

export function formatPowerKW(kw: number | null): string {
  if (kw === null) return '—'
  return kw >= 1000 ? `${(kw / 1000).toFixed(0)} MW` : `${kw} kW`
}

export function getSpeedLabel(kw: number | null): { label: string; color: string; bg: string } {
  if (kw === null) return { label: 'N/A', color: '#475569', bg: 'rgba(255,255,255,0.03)' }
  if (kw >= 150) return { label: 'Ultra-rápido', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  if (kw >= 50) return { label: 'Rápido', color: '#34d399', bg: 'rgba(52,211,153,0.1)' }
  if (kw >= 22) return { label: 'Semi-rápido', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' }
  return { label: 'Normal', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' }
}

export function getConnectorIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('chademo')) return '⚡'
  if (t.includes('ccs')) return '🔌'
  if (t.includes('tesla')) return '🔋'
  if (t.includes('type 2') || t.includes('mennekes')) return '🔌'
  if (t.includes('type 1') || t.includes('j1772')) return '🔌'
  return '⚡'
}
