import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

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

const formConfig = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1],
  elements: [checkboxData],
};

describe.each([["en"], ["fr"]])("Checkbox component", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
    render(
      <Form formConfig={formConfig} t={(key) => key} language={lang}>
        <GenerateElement element={checkboxData} language={lang} />
      </Form>
    );
    const description =
      lang === "en" ? checkboxData.properties.descriptionEn : checkboxData.properties.descriptionFr;
    checkboxData.properties.choices.forEach((input) => {
      expect(screen.getByText(input[lang])).toBeInTheDocument();
    });
    screen.getAllByRole("checkbox").forEach((input) => {
      expect(input).toHaveClass("gc-input-checkbox__input").not.toBeChecked();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveAccessibleDescription(description);

    // Check the boxes
    screen.getAllByRole("checkbox").forEach((input) => {
      fireEvent.click(input);
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
      <Form formConfig={formConfig} t={(key) => key} language={lang}>
        <GenerateElement element={checkboxData} language={lang} />
      </Form>
    );

    expect(screen.queryByTestId("required")).toBeInTheDocument();
  });
});
