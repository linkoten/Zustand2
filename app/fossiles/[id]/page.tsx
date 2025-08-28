import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/productPageClient";
import {
  getProductRatingStats,
  getUserProductRating,
} from "@/lib/actions/ratingActions";
import { getProduct, getSimilarProducts } from "@/lib/actions/productActions";

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

  // ✅ Récupérer les vraies statistiques de notation
  const [ratingStats, userRating, similarProducts] = await Promise.all([
    getProductRatingStats(product.id),
    getUserProductRating(product.id),
    getSimilarProducts(product.id, product.category),
  ]);

  return (
    <ProductPageClient
      product={product}
      similarProducts={similarProducts}
      ratingStats={ratingStats}
      userRating={userRating}
    />
  );
}
