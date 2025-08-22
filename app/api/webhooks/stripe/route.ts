import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import {
  Category,
  GeologicalPeriod,
  ProductStatus,
} from "@/lib/generated/prisma";
import {
  StripeCustomer,
  StripePrice,
  StripeProduct,
  StripeSession,
} from "@/types/type";
import { revalidatePath } from "next/cache";

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
      case "product.created":
        await handleProductCreated(event.data.object as StripeProduct);
        break;

      case "product.updated":
        await handleProductUpdated(event.data.object as StripeProduct);
        break;

      case "product.deleted":
        await handleProductDeleted(event.data.object as StripeProduct);
        break;

      case "price.created":
        await handlePriceCreated(event.data.object as StripePrice);
        break;

      case "price.updated":
        await handlePriceUpdated(event.data.object as StripePrice);
        break;

      case "customer.created":
        await handleCustomerCreated(event.data.object as StripeCustomer);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as StripeSession);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return new Response("Webhook traité avec succès", { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Stripe webhook error:", err);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
}

// 🆕 CRÉER UN PRODUIT DEPUIS STRIPE
async function handleProductCreated(product: StripeProduct) {
  console.log("🆕 Produit créé dans Stripe:", product.id);

  try {
    const { validCategory, validGeologicalPeriod, validStatus, validWeight } =
      validateProductMetadata(product.metadata, product.active);

    const newProduct = await prisma.product.create({
      data: {
        title: product.name,
        category: validCategory,
        genre: product.metadata.genre || "",
        species: product.metadata.species || "",
        price: 0, // Sera mis à jour quand le prix sera créé
        countryOfOrigin: product.metadata.countryOfOrigin || "",
        locality: product.metadata.locality || "",
        geologicalPeriod: validGeologicalPeriod,
        geologicalStage: product.metadata.geologicalStage || "",
        description: product.description || undefined, // ✅ Ajouter la description
        weight: validWeight, // ✅ Ajouter le poids obligatoire
        stripeProductId: product.id,
        status: validStatus,
      },
    });

    console.log("✅ Produit ajouté à la BDD:", newProduct.id);
    console.log("📏 Poids sauvegardé:", validWeight, "grammes");

    // ✅ FORCER LA REVALIDATION DU CACHE
    revalidatePath("/fossiles");
    revalidatePath("/");
    console.log("🔄 Cache invalidé pour /fossiles");
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
      const { validCategory, validGeologicalPeriod, validStatus, validWeight } =
        validateProductMetadata(product.metadata, product.active);

      const updateData: {
        title: string;
        category?: Category;
        genre?: string;
        species?: string;
        countryOfOrigin?: string;
        locality?: string;
        geologicalPeriod?: GeologicalPeriod;
        geologicalStage?: string;
        description?: string;
        weight?: number; // ✅ Ajouter le poids
        status: ProductStatus;
      } = {
        title: product.name,
        status: validStatus,
      };

      // Ajouter les champs optionnels seulement s'ils existent
      if (product.metadata.category) {
        updateData.category = validCategory;
      }
      if (product.metadata.genre) {
        updateData.genre = product.metadata.genre;
      }
      if (product.metadata.species) {
        updateData.species = product.metadata.species;
      }
      if (product.metadata.countryOfOrigin) {
        updateData.countryOfOrigin = product.metadata.countryOfOrigin;
      }
      if (product.metadata.locality) {
        updateData.locality = product.metadata.locality;
      }
      if (product.metadata.geologicalPeriod) {
        updateData.geologicalPeriod = validGeologicalPeriod;
      }
      if (product.metadata.geologicalStage) {
        updateData.geologicalStage = product.metadata.geologicalStage;
      }
      if (product.description) {
        updateData.description = product.description;
      }
      if (product.metadata.weight) {
        updateData.weight = validWeight; // ✅ Mettre à jour le poids
      }

      await prisma.product.update({
        where: { stripeProductId: product.id },
        data: updateData,
      });

      console.log("✅ Produit mis à jour dans la BDD");
      console.log("📏 Poids mis à jour:", validWeight, "grammes");

      // ✅ FORCER LA REVALIDATION DU CACHE
      revalidatePath("/fossiles");
      revalidatePath("/");
      console.log("🔄 Cache invalidé après mise à jour");
    }
  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);
  }
}

// 🗑️ SUPPRIMER/ARCHIVER UN PRODUIT
async function handleProductDeleted(product: StripeProduct) {
  console.log("🗑️ Produit archivé dans Stripe:", product.id);

  try {
    await prisma.product.updateMany({
      where: { stripeProductId: product.id },
      data: { status: ProductStatus.INACTIVE },
    });

    console.log("✅ Produit archivé dans la BDD");

    revalidatePath("/fossiles");
    revalidatePath("/");
  } catch (error) {
    console.error("❌ Erreur archivage produit:", error);
  }
}

