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
import Image from "next/image";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb amélioré avec animation */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Link
            href={`/${lang}`}
            className="hover:text-amber-600 transition-all duration-200 hover:scale-105 font-medium"
          >
            {dict?.navbar?.home || "Accueil"}
          </Link>
          <span className="text-slate-400 font-light">/</span>
          <Link
            href={`/${lang}/fossiles`}
            className="hover:text-amber-600 transition-all duration-200 flex items-center group font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
            {dict?.navbar?.fossils || "Fossiles"}
          </Link>
          <span className="text-slate-400 font-light">/</span>
          <span className="text-slate-900 font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {product.title}
          </span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Section Images avec Lens ultra améliorée */}
        <div className="space-y-6">
          {/* Image principale avec lens */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-6">
              <div className="relative mb-4">
                <ImageLens
                  src={
                    product.images[selectedImageIndex]?.imageUrl ||
                    "/placeholder.jpg"
                  }
                  alt={`${product.title} - ${dict?.fossils?.viewDetails || "Vue"} ${selectedImageIndex + 1}`}
                  width={500}
                  height={500}
                  className="w-full rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  lensSize={150}
                  zoomLevel={3.5}
                />

                {/* Badges premium améliorés */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-black/80 backdrop-blur-sm text-white border-0 shadow-xl flex items-center gap-1 px-3 py-1.5">
                    <ZoomIn className="w-3 h-3" />
                    <span className="font-semibold">HD Zoom</span>
                  </Badge>
                  <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-xl px-3 py-1.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {selectedImageIndex + 1}/{product.images.length}
                  </Badge>
                </div>

                {/* Status badge animé premium */}
                <Badge
                  className={`absolute top-4 right-4 shadow-xl backdrop-blur-sm border-2 px-3 py-2 font-semibold ${
                    product.status === "AVAILABLE"
                      ? "bg-emerald-100/90 text-emerald-800 border-emerald-300 animate-pulse"
                      : "bg-red-100/90 text-red-800 border-red-300"
                  }`}
                  variant="outline"
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      product.status === "AVAILABLE"
                        ? "bg-emerald-500 animate-ping"
                        : "bg-red-500"
                    }`}
                  />
                  {product.status === "AVAILABLE"
                    ? dict?.products?.available || "Disponible"
                    : dict?.products?.sold || "Vendu"}
                </Badge>
              </div>

              {/* Miniatures ultra améliorées */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-slate-100">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-110 hover:rotate-1 ${
                        selectedImageIndex === index
                          ? "border-amber-500 ring-4 ring-amber-200 shadow-xl scale-105"
                          : "border-slate-200 hover:border-amber-300 hover:shadow-lg"
                      }`}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${product.title} - ${dict?.fossils?.viewDetails || "Miniature"} ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte de localisation ultra améliorée */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  {dict?.products?.provenance || "Provenance"}
                  <p className="text-sm text-slate-600 font-normal">
                    {dict?.fossils?.localityLabel || "Localité"}:{" "}
                    {product.locality?.name ||
                      dict?.fossilRequests?.notSpecified ||
                      "Non spécifiée"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs border-blue-300 text-blue-700 bg-blue-50 px-3 py-1"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {dict?.home?.geolocated || "Géolocalisé"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ProductLocationMap
                locality={product.locality}
                height={360}
                showAllLocalities={true}
                className="rounded-2xl shadow-inner border border-slate-200"
              />
            </CardContent>
          </Card>

          {/* Actions rapides ultra améliorées */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-14 border-2 border-amber-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:text-red-500 transition-colors duration-300" />
              <span className="font-semibold">
                {dict?.products?.addToFavorites || "Favoris"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-14 border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors duration-300" />
              <span className="font-semibold">
                {dict?.products?.share || "Partager"}
              </span>
            </Button>
          </div>
        </div>

        {/* Informations produit réorganisées */}
        <div className="space-y-6">
          {/* Card principale réorganisée */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-500">
            <CardContent className="p-10">
              {/* En-tête avec titre et prix */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-amber-700 bg-clip-text text-transparent mb-4 leading-tight">
                    {product.title}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 px-3 py-1.5 text-sm mb-4"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {product.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                    {formatPrice(product.price)}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 bg-amber-50 px-4 py-2 text-sm font-semibold"
                  >
                    {dict?.products?.fixedPrice || "Prix fixe"}
                  </Badge>
                </div>
              </div>

              {/* Genre et Espèce */}

              {/* Rating avec design premium */}
              <div className="mb-8 p-6 bg-gradient-to-r from-slate-50 via-white to-amber-50 rounded-2xl border border-slate-200 shadow-inner">
                <RatingDisplay
                  productId={product.id}
                  stats={ratingStats}
                  userRating={userRating || undefined}
                  showForm={true}
                  dict={dict}
                />
              </div>

              <Separator className="my-8 bg-gradient-to-r from-transparent via-slate-300 to-transparent h-px" />

              {/* 4 rectangles d'informations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {/* Période géologique */}
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-amber-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                      {dict?.fossils?.periodLabel || "Période"}
                    </p>
                    <p className="font-bold text-slate-800 text-xl">
                      {product.geologicalPeriod}
                    </p>
                  </div>
                </div>

                {/* Pays d'origine */}
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl border-2 border-blue-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                      {dict?.fossils?.countryLabel || "Origine"}
                    </p>
                    <p className="font-bold text-slate-800 text-xl">
                      {dict?.countries?.[product.countryOfOrigin] ||
                        product.countryOfOrigin}
                    </p>
                  </div>
                </div>
                {/* Étage géologique */}
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl border-2 border-purple-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <Mountain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                      {dict?.fossils?.stageLabel || "Étage géologique"}
                    </p>
                    <p className="font-bold text-slate-800 text-xl">
                      {product.geologicalStage ||
                        dict?.fossilRequests?.notSpecified ||
                        "Non spécifié"}
                    </p>
                  </div>
                </div>

                {/* Localité */}
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                      {dict?.fossils?.localityLabel || "Localité"}
                    </p>
                    <p className="font-bold text-slate-800 text-xl">
                      {product.locality?.name ||
                        dict?.fossilRequests?.notSpecified ||
                        "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton d'ajout au panier centré et moins large */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="w-3/4 h-16 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:via-amber-800 hover:to-orange-700 text-white font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-2xl"
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding || product.status !== "AVAILABLE"}
                >
                  <ShoppingCart className="w-7 h-7 mr-4" />
                  {isAdding
                    ? "⏳ " +
                      (dict?.products?.addingToCart || "Ajout en cours...")
                    : product.status !== "AVAILABLE"
                      ? "❌ " + (dict?.products?.sold || "Produit vendu")
                      : "🛒 " + (dict?.products?.cart || "Ajouter au panier")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description avec style ultra moderne */}
          {((lang === "fr" && product.description) ||
            (lang === "en" && product.description2)) && (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  {dict?.products?.description || "Description"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed text-lg font-medium bg-gradient-to-r from-slate-50 to-white p-6 rounded-xl border border-slate-200">
                    {lang === "en" ? product.description2 : product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Produits similaires avec animations premium */}
      {similarProducts.length > 0 && (
        <div className="mt-24">
          <Separator className="mb-16 bg-gradient-to-r from-transparent via-slate-300 to-transparent h-px" />
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-amber-700 bg-clip-text text-transparent mb-6">
              {dict?.products?.similarProducts || "Produits similaires"}
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
              {lang === "en"
                ? "Discover other specimens from the same period or region that might interest you"
                : "Découvrez d'autres spécimens de la même période ou région qui pourraient vous intéresser"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {similarProducts.slice(0, 4).map((similarProduct, index) => (
              <div
                key={similarProduct.id}
                className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-3 hover:rotate-1"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: "fadeInUp 0.8s ease-out forwards",
                }}
              >
                <div className="hover:shadow-2xl transition-shadow duration-500 rounded-2xl">
                  <ProductCard
                    product={similarProduct}
                    lang={lang}
                    dict={dict}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
