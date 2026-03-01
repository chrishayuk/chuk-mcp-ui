import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

/** Fix Leaflet default icon paths (broken when bundled by Vite). */
export function fixLeafletIcons(): void {
  L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
}
