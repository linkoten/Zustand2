"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, MapPin, Calendar, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductCard from "./productCard";
import ProductCarousel from "./productCarousel";
// ✅ Import des composants de notation
import RatingDisplay from "@/components/rating/ratingDisplay";
import ProductLocationMap from "./productLocationMap";
import { SerializedProduct } from "@/types/type";
import { RatingStats, UserRating } from "@/types/ratingType";
import { useHandleAddToCart } from "@/hooks/useHandleAddToCart";

interface ProductPageClientProps {
  product: SerializedProduct;
  similarProducts: SerializedProduct[];
  ratingStats: RatingStats;
  userRating: UserRating | null;
  lang: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export default function ProductPageClient({
  product,
  similarProducts,
  ratingStats,
  userRating,
  lang,
  dict,
}: ProductPageClientProps) {
  const { handleAddToCart, isAdding } = useHandleAddToCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/${lang}/fossiles`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dict?.fossils?.backToFossils ||
              dict?.checkout?.backToFossils ||
              (lang === "en" ? "Back to fossils" : "Retour aux fossiles")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ✅ Carousel d'images */}
          <div className="space-y-4">
            <ProductCarousel
              images={product.images}
              productTitle={product.title}
            />
            {/* Carte de provenance */}
            <ProductLocationMap
              locality={product.locality}
              height={260}
              showAllLocalities={true}
              className="rounded-lg shadow-sm"
            />
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            {/* Titre et prix */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
              {/* ✅ Affichage de la notation moyenne */}
              <div className="mt-2">
                <RatingDisplay
                  productId={product.id}
                  stats={ratingStats}
                  userRating={userRating || undefined}
                  showForm={true}
                  dict={dict}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.status}</Badge>
            </div>

            {/* Informations scientifiques */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {dict?.products?.scientificInfo ||
                    (lang === "en"
                      ? "Scientific information"
                      : "Informations scientifiques")}
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.products?.genre ||
                        (lang === "en" ? "Genus" : "Genre")}{" "}
                      :
                    </span>
                    <span>{product.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.products?.species ||
                        (lang === "en" ? "Species" : "Espèce")}{" "}
                      :
                    </span>
                    <span className="italic">{product.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.fossils?.periodLabel ||
                        (lang === "en"
                          ? "Geological period"
                          : "Période géologique")}{" "}
                      :
                    </span>
                    <span>{product.geologicalPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.fossils?.stageLabel ||
                        (lang === "en"
                          ? "Geological stage"
                          : "Étage géologique")}{" "}
                      :
                    </span>
                    <span>{product.geologicalStage}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provenance */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {dict?.products?.provenance ||
                    (lang === "en" ? "Provenance" : "Provenance")}
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.fossils?.countryLabel ||
                        (lang === "en"
                          ? "Country of origin"
                          : "Pays d'origine")}{" "}
                      :
                    </span>
                    <span>
                      {dict?.countries?.[product.countryOfOrigin] ||
                        product.countryOfOrigin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {dict?.fossils?.localityLabel ||
                        (lang === "en" ? "Locality" : "Localité")}{" "}
                      :
                    </span>
                    <span>{product.locality.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {((lang === "fr" && product.description) ||
              (lang === "en" && product.description2)) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    {dict?.products?.description ||
                      (lang === "en" ? "Description" : "Description")}
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {lang === "en" ? product.description2 : product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bouton d'ajout au panier */}
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleAddToCart(product)}
              disabled={isAdding || product.status !== "AVAILABLE"}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isAdding
                ? dict?.products?.addingToCart ||
                  (lang === "en" ? "Adding..." : "Ajout en cours...")
                : dict?.products?.cart ||
                  (lang === "en" ? "Add to Cart" : "Ajouter au panier")}
            </Button>

            {/* Informations supplémentaires */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {dict?.products?.addedOn ||
                  (lang === "en" ? "Added on" : "Ajouté le")}{" "}
                {new Date(product.createdAt).toLocaleDateString(
                  lang === "en" ? "en-US" : "fr-FR"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div>
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">
              {dict?.products?.similarProducts ||
                (lang === "en" ? "Similar products" : "Produits similaires")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard
                  key={similarProduct.id}
                  product={similarProduct}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
