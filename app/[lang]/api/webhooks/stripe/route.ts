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
import { getUserData } from "@/lib/actions/dashboardActions";
import { Decimal } from "@/lib/generated/prisma/runtime/library";
import { createNotification } from "@/lib/actions/notificationAction";

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
      process.env.STRIPE_WEBHOOK_SECRET!,
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

    // Chercher la localité par son nom (stocké dans metadata.locality)
    const localityName = product.metadata.locality;
    if (!localityName) {
      throw new Error(
        "Aucune localité renseignée dans les métadonnées Stripe.",
      );
    }

    const locality = await prisma.locality.findUnique({
      where: { name: localityName },
    });

    if (!locality) {
      throw new Error(
        `Localité "${localityName}" introuvable en BDD. Crée-la d'abord dans l'admin.`,
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        title: product.name,
        category: validCategory,
        genre: product.metadata.genre || "",
        species: product.metadata.species || "",
        price: 0, // Sera mis à jour quand le prix sera créé
        countryOfOrigin: product.metadata.countryOfOrigin || "",
        locality: {
          connect: { id: locality.id },
        },
        geologicalPeriod: validGeologicalPeriod,
        geologicalStage: product.metadata.geologicalStage || "",
        description: product.description || undefined,
        weight: validWeight,
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
        locality?: { connect: { id: number } }; // 👈 Correction ici
        geologicalPeriod?: GeologicalPeriod;
        geologicalStage?: string;
        description?: string;
        weight?: number;
        status: ProductStatus;
      } = {
        title: product.name,
        status: validStatus,
      };

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
        const locality = await prisma.locality.findUnique({
          where: { name: product.metadata.locality },
        });
        if (!locality) {
          throw new Error(
            `Localité "${product.metadata.locality}" introuvable en BDD. Crée-la d'abord dans l'admin.`,
          );
        }
        updateData.locality = {
          connect: { id: locality.id },
        };
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
        updateData.weight = validWeight;
      }

      await prisma.product.update({
        where: { stripeProductId: product.id },
        data: updateData,
      });

      console.log("✅ Produit mis à jour dans la BDD");
      console.log("📏 Poids mis à jour:", validWeight, "grammes");

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
        customer.email,
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
  console.log("✅ Checkout complété:", session);

  console.log("✅ Checkout complété:", session.id);

  // ✅ Vérifier que amount_total n'est pas null
  if (!session.amount_total) {
    console.log("⚠️ Session sans montant, ignorée");
    return;
  }

  try {
    const amountInEuros = session.amount_total / 100;
    console.log("💰 Vente réalisée pour:", amountInEuros, "€");

    // 1. Récupérer l'utilisateur via stripeCustomerId
    const clerkId = session.metadata?.userId;
    if (!clerkId) {
      console.error("❌ clerkId (userId) manquant dans les métadonnées Stripe");
      return;
    }
    const user = await getUserData(clerkId);
    if (!user) {
      console.error("❌ Utilisateur non trouvé pour ce clerkId");
      return;
    }

    // 2. Récupérer les produits achetés
    let orderItems: { productId: number; quantity: number; price: Decimal }[] =
      [];

    // Si vous avez des métadonnées avec des infos sur les produits
    if (session.metadata?.productIds) {
      const productIds = session.metadata.productIds
        .split(",")
        .map((id) => parseInt(id, 10));
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      // Si tu veux gérer la quantité, adapte ici (ex: session.metadata.quantities)
      orderItems = products.map((product) => ({
        productId: product.id,
        quantity: 1, // à adapter si tu as la quantité
        price: product.price,
      }));

      // Marquer les produits comme vendus
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
        },
        data: {
          status: ProductStatus.SOLD,
        },
      });

      console.log(
        `✅ ${productIds.length} produit(s) marqué(s) comme vendu(s)`,
      );
    }

    // 3. Créer la commande et les OrderItem
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: amountInEuros,
        status: "COMPLETED",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    console.log("✅ Commande créée:", order.id);

    await createNotification({
      userId: clerkId,
      type: "ORDER",
      title: "Commande confirmée",
      message: `Votre commande #${order.id.slice(-8)} a bien été enregistrée.`,
      link: `/dashboard/orders/${order.id}`,
    });

    revalidatePath("/fossiles");
    revalidatePath("/");
  } catch (error) {
    console.error("❌ Erreur traitement checkout:", error);
  }
}

// 🔧 FONCTION HELPER POUR VALIDER LES MÉTADONNÉES
function validateProductMetadata(
  metadata: Record<string, string>,
  isActive: boolean,
): {
  validCategory: Category;
  validGeologicalPeriod: GeologicalPeriod;
  validStatus: ProductStatus;
  validWeight: number; // ✅ Ajouter le poids
} {
  // Valider Category
  const categoryValue = metadata.category?.toUpperCase();
  const validCategory = Object.values(Category).includes(
    categoryValue as Category,
  )
    ? (categoryValue as Category)
    : Category.TRILOBITE; // Valeur par défaut

  // Valider GeologicalPeriod
  const periodValue = metadata.geologicalPeriod?.toUpperCase();
  const validGeologicalPeriod = Object.values(GeologicalPeriod).includes(
    periodValue as GeologicalPeriod,
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
