import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

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
  test("...in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textAreaData} language="en" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(textAreaData.properties.titleEn);
    // Description properly render
    expect(screen.getByText(textAreaData.properties.descriptionEn)).toBeInTheDocument();
    // Field marked as required and have aria described by
    expect(screen.getByRole("textbox"))
      .toBeRequired()
      .toHaveDescription(textAreaData.properties.descriptionEn);
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(textAreaData.properties.placeholderEn)).toBeInTheDocument();
  });
  test("...in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={textAreaData} language="fr" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByTestId("label")).toContainHTML(textAreaData.properties.titleFr);
    // Description properly render
    expect(screen.getByText(textAreaData.properties.descriptionFr)).toBeInTheDocument();
    // Placeholder properly renders
    expect(screen.getByPlaceholderText(textAreaData.properties.placeholderFr)).toBeInTheDocument();
    // Field marked as required
    expect(screen.getByRole("textbox")).toBeRequired();
  });
});
