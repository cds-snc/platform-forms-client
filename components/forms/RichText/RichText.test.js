import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

const richTextData = {
  id: 3,
  type: "richText",
  properties: {
    titleEn: "Label 1",
    titleFr: "Label 2",
    descriptionEn:
      "Thank you so much for your interest in the Canadian Digital Service’s Forms product.",
    descriptionFr:
      "Merci beaucoup de l’intérêt que vous portez au produit de Formulaire du Service Numérique Canadien.",
    charLimit: 200,
    validation: {
      required: false,
    },
  },
};

describe("Generate a text area", () => {
  afterEach(cleanup);
  test("...in English", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={richTextData} language="en" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByText(richTextData.properties.titleEn)).toBeInTheDocument();
    expect(screen.getByText(richTextData.properties.titleEn)).toHaveClass("gc-h3");
    // Description properly render
    expect(screen.getByText(richTextData.properties.descriptionEn)).toBeInTheDocument();
  });
  test("...in French", () => {
    render(
      <Form t={(key) => key}>
        <GenerateElement element={richTextData} language="fr" />
      </Form>
    );
    // Label properly renders
    expect(screen.getByText(richTextData.properties.titleFr)).toBeInTheDocument();
    // Description properly render
    expect(screen.getByText(richTextData.properties.descriptionFr)).toBeInTheDocument();
  });
  test("Return null if no children", () => {
    const emptyRichTextData = {
      id: 3,
      type: "richText",
      properties: {
        titleEn: "",
        titleFr: "",
        descriptionEn: "",
        descriptionFr: "",
      },
    };
    render(
      <Form t={(key) => key}>
        <GenerateElement element={emptyRichTextData} language="en" />
      </Form>
    );
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("richText")).not.toBeInTheDocument();
  });
});
