import React from "react";
import { cleanup, render } from "@testing-library/react";
import { AddElementButton } from "../AddElementButton";

describe("Add element button", () => {
  afterEach(() => {
    cleanup();
  });

  beforeAll(() => {
    HTMLDialogElement.prototype.show = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  it("renders add element button and handles click", async () => {
    const mockCallback = jest.fn((e) => e);
    const rendered = render(<AddElementButton position={100} handleAdd={mockCallback} />);
    const button = rendered.getByTestId("add-element");
    expect(button).toHaveTextContent("addElement");
  });
});
