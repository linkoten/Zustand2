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
import { ShoppingCart, CreditCard, Trash2 } from "lucide-react";
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
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {dict.cartSidebar.title}
            {` (${totalItems} ${dict.cartSidebar.itemLabel}${totalItems > 1 ? dict.cartSidebar.itemPlural : ""})`}
          </SheetTitle>
        </SheetHeader>

        {!items.length ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {dict.cartSidebar.emptyTitle}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {dict.cartSidebar.emptyDesc}
            </p>
            <Button onClick={onClose} variant="outline">
              {dict.cartSidebar.continueShopping}
            </Button>
          </div>
        ) : (
          <>
            {/* Scroll sur la liste des items */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ScrollArea className="h-full">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} dict={dict} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Footer fixé */}
            <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 pb-2 border-t z-10">
              <div className="space-y-2 px-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {dict.cartSidebar.subtotalLabel.replace(
                      "{count}",
                      totalItems
                    )}
                  </span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{dict.cartSidebar.shippingLabel}</span>
                  <span>{dict.cartSidebar.shippingNextStep}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{dict.cartSidebar.totalLabel}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col px-2 pt-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={!items.length}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {dict.cartSidebar.checkoutButton}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    {dict.cartSidebar.continueShopping}
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="ghost"
                    className="flex-1"
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
