"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  CreditCard,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItem } from "./cart-item";
import { useCartStore } from "@/stores/cart-store";
import { clearCartAction } from "@/lib/actions/cart-actions";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export function CartSidebar({ isOpen, onClose, dict }: CartSidebarProps) {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleClearCart = async () => {
    clearCart(); // Optimistic update côté UI
    const result = await clearCartAction();
    if (result?.success) {
      toast.success(dict.cartSidebar.clearedSuccess);
    } else {
      toast.error(result?.error || dict.cartSidebar.clearedError);
    }
  };

  const handleCheckout = (): void => {
    if (!items.length) return;
    onClose();
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50 border-l border-slate-200/80">
        {/* Header premium avec gradient - RÉDUIT */}
        <SheetHeader className="pb-4 border-b border-slate-200/50 flex-shrink-0">
          <div className="relative">
            {/* Background gradient subtle */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-lg opacity-50" />

            <SheetTitle className="relative flex items-center justify-between gap-2 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur-sm opacity-30" />
                  <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-800">
                    {dict.cartSidebar.title}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Paleolitho Collection
                  </span>
                </div>
              </div>

              {totalItems > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 font-bold px-2 py-1 text-xs"
                >
                  {totalItems} {dict.cartSidebar.itemLabel}
                  {totalItems > 1 ? dict.cartSidebar.itemPlural : ""}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {!items.length ? (
          /* État vide élégant - CENTRE AVEC PLUS D'ESPACE */
          <div className="flex flex-col items-center justify-center flex-1 py-8 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur-xl opacity-30" />
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-full shadow-lg">
                <ShoppingCart className="w-12 h-12 text-slate-400" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h3 className="font-bold text-lg text-slate-800 mb-2">
                {dict.cartSidebar.emptyTitle}
              </h3>
              <p className="text-slate-600 text-center leading-relaxed max-w-sm text-sm">
                {dict.cartSidebar.emptyDesc}
              </p>

              <Button
                onClick={onClose}
                className="mt-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Package className="w-4 h-4 mr-2" />
                {dict.cartSidebar.continueShopping}
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des items avec scroll personnalisé - MAXIMISÉ */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-3 py-4 px-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-in slide-in-from-right-4 duration-300"
                    >
                      <CartItem item={item} dict={dict} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Footer premium avec récapitulatif - RÉDUIT */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/50 p-4 space-y-4 flex-shrink-0">
              {/* Récapitulatif avec design moderne - COMPACT */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 space-y-2 border border-slate-200/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">
                    {dict.cartSidebar.subtotalLabel.replace(
                      "{count}",
                      totalItems
                    )}
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">
                    {dict.cartSidebar.shippingLabel}
                  </span>
                  <span className="text-green-600 font-semibold text-xs">
                    {dict.cartSidebar.shippingNextStep}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {dict.cartSidebar.totalLabel}
                  </span>
                  <span className="font-bold text-lg text-slate-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Boutons d'action premium - COMPACTS */}
              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group text-sm"
                  disabled={!items.length}
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <CreditCard className="w-4 h-4 mr-2" />
                  {dict.cartSidebar.checkoutButton}
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 rounded-lg py-2 font-semibold text-xs"
                  >
                    <Package className="w-3 h-3 mr-1" />
                    {dict.cartSidebar.continueShopping}
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="ghost"
                    className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 rounded-lg py-2 font-semibold border border-transparent text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {dict.cartSidebar.clearButton}
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
