import L from "leaflet";
import type { LeafletLayerStyle } from "./types";

const DEFAULTS = {
  color: "#3388ff",
  weight: 2,
  fillOpacity: 0.3,
};

/**
 * Create Leaflet GeoJSON options (pointToLayer + style) from a layer style config.
 * When `style.radius` is set, points render as circleMarkers; otherwise as default markers.
 */
export function createGeoJSONOptions(style: LeafletLayerStyle = {}): {
  pointToLayer: (feature: GeoJSON.Feature, latlng: L.LatLng) => L.Layer;
  style: () => L.PathOptions;
} {
  const pointToLayer = (feature: GeoJSON.Feature, latlng: L.LatLng) => {
    if (style.radius) {
      return L.circleMarker(latlng, {
        radius: style.radius,
        color: style.color ?? DEFAULTS.color,
        weight: style.weight ?? DEFAULTS.weight,
        fillColor: style.fillColor ?? style.color ?? DEFAULTS.color,
        fillOpacity: style.fillOpacity ?? DEFAULTS.fillOpacity,
      });
    }
    // Per-feature icon (from properties) takes priority over layer-level icon
    const iconUrl = feature.properties?.icon ?? style.icon;
    if (iconUrl) {
      const customIcon = L.icon({
        iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
      return L.marker(latlng, { icon: customIcon });
    }
    return L.marker(latlng);
  };

  const layerStyle = (): L.PathOptions => ({
    color: style.color ?? DEFAULTS.color,
    weight: style.weight ?? DEFAULTS.weight,
    fillColor: style.fillColor ?? style.color ?? DEFAULTS.color,
    fillOpacity: style.fillOpacity ?? DEFAULTS.fillOpacity,
  });

  return { pointToLayer, style: layerStyle };
}
