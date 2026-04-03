import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get('district')
  if (!district) {
    return NextResponse.json({ error: 'district is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('fuel_stations')
    .select('municipality')
    .eq('district', district)
    .not('municipality', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const unique = [...new Set(data.map(r => r.municipality as string))].filter(Boolean).sort()

  return NextResponse.json(unique, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
