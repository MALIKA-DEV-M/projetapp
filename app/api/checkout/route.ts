import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Clé STRIPE_SECRET_KEY manquante dans .env.local" }, { status: 500 });
    }

    if (!process.env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json({ error: "STRIPE_PRO_PRICE_ID manquant dans .env.local" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // Désactive Managed Payments uniquement pour cette requête
      managed_payments: {
        enabled: false,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erreur Stripe Checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}