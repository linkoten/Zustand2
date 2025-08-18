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
    countries: ["FR"] as const,
    name: "France métropolitaine",
    freeShippingThreshold: 100, // Livraison gratuite à 100€
    weightRanges: [
      { maxWeight: 250, price: 6.8 },
      { maxWeight: 500, price: 7.5 },
      { maxWeight: 1000, price: 8.95 },
      { maxWeight: 2000, price: 10.5 },
      { maxWeight: 5000, price: 14.05 },
      { maxWeight: 10000, price: 20.35 },
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
    ] as const,
    name: "Union Européenne",
    freeShippingThreshold: 150,
    weightRanges: [
      { maxWeight: 500, price: 13.95 },
      { maxWeight: 1000, price: 16.7 },
      { maxWeight: 2000, price: 20.6 },
      { maxWeight: 5000, price: 29.4 },
      { maxWeight: 10000, price: 49.7 },
    ],
    estimatedDays: "3-6 jours",
    colissimoService: "Colissimo International",
  },

  // Zone 3 - Europe hors UE + Maghreb
  EUROPE_EXTENDED: {
    countries: [
      "CH",
      "NO",
      "IS",
      "GB",
      "MC",
      "AD",
      "SM",
      "VA",
      "LI",
      "DZ",
      "MA",
      "TN",
    ] as const,
    name: "Europe hors UE + Maghreb",
    freeShippingThreshold: 200,
    weightRanges: [
      { maxWeight: 500, price: 16.35 },
      { maxWeight: 1000, price: 20.1 },
      { maxWeight: 2000, price: 25.85 },
      { maxWeight: 5000, price: 38.25 },
      { maxWeight: 10000, price: 66.15 },
    ],
    estimatedDays: "4-8 jours",
    colissimoService: "Colissimo International",
  },

  // Zone 4 - Reste du monde
  WORLDWIDE: {
    countries: [
      // Amérique du Nord
      "US",
      "CA",
      "MX",
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
      // Asie-Pacifique
      "AU",
      "NZ",
      "JP",
      "KR",
      "SG",
      "HK",
      "TW",
      "MY",
      "TH",
      "PH",
      "ID",
      "VN",
      "IN",
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
      // Afrique
      "ZA",
      "NG",
      "KE",
      "GH",
      "EG",
      "ET",
      "UG",
      "TZ",
    ] as const,
    name: "Reste du monde",
    freeShippingThreshold: 250,
    weightRanges: [
      { maxWeight: 500, price: 18.85 },
      { maxWeight: 1000, price: 24.25 },
      { maxWeight: 2000, price: 32.4 },
      { maxWeight: 5000, price: 51.6 },
      { maxWeight: 10000, price: 89.25 },
    ],
    estimatedDays: "7-14 jours",
    colissimoService: "Colissimo International",
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

// ✅ Fonction pour estimer le poids d'un fossile
export function estimateFossilWeight(category: string, price: number): number {
  // Estimation basée sur la catégorie et le prix
  switch (category) {
    case "TRILOBITE":
      if (price < 50) return 150; // Petit trilobite ~150g
      if (price < 200) return 400; // Moyen trilobite ~400g
      return 800; // Grand trilobite ~800g

    case "AMMONITE":
      if (price < 100) return 300; // Petite ammonite ~300g
      if (price < 300) return 600; // Moyenne ammonite ~600g
      return 1200; // Grande ammonite ~1.2kg

    case "DENT":
      return 50; // Dent de requin ~50g

    case "VERTEBRE":
      if (price < 500) return 800; // Petite vertèbre ~800g
      return 2000; // Grande vertèbre ~2kg

    case "COQUILLAGE":
      return 200; // Coquillage moyen ~200g

    default:
      return 500; // Défaut ~500g
  }
}

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
