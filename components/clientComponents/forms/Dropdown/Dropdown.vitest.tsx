/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
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
    ]),
  };
});

const dropdownData = {
  id: 16,
  type: "dropdown",
  properties: {
    titleEn: "Province or territory",
    titleFr: "Province ou territoire",
    descriptionEn: "English description",
    descriptionFr: "Description en Francais",
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

describe.each([["en"], ["fr"]] as Array<[Language]>)("Dropdown component", (lang: Language) => {
  afterEach(() => cleanup());

  it("renders without errors", async () => {
    const user = userEvent.setup();
    render(<GenerateElement element={dropdownData} language={lang} />);

    const title = lang === "en" ? dropdownData.properties.titleEn : dropdownData.properties.titleFr;
    const description =
      lang === "en" ? dropdownData.properties.descriptionEn : dropdownData.properties.descriptionFr;

    const dropdown = screen.queryByTestId("dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveAccessibleDescription(description);
    expect(dropdown).toHaveClass("gc-dropdown");
    expect(
      screen.getByRole("combobox", {
        name: title,
      })
    ).toBeInTheDocument();

    // Change value
    const choiceObj = dropdownData.properties.choices?.[2] ?? { en: "", fr: "" };
    const choiceValue = choiceObj[lang as "en" | "fr"];
    await user.selectOptions(screen.getByTestId("dropdown"), [choiceValue]);
    expect(screen.getByTestId("dropdown")).toHaveDisplayValue(choiceValue);
  });

  it("required elements display properly", () => {
    dropdownData.properties.validation!.required = true;
    render(<GenerateElement element={dropdownData} language={lang} />);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    dropdownData.properties.validation!.required = false;
  });
});
