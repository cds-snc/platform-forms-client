/**
 * Barrel export for ResponsesApp context
 * In Vitest browser test environments, exports the Browser version
 * In production, exports the real ResponsesAppProvider with Next.js hooks
 */

// Check if running in Vitest browser mode
const isBrowserTest = typeof process !== "undefined" && process.env.VITEST_BROWSER === "true";

// Import from both
import {
  useResponsesApp as useResponsesAppProd,
  ResponsesAppProvider as ProdProvider,
} from "./ResponsesAppProvider";
import {
  useResponsesApp as useResponsesAppBrowser,
  BrowserResponsesAppProvider,
} from "./BrowserResponsesAppProvider";

// Export the appropriate version based on environment
export const useResponsesApp = isBrowserTest ? useResponsesAppBrowser : useResponsesAppProd;
export const ResponsesAppProvider = isBrowserTest ? BrowserResponsesAppProvider : ProdProvider;
