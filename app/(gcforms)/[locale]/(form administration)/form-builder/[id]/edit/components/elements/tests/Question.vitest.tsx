/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { cleanup, render, act, waitFor } from "@testing-library/react";
import { Question } from "../question/Question";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import {
  defaultStore as store,
  Providers,
  localStorageMock,
} from "@lib/utils/form-builder/test-utils";
import userEvent from "@testing-library/user-event";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { FormElementTypes } from "@lib/types";

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

describe("Question", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
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

    const rendered = render(
      <Providers form={store}>
        <Question item={item} onQuestionChange={() => {}} />
      </Providers>
    );

    const question = rendered.container.querySelector("#item-1");
    expect(question).toBeTruthy();
    expect(question).toHaveAttribute("placeholder", "question");
    expect(question).toHaveValue("phone input");

    expect(rendered.container.querySelector('[data-testid="description-text"]')).toBeNull();

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  it("calls updater function", async () => {
    const user = userEvent.setup();

    const Container = () => {
      const { elements, updateField, propertyPath } = useTemplateStore((s) => ({
        elements: s.form.elements,
        updateField: s.updateField,
        propertyPath: s.propertyPath,
      }));

      const onQuestionChange = (itemId: number, val: string, lang: string = "en") => {
        updateField(
          propertyPath(itemId, LocalizedElementProperties.TITLE, lang as unknown as "en" | "fr"),
          val
        );
      };

      const item = { index: 0, ...elements[0] } as unknown as Parameters<
        typeof Question
      >[0]["item"];

      return (
        <div>
          <Question item={item} onQuestionChange={onQuestionChange} />
        </div>
      );
    };

    const rendered = render(
      <Providers form={store}>
        <Container />
      </Providers>
    );

    const question = rendered.container.querySelector("#item-1");
    expect(question).toBeTruthy();

    await user.type(question as HTMLInputElement, "!!!");

    expect(question).toHaveValue("question 1!!!");

    await waitFor(() => {
      const sessionStore = JSON.parse(
        window.sessionStorage.getItem("form-storage") || "{}"
      ) as unknown as {
        state?: { form?: { elements?: Array<{ properties?: { titleEn?: string } }> } };
      };
      expect(sessionStore.state?.form?.elements?.[0]?.properties?.titleEn).toEqual(
        "question 1!!!"
      );
    });
  });
});
