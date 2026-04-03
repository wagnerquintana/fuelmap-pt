import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 1000
const MIN_RESULTS = 5

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => d * Math.PI / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function fetchAll(query: any) {
  const allData: any[] = []
  let from = 0
  while (true) {
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    allData.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return allData
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const district = searchParams.get('district') || ''
  const municipality = searchParams.get('municipality') || ''
  const locality = searchParams.get('locality') || ''

  try {
    let query = supabase.from('fuel_stations').select('*').order('name')
    if (district) query = query.eq('district', district)
    if (municipality) query = query.eq('municipality', municipality)
    if (locality) query = query.eq('locality', locality)
    if (search) query = query.or(
      `name.ilike.%${search}%,address.ilike.%${search}%,municipality.ilike.%${search}%,brand.ilike.%${search}%`
    )

    const allData = await fetchAll(query)

    // Always fetch nearby stations when locality is specified
    if (locality && municipality) {
      const localIds = new Set(allData.map((s: any) => s.id))

      // Calculate center of the locality stations
      const withCoords = allData.filter((s: any) => s.lat && s.lng)
      let centerLat: number, centerLng: number

      if (withCoords.length > 0) {
        centerLat = withCoords.reduce((sum: number, s: any) => sum + Number(s.lat), 0) / withCoords.length
        centerLng = withCoords.reduce((sum: number, s: any) => sum + Number(s.lng), 0) / withCoords.length
      } else {
        // Fallback: just get more from the municipality
        centerLat = 0
        centerLng = 0
      }

      // Fetch all stations from the same municipality
      let nearbyQuery = supabase.from('fuel_stations').select('*')
        .eq('district', district)
        .eq('municipality', municipality)
        .order('name')

      const municipalityStations = await fetchAll(nearbyQuery)

      // Filter out already included, calculate distance, sort by proximity
      const nearby = municipalityStations
        .filter((s: any) => !localIds.has(s.id))
        .map((s: any) => ({
          ...s,
          _nearby: true,
          _distance: (s.lat && s.lng && centerLat)
            ? haversineKm(centerLat, centerLng, Number(s.lat), Number(s.lng))
            : 999,
        }))
        .sort((a: any, b: any) => a._distance - b._distance)

      // Mark original stations
      const marked = allData.map((s: any) => ({ ...s, _nearby: false, _distance: 0 }))

      return NextResponse.json([...marked, ...nearby], {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
      })
    }

    return NextResponse.json(allData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
