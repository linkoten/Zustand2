"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "../../lib/stripe";
import { getCartAction } from "./cart-actions";
import prisma from "../prisma";
import Stripe from "stripe";
import {
  ALL_SHIPPING_COUNTRIES,
  calculateShippingCost,
} from "@/lib/config/shipping-zones";

export async function fetchClientSecret(): Promise<string> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Utilisateur non connecté");
    }

    const origin = (await headers()).get("origin");

    // Récupérer le panier de l'utilisateur
    const cart = await getCartAction();

    if (!cart || !cart.items.length) {
      throw new Error("Panier vide");
    }

    // Vérifier que tous les produits existent et sont disponibles
    const productIds = cart.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "AVAILABLE",
      },
    });

    if (products.length !== cart.items.length) {
      throw new Error("Certains produits ne sont plus disponibles");
    }

    // Créer les line items pour les produits
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => {
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

    // ✅ Calculer le sous-total des produits
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // ✅ Les frais de livraison seront calculés dynamiquement côté client
    // Nous créons plusieurs options de frais de livraison que Stripe pourra utiliser

    // Créer la session Stripe Checkout Embedded
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      // ✅ Utiliser tous les pays supportés par nos zones
      shipping_address_collection: {
        allowed_countries: ALL_SHIPPING_COUNTRIES,
      },
      billing_address_collection: "required",
      // ✅ Options de livraison dynamiques
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0, // Livraison gratuite (sera mise à jour dynamiquement)
              currency: "eur",
            },
            display_name: "Livraison gratuite",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 21 },
            },
          },
        },
      ],
      metadata: {
        userId: userId,
        cartItemIds: cart.items.map((item) => item.id).join(","),
        productIds: cart.items.map((item) => item.productId).join(","),
        subtotal: subtotal.toString(),
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

    if (!session.client_secret) {
      throw new Error("Impossible de créer la session de paiement");
    }

    return session.client_secret;
  } catch (error) {
    console.error("Erreur création session checkout:", error);
    throw error;
  }
}
