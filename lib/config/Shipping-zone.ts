interface ShippingZone {
  countries: readonly string[];
  name: string;
  freeShippingThreshold: number;
  cost: number;
  estimatedDays: string;
}

export const SHIPPING_ZONES = {
  // Zone 1 - France métropolitaine (livraison rapide)
  FRANCE: {
    countries: ["FR"] as const,
    name: "France métropolitaine",
    freeShippingThreshold: 75,
    cost: 6.99,
    estimatedDays: "2-3 jours",
  },

  // Zone 2 - Europe de l'Ouest (livraison standard)
  EUROPE_WEST: {
    countries: [
      "BE",
      "CH",
      "LU",
      "MC",
      "AD",
      "AT",
      "DE",
      "IT",
      "ES",
      "PT",
      "NL",
    ] as const,
    name: "Europe de l'Ouest",
    freeShippingThreshold: 100,
    cost: 12.99,
    estimatedDays: "3-5 jours",
  },

  // Zone 3 - Europe élargie
  EUROPE_EXTENDED: {
    countries: [
      "GB",
      "IE",
      "DK",
      "SE",
      "NO",
      "FI",
      "IS",
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
    ] as const,
    name: "Europe élargie",
    freeShippingThreshold: 150,
    cost: 18.99,
    estimatedDays: "5-7 jours",
  },

  // Zone 4 - Amérique du Nord
  NORTH_AMERICA: {
    countries: ["US", "CA"] as const,
    name: "Amérique du Nord",
    freeShippingThreshold: 200,
    cost: 29.99,
    estimatedDays: "7-10 jours",
  },

  // Zone 5 - Asie-Pacifique développée
  ASIA_PACIFIC: {
    countries: ["AU", "NZ", "JP", "KR", "SG", "HK", "TW"] as const,
    name: "Asie-Pacifique",
    freeShippingThreshold: 250,
    cost: 35.99,
    estimatedDays: "10-14 jours",
  },

  // Zone 6 - Reste du monde
  WORLDWIDE: {
    countries: [
      // Amérique du Sud
      "AR",
      "BR",
      "CL",
      "CO",
      "PE",
      "UY",
      "EC",
      "VE",
      "BO",
      "PY",
      "GY",
      "SR",
      "MX",
      // Asie
      "MY",
      "TH",
      "PH",
      "ID",
      "VN",
      "IN",
      "BD",
      "LK",
      "NP",
      "PK",
      "AF",
      "KH",
      "LA",
      "MM",
      "BN",
      // Moyen-Orient
      "AE",
      "SA",
      "QA",
      "KW",
      "BH",
      "OM",
      "JO",
      "LB",
      "IL",
      "TR",
      "IQ",
      // Afrique
      "ZA",
      "NG",
      "KE",
      "GH",
      "EG",
      "MA",
      "TN",
      "DZ",
      "LY",
      "ET",
      "UG",
      "TZ",
      "ZW",
      "ZM",
      "MW",
      "MZ",
      "BW",
      "NA",
      "SZ",
      "LS",
      "MG",
      "MU",
      "SC",
      "RW",
      "BI",
      "DJ",
      "SO",
      "ER",
      "SS",
      "SD",
      "TD",
      "CF",
      "CM",
      "GQ",
      "GA",
      "CG",
      "CD",
      "AO",
      "ST",
      "CV",
      "GW",
      "GN",
      "SL",
      "LR",
      "CI",
      "BF",
      "ML",
      "NE",
      "SN",
      "GM",
      "TG",
      "BJ",
      // Autres
      "RU",
      "UA",
      "BY",
      "MD",
      "GE",
      "AM",
      "AZ",
      "KZ",
      "UZ",
      "TM",
      "TJ",
      "KG",
    ] as const,
    name: "Reste du monde",
    freeShippingThreshold: 300,
    cost: 49.99,
    estimatedDays: "14-21 jours",
  },
} as const satisfies Record<string, ShippingZone>;

// ✅ Tous les pays combinés avec un type correct
export const ALL_SHIPPING_COUNTRIES = Object.values(SHIPPING_ZONES).flatMap(
  (zone) => [...zone.countries]
); // ✅ Spread pour éviter les types readonly

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

// ✅ Fonction pour calculer les frais de livraison avec types corrects
export function calculateShippingCost(
  subtotal: number,
  countryCode?: string
): number {
  if (!countryCode) {
    return SHIPPING_ZONES.FRANCE.cost;
  }

  const zone = getShippingZone(countryCode);
  if (!zone) {
    return SHIPPING_ZONES.WORLDWIDE.cost;
  }

  // ✅ Livraison gratuite si seuil atteint
  if (subtotal >= zone.freeShippingThreshold) {
    return 0;
  }

  return zone.cost;
}

// ✅ Type helper pour l'autocomplétion
export type ShippingZoneKey = keyof typeof SHIPPING_ZONES;
export type CountryCode = (typeof ALL_SHIPPING_COUNTRIES)[number];
