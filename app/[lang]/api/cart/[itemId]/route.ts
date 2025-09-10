import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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

// PUT - Mettre à jour la quantité
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // ✅ Utiliser getCurrentUser au lieu de auth directement
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId } = await params;
    const { quantity }: { quantity: number } = await req.json();

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
    }

    // ✅ Utiliser user.id au lieu de userId
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: user.id }, // ✅ Corriger ici
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour la quantité
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Erreur mise à jour panier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un article
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // ✅ Utiliser getCurrentUser au lieu de auth directement
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId } = await params;

    // ✅ Utiliser user.id au lieu de userId
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: user.id }, // ✅ Corriger ici
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'article
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Erreur suppression panier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
