import React from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { ElementDialog } from "../ElementDialog";
import userEvent from "@testing-library/user-event";

describe("Element dialog", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.show = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders element dialog", async () => {
    const user = userEvent.setup();
    const mockAddCallback = jest.fn((e) => e);
    const mockCloseCallback = jest.fn((e) => e);
    const rendered = render(
      <ElementDialog handleClose={mockCloseCallback} handleAddType={mockAddCallback} />
    );
    const listBox = rendered.getByTestId("listbox");
    const button = rendered.getByTestId("element-description-add-element");

    expect(button).toHaveTextContent("addElement");

    await user.click(button);
    expect(mockAddCallback.mock.calls.length).toBe(1);
    expect(mockAddCallback.mock.calls[0][0]).toBe("richText");

    await userEvent.tab();
    fireEvent.keyDown(listBox, { key: "ArrowDown" });
    fireEvent.keyDown(listBox, { key: "ArrowDown" });
    await user.click(button);
    expect(mockAddCallback.mock.calls.length).toBe(2);
    expect(mockAddCallback.mock.calls[1][0]).toBe("textArea");
  });
});
