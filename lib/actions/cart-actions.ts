"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, CartData } from "@/types/type";

// ✅ Fonction utilitaire pour récupérer l'utilisateur BDD
async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  return user;
}

// ✅ Ajouter au panier
export async function addToCartAction(
  productId: number
): Promise<ActionResult<{ productTitle: string }>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Vous devez être connecté" };
    }

    console.log("le userId qu'on reçoit", user.id);

    // Vérifier que le produit existe et est disponible
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Produit non trouvé" };
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      return { success: false, error: "Produit non disponible" };
    }

    // ✅ Corriger la recherche du panier
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }, // ✅ Corriger cette ligne
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }, // ✅ Corriger cette ligne
      });
      console.log(`✅ Nouveau panier créé pour: ${user.id}`); // ✅ Corriger cette ligne
    }

    // Vérifier si le produit est déjà dans le panier
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingCartItem) {
      // Augmenter la quantité
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
      console.log(`✅ Quantité mise à jour: ${product.title}`);
    } else {
      // Ajouter nouveau produit
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: 1,
        },
      });
      console.log(`✅ Produit ajouté: ${product.title}`);
    }

    // Revalider les pages qui affichent le panier
    revalidatePath("/fossiles");

    return {
      success: true,
      data: { productTitle: product.title },
    };
  } catch (error) {
    console.error("❌ Erreur ajout panier:", error);
    return { success: false, error: "Erreur lors de l'ajout au panier" };
  }
}

// ✅ Mettre à jour la quantité
export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<ActionResult<{ productTitle?: string }>> {
  try {
    const user = await getCurrentUser(); // ✅ Utiliser getCurrentUser

    if (!user) {
      return { success: false, error: "Vous devez être connecté" };
    }

    if (quantity < 1) {
      return removeCartItemAction(cartItemId);
    }

    // ✅ Utiliser user.id
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId: user.id },
      },
      include: { product: true },
    });

    if (!cartItem) {
      return { success: false, error: "Article non trouvé" };
    }

    // Mettre à jour la quantité
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath("/fossiles");

    return { success: true };
  } catch (error) {
    console.error("❌ Erreur mise à jour quantité:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ✅ Supprimer un article du panier
export async function removeCartItemAction(
  cartItemId: string
): Promise<ActionResult<{ productTitle: string }>> {
  try {
    const user = await getCurrentUser(); // ✅ Utiliser getCurrentUser

    if (!user) {
      return { success: false, error: "Vous devez être connecté" };
    }

    // ✅ Utiliser user.id
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId: user.id },
      },
      include: { product: true },
    });

    if (!cartItem) {
      return { success: false, error: "Article non trouvé" };
    }

    console.log("Suppression cartItemId:", cartItemId, "pour user:", user.id);

    // Supprimer l'article
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/panier");
    revalidatePath("/fossiles");

    return {
      success: true,
      data: { productTitle: cartItem.product.title },
    };
  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ✅ Vider le panier
export async function clearCartAction(): Promise<
  ActionResult<{ removedItems: number }>
> {
  try {
    const user = await getCurrentUser(); // ✅ Utiliser getCurrentUser

    if (!user) {
      return { success: false, error: "Vous devez être connecté" };
    }

    // ✅ Utiliser user.id
    const itemCount = await prisma.cartItem.count({
      where: { cart: { userId: user.id } },
    });

    // Supprimer tous les items du panier
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: user.id } },
    });

    return {
      success: true,
      data: { removedItems: itemCount },
    };
  } catch (error) {
    console.error("❌ Erreur vidage panier:", error);
    return { success: false, error: "Erreur lors du vidage du panier" };
  }
}

// ✅ Récupérer le panier (pour affichage)
export async function getCartAction(): Promise<CartData | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                locality: true, // 👈 Ajoute ceci pour inclure la localité complète
                images: true,
              },
            },
          },
          orderBy: {
            addedAt: "desc",
          },
        },
      },
    });

    if (!cart) return null;

    // ✅ Sérialiser avec le bon type CartData
    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        addedAt: item.addedAt.toISOString(),
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price.toNumber(),
          category: item.product.category,
          weight: item.product.weight,
          genre: item.product.genre,
          species: item.product.species,
          countryOfOrigin: item.product.countryOfOrigin,
          locality: item.product.locality.name,
          geologicalPeriod: item.product.geologicalPeriod,
          geologicalStage: item.product.geologicalStage,
          description: item.product.description || undefined,
          stripeProductId: item.product.stripeProductId,
          stripePriceId: item.product.stripePriceId,
          status: item.product.status,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
          images:
            item.product.images?.map((img) => ({
              imageUrl: img.imageUrl,
            })) ?? [],
        },
      })),
    };
  } catch (error) {
    console.error("❌ Erreur récupération panier:", error);
    return null;
  }
}
