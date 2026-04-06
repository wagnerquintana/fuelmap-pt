import { NextRequest, NextResponse } from 'next/server'
import { fetchEVStations } from '@/lib/openchargemap'

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const district = searchParams.get('district') || ''
  const municipality = searchParams.get('municipality') || ''
  const locality = searchParams.get('locality') || ''
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    const stations = await fetchEVStations({
      district: district || undefined,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      maxResults: 250,
    })

    let filtered = stations

    // Filter by municipality (match against town or address)
    if (municipality) {
      const normMun = normalize(municipality)
      filtered = filtered.filter(s => {
        const town = s.town ? normalize(s.town) : ''
        const addr = s.address ? normalize(s.address) : ''
        const name = normalize(s.name)
        return town.includes(normMun) || addr.includes(normMun) || name.includes(normMun)
      })
    }

    // Filter by locality (narrower match)
    if (locality) {
      const normLoc = normalize(locality)
      filtered = filtered.filter(s => {
        const town = s.town ? normalize(s.town) : ''
        const addr = s.address ? normalize(s.address) : ''
        const name = normalize(s.name)
        return town.includes(normLoc) || addr.includes(normLoc) || name.includes(normLoc)
      })
    }

    // Filter by free-text search
    const search = (searchParams.get('search') || '').toLowerCase()
    if (search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(search) ||
        (s.operator?.toLowerCase().includes(search)) ||
        (s.address?.toLowerCase().includes(search)) ||
        (s.town?.toLowerCase().includes(search))
      )
    }

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err: any) {
    console.error('EV stations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
