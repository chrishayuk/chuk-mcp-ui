import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Fallback } from "./fallback";

describe("Fallback", () => {
  it("renders default message when no props", () => {
    render(<Fallback />);
    expect(screen.getByText("No data to display.")).toBeDefined();
  });

  it("renders custom message", () => {
    render(<Fallback message="Connecting..." />);
    expect(screen.getByText("Connecting...")).toBeDefined();
  });

  it("renders text content items", () => {
    render(
      <Fallback
        content={[
          { type: "text", text: "Line 1" },
          { type: "text", text: "Line 2" },
        ]}
      />
    );
    expect(screen.getByText(/Line 1/)).toBeDefined();
    expect(screen.getByText(/Line 2/)).toBeDefined();
  });

  it("filters non-text content items", () => {
    render(
      <Fallback
        content={[
          { type: "image" },
          { type: "text", text: "Only text" },
        ]}
      />
    );
    expect(screen.getByText("Only text")).toBeDefined();
  });

  it("renders default when content has no text items", () => {
    render(<Fallback content={[{ type: "image" }]} />);
    expect(screen.getByText("No data to display.")).toBeDefined();
  });

  it("prefers message over content", () => {
    render(
      <Fallback
        message="Custom message"
        content={[{ type: "text", text: "Content text" }]}
      />
    );
    expect(screen.getByText("Custom message")).toBeDefined();
  });
});
