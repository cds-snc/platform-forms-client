/**
 *  Unit-tests for formBuilder.tsx
 */
import React from "react";
import { render } from "@testing-library/react";
import { buildForm } from "../formBuilder";
import Form from "../../components/forms/Form/Form";

const textInputJSON = {
  id: 1,
  type: "textField",
  properties: {
    titleEn: "What is your full name?",
    titleFr: "Quel est votre nom complet?",
    placeholderEn: "",
    placeholderFr: "",
    charLimit: 100,
    required: true,
  },
};

const radioJSON = {
  id: 1,
  type: "radio",
  properties: {
    titleEn: "Language of service",
    titleFr: "Préférence linguistique",
    required: false,
    choices: [
      {
        en: "English",
        fr: "Anglais",
      },
      {
        en: "French",
        fr: "Français",
      },
      {
        en: "Other",
        fr: "Autre",
      },
    ],
  },
};

describe("Build Form renders a text field", () => {
  it("renders a text input", async () => {
    const elementToRender = buildForm(textInputJSON, "en", null);
    expect(elementToRender).toBeDefined();

    const { container, getByText } = render(<Form>{elementToRender}</Form>);
    expect(getByText(textInputJSON.properties.titleEn)).toBeInTheDocument();
    expect(container.childElementCount).toBe(1);
  });

  it("renders radio buttons", () => {
    const elementToRender = buildForm(radioJSON, "en", null);
    expect(elementToRender).toBeDefined();

    const { getByText } = render(<Form>{elementToRender}</Form>);
    expect(getByText(radioJSON.properties.titleEn)).toBeInTheDocument();
  });
});
