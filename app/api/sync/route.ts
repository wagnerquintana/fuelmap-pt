import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllStations } from '@/lib/dgeg'

// Proteção simples via secret header
// Chamado pelo Vercel Cron: GET /api/sync
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const stations = await fetchAllStations()

    if (stations.length === 0) {
      return NextResponse.json({ error: 'No stations returned from DGEG' }, { status: 502 })
    }

    // Upsert em lotes de 100
    const batchSize = 100
    for (let i = 0; i < stations.length; i += batchSize) {
      const batch = stations.slice(i, i + batchSize)
      const { error } = await supabase
        .from('fuel_stations')
        .upsert(batch, { onConflict: 'id' })

      if (error) throw error
    }

    await supabase.from('sync_log').insert({
      stations_count: stations.length,
      status: 'success',
    })

    return NextResponse.json({ success: true, count: stations.length })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
