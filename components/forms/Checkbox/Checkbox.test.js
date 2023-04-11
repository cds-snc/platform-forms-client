import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenerateElement } from "../../../lib/formBuilder";
import { Formik } from "formik";

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
      {
        en: "Trap / Pot",
        fr: "Casier / Cage",
      },
      {
        en: "Longline",
        fr: "Palangre",
      },
      {
        en: "Net",
        fr: "Filet",
      },
      {
        en: "Other:",
        fr: "Autre :",
      },
    ],
  },
};

describe.each([["en"], ["fr"]])("Checkbox component", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
    userEvent.setup();
    render(
      <Formik onSubmit={() => {}}>
        <GenerateElement element={checkboxData} language={lang} t={(key) => key} />
      </Formik>
    );
    const description =
      lang === "en" ? checkboxData.properties.descriptionEn : checkboxData.properties.descriptionFr;
    checkboxData.properties.choices.forEach((input) => {
      expect(screen.getByText(input[lang])).toBeInTheDocument();
    });
    screen.getAllByRole("checkbox").forEach((input) => {
      expect(input).toHaveClass("gc-input-checkbox__input");
      expect(input).not.toBeChecked();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);

    // Check the boxes
    screen.getAllByRole("checkbox").forEach(async (input) => {
      await userEvent.click(input);
    });

    const resultsArray = checkboxData.properties.choices.map((object) => {
      return object[lang];
    });

    screen.getAllByRole("checkbox").forEach((input, index) => {
      expect(input.value).toEqual(resultsArray[index]);
    });
  });
  test("required elements display correctly", () => {
    checkboxData.properties.validation.required = true;
    render(
      <Formik onSubmit={() => {}}>
        <GenerateElement element={checkboxData} language={lang} t={(key) => key} />
      </Formik>
    );

    expect(screen.queryByTestId("required")).toBeInTheDocument();
  });
});
