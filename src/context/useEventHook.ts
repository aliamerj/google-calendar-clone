import { useContext } from "react";
import { Context } from "./Events";
export const EVENT_COLORS = ["red", "blue", "green"] as const;
export const useEvent = () => {
  const value = useContext(Context);
  if (value == null) {
    throw new Error("useEvents must be used without an events provider");
  }
  return value;
};
