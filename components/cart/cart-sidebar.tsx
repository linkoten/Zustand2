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
import { ShoppingCart, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem } from "./cart-item";
import { useCartStore } from "@/stores/cart-store";

export function CartSidebar() {
  const router = useRouter();
  const { items, isOpen, closeCart, totalItems, totalPrice, clearCart } =
    useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    closeCart();
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier ({totalItems} article{totalItems > 1 ? "s" : ""})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Votre panier est vide
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Ajoutez des fossiles pour commencer vos achats
            </p>
            <Button onClick={closeCart} variant="outline">
              Continuer les achats
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator />

              {/* Résumé */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span>Calculée à l&apos;étape suivante</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Procéder au paiement
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={closeCart}
                    variant="outline"
                    className="flex-1"
                  >
                    Continuer les achats
                  </Button>

                  <Button
                    onClick={clearCart}
                    variant="ghost"
                    className="flex-1"
                  >
                    Vider le panier
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
