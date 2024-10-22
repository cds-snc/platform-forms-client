import { useRef } from "react";

/**
 * @TODO: Define unique payload types for each CustomEvent and add
 *         to CustomEventDetails instead of using generic object
 *
 * Example: a MoreDialog listener might accept a payload like:
 *
 * type MoreDialogEventDetails = {
 *   item: FormElementWithIndex;
 * }
 */

export type CustomEventDetails<T = undefined> = T;
type FireFunction = <T>(eventName: string, detail?: CustomEventDetails<T>) => void;


type Event = {
  fire: FireFunction;
  on: <T>(eventName: string, callback: (detail: CustomEventDetails<T>) => void) => void;
  off: <T>(eventName: string, callback: (detail: CustomEventDetails<T>) => void) => void;
};

export const useCustomEvent = () => {
  // Attach listeners to a documentRef instead of document directly
  // https://www.preciousorigho.com/articles/a-better-way-to-create-event-listeners-in-react
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }


  const Event = {
    /**
     * Fire an event, pass an optional payload
     * @param eventName string
     * @param data CustomEventDetails
     */
    fire: (eventName, detail) => {
      const event = new CustomEvent(eventName, { detail });
      documentRef.current && documentRef.current.dispatchEvent(event);
    },

    /**
     * Register an event listener
     * @param eventName string
     * @param callback (detail: CustomEventDetails) => void
     */
    on: (eventName: string, callback: (detail: CustomEventDetails) => void) => {
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
    off: (eventName: string, callback: (detail: CustomEventDetails) => void) => {
      documentRef.current &&
        documentRef.current.removeEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
  };

  return { Event };
};
