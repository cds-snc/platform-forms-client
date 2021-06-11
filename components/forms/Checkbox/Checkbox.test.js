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

const formMetadata = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1],
  elements: [checkboxData],
};

describe("Checkbox component", () => {
  afterEach(cleanup);
  test("... in English", () => {
    render(
      <Form formMetadata={formMetadata} t={(key) => key} language="en">
        <GenerateElement element={checkboxData} language="en" />
      </Form>
    );
    checkboxData.properties.choices.forEach((input) => {
      expect(screen.getByText(input.en)).toBeInTheDocument();
    });
    screen.getAllByRole("checkbox").forEach((input) => {
      expect(input).toHaveClass("gc-input-checkbox__input").not.toBeChecked();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveDescription(checkboxData.properties.descriptionEn);

    // Check the boxes
    screen.getAllByRole("checkbox").forEach((input) => {
      fireEvent.click(input);
    });

    const resultsArray = checkboxData.properties.choices.map((object) => {
      return object.en;
    });

    screen.getAllByRole("checkbox").forEach((input, index) => {
      expect(input.value).toEqual(resultsArray[index]);
    });
  });
  test("... in French", () => {
    render(
      <Form formMetadata={formMetadata} t={(key) => key} language="fr">
        <GenerateElement element={checkboxData} language="fr" />
      </Form>
    );
    checkboxData.properties.choices.forEach((input) => {
      expect(screen.getByText(input.fr)).toBeInTheDocument();
    });
    screen.getAllByRole("checkbox").forEach((input) => {
      expect(input).toHaveClass("gc-input-checkbox__input").not.toBeChecked();
    });
    // Proper linked description to element
    expect(screen.getByRole("group")).toHaveDescription(checkboxData.properties.descriptionFr);

    // Check the boxes
    screen.getAllByRole("checkbox").forEach((input) => {
      fireEvent.click(input);
    });

    const resultsArray = checkboxData.properties.choices.map((object) => {
      return object.fr;
    });
    screen.getAllByRole("checkbox").forEach((input, index) => {
      expect(input.value).toEqual(resultsArray[index]);
    });
  });
});
