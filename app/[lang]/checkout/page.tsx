"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getCartAction } from "@/lib/actions/cart-actions";
import CheckoutComponent from "@/components/checkout/checkout";
import { CountrySelector } from "@/components/checkout/country-selector";
import { CartData, CartItemData } from "@/types/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Package,
  MapPin,
  Globe,
  Weight,
  Euro,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Données des pays pour l'affichage
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Chargement de votre commande
            </h3>
            <p className="text-slate-600">Préparation de votre panier...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    redirect("/fossiles");
    return null;
  }

  // Calculer le sous-total et le poids avec les vrais poids des produits
  const subtotal = cart.items.reduce(
    (sum: number, item: CartItemData) =>
      sum + item.product.price * item.quantity,
    0
  );

  const totalWeight = cart.items.reduce(
    (weight: number, item: CartItemData) => {
      return weight + item.product.weight * item.quantity;
    },
    0
  );

  const handleCountrySelected = (country: string) => {
    setSelectedCountry(country);
  };

  const handleBackToCountrySelection = () => {
    setSelectedCountry(null);
  };

  // Fonction pour récupérer le nom du pays
  const getCountryName = (countryCode: string): string => {
    const country = countryGroups
      .flatMap((group) => group.countries)
      .find((country) => country.code === countryCode);

    return country?.name || countryCode;
  };

  const getCountryFlag = (countryCode: string): string => {
    const country = countryGroups
      .flatMap((group) => group.countries)
      .find((country) => country.code === countryCode);

    return country?.flag || "🌍";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {!selectedCountry ? (
          // ÉTAPE 1: Sélection du pays avec design premium
          <>
            {/* Navigation */}
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mb-6 hover:bg-white/80 backdrop-blur-sm"
              >
                <Link href="/fossiles" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux fossiles
                </Link>
              </Button>

              {/* En-tête avec animation */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">
                    Finalisation de commande
                  </span>
                </div>

                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Choisissez votre destination 🌍
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Sélectionnez votre pays de livraison pour calculer les frais
                  d&apos;expédition
                </p>
              </div>

              {/* Résumé de commande */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Articles
                    </h3>
                    <p className="text-3xl font-black bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Euro className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Sous-total
                    </h3>
                    <p className="text-3xl font-black bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                      {subtotal.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                      <Weight className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Poids total
                    </h3>
                    <p className="text-3xl font-black bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                      {totalWeight}g
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sélecteur de pays modernisé */}
            <CountrySelector
              subtotal={subtotal}
              totalWeight={totalWeight}
              onCountrySelected={handleCountrySelected}
            />
          </>
        ) : (
          // ÉTAPE 2: Checkout Stripe avec design premium
          <div className="max-w-6xl mx-auto">
            {/* Navigation */}
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mb-6 hover:bg-white/80 backdrop-blur-sm"
              >
                <Link href="/fossiles" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux fossiles
                </Link>
              </Button>

              {/* En-tête avec animation */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">
                    Paiement sécurisé
                  </span>
                </div>

                <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Finaliser votre commande 💳
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Dernière étape avant de recevoir vos fossiles d&apos;exception
                </p>
              </div>
            </div>

            {/* En-tête avec pays sélectionné */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 mb-8">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">
                        Livraison internationale
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          Expédition vers{" "}
                          <span className="font-medium">
                            {getCountryFlag(selectedCountry)}{" "}
                            {getCountryName(selectedCountry)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-600 mb-1">
                        Poids de l&apos;envoi
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 px-4 py-2">
                        <Weight className="h-4 w-4 mr-2" />
                        {totalWeight}g
                      </Badge>
                    </div>

                    <Button
                      onClick={handleBackToCountrySelection}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Changer de pays
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Composant CheckoutComponent existant dans une card premium */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0">
                <CheckoutComponent selectedCountry={selectedCountry} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
