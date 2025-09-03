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
import ProductMap from "./productMap";
import { SerializedProduct } from "@/types/type";
import { RatingStats, UserRating } from "@/types/ratingType";
import { useHandleAddToCart } from "@/hooks/useHandleAddToCart";

interface ProductPageClientProps {
  product: SerializedProduct;
  similarProducts: SerializedProduct[];
  ratingStats: RatingStats;
  userRating: UserRating | null;
}

export default function ProductPageClient({
  product,
  similarProducts,
  ratingStats,
  userRating,
}: ProductPageClientProps) {
  const { handleAddToCart, isAdding } = useHandleAddToCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/fossiles"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux fossiles
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
            <ProductMap
              country={product.countryOfOrigin}
              locality={product.locality.name}
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
                  Informations scientifiques
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Genre :</span>
                    <span>{product.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Espèce :</span>
                    <span className="italic">{product.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Période géologique :</span>
                    <span>{product.geologicalPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Étage géologique :</span>
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
                  Provenance
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Pays d&apos;origine :</span>
                    <span>{product.countryOfOrigin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Localité :</span>
                    <span>{product.locality.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Description</h3>
                  <p className="text-sm leading-relaxed">
                    {product.description}
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
              {isAdding ? "Ajout en cours..." : "Ajouter au panier"}
            </Button>

            {/* Informations supplémentaires */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                Ajouté le{" "}
                {new Date(product.createdAt).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div>
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
