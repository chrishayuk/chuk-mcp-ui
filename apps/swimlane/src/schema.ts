export interface SwimlaneContent {
  type: "swimlane";
  version: "1.0";
  title?: string;
  lanes: SwimlaneLane[];
  columns: SwimlaneColumn[];
  activities: SwimlaneActivity[];
}

export interface SwimlaneLane {
  id: string;
  label: string;
  color?: string;
}

export interface SwimlaneColumn {
  id: string;
  label: string;
}

export interface SwimlaneActivity {
  id: string;
  laneId: string;
  columnId: string;
  label: string;
  description?: string;
  color?: string;
  status?: "pending" | "active" | "completed" | "blocked";
}
