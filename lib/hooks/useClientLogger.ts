"use client";

import { clientLogger } from "@lib/client/clientLogger";
import type { LogContext } from "@lib/clientLogging/types";

/**
 * Returns stable references to the client logger methods.
 * The singleton handles buffering, batching, and flushing automatically.
 * Optionally accepts a default context that is merged into every log entry.
 */
export const useClientLogger = (defaultContext?: LogContext) => {
  const withDefaults = (context?: LogContext): LogContext | undefined => {
    if (!defaultContext && !context) return undefined;
    return { ...defaultContext, ...context };
  };

  return {
    debug: (message: string, context?: LogContext) =>
      clientLogger.debug(message, withDefaults(context)),
    info: (message: string, context?: LogContext) =>
      clientLogger.info(message, withDefaults(context)),
    warn: (message: string, context?: LogContext) =>
      clientLogger.warn(message, withDefaults(context)),
    error: (message: string, context?: LogContext) =>
      clientLogger.error(message, withDefaults(context)),
  };
};
