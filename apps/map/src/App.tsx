import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useView, Fallback, resolveTemplates } from "@chuk/view-shared";
import type { MapContent, MapLayer, PopupAction } from "./schema";

// Fix Leaflet default icon paths (broken when bundled)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const BASEMAPS: Record<string, string> = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

export function MapView() {
  const { data, content, app, callTool, isConnected } =
    useView<MapContent>("map", "1.0");

  if (!isConnected) {
    return <Fallback message="Connecting..." />;
  }

  if (!data) {
    return <Fallback content={content ?? undefined} />;
  }

  return <LeafletMap data={data} app={app} onCallTool={callTool} />;
}

export interface LeafletMapProps {
  data: MapContent;
  app: unknown;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function LeafletMap({ data, onCallTool }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Map<string, L.LayerGroup>>(new Map());
  const featureLayersRef = useRef<Map<string, L.Layer>>(new Map());
  const [panelId, setPanelId] = useState<string | null>(null);

  const handleAction = useCallback(
    async (action: PopupAction, properties: Record<string, unknown>) => {
      if (action.confirm && !window.confirm(action.confirm)) return;
      const resolved = resolveTemplates(action.arguments, { properties });
      await onCallTool(action.tool, resolved);
    },
    [onCallTool]
  );

  // Cross-View messaging: listen for row-click from other panels
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Capture panel ID from dashboard's initial postMessage
      if (msg.__chuk_panel_id && !panelId) {
        setPanelId(msg.__chuk_panel_id);
      }

      // Handle row-click from datatable
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

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupsRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update layers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    for (const group of layerGroupsRef.current.values()) {
      map.removeLayer(group);
    }
    layerGroupsRef.current.clear();

    const allBounds = L.latLngBounds([]);
    const layerControl =
      data.layers.length > 1 && data.controls?.layers !== false
        ? L.control.layers()
        : null;

    featureLayersRef.current.clear();

    for (const layer of data.layers) {
      const group = createLayerGroup(layer, handleAction, featureLayersRef.current, panelId);

      if (layer.visible !== false) {
        group.addTo(map);
      }

      layerGroupsRef.current.set(layer.id, group);

      if (layerControl) {
        layerControl.addOverlay(group, layer.label);
      }

      // Extend bounds
      if (layer.features.features.length > 0) {
        const geojsonLayer = L.geoJSON(layer.features);
        const layerBounds = geojsonLayer.getBounds();
        if (layerBounds.isValid()) {
          allBounds.extend(layerBounds);
        }
      }
    }

    if (layerControl) {
      layerControl.addTo(map);
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
  }, [data, handleAction, panelId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full font-sans"
    />
  );
}

function createLayerGroup(
  layer: MapLayer,
  onAction: (action: PopupAction, properties: Record<string, unknown>) => void,
  featureLayers: Map<string, L.Layer>,
  panelId: string | null
): L.LayerGroup {
  const style = layer.style ?? {};

  function handleEachFeature(feature: GeoJSON.Feature, leafletLayer: L.Layer) {
    const props = feature.properties ?? {};
    bindPopup(leafletLayer, props, layer.popup, onAction);

    // Track feature layer by ID for cross-View highlighting
    const featureId = String(props.nhle_id ?? props.id ?? "");
    if (featureId) {
      featureLayers.set(featureId, leafletLayer);

      // Emit feature-click for cross-View communication
      leafletLayer.on("click", () => {
        if (panelId) {
          window.parent.postMessage(
            {
              __chuk_panel_id: panelId,
              __chuk_event: "feature-click",
              nhle_id: featureId,
              properties: props,
            },
            "*"
          );
        }
      });
    }
  }

  const pointToLayer = (_feature: GeoJSON.Feature, latlng: L.LatLng) => {
    if (style.radius) {
      return L.circleMarker(latlng, {
        radius: style.radius,
        color: style.color ?? "#3388ff",
        weight: style.weight ?? 2,
        fillColor: style.fillColor ?? style.color ?? "#3388ff",
        fillOpacity: style.fillOpacity ?? 0.3,
      });
    }
    return L.marker(latlng);
  };

  const layerStyle = () => ({
    color: style.color ?? "#3388ff",
    weight: style.weight ?? 2,
    fillColor: style.fillColor ?? style.color ?? "#3388ff",
    fillOpacity: style.fillOpacity ?? 0.3,
  });

  if (layer.cluster?.enabled) {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: layer.cluster.radius ?? 50,
    });

    const geojson = L.geoJSON(layer.features, {
      pointToLayer,
      style: layerStyle,
      onEachFeature: handleEachFeature,
    });

    clusterGroup.addLayer(geojson);
    return clusterGroup;
  }

  return L.geoJSON(layer.features, {
    pointToLayer,
    style: layerStyle,
    onEachFeature: handleEachFeature,
  });
}

function bindPopup(
  leafletLayer: L.Layer,
  properties: Record<string, unknown>,
  popup: MapLayer["popup"],
  onAction: (action: PopupAction, properties: Record<string, unknown>) => void
) {
  if (!popup) return;

  const titleText = resolveTemplates({ t: popup.title }, properties).t;
  let html = `<div style="min-width:150px"><strong>${escapeHtml(titleText)}</strong>`;

  if (popup.body) {
    const bodyText = resolveTemplates({ b: popup.body }, properties).b;
    html += `<p style="margin:4px 0">${escapeHtml(bodyText)}</p>`;
  }

  if (popup.fields) {
    for (const field of popup.fields) {
      const val = properties[field];
      if (val !== undefined && val !== null) {
        html += `<div style="margin:2px 0;font-size:13px"><span style="color:#888">${escapeHtml(field)}:</span> ${escapeHtml(String(val))}</div>`;
      }
    }
  }

  if (popup.actions && popup.actions.length > 0) {
    html += '<div style="margin-top:8px;display:flex;gap:4px">';
    popup.actions.forEach((action, i) => {
      html += `<button class="popup-action" data-action-index="${i}" style="padding:4px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:12px">${escapeHtml(action.label)}</button>`;
    });
    html += "</div>";
  }

  html += "</div>";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
