import { getDay, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import type { MandatoryTask, Recurrence, TimedTask } from "../types";
import { RECURRENCE_LABELS } from "../utils/recurrence";
import { minutesToLabel, parseTimeInput } from "../utils/time";

interface Props {
  open: boolean;
  anchorDate: string;
  initial?: TimedTask | MandatoryTask | null;
  kind: "timed" | "mandatory";
  onClose: () => void;
  onSave: (data: {
    title: string;
    notes?: string;
    startMinutes?: number;
    durationMinutes?: number;
    recurrence: Recurrence;
    weeklyDays?: number[];
    anchorDate: string;
  }) => void;
}

const WEEK_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function TaskEditorModal({
  open,
  anchorDate,
  initial,
  kind,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setNotes(initial.notes ?? "");
      setRecurrence(initial.recurrence);
      setWeeklyDays(initial.weeklyDays ?? []);
      if ("startMinutes" in initial) {
        const end = initial.startMinutes + initial.durationMinutes;
        setStartTime(minutesToLabel(initial.startMinutes));
        setEndTime(minutesToLabel(end));
      }
    } else {
      setTitle("");
      setNotes("");
      setStartTime("09:00");
      setEndTime("10:00");
      setRecurrence("none");
      setWeeklyDays([]);
    }
    setError("");
  }, [open, initial]);

  if (!open) return null;

  const toggleWeekday = (d: number) => {
    setWeeklyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  const submit = () => {
    if (!title.trim()) {
      setError("Введите название");
      return;
    }
    let days = weeklyDays;
    if (recurrence === "weekly" && days.length === 0) {
      days = [getDay(parseISO(anchorDate))];
    }
    if (kind === "timed") {
      const start = parseTimeInput(startTime);
      const end = parseTimeInput(endTime);
      if (start === null || end === null || end <= start) {
        setError("Проверьте время начала и окончания");
        return;
      }
      onSave({
        title: title.trim(),
        notes: notes.trim() || undefined,
        startMinutes: start,
        durationMinutes: end - start,
        recurrence,
        weeklyDays: recurrence === "weekly" ? days : undefined,
        anchorDate,
      });
    } else {
      onSave({
        title: title.trim(),
        notes: notes.trim() || undefined,
        recurrence,
        weeklyDays: recurrence === "weekly" ? days : undefined,
        anchorDate,
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-editor-title"
      >
        <h3 id="task-editor-title">
          {initial ? "Редактировать задачу" : "Новая задача"}
        </h3>

        <div className="form-field">
          <label htmlFor="task-title">Название</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Что нужно сделать?"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label htmlFor="task-notes">Заметка</label>
          <textarea
            id="task-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Необязательно"
          />
        </div>

        {kind === "timed" && (
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-start">Начало</label>
              <input
                id="task-start"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00"
              />
            </div>
            <div className="form-field">
              <label htmlFor="task-end">Конец</label>
              <input
                id="task-end"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00"
              />
            </div>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="task-recurrence">Повтор</label>
          <select
            id="task-recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          >
            {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
              <option key={r} value={r}>
                {RECURRENCE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {recurrence === "weekly" && (
          <div className="form-field">
            <label>Дни недели</label>
            <div className="weekday-picks">
              {WEEK_LABELS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  className={`weekday-pick ${weeklyDays.includes(idx) ? "on" : ""}`}
                  onClick={() => toggleWeekday(idx)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="btn-primary" onClick={submit}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
