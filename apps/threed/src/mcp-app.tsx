import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { ThreedView } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThreedView />
  </StrictMode>
);
