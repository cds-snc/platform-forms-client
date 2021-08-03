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

describe.each([["en"], ["fr"]])("Generate a text input", (lang) => {
  afterEach(cleanup);
  test("renders without errors", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textInputData} language={lang} />
      </Form>
    );
    const title =
        lang === "en" ? textInputData.properties.titleEn : textInputData.properties.titleFr,
      description =
        lang === "en"
          ? textInputData.properties.descriptionEn
          : textInputData.properties.descriptionFr,
      placeholder =
        lang === "en"
          ? textInputData.properties.placeholderEn
          : textInputData.properties.placeholderFr;

    // Label properly renders
    expect(screen.getByText(title)).toBeInTheDocument();
    // Description properly renders
    expect(screen.getByText(description)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox")).toBeRequired().toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("asterisk")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});
