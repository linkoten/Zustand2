"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateCartItemQuantityAction,
  removeCartItemAction,
} from "@/lib/actions/cart-actions";
import { CartItemProps } from "@/types/type";

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [isPending, startTransition] = useTransition();

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

  // ✅ Mise à jour de la quantité avec Server Action
  const handleUpdateQuantity = (newQuantity: number) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await updateCartItemQuantityAction(item.id, newQuantity);

        if (result.success) {
          await onUpdate(); // Recharger le panier
          if (newQuantity === 0) {
            toast.success("Article supprimé du panier");
          }
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
        console.error("Erreur mise à jour quantité:", error);
      }
    });
  };

  // ✅ Suppression avec Server Action
  const handleRemove = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await removeCartItemAction(item.id);

        if (result.success) {
          await onUpdate(); // Recharger le panier
          toast.success(`${result.data?.productTitle} supprimé du panier`);
        } else {
          toast.error(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
        console.error("Erreur suppression:", error);
      }
    });
  };

  return (
    <div className="flex gap-4 p-3 border rounded-lg">
      {/* Image placeholder */}
      <div className="w-20 h-20 flex-shrink-0">
        <AspectRatio ratio={1} className="bg-muted rounded overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <span className="text-2xl">🦕</span>
          </div>
        </AspectRatio>
      </div>

      {/* Informations */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">
          {item.product.title}
        </h4>

        <Badge
          variant="secondary"
          className={`text-xs mb-2 ${getCategoryColor(item.product.category)}`}
        >
          {item.product.category}
        </Badge>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            {formatPrice(item.product.price)}
          </div>

          {/* Contrôles quantité */}
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isPending}
                  className="w-6 h-6 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>

                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(item.quantity + 1)}
                  disabled={isPending}
                  className="w-6 h-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="w-6 h-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Prix total pour cet item */}
        {item.quantity > 1 && (
          <div className="text-xs text-muted-foreground mt-1">
            Total: {formatPrice(item.product.price * item.quantity)}
          </div>
        )}
      </div>
    </div>
  );
}
