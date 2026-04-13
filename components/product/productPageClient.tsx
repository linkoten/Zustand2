"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  ArrowLeft,
  MapPin,
  Calendar,
  Info,
  Heart,
  Share2,
  ZoomIn,
  ExternalLink,
  Tag,
  Star,
  Sparkles,
  Mountain,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductCard from "./productCard";
import ImageLens from "@/components/ui/image-lens";
import RatingDisplay from "@/components/rating/ratingDisplay";
import ProductLocationMap from "./productLocationMap";
import { SerializedProduct } from "@/types/type";
import { RatingStats, UserRating } from "@/types/ratingType";
import { useHandleAddToCart } from "@/hooks/useHandleAddToCart";
import { FavoriteButton } from "./favoriteButton";
import Image from "next/image";

interface ProductPageClientProps {
  product: SerializedProduct;
  similarProducts: SerializedProduct[];
  ratingStats: RatingStats;
  userRating?: UserRating | null;
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Breadcrumb amélioré avec animation - RESPONSIVE */}
      <nav className="mb-4 sm:mb-6 lg:mb-8 bg-[var(--silex)]/50 p-3 rounded-lg border border-[var(--parchemin)]/10 backdrop-blur-sm inline-block">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-[var(--parchemin)]/70 overflow-hidden font-medium">
          <Link
            href={`/${lang}`}
            className="hover:text-[var(--terracotta)] transition-colors duration-200 truncate flex items-center gap-1"
          >
            <Mountain className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--terracotta)]/70" />
            {dict?.navbar?.home || "Accueil"}
          </Link>
          <span className="text-[var(--parchemin)]/30 font-light flex-shrink-0">
            /
          </span>
          <Link
            href={`/${lang}/fossiles`}
            className="hover:text-[var(--terracotta)] transition-colors duration-200 flex items-center group truncate"
          >
            {dict?.navbar?.fossils || "Fossiles"}
          </Link>
          <span className="text-[var(--parchemin)]/30 font-light flex-shrink-0">
            /
          </span>
          <span className="text-[var(--parchemin)] font-semibold border-b border-[var(--terracotta)]/50 pb-0.5 truncate tracking-wide">
            {product.title}
          </span>
        </div>
      </nav>

      {/* Layout principal responsive - STACK SUR MOBILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
        {/* Section Images avec Lens ultra améliorée - RESPONSIVE OPTIMISÉE */}
        <div className="space-y-6 order-1 lg:col-span-7 relative lg:sticky lg:top-8">
          {/* Image principale avec lens - DIMENSIONS DIFFÉRENTES SELON DEVICE */}
          <Card className="border border-[var(--parchemin)]/10 shadow-2xl bg-[var(--silex)] overflow-hidden group transition-all duration-500 rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="relative mb-6">
                {/* ✅ Container d'image avec tailles différenciées */}
                <div className="w-full flex justify-center">
                  {/* Mobile et Tablet : Image centrée et réduite */}
                  <div className="lg:hidden w-full max-w-lg aspect-square relative bg-black/40 rounded-xl overflow-hidden">
                    <ImageLens
                      src={
                        product.images[selectedImageIndex]?.imageUrl ||
                        "/placeholder.jpg"
                      }
                      alt={`${product.title} - ${dict?.fossils?.viewDetails || "Vue"} ${selectedImageIndex + 1}`}
                      width={600}
                      height={600}
                      className="w-full h-full object-contain transition-all duration-300 drop-shadow-2xl"
                      lensSize={80}
                      zoomLevel={2}
                    />
                  </div>

                  {/* Desktop : Image pleine taille comme avant */}
                  <div className="hidden lg:block w-full aspect-[4/3] relative bg-black/40 rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                    <ImageLens
                      src={
                        product.images[selectedImageIndex]?.imageUrl ||
                        "/placeholder.jpg"
                      }
                      alt={`${product.title} - ${dict?.fossils?.viewDetails || "Vue"} ${selectedImageIndex + 1}`}
                      width={1000}
                      height={750}
                      className="w-full h-full object-contain transition-all duration-300 drop-shadow-2xl"
                      lensSize={150}
                      zoomLevel={2.5}
                    />
                  </div>
                </div>

                {/* Badges premium améliorés - RESPONSIVE */}
                <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-col gap-1 sm:gap-2">
                  <Badge className="bg-black/80 backdrop-blur-sm text-white border-0 shadow-lg lg:shadow-xl flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
                    <ZoomIn className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="font-semibold hidden sm:inline">
                      HD Zoom
                    </span>
                    <span className="font-semibold sm:hidden">HD</span>
                  </Badge>
                  <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-lg lg:shadow-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    {selectedImageIndex + 1}/{product.images.length}
                  </Badge>
                </div>

                {/* ✅ Bouton favori en overlay - RESPONSIVE */}
                <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 flex flex-col gap-2">
                  {/* Status badge animé premium */}
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg lg:shadow-xl animate-pulse px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1 sm:mr-2 animate-ping"></div>
                    {dict?.products?.available || "Disponible"}
                  </Badge>
                </div>
              </div>

              {/* Miniatures - RESPONSIVE OPTIMISÉES */}
              {product.images.length > 1 && (
                <div className="flex flex-wrap gap-4 sm:gap-6 py-4 mt-2 justify-center lg:justify-start">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 relative z-0 hover:z-10 ${
                        selectedImageIndex === index
                          ? "border-[var(--terracotta)] ring-2 ring-[var(--terracotta)]/30 shadow-[0_0_15px_rgba(217,119,87,0.5)] opacity-100 scale-105"
                          : "border-[var(--parchemin)]/20 hover:border-[var(--terracotta)]/50 opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${product.title} - ${dict?.fossils?.viewDetails || "Miniature"} ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte de localisation ultra améliorée - RESPONSIVE COMPACTE */}
          <Card className="border border-[var(--parchemin)]/10 shadow-lg bg-gradient-to-b from-[var(--silex)] to-black/20 transition-all duration-500 group rounded-xl">
            <CardHeader className="pb-3 sm:pb-4 border-b border-[var(--parchemin)]/5 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--terracotta)]/5 to-transparent"></div>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-serif text-[var(--parchemin)] flex items-center gap-2 sm:gap-3 relative z-10">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-[var(--terracotta)]/20 to-transparent rounded-xl shadow-inner border border-[var(--terracotta)]/30 transition-shadow duration-300 flex-shrink-0">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[var(--terracotta)]" />
                </div>
                <span className="truncate text-sm sm:text-base lg:text-xl tracking-wide font-bold">
                  {dict?.fossils?.origin || "Origine du fossile"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <ProductLocationMap
                locality={product.locality}
                height={280}
                showAllLocalities={true}
                className="rounded-xl lg:rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border border-[var(--parchemin)]/10"
              />
            </CardContent>
          </Card>
        </div>

        {/* Informations produit réorganisées - RESPONSIVE */}
        <div className="space-y-4 sm:space-y-6 order-2 lg:col-span-5">
          {/* Card principale réorganisée - RESPONSIVE */}
          <Card className="border border-[var(--parchemin)]/10 shadow-2xl bg-[var(--silex)] rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--terracotta)]/5 rounded-full blur-[80px] pointer-events-none"></div>
            <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
              {/* En-tête avec titre et prix - RESPONSIVE STACK */}
              <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-serif font-black text-[var(--parchemin)] leading-tight tracking-wide drop-shadow-md">
                    {product.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-[var(--terracotta)]/10 text-[var(--terracotta)] px-3 py-1.5 text-xs sm:text-sm border border-[var(--terracotta)]/20 font-medium"
                    >
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Prix et badge - RESPONSIVE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--terracotta)] tracking-tight drop-shadow-sm">
                    {formatPrice(product.price)}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[var(--parchemin)]/40 text-[var(--parchemin)] bg-transparent px-3 py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold self-start sm:self-auto shadow-sm"
                  >
                    {dict?.products?.fixedPrice || "Prix fixe"}
                  </Badge>
                </div>
              </div>

              {/* Genre et Espèce - RESPONSIVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-900/20 to-transparent rounded-xl border border-blue-500/20 text-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
                  <p className="text-xs text-blue-300/80 uppercase tracking-widest font-bold mb-1">
                    {dict?.fossils?.genus || "Genre"}
                  </p>
                  <p className="font-bold text-blue-100 text-base sm:text-lg lg:text-xl truncate drop-shadow-sm">
                    {product.genre ||
                      dict?.fossilRequests?.notSpecified ||
                      "Non spécifié"}
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-900/20 to-transparent rounded-xl border border-emerald-500/20 text-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
                  <p className="text-xs text-emerald-300/80 uppercase tracking-widest font-bold mb-1">
                    {dict?.fossils?.species || "Espèce"}
                  </p>
                  <p className="font-bold text-emerald-100 text-base sm:text-lg lg:text-xl truncate drop-shadow-sm">
                    {product.species}
                  </p>
                </div>
              </div>

              {/* Rating avec design premium - RESPONSIVE */}
              <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-[var(--silex)] rounded-xl lg:rounded-2xl border border-[var(--parchemin)]/10 shadow-inner">
                <RatingDisplay
                  productId={product.id}
                  stats={ratingStats}
                  userRating={userRating || undefined}
                  showForm={true}
                  dict={dict}
                />
              </div>

              <Separator className="my-4 sm:my-6 lg:my-8 bg-gradient-to-r from-transparent via-[var(--parchemin)]/20 to-transparent h-px border-0" />

              {/* Boutons d'action ultra premium - RESPONSIVE */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-8">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding}
                  className="w-full bg-transparent border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-parchemin font-bold py-3 sm:py-4 rounded-xl shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group text-sm sm:text-base h-11 sm:h-12 lg:h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isAdding
                    ? dict?.products?.adding || "Ajout..."
                    : dict?.products?.addToCart || "Ajouter au panier"}
                </Button>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* ✅ Bouton favori w-full */}
                  <div className="flex w-full">
                    <FavoriteButton
                      productId={product.id}
                      isFavorite={product.isFavorite || false}
                      variant="outline"
                      className="w-full h-11 sm:h-12 lg:h-14 border border-[var(--parchemin)]/30 hover:border-[var(--parchemin)] hover:bg-[var(--parchemin)]/5 text-[var(--parchemin)] transition-all duration-300 rounded-xl group text-xs sm:text-sm font-semibold"
                      dict={dict}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 sm:h-12 lg:h-14 border border-[var(--parchemin)]/30 hover:border-[var(--parchemin)] hover:bg-[var(--parchemin)]/5 text-[var(--parchemin)] transition-all duration-300 rounded-xl group text-xs sm:text-sm font-semibold"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 group-hover:text-[var(--terracotta)] transition-colors duration-300" />
                    <span className="hidden sm:inline">
                      {dict?.products?.share || "Partager"}
                    </span>
                    <span className="sm:hidden">↗</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations détaillées - RESPONSIVE COMPACTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Pays d'origine */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-900/10 to-transparent rounded-xl border border-amber-500/20 hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-amber-900/40 rounded-xl shadow-inner border border-amber-500/20 flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-500/80 uppercase tracking-widest font-bold mb-1">
                  {dict?.fossils?.countryLabel || "Origine"}
                </p>
                <p className="font-bold text-amber-100 text-xs sm:text-sm lg:text-base truncate">
                  {dict?.countries?.[product.countryOfOrigin] ||
                    product.countryOfOrigin}
                </p>
              </div>
            </div>

            {/* Étage géologique */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-900/10 to-transparent rounded-xl border border-purple-500/20 hover:shadow-lg hover:border-purple-500/40 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-purple-900/40 rounded-xl shadow-inner border border-purple-500/20 flex-shrink-0">
                <Mountain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-purple-400/80 uppercase tracking-widest font-bold mb-1">
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </p>
                <p className="font-bold text-purple-100 text-xs sm:text-sm lg:text-base truncate">
                  {product.geologicalStage ||
                    dict?.fossilRequests?.notSpecified ||
                    "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Localité */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-900/10 to-transparent rounded-xl border border-green-500/20 hover:shadow-lg hover:border-green-500/40 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-green-900/40 rounded-xl shadow-inner border border-green-500/20 flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-green-500/80 uppercase tracking-widest font-bold mb-1">
                  {dict?.fossils?.localityLabel || "Localité"}
                </p>
                <p className="font-bold text-green-100 text-xs sm:text-sm lg:text-base truncate">
                  {product.locality?.name ||
                    dict?.fossilRequests?.notSpecified ||
                    "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Période géologique */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-cyan-900/10 to-transparent rounded-xl border border-cyan-500/20 hover:shadow-lg hover:border-cyan-500/40 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-cyan-900/40 rounded-xl shadow-inner border border-cyan-500/20 flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-cyan-400/80 uppercase tracking-widest font-bold mb-1">
                  {dict?.fossils?.periodLabel || "Période"}
                </p>
                <p className="font-bold text-cyan-100 text-xs sm:text-sm lg:text-base truncate">
                  {product.geologicalPeriod}
                </p>
              </div>
            </div>
          </div>

          {/* Description avec design moderne - RESPONSIVE */}
          {(product.description || product.description2) && (
            <Card className="border border-[var(--parchemin)]/10 shadow-xl bg-[var(--silex)] transition-all duration-500 rounded-xl group/desc overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4 border-b border-[var(--parchemin)]/5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--terracotta)]/5 to-transparent opacity-0 group-hover/desc:opacity-100 transition-opacity duration-500"></div>
                <CardTitle className="text-base sm:text-lg lg:text-xl font-serif text-[var(--parchemin)] flex items-center gap-2 sm:gap-3 relative z-10">
                  <div className="p-2 sm:p-3 bg-[var(--terracotta)]/10 rounded-xl shadow-inner border border-[var(--terracotta)]/20 transition-shadow duration-300 flex-shrink-0">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[var(--terracotta)]" />
                  </div>
                  <span className="truncate text-sm sm:text-base lg:text-xl font-bold tracking-wide">
                    {dict?.products?.description || "Description"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-[var(--parchemin)]/80 leading-relaxed text-sm sm:text-base lg:text-lg font-light bg-black/20 p-4 sm:p-5 lg:p-6 rounded-xl border border-[var(--parchemin)]/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]">
                    {lang === "en" ? product.description2 : product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Produits similaires avec animations premium - RESPONSIVE */}
      {similarProducts.length > 0 && (
        <div className="mt-8 sm:mt-12 lg:mt-16 xl:mt-24">
          <Separator className="mb-6 sm:mb-8 lg:mb-12 xl:mb-16 bg-gradient-to-r from-transparent via-slate-300 to-transparent h-px" />
          <div className="text-center mb-6 sm:mb-8 lg:mb-12 xl:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-amber-700 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6">
              {dict?.products?.similarProducts || "Produits similaires"}
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed px-4">
              {lang === "en"
                ? "Discover other specimens from the same period or region that might interest you"
                : "Découvrez d'autres spécimens de la même période ou région qui pourraient vous intéresser"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {similarProducts.slice(0, 4).map((similarProduct, index) => (
              <div
                key={similarProduct.id}
                className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-3 hover:rotate-1"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProductCard product={similarProduct} lang={lang} dict={dict} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
