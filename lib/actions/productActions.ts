"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import {
  Category,
  GeologicalPeriod,
  Locality,
  Prisma,
  ProductStatus,
} from "@/lib/generated/prisma";
import { SerializedProduct } from "@/types/type";
import { CreateProductData, SearchParams } from "@/types/productType";
import { requireAdmin } from "../auth";
import { ActionResult } from "@/types/type"; // ✅ Ajout pour le type de retour

export async function createProductAction(data: CreateProductData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer un produit",
      };
    }

    // ✅ Filtrer les images valides
    const validImages = data.images.filter((img) => img.url && img.url.trim());

    if (validImages.length === 0) {
      return {
        success: false,
        error: "Au moins une image valide est requise",
      };
    }

    // ✅ 1. Créer le produit dans Stripe (limitation: 8 images max)
    const stripeImages = validImages.slice(0, 8).map((img) => img.url); // Prendre seulement les 8 premières pour Stripe

    const stripeProduct = await stripe.products.create({
      name: data.title,
      description: data.description || undefined,
      images: stripeImages, // ✅ Maximum 8 images pour Stripe
      metadata: {
        category: data.category,
        genre: data.genre,
        species: data.species,
        countryOfOrigin: data.countryOfOrigin,
        locality: data.locality.name, // 👈 nom pour Stripe
        geologicalPeriod: data.geologicalPeriod,
        geologicalStage: data.geologicalStage,
        weight: data.weight.toString(),
        total_images: validImages.length.toString(), // ✅ Nombre total d'images
        image_urls: validImages.map((img) => img.url).join(","),
        image_alts: validImages.map((img) => img.altText || "").join(","),
      },
    });

    // ✅ 2. Créer le prix dans Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100),
      currency: "eur",
    });

    // ✅ 3. Vérifier si le produit existe déjà dans la BDD
    const existingProduct = await prisma.product.findUnique({
      where: { stripeProductId: stripeProduct.id },
    });

    let product;

    // Prépare les données pour Prisma
    const productData = {
      title: data.title,
      category: data.category as Category,
      genre: data.genre,
      species: data.species,
      price: data.price,
      countryOfOrigin: data.countryOfOrigin,
      locality: {
        connect: { id: data.locality.id }, // 👈 connexion par id
      },
      geologicalPeriod: data.geologicalPeriod as GeologicalPeriod,
      geologicalStage: data.geologicalStage,
      description: data.description || null,
      description2: data.description2 || null,

      weight: data.weight,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      status: ProductStatus.AVAILABLE,
    };

    if (existingProduct) {
      // Mettre à jour le produit existant
      product = await prisma.product.update({
        where: { stripeProductId: stripeProduct.id },
        data: productData,
      });

      // Supprimer les anciennes images
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
    } else {
      // Créer un nouveau produit
      product = await prisma.product.create({
        data: productData,
      });
    }

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
      } catch (imageError) {
        console.error(`❌ Erreur ajout image ${i + 1}:`, imageError);
      }
    }

    // ✅ 5. Vérifier que les images ont été sauvegardées
    const savedImages = await prisma.productImage.findMany({
      where: { productId: product.id },
      orderBy: { order: "asc" },
    });

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
        description2: product.description2,

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

export async function updateProductAction({
  id,
  title,
  description,
  description2,
  price,
  category,
  countryOfOrigin,
  locality,
  geologicalPeriod,
  geologicalStage,
  weight,
  status,
}: {
  id: number;
  title: string;
  description?: string;
  description2?: string;
  price: number | string;
  category: Category;
  countryOfOrigin: string;
  locality?: number | { id: number };
  geologicalPeriod: GeologicalPeriod;
  geologicalStage: string;
  weight: number;
  status: string;
}) {
  await requireAdmin();

  // Validation (optionnelle)
  if (
    !title ||
    !price ||
    !category ||
    !countryOfOrigin ||
    !geologicalPeriod ||
    !status
  ) {
    return {
      success: false,
      error: "Tous les champs requis doivent être remplis",
    };
  }

  // Vérifier que le produit existe
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return { success: false, error: "Produit non trouvé" };
  }

  // Mise à jour
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      title,
      description: description || null,
      description2: description2 || null,

      price: typeof price === "string" ? parseFloat(price) : price,
      category,
      countryOfOrigin,
      locality: {
        connect: { id: typeof locality === "object" ? locality.id : locality },
      },
      geologicalPeriod,
      geologicalStage: geologicalStage,
      weight,
    },
  });

  return { success: true, product: updatedProduct };
}

