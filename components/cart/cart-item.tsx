"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, Star } from "lucide-react";
import { removeCartItemAction } from "@/lib/actions/cart-actions";
import { syncCartWithDatabase } from "@/lib/cart-sync";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 p-4 overflow-hidden">
      {/* Background gradient subtil au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 via-orange-50/0 to-red-50/0 group-hover:from-amber-50/30 group-hover:via-orange-50/20 group-hover:to-red-50/30 rounded-2xl transition-all duration-500" />

      <div className="relative flex items-center gap-4">
        {/* Image du produit avec effet premium */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="relative w-16 h-16 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white"
            />
          ) : (
            <div className="relative w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-md flex items-center justify-center border-2 border-white">
              <Star className="w-6 h-6 text-slate-400" />
            </div>
          )}

          {/* Badge catégorie */}
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 font-semibold px-2 py-0.5"
          >
            {item.category}
          </Badge>
        </div>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors duration-300">
            {item.title}
          </h4>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-slate-600">
              {formatPrice(item.price)}
            </span>
            <span className="text-xs text-slate-400">×</span>
            <span className="text-sm font-medium text-slate-700">
              {item.quantity}
            </span>
          </div>

          {/* Sous-total */}
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              = {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>

        {/* Contrôles de quantité modernisés */}
        <div className="flex flex-col items-end gap-3">
          {/* Quantité */}
          <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-8 h-8 p-0 hover:bg-slate-100 transition-colors duration-200 rounded-none",
                item.quantity <= 1 && "opacity-50 cursor-not-allowed"
              )}
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="w-10 text-center text-sm font-bold text-slate-800 bg-white py-1.5 border-x border-slate-200">
              {item.quantity}
            </span>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors duration-200 rounded-none"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Bouton supprimer */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="w-8 h-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-lg group/delete"
          >
            <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      {/* Barre de progression pour les articles multiples */}
      {item.quantity > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Quantité</span>
            <span>
              {item.quantity} article{item.quantity > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((item.quantity / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
