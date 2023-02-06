import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { ElementDropDown } from "../ElementDropDown";

describe("ElementDropDown", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render", async () => {
    const promise = Promise.resolve();

    const item = {
      id: "email",
      value: "email",
      icon: <div>icon</div>,
    };
    const rendered = render(
      <Providers form={store.form}>
        <ElementDropDown item={item} />
      </Providers>
    );

    const button = rendered.getByTestId("element-dropdown-select");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(rendered.container.querySelector(".header-button")).toBeInTheDocument();

    await act(async () => {
      await promise;
    });
  });
});
