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
import { FavoriteButton } from "./favoriteButton"; // ✅ Import du composant FavoriteButton
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
      <nav className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-600 overflow-hidden">
          <Link
            href={`/${lang}`}
            className="hover:text-amber-600 transition-all duration-200 hover:scale-105 font-medium truncate"
          >
            {dict?.navbar?.home || "Accueil"}
          </Link>
          <span className="text-slate-400 font-light flex-shrink-0">/</span>
          <Link
            href={`/${lang}/fossiles`}
            className="hover:text-amber-600 transition-all duration-200 flex items-center group font-medium truncate"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200 flex-shrink-0" />
            {dict?.navbar?.fossils || "Fossiles"}
          </Link>
          <span className="text-slate-400 font-light flex-shrink-0">/</span>
          <span className="text-slate-900 font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent truncate">
            {product.title}
          </span>
        </div>
      </nav>

      {/* Layout principal responsive - STACK SUR MOBILE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-16">
        {/* Section Images avec Lens ultra améliorée - RESPONSIVE OPTIMISÉE */}
        <div className="space-y-4 sm:space-y-6 order-1">
          {/* Image principale avec lens - DIMENSIONS DIFFÉRENTES SELON DEVICE */}
          <Card className="border-0 shadow-xl lg:shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 backdrop-blur-sm overflow-hidden group hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="relative mb-3 sm:mb-4">
                {/* ✅ Container d'image avec tailles différenciées */}
                <div className="aspect-square w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-full">
                  {/* Mobile et Tablet : Image centrée et réduite */}
                  <div className="lg:hidden">
                    <ImageLens
                      src={
                        product.images[selectedImageIndex]?.imageUrl ||
                        "/placeholder.jpg"
                      }
                      alt={`${product.title} - ${dict?.fossils?.viewDetails || "Vue"} ${selectedImageIndex + 1}`}
                      width={400}
                      height={400}
                      className="w-full h-full rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 object-cover"
                      lensSize={60}
                      zoomLevel={1.8}
                    />
                  </div>

                  {/* Desktop : Image pleine taille comme avant */}
                  <div className="hidden lg:block">
                    <ImageLens
                      src={
                        product.images[selectedImageIndex]?.imageUrl ||
                        "/placeholder.jpg"
                      }
                      alt={`${product.title} - ${dict?.fossils?.viewDetails || "Vue"} ${selectedImageIndex + 1}`}
                      width={600}
                      height={600}
                      className="w-full h-full rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 object-cover"
                      lensSize={150}
                      zoomLevel={3.5}
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

                  {/* Bouton favori avec design overlay */}
                  <FavoriteButton
                    productId={product.id}
                    isFavorite={product.isFavorite || false}
                    variant="overlay"
                    size="md"
                    dict={dict}
                  />
                </div>
              </div>

              {/* Miniatures - RESPONSIVE OPTIMISÉES */}
              {product.images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-slate-100 justify-center lg:justify-start">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg lg:rounded-2xl overflow-hidden border-2 lg:border-3 transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                        selectedImageIndex === index
                          ? "border-amber-500 ring-2 lg:ring-4 ring-amber-200 shadow-lg lg:shadow-xl scale-105"
                          : "border-slate-200 hover:border-amber-300 hover:shadow-md lg:hover:shadow-lg"
                      }`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${product.title} - ${dict?.fossils?.viewDetails || "Miniature"} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte de localisation ultra améliorée - RESPONSIVE COMPACTE */}
          <Card className="border-0 shadow-xl lg:shadow-2xl bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30 backdrop-blur-sm hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500 group">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl lg:rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-white" />
                </div>
                <span className="truncate text-sm sm:text-base lg:text-lg">
                  {dict?.fossils?.origin || "Origine du fossile"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <ProductLocationMap
                locality={product.locality}
                height={280}
                showAllLocalities={true}
                className="rounded-xl lg:rounded-2xl shadow-inner border border-slate-200"
              />
            </CardContent>
          </Card>
        </div>

        {/* Informations produit réorganisées - RESPONSIVE */}
        <div className="space-y-4 sm:space-y-6 order-2">
          {/* Card principale réorganisée - RESPONSIVE */}
          <Card className="border-0 shadow-xl lg:shadow-2xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 backdrop-blur-sm hover:shadow-2xl lg:hover:shadow-3xl transition-shadow duration-500">
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-10">
              {/* En-tête avec titre et prix - RESPONSIVE STACK */}
              <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-amber-700 bg-clip-text text-transparent leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm"
                    >
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Prix et badge - RESPONSIVE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 bg-amber-50 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold self-start sm:self-auto"
                  >
                    {dict?.products?.fixedPrice || "Prix fixe"}
                  </Badge>
                </div>
              </div>

              {/* Genre et Espèce - RESPONSIVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                    {dict?.fossils?.genus || "Genre"}
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base truncate">
                    {product.genre ||
                      dict?.fossilRequests?.notSpecified ||
                      "Non spécifié"}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                    {dict?.fossils?.species || "Espèce"}
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base truncate">
                    {product.species}
                  </p>
                </div>
              </div>

              {/* Rating avec design premium - RESPONSIVE */}
              <div className="mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-slate-50 via-white to-amber-50 rounded-xl lg:rounded-2xl border border-slate-200 shadow-inner">
                <RatingDisplay
                  productId={product.id}
                  stats={ratingStats}
                  userRating={userRating || undefined}
                  showForm={true}
                  dict={dict}
                />
              </div>

              <Separator className="my-4 sm:my-6 lg:my-8 bg-gradient-to-r from-transparent via-slate-300 to-transparent h-px" />

              {/* Boutons d'action ultra premium - RESPONSIVE */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-8">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white font-bold py-3 sm:py-4 rounded-xl lg:rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group text-sm sm:text-base h-11 sm:h-12 lg:h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isAdding
                    ? dict?.products?.adding || "Ajout..."
                    : dict?.products?.addToCart || "Ajouter au panier"}
                </Button>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* ✅ Remplacé par le vrai composant FavoriteButton */}
                  <div className="flex justify-center">
                    <FavoriteButton
                      productId={product.id}
                      isFavorite={product.isFavorite || false}
                      variant="default"
                      size="lg"
                      dict={dict}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 sm:h-12 lg:h-14 border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg lg:hover:shadow-xl group text-xs sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 group-hover:text-blue-600 transition-colors duration-300" />
                    <span className="font-semibold hidden sm:inline">
                      {dict?.products?.share || "Partager"}
                    </span>
                    <span className="font-semibold sm:hidden">↗</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations détaillées - RESPONSIVE COMPACTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Pays d'origine */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl lg:rounded-2xl border-2 border-orange-200/50 hover:shadow-lg lg:hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-shadow duration-300 flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  {dict?.fossils?.countryLabel || "Origine"}
                </p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base xl:text-lg truncate">
                  {dict?.countries?.[product.countryOfOrigin] ||
                    product.countryOfOrigin}
                </p>
              </div>
            </div>

            {/* Étage géologique */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-xl lg:rounded-2xl border-2 border-purple-200/50 hover:shadow-lg lg:hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-shadow duration-300 flex-shrink-0">
                <Mountain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  {dict?.fossils?.stageLabel || "Étage géologique"}
                </p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base xl:text-lg truncate">
                  {product.geologicalStage ||
                    dict?.fossilRequests?.notSpecified ||
                    "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Localité */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl lg:rounded-2xl border-2 border-green-200/50 hover:shadow-lg lg:hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-shadow duration-300 flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  {dict?.fossils?.localityLabel || "Localité"}
                </p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base xl:text-lg truncate">
                  {product.locality?.name ||
                    dict?.fossilRequests?.notSpecified ||
                    "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Période géologique */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-xl lg:rounded-2xl border-2 border-blue-200/50 hover:shadow-lg lg:hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-shadow duration-300 flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                  {dict?.fossils?.periodLabel || "Période"}
                </p>
                <p className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base xl:text-lg truncate">
                  {product.geologicalPeriod}
                </p>
              </div>
            </div>
          </div>

          {/* Description avec design moderne - RESPONSIVE */}
          {(product.description || product.description2) && (
            <Card className="border-0 shadow-xl lg:shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm hover:shadow-2xl lg:hover:shadow-3xl transition-shadow duration-500">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-white" />
                  </div>
                  <span className="truncate text-sm sm:text-base lg:text-lg">
                    {dict?.products?.description || "Description"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg font-medium bg-gradient-to-r from-slate-50 to-white p-3 sm:p-4 lg:p-6 rounded-xl border border-slate-200">
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
