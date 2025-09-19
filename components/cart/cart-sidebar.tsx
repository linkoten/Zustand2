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
        {/* Header premium avec gradient */}
        <SheetHeader className="pb-6 border-b border-slate-200/50">
          <div className="relative">
            {/* Background gradient subtle */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-xl opacity-50" />

            <SheetTitle className="relative flex items-center justify-between gap-3 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur-sm opacity-30" />
                  <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-2.5 rounded-lg shadow-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-800">
                    {dict.cartSidebar.title}
                  </span>
                  <span className="text-sm text-slate-600 font-medium">
                    Paleolitho Collection
                  </span>
                </div>
              </div>

              {totalItems > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 font-bold px-3 py-1"
                >
                  {totalItems} {dict.cartSidebar.itemLabel}
                  {totalItems > 1 ? dict.cartSidebar.itemPlural : ""}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {!items.length ? (
          /* État vide élégant */
          <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full blur-xl opacity-30" />
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-8 rounded-full shadow-lg">
                <ShoppingCart className="w-16 h-16 text-slate-400" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="font-bold text-xl text-slate-800 mb-2">
                {dict.cartSidebar.emptyTitle}
              </h3>
              <p className="text-slate-600 text-center leading-relaxed max-w-sm">
                {dict.cartSidebar.emptyDesc}
              </p>

              <Button
                onClick={onClose}
                className="mt-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <Package className="w-5 h-5 mr-2" />
                {dict.cartSidebar.continueShopping}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des items avec scroll personnalisé */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ScrollArea className="h-full">
                <div className="space-y-4 py-6 px-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="animate-in slide-in-from-right-4 duration-500"
                    >
                      <CartItem item={item} dict={dict} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Footer premium avec récapitulatif */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/50 p-6 space-y-6">
              {/* Récapitulatif avec design moderne */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 space-y-3 border border-slate-200/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">
                    {dict.cartSidebar.subtotalLabel.replace(
                      "{count}",
                      totalItems
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">
                    {dict.cartSidebar.shippingLabel}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {dict.cartSidebar.shippingNextStep}
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {dict.cartSidebar.totalLabel}
                  </span>
                  <span className="font-bold text-xl text-slate-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Boutons d'action premium */}
              <SheetFooter className="flex-col gap-3 sm:flex-col">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                  size="lg"
                  disabled={!items.length}
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <CreditCard className="w-5 h-5 mr-3" />
                  {dict.cartSidebar.checkoutButton}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 rounded-xl py-3 font-semibold"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    {dict.cartSidebar.continueShopping}
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="ghost"
                    className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 rounded-xl py-3 font-semibold border border-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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
