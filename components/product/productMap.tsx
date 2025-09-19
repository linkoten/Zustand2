"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Globe, Layers } from "lucide-react";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { GeologicalPeriod } from "@/lib/generated/prisma";

// Import dynamique des modules Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MapContainer: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TileLayer: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Marker: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Popup: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let GeoJSON: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any;

// Styles CSS pour les markers et la carte (inclut les styles Leaflet)
const mapStyles = `
  /* Styles Leaflet de base */
  .leaflet-container {
    height: 100%;
    width: 100%;
    z-index: 1;
  }
  
  .leaflet-control-container .leaflet-routing-container-hide {
    display: none;
  }
  
  .leaflet-marker-icon {
    border-radius: 50%;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }
  
  .leaflet-popup-tip {
    background: white;
  }
  
  /* Styles personnalisés */
  .highlighted-marker img {
    filter: hue-rotate(0deg) saturate(1.5) brightness(1.1);
    transform: scale(1.2);
    transition: all 0.3s ease;
  }
  
  .highlighted-marker:hover img {
    transform: scale(1.3);
  }
  
  .geological-period-badge {
    display: inline-block;
    font-size: 8px;
    font-weight: 600;
    padding: 1px 4px;
    border-radius: 6px;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    margin: 1px;
  }
  
  .locality-popup {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }
  
  .locality-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
    padding: 0;
    min-width: 180px;
    max-width: 340px;
  }
  
  .locality-popup .leaflet-popup-content {
    margin: 0;
    padding: 8px;
    border-radius: 8px;
    font-size: 12px;
  }
  
  .map-container {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .map-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 8px;
  }
  
  .compact-popup-content {
    font-size: 11px;
    line-height: 1.3;
  }
  
  .compact-popup-content h3 {
    font-size: 13px;
    margin-bottom: 4px;
  }
  
  .compact-popup-content .coordinates-section {
    font-size: 10px;
    padding: 4px 6px;
  }
  
  .compact-popup-content .period-badge {
    font-size: 7px;
    padding: 1px 3px;
  }
`;

// Hook pour injecter les styles CSS
function useMapStyles() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const existingStyle = document.getElementById("product-map-styles");
      if (!existingStyle) {
        const styleElement = document.createElement("style");
        styleElement.id = "product-map-styles";
        styleElement.textContent = mapStyles;
        document.head.appendChild(styleElement);
      }
    }
  }, []);
}

// Type pour une localité avec ses périodes géologiques
interface LocalityData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geologicalPeriods: GeologicalPeriod[];
  geologicalStages: string[];
}

// Interface pour les propriétés des features GeoJSON
interface LocalityFeatureProperties {
  name: string;
  latitude: number;
  longitude: number;
  geologicalPeriods: GeologicalPeriod[];
  geologicalStages: string[];
  color: string;
}

// Couleurs géologiques conventionnelles améliorées
const GEOLOGICAL_COLORS: Record<GeologicalPeriod, string> = {
  [GeologicalPeriod.CAMBRIEN]: "#40E0D0",
  [GeologicalPeriod.ORDOVICIEN]: "#0066CC",
  [GeologicalPeriod.SILURIEN]: "#8A2BE2",
  [GeologicalPeriod.DEVONIEN]: "#B22222",
  [GeologicalPeriod.CARBONIFERE]: "#228B22",
  [GeologicalPeriod.PERMIEN]: "#C71585",
  [GeologicalPeriod.TRIAS]: "#CD853F",
  [GeologicalPeriod.JURASSIQUE]: "#808000",
  [GeologicalPeriod.CRETACE]: "#9AFF9A",
  [GeologicalPeriod.PALEOGENE]: "#FFA500",
  [GeologicalPeriod.NEOGENE]: "#FFD700",
  [GeologicalPeriod.QUATERNAIRE]: "#D3D3D3",
};

// Fonction pour générer un polygone autour d'un point
const generatePolygonAroundPoint = (
  lat: number,
  lon: number,
  radiusKm: number = 5
) => {
  const radiusDeg = radiusKm / 111;
  return [
    [lon - radiusDeg, lat + radiusDeg],
    [lon + radiusDeg, lat + radiusDeg],
    [lon + radiusDeg, lat - radiusDeg],
    [lon - radiusDeg, lat - radiusDeg],
    [lon - radiusDeg, lat + radiusDeg],
  ];
};

