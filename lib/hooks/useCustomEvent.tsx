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
  submitProgress: "submit-progress",
  openUnconfirmedApiKeyDialog: "open-unconfirmed-api-key-dialog",
  openCreateDraftConfirmDialog: "open-create-draft-confirm-dialog",
  formValuesChanged: "form-values-changed",
} as const;

// Per-callback, per-event wrapper registry so the same callback can be
// registered/removed for multiple event names without interference.
//
// Note: `any` is intentional: callbacks have different generic types and TypeScript's
// "contravariance" prevents a typed common base. Type safety is at the call (on/off/fire).
// Another option would be using a `Symbol` + wrapper but that looks unusual and has
// drawbacks e.g. no automatic garbage collection of the wrapper etc.
// `unknown` is also not ideal because it would require casting to `any` in the wrapper,
// which is less safe.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listenerMap = new WeakMap<(detail: any) => void, Map<string, (event: Event) => void>>();

export const useCustomEvent = () => {
  // Attach listeners to a documentRef instead of document directly
  // https://www.preciousorigho.com/articles/a-better-way-to-create-event-listeners-in-react
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/refs
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
      if (!documentRef.current) return;
      const wrapper = (event: Event) => {
        callback((event as CustomEvent).detail);
      };

      let perEvent = listenerMap.get(callback);
      if (!perEvent) {
        perEvent = new Map();
        listenerMap.set(callback, perEvent);
      }
      // Remove any previously registered wrapper for this (callback, eventName) pair
      // before adding the new one, to prevent duplicate listeners and leaks.
      const existing = perEvent.get(eventName);
      if (existing) {
        documentRef.current.removeEventListener(eventName, existing);
      }
      perEvent.set(eventName, wrapper);
      documentRef.current.addEventListener(eventName, wrapper);
    },

    /**
     * Remove an event listener
     * @param eventName string
     * @param callback (detail: CustomEventDetails) => void
     */
    off: (eventName, callback) => {
      if (!documentRef.current) return;
      const perEvent = listenerMap.get(callback);
      const wrapper = perEvent?.get(eventName);
      if (wrapper) {
        documentRef.current.removeEventListener(eventName, wrapper);
        perEvent!.delete(eventName);
        if (perEvent!.size === 0) {
          listenerMap.delete(callback);
        }
      }
    },
  };

  return { Event };
};
