import { useRef } from "react";

/**
 *  @TODO: Define unique payload types for each CustomEvent and add
 *         to CustomEventDetails instead of using generic object
 */
export type CustomEventDetails = object | undefined;

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
    fire: (eventName: string, data: CustomEventDetails = undefined) => {
      const event = new CustomEvent(eventName, { detail: data });
      documentRef.current && documentRef.current.dispatchEvent(event);
    },

    /**
     * Register an event listener
     * @param eventName string
     * @param callback (data: CustomEventDetails) => void
     */
    on: (eventName: string, callback: (data: CustomEventDetails) => void) => {
      documentRef.current &&
        documentRef.current.addEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },

    /**
     * Remove an event listener
     * @param eventName string
     * @param callback (data: CustomEventDetails) => void
     */
    off: (eventName: string, callback: (data: CustomEventDetails) => void) => {
      documentRef.current &&
        documentRef.current.removeEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
  };

  return { Event };
};
