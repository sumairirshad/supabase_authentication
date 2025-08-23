import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/app/lib/supabase'
import { priceToCreditsMap } from '@/app/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const { data: existing } = await supabase
      .from('used_stripe_sessions')
      .select('session_id')
      .eq('session_id', sessionId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This session has already been used.' }, { status: 409 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    })

    const priceId = session.line_items?.data?.[0]?.price?.id

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    const credits = priceToCreditsMap[priceId]
    if (!credits) {
      return NextResponse.json({ error: 'No credits for this price' }, { status: 400 })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    const { error: insertError } = await supabase
      .from('used_stripe_sessions')
      .insert([{ session_id: sessionId }])

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to store session' }, { status: 500 })
    }

    return NextResponse.json({ credits })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
