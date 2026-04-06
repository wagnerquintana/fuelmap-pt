import { NextRequest, NextResponse } from 'next/server'
import { fetchEVStations } from '@/lib/openchargemap'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const district = searchParams.get('district') || ''
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    const stations = await fetchEVStations({
      district: district || undefined,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      maxResults: 200,
    })

    // Filter by search if provided
    const search = (searchParams.get('search') || '').toLowerCase()
    const filtered = search
      ? stations.filter(s =>
          s.name.toLowerCase().includes(search) ||
          (s.operator?.toLowerCase().includes(search)) ||
          (s.address?.toLowerCase().includes(search)) ||
          (s.town?.toLowerCase().includes(search))
        )
      : stations

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err: any) {
    console.error('EV stations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
