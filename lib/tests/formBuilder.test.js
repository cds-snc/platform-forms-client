import { getProperty, getFormInitialValues } from "../formBuilder";
import TestForm from "./testData";

// GenerateElement from formbuilder is tested in all Component Tests

describe("getProperty() tests", () => {
  test("..can parse i18n labels", () => {
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
      1: "I wish I knew",
      2: "Something difficult",
      3: "",
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
    };
    const initialValues = getFormInitialValues(TestForm, "en");
    expect(initialValues).toEqual(expectedResponse);
  });
  test("... can get Form initial values in French", () => {
    const expectedResponse = {
      1: "Je ne sais pas",
      2: "Quelque chose difficile",
      3: "",
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
    };

    const initialValues = getFormInitialValues(TestForm, "fr");
    expect(initialValues).toEqual(expectedResponse);
  });
});
