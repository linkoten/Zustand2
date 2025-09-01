"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CreateRatingData, RatingStats, UserRating } from "@/types/ratingType";

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Non autorisé");
  }
  return userId;
}

// ✅ Nouvelle fonction pour obtenir userId sans erreur
async function getOptionalAuth() {
  try {
    const { userId } = await auth();
    return userId || null;
  } catch (error) {
    return null;
  }
}

// ✅ Obtenir les statistiques de notation pour un produit
export async function getProductRatingStats(
  productId: number
): Promise<RatingStats> {
  try {
    // ✅ Vérifier si le modèle Rating existe
    if (!prisma.rating) {
      console.warn(
        "Le modèle Rating n'existe pas encore dans la base de données"
      );
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratings = await prisma.rating.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRatings = ratings.length;
    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    const ratingDistribution = ratings.reduce(
      (acc, r) => {
        acc[r.rating as keyof typeof acc]++;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
      totalRatings,
      ratingDistribution,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des stats de notation:",
      error
    );
    // ✅ Retourner des stats vides en cas d'erreur
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// ✅ Obtenir la notation d'un utilisateur pour un produit - MODIFIÉE
export async function getUserProductRating(
  productId: number
): Promise<UserRating | null> {
  try {
    // ✅ Utiliser getOptionalAuth au lieu de requireAuth
    const userId = await getOptionalAuth();

    // ✅ Si pas d'utilisateur connecté, retourner null (pas d'erreur)
    if (!userId) {
      return null;
    }

    // ✅ Vérifier si le modèle Rating existe
    if (!prisma.rating) {
      console.warn(
        "Le modèle Rating n'existe pas encore dans la base de données"
      );
      return null;
    }

    const rating = await prisma.rating.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (!rating) {
      return null;
    }

    return {
      rating: rating.rating,
      comment: rating.comment || undefined,
      canEdit: true, // L'utilisateur peut toujours modifier sa propre notation
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la notation utilisateur:",
      error
    );
    // ✅ En cas d'erreur, retourner null au lieu de laisser l'erreur remonter
    return null;
  }
}

// ✅ Créer ou mettre à jour une notation - GARDER requireAuth
export async function createOrUpdateRating(data: CreateRatingData) {
  try {
    const userId = await requireAuth(); // ✅ Ici on garde requireAuth car il FAUT être connecté pour noter

    // Validation
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "La note doit être entre 1 et 5",
      };
    }

    if (!data.productId && !data.articleId) {
      return {
        success: false,
        error: "ID du produit ou de l'article requis",
      };
    }

    if (data.productId && data.articleId) {
      return {
        success: false,
        error: "Impossible de noter un produit et un article en même temps",
      };
    }

    // ✅ Vérifier si le modèle Rating existe
    if (!prisma.rating) {
      return {
        success: false,
        error: "Le système de notation n'est pas encore configuré",
      };
    }

    // Vérifier si une notation existe déjà
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId,
        ...(data.productId ? { productId: data.productId } : {}),
        ...(data.articleId ? { articleId: data.articleId } : {}),
      },
    });

    let rating;
    if (existingRating) {
      // Mise à jour
      rating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          rating: data.rating,
          comment: data.comment,
          updatedAt: new Date(),
        },
      });
    } else {
      // Création
      rating = await prisma.rating.create({
        data: {
          userId,
          rating: data.rating,
          comment: data.comment,
          productId: data.productId,
          articleId: data.articleId,
        },
      });
    }

    // Revalider les pages concernées
    if (data.productId) {
      revalidatePath(`/fossiles/${data.productId}`);
      revalidatePath("/fossiles");
    }
    if (data.articleId) {
      revalidatePath(`/blog/${data.articleId}`);
      revalidatePath("/blog");
    }

    return {
      success: true,
      rating: {
        id: rating.id,
        userId: rating.userId,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt.toISOString(),
        updatedAt: rating.updatedAt.toISOString(),
        productId: rating.productId,
        articleId: rating.articleId,
      },
    };
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour de la notation:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la sauvegarde de la notation",
    };
  }
}

// ✅ Obtenir les statistiques de notation pour un article
export async function getArticleRatingStats(
  articleId: string
): Promise<RatingStats> {
  try {
    if (!prisma.rating) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratings = await prisma.rating.findMany({
      where: { articleId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRatings = ratings.length;
    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    const ratingDistribution = ratings.reduce(
      (acc, r) => {
        acc[r.rating as keyof typeof acc]++;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des stats de notation:",
      error
    );
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// ✅ Obtenir la notation d'un utilisateur pour un article - MODIFIÉE
export async function getUserArticleRating(
  articleId: string
): Promise<UserRating | null> {
  try {
    // ✅ Utiliser getOptionalAuth au lieu de requireAuth
    const userId = await getOptionalAuth();

    // ✅ Si pas d'utilisateur connecté, retourner null
    if (!userId) {
      return null;
    }

    if (!prisma.rating) {
      return null;
    }

    const rating = await prisma.rating.findFirst({
      where: {
        userId,
        articleId,
      },
    });

    if (!rating) {
      return null;
    }

    return {
      rating: rating.rating,
      comment: rating.comment || undefined,
      canEdit: true,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la notation utilisateur:",
      error
    );
    return null;
  }
}
