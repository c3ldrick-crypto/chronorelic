import { NextRequest, NextResponse } from "next/server"
import { constructWebhookEvent, STRIPE_PRODUCTS } from "@/lib/stripe"
import { prisma, type PrismaTx } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await constructWebhookEvent(body, signature)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session    = event.data.object as Stripe.Checkout.Session
    const userId     = session.metadata?.userId
    const productKey = session.metadata?.productKey as keyof typeof STRIPE_PRODUCTS | undefined

    if (!userId || !productKey) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const product = STRIPE_PRODUCTS[productKey]

    await prisma.$transaction(async (tx: PrismaTx) => {
      // Enregistrer l'achat
      await tx.purchase.create({
        data: {
          userId,
          stripeId:      session.id,
          type:          productKey as "PREMIUM_UNLOCK" | "SHARDS_STARTER" | "SHARDS_AVENTURIER" | "SHARDS_LEGENDAIRE",
          amountCents:   session.amount_total ?? 0,
          shardsGranted: "shards" in product ? product.shards : 0,
          status:        "completed",
        },
      })

      // Activer Premium ou ajouter des éclats
      if (productKey === "PREMIUM") {
        await tx.user.update({
          where: { id: userId },
          data:  { isPremium: true, premiumAt: new Date() },
        })
      } else if ("shards" in product) {
        await tx.user.update({
          where: { id: userId },
          data:  { temporalShards: { increment: product.shards } },
        })
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action:   "PURCHASE",
          resource: productKey,
          details:  { stripeSessionId: session.id, amount: session.amount_total },
        },
      })
    })
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: { bodyParser: false },
}
