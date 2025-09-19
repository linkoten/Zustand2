"use client";

import { useState, useEffect } from "react";
import ProductMap from "./productMap";
import { GeologicalPeriod } from "@/lib/generated/prisma";
import { getLocalitiesForMap } from "@/lib/actions/localityActions";

// Type pour une localité simplifiée (pour les produits)
interface ProductLocality {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geologicalPeriods: GeologicalPeriod[];
  geologicalStages: string[];
}

interface ProductLocationMapProps {
  locality: ProductLocality;
  className?: string;
  height?: number;
  showAllLocalities?: boolean;
}

export default function ProductLocationMap({
  locality,
  className = "",
  height = 300,
  showAllLocalities = true,
}: ProductLocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [allLocalities, setAllLocalities] = useState<ProductLocality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Éviter les problèmes d'hydratation avec Leaflet
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Charger toutes les localités si demandé
  useEffect(() => {
    if (showAllLocalities && isClient) {
      getLocalitiesForMap()
        .then((localities) => {
          setAllLocalities(localities);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des localités:", error);
          setAllLocalities([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [showAllLocalities, isClient]);

  if (!isClient || isLoading) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">
          {isLoading ? "Chargement de la carte..." : "Initialisation..."}
        </div>
      </div>
    );
  }

  // Préparer la liste des localités à afficher
  const localitiesToDisplay = showAllLocalities ? allLocalities : [locality];

  return (
    <div className={className}>
      <ProductMap
        localities={localitiesToDisplay}
        centerLat={locality.latitude}
        centerLon={locality.longitude}
        zoom={showAllLocalities ? 4 : 8}
        highlightedLocalityId={locality.id}
      />
    </div>
  );
}
