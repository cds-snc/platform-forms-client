import { useEffect } from "react";
import { logMessage } from "@root/lib/logger";

declare global {
  // Dev helper functions to toggle simulated API errors from the browser console
  interface Window {
    gcformsSimulateError?: (value?: string | null) => void;
    gcformsSimulateErrorAfterTimeout?: (
      errorType: string,
      errorAfter?: number,
      clearAfter?: number
    ) => void;
  }
}

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

    const simErrorAfter = (errorType: string = "500", errorAfter = 5000, clearAfter = 10000) => {
      setTimeout(() => {
        setSim(errorType);
        if (clearAfter) {
          setTimeout(() => {
            setSim(null);
          }, clearAfter);
        }
      }, errorAfter);
    };

    window.gcformsSimulateError = setSim;
    window.gcformsSimulateErrorAfterTimeout = simErrorAfter;

    return () => {
      try {
        delete window.gcformsSimulateError;
        delete window.gcformsSimulateErrorAfterTimeout;
      } catch (e) {
        // ignore
      }
    };
  }, []);
};
