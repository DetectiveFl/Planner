import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowLeft, Clock, ListChecks, X } from "lucide-react";
import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { MandatoryDayView } from "./MandatoryDayView";
import { TimedDayView } from "./TimedDayView";
import "./DayPanel.css";

export function DayPanel() {
  const selectedDay = usePlannerStore((s) => s.selectedDay);
  const dayMode = usePlannerStore((s) => s.dayMode);
  const dayPanelWidth = usePlannerStore((s) => s.dayPanelWidth);
  const closeDay = usePlannerStore((s) => s.closeDay);
  const setDayMode = usePlannerStore((s) => s.setDayMode);
  const setDayPanelWidth = usePlannerStore((s) => s.setDayPanelWidth);

  const resizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(dayPanelWidth);

  const onResizeStart = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      resizing.current = true;
      startX.current = e.clientX;
      startWidth.current = dayPanelWidth;
      document.body.classList.add("day-panel-resizing");
    },
    [dayPanelWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const delta = startX.current - e.clientX;
      setDayPanelWidth(startWidth.current + delta);
    };
    const onUp = () => {
      resizing.current = false;
      document.body.classList.remove("day-panel-resizing");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("day-panel-resizing");
    };
  }, [setDayPanelWidth]);

  if (!selectedDay) return null;

  const dateLabel = format(parseISO(selectedDay), "d MMMM yyyy, EEEE", {
    locale: ru,
  });

  return (
    <div className="day-panel">
      <button
        type="button"
        className="day-panel-backdrop"
        aria-label="Закрыть панель дня"
        onClick={closeDay}
      />
      <div className="day-panel-inner" style={{ width: dayPanelWidth }}>
        <div
          className="day-panel-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Изменить ширину панели"
          onMouseDown={onResizeStart}
        />
        <header className="day-panel-header">
          <div className="day-panel-title-row">
            {dayMode !== "chooser" ? (
              <button
                type="button"
                className="btn-icon"
                aria-label="Назад"
                onClick={() => setDayMode("chooser")}
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <span className="day-panel-spacer" />
            )}
            <div>
              <p className="day-panel-kicker">День</p>
              <h2>{dateLabel}</h2>
            </div>
            <button
              type="button"
              className="btn-icon"
              aria-label="Закрыть"
              onClick={closeDay}
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {dayMode === "chooser" && (
          <div className="day-chooser">
            <button
              type="button"
              className="day-option"
              onClick={() => setDayMode("timed")}
            >
              <Clock size={28} strokeWidth={1.5} />
              <div>
                <strong>Задачи по времени</strong>
                <span>Расписание дня, как в Teams</span>
              </div>
            </button>
            <button
              type="button"
              className="day-option"
              onClick={() => setDayMode("mandatory")}
            >
              <ListChecks size={28} strokeWidth={1.5} />
              <div>
                <strong>Обязательные</strong>
                <span>Список дел без привязки ко времени</span>
              </div>
            </button>
          </div>
        )}

        {dayMode === "timed" && <TimedDayView date={selectedDay} />}
        {dayMode === "mandatory" && <MandatoryDayView date={selectedDay} />}
      </div>
    </div>
  );
}
