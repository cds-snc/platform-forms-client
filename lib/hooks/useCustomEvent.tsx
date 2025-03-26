import { useRef } from "react";

export type CustomEventDetails<T = undefined> = T;
type OnFunction = <T>(eventName: string, callback: (detail: CustomEventDetails<T>) => void) => void;
type OffFunction = <T>(
  eventName: string,
  callback: (detail: CustomEventDetails<T>) => void
) => void;
type FireFunction = <T>(eventName: string, detail?: CustomEventDetails<T>) => void;

type EventType = {
  on: OnFunction;
  off: OffFunction;
  fire: FireFunction;
};

export const EventKeys = {
  openApiKeyDialog: "open-api-key-dialog",
  openDynamicRowDialog: "open-dynamic-row-dialog",
  openMoreDialog: "open-more-dialog",
  openDeleteApiKeyDialog: "open-delete-api-key-dialog",
  openRulesDialog: "open-rules-dialog",
  deleteApiKey: "delete-api-key",
  openAddUserNoteDialog: "open-add-user-note-dialog",
  openDeactivateUserDialog: "open-deactivate-user-dialog",
  liveMessage: "live-message",
  liveMessageObject: "live-message-object",
} as const;

export const useCustomEvent = () => {
  // Attach listeners to a documentRef instead of document directly
  // https://www.preciousorigho.com/articles/a-better-way-to-create-event-listeners-in-react
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }

  const Event: EventType = {
    /**
     * Fire an event, pass an optional payload
     * @param eventName string
     * @param data CustomEventDetails
     */
    fire: (eventName, detail = undefined) => {
      const event = new CustomEvent(eventName, { detail });
      documentRef.current && documentRef.current.dispatchEvent(event);
    },

    /**
     * Register an event listener
     * @param eventName string
     * @param callback (detail: CustomEventDetails) => void
     */
    on: (eventName, callback) => {
      documentRef.current &&
        documentRef.current.addEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },

    /**
     * Remove an event listener
     * @param eventName string
     * @param callback (detail: CustomEventDetails) => void
     */
    off: (eventName, callback) => {
      documentRef.current &&
        documentRef.current.removeEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
  };

  return { Event };
};
