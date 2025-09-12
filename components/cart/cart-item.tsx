"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeCartItemAction } from "@/lib/actions/cart-actions";
import { syncCartWithDatabase } from "@/lib/cart-sync";
import { toast } from "sonner";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function CartItem({ item, dict }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const handleRemove = async () => {
    try {
      // 1. Supprimer de la base de données
      const result = await removeCartItemAction(item.id);

      if (result.success) {
        // 2. Synchroniser le store avec la BDD
        await syncCartWithDatabase();

        toast.success(
          dict.cartItem.removedSuccess
            ? dict.cartItem.removedSuccess.replace("{title}", item.title)
            : `${item.title} retiré du panier`
        );
      } else {
        toast.error(
          result.error ||
            dict.cartItem.removedError ||
            "Erreur lors de la suppression"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

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
        <Button size="icon" variant="ghost" onClick={handleRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
