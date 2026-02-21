export interface CalendarContent {
  type: "calendar";
  version: "1.0";
  title?: string;
  events: CalendarEvent[];
  defaultView?: "month" | "week" | "agenda";
  defaultDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  description?: string;
}
