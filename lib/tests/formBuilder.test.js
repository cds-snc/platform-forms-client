/**
 *  Unit-tests for formBuilder.tsx
 */
import React from "react";
import { render } from "@testing-library/react";
import { GenerateElement } from "../formBuilder";
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
    validation: {
      required: true,
    },
  },
};

const radioJSON = {
  id: 1,
  type: "radio",
  properties: {
    titleEn: "Language of service",
    titleFr: "Préférence linguistique",
    validation: {
      required: false,
    },
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
    const elementToRender = <GenerateElement element={textInputJSON} language="en" />;
    expect(elementToRender).toBeDefined();

    const { container, getByText } = render(<Form t={(key) => key}>{elementToRender}</Form>);
    expect(getByText(textInputJSON.properties.titleEn)).toBeInTheDocument();
    expect(container.childElementCount).toBe(1);
  });

  it("renders radio buttons", () => {
    const elementToRender = <GenerateElement element={radioJSON} language="en" />;
    expect(elementToRender).toBeDefined();

    const { getByText } = render(<Form t={(key) => key}>{elementToRender}</Form>);
    expect(getByText(radioJSON.properties.titleEn)).toBeInTheDocument();
  });
});
