"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateShippingByWeight } from "@/lib/config/shipping-zones";
import { Globe, MapPin, Truck, Check } from "lucide-react";

interface CountrySelectorProps {
  subtotal: number;
  totalWeight: number;
  onCountrySelected: (country: string) => void;
}

export function CountrySelector({
  subtotal,
  totalWeight,
  onCountrySelected,
}: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState("");

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

  const getShippingCost = (countryCode: string) => {
    const shipping = calculateShippingByWeight(
      subtotal,
      totalWeight,
      countryCode
    );
    return shipping.cost;
  };

  return (
    <div className="space-y-8">
      {countryGroups.map((group) => (
        <Card
          key={group.zone}
          className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {group.zone}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.countries.map((country) => {
                const shippingCost = getShippingCost(country.code);
                const isSelected = selectedCountry === country.code;

                return (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`group relative p-4 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {country.flag}
                      </span>
                      <span
                        className={`font-semibold transition-colors ${
                          isSelected
                            ? "text-blue-800"
                            : "text-slate-800 group-hover:text-slate-900"
                        }`}
                      >
                        {country.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck
                        className={`h-4 w-4 ${
                          isSelected ? "text-blue-600" : "text-emerald-600"
                        }`}
                      />
                      <Badge
                        className={`${
                          shippingCost === 0
                            ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                        } px-3 py-1 font-bold`}
                      >
                        {shippingCost === 0
                          ? "GRATUIT"
                          : `${shippingCost.toFixed(2)}€`}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedCountry && (
        <Card className="sticky bottom-4 border-0 bg-gradient-to-r from-emerald-50 to-green-50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">
                    Destination confirmée !
                  </h3>
                  <p className="text-emerald-700">
                    <span className="text-2xl mr-2">
                      {
                        countryGroups
                          .flatMap((g) => g.countries)
                          .find((c) => c.code === selectedCountry)?.flag
                      }
                    </span>
                    <strong>
                      {
                        countryGroups
                          .flatMap((g) => g.countries)
                          .find((c) => c.code === selectedCountry)?.name
                      }
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">
                  Frais de livraison :{" "}
                  <strong className="text-xl">
                    {getShippingCost(selectedCountry) === 0
                      ? "GRATUIT"
                      : `${getShippingCost(selectedCountry).toFixed(2)}€`}
                  </strong>
                </span>
              </div>

              <Button
                onClick={() => onCountrySelected(selectedCountry)}
                className="w-full max-w-md bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Truck className="mr-2 h-5 w-5" />
                Continuer vers le paiement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
