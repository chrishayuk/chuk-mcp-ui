import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

const minimalData = {
  type: "shader",
  version: "1.0",
  fragmentShader:
    "precision mediump float;\nvoid main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}",
};

const fullData = {
  type: "shader",
  version: "1.0",
  title: "Plasma Effect",
  description: "Classic plasma shader with time-based animation",
  fragmentShader:
    "precision mediump float;\nuniform float iTime;\nvoid main() {\n  gl_FragColor = vec4(sin(iTime), 0.0, 0.0, 1.0);\n}",
  vertexShader:
    "attribute vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}",
  uniforms: [
    { name: "speed", type: "float", value: 1.0, min: 0, max: 5, label: "Speed" },
    { name: "color", type: "vec3", value: [1.0, 0.5, 0.2] },
  ],
  width: 800,
  height: 600,
  animate: true,
};

describe("shader schema validation", () => {
  it("accepts minimal valid shader", () => {
    expect(validate(minimalData)).toBe(true);
  });

  it("accepts full shader with all optional fields", () => {
    expect(validate(fullData)).toBe(true);
  });

  it("rejects wrong type", () => {
    expect(validate({ ...minimalData, type: "wrong" })).toBe(false);
  });

  it("rejects missing type", () => {
    const { type, ...rest } = minimalData;
    expect(validate(rest)).toBe(false);
  });

  it("rejects missing version", () => {
    const { version, ...rest } = minimalData;
    expect(validate(rest)).toBe(false);
  });

  it("rejects missing fragmentShader", () => {
    const { fragmentShader, ...rest } = minimalData;
    expect(validate(rest)).toBe(false);
  });

  it("accepts all uniform types", () => {
    const uniformTypes = ["float", "vec2", "vec3", "vec4", "int"] as const;
    for (const uType of uniformTypes) {
      const data = {
        ...minimalData,
        uniforms: [
          {
            name: "test",
            type: uType,
            value: uType === "float" || uType === "int" ? 1.0 : [1.0, 0.0],
          },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects invalid uniform type", () => {
    const data = {
      ...minimalData,
      uniforms: [{ name: "test", type: "mat4", value: 1.0 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = { ...minimalData, extra: true };
    expect(validate(data)).toBe(true);
  });
});
