/**
 *  Unit-tests for formBuilder.tsx
 */

import { render } from "@testing-library/react";
import { buildForm } from "../formBuilder";
import "@testing-library/jest-dom/extend-expect";

const jsonElement = {
  id: 1,
  type: "textField",
  properties: {
    titleEn: "What is your full name?",
    titleFr: "Quel est votre nom complet?",
    placeholderEn: "",
    placeholderFr: "",
    description: "",
    charLimit: 100,
    required: true,
  },
};

test("Build Form renders a text field", () => {
  const elementToRender = buildForm(jsonElement, "", "en", null);
  expect(elementToRender).toBeDefined();

  const { container, getByText } = render(elementToRender);
  expect(getByText(jsonElement.properties.titleEn)).toBeInTheDocument();
  expect(container.childElementCount).toBe(2);
});
