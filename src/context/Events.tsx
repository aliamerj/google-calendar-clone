import { FunctionComponent, ReactNode, createContext, useState } from "react";
import { UnionOmit } from "../utils/types";
import { EVENT_COLORS } from "./useEventHook";

type Event = {
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
}
interface IEventsProider {
  children: ReactNode;
}

export const Context = createContext<IEventsContext | null>(null);

export const EventsProvider: FunctionComponent<IEventsProider> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  function addEvent(event: UnionOmit<Event, "id">) {
    setEvents((e) => [...e, { ...event, id: crypto.randomUUID() }]);
  }
  return (
    <Context.Provider value={{ events, addEvent }}>{children}</Context.Provider>
  );
};
