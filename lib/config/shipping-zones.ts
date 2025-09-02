interface WeightRange {
  maxWeight: number; // en grammes
  price: number;
}

interface ShippingZone {
  countries: readonly string[];
  name: string;
  freeShippingThreshold: number;
  weightRanges: WeightRange[];
  estimatedDays: string;
  colissimoService: string;
}

export const SHIPPING_ZONES = {
  // Zone 1 - France métropolitaine
  FRANCE: {
    countries: ["FR", "AD", "MC"] as const,
    name: "France métropolitaine",
    freeShippingThreshold: 500, // Livraison gratuite à 100€
    weightRanges: [
      { maxWeight: 250, price: 5.3 },
      { maxWeight: 500, price: 7.5 },
      { maxWeight: 1000, price: 9.4 },
      { maxWeight: 2000, price: 10.7 },
      { maxWeight: 5000, price: 16.6 },
      { maxWeight: 10000, price: 24.2 },
      { maxWeight: 15000, price: 30 },
      { maxWeight: 30000, price: 38 },
    ],
    estimatedDays: "2-3 jours",
    colissimoService: "Colissimo",
  },

  // Zone 2 - Union Européenne
  EUROPE_EU: {
    countries: [
      "BE",
      "LU",
      "DE",
      "IT",
      "ES",
      "PT",
      "NL",
      "AT",
      "IE",
      "DK",
      "SE",
      "FI",
      "PL",
      "CZ",
      "SK",
      "HU",
      "SI",
      "HR",
      "BG",
      "RO",
      "GR",
      "CY",
      "MT",
      "EE",
      "LV",
      "LT",
      "LI",
      "GB",
      "SM",
      "CH",
      "VA",
      "FO",
      "GG",
      "GL",
      "GI",
      "IM",
      "JE",
    ] as const,
    name: "Union Européenne",
    freeShippingThreshold: 1000,
    weightRanges: [
      { maxWeight: 500, price: 15 },
      { maxWeight: 1000, price: 18.5 },
      { maxWeight: 2000, price: 21 },
      { maxWeight: 5000, price: 27 },
      { maxWeight: 10000, price: 45 },
      { maxWeight: 15000, price: 65 },
      { maxWeight: 30000, price: 84 },
    ],
    estimatedDays: "3-6 jours",
    colissimoService: "Colissimo International",
  },

  // Zone 3 - Europe hors UE + Maghreb
  EUROPE_EXTENDED: {
    countries: [
      "AM", // Arménie
      "AL", // Albanie
      "DZ", // Algérie
      "AZ", // Azerbaijan
      "BY", // Biélorussie
      "BA", // Bosnie-Herzégovine
      "GE", // Géorgie
      "IS", // Islande
      "MK", // Macédoine du Nord
      "MA", // Maroc
      "MD", // Moldavie
      "ME", // Monténégro
      "NO", // Norvège
      "RS", // Serbie
      "TN", // Tunisie
      "TR", // Turquie
      "UA", // Ukraine
      "XK", // Kosovo
      "EG", // Egypte
    ] as const,
    name: "Europe hors UE + Maghreb",
    freeShippingThreshold: 2000,
    weightRanges: [
      { maxWeight: 500, price: 23 },
      { maxWeight: 1000, price: 27 },
      { maxWeight: 2000, price: 30 },
      { maxWeight: 5000, price: 38 },
      { maxWeight: 10000, price: 63 },
      { maxWeight: 15000, price: 85 },
      { maxWeight: 30000, price: 105 },
    ],
    estimatedDays: "4-8 jours",
    colissimoService: "Colissimo International",
  },

  // Zone 4 - Reste du monde
  WORLDWIDE: {
    countries: [
      // Afrique (hors Maghreb)
      "AO",
      "BJ",
      "BW",
      "BF",
      "BI",
      "CM",
      "CV",
      "CF",
      "TD",
      "KM",
      "CG",
      "CD",
      "DJ",
      "GQ",
      "ER",
      "SZ",
      "ET",
      "GA",
      "GM",
      "GH",
      "GN",
      "GW",
      "CI",
      "KE",
      "LS",
      "LR",
      "MG",
      "MW",
      "ML",
      "MR",
      "MU",
      "MZ",
      "NA",
      "NE",
      "NG",
      "RW",
      "ST",
      "SN",
      "SC",
      "SL",
      "SO",
      "ZA",
      "SS",
      "SD",
      "SH",
      "TZ",
      "TG",
      "TO",
      "UG",
      "ZM",
      "ZW",
      // Amerique + Russie
      "CA",
      "US",
      "RU",
      "MX",
      "AG",
      "BB",
      "BZ",
      "CR",
      "DM",
      "DO",
      "GD",
      "GT",
      "HN",
      "JM",
      "KN",
      "LC",
      "NI",
      "PA",
      "SV",
      "TT",
      "VC",
      // Amérique du SUD
      "AR",
      "BO",
      "BR",
      "CL",
      "CO",
      "EC",
      "GY",
      "PY",
      "PE",
      "SR",
      "UY",
      "VE",
      // Asie-Pacifique
      "AU",
      "BD",
      "BN",
      "BT",
      "CN",
      "FJ",
      "HK",
      "ID",
      "IN",
      "JP",
      "KH",
      "KR",
      "LA",
      "LK",
      "MO",
      "MV",
      "MY",
      "NP",
      "NZ",
      "PH",
      "PK",
      "SG",
      "TH",
      "TW",
      "VN",
      // Proche et Moyen-Orient
      "AF", // Afghanistan
      "AE", // Émirats arabes unis
      "SA", // Arabie saoudite
      "QA", // Qatar
      "KW", // Koweït
      "BH", // Bahreïn
      "OM", // Oman
      "JO", // Jordanie
      "LB", // Liban
      "IL", // Israël
      "IQ", // Irak
      "IR", // Iran
      "PS", // Palestine
      "SY", // Syrie
      "YE", // Yémen
      // Autres pays d'Asie centrale proches
      "PK", // Pakistan
      "TM", // Turkménistan
      "TJ", // Tadjikistan
      "KG", // Kirghizistan
      "KZ", // Kazakhstan
      "UZ", // Ouzbékistan
    ] as const,
    name: "Reste du monde",
    freeShippingThreshold: 3000,
    weightRanges: [
      { maxWeight: 500, price: 33.5 },
      { maxWeight: 1000, price: 38 },
      { maxWeight: 2000, price: 52 },
      { maxWeight: 5000, price: 75 },
      { maxWeight: 10000, price: 142 },
      { maxWeight: 15000, price: 200 },
      { maxWeight: 30000, price: 250 },
    ],
    estimatedDays: "7-14 jours",
    colissimoService: "Colissimo International",
  },

  OUTREMER_1: {
    countries: [
      "RE", // Réunion
      "GP", // Guadeloupe
      "MQ", // Martinique
      "YT", // Mayotte
      "GF", // Guyane
      "PM", // Saint-Pierre-et-Miquelon
      "MF", // Saint-Martin
      "BL", // Saint-Barthélemy
    ] as const,
    name: "Outre-Mer 1",
    freeShippingThreshold: 2000,
    weightRanges: [
      { maxWeight: 500, price: 12.65 },
      { maxWeight: 1000, price: 20.0 },
      { maxWeight: 2000, price: 27.25 },
      { maxWeight: 5000, price: 40.95 },
      { maxWeight: 10000, price: 65.6 },
      { maxWeight: 15000, price: 137.05 },
      { maxWeight: 30000, price: 150.55 },
    ],
    estimatedDays: "5-10 jours",
    colissimoService: "Colissimo Outre-Mer",
  },

  OUTREMER_2: {
    countries: [
      "PF", // Polynésie Française
      "WF", // Wallis et Futuna
      "NC", // Nouvelle-Calédonie
      "TF", // TAAF
    ] as const,
    name: "Outre-Mer 2",
    freeShippingThreshold: 3000,
    weightRanges: [
      { maxWeight: 500, price: 12.85 },
      { maxWeight: 1000, price: 19.95 },
      { maxWeight: 2000, price: 35.25 },
      { maxWeight: 5000, price: 58.9 },
      { maxWeight: 10000, price: 115.35 },
      { maxWeight: 15000, price: 263.15 },
      { maxWeight: 30000, price: 302.35 },
    ],
    estimatedDays: "7-15 jours",
    colissimoService: "Colissimo Outre-Mer",
  },
} as const satisfies Record<string, ShippingZone>;

