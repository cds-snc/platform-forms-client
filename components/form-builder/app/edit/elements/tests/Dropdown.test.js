import React from "react";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropDown } from "../DropDown";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { EmailIcon, CalendarIcon, NumericFieldIcon } from "@formbuilder/icons";

describe("DropDown", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders dropdown and select item when clicked", async () => {
    const user = userEvent.setup();

    const options = [
      { id: "email", value: "email", icon: <EmailIcon />, className: "" },
      { id: "date", value: "date", icon: <CalendarIcon />, className: "" },
      { id: "number", value: "numeric", icon: <NumericFieldIcon />, className: "" },
    ];

    const mockCallback = jest.fn((e) => e);

    const rendered = render(
      <Providers form={store.form}>
        <DropDown items={options} selectedItem={options[1]} onChange={mockCallback} />
      </Providers>
    );

    const button = rendered.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");

    const selectedItemDefault = rendered.getByTestId("element-select-active");
    expect(selectedItemDefault).toHaveTextContent("date");

    await user.click(button);

    const numeric = rendered.getByRole("option", { name: "numeric" });
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(numeric);

    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.results[0].value.selectedItem).toBe(options[2]);
  });
});
