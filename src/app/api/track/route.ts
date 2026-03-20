import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const today = new Date().toLocaleDateString('en-CA')
  await supabase.rpc('increment_page_view', { view_date: today })
  return NextResponse.json({ ok: true })
}
