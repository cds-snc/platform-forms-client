import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Form } from "@components/forms";
import { getProperty, getFormInitialValues, getRenderedForm } from "../formBuilder";
import TestForm from "../../__fixtures__/testData.json";
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
  test("...can get Form initial values", () => {
    const expectedResponse = {
      1: "",
      2: "",
      4: "",
      5: "",
      6: [],
      7: [
        {
          0: "",
          1: "",
          2: "",
          3: [],
        },
      ],
      8: "",
    };
    const initialValues = getFormInitialValues(TestForm, "en");
    expect(initialValues).toEqual(expectedResponse);
  });
});

describe("Get rendered form", () => {
  afterEach(cleanup);
  test("No form data attached - returns null", () => {
    const response = getRenderedForm();
    expect(response).toBe(null);
  });
  test.each([["en"], ["fr"]])("Renders form for all elements - English", (lang) => {
    const t = (key) => key;
    const response = getRenderedForm(TestForm, lang, t);
    render(
      <Form formRecord={TestForm} language={lang} router={jest.fn(() => {})} t={(key) => key}>
        {response}
      </Form>
    );
    expect(screen.queryAllByRole("textbox").length).toBe(6);
    expect(screen.queryAllByRole("checkbox").length).toBe(6);
    expect(screen.queryAllByRole("radio").length).toBe(5);
    expect(screen.queryAllByRole("combobox").length).toBe(1);
    expect(screen.queryAllByRole("option").length).toBe(15);
    expect(screen.queryAllByRole("group").length).toBe(4);
    expect(screen.queryAllByRole("button").length).toBe(2);
  });
});
