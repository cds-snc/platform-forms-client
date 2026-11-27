import type { Priority } from "./AnnounceLiveRegion";
import type { AnnounceOptions } from "./announce";

const DUPLICATE_WINDOW_MS = 1000;

// A host is a mounted set of live regions. The root host handles normal updates;
// a modal host keeps announcements inside the modal, since background content
// can become inaccessible while it's open. Only one host can receive an
// announcement at one time.
interface Host {
  scope: "root" | "modal";
  publish: (message: string, priority: Priority, lang?: string) => void;
  clear: () => void;
}

const hosts: Host[] = [];
let activeHost: Host | undefined;
let lastPublished: Partial<
  Record<Priority, { message: string; lang?: string; publishedAt: number }>
> = {};

const reportFailure = (operation: string) => {
  // Errors can contain announcement text, so report only the operation.
  // eslint-disable-next-line no-console
  console.error(`[gcforms/announce] Announcement ${operation} failed.`);
};

const clearHost = (host: Host): boolean => {
  try {
    host.clear();
    return true;
  } catch {
    reportFailure("host cleanup");
    return false;
  }
};

// Prefer the newest modal, otherwise the first root host
// When the destination changes, clear both hosts before enabling delivery
const selectHost = () => {
  const nextHost = hosts.findLast((host) => host.scope === "modal") ?? hosts[0];
  if (nextHost === activeHost) return;

  const previousHost = activeHost;
  activeHost = undefined;
  const previousCleared = !previousHost || clearHost(previousHost);
  const nextCleared = !nextHost || clearHost(nextHost);
  // Do not deliver into a host whose handoff failed.
  if (previousCleared && nextCleared) activeHost = nextHost;
};

// Manage selecting an announcer to become the delivery destination.
// On unmount, unregister it so delivery can return to another modal or the root.
export function registerHost(host: Host) {
  hosts.push(host);
  selectHost();
  let registered = true;

  return () => {
    // Cleanup may be called more than once, so remove this registration only once
    if (!registered) return;
    registered = false;
    hosts.splice(hosts.indexOf(host), 1);
    if (host !== activeHost) clearHost(host);
    selectHost();
    if (hosts.length === 0) lastPublished = {};
  };
}

export function publishAnnouncement(
  message: string,
  priority: Priority,
  options: AnnounceOptions = {}
) {
  if (!activeHost || !message || options.signal?.aborted) return;

  const previous = lastPublished[priority];
  if (
    !options.allowDuplicates &&
    previous?.message === message &&
    previous.lang === options.lang &&
    performance.now() - previous.publishedAt < DUPLICATE_WINDOW_MS
  ) {
    return;
  }

  try {
    activeHost.publish(message, priority, options.lang);
  } catch {
    reportFailure("publication");
    return;
  }
  lastPublished[priority] = { message, lang: options.lang, publishedAt: performance.now() };
}
