import { Priority } from "./AnnounceLiveRegions";
import { enqueueAnnouncement } from "./coordinator";

export interface AnnounceOptions {
  allowDuplicates?: boolean;
  signal?: AbortSignal;
}

export const announce = (
  message: string,
  priority: Priority = Priority.LOW,
  options: AnnounceOptions = {}
) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!message || options.signal?.aborted) {
    return;
  }

  enqueueAnnouncement(message, priority, options);
};