// ✅ Tous les pays combinés avec un type correct
export const ALL_SHIPPING_COUNTRIES = Object.values(SHIPPING_ZONES).flatMap(
  (zone) => [...zone.countries]
);

// ✅ Fonction pour déterminer la zone d'un pays avec types corrects
export function getShippingZone(
  countryCode: string
): (ShippingZone & { key: string }) | null {
  for (const [zoneKey, zone] of Object.entries(SHIPPING_ZONES)) {
    if ((zone.countries as readonly string[]).includes(countryCode)) {
      return { key: zoneKey, ...zone };
    }
  }
  return null;
}

// ✅ Fonction pour calculer les frais selon le poids et la zone
export function calculateShippingByWeight(
  subtotal: number,
  weightInGrams: number,
  countryCode?: string
): { cost: number; service: string; estimatedDays: string } {
  const zone = getShippingZone(countryCode || "FR");

  if (!zone) {
    // Défaut pour pays non supporté
    return {
      cost: 25.0,
      service: "Livraison internationale",
      estimatedDays: "10-20 jours",
    };
  }

  // Livraison gratuite si seuil atteint
  if (subtotal >= zone.freeShippingThreshold) {
    return {
      cost: 0,
      service: `Livraison gratuite - ${zone.colissimoService}`,
      estimatedDays: zone.estimatedDays,
    };
  }

  // ✅ Trouver le bon tarif selon le poids avec type explicite
  const weightRange = zone.weightRanges.find(
    (range: WeightRange) => weightInGrams <= range.maxWeight
  );

  if (!weightRange) {
    // Si le poids dépasse 10kg, prendre le tarif le plus élevé
    const maxRange = zone.weightRanges[zone.weightRanges.length - 1];
    return {
      cost: maxRange.price,
      service: `${zone.colissimoService} (>10kg)`,
      estimatedDays: zone.estimatedDays,
    };
  }

  return {
    cost: weightRange.price,
    service: zone.colissimoService,
    estimatedDays: zone.estimatedDays,
  };
}

