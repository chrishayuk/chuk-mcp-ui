import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("stepper schema validation", () => {
  it("accepts minimal valid stepper", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "step1", label: "First Step" }],
      activeStep: 0,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts stepper with all options", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      title: "Setup Wizard",
      steps: [
        { id: "s1", label: "Account", description: "Create account", status: "completed", icon: "user", detail: "Done" },
        { id: "s2", label: "Profile", description: "Set profile", status: "active", detail: "In progress" },
        { id: "s3", label: "Review", status: "pending" },
      ],
      activeStep: 1,
      orientation: "horizontal",
      allowNavigation: true,
      stepTool: "go_to_step",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all step status values", () => {
    const statuses = ["pending", "active", "completed", "error", "skipped"];
    for (const status of statuses) {
      const data = {
        type: "stepper",
        version: "1.0",
        steps: [{ id: "s1", label: "Step", status }],
        activeStep: 0,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts both orientations", () => {
    for (const orientation of ["horizontal", "vertical"]) {
      const data = {
        type: "stepper",
        version: "1.0",
        steps: [{ id: "s1", label: "Step" }],
        activeStep: 0,
        orientation,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing steps", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      activeStep: 0,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing activeStep", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing id", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ label: "Step" }],
      activeStep: 0,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing label", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1" }],
      activeStep: 0,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "progress",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
      activeStep: 0,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step", status: "running" }],
      activeStep: 0,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid orientation value", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
      activeStep: 0,
      orientation: "diagonal",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
      activeStep: 0,
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
