"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

interface CartItemProps {
  item: {
    id: string;
    productId: number;
    title: string;
    price: number;
    quantity: number;
    category: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

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
        <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h4>

        <Badge
          variant="secondary"
          className={`text-xs mb-2 ${getCategoryColor(item.category)}`}
        >
          {item.category}
        </Badge>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{formatPrice(item.price)}</div>

          {/* Contrôles quantité */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
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
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-6 h-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeItem(item.productId)}
              className="w-6 h-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Prix total pour cet item */}
        {item.quantity > 1 && (
          <div className="text-xs text-muted-foreground mt-1">
            Total: {formatPrice(item.price * item.quantity)}
          </div>
        )}
      </div>
    </div>
  );
}
