import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Reprendre la fonction DELETE de l'étape 3
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Vérifier que l'utilisateur est admin
    await requireAdmin();

    const { id } = await params;
    const productId = Number(id); // Conversion explicite

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID du produit invalide" },
        { status: 400 }
      );
    }
    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer d'abord les images associées
    await prisma.productImage.deleteMany({
      where: { productId: productId },
    });

    // Puis supprimer le produit
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Produit supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
