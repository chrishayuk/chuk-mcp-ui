/**
 * Inject Leaflet popup theme styles into a container element.
 * Uses CSS custom properties for theme compatibility.
 */
export function injectLeafletThemeStyles(container: HTMLElement): void {
  const id = "chuk-leaflet-theme";
  if (container.querySelector(`#${id}`)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    .leaflet-popup-content-wrapper {
      background: var(--chuk-color-background, #fff);
      color: var(--chuk-color-text, #1a1a1a);
      border: 1px solid var(--chuk-color-border, #e0e0e0);
      box-shadow: 0 2px 8px var(--chuk-color-shadow, rgba(0,0,0,0.15));
    }
    .leaflet-popup-tip {
      background: var(--chuk-color-background, #fff);
    }
    .popup-field-label {
      color: var(--chuk-color-text-secondary, #888);
    }
    .popup-action {
      padding: 4px 8px;
      border: 1px solid var(--chuk-color-border, #ccc);
      border-radius: 4px;
      background: var(--chuk-color-surface, #f5f5f5);
      color: var(--chuk-color-text, #1a1a1a);
      cursor: pointer;
      font-size: 12px;
    }
    .popup-action:hover {
      background: var(--chuk-color-primary, #3388ff);
      color: var(--chuk-color-primary-foreground, #fff);
    }
  `;
  container.appendChild(style);
}
