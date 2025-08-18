"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "../../lib/stripe";
import { getCartAction } from "./cart-actions";
import prisma from "../prisma";
import Stripe from "stripe"; // ✅ Ajouter l'import Stripe

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

    // ✅ Typer correctement le tableau des line items
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

    // Calculer les frais de livraison
    const subtotal = cart.items.reduce(
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

    // Créer la session Stripe Checkout Embedded
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
      },
      billing_address_collection: "required",
      metadata: {
        userId: userId,
        cartItemIds: cart.items.map((item) => item.id).join(","),
        productIds: cart.items.map((item) => item.productId).join(","),
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

    // ✅ S'assurer qu'on retourne toujours une string
    if (!session.client_secret) {
      throw new Error("Impossible de créer la session de paiement");
    }

    return session.client_secret;
  } catch (error) {
    console.error("Erreur création session checkout:", error);
    throw error;
  }
}
