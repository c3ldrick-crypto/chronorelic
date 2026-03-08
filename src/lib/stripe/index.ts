import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export const STRIPE_PRODUCTS = {
  PREMIUM: {
    priceId:     process.env.STRIPE_PRICE_PREMIUM!,
    name:        "ChronoRelic Premium",
    description: "Accès illimité, toutes les classes, fusion de reliques et bien plus.",
    price:       999,  // 9.99€ en centimes
  },
  SHARDS_STARTER: {
    priceId:      process.env.STRIPE_PRICE_SHARDS_STARTER!,
    name:         "Pack Temporel — 100 Éclats",
    description:  "100 Éclats Temporels pour booster vos captures.",
    price:        199,  // 1.99€
    shards:       100,
  },
  SHARDS_AVENTURIER: {
    priceId:      process.env.STRIPE_PRICE_SHARDS_AVENTURIER!,
    name:         "Pack Aventurier — 350 Éclats",
    description:  "300 Éclats + 50 bonus. La meilleure valeur pour l'explorateur.",
    price:        499,
    shards:       350,
  },
  SHARDS_LEGENDAIRE: {
    priceId:      process.env.STRIPE_PRICE_SHARDS_LEGENDAIRE!,
    name:         "Pack Légendaire — 950 Éclats",
    description:  "750 Éclats + 200 bonus. Pour les Gardiens du Temps sérieux.",
    price:        999,
    shards:       950,
  },
} as const

export async function createCheckoutSession(params: {
  userId:      string
  email:       string
  priceId:     string
  productKey:  keyof typeof STRIPE_PRODUCTS
  successUrl:  string
  cancelUrl:   string
}) {
  const session = await stripe.checkout.sessions.create({
    mode:                 "payment",
    customer_email:       params.email,
    line_items:           [{ price: params.priceId, quantity: 1 }],
    success_url:          params.successUrl,
    cancel_url:           params.cancelUrl,
    metadata: {
      userId:     params.userId,
      productKey: params.productKey,
    },
    payment_intent_data: {
      metadata: {
        userId:     params.userId,
        productKey: params.productKey,
      },
    },
  })
  return session
}

export async function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
