"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import CheckoutComponent from "@/components/checkout/checkout";
import { CountrySelector } from "@/components/checkout/country-selector";
import { CartData, CartItemData } from "@/types/type";
import { getDictionary } from "../dictionaries";

// ✅ Données des pays pour l'affichage
// countryGroups utilise maintenant le nom dynamique depuis le dictionnaire
const countryGroups = [
  {
    zone: "FRANCE",
    countries: [{ code: "FR", flag: "🇫🇷" }],
  },
  {
    zone: "UNION EUROPÉENNE",
    countries: [
      { code: "AT", flag: "🇦🇹" },
      { code: "BE", flag: "🇧🇪" },
      { code: "BG", flag: "🇧🇬" },
      { code: "HR", flag: "🇭🇷" },
      { code: "CY", flag: "🇨🇾" },
      { code: "CZ", flag: "🇨🇿" },
      { code: "DK", flag: "🇩🇰" },
      { code: "EE", flag: "🇪🇪" },
      { code: "FI", flag: "🇫🇮" },
      { code: "DE", flag: "🇩🇪" },
      { code: "GR", flag: "🇬🇷" },
      { code: "HU", flag: "🇭🇺" },
      { code: "IE", flag: "🇮🇪" },
      { code: "IT", flag: "🇮🇹" },
      { code: "LV", flag: "🇱🇻" },
      { code: "LT", flag: "🇱🇹" },
      { code: "LU", flag: "🇱🇺" },
      { code: "MT", flag: "🇲🇹" },
      { code: "NL", flag: "🇳🇱" },
      { code: "PL", flag: "🇵🇱" },
      { code: "PT", flag: "🇵🇹" },
      { code: "RO", flag: "🇷🇴" },
      { code: "SK", flag: "🇸🇰" },
      { code: "SI", flag: "🇸🇮" },
      { code: "ES", flag: "🇪🇸" },
      { code: "SE", flag: "🇸🇪" },
    ],
  },
  {
    zone: "EUROPE ÉLARGIE",
    countries: [
      { code: "AD", flag: "🇦🇩" },
      { code: "AL", flag: "🇦🇱" },
      { code: "BA", flag: "🇧🇦" },
      { code: "BY", flag: "🇧🇾" },
      { code: "CH", flag: "🇨🇭" },
      { code: "FO", flag: "🇫🇴" },
      { code: "GB", flag: "🇬🇧" },
      { code: "GG", flag: "🇬🇬" },
      { code: "GI", flag: "🇬🇮" },
      { code: "GL", flag: "🇬🇱" },
      { code: "IM", flag: "🇮🇲" },
      { code: "IS", flag: "🇮🇸" },
      { code: "JE", flag: "🇯🇪" },
      { code: "LI", flag: "🇱🇮" },
      { code: "MC", flag: "🇲🇨" },
      { code: "MD", flag: "🇲🇩" },
      { code: "ME", flag: "🇲🇪" },
      { code: "MK", flag: "🇲🇰" },
      { code: "NO", flag: "🇳🇴" },
      { code: "RS", flag: "🇷🇸" },
      { code: "SM", flag: "🇸🇲" },
      { code: "UA", flag: "🇺🇦" },
      { code: "VA", flag: "🇻🇦" },
      { code: "XK", flag: "🇽🇰" },
    ],
  },
  {
    zone: "MAGHREB & MOYEN-ORIENT",
    countries: [
      { code: "DZ", flag: "🇩🇿" },
      { code: "MA", flag: "🇲🇦" },
      { code: "TN", flag: "🇹🇳" },
      { code: "AE", flag: "🇦🇪" },
      { code: "BH", flag: "🇧🇭" },
      { code: "IL", flag: "🇮🇱" },
      { code: "JO", flag: "🇯🇴" },
      { code: "KW", flag: "🇰🇼" },
      { code: "LB", flag: "🇱🇧" },
      { code: "OM", flag: "🇴🇲" },
      { code: "QA", flag: "🇶🇦" },
      { code: "SA", flag: "🇸🇦" },
      { code: "TR", flag: "🇹🇷" },
    ],
  },
  {
    zone: "AMÉRIQUE DU NORD",
    countries: [
      { code: "CA", flag: "🇨🇦" },
      { code: "MX", flag: "🇲🇽" },
      { code: "US", flag: "🇺🇸" },
    ],
  },
  {
    zone: "AMÉRIQUE CENTRALE & CARAÏBES",
    countries: [
      { code: "AG", flag: "🇦🇬" },
      { code: "BB", flag: "🇧🇧" },
      { code: "BZ", flag: "🇧🇿" },
      { code: "CR", flag: "🇨🇷" },
      { code: "DM", flag: "🇩🇲" },
      { code: "DO", flag: "🇩🇴" },
      { code: "GD", flag: "🇬🇩" },
      { code: "GT", flag: "🇬🇹" },
      { code: "HN", flag: "🇭🇳" },
      { code: "JM", flag: "🇯🇲" },
      { code: "KN", flag: "🇰🇳" },
      { code: "LC", flag: "🇱🇨" },
      { code: "NI", flag: "🇳🇮" },
      { code: "PA", flag: "🇵🇦" },
      { code: "SV", flag: "🇸🇻" },
      { code: "TT", flag: "🇹🇹" },
      { code: "VC", flag: "🇻🇨" },
    ],
  },
  {
    zone: "AMÉRIQUE DU SUD",
    countries: [
      { code: "AR", flag: "🇦🇷" },
      { code: "BO", flag: "🇧🇴" },
      { code: "BR", flag: "🇧🇷" },
      { code: "CL", flag: "🇨🇱" },
      { code: "CO", flag: "🇨🇴" },
      { code: "EC", flag: "🇪🇨" },
      { code: "GY", flag: "🇬🇾" },
      { code: "PY", flag: "🇵🇾" },
      { code: "PE", flag: "🇵🇪" },
      { code: "SR", flag: "🇸🇷" },
      { code: "UY", flag: "🇺🇾" },
      { code: "VE", flag: "🇻🇪" },
    ],
  },
  {
    zone: "ASIE-PACIFIQUE",
    countries: [
      { code: "AU", flag: "🇦🇺" },
      { code: "BD", flag: "🇧🇩" },
      { code: "BN", flag: "🇧🇳" },
      { code: "BT", flag: "🇧🇹" },
      { code: "CN", flag: "🇨🇳" },
      { code: "FJ", flag: "🇫🇯" },
      { code: "HK", flag: "🇭🇰" },
      { code: "ID", flag: "🇮🇩" },
      { code: "IN", flag: "🇮🇳" },
      { code: "JP", flag: "🇯🇵" },
      { code: "KH", flag: "🇰🇭" },
      { code: "KR", flag: "🇰🇷" },
      { code: "LA", flag: "🇱🇦" },
      { code: "LK", flag: "🇱🇰" },
      { code: "MO", flag: "🇲🇴" },
      { code: "MV", flag: "🇲🇻" },
      { code: "MY", flag: "🇲🇾" },
      { code: "NP", flag: "🇳🇵" },
      { code: "NZ", flag: "🇳🇿" },
      { code: "PH", flag: "🇵🇭" },
      { code: "PK", flag: "🇵🇰" },
      { code: "SG", flag: "🇸🇬" },
      { code: "TH", flag: "🇹🇭" },
      { code: "TW", flag: "🇹🇼" },
      { code: "VN", flag: "🇻🇳" },
    ],
  },
  {
    zone: "AFRIQUE",
    countries: [
      { code: "BW", flag: "🇧🇼" },
      { code: "CM", flag: "🇨🇲" },
      { code: "CI", flag: "🇨🇮" },
      { code: "EG", flag: "🇪🇬" },
      { code: "ET", flag: "🇪🇹" },
      { code: "GA", flag: "🇬🇦" },
      { code: "GH", flag: "🇬🇭" },
      { code: "KE", flag: "🇰🇪" },
      { code: "MG", flag: "🇲🇬" },
      { code: "MU", flag: "🇲🇺" },
      { code: "NG", flag: "🇳🇬" },
      { code: "RW", flag: "🇷🇼" },
      { code: "SC", flag: "🇸🇨" },
      { code: "SN", flag: "🇸🇳" },
      { code: "TZ", flag: "🇹🇿" },
      { code: "UG", flag: "🇺🇬" },
      { code: "ZA", flag: "🇿🇦" },
      { code: "ZM", flag: "🇿🇲" },
    ],
  },
];

