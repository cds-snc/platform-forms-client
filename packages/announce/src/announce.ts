import { Priority } from "./AnnounceLiveRegion";
import { publishAnnouncement } from "./coordinator";

export interface AnnounceOptions {
  allowDuplicates?: boolean;
  signal?: AbortSignal;
  lang?: string;
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

  publishAnnouncement(message, priority, options);
};
