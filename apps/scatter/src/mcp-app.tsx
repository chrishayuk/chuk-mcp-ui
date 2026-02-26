import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { ScatterView } from "./App";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <ScatterView />
    </StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <ScatterView />
    </StrictMode>
  );
}
