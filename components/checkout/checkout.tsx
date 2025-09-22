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
import { Loader2, AlertCircle, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

type CheckoutState = "loading" | "ready" | "error";

interface CheckoutComponentProps {
  selectedCountry?: string;
}

export default function CheckoutComponent({
  selectedCountry,
}: CheckoutComponentProps) {
  const [state, setState] = useState<CheckoutState>("loading");
  const [error, setError] = useState<string | null>(null);

  const handleFetchClientSecret = useCallback(async (): Promise<string> => {
    try {
      setState("loading");
      setError(null);

      const clientSecret = await fetchClientSecret(selectedCountry);

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
  }, [selectedCountry]);

  const handleRetry = () => {
    setError(null);
    setState("loading");
  };

  if (state === "error" && error) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
          <CardTitle className="text-center text-red-600 flex items-center justify-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <p className="text-slate-600 text-lg">{error}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Réessayer
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Link href="/fossiles">Retour aux fossiles</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Header de sécurité */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-6">
        <div className="flex items-center justify-center gap-3 text-emerald-800">
          <div className="p-2 bg-emerald-200 rounded-xl">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="font-semibold">Paiement sécurisé par Stripe</span>
          <div className="p-2 bg-emerald-200 rounded-xl">
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Zone de checkout avec overlay de chargement */}
      <div className="min-h-[600px] relative">
        {state === "loading" && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <Card className="border-0 bg-white shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Préparation du paiement
                </h3>
                <p className="text-slate-600">
                  Chargement du formulaire sécurisé...
                </p>
              </CardContent>
            </Card>
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
  );
}
