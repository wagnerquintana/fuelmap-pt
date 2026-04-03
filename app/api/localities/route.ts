import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const district = req.nextUrl.searchParams.get('district')
  const municipality = req.nextUrl.searchParams.get('municipality')

  if (!district || !municipality) {
    return NextResponse.json({ error: 'district and municipality are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('fuel_stations')
    .select('locality')
    .eq('district', district)
    .eq('municipality', municipality)
    .not('locality', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const unique = [...new Set(data.map(r => r.locality as string))].filter(Boolean).sort()

  return NextResponse.json(unique, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
