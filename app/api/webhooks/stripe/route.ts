import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// Types pour les objets Stripe
interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  metadata: Record<string, string>;
  active: boolean;
  created: number;
  updated: number;
}

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number | null;
  currency: string;
  active: boolean;
  metadata: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("🔵 Stripe webhook:", event.type);

    switch (event.type) {
      // 🆕 PRODUIT CRÉÉ DANS STRIPE
      case "product.created":
        await handleProductCreated(event.data.object as StripeProduct);
        break;

      // ✏️ PRODUIT MODIFIÉ DANS STRIPE
      case "product.updated":
        await handleProductUpdated(event.data.object as StripeProduct);
        break;

      // 🗑️ PRODUIT SUPPRIMÉ/ARCHIVÉ DANS STRIPE
      case "product.deleted":
        await handleProductDeleted(event.data.object as StripeProduct);
        break;

      // 💰 PRIX CRÉÉ POUR UN PRODUIT
      case "price.created":
        await handlePriceCreated(event.data.object as StripePrice);
        break;

      // ✏️ PRIX MODIFIÉ
      case "price.updated":
        await handlePriceUpdated(event.data.object as StripePrice);
        break;

      // 👤 CUSTOMER CRÉÉ (pour votre système d'utilisateurs)
      case "customer.created":
        await handleCustomerCreated(event.data.object);
        break;

      // ✅ PAIEMENT RÉUSSI (pour gérer les ventes)
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return new Response("Webhook traité avec succès", { status: 200 });
  } catch (error: any) {
    console.error("❌ Stripe webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
}

// 🆕 CRÉER UN PRODUIT DEPUIS STRIPE
async function handleProductCreated(product: StripeProduct) {
  console.log("🆕 Produit créé dans Stripe:", product.id);

  try {
    // Extraire les informations depuis les métadonnées Stripe
    const {
      category = "AUTRES", // Valeur par défaut
      genre = "",
      species = "",
      countryOfOrigin = "",
      locality = "",
      geologicalPeriod = "QUATERNAIRE", // Valeur par défaut
      geologicalStage = "",
    } = product.metadata;

    // Créer le produit dans votre BDD
    const newProduct = await prisma.product.create({
      data: {
        title: product.name,
        category: category as any, // Cast vers votre enum
        genre,
        species,
        price: 0, // Sera mis à jour quand le prix sera créé
        countryOfOrigin,
        locality,
        geologicalPeriod: geologicalPeriod as any,
        geologicalStage,
        stripeProductId: product.id,
        status: product.active ? "AVAILABLE" : "INACTIVE",
      },
    });

    console.log("✅ Produit ajouté à la BDD:", newProduct.id);
  } catch (error) {
    console.error("❌ Erreur création produit BDD:", error);
  }
}

// ✏️ METTRE À JOUR UN PRODUIT DEPUIS STRIPE
async function handleProductUpdated(product: StripeProduct) {
  console.log("✏️ Produit modifié dans Stripe:", product.id);

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { stripeProductId: product.id },
    });

    if (existingProduct) {
      const {
        category,
        genre,
        species,
        countryOfOrigin,
        locality,
        geologicalPeriod,
        geologicalStage,
      } = product.metadata;

      await prisma.product.update({
        where: { stripeProductId: product.id },
        data: {
          title: product.name,
          ...(category && { category: category as any }),
          ...(genre && { genre }),
          ...(species && { species }),
          ...(countryOfOrigin && { countryOfOrigin }),
          ...(locality && { locality }),
          ...(geologicalPeriod && {
            geologicalPeriod: geologicalPeriod as any,
          }),
          ...(geologicalStage && { geologicalStage }),
          status: product.active ? "AVAILABLE" : "INACTIVE",
        },
      });

      console.log("✅ Produit mis à jour dans la BDD");
    }
  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);
  }
}

// 🗑️ SUPPRIMER/ARCHIVER UN PRODUIT
async function handleProductDeleted(product: StripeProduct) {
  console.log("🗑️ Produit archivé dans Stripe:", product.id);

  try {
    // Marquer comme inactif au lieu de supprimer
    await prisma.product.updateMany({
      where: { stripeProductId: product.id },
      data: { status: "INACTIVE" },
    });

    console.log("✅ Produit archivé dans la BDD");
  } catch (error) {
    console.error("❌ Erreur archivage produit:", error);
  }
}

// 💰 PRIX CRÉÉ POUR UN PRODUIT
async function handlePriceCreated(price: StripePrice) {
  console.log("💰 Prix créé dans Stripe:", price.id);

  try {
    if (price.unit_amount) {
      // Mettre à jour le prix du produit
      await prisma.product.updateMany({
        where: { stripeProductId: price.product },
        data: {
          price: price.unit_amount / 100, // Convertir centimes en euros
          stripePriceId: price.id,
        },
      });

      console.log("✅ Prix mis à jour dans la BDD");
    }
  } catch (error) {
    console.error("❌ Erreur mise à jour prix:", error);
  }
}

// ✏️ PRIX MODIFIÉ
async function handlePriceUpdated(price: StripePrice) {
  console.log("✏️ Prix modifié dans Stripe:", price.id);

  if (price.active && price.unit_amount) {
    await handlePriceCreated(price); // Même logique
  }
}

// 👤 CUSTOMER CRÉÉ (pour vos utilisateurs)
async function handleCustomerCreated(customer: any) {
  console.log("👤 Customer créé:", customer.id);

  // Associer à un utilisateur existant par email
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
    console.log("✅ Customer associé à l'utilisateur");
  }
}

// ✅ CHECKOUT COMPLÉTÉ (vente réalisée)
async function handleCheckoutCompleted(session: any) {
  console.log("✅ Checkout complété:", session.id);

  // Ici vous pourrez gérer les ventes depuis le panier
  // Logique à implémenter plus tard avec le système de panier

  console.log("💰 Vente réalisée pour:", session.amount_total / 100, "€");
}
