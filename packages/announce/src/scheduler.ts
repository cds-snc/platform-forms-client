import type { Priority } from "./AnnounceLiveRegions";
import type { AnnounceOptions } from "./announce";

const PUBLICATION_INTERVAL_MS = 1000;
const MAX_PENDING_MESSAGES = 20;

type Publisher = (message: string, priority: Priority) => void;

interface PendingMessage {
  message: string;
  allowDuplicates: boolean;
  cleanup: () => void;
}

const reportPublicationFailure = () => {
  // eslint-disable-next-line no-console
  console.error("[gcforms/announce] Delivery stopped after a publication error.");
};

/**
 * Queues announcements and spaces them out, letting urgent messages jump ahead.
 * @param publisher Callback that updates the live region with a message and its priority.
 * @param onError Reports a publication failure after the scheduler has stopped.
 * @returns `enqueue` to submit messages, `pause`/`resume` to control delivery without
 * losing pending work, and `stop` to permanently cancel pending work and timers.
 */
export const createScheduler = (publisher: Publisher, onError = reportPublicationFailure) => {
  const politeQueue: PendingMessage[] = [];
  const assertiveQueue: PendingMessage[] = [];
  const lastPublished: Partial<Record<Priority, string>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastPriority: Priority | undefined;
  let stopped = false;
  let paused = false;

  const _getQueue = (priority: Priority): PendingMessage[] =>
    priority === "assertive" ? assertiveQueue : politeQueue;

  const _takeNextMessage = (): { message: string; priority: Priority } | undefined => {
    while (assertiveQueue.length || politeQueue.length) {
      const priority = assertiveQueue.length ? "assertive" : "polite";
      const queue = _getQueue(priority);
      const { message, allowDuplicates, cleanup } = queue.shift()!;
      cleanup();

      // Overflow can drop the message separating two identical announcements
      // Skip any message that now matches the last publication for this priority
      if (!allowDuplicates && lastPublished[priority] === message) {
        continue;
      }

      return { message, priority };
    }
  };

  const _publish = () => {
    const nextMessage = _takeNextMessage();
    if (!nextMessage) return;

    const { message, priority } = nextMessage;
    publisher(message, priority);
    lastPublished[priority] = message;
    lastPriority = priority;
    timer = setTimeout(() => {
      timer = undefined;
      _schedule();
    }, PUBLICATION_INTERVAL_MS);
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
    if (stopped || !message || signal?.aborted) return;

    const queue = _getQueue(priority);
    // Compare with the last pending message, or the last publication if this queue is empty.
    const previousMessage = queue.at(-1)?.message ?? lastPublished[priority];

    if (!options.allowDuplicates && previousMessage === message) return;

    const pending: PendingMessage = {
      message,
      allowDuplicates: options.allowDuplicates === true,
      cleanup: () => signal?.removeEventListener("abort", cancel),
    };

    const cancel = () => {
      const index = queue.indexOf(pending);
      if (index !== -1) queue.splice(index, 1);
      pending.cleanup();
    };

    signal?.addEventListener("abort", cancel, { once: true });
    queue.push(pending);

    if (politeQueue.length + assertiveQueue.length > MAX_PENDING_MESSAGES) {
      const droppedPriority = politeQueue.length ? "polite" : "assertive";
      const droppedQueue = _getQueue(droppedPriority);
      droppedQueue.shift()?.cleanup();

      // eslint-disable-next-line no-console
      console.warn(
        `[gcforms/announce] Pending message limit reached; discarded the oldest ${droppedPriority} message.`
      );
    }

    if (priority === "assertive" && lastPriority === "polite" && timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
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

    for (const pending of [...politeQueue, ...assertiveQueue]) {
      pending.cleanup();
    }

    politeQueue.length = 0;
    assertiveQueue.length = 0;
  };

  return { enqueue, pause, resume, stop };
};
