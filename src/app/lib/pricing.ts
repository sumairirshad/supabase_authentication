
export const pricingPlans = [
  {
    name: 'Basic',
    price: 5,
    credits: 50,
    stripePriceId: 'price_1RxUFeEPLxn9A8IK0IJyF66f',
  },
  {
    name: 'Pro',
    price: 10,
    credits: 120,
    stripePriceId: 'price_1RxUMxEPLxn9A8IKkiIZilD4',
  },
  {
    name: 'Ultimate',
    price: 20,
    credits: 300,
    stripePriceId: 'price_1RxUNREPLxn9A8IKk5IK5hfe',
  },
]

export const priceToCreditsMap = pricingPlans.reduce((acc, plan) => {
  acc[plan.stripePriceId] = plan.credits
  return acc
}, {} as Record<string, number>)
