import { useEffect, useRef } from "react";
import { logMessage } from "@root/lib/logger";

interface DependencyChange {
  before: unknown;
  after: unknown;
}

interface ChangedDeps {
  [key: string | number]: DependencyChange;
}

export function useEffectDebugger(
  effectFunction: () => void | (() => void),
  dependencies: unknown[],
  dependencyNames: (string | number)[] = []
): void {
  const previousDeps = useRef<unknown[]>([]);

  useEffect(() => {
    const changedDeps: ChangedDeps = dependencies.reduce<ChangedDeps>(
      (accum, dependency, index) => {
        if (previousDeps.current[index] !== dependency) {
          const name = dependencyNames[index] || index;
          accum[name] = {
            before: previousDeps.current[index],
            after: dependency,
          };
        }
        return accum;
      },
      {}
    );

    if (Object.keys(changedDeps).length > 0) {
      logMessage.debug(`[useEffect-Debugger] Triggered by: ${Object.keys(changedDeps)}`);
      logMessage.debug(changedDeps);
    } else {
      logMessage.debug("[useEffect-Debugger] Triggered on initial mount");
    }

    previousDeps.current = dependencies;
    return effectFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
