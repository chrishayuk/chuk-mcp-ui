declare module "html2canvas" {
  function html2canvas(
    element: HTMLElement,
    options?: Record<string, unknown>
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
