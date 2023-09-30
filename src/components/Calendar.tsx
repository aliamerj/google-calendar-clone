import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { FunctionComponent, useMemo, useState } from "react";
import { formatDate } from "../utils/formatDate";
import { cc } from "../utils/cc";
import { addMonths } from "date-fns/esm";

export const Calendar: FunctionComponent = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const calendarDays = useMemo(() => {
    const firstWeekStart = startOfWeek(startOfMonth(selectedMonth));
    const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth));
    return eachDayOfInterval({
      start: firstWeekStart,
      end: lastWeekEnd,
    });
  }, [selectedMonth]);

  return (
    <>
      <div className="calendar">
        <div className="header">
          <button className="btn" onClick={() => setSelectedMonth(new Date())}>
            Today
          </button>
          <div>
            <button
              className="month-change-btn"
              onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
            >
              &lt;
            </button>
            <button
              className="month-change-btn"
              onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
            >
              &gt;
            </button>
          </div>
          <span className="month-title">
            {formatDate(selectedMonth, { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="days">
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={day.getTime()}
              dayData={day}
              showWeekName={index < 7}
              selectedMonth={selectedMonth}
            />
          ))}
        </div>
      </div>
    </>
  );
};

interface ICalenderDay {
  dayData: Date;
  showWeekName: boolean;
  selectedMonth: Date;
}

const CalendarDay: FunctionComponent<ICalenderDay> = ({
  showWeekName,
  selectedMonth,
  dayData,
}) => {
  return (
    <div
      className={cc(
        "day",
        !isSameMonth(dayData, selectedMonth) && "non-month-day",
        isBefore(endOfDay(dayData), new Date()) && "old-month-day",
      )}
    >
      <div className="day-header">
        {showWeekName && (
          <div className="week-name">
            {formatDate(dayData, { weekday: "short" })}
          </div>
        )}
        <div className={cc("day-number", isToday(dayData) && "today")}>
          {formatDate(dayData, { day: "numeric" })}
        </div>
        <button className="add-event-btn">+</button>
      </div>
    </div>
  );
};
