import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

const dropdownData = {
  id: 16,
  type: "dropdown",
  properties: {
    titleEn: "Province or territory",
    titleFr: "Province ou territoire",
    descriptionEn: "English description",
    descriptionFr: "Description en Francais",
    choices: [
      {
        en: "",
        fr: "",
      },
      {
        en: "Alberta",
        fr: "Alberta",
      },
      {
        en: "British Columbia",
        fr: "Colombie-Britannique",
      },
      {
        en: "Manitoba",
        fr: "Manitoba",
      },
      {
        en: "New Brunswick",
        fr: "Nouveau-Brunswick",
      },
      {
        en: "Newfoundland and Labrador",
        fr: "Terre-Neuve-et-Labrador",
      },
      {
        en: "Northwest Territories",
        fr: "Territoires du Nord-Ouest",
      },
      {
        en: "Nova Scotia",
        fr: "Nouvelle-Écosse",
      },
      {
        en: "Nunavut",
        fr: "Nunavut",
      },
      {
        en: "Ontario",
        fr: "Ontario",
      },
      {
        en: "Prince Edward Island",
        fr: "Île-du-Prince-Édouard",
      },
      {
        en: "Quebec",
        fr: "Québec",
      },
      {
        en: "Saskatchewan",
        fr: "Saskatchewan",
      },
      {
        en: "Yukon",
        fr: "Yukon",
      },
    ],
    validation: {
      required: false,
    },
  },
};

describe("Dropdown component", () => {
  afterEach(cleanup);
  test("... in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={dropdownData} language="en" />
      </Form>
    );
    expect(screen.queryByTestId("dropdown"))
      .toBeInTheDocument()
      .toHaveDescription(dropdownData.properties.descriptionEn)
      .toHaveClass("gc-dropdown")
      .toHaveDisplayValue("");
    expect(
      screen.getByRole("combobox", { name: dropdownData.properties.titleEn })
    ).toBeInTheDocument();

    // Change value
    fireEvent.select(screen.queryByTestId("dropdown"), {
      target: {
        value: dropdownData.properties.choices[2].en,
      },
    });
    expect(screen.getByTestId("dropdown")).toHaveDisplayValue(
      dropdownData.properties.choices[2].en
    );
  });
  test("... in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={dropdownData} language="fr" />
      </Form>
    );
    expect(screen.queryByTestId("dropdown"))
      .toBeInTheDocument()
      .toHaveDescription(dropdownData.properties.descriptionFr)
      .toHaveClass("gc-dropdown")
      .toHaveDisplayValue("");
    expect(
      screen.getByRole("combobox", { name: dropdownData.properties.titleFr })
    ).toBeInTheDocument();

    // Change value
    const newValue = Math.floor(Math.random() * dropdownData.properties.choices.length);
    fireEvent.select(screen.queryByTestId("dropdown"), {
      target: {
        value: dropdownData.properties.choices[newValue].fr,
      },
    });
    expect(screen.getByTestId("dropdown")).toHaveDisplayValue(
      dropdownData.properties.choices[newValue].fr
    );
  });
});
