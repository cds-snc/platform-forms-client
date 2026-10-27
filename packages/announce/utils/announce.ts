import { Priority } from "../src/Announce";
import { enqueueAnnouncement } from "../src/coordinator";

export const announce = (message: string, priority: Priority = Priority.LOW) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!message) {
    return;
  }

  enqueueAnnouncement(message, priority);
};
