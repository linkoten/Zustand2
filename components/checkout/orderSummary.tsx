"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { OrderSummaryProps } from "@/types/type";

export function OrderSummary({ cart }: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      TRILOBITE: "bg-blue-100 text-blue-800",
      AMMONITE: "bg-green-100 text-green-800",
      DENT: "bg-red-100 text-red-800",
      COQUILLAGE: "bg-yellow-100 text-yellow-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Frais de livraison (gratuite au-dessus de 100€)
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Articles */}
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Image miniature */}
              <div className="w-16 h-16 flex-shrink-0">
                <AspectRatio
                  ratio={1}
                  className="bg-muted rounded overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <span className="text-lg">🦕</span>
                  </div>
                </AspectRatio>
              </div>

              {/* Informations */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {item.product.title}
                </h4>

                <Badge
                  variant="secondary"
                  className={`text-xs mb-1 ${getCategoryColor(
                    item.product.category
                  )}`}
                >
                  {item.product.category}
                </Badge>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Quantité: {item.quantity}
                  </span>
                  <span className="font-medium text-sm">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Calculs */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sous-total ({totalItems} articles)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Livraison</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-green-600 font-medium">Gratuite</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>

          {subtotal < 100 && (
            <div className="text-xs text-muted-foreground">
              Livraison gratuite dès 100€ d&apos;achat
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
