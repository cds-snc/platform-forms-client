import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { ListBox } from "../ListBox";
import userEvent from "@testing-library/user-event";

describe("ListBox", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render", async () => {
    const mockCallback = jest.fn((e) => e);
    const options = [
      {
        id: "1",
        value: "One",
      },
      {
        id: "2",
        value: "Two",
      },
      {
        id: "3",
        value: "Three",
      },
      {
        id: "4",
        value: "Four",
      },
    ];

    const rendered = render(<ListBox options={options} handleChange={mockCallback} />);
    const listBox = await rendered.findByRole("listbox");
    const optionElements = await rendered.findAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent.trim()).toBe("One");
    expect(optionElements[1].textContent.trim()).toBe("Two");
    expect(optionElements[2].textContent.trim()).toBe("Three");
    expect(optionElements[3].textContent.trim()).toBe("Four");
    expect(optionElements[0]).toHaveAttribute("aria-selected", "true");

    expect(listBox).toHaveAttribute("aria-activedescendant", optionElements[0].id);
    await userEvent.tab();
    fireEvent.keyDown(listBox, { key: "ArrowDown" });

    expect(optionElements[0]).toHaveAttribute("aria-selected", "false");

    expect(listBox).toHaveAttribute("aria-activedescendant", optionElements[1].id);
    expect(optionElements[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(listBox, { key: "ArrowDown" });
    expect(optionElements[2]).toHaveAttribute("aria-selected", "true");
    expect(listBox).toHaveAttribute("aria-activedescendant", optionElements[2].id);
  });
});