// ✅ FONCTION SUPPRIMÉE - estimateFossilWeight
// Le poids est maintenant stocké directement dans la base de données

// ✅ Type helper pour l'autocomplétion
export type ShippingZoneKey = keyof typeof SHIPPING_ZONES;
export type CountryCode = (typeof ALL_SHIPPING_COUNTRIES)[number];

// ✅ Fonction utilitaire pour obtenir tous les pays d'une zone
export function getCountriesInZone(
  zoneKey: ShippingZoneKey
): readonly string[] {
  return SHIPPING_ZONES[zoneKey].countries;
}

// ✅ Fonction pour obtenir le tarif d'une zone spécifique
export function getZoneShippingCost(
  zoneKey: ShippingZoneKey,
  subtotal: number,
  weightInGrams: number
): { cost: number; service: string; estimatedDays: string } {
  const zone = SHIPPING_ZONES[zoneKey];

  // Livraison gratuite si seuil atteint
  if (subtotal >= zone.freeShippingThreshold) {
    return {
      cost: 0,
      service: `Livraison gratuite - ${zone.colissimoService}`,
      estimatedDays: zone.estimatedDays,
    };
  }

  // Trouver le bon tarif selon le poids
  const weightRange = zone.weightRanges.find(
    (range: WeightRange) => weightInGrams <= range.maxWeight
  );

  if (!weightRange) {
    // Si le poids dépasse 10kg, prendre le tarif le plus élevé
    const maxRange = zone.weightRanges[zone.weightRanges.length - 1];
    return {
      cost: maxRange.price,
      service: `${zone.colissimoService} (>10kg)`,
      estimatedDays: zone.estimatedDays,
    };
  }

  return {
    cost: weightRange.price,
    service: zone.colissimoService,
    estimatedDays: zone.estimatedDays,
  };
}
