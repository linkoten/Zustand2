"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartIconButton({ onClick }: { onClick: () => void }) {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="relative group hover:bg-slate-100 rounded-xl transition-all duration-300 p-3 w-12 h-12" // ✅ Agrandi ici
      aria-label={`Panier (${totalItems} articles)`}
    >
      {/* Icon avec animation - taille augmentée */}
      <div>
        <ShoppingCart
          className={cn(
            "w-7 h-7 text-slate-700 group-hover:text-slate-900 transition-all duration-300", // ✅ w-7 h-7 au lieu de w-6 h-6
            totalItems > 0 && "group-hover:scale-110"
          )}
        />

        {/* Badge animé - position ajustée */}
        {totalItems > 0 && (
          <>
            {/* Glow effect */}
            <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-sm opacity-50 animate-pulse" />

            {/* Badge principal - légèrement plus grand */}
            <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg transform group-hover:scale-110 transition-transform duration-300 z-10">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          </>
        )}
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300" />
    </Button>
  );
}
