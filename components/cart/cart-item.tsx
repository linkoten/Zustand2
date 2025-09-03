"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    productId: number;
    title: string;
    price: number;
    quantity: number;
    category: string;
    product: {
      title: string;
      price: number;
      category: string;
    };
    imageUrl: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);

  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2">
      <div className="flex items-center gap-2">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-12 h-12 object-cover rounded"
          />
        )}
        <div>
          <div className="font-semibold">{item.title}</div>
          <div className="text-sm text-muted-foreground">
            {formatPrice(item.price)} x {item.quantity}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </Button>
        <span>{item.quantity}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
        >
          +
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => removeItem(item.productId)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
