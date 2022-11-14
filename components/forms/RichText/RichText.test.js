import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { GenerateElement } from "@lib/formBuilder";

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
    validation: {
      required: false,
    },
  },
};

describe("Generate a text area", () => {
  afterEach(cleanup);
  test.each([["en"], ["fr"]])("renders properly", (lang) => {
    render(<GenerateElement element={richTextData} language={lang} t={(key) => key} />);
    const title = lang === "en" ? richTextData.properties.titleEn : richTextData.properties.titleFr,
      description =
        lang === "en"
          ? richTextData.properties.descriptionEn
          : richTextData.properties.descriptionFr;
    // Label properly renders
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(title);
    // Description properly render
    expect(screen.getByText(description)).toBeInTheDocument();
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
    render(<GenerateElement element={emptyRichTextData} language="en" t={(key) => key} />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("richText")).not.toBeInTheDocument();
  });
  test("Should not render raw HTML in markdown", () => {
    const richTextWithHTML = { ...richTextData };
    richTextWithHTML.properties.descriptionEn =
      "Testing <script data-testid='script'>alert('pwned')</script> this";
    render(<GenerateElement element={richTextWithHTML} language="en" t={(key) => key} />);
    expect(screen.queryByTestId("script")).not.toBeInTheDocument();
  });

  test("Renders link with target attribute", () => {
    const richTextWithHTML = { ...richTextData };
    richTextWithHTML.properties.descriptionEn = "Testing [link](https://google.ca) this";
    render(<GenerateElement element={richTextWithHTML} language="en" t={(key) => key} />);
    expect(screen.queryByRole("link")).toHaveAttribute("target");
  });
});
