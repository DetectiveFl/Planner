import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  AppTab,
  DayMode,
  GoalGraphEdge,
  GoalGraphNode,
  MandatoryTask,
  TimedTask,
} from "../types";
import { completionKey } from "../utils/recurrence";

const DAY_PANEL_MIN = 320;
const DAY_PANEL_MAX_RATIO = 0.85;

interface PlannerState {
  activeTab: AppTab;
  calendarMonth: string;
  selectedDay: string | null;
  dayMode: DayMode;
  dayPanelWidth: number;
  activeGraphGoalId: string | null;

  timedTasks: TimedTask[];
  mandatoryTasks: MandatoryTask[];
  completions: Record<string, boolean>;

  goals: Goal[];
  graphNodes: GoalGraphNode[];
  graphEdges: GoalGraphEdge[];

  setActiveTab: (tab: AppTab) => void;
  setCalendarMonth: (ym: string) => void;
  openDay: (date: string) => void;
  closeDay: () => void;
  setDayMode: (mode: DayMode) => void;
  setDayPanelWidth: (width: number) => void;

  addTimedTask: (input: Omit<TimedTask, "id" | "createdAt">) => string;
  updateTimedTask: (id: string, patch: Partial<TimedTask>) => void;
  removeTimedTask: (id: string) => void;

  addMandatoryTask: (input: Omit<MandatoryTask, "id" | "createdAt">) => string;
  updateMandatoryTask: (id: string, patch: Partial<MandatoryTask>) => void;
  removeMandatoryTask: (id: string) => void;

  toggleCompletion: (
    taskId: string,
    kind: "timed" | "mandatory",
    day: string,
  ) => void;

  addGoal: (title: string, description?: string) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  openGoalGraph: (goalId: string) => void;
  setActiveGraphGoalId: (goalId: string | null) => void;

  addGraphNode: (label: string, goalId?: string) => string;
  updateGraphNode: (id: string, patch: Partial<GoalGraphNode>) => void;
  removeGraphNode: (id: string) => void;
  addGraphEdge: (source: string, target: string) => string;
  removeGraphEdge: (id: string) => void;
  clearGraphEdgesForGoal: (goalId: string) => void;
  setGraphLayoutForGoal: (goalId: string, nodes: GoalGraphNode[]) => void;
}

type Goal = import("../types").Goal;

