/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { GenerateElement } from "@lib/formBuilder";
import type { FormElement } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

vi.mock("formik", async () => {
  const actual = await vi.importActual<typeof import("formik")>("formik");
  return {
    ...actual,
    useField: vi.fn(() => [
      { field: { value: "" } },
      { meta: { touched: null, error: null } },
      { setValue: vi.fn() },
    ]),
  };
});

const textInputData = {
  id: 1,
  type: "textField",
  properties: {
    titleEn: "What is your full name?",
    titleFr: "Quel est votre nom complet?",
    placeholderEn: "I wish I knew",
    placeholderFr: "Je ne sais pas",
    descriptionEn: "This is a description",
    descriptionFr: "Voice une description",
    autoComplete: "name",
    validation: {
      required: true,
      maxLength: 40,
    },
  },
} as const as FormElement;

describe.each([["en"], ["fr"]] as Array<[Language]>)("Generate a text input", (lang: Language) => {
  afterEach(() => cleanup());
  it("renders without errors", () => {
    render(<GenerateElement element={textInputData} language={lang} />);

    const title = (
      lang === "en" ? textInputData.properties.titleEn : textInputData.properties.titleFr
    )!;
    const description = (
      lang === "en"
        ? textInputData.properties.descriptionEn
        : textInputData.properties.descriptionFr
    )!;
    const placeholder = (
      lang === "en"
        ? textInputData.properties.placeholderEn
        : textInputData.properties.placeholderFr
    )!;

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    const renderedTextBox = screen.getByRole("textbox");
    expect(renderedTextBox).toBeRequired();
    expect(renderedTextBox).toHaveAccessibleDescription(description);
    expect(screen.queryByTestId("required"))!.toBeInTheDocument();
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });
});

describe("Check attributes on rendered text input", () => {
  it("has the correct autoComplete value", () => {
    render(<GenerateElement element={textInputData} language={"en"} />);
    const textbox = screen.getByRole("textbox");
    expect(textbox.getAttribute("autoComplete")).toBe("name");
  });
});
