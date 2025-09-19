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
import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
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
import { deleteProductAction } from "@/lib/actions/productActions"; // ✅ Import depuis productActions

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
  console.log("user in FossilCard", user, "isAdmin", isAdmin);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      TRILOBITE: "bg-blue-100 text-blue-800",
      AMMONITE: "bg-green-100 text-green-800",
      DENT: "bg-red-100 text-red-800",
      COQUILLAGE: "bg-yellow-100 text-yellow-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const isAvailable = fossil.status === ProductStatus.AVAILABLE;

  const { handleAddToCart, isAdding } = useHandleAddToCart();

  const handleDelete = async (productId: number) => {
    if (!isAdmin) return;

    setDeletingId(productId);

    try {
      // ✅ Utiliser la server action au lieu de fetch
      const result = await deleteProductAction(productId);

      if (result.success) {
        toast.success(
          dict?.fossils?.deleteSuccess ||
            `${result.data?.productTitle || "Produit"} supprimé avec succès`
        );
        router.refresh(); // Optionnel car revalidatePath est déjà dans l'action
      } else {
        // ✅ Gestion d'erreur simplifiée
        toast.error(
          result.error ||
            dict?.fossils?.deleteError ||
            "Erreur lors de la suppression"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        dict?.fossils?.deleteError || "Erreur lors de la suppression"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {fossil.images?.[0] ? (
            <Image
              src={fossil.images[0].imageUrl}
              alt={fossil.images[0].altText || fossil.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">
                {dict?.fossils?.noImage || "Pas d'image"}
              </span>
            </div>
          )}

          {/* ✅ Bouton favori en overlay (top-left) */}
          <div className="absolute top-2 left-2">
            <FavoriteButton
              productId={fossil.id}
              isFavorite={fossil.isFavorite || false}
              variant="overlay"
              size="sm"
              dict={dict}
            />
          </div>

          {/* Boutons admin en overlay (top-right) */}
          {isAdmin && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                >
                  <Link href={`/${lang}/fossiles/${fossil.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === fossil.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {dict?.fossils?.deleteTitle ||
                          "Confirmer la suppression"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {dict?.fossils?.deleteDescription
                          ? dict.fossils.deleteDescription.replace(
                              "{title}",
                              fossil.title
                            )
                          : `Êtes-vous sûr de vouloir supprimer le fossile "${fossil.title}" ? Cette action est irréversible.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {dict?.fossils?.deleteCancel || "Annuler"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(fossil.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {dict?.fossils?.deleteConfirm || "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">
            {fossil.title}
          </h3>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(fossil.price)}
          </p>
        </div>

        {fossil.genre && fossil.species && (
          <p className="text-sm text-muted-foreground italic mb-3">
            <span className="capitalize">{fossil.genre.toLowerCase()}</span>{" "}
            <span className="capitalize">{fossil.species.toLowerCase()}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            variant="secondary"
            className={`text-xs ${getCategoryColor(fossil.category)}`}
          >
            {fossil.category}
          </Badge>

          {fossil.countryOfOrigin && (
            <Badge variant="outline" className="text-xs">
              📍 {fossil.countryOfOrigin}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs">
            ⏳ {fossil.geologicalPeriod}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          {fossil.locality && (
            <p>
              <span className="font-medium">
                {dict?.fossils?.localityLabel || "Localité"}:
              </span>{" "}
              {fossil.locality.name}
            </p>
          )}
          {fossil.geologicalStage && (
            <p>
              <span className="font-medium">
                {dict?.fossils?.stageLabel || "Étage"}:
              </span>{" "}
              {fossil.geologicalStage}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/${lang}/fossiles/${fossil.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            {dict?.fossils?.viewDetails || "Voir détails"}
          </Link>
        </Button>

        <Button
          onClick={() => handleAddToCart(fossil)}
          size="lg"
          disabled={isAdding || !isAvailable}
        >
          {dict?.products?.cart || "Ajouter"}
        </Button>
      </CardFooter>
    </Card>
  );
}
