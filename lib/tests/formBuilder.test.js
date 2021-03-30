import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../../components/forms/Form/Form";
import { getProperty, getFormInitialValues, GenerateElement } from "../formBuilder";
import TestForm from "./test";

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
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
    };
    const initialValues = getFormInitialValues(TestForm, "en");
    expect(initialValues).toEqual(expectedResponse);
  });
  test("... can get Form initial values in French", () => {
    const expectedResponse = {
      1: "Je ne sais pas",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
    };
    const initialValues = getFormInitialValues(TestForm, "fr");
    expect(initialValues).toEqual(expectedResponse);
  });
});
describe("GenerateElement() tests", () => {
  afterEach(cleanup);
  test("Generate a text input in English", () => {
    const textElement = TestForm.elements.find((element) => element.id === 1);
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textElement} language="en" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByLabelText(textElement.properties.titleEn)).toBeInTheDocument();
    // Description properly render
    expect(screen.getByText(textElement.properties.descriptionEn)).toBeInTheDocument();
    // Placeholder properly renders
    //expect(screen.getByPlaceholderText(textElement.properties.placeholderEn)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox")).toBeRequired();
  });
  test("Generate a text input in French", () => {
    const textElement = TestForm.elements.find((element) => element.id === 1);
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textElement} language="fr" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByLabelText(textElement.properties.titleFr)).toBeInTheDocument();
    // Description properly render
    expect(screen.getByText(textElement.properties.descriptionFr)).toBeInTheDocument();
    // Placeholder properly renders
    //expect(screen.getByPlaceholderText(textElement.properties.placeholderEn)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox")).toBeRequired();
  });
});
