"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import {
  Category,
  GeologicalPeriod,
  Prisma,
  ProductStatus,
} from "@/lib/generated/prisma";
import { SerializedProduct } from "@/types/type";
import { CreateProductData, SearchParams } from "@/types/productType";

export async function createProductAction(data: CreateProductData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer un produit",
      };
    }

    console.log("📝 Données reçues:", data);

    // ✅ Filtrer les images valides
    const validImages = data.images.filter((img) => img.url && img.url.trim());

    if (validImages.length === 0) {
      return {
        success: false,
        error: "Au moins une image valide est requise",
      };
    }

    // ✅ 1. Créer le produit dans Stripe
    const stripeProduct = await stripe.products.create({
      name: data.title,
      description: data.description || undefined,
      images: validImages.map((img) => img.url),
      metadata: {
        category: data.category,
        genre: data.genre,
        species: data.species,
        countryOfOrigin: data.countryOfOrigin,
        locality: data.locality,
        geologicalPeriod: data.geologicalPeriod,
        geologicalStage: data.geologicalStage,
        weight: data.weight.toString(), // ✅ Ajouter le poids dans les metadata
        image_urls: validImages.map((img) => img.url).join(","),
        image_alts: validImages.map((img) => img.altText || "").join(","),
      },
    });

    console.log("✅ Produit créé dans Stripe:", stripeProduct.id);

    // ✅ 2. Créer le prix dans Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100),
      currency: "eur",
    });

    console.log("✅ Prix créé dans Stripe:", stripePrice.id);

    // ✅ 3. Vérifier si le produit existe déjà dans la BDD
    const existingProduct = await prisma.product.findUnique({
      where: { stripeProductId: stripeProduct.id },
    });

    let product;

    if (existingProduct) {
      console.log("⚠️ Produit existant trouvé, mise à jour...");

      // Mettre à jour le produit existant
      product = await prisma.product.update({
        where: { stripeProductId: stripeProduct.id },
        data: {
          title: data.title,
          category: data.category as Category,
          genre: data.genre,
          species: data.species,
          price: data.price,
          countryOfOrigin: data.countryOfOrigin,
          locality: data.locality,
          geologicalPeriod: data.geologicalPeriod as GeologicalPeriod,
          geologicalStage: data.geologicalStage,
          description: data.description || null,
          weight: data.weight, // ✅ Mettre à jour le poids
          stripePriceId: stripePrice.id,
          status: ProductStatus.AVAILABLE,
        },
      });

      // Supprimer les anciennes images
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
    } else {
      // Créer un nouveau produit
      product = await prisma.product.create({
        data: {
          title: data.title,
          category: data.category as Category,
          genre: data.genre,
          species: data.species,
          price: data.price,
          countryOfOrigin: data.countryOfOrigin,
          locality: data.locality,
          geologicalPeriod: data.geologicalPeriod as GeologicalPeriod,
          geologicalStage: data.geologicalStage,
          description: data.description || null,
          weight: data.weight, // ✅ Ajouter le poids
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          status: ProductStatus.AVAILABLE,
        },
      });
    }

    console.log("✅ Produit sauvegardé dans la BDD:", product.id);
    console.log("📏 Poids sauvegardé:", product.weight, "grammes");

    // ✅ 4. Ajouter les images
    for (let i = 0; i < validImages.length; i++) {
      const image = validImages[i];

      try {
        const productImage = await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: image.url,
            altText: image.altText || null,
            order: i,
          },
        });

        console.log(`✅ Image ${i + 1} ajoutée:`, productImage.id);
      } catch (imageError) {
        console.error(`❌ Erreur ajout image ${i + 1}:`, imageError);
      }
    }

    // ✅ 5. Vérifier que les images ont été sauvegardées
    const savedImages = await prisma.productImage.findMany({
      where: { productId: product.id },
      orderBy: { order: "asc" },
    });

    console.log(`✅ ${savedImages.length} image(s) sauvegardée(s) en BDD`);

    // ✅ 6. Revalider les caches
    revalidatePath("/fossiles");
    revalidatePath("/");

    return {
      success: true,
      data: {
        productId: product.id,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        imagesCount: savedImages.length,
        description: product.description,
        weight: product.weight,
        isUpdate: !!existingProduct,
      },
    };
  } catch (error) {
    console.error("❌ Erreur création produit:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création du produit",
    };
  }
}

