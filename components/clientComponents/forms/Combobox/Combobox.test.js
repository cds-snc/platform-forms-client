import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenerateElement } from "@lib/formBuilder";
import { act } from "react-dom/test-utils";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [
    { field: { value: "" } },
    { meta: { touched: null, error: null } },
    { setValue: jest.fn() },
  ]),
}));

const comboboxData = {
  id: 16,
  type: "combobox",
  properties: {
    titleEn: "Province or territory",
    titleFr: "Province ou territoire",
    descriptionEn: "Start typing to narrow down the list",
    descriptionFr: "Commencez à taper pour réduire la liste",
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

describe.each([["en"], ["fr"]])("Combobox component", (lang) => {
  afterEach(cleanup);

  test("renders without errors", async () => {
    render(<GenerateElement element={comboboxData} language={lang} />);

    const title = lang === "en" ? comboboxData.properties.titleEn : comboboxData.properties.titleFr,
      description =
        lang === "en"
          ? comboboxData.properties.descriptionEn
          : comboboxData.properties.descriptionFr;

    const combobox = screen.queryByTestId("combobox");
    const comboboxInput = screen.queryByTestId("combobox-input");
    const comboboxListbox = screen.queryByTestId("combobox-listbox");

    expect(combobox).toBeInTheDocument();
    expect(comboboxInput).toBeInTheDocument();
    expect(comboboxListbox).toBeInTheDocument();
    expect(comboboxInput).toHaveAccessibleDescription(description);
    expect(combobox).toHaveClass("gc-combobox");

    expect(
      screen.getByRole("combobox", {
        name: title,
      })
    ).toBeInTheDocument();

    await act(async () => {
      expect(comboboxListbox).not.toBeVisible();
      await userEvent.click(comboboxInput);
      await userEvent.type(comboboxInput, " "); // this should be {downarrow} but it's not working
      expect(comboboxListbox).toBeVisible();
      const options = within(comboboxListbox).getAllByRole("option");
      expect(options).toHaveLength(14);
    });
  });
});
