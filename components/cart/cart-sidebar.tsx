"use client";

import { useEffect, useState } from "react";
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
import { getCartAction, clearCartAction } from "@/lib/actions/cart-actions";
import { CartItem } from "./cart-item";
import { CartSidebarProps } from "@/types/type";

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Charger le panier
  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await getCartAction();
      setCart(cartData);
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  // ✅ Fonction callback pour les enfants
  const handleCartUpdate = async () => {
    await loadCart();
  };

  const totalItems =
    cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ||
    0;
  const totalPrice =
    cart?.items?.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleClearCart = async () => {
    try {
      const result = await clearCartAction();
      if (result.success) {
        setCart({ items: [] });
        toast.success(`${result.data?.removedItems} articles supprimés`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erreur lors du vidage du panier");
    }
  };

  const handleCheckout = () => {
    if (!cart?.items?.length) return;
    onClose();
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier ({totalItems} article{totalItems > 1 ? "s" : ""})
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">Chargement...</div>
          </div>
        ) : !cart?.items?.length ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Votre panier est vide
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Ajoutez des fossiles pour commencer vos achats
            </p>
            <Button onClick={onClose} variant="outline">
              Continuer les achats
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.items.map((item: any) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdate={handleCartUpdate} // ✅ Passer la fonction callback
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span>Calculée à l'étape suivante</span>
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
                  disabled={!cart?.items?.length}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Procéder au paiement
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Continuer les achats
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="ghost"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider
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
