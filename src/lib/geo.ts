// Outils géographiques : géocodage (ville → coordonnées) + distance.

export type Coord = { lat: number; lng: number };

// Transforme une ville (+ département) en coordonnées via l'API officielle gratuite.
export async function geocodeVille(
  ville: string,
  departement?: string
): Promise<Coord | null> {
  const q = (ville || "").trim();
  if (!q) return null;
  try {
    const r = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        q
      )}&type=municipality&limit=5`
    );
    const d = await r.json();
    const feats = d.features ?? [];
    // Si un département est précisé, on privilégie la commune de ce département
    const f =
      (departement &&
        feats.find(
          (x: { properties?: { postcode?: string; citycode?: string } }) =>
            (x.properties?.postcode || x.properties?.citycode || "").startsWith(
              departement
            )
        )) ||
      feats[0];
    if (!f?.geometry?.coordinates) return null;
    const [lng, lat] = f.geometry.coordinates;
    return { lat, lng };
  } catch {
    return null;
  }
}

// Géocodage INVERSE : coordonnées GPS → ville + département (API gratuite gouv).
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ ville: string; departement: string } | null> {
  try {
    const r = await fetch(
      `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`
    );
    const d = await r.json();
    const p = d.features?.[0]?.properties;
    if (!p) return null;
    const ville = p.city || p.name || "";
    // context = "75, Paris, Île-de-France" → 1er élément = code département
    const departement = String(p.context || "").split(",")[0].trim();
    if (!ville || !departement) return null;
    return { ville, departement };
  } catch {
    return null;
  }
}

// Distance à vol d'oiseau (km) entre deux points (formule de haversine).
export function distanceKm(a: Coord, b: Coord): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
