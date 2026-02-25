import type { Meta, StoryObj } from "@storybook/react";
import { ShaderRenderer } from "./App";
import type { ShaderContent } from "./schema";

const meta = {
  title: "Views/Shader",
  component: ShaderRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ShaderRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: Gradient (static red-to-blue based on UV)                 */
/* ------------------------------------------------------------------ */

export const Gradient: Story = {
  args: {
    data: {
      type: "shader",
      version: "1.0",
      title: "UV Gradient",
      description: "A simple gradient that mixes red and blue based on UV coordinates.",
      animate: false,
      width: 512,
      height: 512,
      fragmentShader: [
        "precision mediump float;",
        "uniform vec2 iResolution;",
        "",
        "void main() {",
        "  vec2 uv = gl_FragCoord.xy / iResolution;",
        "  vec3 col = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), uv.x);",
        "  col *= mix(vec3(1.0), vec3(0.2), uv.y);",
        "  gl_FragColor = vec4(col, 1.0);",
        "}",
      ].join("\n"),
    } satisfies ShaderContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: Animated (pulsing circles with iTime)                     */
/* ------------------------------------------------------------------ */

export const Animated: Story = {
  args: {
    data: {
      type: "shader",
      version: "1.0",
      title: "Pulsing Circles",
      description: "Animated concentric circles that pulse over time using the iTime uniform.",
      animate: true,
      width: 512,
      height: 512,
      fragmentShader: [
        "precision mediump float;",
        "uniform vec2 iResolution;",
        "uniform float iTime;",
        "",
        "void main() {",
        "  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / min(iResolution.x, iResolution.y);",
        "  float d = length(uv);",
        "  float rings = sin(d * 20.0 - iTime * 3.0);",
        "  float pulse = 0.5 + 0.5 * sin(iTime * 2.0);",
        "  vec3 col = mix(vec3(0.1, 0.0, 0.3), vec3(0.0, 0.8, 1.0), rings * pulse);",
        "  col += 0.05 / (d + 0.01);",
        "  gl_FragColor = vec4(col, 1.0);",
        "}",
      ].join("\n"),
    } satisfies ShaderContent,
  },
};
