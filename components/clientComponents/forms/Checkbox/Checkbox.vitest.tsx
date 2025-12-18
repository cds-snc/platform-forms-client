/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach } from "vitest";
import { GenerateElement } from "@lib/formBuilder";
import { Formik } from "formik";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

type Choice = { en: string; fr: string };

const checkboxData = {
  id: 8,
  type: "checkbox",
  properties: {
    titleEn: "Gear (include all types of trawls",
    titleFr: "Type d'engin perdu",
    descriptionEn: "English Description",
    descriptionFr: "Description en Francais",
    validation: {
      required: false,
    },
    choices: [
      { en: "Trap / Pot", fr: "Casier / Cage" },
      { en: "Longline", fr: "Palangre" },
      { en: "Net", fr: "Filet" },
      { en: "Other:", fr: "Autre :" },
    ],
  },
} as const as FormElement;

describe.each([["en"], ["fr"]] as Array<[Language]>)("Checkbox component", (lang: Language) => {
  afterEach(() => cleanup());

  it("renders without errors", async () => {
    const user = userEvent.setup();
    render(
      <Formik onSubmit={() => {}} initialValues={{}}>
        <GenerateElement element={checkboxData as unknown as FormElement} language={lang} />
      </Formik>
    );

    const description =
      lang === "en" ? checkboxData.properties.descriptionEn : checkboxData.properties.descriptionFr;

    const choices = checkboxData.properties.choices as Choice[];
    choices.forEach((input) => {
      expect(screen.getByText(input[lang])).toBeInTheDocument();
    });

    screen.getAllByRole("checkbox").forEach((input) => {
      expect(input).toHaveClass("gc-input-checkbox__input");
      expect(input).not.toBeChecked();
    });

    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);

    // Check the boxes
    for (const input of screen.getAllByRole("checkbox")) {
      // eslint-disable-next-line no-await-in-loop
      await user.click(input as HTMLElement);
    }

    const resultsArray = choices.map((object) => object[lang]);

    screen.getAllByRole("checkbox").forEach((input, index) => {
      expect((input as HTMLInputElement).value).toEqual(resultsArray[index]);
    });
  });

  it("required elements display correctly", () => {
    checkboxData.properties.validation!.required = true;
    render(
      <Formik onSubmit={() => {}} initialValues={{}}>
        <GenerateElement element={checkboxData} language={lang} />
      </Formik>
    );

    expect(screen.queryByTestId("required")).toBeInTheDocument();
  });
});