function clampPanelWidth(width: number): number {
  if (typeof window === "undefined") return width;
  const max = window.innerWidth * DAY_PANEL_MAX_RATIO;
  return Math.min(max, Math.max(DAY_PANEL_MIN, width));
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      activeTab: "calendar",
      calendarMonth: new Date().toISOString().slice(0, 7),
      selectedDay: null,
      dayMode: "chooser",
      dayPanelWidth: 520,
      activeGraphGoalId: null,

      timedTasks: [],
      mandatoryTasks: [],
      completions: {},

      goals: [],
      graphNodes: [],
      graphEdges: [],

      setActiveTab: (tab) => set({ activeTab: tab }),
      setCalendarMonth: (ym) => set({ calendarMonth: ym }),
      openDay: (date) => set({ selectedDay: date, dayMode: "chooser" }),
      closeDay: () => set({ selectedDay: null, dayMode: "chooser" }),
      setDayMode: (mode) => set({ dayMode: mode }),
      setDayPanelWidth: (width) =>
        set({ dayPanelWidth: clampPanelWidth(width) }),

      addTimedTask: (input) => {
        const id = uuid();
        set((s) => ({
          timedTasks: [
            ...s.timedTasks,
            { ...input, id, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      updateTimedTask: (id, patch) =>
        set((s) => ({
          timedTasks: s.timedTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      removeTimedTask: (id) =>
        set((s) => ({
          timedTasks: s.timedTasks.filter((t) => t.id !== id),
          completions: Object.fromEntries(
            Object.entries(s.completions).filter(
              ([k]) => !k.includes(`timed:${id}:`),
            ),
          ),
        })),

      addMandatoryTask: (input) => {
        const id = uuid();
        set((s) => ({
          mandatoryTasks: [
            ...s.mandatoryTasks,
            { ...input, id, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      updateMandatoryTask: (id, patch) =>
        set((s) => ({
          mandatoryTasks: s.mandatoryTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      removeMandatoryTask: (id) =>
        set((s) => ({
          mandatoryTasks: s.mandatoryTasks.filter((t) => t.id !== id),
          completions: Object.fromEntries(
            Object.entries(s.completions).filter(
              ([k]) => !k.includes(`mandatory:${id}:`),
            ),
          ),
        })),

      toggleCompletion: (taskId, kind, day) => {
        const key = completionKey(taskId, kind, day);
        set((s) => {
          const next = { ...s.completions };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { completions: next };
        });
      },

      addGoal: (title, description = "") => {
        const id = uuid();
        set((s) => ({
          goals: [
            ...s.goals,
            { id, title, description, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          graphNodes: s.graphNodes.filter((n) => n.goalId !== id),
          graphEdges: s.graphEdges.filter((e) => e.goalId !== id),
          activeGraphGoalId:
            s.activeGraphGoalId === id ? null : s.activeGraphGoalId,
        })),

      openGoalGraph: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;

        const hasNodes = get().graphNodes.some((n) => n.goalId === goalId);
        if (!hasNodes) {
          const nodeId = uuid();
          set((s) => ({
            activeGraphGoalId: goalId,
            activeTab: "graph",
            graphNodes: [
              ...s.graphNodes,
              {
                id: nodeId,
                goalId,
                label: goal.title,
                x: 220,
                y: 140,
              },
            ],
          }));
        } else {
          set({ activeGraphGoalId: goalId, activeTab: "graph" });
        }
      },

      setActiveGraphGoalId: (goalId) => set({ activeGraphGoalId: goalId }),

      addGraphNode: (label, goalId) => {
        const gid = goalId ?? get().activeGraphGoalId;
        if (!gid) return "";

        const id = uuid();
        const count = get().graphNodes.filter((n) => n.goalId === gid).length;
        set((s) => ({
          graphNodes: [
            ...s.graphNodes,
            {
              id,
              goalId: gid,
              label,
              x: 120 + (count % 5) * 140,
              y: 100 + Math.floor(count / 5) * 120,
            },
          ],
        }));
        return id;
      },
      updateGraphNode: (id, patch) =>
        set((s) => ({
          graphNodes: s.graphNodes.map((n) =>
            n.id === id ? { ...n, ...patch } : n,
          ),
        })),
      removeGraphNode: (id) =>
        set((s) => ({
          graphNodes: s.graphNodes.filter((n) => n.id !== id),
          graphEdges: s.graphEdges.filter(
            (e) => e.source !== id && e.target !== id,
          ),
        })),
      addGraphEdge: (source, target) => {
        const goalId = get().activeGraphGoalId;
        if (!goalId) return "";

        const exists = get().graphEdges.some(
          (e) =>
            e.goalId === goalId &&
            e.source === source &&
            e.target === target,
        );
        if (exists) return "";

        const id = uuid();
        set((s) => ({
          graphEdges: [...s.graphEdges, { id, goalId, source, target }],
        }));
        return id;
      },
      removeGraphEdge: (id) =>
        set((s) => ({
          graphEdges: s.graphEdges.filter((e) => e.id !== id),
        })),
      clearGraphEdgesForGoal: (goalId) =>
        set((s) => ({
          graphEdges: s.graphEdges.filter((e) => e.goalId !== goalId),
        })),
      setGraphLayoutForGoal: (goalId, nodes) =>
        set((s) => ({
          graphNodes: [
            ...s.graphNodes.filter((n) => n.goalId !== goalId),
            ...nodes.map((n) => ({ ...n, goalId })),
          ],
        })),
    }),
    {
      name: "planner-storage-v2",
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          const rawNodes = (state.graphNodes as Array<Record<string, unknown>>) ?? [];
          const graphNodes = rawNodes
            .filter((n) => typeof n.goalId === "string")
            .map((n) => ({
              id: String(n.id),
              goalId: String(n.goalId),
              label: String(n.label),
              x: Number(n.x),
              y: Number(n.y),
            }));

          const nodeGoal = new Map(graphNodes.map((n) => [n.id, n.goalId]));
          const rawEdges = (state.graphEdges as Array<Record<string, unknown>>) ?? [];
          const graphEdges = rawEdges
            .map((e) => {
              const goalId =
                (e.goalId as string | undefined) ??
                nodeGoal.get(String(e.source));
              if (!goalId) return null;
              return {
                id: String(e.id),
                goalId,
                source: String(e.source),
                target: String(e.target),
              };
            })
            .filter(Boolean);

          return {
            ...state,
            graphNodes,
            graphEdges,
            activeGraphGoalId: null,
            dayPanelWidth: 520,
          };
        }
        return state;
      },
      partialize: (s) => ({
        timedTasks: s.timedTasks,
        mandatoryTasks: s.mandatoryTasks,
        completions: s.completions,
        goals: s.goals,
        graphNodes: s.graphNodes,
        graphEdges: s.graphEdges,
        calendarMonth: s.calendarMonth,
        activeGraphGoalId: s.activeGraphGoalId,
        dayPanelWidth: s.dayPanelWidth,
      }),
    },
  ),
);
