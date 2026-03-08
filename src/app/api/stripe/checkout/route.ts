import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createCheckoutSession, STRIPE_PRODUCTS } from "@/lib/stripe"
import { z } from "zod"

const checkoutSchema = z.object({
  productKey: z.enum(["PREMIUM", "SHARDS_STARTER", "SHARDS_AVENTURIER", "SHARDS_LEGENDAIRE"]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let body: z.infer<typeof checkoutSchema>
  try {
    body = checkoutSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const product    = STRIPE_PRODUCTS[body.productKey]
  const baseUrl    = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const stripeSession = await createCheckoutSession({
    userId:     session.user.id,
    email:      session.user.email,
    priceId:    product.priceId,
    productKey: body.productKey,
    successUrl: `${baseUrl}/shop?success=true`,
    cancelUrl:  `${baseUrl}/shop?canceled=true`,
  })

  return NextResponse.json({ url: stripeSession.url })
}
