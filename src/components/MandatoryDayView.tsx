import { parseISO } from "date-fns";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTaskDone } from "../hooks/useTaskDone";
import { usePlannerStore } from "../store/plannerStore";
import type { MandatoryTask } from "../types";
import { occursOnDate, RECURRENCE_LABELS } from "../utils/recurrence";
import { TaskEditorModal } from "./TaskEditorModal";
import "./MandatoryDayView.css";

interface Props {
  date: string;
}

function MandatoryItem({
  task,
  date,
  onEdit,
}: {
  task: MandatoryTask;
  date: string;
  onEdit: () => void;
}) {
  const done = useTaskDone(task.id, "mandatory", date);
  const toggleCompletion = usePlannerStore((s) => s.toggleCompletion);
  const removeMandatoryTask = usePlannerStore((s) => s.removeMandatoryTask);

  return (
    <li className={`mandatory-item ${done ? "done" : ""}`}>
      <button
        type="button"
        className="mandatory-check"
        aria-label="Отметить выполненным"
        onClick={() => toggleCompletion(task.id, "mandatory", date)}
      >
        {done ? <Check size={16} strokeWidth={2.5} /> : null}
      </button>
      <div className="mandatory-content">
        <strong>{task.title}</strong>
        {task.notes && <p>{task.notes}</p>}
        {task.recurrence !== "none" && (
          <span className="mandatory-badge">
            {RECURRENCE_LABELS[task.recurrence]}
          </span>
        )}
      </div>
      <div className="mandatory-actions">
        <button type="button" className="btn-icon" aria-label="Изменить" onClick={onEdit}>
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="btn-icon danger"
          aria-label="Удалить"
          onClick={() => removeMandatoryTask(task.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

export function MandatoryDayView({ date }: Props) {
  const mandatoryTasks = usePlannerStore((s) => s.mandatoryTasks);
  const addMandatoryTask = usePlannerStore((s) => s.addMandatoryTask);
  const updateMandatoryTask = usePlannerStore((s) => s.updateMandatoryTask);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MandatoryTask | null>(null);

  const day = parseISO(date);
  const dayTasks = useMemo(
    () =>
      mandatoryTasks.filter((t) =>
        occursOnDate(t.anchorDate, t.recurrence, day, t.weeklyDays),
      ),
    [mandatoryTasks, day, date],
  );

  return (
    <div className="mandatory-day">
      <div className="mandatory-toolbar">
        <button
          type="button"
          className="btn-primary mandatory-add"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Plus size={18} />
          Добавить
        </button>
      </div>

      <ul className="mandatory-list scroll-y">
        {dayTasks.length === 0 && (
          <li className="mandatory-empty">Нет обязательных задач на этот день</li>
        )}
        {dayTasks.map((task) => (
          <MandatoryItem
            key={task.id}
            task={task}
            date={date}
            onEdit={() => {
              setEditing(task);
              setEditorOpen(true);
            }}
          />
        ))}
      </ul>

      <TaskEditorModal
        open={editorOpen}
        anchorDate={date}
        kind="mandatory"
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => {
          if (editing) {
            updateMandatoryTask(editing.id, {
              title: data.title,
              notes: data.notes,
              recurrence: data.recurrence,
              weeklyDays: data.weeklyDays,
            });
          } else {
            addMandatoryTask({
              title: data.title,
              notes: data.notes,
              anchorDate: data.anchorDate,
              recurrence: data.recurrence,
              weeklyDays: data.weeklyDays,
            });
          }
        }}
      />
    </div>
  );
}
