import { Station, FuelPrice } from '@/types'

const DGEG_BASE = 'https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb'

interface DGEGRecord {
  Id: number
  Nome: string
  TipoPosto: string
  Municipio: string
  Preco: string
  Marca: string
  Combustivel: string
  DataAtualizacao: string
  Distrito: string
  Morada: string
  Localidade: string
  CodPostal: string
  Latitude: number
  Longitude: number
  Quantidade: number
}

interface DGEGResponse {
  status: boolean
  resultado: DGEGRecord[]
}

export async function fetchAllStations(): Promise<Station[]> {
  const pageSize = 500
  let page = 1
  let total = 0

  // Mapa: id → Station (agrupa combustíveis por posto)
  const map = new Map<string, Station>()

  do {
    const url = `${DGEG_BASE}/PesquisarPostos?idsTiposComb=&qtdItems=${pageSize}&pagina=${page}&f=json`
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      console.error(`DGEG API error: ${res.status}`)
      break
    }

    const data: DGEGResponse = await res.json()
    if (!data.resultado || data.resultado.length === 0) break

    // Total vem no primeiro registo
    if (page === 1 && data.resultado[0]?.Quantidade) {
      total = data.resultado[0].Quantidade
    }

    for (const r of data.resultado) {
      const id = String(r.Id)
      const price = parsePrice(r.Preco)
      const fuel: FuelPrice = {
        type: r.Combustivel,
        price,
        updated_at: r.DataAtualizacao || new Date().toISOString(),
      }

      if (map.has(id)) {
        // Adiciona combustível ao posto existente
        const station = map.get(id)!
        if (!station.fuels.find(f => f.type === r.Combustivel)) {
          station.fuels.push(fuel)
        }
      } else {
        map.set(id, {
          id,
          name: r.Nome || '',
          brand: r.Marca || null,
          address: r.Morada || null,
          locality: r.Localidade || null,
          municipality: r.Municipio || null,
          district: r.Distrito || null,
          lat: r.Latitude || null,
          lng: r.Longitude || null,
          schedule: null,
          fuels: [fuel],
          updated_at: new Date().toISOString(),
        })
      }
    }

    page++
  } while (map.size < total && total > 0)

  return Array.from(map.values())
}

function parsePrice(preco: string): number | null {
  if (!preco) return null
  // "1,799 €/litro" ou "0,829 €"
  const match = preco.replace(',', '.').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : null
}
