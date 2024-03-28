import React from "react";
import { render, cleanup } from "@testing-library/react";
import { LineItems } from "../LineItems";
import userEvent from "@testing-library/user-event";

// Note: this is currently mostly a copy+paste from ../tag-input/tests/Taga.test.js. This test
// will probably diverge more and more over time, especially as behavior changes. But noted for
// reference.

describe("LineItems", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle callback", async () => {
    const mockCallback = jest.fn((e) => e);
    const values = ["one", "two", "three", "four"];

    const rendered = render(<LineItems values={values} onRemove={mockCallback} />);
    expect(rendered.getByText("one")).toBeInTheDocument();
    expect(rendered.getByText("two")).toBeInTheDocument();
    expect(rendered.getByText("three")).toBeInTheDocument();
    expect(rendered.getByText("four")).toBeInTheDocument();

    const removeButtons = await rendered.findAllByRole("button");

    await userEvent.tab();
    expect(removeButtons[0]).toHaveFocus();
    await userEvent.click(removeButtons[0]);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("one");
  });
});
