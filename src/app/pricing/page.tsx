'use client'

import { stripePromise } from '@/app/lib/stripe'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { useState } from 'react'
import { pricingPlans } from '@/app/lib/pricing'
import Sidebar from '../components/Sidebar'

const PricingPage = () => {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId)
    const stripe = await stripePromise

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    })

    const session = await res.json()

    const result = await stripe?.redirectToCheckout({
      sessionId: session.id,
    })

    if (result?.error) {
      alert(result.error.message)
    }
    setLoadingPriceId(null)
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
  
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-16 px-6">
            
            <h1 className="text-4xl font-bold text-center mb-10">Buy Transcription Credits</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className="bg-white/10 border border-white/20 rounded-xl p-8 backdrop-blur-md shadow-xl flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.2 }}
                >
                  <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
                  <p className="text-4xl font-bold mb-2">${plan.price}</p>
                  <p className="mb-6 text-sm">{plan.credits} Transcription Credits</p>
                  <Button
                    className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-full"
                    onClick={() => handleCheckout(plan.stripePriceId)}
                    disabled={loadingPriceId === plan.stripePriceId}
                  >
                    {loadingPriceId === plan.stripePriceId ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-black rounded-full"></span>
                        Processing...
                      </span>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PricingPage
