"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductStatus } from "@/lib/generated/prisma";
import { Eye, Edit, Trash2, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { SerializedProduct } from "@/types/type";
import { useUserStore } from "@/stores/userStore";
import { FavoriteButton } from "../product/favoriteButton";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useHandleAddToCart } from "@/hooks/useHandleAddToCart";
import { deleteProductAction } from "@/lib/actions/productActions";

interface FossilCardProps {
  fossil: SerializedProduct;
  lang: "fr" | "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
}

export function FossilCard({ fossil, lang, dict }: FossilCardProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();

  const isAdmin = useUserStore((s) => s.isAdmin());
  const user = useUserStore((s) => s.user);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      TRILOBITE: "bg-cyan-900/40 text-cyan-300 border border-cyan-700/30",
      AMMONITE:
        "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30",
      DENT: "bg-red-900/40 text-red-300 border border-red-700/30",
      COQUILLAGE: "bg-amber-900/40 text-amber-300 border border-amber-700/30",
    };
    return (
      colors[category] ?? "bg-zinc-800 text-zinc-300 border border-zinc-700"
    );
  };

  const isAvailable = fossil.status === ProductStatus.AVAILABLE;
  const { handleAddToCart, isAdding } = useHandleAddToCart();

  const handleDelete = async (productId: number) => {
    if (!isAdmin) return;

    setDeletingId(productId);

    try {
      const result = await deleteProductAction(productId);

      if (result.success) {
        toast.success(
          dict?.fossils?.deleteSuccess ||
            `${result.data?.productTitle || "Produit"} supprimé avec succès`,
        );
        router.refresh();
      } else {
        toast.error(
          result.error ||
            dict?.fossils?.deleteError ||
            "Erreur lors de la suppression",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        dict?.fossils?.deleteError || "Erreur lors de la suppression",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="group flex flex-col h-full bg-zinc-950 border border-zinc-800 hover:border-zinc-500 overflow-hidden rounded-xl transition-all duration-300">
      <CardHeader className="p-0 relative shrink-0">
        <Link href={`/${lang}/fossiles/${fossil.id}`} className="block">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            {fossil.images?.[0] ? (
              <Image
                src={fossil.images[0].imageUrl}
                alt={fossil.images[0].altText || fossil.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-zinc-600 font-serif text-sm">
                  {dict?.fossils?.noImage || "Pas d'image"}
                </span>
              </div>
            )}

            {/* Overlay gradient pour que les badges / boutons lisent bien */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </Link>

        {/* Bouton favori */}
        <div className="absolute top-3 left-3 z-10">
          <FavoriteButton
            productId={fossil.id}
            isFavorite={fossil.isFavorite || false}
            variant="overlay"
            size="sm"
            dict={dict}
          />
        </div>

        {/* Badges Admin */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              asChild
              size="icon"
              className="h-8 w-8 bg-zinc-900/80 hover:bg-white text-zinc-300 hover:text-zinc-900 border border-zinc-700 hover:border-white shadow-sm transition-colors rounded-lg backdrop-blur-sm"
            >
              <Link href={`/${lang}/fossiles/${fossil.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  className="h-8 w-8 bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 shadow-sm transition-colors rounded-lg backdrop-blur-sm"
                  disabled={deletingId === fossil.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-100 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    {dict?.fossils?.deleteTitle || "Confirmer la suppression"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    {dict?.fossils?.deleteDescription
                      ? dict.fossils.deleteDescription.replace(
                          "{title}",
                          fossil.title,
                        )
                      : `Êtes-vous sûr de vouloir supprimer le fossile "${fossil.title}" ? Cette action est irréversible.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white">
                    {dict?.fossils?.deleteCancel || "Annuler"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(fossil.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {dict?.fossils?.deleteConfirm || "Supprimer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="font-serif font-semibold text-base sm:text-lg leading-tight mb-1 line-clamp-2 text-[var(--parchemin)] group-hover:text-[var(--parchemin)] tracking-wide">
            {fossil.title}
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-[var(--terracotta)] drop-shadow-sm">
            {formatPrice(fossil.price)}
          </p>
        </div>

        {fossil.genre && fossil.species && (
          <p className="text-xs sm:text-sm text-[var(--parchemin)]/50 italic mb-3 line-clamp-1 font-light tracking-wide">
            <span className="capitalize">{fossil.genre.toLowerCase()}</span>{" "}
            <span className="capitalize">{fossil.species.toLowerCase()}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
          <Badge
            variant="secondary"
            className={`text-xs ${getCategoryColor(fossil.category)} font-medium`}
          >
            {fossil.category}
          </Badge>

          {fossil.countryOfOrigin && (
            <Badge
              variant="outline"
              className="text-xs border-[var(--parchemin)]/20 text-[var(--parchemin)]/70"
            >
              📍 {fossil.countryOfOrigin}
            </Badge>
          )}

          <Badge
            variant="outline"
            className="text-xs border-[var(--terracotta)]/30 text-[var(--terracotta)]/80"
          >
            ⏳ {fossil.geologicalPeriod}
          </Badge>
        </div>

        <div className="text-xs text-[var(--parchemin)]/50 space-y-1 font-light">
          {fossil.locality && (
            <p className="line-clamp-1">
              <span className="font-medium text-[var(--parchemin)]/70">
                {dict?.fossils?.localityLabel || "Localité"}:
              </span>{" "}
              {fossil.locality.name}
            </p>
          )}
          {fossil.geologicalStage && (
            <p className="line-clamp-1">
              <span className="font-medium text-[var(--parchemin)]/70">
                {dict?.fossils?.stageLabel || "Étage"}:
              </span>{" "}
              {fossil.geologicalStage}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2 sm:gap-3">
        <div className="flex flex-col gap-2 sm:gap-3 w-full">
          <Button
            onClick={() => handleAddToCart(fossil)}
            size="default"
            disabled={isAdding || !isAvailable}
            className="w-full bg-transparent border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-parchemin font-bold text-sm sm:text-base py-5 shadow-lg transition-all duration-300 rounded-xl uppercase tracking-wider group/btn"
          >
            <span className="relative z-10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
              {dict?.products?.cart || "Ajouter au panier"}
            </span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-[var(--parchemin)]/70 hover:text-[var(--terracotta)] hover:bg-[var(--terracotta)]/5 transition-colors duration-200 text-xs sm:text-sm font-medium"
          >
            <Link href={`/${lang}/fossiles/${fossil.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              {dict?.fossils?.viewDetails || "Voir les détails"}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
