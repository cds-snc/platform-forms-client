import React from "react";
import { cleanup, render } from "@testing-library/react";
import { ElementDescription } from "../ElementDescription";
import userEvent from "@testing-library/user-event";

describe("Element description", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders element description", async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn((e) => e);
    const rendered = render(<ElementDescription id={"richText"} handleAdd={mockCallback} />);
    const content = rendered.getByTestId("element-description-content");
    expect(content).toHaveTextContent("richText.title");
    expect(content).toHaveTextContent("richText.description");
    const button = rendered.getByTestId("element-description-add-element");
    expect(button).toHaveTextContent("addElementDialog.addButton");
    await user.click(button);
    expect(mockCallback.mock.calls.length).toBe(1);
  });
});
