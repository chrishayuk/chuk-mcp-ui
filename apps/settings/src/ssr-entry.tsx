import { renderToString } from "react-dom/server";
import { SettingsRenderer } from "./App";
import type { SettingsContent } from "./schema";

export function render(data: SettingsContent): string {
  return renderToString(<SettingsRenderer data={data} />);
}
