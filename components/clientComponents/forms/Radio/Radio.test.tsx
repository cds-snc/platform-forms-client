/**
 * @vitest-environment jsdom
 */
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
          <GenerateElement element={radioButtonData} language={lang} isTestMode={true} />
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
      expect(screen.getByRole("group")).toHaveAccessibleName(title);
      screen.getAllByRole("radio").forEach((input) => {
        expect(input).toHaveAttribute("aria-required", "true");
        expect(input).not.toHaveAttribute("required");
      });
      // Check linked description on the first focusable choice
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAccessibleDescription(description);
      radios.slice(1).forEach((radio) => {
        expect(radio).not.toHaveAccessibleDescription(description);
      });
    });
    test("not required displays properly", () => {
      // mutate for not required test
      radioButtonData.properties.validation!.required = false as boolean;
      render(
        <Formik onSubmit={() => {}} initialValues={{}}>
          <GenerateElement element={radioButtonData} language={lang} isTestMode={true} />
        </Formik>
      );
      expect(screen.queryByTestId("required")).not.toBeInTheDocument();
      screen.getAllByRole("radio").forEach((input) => {
        expect(input).not.toHaveAttribute("aria-required");
        expect(input).not.toHaveAttribute("required");
      });
      // restore for other iterations
      radioButtonData.properties.validation!.required = true as boolean;
    });

    test("associates the group error with the first radio only", () => {
      const errorMessage = "Choose an option to continue.";

      render(
        <Formik
          onSubmit={() => {}}
          initialValues={{}}
          initialErrors={{ "1": errorMessage }}
          initialTouched={{ "1": true }}
        >
          <GenerateElement element={radioButtonData} language={lang} isTestMode={true} />
        </Formik>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toHaveAttribute("aria-describedby", "errorMessage-1 desc-1");
      radios.slice(1).forEach((radio) => {
        expect(radio).not.toHaveAttribute("aria-describedby");
      });
      expect(screen.getByTestId("errorMessage")).toHaveAttribute("id", "errorMessage-1");
    });
  }
);
