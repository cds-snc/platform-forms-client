import { useEffect } from "react";
import { logMessage } from "@root/lib/logger";

declare global {
  // Dev helper functions to toggle simulated API errors from the browser console
  interface Window {
    gcformsSimulateError?: (value?: string | null) => void;
    gcformsSimulateClear?: () => void;
  }
}

/**
 * Development hook that exposes helpers on window for simulating API errors.
 *
 * Usage in browser console:
 *   window.gcformsSimulateError('500')       -> simulate HTTP 500
 *   window.gcformsSimulateError('429')       -> simulate HTTP 429
 *   window.gcformsSimulateError('network')   -> simulate network error
 *   window.gcformsSimulateError('abort')     -> simulate cancellation
 *   window.gcformsSimulateClear()            -> clear simulation
 */
export const useApiDebug = () => {
  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;

    logMessage.info(
      "useApiDebug has exposed helpers on the window for simulating API errors during development"
    );

    const setSim = (value?: string | null) => {
      try {
        if (value == null) {
          sessionStorage.removeItem("gcforms_simulate_error");
          // eslint-disable-next-line no-console
          console.info("gcforms_simulate_error cleared");
        } else {
          sessionStorage.setItem("gcforms_simulate_error", String(value));
          // eslint-disable-next-line no-console
          console.info("gcforms_simulate_error set to", value);
        }
      } catch (e) {
        // ignore
      }
    };

    const clearSim = () => setSim(null);

    window.gcformsSimulateError = setSim;
    window.gcformsSimulateClear = clearSim;

    return () => {
      try {
        delete window.gcformsSimulateError;
        delete window.gcformsSimulateClear;
      } catch (e) {
        // ignore
      }
    };
  }, []);
};
