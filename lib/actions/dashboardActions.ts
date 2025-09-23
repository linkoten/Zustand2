import prisma from "@/lib/prisma";
import { User } from "../generated/prisma";
import { SerializedProduct } from "@/types/type";
import { getProductRatingStats } from "./ratingActions";

export async function getUserData(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

export async function getUserDataByStripeCustomerId(
  stripeCustomerId: string
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { stripeCustomerId },
  });
}

export async function getUserDashboardData(userId: string) {
  try {
    // Récupérer les favoris de l'utilisateur
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6, // Limiter à 6 favoris récents
    });

    // Récupérer les demandes de fossiles de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { email: true, id: true },
    });

    const orders = await prisma.order.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }, // si tu veux les produits
    });

    const fossilRequests = await prisma.fossilRequest.findMany({
      where: {
        email: user?.email,
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Limiter à 5 demandes récentes
    });

    // Compter les totaux
    const [totalFavorites, totalRequests] = await Promise.all([
      prisma.userFavorite.count({ where: { userId } }),
      prisma.fossilRequest.count({
        where: {
          email: user?.email,
        },
      }),
    ]);

    return {
      favorites: favorites.map((fav) => ({
        ...fav.product,
        price: fav.product.price.toNumber(),
        createdAt: fav.product.createdAt.toISOString(),
        updatedAt: fav.product.updatedAt.toISOString(),
      })),
      fossilRequests: fossilRequests.map((req) => ({
        ...req,
        maxBudget: req.maxBudget?.toNumber() || null,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        respondedAt: req.respondedAt?.toISOString() || null,
      })),
      orders: orders.map((order) => ({
        ...order,
        total: order.total?.toNumber?.() ?? order.total,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          price: item.price?.toNumber?.() ?? item.price,
        })),
      })),
      totalFavorites,
      totalRequests,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
    return {
      favorites: [],
      fossilRequests: [],
      totalFavorites: 0,
      totalRequests: 0,
      orders: [],
    };
  }
}

export async function getAdminDashboardData() {
  try {
    // Récupérer toutes les demandes de fossiles
    const allFossilRequests = await prisma.fossilRequest.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    // Compter les statistiques
    const [
      totalUsers,
      totalProducts,
      totalBlogArticles,
      totalRequests,
      pendingRequests,
      availableProducts,
      publishedArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.articleBlog.count(),
      prisma.fossilRequest.count(),
      prisma.fossilRequest.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "AVAILABLE" } }),
      prisma.articleBlog.count({ where: { status: "PUBLISHED" } }),
    ]);

    // Récupérer les derniers utilisateurs inscrits
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Récupérer les produits récents
    const recentProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });

    return {
      fossilRequests: allFossilRequests.map((req) => ({
        ...req,
        maxBudget: req.maxBudget?.toNumber() || null,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        respondedAt: req.respondedAt?.toISOString() || null,
      })),
      stats: {
        totalUsers,
        totalProducts,
        totalBlogArticles,
        totalRequests,
        pendingRequests,
        availableProducts,
        publishedArticles,
      },
      recentUsers: recentUsers.map((user) => ({
        ...user,
        role: user.role, // Sera converti en string automatiquement
        createdAt: user.createdAt.toISOString(), // ✅ Convertir Date en string
      })),
      recentProducts: recentProducts.map((product) => ({
        ...product,
        price: product.price.toNumber(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données admin:", error);
    return {
      fossilRequests: [],
      stats: {
        totalUsers: 0,
        totalProducts: 0,
        totalBlogArticles: 0,
        totalRequests: 0,
        pendingRequests: 0,
        availableProducts: 0,
        publishedArticles: 0,
      },
      recentUsers: [],
      recentProducts: [],
    };
  }
}

export async function getUserOrders(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return [];
  return prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { include: { images: true } } } } },
  });
}

export async function getUserFavorites(
  clerkId: string
): Promise<SerializedProduct[]> {
  // 🔍 Debug
  console.log("🔍 Debug getUserFavorites:");
  console.log("- clerkId:", clerkId);

  try {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: clerkId }, // ✅ Utiliser directement le clerkId
      include: {
        product: {
          include: {
            images: { orderBy: { order: "asc" } },
            locality: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🔍 Debug supplémentaire
    console.log("- favorites found:", favorites.length);
    console.log(
      "- favorites data:",
      favorites.map((f) => ({
        id: f.id,
        userId: f.userId,
        productId: f.productId,
        productTitle: f.product?.title,
      }))
    );

    // Pour chaque favori, on complète tous les champs requis
    const serializedFavorites: SerializedProduct[] = await Promise.all(
      favorites
        .filter((fav) => fav.product)
        .map(async (fav) => {
          const p = fav.product;
          // Récupérer les stats de notation (optionnel, sinon valeur par défaut)
          let ratingStats;
          try {
            ratingStats = await getProductRatingStats(p.id);
          } catch {
            ratingStats = {
              averageRating: 0,
              totalRatings: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
          }

          return {
            id: p.id,
            title: p.title,
            price: p.price?.toNumber?.() ?? 0,
            category: p.category ?? "",
            genre: p.genre ?? "",
            species: p.species ?? "",
            countryOfOrigin: p.countryOfOrigin ?? "",
            locality: p.locality ?? {
              id: 0,
              name: "",
              latitude: 0,
              longitude: 0,
              geologicalPeriods: [],
              geologicalStages: [],
            },
            geologicalPeriod: p.geologicalPeriod ?? "",
            geologicalStage: p.geologicalStage ?? "",
            description: p.description ?? "",
            description2: p.description2 ?? "", // ✅ Ajout du champ manquant
            stripePriceId: p.stripePriceId ?? null,
            weight: p.weight ?? 0,
            status: p.status,
            createdAt: p.createdAt?.toISOString?.() ?? "",
            updatedAt: p.updatedAt?.toISOString?.() ?? "",
            isFavorite: true,
            averageRating: ratingStats.averageRating,
            totalRatings: ratingStats.totalRatings,
            ratingStats,
            images: (p.images || []).map((img) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText || undefined,
              order: img.order,
              createdAt: img.createdAt?.toISOString?.() ?? "",
            })),
          };
        })
    );

    console.log("- final serialized favorites:", serializedFavorites.length);
    return serializedFavorites;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des favoris utilisateur:",
      error
    );
    return [];
  }
}
