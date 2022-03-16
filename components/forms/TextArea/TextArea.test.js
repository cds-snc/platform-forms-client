import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "@lib/formBuilder";

jest.mock("formik", () => ({
  ...jest.requireActual("formik"),
  useField: jest.fn(() => [{ field: { value: "" } }, { meta: { touched: null, error: null } }]),
}));

const textAreaData = {
  id: 2,
  type: "textArea",
  properties: {
    titleEn: "What is the problem you are facing",
    titleFr: "Quel est le problème auquel vous êtes confronté?",
    placeholderEn: "Something difficult",
    placeholderFr: "Quelque chose difficile",
    descriptionEn: "Here be a description",
    descriptionFr: "Pour décrire, ou pas décire..",
    charLimit: 100,
    validation: {
      required: true,
    },
  },
};

describe("Generate a text area", () => {
  afterEach(cleanup);
  test.each([["en"], ["fr"]])("renders without errors", (lang) => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textAreaData} language={lang} />
      </Form>
    );
    const title = lang === "en" ? textAreaData.properties.titleEn : textAreaData.properties.titleFr,
      description =
        lang === "en"
          ? textAreaData.properties.descriptionEn
          : textAreaData.properties.descriptionFr,
      placeholder =
        lang === "en"
          ? textAreaData.properties.placeholderEn
          : textAreaData.properties.placeholderFr;

    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(title);
    // Description properly render
    expect(screen.getByText(description)).toBeInTheDocument();
    // Field marked as required and have aria described by
    expect(screen.getByRole("textbox")).toBeRequired().toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("required")).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});
