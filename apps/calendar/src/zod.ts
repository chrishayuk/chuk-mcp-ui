import { z } from "zod";

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string().optional(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});

export const calendarSchema = z.object({
  type: z.literal("calendar"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  events: z.array(calendarEventSchema),
  defaultView: z.enum(["month", "week", "agenda"]).optional(),
  defaultDate: z.string().optional(),
});

export type CalendarContent = z.infer<typeof calendarSchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