export async function getFossils(
  filters: SearchParams = {},
  userId?: string | null
): Promise<SerializedProduct[]> {
  try {
    const whereConditions: Prisma.ProductWhereInput = {
      status: ProductStatus.AVAILABLE,
    };

    if (filters.category) {
      whereConditions.category = filters.category as Category;
    }
    if (filters.countryOfOrigin) {
      whereConditions.countryOfOrigin = filters.countryOfOrigin;
    }
    if (filters.locality) {
      whereConditions.locality = filters.locality;
    }
    if (filters.geologicalPeriod) {
      whereConditions.geologicalPeriod =
        filters.geologicalPeriod as GeologicalPeriod;
    }
    if (filters.geologicalStage) {
      whereConditions.geologicalStage = filters.geologicalStage;
    }

    // ✅ Récupérer TOUS les produits disponibles
    const fossils = await prisma.product.findMany({
      where: whereConditions,
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
        // ✅ Inclure SEULEMENT les favoris de l'utilisateur connecté
        userFavorites: userId
          ? {
              where: { userId },
            }
          : false,
        // ✅ Inclure les ratings pour calculer les stats
        ratings: {
          select: { rating: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return fossils.map((fossil) => {
      // ✅ Calculer les statistiques de notation
      const ratings = fossil.ratings;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        ...fossil,
        price: fossil.price.toNumber(),
        description: fossil.description || undefined,
        weight: fossil.weight,
        // ✅ Vérifier si CE produit est dans les favoris de CET utilisateur
        isFavorite: userId ? fossil.userFavorites.length > 0 : false,
        createdAt: fossil.createdAt.toISOString(),
        updatedAt: fossil.updatedAt.toISOString(),
        category: fossil.category,
        geologicalPeriod: fossil.geologicalPeriod,
        status: fossil.status,
        images: fossil.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          altText: image.altText || undefined,
          order: image.order,
          createdAt: image.createdAt.toISOString(),
        })),
        // ✅ Ajouter les statistiques de notation
        ratingStats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length,
          ratingDistribution: {
            1: ratings.filter((r) => r.rating === 1).length,
            2: ratings.filter((r) => r.rating === 2).length,
            3: ratings.filter((r) => r.rating === 3).length,
            4: ratings.filter((r) => r.rating === 4).length,
            5: ratings.filter((r) => r.rating === 5).length,
          },
        },
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des fossiles:", error);
    return [];
  }
}

export async function getProduct(
  id: string
): Promise<SerializedProduct | null> {
  try {
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return null;
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        status: ProductStatus.AVAILABLE,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        // ✅ Inclure les ratings pour calculer les stats
        ratings: {
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return null;
    }

    // ✅ Calculer les statistiques de notation
    const ratings = product.ratings;
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    // ✅ Sérialiser les données avec conversion null -> undefined
    return {
      ...product,
      price: product.price.toNumber(),
      description: product.description || undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText || undefined,
        order: image.order,
        createdAt: image.createdAt.toISOString(),
      })),
      // ✅ Ajouter les statistiques de notation
      ratingStats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        ratingDistribution: {
          1: ratings.filter((r) => r.rating === 1).length,
          2: ratings.filter((r) => r.rating === 2).length,
          3: ratings.filter((r) => r.rating === 3).length,
          4: ratings.filter((r) => r.rating === 4).length,
          5: ratings.filter((r) => r.rating === 5).length,
        },
      },
    };
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    return null;
  }
}

export async function getSimilarProducts(
  currentProductId: number,
  category: string,
  limit: number = 4
): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: { not: currentProductId },
        category: category as Category,
        status: ProductStatus.AVAILABLE,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
        // ✅ Inclure les ratings pour les produits similaires aussi
        ratings: {
          select: { rating: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => {
      // ✅ Calculer les statistiques pour chaque produit similaire
      const ratings = product.ratings;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        ...product,
        price: product.price.toNumber(),
        description: product.description || undefined,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        images: product.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          altText: image.altText || undefined,
          order: image.order,
          createdAt: image.createdAt.toISOString(),
        })),
        // ✅ Ajouter les statistiques de notation
        ratingStats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length,
          ratingDistribution: {
            1: ratings.filter((r) => r.rating === 1).length,
            2: ratings.filter((r) => r.rating === 2).length,
            3: ratings.filter((r) => r.rating === 3).length,
            4: ratings.filter((r) => r.rating === 4).length,
            5: ratings.filter((r) => r.rating === 5).length,
          },
        },
      };
    });
  } catch (error) {
    console.error("Erreur récupération produits similaires:", error);
    return [];
  }
}

export async function getFilterOptions() {
  try {
    const [
      categoriesResult,
      countriesResult,
      localitiesResult,
      geologicalPeriodsResult,
      geologicalStagesResult,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { countryOfOrigin: true },
        distinct: ["countryOfOrigin"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { locality: true },
        distinct: ["locality"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { geologicalPeriod: true },
        distinct: ["geologicalPeriod"],
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.AVAILABLE },
        select: { geologicalStage: true },
        distinct: ["geologicalStage"],
      }),
    ]);

    return {
      categories: categoriesResult.map((item) => item.category),
      countries: countriesResult.map((item) => item.countryOfOrigin).sort(),
      localities: localitiesResult
        .map((item) => item.locality)
        .filter(Boolean) // ✅ Filtrer les valeurs null
        .sort(),
      geologicalPeriods: geologicalPeriodsResult.map(
        (item) => item.geologicalPeriod
      ),
      geologicalStages: geologicalStagesResult
        .map((item) => item.geologicalStage)
        .filter(Boolean) // ✅ Filtrer les valeurs null
        .sort(),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des options de filtre:",
      error
    );
    return {
      categories: [],
      countries: [],
      localities: [],
      geologicalPeriods: [],
      geologicalStages: [],
    };
  }
}
