import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Créer le favori (ou ne rien faire s'il existe déjà grâce à l'unique constraint)
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {}, // Ne rien faire si existe déjà
      create: {
        userId,
        productId,
      },
    });

    return NextResponse.json(
      {
        message: "Ajouté aux favoris",
        favorite,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Supprimer le favori
    await prisma.userFavorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return NextResponse.json(
      { message: "Retiré des favoris" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du favori:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
