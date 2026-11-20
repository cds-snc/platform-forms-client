import type { Priority } from "./AnnounceLiveRegions";
import type { AnnounceOptions } from "./announce";

const DUPLICATE_WINDOW_MS = 1000;
const MAX_PENDING_MESSAGES = 20;

type Publisher = (message: string, priority: Priority, lang?: string) => void;

interface PendingMessage {
  message: string;
  priority: Priority;
  lang?: string;
  allowDuplicates: boolean;
  callers: Map<AbortSignal | undefined, () => void>;
  cleanup: () => void;
}

const reportPublicationFailure = () => {
  // eslint-disable-next-line no-console
  console.error("[gcforms/announce] Delivery stopped after a publication error.");
};

/**
 * Publishes announcements in submission order, spacing out live-region updates.
 * @param publisher Callback that updates the live region with a message, priority, and optional language.
 * @param onError Reports a publication failure after the scheduler has stopped.
 * @param publicationIntervalMs Spaces publications of both priorities.
 * @returns `enqueue` to submit messages, `pause`/`resume` to control delivery without
 * losing pending work, and `stop` to permanently cancel pending work and timers.
 */
export const createScheduler = (
  publisher: Publisher,
  onError = reportPublicationFailure,
  publicationIntervalMs = 1000
) => {
  const queue: PendingMessage[] = [];
  const lastPublished: Partial<
    Record<Priority, { message: string; lang?: string; publishedAt: number }>
  > = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let paused = false;

  const _addCaller = (pending: PendingMessage, signal: AbortSignal | undefined) => {
    if (pending.callers.has(signal)) return;

    const cancel = () => {
      signal?.removeEventListener("abort", cancel);
      pending.callers.delete(signal);
      if (pending.callers.size === 0) {
        const index = queue.indexOf(pending);
        if (index !== -1) queue.splice(index, 1);
      }
    };

    pending.callers.set(signal, cancel);
    signal?.addEventListener("abort", cancel, { once: true });
  };

  const _isRecentDuplicate = (message: string, priority: Priority, lang?: string): boolean => {
    const previous = lastPublished[priority];
    return (
      previous?.message === message &&
      previous.lang === lang &&
      performance.now() - previous.publishedAt < DUPLICATE_WINDOW_MS
    );
  };

  const _takeNextMessage = ():
    { message: string; priority: Priority; lang?: string } | undefined => {
    while (queue.length) {
      const { message, priority, lang, allowDuplicates, cleanup } = queue.shift()!;
      cleanup();

      // Dropping or cancelling a queued message can leave a repeat of something we just announced
      if (!allowDuplicates && _isRecentDuplicate(message, priority, lang)) {
        continue;
      }

      return { message, priority, lang };
    }
  };

  const _publish = () => {
    const nextMessage = _takeNextMessage();
    if (!nextMessage) return;

    const { message, priority, lang } = nextMessage;
    if (lang === undefined) {
      publisher(message, priority);
    } else {
      publisher(message, priority, lang);
    }
    lastPublished[priority] = { message, lang, publishedAt: performance.now() };
    timer = setTimeout(() => {
      timer = undefined;
      _schedule();
    }, publicationIntervalMs);
  };

  const _schedule = () => {
    if (stopped || paused || timer !== undefined) return;

    try {
      _publish();
    } catch {
      stop();
      onError();
    }
  };

  const enqueue = (message: string, priority: Priority, options: AnnounceOptions = {}) => {
    const signal = options.signal;
    const lang = options.lang;
    if (stopped || !message || signal?.aborted) return;

    const lastQueued = queue.findLast((pending) => pending.priority === priority);
    if (!options.allowDuplicates) {
      if (lastQueued?.message === message && lastQueued.lang === lang) {
        // Share the message, but let each caller cancel just their own request.
        _addCaller(lastQueued, signal);
        return;
      }
      if (!lastQueued && _isRecentDuplicate(message, priority, lang)) return;
    }

    const pending: PendingMessage = {
      message,
      priority,
      lang,
      allowDuplicates: options.allowDuplicates === true,
      callers: new Map(),
      cleanup: () => {
        for (const [signal, cancel] of pending.callers) {
          signal?.removeEventListener("abort", cancel);
        }
        pending.callers.clear();
      },
    };

    _addCaller(pending, signal);
    queue.push(pending);

    if (queue.length > MAX_PENDING_MESSAGES) {
      const oldestPolite = queue.findIndex((pending) => pending.priority === "polite");
      const [dropped] = queue.splice(oldestPolite === -1 ? 0 : oldestPolite, 1);
      dropped.cleanup();

      // eslint-disable-next-line no-console
      console.warn(
        `[gcforms/announce] Pending message limit reached; discarded the oldest ${dropped.priority} message.`
      );
    }

    _schedule();
  };

  const pause = () => {
    paused = true;
  };

  const resume = () => {
    paused = false;
    _schedule();
  };

  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    timer = undefined;

    for (const pending of queue) {
      pending.cleanup();
    }

    queue.length = 0;
  };

  return { enqueue, pause, resume, stop };
};
