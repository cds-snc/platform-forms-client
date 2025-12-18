/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
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
    validation: {
      required: true,
      maxLength: 40,
    },
  },
} as const as FormElement;

const textAreaData2 = {
  id: 2,
  type: "textArea",
  properties: {
    titleEn: "What is the problem you are facing",
    titleFr: "Quel est le problème auquel vous êtes confronté?",
    placeholderEn: "Something difficult",
    placeholderFr: "Quelque chose difficile",
    descriptionEn: "",
    descriptionFr: "",
    charLimit: 100,
    validation: {
      required: true,
      maxLength: 40,
    },
  },
} as const as FormElement;

describe("Generate a text area", () => {
  afterEach(() => cleanup());
  describe.each([["en"], ["fr"]] as Array<[Language]>)(
    "renders without errors",
    (lang: Language) => {
      it("renders without errors", () => {
        render(<GenerateElement element={textAreaData} language={lang} />);

        const title = (
          lang === "en" ? textAreaData.properties.titleEn : textAreaData.properties.titleFr
        )!;
        const description = (
          lang === "en"
            ? textAreaData.properties.descriptionEn
            : textAreaData.properties.descriptionFr
        )!;
        const placeholder = (
          lang === "en"
            ? textAreaData.properties.placeholderEn
            : textAreaData.properties.placeholderFr
        )!;

        // Label properly renders
        expect(screen.getByTestId("label")).toContainHTML(title);
        // Description properly render
        expect(screen.getByText(description)).toBeInTheDocument();
        // Field marked as required and have aria described by
        const renderedTextBox = screen.getByRole("textbox");
        expect(renderedTextBox).toBeRequired();
        expect(renderedTextBox).toHaveAccessibleDescription(description);
        expect(screen.queryByTestId("required")).toBeInTheDocument();
        // Placeholder properly renders
        expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
      });
    }
  );
});

describe("Accessibility tests for the textarea component.", () => {
  let localScreen: ReturnType<typeof render>;

  beforeEach(() => {
    localScreen = render(<GenerateElement element={textAreaData2} language={"en"} />);
  });
  it("checks the `aria-describedby` attribute", () => {
    // initial attribute has no value since the description is empty.
    const textBox = localScreen.getByRole("textbox");
    expect(textBox).toBeRequired();
    expect(textBox).not.toHaveAccessibleDescription();
  });

  it("after typing some characters, the attribute is updated to indicate how many characters are left.", async () => {
    const user = userEvent.setup();
    const textInput = localScreen.getByRole("textbox");

    await user.type(textInput, "This is 35 characters This is 35 ch");

    const textbox = localScreen.getByRole("textbox");
    expect(textbox).toBeRequired();

    const expectedEn = "You have 5 characters left.";
    const expectedFr = "Il vous reste 5 caractères.";

    expect([expectedEn, expectedFr]).toContain(
      (textbox.getAttribute("aria-describedby") &&
        document.getElementById(textbox.getAttribute("aria-describedby")!)?.textContent) ||
        ""
    );
  });

  it("after typing more characters than the maxLength, the attribute is updated to indicate how many characters are too many.", async () => {
    const user = userEvent.setup();
    const textInput = localScreen.getByRole("textbox");

    await user.type(textInput, "This is 48 characters This is 48 characters This");

    const textbox = localScreen.getByRole("textbox");
    expect(textbox).toBeRequired();

    const expectedEnError = "You've exceeded the limit by 8 characters.";
    const expectedFrError = "Vous avez dépassé la limite de 8 caractères.";
    expect([expectedEnError, expectedFrError]).toContain(
      (textbox.getAttribute("aria-describedby") &&
        document.getElementById(textbox.getAttribute("aria-describedby")!)?.textContent) ||
        ""
    );
  });
});
