import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useView, resolveTemplates, useViewEvents } from "@chuk/view-shared";
import {
  BASEMAPS,
  fixLeafletIcons,
  injectLeafletThemeStyles,
  createGeoJSONOptions,
  buildPopupHtml,
} from "@chuk/view-shared/leaflet";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import type { MapContent, MapLayer, PopupAction } from "./schema";

fixLeafletIcons();

/* ------------------------------------------------------------------ */
/*  Layer control mode                                                 */
/* ------------------------------------------------------------------ */

type LayerControlMode = "leaflet" | "panel" | "none";

function resolveLayerMode(
  controlsLayers: boolean | "leaflet" | "panel" | "none" | undefined,
  layerCount: number,
): LayerControlMode {
  if (controlsLayers === "panel") return "panel";
  if (controlsLayers === "none" || controlsLayers === false) return "none";
  if (controlsLayers === "leaflet" || controlsLayers === true) return "leaflet";
  return layerCount > 1 ? "leaflet" : "none";
}

/* ------------------------------------------------------------------ */
/*  Layer visibility state (panel mode)                                */
/* ------------------------------------------------------------------ */

interface LayerVisibility {
  visible: boolean;
  opacity: number;
}

/* ------------------------------------------------------------------ */
/*  Top-level View component                                           */
/* ------------------------------------------------------------------ */

