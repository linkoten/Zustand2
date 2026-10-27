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
    <div className="group relative bg-[var(--silex)] rounded-2xl border border-[var(--parchemin)]/10 hover:border-[var(--terracotta)]/50 shadow-md hover:shadow-xl hover:shadow-black/30 transition-all duration-300 p-4 overflow-hidden">
      {/* Background glow subtil au hover */}
      <div className="absolute inset-0 bg-[var(--terracotta)]/0 group-hover:bg-[var(--terracotta)]/5 rounded-2xl transition-all duration-500 pointer-events-none" />

      <div className="relative flex items-start gap-5">
        {/* Image du produit */}
        <div className="relative flex-shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-xl shadow-md border-2 border-[var(--parchemin)]/20 group-hover:border-[var(--terracotta)]/60 transition-all duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-[var(--silex)] rounded-xl shadow-inner flex items-center justify-center border-2 border-[var(--parchemin)]/15">
              <Star className="w-6 h-6 text-[var(--parchemin)]/40" />
            </div>
          )}

          {/* Badge catégorie */}
        </div>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="font-bold text-[var(--parchemin)] font-serif tracking-wide leading-snug">
            {item.title}
          </h4>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
            <span className="text-xs text-[var(--parchemin)]/60">unité</span>
            <span className="text-sm font-semibold text-[var(--terracotta)]">
              {formatPrice(item.price)}
            </span>
            <span className="text-[var(--parchemin)]/40">×</span>
            <span className="text-sm font-bold text-[var(--parchemin)]">
              {item.quantity}
            </span>
          </div>

          {/* Sous-total */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-[var(--parchemin)]/60">=</span>
            <span className="text-base font-black text-[var(--terracotta)]">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>

        {/* Contrôles de quantité modernisés */}
        <div className="flex flex-col items-end gap-3">
          {/* Quantité */}
          <div className="flex items-center bg-[var(--silex)] rounded-xl border border-[var(--parchemin)]/20 overflow-hidden shadow-inner group/qty">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-8 h-8 p-0 text-[var(--parchemin)]/70 hover:text-[var(--silex)] hover:bg-[var(--terracotta)] transition-colors duration-200 rounded-none cursor-pointer",
                item.quantity <= 1 && "opacity-40 cursor-not-allowed hidden hover:bg-transparent hover:text-[var(--parchemin)]/70",
              )}
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="w-10 text-center text-sm font-black text-[var(--parchemin)] bg-black/20 py-1.5 border-x border-[var(--parchemin)]/20">
              {item.quantity}
            </span>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 p-0 text-[var(--parchemin)]/70 hover:text-[var(--silex)] hover:bg-[var(--terracotta)] transition-colors duration-200 rounded-none cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Bouton supprimer */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="w-8 h-8 p-0 text-red-400 border border-[var(--parchemin)]/20 bg-[var(--silex)] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 rounded-lg shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      {/* Barre de progression pour les articles multiples */}
      {item.quantity > 1 && (
        <div className="mt-3 pt-3 border-t border-[var(--parchemin)]/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--parchemin)]/60">Quantité</span>
            <span className="text-[var(--terracotta)] font-bold">
              {item.quantity} article{item.quantity > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 w-full bg-[var(--parchemin)]/10 rounded-full h-1.5 overflow-hidden">
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
