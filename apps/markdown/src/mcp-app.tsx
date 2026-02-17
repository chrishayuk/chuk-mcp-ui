import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { MarkdownView } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MarkdownView />
  </StrictMode>
);
