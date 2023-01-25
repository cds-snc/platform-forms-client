import React from "react";
import { cleanup, render } from "@testing-library/react";
import { AddElementButton } from "../AddElementButton";
import userEvent from "@testing-library/user-event";

describe("Add element button", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders add element button and handles click", async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn((e) => e);
    const rendered = render(<AddElementButton position={100} handleAdd={mockCallback} />);
    const button = rendered.getByTestId("add-element");
    expect(button).toHaveTextContent("addElement");
    await user.click(button);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe(100);
  });
});
