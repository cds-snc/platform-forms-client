import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { ElementRequired } from "../ElementRequired";

describe("ElementRequired", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render required checkbox", async () => {
    const promise = Promise.resolve();
    const user = userEvent.setup();

    const item = { id: 1, index: 0, ...store.form.elements[0] };
    const mockedCallback = jest.fn();
    const rendered = render(
      <Providers form={store.form}>
        <ElementRequired item={item} updateField={mockedCallback} />
      </Providers>
    );

    const checkbox = rendered.getByRole("checkbox");

    expect(checkbox).toHaveAttribute("id", "required-0-id");

    await user.click(checkbox);

    expect(mockedCallback).toHaveBeenCalledTimes(1);

    await act(async () => {
      await promise;
    });
  });
});
