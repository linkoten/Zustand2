import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Commande annulée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p>
                Votre commande a été annulée. Aucun paiement n'a été effectué.
                Vos articles sont toujours dans votre panier.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <Link href="/fossiles">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux fossiles
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/checkout">Réessayer le paiement</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
