/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ConditionalSelector } from "./ConditionalSelector";

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      localizeField: (field: string) => field + "En",
      translationLanguagePriority: "en",
    }),
}));

vi.mock("@clientComponents/globals", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe("ConditionalSelector", () => {
  afterEach(() => {
    cleanup();
  });

  it("only lists rule targets that have choices", () => {
    const { container } = render(
      <ConditionalSelector
        itemId={1}
        index={0}
        elements={[
          {
            id: 1,
            type: "radio",
            properties: {
              titleEn: "Source question",
              titleFr: "",
              descriptionEn: "",
              descriptionFr: "",
              choices: [{ en: "Yes", fr: "Oui" }],
              conditionalRules: [],
            },
          },
          {
            id: 2,
            type: "textField",
            properties: {
              titleEn: "Short answer target",
              titleFr: "",
              descriptionEn: "",
              descriptionFr: "",
            },
          },
          {
            id: 3,
            type: "radio",
            properties: {
              titleEn: "Radio target",
              titleFr: "",
              descriptionEn: "",
              descriptionFr: "",
              choices: [{ en: "A", fr: "A" }],
            },
          },
          {
            id: 4,
            type: "dropdown",
            properties: {
              titleEn: "Dropdown target",
              titleFr: "",
              descriptionEn: "",
              descriptionFr: "",
              choices: [{ en: "B", fr: "B" }],
            },
          },
        ]}
        elementId={null}
        choiceId={"1.0"}
        updateChoiceId={vi.fn()}
        updateElementId={vi.fn()}
        removeSelector={vi.fn()}
      />
    );

    const selects = container.querySelectorAll("select");
    const questionOptions = Array.from(selects[1].querySelectorAll("option")).map((option) => ({
      text: option.textContent,
      value: option.value,
    }));

    expect(questionOptions).toEqual([
      { text: "addConditionalRules.selectQuestion", value: "" },
      { text: "Radio target", value: "3" },
      { text: "Dropdown target", value: "4" },
    ]);
  });
});