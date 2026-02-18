/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Options } from "../Options";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));

describe("Options", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without errors", () => {
    const item = { index: 0, ...store.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });

  it("renders null when no choices exist", () => {
    const item = {
      id: 1,
      index: 0,
      type: store.elements[0]?.type || ("textField" as unknown),
      properties: { ...store.elements[0]?.properties, choices: [] },
    } as unknown as Parameters<typeof Options>[0]["item"];
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });

  it("displays correct option values after deleting a middle option", async () => {
    const user = userEvent.setup();

    // Create a test store with multiple choices
    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "radio",
          properties: {
            titleEn: "Test Question",
            titleFr: "Test Question FR",
            choices: [
              { en: "First Option", fr: "Première option" },
              { en: "Second Option", fr: "Deuxième option" },
              { en: "Third Option", fr: "Troisième option" },
              { en: "Fourth Option", fr: "Quatrième option" },
            ],
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    const { container } = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    // Wait for component to render
    await waitFor(() => {
      expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    });

    // Verify all options are initially rendered
    expect(screen.getByDisplayValue("First Option")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Second Option")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Third Option")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fourth Option")).toBeInTheDocument();

    // Delete the second option (middle of the list)
    const deleteButtons = screen.getAllByRole("button", { name: /remove option/i });
    await user.click(deleteButtons[1]); // Click delete on "Second Option"

    // Regression test: verify the correct options remain displayed
    // This prevents the bug where deleting a middle item would visually remove the last item
    await waitFor(() => {
      expect(screen.getByDisplayValue("First Option")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Second Option")).not.toBeInTheDocument();
      expect(screen.getByDisplayValue("Third Option")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Fourth Option")).toBeInTheDocument();
    });
  });
});
