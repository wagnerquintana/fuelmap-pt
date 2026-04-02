import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-sync-secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Busca alertas ativos
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*, station:fuel_stations(name, fuels)')
    .eq('active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!alerts || alerts.length === 0) return NextResponse.json({ triggered: 0 })

  const triggered: any[] = []

  for (const alert of alerts) {
    const station = alert.station
    if (!station) continue

    const fuels: any[] = station.fuels || []
    const fuel = fuels.find((f: any) => f.type === alert.fuel_type)
    if (!fuel || fuel.price === null) continue

    if (fuel.price <= alert.price_limit) {
      triggered.push({
        email: alert.email,
        station_name: station.name,
        fuel_type: alert.fuel_type,
        current_price: fuel.price,
        price_limit: alert.price_limit,
      })

      // Marca como disparado
      await supabase
        .from('alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id)
    }
  }

  // TODO: integrar Resend/Brevo para enviar emails
  // Por agora regista no log
  if (triggered.length > 0) {
    console.log(`[check-alerts] ${triggered.length} alertas disparados:`, triggered)
  }

  return NextResponse.json({ triggered: triggered.length, alerts: triggered })
}
