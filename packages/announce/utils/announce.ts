import { Priority } from "../src/Announce";

export const announce = (message: string, priority: Priority = Priority.LOW) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!message) {
    return;
  }

  const eventName = `gc-announce-${priority == Priority.LOW ? "polite" : "assertive"}`;
  const event = new CustomEvent(eventName, {
    detail: { message, priority },
  });
  window.dispatchEvent(event);
};
