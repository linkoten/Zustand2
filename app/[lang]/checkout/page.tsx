"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import CheckoutComponent from "@/components/checkout/checkout";
import { CountrySelector } from "@/components/checkout/country-selector";
import { CartData, CartItemData } from "@/types/type"; // ✅ Importer les types existants

// ✅ Données des pays pour l'affichage
const countryGroups = [
  {
    zone: "FRANCE",
    countries: [{ code: "FR", name: "France", flag: "🇫🇷" }],
  },
  {
    zone: "UNION EUROPÉENNE",
    countries: [
      { code: "AT", name: "Autriche", flag: "🇦🇹" },
      { code: "BE", name: "Belgique", flag: "🇧🇪" },
      { code: "BG", name: "Bulgarie", flag: "🇧🇬" },
      { code: "HR", name: "Croatie", flag: "🇭🇷" },
      { code: "CY", name: "Chypre", flag: "🇨🇾" },
      { code: "CZ", name: "République tchèque", flag: "🇨🇿" },
      { code: "DK", name: "Danemark", flag: "🇩🇰" },
      { code: "EE", name: "Estonie", flag: "🇪🇪" },
      { code: "FI", name: "Finlande", flag: "🇫🇮" },
      { code: "DE", name: "Allemagne", flag: "🇩🇪" },
      { code: "GR", name: "Grèce", flag: "🇬🇷" },
      { code: "HU", name: "Hongrie", flag: "🇭🇺" },
      { code: "IE", name: "Irlande", flag: "🇮🇪" },
      { code: "IT", name: "Italie", flag: "🇮🇹" },
      { code: "LV", name: "Lettonie", flag: "🇱🇻" },
      { code: "LT", name: "Lituanie", flag: "🇱🇹" },
      { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
      { code: "MT", name: "Malte", flag: "🇲🇹" },
      { code: "NL", name: "Pays-Bas", flag: "🇳🇱" },
      { code: "PL", name: "Pologne", flag: "🇵🇱" },
      { code: "PT", name: "Portugal", flag: "🇵🇹" },
      { code: "RO", name: "Roumanie", flag: "🇷🇴" },
      { code: "SK", name: "Slovaquie", flag: "🇸🇰" },
      { code: "SI", name: "Slovénie", flag: "🇸🇮" },
      { code: "ES", name: "Espagne", flag: "🇪🇸" },
      { code: "SE", name: "Suède", flag: "🇸🇪" },
    ],
  },
  {
    zone: "EUROPE ÉLARGIE",
    countries: [
      { code: "AD", name: "Andorre", flag: "🇦🇩" },
      { code: "AL", name: "Albanie", flag: "🇦🇱" },
      { code: "BA", name: "Bosnie-Herzégovine", flag: "🇧🇦" },
      { code: "BY", name: "Biélorussie", flag: "🇧🇾" },
      { code: "CH", name: "Suisse", flag: "🇨🇭" },
      { code: "FO", name: "Îles Féroé", flag: "🇫🇴" },
      { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
      { code: "GG", name: "Guernesey", flag: "🇬🇬" },
      { code: "GI", name: "Gibraltar", flag: "🇬🇮" },
      { code: "GL", name: "Groenland", flag: "🇬🇱" },
      { code: "IM", name: "Île de Man", flag: "🇮🇲" },
      { code: "IS", name: "Islande", flag: "🇮🇸" },
      { code: "JE", name: "Jersey", flag: "🇯🇪" },
      { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
      { code: "MC", name: "Monaco", flag: "🇲🇨" },
      { code: "MD", name: "Moldavie", flag: "🇲🇩" },
      { code: "ME", name: "Monténégro", flag: "🇲🇪" },
      { code: "MK", name: "Macédoine du Nord", flag: "🇲🇰" },
      { code: "NO", name: "Norvège", flag: "🇳🇴" },
      { code: "RS", name: "Serbie", flag: "🇷🇸" },
      { code: "SM", name: "Saint-Marin", flag: "🇸🇲" },
      { code: "UA", name: "Ukraine", flag: "🇺🇦" },
      { code: "VA", name: "Vatican", flag: "🇻🇦" },
      { code: "XK", name: "Kosovo", flag: "🇽🇰" },
    ],
  },
  {
    zone: "MAGHREB & MOYEN-ORIENT",
    countries: [
      { code: "DZ", name: "Algérie", flag: "🇩🇿" },
      { code: "MA", name: "Maroc", flag: "🇲🇦" },
      { code: "TN", name: "Tunisie", flag: "🇹🇳" },
      { code: "AE", name: "Émirats arabes unis", flag: "🇦🇪" },
      { code: "BH", name: "Bahreïn", flag: "🇧🇭" },
      { code: "IL", name: "Israël", flag: "🇮🇱" },
      { code: "JO", name: "Jordanie", flag: "🇯🇴" },
      { code: "KW", name: "Koweït", flag: "🇰🇼" },
      { code: "LB", name: "Liban", flag: "🇱🇧" },
      { code: "OM", name: "Oman", flag: "🇴🇲" },
      { code: "QA", name: "Qatar", flag: "🇶🇦" },
      { code: "SA", name: "Arabie saoudite", flag: "🇸🇦" },
      { code: "TR", name: "Turquie", flag: "🇹🇷" },
    ],
  },
  {
    zone: "AMÉRIQUE DU NORD",
    countries: [
      { code: "CA", name: "Canada", flag: "🇨🇦" },
      { code: "MX", name: "Mexique", flag: "🇲🇽" },
      { code: "US", name: "États-Unis", flag: "🇺🇸" },
    ],
  },
  {
    zone: "AMÉRIQUE CENTRALE & CARAÏBES",
    countries: [
      { code: "AG", name: "Antigua-et-Barbuda", flag: "🇦🇬" },
      { code: "BB", name: "Barbade", flag: "🇧🇧" },
      { code: "BZ", name: "Belize", flag: "🇧🇿" },
      { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
      { code: "DM", name: "Dominique", flag: "🇩🇲" },
      { code: "DO", name: "République dominicaine", flag: "🇩🇴" },
      { code: "GD", name: "Grenade", flag: "🇬🇩" },
      { code: "GT", name: "Guatemala", flag: "🇬🇹" },
      { code: "HN", name: "Honduras", flag: "🇭🇳" },
      { code: "JM", name: "Jamaïque", flag: "🇯🇲" },
      { code: "KN", name: "Saint-Kitts-et-Nevis", flag: "🇰🇳" },
      { code: "LC", name: "Sainte-Lucie", flag: "🇱🇨" },
      { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
      { code: "PA", name: "Panama", flag: "🇵🇦" },
      { code: "SV", name: "Salvador", flag: "🇸🇻" },
      { code: "TT", name: "Trinité-et-Tobago", flag: "🇹🇹" },
      { code: "VC", name: "Saint-Vincent-et-les-Grenadines", flag: "🇻🇨" },
    ],
  },
  {
    zone: "AMÉRIQUE DU SUD",
    countries: [
      { code: "AR", name: "Argentine", flag: "🇦🇷" },
      { code: "BO", name: "Bolivie", flag: "🇧🇴" },
      { code: "BR", name: "Brésil", flag: "🇧🇷" },
      { code: "CL", name: "Chili", flag: "🇨🇱" },
      { code: "CO", name: "Colombie", flag: "🇨🇴" },
      { code: "EC", name: "Équateur", flag: "🇪🇨" },
      { code: "GY", name: "Guyana", flag: "🇬🇾" },
      { code: "PY", name: "Paraguay", flag: "🇵🇾" },
      { code: "PE", name: "Pérou", flag: "🇵🇪" },
      { code: "SR", name: "Suriname", flag: "🇸🇷" },
      { code: "UY", name: "Uruguay", flag: "🇺🇾" },
      { code: "VE", name: "Venezuela", flag: "🇻🇪" },
    ],
  },
  {
    zone: "ASIE-PACIFIQUE",
    countries: [
      { code: "AU", name: "Australie", flag: "🇦🇺" },
      { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
      { code: "BN", name: "Brunei", flag: "🇧🇳" },
      { code: "BT", name: "Bhoutan", flag: "🇧🇹" },
      { code: "CN", name: "Chine", flag: "🇨🇳" },
      { code: "FJ", name: "Fidji", flag: "🇫🇯" },
      { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
      { code: "ID", name: "Indonésie", flag: "🇮🇩" },
      { code: "IN", name: "Inde", flag: "🇮🇳" },
      { code: "JP", name: "Japon", flag: "🇯🇵" },
      { code: "KH", name: "Cambodge", flag: "🇰🇭" },
      { code: "KR", name: "Corée du Sud", flag: "🇰🇷" },
      { code: "LA", name: "Laos", flag: "🇱🇦" },
      { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
      { code: "MO", name: "Macao", flag: "🇲🇴" },
      { code: "MV", name: "Maldives", flag: "🇲🇻" },
      { code: "MY", name: "Malaisie", flag: "🇲🇾" },
      { code: "NP", name: "Népal", flag: "🇳🇵" },
      { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿" },
      { code: "PH", name: "Philippines", flag: "🇵🇭" },
      { code: "PK", name: "Pakistan", flag: "🇵🇰" },
      { code: "SG", name: "Singapour", flag: "🇸🇬" },
      { code: "TH", name: "Thaïlande", flag: "🇹🇭" },
      { code: "TW", name: "Taïwan", flag: "🇹🇼" },
      { code: "VN", name: "Vietnam", flag: "🇻🇳" },
    ],
  },
  {
    zone: "AFRIQUE",
    countries: [
      { code: "BW", name: "Botswana", flag: "🇧🇼" },
      { code: "CM", name: "Cameroun", flag: "🇨🇲" },
      { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
      { code: "EG", name: "Égypte", flag: "🇪🇬" },
      { code: "ET", name: "Éthiopie", flag: "🇪🇹" },
      { code: "GA", name: "Gabon", flag: "🇬🇦" },
      { code: "GH", name: "Ghana", flag: "🇬🇭" },
      { code: "KE", name: "Kenya", flag: "🇰🇪" },
      { code: "MG", name: "Madagascar", flag: "🇲🇬" },
      { code: "MU", name: "Maurice", flag: "🇲🇺" },
      { code: "NG", name: "Nigeria", flag: "🇳🇬" },
      { code: "RW", name: "Rwanda", flag: "🇷🇼" },
      { code: "SC", name: "Seychelles", flag: "🇸🇨" },
      { code: "SN", name: "Sénégal", flag: "🇸🇳" },
      { code: "TZ", name: "Tanzanie", flag: "🇹🇿" },
      { code: "UG", name: "Ouganda", flag: "🇺🇬" },
      { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
      { code: "ZM", name: "Zambie", flag: "🇿🇲" },
    ],
  },
];

export default function CheckoutPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [cart, setCart] = useState<CartData | null>(null);
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

  // ✅ Fonction pour récupérer le nom du pays
  const getCountryName = (countryCode: string): string => {
    const country = countryGroups
      .flatMap((group) => group.countries)
      .find((country) => country.code === countryCode);

    return country?.name || countryCode;
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
                    <strong>{getCountryName(selectedCountry)}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Poids total : <strong>{totalWeight}g</strong>
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
