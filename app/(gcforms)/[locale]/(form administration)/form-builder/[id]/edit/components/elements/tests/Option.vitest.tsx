/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Option } from "../Option";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));
describe("Option", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without errors", () => {
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Option parentIndex={0} index={0} id={1} initialValue="my test option" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });

  it("updates displayed value when initialValue prop changes", async () => {
    const { rerender, container } = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Option parentIndex={0} index={0} id={1} initialValue="Original Value" />
      </Providers>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    });

    // Verify initial value is displayed
    const input = screen.getByRole("textbox", { name: /option 1/i }) as HTMLInputElement;
    expect(input.value).toBe("Original Value");

    // Simulate what happens when an option is deleted and React reuses the component
    // The component receives a new initialValue prop
    rerender(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Option parentIndex={0} index={0} id={1} initialValue="Updated Value" />
      </Providers>
    );

    // Regression test: verify the displayed value updates to match the new prop
    // This prevents the bug where useState(initialValue) doesn't update on prop changes
    await waitFor(() => {
      expect(input.value).toBe("Updated Value");
    });
  });
});
