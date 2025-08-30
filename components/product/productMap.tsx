"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { FeatureCollection } from "geojson";

// Correction du marker par défaut (sinon il ne s'affiche pas)
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Mapping simple pour la démo
const GEO_COORDS: Record<string, { lat: number; lon: number }> = {
  Issafen: { lat: 29.5, lon: -8.7 }, // Maroc, Issafen
  Maroc: { lat: 31.8, lon: -7.1 },
  France: { lat: 46.6, lon: 2.4 },
  // Ajoute d'autres localités/pays ici
};

// Exemple de GeoJSON pour France, Maroc, Issafen, Jorf (zones fictives pour la démo)
const demoZones = [
  {
    type: "Feature",
    properties: { name: "France", color: "#3388ff" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [2.0, 51.0],
          [8.0, 51.0],
          [8.0, 42.0],
          [2.0, 42.0],
          [2.0, 51.0],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { name: "Maroc", color: "#F59E42" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-6.0, 35.0],
          [-1.0, 35.0],
          [-1.0, 28.0],
          [-6.0, 28.0],
          [-6.0, 35.0],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { name: "Issafen", color: "#ff0000" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-8.8, 29.6],
          [-8.6, 29.6],
          [-8.6, 29.4],
          [-8.8, 29.4],
          [-8.8, 29.6],
        ],
      ],
    },
  },
  {
    type: "Feature",
    properties: { name: "Jorf", color: "#00bb00" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-7.2, 30.5],
          [-7.0, 30.5],
          [-7.0, 30.3],
          [-7.2, 30.3],
          [-7.2, 30.5],
        ],
      ],
    },
  },
];

interface ProductMapProps {
  country: string;
  locality?: string;
}

export default function ProductMap({ country, locality }: ProductMapProps) {
  const coords = (locality && GEO_COORDS[locality]) ||
    GEO_COORDS[country] || { lat: 20, lon: 0 }; // fallback: Afrique du Nord

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
        center={[coords.lat, coords.lon]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true} // Active le zoom à la molette
        dragging={true} // Active le déplacement de la carte
        doubleClickZoom={true} // Active le zoom au double-clic
        zoomControl={true} // Affiche les boutons +/-
        attributionControl={false}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[coords.lat, coords.lon]}>
          <Popup>{locality ? `${locality}, ${country}` : country}</Popup>
        </Marker>
        <GeoJSON
          data={
            {
              type: "FeatureCollection",
              features: demoZones,
            } as FeatureCollection
          } // <-- cast ici
          style={(feature) => ({
            color: feature?.properties?.color || "#3388ff",
            weight: 2,
            fillOpacity: 0.2,
          })}
        />
      </MapContainer>
    </div>
  );
}
