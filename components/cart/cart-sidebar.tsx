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
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-zinc-950 border-l border-zinc-800 p-0 text-zinc-100">
        {/* En-tête */}
        <SheetHeader className="p-5 border-b border-zinc-800 flex-shrink-0 bg-zinc-950">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg border border-zinc-200 shadow-sm">
                <ShoppingBag className="w-5 h-5 text-zinc-900" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-serif font-bold text-amber-50">
                  {dict.cartSidebar.title}
                </span>
                <span className="text-xs text-zinc-400">
                  Paleolitho Collection
                </span>
              </div>
            </div>

            {totalItems > 0 && (
              <Badge className="bg-white text-zinc-900 border border-zinc-200 px-3 py-1 font-bold shadow-sm">
                {totalItems} {dict.cartSidebar.itemLabel}
                {totalItems > 1 ? dict.cartSidebar.itemPlural : ""}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Corps du panier */}
        {!items.length ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-6">
            <div className="bg-zinc-900 p-6 rounded-full border border-zinc-800">
              <ShoppingCart className="w-12 h-12 text-zinc-600" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-xl text-amber-50">
                {dict.cartSidebar.emptyTitle}
              </h3>
              <p className="text-zinc-400 text-sm max-w-[250px] mx-auto">
                {dict.cartSidebar.emptyDesc}
              </p>
            </div>

            <Button
              onClick={onClose}
              className="bg-amber-100/10 text-amber-50 hover:bg-amber-100/20 border border-amber-100/20 px-8 py-6 uppercase tracking-wider text-sm font-bold transition-all"
            >
              <Package className="w-4 h-4 mr-2" />
              {dict.cartSidebar.continueShopping}
            </Button>
          </div>
        ) : (
          <>
            {/* Liste des items */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-5 space-y-4">
                  {items.map((item, index) => (
                    <CartItem key={item.id} item={item} dict={dict} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Récapitulatif et Boutons */}
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 flex-shrink-0 flex flex-col gap-5">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {dict.cartSidebar.shippingLabel}
                  </span>
                  <span className="text-emerald-400/90 font-medium">
                    {dict.cartSidebar.shippingNextStep}
                  </span>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-amber-100/70 flex items-center gap-2 uppercase tracking-widest">
                    {dict.cartSidebar.totalLabel}
                  </span>
                  <span className="text-3xl font-bold font-serif text-amber-50">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-transparent border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-parchemin py-6 text-base font-bold shadow-lg transition-colors"
                  disabled={!items.length}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {dict.cartSidebar.checkoutButton}
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 bg-silex border-parchemin/20 text-parchemin font-bold hover:text-terracotta hover:border-terracotta/50 hover:bg-terracotta/10 py-5 transition-colors"
                  >
                    {dict.cartSidebar.continueShopping}
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="flex-1 bg-silex border-parchemin/20 text-parchemin font-bold hover:text-red-400 hover:border-red-900/50 hover:bg-destructive/10 py-5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {dict.cartSidebar.clearButton}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
