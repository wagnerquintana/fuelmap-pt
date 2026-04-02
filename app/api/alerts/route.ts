import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, station_id, fuel_type, price_limit } = await req.json()

  if (!email || !station_id || !fuel_type || !price_limit) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  // Verifica se já existe alerta igual
  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('email', email)
    .eq('station_id', station_id)
    .eq('fuel_type', fuel_type)
    .single()

  if (existing) {
    // Atualiza o preço limite
    const { error } = await supabase
      .from('alerts')
      .update({ price_limit, active: true })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ updated: true })
  }

  const { error } = await supabase
    .from('alerts')
    .insert({ email, station_id, fuel_type, price_limit })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
