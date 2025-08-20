"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, Layers } from "lucide-react";
import { SerializedProduct } from "@/types/type";
import { addToCartAction } from "@/lib/actions/cart-actions";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: SerializedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation

    try {
      setIsAddingToCart(true);

      const result = await addToCartAction(product.id);

      if (result.success) {
        toast.success(`${result.data?.productTitle} ajouté au panier !`);
      } else {
        toast.error(result.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      console.error("Erreur ajout panier:", error);
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ Utiliser la première image ou afficher un placeholder
  const firstImage = product.images?.[0];

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/fossiles/${product.id}`}>
        <CardContent className="p-0">
          {/* Image */}
          <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
            {firstImage ? (
              <Image
                src={firstImage.imageUrl}
                alt={firstImage.altText || product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Layers className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold line-clamp-2 text-sm">
                {product.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {product.species}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.countryOfOrigin}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.status !== "AVAILABLE"}
        >
          <ShoppingCart className="mr-2 h-3 w-3" />
          {isAddingToCart ? "Ajout..." : "Ajouter"}
        </Button>
      </CardFooter>
    </Card>
  );
}
