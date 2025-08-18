"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getShippingZone,
  calculateShippingByWeight,
} from "@/lib/config/shipping-zones";

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
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Sélectionnez votre pays de livraison
      </h2>

      <div className="text-center mb-8 text-gray-600">
        <p>Choisissez votre pays pour calculer les frais de livraison exacts</p>
      </div>

      {countryGroups.map((group) => (
        <div key={group.zone} className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
            {group.zone}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {group.countries.map((country) => {
              const shippingCost = getShippingCost(country.code);
              const isSelected = selectedCountry === country.code;

              return (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium text-sm">
                        {country.name}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-green-600">
                        {shippingCost === 0
                          ? "GRATUIT"
                          : `${shippingCost.toFixed(2)}€`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedCountry && (
        <div className="sticky bottom-0 mt-12 p-6 bg-green-50 border-2 border-green-200 rounded-lg shadow-lg">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-green-800 mb-4 text-lg">
              ✅ Pays sélectionné :{" "}
              <strong>
                {
                  countryGroups
                    .flatMap((g) => g.countries)
                    .find((c) => c.code === selectedCountry)?.name
                }
              </strong>
            </p>
            <p className="text-green-700 text-sm mb-4">
              Frais de livraison :{" "}
              <strong>
                {getShippingCost(selectedCountry) === 0
                  ? "GRATUIT"
                  : `${getShippingCost(selectedCountry).toFixed(2)}€`}
              </strong>
            </p>
            <Button
              onClick={() => onCountrySelected(selectedCountry)}
              className="w-full max-w-md bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Continuer vers le paiement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
