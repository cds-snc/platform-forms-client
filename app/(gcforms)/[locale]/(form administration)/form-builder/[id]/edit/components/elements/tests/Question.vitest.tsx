/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render, act } from "@testing-library/react";
import { Question } from "../question/Question";
import { FormElementTypes } from "@lib/types";
import userEvent from "@testing-library/user-event";

// Mock the hooks that Question uses
vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      localizeField: (field: string) => field + "En",
      translationLanguagePriority: "en",
      setFocusInput: vi.fn(),
      getFocusInput: () => false,
      getLocalizationAttribute: () => ({ lang: "en" }),
    }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../RefsContext", () => ({
  useRefsContext: () => ({
    refs: { current: {} },
  }),
}));

vi.mock(
  "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider",
  () => ({
    useTreeRef: () => ({
      headlessTree: { current: null },
    }),
  })
);

vi.mock("lodash.debounce", () => ({
  default: (fn: (value: string) => void) => fn,
}));

describe("Question", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders", async () => {
    const promise = Promise.resolve();

    const item = {
      id: 1,
      index: 0,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "phone input",
        titleFr: "",
        choices: [],
        validation: { required: false },
        descriptionEn: "",
        descriptionFr: "",
      },
    };

    const rendered = render(<Question item={item} onQuestionChange={() => {}} />);

    const question = rendered.container.querySelector("#item-1");
    expect(question).toBeTruthy();
    expect(question).toHaveAttribute("placeholder", "question");
    expect(question).toHaveValue("phone input");

    expect(rendered.container.querySelector('[data-testid="description-text"]')).toBeNull();

    await act(async () => {
      await promise;
    });
  });

  it("calls updater function", async () => {
    const user = userEvent.setup();
    const onQuestionChange = vi.fn();

    const item = {
      id: 1,
      index: 0,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "question 1",
        titleFr: "",
        choices: [],
        validation: { required: false },
        descriptionEn: "",
        descriptionFr: "",
      },
    };

    const rendered = render(<Question item={item} onQuestionChange={onQuestionChange} />);

    const question = rendered.container.querySelector("#item-1") as HTMLInputElement;
    expect(question).toBeTruthy();

    await user.type(question, "!!!");

    expect(question).toHaveValue("question 1!!!");
    expect(onQuestionChange).toHaveBeenCalled();
  });
});
