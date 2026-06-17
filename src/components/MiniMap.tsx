"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Petite carte 2D claire (façon Google Maps) sans clé API : Leaflet + fond Carto.
// La position est approximative (niveau ville) → on dessine une zone (cercle)
// plutôt qu'un point exact, pour la confidentialité du logement.
export default function MiniMap({
  lat,
  lng,
  className = "",
}: {
  lat: number;
  lng: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (annule || !ref.current || mapRef.current) return;

      const map = L.map(ref.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      // Fond de carte clair et épuré (Carto Positron) — gratuit, sans clé
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap &copy; CARTO",
        }
      ).addTo(map);

      // Zone approximative (rayon ~600 m) plutôt qu'un point précis
      L.circle([lat, lng], {
        radius: 600,
        color: "#2563eb",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 0.12,
      }).addTo(map);

      // La carte est parfois dans un conteneur masqué au montage → on recalcule
      setTimeout(() => map.invalidateSize(), 150);
    })();

    return () => {
      annule = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={ref} className={className} />;
}
