import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import {
  calculateShippingCost,
  getShippingZone,
} from "@/lib/config/Shipping-zone";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("🔔 Webhook reçu:", event.type);

    // ✅ Utiliser l'événement correct pour les sessions Stripe
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Session complétée:", session.id);
      console.log("📦 Customer details:", session.customer_details);

      // Les frais de livraison sont déjà calculés et payés à ce stade
      // On peut juste logger pour vérification
      if (session.customer_details?.address?.country) {
        const country = session.customer_details.address.country;
        const subtotal = parseFloat(session.metadata?.subtotal || "0");
        const shippingCost = calculateShippingCost(subtotal, country);
        const zone = getShippingZone(country);

        console.log(
          `📍 Pays: ${country}, Zone: ${zone?.name}, Frais: ${shippingCost}€`
        );
      }
    }

    // ✅ Alternative : utiliser checkout.session.async_payment_succeeded si nécessaire
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      console.log("💰 Paiement asynchrone réussi:", session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erreur webhook shipping:", error);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
