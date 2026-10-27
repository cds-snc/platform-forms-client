import type { Priority } from "./Announce";
import { createScheduler } from "./scheduler";

const HOST_ACTIVATION_DELAY_MS = 100;

interface Host {
  scope: "root" | "modal";
  publish: (message: string, priority: Priority) => void;
  clear: () => void;
}

function createCoordinator() {
  const hosts: Host[] = [];
  let activeHost: Host | undefined;
  let activationTimer: ReturnType<typeof setTimeout> | undefined;
  let failed = false;
  let hasRegisteredHost = false;

  const scheduler = createScheduler(
    (message, priority) => {
      if (!activeHost) {
        throw new Error("[gcforms/announce] Cannot publish without an active host.");
      }
      activeHost.publish(message, priority);
    },
    () => handleFailure("publication")
  );
  scheduler.pause();

  const stopDelivery = () => {
    clearTimeout(activationTimer);
    activationTimer = undefined;
    scheduler.stop();
  };

  const handleFailure = (operation: string) => {
    if (failed) return;
    failed = true;
    stopDelivery();
    // Error objects can contain announcement text, so report only the failed operation.
    // eslint-disable-next-line no-console
    console.error(`[gcforms/announce] Delivery stopped after a ${operation} error.`);
  };

  const selectHost = () => {
    if (failed) return;

    try {
      const nextHost = hosts.findLast((host) => host.scope === "modal") ?? hosts[0];
      if (nextHost === activeHost) return;

      scheduler.pause();
      clearTimeout(activationTimer);
      activeHost?.clear();
      nextHost?.clear();
      activeHost = nextHost;

      // Allow a newly exposed host to settle before updating it. This is not an AT acknowledgement.
      activationTimer = nextHost
        ? setTimeout(() => {
            activationTimer = undefined;
            scheduler.resume();
          }, HOST_ACTIVATION_DELAY_MS)
        : undefined;
    } catch {
      handleFailure("host activation");
    }
  };

  const enqueue = (message: string, priority: Priority) => {
    if (hasRegisteredHost && hosts.length === 0) return;
    try {
      scheduler.enqueue(message, priority);
    } catch {
      handleFailure("request processing");
    }
  };

  const register = (host: Host) => {
    hasRegisteredHost = true;
    hosts.push(host);
    selectHost();
    let registered = true;

    return () => {
      if (!registered) return;
      registered = false;
      hosts.splice(hosts.indexOf(host), 1);

      try {
        host.clear();
      } catch {
        handleFailure("host cleanup");
      }

      selectHost();

      if (hosts.length === 0) {
        if (failed) {
          stopDelivery();
          coordinator = undefined;
          return;
        }
        // React Strict Mode can re-register hosts in the same effect flush.
        // Publication is already paused; discard pending work only after that flush.
        queueMicrotask(() => {
          if (hosts.length === 0 && coordinator === instance) {
            stopDelivery();
            coordinator = undefined;
          }
        });
      }
    };
  };

  const instance = { register, enqueue };
  return instance;
}

let coordinator: ReturnType<typeof createCoordinator> | undefined;
let hasRegisteredHost = false;

export function registerHost(host: Host) {
  hasRegisteredHost = true;
  if (coordinator === null || coordinator === undefined) {
    coordinator = createCoordinator();
  }
  return coordinator.register(host);
}

export function enqueueAnnouncement(message: string, priority: Priority) {
  if (!coordinator) {
    if (hasRegisteredHost) return;
    coordinator = createCoordinator();
  }
  coordinator.enqueue(message, priority);
}
