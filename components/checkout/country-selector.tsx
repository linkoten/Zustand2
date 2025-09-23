"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { calculateShippingByWeight } from "@/lib/config/shipping-zones";
import { Globe, MapPin, Truck, Check, Search, X, Filter } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  // ✨ Filtrage intelligent des pays avec useMemo pour performance
  const filteredCountryGroups = useMemo(() => {
    if (!searchTerm.trim()) return countryGroups;

    const searchLower = searchTerm.toLowerCase().trim();

    return countryGroups
      .map((group) => ({
        ...group,
        countries: group.countries.filter(
          (country) =>
            country.name.toLowerCase().includes(searchLower) ||
            country.code.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((group) => group.countries.length > 0);
  }, [searchTerm]);

  // Statistiques de recherche
  const totalCountries = countryGroups.reduce(
    (acc, group) => acc + group.countries.length,
    0
  );
  const filteredCountries = filteredCountryGroups.reduce(
    (acc, group) => acc + group.countries.length,
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 🔍 Barre de recherche premium et sticky */}
      <Card className="sticky top-4 z-10 border-0 bg-gradient-to-r from-white via-blue-50/50 to-cyan-50/30 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Sélectionner votre destination
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {searchTerm.trim() ? (
                    <>
                      <span className="font-semibold text-blue-600">
                        {filteredCountries}
                      </span>{" "}
                      résultat{filteredCountries > 1 ? "s" : ""} sur{" "}
                      <span className="font-medium">{totalCountries}</span> pays
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{totalCountries}</span>{" "}
                      destinations disponibles
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Badge de filtre actif */}
            {searchTerm.trim() && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 font-semibold flex items-center gap-1.5 px-3 py-1.5"
              >
                <Filter className="w-3 h-3" />
                Filtré
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="relative group">
            {/* Effet de glow au focus */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-sm opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>

            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-blue-500 transition-colors duration-200" />

              <Input
                placeholder="Rechercher un pays... (ex: France, US, Allemagne)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:shadow-lg focus:shadow-xl rounded-xl"
              />

              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 rounded-lg"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Suggestions rapides */}
          {!searchTerm && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-slate-500 font-medium mr-2">
                Recherches populaires :
              </span>
              {[
                "France",
                "Allemagne",
                "Espagne",
                "Italie",
                "États-Unis",
                "Canada",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm(suggestion)}
                  className="h-6 sm:h-7 text-xs px-2 sm:px-3 border-slate-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message si aucun résultat */}
      {searchTerm.trim() && filteredCountryGroups.length === 0 && (
        <Card className="border-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
              Aucun pays trouvé
            </h3>
            <p className="text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto">
              Aucun pays ne correspond à votre recherche "{searchTerm}".
              <br className="hidden sm:block" />
              Essayez avec un autre terme.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700"
            >
              <X className="w-4 h-4 mr-2" />
              Effacer la recherche
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Groupes de pays filtrés */}
      {filteredCountryGroups.map((group) => (
        <Card
          key={group.zone}
          className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl shadow-lg">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                  {group.zone}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {group.countries.length} destination
                  {group.countries.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Badge de comptage */}
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 font-semibold"
              >
                {group.countries.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {group.countries.map((country) => {
                const shippingCost = getShippingCost(country.code);
                const isSelected = selectedCountry === country.code;

                return (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`group relative p-3 sm:p-4 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl scale-105"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                        {country.flag}
                      </span>
                      <span
                        className={`font-semibold transition-colors text-sm sm:text-base ${
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
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          isSelected ? "text-blue-600" : "text-emerald-600"
                        }`}
                      />
                      <Badge
                        className={`${
                          shippingCost === 0
                            ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                        } px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-xs sm:text-sm`}
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

      {/* Card de confirmation - RESPONSIVE OPTIMISÉE */}
      {selectedCountry && (
        <Card className="sticky bottom-4 border-0 bg-gradient-to-r from-emerald-50 to-green-50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
                    Destination confirmée !
                  </h3>
                  <p className="text-sm sm:text-base text-emerald-700">
                    <span className="text-xl sm:text-2xl mr-2">
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
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base lg:text-lg">
                  Frais de livraison :{" "}
                  <strong className="text-lg sm:text-xl">
                    {getShippingCost(selectedCountry) === 0
                      ? "GRATUIT"
                      : `${getShippingCost(selectedCountry).toFixed(2)}€`}
                  </strong>
                </span>
              </div>

              <Button
                onClick={() => onCountrySelected(selectedCountry)}
                className="w-full max-w-md bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-12 sm:h-14 text-sm sm:text-base"
                size="lg"
              >
                <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Continuer vers le paiement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
