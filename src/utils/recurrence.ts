import {
  format,
  parseISO,
  isBefore,
  startOfDay,
  getDay,
  getDate,
  isSameDay,
} from "date-fns";
import type { Recurrence } from "../types";

export function dateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function occursOnDate(
  anchorDate: string,
  recurrence: Recurrence,
  day: Date,
  weeklyDays?: number[],
): boolean {
  const anchor = startOfDay(parseISO(anchorDate));
  const target = startOfDay(day);

  if (isBefore(target, anchor) && recurrence === "none") {
    return isSameDay(target, anchor);
  }
  if (isBefore(target, anchor)) {
    return false;
  }

  switch (recurrence) {
    case "none":
      return isSameDay(target, anchor);
    case "daily":
      return true;
    case "weekdays": {
      const wd = getDay(target);
      return wd >= 1 && wd <= 5;
    }
    case "weekly": {
      const days = weeklyDays?.length ? weeklyDays : [getDay(anchor)];
      return days.includes(getDay(target));
    }
    case "monthly":
      return getDate(target) === getDate(anchor);
    default:
      return false;
  }
}

export function completionKey(
  taskId: string,
  kind: "timed" | "mandatory",
  day: string,
): string {
  return `${kind}:${taskId}:${day}`;
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: "Без повтора",
  daily: "Каждый день",
  weekdays: "Будни",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
};
