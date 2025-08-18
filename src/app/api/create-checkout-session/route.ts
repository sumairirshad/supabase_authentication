import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { priceToCreditsMap } from '@/app/lib/pricing'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

export async function POST(req: NextRequest) {
  const { priceId } = await req.json()

  try {
    const credits = priceToCreditsMap[priceId] || 0
    const priceObj = await stripe.prices.retrieve(priceId)
    const isRecurring = priceObj.recurring !== null

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?credits=${credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    })

    return NextResponse.json({ id: session.id })
  } catch (err: any) {
    console.error('Stripe Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
