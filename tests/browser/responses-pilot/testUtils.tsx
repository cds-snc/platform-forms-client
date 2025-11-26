import { ReactNode } from "react";
import { render as vitestRender, cleanup } from "vitest-browser-react";
import { BrowserResponsesAppProvider } from "@responses-pilot/context/BrowserResponsesAppProvider";
import { ResponsesProvider } from "@responses-pilot/context/ResponsesContext";
import { ContentWrapper } from "@responses-pilot/ContentWrapper";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { ApiClientSetter } from "./AplClientSetter";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { ToastContainer } from "@formBuilder/components/shared/Toast";

// Import to trigger i18next initialization
import "@root/i18n/client";
// Import i18next instance
import i18next from "i18next";

interface RenderWithProvidersOptions {
  locale?: string;
  formId?: string;
  mockApiClient?: GCFormsApiClient;
  // Allow passing arbitrary provider overrides for tests (e.g. router)
  overrides?: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Wraps component with standard test providers and layout
 */
export function TestWrapper({
  locale = "en",
  formId = "test-form",
  mockApiClient,
  overrides,
  children,
}: RenderWithProvidersOptions) {
  return (
    <BrowserResponsesAppProvider overrides={overrides}>
      <ResponsesProvider locale={locale} formId={formId}>
        {mockApiClient && <ApiClientSetter mockClient={mockApiClient} />}
        <h1 className="mb-4">Responses</h1>
        <PilotBadge className="mb-8" />
        <ContentWrapper>{children}</ContentWrapper>
        <ToastContainer />
        <ToastContainer containerId="wide" width="600px" />
        <ToastContainer containerId="error-persistent" autoClose={false} />
      </ResponsesProvider>
    </BrowserResponsesAppProvider>
  );
}

/**
 * Custom render function that wraps component with TestWrapper
 *
 * Note: Use `page` from 'vitest/browser' for locators with proper types:
 * import { page } from 'vitest/browser'
 * const element = page.getByTestId('my-id')
 */
export async function render(
  children: ReactNode,
  options?: Omit<RenderWithProvidersOptions, "children">
) {
  // Wait for i18next to load translations
  await waitForI18next(options?.locale || "en");

  // Render the component
  await vitestRender(<TestWrapper {...options}>{children}</TestWrapper>);

  // Wait a bit more for React to re-render with translations
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Wait for i18next to finish loading translations
 */
async function waitForI18next(locale: string) {
  // Ensure i18next is initialized
  if (!i18next.isInitialized) {
    await new Promise((resolve) => {
      i18next.on("initialized", resolve);
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
  }

  // Change language to the test locale
  if (i18next.language !== locale) {
    await i18next.changeLanguage(locale);
  }

  // Load the required namespaces
  const namespaces = ["response-api", "common"];
  await i18next.loadNamespaces(namespaces);

  // Translations are now loaded and ready
}

// Re-export cleanup for manual use in tests
export { cleanup };
