import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ListBox } from "../ListBox";

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
    const optionElements = await rendered.findAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("One");
    expect(optionElements[1].textContent).toBe("Two");
    expect(optionElements[2].textContent).toBe("Three");
    expect(optionElements[3].textContent).toBe("Four");
    expect(optionElements[0]).toHaveAttribute("aria-selected", "true");
  });
});
