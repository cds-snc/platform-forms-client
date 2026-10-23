import type { Priority } from "./Announce";

const PUBLICATION_INTERVAL_MS = 1000;
const MAX_PENDING_MESSAGES = 20;

type Publisher = (message: string, priority: Priority) => void;

export function createScheduler(publisher: Publisher) {
  const queues: Record<Priority, string[]> = { polite: [], assertive: [] };
  const lastPublished: Partial<Record<Priority, string>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastPriority: Priority | undefined;
  let disposed = false;

  function publish() {
    while (queues.assertive.length || queues.polite.length) {
      const priority = queues.assertive.length ? "assertive" : "polite";
      const message = queues[priority].shift()!;

      // Overflow may remove an intervening message and expose a duplicate.
      if (lastPublished[priority] === message) continue;

      publisher(message, priority);
      lastPublished[priority] = message;
      lastPriority = priority;
      timer = setTimeout(() => {
        timer = undefined;
        schedule();
      }, PUBLICATION_INTERVAL_MS);
      return;
    }
  }

  function schedule() {
    if (disposed || timer !== undefined) return;
    publish();
  }

  function enqueue(message: string, priority: Priority) {
    if (disposed || !message) return;

    const queue = queues[priority];
    if ((queue.at(-1) ?? lastPublished[priority]) === message) return;

    queue.push(message);

    if (queues.polite.length + queues.assertive.length > MAX_PENDING_MESSAGES) {
      const droppedPriority = queues.polite.length ? "polite" : "assertive";
      queues[droppedPriority].shift();
      // eslint-disable-next-line no-console
      console.warn(
        `[gcforms/announce] Pending message limit reached; discarded the oldest ${droppedPriority} message.`
      );
    }

    if (priority === "assertive" && lastPriority === "polite" && timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    schedule();
  }

  function dispose() {
    disposed = true;
    clearTimeout(timer);
    timer = undefined;
    queues.polite.length = 0;
    queues.assertive.length = 0;
  }

  return { enqueue, dispose };
}
