import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { clearCartAction } from "@/lib/actions/cart-actions";

interface ReturnPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutReturnPage({
  searchParams,
}: ReturnPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });

    const { status, customer_details } = session;
    const customerEmail = customer_details?.email;

    // Rediriger si la session est toujours ouverte
    if (status === "open") {
      redirect("/checkout");
    }

    // Paiement réussi
    if (status === "complete") {
      // Vider le panier après paiement réussi
      await clearCartAction();

      return (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  Paiement réussi !
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">
                    Merci pour votre commande ! Nous apprécions votre confiance.
                  </p>
                  <p>
                    Un email de confirmation a été envoyé à{" "}
                    <span className="font-medium text-foreground">
                      {customerEmail}
                    </span>
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Numéro de commande :</span>
                      <p className="text-muted-foreground font-mono text-xs">
                        {session_id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Montant total :</span>
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

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Si vous avez des questions, contactez-nous à{" "}
                    <a
                      href="mailto:support@votre-site.com"
                      className="font-medium text-primary hover:underline"
                    >
                      support@votre-site.com
                    </a>
                  </p>
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
    }

    // Autres statuts (expired, etc.)
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Session expirée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>
                  Votre session de paiement a expiré. Veuillez recommencer votre
                  commande.
                </p>
              </div>

              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/checkout">Recommencer le paiement</Link>
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
