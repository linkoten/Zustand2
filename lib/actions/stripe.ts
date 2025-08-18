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

    // ✅ Créer les options de livraison avec tarifs Colissimo réels
    const shippingFrance = calculateShippingByWeight(
      subtotal,
      totalWeight,
      "FR"
    );
    const shippingEU = calculateShippingByWeight(subtotal, totalWeight, "DE");
    const shippingWorld = calculateShippingByWeight(
      subtotal,
      totalWeight,
      "US"
    );

    const shippingOptions = [
      // France métropolitaine
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: {
            amount: Math.round(shippingFrance.cost * 100), // Convertir en centimes
            currency: "eur",
          },
          display_name:
            shippingFrance.cost === 0
              ? "🇫🇷 Livraison gratuite (France)"
              : `🇫🇷 France - ${shippingFrance.service}`,
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
          fixed_amount: {
            amount: Math.round(shippingEU.cost * 100),
            currency: "eur",
          },
          display_name:
            shippingEU.cost === 0
              ? "🇪🇺 Livraison gratuite (UE)"
              : `🇪🇺 Union Européenne - ${shippingEU.service}`,
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 3 },
            maximum: { unit: "business_day" as const, value: 6 },
          },
        },
      },
      // Europe hors UE + Maghreb
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: {
            amount: Math.round(
              calculateShippingByWeight(subtotal, totalWeight, "CH").cost * 100
            ),
            currency: "eur",
          },
          display_name:
            calculateShippingByWeight(subtotal, totalWeight, "CH").cost === 0
              ? "🇨🇭 Livraison gratuite (Europe élargie)"
              : "🇨🇭 Europe hors UE + Maghreb",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 4 },
            maximum: { unit: "business_day" as const, value: 8 },
          },
        },
      },
      // Reste du monde
      {
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: {
            amount: Math.round(shippingWorld.cost * 100),
            currency: "eur",
          },
          display_name:
            shippingWorld.cost === 0
              ? "🌍 Livraison gratuite (International)"
              : `🌍 International - ${shippingWorld.service}`,
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 7 },
            maximum: { unit: "business_day" as const, value: 14 },
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
