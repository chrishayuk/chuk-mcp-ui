import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import { Slider, Label } from "@chuk/view-ui";
import type { ShaderContent } from "./schema";

const DEFAULT_VERTEX = `attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export function ShaderView() {
  const { data } = useView<ShaderContent>("shader", "1.0");
  if (!data) return null;
  return <ShaderRenderer data={data} />;
}

export interface ShaderRendererProps {
  data: ShaderContent;
}

export function ShaderRenderer({ data }: ShaderRendererProps) {
  const {
    title,
    description,
    fragmentShader,
    vertexShader,
    uniforms: initialUniforms,
    width = 512,
    height = 512,
    animate = true,
  } = data;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());
  const mouseRef = useRef([0, 0]);

  const [error, setError] = useState<string | null>(null);
  const [uniformValues, setUniformValues] = useState<
    Record<string, number | number[]>
  >(() => {
    const vals: Record<string, number | number[]> = {};
    for (const u of initialUniforms ?? []) {
      vals[u.name] = u.value;
    }
    return vals;
  });

  const compileShader = useCallback(
    (
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader) ?? "Unknown error";
        gl.deleteShader(shader);
        setError(log);
        return null;
      }
      return shader;
    },
    []
  );

  // Init WebGL and compile shaders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
      setError("WebGL not supported");
      return;
    }
    glRef.current = gl;

    const vs = compileShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShader ?? DEFAULT_VERTEX
    );
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setError(gl.getProgramInfoLog(program) ?? "Link failed");
      return;
    }

    programRef.current = program;
    setError(null);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    startTimeRef.current = Date.now();

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      programRef.current = null;
    };
  }, [fragmentShader, vertexShader, compileShader]);

  // Render loop
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    function render() {
      if (!gl || !program) return;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Built-in uniforms
      const timeLoc = gl.getUniformLocation(program, "iTime");
      if (timeLoc)
        gl.uniform1f(timeLoc, (Date.now() - startTimeRef.current) / 1000);

      const resLoc = gl.getUniformLocation(program, "iResolution");
      if (resLoc) gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height);

      const mouseLoc = gl.getUniformLocation(program, "iMouse");
      if (mouseLoc)
        gl.uniform2f(mouseLoc, mouseRef.current[0], mouseRef.current[1]);

      // Custom uniforms
      for (const u of initialUniforms ?? []) {
        const loc = gl.getUniformLocation(program, u.name);
        if (!loc) continue;
        const val = uniformValues[u.name] ?? u.value;
        if (u.type === "float" || u.type === "int") {
          gl.uniform1f(loc, typeof val === "number" ? val : 0);
        } else if (u.type === "vec2" && Array.isArray(val)) {
          gl.uniform2f(loc, val[0] ?? 0, val[1] ?? 0);
        } else if (u.type === "vec3" && Array.isArray(val)) {
          gl.uniform3f(loc, val[0] ?? 0, val[1] ?? 0, val[2] ?? 0);
        } else if (u.type === "vec4" && Array.isArray(val)) {
          gl.uniform4f(
            loc,
            val[0] ?? 0,
            val[1] ?? 0,
            val[2] ?? 0,
            val[3] ?? 0
          );
        }
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (animate) {
        rafRef.current = requestAnimationFrame(render);
      }
    }

    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, initialUniforms, uniformValues]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    },
    []
  );

  // Line-numbered source
  const sourceLines = useMemo(
    () => fragmentShader.split("\n"),
    [fragmentShader]
  );

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="p-4"
      >
        {title && <h2 className="mb-1 text-lg font-semibold">{title}</h2>}
        {description && (
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Source code */}
          <div className="flex-1 min-w-0 rounded-lg border border-border bg-muted/30 overflow-auto">
            <div className="p-3 border-b border-border text-xs font-medium text-muted-foreground">
              Fragment Shader
            </div>
            <pre className="p-3 text-xs leading-5 overflow-auto max-h-[500px]">
              <code>
                {sourceLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="inline-block w-8 text-right pr-3 text-muted-foreground select-none shrink-0">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* Canvas */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              onMouseMove={handleMouseMove}
              className="rounded-lg border border-border bg-black"
              style={{
                width: Math.min(width, 512),
                height: Math.min(height, 512),
              }}
            />
            {error && (
              <div className="w-full max-w-[512px] p-2 rounded text-xs bg-destructive/10 text-destructive border border-destructive/20 font-mono whitespace-pre-wrap">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Uniform sliders */}
        {initialUniforms && initialUniforms.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialUniforms
              .filter((u) => u.type === "float" || u.type === "int")
              .map((u) => (
                <div key={u.name} className="flex items-center gap-3">
                  <Label className="text-xs min-w-[80px]">
                    {u.label ?? u.name}
                  </Label>
                  <Slider
                    min={u.min ?? 0}
                    max={u.max ?? 1}
                    step={u.type === "int" ? 1 : 0.01}
                    value={[
                      typeof uniformValues[u.name] === "number"
                        ? (uniformValues[u.name] as number)
                        : typeof u.value === "number"
                          ? u.value
                          : 0,
                    ]}
                    onValueChange={([v]) =>
                      setUniformValues((prev) => ({ ...prev, [u.name]: v }))
                    }
                    className="flex-1"
                  />
                  <span className="text-xs min-w-[40px] text-right font-mono">
                    {(typeof uniformValues[u.name] === "number"
                      ? (uniformValues[u.name] as number)
                      : typeof u.value === "number"
                        ? u.value
                        : 0
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
