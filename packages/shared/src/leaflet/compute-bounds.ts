import L from "leaflet";

/**
 * Compute the aggregate bounds of an array of GeoJSON-like layer objects.
 * Returns null if no valid bounds are found.
 */
export function computeLayerBounds(
  layers: Array<{ features?: unknown }>,
): L.LatLngBounds | null {
  const allBounds = L.latLngBounds([]);
  for (const layer of layers) {
    if (!layer.features) continue;
    try {
      const geojsonLayer = L.geoJSON(layer.features as GeoJSON.GeoJsonObject);
      const layerBounds = geojsonLayer.getBounds();
      if (layerBounds.isValid()) {
        allBounds.extend(layerBounds);
      }
    } catch {
      // skip invalid GeoJSON gracefully
    }
  }
  return allBounds.isValid() ? allBounds : null;
}
