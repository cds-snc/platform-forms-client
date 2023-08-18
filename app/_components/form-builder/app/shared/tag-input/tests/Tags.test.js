import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Tags } from "../Tags";
import userEvent from "@testing-library/user-event";

describe("Tags", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle callback", async () => {
    const mockCallback = jest.fn((e) => e);
    const tags = ["one", "two", "three", "four"];

    const rendered = render(<Tags tags={tags} onRemove={mockCallback} />);
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
