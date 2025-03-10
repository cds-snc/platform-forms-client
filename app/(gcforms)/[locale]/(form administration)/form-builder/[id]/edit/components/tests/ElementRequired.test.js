/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
import { ElementRequired } from "../ElementRequired";

describe("ElementRequired", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render required checkbox", async () => {
    const user = userEvent.setup();

    const item = { id: 1, index: 0, ...store.elements[0] };
    const rendered = render(
      <Providers form={store}>
        <ElementRequired item={item} onRequiredChange={jest.fn} />
      </Providers>
    );

    const checkbox = rendered.getByRole("checkbox");

    expect(checkbox).toHaveAttribute("id", "required-1-id");

    await user.click(checkbox);
  });
});
