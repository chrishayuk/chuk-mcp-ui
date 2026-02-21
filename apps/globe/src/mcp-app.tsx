import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { GlobeView } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobeView />
  </StrictMode>
);
