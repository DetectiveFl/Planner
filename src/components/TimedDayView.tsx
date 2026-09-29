import { parseISO } from "date-fns";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTaskDone } from "../hooks/useTaskDone";
import { usePlannerStore } from "../store/plannerStore";
import type { TimedTask } from "../types";
import { occursOnDate } from "../utils/recurrence";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT,
  layoutTimedBlocks,
  minutesToLabel,
} from "../utils/time";
import { TaskEditorModal } from "./TaskEditorModal";
import "./TimedDayView.css";

interface Props {
  date: string;
}

function TimedBlockItem({
  task,
  date,
  layout,
  onEdit,
}: {
  task: TimedTask;
  date: string;
  layout: ReturnType<typeof layoutTimedBlocks>[number];
  onEdit: () => void;
}) {
  const done = useTaskDone(task.id, "timed", date);
  const toggleCompletion = usePlannerStore((s) => s.toggleCompletion);
  const removeTimedTask = usePlannerStore((s) => s.removeTimedTask);

  const widthPct = 100 / layout.columnCount;
  const leftPct = layout.column * widthPct;

  return (
    <div
      className={`timed-block ${done ? "done" : ""}`}
      style={{
        top: layout.top,
        height: layout.height,
        left: `calc(${leftPct}% + 4px)`,
        width: `calc(${widthPct}% - 8px)`,
      }}
    >
      <button
        type="button"
        className="timed-check"
        aria-label="Отметить выполненным"
        onClick={(e) => {
          e.stopPropagation();
          toggleCompletion(task.id, "timed", date);
        }}
      >
        {done ? <Check size={14} strokeWidth={2.5} /> : null}
      </button>
      <div className="timed-block-body">
        <strong>{task.title}</strong>
        <span>
          {minutesToLabel(task.startMinutes)} –{" "}
          {minutesToLabel(task.startMinutes + task.durationMinutes)}
        </span>
      </div>
      <div className="timed-block-actions">
        <button type="button" className="btn-icon" aria-label="Изменить" onClick={onEdit}>
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="btn-icon danger"
          aria-label="Удалить"
          onClick={() => removeTimedTask(task.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function TimedDayView({ date }: Props) {
  const timedTasks = usePlannerStore((s) => s.timedTasks);
  const addTimedTask = usePlannerStore((s) => s.addTimedTask);
  const updateTimedTask = usePlannerStore((s) => s.updateTimedTask);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<TimedTask | null>(null);

  const day = parseISO(date);
  const dayTasks = useMemo(
    () =>
      timedTasks.filter((t) =>
        occursOnDate(t.anchorDate, t.recurrence, day, t.weeklyDays),
      ),
    [timedTasks, day],
  );

  const layout = useMemo(
    () =>
      layoutTimedBlocks(
        dayTasks.map((t) => ({
          id: t.id,
          startMinutes: t.startMinutes,
          durationMinutes: t.durationMinutes,
        })),
      ),
    [dayTasks],
  );

  const hours = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) hours.push(h);

  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR + 1) * HOUR_HEIGHT;

  return (
    <div className="timed-day">
      <div className="timed-toolbar">
        <button
          type="button"
          className="btn-primary timed-add"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Plus size={18} />
          Добавить
        </button>
      </div>

      <div className="timed-scroll scroll-y">
        <div className="timed-grid" style={{ height: totalHeight }}>
          <div className="timed-hours">
            {hours.map((h) => (
              <div
                key={h}
                className="timed-hour-label"
                style={{ height: HOUR_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          <div className="timed-canvas">
            {hours.map((h) => (
              <div
                key={h}
                className="timed-hour-line"
                style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT }}
              />
            ))}
            {dayTasks.map((task) => {
              const pos = layout.find((l) => l.id === task.id);
              if (!pos) return null;
              return (
                <TimedBlockItem
                  key={task.id}
                  task={task}
                  date={date}
                  layout={pos}
                  onEdit={() => {
                    setEditing(task);
                    setEditorOpen(true);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <TaskEditorModal
        open={editorOpen}
        anchorDate={date}
        kind="timed"
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => {
          if (editing) {
            updateTimedTask(editing.id, {
              title: data.title,
              notes: data.notes,
              startMinutes: data.startMinutes!,
              durationMinutes: data.durationMinutes!,
              recurrence: data.recurrence,
              weeklyDays: data.weeklyDays,
            });
          } else {
            addTimedTask({
              title: data.title,
              notes: data.notes,
              anchorDate: data.anchorDate,
              startMinutes: data.startMinutes!,
              durationMinutes: data.durationMinutes!,
              recurrence: data.recurrence,
              weeklyDays: data.weeklyDays,
            });
          }
        }}
      />
    </div>
  );
}