export function MapView() {
  const { data, app, callTool, updateModelContext, requestDisplayMode, displayMode } =
    useView<MapContent>("map", "1.0");

  // Backward compat: accept type:"layers" data and treat as panel mode
  const normalizedData = useMemo(() => {
    if (!data) return null;
    if ((data as unknown as Record<string, unknown>).type === "layers") {
      return {
        ...data,
        type: "map" as const,
        controls: { ...data.controls, layers: "panel" as const },
      };
    }
    return data;
  }, [data]);

  if (!normalizedData) return null;

  return (
    <LeafletMap
      data={normalizedData}
      app={app}
      onCallTool={callTool}
      onUpdateModelContext={updateModelContext}
      onRequestDisplayMode={requestDisplayMode}
      displayMode={displayMode}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export interface LeafletMapProps {
  data: MapContent;
  app: unknown;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
  onUpdateModelContext?: (params: { content?: Array<{ type: string; text: string }> }) => Promise<void>;
  onRequestDisplayMode?: (mode: "inline" | "fullscreen" | "pip") => Promise<string>;
  displayMode?: "inline" | "fullscreen" | "pip" | null;
}

export function LeafletMap({ data, onCallTool, onUpdateModelContext, onRequestDisplayMode, displayMode }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Map<string, L.Layer>>(new Map());
  const featureLayersRef = useRef<Map<string, L.Layer>>(new Map());
  const [panelId, setPanelId] = useState<string | null>(null);
  const { emitSelect } = useViewEvents();

  const controlMode = resolveLayerMode(data.controls?.layers, data.layers.length);

  // --- Panel mode state ---
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

  // Recompute layer state when data changes
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

  const groupedLayers = useMemo(() => {
    const groups = new Map<string, MapLayer[]>();
    for (const layer of data.layers) {
      const groupName = layer.group ?? "";
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(layer);
    }
    return groups;
  }, [data.layers]);

  const toggleVisibility = useCallback((id: string) => {
    setLayerState((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id]?.visible },
    }));
  }, []);

  const setOpacity = useCallback((id: string, opacity: number) => {
    setLayerState((prev) => ({
      ...prev,
      [id]: { ...prev[id], opacity },
    }));
  }, []);

  // --- Popup actions ---
  const handleAction = useCallback(
    async (action: PopupAction, properties: Record<string, unknown>) => {
      if (action.confirm && !window.confirm(action.confirm)) return;
      const resolved = resolveTemplates(action.arguments, { properties });
      await onCallTool(action.tool, resolved);
    },
    [onCallTool],
  );

  // --- Cross-View messaging ---
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.__chuk_panel_id && !panelId) {
        setPanelId(msg.__chuk_panel_id);
      }

      if (msg.__chuk_event === "row-click" || msg.__chuk_event === "feature-click") {
        const id = String(msg.nhle_id ?? msg.id ?? "");
        if (!id) return;
        const layer = featureLayersRef.current.get(id);
        const map = mapRef.current;
        if (layer && map) {
          if ("getLatLng" in layer) {
            map.panTo((layer as L.Marker).getLatLng());
            (layer as L.Marker).openPopup();
          }
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [panelId]);

  // --- Initialize map ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = data.center
      ? [data.center.lat, data.center.lon]
      : [51.505, -0.09];

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: data.zoom ?? 10,
      zoomControl: data.controls?.zoom !== false,
    });

    const basemapUrl = BASEMAPS[data.basemap ?? "osm"] ?? BASEMAPS.osm;
    L.tileLayer(basemapUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (data.controls?.scale !== false) {
      L.control.scale().addTo(map);
    }

    mapRef.current = map;
    injectLeafletThemeStyles(containerRef.current);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupsRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Update layers when data changes ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    for (const group of layerGroupsRef.current.values()) {
      map.removeLayer(group);
    }
    layerGroupsRef.current.clear();

    const allBounds = L.latLngBounds([]);
    const useLeafletControl = controlMode === "leaflet" && data.layers.length > 1;
    const leafletControl = useLeafletControl ? L.control.layers() : null;

    featureLayersRef.current.clear();

    for (const layer of data.layers) {
      const group = createLayerGroup(layer, handleAction, featureLayersRef.current, panelId, emitSelect);

      // In panel mode, don't auto-add layers — the sync effect handles it
      if (controlMode !== "panel" && layer.visible !== false) {
        group.addTo(map);
      }

      layerGroupsRef.current.set(layer.id, group);

      if (leafletControl) {
        leafletControl.addOverlay(group, layer.label);
      }

      // Extend bounds
      const lt = layer.layer_type ?? "geojson";
      if (lt === "geojson" && layer.features?.features?.length) {
        const geojsonLayer = L.geoJSON(layer.features);
        const layerBounds = geojsonLayer.getBounds();
        if (layerBounds.isValid()) {
          allBounds.extend(layerBounds);
        }
      } else if (lt === "image" && layer.image_bounds) {
        allBounds.extend(layer.image_bounds as L.LatLngBoundsLiteral);
      }
    }

    if (leafletControl) {
      leafletControl.addTo(map);
    }

    // Fit map to data
    if (data.bounds) {
      map.fitBounds([
        [data.bounds.south, data.bounds.west],
        [data.bounds.north, data.bounds.east],
      ]);
    } else if (!data.center && !data.zoom && allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [20, 20] });
    } else if (data.center) {
      map.setView([data.center.lat, data.center.lon], data.zoom ?? 10);
    }
  }, [data, handleAction, panelId, emitSelect, controlMode]);

  // --- Panel mode: sync visibility and opacity ---
  useEffect(() => {
    if (controlMode !== "panel") return;
    const map = mapRef.current;
    if (!map) return;

    for (const [id, group] of layerGroupsRef.current.entries()) {
      const state = layerState[id];
      if (!state) continue;

      if (state.visible) {
        if (!map.hasLayer(group)) {
          (group as L.LayerGroup).addTo(map);
        }
        // Apply opacity to sublayers
        if ("eachLayer" in group) {
          (group as L.LayerGroup).eachLayer((sublayer) => {
            if ("setOpacity" in sublayer && typeof (sublayer as L.Marker).setOpacity === "function") {
              (sublayer as L.Marker).setOpacity(state.opacity);
            }
            if ("setStyle" in sublayer && typeof (sublayer as L.Path).setStyle === "function") {
              (sublayer as L.Path).setStyle({
                opacity: state.opacity,
                fillOpacity: state.opacity * getLayerFillOpacity(data.layers, id),
              });
            }
          });
        }
      } else {
        if (map.hasLayer(group)) {
          map.removeLayer(group);
        }
      }
    }
  }, [layerState, data.layers, controlMode]);

  // --- Push map state to LLM model context ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onUpdateModelContext) return;

    let timer: ReturnType<typeof setTimeout>;
    const handleMoveEnd = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const zoom = map.getZoom();
        onUpdateModelContext({
          content: [{
            type: "text",
            text: `Map view: center ${center.lat.toFixed(4)},${center.lng.toFixed(4)} zoom ${zoom} bounds ${bounds.getSouth().toFixed(4)},${bounds.getWest().toFixed(4)} to ${bounds.getNorth().toFixed(4)},${bounds.getEast().toFixed(4)}`,
          }],
        });
      }, 500);
    };

    map.on("moveend", handleMoveEnd);
    handleMoveEnd();

    return () => {
      clearTimeout(timer);
      map.off("moveend", handleMoveEnd);
    };
  }, [onUpdateModelContext]);

  return (
    <div className="relative w-full h-full font-sans">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Title bar */}
      {data.title && (
        <div className="absolute top-3 left-3 z-[1000] px-3 py-1.5 rounded-md bg-background/90 backdrop-blur-sm border border-border shadow-sm">
          <h2 className="text-sm font-semibold text-foreground truncate">{data.title}</h2>
        </div>
      )}

      {/* Panel layer control */}
      {controlMode === "panel" && data.layers.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000]">
          <Card className="w-64 max-h-[calc(100vh-24px)] shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3">
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

      {/* Fullscreen toggle */}
      {onRequestDisplayMode && (
        <button
          onClick={() => onRequestDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen")}
          className="absolute top-2 right-2 z-[1000] px-2 py-1 text-xs rounded bg-background/80 border border-border hover:bg-muted backdrop-blur-sm"
          style={controlMode === "panel" ? { right: "auto", left: "8px", top: data.title ? "48px" : "8px" } : undefined}
          title={displayMode === "fullscreen" ? "Exit fullscreen" : "Fullscreen"}
          aria-label={displayMode === "fullscreen" ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {displayMode === "fullscreen" ? "\u2199 Exit" : "\u26F6 Fullscreen"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MapRenderer (SSR / compose)                                        */
/* ------------------------------------------------------------------ */

export interface MapRendererProps {
  data: MapContent;
}

export function MapRenderer({ data }: MapRendererProps) {
  return <LeafletMap data={data} app={null} onCallTool={async () => {}} />;
}

/* ------------------------------------------------------------------ */
/*  Layer control item (panel mode)                                    */
/* ------------------------------------------------------------------ */

interface LayerControlProps {
  layer: MapLayer;
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
            visible ? "text-foreground" : "text-muted-foreground",
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

function getLayerFillOpacity(layers: MapLayer[], id: string): number {
  const layer = layers.find((l) => l.id === id);
  return layer?.style?.fillOpacity ?? 0.3;
}

function createLayerGroup(
  layer: MapLayer,
  onAction: (action: PopupAction, properties: Record<string, unknown>) => void,
  featureLayers: Map<string, L.Layer>,
  panelId: string | null,
  emitSelect: (ids: string[], field?: string) => void,
): L.Layer {
  const layerType = layer.layer_type ?? "geojson";

  // --- Image overlay ---
  if (layerType === "image") {
    if (!layer.image_url || !layer.image_bounds) return L.layerGroup();
    return L.imageOverlay(layer.image_url, layer.image_bounds as L.LatLngBoundsLiteral, {
      opacity: layer.opacity ?? 1.0,
    });
  }

  // --- XYZ tile layer ---
  if (layerType === "tiles") {
    if (!layer.tile_url) return L.layerGroup();
    return L.tileLayer(layer.tile_url, {
      attribution: layer.tile_attribution ?? "",
      minZoom: layer.tile_min_zoom ?? 0,
      maxZoom: layer.tile_max_zoom ?? 22,
      opacity: layer.opacity ?? 1.0,
    });
  }

  // --- GeoJSON (default) ---
  const style = layer.style ?? {};
  const geoOptions = createGeoJSONOptions(style);

  function handleEachFeature(feature: GeoJSON.Feature, leafletLayer: L.Layer) {
    const props = feature.properties ?? {};
    bindPopup(leafletLayer, props, layer.popup, onAction);

    // Track feature layer by ID for cross-View highlighting
    const featureId = String(props.nhle_id ?? props.id ?? "");
    if (featureId) {
      featureLayers.set(featureId, leafletLayer);

      leafletLayer.on("click", () => {
        emitSelect([featureId], "feature_id");

        if (panelId) {
          window.parent.postMessage(
            {
              __chuk_panel_id: panelId,
              __chuk_event: "feature-click",
              nhle_id: featureId,
              properties: props,
            },
            window.location.origin,
          );
        }
      });
    }
  }

  const features = layer.features ?? { type: "FeatureCollection", features: [] };

  if (layer.cluster?.enabled) {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: layer.cluster.radius ?? 50,
    });

    const geojson = L.geoJSON(features, {
      pointToLayer: geoOptions.pointToLayer,
      style: geoOptions.style,
      onEachFeature: handleEachFeature,
    });

    clusterGroup.addLayer(geojson);
    return clusterGroup;
  }

  return L.geoJSON(features, {
    pointToLayer: geoOptions.pointToLayer,
    style: geoOptions.style,
    onEachFeature: handleEachFeature,
  });
}

function bindPopup(
  leafletLayer: L.Layer,
  properties: Record<string, unknown>,
  popup: MapLayer["popup"],
  onAction: (action: PopupAction, properties: Record<string, unknown>) => void,
) {
  if (!popup) return;

  const html = buildPopupHtml(properties, popup);
  leafletLayer.bindPopup(html);

  if (popup.actions && popup.actions.length > 0) {
    leafletLayer.on("popupopen", (e) => {
      const container = (e as L.PopupEvent).popup.getElement();
      if (!container) return;
      const buttons = container.querySelectorAll(".popup-action");
      buttons.forEach((btn) => {
        const idx = parseInt(btn.getAttribute("data-action-index") ?? "0", 10);
        const action = popup.actions![idx];
        if (action) {
          btn.addEventListener("click", () => onAction(action, properties));
        }
      });
    });
  }
}
