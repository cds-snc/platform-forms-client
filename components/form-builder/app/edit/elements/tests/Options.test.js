import React from "react";
import { cleanup } from "@testing-library/react";
import { Options } from "../Options";
import userEvent from "@testing-library/user-event";
import { withProviders, defaultStore as store } from "@formbuilder/test-utils";

describe("Options", () => {
  afterEach(cleanup);
  it("renders with props and test content", async () => {
    const user = userEvent.setup();

    const item = { id: 1, index: 0, ...store.form.elements[0] };

    const rendered = await withProviders(store, <Options item={item} />);

    const button = rendered.container.querySelector("#add-option-0");
    expect(button).toHaveTextContent("addOption");

    await user.click(button);

    const option1 = rendered.getByPlaceholderText("option 1");
    expect(option1).toHaveAttribute("id", "option--0--1");
    expect(option1).toHaveAttribute("value", "q1 choice 1");

    const option2 = rendered.getByPlaceholderText("option 2");
    expect(option2).toHaveAttribute("id", "option--0--2");
    expect(option2).toHaveAttribute("value", "q1 choice 2");

    expect(rendered.container.querySelectorAll("input")).toHaveLength(3);

    const remove1 = rendered.container.querySelector("#remove--0--1");
    await user.click(remove1);
    expect(rendered.container.querySelectorAll("input")).toHaveLength(2);
  });
});
