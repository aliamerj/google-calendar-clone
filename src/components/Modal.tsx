import {
  FormEvent,
  Fragment,
  FunctionComponent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { UnionOmit } from "../utils/types";
import { Event } from "../context/Events";
import { formatDate } from "../utils/formatDate";
import { EVENT_COLORS } from "../context/useEventHook";
type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};
type EventFormModalProps = {
  onSubmit: (event: UnionOmit<Event, "id">) => void;
} & (
  | { onDelete: () => void; event: Event; date?: never }
  | { onDelete?: never; event?: never; date: Date }
) &
  Omit<ModalProps, "children">;
export const EventFormModal: FunctionComponent<EventFormModalProps> = ({
  onSubmit,
  onDelete,
  event,
  date,
  ...modalProps
}) => {
  const isNew = event == null;
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const name = nameRef.current?.value;
    const endTime = endTimeRef.current?.value;

    if (name == null || name === "") return;

    const commonProps = {
      name,
      date: date || event?.date,
      color: selectedColor,
    };
    let newEvent: UnionOmit<Event, "id">;

    if (isAllDayChecked) {
      newEvent = {
        ...commonProps,
        allDay: true,
      };
    } else {
      if (
        startTime == null ||
        startTime === "" ||
        endTime == null ||
        endTime === ""
      ) {
        return;
      }
      newEvent = {
        ...commonProps,
        allDay: false,
        startTime,
        endTime,
      };
    }

    modalProps.onClose();
    onSubmit(newEvent);
  }
  const formId = useId();
  const [selectedColor, setSelectedColor] = useState(
    event?.color || EVENT_COLORS[0],
  );
  const [isAllDayChecked, setIsAllDayChecked] = useState(
    event?.allDay || false,
  );
  const [startTime, setStartTime] = useState(event?.startTime || "");
  const endTimeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <Modal {...modalProps}>
      <div>
        <div className="modal-title">
          <div>{isNew ? "Add" : "Edit"} Event</div>
          <small>
            {formatDate(date || event.date, { dateStyle: "short" })}
          </small>
          <button className="close-btn" onClick={modalProps.onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor={`${formId}-name`}>Name</label>
            <input
              required
              defaultValue={event?.name}
              ref={nameRef}
              type="text"
              id={`${formId}-name`}
            />
          </div>
          <div className="form-group checkbox">
            <input
              checked={isAllDayChecked}
              onChange={(e) => setIsAllDayChecked(e.target.checked)}
              type="checkbox"
              id={`${formId}-all-day`}
            />
            <label htmlFor={`${formId}-all-day`}>All Day?</label>
          </div>
          <div className="row">
            <div className="form-group">
              <label htmlFor={`${formId}-start-time`}>Start Time</label>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required={!isAllDayChecked}
                disabled={isAllDayChecked}
                type="time"
                id={`${formId}-start-time`}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`${formId}-end-time`}>End Time</label>
              <input
                ref={endTimeRef}
                defaultValue={event?.endTime}
                min={startTime}
                required={!isAllDayChecked}
                disabled={isAllDayChecked}
                type="time"
                id={`${formId}-end-time`}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="row left">
              {EVENT_COLORS.map((color) => (
                <Fragment key={color}>
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    id={`${formId}-${color}`}
                    checked={selectedColor === color}
                    onChange={() => setSelectedColor(color)}
                    className="color-radio"
                  />
                  <label htmlFor={`${formId}-${color}`}>
                    <span className="sr-only">{color}</span>
                  </label>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="row">
            <button className="btn btn-success" type="submit">
              {isNew ? "Add" : "Edit"}
            </button>
            {onDelete != null && (
              <button
                onClick={onDelete}
                className="btn btn-delete"
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

const Modal: FunctionComponent<ModalProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);
  if (!isOpen) return null;
  return createPortal(
    <div className="modal">
      <div className="overlay" onClick={onClose} />
      <div className="modal-body">{children}</div>
    </div>,
    document.querySelector("#modal-container") as HTMLElement,
  );
};
