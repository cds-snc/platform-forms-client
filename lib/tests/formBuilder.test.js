import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Form } from "../../components/forms";
import { getProperty, getFormInitialValues, getRenderedForm } from "../formBuilder";
import TestForm from "./testData";

// GenerateElement from formbuilder is tested in all Component Tests

describe("getProperty() tests", () => {
  test("...can parse i18n labels", () => {
    const fieldName = "title";
    const language = "en";
    const response = getProperty(fieldName, language);
    expect(response).toEqual("titleEn");
  });
  test("...can handle empty string", () => {
    const response = getProperty("", "en");
    expect(response).toEqual("en");
  });
  test("...can handle an Error", () => {
    expect(() => getProperty(1234)).toThrow(Error);
  });
});

describe("getFormInitialValues() tests", () => {
  test("...can get Form initial values in English", () => {
    const expectedResponse = {
      1: "",
      2: "",
      4: {
        0: "",
        1: "Alberta",
        2: "British Columbia",
        3: "Manitoba",
        4: "New Brunswick",
        5: "Newfoundland and Labrador",
        6: "Northwest Territories",
        7: "Nova Scotia",
        8: "Nunavut",
        9: "Ontario",
        10: "Prince Edward Island",
        11: "Quebec",
        12: "Saskatchewan",
        13: "Yukon",
      },
      5: {
        0: "Citizen",
        1: "Permanent Resident",
        2: "Student",
        3: "Visitor",
        4: "Other",
      },
      6: {
        0: "Yes",
        1: "No",
        2: "Not Applicable",
      },
      7: [
        {
          0: "",
          1: "",
          2: "",
          3: {
            0: "Yes",
            1: "No",
            2: "Not Applicable",
          },
        },
      ],
      8: "",
    };
    const initialValues = getFormInitialValues(TestForm, "en");
    expect(initialValues).toEqual(expectedResponse);
  });
  test("... can get Form initial values in French", () => {
    const expectedResponse = {
      1: "",
      2: "",
      4: {
        0: "",
        1: "Alberta",
        2: "Colombie-Britannique",
        3: "Manitoba",
        4: "Nouveau-Brunswick",
        5: "Terre-Neuve-et-Labrador",
        6: "Territoires du Nord-Ouest",
        7: "Nouvelle-Écosse",
        8: "Nunavut",
        9: "Ontario",
        10: "Île-du-Prince-Édouard",
        11: "Québec",
        12: "Saskatchewan",
        13: "Yukon",
      },
      5: {
        0: "Cityoen",
        1: "Permanent Resident",
        2: "Student",
        3: "Visitor",
        4: "Autre",
      },
      6: {
        0: "Oui",
        1: "Non",
        2: "Non applicable",
      },
      7: [
        {
          0: "",
          1: "",
          2: "",
          3: {
            0: "Oui",
            1: "Non",
            2: "Non applicable",
          },
        },
      ],
      8: "",
    };

    const initialValues = getFormInitialValues(TestForm, "fr");
    expect(initialValues).toEqual(expectedResponse);
  });
});
describe("Get rendered form", () => {
  afterEach(cleanup);
  test("No form data attached - returns null", () => {
    const response = getRenderedForm();
    expect(response).toBe(null);
  });
  test("Renders form for all elements - English", () => {
    const response = getRenderedForm(TestForm, "en");
    render(
      <Form formMetadata={TestForm} language={"en"} router={jest.fn(() => { })} t={(key) => key}>
        {response}
      </Form>
    );
    expect(screen.queryAllByRole("textbox").length).toBe(6);
    expect(screen.queryAllByRole("checkbox").length).toBe(6);
    expect(screen.queryAllByRole("radio").length).toBe(5);
    expect(screen.queryAllByRole("combobox").length).toBe(1);
    expect(screen.queryAllByRole("option").length).toBe(14);
    expect(screen.queryAllByRole("group").length).toBe(4);
  });
  test("Renders form for all elements - French", () => {
    const response = getRenderedForm(TestForm, "fr");
    render(
      <Form formMetadata={TestForm} language={"fr"} router={jest.fn(() => { })} t={(key) => key}>
        {response}
      </Form>
    );
    expect(screen.queryAllByRole("textbox").length).toBe(6);
    expect(screen.queryAllByRole("checkbox").length).toBe(6);
    expect(screen.queryAllByRole("radio").length).toBe(5);
    expect(screen.queryAllByRole("combobox").length).toBe(1);
    expect(screen.queryAllByRole("option").length).toBe(14);
    expect(screen.queryAllByRole("group").length).toBe(4);
    expect(screen.queryAllByRole("heading").length).toBe(1);
    expect(screen.queryAllByRole("button").length).toBe(2);
  });
});
