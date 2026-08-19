"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  mapOnly?: boolean;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  mapOnly = false,
}: LocationPickerProps) {
  if (mapOnly) {
    return <MapPanel latitude={latitude} longitude={longitude} onChange={onChange} />;
  }

  return (
    <div className="space-y-3">
      <ManualInputs latitude={latitude} longitude={longitude} onChange={onChange} />
      <p className="text-xs" style={{ color: "#9CA3AF" }}>
        Or click on the map on the right to set the location automatically.
      </p>
      {(latitude !== 0 || longitude !== 0) && (
        <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#19C3B1" }}>
          <MapPin className="h-3 w-3" />
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}

// ── Manual inputs ──────────────────────────────────────────
export function ManualInputs({
  latitude,
  longitude,
  onChange,
}: Omit<LocationPickerProps, "mapOnly">) {
  const [lat, setLat] = useState(latitude === 0 ? "" : String(latitude));
  const [lng, setLng] = useState(longitude === 0 ? "" : String(longitude));

  useEffect(() => {
    if (latitude !== 0) setLat(String(latitude));
    if (longitude !== 0) setLng(String(longitude));
  }, [latitude, longitude]);

  const inputClass =
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#19C3B1] focus:ring-2 focus:ring-[#19C3B1]/20";
  const inputStyle = { borderColor: "rgba(11,31,51,0.15)", color: "#0B1F33" };

  const commit = (newLat: string, newLng: string) => {
    const parsedLat = parseFloat(newLat);
    const parsedLng = parseFloat(newLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange(parsedLat, parsedLng);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "#374151" }}>
          Latitude
        </label>
        <input
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          onBlur={() => commit(lat, lng)}
          placeholder="23.8103"
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "#374151" }}>
          Longitude
        </label>
        <input
          type="number"
          step="any"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          onBlur={() => commit(lat, lng)}
          placeholder="90.4125"
          className={inputClass}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

// ── Map panel ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap    = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMarker = any;

export function MapPanel({
  latitude,
  longitude,
  onChange,
}: Omit<LocationPickerProps, "mapOnly">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap>(null);
  const markerRef    = useRef<LeafletMarker>(null);

  // Sync marker when parent updates coords (manual input)
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (latitude === 0 && longitude === 0) return;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.panTo([latitude, longitude]);
  }, [latitude, longitude]);

  useEffect(() => {
    let cleanup = () => {};

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (await import("leaflet")).default as any;

      // Fix webpack broken icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current || mapRef.current) return;

      const defaultLat = latitude !== 0 ? latitude : 23.8103;
      const defaultLng = longitude !== 0 ? longitude : 90.4125;

      const map = L.map(containerRef.current).setView([defaultLat, defaultLng], 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (latitude !== 0 || longitude !== 0) {
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
      });

      cleanup = () => {
        map.remove();
        mapRef.current    = null;
        markerRef.current = null;
      };
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2 h-full">
      {/* Leaflet CSS */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border"
        style={{ height: "100%", minHeight: "400px", borderColor: "rgba(11,31,51,0.15)" }}
      />
      <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
        Click on the map to set location
      </p>
    </div>
  );
}
