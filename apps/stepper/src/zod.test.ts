import { describe, it, expect } from "vitest";
import { stepperSchema } from "./zod";

describe("stepper zod schema validation", () => {
  it("accepts minimal valid stepper", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "step1", label: "First Step" }],
      activeStep: 0,
    };
    expect(stepperSchema.safeParse(data).success).toBe(true);
  });

  it("accepts stepper with all options", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      title: "Setup Wizard",
      steps: [
        { id: "s1", label: "Account", description: "Create account", status: "completed", icon: "user", detail: "Done" },
        { id: "s2", label: "Profile", status: "active", detail: "In progress" },
        { id: "s3", label: "Review", status: "pending" },
      ],
      activeStep: 1,
      orientation: "horizontal",
      allowNavigation: true,
      stepTool: "go_to_step",
    };
    expect(stepperSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all step status values", () => {
    const statuses = ["pending", "active", "completed", "error", "skipped"] as const;
    for (const status of statuses) {
      const data = {
        type: "stepper" as const,
        version: "1.0" as const,
        steps: [{ id: "s1", label: "Step", status }],
        activeStep: 0,
      };
      expect(stepperSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing steps", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      activeStep: 0,
    };
    expect(stepperSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing activeStep", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
    };
    expect(stepperSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "progress",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
      activeStep: 0,
    };
    expect(stepperSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step", status: "running" }],
      activeStep: 0,
    };
    expect(stepperSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid orientation value", () => {
    const data = {
      type: "stepper",
      version: "1.0",
      steps: [{ id: "s1", label: "Step" }],
      activeStep: 0,
      orientation: "diagonal",
    };
    expect(stepperSchema.safeParse(data).success).toBe(false);
  });
});
