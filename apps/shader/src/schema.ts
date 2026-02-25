export interface ShaderContent {
  type: "shader";
  version: "1.0";
  title?: string;
  description?: string;
  /** Fragment shader GLSL source */
  fragmentShader: string;
  /** Vertex shader (optional, defaults to fullscreen quad) */
  vertexShader?: string;
  /** Custom uniforms to expose */
  uniforms?: ShaderUniform[];
  /** Canvas width (default: 512) */
  width?: number;
  /** Canvas height (default: 512) */
  height?: number;
  /** Auto-animate with iTime uniform */
  animate?: boolean;
}

export interface ShaderUniform {
  name: string;
  type: "float" | "vec2" | "vec3" | "vec4" | "int";
  value: number | number[];
  min?: number;
  max?: number;
  label?: string;
}