// ✅ Fonction de suppression de produit
export async function deleteProductAction(
  productId: number
): Promise<ActionResult<{ productTitle: string }>> {
  try {
    // ✅ Vérifier que l'utilisateur est admin
    await requireAdmin();

    if (!productId || isNaN(productId)) {
      return {
        success: false,
        error: "ID du produit invalide",
      };
    }

    // Vérifier que le produit existe avec toutes ses relations
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        cartItems: true,
        OrderItem: true,
        ratings: true,
        userFavorites: true,
      },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit non trouvé",
      };
    }

    // ✅ Vérifier si le produit est référencé dans des commandes
    if (existingProduct.OrderItem.length > 0) {
      return {
        success: false,
        error:
          "Impossible de supprimer ce produit car il fait partie de commandes existantes. Vous pouvez le désactiver en changeant son statut à 'UNAVAILABLE'.",
      };
    }

    const productTitle = existingProduct.title;

    // ✅ Supprimer les références en cascade dans une transaction
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les favoris
      if (existingProduct.userFavorites.length > 0) {
        await tx.userFavorite.deleteMany({
          where: { productId: productId },
        });
      }

      // 2. Supprimer les ratings
      if (existingProduct.ratings.length > 0) {
        await tx.rating.deleteMany({
          where: { productId: productId },
        });
      }

      // 3. Supprimer les items du panier
      if (existingProduct.cartItems.length > 0) {
        await tx.cartItem.deleteMany({
          where: { productId: productId },
        });
      }

      // 4. Supprimer les images
      if (existingProduct.images.length > 0) {
        await tx.productImage.deleteMany({
          where: { productId: productId },
        });
      }

      // 5. Finalement supprimer le produit
      await tx.product.delete({
        where: { id: productId },
      });
    });

    // ✅ Revalider les caches pertinents
    revalidatePath("/fossiles");
    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { productTitle },
    };
  } catch (error) {
    console.error("❌ Erreur suppression produit:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    return {
      success: false,
      error: "Erreur interne du serveur",
    };
  }
}

export async function getFossils(
  filters: SearchParams & { search?: string } = {},
  userId?: string | null,
  page: number = 1,
  limit: number = 20
): Promise<{
  fossils: SerializedProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const whereConditions: Prisma.ProductWhereInput = {
      status: ProductStatus.AVAILABLE,
    };

    // Recherche par terme
    if (filters.search && filters.search.trim()) {
      whereConditions.OR = [
        {
          title: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        {
          genre: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        {
          species: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    if (filters.category) {
      whereConditions.category = filters.category as Category;
    }
    if (filters.countryOfOrigin) {
      whereConditions.countryOfOrigin = filters.countryOfOrigin;
    }
    if (filters.locality) {
      whereConditions.locality = {
        name: filters.locality, // ou id: Number(filters.locality) si tu filtres par id
      };
    }
    if (filters.geologicalPeriod) {
      whereConditions.geologicalPeriod =
        filters.geologicalPeriod as GeologicalPeriod;
    }
    if (filters.geologicalStage) {
      whereConditions.geologicalStage = filters.geologicalStage;
    }

    // Calculer le nombre total d'éléments correspondant aux filtres
    const totalCount = await prisma.product.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // ✅ Récupérer les produits avec pagination
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
        locality: true,
      },
orderBy:
          filters.sort === "name_asc" ? { title: "asc" }
          : filters.sort === "name_desc" ? { title: "desc" }
          : filters.sort === "price_asc" ? { price: "asc" }
          : filters.sort === "price_desc" ? { price: "desc" }
          : { createdAt: "desc" },
      skip,
      take: limit,
    });

    const serializedFossils = fossils.map((fossil) => {
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
        description2: fossil.description2 || undefined, // ✅ Ajouter description2
        weight: fossil.weight,
        // ✅ Vérifier si CE produit est dans les favoris de CET utilisateur
        isFavorite: userId ? fossil.userFavorites.length > 0 : false,
        createdAt: fossil.createdAt.toISOString(),
        updatedAt: fossil.updatedAt.toISOString(),
        category: fossil.category,
        geologicalPeriod: fossil.geologicalPeriod,
        status: fossil.status,
        locality: fossil.locality,
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

    return {
      fossils: serializedFossils,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des fossiles:", error);
    return {
      fossils: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
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
        locality: true,
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
      description2: product.description2 || undefined, // ✅ Ajouter description2
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      locality: product.locality,
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
        locality: true,
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
        description2: product.description2 || undefined, // ✅ Ajouter description2
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
      prisma.locality.findMany({
        where: {
          products: {
            some: { status: ProductStatus.AVAILABLE },
          },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
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
      localities: localitiesResult,
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

export async function createLocalityAction({
  name,
  latitude,
  longitude,
  geologicalPeriods,
  geologicalStages,
}: Omit<Locality, "id">) {
  try {
    const locality = await prisma.locality.create({
      data: {
        name,
        latitude,
        longitude,
        geologicalPeriods,
        geologicalStages,
      },
    });
    return { success: true, data: locality };
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la création de la localité",
    };
  }
}

export async function updateLocalityAction({
  id,
  name,
  latitude,
  longitude,
  geologicalPeriods,
  geologicalStages,
}: Locality) {
  try {
    const locality = await prisma.locality.update({
      where: { id },
      data: {
        name,
        latitude,
        longitude,
        geologicalPeriods,
        geologicalStages,
      },
    });
    return { success: true, data: locality };
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la modification de la localité",
    };
  }
}

export async function getFossilCatalogIndex() {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.AVAILABLE },
    select: {
      category: true,
      countryOfOrigin: true,
      geologicalPeriod: true,
      geologicalStage: true,
      locality: { select: { name: true } }
    }
  });
  return products.map(p => ({
    category: p.category,
    countryOfOrigin: p.countryOfOrigin,
    geologicalPeriod: p.geologicalPeriod,
    geologicalStage: p.geologicalStage,
    locality: p.locality?.name || null
  }));
}
