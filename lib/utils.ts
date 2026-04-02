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
