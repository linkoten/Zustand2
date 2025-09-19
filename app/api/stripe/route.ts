import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { CheckoutRequest } from "@/types/type";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { cartItems, customerInfo }: CheckoutRequest = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Vérifier que tous les produits existent et sont disponibles
    const productIds = cartItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "AVAILABLE",
      },
    });

    if (products.length !== cartItems.length) {
      return NextResponse.json(
        { error: "Certains produits ne sont plus disponibles" },
        { status: 400 }
      );
    }

    // ✅ Utiliser le bon type pour les line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product || !product.stripePriceId) {
          throw new Error(
            `Prix Stripe non trouvé pour le produit ${item.productId}`
          );
        }

        return {
          price: product.stripePriceId,
          quantity: item.quantity,
        };
      });

    // Calculer les frais de livraison
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingCost = subtotal >= 100 ? 0 : 9.99;

    // ✅ Ajouter les frais de livraison avec le bon type
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Frais de livraison",
            description: "Livraison standard",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
      },
      billing_address_collection: "required",
      metadata: {
        userId: userId,
        cartItemIds: cartItems.map((item) => item.id).join(","),
        productIds: cartItems.map((item) => item.productId).join(","),
      },
      custom_fields: [
        {
          key: "phone",
          label: {
            type: "custom",
            custom: "Numéro de téléphone",
          },
          type: "text",
          optional: true,
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session checkout:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
