import { useRef } from "react";

export const useEvent = () => {
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }

  const Event = {
    fire: (eventName: string, data: any = null) => {
      const event = new CustomEvent(eventName, { detail: data });
      documentRef.current && documentRef.current.dispatchEvent(event);
    },
    on: (eventName: string, callback: (data: any) => void) => {
      documentRef.current &&
        documentRef.current.addEventListener(eventName, (event: Event) => {
          callback((event as CustomEvent).detail);
        });
    },
  };

  return { Event };
};
