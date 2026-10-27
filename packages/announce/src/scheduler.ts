import type { Priority } from "./Announce";

const PUBLICATION_INTERVAL_MS = 1000;
const MAX_PENDING_MESSAGES = 20;

type Publisher = (message: string, priority: Priority) => void;

/**
 * Queues announcements and spaces them out, letting urgent messages jump ahead.
 * @param publisher Callback that updates the live region with a message and its priority.
 * @returns `enqueue` to submit messages and `stop` to cancel pending work and timers
 * and permanently stop this scheduler. Call `stop` when the announcer unmounts.
 */
export const createScheduler = (publisher: Publisher) => {
  const politeQueue: string[] = [];
  const assertiveQueue: string[] = [];
  const lastPublished: Partial<Record<Priority, string>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastPriority: Priority | undefined;
  let stopped = false;

  const _getQueue = (priority: Priority): string[] =>
    priority === "assertive" ? assertiveQueue : politeQueue;

  const _takeNextMessage = (): { message: string; priority: Priority } | undefined => {
    while (assertiveQueue.length || politeQueue.length) {
      const priority = assertiveQueue.length ? "assertive" : "polite";
      const queue = _getQueue(priority);
      const message = queue.shift()!;

      // Overflow can drop the message separating two identical announcements.
      // Skip any message that now matches the last publication for this priority.
      if (lastPublished[priority] === message) {
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
    if (stopped || timer !== undefined) return;
    _publish();
  };

  const enqueue = (message: string, priority: Priority) => {
    if (stopped || !message) return;

    const queue = _getQueue(priority);
    // Compare with the last pending message, or the last publication if this queue is empty.
    const previousMessage = queue.at(-1) ?? lastPublished[priority];
    if (previousMessage === message) return;

    queue.push(message);

    if (politeQueue.length + assertiveQueue.length > MAX_PENDING_MESSAGES) {
      const droppedPriority = politeQueue.length ? "polite" : "assertive";
      const droppedQueue = _getQueue(droppedPriority);
      droppedQueue.shift();

      // TODO more thought about logging - probably remove and come back to later
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

  const stop = () => {
    stopped = true;
    clearTimeout(timer);
    timer = undefined;
    politeQueue.length = 0;
    assertiveQueue.length = 0;
  };

  return { enqueue, stop };
};
