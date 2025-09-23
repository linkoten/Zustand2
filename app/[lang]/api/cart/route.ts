import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@/lib/generated/prisma";

// ✅ Fonction utilitaire réutilisable
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

// GET - Récupérer le panier de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    // ✅ Utiliser getCurrentUser au lieu de auth directement
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id }, // ✅ Utiliser user.id au lieu de userId
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            addedAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      cart: cart || { items: [] },
      totalItems:
        cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      totalPrice:
        cart?.items?.reduce(
          (sum, item) =>
            sum + parseFloat(item.product.price.toString()) * item.quantity,
          0
        ) || 0,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Erreur récupération panier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter un produit au panier
export async function POST(req: NextRequest) {
  try {
    // ✅ Utiliser getCurrentUser au lieu de auth directement
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { productId }: { productId: number } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe et est disponible
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      return NextResponse.json(
        { error: "Produit non disponible" },
        { status: 400 }
      );
    }

    // ✅ Utiliser user.id
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
      console.log(`✅ Nouveau panier créé pour l'utilisateur: ${user.id}`);
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
    } else {
      // Ajouter nouveau produit
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: 1,
        },
      });
    }

    // Retourner le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id }, // ✅ Utiliser user.id
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Erreur ajout panier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
