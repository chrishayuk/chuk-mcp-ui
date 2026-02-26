import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { GanttView } from "./App";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <GanttView />
    </StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <GanttView />
    </StrictMode>
  );
}
