import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
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

    const body = await request.json();

    const {
      title,
      description,
      price,
      category,
      countryOfOrigin,
      locality,
      geologicalPeriod,
      geologicalStage,
      weight,
      status,
    } = body;

    // Validation des champs requis
    if (
      !title ||
      !price ||
      !category ||
      !countryOfOrigin ||
      !geologicalPeriod ||
      !status
    ) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        category,
        countryOfOrigin,
        locality: locality || null,
        geologicalPeriod,
        geologicalStage: geologicalStage || null,
        weight: weight,
        status,
      },
    });

    return NextResponse.json(
      {
        message: "Produit mis à jour avec succès",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);

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
