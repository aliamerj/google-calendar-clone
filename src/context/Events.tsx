import { FunctionComponent, ReactNode, createContext } from "react";
import { UnionOmit } from "../utils/types";
import { EVENT_COLORS } from "./useEventHook";
import { useLocalStorage } from "./useLocalStorageHook";

export type Event = {
  id: string;
  name: string;
  color: (typeof EVENT_COLORS)[number];
  date: Date;
} & (
  | { allDay: false; startTime: string; endTime: string }
  | { allDay: true; startTime?: never; endTime?: never }
);
interface IEventsContext {
  events: Event[];
  addEvent: (event: UnionOmit<Event, "id">) => void;
  updateEvent: (id: string, eventDetails: UnionOmit<Event, "id">) => void;
  deleteEvent: (id: string) => void;
}
interface IEventsProider {
  children: ReactNode;
}

export const Context = createContext<IEventsContext | null>(null);

export const EventsProvider: FunctionComponent<IEventsProider> = ({
  children,
}) => {
  const [events, setEvents] = useLocalStorage("EVENTS", []);
  function addEvent(event: UnionOmit<Event, "id">) {
    setEvents((e) => [...e, { ...event, id: crypto.randomUUID() }]);
  }
  function updateEvent(id: string, eventDetails: UnionOmit<Event, "id">) {
    setEvents((e) => {
      return e.map((event) => {
        return event.id === id ? { id, ...eventDetails } : event;
      });
    });
  }

  function deleteEvent(id: string) {
    setEvents((e) => e.filter((event) => event.id !== id));
  }
  return (
    <Context.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </Context.Provider>
  );
};
