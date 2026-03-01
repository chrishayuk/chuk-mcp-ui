import { resolveTemplates } from "../actions";
import { escapeHtml } from "./escape-html";
import type { LeafletPopup } from "./types";

export interface PopupAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
  confirm?: string;
}

export interface PopupConfig extends LeafletPopup {
  actions?: PopupAction[];
}

/**
 * Build popup HTML string from feature properties and popup config.
 * Supports title templates, body templates, fields, and action buttons.
 */
export function buildPopupHtml(
  properties: Record<string, unknown>,
  popup: PopupConfig,
): string {
  const titleText = resolveTemplates({ t: popup.title }, properties).t;
  let html = `<div style="min-width:150px"><strong>${escapeHtml(titleText)}</strong>`;

  if (popup.body) {
    const bodyText = resolveTemplates({ b: popup.body }, properties).b;
    html += `<p style="margin:4px 0">${escapeHtml(bodyText)}</p>`;
  }

  if (popup.fields) {
    for (const field of popup.fields) {
      const val = properties[field];
      if (val !== undefined && val !== null) {
        html += `<div style="margin:2px 0;font-size:13px"><span class="popup-field-label">${escapeHtml(field)}:</span> ${escapeHtml(String(val))}</div>`;
      }
    }
  }

  if (popup.actions && popup.actions.length > 0) {
    html += '<div style="margin-top:8px;display:flex;gap:4px">';
    popup.actions.forEach((action, i) => {
      html += `<button class="popup-action" data-action-index="${i}">${escapeHtml(action.label)}</button>`;
    });
    html += "</div>";
  }

  html += "</div>";
  return html;
}
