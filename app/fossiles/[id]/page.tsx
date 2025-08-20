import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@/lib/generated/prisma";
import { SerializedProduct } from "@/types/type";
import ProductPageClient from "@/components/product/productPageClient";

async function getProduct(id: string): Promise<SerializedProduct | null> {
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
      },
    });

    if (!product) {
      return null;
    }

    // ✅ Sérialiser les données avec conversion null -> undefined
    return {
      ...product,
      price: product.price.toNumber(),
      description: product.description || undefined, // ✅ Convertir null en undefined
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText || undefined, // ✅ Convertir null en undefined
        order: image.order,
        createdAt: image.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Erreur récupération produit:", error);
    return null;
  }
}

async function getSimilarProducts(
  currentProductId: number,
  category: string,
  limit: number = 4
): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: { not: currentProductId },
        category: category as any,
        status: ProductStatus.AVAILABLE,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      description: product.description || undefined, // ✅ Convertir null en undefined
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText || undefined, // ✅ Convertir null en undefined
        order: image.order,
        createdAt: image.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error("Erreur récupération produits similaires:", error);
    return [];
  }
}

// ✅ Générer les métadonnées SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: "Produit non trouvé",
      description: "Ce produit n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    title: `${product.title} - Fossiles & Minéraux`,
    description: `${product.title} - ${product.species} du ${product.geologicalPeriod}. Prix: ${product.price}€. Origine: ${product.countryOfOrigin}.`,
    openGraph: {
      title: product.title,
      description: `${product.species} du ${product.geologicalPeriod} - ${product.price}€`,
      images: product.images.length > 0 ? [product.images[0].imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(
    product.id,
    product.category
  );

  return (
    <ProductPageClient product={product} similarProducts={similarProducts} />
  );
}
