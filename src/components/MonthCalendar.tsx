import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { occursOnDate, dateKey } from "../utils/recurrence";
import "./MonthCalendar.css";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function MonthCalendar() {
  const calendarMonth = usePlannerStore((s) => s.calendarMonth);
  const setCalendarMonth = usePlannerStore((s) => s.setCalendarMonth);
  const openDay = usePlannerStore((s) => s.openDay);
  const selectedDay = usePlannerStore((s) => s.selectedDay);
  const timedTasks = usePlannerStore((s) => s.timedTasks);
  const mandatoryTasks = usePlannerStore((s) => s.mandatoryTasks);

  const monthDate = parseISO(`${calendarMonth}-01`);
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthDate]);

  const dotsForDay = (day: Date) => {
    const key = dateKey(day);
    let timed = 0;
    let mandatory = 0;
    for (const t of timedTasks) {
      if (occursOnDate(t.anchorDate, t.recurrence, day, t.weeklyDays))
        timed++;
    }
    for (const t of mandatoryTasks) {
      if (occursOnDate(t.anchorDate, t.recurrence, day, t.weeklyDays))
        mandatory++;
    }
    return { timed, mandatory, key };
  };

  return (
    <div className="month-calendar">
      <header className="month-header">
        <button
          type="button"
          className="btn-icon"
          aria-label="Предыдущий месяц"
          onClick={() =>
            setCalendarMonth(format(addMonths(monthDate, -1), "yyyy-MM"))
          }
        >
          <ChevronLeft size={20} />
        </button>
        <h1>{format(monthDate, "LLLL yyyy", { locale: ru })}</h1>
        <button
          type="button"
          className="btn-icon"
          aria-label="Следующий месяц"
          onClick={() =>
            setCalendarMonth(format(addMonths(monthDate, 1), "yyyy-MM"))
          }
        >
          <ChevronRight size={20} />
        </button>
      </header>

      <div className="month-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="month-weekday">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthDate);
          const isToday = isSameDay(day, today);
          const selected = selectedDay === dateKey(day);
          const { timed, mandatory } = dotsForDay(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={[
                "month-cell",
                !inMonth && "muted",
                isToday && "today",
                selected && "selected",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => openDay(dateKey(day))}
            >
              <span className="month-cell-num">{format(day, "d")}</span>
              {(timed > 0 || mandatory > 0) && (
                <span className="month-dots">
                  {timed > 0 && <i className="dot timed" />}
                  {mandatory > 0 && <i className="dot mandatory" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
