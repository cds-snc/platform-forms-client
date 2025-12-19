/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { GenerateElement } from "@lib/formBuilder";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

vi.mock("formik", async () => {
  const actual = await vi.importActual<typeof import("formik")>("formik");
  return {
    ...actual,
    useField: vi.fn(() => [
      { field: { value: "" } },
      { meta: { touched: null, error: null } },
      { setValue: vi.fn() },
    ]),
  };
});

const comboboxData = {
  id: 16,
  type: "combobox",
  properties: {
    titleEn: "Province or territory",
    titleFr: "Province ou territoire",
    descriptionEn: "Start typing to narrow down the list",
    descriptionFr: "Commencez à taper pour réduire la liste",
    choices: [
      { en: "", fr: "" },
      { en: "Alberta", fr: "Alberta" },
      { en: "British Columbia", fr: "Colombie-Britannique" },
      { en: "Manitoba", fr: "Manitoba" },
      { en: "New Brunswick", fr: "Nouveau-Brunswick" },
      { en: "Newfoundland and Labrador", fr: "Terre-Neuve-et-Labrador" },
      { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" },
      { en: "Nova Scotia", fr: "Nouvelle-Écosse" },
      { en: "Nunavut", fr: "Nunavut" },
      { en: "Ontario", fr: "Ontario" },
      { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
      { en: "Quebec", fr: "Québec" },
      { en: "Saskatchewan", fr: "Saskatchewan" },
      { en: "Yukon", fr: "Yukon" },
    ],
    validation: { required: false },
  },
} as const as FormElement;

describe.each([["en"], ["fr"]] as Array<[Language]>)("Combobox component", (lang: Language) => {
  afterEach(() => cleanup());

  it("renders without errors", async () => {
    render(<GenerateElement element={comboboxData} language={lang} />);

    const title = lang === "en" ? comboboxData.properties.titleEn : comboboxData.properties.titleFr;
    const description =
      lang === "en" ? comboboxData.properties.descriptionEn : comboboxData.properties.descriptionFr;

    const combobox = screen.queryByTestId("combobox");
    const comboboxInput = screen.queryByTestId("combobox-input");
    const comboboxListbox = screen.queryByTestId("combobox-listbox");

    expect(combobox).toBeInTheDocument();
    expect(comboboxInput).toBeInTheDocument();
    expect(comboboxListbox).toBeInTheDocument();
    expect(comboboxInput).toHaveAccessibleDescription(description);
    expect(combobox).toHaveClass("gc-combobox");

    expect(
      screen.getByRole("combobox", {
        name: title,
      })
    ).toBeInTheDocument();

    // open the list and check options (wait for async render)
    await userEvent.click(comboboxInput!);
    await userEvent.type(comboboxInput!, "N");
    await waitFor(() => expect(comboboxListbox).toBeVisible());
    const options = await within(comboboxListbox!).findAllByRole("option");
      // Ensure at least two options are rendered and the first has non-empty text.
      expect(options.length).toBeGreaterThanOrEqual(2);
    const firstOptionText = options[0].textContent?.trim() || "";
    expect(firstOptionText.length).toBeGreaterThan(0);
  });
});
