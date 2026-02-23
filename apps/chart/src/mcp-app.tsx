import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@chuk/view-ui/styles";
import { ChartView } from "./App";

const root = document.getElementById("root")!;
const ssrData = (window as any).__SSR_DATA__;

const app = (
  <StrictMode>
    <ChartView />
  </StrictMode>
);

if (ssrData && root.children.length > 0) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