// Fonction pour créer les features GeoJSON
const createLocalityFeatures = (
  localities: LocalityData[]
): Feature<Geometry, LocalityFeatureProperties>[] => {
  return localities.map((locality) => ({
    type: "Feature" as const,
    properties: {
      name: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
      geologicalPeriods: locality.geologicalPeriods,
      geologicalStages: locality.geologicalStages,
      color:
        locality.geologicalPeriods.length > 0
          ? GEOLOGICAL_COLORS[locality.geologicalPeriods[0]]
          : "#808080",
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
  lang?: "en" | "fr";
  dict?: any;
  height?: number;
  showLegend?: boolean;
}

export default function ProductMap({
  localities,
  centerLat = 30,
  centerLon = -5,
  zoom = 5,
  highlightedLocalityId,
  lang = "fr",
  dict,
  height = 340,
  showLegend = false,
}: ProductMapProps) {
  useMapStyles();

  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">(
    "satellite"
  );

  // Vérifier si on est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Charger Leaflet dynamiquement côté client uniquement
  useEffect(() => {
    if (isClient) {
      const loadLeaflet = async () => {
        try {
          // Import dynamique de Leaflet
          const leafletModule = await import("leaflet");
          L = leafletModule.default;

          // Chargement du CSS Leaflet via un lien externe
          if (typeof document !== "undefined") {
            const linkElement = document.createElement("link");
            linkElement.rel = "stylesheet";
            linkElement.href =
              "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            linkElement.integrity =
              "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            linkElement.crossOrigin = "";

            // Vérifier si le CSS n'est pas déjà chargé
            const existingLink = document.querySelector(
              `link[href="${linkElement.href}"]`
            );
            if (!existingLink) {
              document.head.appendChild(linkElement);
            }
          }

          // Import des composants React-Leaflet
          const reactLeafletModule = await import("react-leaflet");
          MapContainer = reactLeafletModule.MapContainer;
          TileLayer = reactLeafletModule.TileLayer;
          Marker = reactLeafletModule.Marker;
          Popup = reactLeafletModule.Popup;
          GeoJSON = reactLeafletModule.GeoJSON;

          // Configuration des icônes Leaflet
          delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })
            ._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });

          setMapLoaded(true);
        } catch (error) {
          console.error("Erreur lors du chargement de Leaflet:", error);
        }
      };

      loadLeaflet();
    }
  }, [isClient]);

  // Si pas encore chargé côté client, afficher un skeleton
  if (!isClient || !mapLoaded) {
    return (
      <div className="space-y-4">
        <div
          className="map-container bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto animate-pulse flex items-center justify-center">
              <Globe className="w-8 h-8 text-slate-500" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-300 rounded mx-auto animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-300 rounded mx-auto animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-600">
              {lang === "en" ? "Loading map..." : "Chargement de la carte..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Créer l'icône mise en évidence après que Leaflet soit chargé
  const highlightedIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [28, 45],
    iconAnchor: [14, 45],
    popupAnchor: [1, -34],
    shadowSize: [45, 45],
    className: "highlighted-marker",
  });

  const localityFeatures = createLocalityFeatures(localities);

  const mapCenter: [number, number] =
    localities.length > 0 && !centerLat && !centerLon
      ? [
          localities.reduce((sum, loc) => sum + loc.latitude, 0) /
            localities.length,
          localities.reduce((sum, loc) => sum + loc.longitude, 0) /
            localities.length,
        ]
      : [centerLat, centerLon];

  // URLs des différents types de cartes
  const tileUrls = {
    street: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  const mapDict = dict?.map || {
    localityTitle: lang === "en" ? "Locality" : "Localité",
    productLocalityBadge: lang === "en" ? "PRODUCT" : "PRODUIT",
    geologicalPeriods:
      lang === "en" ? "Geological periods" : "Périodes géologiques",
    geologicalStages:
      lang === "en" ? "Geological stages" : "Étages géologiques",
    coordinates: lang === "en" ? "Coordinates" : "Coordonnées",
    latitude: lang === "en" ? "Latitude" : "Latitude",
    longitude: lang === "en" ? "Longitude" : "Longitude",
    street: lang === "en" ? "Street" : "Rue",
    satellite: lang === "en" ? "Satellite" : "Satellite",
    terrain: lang === "en" ? "Terrain" : "Terrain",
  };

  return (
    <div className="space-y-4">
      <div className="map-container" style={{ height }}>
        {/* Overlay pour les contrôles */}
        <div className="map-overlay">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as any)}
              className="text-xs border rounded px-2 py-1 bg-white shadow-sm"
            >
              <option value="street">{mapDict.street}</option>
              <option value="satellite">{mapDict.satellite}</option>
              <option value="terrain">{mapDict.terrain}</option>
            </select>
          </div>
        </div>

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
          <TileLayer url={tileUrls[mapType]} />

          {/* Marker pour la localité du produit */}
          {highlightedLocalityId &&
            localities
              .filter((locality) => locality.id === highlightedLocalityId)
              .map((locality) => (
                <Marker
                  key={locality.id}
                  position={[locality.latitude, locality.longitude]}
                  icon={highlightedIcon}
                >
                  <Popup
                    className="locality-popup"
                    closeButton={true}
                    autoClose={true}
                  >
                    <div className="compact-popup-content">
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <h3 className="font-semibold text-red-600 truncate">
                          {locality.name}
                        </h3>
                        <Badge
                          variant="destructive"
                          className="text-[8px] px-1 py-0"
                        >
                          {mapDict.productLocalityBadge}
                        </Badge>
                      </div>

                      <div className="coordinates-section text-gray-600 bg-gray-50 rounded p-1 mb-2">
                        <p className="font-medium mb-1 text-[9px]">
                          {mapDict.coordinates}:
                        </p>
                        <p className="text-[9px]">
                          {mapDict.latitude}: {locality.latitude.toFixed(3)}°
                        </p>
                        <p className="text-[9px]">
                          {mapDict.longitude}: {locality.longitude.toFixed(3)}°
                        </p>
                      </div>

                      {locality.geologicalPeriods.length > 0 && (
                        <div className="mb-2">
                          <p className="font-medium text-[10px] mb-1 flex items-center gap-1">
                            <Layers className="w-2 h-2" />
                            {mapDict.geologicalPeriods}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {locality.geologicalPeriods.map((period) => (
                              <span
                                key={period}
                                className="period-badge"
                                style={{
                                  backgroundColor: GEOLOGICAL_COLORS[period],
                                  fontSize: "7px",
                                  padding: "1px 3px",
                                  borderRadius: "4px",
                                  color: "white",
                                  fontWeight: "600",
                                }}
                              >
                                {period}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {locality.geologicalStages.length > 0 && (
                        <div>
                          <p className="font-medium text-[10px] mb-1">
                            {mapDict.geologicalStages}:
                          </p>
                          <div className="text-[9px] text-gray-600 bg-blue-50 rounded p-1">
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
                } as FeatureCollection<Geometry, LocalityFeatureProperties>
              }
              style={(
                feature: Feature<Geometry, LocalityFeatureProperties>
              ) => ({
                color: feature?.properties?.color || "#808080",
                weight: 2,
                fillOpacity: 0.3,
                opacity: 0.8,
              })}
              onEachFeature={(
                feature: Feature<Geometry, LocalityFeatureProperties>,
                layer: any
              ) => {
                if (feature.properties) {
                  const {
                    name,
                    latitude,
                    longitude,
                    geologicalPeriods,
                    geologicalStages,
                  } = feature.properties;

                  layer.on({
                    mouseover: (e: any) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 3,
                        fillOpacity: 0.5,
                        opacity: 1,
                      });
                    },
                    mouseout: (e: any) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 2,
                        fillOpacity: 0.3,
                        opacity: 0.8,
                      });
                    },
                    click: (e: any) => {
                      const map = e.target._map;
                      if (map) {
                        const currentZoom = map.getZoom();
                        if (currentZoom < 8) {
                          map.setView(
                            [latitude, longitude],
                            Math.min(currentZoom + 1, 8),
                            {
                              animate: true,
                              duration: 0.5,
                            }
                          );
                        }
                      }
                    },
                  });

                  layer.bindPopup(
                    `
                    <div class="compact-popup-content" style="min-width: 160px; max-width: 200px;">
                      <div class="flex items-center gap-1 mb-2">
                        <h3 class="font-semibold text-sm truncate">${name}</h3>
                      </div>
                      
                      <div class="coordinates-section text-gray-600 bg-gray-50 rounded p-1 mb-2" style="font-size: 9px;">
                        <p class="font-medium mb-1">${mapDict.coordinates}:</p>
                        <p>${mapDict.latitude}: ${latitude.toFixed(3)}°</p>
                        <p>${mapDict.longitude}: ${longitude.toFixed(3)}°</p>
                      </div>
                      
                      ${
                        geologicalPeriods.length > 0
                          ? `
                        <div class="mb-2">
                          <p class="font-medium mb-1" style="font-size: 10px;">${mapDict.geologicalPeriods}:</p>
                          <div class="flex flex-wrap gap-1">
                            ${geologicalPeriods
                              .map(
                                (period: GeologicalPeriod) =>
                                  `<span style="background-color: ${GEOLOGICAL_COLORS[period] || "#808080"}; font-size: 7px; padding: 1px 3px; border-radius: 4px; color: white; font-weight: 600;">${period}</span>`
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                      
                      ${
                        geologicalStages.length > 0
                          ? `
                        <div>
                          <p class="font-medium mb-1" style="font-size: 10px;">${mapDict.geologicalStages}:</p>
                          <div class="text-gray-600 bg-blue-50 rounded p-1" style="font-size: 9px;">
                            ${geologicalStages.join(", ")}
                          </div>
                        </div>
                      `
                          : ""
                      }
                    </div>
                  `,
                    {
                      closeButton: true,
                      autoClose: true,
                      closeOnEscapeKey: true,
                      maxWidth: 200,
                      minWidth: 160,
                    }
                  );
                }
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Légende optionnelle */}
      {showLegend && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {mapDict.geologicalPeriods}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(GEOLOGICAL_COLORS).map(([period, color]) => (
              <div key={period} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{period}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
