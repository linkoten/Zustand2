"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import { GeologicalPeriod } from "@/lib/generated/prisma";
import { useEffect } from "react";

// Styles CSS pour le marker du produit mis en évidence
const markerStyles = `
  .highlighted-marker img {
    filter: hue-rotate(0deg) saturate(1.5) brightness(1.1);
    transform: scale(1.2);
  }
`;

// Hook pour injecter les styles CSS
function useMarkerStyles() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const existingStyle = document.getElementById("locality-marker-styles");
      if (!existingStyle) {
        const styleElement = document.createElement("style");
        styleElement.id = "locality-marker-styles";
        styleElement.textContent = markerStyles;
        document.head.appendChild(styleElement);
      }
    }
  }, []);
}

// Correction du marker par défaut (sinon il ne s'affiche pas)
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icône pour la localité mise en évidence (rouge)
const highlightedIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "highlighted-marker",
});

// Type pour une localité avec ses périodes géologiques
interface LocalityData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geologicalPeriods: GeologicalPeriod[];
  geologicalStages: string[];
}

// Couleurs géologiques conventionnelles normalisées
const GEOLOGICAL_COLORS: Record<GeologicalPeriod, string> = {
  [GeologicalPeriod.CAMBRIEN]: "#40E0D0", // Bleu clair tirant sur le turquoise
  [GeologicalPeriod.ORDOVICIEN]: "#0066CC", // Bleu moyen
  [GeologicalPeriod.SILURIEN]: "#8A2BE2", // Violet tirant sur le pourpre
  [GeologicalPeriod.DEVONIEN]: "#B22222", // Rouge brique / brun-rouge
  [GeologicalPeriod.CARBONIFERE]: "#228B22", // Vert foncé
  [GeologicalPeriod.PERMIEN]: "#C71585", // Rose foncé / magenta
  [GeologicalPeriod.TRIAS]: "#CD853F", // Brun-rouge / brique
  [GeologicalPeriod.JURASSIQUE]: "#808000", // Vert olive
  [GeologicalPeriod.CRETACE]: "#9AFF9A", // Vert clair jaunâtre
  [GeologicalPeriod.PALEOGENE]: "#FFA500", // Jaune orangé
  [GeologicalPeriod.NEOGENE]: "#FFD700", // Jaune plus vif
  [GeologicalPeriod.QUATERNAIRE]: "#D3D3D3", // Gris clair
};

// Fonction pour générer un petit polygone autour d'un point
const generatePolygonAroundPoint = (
  lat: number,
  lon: number,
  radiusKm: number = 5
) => {
  const radiusDeg = radiusKm / 111; // Conversion approximative km -> degrés
  return [
    [lon - radiusDeg, lat + radiusDeg],
    [lon + radiusDeg, lat + radiusDeg],
    [lon + radiusDeg, lat - radiusDeg],
    [lon - radiusDeg, lat - radiusDeg],
    [lon - radiusDeg, lat + radiusDeg],
  ];
};

// Fonction pour créer les features GeoJSON à partir des localités
const createLocalityFeatures = (localities: LocalityData[]) => {
  return localities.map((locality) => ({
    type: "Feature" as const,
    properties: {
      name: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
      geologicalPeriods: locality.geologicalPeriods,
      geologicalStages: locality.geologicalStages,
      // Utiliser la couleur de la première période géologique (ou une couleur par défaut)
      color:
        locality.geologicalPeriods.length > 0
          ? GEOLOGICAL_COLORS[locality.geologicalPeriods[0]]
          : "#808080", // Gris par défaut
    },
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        generatePolygonAroundPoint(locality.latitude, locality.longitude),
      ],
    },
  }));
};

interface ProductMapProps {
  localities: LocalityData[];
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  highlightedLocalityId?: number;
}

export default function ProductMap({
  localities,
  centerLat = 30,
  centerLon = -5,
  zoom = 5,
  highlightedLocalityId,
}: ProductMapProps) {
  // Injecter les styles CSS pour les markers
  useMarkerStyles();

  // Générer les features GeoJSON à partir des localités
  const localityFeatures = createLocalityFeatures(localities);

  // Calculer le centre de la carte en fonction des localités s'il n'est pas fourni
  const mapCenter: [number, number] =
    localities.length > 0 && !centerLat && !centerLon
      ? [
          localities.reduce((sum, loc) => sum + loc.latitude, 0) /
            localities.length,
          localities.reduce((sum, loc) => sum + loc.longitude, 0) /
            localities.length,
        ]
      : [centerLat, centerLon];

  return (
    <div
      style={{
        width: "100%",
        height: 220,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marker uniquement pour la localité du produit */}
        {highlightedLocalityId &&
          localities
            .filter((locality) => locality.id === highlightedLocalityId)
            .map((locality) => (
              <Marker
                key={locality.id}
                position={[locality.latitude, locality.longitude]}
                icon={highlightedIcon}
              >
                <Popup>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-red-600">
                      {locality.name}
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        PRODUIT
                      </span>
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>Latitude: {locality.latitude.toFixed(4)}°</p>
                      <p>Longitude: {locality.longitude.toFixed(4)}°</p>
                    </div>
                    {locality.geologicalPeriods.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          Périodes géologiques:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {locality.geologicalPeriods.map((period) => (
                            <span
                              key={period}
                              className="px-2 py-1 text-xs rounded-full text-white font-medium"
                              style={{
                                backgroundColor: GEOLOGICAL_COLORS[period],
                              }}
                            >
                              {period}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {locality.geologicalStages.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          Étages géologiques:
                        </p>
                        <div className="text-xs text-gray-500">
                          {locality.geologicalStages.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Polygones GeoJSON pour les localités */}
        {localityFeatures.length > 0 && (
          <GeoJSON
            data={
              {
                type: "FeatureCollection",
                features: localityFeatures,
              } as FeatureCollection
            }
            style={(feature) => ({
              color: feature?.properties?.color || "#808080",
              weight: 2,
              fillOpacity: 0.4,
              opacity: 0.9,
            })}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const {
                  name,
                  latitude,
                  longitude,
                  geologicalPeriods,
                  geologicalStages,
                } = feature.properties;

                // Ajouter un effet de survol
                layer.on({
                  mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      weight: 3,
                      fillOpacity: 0.6,
                      opacity: 1,
                    });
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      weight: 2,
                      fillOpacity: 0.4,
                      opacity: 0.9,
                    });
                  },
                });

                layer.bindPopup(`
                  <div class="space-y-2">
                    <h3 class="font-semibold text-lg">${name}</h3>
                    <div class="text-sm text-gray-600">
                      <p>Latitude: ${latitude.toFixed(4)}°</p>
                      <p>Longitude: ${longitude.toFixed(4)}°</p>
                    </div>
                    ${
                      geologicalPeriods.length > 0
                        ? `
                      <div class="space-y-1">
                        <p class="font-medium text-sm">Périodes géologiques:</p>
                        <div class="text-xs">${geologicalPeriods.join(", ")}</div>
                      </div>
                    `
                        : ""
                    }
                    ${
                      geologicalStages.length > 0
                        ? `
                      <div class="space-y-1">
                        <p class="font-medium text-sm">Étages géologiques:</p>
                        <div class="text-xs text-gray-500">${geologicalStages.join(", ")}</div>
                      </div>
                    `
                        : ""
                    }
                  </div>
                `);
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
