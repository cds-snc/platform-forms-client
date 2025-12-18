/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { GenerateElement } from "@lib/formBuilder";
import { Formik } from "formik";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

type Choice = { en: string; fr: string };

const radioButtonData = {
  id: 1,
  type: "radio",
  properties: {
    titleEn: "Spoken",
    titleFr: "Parlée",
    descriptionEn: "English Description",
    descriptionFr: "Description en Francais",
    validation: {
      required: true,
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

describe.each([["en"], ["fr"]] as Array<[Language]>)(
  "Generate a radio button",
  (lang: Language) => {
    afterEach(() => cleanup());
    test("renders without errors", () => {
      render(
        <Formik onSubmit={() => {}} initialValues={{}}>
          <GenerateElement element={radioButtonData} language={lang} />
        </Formik>
      );
      const title =
          lang === "en" ? radioButtonData.properties.titleEn : radioButtonData.properties.titleFr,
        description =
          lang === "en"
            ? radioButtonData.properties.descriptionEn
            : radioButtonData.properties.descriptionFr;
      // Label and description properly render
      screen.getAllByText(title).forEach((radio) => {
        expect(radio).toBeInTheDocument();
      });
      // Choices properly render
      const choices = radioButtonData.properties.choices as Choice[];
      choices.forEach((choice) => expect(screen.getByText(choice[lang])).toBeInTheDocument());
      // Field is required
      expect(screen.queryByTestId("required")).toBeInTheDocument();
      screen.getAllByRole("radio").forEach((input) => {
        expect(input).toBeRequired();
      });
      // Proper linked description to element
      expect(screen.getByRole("group")).toHaveAccessibleDescription(description);
    });
    test("not required displays properly", () => {
      // mutate for not required test
      radioButtonData.properties.validation!.required = false as boolean;
      render(
        <Formik onSubmit={() => {}} initialValues={{}}>
          <GenerateElement element={radioButtonData} language={lang} />
        </Formik>
      );
      expect(screen.queryByTestId("required")).not.toBeInTheDocument();
      screen.getAllByRole("radio").forEach((input) => {
        expect(input).not.toBeRequired();
      });
      // restore for other iterations
      radioButtonData.properties.validation!.required = true as boolean;
    });
  }
);
