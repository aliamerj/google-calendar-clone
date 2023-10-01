import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { FunctionComponent, useMemo, useState } from "react";
import { formatDate } from "../utils/formatDate";
import { cc } from "../utils/cc";
import { addMonths } from "date-fns/esm";
import { useEvent } from "../context/useEventHook";
import { EventFormModal } from "./Modal";
import { Event } from "../context/Events";

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
  const { events } = useEvent();

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
              events={events.filter((e) => isSameDay(day, e.date))}
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
  events: Event[];
}

const CalendarDay: FunctionComponent<ICalenderDay> = ({
  showWeekName,
  selectedMonth,
  dayData,
  events,
}) => {
  const { addEvent } = useEvent();
  const [isNewEventModalOpen, setIsNewEventModalOpen] =
    useState<boolean>(false);
  const sortedEvents = useMemo(() => {
    const timeToNumber = (time: string) => parseFloat(time.replace(":", "."));
    return [...events].sort((a, b) => {
      if (a.allDay && b.allDay) {
        return 0;
      } else if (a.allDay) {
        return -1;
      } else if (b.allDay) {
        return 1;
      } else {
        return timeToNumber(a.startTime) - timeToNumber(b.startTime);
      }
    });
  }, [events]);
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
        <button
          className="add-event-btn"
          onClick={() => setIsNewEventModalOpen(true)}
        >
          +
        </button>
      </div>
      {sortedEvents.length > 0 && (
        <div className="events">
          {sortedEvents.map((e) => (
            <CalendarEvent key={e.id} event={e} />
          ))}
        </div>
      )}
      <EventFormModal
        date={dayData}
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSubmit={addEvent}
      />
    </div>
  );
};

function CalendarEvent({ event }: { event: Event }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateEvent, deleteEvent } = useEvent();

  return (
    <>
      <button
        onClick={() => setIsEditModalOpen(true)}
        className={cc("event", event.color, event.allDay && "all-day-event")}
      >
        {event.allDay ? (
          <div className="event-name">{event.name}</div>
        ) : (
          <>
            <div className={`color-dot ${event.color}`}></div>
            <div className="event-time">
              {formatDate(parse(event.startTime, "HH:mm", event.date), {
                timeStyle: "short",
              })}
            </div>
            <div className="event-name">{event.name}</div>
          </>
        )}
      </button>
      <EventFormModal
        event={event}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(e) => updateEvent(event.id, e)}
        onDelete={() => deleteEvent(event.id)}
      />
    </>
  );
}
