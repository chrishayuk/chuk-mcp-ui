import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { DetailView } from "./App";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <DetailView />
    </StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <DetailView />
    </StrictMode>
  );
}
