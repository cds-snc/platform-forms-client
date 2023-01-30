import React from "react";
import { cleanup, render, act, waitFor } from "@testing-library/react";
import { Question } from "../question/Question";
import { useTemplateStore } from "@formbuilder/store";
import { defaultStore as store, Providers, localStorageMock } from "@formbuilder/test-utils";
import userEvent from "@testing-library/user-event";

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

  it("renders with descripton", async () => {
    const promise = Promise.resolve();

    const item = { id: 1, index: 0, ...store.elements[0] };

    const rendered = render(
      <Providers form={store}>
        <Question item={item} />
      </Providers>
    );

    const question = rendered.container.querySelector("#item0");
    expect(question).toHaveAttribute("placeholder", "question");
    expect(question).toHaveValue("question 1");

    const desciption = rendered.getByTestId("description-text");
    expect(desciption).toHaveTextContent("description 1 en");

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  it("renders with no descripton", async () => {
    const promise = Promise.resolve();

    const item = {
      id: 1,
      index: 0,
      type: "phone",
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
        <Question item={item} />
      </Providers>
    );

    const question = rendered.container.querySelector("#item0");
    expect(question).toHaveAttribute("placeholder", "question");
    expect(question).toHaveValue("phone input");

    expect(rendered.container.querySelector(".description-text")).toBeNull();

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  it("Calls updater function", async () => {
    const user = userEvent.setup();

    const Container = () => {
      const { elements, updateField } = useTemplateStore((s) => ({
        elements: s.form.elements,
        updateField: s.updateField,
      }));

      const onQuestionChange = (itemIndex, val) => {
        updateField(`form.elements[${itemIndex}].properties.titleEn`, val);
      };

      const item = { id: 1, index: 0, ...elements[0] };

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

    const question = rendered.container.querySelector("#item0");

    await user.type(question, "!!!");

    expect(question).toHaveValue("question 1!!!");

    await waitFor(async () => {
      const sessionStore = JSON.parse(window.sessionStorage.getItem("form-storage"));
      expect(sessionStore.state.form.elements[0].properties.titleEn).toEqual("question 1!!!");
    });
  });
});
