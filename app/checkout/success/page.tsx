import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { clearCartAction } from "@/lib/actions/cart-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SuccessPageProps } from "@/types/type";

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  try {
    // Récupérer les détails de la session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Vider le panier après paiement réussi
      await clearCartAction();
    }

    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Commande confirmée !</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>
                  Merci pour votre commande ! Vous recevrez bientôt un email de
                  confirmation avec les détails de votre achat.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Numéro de commande :</span>
                    <p className="text-muted-foreground">{session_id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Montant :</span>
                    <p className="text-muted-foreground">
                      {session.amount_total
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(session.amount_total / 100)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link href="/fossiles">
                    Continuer les achats
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/commandes">Voir mes commandes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur récupération session:", error);
    redirect("/");
  }
}
