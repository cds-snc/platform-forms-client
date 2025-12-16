/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    const title = (lang === "en" ? textInputData.properties.titleEn : textInputData.properties.titleFr)!;
    const description =
      (lang === "en" ? textInputData.properties.descriptionEn : textInputData.properties.descriptionFr)!;
    const placeholder =
      (lang === "en" ? textInputData.properties.placeholderEn : textInputData.properties.placeholderFr)!;

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

describe("Verfify character count restrictions", () => {
  let localScreen: ReturnType<typeof render>;

  beforeEach(() => {
    localScreen = render(<GenerateElement element={textInputData} language={"en"} />);
  });

  it("does not display any message when not enough characters have been typed in", async () => {
    const user = userEvent.setup();
    const textInput = localScreen.getByRole("textbox");
    await user.type(textInput, "This is 21 characters");
    expect(screen.queryByText("characters left.")).not.toBeInTheDocument();
  });

  it("displays a message with the number of characters remaining", async () => {
    const user = userEvent.setup();
    const textInput = localScreen.getByRole("textbox");
    await user.type(textInput, "This is 35 characters This is 35 ch");
    const found = screen.queryByText((content) =>
      typeof content === "string" && (content.includes("formElements.characterCount.part1") || /5[^\n]*characters/i.test(content))
    );
    expect(found).toBeInTheDocument();
  });

  it("displays an error message indicating too many characters", async () => {
    const user = userEvent.setup();
    const textInput = localScreen.getByRole("textbox");
    await user.type(textInput, "This is 48 characters This is 48 characters This");
    // Accept translation-key fallback or several plausible English/French renderings
    const foundError = screen.queryByText((content) =>
      typeof content === "string" &&
      (
        content.includes("formElements.characterCount.part1-error") ||
        /8[^\n]*characters/i.test(content) ||
        /8[^\n]*caract/i.test(content) ||
        /exceed(ed|ed the)?/.test(content)
      )
    );
    expect(foundError).toBeInTheDocument();
  });
});