// 💰 PRIX CRÉÉ POUR UN PRODUIT
async function handlePriceCreated(price: StripePrice) {
  console.log("💰 Prix créé dans Stripe:", price.id);

  try {
    if (price.unit_amount) {
      await prisma.product.updateMany({
        where: { stripeProductId: price.product },
        data: {
          price: price.unit_amount / 100,
          stripePriceId: price.id,
        },
      });

      console.log("✅ Prix mis à jour dans la BDD");

      // ✅ FORCER LA REVALIDATION DU CACHE
      revalidatePath("/fossiles");
      revalidatePath("/");
      console.log("🔄 Cache invalidé après mise à jour prix");
    }

    revalidatePath("/fossiles");
    revalidatePath("/");
  } catch (error) {
    console.error("❌ Erreur mise à jour prix:", error);
  }
}

// ✏️ PRIX MODIFIÉ
async function handlePriceUpdated(price: StripePrice) {
  console.log("✏️ Prix modifié dans Stripe:", price.id);

  if (price.active && price.unit_amount) {
    await handlePriceCreated(price);
  }

  revalidatePath("/fossiles");
  revalidatePath("/");
}

// 👤 CUSTOMER CRÉÉ - GESTION DES VALEURS NULLABLES
async function handleCustomerCreated(customer: StripeCustomer) {
  console.log("👤 Customer créé:", customer.id);

  // ✅ Vérifier que l'email n'est pas null
  if (!customer.email) {
    console.log("⚠️ Customer créé sans email, ignoré");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: customer.email },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
      console.log("✅ Customer associé à l'utilisateur");
    } else {
      console.log(
        "ℹ️ Aucun utilisateur trouvé avec cet email:",
        customer.email
      );
    }

    revalidatePath("/fossiles");
    revalidatePath("/");
  } catch (error) {
    console.error("❌ Erreur association customer:", error);
  }
}

// ✅ CHECKOUT COMPLÉTÉ - GESTION DES VALEURS NULLABLES
async function handleCheckoutCompleted(session: StripeSession) {
  console.log("✅ Checkout complété:", session.id);

  // ✅ Vérifier que amount_total n'est pas null
  if (!session.amount_total) {
    console.log("⚠️ Session sans montant, ignorée");
    return;
  }

  try {
    const amountInEuros = session.amount_total / 100;
    console.log("💰 Vente réalisée pour:", amountInEuros, "€");

    // Si vous avez des métadonnées avec des infos sur les produits
    if (session.metadata?.productIds) {
      const productIds = session.metadata.productIds.split(",");

      // Marquer les produits comme vendus
      await prisma.product.updateMany({
        where: {
          id: {
            in: productIds.map((id) => parseInt(id)),
          },
        },
        data: {
          status: ProductStatus.SOLD,
        },
      });

      console.log(
        `✅ ${productIds.length} produit(s) marqué(s) comme vendu(s)`
      );
    }

    revalidatePath("/fossiles");
    revalidatePath("/");
  } catch (error) {
    console.error("❌ Erreur traitement checkout:", error);
  }
}

// 🔧 FONCTION HELPER POUR VALIDER LES MÉTADONNÉES
function validateProductMetadata(
  metadata: Record<string, string>,
  isActive: boolean
): {
  validCategory: Category;
  validGeologicalPeriod: GeologicalPeriod;
  validStatus: ProductStatus;
  validWeight: number; // ✅ Ajouter le poids
} {
  // Valider Category
  const categoryValue = metadata.category?.toUpperCase();
  const validCategory = Object.values(Category).includes(
    categoryValue as Category
  )
    ? (categoryValue as Category)
    : Category.COQUILLAGE; // Valeur par défaut

  // Valider GeologicalPeriod
  const periodValue = metadata.geologicalPeriod?.toUpperCase();
  const validGeologicalPeriod = Object.values(GeologicalPeriod).includes(
    periodValue as GeologicalPeriod
  )
    ? (periodValue as GeologicalPeriod)
    : GeologicalPeriod.QUATERNAIRE; // Valeur par défaut

  // Valider ProductStatus
  const validStatus = isActive
    ? ProductStatus.AVAILABLE
    : ProductStatus.INACTIVE;

  // ✅ Valider le poids (obligatoire)
  const weightValue = metadata.weight;
  let validWeight = 500; // Valeur par défaut en grammes

  if (weightValue) {
    const parsedWeight = parseInt(weightValue);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      validWeight = parsedWeight;
    }
  }

  console.log("📏 Poids validé:", validWeight, "grammes");

  return {
    validCategory,
    validGeologicalPeriod,
    validStatus,
    validWeight, // ✅ Retourner le poids validé
  };
}
