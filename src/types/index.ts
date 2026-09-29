export type Recurrence = "none" | "daily" | "weekdays" | "weekly" | "monthly";

export type TaskKind = "timed" | "mandatory";

export interface TimedTask {
  id: string;
  title: string;
  notes?: string;
  anchorDate: string;
  startMinutes: number;
  durationMinutes: number;
  recurrence: Recurrence;
  weeklyDays?: number[];
  createdAt: number;
}

export interface MandatoryTask {
  id: string;
  title: string;
  notes?: string;
  anchorDate: string;
  recurrence: Recurrence;
  weeklyDays?: number[];
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface GoalGraphNode {
  id: string;
  goalId: string;
  label: string;
  x: number;
  y: number;
}

export interface GoalGraphEdge {
  id: string;
  goalId: string;
  source: string;
  target: string;
}

export type AppTab = "calendar" | "goals" | "graph";

export type DayMode = "chooser" | "timed" | "mandatory";
