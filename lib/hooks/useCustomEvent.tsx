import { useRef } from "react";

/**
 *  @TODO: Define unique payload types for each CustomEvent and add
 *         to CustomEventDetails instead of using generic object
 */
export type CustomEventDetails = object | undefined;

export const useCustomEvent = () => {
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }

  const Event = {
    fire: (eventName: string, data: CustomEventDetails = undefined) => {
      const event = new CustomEvent(eventName, { detail: data });
      documentRef.current && documentRef.current.dispatchEvent(event);
    },
    on: (eventName: string, callback: (data: CustomEventDetails) => void) => {
      documentRef.current &&
        documentRef.current.addEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
    off: (eventName: string, callback: (data: CustomEventDetails) => void) => {
      documentRef.current &&
        documentRef.current.removeEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
  };

  return { Event };
};
