import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/productPageClient";
import {
  getProductRatingStats,
  getUserProductRating,
} from "@/lib/actions/ratingActions";
import { getProduct, getSimilarProducts } from "@/lib/actions/productActions";
import { getDictionary } from "../../dictionaries";
import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/lib/actions/dashboardActions";
import UserProvider from "@/components/provider/userProvider";

// ✅ Générer les métadonnées SEO améliorées
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: "Produit non trouvé | Fossiles & Minéraux",
      description: "Ce produit n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    title: `${product.title} - ${product.species} | Fossiles & Minéraux`,
    description: `Découvrez ${product.title}, un magnifique spécimen de ${product.species} datant du ${product.geologicalPeriod}. Prix: ${product.price}€. Provenance: ${product.countryOfOrigin}, ${product.locality}.`,
    keywords: `fossile, ${product.species}, ${product.geologicalPeriod}, ${product.category}, ${product.countryOfOrigin}, paléontologie`,
    openGraph: {
      title: `${product.title} - ${product.species}`,
      description: `${product.species} du ${product.geologicalPeriod} - ${product.price}€`,
      images:
        product.images.length > 0
          ? [
              {
                url: product.images[0].imageUrl,
                width: 800,
                height: 600,
                alt: `${product.title} - ${product.species}`,
              },
            ]
          : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - ${product.species}`,
      description: `${product.species} du ${product.geologicalPeriod} - ${product.price}€`,
      images: product.images.length > 0 ? [product.images[0].imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; lang: "en" | "fr" }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  const lang = resolvedParams.lang;
  const dict = await getDictionary(lang);

  if (!product) {
    notFound();
  }

  // ✅ Récupérer les données utilisateur pour les favoris
  const { userId } = await auth();
  let user = null;
  if (userId) {
    user = await getUserData(userId);
  }

  // ✅ Récupérer les vraies statistiques de notation et produits similaires
  const [ratingStats, userRating, similarProducts] = await Promise.all([
    getProductRatingStats(product.id),
    userId ? getUserProductRating(product.id) : null,
    getSimilarProducts(product.id, product.category),
  ]);

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-stone-50">
        <ProductPageClient
          product={product}
          similarProducts={similarProducts}
          ratingStats={ratingStats}
          userRating={userRating}
          lang={lang}
          dict={dict}
        />
      </div>
    </UserProvider>
  );
}
