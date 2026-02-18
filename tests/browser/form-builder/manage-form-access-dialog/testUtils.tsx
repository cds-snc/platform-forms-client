import { ReactNode } from "react";
import { render as vitestRender } from "vitest-browser-react";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { BrowserFormBuilderProvider } from "../context/BrowserFormBuilderProvider";

// Import to trigger i18next initialization
import "@root/i18n/client";
// Import i18next instance
import i18next from "i18next";

interface RenderWithProvidersOptions {
  locale?: string;
  overrides?: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Wraps component with standard test providers
 */
export function TestWrapper({ overrides, children }: RenderWithProvidersOptions) {
  return (
    <TemplateStoreProvider id="test-form-id">
      <BrowserFormBuilderProvider overrides={overrides}>{children}</BrowserFormBuilderProvider>
    </TemplateStoreProvider>
  );
}

/**
 * Custom render function that wraps component with TestWrapper
 */
export async function render(
  children: ReactNode,
  options?: Omit<RenderWithProvidersOptions, "children">
) {
  // Wait for i18next to load translations
  await i18next.loadNamespaces(["form-builder", "manage-form-access"]);

  const result = vitestRender(
    <TestWrapper {...options} locale={options?.locale}>
      {children}
    </TestWrapper>
  );

  return result;
}
