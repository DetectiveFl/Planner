export const HOUR_HEIGHT = 56;
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 23;

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseTimeInput(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function snapMinutes(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step;
}

export interface TimedLayoutItem {
  id: string;
  top: number;
  height: number;
  column: number;
  columnCount: number;
}

export function layoutTimedBlocks(
  items: { id: string; startMinutes: number; durationMinutes: number }[],
): TimedLayoutItem[] {
  const sorted = [...items].sort(
    (a, b) => a.startMinutes - b.startMinutes || a.durationMinutes - b.durationMinutes,
  );

  const result: TimedLayoutItem[] = [];
  const active: {
    id: string;
    end: number;
    column: number;
  }[] = [];

  for (const item of sorted) {
    const start = item.startMinutes;
    const end = start + item.durationMinutes;

    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].end <= start) active.splice(i, 1);
    }

    const used = new Set(active.map((a) => a.column));
    let column = 0;
    while (used.has(column)) column++;

    active.push({ id: item.id, end, column });

    const maxCol = Math.max(column, ...active.map((a) => a.column)) + 1;

    result.push({
      id: item.id,
      top: (start - DAY_START_HOUR * 60) * (HOUR_HEIGHT / 60),
      height: Math.max(item.durationMinutes * (HOUR_HEIGHT / 60), 28),
      column,
      columnCount: maxCol,
    });
  }

  const clusterMax = new Map<string, number>();
  for (const r of result) {
    const item = sorted.find((s) => s.id === r.id)!;
    const overlapping = result.filter((o) => {
      const oItem = sorted.find((s) => s.id === o.id)!;
      return !(
        oItem.startMinutes + item.durationMinutes <= item.startMinutes ||
        item.startMinutes + item.durationMinutes <= oItem.startMinutes
      );
    });
    const max = Math.max(...overlapping.map((o) => o.column)) + 1;
    clusterMax.set(r.id, max);
  }

  return result.map((r) => ({
    ...r,
    columnCount: clusterMax.get(r.id) ?? r.columnCount,
  }));
}
