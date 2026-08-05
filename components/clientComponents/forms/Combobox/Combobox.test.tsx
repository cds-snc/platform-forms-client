/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { GenerateElement } from "@lib/formBuilder";
import { Combobox } from "./Combobox";
import { useField } from "formik";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

vi.mock("formik", async () => {
  const actual = await vi.importActual<typeof import("formik")>("formik");
  return {
    ...actual,
    useField: vi.fn(() => [
      { field: { value: "" } },
      { meta: { touched: null, error: null } },
      { setValue: vi.fn(), setError: vi.fn(), setTouched: vi.fn() },
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
    const shortDescription =
      lang === "en" ? comboboxData.properties.descriptionEn : comboboxData.properties.descriptionFr;
    // The component appends its own hint (keyboard/touch instructions) via the {id}-hint span.
    // The expected accessible description is the form's description + the component hint.
    const componentHint =
      lang === "en"
        ? "When results are available, use the directional arrows to navigate: up and down arrows to review, enter to select. Touch device users, explore by touch or with swipe gestures."
        : "Lorsque des résultats sont disponibles, utilisez les flèches directionnelles pour naviguer : les flèches en haut et en bas pour parcourir, puis la touche Entrée pour sélectionner. Pour les utilisateurs d'appareils tactiles, explorez par effleurement ou à l'aide de gestes de balayage.";
    const fullDescription = `${shortDescription} ${componentHint}`;

    const combobox = screen.queryByTestId("combobox");
    const comboboxInput = screen.queryByTestId("combobox-input");
    const comboboxListbox = screen.queryByTestId("combobox-listbox");

    expect(combobox).toBeInTheDocument();
    expect(comboboxInput).toBeInTheDocument();
    expect(comboboxListbox).toBeInTheDocument();
    expect(comboboxInput).toHaveAccessibleDescription(fullDescription);
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

describe("Combobox language switch", () => {
  afterEach(() => cleanup());

  it("syncs value from French to English when mounted with opposite language", async () => {
    const setValueMock = vi.fn();
    const setErrorMock = vi.fn();

    // Intercept useField that Comboox uses and provide with a default French choice
    vi.mocked(useField).mockReturnValueOnce(
      [
        {
          value: "Colombie-Britannique",
          name: "province",
          onBlur: undefined,
        },
        { touched: null, error: null },
        { setValue: setValueMock, setError: setErrorMock, setTouched: vi.fn() },
      ] as unknown as ReturnType<typeof useField>
    );

    const englishChoices = ["British Columbia", "Alberta", "Ontario"];
    const bilingualChoices = [
      { en: "British Columbia", fr: "Colombie-Britannique" },
      { en: "Alberta", fr: "Alberta" },
      { en: "New Brunswick", fr: "Nouveau-Brunswick" },
    ];

    // Combobox is mounted with English value using above mock but overriden with above English choices.
    // Note: same pattern for below tests
    render(
      <Combobox
        id="test-combobox"
        name="province"
        lang="en"
        choices={englishChoices}
        allChoices={bilingualChoices}
      />
    );

    // Wait for useLayoutEffect to run and sync the value
    await waitFor(() => {
      expect(setValueMock).toHaveBeenCalledWith("British Columbia");
    });
  });

  it("syncs value from English to French when mounted with opposite language", async () => {
    const setValueMock = vi.fn();
    const setErrorMock = vi.fn();

    vi.mocked(useField).mockReturnValueOnce(
      [
        {
          value: "British Columbia",
          name: "province",
          onBlur: undefined,
        },
        { touched: null, error: null },
        { setValue: setValueMock, setError: setErrorMock, setTouched: vi.fn() },
      ] as unknown as ReturnType<typeof useField>
    );

    const frenchChoices = ["Colombie-Britannique", "Alberta", "Ontario"];
    const bilingualChoices = [
      { en: "British Columbia", fr: "Colombie-Britannique" },
      { en: "Alberta", fr: "Alberta" },
      { en: "New Brunswick", fr: "Nouveau-Brunswick" },
    ];

    render(
      <Combobox
        id="test-combobox"
        name="province"
        lang="fr"
        choices={frenchChoices}
        allChoices={bilingualChoices}
      />
    );

    await waitFor(() => {
      expect(setValueMock).toHaveBeenCalledWith("Colombie-Britannique");
    });
  });

  it("does not sync value when it already exists in current language choices", async () => {
    const setValueMock = vi.fn();
    const setErrorMock = vi.fn();

    vi.mocked(useField).mockReturnValueOnce(
      [
        {
          value: "British Columbia",
          name: "province",
          onBlur: undefined,
        },
        { touched: null, error: null },
        { setValue: setValueMock, setError: setErrorMock, setTouched: vi.fn() },
      ] as unknown as ReturnType<typeof useField>
    );

    const englishChoices = ["British Columbia", "Alberta", "Ontario"];
    const bilingualChoices = [
      { en: "British Columbia", fr: "Colombie-Britannique" },
      { en: "Alberta", fr: "Alberta" },
      { en: "New Brunswick", fr: "Nouveau-Brunswick" },
    ];

    render(
      <Combobox
        id="test-combobox"
        name="province"
        lang="en"
        choices={englishChoices}
        allChoices={bilingualChoices}
      />
    );

    expect(setValueMock).not.toHaveBeenCalled();
  });

  it("does not sync value when allChoices is not provided", async () => {
    const setValueMock = vi.fn();
    const setErrorMock = vi.fn();

    vi.mocked(useField).mockReturnValueOnce(
      [
        {
          value: "Some Value",
          name: "field",
          onBlur: undefined,
        },
        { touched: null, error: null },
        { setValue: setValueMock, setError: setErrorMock, setTouched: vi.fn() },
      ] as unknown as ReturnType<typeof useField>
    );

    const choices = ["Some Value", "Other Value"];

    render(
      <Combobox
        id="test-combobox"
        name="field"
        lang="en"
        choices={choices}
      />
    );

    // setValue should NOT be called without allChoices
    expect(setValueMock).not.toHaveBeenCalled();
  });
});

