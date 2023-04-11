import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenerateElement } from "../../../lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [{ field: { value: "" } }, { meta: { touched: null, error: null } }]),
}));

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

describe.each([["en"], ["fr"]])("Dropdown component", (lang) => {
  afterEach(cleanup);
  test("renders without errors", async () => {
    userEvent.setup();
    render(<GenerateElement element={dropdownData} language={lang} t={(key) => key} />);
    const title = lang === "en" ? dropdownData.properties.titleEn : dropdownData.properties.titleFr,
      description =
        lang === "en"
          ? dropdownData.properties.descriptionEn
          : dropdownData.properties.descriptionFr;
    const dropdown = screen.queryByTestId("dropdown");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveAccessibleDescription(description);
    expect(dropdown).toHaveClass("gc-dropdown");
    expect(dropdown).toHaveDisplayValue("dropdown-initial-option-text");
    expect(
      screen.getByRole("combobox", {
        name: title,
      })
    ).toBeInTheDocument();

    // Change value
    await userEvent.selectOptions(screen.queryByTestId("dropdown"), [
      dropdownData.properties.choices[2][lang],
    ]);
    expect(screen.getByTestId("dropdown")).toHaveDisplayValue(
      dropdownData.properties.choices[2][lang]
    );
  });
  test("required elements display properly", () => {
    dropdownData.properties.validation.required = true;
    render(<GenerateElement element={dropdownData} language={lang} t={(key) => key} />);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    dropdownData.properties.validation.required = false;
  });
});
