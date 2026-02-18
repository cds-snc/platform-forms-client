/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GenerateElement } from "@lib/formBuilder";
import { Formik } from "formik";
import { describe, test, afterEach } from "vitest";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

const radioButtonData = {
  id: 1,
  type: "radio",
  properties: {
    titleEn: "Spoken",
    titleFr: "Parlée",
    descriptionEn: "English Description",
    descriptionFr: "Description en Francais",
    validation: {
      required: false,
    },
    choices: [
      {
        en: "English",
        fr: "Anglais",
      },
      {
        en: "French",
        fr: "Français",
      },
    ],
  },
} as const as FormElement;

describe.each([["en"], ["fr"]] as Array<[Language]>)("Generate a form group", (lang: Language) => {
  afterEach(() => cleanup());
  test("renders properly", () => {
    render(
      <Formik onSubmit={() => {}} initialValues={{}}>
        <GenerateElement element={radioButtonData} language={lang} />
      </Formik>
    );
    const title = (lang === "en" ? radioButtonData.properties.titleEn : radioButtonData.properties.titleFr) as string;
    const description = (lang === "en" ? radioButtonData.properties.descriptionEn : radioButtonData.properties.descriptionFr) as string;

    // Title are rendered
    screen.getAllByText(title).forEach((input) => {
      expect(input).toBeInTheDocument();
    });
    // description properly renders
    screen.getAllByText(description).forEach((description) => {
      expect(description).toHaveClass("gc-description");
    });
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);
    // Children are rendered.
    screen.getAllByText(title).forEach((child) => {
      expect(screen.getByRole("group")).toContainElement(child);
    });
    // Every child has a description
    screen.getAllByText(description).forEach((description) => {
      expect(screen.getByRole("group")).toContainElement(description);
    });
  });
});
