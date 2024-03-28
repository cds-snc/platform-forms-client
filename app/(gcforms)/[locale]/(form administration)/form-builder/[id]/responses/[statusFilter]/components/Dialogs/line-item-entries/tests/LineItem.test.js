import React from "react";
import { render, cleanup } from "@testing-library/react";
import { LineItem } from "../LineItem";
import userEvent from "@testing-library/user-event";

// Note: this is currently mostly a copy+paste from ../tag-input/tests/Tag.test.js. This test
// will probably diverge more and more over time, especially as behavior changes. But noted for
// reference.

describe("LineItem", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle callback", async () => {
    const mockCallback = jest.fn((e) => e);
    const rendered = render(<LineItem value={"31-12-XCRV"} onRemove={mockCallback} />);
    expect(rendered.getByText("31-12-XCRV")).toBeInTheDocument();

    const removeButtons = await rendered.findAllByRole("button");

    await userEvent.tab();
    expect(removeButtons[0]).toHaveFocus();
    await userEvent.click(removeButtons[0]);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("31-12-XCRV");
    expect(removeButtons[0]).toHaveAttribute("aria-label", "lineItemEntries.remove 31-12-XCRV");
  });
});
