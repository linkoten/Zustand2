"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "../../lib/stripe";
import { getCartAction } from "./cart-actions";
import prisma from "../prisma";
import Stripe from "stripe";
import {
  ALL_SHIPPING_COUNTRIES,
  calculateShippingByWeight,
  estimateFossilWeight,
} from "../config/shipping-zones";

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

    // ✅ Calculer le sous-total des produits (price est déjà un number)
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // ✅ Calculer le poids total estimé du panier
    const totalWeight = cart.items.reduce((weight, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        // ✅ Gérer les deux cas : Decimal ou number
        const productPrice =
          typeof product.price === "number"
            ? product.price
            : product.price.toNumber();

        const itemWeight = estimateFossilWeight(product.category, productPrice);
        return weight + itemWeight * item.quantity;
      }
      return weight;
    }, 0);

    const shippingOptions = [
      // France - Différents poids
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 680, currency: "eur" },
          display_name: "🇫🇷 France (0-500g) - Colissimo",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 2 },
            maximum: { unit: "business_day" as const, value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 895, currency: "eur" },
          display_name: "🇫🇷 France (500g-1kg) - Colissimo",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 2 },
            maximum: { unit: "business_day" as const, value: 3 },
          },
        },
      },

      // Union Européenne
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 1395, currency: "eur" },
          display_name: "🇪🇺 Union Européenne (0-500g)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 3 },
            maximum: { unit: "business_day" as const, value: 6 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 1670, currency: "eur" },
          display_name: "🇪🇺 Union Européenne (500g-1kg)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 3 },
            maximum: { unit: "business_day" as const, value: 6 },
          },
        },
      },

      // Europe hors UE
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 1635, currency: "eur" },
          display_name: "🇨🇭 Europe hors UE + Maghreb",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 4 },
            maximum: { unit: "business_day" as const, value: 8 },
          },
        },
      },

      // International
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 1885, currency: "eur" },
          display_name: "🌍 International (Monde)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 7 },
            maximum: { unit: "business_day" as const, value: 14 },
          },
        },
      },

      // ✅ Options de livraison gratuite
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 0, currency: "eur" },
          display_name: "🆓 Livraison gratuite France (>100€)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 2 },
            maximum: { unit: "business_day" as const, value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 0, currency: "eur" },
          display_name: "🆓 Livraison gratuite UE (>150€)",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 3 },
            maximum: { unit: "business_day" as const, value: 6 },
          },
        },
      },
    ];

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
      // ✅ Options de livraison avec tarifs Colissimo réels
      shipping_options: shippingOptions,
      metadata: {
        userId: userId,
        cartItemIds: cart.items.map((item) => item.id).join(","),
        productIds: cart.items.map((item) => item.productId).join(","),
        subtotal: subtotal.toString(),
        totalWeight: totalWeight.toString(), // ✅ Ajouter le poids dans les métadonnées
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

    console.log("✅ Session créée avec options de livraison:", {
      sessionId: session.id,
      subtotal: subtotal,
      totalWeight: `${totalWeight}g`,
      shippingOptions: shippingOptions.map((opt) => ({
        name: opt.shipping_rate_data.display_name,
        cost: `${opt.shipping_rate_data.fixed_amount.amount / 100}€`,
      })),
    });

    return session.client_secret;
  } catch (error) {
    console.error("Erreur création session checkout:", error);
    throw error;
  }
}
