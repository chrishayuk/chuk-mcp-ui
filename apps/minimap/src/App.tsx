import { useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useView } from "@chuk/view-shared";
import {
  BASEMAPS,
  fixLeafletIcons,
  injectLeafletThemeStyles,
  createGeoJSONOptions,
  buildPopupHtml,
  computeLayerBounds,
} from "@chuk/view-shared/leaflet";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type {
  MinimapContent,
  MinimapPanel,
  MinimapLayer,
} from "./schema";

fixLeafletIcons();

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_CENTER: L.LatLngExpression = [51.505, -0.09];
const DEFAULT_ZOOM = 10;
const EXTENT_STYLE: L.PathOptions = {
  color: "#3388ff",
  weight: 2,
  fillColor: "#3388ff",
  fillOpacity: 0.1,
  dashArray: "6 4",
  interactive: false,
};

/* ------------------------------------------------------------------ */
/*  Top-level View wrapper (protocol + fallback)                       */
/* ------------------------------------------------------------------ */

export function MinimapView() {
  const { data } =
    useView<MinimapContent>("minimap", "1.0");

  if (!data) return null;

  return <MinimapRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface MinimapRendererProps {
  data: MinimapContent;
}

/* ------------------------------------------------------------------ */
/*  MinimapRenderer                                                    */
/* ------------------------------------------------------------------ */

export function MinimapRenderer({ data }: MinimapRendererProps) {
  const overviewRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const overviewMapRef = useRef<L.Map | null>(null);
  const detailMapRef = useRef<L.Map | null>(null);
  const extentRectRef = useRef<L.Rectangle | null>(null);
  const syncingRef = useRef(false);

  const isVertical = data.layout === "vertical";

  // Parse the ratio string (e.g. "1:2" or "40:60") into flex values
  const [overviewFlex, detailFlex] = useMemo(() => {
    if (!data.ratio) return [1, 2];
    const parts = data.ratio.split(":").map(Number);
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      return parts;
    }
    return [1, 2];
  }, [data.ratio]);

  /* ---- Helper: update extent rectangle on overview ---- */
  const updateExtentRect = useCallback(() => {
    const overviewMap = overviewMapRef.current;
    const detailMap = detailMapRef.current;
    if (!overviewMap || !detailMap) return;

    const bounds = detailMap.getBounds();

    if (extentRectRef.current) {
      extentRectRef.current.setBounds(bounds);
    } else {
      const rect = L.rectangle(bounds, EXTENT_STYLE);
      rect.addTo(overviewMap);
      extentRectRef.current = rect;
    }
  }, []);

  /* ---- Initialise overview map ---- */
  useEffect(() => {
    if (!overviewRef.current || overviewMapRef.current) return;

    const center: L.LatLngExpression = data.overview.center
      ? [data.overview.center.lat, data.overview.center.lon]
      : DEFAULT_CENTER;

    const map = L.map(overviewRef.current, {
      center,
      zoom: data.overview.zoom ?? DEFAULT_ZOOM,
      zoomControl: false,
    });

    const basemapUrl =
      BASEMAPS[data.overview.basemap ?? "osm"] ?? BASEMAPS.osm;
    L.tileLayer(basemapUrl, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    overviewMapRef.current = map;
    injectLeafletThemeStyles(overviewRef.current);

    return () => {
      map.remove();
      overviewMapRef.current = null;
      extentRectRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Initialise detail map ---- */
  useEffect(() => {
    if (!detailRef.current || detailMapRef.current) return;

    const center: L.LatLngExpression = data.detail.center
      ? [data.detail.center.lat, data.detail.center.lon]
      : DEFAULT_CENTER;

    const map = L.map(detailRef.current, {
      center,
      zoom: data.detail.zoom ?? (DEFAULT_ZOOM + 4),
      zoomControl: true,
    });

    const basemapUrl =
      BASEMAPS[data.detail.basemap ?? "osm"] ?? BASEMAPS.osm;
    L.tileLayer(basemapUrl, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.scale().addTo(map);

    detailMapRef.current = map;
    injectLeafletThemeStyles(detailRef.current);

    return () => {
      map.remove();
      detailMapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Sync: detail move -> update extent rectangle on overview ---- */
  useEffect(() => {
    const detailMap = detailMapRef.current;
    if (!detailMap) return;

    const onMove = () => {
      if (syncingRef.current) return;
      updateExtentRect();

      // If linkZoom, adjust overview zoom relative to detail
      if (data.linkZoom && overviewMapRef.current) {
        syncingRef.current = true;
        const detailZoom = detailMap.getZoom();
        const offset = Math.max(detailZoom - 4, 1);
        overviewMapRef.current.setZoom(offset, { animate: false });
        syncingRef.current = false;
      }
    };

    detailMap.on("moveend", onMove);
    detailMap.on("zoomend", onMove);

    // Initial extent rectangle
    requestAnimationFrame(updateExtentRect);

    return () => {
      detailMap.off("moveend", onMove);
      detailMap.off("zoomend", onMove);
    };
  }, [data.linkZoom, updateExtentRect]);

  /* ---- Sync: click overview -> pan detail ---- */
  useEffect(() => {
    const overviewMap = overviewMapRef.current;
    const detailMap = detailMapRef.current;
    if (!overviewMap || !detailMap) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      syncingRef.current = true;
      detailMap.panTo(e.latlng);
      syncingRef.current = false;
    };

    overviewMap.on("click", onClick);
    return () => {
      overviewMap.off("click", onClick);
    };
  }, []);

  /* ---- Render layers on overview ---- */
  useEffect(() => {
    const map = overviewMapRef.current;
    if (!map) return;

    const groups = renderPanelLayers(map, data.overview);

    // Fit overview to all layer bounds if no explicit center
    if (!data.overview.center && !data.overview.zoom) {
      const allBounds = computeLayerBounds(data.overview.layers);
      if (allBounds && allBounds.isValid()) {
        map.fitBounds(allBounds, { padding: [20, 20] });
      }
    }

    return () => {
      for (const g of groups) map.removeLayer(g);
    };
  }, [data.overview]);

  /* ---- Render layers on detail ---- */
  useEffect(() => {
    const map = detailMapRef.current;
    if (!map) return;

    const groups = renderPanelLayers(map, data.detail);

    // Fit detail to all layer bounds if no explicit center
    if (!data.detail.center && !data.detail.zoom) {
      const allBounds = computeLayerBounds(data.detail.layers);
      if (allBounds && allBounds.isValid()) {
        map.fitBounds(allBounds, { padding: [20, 20] });
      }
    }

    // Update extent rect after layers settle
    requestAnimationFrame(updateExtentRect);

    return () => {
      for (const g of groups) map.removeLayer(g);
    };
  }, [data.detail, updateExtentRect]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full w-full flex flex-col font-sans text-foreground bg-background"
    >
      {data.title && (
        <div className="px-4 py-2 text-sm font-semibold border-b border-border truncate">
          {data.title}
        </div>
      )}
      <div
        className={`flex-1 flex ${isVertical ? "flex-col" : "flex-row"} min-h-0`}
      >
        <div
          ref={overviewRef}
          className="relative"
          style={{ flex: overviewFlex }}
          aria-label="Overview map"
        />
        <div
          className={
            isVertical
              ? "h-px bg-border flex-shrink-0"
              : "w-px bg-border flex-shrink-0"
          }
        />
        <div
          ref={detailRef}
          className="relative"
          style={{ flex: detailFlex }}
          aria-label="Detail map"
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function renderPanelLayers(
  map: L.Map,
  panel: MinimapPanel,
): L.LayerGroup[] {
  const groups: L.LayerGroup[] = [];

  for (const layer of panel.layers) {
    const group = createLayerGroup(layer);
    if (layer.visible !== false) {
      group.addTo(map);
    }
    groups.push(group);
  }

  return groups;
}

function createLayerGroup(layer: MinimapLayer): L.LayerGroup {
  const geoOptions = createGeoJSONOptions(layer.style ?? {});

  return L.geoJSON(layer.features as GeoJSON.GeoJsonObject, {
    pointToLayer: geoOptions.pointToLayer,
    style: geoOptions.style,
    onEachFeature: (feature, leafletLayer) => {
      if (layer.popup) {
        const html = buildPopupHtml(feature.properties ?? {}, layer.popup);
        leafletLayer.bindPopup(html);
      }
    },
  });
}
