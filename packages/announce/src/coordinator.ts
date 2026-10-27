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
    window.removeEventListener("gc-announce-polite", handlePolite);
    window.removeEventListener("gc-announce-assertive", handleAssertive);
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

  const handlePolite = (event: Event) => {
    try {
      scheduler.enqueue((event as CustomEvent<{ message: string }>).detail.message, "polite");
    } catch {
      handleFailure("request processing");
    }
  };

  const handleAssertive = (event: Event) => {
    try {
      scheduler.enqueue((event as CustomEvent<{ message: string }>).detail.message, "assertive");
    } catch {
      handleFailure("request processing");
    }
  };

  try {
    window.addEventListener("gc-announce-polite", handlePolite);
    window.addEventListener("gc-announce-assertive", handleAssertive);
  } catch {
    handleFailure("listener setup");
  }

  const register = (host: Host) => {
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
        stopDelivery();
        coordinator = undefined;
      }
    };
  };

  return { register };
}

// Created only by mounted client hosts. The last host's cleanup releases all shared state.
let coordinator: ReturnType<typeof createCoordinator> | undefined;

export function registerHost(host: Host) {
  if (coordinator === null || coordinator === undefined) {
    coordinator = createCoordinator();
  }
  return coordinator.register(host);
}
