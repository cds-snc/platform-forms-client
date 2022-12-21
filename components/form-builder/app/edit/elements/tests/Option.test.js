import React from "react";
import { cleanup, render, act } from "@testing-library/react";
import { Option } from "../Option";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";

describe("Option", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with props and test content", async () => {
    const promise = Promise.resolve();

    const rendered = render(
      <Providers form={store.form}>
        <Option parentIndex={0} index={0} initialValue="my test option" />
      </Providers>
    );

    const option = rendered.container.querySelector("#option--0--1");

    expect(option).toHaveAttribute("placeholder", "option 1");
    expect(option).toHaveValue("my test option");

    const button = rendered.getAllByRole("button")[0];
    expect(button).toHaveAttribute("aria-label", "removeOption my test option");

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });
});
