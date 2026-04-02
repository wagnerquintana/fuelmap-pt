import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, source, district, fuel_type, metadata } = await req.json()

  if (!email || !source) {
    return NextResponse.json({ error: 'email e source obrigatórios' }, { status: 400 })
  }

  const { error } = await supabase
    .from('leads')
    .upsert({ email, source, district, fuel_type, metadata: metadata || {} }, {
      onConflict: 'email,source',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
