"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ProductStatus } from "@/lib/generated/prisma";
import { ShoppingCart, Eye, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import Link from "next/link";
import { addToCartAction } from "@/lib/actions/cart-actions"; // ✅ Import Server Action
import { FossilCardProps } from "@/types/type";

export function FossilCard({ fossil }: FossilCardProps) {
  const [isPending, startTransition] = useTransition(); // ✅ Hook pour Server Actions

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig = {
      AVAILABLE: { label: "Disponible", variant: "default" as const },
      SOLD: { label: "Vendu", variant: "secondary" as const },
      INACTIVE: { label: "Inactif", variant: "outline" as const },
      RESERVED: { label: "Réservé", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  // ✅ Fonction avec Server Action
  const handleAddToCart = () => {
    if (!isAvailable || isPending) return;

    startTransition(async () => {
      try {
        const result = await addToCartAction(fossil.id);

        if (result.success) {
          toast.success(`${result.data?.productTitle} ajouté au panier !`, {
            icon: <CheckCircle className="w-4 h-4" />,
          });
        } else {
          toast.error(result.error || "Erreur lors de l'ajout");
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
        console.error("Erreur ajout panier:", error);
      }
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <AspectRatio
          ratio={4 / 3}
          className="bg-muted rounded-t-lg overflow-hidden"
        >
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🦕</div>
              <p className="text-sm font-medium">Photo bientôt disponible</p>
            </div>
          </div>
        </AspectRatio>

        <div className="absolute top-2 right-2">
          {getStatusBadge(fossil.status)}
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
              <span className="font-medium">Localité:</span> {fossil.locality}
            </p>
          )}
          {fossil.geologicalStage && (
            <p>
              <span className="font-medium">Étage:</span>{" "}
              {fossil.geologicalStage}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/fossiles/${fossil.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Voir détails
          </Link>
        </Button>

        <Button
          size="sm"
          disabled={!isAvailable || isPending}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          {isPending ? "Ajout..." : isAvailable ? "Ajouter" : "Indisponible"}
        </Button>
      </CardFooter>
    </Card>
  );
}
