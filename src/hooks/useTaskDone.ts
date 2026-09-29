import { usePlannerStore } from "../store/plannerStore";
import type { TaskKind } from "../types";
import { completionKey } from "../utils/recurrence";

export function useTaskDone(taskId: string, kind: TaskKind, day: string): boolean {
  return usePlannerStore(
    (s) => !!s.completions[completionKey(taskId, kind, day)],
  );
}
