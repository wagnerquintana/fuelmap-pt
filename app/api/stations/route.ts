import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 1000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const district = searchParams.get('district') || ''

  const allData: any[] = []
  let from = 0

  while (true) {
    let query = supabase
      .from('fuel_stations')
      .select('*')
      .order('name')
      .range(from, from + PAGE_SIZE - 1)

    if (district) query = query.eq('district', district)
    if (search) query = query.or(
      `name.ilike.%${search}%,address.ilike.%${search}%,municipality.ilike.%${search}%,brand.ilike.%${search}%`
    )

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data || data.length === 0) break

    allData.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return NextResponse.json(allData, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
