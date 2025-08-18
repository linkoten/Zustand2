"use client";

import { useState, useCallback } from "react";
import { fetchClientSecret } from "@/lib/actions/stripe";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

type CheckoutState = "loading" | "ready" | "error";

export default function CheckoutComponent() {
  const [state, setState] = useState<CheckoutState>("loading");
  const [error, setError] = useState<string | null>(null);

  // ✅ Utiliser useCallback pour optimiser les performances
  const handleFetchClientSecret = useCallback(async (): Promise<string> => {
    try {
      setState("loading");
      setError(null);

      const clientSecret = await fetchClientSecret();

      setState("ready");
      return clientSecret;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement du checkout";

      setError(errorMessage);
      setState("error");
      toast.error(errorMessage);

      throw new Error(errorMessage);
    }
  }, []);

  const handleRetry = () => {
    setError(null);
    setState("loading");
    // Le composant EmbeddedCheckout va automatiquement rappeler fetchClientSecret
  };

  if (state === "error" && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetry} variant="default">
                Réessayer
              </Button>

              <Button asChild variant="outline">
                <Link href="/fossiles">Retour aux fossiles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <CreditCard className="w-8 h-8" />
            Finaliser votre commande
          </h1>
          <p className="text-muted-foreground">
            Sécurisé par Stripe - Paiement par carte bancaire
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border min-h-[600px] relative">
          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Chargement du formulaire de paiement...
                </p>
              </div>
            </div>
          )}

          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret: handleFetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}
