import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [{ field: { value: "" } }, { meta: { touched: null, error: null } }]),
}));

const textInputData = {
  id: "1",
  type: "textField",
  properties: {
    titleEn: "What is your full name?",
    titleFr: "Quel est votre nom complet?",
    placeholderEn: "I wish I knew",
    placeholderFr: "Je ne sais pas",
    descriptionEn: "This is a description",
    descriptionFr: "Voice une description",
    validation: {
      required: true,
    },
  },
};

describe("Generate a text input", () => {
  afterEach(cleanup);
  test("...in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language="en" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(textInputData.properties.titleEn);
    // Description properly renders
    expect(screen.getByText(textInputData.properties.descriptionEn)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox"))
      .toBeRequired()
      .toHaveDescription(textInputData.properties.descriptionEn);
    expect(screen.queryByTestId("asterisk")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(textInputData.properties.placeholderEn)).toBeInTheDocument();
  });
  test("...in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language="fr" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(textInputData.properties.titleFr);
    // Description properly render
    expect(screen.getByText(textInputData.properties.descriptionFr)).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(textInputData.properties.placeholderFr)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox"))
      .toBeRequired()
      .toHaveDescription(textInputData.properties.descriptionFr);
  });
});
