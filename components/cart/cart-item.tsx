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
            : `${item.title} retiré du panier`,
        );
      } else {
        toast.error(
          result.error ||
            dict.cartItem.removedError ||
            "Erreur lors de la suppression",
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
    <div className="group relative bg-zinc-950/80 rounded-2xl border border-zinc-800 hover:border-zinc-500 shadow-md hover:shadow-xl transition-all duration-300 p-4 overflow-hidden">
      {/* Background glow subtil au hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-2xl transition-all duration-500 pointer-events-none" />

      <div className="relative flex items-start gap-5">
        {/* Image du produit */}
        <div className="relative flex-shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-xl shadow-md border-2 border-zinc-700 group-hover:border-zinc-400 transition-all duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-zinc-900 rounded-xl shadow-inner flex items-center justify-center border-2 border-zinc-800">
              <Star className="w-6 h-6 text-zinc-600" />
            </div>
          )}

          {/* Badge catégorie */}
        </div>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="font-bold text-amber-200 font-serif tracking-wide leading-snug">
            {item.title}
          </h4>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
            <span className="text-xs text-zinc-400">unité</span>
            <span className="text-sm font-semibold text-amber-300">
              {formatPrice(item.price)}
            </span>
            <span className="text-zinc-500">×</span>
            <span className="text-sm font-bold text-cyan-200">
              {item.quantity}
            </span>
          </div>

          {/* Sous-total */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-zinc-400">=</span>
            <span className="text-base font-black text-amber-50">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>

        {/* Contrôles de quantité modernisés */}
        <div className="flex flex-col items-end gap-3">
          {/* Quantité */}
          <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden shadow-inner group/qty">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-8 h-8 p-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors duration-200 rounded-none",
                item.quantity <= 1 && "opacity-40 cursor-not-allowed hidden hover:bg-transparent hover:text-zinc-400",
              )}
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="w-10 text-center text-sm font-black text-amber-50 bg-black/20 py-1.5 border-x border-zinc-700">
              {item.quantity}
            </span>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 p-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors duration-200 rounded-none"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Bouton supprimer */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="w-8 h-8 p-0 text-red-400 border border-zinc-700 bg-zinc-900 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 rounded-lg shadow-sm"
          >
            <Trash2 className="w-4 h-4 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      {/* Barre de progression pour les articles multiples */}
      {item.quantity > 1 && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Quantité</span>
            <span className="text-cyan-300 font-bold">
              {item.quantity} article{item.quantity > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[var(--terracotta)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((item.quantity / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
