/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { GenerateElement } from "@lib/formBuilder";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

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
} as const as FormElement;

describe("Generate a rich text element", () => {
  afterEach(() => cleanup());

  it.each([["en"], ["fr"]] as Array<[Language]>)("renders properly", (lang: Language) => {
    render(<GenerateElement element={richTextData} language={lang} />);
    const title = lang === "en" ? richTextData.properties.titleEn : richTextData.properties.titleFr;
    const description =
      lang === "en" ? richTextData.properties.descriptionEn : richTextData.properties.descriptionFr;

    expect(screen.getByText(title!)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(title!);
    expect(screen.getByText(description!)).toBeInTheDocument();
  });

  it("Return null if no children", () => {
    const emptyRichTextData = {
      id: 3,
      type: "richText",
      properties: {
        titleEn: "",
        titleFr: "",
        descriptionEn: "",
        descriptionFr: "",
      },
    } as const as FormElement;
    render(<GenerateElement element={emptyRichTextData} language="en" />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("richText")).not.toBeInTheDocument();
  });

  it("Should not render raw HTML in markdown", () => {
    const richTextWithHTML = { ...richTextData } as FormElement;
    richTextWithHTML.properties.descriptionEn =
      "Testing <script data-testid='script'>alert('pwned')</script> this";
    render(<GenerateElement element={richTextWithHTML} language="en" />);
    expect(screen.queryByTestId("script")).not.toBeInTheDocument();
  });

  it("Renders link with target attribute", () => {
    const richTextWithHTML = { ...richTextData } as FormElement;
    richTextWithHTML.properties.descriptionEn = "Testing [link](https://google.ca) this";
    render(<GenerateElement element={richTextWithHTML} language="en" />);
    expect(screen.queryByRole("link")).toHaveAttribute("target");
  });
});
