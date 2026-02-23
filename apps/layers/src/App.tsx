import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { LayersContent, LayerDef, LayerPopup } from "./schema";

// Fix Leaflet default icon paths (broken when bundled)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

/* ------------------------------------------------------------------ */
/*  Basemap tile URLs                                                  */
/* ------------------------------------------------------------------ */

const BASEMAPS: Record<string, string> = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

/* ------------------------------------------------------------------ */
/*  Top-level View component                                           */
/* ------------------------------------------------------------------ */

export function LayersView() {
  const { data } = useView<LayersContent>("layers", "1.0");

  if (!data) return null;

  return <LayersRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Layer visibility state                                             */
/* ------------------------------------------------------------------ */

interface LayerVisibility {
  visible: boolean;
  opacity: number;
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                           */
/* ------------------------------------------------------------------ */

export interface LayersRendererProps {
  data: LayersContent;
}

export function LayersRenderer({ data }: LayersRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());

  // Track visibility + opacity per layer
  const [layerState, setLayerState] = useState<Record<string, LayerVisibility>>(() => {
    const initial: Record<string, LayerVisibility> = {};
    for (const layer of data.layers) {
      initial[layer.id] = {
        visible: layer.visible !== false,
        opacity: layer.opacity ?? 1,
      };
    }
    return initial;
  });

  // Recompute when data changes
  useEffect(() => {
    const next: Record<string, LayerVisibility> = {};
    for (const layer of data.layers) {
      next[layer.id] = {
        visible: layer.visible !== false,
        opacity: layer.opacity ?? 1,
      };
    }
    setLayerState(next);
  }, [data]);

  // Group layers by group field
  const groupedLayers = useMemo(() => {
    const groups = new Map<string, LayerDef[]>();
    for (const layer of data.layers) {
      const groupName = layer.group ?? "";
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(layer);
    }
    return groups;
  }, [data.layers]);

  // Toggle visibility
  const toggleVisibility = useCallback((id: string) => {
    setLayerState((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id]?.visible },
    }));
  }, []);

  // Set opacity
  const setOpacity = useCallback((id: string, opacity: number) => {
    setLayerState((prev) => ({
      ...prev,
      [id]: { ...prev[id], opacity },
    }));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = data.center
      ? [data.center.lat, data.center.lon]
      : [51.505, -0.09];

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: data.zoom ?? 10,
      zoomControl: true,
    });

    const basemapUrl = BASEMAPS[data.basemap ?? "osm"] ?? BASEMAPS.osm;
    L.tileLayer(basemapUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.scale().addTo(map);

    mapRef.current = map;
    injectLeafletThemeStyles(containerRef.current);

    return () => {
      map.remove();
      mapRef.current = null;
      leafletLayersRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update layers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old GeoJSON layers
    for (const geojsonLayer of leafletLayersRef.current.values()) {
      map.removeLayer(geojsonLayer);
    }
    leafletLayersRef.current.clear();

    const allBounds = L.latLngBounds([]);

    for (const layer of data.layers) {
      const geojsonLayer = createGeoJSONLayer(layer);
      leafletLayersRef.current.set(layer.id, geojsonLayer);

      // Extend bounds
      const layerBounds = geojsonLayer.getBounds();
      if (layerBounds.isValid()) {
        allBounds.extend(layerBounds);
      }
    }

    // Fit map to data if no explicit center/zoom
    if (!data.center && !data.zoom && allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [20, 20] });
    } else if (data.center) {
      map.setView([data.center.lat, data.center.lon], data.zoom ?? 10);
    }
  }, [data]);

  // Sync visibility and opacity from state to Leaflet layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, geojsonLayer] of leafletLayersRef.current.entries()) {
      const state = layerState[id];
      if (!state) continue;

      if (state.visible) {
        if (!map.hasLayer(geojsonLayer)) {
          geojsonLayer.addTo(map);
        }
        // Apply opacity to each sublayer
        geojsonLayer.eachLayer((sublayer) => {
          if ("setOpacity" in sublayer && typeof (sublayer as L.Marker).setOpacity === "function") {
            (sublayer as L.Marker).setOpacity(state.opacity);
          }
          if ("setStyle" in sublayer && typeof (sublayer as L.Path).setStyle === "function") {
            (sublayer as L.Path).setStyle({
              opacity: state.opacity,
              fillOpacity: state.opacity * (getLayerFillOpacity(data.layers, id)),
            });
          }
        });
      } else {
        if (map.hasLayer(geojsonLayer)) {
          map.removeLayer(geojsonLayer);
        }
      }
    }
  }, [layerState, data.layers]);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="relative w-full h-full font-sans">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Layer control panel */}
      {data.layers.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000]">
          <Card className="w-64 max-h-[calc(100vh-24px)] shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3">
              {data.title && (
                <h2 className="text-sm font-semibold mb-2 text-foreground truncate">
                  {data.title}
                </h2>
              )}
              <ScrollArea className="max-h-80">
                <div className="space-y-1">
                  {Array.from(groupedLayers.entries()).map(([groupName, layers]) => (
                    <div key={groupName}>
                      {groupName && (
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2 mb-1 px-1">
                          {groupName}
                        </div>
                      )}
                      {layers.map((layer) => {
                        const state = layerState[layer.id];
                        if (!state) return null;
                        return (
                          <LayerControl
                            key={layer.id}
                            layer={layer}
                            visible={state.visible}
                            opacity={state.opacity}
                            onToggle={() => toggleVisibility(layer.id)}
                            onOpacityChange={(val) => setOpacity(layer.id, val)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layer control item                                                 */
/* ------------------------------------------------------------------ */

interface LayerControlProps {
  layer: LayerDef;
  visible: boolean;
  opacity: number;
  onToggle: () => void;
  onOpacityChange: (value: number) => void;
}

function LayerControl({ layer, visible, opacity, onToggle, onOpacityChange }: LayerControlProps) {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div className="rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`layer-toggle-${layer.id}`}
          checked={visible}
          onChange={onToggle}
          className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
          aria-label={`Toggle ${layer.label}`}
        />
        <label
          htmlFor={`layer-toggle-${layer.id}`}
          className={cn(
            "flex-1 text-xs cursor-pointer select-none truncate",
            visible ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {layer.label}
        </label>
        {layer.style?.color && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: layer.style.color }}
          />
        )}
        <button
          type="button"
          onClick={() => setShowSlider((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground text-xs leading-none flex-shrink-0"
          aria-label={`Opacity for ${layer.label}`}
          title="Adjust opacity"
        >
          {"\u25CE"}
        </button>
      </div>
      {showSlider && (
        <div className="mt-1.5 pl-6 pr-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1 accent-primary cursor-pointer"
            aria-label={`Opacity slider for ${layer.label}`}
          />
          <div className="text-[10px] text-muted-foreground text-right">
            {Math.round(opacity * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getLayerFillOpacity(layers: LayerDef[], id: string): number {
  const layer = layers.find((l) => l.id === id);
  return layer?.style?.fillOpacity ?? 0.3;
}

function createGeoJSONLayer(layer: LayerDef): L.GeoJSON {
  const style = layer.style ?? {};

  const geojsonStyle = () => ({
    color: style.color ?? "#3388ff",
    weight: style.weight ?? 2,
    fillColor: style.fillColor ?? style.color ?? "#3388ff",
    fillOpacity: style.fillOpacity ?? 0.3,
  });

  const pointToLayer = (_feature: GeoJSON.Feature, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 6,
      color: style.color ?? "#3388ff",
      weight: style.weight ?? 2,
      fillColor: style.fillColor ?? style.color ?? "#3388ff",
      fillOpacity: style.fillOpacity ?? 0.3,
    });
  };

  return L.geoJSON(layer.features as GeoJSON.GeoJsonObject, {
    pointToLayer,
    style: geojsonStyle,
    onEachFeature: (feature, leafletLayer) => {
      bindPopup(leafletLayer, feature.properties ?? {}, layer.popup);
    },
  });
}

function bindPopup(
  leafletLayer: L.Layer,
  properties: Record<string, unknown>,
  popup?: LayerPopup
) {
  if (!popup) return;

  const titleText = resolveSimpleTemplate(popup.title, properties);
  let html = `<div style="min-width:150px"><strong>${escapeHtml(titleText)}</strong>`;

  if (popup.fields) {
    for (const field of popup.fields) {
      const val = properties[field];
      if (val !== undefined && val !== null) {
        html += `<div style="margin:2px 0;font-size:13px"><span class="popup-field-label">${escapeHtml(field)}:</span> ${escapeHtml(String(val))}</div>`;
      }
    }
  }

  html += "</div>";
  leafletLayer.bindPopup(html);
}

/**
 * Resolve simple `{property}` or `{properties.key}` templates from a
 * flat properties object.
 */
function resolveSimpleTemplate(
  template: string,
  properties: Record<string, unknown>
): string {
  return template.replace(/\{(?:properties\.)?(\w+)\}/g, (_match, key) => {
    const val = properties[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

function injectLeafletThemeStyles(container: HTMLElement) {
  const id = "chuk-leaflet-layers-theme";
  if (container.querySelector(`#${id}`)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .leaflet-popup-content-wrapper {
      background: var(--chuk-color-background, #fff);
      color: var(--chuk-color-text, #1a1a1a);
      border: 1px solid var(--chuk-color-border, #e0e0e0);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .leaflet-popup-tip {
      background: var(--chuk-color-background, #fff);
    }
    .popup-field-label {
      color: var(--chuk-color-text-secondary, #888);
    }
  `;
  container.appendChild(style);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
