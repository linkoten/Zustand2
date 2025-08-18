"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import CheckoutComponent from "@/components/checkout/checkout";
import { CountrySelector } from "@/components/checkout/country-selector";
import { estimateFossilWeight } from "@/lib/config/shipping-zones";

export default function CheckoutPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger le panier côté client
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await getCartAction();

        if (!cartData || !cartData.items.length) {
          redirect("/fossiles");
          return;
        }

        setCart(cartData);
      } catch (error) {
        console.error("Erreur chargement panier:", error);
        redirect("/fossiles");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    redirect("/fossiles");
    return null;
  }

  // Calculer le sous-total et le poids
  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );

  const totalWeight = cart.items.reduce((weight: number, item: any) => {
    const itemWeight = estimateFossilWeight(
      item.product.category,
      item.product.price
    );
    return weight + itemWeight * item.quantity;
  }, 0);

  const handleCountrySelected = (country: string) => {
    setSelectedCountry(country);
  };

  const handleBackToCountrySelection = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedCountry ? (
        // ✅ ÉTAPE 1: Sélection du pays
        <CountrySelector
          subtotal={subtotal}
          totalWeight={totalWeight}
          onCountrySelected={handleCountrySelected}
        />
      ) : (
        // ✅ ÉTAPE 2: Checkout Stripe existant avec pays sélectionné
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* En-tête avec pays sélectionné */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Finaliser votre commande
                  </h2>
                  <p className="text-gray-600">
                    Livraison vers :{" "}
                    <strong>
                      {cart.countryGroups
                        ?.flatMap((g: any) => g.countries)
                        .find((c: any) => c.code === selectedCountry)?.name ||
                        selectedCountry}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={handleBackToCountrySelection}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Changer de pays
                </button>
              </div>
            </div>

            {/* Votre composant CheckoutComponent existant */}
            <CheckoutComponent selectedCountry={selectedCountry} />
          </div>
        </div>
      )}
    </div>
  );
}
