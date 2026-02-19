export interface TimeseriesContent {
  type: "timeseries";
  version: "1.0";
  title?: string;
  subtitle?: string;
  series: TimeseriesSeries[];
  xAxis?: TimeseriesXAxis;
  yAxis?: TimeseriesYAxis;
  annotations?: TimeseriesAnnotation[];
  zoom?: boolean;
}

export interface TimeseriesSeries {
  label: string;
  data: TimeseriesDataPoint[];
  color?: string;
  fill?: boolean;
  type?: "line" | "bar" | "area";
}

export interface TimeseriesDataPoint {
  t: string;
  v: number;
}

export interface TimeseriesXAxis {
  label?: string;
  min?: string;
  max?: string;
}

export interface TimeseriesYAxis {
  label?: string;
  min?: number;
  max?: number;
  type?: "linear" | "logarithmic";
}

export interface TimeseriesAnnotation {
  type: "line" | "range";
  start: string;
  end?: string;
  label?: string;
  color?: string;
}
