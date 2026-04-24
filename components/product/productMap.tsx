"use client";

import { useEffect, useRef, useState } from "react";
import Supercluster from "supercluster";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Globe, Layers } from "lucide-react";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
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

  .locality-label {
    background: rgba(0, 0, 0, 0.65);
    border: none;
    box-shadow: none;
    color: white;
    font-weight: 700;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
  }

  .locality-label::before {
    display: none;
  }

  .cluster-icon {
    background: none;
    border: none;
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
  geologicalPeriods: string[];
  geologicalStages: string[];
}

// Couleurs géologiques conventionnelles améliorées
const GEOLOGICAL_COLORS: Record<string, string> = {
  CAMBRIEN: "#1A9D6F",
  ORDOVICIEN: "#B3E1B6",
  SILURIEN: "#E6F4A8",
  DEVONIEN: "#CB8C37",
  CARBONIFERE: "#67A599",
  PERMIEN: "#F04028",
  TRIAS: "#81D2E8",
  JURASSIQUE: "#34B2C9",
  CRETACE: "#7FC64E",
  PALEOGENE: "#FD9A52",
  NEOGENE: "#F9F97F",
  QUATERNAIRE: "#F9F97F",
};

interface ProductMapProps {
  localities: LocalityData[];
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  highlightedLocalityId?: number;
  lang?: "en" | "fr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: any;
  height?: number;
  showLegend?: boolean;
  onLocalitySelect?: (name: string) => void;
  selectedLocalities?: string[];
  flyToLocality?: string;
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
  onLocalitySelect,
  selectedLocalities = [],
  flyToLocality,
}: ProductMapProps) {
  useMapStyles();

  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">(
    "satellite",
  );

  const selectedLocalitiesRef = useRef<string[]>(selectedLocalities);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const clusterLayerRef = useRef<LayerGroup | null>(null);
  const updateClustersRef = useRef<() => void>(() => {});

  // Vérifier si on est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync selectedLocalities ref and refresh cluster markers
  useEffect(() => {
    selectedLocalitiesRef.current = selectedLocalities;
    updateClustersRef.current();
  }, [selectedLocalities]);

  // Fly to locality when flyToLocality prop changes
  useEffect(() => {
    if (flyToLocality && mapRef.current) {
      const loc = localities.find((l) => l.name === flyToLocality);
      if (loc && loc.latitude && loc.longitude) {
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.flyTo(
          [loc.latitude, loc.longitude],
          Math.max(currentZoom, 6),
          { animate: true, duration: 0.8 },
        );
      }
    }
  }, [flyToLocality, localities]);

  // Clustering avec Supercluster
  useEffect(() => {
    if (!mapInstance || localities.length === 0) return;
    const map = mapInstance;

    // Nettoyer l'ancien layer
    if (clusterLayerRef.current) {
      map.removeLayer(clusterLayerRef.current);
    }

    // Index Supercluster
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sc = new Supercluster<{
      id: number;
      name: string;
      geologicalPeriods: string[];
      geologicalStages: string[];
    }>({ radius: 70, maxZoom: 14, minPoints: 2 });
    sc.load(
      localities.map((loc) => ({
        type: "Feature" as const,
        properties: {
          id: loc.id,
          name: loc.name,
          geologicalPeriods: loc.geologicalPeriods,
          geologicalStages: loc.geologicalStages,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [loc.longitude, loc.latitude] as [number, number],
        },
      })),
    );

    const layerGroup = L.layerGroup().addTo(map);
    clusterLayerRef.current = layerGroup;

    const doUpdate = () => {
      layerGroup.clearLayers();
      const bounds = map.getBounds();
      if (!bounds) return;
      const currentZoom = Math.floor(map.getZoom());
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clustersData: any[] = sc.getClusters(bbox, currentZoom);

      clustersData.forEach((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates;
        const props = cluster.properties;

        if (props.cluster) {
          // --- Bulle cluster ---
          const count: number = props.point_count;
          const size = count < 10 ? 34 : count < 50 ? 44 : 56;
          const icon = L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;background:rgba(180,80,40,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${size < 44 ? 11 : 13}px;box-shadow:0 2px 10px rgba(0,0,0,0.4);border:2px solid rgba(255,210,170,0.7);">${count}</div>`,
            className: "cluster-icon",
            iconAnchor: [size / 2, size / 2],
            iconSize: [size, size],
          });
          const marker = L.marker([lat, lng], { icon });
          marker.on("click", () => {
            const expansion = sc.getClusterExpansionZoom(
              (props as { cluster_id: number }).cluster_id,
            );
            map.flyTo([lat, lng], expansion, { animate: true, duration: 0.5 });
          });
          layerGroup.addLayer(marker);
        } else {
          // --- Marqueur individuel ---
          const name: string = props.name;
          const geologicalPeriods: string[] = props.geologicalPeriods || [];
          const geologicalStages: string[] = props.geologicalStages || [];
          const isSelected = selectedLocalitiesRef.current.includes(name);
          const periodColor =
            geologicalPeriods.length > 0
              ? GEOLOGICAL_COLORS[geologicalPeriods[0]] || "#808080"
              : "#808080";

          const marker = L.circleMarker([lat, lng], {
            radius: isSelected ? 10 : 8,
            color: isSelected ? "#FFFFFF" : periodColor,
            fillColor: periodColor,
            weight: isSelected ? 3 : 2,
            fillOpacity: isSelected ? 0.95 : 0.75,
            opacity: 1,
          });

          // Nom permanent
          marker.bindTooltip(name, {
            permanent: true,
            direction: "top",
            className: "locality-label",
            offset: L.point(0, -10),
            opacity: 0.9,
          });

          // Popup riche
          const periodsHtml =
            geologicalPeriods.length > 0
              ? `<div class="flex flex-wrap gap-1 mt-1">${geologicalPeriods
                  .map(
                    (p: string) =>
                      `<span style="background:${GEOLOGICAL_COLORS[p] || "#808080"};color:#fff;font-size:9px;padding:2px 7px;border-radius:10px;font-weight:700">${p}</span>`,
                  )
                  .join("")}</div>`
              : "";
          const stagesHtml =
            geologicalStages.length > 0
              ? `<p style="font-size:10px;color:#666;margin-top:4px">${geologicalStages.join(", ")}</p>`
              : "";
          const loc = localities.find((l) => l.name === name);
          const coordsHtml = loc
            ? `<p style="font-size:10px;color:#888;margin-top:3px">Lat ${loc.latitude.toFixed(3)}° · Lon ${loc.longitude.toFixed(3)}°</p>`
            : "";

          marker.bindPopup(
            `<div style="min-width:140px"><strong style="font-size:13px">${name}</strong>${coordsHtml}${periodsHtml}${stagesHtml}</div>`,
            { maxWidth: 220, closeButton: true },
          );

          marker.on("click", () => {
            if (onLocalitySelect) onLocalitySelect(name);
            marker.openPopup();
          });

          layerGroup.addLayer(marker);
        }
      });
    };

    updateClustersRef.current = doUpdate;
    map.on("moveend", doUpdate);
    map.on("zoomend", doUpdate);
    doUpdate();

    return () => {
      map.off("moveend", doUpdate);
      map.off("zoomend", doUpdate);
      if (clusterLayerRef.current) {
        map.removeLayer(clusterLayerRef.current);
        clusterLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, localities]);

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
              `link[href="${linkElement.href}"]`,
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

  const handleMapTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMapType(event.target.value as "street" | "satellite" | "terrain");
  };

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

  // Créer l'icône dynamique après que Leaflet soit chargé
  const getDynamicIcon = (color: string) =>
    new L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; position: relative;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div style="position: absolute; bottom: -8px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
            </div>`,
      iconSize: [34, 46],
      iconAnchor: [17, 46],
      popupAnchor: [0, -44],
    });

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
              onChange={handleMapTypeChange}
              className="text-xs border rounded px-2 py-1 bg-white shadow-sm"
            >
              <option value="street">{mapDict.street}</option>
              <option value="satellite">{mapDict.satellite}</option>
              <option value="terrain">{mapDict.terrain}</option>
            </select>
          </div>
        </div>

        <MapContainer
          ref={(map: LeafletMap | null) => {
            if (map) {
              mapRef.current = map;
              setMapInstance(map);
            }
          }}
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
                  icon={getDynamicIcon(
                    locality.geologicalPeriods.length > 0
                      ? GEOLOGICAL_COLORS[locality.geologicalPeriods[0]] ||
                          "#808080"
                      : "#808080",
                  )}
                >
                  <Popup
                    className="locality-popup border-0 overflow-hidden"
                    closeButton={true}
                    autoClose={true}
                  >
                    <div
                      className="compact-popup-content overflow-hidden rounded-lg shadow-sm"
                      style={{ margin: "-13px -20px", padding: 0 }}
                    >
                      <div
                        className="p-3 pb-2"
                        style={{
                          backgroundColor:
                            locality.geologicalPeriods.length > 0
                              ? GEOLOGICAL_COLORS[
                                  locality.geologicalPeriods[0]
                                ] || "#808080"
                              : "#808080",
                        }}
                      >
                        <h3 className="font-bold text-white truncate text-base flex items-center gap-2 drop-shadow-md">
                          <MapPin className="w-4 h-4 text-white/90 flex-shrink-0" />
                          {locality.name}
                        </h3>
                      </div>
                      <div className="px-4 py-3 bg-white space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-[10px] px-2 py-0.5 tracking-wider font-semibold shadow-sm"
                            style={{
                              backgroundColor: "var(--terracotta)",
                              color: "white",
                              border: "none",
                            }}
                          >
                            {mapDict.productLocalityBadge}
                          </Badge>
                        </div>

                        <div className="text-slate-600 bg-slate-50 rounded-md p-2 border border-slate-100">
                          <p className="font-bold text-slate-400 text-[9px] uppercase tracking-[0.1em] mb-1">
                            {mapDict.coordinates}
                          </p>
                          <div className="flex gap-4 text-[10px] font-medium text-slate-700">
                            <span>
                              <span className="text-slate-400 font-normal">
                                Lat:
                              </span>{" "}
                              {locality.latitude.toFixed(3)}°
                            </span>
                            <span>
                              <span className="text-slate-400 font-normal">
                                Lon:
                              </span>{" "}
                              {locality.longitude.toFixed(3)}°
                            </span>
                          </div>
                        </div>

                        {locality.geologicalPeriods.length > 0 && (
                          <div>
                            <p className="font-bold text-slate-400 text-[9px] uppercase tracking-[0.1em] mb-1.5 flex items-center gap-1.5">
                              <Layers className="w-3 h-3" />
                              {mapDict.geologicalPeriods}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {locality.geologicalPeriods.map((period) => (
                                <span
                                  key={period}
                                  style={{
                                    backgroundColor:
                                      GEOLOGICAL_COLORS[period] || "#808080",
                                    color: "#fff",
                                    fontSize: "9px",
                                    padding: "3px 8px",
                                    borderRadius: "12px",
                                    fontWeight: "700",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
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
                            <p className="font-bold text-slate-400 text-[9px] uppercase tracking-[0.1em] mb-1.5">
                              {mapDict.geologicalStages}
                            </p>
                            <div className="text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1.5">
                              {locality.geologicalStages.join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
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
