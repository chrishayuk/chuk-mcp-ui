import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { SankeyView } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SankeyView />
  </StrictMode>
);
