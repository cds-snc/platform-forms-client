import React from "react";
import { cleanup, render, act, waitFor } from "@testing-library/react";
import { Question } from "../question/Question";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import userEvent from "@testing-library/user-event";

describe("Question", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with descripton", async () => {
    const promise = Promise.resolve();

    const item = { id: 1, index: 0, ...store.form.elements[0] };

    const rendered = render(
      <Providers form={store.form}>
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
      <Providers form={store.form}>
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
    const mockCallback = jest.fn((e) => e);
    const user = userEvent.setup();

    const item = {
      id: 1,
      index: 0,
      type: "date",
      properties: {
        titleEn: "date input",
        titleFr: "",
        choices: [],
        validation: { required: false },
        descriptionEn: "",
        descriptionFr: "",
      },
    };

    const rendered = render(
      <Providers form={store.form}>
        <Question item={item} onQuestionChange={mockCallback} />
      </Providers>
    );

    const question = rendered.container.querySelector("#item0");
    await user.type(question, "!!!");

    expect(question).toHaveValue("date input!!!");

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
