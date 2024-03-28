import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Tag } from "../Tags";
import userEvent from "@testing-library/user-event";

describe("Tag", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle callback", async () => {
    const mockCallback = jest.fn((e) => e);
    const rendered = render(<Tag tag={"test@example.com"} onRemove={mockCallback} />);
    expect(rendered.getByText("test@example.com")).toBeInTheDocument();

    const removeButtons = await rendered.findAllByRole("button");

    await userEvent.tab();
    expect(removeButtons[0]).toHaveFocus();
    await userEvent.click(removeButtons[0]);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("test@example.com");
    expect(removeButtons[0]).toHaveAttribute("aria-label", "remove test@example.com");
  });
});