export default function CheckoutPage({
  params,
}: {
  params: { lang: "en" | "fr" };
}) {
  const [dict, setDict] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le panier côté client
  useEffect(() => {
    const loadAll = async () => {
      const dictLoaded = await getDictionary(params.lang);
      setDict(dictLoaded);
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
    loadAll();
  }, [params.lang]);

  if (loading || !dict) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>{dict ? dict.checkout.loading : "..."}</p>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    redirect("/fossiles");
    return null;
  }

  // ✅ Calculer le sous-total et le poids avec les vrais poids des produits
  const subtotal = cart.items.reduce(
    (sum: number, item: CartItemData) =>
      sum + item.product.price * item.quantity,
    0
  );

  // ✅ Utiliser le poids réel des produits au lieu d'estimation
  const totalWeight = cart.items.reduce(
    (weight: number, item: CartItemData) => {
      return weight + item.product.weight * item.quantity; // ✅ Poids réel depuis la BDD
    },
    0
  );

  const handleCountrySelected = (country: string) => {
    setSelectedCountry(country);
  };

  const handleBackToCountrySelection = () => {
    setSelectedCountry(null);
  };

  // Fonction pour récupérer le nom du pays depuis le dictionnaire
  const getCountryName = (countryCode: string): string => {
    return dict.countries[countryCode] || countryCode;
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
                    {params.lang === "fr"
                      ? "Finaliser votre commande"
                      : "Complete your order"}
                  </h2>
                  <p className="text-gray-600">
                    {params.lang === "fr" ? "Livraison vers" : "Shipping to"} :{" "}
                    <strong>{getCountryName(selectedCountry)}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {params.lang === "fr" ? "Poids total" : "Total weight"} :{" "}
                    <strong>{totalWeight}g</strong>
                  </p>
                </div>
                <button
                  onClick={handleBackToCountrySelection}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {params.lang === "fr" ? "Changer de pays" : "Change country"}
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
