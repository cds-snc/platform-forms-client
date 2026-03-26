/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Options } from "../Options";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

const CLEAR_OPTIONS_TEXT = "Clear all options";
const CLEAR_OPTIONS_CONFIRM_TEXT = "Remove all options";
const CLEAR_OPTIONS_DIALOG_TITLE = "Remove all of the selection options?";
const CLEAR_OPTIONS_SUCCESS_MESSAGE = "Options were successfully removed.";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("@clientComponents/forms/ChoiceOptionsCsvUpload", () => ({
  ChoiceOptionsCsvUpload: ({
    onImport,
  }: {
    onImport: (choices: { en: string; fr: string }[]) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-choice-options-csv-upload"
      onClick={() =>
        onImport([
          { en: "Imported Option 1", fr: "Option importee 1" },
          { en: "Imported Option 2", fr: "Option importee 2" },
        ])
      }
    >
      Mock import choices
    </button>
  ),
}));

vi.mock("@formBuilder/components/shared/Toast", () => ({
  toast: {
    success: toastSuccess,
  },
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "true");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

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
    vi.clearAllMocks();
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

  it("disables adding more options once the maximum is reached", async () => {
    const maxChoices = Array.from({ length: MAX_CHOICE_AMOUNT }, (_, index) => ({
      en: `Option ${index + 1}`,
      fr: `Option ${index + 1} FR`,
    }));

    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "radio",
          properties: {
            titleEn: "Test Question",
            titleFr: "Question de test",
            choices: maxChoices,
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    expect(screen.getByRole("button", { name: "Add option" })).toBeDisabled();
    const limitWarning = screen.getByText(`You can only add up to ${MAX_CHOICE_AMOUNT} options.`);

    expect(limitWarning).toBeInTheDocument();
    expect(limitWarning.closest("div")).toHaveAttribute("aria-live", "polite");
  });

  it("clears all options after confirmation", async () => {
    const user = userEvent.setup();

    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "radio",
          properties: {
            titleEn: "Test Question",
            titleFr: "Question de test",
            choices: [
              { en: "First Option", fr: "Première option" },
              { en: "Second Option", fr: "Deuxième option" },
            ],
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    await user.click(screen.getByRole("button", { name: CLEAR_OPTIONS_TEXT }));

    expect(screen.getByText(CLEAR_OPTIONS_DIALOG_TITLE)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: CLEAR_OPTIONS_CONFIRM_TEXT }));

    await waitFor(() => {
      expect(screen.queryByDisplayValue("First Option")).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue("Second Option")).not.toBeInTheDocument();
    });

    expect(toastSuccess).toHaveBeenCalledWith(CLEAR_OPTIONS_SUCCESS_MESSAGE);
    expect(screen.getByRole("button", { name: "Add option" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: CLEAR_OPTIONS_TEXT })).not.toBeInTheDocument();
  });

  it("can reopen the clear options dialog after cancelling", async () => {
    const user = userEvent.setup();

    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "radio",
          properties: {
            titleEn: "Test Question",
            titleFr: "Question de test",
            choices: [{ en: "First Option", fr: "Première option" }],
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    await user.click(screen.getByRole("button", { name: CLEAR_OPTIONS_TEXT }));
    expect(screen.getByText(CLEAR_OPTIONS_DIALOG_TITLE)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText(CLEAR_OPTIONS_DIALOG_TITLE)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: CLEAR_OPTIONS_TEXT }));

    expect(screen.getByText(CLEAR_OPTIONS_DIALOG_TITLE)).toBeInTheDocument();
  });

  it("shows a success toast after importing options from CSV", async () => {
    const user = userEvent.setup();

    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "radio",
          properties: {
            titleEn: "Test Question",
            titleFr: "Question de test",
            choices: [],
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    await user.click(screen.getByTestId("mock-choice-options-csv-upload"));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("2 options were added from the CSV file.");
    });
  });

  it("allows searchable list options to be imported from CSV", async () => {
    const user = userEvent.setup();

    const testStore = {
      ...store,
      elements: [
        {
          id: 1,
          type: "combobox",
          properties: {
            titleEn: "Searchable list",
            titleFr: "Liste interrogeable",
            choices: [],
            validation: { required: false },
          },
        },
      ],
    };

    const item = { index: 0, ...testStore.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];

    render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={testStore}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    await user.click(screen.getByTestId("mock-choice-options-csv-upload"));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("2 options were added from the CSV file.");
    });
  });
});
