import { ReactNode } from "react";
import { render as vitestRender, cleanup } from "vitest-browser-react";
import { BrowserFormBuilderProvider } from "./context/BrowserFormBuilderProvider";

// Import to trigger i18next initialization
import "@root/i18n/client";
// Import i18next instance
import i18next from "i18next";

interface RenderWithProvidersOptions {
  locale?: string;
  // Allow passing arbitrary provider overrides for tests
  overrides?: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Wraps component with standard test providers
 */
export function TestWrapper({ overrides, children }: RenderWithProvidersOptions) {
  return <BrowserFormBuilderProvider overrides={overrides}>{children}</BrowserFormBuilderProvider>;
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
  await i18next.loadNamespaces("form-builder");

  const result = vitestRender(
    <TestWrapper {...options} locale={options?.locale}>
      {children}
    </TestWrapper>
  );

  return result;
}

/**
 * Re-export cleanup from vitest-browser-react for convenience
 */
export { cleanup };
