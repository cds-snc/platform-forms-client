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
    };
    const initialValues = getFormInitialValues(TestForm, "en");
    expect(initialValues).toEqual(expectedResponse);
  });
  test("... can get Form initial values in French", () => {
    const expectedResponse = {
      1: "Je ne sais pas",
      2: "Quelque chose difficile",
      3: "",
    };
    const initialValues = getFormInitialValues(TestForm, "fr");
    expect(initialValues).toEqual(expectedResponse);
  });
});
