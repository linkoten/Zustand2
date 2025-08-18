import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, Globe } from "lucide-react";
import { SHIPPING_ZONES } from "@/lib/config/Shipping-zone";

export function ShippingInfo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Informations de livraison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(SHIPPING_ZONES).map(([key, zone]) => (
          <div key={key} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {zone.name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {/* ✅ Correction du problème de comparaison de types */}
                {zone.cost > 0 ? `${zone.cost.toFixed(2)}€` : "Gratuit"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Délai: {zone.estimatedDays}</span>
              </div>
              <div>
                Livraison gratuite à partir de{" "}
                <strong>{zone.freeShippingThreshold}€</strong>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {/* ✅ Conversion explicite pour éviter les erreurs de type */}
                {[...zone.countries].slice(0, 5).map((country) => (
                  <Badge key={country} variant="secondary" className="text-xs">
                    {country}
                  </Badge>
                ))}
                {zone.countries.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{zone.countries.length - 5} autres
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
