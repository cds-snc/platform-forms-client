"use client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { useCallback, useEffect, useRef } from "react";

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

export interface Message {
  message: string;
  priority?: Priority;
}

export const LiveRegion = () => {
  const { Event } = useCustomEvent();

  // Use refs to avoid unnecessary rerenders of this component
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);

  const livePolite = (message: string) => {
    if (!messageLowRef.current || messageLowRef.current.textContent === message) {
      return;
    }
    logMessage.info(`speak: ${message}`);
    messageLowRef.current.textContent = message;
  };

  // TODO role=alert seems to have trouble queuing updates, come back to this
  const liveAssertive = (message: string) => {
    if (!messageHighRef.current || messageHighRef.current.textContent === message) {
      return;
    }
    logMessage.info(`speak (high priority): ${message}`);
    messageHighRef.current.textContent = message + Date.now();
  };

  const speak = useCallback((detail: Message) => {
    if (!detail) {
      return;
    }

    if (detail.priority === Priority.HIGH) {
      liveAssertive(detail.message);
    } else {
      livePolite(detail.message);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.liveMessage, speak);

    return () => {
      Event.off(EventKeys.liveMessage, speak);
    };
  }, [Event, speak]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only" ref={messageLowRef}></div>
      <div role="alert" aria-live="assertive" className="sr-only" ref={messageHighRef}></div>
    </>
  );
};
