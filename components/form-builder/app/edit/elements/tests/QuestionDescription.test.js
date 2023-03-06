import React from "react";
import { cleanup, render, act } from "@testing-library/react";
import { defaultStore as store, Providers, localStorageMock } from "@formbuilder/test-utils";
import { QuestionDescription } from "../question/QuestionDescription";

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

describe("Question", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a descripton", async () => {
    const promise = Promise.resolve();

    const item = { id: 1, index: 0, ...store.elements[0] };

    const rendered = render(
      <Providers form={store}>
        <QuestionDescription item={item} describedById="described-by-id" />
      </Providers>
    );

    const description = rendered.container.querySelector("[data-testid=description-text]");
    expect(description).toHaveAttribute("data-testid", "description-text");
    expect(description).toHaveAttribute("id", "described-by-id");
    expect(description).toHaveTextContent("description 1 en");

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });
});
