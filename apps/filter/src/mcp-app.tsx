import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { FilterView } from "./App";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <FilterView />
    </StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <FilterView />
    </StrictMode>
  );
}
